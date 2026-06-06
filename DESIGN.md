---
name: Retro-Vacation System
colors:
  surface: '#fff8f4'
  surface-dim: '#e5d8cd'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e6'
  surface-container: '#faebe0'
  surface-container-high: '#f4e6db'
  surface-container-highest: '#eee0d5'
  on-surface: '#211a14'
  on-surface-variant: '#404846'
  inverse-surface: '#372f28'
  inverse-on-surface: '#fceee3'
  outline: '#707976'
  outline-variant: '#c0c8c5'
  surface-tint: '#37675f'
  primary: '#37675f'
  on-primary: '#ffffff'
  primary-container: '#a8dad0'
  on-primary-container: '#316159'
  inverse-primary: '#9fd0c6'
  secondary: '#765658'
  on-secondary: '#ffffff'
  secondary-container: '#ffd6d8'
  on-secondary-container: '#7a5b5d'
  tertiary: '#5f5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#d2cfcf'
  on-tertiary-container: '#595858'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baede2'
  primary-fixed-dim: '#9fd0c6'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#1d4e47'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#e5bdbf'
  on-secondary-fixed: '#2c1517'
  on-secondary-fixed-variant: '#5c3f41'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#fff8f4'
  on-background: '#211a14'
  surface-variant: '#eee0d5'
typography:
  headline-lg:
    fontFamily: Space Mono
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Space Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Space Mono
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
  label-sm:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
  max-width: 1280px
---

## Brand & Style

The design system is a sophisticated fusion of 80s-90s consumer electronics and the sun-drenched "Poolsuite" aesthetic. It evokes a tactile, nostalgic response through its "Hardware-UI" approach—treating digital interfaces like physical devices with distinct buttons, title bars, and rigid modularity.

The style is defined as **Retro-Brutalism**. It pairs the playful, airy color palette of a high-end coastal resort with the uncompromising structure of early computing. The target audience values high-concept design that feels both exclusive and approachable, blending "lo-fi" charm with a "hi-fi" luxury finish.

## Colors

The palette is anchored by a warm, paper-like beige that serves as the canvas for all interactions, moving away from sterile whites to create a vintage "appliance" feel. 

- **Mint Green (#A8DAD0)** and **Blush Pink (#F2C9CB)** function as the primary interaction signals, used for active states, calls to action, and accent highlights.
- **Solid Black (#1A1A1A)** is the "Structural Ink" of this design system. It is used for all borders, drop shadows, and high-priority typography, ensuring the soft pastel colors remain grounded and legible.
- Surfaces that require high focus (like content within cards) should use a pure white background to pop against the beige base.

## Typography

Typography in this design system emphasizes the "technical-yet-warm" duality. 

**Space Mono** is used for all headlines, labels, and metadata. Its monospaced nature mimics early terminal readouts and receipt printers, providing the retro-hardware edge. Headlines should use tight tracking and bold weights to command attention.

**DM Sans** provides a clean, low-contrast counterpoint for long-form reading. It is used for body text and descriptions where legibility is paramount. The pairing ensures that while the interface feels retro, the reading experience remains contemporary and accessible.

## Layout & Spacing

The layout philosophy follows a **Modular Fixed Grid**. Elements are treated as independent "windows" or "modules" that snap to a 4px baseline grid. 

- **Desktop:** A 12-column fixed grid with a max width of 1280px. Gutters are 16px to maintain a compact, "packed" hardware look.
- **Mobile:** A 4-column fluid grid with 16px side margins. 
- **Spacing Rhythm:** Use increments of 4px. Internal component padding should be generous (typically 16px or 24px) to contrast against the rigid, thin black borders.

Layouts should favor vertical stacking of cards and horizontal scrolling "strips" for collections (like a row of cassette tapes).

## Elevation & Depth

This design system rejects blurred, ambient shadows in favor of **Hard Offset Shadows**. Depth is communicated through physical displacement, mimicking the buttons of a 90s stereo or a synthesizer.

- **Primary Elevation:** 4px offset (bottom-right) using #1A1A1A at 100% opacity. This is used for primary cards and floating menus.
- **Secondary Elevation:** 2px offset for smaller interactive elements like buttons and chips.
- **Pressed State:** Elements should "sink" on click, moving to a 0px offset or a 1px inset shadow to simulate physical depression.
- **Borders:** Every container must have a solid 1.5px or 2px black border to define its physical footprint.

## Shapes

The shape language is predominantly **geometric and architectural**. 

A minimal corner radius of 4px (`rounded-lg` behavior) is used only to soften the "bite" of the industrial borders. For a more aggressive retro feel, standard buttons and title bars should remain at 0px (sharp). 

Interactive indicators, such as selection pips or notification badges, should be perfectly square or circular to maintain the "control panel" aesthetic.

## Components

### Title Bars
The signature component of the design system. Every card or window should be topped with a solid #1A1A1A (black) header containing white Space Mono text. This mimics the header of an OS window.

### Buttons
- **Style:** Square corners, solid #A8DAD0 (Mint) or #F2C9CB (Blush) fill.
- **Border:** 2px solid Black.
- **Shadow:** 2px hard offset (bottom-right).
- **Text:** Centered, bold Space Mono.

### Cards
- **Background:** Pure White (#FFFFFF).
- **Border:** 2px solid Black.
- **Shadow:** 4px hard offset.
- **Header:** Optional black title bar.

### Input Fields
- **Background:** #F5E7DC (same as page background) to create an "etched" look.
- **Border:** 1.5px solid Black.
- **Focus State:** Background shifts to White, shadow increases to 2px offset.

### Icons
Use bold, linear icons with a 2px stroke weight. For key decorative elements (like palm trees, records, or stars), use pixel-art assets to lean into the nostalgic theme. All icons should be rendered in solid #1A1A1A.

### Chips/Tags
Small rectangles with Blush or Mint fills and thin black borders. No shadows for tags to keep them visually subordinate to primary buttons.