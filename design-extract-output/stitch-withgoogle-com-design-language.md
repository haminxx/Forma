# Design Language: Stitch - Design with AI

> Extracted from `https://stitch.withgoogle.com` on May 6, 2026
> 78 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#000000` | hsl(0, 0%, 0%) | 138 |
| `#ffffff` | hsl(0, 0%, 100%) | 18 |
| `#191a1f` | hsl(230, 11%, 11%) | 2 |

### Background Colors

Used on large-area elements: `#191a1f`

### Text Colors

Text color palette: `#000000`, `#ffffff`

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#000000` | text, border | 138 |
| `#ffffff` | text, border | 18 |
| `#191a1f` | background | 2 |

## Typography

### Font Families

- **Times New Roman** — used for body (69 elements)
- **Google Sans** — used for body (9 elements)

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 13px | 0.8125rem | 400 | normal | normal | html, head, base, link |

### Font Weights in Use

`400` (78x)

## Spacing

## CSS Custom Properties

### Other

```css
--ogb-height: 48px;
--ogb-z-index: 100;
```

### Semantic

```css
success: [object Object];
warning: [object Object];
error: [object Object];
info: [object Object];
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| md | 768px | max-width |

## Transitions & Animations

### Common Transitions

```css
transition: all;
```

### Keyframe Animations

**gm3-cpi-rotate**
```css
@keyframes gm3-cpi-rotate {
  0% { transform: rotate(-90deg); }
  100% { transform: rotate(990deg); }
}
```

**gm3-cpi-container-rotate**
```css
@keyframes gm3-cpi-container-rotate {
  0% { transform: rotate(0deg); }
  8.33333% { transform: rotate(90deg); }
  25% { transform: rotate(90deg); }
  33.3333% { transform: rotate(180deg); }
  50% { transform: rotate(180deg); }
  58.3333% { transform: rotate(270deg); }
  75% { transform: rotate(270deg); }
  83.3333% { transform: rotate(1turn); }
  100% { transform: rotate(1turn); }
}
```

**gm3-cpi-active-grow**
```css
@keyframes gm3-cpi-active-grow {
  0% { stroke-dasharray: calc((6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.16 - var(--EscQs, 4px)),calc((var(--EkrYwf, 40px) - var(--EscQs, 4px))*6.2831852/2 - (6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.16 + var(--EscQs, 4px)); }
  50% { stroke-dasharray: calc((6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.87 - var(--EscQs, 4px)),calc((var(--EkrYwf, 40px) - var(--EscQs, 4px))*6.2831852/2 - (6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.87 + var(--EscQs, 4px)); }
  100% { stroke-dasharray: calc((6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.16 - var(--EscQs, 4px)),calc((var(--EkrYwf, 40px) - var(--EscQs, 4px))*6.2831852/2 - (6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.16 + var(--EscQs, 4px)); }
}
```

**gm3-cpi-track-grow**
```css
@keyframes gm3-cpi-track-grow {
  0% { stroke-dasharray: calc((6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.84 - var(--XJrZW, 4px) - var(--EscQs, 4px)),calc((var(--EkrYwf, 40px) - var(--EscQs, 4px))*6.2831852/2 - (6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.84 + var(--XJrZW, 4px) + var(--EscQs, 4px)); stroke-dashoffset: calc((6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.84 - var(--XJrZW, 4px) - var(--EscQs, 4px) + var(--XJrZW, 4px) + var(--EscQs, 4px)); }
  50% { stroke-dasharray: calc((6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.13 - var(--XJrZW, 4px) - var(--EscQs, 4px)),calc((var(--EkrYwf, 40px) - var(--EscQs, 4px))*6.2831852/2 - (6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.13 + var(--XJrZW, 4px) + var(--EscQs, 4px)); stroke-dashoffset: calc((6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.13 - var(--XJrZW, 4px) - var(--EscQs, 4px) + var(--XJrZW, 4px) + var(--EscQs, 4px)); }
  100% { stroke-dasharray: calc((6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.84 - var(--XJrZW, 4px) - var(--EscQs, 4px)),calc((var(--EkrYwf, 40px) - var(--EscQs, 4px))*6.2831852/2 - (6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.84 + var(--XJrZW, 4px) + var(--EscQs, 4px)); stroke-dashoffset: calc((6.2831852*(var(--EkrYwf, 40px) - var(--EscQs, 4px))/2 - var(--XJrZW, 4px))*.84 - var(--XJrZW, 4px) - var(--EscQs, 4px) + var(--XJrZW, 4px) + var(--EscQs, 4px)); }
}
```

**mdc-circular-progress-container-rotate**
```css
@keyframes mdc-circular-progress-container-rotate {
  100% { transform: rotate(1turn); }
}
```

**mdc-circular-progress-spinner-layer-rotate**
```css
@keyframes mdc-circular-progress-spinner-layer-rotate {
  12.5% { transform: rotate(135deg); }
  25% { transform: rotate(270deg); }
  37.5% { transform: rotate(405deg); }
  50% { transform: rotate(540deg); }
  62.5% { transform: rotate(675deg); }
  75% { transform: rotate(810deg); }
  87.5% { transform: rotate(945deg); }
  100% { transform: rotate(3turn); }
}
```

**mdc-circular-progress-color-1-fade-in-out**
```css
@keyframes mdc-circular-progress-color-1-fade-in-out {
  0% { opacity: 0.99; }
  25% { opacity: 0.99; }
  26% { opacity: 0; }
  89% { opacity: 0; }
  90% { opacity: 0.99; }
  100% { opacity: 0.99; }
}
```

**mdc-circular-progress-color-2-fade-in-out**
```css
@keyframes mdc-circular-progress-color-2-fade-in-out {
  0% { opacity: 0; }
  15% { opacity: 0; }
  25% { opacity: 0.99; }
  50% { opacity: 0.99; }
  51% { opacity: 0; }
  100% { opacity: 0; }
}
```

**mdc-circular-progress-color-3-fade-in-out**
```css
@keyframes mdc-circular-progress-color-3-fade-in-out {
  0% { opacity: 0; }
  40% { opacity: 0; }
  50% { opacity: 0.99; }
  75% { opacity: 0.99; }
  76% { opacity: 0; }
  100% { opacity: 0; }
}
```

**mdc-circular-progress-color-4-fade-in-out**
```css
@keyframes mdc-circular-progress-color-4-fade-in-out {
  0% { opacity: 0; }
  65% { opacity: 0; }
  75% { opacity: 0.99; }
  90% { opacity: 0.99; }
  100% { opacity: 0; }
}
```

## Layout System

**0 grid containers** and **2 flex containers** detected.

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/nowrap | 2x |

## Responsive Design

### Viewport Snapshots

| Viewport | Body Font | Nav Visible | Max Columns | Hamburger | Page Height |
|----------|-----------|-------------|-------------|-----------|-------------|
| mobile (375px) | 13px | No | 0 | No | 812px |
| tablet (768px) | 13px | No | 0 | No | 1024px |
| desktop (1280px) | 13px | No | 0 | No | 800px |
| wide (1920px) | 13px | No | 0 | No | 1080px |

### Breakpoint Changes

**375px → 768px** (mobile → tablet):
- Page height: `812px` → `1024px`

**768px → 1280px** (tablet → desktop):
- Page height: `1024px` → `800px`

**1280px → 1920px** (desktop → wide):
- Page height: `800px` → `1080px`

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 0 passing, 0 failing color pairs

## Design System Score

**Overall: 82/100 (Grade: B)**

| Category | Score |
|----------|-------|
| Color Discipline | 85/100 |
| Typography Consistency | 100/100 |
| Spacing System | 55/100 |
| Shadow Consistency | 85/100 |
| Border Radius Consistency | 100/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 50/100 |

**Strengths:** Tight, disciplined color palette, Consistent typography system, Clean elevation system, Consistent border radii, Strong accessibility compliance

**Issues:**
- No clear primary brand color detected
- No consistent spacing base unit detected — values appear arbitrary
- 99% of CSS is unused — consider purging
- 374 duplicate CSS declarations

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| Google Material Icons | cdn | 400 | normal |
| Google Sans | cdn | 400 | normal |
| Google Sans Text | google-fonts | 400, 500, 700 | normal |

**Google Fonts URL:** `https://fonts.googleapis.com/css2?family=Google+Sans+Text:wght@400;500;700`

## Motion Language

**Feel:** mixed · **Scroll-linked:** yes

## Page Intent

**Type:** `landing` (confidence 0.45)
**Description:** Stitch generates UIs for mobile and web applications, making design ideation fast and easy.

## Section Roles

Reading order (top→bottom): content

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | content | — | 0.3 |

## Material Language

**Label:** `flat` (confidence 0.55)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.065 |
| Shadow profile | none |
| Avg shadow blur | 0px |
| Max radius | 0px |
| backdrop-filter in use | no |
| Gradients | 0 |

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Times New Roman` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
