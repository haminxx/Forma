"""
Seed Data Generator for Forma Design Intelligence Dashboard.

Generates realistic fake events across 60 canonical components.
Run after Railway redeploys (which wipes SQLite) to populate dashboard.

Usage:
    python seed_data.py   # Local
    POST /admin/seed       # On Railway
"""

import random
from datetime import datetime, timedelta
from db import SessionLocal, init_db, Event


CANONICAL_TERMS = [
    "Off-Canvas Drawer", "Glassmorphic Popover", "Masonry Grid",
    "Sticky Navbar", "Modal Overlay", "Skeleton Loader",
    "Tab Panel", "Accordion", "Toast Notification",
    "Breadcrumb Navigation", "Tooltip", "Dropdown Menu",
    "Progress Bar", "Bottom Sheet", "Confirmation Dialog",
    "Search Bar", "Toggle Switch", "Loading Spinner",
    "Floating Action Button", "Hero Section", "Card Grid",
    "Pagination Control", "Image Carousel", "Hamburger Menu",
    "Data Table", "Banner", "Sidebar Navigation",
    "Footer Section", "Step Progress Indicator", "Notification Badge",
    "Date Picker", "File Upload", "Rating Stars",
    "Color Picker", "Range Slider", "Form Input Field",
    "Login Form", "Avatar", "Empty State",
    "Chip Tag", "Separator", "Settings Panel",
    "Cookie Banner", "Comment Thread", "Stats Counter",
    "Testimonial Card", "Pricing Card", "Activity Feed",
    "Mega Menu", "Command Palette", "Notification Center",
    "Profile Dropdown", "OTP Input", "Tag Input",
    "Phone Input", "Search Suggestions", "Floating Label Input",
    "Switch Group", "Onboarding Tour", "Password Strength",
]

VAGUE_PHRASES_BY_TERM = {
    "Off-Canvas Drawer": ["sliding menu", "menu that slides from right", "side drawer"],
    "Glassmorphic Popover": ["frosted popup", "blurry popup", "glass popover"],
    "Masonry Grid": ["pinterest layout", "staggered grid", "image gallery"],
    "Sticky Navbar": ["sticky top bar", "fixed header", "pinned navigation"],
    "Modal Overlay": ["popup window", "modal dialog", "centered popup"],
    "Skeleton Loader": ["loading placeholder", "shimmer effect", "ghost loader"],
    "Tab Panel": ["tabbed interface", "switchable sections", "tab navigation"],
    "Accordion": ["expandable list", "collapsible panel", "fold-out sections"],
    "Toast Notification": ["snackbar", "notification toast", "popup alert"],
    "Breadcrumb Navigation": ["page trail", "navigation path", "breadcrumb"],
    "Tooltip": ["hover hint", "info tip", "help tooltip"],
    "Dropdown Menu": ["dropdown", "select menu", "options menu"],
    "Progress Bar": ["loading bar", "progress meter", "completion bar"],
    "Bottom Sheet": ["bottom drawer", "slide up panel", "bottom modal"],
    "Confirmation Dialog": ["yes no dialog", "alert dialog", "confirm popup"],
    "Search Bar": ["search box", "search field", "search input"],
    "Toggle Switch": ["on off switch", "binary toggle", "flip switch"],
    "Loading Spinner": ["spinner", "spinning loader", "circular loader"],
    "Floating Action Button": ["fab", "floating button", "corner action"],
    "Hero Section": ["hero banner", "splash section", "landing hero"],
    "Card Grid": ["card layout", "grid of cards", "tile layout"],
    "Pagination Control": ["page numbers", "page navigation", "pager"],
    "Image Carousel": ["image slider", "photo carousel", "rotating images"],
    "Hamburger Menu": ["three line menu", "hamburger icon", "menu button"],
    "Data Table": ["table view", "data grid", "spreadsheet"],
    "Banner": ["alert banner", "notification banner", "top banner"],
    "Sidebar Navigation": ["side menu", "left sidebar", "nav sidebar"],
    "Footer Section": ["page footer", "site footer", "bottom section"],
    "Step Progress Indicator": ["stepper", "progress steps", "wizard progress"],
    "Notification Badge": ["badge", "notification dot", "bell badge"],
    "Date Picker": ["calendar picker", "date selector", "calendar widget"],
    "File Upload": ["dropzone", "file uploader", "drag drop area"],
    "Rating Stars": ["star rating", "review stars", "5-star rating"],
    "Color Picker": ["color palette", "swatch picker", "color chooser"],
    "Range Slider": ["volume slider", "value slider", "range control"],
    "Form Input Field": ["text input", "input field", "form field"],
    "Login Form": ["sign in form", "auth form", "login screen"],
    "Avatar": ["profile picture", "user image", "profile photo"],
    "Empty State": ["no results", "blank state", "empty placeholder"],
    "Chip Tag": ["filter chip", "tag pill", "category chip"],
    "Separator": ["divider", "horizontal rule", "section divider"],
    "Settings Panel": ["preferences panel", "settings menu", "options panel"],
    "Cookie Banner": ["cookie consent", "privacy banner", "gdpr banner"],
    "Comment Thread": ["comment section", "reply thread", "discussion"],
    "Stats Counter": ["metric display", "kpi numbers", "stats showcase"],
    "Testimonial Card": ["review card", "customer quote", "user testimonial"],
    "Pricing Card": ["pricing tier", "plan card", "subscription card"],
    "Activity Feed": ["news feed", "timeline", "activity stream"],
    "Mega Menu": ["multi column menu", "wide dropdown", "category menu"],
    "Command Palette": ["cmd k menu", "quick search", "command bar"],
    "Notification Center": ["alerts panel", "notifications list", "alert tray"],
    "Profile Dropdown": ["user menu", "account dropdown", "avatar dropdown"],
    "OTP Input": ["verification code", "pin input", "2fa input"],
    "Tag Input": ["tags input", "chip input", "label input"],
    "Phone Input": ["phone number field", "country code input", "mobile input"],
    "Search Suggestions": ["search dropdown", "autocomplete", "live results"],
    "Floating Label Input": ["material input", "animated label", "modern input"],
    "Switch Group": ["toggle group", "multiple toggles", "switch panel"],
    "Onboarding Tour": ["product tour", "walkthrough", "guided tour"],
    "Password Strength": ["password meter", "strength indicator", "password gauge"],
}

