/**
 * Block City visual language.
 *
 * All presentation code should consume these semantic tokens instead of
 * inventing scene-local values. Numeric colors are Phaser-ready; text colors
 * are kept as CSS strings because Phaser Text expects that format.
 */
export const VIEWPORT = {
  width: 390,
  height: 844,
  safeInset: 14,
} as const;

export const COLORS = {
  ink: 0x123767,
  inkDark: 0x082954,
  text: 0x163b6a,
  textSoft: 0x58779a,
  muted: 0x7895b2,
  white: 0xffffff,
  panel: 0xffffff,
  panelSoft: 0xeaf7ff,
  panelBlue: 0xd8f0ff,
  cream: 0xfffbec,
  sky: 0x42bdf5,
  skyPale: 0xdff8ff,
  ocean: 0x20b9df,
  primary: 0x1688ed,
  primaryBright: 0x08bcff,
  primaryDark: 0x0759b8,
  navySurface: 0x075caf,
  navSurface: 0x034782,
  cyan: 0x4bd9f2,
  mint: 0x43d77c,
  mintDark: 0x12a95b,
  success: 0x24c86a,
  gold: 0xffd62d,
  goldBright: 0xffff45,
  goldDark: 0xf28b18,
  coral: 0xff665f,
  violet: 0xb565ef,
  warning: 0xffa31a,
  danger: 0xff5f63,
  info: 0x2c9cff,
  disabled: 0xa8b5c4,
  disabledDark: 0x647386,
  road: 0x63768b,
  outline: 0xa9d9f3,
  outlineBright: 0x72e5ff,
  shadow: 0x0754a0,
  scrim: 0x063667,
  gameplay: 0x083e73,
  gameplayDeep: 0x052f5f,
  creamEdge: 0xe9a62a,
  badgeRed: 0xf33f4c,
} as const;

export const TEXT_COLORS = {
  primary: "#123767",
  secondary: "#58779a",
  inverse: "#ffffff",
  link: "#1767a9",
  success: "#159453",
  reward: "#946318",
} as const;

export const RADII = {
  xs: 7,
  sm: 11,
  md: 16,
  lg: 20,
  xl: 25,
  pill: 999,
} as const;

export const STROKES = {
  hairline: 1,
  standard: 2,
  strong: 3,
  hero: 5,
  innerHighlightAlpha: 0.65,
  outerAlpha: 0.95,
} as const;

export const SHADOWS = {
  cardOffsetY: 5,
  buttonOffsetY: 5,
  heroButtonOffsetY: 8,
  cardAlpha: 0.18,
  raisedAlpha: 0.28,
  modalAlpha: 0.4,
  scrimAlpha: 0.72,
} as const;

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  screen: 18,
  section: 28,
} as const;

export const CONTROL_HEIGHTS = {
  compact: 36,
  standard: 44,
  primary: 52,
  hero: 88,
  nav: 68,
  minimumHitTarget: 44,
} as const;

export const ICON_SIZES = {
  compact: 24,
  control: 30,
  hud: 34,
  nav: 38,
  booster: 48,
  feature: 64,
} as const;

export const TYPE = {
  family: '"Arial Rounded MT Bold", Nunito, Inter, ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
  size: {
    caption: 11,
    label: 12,
    body: 14,
    control: 16,
    title: 22,
    display: 40,
  },
  weight: {
    regular: "500",
    bold: "700",
    heavy: "800",
  },
} as const;

/** Semantic text roles. Components may scale these values, but should not invent
 * a parallel type hierarchy in scene code. */
export const TYPOGRAPHY = {
  hero: { size: 40, weight: "800" },
  heading: { size: 22, weight: "800" },
  hudNumber: { size: 18, weight: "800" },
  buttonLabel: { size: 16, weight: "800" },
  cardTitle: { size: 14, weight: "700" },
  body: { size: 14, weight: "500" },
  metadata: { size: 11, weight: "500" },
} as const;

