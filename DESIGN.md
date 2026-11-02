---
name: Optical Clarity & Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf4'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dde9ff'
  surface-container-highest: '#d5e3fd'
  on-surface: '#0d1c2e'
  on-surface-variant: '#44474e'
  inverse-surface: '#233144'
  inverse-on-surface: '#ebf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#475f86'
  primary: '#001734'
  on-primary: '#ffffff'
  primary-container: '#102c50'
  on-primary-container: '#7c94be'
  inverse-primary: '#afc8f4'
  secondary: '#0060a8'
  on-secondary: '#ffffff'
  secondary-container: '#70b1ff'
  on-secondary-container: '#004378'
  tertiary: '#380005'
  on-tertiary: '#ffffff'
  tertiary-container: '#5f000f'
  on-tertiary-container: '#ff585f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#afc8f4'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2e476d'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#a2c9ff'
  on-secondary-fixed: '#001c38'
  on-secondary-fixed-variant: '#004881'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#ffb3b1'
  on-tertiary-fixed: '#410007'
  on-tertiary-fixed-variant: '#92001c'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fd'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system blends **Minimalism** with clinical precision and gentle **Glassmorphism**, reflecting the clarity, focus, and modern craftsmanship of an optical boutique. Inspired by clean retail showcases, anti-reflective optical glass, and high-grade acetate frames, the visual direction prioritizes crisp legibility, airy layouts, and structural discipline.

The emotional tone balances certified clinical authority with warm, welcoming retail hospitality. It communicates transparency, precision lens technology, and fashionable elegance without sterile coldness or crowded promotional clutter.

## Colors

The palette draws inspiration from deep optical acetate frames, anti-glare lens coatings, and the signature red sunglasses icon from the store insignia.

- **Primary Navy (`#102C50`):** Anchors headers, primary brand elements, key buttons, and core architectural frames.
- **Brand Blue (`#1769B2`):** Communicates clarity, precision, and verified clinical optical care. Used for active navigation, focal interactions, links, and selected tags.
- **Brand Light Blue (`#EAF4FC`):** Functions as a delicate tint for hover states, active frame filters, highlighted table cells, and subtle lens backdrops.
- **Brand Accent Red (`#E63946`):** Sourced directly from the brand insignia; reserved strictly for attention pings, special promotion badges (e.g., "Trending Frame", "Blue Light Promo"), cart indicators, and urgent booking alerts.
- **Surface & Backgrounds:** Crisp canvas white (`#FFFFFF`) layered over cool neutral canvas tint (`#F7F9FC`).
- **Body & Neutral Hierarchy:** High-readability slate navy (`#344256`) for body text, muted secondary slate (`#64748B`) for specs/dimensions, and faint hair-thin borders (`#E2E8F0`).

## Typography

The design system employs **Plus Jakarta Sans** uniformly across all touchpoints. Its balanced proportions, humanist warmth, and razor-sharp geometric precision mirror the clean geometry of optical lens craft and modern frame architecture.

- Use **Semibold (600)** and **Bold (700)** for frame collection headings, optometry service highlights, and optical technical metrics (e.g., lens indexes, bridge sizes).
- Use **Regular (400)** for editorial reviews, vision care education, and customer consultation guides.
- Apply high-tracking uppercase styling exclusively to micro-labels (e.g., `LABEL-SM` for frame specs: `48□21-149`, `TITANIUM + WOOD`).

## Layout & Spacing

The layout model is governed by an **8pt progressive spacing rhythm** paired with a responsive fluid column grid:

- **Desktop (1024px+):** 12-column layout with 24px (`1.5rem`) gutters and generous outer margins (minimum 32px up to 1280px max content container).
- **Tablet (768px – 1023px):** 8-column layout with 20px gutters and 24px margins.
- **Mobile (< 768px):** 4-column layout with 16px (`1rem`) gutters and 16px outer safe margins.

Eyewear product cards honor generous whitespace around frames, replicating the minimalist boutique displays seen in the physical showroom:
- Frame showcase cards require generous internal padding (`space-lg`) to prevent optical frames from touching card boundaries.
- Section-to-section breaks use `space-xl` scaled dynamically (up to `4rem` on desktop) to retain an uncluttered, high-end editorial rhythm.