SITES = [
    ("v0.app", 0.45),
    ("cursor.com", 0.20),
    ("replit.com", 0.15),
    ("base44.com", 0.10),
    ("lovable.dev", 0.05),
    ("bolt.new", 0.05),
]


def weighted_choice(weighted_items):
    items = [item for item, _ in weighted_items]
    weights = [weight for _, weight in weighted_items]
    return random.choices(items, weights=weights, k=1)[0]


def generate_events(count: int = 800):
    db = SessionLocal()
    now = datetime.utcnow()
    events_created = 0
    
    popular_terms = random.sample(CANONICAL_TERMS, 15)
    
    for _ in range(count):
        if random.random() < 0.7:
            term = random.choice(popular_terms)
        else:
            term = random.choice(CANONICAL_TERMS)
        
        phrases = VAGUE_PHRASES_BY_TERM.get(term, ["component"])
        phrase = random.choice(phrases)
        site = weighted_choice(SITES)
        days_ago = random.uniform(0, 7)
        timestamp = now - timedelta(days=days_ago)
        
        detection = Event(
            event_type="detection",
            phrase=phrase,
            term=term,
            site=site,
            latency_ms=random.randint(800, 2200),
            timestamp=timestamp,
        )
        db.add(detection)
        events_created += 1
        
        if random.random() < 0.75:
            accept_time = timestamp + timedelta(seconds=random.uniform(2, 30))
            alternative = None
            if random.random() < 0.2:
                alternative = random.choice([t for t in CANONICAL_TERMS if t != term])
            
            acceptance = Event(
                event_type="acceptance",
                phrase=phrase,
                term=term,
                alternative_term=alternative,
                site=site,
                timestamp=accept_time,
            )
            db.add(acceptance)
            events_created += 1
        else:
            skip_time = timestamp + timedelta(seconds=random.uniform(2, 15))
            skip = Event(
                event_type="skip",
                phrase=phrase,
                term=term,
                site=site,
                timestamp=skip_time,
            )
            db.add(skip)
            events_created += 1
    
    db.commit()
    db.close()
    return events_created


def clear_and_seed(count: int = 800):
    init_db()
    db = SessionLocal()
    deleted = db.query(Event).delete()
    db.commit()
    db.close()
    print(f"[Seed] Cleared {deleted} existing events")
    
    created = generate_events(count)
    print(f"[Seed] Created {created} fake events across 60 canonical components")
    return created


if __name__ == "__main__":
    count = clear_and_seed(800)
    print(f"[Seed] Done. Total events: {count}")