/** Shared face/edge pairs preserve the same toy-like extrusion on controls. */
export const CONTROL_PALETTES = {
  primary: { top: 0x08bcff, bottom: 0x0064f7, edge: 0x0758ad, text: "#ffffff" },
  secondary: { top: 0x35c9ef, bottom: 0x1199da, edge: 0x0870b7, text: "#ffffff" },
  success: { top: 0x42df77, bottom: 0x16b955, edge: 0x087f3e, text: "#ffffff" },
  gold: { top: 0xffff45, bottom: 0xffb719, edge: 0xb85308, text: "#113467" },
  danger: { top: 0xff7773, bottom: 0xed494f, edge: 0xb52b37, text: "#ffffff" },
  disabled: { top: 0xcbd4df, bottom: 0x8b9aaf, edge: 0x53627a, text: "#34445c" },
} as const;

/** Surface recipes are deliberately semantic: scenes choose intent, not a
 * one-off color combination. */
export const PANEL_PALETTES = {
  white: { fill: 0xf8fdff, stroke: 0x8fd7f2, inner: 0xffffff, text: "#123767" },
  blue: { fill: 0xdff5ff, stroke: 0x49c8f4, inner: 0xffffff, text: "#123767" },
  cream: { fill: 0xfff7df, stroke: 0xe9a62a, inner: 0xfffff8, text: "#123767" },
  dark: { fill: 0x083e73, stroke: 0x16a8e8, inner: 0x45cfff, text: "#ffffff" },
  stat: { fill: 0xf7fdff, stroke: 0xb8e7f8, inner: 0xffffff, text: "#123767" },
  info: { fill: 0xeaf7ff, stroke: 0x78d8f5, inner: 0xffffff, text: "#123767" },
  task: { fill: 0xf8fdff, stroke: 0xa7d9ec, inner: 0xffffff, text: "#123767" },
  building: { fill: 0xf5fbff, stroke: 0x7dcff0, inner: 0xffffff, text: "#123767" },
  reward: { fill: 0xfff5d5, stroke: 0xffc52f, inner: 0xffffff, text: "#123767" },
  dialog: { fill: 0xf8fdff, stroke: 0x58cef4, inner: 0xffffff, text: "#123767" },
  modal: { fill: 0xfffbec, stroke: 0xffc62c, inner: 0xffffff, text: "#123767" },
} as const;

export const DEPTH = {
  background: 0,
  world: 10,
  content: 20,
  feedback: 90,
  hud: 100,
  overlay: 200,
  cinematic: 4000,
  modal: 5000,
} as const;

export const MOTION = {
  press: 60,
  hover: 90,
  release: 100,
  standard: 240,
  reveal: 380,
  celebration: 620,
  idlePulse: 1100,
  ease: {
    press: "Sine.Out",
    release: "Back.Out",
    standard: "Cubic.Out",
    celebration: "Back.Out",
  },
} as const;

/** Named recipes for depth cues shared by panels, controls and selected tiles. */
export const DEPTH_TREATMENTS = {
  bevelInset: 3,
  highlightAlpha: 0.65,
  buttonExtrusion: 5,
  heroExtrusion: 8,
  selectedGlowColor: 0x72e5ff,
  selectedGlowAlpha: 0.85,
  selectedGlowWidth: 3,
  panelInset: 3,
  iconExtrusion: 3,
} as const;

export const ART = {
  iconGrid: 64,
  blockRadiusRatio: 0.16,
  topHighlightAlpha: 0.58,
  sideShadeAlpha: 0.28,
} as const;

/** Fixed layout bands keep every scene aligned to one mobile-game hierarchy. */
export const LAYOUT = {
  hudTop: 16,
  hudHeight: 104,
  contentTop: 128,
  contentBottom: 756,
  bottomNavTop: 766,
  bottomNavCenter: 801,
  bottomNavHeight: 68,
} as const;

/** Compatibility alias while older call sites migrate to named token groups. */
export const UI = {
  margin: SPACING.screen,
  radius: RADII.md,
  radiusSmall: RADII.sm,
  cardShadowY: SHADOWS.cardOffsetY,
} as const;
