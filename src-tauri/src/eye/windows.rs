//! Windows UI Automation backend.
//!
//! Pragmatic MVP:
//!
//! 1. Poll the foreground window + focused element at 4 Hz. Polling
//!    is cheap (a few COM calls per tick) and robust to Electron apps
//!    where UIA focus events are unreliable.
//! 2. When focus lands on an edit/document control inside a whitelisted
//!    process, read the value via `ValuePattern` and emit `TextChanged`.
//! 3. Use the element's `CurrentBoundingRectangle` as the anchor rect.
//!    Precise per-phrase rects via `TextPattern.GetBoundingRectangles`
//!    are a Phase 12 upgrade (SAFEARRAY plumbing) and landed on the
//!    backlog.

use std::thread::sleep;
use std::time::Duration;

use anyhow::{Context, Result};
use windows::core::Interface;
use windows::Win32::Foundation::{HWND, RECT};
use windows::Win32::System::Com::{
    CoCreateInstance, CoInitializeEx, CoUninitialize, CLSCTX_INPROC_SERVER,
    COINIT_APARTMENTTHREADED,
};
use windows::Win32::UI::Accessibility::{
    CUIAutomation, IUIAutomation, IUIAutomationElement, IUIAutomationTextPattern,
    IUIAutomationValuePattern, UIA_DocumentControlTypeId, UIA_EditControlTypeId,
    UIA_TextPatternId, UIA_ValuePatternId,
};
use windows::Win32::UI::WindowsAndMessaging::{
    GetForegroundWindow, GetWindowTextW, GetWindowThreadProcessId,
};

use super::{EyeEvent, EyeSession, TextSnapshot};
use crate::model::{FocusContext, Rect};

pub fn start_session() -> Result<Box<dyn EyeSession>> {
    Ok(Box::new(WinEye))
}

pub struct WinEye;

impl EyeSession for WinEye {
    fn run(self: Box<Self>, mut emit: Box<dyn FnMut(EyeEvent) + Send>) {
        unsafe {
            // Ignore SUCCESS/S_FALSE from CoInitializeEx; only hard errors matter.
            let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
        }

        let automation: IUIAutomation = match unsafe {
            CoCreateInstance::<_, IUIAutomation>(&CUIAutomation, None, CLSCTX_INPROC_SERVER)
        } {
            Ok(a) => a,
            Err(e) => {
                tracing::error!("CoCreateInstance(CUIAutomation) failed: {e:?}");
                return;
            }
        };

        let mut last_focus_key = String::new();
        let mut last_text = String::new();

        loop {
            sleep(Duration::from_millis(250));

            let (process_name, window_title, hwnd) = match foreground_info() {
                Ok(v) => v,
                Err(_) => continue,
            };

            let element = match unsafe { automation.GetFocusedElement() } {
                Ok(e) => e,
                Err(_) => continue,
            };

            let is_text = is_text_input(&element).unwrap_or(false);
            let focus_key = format!("{process_name}|{window_title}|{}", hwnd.0 as usize);

            if focus_key != last_focus_key {
                let ctx = FocusContext {
                    process_name: process_name.clone(),
                    window_title: window_title.clone(),
                    app_bundle: String::new(),
                    url: None,
                    is_prompt_field: is_text,
                    caret_rect: element_rect(&element).ok(),
                };
                emit(EyeEvent::FocusChanged(ctx));
                last_focus_key = focus_key;
                last_text.clear();
            }

            if !is_text {
                continue;
            }

            if let Ok(text) = read_text(&element) {
                if text != last_text {
                    last_text = text.clone();
                    let caret_rect = element_rect(&element).ok();
                    emit(EyeEvent::TextChanged(TextSnapshot {
                        text,
                        caret_char_offset: None,
                        caret_rect,
                        element_bounds: element_rect(&element).ok(),
                    }));
                }
            }
        }

        // Unreachable — polling loop only exits on process shutdown.
        #[allow(unreachable_code)]
        unsafe {
            CoUninitialize();
        }
    }
}

fn is_text_input(el: &IUIAutomationElement) -> Result<bool> {
    let ct = unsafe { el.CurrentControlType() }?;
    Ok(ct == UIA_EditControlTypeId || ct == UIA_DocumentControlTypeId)
}

fn read_text(el: &IUIAutomationElement) -> Result<String> {
    // Prefer ValuePattern for plain edit controls.
    if let Ok(raw) = unsafe { el.GetCurrentPattern(UIA_ValuePatternId) } {
        if let Ok(pat) = raw.cast::<IUIAutomationValuePattern>() {
            if let Ok(v) = unsafe { pat.CurrentValue() } {
                return Ok(v.to_string());
            }
        }
    }
    // Fall back to TextPattern (rich editors, Electron).
    if let Ok(raw) = unsafe { el.GetCurrentPattern(UIA_TextPatternId) } {
        if let Ok(pat) = raw.cast::<IUIAutomationTextPattern>() {
            if let Ok(range) = unsafe { pat.DocumentRange() } {
                if let Ok(text) = unsafe { range.GetText(-1) } {
                    return Ok(text.to_string());
                }
            }
        }
    }
    anyhow::bail!("no readable text pattern")
}

fn element_rect(el: &IUIAutomationElement) -> Result<Rect> {
    let r: RECT = unsafe { el.CurrentBoundingRectangle() }?;
    Ok(Rect {
        x: r.left as f64,
        y: r.top as f64,
        width: (r.right - r.left) as f64,
        height: (r.bottom - r.top) as f64,
    })
}

fn foreground_info() -> Result<(String, String, HWND)> {
    let hwnd = unsafe { GetForegroundWindow() };
    if hwnd.0.is_null() {
        anyhow::bail!("no foreground");
    }
    let title = window_title(hwnd);
    let pid = unsafe {
        let mut pid = 0u32;
        GetWindowThreadProcessId(hwnd, Some(&mut pid as *mut u32));
        pid
    };
    let process = process_name_for_pid(pid).unwrap_or_default();
    Ok((process, title, hwnd))
}

fn window_title(hwnd: HWND) -> String {
    let mut buf = [0u16; 512];
    let len = unsafe { GetWindowTextW(hwnd, &mut buf) };
    if len <= 0 {
        return String::new();
    }
    String::from_utf16_lossy(&buf[..len as usize])
}

fn process_name_for_pid(pid: u32) -> Option<String> {
    use windows::Win32::Foundation::CloseHandle;
    use windows::Win32::System::ProcessStatus::GetModuleBaseNameW;
    use windows::Win32::System::Threading::{
        OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION, PROCESS_VM_READ,
    };

    unsafe {
        let handle = OpenProcess(
            PROCESS_QUERY_LIMITED_INFORMATION | PROCESS_VM_READ,
            false,
            pid,
        )
        .ok()?;
        let mut buf = [0u16; 260];
        let len = GetModuleBaseNameW(handle, None, &mut buf);
        let _ = CloseHandle(handle);
        if len == 0 {
            None
        } else {
            Some(String::from_utf16_lossy(&buf[..len as usize]))
        }
    }
}
