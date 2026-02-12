/**
 * HOLOP Design System — Theme Configuration
 * CSS custom properties are in global.css, this file provides
 * typed access for JS/PixiJS usage.
 */

export const theme = {
  colors: {
    gold: '#C8973E',
    goldLight: '#E8C77B',
    goldDark: '#8B6914',
    goldMuted: 'rgba(200, 151, 62, 0.6)',

    bgDark: '#1A1008',
    bgCard: '#231A0E',
    bgCardHover: '#2D2114',
    bgElevated: '#2A1F12',
    bgModal: 'rgba(26, 16, 8, 0.95)',

    parchment: '#F5ECD7',
    parchmentDark: '#E8D9B8',
    ink: '#2C1810',
    textMuted: 'rgba(245, 236, 215, 0.5)',
    textSecondary: 'rgba(245, 236, 215, 0.7)',

    border: 'rgba(200, 151, 62, 0.15)',
    borderActive: 'rgba(200, 151, 62, 0.4)',
    glow: 'rgba(200, 151, 62, 0.06)',
    glowStrong: 'rgba(200, 151, 62, 0.15)',

    success: '#4CAF50',
    danger: '#E53935',
    warning: '#FF9800',
    info: '#2196F3',
  },

  // PixiJS-friendly hex colors (0x format)
  pixi: {
    gold: 0xC8973E,
    goldLight: 0xE8C77B,
    goldDark: 0x8B6914,
    bgDark: 0x1A1008,
    bgCard: 0x231A0E,
    parchment: 0xF5ECD7,
    success: 0x4CAF50,
    danger: 0xE53935,
    white: 0xFFFFFF,
    black: 0x000000,
  },

  fonts: {
    display: "'Neucha', cursive",
    heading: "'Cormorant Garamond', serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  sizes: {
    touchTarget: 44,
    tabBarHeight: 84,
    topBarHeight: 56,
    maxWidth: 428,
    minWidth: 375,
  },
} as const;

export type Theme = typeof theme;