## Elevation & Depth

Visual hierarchy emphasizes clean, airy translucency mimicking optical lenses and clean boutique lighting rather than heavy drop shadows:

- **Level 0 (Flat Canvas):** Neutral background `#F7F9FC` with zero elevation.
- **Level 1 (Card & Frame Displays):** Crisp white `#FFFFFF` surface bounded by an ultra-refined, low-contrast ghost border (`1px solid #E2E8F0`) and an ambient, low-opacity drop shadow: `0 2px 8px rgba(16, 44, 80, 0.04)`.
- **Level 2 (Hover & Active Selection):** Eyewear cards elevate slightly with an anti-reflective glare effect: `0 8px 24px rgba(16, 44, 80, 0.08)` and subtle border shift toward `#1769B2` (30% opacity).
- **Level 3 (Modals, Lens Diagnostic Overlays & WhatsApp Drawers):** Elevated via `0 16px 40px rgba(16, 44, 80, 0.14)`.
- **Optical Glass Accent Surfaces:** Sticky headers and virtual try-on bars use frosted glass: `rgba(255, 255, 255, 0.82)` with `backdrop-filter: blur(12px)` and a subtle bottom divider `1px solid rgba(234, 244, 252, 0.9)`.

## Shapes

The shape system employs **Rounded (Level 2)** geometry:
- Default elements (inputs, product frame cards, consultation badges) feature `0.5rem` (8px) radius.
- Larger containers, promotional banners, and booking panels use `rounded-lg` (`1rem` / 16px) or `rounded-xl` (`1.5rem` / 24px).
- Action pills, frame shape selectors (e.g., Round, Cat-Eye, Aviator, Hexagonal), and promotional tag badges employ full-rounded caps (`rounded-full` / 9999px) mirroring the curvature of sculpted acetate frame temples.

## Components

### Buttons
- **Primary:** Background `#102C50`, text `#FFFFFF`, 8px border radius, semibold typography. Hover transition shifts background to `#1769B2` with a subtle elevation shift.
- **Secondary / Optical Action:** Background `#EAF4FC`, text `#1769B2`, border `1px solid rgba(23, 105, 178, 0.2)`. Hover background deepens to `#D7ECFB`.
- **Direct Consultation (WhatsApp / Booking):** Background `#25D366` (or brand `#102C50` with WhatsApp accent indicator), designed for direct customer service in Banjarmasin.
- **Outline / Filter:** Ghost border `1px solid #E2E8F0`, background transparent, text `#344256`.

### Frame & Sunglass Cards
- Surface `#FFFFFF`, border `1px solid #E2E8F0`, padding `1.25rem`.
- Generous empty space around the frame product image to let translucent acetate and metallic hinge details stand out.
- Top-right corner houses subtle pill badges: Brand red (`#E63946`) for promo/new arrivals or light blue (`#EAF4FC`) with navy text (`#102C50`) for material indicators (e.g., "Titanium + Wood", "Acetate").
- Frame dimensions (`48□21-149`) rendered in muted `label-sm` font directly beneath product titles.

### Chips & Filter Pills
- Fully pill-shaped (`rounded-full`), height 34px, horizontal padding 14px.
- Unselected: Background `#FFFFFF`, border `1px solid #E2E8F0`, text `#344256`.
- Selected: Background `#102C50`, text `#FFFFFF`, border `1px solid #102C50`. Counter badges inside pills switch to `#EAF4FC` text on navy.

### Form Inputs & Prescription Selectors
- Background `#FFFFFF`, height 46px, border `1px solid #E2E8F0`, border-radius 8px, text `#344256`.
- Focus state: Border color transitions to `#1769B2` with an ambient glow ring: `box-shadow: 0 0 0 3px rgba(23, 105, 178, 0.15)`.

### Lens Specification & Measurement Tables
- Clean clinical rows with subtle zebra alternation or `#F7F9FC` header cells.
- Values (Sphere, Cylinder, Axis, Add) set in monospace tabular numbers using clean weight-600 styling for zero prescription ambiguity.

### Checkbox & Radio Controls
- Radio & Checkbox borders set in `#1769B2`. Selected states filled in `#102C50` with white inner glyphs, reinforcing precision optical calibration.