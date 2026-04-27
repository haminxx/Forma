//! Smart positioning helpers (flip-to-fit, margin, etc.) — used by the
//! React overlay to decide which side of the caret to render the dot
//! and card on.

use crate::model::Rect;

pub struct Viewport {
    pub width: f64,
    pub height: f64,
}

/// Given a target caret rect and a card size, return the top-left
/// position that keeps the card fully on-screen with a small margin.
pub fn anchor_below(caret: Rect, card: (f64, f64), vp: Viewport) -> (f64, f64) {
    let margin = 8.0;
    let mut x = caret.x;
    let mut y = caret.y + caret.height + margin;
    if x + card.0 > vp.width - margin {
        x = (vp.width - card.0 - margin).max(margin);
    }
    if y + card.1 > vp.height - margin {
        // Flip above.
        y = (caret.y - card.1 - margin).max(margin);
    }
    (x, y)
}
