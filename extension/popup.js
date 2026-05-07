// Forma Popup — Design Intelligence Activation Experience
// Loads when user clicks Forma icon in Chrome toolbar.
// Pulls live stats from production backend, supports try-it-now,
// and bridges user experience to dashboard/GitHub.

console.log('[Forma Popup] Loaded');

const ANALYZE_URL = 'https://forma-production-c800.up.railway.app/analyze';
const STATS_SUMMARY_URL = 'https://forma-production-c800.up.railway.app/stats/summary';
const STATS_RECENT_URL = 'https://forma-production-c800.up.railway.app/stats/recent?limit=5';
const DASHBOARD_URL = 'https://forma-production-c800.up.railway.app/admin';
const GITHUB_URL = 'https://github.com/haminxx/Forma';

let tryDebounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Forma Popup] DOM ready');
  
  initStats();
  initActivityFeed();
  initTryInput();
  initSampleChips();
  initCTAs();
  
  // Refresh stats and activity every 5 seconds while popup is open
  setInterval(() => {
    fetchStats();
    fetchActivity();
  }, 5000);
});

// ============================================================
// STATS — Top hero numbers
// ============================================================

function initStats() {
  fetchStats();
}

async function fetchStats() {
  try {
    const res = await fetch(STATS_SUMMARY_URL);
    if (!res.ok) throw new Error('Stats fetch failed');
    const data = await res.json();
    
    document.getElementById('stat-events').textContent = formatNumber(data.total_events);
    document.getElementById('stat-rate').textContent = `${Math.round(data.acceptance_rate)}%`;
    document.getElementById('stat-sites').textContent = data.unique_sites;
  } catch (err) {
    console.error('[Forma Popup] Stats error:', err);
    document.getElementById('stat-events').textContent = '—';
    document.getElementById('stat-rate').textContent = '—';
    document.getElementById('stat-sites').textContent = '—';
  }
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

// ============================================================
// LIVE ACTIVITY — Mini feed of last 5 events
// ============================================================

function initActivityFeed() {
  fetchActivity();
}

async function fetchActivity() {
  try {
    const res = await fetch(STATS_RECENT_URL);
    if (!res.ok) throw new Error('Activity fetch failed');
    const data = await res.json();
    const events = data.events || [];
    
    const feed = document.getElementById('activity-feed');
    
    if (events.length === 0) {
      feed.innerHTML = '<div class="activity-item-mini" style="justify-content:center;color:#6b6560;font-style:italic;">No activity yet</div>';
      return;
    }
    
    let html = '';
    for (const e of events) {
      const verb = {
        'detection': 'detected',
        'acceptance': 'accepted',
        'skip': 'skipped'
      }[e.event_type] || e.event_type;
      
      const timeAgo = formatTimeAgo(e.timestamp);
      
      html += `
        <div class="activity-item-mini">
          <div class="activity-dot-mini ${e.event_type}"></div>
          <div class="activity-text-mini">
            <span class="activity-term-mini">${escapeHtml(e.term)}</span>
            <span> ${verb} on </span>
            <span style="color:#a0998c;">${escapeHtml(e.site)}</span>
          </div>
          <div class="activity-time-mini">${timeAgo}</div>
        </div>
      `;
    }
    feed.innerHTML = html;
  } catch (err) {
    console.error('[Forma Popup] Activity error:', err);
    document.getElementById('activity-feed').innerHTML = 
      '<div class="activity-item-mini" style="justify-content:center;color:#6b6560;">Could not load activity</div>';
  }
}

function formatTimeAgo(isoString) {
  const date = new Date(isoString + 'Z');
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return diffSec + 's';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return diffMin + 'm';
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + 'h';
  return Math.floor(diffHr / 24) + 'd';
}

// ============================================================
// TRY FORMA NOW — Mini input that calls /analyze
// ============================================================

function initTryInput() {
  const input = document.getElementById('try-input');
  const result = document.getElementById('try-result');
  
  input.addEventListener('input', () => {
    const text = input.value.trim();
    
    if (!text) {
      result.classList.remove('active');
      return;
    }
    
    // Debounce — wait 800ms after user stops typing
    if (tryDebounceTimer) clearTimeout(tryDebounceTimer);
    tryDebounceTimer = setTimeout(() => analyzeText(text), 800);
  });
}

async function analyzeText(text) {
  const result = document.getElementById('try-result');
  
  result.classList.add('active');
  result.innerHTML = '<div class="try-result-loading">Analyzing on AMD MI300X...</div>';
  
  try {
    const res = await fetch(ANALYZE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    });
    
    if (!res.ok) throw new Error('Analyze failed');
    const data = await res.json();
    const phrases = data.phrases || [];
    
    if (phrases.length === 0) {
      result.innerHTML = '<div class="try-result-empty">No vague UI patterns detected.</div>';
      return;
    }
    
    let html = '<div style="margin-bottom:4px;color:#6b6560;font-size:9px;letter-spacing:0.05em;">DETECTED:</div>';
    const seen = new Set();
    for (const p of phrases) {
      if (p.term && !seen.has(p.term)) {
        seen.add(p.term);
        html += `<span class="try-result-term">${escapeHtml(p.term)}</span>`;
      }
    }
    html += `<div style="margin-top:6px;font-size:9px;color:#6b6560;">${phrases.length} pattern${phrases.length === 1 ? '' : 's'} · ${data.latency || '?'}ms</div>`;
    result.innerHTML = html;
  } catch (err) {
    console.error('[Forma Popup] Analyze error:', err);
    result.innerHTML = '<div class="try-result-empty">Could not connect to backend.</div>';
  }
}

// ============================================================
// SAMPLE CHIPS — Pre-loaded test phrases
// ============================================================

function initSampleChips() {
  const chips = document.querySelectorAll('.sample-chip');
  const input = document.getElementById('try-input');
  
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const phrase = chip.dataset.phrase;
      input.value = phrase;
      input.focus();
      analyzeText(phrase);
    });
  });
}

// ============================================================
// CTAs — Open dashboard and GitHub
// ============================================================

function initCTAs() {
  document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
  });
  
  document.getElementById('open-github').addEventListener('click', () => {
    chrome.tabs.create({ url: GITHUB_URL });
  });
}

// ============================================================
// UTILITIES
// ============================================================

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
// Forma Popup Script
// Runs when the user clicks the Forma icon in Chrome toolbar

console.log('[Forma Popup] Loaded');

// Future: Add logic for toggling detection on/off,
// switching between keyword and AI mode, etc.

// For now, just confirm popup is alive
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Forma Popup] DOM ready');
});
