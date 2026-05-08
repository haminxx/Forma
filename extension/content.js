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
  const DETECTION_MODE = "ai";  // "keyword" or "ai"
  
  const RAILWAY_URL = 'https://forma-production-c800.up.railway.app/translate';
  const ANALYZE_URL = 'https://forma-production-c800.up.railway.app/analyze';
  const TRANSLATE_PRO_URL = 'https://forma-production-c800.up.railway.app/translate-pro';
  const RUN_ALL_URL = 'https://forma-production-c800.up.railway.app/agents/run-all';
  const LOG_EVENT_URL = 'https://forma-production-c800.up.railway.app/log/event';
  let proMode = false;  // Pro Mode toggle state
  const proExpansionCache = new Map();  // canonical_term -> expansion
  // Tracks text spans that were just accepted, so we don't re-detect them.
  // Each entry: { start: number, end: number, text: string }
  let acceptedSpans = [];
  let lastTextValue = '';  // For detecting major edits
  const LOG_DETECTION_URL = 'https://forma-production-c800.up.railway.app/log/detection';
  const LOG_ACCEPTANCE_URL = 'https://forma-production-c800.up.railway.app/log/acceptance';
  const LOG_SKIP_URL = 'https://forma-production-c800.up.railway.app/log/skip';
  
  console.log('[Forma Extension] Initializing on:', window.location.hostname);
  console.log('[Forma] Detection mode:', DETECTION_MODE.toUpperCase());

  // ============================================================
  // FORMA SCORE — Local prompt quality scoring (0-100)
  // No AMD needed. Pure JS heuristic.
  // ============================================================
  
  const FORMA_SCORE_VAGUE_WORDS = [
    'nice', 'cool', 'modern', 'clean', 'simple', 'pretty', 'beautiful',
    'something', 'thing', 'stuff', 'kind of', 'sort of', 'like a',
    'good', 'great', 'awesome', 'fancy', 'normal', 'regular'
  ];

  const FORMA_SCORE_SPECIFICITY_WORDS = [
    'sticky', 'fixed', 'floating', 'blurry', 'frosted', 'glass',
    'animated', 'sliding', 'rotating', 'expanding', 'collapsing',
    'with', 'when', 'after', 'before', 'using', 'showing',
    'mobile', 'desktop', 'responsive', 'compact', 'minimal'
  ];

  function computeFormaScore(text, detectedTerms) {
    if (!text || text.trim().length < 3) {
      return { score: 0, label: 'Empty', color: '#6b6560' };
    }
    
    const lower = text.toLowerCase();
    let score = 30;
    
    const componentBonus = Math.min((detectedTerms || []).length * 20, 60);
    score += componentBonus;
    
    let specificityCount = 0;
    for (const word of FORMA_SCORE_SPECIFICITY_WORDS) {
      if (lower.includes(word)) specificityCount++;
    }
    const specificityBonus = Math.min(specificityCount * 5, 15);
    score += specificityBonus;
    
    let vagueCount = 0;
    for (const word of FORMA_SCORE_VAGUE_WORDS) {
      if (lower.includes(word)) vagueCount++;
    }
    score -= vagueCount * 5;
    
    score = Math.max(0, Math.min(100, score));
    
    let label, color;
    if (score < 40) {
      label = 'Vague';
      color = '#ef4444';
    } else if (score < 70) {
      label = 'Decent';
      color = '#f59e0b';
    } else {
      label = 'Precise';
      color = '#4ade80';
    }
    
    return { score, label, color };
  }

  // ============================================================
  // DESIGN INTELLIGENCE LAYER — Event Logging
  // Fire and forget. Never blocks user experience.
  // ============================================================

  function logDetection(phrase, term, latencyMs) {
    fetch(LOG_DETECTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phrase: phrase,
        term: term,
        site: window.location.hostname,
        latency_ms: latencyMs
      })
    }).catch(err => {
      // Silent fail — logging is non-essential
      console.log('[Forma DI] Detection log failed:', err.message);
    });
  }

  function logAcceptance(phrase, term, alternativeTerm) {
    fetch(LOG_ACCEPTANCE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phrase: phrase,
        term: term,
        alternative_term: alternativeTerm || null,
        site: window.location.hostname
      })
    }).catch(err => {
      console.log('[Forma DI] Acceptance log failed:', err.message);
    });
  }

  function logSkip(phrase, term) {
    fetch(LOG_SKIP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phrase: phrase,
        term: term,
        site: window.location.hostname
      })
    }).catch(err => {
      console.log('[Forma DI] Skip log failed:', err.message);
    });
  }

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
    "header bar", "page header",
    "date picker", "calendar picker", "date range picker",
    "date input", "calendar dropdown", "date selector",
    "calendar widget", "calendar popup",
    "file upload", "file uploader", "drop zone", "dropzone",
    "drag and drop area", "drag drop area", "upload zone",
    "file dropzone", "file picker", "image upload", "photo upload",
    "rating stars", "star rating", "review stars", "five star rating",
    "5-star rating", "rating widget", "rating system",
    "feedback stars",
    "color picker", "color selector", "color palette", "swatch picker",
    "color swatch", "color chooser",
    "range slider", "value slider", "volume slider", "price slider",
    "range input", "scrubber",
    "form input field", "text input field", "input field", "text field",
    "form field", "labeled input",
    "login form", "sign in form", "signin form", "signup form",
    "registration form", "auth form", "authentication form",
    "avatar", "profile picture", "user avatar", "profile image",
    "profile photo", "user icon",
    "empty state", "blank state", "no results", "zero state",
    "empty placeholder", "no data state",
    "chip", "tag", "filter chip", "tag pill", "removable tag",
    "category chip", "filter tag",
    "separator", "divider", "horizontal rule", "section divider",
    "horizontal divider", "section separator",
    "settings panel", "preferences panel", "options panel",
    "settings menu", "preferences menu", "config panel",
    "cookie banner", "cookie consent", "consent banner",
    "cookie notice", "privacy banner", "gdpr banner",
    "comment thread", "comment section", "discussion thread",
    "reply thread", "nested comments", "comments list",
    "stats counter", "statistics counter", "metric counter",
    "kpi display", "stats display", "stats numbers",
    "testimonial card", "review card", "customer quote",
    "user testimonial", "client testimonial",
    "pricing card", "pricing tier", "price card", "plan card",
    "pricing plan", "subscription card", "pricing table",
    "activity feed", "activity stream", "news feed",
    "timeline feed", "notification feed", "event feed",
    "recent activity",
    "mega menu", "multi column menu", "expanded dropdown",
    "wide dropdown", "category menu",
    "command palette", "command bar", "command menu",
    "quick search", "spotlight search", "ctrl k menu",
    "cmd k menu", "quick switcher",
    "notification center", "notifications panel",
    "notification tray", "alerts panel", "alert center",
    "profile dropdown", "user dropdown", "account dropdown",
    "user menu", "profile menu", "avatar dropdown",
    "otp input", "otp field", "verification code input",
    "one time password", "pin input", "2fa input",
    "auth code input", "code verification",
    "tag input", "tags input", "chip input", "tag field",
    "multi tag input", "label input",
    "phone input", "phone number input", "phone field",
    "telephone input", "mobile number input", "country code input",
    "search suggestions", "search dropdown", "search autocomplete",
    "type ahead search", "predictive search", "live search results",
    "floating label input", "floating label", "material input",
    "outlined input", "animated label input",
    "switch group", "toggle group", "switch toggles",
    "multiple toggles", "settings switches",
    "onboarding tour", "product tour", "guided tour",
    "walkthrough", "feature tour", "tutorial",
    "user onboarding", "spotlight tour", "interactive guide",
    "password strength", "password meter", "strength indicator",
    "password indicator", "password validator", "strength bar"
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
    "notification badge": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="position:relative;animation:fa_shake 3s ease-in-out infinite;"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4C10 4 8 7 8 11v6l-2 2v1h16v-1l-2-2v-6c0-4-2-7-6-7z" fill="#c8b89a" opacity="0.9"/><path d="M11.5 22c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5" stroke="#c8b89a" stroke-width="1.5" fill="none" opacity="0.9"/></svg><div style="position:absolute;top:-3px;right:-3px;width:14px;height:14px;border-radius:50%;background:rgba(200,184,154,0.25);animation:fa_nbring 3s ease-out infinite;"></div><div style="position:absolute;top:-3px;right:-3px;width:14px;height:14px;border-radius:50%;background:#c8b89a;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:7px;font-weight:700;color:#1a1917;animation:fa_badge 3s ease-in-out infinite;">3</div></div></div><style>@keyframes fa_shake{0%,15%{transform:rotate(0deg)}20%{transform:rotate(12deg)}25%{transform:rotate(-10deg)}30%{transform:rotate(8deg)}35%{transform:rotate(-6deg)}40%,100%{transform:rotate(0deg)}}@keyframes fa_nbring{0%,10%{transform:scale(1);opacity:0.6}60%{transform:scale(2.4);opacity:0}100%{transform:scale(1);opacity:0}}@keyframes fa_badge{0%,10%{transform:scale(0);opacity:0}20%,100%{transform:scale(1);opacity:1}}</style>`,
    "date picker": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="width:120px;background:#2a2825;border:1px solid #c8b89a;border-radius:6px;overflow:hidden;animation:fa_dp_pop 3s ease-in-out infinite;"><div style="height:14px;background:#1a1917;border-bottom:0.5px solid #c8b89a;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:8px;color:#c8b89a;letter-spacing:0.05em;">May 2026</div><div style="padding:4px;display:grid;grid-template-columns:repeat(7,1fr);gap:1px;"><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.5;">1</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.5;">2</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.5;">3</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.5;">4</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.5;">5</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.5;">6</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.5;">7</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">8</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">9</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">10</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">11</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">12</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">13</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;background:#c8b89a;color:#1a1917;border-radius:50%;animation:fa_dp_select 3s ease-in-out infinite;">14</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">15</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">16</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">17</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">18</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">19</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">20</div><div style="height:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;color:#c8b89a;opacity:0.7;">21</div></div></div></div><style>@keyframes fa_dp_pop{0%,10%{opacity:0;transform:translateY(-4px) scale(0.95)}25%,75%{opacity:1;transform:translateY(0) scale(1)}90%,100%{opacity:0;transform:translateY(-4px) scale(0.95)}}@keyframes fa_dp_select{0%,30%{background:transparent;color:#c8b89a;opacity:0.7}45%,75%{background:#c8b89a;color:#1a1917;opacity:1}90%,100%{background:transparent;color:#c8b89a;opacity:0.7}}</style>`,
    "file upload": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="width:160px;height:44px;border:1.5px dashed #c8b89a;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:rgba(200,184,154,0.05);position:relative;overflow:hidden;animation:fa_fu_pulse 2s ease-in-out infinite;"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="animation:fa_fu_arrow 2s ease-in-out infinite;"><path d="M7 1v9M3 5l4-4 4 4M2 12h10" stroke="#c8b89a" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;opacity:0.7;letter-spacing:0.05em;">Drop file here</div></div></div><style>@keyframes fa_fu_pulse{0%,100%{border-color:rgba(200,184,154,0.5);background:rgba(200,184,154,0.05)}50%{border-color:#c8b89a;background:rgba(200,184,154,0.12)}}@keyframes fa_fu_arrow{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}</style>`,
    "rating stars": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;gap:4px;"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="animation:fa_st1 3s ease-in-out infinite;"><path d="M9 1l2.4 5.2 5.6.5-4.2 3.9 1.2 5.6L9 13.4 3.8 16.2 5 10.6.8 6.7l5.6-.5z" stroke="#c8b89a" stroke-width="1" fill="#c8b89a"/></svg><svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="animation:fa_st2 3s ease-in-out infinite;"><path d="M9 1l2.4 5.2 5.6.5-4.2 3.9 1.2 5.6L9 13.4 3.8 16.2 5 10.6.8 6.7l5.6-.5z" stroke="#c8b89a" stroke-width="1" fill="#c8b89a"/></svg><svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="animation:fa_st3 3s ease-in-out infinite;"><path d="M9 1l2.4 5.2 5.6.5-4.2 3.9 1.2 5.6L9 13.4 3.8 16.2 5 10.6.8 6.7l5.6-.5z" stroke="#c8b89a" stroke-width="1" fill="#c8b89a"/></svg><svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="animation:fa_st4 3s ease-in-out infinite;"><path d="M9 1l2.4 5.2 5.6.5-4.2 3.9 1.2 5.6L9 13.4 3.8 16.2 5 10.6.8 6.7l5.6-.5z" stroke="#c8b89a" stroke-width="1" fill="#c8b89a"/></svg><svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="animation:fa_st5 3s ease-in-out infinite;"><path d="M9 1l2.4 5.2 5.6.5-4.2 3.9 1.2 5.6L9 13.4 3.8 16.2 5 10.6.8 6.7l5.6-.5z" stroke="#c8b89a" stroke-width="1" fill="#c8b89a"/></svg></div><style>@keyframes fa_st1{0%,5%{fill-opacity:0;stroke-opacity:0.4}15%,80%{fill-opacity:1;stroke-opacity:1}90%,100%{fill-opacity:0;stroke-opacity:0.4}}@keyframes fa_st2{0%,15%{fill-opacity:0;stroke-opacity:0.4}25%,80%{fill-opacity:1;stroke-opacity:1}90%,100%{fill-opacity:0;stroke-opacity:0.4}}@keyframes fa_st3{0%,25%{fill-opacity:0;stroke-opacity:0.4}35%,80%{fill-opacity:1;stroke-opacity:1}90%,100%{fill-opacity:0;stroke-opacity:0.4}}@keyframes fa_st4{0%,35%{fill-opacity:0;stroke-opacity:0.4}45%,80%{fill-opacity:1;stroke-opacity:1}90%,100%{fill-opacity:0;stroke-opacity:0.4}}@keyframes fa_st5{0%,45%{fill-opacity:0;stroke-opacity:0.4}55%,80%{fill-opacity:1;stroke-opacity:1}90%,100%{fill-opacity:0;stroke-opacity:0.4}}</style>`,
    "color picker": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;gap:5px;"><div style="width:18px;height:18px;border-radius:50%;background:#ef4444;border:1.5px solid transparent;animation:fa_cp1 5s ease-in-out infinite;"></div><div style="width:18px;height:18px;border-radius:50%;background:#f59e0b;border:1.5px solid transparent;animation:fa_cp2 5s ease-in-out infinite;"></div><div style="width:18px;height:18px;border-radius:50%;background:#10b981;border:1.5px solid transparent;animation:fa_cp3 5s ease-in-out infinite;"></div><div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:1.5px solid transparent;animation:fa_cp4 5s ease-in-out infinite;"></div><div style="width:18px;height:18px;border-radius:50%;background:#8b5cf6;border:1.5px solid transparent;animation:fa_cp5 5s ease-in-out infinite;"></div><div style="width:18px;height:18px;border-radius:50%;background:#ec4899;border:1.5px solid transparent;animation:fa_cp6 5s ease-in-out infinite;"></div></div><style>@keyframes fa_cp1{0%,15%{border-color:#c8b89a;transform:scale(1.15)}25%,100%{border-color:transparent;transform:scale(1)}}@keyframes fa_cp2{0%,15%{border-color:transparent;transform:scale(1)}25%,40%{border-color:#c8b89a;transform:scale(1.15)}50%,100%{border-color:transparent;transform:scale(1)}}@keyframes fa_cp3{0%,40%{border-color:transparent;transform:scale(1)}50%,65%{border-color:#c8b89a;transform:scale(1.15)}75%,100%{border-color:transparent;transform:scale(1)}}@keyframes fa_cp4{0%,65%{border-color:transparent;transform:scale(1)}75%,90%{border-color:#c8b89a;transform:scale(1.15)}100%{border-color:transparent;transform:scale(1)}}@keyframes fa_cp5{0%,100%{border-color:transparent;transform:scale(1)}}@keyframes fa_cp6{0%,100%{border-color:transparent;transform:scale(1)}}</style>`,
    "range slider": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;"><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;letter-spacing:0.05em;animation:fa_rs_label 3s ease-in-out infinite;">Volume</div><div style="width:160px;height:4px;background:#2a2825;border-radius:2px;position:relative;"><div style="position:absolute;top:0;left:0;height:100%;background:#c8b89a;border-radius:2px;animation:fa_rs_fill 3s ease-in-out infinite;"></div><div style="position:absolute;top:50%;width:14px;height:14px;border-radius:50%;background:#c8b89a;border:2px solid #1a1917;transform:translate(-50%,-50%);animation:fa_rs_thumb 3s ease-in-out infinite;"></div></div></div><style>@keyframes fa_rs_fill{0%,5%{width:20%}50%,55%{width:75%}95%,100%{width:20%}}@keyframes fa_rs_thumb{0%,5%{left:20%}50%,55%{left:75%}95%,100%{left:20%}}@keyframes fa_rs_label{0%,30%{opacity:0.5}50%,70%{opacity:1}90%,100%{opacity:0.5}}</style>`,
    "form input field": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;"><div style="font-family:sans-serif;font-size:8px;color:#c8b89a;opacity:0.7;letter-spacing:0.05em;align-self:flex-start;margin-left:36px;">Email Address</div><div style="width:170px;height:24px;background:#2a2825;border:1px solid #c8b89a;border-radius:4px;display:flex;align-items:center;padding:0 10px;gap:1px;box-sizing:border-box;"><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;overflow:hidden;white-space:nowrap;animation:fa_fi_type 3s ease-in-out infinite;">user@example.com</div><div style="width:1.5px;height:11px;background:#c8b89a;animation:fa_fi_blink 0.8s step-end infinite;"></div></div></div><style>@keyframes fa_fi_type{0%,5%{width:0}45%,75%{width:108px}90%,100%{width:0}}@keyframes fa_fi_blink{0%,100%{opacity:1}50%{opacity:0}}</style>`,
    "login form": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px 0;box-sizing:border-box;"><div style="width:140px;height:11px;background:#2a2825;border:0.5px solid #c8b89a;border-radius:3px;display:flex;align-items:center;padding:0 6px;animation:fa_lf_e 3s ease-in-out infinite;"><div style="width:60px;height:2px;background:#c8b89a;border-radius:1px;opacity:0.7;"></div></div><div style="width:140px;height:11px;background:#2a2825;border:0.5px solid #c8b89a;border-radius:3px;display:flex;align-items:center;padding:0 6px;gap:3px;animation:fa_lf_p 3s ease-in-out infinite;"><div style="width:3px;height:3px;border-radius:50%;background:#c8b89a;opacity:0.7;"></div><div style="width:3px;height:3px;border-radius:50%;background:#c8b89a;opacity:0.7;"></div><div style="width:3px;height:3px;border-radius:50%;background:#c8b89a;opacity:0.7;"></div><div style="width:3px;height:3px;border-radius:50%;background:#c8b89a;opacity:0.7;"></div><div style="width:3px;height:3px;border-radius:50%;background:#c8b89a;opacity:0.7;"></div><div style="width:3px;height:3px;border-radius:50%;background:#c8b89a;opacity:0.7;"></div></div><div style="width:140px;height:13px;background:#c8b89a;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:7px;color:#1a1917;font-weight:600;letter-spacing:0.05em;animation:fa_lf_btn 3s ease-in-out infinite;">SIGN IN</div></div><style>@keyframes fa_lf_e{0%,5%{border-color:#c8b89a;background:rgba(200,184,154,0.1)}30%,100%{border-color:#c8b89a;background:#2a2825}}@keyframes fa_lf_p{0%,30%{border-color:#c8b89a;background:#2a2825}40%,60%{border-color:#c8b89a;background:rgba(200,184,154,0.1)}70%,100%{border-color:#c8b89a;background:#2a2825}}@keyframes fa_lf_btn{0%,60%{transform:scale(1);background:#c8b89a}70%,80%{transform:scale(0.95);background:#a8987a}90%,100%{transform:scale(1);background:#c8b89a}}</style>`,
    "avatar": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="position:relative;animation:fa_av_pop 3s ease-in-out infinite;"><div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#c8b89a 0%,#8a7a5c 100%);display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:14px;font-weight:600;color:#1a1917;letter-spacing:0.05em;border:1.5px solid #2a2825;">RZ</div><div style="position:absolute;bottom:0;right:0;width:11px;height:11px;border-radius:50%;background:#4ade80;border:2px solid #1a1917;animation:fa_av_pulse 1.5s ease-in-out infinite;"></div></div></div><style>@keyframes fa_av_pop{0%,5%{transform:scale(0.8);opacity:0}20%,80%{transform:scale(1);opacity:1}95%,100%{transform:scale(0.8);opacity:0}}@keyframes fa_av_pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.7}}</style>`,
    "empty state": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="animation:fa_es_icon 3s ease-in-out infinite;"><rect x="3" y="5" width="16" height="12" rx="1.5" stroke="#c8b89a" stroke-width="1.2" fill="none" opacity="0.6"/><circle cx="8" cy="10" r="1.5" fill="#c8b89a" opacity="0.6"/><path d="M3 14l4-3 4 3 5-4 4 3" stroke="#c8b89a" stroke-width="1.2" fill="none" opacity="0.6" stroke-linecap="round" stroke-linejoin="round"/></svg><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;letter-spacing:0.05em;animation:fa_es_text1 3s ease-in-out infinite;">No items yet</div><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;opacity:0.5;animation:fa_es_text2 3s ease-in-out infinite;">Add your first item</div></div><style>@keyframes fa_es_icon{0%,5%{opacity:0;transform:translateY(-4px)}20%,80%{opacity:1;transform:translateY(0)}95%,100%{opacity:0;transform:translateY(-4px)}}@keyframes fa_es_text1{0%,15%{opacity:0;transform:translateY(4px)}30%,80%{opacity:1;transform:translateY(0)}95%,100%{opacity:0;transform:translateY(4px)}}@keyframes fa_es_text2{0%,25%{opacity:0;transform:translateY(4px)}40%,80%{opacity:0.5;transform:translateY(0)}95%,100%{opacity:0;transform:translateY(4px)}}</style>`,
    "chip tag": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;gap:5px;flex-wrap:wrap;padding:0 16px;box-sizing:border-box;"><div style="height:18px;padding:0 8px;background:rgba(200,184,154,0.15);border:0.5px solid #c8b89a;border-radius:9px;display:flex;align-items:center;gap:4px;animation:fa_ct1 4s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:8px;color:#c8b89a;letter-spacing:0.03em;">Design</div><div style="width:8px;height:8px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#c8b89a;font-size:8px;line-height:1;">×</div></div><div style="height:18px;padding:0 8px;background:rgba(200,184,154,0.15);border:0.5px solid #c8b89a;border-radius:9px;display:flex;align-items:center;gap:4px;animation:fa_ct2 4s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:8px;color:#c8b89a;letter-spacing:0.03em;">React</div><div style="width:8px;height:8px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#c8b89a;font-size:8px;line-height:1;">×</div></div><div style="height:18px;padding:0 8px;background:rgba(200,184,154,0.15);border:0.5px solid #c8b89a;border-radius:9px;display:flex;align-items:center;gap:4px;animation:fa_ct3 4s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:8px;color:#c8b89a;letter-spacing:0.03em;">Frontend</div><div style="width:8px;height:8px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#c8b89a;font-size:8px;line-height:1;">×</div></div><div style="height:18px;padding:0 8px;background:rgba(200,184,154,0.15);border:0.5px solid #c8b89a;border-radius:9px;display:flex;align-items:center;gap:4px;animation:fa_ct4 4s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:8px;color:#c8b89a;letter-spacing:0.03em;">Hackathon</div><div style="width:8px;height:8px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#c8b89a;font-size:8px;line-height:1;">×</div></div></div><style>@keyframes fa_ct1{0%,5%{opacity:0;transform:scale(0.8)}15%,90%{opacity:1;transform:scale(1)}95%,100%{opacity:0;transform:scale(0.8)}}@keyframes fa_ct2{0%,15%{opacity:0;transform:scale(0.8)}25%,90%{opacity:1;transform:scale(1)}95%,100%{opacity:0;transform:scale(0.8)}}@keyframes fa_ct3{0%,25%{opacity:0;transform:scale(0.8)}35%,90%{opacity:1;transform:scale(1)}95%,100%{opacity:0;transform:scale(0.8)}}@keyframes fa_ct4{0%,35%{opacity:0;transform:scale(0.8)}45%,90%{opacity:1;transform:scale(1)}95%,100%{opacity:0;transform:scale(0.8)}}</style>`,
    "separator": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;"><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;letter-spacing:0.1em;animation:fa_sep_top 3s ease-in-out infinite;">Section A</div><div style="display:flex;align-items:center;gap:8px;width:160px;"><div style="flex:1;height:0.5px;background:#c8b89a;animation:fa_sep_left 3s ease-in-out infinite;"></div><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;opacity:0.6;letter-spacing:0.1em;animation:fa_sep_dot 3s ease-in-out infinite;">OR</div><div style="flex:1;height:0.5px;background:#c8b89a;animation:fa_sep_right 3s ease-in-out infinite;"></div></div><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;letter-spacing:0.1em;animation:fa_sep_bot 3s ease-in-out infinite;">Section B</div></div><style>@keyframes fa_sep_top{0%,5%{opacity:0}15%,90%{opacity:1}95%,100%{opacity:0}}@keyframes fa_sep_bot{0%,5%{opacity:0}15%,90%{opacity:1}95%,100%{opacity:0}}@keyframes fa_sep_left{0%,15%{transform:scaleX(0);transform-origin:right}35%,90%{transform:scaleX(1);transform-origin:right}95%,100%{transform:scaleX(0);transform-origin:right}}@keyframes fa_sep_right{0%,15%{transform:scaleX(0);transform-origin:left}35%,90%{transform:scaleX(1);transform-origin:left}95%,100%{transform:scaleX(0);transform-origin:left}}@keyframes fa_sep_dot{0%,30%{opacity:0}45%,90%{opacity:0.6}95%,100%{opacity:0}}</style>`,
    "settings panel": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;justify-content:center;padding:0 16px;gap:6px;box-sizing:border-box;"><div style="display:flex;align-items:center;justify-content:space-between;animation:fa_sp1 3s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;letter-spacing:0.05em;">Notifications</div><div style="width:24px;height:12px;border-radius:6px;border:0.5px solid #c8b89a;background:#c8b89a;position:relative;"><div style="position:absolute;top:1px;right:1px;width:8px;height:8px;border-radius:50%;background:#1a1917;"></div></div></div><div style="display:flex;align-items:center;justify-content:space-between;animation:fa_sp2 3s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;letter-spacing:0.05em;">Dark Mode</div><div style="width:24px;height:12px;border-radius:6px;border:0.5px solid #c8b89a;background:transparent;position:relative;"><div style="position:absolute;top:1px;left:1px;width:8px;height:8px;border-radius:50%;background:#c8b89a;opacity:0.5;"></div></div></div><div style="display:flex;align-items:center;justify-content:space-between;animation:fa_sp3 3s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;letter-spacing:0.05em;">Auto-save</div><div style="width:24px;height:12px;border-radius:6px;border:0.5px solid #c8b89a;background:#c8b89a;position:relative;"><div style="position:absolute;top:1px;right:1px;width:8px;height:8px;border-radius:50%;background:#1a1917;"></div></div></div></div><style>@keyframes fa_sp1{0%,5%{opacity:0;transform:translateX(-8px)}15%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0;transform:translateX(-8px)}}@keyframes fa_sp2{0%,15%{opacity:0;transform:translateX(-8px)}25%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0;transform:translateX(-8px)}}@keyframes fa_sp3{0%,25%{opacity:0;transform:translateX(-8px)}35%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0;transform:translateX(-8px)}}</style>`,
    "cookie banner": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;top:8px;left:8px;right:8px;height:4px;background:#2a2825;border-radius:2px;opacity:0.3;"></div><div style="position:absolute;top:18px;left:8px;right:60px;height:4px;background:#2a2825;border-radius:2px;opacity:0.3;"></div><div style="position:absolute;bottom:0;left:0;right:0;background:#2a2825;border-top:1px solid #c8b89a;padding:6px 8px;display:flex;align-items:center;gap:6px;animation:fa_cb 3s ease-in-out infinite;box-sizing:border-box;"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#c8b89a" stroke-width="1" fill="none" opacity="0.7"/><circle cx="5" cy="5.5" r="0.7" fill="#c8b89a" opacity="0.7"/><circle cx="9" cy="6" r="0.7" fill="#c8b89a" opacity="0.7"/><circle cx="6.5" cy="9" r="0.7" fill="#c8b89a" opacity="0.7"/></svg><div style="flex:1;display:flex;flex-direction:column;gap:2px;"><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.4;width:80%;"></div></div><div style="display:flex;gap:3px;"><div style="height:11px;padding:0 6px;border:0.5px solid #c8b89a;border-radius:2px;display:flex;align-items:center;font-family:sans-serif;font-size:6px;color:#c8b89a;letter-spacing:0.05em;">Reject</div><div style="height:11px;padding:0 6px;background:#c8b89a;border-radius:2px;display:flex;align-items:center;font-family:sans-serif;font-size:6px;color:#1a1917;font-weight:600;letter-spacing:0.05em;">Accept</div></div></div></div><style>@keyframes fa_cb{0%,10%{transform:translateY(100%)}25%,80%{transform:translateY(0%)}95%,100%{transform:translateY(100%)}}</style>`,
    "comment thread": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;padding:6px 10px;box-sizing:border-box;"><div style="display:flex;gap:5px;animation:fa_ct_p 3s ease-in-out infinite;"><div style="width:14px;height:14px;border-radius:50%;background:#c8b89a;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:6px;font-weight:600;color:#1a1917;">A</div><div style="flex:1;display:flex;flex-direction:column;gap:2px;"><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.7;width:60%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.4;width:90%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.4;width:75%;"></div></div></div><div style="display:flex;gap:5px;margin-top:5px;margin-left:18px;animation:fa_ct_r1 3s ease-in-out infinite;"><div style="width:12px;height:12px;border-radius:50%;background:#8a7a5c;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;font-weight:600;color:#1a1917;">B</div><div style="flex:1;display:flex;flex-direction:column;gap:2px;"><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;width:50%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.3;width:80%;"></div></div></div><div style="display:flex;gap:5px;margin-top:5px;margin-left:18px;animation:fa_ct_r2 3s ease-in-out infinite;"><div style="width:12px;height:12px;border-radius:50%;background:#6b5d44;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:5px;font-weight:600;color:#1a1917;">C</div><div style="flex:1;display:flex;flex-direction:column;gap:2px;"><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;width:55%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.3;width:70%;"></div></div></div></div><style>@keyframes fa_ct_p{0%,5%{opacity:0;transform:translateY(-4px)}15%,90%{opacity:1;transform:translateY(0)}95%,100%{opacity:0;transform:translateY(-4px)}}@keyframes fa_ct_r1{0%,15%{opacity:0;transform:translateX(-4px)}30%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0;transform:translateX(-4px)}}@keyframes fa_ct_r2{0%,30%{opacity:0;transform:translateX(-4px)}45%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0;transform:translateX(-4px)}}</style>`,
    "stats counter": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:space-around;padding:0 16px;box-sizing:border-box;"><div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><div style="font-family:sans-serif;font-size:18px;font-weight:700;color:#c8b89a;letter-spacing:-0.02em;line-height:1;"><span style="display:inline-block;animation:fa_stc1 3s ease-in-out infinite;">42</span>K</div><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;opacity:0.5;letter-spacing:0.1em;text-transform:uppercase;">Users</div></div><div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><div style="font-family:sans-serif;font-size:18px;font-weight:700;color:#c8b89a;letter-spacing:-0.02em;line-height:1;"><span style="display:inline-block;animation:fa_stc2 3s ease-in-out infinite;">98</span>%</div><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;opacity:0.5;letter-spacing:0.1em;text-transform:uppercase;">Uptime</div></div><div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><div style="font-family:sans-serif;font-size:18px;font-weight:700;color:#c8b89a;letter-spacing:-0.02em;line-height:1;"><span style="display:inline-block;animation:fa_stc3 3s ease-in-out infinite;">3.7</span></div><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;opacity:0.5;letter-spacing:0.1em;text-transform:uppercase;">Score</div></div></div><style>@keyframes fa_stc1{0%,5%{opacity:0;transform:translateY(8px)}25%,90%{opacity:1;transform:translateY(0)}95%,100%{opacity:0;transform:translateY(8px)}}@keyframes fa_stc2{0%,15%{opacity:0;transform:translateY(8px)}35%,90%{opacity:1;transform:translateY(0)}95%,100%{opacity:0;transform:translateY(8px)}}@keyframes fa_stc3{0%,25%{opacity:0;transform:translateY(8px)}45%,90%{opacity:1;transform:translateY(0)}95%,100%{opacity:0;transform:translateY(8px)}}</style>`,
    "testimonial card": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;padding:0 12px;box-sizing:border-box;"><div style="background:#2a2825;border:0.5px solid #c8b89a;border-radius:6px;padding:8px 10px;display:flex;flex-direction:column;gap:5px;width:100%;animation:fa_tc 3s ease-in-out infinite;"><div style="display:flex;align-items:flex-start;gap:6px;"><div style="font-family:Georgia,serif;font-size:18px;color:#c8b89a;line-height:0.6;opacity:0.6;">"</div><div style="flex:1;display:flex;flex-direction:column;gap:2px;padding-top:3px;"><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.7;width:95%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.7;width:80%;"></div></div></div><div style="display:flex;align-items:center;gap:5px;"><div style="width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,#c8b89a,#8a7a5c);flex-shrink:0;"></div><div style="display:flex;flex-direction:column;gap:1px;"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.05em;font-weight:600;">Sarah K.</div><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;opacity:0.5;letter-spacing:0.05em;">Designer at Vercel</div></div></div></div></div><style>@keyframes fa_tc{0%,5%{opacity:0;transform:translateY(8px) scale(0.95)}20%,90%{opacity:1;transform:translateY(0) scale(1)}95%,100%{opacity:0;transform:translateY(8px) scale(0.95)}}</style>`,
    "pricing card": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;gap:5px;padding:4px 8px;box-sizing:border-box;"><div style="flex:1;height:54px;background:#2a2825;border:0.5px solid #c8b89a;border-radius:4px;padding:5px;display:flex;flex-direction:column;animation:fa_pc1 3s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;opacity:0.6;letter-spacing:0.1em;">FREE</div><div style="font-family:sans-serif;font-size:13px;font-weight:700;color:#c8b89a;letter-spacing:-0.02em;">$0</div><div style="display:flex;flex-direction:column;gap:1px;margin-top:auto;"><div style="height:1.5px;background:#c8b89a;border-radius:1px;opacity:0.4;width:80%;"></div><div style="height:1.5px;background:#c8b89a;border-radius:1px;opacity:0.4;width:60%;"></div></div></div><div style="flex:1;height:60px;background:rgba(200,184,154,0.1);border:1px solid #c8b89a;border-radius:4px;padding:5px;display:flex;flex-direction:column;position:relative;animation:fa_pc2 3s ease-in-out infinite;"><div style="position:absolute;top:-5px;left:50%;transform:translateX(-50%);background:#c8b89a;color:#1a1917;font-family:sans-serif;font-size:5px;font-weight:700;padding:1px 5px;border-radius:6px;letter-spacing:0.05em;">POPULAR</div><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.1em;">PRO</div><div style="font-family:sans-serif;font-size:13px;font-weight:700;color:#c8b89a;letter-spacing:-0.02em;">$9</div><div style="display:flex;flex-direction:column;gap:1px;margin-top:auto;"><div style="height:1.5px;background:#c8b89a;border-radius:1px;opacity:0.6;width:90%;"></div><div style="height:1.5px;background:#c8b89a;border-radius:1px;opacity:0.6;width:70%;"></div><div style="height:1.5px;background:#c8b89a;border-radius:1px;opacity:0.6;width:80%;"></div></div></div><div style="flex:1;height:54px;background:#2a2825;border:0.5px solid #c8b89a;border-radius:4px;padding:5px;display:flex;flex-direction:column;animation:fa_pc3 3s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;opacity:0.6;letter-spacing:0.1em;">TEAM</div><div style="font-family:sans-serif;font-size:13px;font-weight:700;color:#c8b89a;letter-spacing:-0.02em;">$29</div><div style="display:flex;flex-direction:column;gap:1px;margin-top:auto;"><div style="height:1.5px;background:#c8b89a;border-radius:1px;opacity:0.4;width:85%;"></div><div style="height:1.5px;background:#c8b89a;border-radius:1px;opacity:0.4;width:65%;"></div></div></div></div><style>@keyframes fa_pc1{0%,5%{opacity:0;transform:translateY(6px)}15%,90%{opacity:1;transform:translateY(0)}95%,100%{opacity:0;transform:translateY(6px)}}@keyframes fa_pc2{0%,10%{opacity:0;transform:translateY(6px) scale(0.95)}25%,90%{opacity:1;transform:translateY(0) scale(1)}95%,100%{opacity:0;transform:translateY(6px) scale(0.95)}}@keyframes fa_pc3{0%,15%{opacity:0;transform:translateY(6px)}30%,90%{opacity:1;transform:translateY(0)}95%,100%{opacity:0;transform:translateY(6px)}}</style>`,
    "activity feed": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;padding:5px 12px;box-sizing:border-box;"><div style="display:flex;gap:6px;align-items:center;animation:fa_af1 3s ease-in-out infinite;"><div style="width:5px;height:5px;border-radius:50%;background:#4ade80;flex-shrink:0;"></div><div style="font-family:sans-serif;font-size:8px;color:#c8b89a;opacity:0.7;letter-spacing:0.03em;">Alice commented on Project</div><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;opacity:0.4;margin-left:auto;">2m</div></div><div style="display:flex;gap:6px;align-items:center;margin-top:5px;animation:fa_af2 3s ease-in-out infinite;"><div style="width:5px;height:5px;border-radius:50%;background:#3b82f6;flex-shrink:0;"></div><div style="font-family:sans-serif;font-size:8px;color:#c8b89a;opacity:0.7;letter-spacing:0.03em;">Bob completed a task</div><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;opacity:0.4;margin-left:auto;">5m</div></div><div style="display:flex;gap:6px;align-items:center;margin-top:5px;animation:fa_af3 3s ease-in-out infinite;"><div style="width:5px;height:5px;border-radius:50%;background:#f59e0b;flex-shrink:0;"></div><div style="font-family:sans-serif;font-size:8px;color:#c8b89a;opacity:0.7;letter-spacing:0.03em;">Carol uploaded a file</div><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;opacity:0.4;margin-left:auto;">8m</div></div><div style="display:flex;gap:6px;align-items:center;margin-top:5px;animation:fa_af4 3s ease-in-out infinite;"><div style="width:5px;height:5px;border-radius:50%;background:#ec4899;flex-shrink:0;"></div><div style="font-family:sans-serif;font-size:8px;color:#c8b89a;opacity:0.7;letter-spacing:0.03em;">Dan joined the team</div><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;opacity:0.4;margin-left:auto;">12m</div></div></div><style>@keyframes fa_af1{0%,5%{opacity:0;transform:translateX(-8px)}15%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0;transform:translateX(-8px)}}@keyframes fa_af2{0%,15%{opacity:0;transform:translateX(-8px)}25%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0;transform:translateX(-8px)}}@keyframes fa_af3{0%,25%{opacity:0;transform:translateX(-8px)}35%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0;transform:translateX(-8px)}}@keyframes fa_af4{0%,35%{opacity:0;transform:translateX(-8px)}45%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0;transform:translateX(-8px)}}</style>`,
    "mega menu": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;top:0;left:0;right:0;height:14px;background:#2a2825;border-bottom:0.5px solid #c8b89a;display:flex;align-items:center;padding:0 8px;gap:10px;box-sizing:border-box;"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.05em;">Home</div><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.05em;font-weight:600;border-bottom:1px solid #c8b89a;padding-bottom:1px;">Products</div><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.05em;opacity:0.6;">About</div></div><div style="position:absolute;top:14px;left:0;right:0;background:#2a2825;border:0.5px solid #c8b89a;border-top:none;padding:6px 8px;display:flex;gap:8px;animation:fa_mm 3s ease-in-out infinite;box-sizing:border-box;"><div style="flex:1;display:flex;flex-direction:column;gap:2px;"><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;letter-spacing:0.1em;font-weight:700;">DESIGN</div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;width:80%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;width:65%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;width:75%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;width:55%;"></div></div><div style="flex:1;display:flex;flex-direction:column;gap:2px;"><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;letter-spacing:0.1em;font-weight:700;">DEVELOP</div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;width:70%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;width:85%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;width:60%;"></div></div><div style="flex:1;display:flex;flex-direction:column;gap:2px;"><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;letter-spacing:0.1em;font-weight:700;">DEPLOY</div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;width:75%;"></div><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.6;width:65%;"></div></div></div></div><style>@keyframes fa_mm{0%,10%{opacity:0;transform:translateY(-6px);max-height:0}25%,75%{opacity:1;transform:translateY(0);max-height:60px}90%,100%{opacity:0;transform:translateY(-6px);max-height:0}}</style>`,
    "command palette": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="width:200px;background:#2a2825;border:0.5px solid #c8b89a;border-radius:6px;padding:6px;box-sizing:border-box;animation:fa_cmd 3s ease-in-out infinite;"><div style="display:flex;align-items:center;gap:6px;padding-bottom:5px;border-bottom:0.5px solid #3d3a36;"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="3.5" cy="3.5" r="2.5" stroke="#c8b89a" stroke-width="1" opacity="0.7"/><line x1="5.5" y1="5.5" x2="8" y2="8" stroke="#c8b89a" stroke-width="1" opacity="0.7"/></svg><div style="flex:1;font-family:sans-serif;font-size:8px;color:#c8b89a;letter-spacing:0.03em;animation:fa_cmd_typing 3s ease-in-out infinite;">create new</div><div style="display:flex;gap:2px;"><div style="height:11px;padding:0 4px;background:#1a1917;border:0.5px solid #c8b89a;border-radius:2px;display:flex;align-items:center;font-family:sans-serif;font-size:6px;color:#c8b89a;letter-spacing:0.05em;">⌘</div><div style="height:11px;padding:0 4px;background:#1a1917;border:0.5px solid #c8b89a;border-radius:2px;display:flex;align-items:center;font-family:sans-serif;font-size:6px;color:#c8b89a;letter-spacing:0.05em;">K</div></div></div><div style="padding-top:5px;display:flex;flex-direction:column;gap:2px;"><div style="height:10px;background:rgba(200,184,154,0.15);border-radius:2px;display:flex;align-items:center;padding:0 4px;"><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.8;width:70%;"></div></div><div style="height:10px;display:flex;align-items:center;padding:0 4px;"><div style="height:2px;background:#c8b89a;border-radius:1px;opacity:0.5;width:60%;"></div></div></div></div></div><style>@keyframes fa_cmd{0%,5%{opacity:0;transform:translateY(-6px) scale(0.95)}20%,90%{opacity:1;transform:translateY(0) scale(1)}95%,100%{opacity:0;transform:translateY(-6px) scale(0.95)}}@keyframes fa_cmd_typing{0%,15%{width:0;overflow:hidden;white-space:nowrap}45%,85%{width:60px;overflow:hidden;white-space:nowrap}95%,100%{width:0;overflow:hidden}}</style>`,
    "notification center": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="width:180px;background:#2a2825;border:0.5px solid #c8b89a;border-radius:6px;padding:6px 7px;box-sizing:border-box;animation:fa_nc_pop 3s ease-in-out infinite;"><div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:4px;border-bottom:0.5px solid #3d3a36;"><div style="display:flex;align-items:center;gap:4px;"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1c-1.3 0-2 1-2 2v1.5L2 5v0.5h5V5l-0.5-0.5V3c0-1-0.7-2-2-2z" fill="#c8b89a" opacity="0.8"/><path d="M3.5 7c0 0.5 0.5 1 1 1s1-0.5 1-1" stroke="#c8b89a" stroke-width="0.5" fill="none" opacity="0.8"/></svg><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.05em;font-weight:600;">Notifications</div></div><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;opacity:0.6;letter-spacing:0.05em;">Mark all read</div></div><div style="padding-top:4px;display:flex;flex-direction:column;gap:3px;"><div style="display:flex;gap:4px;align-items:center;animation:fa_nc1 3s ease-in-out infinite;"><div style="width:4px;height:4px;border-radius:50%;background:#3b82f6;flex-shrink:0;"></div><div style="flex:1;height:2px;background:#c8b89a;border-radius:1px;opacity:0.7;"></div></div><div style="display:flex;gap:4px;align-items:center;animation:fa_nc2 3s ease-in-out infinite;"><div style="width:4px;height:4px;border-radius:50%;background:#4ade80;flex-shrink:0;"></div><div style="flex:1;height:2px;background:#c8b89a;border-radius:1px;opacity:0.7;width:90%;"></div></div><div style="display:flex;gap:4px;align-items:center;animation:fa_nc3 3s ease-in-out infinite;"><div style="width:4px;height:4px;border-radius:50%;background:#f59e0b;flex-shrink:0;"></div><div style="flex:1;height:2px;background:#c8b89a;border-radius:1px;opacity:0.7;width:80%;"></div></div></div></div></div><style>@keyframes fa_nc_pop{0%,5%{opacity:0;transform:translateY(-6px) scale(0.95)}20%,90%{opacity:1;transform:translateY(0) scale(1)}95%,100%{opacity:0;transform:translateY(-6px) scale(0.95)}}@keyframes fa_nc1{0%,15%{opacity:0;transform:translateX(-4px)}30%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0}}@keyframes fa_nc2{0%,25%{opacity:0;transform:translateX(-4px)}40%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0}}@keyframes fa_nc3{0%,35%{opacity:0;transform:translateX(-4px)}50%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0}}</style>`,
    "profile dropdown": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:4px;gap:2px;"><div style="display:flex;align-items:center;gap:4px;background:#2a2825;border:0.5px solid #c8b89a;border-radius:14px;padding:2px 8px 2px 2px;z-index:2;"><div style="width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,#c8b89a,#8a7a5c);display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:6px;font-weight:700;color:#1a1917;">RZ</div><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.03em;">Ryan</div><div style="width:0;height:0;border-left:3px solid transparent;border-right:3px solid transparent;border-top:3px solid #c8b89a;"></div></div><div style="width:120px;background:#2a2825;border:0.5px solid #c8b89a;border-radius:4px;overflow:hidden;animation:fa_pd 3s ease-in-out infinite;"><div style="height:11px;display:flex;align-items:center;padding:0 6px;border-bottom:0.5px solid #3d3a36;"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.03em;">Profile</div></div><div style="height:11px;display:flex;align-items:center;padding:0 6px;border-bottom:0.5px solid #3d3a36;"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.03em;">Settings</div></div><div style="height:11px;display:flex;align-items:center;padding:0 6px;"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.03em;opacity:0.6;">Sign out</div></div></div></div><style>@keyframes fa_pd{0%,10%{max-height:0;opacity:0;transform:translateY(-4px)}30%,70%{max-height:36px;opacity:1;transform:translateY(0)}90%,100%{max-height:0;opacity:0;transform:translateY(-4px)}}</style>`,
    "otp input": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;gap:5px;"><div style="width:22px;height:28px;background:#2a2825;border:1px solid #c8b89a;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:13px;font-weight:600;color:#c8b89a;animation:fa_otp1 4s ease-in-out infinite;">4</div><div style="width:22px;height:28px;background:#2a2825;border:1px solid #c8b89a;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:13px;font-weight:600;color:#c8b89a;animation:fa_otp2 4s ease-in-out infinite;">7</div><div style="width:22px;height:28px;background:#2a2825;border:1px solid #c8b89a;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:13px;font-weight:600;color:#c8b89a;animation:fa_otp3 4s ease-in-out infinite;">2</div><div style="width:22px;height:28px;background:#2a2825;border:1px solid #c8b89a;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:13px;font-weight:600;color:#c8b89a;animation:fa_otp4 4s ease-in-out infinite;">9</div><div style="width:22px;height:28px;background:#2a2825;border:1px solid #c8b89a;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:13px;font-weight:600;color:#c8b89a;animation:fa_otp5 4s ease-in-out infinite;">1</div><div style="width:22px;height:28px;background:#2a2825;border:1px solid #c8b89a;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:13px;font-weight:600;color:#c8b89a;animation:fa_otp6 4s ease-in-out infinite;">5</div></div><style>@keyframes fa_otp1{0%,5%{color:transparent;border-color:#c8b89a;background:rgba(200,184,154,0.15)}15%,90%{color:#c8b89a;border-color:#c8b89a;background:#2a2825}95%,100%{color:transparent;background:rgba(200,184,154,0.15)}}@keyframes fa_otp2{0%,15%{color:transparent;border-color:#c8b89a;background:rgba(200,184,154,0.15)}25%,90%{color:#c8b89a;background:#2a2825}95%,100%{color:transparent}}@keyframes fa_otp3{0%,25%{color:transparent;background:rgba(200,184,154,0.15)}35%,90%{color:#c8b89a;background:#2a2825}95%,100%{color:transparent}}@keyframes fa_otp4{0%,35%{color:transparent;background:rgba(200,184,154,0.15)}45%,90%{color:#c8b89a;background:#2a2825}95%,100%{color:transparent}}@keyframes fa_otp5{0%,45%{color:transparent;background:rgba(200,184,154,0.15)}55%,90%{color:#c8b89a;background:#2a2825}95%,100%{color:transparent}}@keyframes fa_otp6{0%,55%{color:transparent;background:rgba(200,184,154,0.15)}65%,90%{color:#c8b89a;background:#2a2825}95%,100%{color:transparent}}</style>`,
    "tag input": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="width:200px;min-height:30px;background:#2a2825;border:1px solid #c8b89a;border-radius:6px;padding:4px;display:flex;flex-wrap:wrap;align-items:center;gap:3px;box-sizing:border-box;"><div style="height:14px;padding:0 5px;background:rgba(200,184,154,0.2);border-radius:7px;display:flex;align-items:center;gap:3px;animation:fa_ti1 4s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.03em;">react</div><div style="color:#c8b89a;font-size:8px;line-height:1;">×</div></div><div style="height:14px;padding:0 5px;background:rgba(200,184,154,0.2);border-radius:7px;display:flex;align-items:center;gap:3px;animation:fa_ti2 4s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.03em;">design</div><div style="color:#c8b89a;font-size:8px;line-height:1;">×</div></div><div style="height:14px;padding:0 5px;background:rgba(200,184,154,0.2);border-radius:7px;display:flex;align-items:center;gap:3px;animation:fa_ti3 4s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.03em;">forma</div><div style="color:#c8b89a;font-size:8px;line-height:1;">×</div></div><div style="display:flex;align-items:center;gap:1px;flex:1;min-width:30px;animation:fa_ti_cursor 4s ease-in-out infinite;"><div style="width:1.5px;height:10px;background:#c8b89a;animation:fa_ti_blink 0.8s step-end infinite;"></div></div></div></div><style>@keyframes fa_ti1{0%,5%{opacity:0;transform:scale(0.7)}15%,95%{opacity:1;transform:scale(1)}}@keyframes fa_ti2{0%,25%{opacity:0;transform:scale(0.7)}35%,95%{opacity:1;transform:scale(1)}}@keyframes fa_ti3{0%,45%{opacity:0;transform:scale(0.7)}55%,95%{opacity:1;transform:scale(1)}}@keyframes fa_ti_cursor{0%,55%{opacity:1}65%,95%{opacity:0.5}}@keyframes fa_ti_blink{0%,100%{opacity:1}50%{opacity:0}}</style>`,
    "phone input": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;gap:4px;"><div style="display:flex;align-items:center;gap:3px;height:24px;background:#2a2825;border:1px solid #c8b89a;border-radius:4px 0 0 4px;padding:0 7px;border-right:none;"><span style="font-size:11px;line-height:1;">🇺🇸</span><div style="font-family:sans-serif;font-size:8px;color:#c8b89a;letter-spacing:0.03em;font-weight:600;">+1</div><div style="width:0;height:0;border-left:2.5px solid transparent;border-right:2.5px solid transparent;border-top:2.5px solid #c8b89a;opacity:0.7;"></div></div><div style="height:24px;background:#2a2825;border:1px solid #c8b89a;border-radius:0 4px 4px 0;padding:0 8px;display:flex;align-items:center;gap:1px;flex:0 0 130px;"><div style="font-family:sans-serif;font-size:9px;color:#c8b89a;letter-spacing:0.05em;overflow:hidden;white-space:nowrap;animation:fa_ph_typing 3s ease-in-out infinite;">(415) 555-0142</div><div style="width:1.5px;height:11px;background:#c8b89a;animation:fa_ph_blink 0.8s step-end infinite;"></div></div></div><style>@keyframes fa_ph_typing{0%,5%{width:0}45%,75%{width:90px}90%,100%{width:0}}@keyframes fa_ph_blink{0%,100%{opacity:1}50%{opacity:0}}</style>`,
    "search suggestions": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;align-items:center;padding-top:4px;gap:0;"><div style="width:180px;height:18px;background:#2a2825;border:1px solid #c8b89a;border-radius:9px 9px 0 0;display:flex;align-items:center;padding:0 8px;gap:5px;border-bottom-color:#3d3a36;"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="3.5" cy="3.5" r="2.5" stroke="#c8b89a" stroke-width="1" opacity="0.7"/><line x1="5.5" y1="5.5" x2="8" y2="8" stroke="#c8b89a" stroke-width="1" opacity="0.7"/></svg><div style="font-family:sans-serif;font-size:8px;color:#c8b89a;letter-spacing:0.03em;animation:fa_ss_typing 3s ease-in-out infinite;">design</div><div style="width:1.5px;height:9px;background:#c8b89a;animation:fa_ss_blink 0.8s step-end infinite;"></div></div><div style="width:180px;background:#2a2825;border:1px solid #c8b89a;border-top:none;border-radius:0 0 6px 6px;overflow:hidden;animation:fa_ss_pop 3s ease-in-out infinite;"><div style="height:11px;display:flex;align-items:center;padding:0 8px;background:rgba(200,184,154,0.15);"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.03em;font-weight:600;">design system</div></div><div style="height:11px;display:flex;align-items:center;padding:0 8px;border-top:0.5px solid #3d3a36;"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.03em;opacity:0.7;">design tokens</div></div><div style="height:11px;display:flex;align-items:center;padding:0 8px;border-top:0.5px solid #3d3a36;"><div style="font-family:sans-serif;font-size:7px;color:#c8b89a;letter-spacing:0.03em;opacity:0.7;">design patterns</div></div></div></div><style>@keyframes fa_ss_typing{0%,5%{width:0;overflow:hidden;white-space:nowrap}30%,80%{width:36px;overflow:hidden;white-space:nowrap}90%,100%{width:0}}@keyframes fa_ss_blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes fa_ss_pop{0%,30%{max-height:0;opacity:0}50%,80%{max-height:36px;opacity:1}90%,100%{max-height:0;opacity:0}}</style>`,
    "floating label input": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;"><div style="position:relative;width:170px;"><div style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-family:sans-serif;font-size:9px;color:#c8b89a;letter-spacing:0.03em;background:#1a1917;padding:0 4px;animation:fa_fl_label 4s ease-in-out infinite;">Email Address</div><div style="height:28px;background:transparent;border:1px solid #c8b89a;border-radius:4px;display:flex;align-items:center;padding:0 10px;gap:1px;box-sizing:border-box;animation:fa_fl_border 4s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:10px;color:#c8b89a;letter-spacing:0.03em;overflow:hidden;white-space:nowrap;animation:fa_fl_text 4s ease-in-out infinite;">user@gmail.com</div><div style="width:1.5px;height:11px;background:#c8b89a;animation:fa_fl_blink 0.8s step-end infinite;"></div></div></div></div><style>@keyframes fa_fl_label{0%,30%{top:50%;font-size:9px;transform:translateY(-50%);color:#c8b89a;opacity:0.6}45%,90%{top:0;font-size:6px;transform:translateY(-50%);color:#c8b89a;opacity:1}95%,100%{top:50%;font-size:9px;transform:translateY(-50%);opacity:0.6}}@keyframes fa_fl_border{0%,30%{border-color:rgba(200,184,154,0.4)}45%,90%{border-color:#c8b89a}95%,100%{border-color:rgba(200,184,154,0.4)}}@keyframes fa_fl_text{0%,40%{width:0}55%,80%{width:78px}90%,100%{width:0}}@keyframes fa_fl_blink{0%,100%{opacity:1}50%{opacity:0}}</style>`,
    "switch group": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;align-items:center;justify-content:center;gap:5px;padding:0 8px;box-sizing:border-box;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;animation:fa_sg1 4s ease-in-out infinite;"><div style="width:30px;height:14px;border-radius:7px;border:0.5px solid #c8b89a;background:#c8b89a;position:relative;"><div style="position:absolute;top:1.5px;right:1.5px;width:9px;height:9px;border-radius:50%;background:#1a1917;"></div></div><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;letter-spacing:0.05em;">WiFi</div></div><div style="display:flex;flex-direction:column;align-items:center;gap:3px;animation:fa_sg2 4s ease-in-out infinite;"><div style="width:30px;height:14px;border-radius:7px;border:0.5px solid #c8b89a;background:transparent;position:relative;"><div style="position:absolute;top:1.5px;left:1.5px;width:9px;height:9px;border-radius:50%;background:#c8b89a;opacity:0.5;"></div></div><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;opacity:0.6;letter-spacing:0.05em;">Bluetooth</div></div><div style="display:flex;flex-direction:column;align-items:center;gap:3px;animation:fa_sg3 4s ease-in-out infinite;"><div style="width:30px;height:14px;border-radius:7px;border:0.5px solid #c8b89a;background:#c8b89a;position:relative;"><div style="position:absolute;top:1.5px;right:1.5px;width:9px;height:9px;border-radius:50%;background:#1a1917;"></div></div><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;letter-spacing:0.05em;">Sync</div></div><div style="display:flex;flex-direction:column;align-items:center;gap:3px;animation:fa_sg4 4s ease-in-out infinite;"><div style="width:30px;height:14px;border-radius:7px;border:0.5px solid #c8b89a;background:transparent;position:relative;"><div style="position:absolute;top:1.5px;left:1.5px;width:9px;height:9px;border-radius:50%;background:#c8b89a;opacity:0.5;"></div></div><div style="font-family:sans-serif;font-size:6px;color:#c8b89a;opacity:0.6;letter-spacing:0.05em;">VPN</div></div></div><style>@keyframes fa_sg1{0%,5%{opacity:0;transform:translateY(6px)}15%,95%{opacity:1;transform:translateY(0)}}@keyframes fa_sg2{0%,15%{opacity:0;transform:translateY(6px)}25%,95%{opacity:1;transform:translateY(0)}}@keyframes fa_sg3{0%,25%{opacity:0;transform:translateY(6px)}35%,95%{opacity:1;transform:translateY(0)}}@keyframes fa_sg4{0%,35%{opacity:0;transform:translateY(6px)}45%,95%{opacity:1;transform:translateY(0)}}</style>`,
    "onboarding tour": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;"><div style="position:absolute;top:8px;left:8px;right:8px;height:4px;background:#2a2825;border-radius:2px;opacity:0.3;"></div><div style="position:absolute;top:18px;left:8px;right:50px;height:4px;background:#2a2825;border-radius:2px;opacity:0.3;"></div><div style="position:absolute;top:30px;right:30px;width:32px;height:18px;background:#c8b89a;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:7px;color:#1a1917;font-weight:600;letter-spacing:0.05em;animation:fa_ob_target 3s ease-in-out infinite;">CTA</div><div style="position:absolute;top:30px;right:30px;width:32px;height:18px;border-radius:4px;animation:fa_ob_spotlight 3s ease-in-out infinite;box-shadow:0 0 0 200px rgba(0,0,0,0.7);pointer-events:none;"></div><div style="position:absolute;bottom:8px;left:12px;background:#c8b89a;color:#1a1917;border-radius:4px;padding:5px 8px;display:flex;flex-direction:column;gap:2px;animation:fa_ob_tip 3s ease-in-out infinite;"><div style="font-family:sans-serif;font-size:8px;font-weight:700;letter-spacing:0.05em;">Step 2 of 4</div><div style="font-family:sans-serif;font-size:7px;letter-spacing:0.03em;">Click here to begin</div><div style="position:absolute;right:-4px;top:50%;transform:translateY(-50%);width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;border-left:5px solid #c8b89a;"></div></div></div><style>@keyframes fa_ob_target{0%,5%{opacity:0;transform:scale(0.7)}20%,90%{opacity:1;transform:scale(1)}95%,100%{opacity:0;transform:scale(0.7)}}@keyframes fa_ob_spotlight{0%,5%{opacity:0}20%,90%{opacity:1}95%,100%{opacity:0}}@keyframes fa_ob_tip{0%,15%{opacity:0;transform:translateX(-8px)}30%,90%{opacity:1;transform:translateX(0)}95%,100%{opacity:0;transform:translateX(-8px)}}</style>`,
    "password strength": `<div style="width:240px;height:64px;overflow:hidden;position:relative;background:#1a1917;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:0 16px;box-sizing:border-box;"><div style="width:100%;display:flex;align-items:center;justify-content:space-between;"><div style="font-family:sans-serif;font-size:8px;color:#c8b89a;letter-spacing:0.05em;opacity:0.7;">Password</div><div style="font-family:sans-serif;font-size:8px;letter-spacing:0.05em;animation:fa_ps_label 4s ease-in-out infinite;">Strong</div></div><div style="width:100%;display:flex;gap:3px;"><div style="flex:1;height:4px;border-radius:2px;background:#ef4444;animation:fa_ps_bar1 4s ease-in-out infinite;"></div><div style="flex:1;height:4px;border-radius:2px;background:#2a2825;animation:fa_ps_bar2 4s ease-in-out infinite;"></div><div style="flex:1;height:4px;border-radius:2px;background:#2a2825;animation:fa_ps_bar3 4s ease-in-out infinite;"></div><div style="flex:1;height:4px;border-radius:2px;background:#2a2825;animation:fa_ps_bar4 4s ease-in-out infinite;"></div></div><div style="width:100%;display:flex;align-items:center;gap:3px;background:#2a2825;border:0.5px solid #c8b89a;border-radius:3px;padding:2px 6px;height:14px;box-sizing:border-box;"><div style="font-family:monospace;font-size:7px;color:#c8b89a;letter-spacing:0.1em;animation:fa_ps_dots 4s ease-in-out infinite;">•••••••••</div></div></div><style>@keyframes fa_ps_label{0%,5%{color:#ef4444;content:"Weak"}30%,40%{color:#f59e0b}55%,65%{color:#4ade80}80%,95%{color:#4ade80}}@keyframes fa_ps_bar1{0%,10%{background:#ef4444}30%,100%{background:#f59e0b}}@keyframes fa_ps_bar2{0%,25%{background:#2a2825}40%,100%{background:#f59e0b}}@keyframes fa_ps_bar3{0%,45%{background:#2a2825}60%,100%{background:#4ade80}}@keyframes fa_ps_bar4{0%,70%{background:#2a2825}85%,100%{background:#4ade80}}@keyframes fa_ps_dots{0%,5%{content:"•••"}30%{content:"••••••"}55%{content:"•••••••••"}80%,95%{content:"••••••••••••"}}</style>`
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
    "notification badge": ["badge", "notification dot", "alert badge", "count badge", "notification bell", "bell badge", "bell with badge", "alert dot", "unread badge", "indicator badge"],
    "date picker": ["calendar", "date selector", "date input", "calendar picker", "calendar widget", "datepicker", "date field", "date range picker", "date range", "calendar dropdown", "calendar input", "calendar selector", "schedule picker", "appointment picker", "day picker", "month picker", "year picker", "calendar pop-up", "calendar popup", "calendar overlay", "date chooser"],
    "file upload": ["file uploader", "drop zone", "dropzone", "file dropzone", "upload area", "file picker", "upload zone", "file input", "drag drop area", "drag and drop area", "drag-drop zone", "file drop area", "image upload", "photo upload", "file dragger", "upload box", "drag drop upload", "file selector", "browse files"],
    "rating stars": ["rating", "star rating", "stars", "review stars", "rating widget", "five star rating", "5-star rating", "star review", "rating system", "feedback stars", "rating component", "review widget", "score stars", "rating scale", "thumbs rating"],
    "color picker": ["color selector", "color swatch", "color chooser", "palette picker", "color palette", "color wheel", "swatch picker", "hex picker", "rgb picker", "color input", "color tool", "theme color picker", "color box", "color grid"],
    "range slider": ["slider", "range input", "value slider", "volume slider", "brightness slider", "price slider", "range control", "min max slider", "scrubber", "range bar", "level slider", "range selector", "filter slider", "draggable slider"],
    "form input field": ["text input", "input field", "text field", "input box", "form field", "text box", "single line input", "input control", "form input", "text entry", "input element", "field input", "data entry field", "labeled input"],
    "login form": ["sign in form", "signin form", "login screen", "auth form", "authentication form", "credentials form", "sign-in panel", "login dialog", "user login", "login modal", "login box", "login interface", "signup form", "register form", "registration form"],
    "avatar": ["profile picture", "user avatar", "profile image", "user image", "user icon", "profile photo", "user thumbnail", "circular profile", "user pic", "profile avatar", "account picture", "user profile picture", "presence indicator", "online indicator"],
    "empty state": ["empty page", "no results", "no data", "blank state", "zero state", "no content", "empty placeholder", "empty list", "nothing here", "no items", "empty view", "no records", "default empty"],
    "chip tag": ["chip", "tag", "label tag", "filter chip", "tag pill", "chip pill", "chip element", "tag element", "removable tag", "category chip", "filter tag", "input chip", "selectable tag", "tag chip", "label pill", "category tag"],
    "separator": ["divider", "horizontal rule", "section divider", "line divider", "section separator", "horizontal divider", "rule line", "split line", "border divider", "content separator", "vertical divider"],
    "settings panel": ["preferences panel", "options panel", "settings menu", "preferences menu", "settings list", "config panel", "configuration panel", "options menu", "user settings", "account settings", "settings page", "preferences list"],
    "cookie banner": ["cookie consent", "consent banner", "cookie notice", "privacy banner", "gdpr banner", "cookie popup", "consent popup", "privacy notice", "cookies acceptance", "tracking consent"],
    "comment thread": ["comments", "comment section", "discussion thread", "reply thread", "nested comments", "discussion", "comments list", "comment box", "thread of replies", "reply chain", "conversation thread", "reply section"],
    "stats counter": ["statistics counter", "stats display", "metric counter", "kpi display", "metrics block", "stats numbers", "data counter", "stats showcase", "number stats", "metric tiles", "statistics block", "key metrics"],
    "testimonial card": ["testimonial", "review card", "customer quote", "user testimonial", "client testimonial", "review block", "quote card", "user review", "customer review", "endorsement card", "praise card"],
    "pricing card": ["pricing tier", "price card", "plan card", "pricing plan", "subscription card", "pricing table", "tier card", "pricing option", "price tier", "plan tier", "subscription plan", "pricing block"],
    "activity feed": ["activity stream", "news feed", "timeline feed", "notification feed", "event feed", "user activity", "activity log", "feed list", "recent activity", "activity timeline", "social feed", "update feed"],
    "mega menu": ["multi column menu", "multi-column menu", "expanded menu", "wide menu", "full width menu", "category menu", "navigation mega menu", "drop down mega menu", "menu panel", "expanded dropdown", "wide dropdown"],
    "command palette": ["command bar", "command menu", "quick search", "search palette", "spotlight search", "ctrl k menu", "cmd k menu", "command interface", "quick command", "search command", "keyboard shortcut menu", "quick switcher"],
    "notification center": ["notifications panel", "notifications list", "notification tray", "notifications dropdown", "notifications popup", "alerts panel", "alert center", "notification panel", "messages panel", "alerts list"],
    "profile dropdown": ["user dropdown", "user menu", "account dropdown", "account menu", "profile menu", "user profile menu", "user account menu", "avatar dropdown", "profile popup", "account popup"],
    "otp input": ["otp", "otp field", "verification code input", "verification code", "one time password", "one-time password", "code input", "pin input", "two factor input", "2fa input", "auth code input", "verification field", "code verification", "security code input"],
    "tag input": ["tags input", "multi tag input", "tag entry", "label input", "tag adder", "chip input", "multi chip input", "tag field", "tags field", "keyword input", "category input", "topic input"],
    "phone input": ["phone number input", "phone field", "telephone input", "mobile number input", "phone number field", "country code input", "international phone input", "phone entry", "phone with country code"],
    "search suggestions": ["search dropdown", "search autocomplete", "search results dropdown", "type ahead search", "predictive search", "autocomplete search", "search hints", "search recommendations", "live search results"],
    "floating label input": ["floating label", "material input", "outlined input", "elevated label input", "animated label input", "label transition input", "modern input field", "material design input", "label float input"],
    "switch group": ["toggle group", "switch toggles", "multiple toggles", "settings switches", "toggle switches", "preference switches", "switch panel", "toggle bank", "multi switch", "toggle row"],
    "onboarding tour": ["product tour", "guided tour", "walkthrough", "intro tour", "feature tour", "tutorial", "user onboarding", "first time tutorial", "spotlight tour", "interactive guide", "step by step guide", "feature walkthrough"],
    "password strength": ["password meter", "password strength meter", "strength indicator", "password indicator", "password validator", "strength bar", "password gauge", "password quality meter", "password security indicator"]
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

  // ============================================================
  // AI MODE — Sentence-level detection via /analyze endpoint
  // ============================================================
  
  // Cache for AI mode responses keyed by full text
  const aiResponseCache = new Map();
  
  // Last analyzed text and timestamp for debouncing
  let lastAnalyzedText = '';
  let analyzeInFlight = false;
  let lastAIResponse = []; // most recent phrases array from AMD
  
  function detectPhrasesAI(text) {
    // Synchronous return of cached results
    // The actual AMD call happens in fetchAIPhrases (async)
    if (!text) {
      lastAIResponse = [];
      return [];
    }
    
    if (aiResponseCache.has(text)) {
      lastAIResponse = aiResponseCache.get(text);
      return lastAIResponse;
    }
    
    // Return last known response while waiting for new one
    return lastAIResponse;
  }
  
  function fetchAIPhrases(text, onComplete) {
    if (!text || text.length < 3) {
      lastAIResponse = [];
      onComplete([]);
      return;
    }
    
    // Avoid duplicate calls for same text
    if (text === lastAnalyzedText && aiResponseCache.has(text)) {
      onComplete(aiResponseCache.get(text));
      return;
    }
    
    if (analyzeInFlight) {
      console.log('[Forma AI] Already in-flight, skipping');
      return;
    }
    
    analyzeInFlight = true;
    lastAnalyzedText = text;
    console.log('[Forma AI] Calling /analyze for:', text.substring(0, 60) + '...');

    showAIIndicator();

    fetch(ANALYZE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    })
    .then(res => res.json())
    .then(data => {
      analyzeInFlight = false;
      hideAIIndicator();
      console.log('[Forma AI] Response:', data);

      if (data && data.error) {
        console.warn('[Forma AI] Analyze returned error:', data.error);
        return;
      }

      if (!data || !data.result || typeof data.result.score !== 'number') {
        console.warn('[Forma AI] Invalid response format');
        return;
      }

      const result = data.result;
      const tier = (result.tier || '').toLowerCase();
      const color =
        tier === 'vague' ? '#ef4444' :
        tier === 'decent' ? '#f59e0b' :
        tier === 'precise' ? '#4ade80' :
        '#6b6560';
      const label = result.tier || 'Unknown';

      // Keep overlay behavior unchanged; /analyze now drives badge score only.
      onComplete(lastAIResponse);
      if (!(deepAnalysisLoading && deepAnalysisSession && !deepAnalysisSession.errorMessage)) {
        showFormaScoreBadge(result.score, label, color);
      }
    })
    .catch(err => {
      analyzeInFlight = false;
      hideAIIndicator();
      console.error('[Forma AI] Error:', err);
    });
  }

  async function fetchProExpansion(canonicalTerm) {
    if (proExpansionCache.has(canonicalTerm)) {
      return proExpansionCache.get(canonicalTerm);
    }
    try {
      const res = await fetch(TRANSLATE_PRO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canonical_term: canonicalTerm })
      });
      const data = await res.json();
      proExpansionCache.set(canonicalTerm, data);
      return data;
    } catch (err) {
      console.error('[Forma Pro] Fetch failed:', err);
      return { canonical_term: canonicalTerm, pro_expansion: canonicalTerm, has_pro_template: false };
    }
  }

  let aiIndicator = null;

  function showAIIndicator() {
    if (!targetTextarea) return;
    if (aiIndicator) {
      aiIndicator.style.display = 'flex';
      return;
    }
    aiIndicator = document.createElement('div');
    aiIndicator.id = 'forma-ai-indicator';
    Object.assign(aiIndicator.style, {
      position: 'absolute',
      zIndex: '9998',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 10px',
      background: '#1c1a17',
      border: '0.5px solid rgba(200,184,154,0.3)',
      borderRadius: '8px',
      fontSize: '11px',
      color: '#c8b89a',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      letterSpacing: '0.05em',
      pointerEvents: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    });
    aiIndicator.innerHTML = '<div style="width:6px;height:6px;border-radius:50%;background:#4ade80;animation:forma-pulse 1.5s ease-in-out infinite;"></div>Forma AI analyzing...';
    document.body.appendChild(aiIndicator);
    positionAIIndicator();
  }

  function positionAIIndicator() {
    if (!aiIndicator || !targetTextarea) return;
    const rect = targetTextarea.getBoundingClientRect();
    aiIndicator.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    aiIndicator.style.left = (rect.left + window.scrollX) + 'px';
  }

  function hideAIIndicator() {
    if (aiIndicator) aiIndicator.style.display = 'none';
  }

  // ============================================================
  // FORMA SCORE BADGE — Floating score display near textarea
  // Updates locally as user types. No AMD calls.
  // ============================================================
  
  let formaScoreBadge = null;
  let deepAnalysisLoading = false;
  let deepAnalysisError = '';
  let agentPanel = null;
  let agentPanelEscListener = null;
  let deepAnalysisSession = null;

  const DEEP_AGENT_TIMELINE = [
    { id: 'detector', label: '🔍 Detector', startMs: 0, endMs: 1200 },
    { id: 'critic', label: '🔬 Critic', startMs: 200, endMs: 13000 },
    { id: 'reformulator', label: '✏️ Reformulator', startMs: 400, endMs: 19000 },
    { id: 'style', label: '🎨 Style', startMs: 600, endMs: 14000 },
    { id: 'memory', label: '🧠 Memory', startMs: 800, endMs: 11000 },
    { id: 'coach', label: '🎯 Coach', startMs: 1000, endMs: 17000 },
    { id: 'consensus', label: '🤝 Consensus', startMs: 19500, endMs: 41000 }
  ];

  function formatLatencyMs(ms) {
    if (!Number.isFinite(ms)) return '?';
    return (ms / 1000).toFixed(1);
  }

  function getTierColor(score) {
    if (score < 40) return '#ef4444';
    if (score < 70) return '#f59e0b';
    return '#4ade80';
  }

  function ensureAgentPanelStyles() {
    if (document.getElementById('forma-agent-panel-styles')) return;
    const style = document.createElement('style');
    style.id = 'forma-agent-panel-styles';
    style.textContent = `
      #forma-agent-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 420px;
        max-height: 80vh;
        overflow-y: auto;
        background: #0a0a09;
        border: 1px solid rgba(200, 184, 154, 0.12);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        z-index: 999999;
        padding: 24px;
        color: #f0ece4;
        font-family: 'Outfit', system-ui, -apple-system, sans-serif;
        transform: translateX(110%);
        opacity: 0;
        transition: transform 0.4s ease-out, opacity 0.4s ease-out;
      }
      #forma-agent-panel.forma-open {
        transform: translateX(0);
        opacity: 1;
      }
      #forma-agent-panel .forma-agent-card {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(200, 184, 154, 0.08);
        border-radius: 10px;
        padding: 14px;
        margin-bottom: 10px;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.25s ease, transform 0.25s ease;
      }
      #forma-agent-panel .forma-agent-card.forma-card-visible {
        opacity: 1;
        transform: translateY(0);
      }
      #forma-agent-panel .forma-agent-card:hover {
        transform: translateY(-2px);
      }
      #forma-agent-panel .forma-consensus-card {
        background: linear-gradient(135deg, rgba(200, 184, 154, 0.08), rgba(200, 184, 154, 0.02));
        border: 1px solid rgba(200, 184, 154, 0.2);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }
      #forma-agent-panel .forma-close {
        border: none;
        background: transparent;
        color: #6b6560;
        font-size: 24px;
        cursor: pointer;
        line-height: 1;
        padding: 0;
      }
      #forma-agent-panel .forma-close:hover { color: #f0ece4; }
      #forma-agent-panel .forma-coach-code {
        background: #1a1917;
        border: 1px solid rgba(200, 184, 154, 0.12);
        border-radius: 8px;
        padding: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: #f0ece4;
        line-height: 1.45;
      }
      #forma-agent-panel .forma-scroll-mono {
        font-family: 'JetBrains Mono', monospace;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureDeepProgressStyles() {
    if (document.getElementById('forma-deep-progress-styles')) return;
    const style = document.createElement('style');
    style.id = 'forma-deep-progress-styles';
    style.textContent = `
      @keyframes forma-spin { to { transform: rotate(360deg); } }
      #forma-deep-progress-panel {
        width: min(380px, calc(100vw - 48px));
        background: #1c1a17;
        border: 1px solid rgba(200, 184, 154, 0.12);
        border-radius: 10px;
        padding: 16px;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 250ms ease-out, transform 250ms ease-out;
      }
      #forma-deep-progress-panel.forma-open {
        opacity: 1;
        transform: translateY(0);
      }
      #forma-deep-progress-panel.forma-hide {
        opacity: 0;
        transform: translateY(-4px);
      }
      #forma-deep-progress-panel .forma-agent-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px solid rgba(200, 184, 154, 0.06);
      }
      #forma-deep-progress-panel .forma-agent-row:last-child {
        border-bottom: none;
      }
    `;
    document.head.appendChild(style);
  }

  function initializeDeepAnalysisSession(prompt) {
    deepAnalysisSession = {
      prompt,
      timerIds: [],
      abortController: null,
      responseData: null,
      timelineDone: false,
      responseDone: false,
      cancelled: false,
      errorMessage: '',
      rows: DEEP_AGENT_TIMELINE.map((item) => ({
        ...item,
        state: 'pending',
        timing: ''
      }))
    };
  }

  function clearDeepAnalysisTimers() {
    if (!deepAnalysisSession) return;
    deepAnalysisSession.timerIds.forEach((id) => clearTimeout(id));
    deepAnalysisSession.timerIds = [];
  }

  function updateDeepRowDom(row) {
    const iconEl = formaScoreBadge && formaScoreBadge.querySelector(`#forma-row-icon-${row.id}`);
    const nameEl = formaScoreBadge && formaScoreBadge.querySelector(`#forma-row-name-${row.id}`);
    const timingEl = formaScoreBadge && formaScoreBadge.querySelector(`#forma-row-timing-${row.id}`);
    if (!iconEl || !nameEl || !timingEl) return;

    if (row.state === 'pending') {
      iconEl.innerHTML = '<span style="font-size:14px;color:#6b6560;">○</span>';
      nameEl.style.color = '#a0998c';
      timingEl.textContent = '';
    } else if (row.state === 'running') {
      iconEl.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid transparent;border-top:2px solid #c8b89a;border-radius:50%;animation:forma-spin 700ms linear infinite;"></span>';
      nameEl.style.color = '#f0ece4';
      timingEl.textContent = '...';
      timingEl.style.color = '#a0998c';
    } else {
      iconEl.innerHTML = '<span style="font-size:14px;color:#4ade80;">✓</span>';
      nameEl.style.color = '#f0ece4';
      timingEl.textContent = row.timing;
      timingEl.style.color = '#a0998c';
    }
  }

  function setDeepRowState(rowId, nextState) {
    if (!deepAnalysisSession || deepAnalysisSession.cancelled) return;
    const row = deepAnalysisSession.rows.find((r) => r.id === rowId);
    if (!row) return;
    row.state = nextState;
    if (nextState === 'complete') row.timing = (row.endMs / 1000).toFixed(1) + 's';
    updateDeepRowDom(row);
  }

  function maybeFinalizeDeepAnalysis() {
    if (!deepAnalysisSession || deepAnalysisSession.cancelled) return;
    if (!deepAnalysisSession.timelineDone || !deepAnalysisSession.responseDone) return;
    const responseData = deepAnalysisSession.responseData;
    const promptText = deepAnalysisSession.prompt;
    hideDeepProgressPanel(() => {
      deepAnalysisLoading = false;
      deepAnalysisSession = null;
      updateFormaScoreBadge(targetTextarea ? targetTextarea.value : '', lastAIResponse || []);
      showAgentPanel(responseData, promptText);
    });
  }

  function startSimulatedDeepTimeline() {
    if (!deepAnalysisSession) return;
    clearDeepAnalysisTimers();
    deepAnalysisSession.rows.forEach((row) => {
      const startId = setTimeout(() => setDeepRowState(row.id, 'running'), row.startMs);
      const endId = setTimeout(() => setDeepRowState(row.id, 'complete'), row.endMs);
      deepAnalysisSession.timerIds.push(startId, endId);
    });
    const timelineDoneId = setTimeout(() => {
      if (!deepAnalysisSession || deepAnalysisSession.cancelled) return;
      deepAnalysisSession.timelineDone = true;
      maybeFinalizeDeepAnalysis();
    }, 41000);
    deepAnalysisSession.timerIds.push(timelineDoneId);
  }

  function hideDeepProgressPanel(onDone) {
    const panel = formaScoreBadge && formaScoreBadge.querySelector('#forma-deep-progress-panel');
    if (!panel) {
      if (onDone) onDone();
      return;
    }
    panel.classList.remove('forma-open');
    panel.classList.add('forma-hide');
    setTimeout(() => {
      if (onDone) onDone();
    }, 250);
  }

  function cancelDeepAnalysisAndRestore() {
    if (deepAnalysisSession) {
      deepAnalysisSession.cancelled = true;
      clearDeepAnalysisTimers();
      if (deepAnalysisSession.abortController) {
        deepAnalysisSession.abortController.abort();
      }
    }
    hideDeepProgressPanel(() => {
      deepAnalysisLoading = false;
      deepAnalysisError = '';
      deepAnalysisSession = null;
      updateFormaScoreBadge(targetTextarea ? targetTextarea.value : '', lastAIResponse || []);
    });
  }

  function failDeepAnalysis(message) {
    if (!deepAnalysisSession) return;
    clearDeepAnalysisTimers();
    deepAnalysisSession.errorMessage = message;
    deepAnalysisError = message;
    showFormaScoreBadge(
      parseInt(formaScoreBadge?.dataset.lastScore || '0', 10) || 0,
      formaScoreBadge?.dataset.lastLabel || 'Unknown',
      formaScoreBadge?.dataset.lastColor || '#6b6560'
    );
  }

  function closeAgentPanel() {
    if (!agentPanel) return;
    const panelToRemove = agentPanel;
    panelToRemove.classList.remove('forma-open');
    setTimeout(() => {
      if (panelToRemove.parentNode) panelToRemove.remove();
    }, 400);
    agentPanel = null;
    if (agentPanelEscListener) {
      document.removeEventListener('keydown', agentPanelEscListener);
      agentPanelEscListener = null;
    }
  }

  function logDeepAnalysisEvent(prompt, totalLatency, confidence) {
    fetch(LOG_EVENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'deep_analysis_run',
        payload: {
          prompt: prompt,
          latency_ms: totalLatency,
          confidence: confidence
        }
      })
    }).catch(() => {});
  }

  function showAgentPanel(data, promptText) {
    ensureAgentPanelStyles();
    closeAgentPanel();

    const agents = (data && data.agents) || {};
    const meta = (data && data.metadata) || {};
    const consensus = agents.consensus || {};
    const critic = agents.critic || {};
    const reformulator = agents.reformulator || {};
    const style = agents.style || {};
    const memory = agents.memory || {};
    const coach = agents.coach || {};
    const detector = agents.detector || {};

    const confidence = Number(consensus.confidence_score || 0);
    const confidenceColor = getTierColor(confidence);
    const criticScore = Number(critic.score || 0);
    const criticColor = getTierColor(criticScore);
    const totalLatency = Number(meta.total_latency_ms || 0);
    const aligned = Number(consensus.agents_aligned || 0);

    const panel = document.createElement('div');
    panel.id = 'forma-agent-panel';
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
        <div>
          <div style="font-family:'DM Serif Display',serif;font-size:22px;color:#f0ece4;line-height:1.1;">Deep Analysis</div>
          <div style="margin-top:6px;font-size:11px;color:#a0998c;text-transform:uppercase;letter-spacing:0.08em;">7-Agent Multi-Agent Consensus</div>
        </div>
        <button class="forma-close" aria-label="Close deep analysis panel">×</button>
      </div>
      <div class="forma-scroll-mono" style="margin-top:12px;font-size:10px;color:#6b6560;line-height:1.45;">
        Llama 3.1 70B AWQ • AMD MI300X 192GB HBM3 • vLLM 0.17.1 ROCm 7.0<br/>
        Completed in ${formatLatencyMs(totalLatency)}s
      </div>
      <div class="forma-consensus-card">
        <div class="forma-scroll-mono" style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#c8b89a;margin-bottom:10px;">CONSENSUS</div>
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:64px;height:64px;border-radius:50%;border:2px solid rgba(200,184,154,0.25);display:flex;align-items:center;justify-content:center;position:relative;">
            <svg width="64" height="64" style="position:absolute;top:0;left:0;transform:rotate(-90deg);">
              <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(200,184,154,0.15)" stroke-width="2"></circle>
              <circle cx="32" cy="32" r="30" fill="none" stroke="${confidenceColor}" stroke-width="2.5" stroke-dasharray="188.5" stroke-dashoffset="${188.5 - (Math.max(0, Math.min(100, confidence)) / 100) * 188.5}" stroke-linecap="round"></circle>
            </svg>
            <div id="forma-consensus-score" style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${confidenceColor};position:relative;">0</div>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-family:'DM Serif Display',serif;font-size:14px;color:#f0ece4;line-height:1.35;">${escapeHtml(consensus.primary_recommendation || 'No recommendation returned.')}</div>
            <div style="margin-top:6px;font-size:11px;color:#a0998c;">${aligned} of 6 agents aligned</div>
          </div>
        </div>
        <div style="margin-top:10px;font-size:12px;color:#a0998c;font-style:italic;line-height:1.4;">${escapeHtml(consensus.reasoning || 'No reasoning returned.')}</div>
      </div>
      <div id="forma-agent-cards">
        <div class="forma-agent-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="font-family:'DM Serif Display',serif;font-size:14px;">🧪 Critic</div>
            <div class="forma-scroll-mono" style="font-size:10px;color:#4ade80;">✓ COMPLETE</div>
          </div>
          <div style="display:flex;align-items:baseline;gap:8px;">
            <div style="font-family:'DM Serif Display',serif;font-size:24px;color:${criticColor};">${Number.isFinite(criticScore) ? criticScore : '?'}</div>
            <div style="font-size:12px;color:#a0998c;">${escapeHtml(critic.tier || '')}</div>
          </div>
          <div style="margin-top:8px;font-size:12px;color:#a0998c;">Weakness: ${escapeHtml((critic.weaknesses && critic.weaknesses[0]) || '—')}</div>
          <div style="font-size:12px;color:#f0ece4;margin-top:4px;">Suggestion: ${escapeHtml((critic.suggestions && critic.suggestions[0]) || '—')}</div>
        </div>
        <div class="forma-agent-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="font-family:'DM Serif Display',serif;font-size:14px;">✍️ Reformulator</div>
            <div class="forma-scroll-mono" style="font-size:10px;color:#4ade80;">✓ COMPLETE</div>
          </div>
          <div style="font-size:10px;color:#6b6560;text-transform:uppercase;letter-spacing:0.08em;">ORIGINAL</div>
          <div style="font-size:12px;color:#a0998c;text-decoration:line-through;margin-top:4px;">${escapeHtml(reformulator.original || promptText || '—')}</div>
          <div style="font-size:10px;color:#c8b89a;text-transform:uppercase;letter-spacing:0.08em;margin-top:8px;">REFORMULATED</div>
          <div style="margin-top:4px;background:rgba(200,184,154,0.06);border:1px solid rgba(200,184,154,0.12);border-radius:8px;padding:8px;font-size:12px;line-height:1.4;">${escapeHtml(reformulator.reformulated || '—')}</div>
        </div>
        <div class="forma-agent-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="font-family:'DM Serif Display',serif;font-size:14px;">🎨 Style</div>
            <div class="forma-scroll-mono" style="font-size:10px;color:#4ade80;">✓ COMPLETE</div>
          </div>
          <div style="height:8px;background:#1a1917;border-radius:999px;overflow:hidden;border:1px solid rgba(200,184,154,0.12);">
            <div style="height:100%;width:${Math.max(0, Math.min(100, Number(style.alignment_score || 0)))}%;background:linear-gradient(90deg,#c8b89a,#4ade80);"></div>
          </div>
          <div style="margin-top:6px;font-size:11px;color:#a0998c;">Alignment ${Number(style.alignment_score || 0)}%</div>
          <div style="margin-top:6px;font-size:12px;color:#f0ece4;">${escapeHtml((style.matching_preferences && style.matching_preferences[0]) || 'No matching preference found.')}</div>
        </div>
        <div class="forma-agent-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="font-family:'DM Serif Display',serif;font-size:14px;">🧠 Memory</div>
            <div class="forma-scroll-mono" style="font-size:10px;color:#4ade80;">✓ COMPLETE</div>
          </div>
          <div style="font-size:12px;color:#f0ece4;line-height:1.4;">${escapeHtml(memory.key_insight || 'No memory insight returned.')}</div>
          <div style="margin-top:6px;font-size:11px;color:#a0998c;">Consistency: ${escapeHtml(memory.cross_builder_consistency || '—')}</div>
        </div>
        <div class="forma-agent-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="font-family:'DM Serif Display',serif;font-size:14px;">🛠️ Coach</div>
            <div style="display:inline-flex;align-items:center;gap:4px;">
              <span class="forma-scroll-mono" style="font-size:9px;padding:2px 6px;border-radius:999px;background:rgba(200,184,154,0.08);border:1px solid rgba(200,184,154,0.12);color:#c8b89a;">${escapeHtml((coach.priority || 'medium').toUpperCase())}</span>
              <span class="forma-scroll-mono" style="font-size:10px;color:#4ade80;">✓ COMPLETE</span>
            </div>
          </div>
          <div class="forma-coach-code">${escapeHtml((coach.iteration_fragments && coach.iteration_fragments[0] && coach.iteration_fragments[0].fragment) || 'No iteration fragment returned.')}</div>
        </div>
        <div class="forma-agent-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="font-family:'DM Serif Display',serif;font-size:14px;">🧭 Detector</div>
            <div class="forma-scroll-mono" style="font-size:10px;color:#4ade80;">✓ COMPLETE</div>
          </div>
          <div style="font-size:12px;color:#a0998c;">Detected vague phrase:</div>
          <div style="font-size:12px;color:#f0ece4;margin-top:4px;">${escapeHtml((detector.phrases_found && detector.phrases_found[0]) || (detector.detections && detector.detections[0] && detector.detections[0].phrase) || 'None detected')}</div>
          <div style="font-size:12px;color:#c8b89a;margin-top:6px;">Canonical replacement: ${escapeHtml((detector.detections && detector.detections[0] && detector.detections[0].term) || 'See reformulator recommendation')}</div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    agentPanel = panel;

    requestAnimationFrame(() => panel.classList.add('forma-open'));

    const closeBtn = panel.querySelector('.forma-close');
    if (closeBtn) closeBtn.addEventListener('click', closeAgentPanel);

    agentPanelEscListener = (e) => {
      if (e.key === 'Escape') closeAgentPanel();
    };
    document.addEventListener('keydown', agentPanelEscListener);

    const cards = panel.querySelectorAll('.forma-agent-card');
    cards.forEach((card, idx) => {
      setTimeout(() => card.classList.add('forma-card-visible'), idx * 50);
    });

    const scoreEl = panel.querySelector('#forma-consensus-score');
    if (scoreEl) {
      const target = Math.max(0, Math.min(100, confidence));
      const start = performance.now();
      const duration = 600;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        scoreEl.textContent = String(Math.round(target * t));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    logDeepAnalysisEvent(promptText || '', totalLatency, confidence);
  }

  async function runDeepAnalysisFromBadge() {
    if (deepAnalysisLoading && deepAnalysisSession && !deepAnalysisSession.errorMessage) return;
    if (!targetTextarea) return;
    const prompt = (targetTextarea.value || '').trim();
    if (!prompt) {
      deepAnalysisError = 'Enter prompt first';
      updateFormaScoreBadge(targetTextarea.value || '', lastAIResponse || []);
      return;
    }

    deepAnalysisLoading = true;
    deepAnalysisError = '';
    initializeDeepAnalysisSession(prompt);
    showFormaScoreBadge(
      parseInt(formaScoreBadge?.dataset.lastScore || '0', 10) || computeFormaScore(prompt, []).score,
      formaScoreBadge?.dataset.lastLabel || 'Analyzing',
      formaScoreBadge?.dataset.lastColor || '#c8b89a'
    );
    startSimulatedDeepTimeline();

    const controller = new AbortController();
    deepAnalysisSession.abortController = controller;
    try {
      const res = await fetch(RUN_ALL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt }),
        signal: controller.signal
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!deepAnalysisSession || deepAnalysisSession.cancelled) return;
      deepAnalysisSession.responseData = data;
      deepAnalysisSession.responseDone = true;
      maybeFinalizeDeepAnalysis();
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      console.error('[Forma Deep] Analysis failed:', err);
      failDeepAnalysis('Analysis failed - try again');
    }
  }

  function showFormaScoreBadge(score, label, color) {
    if (!targetTextarea) return;
    
    if (!formaScoreBadge) {
      formaScoreBadge = document.createElement('div');
      formaScoreBadge.id = 'forma-score-badge';
      Object.assign(formaScoreBadge.style, {
        position: 'absolute',
        zIndex: '9998',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        background: '#1c1a17',
        border: '0.5px solid rgba(200,184,154,0.3)',
        borderRadius: '8px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        pointerEvents: 'auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'border-color 0.2s ease'
      });
      document.body.appendChild(formaScoreBadge);
    }

    formaScoreBadge.dataset.lastScore = String(score);
    formaScoreBadge.dataset.lastLabel = label;
    formaScoreBadge.dataset.lastColor = color;
    
    ensureDeepProgressStyles();
    const showProgressPanel = deepAnalysisLoading && deepAnalysisSession;
    const buttonText = '⚡ Run Full Analysis';
    const disabledAttr = '';
    const errorHtml = deepAnalysisError
      ? `<div style="font-size:10px;color:#ef4444;margin-top:4px;width:100%;">${escapeHtml(deepAnalysisError)}</div>`
      : '';

    const progressPanelHtml = showProgressPanel
      ? (deepAnalysisSession.errorMessage
        ? `
          <div id="forma-deep-progress-panel" class="forma-open" style="position:relative;margin-top:8px;">
            <div style="font-size:13px;color:#ef4444;margin-bottom:12px;">Analysis failed - try again</div>
            <button id="forma-deep-retry" style="font-size:12px;background:transparent;border:1px solid #c8b89a;color:#c8b89a;padding:6px 10px;border-radius:8px;cursor:pointer;transition:all 0.2s ease;">⚡ Run Full Analysis</button>
          </div>
        `
        : `
          <div id="forma-deep-progress-panel" style="position:relative;margin-top:8px;">
            <button id="forma-deep-close" style="position:absolute;top:2px;right:2px;font-size:16px;background:transparent;border:none;color:#6b6560;cursor:pointer;line-height:1;">×</button>
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#c8b89a;margin-bottom:4px;">DEEP ANALYSIS RUNNING</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#6b6560;margin-bottom:12px;">7 agents • Llama 3.1 70B • AMD MI300X</div>
            ${deepAnalysisSession.rows.map((row) => `
              <div class="forma-agent-row" data-row-id="${row.id}">
                <div id="forma-row-icon-${row.id}" style="width:14px;display:flex;justify-content:center;">○</div>
                <div id="forma-row-name-${row.id}" style="flex:1;font-family:'DM Serif Display',serif;font-size:13px;color:#a0998c;">${row.label}</div>
                <div id="forma-row-timing-${row.id}" style="width:48px;text-align:right;font-family:'JetBrains Mono',monospace;font-size:10px;color:#a0998c;"></div>
              </div>
            `).join('')}
          </div>
        `)
      : '';

    formaScoreBadge.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="font-size:8px;color:#6b6560;letter-spacing:0.12em;text-transform:uppercase;">FORMA</div>
        <div style="font-size:18px;font-family:'DM Serif Display', Georgia, serif;color:${color};line-height:1;font-weight:600;">${score}</div>
        <div style="font-size:9px;color:#6b6560;font-family:'JetBrains Mono', monospace;">/100</div>
        <div style="font-size:10px;color:${color};letter-spacing:0.03em;font-weight:500;">${label}</div>
      </div>
      ${showProgressPanel ? '' : `<button id="forma-run-full-analysis" ${disabledAttr} style="margin-left:4px;font-size:12px;background:transparent;border:1px solid #c8b89a;color:#c8b89a;padding:6px 10px;border-radius:8px;cursor:pointer;transition:all 0.2s ease;white-space:nowrap;">${buttonText}</button>`}
      ${progressPanelHtml}
      ${errorHtml}
    `;
    formaScoreBadge.style.borderColor = color === '#6b6560' ? 'rgba(200,184,154,0.3)' : color;
    formaScoreBadge.style.display = 'flex';
    formaScoreBadge.style.flexWrap = 'wrap';
    positionFormaScoreBadge();

    const runBtn = formaScoreBadge.querySelector('#forma-run-full-analysis');
    if (runBtn && !showProgressPanel) {
      runBtn.addEventListener('mouseenter', () => {
        runBtn.style.background = 'rgba(200, 184, 154, 0.08)';
      });
      runBtn.addEventListener('mouseleave', () => {
        runBtn.style.background = 'transparent';
        runBtn.style.transform = 'scale(1)';
      });
      runBtn.addEventListener('mousedown', () => {
        runBtn.style.transform = 'scale(0.98)';
      });
      runBtn.addEventListener('mouseup', () => {
        runBtn.style.transform = 'scale(1)';
      });
      runBtn.addEventListener('click', runDeepAnalysisFromBadge);
    }

    if (showProgressPanel && deepAnalysisSession && !deepAnalysisSession.errorMessage) {
      const progressPanel = formaScoreBadge.querySelector('#forma-deep-progress-panel');
      if (progressPanel) requestAnimationFrame(() => progressPanel.classList.add('forma-open'));
      const closeBtn = formaScoreBadge.querySelector('#forma-deep-close');
      if (closeBtn) closeBtn.addEventListener('click', cancelDeepAnalysisAndRestore);
      deepAnalysisSession.rows.forEach((row) => updateDeepRowDom(row));
    }

    if (showProgressPanel && deepAnalysisSession && deepAnalysisSession.errorMessage) {
      const retryBtn = formaScoreBadge.querySelector('#forma-deep-retry');
      if (retryBtn) {
        retryBtn.addEventListener('mouseenter', () => {
          retryBtn.style.background = 'rgba(200, 184, 154, 0.08)';
        });
        retryBtn.addEventListener('mouseleave', () => {
          retryBtn.style.background = 'transparent';
        });
        retryBtn.addEventListener('click', () => {
          deepAnalysisSession = null;
          deepAnalysisError = '';
          deepAnalysisLoading = false;
          runDeepAnalysisFromBadge();
        });
      }
    }
  }

  function positionFormaScoreBadge() {
    if (!formaScoreBadge || !targetTextarea) return;
    const rect = targetTextarea.getBoundingClientRect();
    // Position below the textarea, anchored to LEFT edge so it never
    // overlaps with the host site's send button (typically right side).
    formaScoreBadge.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    formaScoreBadge.style.right = 'auto';
    formaScoreBadge.style.left = (rect.left + window.scrollX) + 'px';
  }

  function hideFormaScoreBadge() {
    if (formaScoreBadge) formaScoreBadge.style.display = 'none';
  }

  function updateFormaScoreBadge(text, detectedTerms) {
    if (!text || text.trim().length < 3) {
      hideFormaScoreBadge();
      return;
    }
    if (deepAnalysisLoading && deepAnalysisSession && !deepAnalysisSession.errorMessage) return;
    const result = computeFormaScore(text, detectedTerms || []);
    showFormaScoreBadge(result.score, result.label, result.color);
  }

  // Debounce timer for AI mode
  let aiDebounceTimer = null;
  function scheduleAIAnalysis(text, onComplete) {
    if (aiDebounceTimer) clearTimeout(aiDebounceTimer);
    aiDebounceTimer = setTimeout(() => {
      fetchAIPhrases(text, onComplete);
    }, 800);
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

    // Branch detection based on mode
    let matches;
    if (DETECTION_MODE === "ai") {
      matches = detectPhrasesAI(text);
      // Schedule async AMD call to update phrases (with debounce)
      scheduleAIAnalysis(text, (newPhrases) => {
        // Re-render overlay when new phrases arrive
        renderOverlayWithPhrases(textarea, newPhrases);
      });
    } else {
      matches = detectPhrases(text);
    }

    renderOverlayWithPhrases(textarea, matches);
  }

  function renderOverlayWithPhrases(textarea, matches) {
    if (!overlay) return;
    const text = textarea.value;

    // Detect MASSIVE edit (paste/delete-all): if text length changed by 200+ chars, clear.
    // Smaller changes (including Pro Mode insertions which add ~80 chars) preserve spans.
    if (Math.abs(text.length - lastTextValue.length) > 200) {
      acceptedSpans = [];
    }
    lastTextValue = text;
    
    // Validate accepted spans against current text (they're stale if text shifted)
    acceptedSpans = acceptedSpans.filter(span => {
      const currentSlice = text.substring(span.start, span.end);
      return currentSlice === span.text;
    });
    
    // Filter out matches that fall inside an accepted span
    matches = matches.filter(match => {
      for (const span of acceptedSpans) {
        // Match overlaps with accepted span — skip it
        if (match.start < span.end && match.end > span.start) {
          return false;
        }
      }
      return true;
    });

    if (matches.length === 0) {
      overlay.innerHTML = '';
      return;
    }

    let html = '';
    let cursor = 0;
    for (const match of matches) {
      // For AI mode, the match object has more fields (term, definition, etc.)
      // We only use phrase, start, end for rendering; rest is in dataset
      html += escapeHtml(text.substring(cursor, match.start));

      // Encode the full match data for AI mode (so hover doesn't need another API call)
      const dataAttr = (DETECTION_MODE === "ai" && match.term)
        ? ' data-ai-cached="true"'
        : '';

      html += '<span class="forma-underline" data-phrase="' +
              escapeAttr(match.phrase) + '" data-start="' + match.start +
              '" data-end="' + match.end + '"' + dataAttr + ' style="' +
              'border-bottom: 1.5px dotted #c8b89a; ' +
              'pointer-events: auto; cursor: pointer; color: transparent;' +
              '">' + escapeHtml(match.phrase) + '</span>';
      cursor = match.end;
    }
    html += escapeHtml(text.substring(cursor));
    overlay.innerHTML = html;
    overlay.scrollTop = textarea.scrollTop;

    // Attach hover handlers
    overlay.querySelectorAll('.forma-underline').forEach(span => {
      span.addEventListener('mouseenter', handleHover);
      span.addEventListener('mouseleave', handleHoverEnd);
    });

    // For AI mode: pre-populate phraseCache with the full data from AMD
    if (DETECTION_MODE === "ai") {
      for (const match of matches) {
        if (match.term && match.phrase) {
          // Store in phraseCache so handleHover finds it instantly
          phraseCache.set(match.phrase, {
            term: match.term,
            definition: match.definition,
            category: match.category,
            alternatives: match.alternatives || [],
            latency: 0  // AI mode latency is at the analyze call, not per-hover
          });
        }
      }
    }
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

  let renderToken = 0;
  async function renderTooltipContent(data) {
    const myToken = ++renderToken;
    // If an alternative is selected, show that as the primary term
    const displayTerm = selectedAlternative ? selectedAlternative.term : data.term;
    const displayDefinition = selectedAlternative ? selectedAlternative.description : data.definition;
    const animation = findAnimation(displayTerm);
    
    // Fetch Pro expansion for the current display term
    let proData = { pro_expansion: displayTerm, has_pro_template: false };
    if (proMode) {
      proData = await fetchProExpansion(displayTerm);
      // Bail if another render started while we were awaiting
      if (myToken !== renderToken) return;
    }
    
    // The text that gets inserted on Accept
    const insertionText = proMode && proData.has_pro_template ? proData.pro_expansion : displayTerm;
    
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
    
    // Pro Mode toggle pills
    const toggleHtml = `
      <div style="display:inline-flex;align-items:center;background:#141412;border:0.5px solid #2a2825;border-radius:6px;padding:2px;gap:2px;">
        <div id="forma-mode-quick" style="padding:3px 10px;border-radius:4px;font-size:10px;cursor:pointer;letter-spacing:0.03em;font-weight:500;${!proMode ? 'background:#c8b89a;color:#0a0a09;' : 'color:#6b6560;'}">QUICK</div>
        <div id="forma-mode-pro" style="padding:3px 10px;border-radius:4px;font-size:10px;cursor:pointer;letter-spacing:0.03em;font-weight:500;${proMode ? 'background:#c8b89a;color:#0a0a09;' : 'color:#6b6560;'}">PRO</div>
      </div>
    `;
    
    // Pro expansion preview (only shown in Pro mode)
    const proPreviewHtml = (proMode && proData.has_pro_template)
      ? `<div style="margin:0 14px 10px;padding:10px 12px;background:rgba(200,184,154,0.06);border:0.5px solid rgba(200,184,154,0.2);border-radius:6px;">
          <div style="font-size:9px;color:#c8b89a;letter-spacing:0.08em;margin-bottom:4px;font-weight:600;">PRO EXPANSION</div>
          <div style="font-size:11px;color:#f0ece4;line-height:1.45;font-family:'JetBrains Mono', monospace;">${escapeHtml(proData.pro_expansion)}</div>
        </div>`
      : (proMode && !proData.has_pro_template)
      ? `<div style="margin:0 14px 10px;padding:8px 12px;background:rgba(239,68,68,0.04);border:0.5px solid rgba(239,68,68,0.15);border-radius:6px;">
          <div style="font-size:10px;color:#a0998c;line-height:1.4;">No Pro template available for this term yet. Quick mode will be used.</div>
        </div>`
      : '';
    
    // Truncate insertion text for button label
    const buttonLabel = insertionText.length > 35 
      ? `Accept "${escapeHtml(insertionText.substring(0, 32))}..."` 
      : `Accept "${escapeHtml(insertionText)}"`;
    
    tooltip.innerHTML = `
      <div style="padding:10px 14px;border-bottom:0.5px solid #2a2825;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:10px;color:#c8b89a;letter-spacing:0.05em;font-weight:500;">FORMA SUGGESTS</div>
        ${toggleHtml}
      </div>
      <div style="padding:12px 14px 8px;">
        <div style="font-size:18px;font-weight:600;color:#f5f3ef;margin-bottom:4px;line-height:1.2;">${escapeHtml(displayTerm)}</div>
        <div style="font-size:12px;color:#a0998c;line-height:1.4;">${escapeHtml(displayDefinition || '')}</div>
        ${resetPillHtml}
      </div>
      ${animationHtml}
      ${proPreviewHtml}
      <div style="padding:8px 14px;display:flex;gap:6px;">${altsHtml}</div>
      <div style="padding:10px 14px;display:flex;gap:8px;border-top:0.5px solid #2a2825;">
        <button id="forma-accept" style="flex:1;padding:8px;background:#c8b89a;color:#0a0a09;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">${buttonLabel}</button>
        <button id="forma-skip" style="padding:8px 14px;background:transparent;color:#6b6560;border:0.5px solid #2a2825;border-radius:6px;font-size:12px;cursor:pointer;font-family:inherit;">Skip</button>
      </div>
      <div style="padding:8px 14px;background:rgba(74,222,128,0.04);border-top:0.5px solid rgba(74,222,128,0.1);display:flex;align-items:center;gap:6px;">
        <div style="width:5px;height:5px;border-radius:50%;background:#4ade80;animation:forma-pulse 1.5s ease-in-out infinite;"></div>
        <div style="font-size:10px;color:#4ade80;font-family:monospace;">Llama 3.1 8B · AMD MI300X · ${data.latency || '?'}ms · Mode: ${proMode ? 'PRO' : 'QUICK'}</div>
      </div>
    `;
    
    // Store insertion text on tooltip for handleAccept to use
    tooltip.dataset.insertionText = insertionText;
    
    // Wire up Pro mode toggle
    const quickBtn = tooltip.querySelector('#forma-mode-quick');
    const proBtn = tooltip.querySelector('#forma-mode-pro');
    if (quickBtn) {
      quickBtn.addEventListener('click', () => {
        if (proMode) {
          proMode = false;
          renderTooltipContent(currentResponse);
        }
      });
    }
    if (proBtn) {
      proBtn.addEventListener('click', () => {
        if (!proMode) {
          proMode = true;
          renderTooltipContent(currentResponse);
        }
      });
    }
    
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
    
    // Wire up accept — capture span + text at render time so they can't go stale
    const acceptBtn = tooltip.querySelector('#forma-accept');
    const capturedSpan = currentSpan;
    const capturedInsertionText = insertionText;
    const capturedPhrase = currentSpan ? currentSpan.dataset.phrase : null;
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        handleAcceptWithCapture(capturedSpan, capturedInsertionText, capturedPhrase);
      });
    }
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
    // Legacy path — delegates to capture-aware version using current state
    handleAcceptWithCapture(
      currentSpan,
      tooltip.dataset.insertionText || (selectedAlternative ? selectedAlternative.term : currentResponse.term),
      currentSpan ? currentSpan.dataset.phrase : null
    );
  }

  function handleAcceptWithCapture(span, replacement, expectedPhrase) {
    if (!span || !targetTextarea || !replacement) {
      console.warn('[Forma] Accept aborted: missing span/textarea/replacement');
      return;
    }
    let start = parseInt(span.dataset.start);
    let end = parseInt(span.dataset.end);
    if (isNaN(start) || isNaN(end)) {
      console.warn('[Forma] Accept aborted: bad start/end');
      return;
    }
    
    const text = targetTextarea.value;
    
    // VALIDATE: text at [start, end) must match the expected phrase.
    const actualSlice = text.substring(start, end);
    if (expectedPhrase && actualSlice !== expectedPhrase) {
      console.warn('[Forma] Accept aborted: position drift. Expected "' + expectedPhrase + '" at [' + start + ',' + end + '), found "' + actualSlice + '"');
      hideTooltip();
      return;
    }
    
    // CHECK: Is this acceptance happening INSIDE an existing Pro span?
    // If yes, expand replacement to cover the entire Pro span (term + specs).
    let enclosingSpanIndex = -1;
    for (let i = 0; i < acceptedSpans.length; i++) {
      const aSpan = acceptedSpans[i];
      // Verify the accepted span is still valid in current text
      const sliceCheck = text.substring(aSpan.start, aSpan.end);
      if (sliceCheck !== aSpan.text) continue;
      
      // Is the new accept's range INSIDE this acceptedSpan?
      if (start >= aSpan.start && end <= aSpan.end) {
        enclosingSpanIndex = i;
        // Expand the replacement range to cover the entire Pro span
        start = aSpan.start;
        end = aSpan.end;
        console.log('[Forma] Accept replaces entire Pro span [' + start + ',' + end + ')');
        break;
      }
    }
    
    const newText = text.substring(0, start) + replacement + text.substring(end);
    targetTextarea.value = newText;
    
    // Update acceptedSpans
    const newEnd = start + replacement.length;
    const lengthDiff = replacement.length - (end - start);
    
    // Remove the enclosing span (we replaced it) and adjust positions of others
    acceptedSpans = acceptedSpans
      .filter((_, i) => i !== enclosingSpanIndex)
      .map(s => {
        if (s.start >= end) {
          return { ...s, start: s.start + lengthDiff, end: s.end + lengthDiff };
        }
        return s;
      });
    
    // Add the new accepted span
    acceptedSpans.push({ start: start, end: newEnd, text: replacement });
    
    targetTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    targetTextarea.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Log acceptance to Design Intelligence Layer
    if (currentResponse) {
      logAcceptance(
        expectedPhrase || (span.dataset.phrase),
        currentResponse.term,
        selectedAlternative ? selectedAlternative.term : null
      );
    }
    
    hideTooltip();
    positionOverlay(targetTextarea);
    renderOverlay(targetTextarea);
    
    console.log('[Forma] Accepted: "' + replacement + '" at [' + start + ',' + newEnd + ')');
  }

  function handleSkip() {
    if (!currentPhrase) return;
    skippedPhrases.add(currentPhrase.toLowerCase());
    
    // Log skip to Design Intelligence Layer
    const term = currentResponse ? currentResponse.term : currentPhrase;
    logSkip(currentPhrase, term);
    
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
      // Update Forma Score badge based on current text
      const currentText = targetTextarea.value;
      const detectedTerms = lastAIResponse 
        ? [...new Set(lastAIResponse.map(p => p.term).filter(Boolean))]
        : [];
      updateFormaScoreBadge(currentText, detectedTerms);
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
          const currentText = targetTextarea.value;
          const detectedTerms = lastAIResponse 
            ? [...new Set(lastAIResponse.map(p => p.term).filter(Boolean))]
            : [];
          updateFormaScoreBadge(currentText, detectedTerms);
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
