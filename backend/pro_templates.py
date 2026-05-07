"""
Forma Pro Mode — Canonical component templates with motion specs,
position defaults, and library hints. Each canonical term maps to a
short engineered prompt fragment that an AI builder LLM can use directly.

Templates are intentionally short (1-2 sentences) to feel natural, not
robotic. They add the layer that vague prompts miss: anchor, motion
timing, and key implementation details.
"""

PRO_TEMPLATES = {
    # === NAVIGATION ===
    "Sticky Navbar": "Sticky Navbar (sticky top-0, z-50, backdrop-blur on scroll, 64px height)",
    "Hamburger Menu": "Hamburger Menu (animated 3-line to X transition, 200ms ease-out, opens Off-Canvas Drawer)",
    "Breadcrumb": "Breadcrumb trail (chevron separator, last item bold, hover underline transition)",
    "Side Navigation": "Side Navigation (256px width, collapsible to 64px icons-only, smooth 250ms transition)",
    "Tab Bar": "Tab Bar (animated underline indicator, 200ms slide between tabs, keyboard-accessible)",
    "Pagination": "Pagination (numbered with prev/next chevrons, current page highlighted, ellipsis for skipped ranges)",
    "Stepper": "Stepper (numbered circles with progress line, completed steps filled, current step pulsing)",
    
    # === OVERLAYS & POPOVERS ===
    "Glassmorphic Popover": "Glassmorphic Popover (backdrop-filter: blur(12px), semi-transparent bg, 200ms fade-in ease-out)",
    "Modal Dialog": "Modal Dialog (centered, backdrop overlay opacity 0.6, 250ms scale-in 0.95→1 ease-out)",
    "Bottom Sheet": "Bottom Sheet (slides up from bottom edge, drag handle at top, 300ms spring animation)",
    "Off-Canvas Drawer": "Off-Canvas Drawer (slides from right edge, 320px width, 250ms ease-in-out, semi-transparent backdrop)",
    "Tooltip": "Tooltip (small, 12px text, dark bg, 100ms fade-in on hover with 500ms delay)",
    "Context Menu": "Context Menu (appears at cursor position on right-click, 150ms fade-in, dismiss on outside click)",
    "Confirmation Dialog": "Confirmation Dialog (small modal with destructive action red, cancel secondary, 200ms scale-in)",
    
    # === FEEDBACK & STATUS ===
    "Toast Notification": "Toast Notification (top-right anchor, 220ms slide-in ease-out, 4s auto-dismiss)",
    "Banner Alert": "Banner Alert (full-width, dismissible with X button, color-coded by severity)",
    "Snackbar": "Snackbar (bottom-center, slide up, 4s timeout, optional action button)",
    "Loading Spinner": "Loading Spinner (animated rotation, 1s linear infinite, sized to context)",
    "Progress Bar": "Progress Bar (full-width track with animated fill, smooth transition on value change)",
    "Skeleton Loader": "Skeleton Loader (shimmer animation, gradient sweep 1.5s infinite, matches content shape)",
    "Empty State": "Empty State (centered illustration, headline, subtext, primary CTA button)",
    "Status Badge": "Status Badge (small pill, color-coded, optional pulse animation for live status)",
    
    # === FORMS & INPUTS ===
    "Floating Label Input": "Floating Label Input (label animates from placeholder position to top on focus, 200ms ease-out)",
    "Search Bar": "Search Bar (icon prefix, clear button suffix, expands on focus, 200ms width transition)",
    "Toggle Switch": "Toggle Switch (rounded pill, animated thumb slide 200ms, color shift on state change)",
    "Segmented Control": "Segmented Control (pill group with sliding indicator, 200ms slide between segments)",
    "Date Picker": "Date Picker (calendar grid popup, month navigation, today highlighted, selected date filled)",
    "Time Picker": "Time Picker (hour/minute scrolls, 12/24h toggle, AM/PM segmented control)",
    "Color Picker": "Color Picker (saturation grid, hue slider, hex/rgb input, recent colors row)",
    "File Uploader": "File Uploader (dashed border drop zone, drag-active state highlight, file list with progress)",
    "Multi-Select Combobox": "Multi-Select Combobox (chip tags for selected, search input, dropdown with checkboxes)",
    "Slider": "Slider (track with filled portion, draggable thumb, value tooltip on drag)",
    "Password Strength Indicator": "Password Strength Indicator (4-segment bar, color-coded weak→strong, real-time feedback)",
    "OTP Input": "OTP Input (6 separate digit boxes, auto-advance on type, paste support)",
    
    # === DATA DISPLAY ===
    "Data Table": "Data Table (sortable column headers, sticky header on scroll, row hover highlight, pagination footer)",
    "Card Grid": "Card Grid (responsive auto-fill columns, gap 16px, hover lift transform on cards)",
    "Stat Card": "Stat Card (large number, label, optional trend indicator with arrow, subtle background)",
    "Avatar Stack": "Avatar Stack (overlapping circular avatars, -8px margin overlap, +N overflow indicator)",
    "Tag Group": "Tag Group (pill-shaped chips, color-coded categories, optional X to remove)",
    "Timeline": "Timeline (vertical line with milestone dots, alternating left/right content cards)",
    "Tree View": "Tree View (collapsible nested rows, chevron rotation 90deg on expand, indent per level)",
    "Kanban Board": "Kanban Board (horizontal columns, draggable cards, drop zone highlights on drag-over)",
    
    # === MEDIA & GALLERIES ===
    "Image Carousel": "Image Carousel (slide transition 300ms ease-out, dot indicators, prev/next chevrons)",
    "Lightbox": "Lightbox (fullscreen modal, click outside to close, prev/next keyboard arrows, image zoom)",
    "Video Player": "Video Player (custom controls, play/pause, scrubber bar, volume, fullscreen, picture-in-picture)",
    "Image Gallery": "Image Gallery (masonry grid layout, lazy-load on scroll, click to open Lightbox)",
    "Avatar": "Avatar (circular image with fallback initials, optional online status dot indicator)",
    
    # === LAYOUT & CONTAINERS ===
    "Hero Section": "Hero Section (large heading, subheading, primary CTA, optional background image with gradient overlay)",
    "Pricing Table": "Pricing Table (3-column comparison, popular tier highlighted with border + badge, feature list with checkmarks)",
    "Footer": "Footer (multi-column links, newsletter signup, social icons, copyright row)",
    "Bento Grid": "Bento Grid (asymmetric tile layout, varied tile sizes, hover scale 1.02 transform)",
    "Split Pane": "Split Pane (resizable divider, drag to adjust, min/max width constraints)",
    "Accordion": "Accordion (collapsible sections, chevron rotation on expand, 250ms height transition)",
    "Collapsible Panel": "Collapsible Panel (header always visible, body slides down on expand, chevron indicator)",
    
    # === INTERACTIONS ===
    "Command Palette": "Command Palette (centered modal triggered by Cmd+K, fuzzy search, keyboard navigation, recent items)",
    "Floating Action Button": "Floating Action Button (fixed bottom-right, 56px circle, primary color, optional speed-dial menu)",
    "Speed Dial": "Speed Dial (FAB that expands to vertical menu of secondary actions on hover/tap)",
    "Drag and Drop List": "Drag and Drop List (handle icon prefix, ghost preview while dragging, smooth reorder animation)",
    
    # === SOCIAL & ENGAGEMENT ===
    "Reaction Picker": "Reaction Picker (horizontal emoji row, scale-up animation on hover, count badge)",
    "Comment Thread": "Comment Thread (avatar + name + timestamp, nested replies indented, reply CTA inline)",
    "Like Button": "Like Button (heart icon, scale animation 1→1.2→1 on click, color fill on liked state)",
    "Follow Button": "Follow Button (toggle between Follow/Following, color shift on hover when following)",
    "Share Sheet": "Share Sheet (modal with social platform icons, copy link option, native share API on mobile)",
    "Notification Center": "Notification Center (bell icon with badge count, dropdown panel, grouped by date)",
}


def get_pro_expansion(canonical_term: str) -> str:
    """Get the Pro Mode expansion for a canonical term.
    
    Returns the engineered prompt fragment if a template exists,
    otherwise returns the term itself unchanged.
    """
    return PRO_TEMPLATES.get(canonical_term, canonical_term)


def has_pro_template(canonical_term: str) -> bool:
    """Check if a canonical term has a Pro template available."""
    return canonical_term in PRO_TEMPLATES
