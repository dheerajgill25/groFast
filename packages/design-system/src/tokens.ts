/**
 * Design tokens — ratified in `project-docs/04a_design.md` §1 (frozen 2026-07-10).
 *
 * This file is the single source of truth for GroFast's visual language across
 * customer web (Next.js), customer + rider apps (React Native), and admin (React).
 * Do not hardcode colours, spacing, or radii in feature code — import from here.
 *
 * Changing a value here is a design-system change: it needs a CR (`/cr-open`),
 * not a casual edit, because 04a is a frozen artifact.
 */

export const color = {
  primary: '#0FA958',
  primaryPressed: '#0C8746',
  primaryTint: '#E7F7EF',

  text: '#111417',
  textSecondary: '#5A6169',

  /** Offers, discounts, coupons, COD amount banner ONLY — never errors. */
  accentWarm: '#FF8A00',
  accentWarmTint: '#FFF3E4',

  error: '#DC2626',
  warning: '#F59E0B',
  info: '#2563EB',

  /** 8-step neutral ramp: surfaces -> borders -> muted text. */
  gray: {
    1: '#F7F8F9',
    2: '#EEF0F2',
    3: '#E1E4E8',
    4: '#C9CED4',
    5: '#A6ADB4',
    6: '#7A828B',
    7: '#545C64',
    8: '#2A3138',
  },

  surface: '#FFFFFF',
  /** Modal/sheet overlay — `color.text` at 40%. */
  scrim: 'rgba(17, 20, 23, 0.4)',
} as const;

export const typography = {
  fontFamily: 'Inter',
  /** Type scale in px. */
  size: { xs: 12, body: 14, md: 16, lg: 20, xl: 24, xxl: 32 },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  /** Prices, timers, ETAs, and counts must use tabular numerals. */
  tabularNumerals: "'tnum' 1",
} as const;

/** 4/8pt grid. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  /** Inputs, cards. */
  input: 8,
  card: 8,
  /** Sheets, modals. */
  sheet: 12,
  /** Chips, steppers, badges. */
  pill: 999,
} as const;

/** Global motion durations in ms — see 04a §1 "Motion". */
export const motion = {
  transition: { min: 150, max: 250 },
  addToStepperMorph: 150,
  sheetSlideUp: 250,
  rowRemoveCollapse: 200,
  successCheck: 250,
  toastAutoDismiss: 3000,
  errorToastAutoDismiss: 5000,
} as const;

export const breakpoint = {
  web: { mobile: 0, tablet: 768, desktop: 1120 },
  admin: { minSupported: 1280, base: 1440 },
  picker: { base: 1024 },
} as const;

/** Minimum tap targets (px) — rider app is deliberately larger (gloves, sunlight, motion). */
export const tapTarget = {
  default: 44,
  rider: 56,
} as const;

/** Contrast floors per WCAG 2.1 AA + rider sunlight requirement. */
export const contrast = {
  bodyMin: 4.5,
  riderMin: 7,
} as const;
