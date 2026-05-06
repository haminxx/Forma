---
name: designlang-tokens
description: Use when styling UI for stitch.withgoogle.com — references the extracted design system tokens instead of inventing colors, spacing, or typography.
---

# designlang tokens
Source: https://stitch.withgoogle.com
Extracted by designlang v7.0.0 on 2026-05-06T08:03:02.864Z

## Semantic tokens (use these)
- color.action.primary: #000000
- color.surface.default: #191a1f
- color.text.body: #000000
- radius.control: 0px
- typography.body.fontFamily: Times New Roman

## Regions
- content

## How to use
- Prefer `semantic.*` tokens over `primitive.*`.
- Never invent new tokens or hex values; reuse the ones above.
- When a value is missing, pick the closest existing semantic token and flag the gap.
- Reference tokens by their dotted path (e.g. `semantic.color.action.primary`).
