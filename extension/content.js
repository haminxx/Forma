'use strict';

if (window.__formaLoaded) {
  console.log('[Forma] Already loaded.');
} else {
  window.__formaLoaded = true;
  initForma();
}

function initForma() {

  // ============================================================
  // FORMA CONFIG — Feature Flag
  // ============================================================
  // Switch between detection modes:
  //   "keyword" = fast keyword matching (current, proven)
  //   "ai"      = AMD-powered sentence analysis (Day 4+)
  // ============================================================
  const DETECTION_MODE = "keyword";  // "keyword" or "ai"
  
  const RAILWAY_URL = 'https://forma-production-c800.up.railway.app/translate';
  const ANALYZE_URL = 'https://forma-production-c800.up.railway.app/analyze';
  
  console.log('[Forma Extension] Initializing on:', window.location.hostname);
  console.log('[Forma] Detection mode:', DETECTION_MODE.toUpperCase());

  const VAGUE_PATTERNS = [
    "menu that slides out from the right", "menu that slides in from the side",
    "slides out from the right", "slides in from", "floating blurry",
    "frosted glass", "blurry popup", "frosted popup", "pinterest style",
    "pinterest grid", "cards in a grid", "masonry", "sticky top bar",
    "sticky header", "fixed header", "fixed top bar", "menu that slides",
    "popup that appears", "modal that appears", "loading placeholder",
    "loading spinner", "spinning loading", "skeleton", "shimmer",
    "tabs that switch", "switchable sections", "expandable sections",
    "accordion", "breadcrumb", "breadcrumbs", "trail of links",
    "three lines you tap", "hamburger", "kebab menu", "page numbers at the bottom",
    "pagination", "sidebar with sections", "left sidebar", "side menu",
    "bottom tab bar", "menu that drops down", "dropdown", "dots at the bottom",
    "carousel indicator", "popout menu", "popup menu", "next and previous buttons",
    "wizard navigation", "footer", "sticky sidebar", "icon rail",
    "tabs that scroll sideways", "scrollable tabs", "mega menu", "edge drawer",
    "modal dialog", "modal backdrop", "scrim", "tooltip", "bottom sheet",
    "confirmation dialog", "popover", "full screen modal", "glassmorphic",
    "image lightbox", "toast notification", "right drawer", "input dialog",
    "contextual popover", "alert dialog", "cookie consent", "consent banner",
    "loading overlay", "settings panel", "link preview", "video modal",
    "blocking overlay", "context menu", "date picker", "search suggestions",
    "autocomplete", "help tooltip", "hero section", "card grid", "split content",
    "feature grid", "full width banner", "logo strip", "full bleed",
    "pricing table", "footer section", "three column layout", "content container",
    "dark section", "call to action", "blog card", "media object", "stats bar",
    "video background", "alternating feature", "icon card", "full viewport",
    "testimonial grid", "split form", "animated stats", "team grid",
    "text input", "textarea", "select dropdown", "checkbox group",
    "toggle switch", "range slider", "star rating", "file upload",
    "search box", "search bar", "submit button", "color picker", "tag input",
    "chip input", "number stepper", "phone number input", "credit card input",
    "consent checkbox", "filtered search", "segmented control", "inline form",
    "wysiwyg", "wizard form",
    "floating action button", "fab", "action button at the corner",
    "image carousel sliding", "image slider", "photo carousel",
    "carousel sliding", "carousel slideshow", "rotating images",
    "data table with rows", "data table", "table with rows",
    "table of data", "spreadsheet view", "rows and columns",
    "banner notification", "banner notification at top", "top banner",
    "notification banner", "alert banner at top", "promo banner",
    "sidebar navigation", "sidebar navigation panel", "side navigation",
    "left sidebar nav", "navigation sidebar", "side nav panel",
    "step by step progress", "step progress", "progress steps",
    "stepper progress", "wizard progress", "step indicator",
    "notification bell badge", "notification bell", "bell badge",
    "bell with badge", "alert badge", "notification dot",
    "top bar", "navigation bar", "nav bar", "top header",
    "header bar", "page header"
  ];
  VAGUE_PATTERNS.sort((a, b) => b.length - a.length);

  // ============================================================
  // ANIMATION LIBRARY (30 animations)
  // ============================================================
  const ANIMATION_LIBRARY = {
    "off-canvas drawer": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;inset:0;background:#1a1917;"></div><div style="position:absolute;top:8px;left:8px;right:8px;height:6px;background:#2a2825;border-radius:2px;"></div><div style="position:absolute;top:22px;left:8px;right:8px;height:4px;background:#2a2825;border-radius:2px;"></div><div style="position:absolute;top:34px;left:8px;right:80px;height:4px;background:#2a2825;border-radius:2px;"></div><div style="position:absolute;top:0;right:0;width:96px;height:64px;background:#2a2825;border-left:1.5px solid #c8b89a;animation:fa_offcanvas 3s ease-in-out infinite;"><div style="position:absolute;top:10px;left:10px;right:10px;height:4px;background:#c8b89a;border-radius:2px;opacity:0.7;"></div><div style="position:absolute;top:22px;left:10px;right:18px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.4;"></div><div style="position:absolute;top:32px;left:10px;right:24px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.4;"></div><div style="position:absolute;top:42px;left:10px;right:14px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.4;"></div></div></div><style>@keyframes fa_offcanvas{0%{transform:translateX(100%)}15%{transform:translateX(0%)}50%{transform:translateX(0%)}65%{transform:translateX(100%)}100%{transform:translateX(100%)}}</style>`,
    "glassmorphic popover": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;top:50%;left:50%;width:140px;height:36px;background:rgba(200,184,154,0.12);border:1px solid rgba(200,184,154,0.3);border-radius:8px;animation:fa_glass 2.5s ease-in-out infinite;"><div style="position:absolute;top:8px;left:12px;right:12px;height:3px;background:rgba(200,184,154,0.6);border-radius:2px;"></div><div style="position:absolute;top:18px;left:12px;right:28px;height:2px;background:rgba(200,184,154,0.3);border-radius:2px;"></div><div style="position:absolute;top:26px;left:12px;right:20px;height:2px;background:rgba(200,184,154,0.3);border-radius:2px;"></div></div></div><style>@keyframes fa_glass{0%{opacity:0;transform:translate(-50%,-46%)}20%{opacity:1;transform:translate(-50%,-50%)}70%{opacity:1;transform:translate(-50%,-50%)}90%{opacity:0;transform:translate(-50%,-54%)}100%{opacity:0;transform:translate(-50%,-46%)}}</style>`,
    "masonry grid": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;top:0;left:8px;width:62px;animation:fa_mas1 3s ease-in-out infinite;"><div style="height:28px;background:#2a2825;border-radius:2px;margin-bottom:3px;border:0.5px solid #c8b89a;opacity:0.8;"></div><div style="height:18px;background:#2a2825;border-radius:2px;border:0.5px solid #c8b89a;opacity:0.8;"></div></div><div style="position:absolute;top:0;left:81px;width:62px;animation:fa_mas2 3s ease-in-out infinite;"><div style="height:18px;background:#2a2825;border-radius:2px;margin-bottom:3px;border:0.5px solid #c8b89a;opacity:0.8;"></div><div style="height:28px;background:#2a2825;border-radius:2px;border:0.5px solid #c8b89a;opacity:0.8;"></div></div><div style="position:absolute;top:0;left:154px;width:62px;animation:fa_mas3 3s ease-in-out infinite;"><div style="height:22px;background:#2a2825;border-radius:2px;margin-bottom:3px;border:0.5px solid #c8b89a;opacity:0.8;"></div><div style="height:24px;background:#2a2825;border-radius:2px;border:0.5px solid #c8b89a;opacity:0.8;"></div></div></div><style>@keyframes fa_mas1{0%,10%{opacity:0;transform:translateY(-8px)}25%,75%{opacity:1;transform:translateY(0)}90%,100%{opacity:0;transform:translateY(-8px)}}@keyframes fa_mas2{0%,20%{opacity:0;transform:translateY(-8px)}35%,75%{opacity:1;transform:translateY(0)}90%,100%{opacity:0;transform:translateY(-8px)}}@keyframes fa_mas3{0%,30%{opacity:0;transform:translateY(-8px)}45%,75%{opacity:1;transform:translateY(0)}90%,100%{opacity:0;transform:translateY(-8px)}}</style>`,
    "sticky navbar": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;top:0;left:0;right:0;height:14px;background:#2a2825;border-bottom:1.5px solid #c8b89a;z-index:2;display:flex;align-items:center;padding:0 8px;gap:6px;"><div style="width:24px;height:4px;background:#c8b89a;border-radius:2px;opacity:0.9;"></div><div style="width:16px;height:4px;background:#c8b89a;border-radius:2px;opacity:0.5;margin-left:auto;"></div><div style="width:16px;height:4px;background:#c8b89a;border-radius:2px;opacity:0.5;"></div><div style="width:16px;height:4px;background:#c8b89a;border-radius:2px;opacity:0.5;"></div></div><div style="position:absolute;top:14px;left:0;right:0;animation:fa_scroll 2s linear infinite;"><div style="height:14px;margin:4px 8px;background:#2a2825;border-radius:2px;"></div><div style="height:10px;margin:4px 8px;background:#2a2825;border-radius:2px;opacity:0.6;"></div><div style="height:14px;margin:4px 8px;background:#2a2825;border-radius:2px;"></div><div style="height:10px;margin:4px 8px;background:#2a2825;border-radius:2px;opacity:0.6;"></div><div style="height:14px;margin:4px 8px;background:#2a2825;border-radius:2px;"></div></div></div><style>@keyframes fa_scroll{0%{transform:translateY(0)}100%{transform:translateY(-50px)}}</style>`,
    "modal overlay": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);animation:fa_scrim 3s ease-in-out infinite;"></div><div style="position:absolute;top:50%;left:50%;width:140px;height:40px;background:#2a2825;border:1px solid #c8b89a;border-radius:6px;animation:fa_modal 3s ease-in-out infinite;"><div style="position:absolute;top:8px;left:12px;right:12px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.9;"></div><div style="position:absolute;top:18px;left:12px;right:24px;height:2px;background:#c8b89a;border-radius:2px;opacity:0.4;"></div><div style="position:absolute;top:26px;left:12px;right:32px;height:2px;background:#c8b89a;border-radius:2px;opacity:0.4;"></div></div></div><style>@keyframes fa_scrim{0%,10%{opacity:0}25%,75%{opacity:1}90%,100%{opacity:0}}@keyframes fa_modal{0%,10%{opacity:0;transform:translate(-50%,-50%) scale(0.85)}25%,75%{opacity:1;transform:translate(-50%,-50%) scale(1)}90%,100%{opacity:0;transform:translate(-50%,-50%) scale(0.85)}}</style>`,
    "skeleton loader": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;padding:10px 12px;box-sizing:border-box;"><div style="position:relative;height:8px;background:#2a2825;border-radius:2px;margin-bottom:7px;overflow:hidden;"><div style="position:absolute;top:0;left:0;height:100%;width:60px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.15),transparent);animation:fa_shimmer 1.5s ease-in-out infinite;"></div></div><div style="position:relative;height:8px;background:#2a2825;border-radius:2px;margin-bottom:7px;width:80%;overflow:hidden;"><div style="position:absolute;top:0;left:0;height:100%;width:60px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.15),transparent);animation:fa_shimmer 1.5s ease-in-out infinite 0.2s;"></div></div><div style="position:relative;height:8px;background:#2a2825;border-radius:2px;width:55%;overflow:hidden;"><div style="position:absolute;top:0;left:0;height:100%;width:60px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.15),transparent);animation:fa_shimmer 1.5s ease-in-out infinite 0.4s;"></div></div></div><style>@keyframes fa_shimmer{0%{transform:translateX(-60px)}100%{transform:translateX(240px)}}</style>`,
    "tab panel": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;top:0;left:0;right:0;height:20px;border-bottom:1px solid #2a2825;display:flex;align-items:flex-end;"><div style="flex:1;text-align:center;font-size:9px;font-family:sans-serif;color:#c8b89a;opacity:0.5;padding-bottom:4px;letter-spacing:0.05em;">Home</div><div style="flex:1;text-align:center;font-size:9px;font-family:sans-serif;color:#c8b89a;opacity:0.5;padding-bottom:4px;letter-spacing:0.05em;">About</div><div style="flex:1;text-align:center;font-size:9px;font-family:sans-serif;color:#c8b89a;opacity:0.5;padding-bottom:4px;letter-spacing:0.05em;">Work</div></div><div style="position:absolute;top:16px;height:2px;width:80px;background:#c8b89a;border-radius:1px;animation:fa_indicator 3s ease-in-out infinite;"></div><div style="position:absolute;top:28px;left:12px;right:12px;height:4px;background:#2a2825;border-radius:2px;animation:fa_tabcontent 3s ease-in-out infinite;"></div><div style="position:absolute;top:38px;left:12px;right:40px;height:4px;background:#2a2825;border-radius:2px;opacity:0.6;animation:fa_tabcontent 3s ease-in-out infinite;"></div><div style="position:absolute;top:48px;left:12px;right:24px;height:4px;background:#2a2825;border-radius:2px;opacity:0.4;animation:fa_tabcontent 3s ease-in-out infinite;"></div></div><style>@keyframes fa_indicator{0%,25%{transform:translateX(0px)}40%,58%{transform:translateX(80px)}73%,91%{transform:translateX(160px)}100%{transform:translateX(0px)}}@keyframes fa_tabcontent{0%,30%{opacity:1}35%,60%{opacity:0.3}65%,90%{opacity:0.6}95%,100%{opacity:1}}</style>`,
    "accordion": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;padding:4px 8px;box-sizing:border-box;"><div style="height:14px;background:#2a2825;border-radius:2px;margin-bottom:2px;display:flex;align-items:center;padding:0 8px;border:0.5px solid #c8b89a;opacity:0.5;"><div style="width:60px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.6;"></div></div><div style="background:#2a2825;border-radius:2px;margin-bottom:2px;border:0.5px solid #c8b89a;overflow:hidden;animation:fa_expand 3s ease-in-out infinite;"><div style="height:14px;display:flex;align-items:center;padding:0 8px;"><div style="width:50px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.9;"></div></div><div style="animation:fa_reveal 3s ease-in-out infinite;overflow:hidden;"><div style="height:3px;background:#c8b89a;border-radius:2px;margin:3px 8px;opacity:0.3;"></div><div style="height:3px;background:#c8b89a;border-radius:2px;margin:3px 8px 4px;opacity:0.3;width:70%;"></div></div></div><div style="height:14px;background:#2a2825;border-radius:2px;display:flex;align-items:center;padding:0 8px;border:0.5px solid #c8b89a;opacity:0.5;"><div style="width:55px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.6;"></div></div></div><style>@keyframes fa_expand{0%,10%{max-height:14px}25%,70%{max-height:40px}85%,100%{max-height:14px}}@keyframes fa_reveal{0%,10%{opacity:0;max-height:0}25%,70%{opacity:1;max-height:20px}85%,100%{opacity:0;max-height:0}}</style>`,
    "toast notification": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;top:8px;left:8px;right:8px;height:4px;background:#2a2825;border-radius:2px;opacity:0.4;"></div><div style="position:absolute;top:18px;left:8px;right:40px;height:4px;background:#2a2825;border-radius:2px;opacity:0.4;"></div><div style="position:absolute;top:28px;left:8px;right:60px;height:4px;background:#2a2825;border-radius:2px;opacity:0.4;"></div><div style="position:absolute;bottom:8px;right:8px;height:18px;width:110px;background:#2a2825;border:1px solid #c8b89a;border-radius:10px;display:flex;align-items:center;padding:0 8px;gap:5px;animation:fa_toast 3s ease-in-out infinite;"><div style="width:6px;height:6px;border-radius:50%;background:#c8b89a;flex-shrink:0;"></div><div style="flex:1;height:3px;background:#c8b89a;border-radius:2px;opacity:0.7;"></div></div></div><style>@keyframes fa_toast{0%,10%{transform:translateX(130px);opacity:0}25%,70%{transform:translateX(0px);opacity:1}85%,100%{transform:translateX(130px);opacity:0}}</style>`,
    "breadcrumb navigation": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="display:flex;align-items:center;gap:4px;"><div style="font-size:9px;font-family:sans-serif;color:#c8b89a;letter-spacing:0.05em;animation:fa_bc1 3s ease-in-out infinite;opacity:0;">Home</div><div style="font-size:9px;font-family:sans-serif;color:#6b6560;animation:fa_bca1 3s ease-in-out infinite;opacity:0;">›</div><div style="font-size:9px;font-family:sans-serif;color:#c8b89a;letter-spacing:0.05em;animation:fa_bc2 3s ease-in-out infinite;opacity:0;">Products</div><div style="font-size:9px;font-family:sans-serif;color:#6b6560;animation:fa_bca2 3s ease-in-out infinite;opacity:0;">›</div><div style="font-size:9px;font-family:sans-serif;color:#c8b89a;letter-spacing:0.05em;font-weight:600;animation:fa_bc3 3s ease-in-out infinite;opacity:0;">Detail</div></div></div><style>@keyframes fa_bc1{0%,5%{opacity:0;transform:translateX(-6px)}20%,75%{opacity:1;transform:translateX(0)}90%,100%{opacity:0;transform:translateX(-6px)}}@keyframes fa_bca1{0%,15%{opacity:0}28%,75%{opacity:1}90%,100%{opacity:0}}@keyframes fa_bc2{0%,20%{opacity:0;transform:translateX(-6px)}35%,75%{opacity:1;transform:translateX(0)}90%,100%{opacity:0;transform:translateX(-6px)}}@keyframes fa_bca2{0%,30%{opacity:0}43%,75%{opacity:1}90%,100%{opacity:0}}@keyframes fa_bc3{0%,35%{opacity:0;transform:translateX(-6px)}50%,75%{opacity:1;transform:translateX(0)}90%,100%{opacity:0;transform:translateX(-6px)}}</style>`,
    "tooltip": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="position:relative;display:inline-block;text-align:center;"><div style="position:absolute;bottom:calc(100% + 6px);left:50%;background:#2a2825;border:1px solid #c8b89a;border-radius:6px;padding:3px 10px;white-space:nowrap;font-family:sans-serif;font-size:10px;color:#c8b89a;letter-spacing:0.05em;animation:fa_tip 2.5s ease-in-out infinite;">Component</div><span style="font-family:sans-serif;font-size:12px;color:#c8b89a;border-bottom:1.5px dotted #c8b89a;padding-bottom:1px;letter-spacing:0.03em;">hover me</span></div></div><style>@keyframes fa_tip{0%,10%{opacity:0;transform:translateX(-50%) translateY(4px)}25%,70%{opacity:1;transform:translateX(-50%) translateY(0)}85%,100%{opacity:0;transform:translateX(-50%) translateY(4px)}}</style>`,
    "dropdown menu": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;align-items:center;padding-top:6px;"><div style="width:100px;height:16px;background:#2a2825;border:1px solid #c8b89a;border-radius:4px;display:flex;align-items:center;justify-content:center;gap:6px;z-index:2;"><div style="width:40px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.8;"></div><div style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:4px solid #c8b89a;opacity:0.8;"></div></div><div style="width:100px;background:#2a2825;border:1px solid #c8b89a;border-top:none;border-radius:0 0 4px 4px;overflow:hidden;animation:fa_drop 3s ease-in-out infinite;"><div style="height:12px;display:flex;align-items:center;padding:0 8px;border-bottom:0.5px solid #3d3a36;"><div style="width:50px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.8;"></div></div><div style="height:12px;display:flex;align-items:center;padding:0 8px;border-bottom:0.5px solid #3d3a36;"><div style="width:40px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.8;"></div></div><div style="height:12px;display:flex;align-items:center;padding:0 8px;"><div style="width:45px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.8;"></div></div></div></div><style>@keyframes fa_drop{0%,10%{max-height:0;opacity:0}30%,70%{max-height:40px;opacity:1}85%,100%{max-height:0;opacity:0}}</style>`,
    "progress bar": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:0 16px;box-sizing:border-box;"><div style="width:100%;display:flex;justify-content:space-between;align-items:center;"><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;letter-spacing:0.05em;opacity:0.7;">Progress</div><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;letter-spacing:0.05em;animation:fa_label 3s ease-in-out infinite;">75%</div></div><div style="width:100%;height:6px;background:#2a2825;border-radius:3px;overflow:hidden;"><div style="height:100%;background:#c8b89a;border-radius:3px;animation:fa_fill 3s ease-in-out infinite;"></div></div></div><style>@keyframes fa_fill{0%,5%{width:0%}60%,75%{width:75%}90%,100%{width:0%}}@keyframes fa_label{0%,5%{opacity:0}60%,75%{opacity:1}90%,100%{opacity:0}}</style>`,
    "bottom sheet": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;top:8px;left:8px;right:8px;height:4px;background:#2a2825;border-radius:2px;opacity:0.4;"></div><div style="position:absolute;top:18px;left:8px;right:40px;height:4px;background:#2a2825;border-radius:2px;opacity:0.4;"></div><div style="position:absolute;bottom:0;left:0;right:0;height:36px;background:#2a2825;border-top:1.5px solid #c8b89a;border-radius:8px 8px 0 0;animation:fa_sheet 3s ease-in-out infinite;display:flex;flex-direction:column;align-items:center;padding-top:6px;gap:5px;"><div style="width:24px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.5;"></div><div style="width:80%;height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;"></div><div style="width:60%;height:2px;background:#c8b89a;border-radius:1px;opacity:0.4;"></div></div></div><style>@keyframes fa_sheet{0%,10%{transform:translateY(100%)}25%,70%{transform:translateY(0%)}85%,100%{transform:translateY(100%)}}</style>`,
    "confirmation dialog": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);animation:fa_cscrim 3s ease-in-out infinite;"></div><div style="position:absolute;top:50%;left:50%;width:160px;background:#2a2825;border:1px solid #c8b89a;border-radius:6px;padding:8px;box-sizing:border-box;animation:fa_card 3s ease-in-out infinite;"><div style="width:80px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.9;margin-bottom:5px;"></div><div style="width:110px;height:2px;background:#c8b89a;border-radius:2px;opacity:0.4;margin-bottom:8px;"></div><div style="display:flex;gap:6px;"><div style="flex:1;height:12px;border:1px solid #c8b89a;border-radius:3px;opacity:0.7;"></div><div style="flex:1;height:12px;background:#c8b89a;border-radius:3px;opacity:0.9;"></div></div></div></div><style>@keyframes fa_cscrim{0%,10%{opacity:0}25%,70%{opacity:1}85%,100%{opacity:0}}@keyframes fa_card{0%,10%{opacity:0;transform:translate(-50%,-50%) scale(0.85)}25%,70%{opacity:1;transform:translate(-50%,-50%) scale(1)}85%,100%{opacity:0;transform:translate(-50%,-50%) scale(0.85)}}</style>`,
    "search bar": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="width:180px;height:24px;background:#2a2825;border:1px solid #c8b89a;border-radius:12px;display:flex;align-items:center;padding:0 10px;gap:6px;box-sizing:border-box;"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="4" cy="4" r="3" stroke="#c8b89a" stroke-width="1.2" opacity="0.8"/><line x1="6.5" y1="6.5" x2="9" y2="9" stroke="#c8b89a" stroke-width="1.2" opacity="0.8"/></svg><div style="display:flex;align-items:center;gap:1px;flex:1;"><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;opacity:0.8;overflow:hidden;white-space:nowrap;animation:fa_typing 3s ease-in-out infinite;">nav bar</div><div style="width:1.5px;height:10px;background:#c8b89a;animation:fa_blink 0.8s step-end infinite;"></div></div></div></div><style>@keyframes fa_typing{0%,5%{width:0;opacity:0.8}50%,70%{width:40px;opacity:0.8}85%,100%{width:0;opacity:0}}@keyframes fa_blink{0%,100%{opacity:1}50%{opacity:0}}</style>`,
    "toggle switch": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;gap:10px;"><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;opacity:0.5;letter-spacing:0.05em;animation:fa_offl 3s ease-in-out infinite;">Off</div><div style="width:40px;height:20px;border-radius:10px;border:1px solid #c8b89a;position:relative;animation:fa_track 3s ease-in-out infinite;box-sizing:border-box;"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#f0ece4;animation:fa_circ 3s ease-in-out infinite;"></div></div><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;opacity:0.5;letter-spacing:0.05em;animation:fa_onl 3s ease-in-out infinite;">On</div></div><style>@keyframes fa_track{0%,15%{background:#2a2825}30%,70%{background:#c8b89a}85%,100%{background:#2a2825}}@keyframes fa_circ{0%,15%{transform:translateX(0px)}30%,70%{transform:translateX(20px)}85%,100%{transform:translateX(0px)}}@keyframes fa_offl{0%,15%{opacity:0.8}30%,70%{opacity:0.3}85%,100%{opacity:0.8}}@keyframes fa_onl{0%,15%{opacity:0.3}30%,70%{opacity:0.9}85%,100%{opacity:0.3}}</style>`,
    "loading spinner": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;"><div style="width:24px;height:24px;border-radius:50%;border:2.5px solid #2a2825;border-top-color:#c8b89a;animation:fa_spin 0.8s linear infinite;"></div><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;letter-spacing:0.1em;animation:fa_spulse 1.5s ease-in-out infinite;">Loading</div></div><style>@keyframes fa_spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes fa_spulse{0%,100%{opacity:0.4}50%{opacity:0.9}}</style>`,
    "floating action button": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(200,184,154,0.3);animation:fa_ring 2.5s ease-out infinite;"></div><div style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(200,184,154,0.15);animation:fa_ring 2.5s ease-out infinite 0.4s;"></div><div style="width:32px;height:32px;border-radius:50%;background:#c8b89a;display:flex;align-items:center;justify-content:center;position:relative;animation:fa_fpulse 2.5s ease-in-out infinite;"><div style="position:absolute;width:12px;height:2px;background:#1a1917;border-radius:1px;"></div><div style="position:absolute;width:2px;height:12px;background:#1a1917;border-radius:1px;"></div></div></div><style>@keyframes fa_ring{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.2);opacity:0}}@keyframes fa_fpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}</style>`,
    "hero section": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;"><div style="width:120px;height:6px;background:#c8b89a;border-radius:2px;animation:fa_h1 3s ease-in-out infinite;"></div><div style="width:80px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.6;animation:fa_h2 3s ease-in-out infinite;"></div><div style="width:50px;height:12px;background:#2a2825;border:1px solid #c8b89a;border-radius:3px;animation:fa_btn 3s ease-in-out infinite;"></div></div><style>@keyframes fa_h1{0%,5%{opacity:0;transform:translateY(6px)}20%,70%{opacity:1;transform:translateY(0)}85%,100%{opacity:0;transform:translateY(6px)}}@keyframes fa_h2{0%,15%{opacity:0;transform:translateY(6px)}30%,70%{opacity:0.6;transform:translateY(0)}85%,100%{opacity:0;transform:translateY(6px)}}@keyframes fa_btn{0%,25%{opacity:0;transform:translateY(6px)}40%,70%{opacity:1;transform:translateY(0)}85%,100%{opacity:0;transform:translateY(6px)}}</style>`,
    "card grid": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;gap:6px;padding:6px;box-sizing:border-box;"><div style="flex:1;height:52px;background:#2a2825;border:0.5px solid #c8b89a;border-radius:4px;display:flex;flex-direction:column;overflow:hidden;animation:fa_cards 3s ease-in-out infinite;"><div style="height:22px;background:#1a1917;border-bottom:0.5px solid #c8b89a;opacity:0.6;"></div><div style="padding:5px;display:flex;flex-direction:column;gap:3px;"><div style="height:3px;background:#c8b89a;border-radius:1px;opacity:0.8;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.4;width:70%;"></div></div></div><div style="flex:1;height:52px;background:#2a2825;border:0.5px solid #c8b89a;border-radius:4px;display:flex;flex-direction:column;overflow:hidden;animation:fa_cards 3s ease-in-out infinite 0.1s;"><div style="height:22px;background:#1a1917;border-bottom:0.5px solid #c8b89a;opacity:0.6;"></div><div style="padding:5px;display:flex;flex-direction:column;gap:3px;"><div style="height:3px;background:#c8b89a;border-radius:1px;opacity:0.8;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.4;width:80%;"></div></div></div><div style="flex:1;height:52px;background:#2a2825;border:0.5px solid #c8b89a;border-radius:4px;display:flex;flex-direction:column;overflow:hidden;animation:fa_cards 3s ease-in-out infinite 0.2s;"><div style="height:22px;background:#1a1917;border-bottom:0.5px solid #c8b89a;opacity:0.6;"></div><div style="padding:5px;display:flex;flex-direction:column;gap:3px;"><div style="height:3px;background:#c8b89a;border-radius:1px;opacity:0.8;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.4;width:60%;"></div></div></div></div><style>@keyframes fa_cards{0%,10%{opacity:0;transform:translateY(8px)}25%,70%{opacity:1;transform:translateY(0)}85%,100%{opacity:0;transform:translateY(8px)}}</style>`,
    "pagination control": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;gap:6px;"><div style="width:14px;height:14px;border-radius:50%;border:1px solid #c8b89a;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:7px;animation:fa_p1 3s ease-in-out infinite;">1</div><div style="width:14px;height:14px;border-radius:50%;border:1px solid #c8b89a;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:7px;animation:fa_p2 3s ease-in-out infinite;">2</div><div style="width:14px;height:14px;border-radius:50%;border:1px solid #c8b89a;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:7px;animation:fa_p3 3s ease-in-out infinite;">3</div><div style="width:14px;height:14px;border-radius:50%;border:1px solid #c8b89a;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:7px;color:#c8b89a;background:#2a2825;">4</div><div style="width:14px;height:14px;border-radius:50%;border:1px solid #c8b89a;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:7px;color:#c8b89a;background:#2a2825;">5</div></div><style>@keyframes fa_p1{0%,5%{background:#c8b89a;color:#1a1917}28%,100%{background:#2a2825;color:#c8b89a}}@keyframes fa_p2{0%,28%{background:#2a2825;color:#c8b89a}33%,60%{background:#c8b89a;color:#1a1917}65%,100%{background:#2a2825;color:#c8b89a}}@keyframes fa_p3{0%,60%{background:#2a2825;color:#c8b89a}65%,90%{background:#c8b89a;color:#1a1917}95%,100%{background:#2a2825;color:#c8b89a}}</style>`,
    "image carousel": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="display:flex;width:720px;height:64px;animation:fa_slide 4s ease-in-out infinite;"><div style="width:240px;height:64px;background:#2a2825;border-right:1px solid #c8b89a;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><div style="width:80px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.7;"></div></div><div style="width:240px;height:64px;background:#3d3a36;border-right:1px solid #c8b89a;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><div style="width:60px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.7;"></div></div><div style="width:240px;height:64px;background:#2a2825;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><div style="width:70px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.7;"></div></div></div><div style="position:absolute;left:6px;top:50%;transform:translateY(-50%);font-size:12px;color:#c8b89a;opacity:0.6;">‹</div><div style="position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:12px;color:#c8b89a;opacity:0.6;">›</div></div><style>@keyframes fa_slide{0%,20%{transform:translateX(0)}35%,50%{transform:translateX(-240px)}65%,80%{transform:translateX(-480px)}90%,100%{transform:translateX(0)}}</style>`,
    "hamburger menu": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="position:relative;width:28px;height:18px;"><div style="position:absolute;top:0;left:0;width:28px;height:2px;background:#c8b89a;border-radius:1px;transform-origin:center;animation:fa_hbtop 3s ease-in-out infinite;"></div><div style="position:absolute;top:8px;left:0;width:28px;height:2px;background:#c8b89a;border-radius:1px;animation:fa_hbmid 3s ease-in-out infinite;"></div><div style="position:absolute;top:16px;left:0;width:28px;height:2px;background:#c8b89a;border-radius:1px;transform-origin:center;animation:fa_hbbot 3s ease-in-out infinite;"></div></div></div><style>@keyframes fa_hbtop{0%,15%{transform:translateY(0) rotate(0deg)}35%,65%{transform:translateY(8px) rotate(45deg)}85%,100%{transform:translateY(0) rotate(0deg)}}@keyframes fa_hbmid{0%,15%{opacity:1;transform:scaleX(1)}30%,70%{opacity:0;transform:scaleX(0)}85%,100%{opacity:1;transform:scaleX(1)}}@keyframes fa_hbbot{0%,15%{transform:translateY(0) rotate(0deg)}35%,65%{transform:translateY(-8px) rotate(-45deg)}85%,100%{transform:translateY(0) rotate(0deg)}}</style>`,
    "data table": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="width:100%;height:16px;background:#2a2825;border-bottom:1px solid #c8b89a;display:flex;align-items:center;padding:0 8px;gap:12px;box-sizing:border-box;animation:fa_dt0 3s ease-in-out infinite;"><div style="width:40px;height:3px;background:#c8b89a;border-radius:1px;opacity:0.9;"></div><div style="width:50px;height:3px;background:#c8b89a;border-radius:1px;opacity:0.9;"></div><div style="width:30px;height:3px;background:#c8b89a;border-radius:1px;opacity:0.9;"></div></div><div style="width:100%;height:16px;background:#1a1917;border-bottom:0.5px solid #2a2825;display:flex;align-items:center;padding:0 8px;gap:12px;box-sizing:border-box;animation:fa_dt1 3s ease-in-out infinite;"><div style="width:36px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;"></div><div style="width:44px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;"></div><div style="width:28px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;"></div></div><div style="width:100%;height:16px;background:#2a2825;border-bottom:0.5px solid #1a1917;display:flex;align-items:center;padding:0 8px;gap:12px;box-sizing:border-box;animation:fa_dt2 3s ease-in-out infinite;"><div style="width:42px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;"></div><div style="width:38px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;"></div><div style="width:32px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;"></div></div></div><style>@keyframes fa_dt0{0%,5%{opacity:0}20%,75%{opacity:1}88%,100%{opacity:0}}@keyframes fa_dt1{0%,15%{opacity:0}28%,75%{opacity:1}88%,100%{opacity:0}}@keyframes fa_dt2{0%,25%{opacity:0}38%,75%{opacity:1}88%,100%{opacity:0}}</style>`,
    "banner": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;top:8px;left:8px;right:40px;height:4px;background:#2a2825;border-radius:2px;opacity:0.3;"></div><div style="position:absolute;top:18px;left:8px;right:60px;height:4px;background:#2a2825;border-radius:2px;opacity:0.3;"></div><div style="position:absolute;top:28px;left:8px;right:48px;height:4px;background:#2a2825;border-radius:2px;opacity:0.3;"></div><div style="position:absolute;top:0;left:0;right:0;height:20px;background:#2a2825;border-bottom:1.5px solid #c8b89a;display:flex;align-items:center;padding:0 10px;gap:8px;box-sizing:border-box;animation:fa_bn 3s ease-in-out infinite;"><div style="width:6px;height:6px;border-radius:50%;background:#c8b89a;flex-shrink:0;"></div><div style="flex:1;height:3px;background:#c8b89a;border-radius:2px;opacity:0.7;"></div><div style="width:12px;height:3px;background:#c8b89a;border-radius:2px;opacity:0.4;"></div></div></div><style>@keyframes fa_bn{0%,10%{transform:translateY(-100%)}25%,70%{transform:translateY(0%)}85%,100%{transform:translateY(-100%)}}</style>`,
    "sidebar navigation": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;"><div style="width:80px;height:64px;background:#2a2825;border-right:0.5px solid #c8b89a;flex-shrink:0;"><div style="height:16px;display:flex;align-items:center;padding:0 8px;border-left:2px solid transparent;animation:fa_sb1 3s ease-in-out infinite;"><div style="width:40px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.5;"></div></div><div style="height:16px;display:flex;align-items:center;padding:0 8px;border-left:2px solid transparent;animation:fa_sb2 3s ease-in-out infinite;"><div style="width:34px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.5;"></div></div><div style="height:16px;display:flex;align-items:center;padding:0 8px;border-left:2px solid transparent;animation:fa_sb3 3s ease-in-out infinite;"><div style="width:38px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.5;"></div></div></div><div style="flex:1;padding:8px 10px;display:flex;flex-direction:column;gap:5px;"><div style="height:4px;background:#2a2825;border-radius:2px;opacity:0.5;"></div><div style="height:4px;background:#2a2825;border-radius:2px;opacity:0.3;width:80%;"></div><div style="height:4px;background:#2a2825;border-radius:2px;opacity:0.4;width:90%;"></div></div></div><style>@keyframes fa_sb1{0%,28%{background:rgba(200,184,154,0.15);border-left-color:#c8b89a}33%,100%{background:transparent;border-left-color:transparent}}@keyframes fa_sb2{0%,28%{background:transparent;border-left-color:transparent}33%,61%{background:rgba(200,184,154,0.15);border-left-color:#c8b89a}66%,100%{background:transparent;border-left-color:transparent}}@keyframes fa_sb3{0%,61%{background:transparent;border-left-color:transparent}66%,94%{background:rgba(200,184,154,0.15);border-left-color:#c8b89a}99%,100%{background:transparent;border-left-color:transparent}}</style>`,
    "footer section": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;bottom:0;left:0;right:0;background:#2a2825;animation:fa_footer 3s ease-in-out infinite;"><div style="display:flex;padding:6px 8px 4px;gap:6px;"><div style="flex:1;display:flex;flex-direction:column;gap:3px;"><div style="height:3px;background:#c8b89a;border-radius:1px;opacity:0.9;width:70%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.4;width:55%;"></div></div><div style="flex:1;display:flex;flex-direction:column;gap:3px;"><div style="height:3px;background:#c8b89a;border-radius:1px;opacity:0.9;width:65%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.4;width:50%;"></div></div><div style="flex:1;display:flex;flex-direction:column;gap:3px;"><div style="height:3px;background:#c8b89a;border-radius:1px;opacity:0.9;width:75%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.4;width:60%;"></div></div></div><div style="height:10px;border-top:0.5px solid #c8b89a;display:flex;align-items:center;padding:0 8px;"><div style="height:2px;width:60px;background:#c8b89a;border-radius:1px;opacity:0.3;"></div></div></div></div><style>@keyframes fa_footer{0%,10%{opacity:0;transform:translateY(20px)}25%,70%{opacity:1;transform:translateY(0)}85%,100%{opacity:0;transform:translateY(20px)}}</style>`,
    "step progress indicator": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="display:flex;align-items:center;gap:0;"><div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="width:14px;height:14px;border-radius:50%;border:1.5px solid #c8b89a;animation:fa_stc1 3s ease-in-out infinite;"></div><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;opacity:0.6;letter-spacing:0.03em;">Step 1</div></div><div style="width:50px;height:2px;background:#2a2825;position:relative;margin-bottom:11px;overflow:hidden;"><div style="position:absolute;top:0;left:0;height:100%;background:#c8b89a;animation:fa_stl1 3s ease-in-out infinite;"></div></div><div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="width:14px;height:14px;border-radius:50%;border:1.5px solid #c8b89a;animation:fa_stc2 3s ease-in-out infinite;"></div><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;opacity:0.6;letter-spacing:0.03em;">Step 2</div></div><div style="width:50px;height:2px;background:#2a2825;position:relative;margin-bottom:11px;overflow:hidden;"><div style="position:absolute;top:0;left:0;height:100%;background:#c8b89a;animation:fa_stl2 3s ease-in-out infinite;"></div></div><div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="width:14px;height:14px;border-radius:50%;border:1.5px solid #c8b89a;animation:fa_stc3 3s ease-in-out infinite;"></div><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;opacity:0.6;letter-spacing:0.03em;">Step 3</div></div></div></div><style>@keyframes fa_stc1{0%,30%{background:#c8b89a}40%,100%{background:#2a2825}}@keyframes fa_stc2{0%,30%{background:#2a2825}40%,65%{background:#c8b89a}75%,100%{background:#2a2825}}@keyframes fa_stc3{0%,65%{background:#2a2825}75%,95%{background:#c8b89a}100%{background:#2a2825}}@keyframes fa_stl1{0%,30%{width:100%}40%,100%{width:0%}}@keyframes fa_stl2{0%,65%{width:0%}75%,95%{width:100%}100%{width:0%}}</style>`,
    "notification badge": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="position:relative;animation:fa_shake 3s ease-in-out infinite;"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4C10 4 8 7 8 11v6l-2 2v1h16v-1l-2-2v-6c0-4-2-7-6-7z" fill="#c8b89a" opacity="0.9"/><path d="M11.5 22c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5" stroke="#c8b89a" stroke-width="1.5" fill="none" opacity="0.9"/></svg><div style="position:absolute;top:-3px;right:-3px;width:14px;height:14px;border-radius:50%;background:rgba(200,184,154,0.25);animation:fa_nbring 3s ease-out infinite;"></div><div style="position:absolute;top:-3px;right:-3px;width:14px;height:14px;border-radius:50%;background:#c8b89a;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:7px;font-weight:700;color:#1a1917;animation:fa_badge 3s ease-in-out infinite;">3</div></div></div><style>@keyframes fa_shake{0%,15%{transform:rotate(0deg)}20%{transform:rotate(12deg)}25%{transform:rotate(-10deg)}30%{transform:rotate(8deg)}35%{transform:rotate(-6deg)}40%,100%{transform:rotate(0deg)}}@keyframes fa_nbring{0%,10%{transform:scale(1);opacity:0.6}60%{transform:scale(2.4);opacity:0}100%{transform:scale(1);opacity:0}}@keyframes fa_badge{0%,10%{transform:scale(0);opacity:0}20%,100%{transform:scale(1);opacity:1}}</style>`
  };

  // ============================================================
  // FUZZY TERM MATCHING
  // ============================================================
  const TERM_ALIASES = {
    "off-canvas drawer": ["off-canvas menu", "offcanvas drawer", "offcanvas menu", "side drawer", "slide-out menu", "slide-out drawer", "right drawer", "right-side drawer", "right-side menu", "right side menu", "right side drawer", "left drawer", "left-side menu", "left side menu", "navigation drawer", "hamburger overlay", "slide-in menu", "slide-in drawer", "side panel", "drawer menu", "drawer panel", "slide menu"],
    "glassmorphic popover": ["frosted popover", "glass popover", "glassmorphism popover", "frosted glass popover", "blur popover", "frosted card", "blurred popup", "frosted overlay", "glassy popup", "transparent popover", "blurred card", "blur effect popover"],
    "masonry grid": ["pinterest grid", "masonry layout", "waterfall grid", "staggered grid", "pinterest layout", "grid style", "responsive grid", "column grid", "pinterest-style grid", "pinterest style grid", "staggered layout", "uneven grid", "image gallery", "photo gallery", "image grid", "gallery view", "photo grid"],
    "sticky navbar": ["sticky header", "fixed navbar", "fixed header", "sticky top bar", "fixed top bar", "sticky navigation", "fixed navigation", "persistent header", "sticky menu", "top navigation bar", "fixed nav", "anchored header", "pinned header", "top nav bar", "top bar", "header bar", "page header bar"],
    "modal overlay": ["modal dialog", "modal", "dialog box", "popup modal", "overlay modal", "modal window", "blur effect", "dimmer layer", "dim layer", "faded background", "scrim overlay", "backdrop", "scrim", "alert box", "pop-up window", "popup window", "popup", "pop up", "fade in overlay", "fade-in overlay", "darkened overlay", "fog effect", "fog overlay", "background fade", "fade background", "fade overlay"],
    "skeleton loader": ["skeleton screen", "skeleton placeholder", "shimmer loader", "loading skeleton", "placeholder loader", "placeholder image", "loading animation", "loading placeholder", "shimmer effect", "shimmer placeholder", "loading shimmer", "ghost loader"],
    "tab panel": ["tabs", "tab navigation", "tab bar", "tab interface", "tabbed interface", "tab switcher", "tabbed panel", "tab view"],
    "accordion": ["expandable list", "collapsible panel", "expandable sections", "expand collapse", "collapsible section", "expandable card", "toggle panel", "expand panel", "fold-out panel", "collapsible list", "expand collapse panel"],
    "toast notification": ["toast", "snackbar", "notification toast", "snack bar", "toast message", "popup notification", "alert box", "message bar", "notification message", "alert toast", "flash message", "alert popup"],
    "breadcrumb navigation": ["breadcrumb", "breadcrumbs", "breadcrumb trail", "navigation breadcrumb", "trail navigation", "page trail", "navigation trail", "path indicator", "navigation path", "trail of links"],
    "tooltip": ["info tip", "hover tip", "help tooltip", "info bubble", "hover hint", "popup hint", "info popup", "hint bubble"],
    "dropdown menu": ["dropdown", "dropdown list", "select menu", "menu dropdown", "popup menu", "select dropdown", "drop-down", "drop down menu", "options menu"],
    "progress bar": ["progress indicator", "loading bar", "progress meter", "progress tracker", "completion bar", "status bar", "progress status"],
    "bottom sheet": ["bottom drawer", "bottom panel", "slide up panel", "bottom modal", "bottom slide-up", "drawer from bottom", "bottom popup"],
    "confirmation dialog": ["confirmation modal", "confirm dialog", "alert dialog", "warning dialog", "confirm popup", "confirmation popup", "yes no dialog", "decision dialog"],
    "search bar": ["search box", "search field", "search input", "search", "search input field", "search input field with autocomplete", "query input", "search form field", "search form", "search query", "input search field", "autocomplete", "auto-complete input", "autocomplete input", "type-ahead", "typeahead search", "live search", "predictive search"],
    "toggle switch": ["toggle", "switch", "on off switch", "toggle button", "on/off toggle", "binary switch", "flip switch", "checkbox toggle"],
    "loading spinner": ["spinner", "loading indicator", "loader", "spinning loader", "spinning loading indicator", "progress spinner", "loading wheel", "spinner indicator", "circular loader", "spin loader", "rotating loader", "busy indicator", "busy spinner", "activity indicator", "wait indicator", "pulse indicator", "pulsing indicator", "pulse loader", "pulse spinner"],
    "floating action button": ["fab", "action button", "floating button", "circular button", "round action button", "primary action button", "corner button"],
    "hero section": ["hero", "hero banner", "hero block", "main banner", "hero header", "splash section", "intro section", "header section", "landing hero", "marketing hero"],
    "card grid": ["card layout", "cards", "grid of cards", "card row", "grid list", "tile grid", "card stack", "card container", "card collection", "tile layout", "card array"],
    "pagination control": ["pagination", "page navigation", "page numbers", "paging", "page navigator", "pager", "page selector", "page picker", "page links"],
    "image carousel": ["carousel", "image slider", "slideshow", "image rotator", "photo carousel", "image gallery slider", "rotating images", "carousel slideshow", "picture slider", "image scroller"],
    "hamburger menu": ["hamburger", "hamburger icon", "menu icon", "three line menu", "hamburger menu icon", "mobile navigation toggle", "menu button", "nav toggle button", "nav toggle", "mobile menu icon", "menu toggle"],
    "data table": ["table", "data grid", "spreadsheet table", "tabular data", "table view", "data list", "row table", "table layout"],
    "banner": ["banner notification", "alert banner", "notification banner", "info banner", "promo banner", "top banner", "alert banner at top", "announcement banner", "notice banner"],
    "sidebar navigation": ["sidebar", "side navigation", "nav sidebar", "left sidebar", "left sidebar nav", "navigation sidebar", "side nav panel", "side menu panel", "vertical menu", "vertical navigation"],
    "footer section": ["footer", "page footer", "site footer", "copyright notice", "page bottom bar", "bottom bar", "bottom section", "site bottom"],
    "step progress indicator": ["step indicator", "progress steps", "wizard progress", "stepper", "step by step", "stepper progress", "step tracker", "wizard steps", "progress stepper"],
    "notification badge": ["badge", "notification dot", "alert badge", "count badge", "notification bell", "bell badge", "bell with badge", "alert dot", "unread badge", "indicator badge"]
  };

  function findAnimation(term) {
    if (!term) {
      console.log('[Forma Animation] No term provided');
      return null;
    }
    const normalized = term.toLowerCase().trim();
    
    // Direct match
    if (ANIMATION_LIBRARY[normalized]) {
      console.log(`[Forma Animation] ✓ Direct match: "${term}" → "${normalized}"`);
      return ANIMATION_LIBRARY[normalized];
    }
    
    // Check aliases
    for (const [canonical, aliases] of Object.entries(TERM_ALIASES)) {
      if (aliases.includes(normalized)) {
        console.log(`[Forma Animation] ✓ Alias match: "${term}" → "${canonical}"`);
        return ANIMATION_LIBRARY[canonical];
      }
    }
    
    // Partial match - if term contains a key
    for (const key of Object.keys(ANIMATION_LIBRARY)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        console.log(`[Forma Animation] ✓ Partial match: "${term}" → "${key}"`);
        return ANIMATION_LIBRARY[key];
      }
    }
    
    // Word-level partial match
    const words = normalized.split(/\s+/);
    for (const key of Object.keys(ANIMATION_LIBRARY)) {
      const keyWords = key.split(/\s+/);
      const overlap = words.filter(w => keyWords.includes(w)).length;
      if (overlap >= 2) {
        console.log(`[Forma Animation] ✓ Word overlap match: "${term}" → "${key}"`);
        return ANIMATION_LIBRARY[key];
      }
    }
    
    console.log(`[Forma Animation] ✗ NO MATCH FOUND for: "${term}"`);
    console.log(`[Forma Animation]   Normalized to: "${normalized}"`);
    return null;
  }

  const phraseCache = new Map();
  const skippedPhrases = new Set();
  let selectedAlternative = null;
  let currentResponse = null;

  function findLargestTextarea() {
    const textareas = Array.from(document.querySelectorAll('textarea'));
    if (textareas.length === 0) return null;
    let largest = textareas[0];
    let largestArea = 0;
    for (const ta of textareas) {
      const rect = ta.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area > largestArea) {
        largestArea = area;
        largest = ta;
      }
    }
    return largest;
  }

  function detectPhrases(text) {
    if (!text) return [];
    const lower = text.toLowerCase();
    const matches = [];
    const usedRanges = [];
    for (const pattern of VAGUE_PATTERNS) {
      let searchFrom = 0;
      while (true) {
        const index = lower.indexOf(pattern, searchFrom);
        if (index === -1) break;
        const end = index + pattern.length;
        const overlaps = usedRanges.some(r =>
          (index >= r.start && index < r.end) ||
          (end > r.start && end <= r.end) ||
          (index <= r.start && end >= r.end)
        );
        const phrase = text.substring(index, end);
        if (!overlaps && !skippedPhrases.has(phrase.toLowerCase())) {
          matches.push({ phrase: phrase, start: index, end: end, pattern: pattern });
          usedRanges.push({ start: index, end: end });
        }
        searchFrom = end;
      }
    }
    matches.sort((a, b) => a.start - b.start);
    return matches;
  }

  let overlay = null;
  let targetTextarea = null;

  function createOverlay(textarea) {
    if (overlay) overlay.remove();
    overlay = document.createElement('div');
    overlay.id = 'forma-overlay';
    const computed = window.getComputedStyle(textarea);
    Object.assign(overlay.style, {
      position: 'absolute', pointerEvents: 'none', zIndex: '9999',
      whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflow: 'hidden',
      color: 'transparent', backgroundColor: 'transparent',
      borderColor: 'transparent', borderWidth: computed.borderWidth,
      borderStyle: 'solid', fontFamily: computed.fontFamily,
      fontSize: computed.fontSize, fontWeight: computed.fontWeight,
      lineHeight: computed.lineHeight, letterSpacing: computed.letterSpacing,
      padding: computed.padding, margin: '0', boxSizing: computed.boxSizing
    });
    document.body.appendChild(overlay);
    return overlay;
  }

  function positionOverlay(textarea) {
    if (!overlay) return;
    const rect = textarea.getBoundingClientRect();
    overlay.style.top = (rect.top + window.scrollY) + 'px';
    overlay.style.left = (rect.left + window.scrollX) + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
  }

  function renderOverlay(textarea) {
    const text = textarea.value;
    const matches = detectPhrases(text);
    if (matches.length === 0) {
      overlay.innerHTML = '';
      return;
    }
    let html = '';
    let cursor = 0;
    for (const match of matches) {
      html += escapeHtml(text.substring(cursor, match.start));
      html += '<span class="forma-underline" data-phrase="' +
              escapeAttr(match.phrase) + '" data-start="' + match.start + 
              '" data-end="' + match.end + '" style="' +
              'border-bottom: 1.5px dotted #c8b89a; ' +
              'pointer-events: auto; cursor: pointer; color: transparent;' +
              '">' + escapeHtml(match.phrase) + '</span>';
      cursor = match.end;
    }
    html += escapeHtml(text.substring(cursor));
    overlay.innerHTML = html;
    overlay.scrollTop = textarea.scrollTop;
    overlay.querySelectorAll('.forma-underline').forEach(span => {
      span.addEventListener('mouseenter', handleHover);
      span.addEventListener('mouseleave', handleHoverEnd);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  let tooltip = null;
  let tooltipHideTimeout = null;
  let currentPhrase = null;
  let currentSpan = null;

  function createTooltip() {
    if (tooltip) return tooltip;
    tooltip = document.createElement('div');
    tooltip.id = 'forma-tooltip';
    Object.assign(tooltip.style, {
      position: 'absolute', zIndex: '10000', width: '280px',
      background: '#1c1a17', border: '0.5px solid rgba(200,184,154,0.4)',
      borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f0ece4', fontSize: '13px', lineHeight: '1.5',
      pointerEvents: 'auto', display: 'none', overflow: 'hidden'
    });
    tooltip.addEventListener('mouseenter', () => {
      if (tooltipHideTimeout) clearTimeout(tooltipHideTimeout);
    });
    tooltip.addEventListener('mouseleave', hideTooltipDelayed);
    document.body.appendChild(tooltip);
    return tooltip;
  }

  function showTooltipLoading(span) {
    createTooltip();
    if (tooltipHideTimeout) clearTimeout(tooltipHideTimeout);
    const rect = span.getBoundingClientRect();
    tooltip.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    tooltip.style.left = (rect.left + window.scrollX) + 'px';
    tooltip.style.display = 'block';
    tooltip.innerHTML = `
      <div style="padding: 14px 16px;">
        <div style="display:flex; align-items:center; gap:8px; color:#c8b89a; font-size:11px; letter-spacing:0.05em;">
          <div style="width:6px; height:6px; border-radius:50%; background:#4ade80; animation: forma-pulse 1.5s ease-in-out infinite;"></div>
          Analyzing on AMD MI300X...
        </div>
      </div>
    `;
    if (!document.getElementById('forma-keyframes')) {
      const style = document.createElement('style');
      style.id = 'forma-keyframes';
      style.textContent = '@keyframes forma-pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }';
      document.head.appendChild(style);
    }
  }

  function showTooltipResponse(span, data) {
    createTooltip();
    tooltip.style.display = 'block';
    currentResponse = data;
    selectedAlternative = null;
    
    const rect = span.getBoundingClientRect();
    tooltip.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    tooltip.style.left = (rect.left + window.scrollX) + 'px';
    
    renderTooltipContent(data);
  }

  function renderTooltipContent(data) {
    // If an alternative is selected, show that as the primary term
    const displayTerm = selectedAlternative ? selectedAlternative.term : data.term;
    const displayDefinition = selectedAlternative ? selectedAlternative.description : data.definition;
    const animation = findAnimation(displayTerm);
    
    const altsHtml = (data.alternatives || []).map((alt, i) => {
      const isSelected = selectedAlternative && selectedAlternative.term === alt.term;
      return `
        <div class="forma-alt" data-alt-index="${i}" style="flex:1;padding:8px;background:${isSelected ? 'rgba(200,184,154,0.15)' : '#141412'};border:0.5px solid ${isSelected ? '#c8b89a' : '#2a2825'};border-radius:6px;cursor:pointer;transition:all 0.15s;">
          <div style="font-size:10px;color:#f0ece4;font-weight:500;margin-bottom:2px;line-height:1.3;">${escapeHtml(alt.term || '')}</div>
          <div style="font-size:9px;color:#6b6560;line-height:1.3;">${escapeHtml((alt.description || '').substring(0, 50))}</div>
        </div>
      `;
    }).join('');
    
    // "Reset" pill if alternative is selected
    const resetPillHtml = selectedAlternative 
      ? `<div id="forma-reset" style="display:inline-block;margin-top:6px;padding:3px 8px;background:rgba(200,184,154,0.1);border:0.5px solid #c8b89a;border-radius:4px;font-size:9px;color:#c8b89a;cursor:pointer;letter-spacing:0.05em;">← Back to ${escapeHtml(data.term)}</div>`
      : '';
    
    const animationHtml = animation 
      ? `<div style="margin:0 14px 10px;border-radius:7px;overflow:hidden;">${animation}</div>`
      : '';
    
    tooltip.innerHTML = `
      <div style="padding:10px 14px;border-bottom:0.5px solid #2a2825;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:10px;color:#c8b89a;letter-spacing:0.05em;font-weight:500;">FORMA SUGGESTS</div>
        <div style="font-size:10px;color:#6b6560;">${selectedAlternative ? 'Alternative selected' : 'Click accept'}</div>
      </div>
      <div style="padding:12px 14px 8px;">
        <div style="font-size:18px;font-weight:600;color:#f5f3ef;margin-bottom:4px;line-height:1.2;">${escapeHtml(displayTerm)}</div>
        <div style="font-size:12px;color:#a0998c;line-height:1.4;">${escapeHtml(displayDefinition || '')}</div>
        ${resetPillHtml}
      </div>
      ${animationHtml}
      <div style="padding:8px 14px;display:flex;gap:6px;">${altsHtml}</div>
      <div style="padding:10px 14px;display:flex;gap:8px;border-top:0.5px solid #2a2825;">
        <button id="forma-accept" style="flex:1;padding:8px;background:#c8b89a;color:#0a0a09;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">Accept "${escapeHtml(displayTerm)}"</button>
        <button id="forma-skip" style="padding:8px 14px;background:transparent;color:#6b6560;border:0.5px solid #2a2825;border-radius:6px;font-size:12px;cursor:pointer;font-family:inherit;">Skip</button>
      </div>
      <div style="padding:8px 14px;background:rgba(74,222,128,0.04);border-top:0.5px solid rgba(74,222,128,0.1);display:flex;align-items:center;gap:6px;">
        <div style="width:5px;height:5px;border-radius:50%;background:#4ade80;animation:forma-pulse 1.5s ease-in-out infinite;"></div>
        <div style="font-size:10px;color:#4ade80;font-family:monospace;">Llama 3.1 8B · AMD MI300X · ${data.latency || '?'}ms · Mode: ${DETECTION_MODE}</div>
      </div>
    `;
    
    // Wire up alternative thumbnails
    tooltip.querySelectorAll('.forma-alt').forEach(altDiv => {
      altDiv.addEventListener('click', () => {
        const idx = parseInt(altDiv.dataset.altIndex);
        const alt = currentResponse.alternatives[idx];
        if (selectedAlternative && selectedAlternative.term === alt.term) {
          selectedAlternative = null;
        } else {
          selectedAlternative = alt;
        }
        renderTooltipContent(currentResponse);
      });
    });
    
    // Wire up reset pill
    const resetBtn = tooltip.querySelector('#forma-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        selectedAlternative = null;
        renderTooltipContent(currentResponse);
      });
    }
    
    // Wire up accept and skip
    const acceptBtn = tooltip.querySelector('#forma-accept');
    if (acceptBtn) acceptBtn.addEventListener('click', handleAccept);
    const skipBtn = tooltip.querySelector('#forma-skip');
    if (skipBtn) skipBtn.addEventListener('click', handleSkip);
  }

  function showTooltipError(span, message) {
    if (!tooltip) return;
    tooltip.innerHTML = `
      <div style="padding:14px 16px; color:#f87171; font-size:12px;">
        ${escapeHtml(message)}
      </div>
    `;
  }

  function hideTooltip() {
    if (tooltip) tooltip.style.display = 'none';
    currentPhrase = null;
    currentSpan = null;
    selectedAlternative = null;
  }

  function hideTooltipDelayed() {
    if (tooltipHideTimeout) clearTimeout(tooltipHideTimeout);
    tooltipHideTimeout = setTimeout(hideTooltip, 300);
  }

  function handleHover(e) {
    const span = e.currentTarget;
    const phrase = span.dataset.phrase;
    if (!phrase) return;
    
    if (tooltipHideTimeout) clearTimeout(tooltipHideTimeout);
    currentPhrase = phrase;
    currentSpan = span;
    
    createTooltip();
    tooltip.style.display = 'block';
    
    if (phraseCache.has(phrase)) {
      showTooltipResponse(span, phraseCache.get(phrase));
      return;
    }
    
    showTooltipLoading(span);
    
    fetch(RAILWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase: phrase })
    })
    .then(res => res.json())
    .then(data => {
      console.log('[Forma API] Response for "' + phrase + '":', JSON.stringify(data, null, 2));
      if (currentPhrase !== phrase) return;
      if (!data || !data.term) {
        showTooltipError(span, 'No translation available.');
        return;
      }
      phraseCache.set(phrase, data);
      showTooltipResponse(span, data);
    })
    .catch(err => {
      console.error('[Forma] API error:', err);
      if (currentPhrase === phrase) {
        showTooltipError(span, 'Connection error.');
      }
    });
  }

  function handleHoverEnd(e) {
    hideTooltipDelayed();
  }

  function handleAccept() {
    if (!currentSpan || !currentResponse || !targetTextarea) return;
    const start = parseInt(currentSpan.dataset.start);
    const end = parseInt(currentSpan.dataset.end);
    if (isNaN(start) || isNaN(end)) return;
    
    const replacement = selectedAlternative ? selectedAlternative.term : currentResponse.term;
    const text = targetTextarea.value;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    
    targetTextarea.value = newText;
    targetTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    targetTextarea.dispatchEvent(new Event('change', { bubbles: true }));
    
    hideTooltip();
    positionOverlay(targetTextarea);
    renderOverlay(targetTextarea);
    
    console.log('[Forma] Accepted:', replacement);
  }

  function handleSkip() {
    if (!currentPhrase) return;
    skippedPhrases.add(currentPhrase.toLowerCase());
    hideTooltip();
    positionOverlay(targetTextarea);
    renderOverlay(targetTextarea);
    console.log('[Forma] Skipped:', currentPhrase);
  }

  function init() {
    targetTextarea = findLargestTextarea();
    if (!targetTextarea) {
      console.log('[Forma] No textarea found, will retry...');
      setTimeout(init, 1000);
      return;
    }
    console.log('[Forma] Found target textarea:', targetTextarea);
    createOverlay(targetTextarea);
    positionOverlay(targetTextarea);
    renderOverlay(targetTextarea);
    
    targetTextarea.addEventListener('input', () => {
      positionOverlay(targetTextarea);
      renderOverlay(targetTextarea);
    });
    targetTextarea.addEventListener('scroll', () => {
      if (overlay) overlay.scrollTop = targetTextarea.scrollTop;
    });
    window.addEventListener('scroll', () => positionOverlay(targetTextarea), true);
    window.addEventListener('resize', () => positionOverlay(targetTextarea));
    
    // Watch for React re-renders that remove our overlay
    const observer = new MutationObserver(() => {
      // Check if our overlay still exists in the DOM
      if (overlay && !document.body.contains(overlay)) {
        console.log('[Forma] Overlay removed by React, re-creating...');
        createOverlay(targetTextarea);
        positionOverlay(targetTextarea);
        renderOverlay(targetTextarea);
      }
      // Also check if the textarea got replaced with a new instance
      const currentTextarea = findLargestTextarea();
      if (currentTextarea && currentTextarea !== targetTextarea) {
        console.log('[Forma] Textarea was replaced, re-attaching...');
        targetTextarea = currentTextarea;
        createOverlay(targetTextarea);
        positionOverlay(targetTextarea);
        renderOverlay(targetTextarea);
        targetTextarea.addEventListener('input', () => {
          positionOverlay(targetTextarea);
          renderOverlay(targetTextarea);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Sync overlay position periodically as a safety net
    setInterval(() => {
      if (targetTextarea && overlay && document.body.contains(overlay)) {
        positionOverlay(targetTextarea);
      }
    }, 500);
    
    console.log('[Forma] Ready with React compatibility mode.');
  }

  // Wait longer for React-heavy apps to finish hydrating
  function startForma() {
    // Wait 1.5 seconds for React hydration to complete
    setTimeout(init, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startForma);
  } else {
    startForma();
  }
}
