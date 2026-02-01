/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// New Retro Pastel aesthetic colors - soft and light
const PASTEL_PINK = '#FFB3D9';
const PASTEL_BLUE = '#B3E5FC';
const PASTEL_INDIGO = '#7986CB';
const PASTEL_PURPLE = '#E1BEE7';
const PASTEL_YELLOW = '#FFF9C4';
const PASTEL_PEACH = '#FFE0B2';
const PASTEL_MINT = '#B2DFDB';

// Primary aesthetic colors from palette
const PRIMARY = '#9B59B6';
const SECONDARY = '#B3E5FC';
const ACCENT = '#FFF9C4';
const BACKGROUND = '#FFF9C4';
const SURFACE = '#FFFFFF';
const DARK_BG = '#000000';

// Text colors
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#666666';

// Status colors
const SUCCESS = '#B2DFDB';
const WARNING = '#FFE0B2';

export const Colors = {
  light: {
    text: TEXT_PRIMARY,
    textSecondary: TEXT_SECONDARY,
    background: '#B3E5FC',
    surface: '#FFFFFF',
    primary: '#9B59B6',
    secondary: PASTEL_BLUE,
    accent: PASTEL_YELLOW,
    tint: '#9B59B6',
    icon: TEXT_SECONDARY,
    tabIconDefault: TEXT_SECONDARY,
    tabIconSelected: '#9B59B6',
    success: SUCCESS,
    warning: WARNING,
    // Retro specific
    retroBorder: '#333333',
    retroBg: '#B3E5FC',
    retroLavender: PASTEL_PURPLE,
    retroMint: PASTEL_MINT,
    retroPeach: PASTEL_PEACH,
    retroIndigo: PASTEL_INDIGO,
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#B3E5FC',
    surface: PASTEL_PURPLE,
    primary: '#9B59B6',
    secondary: PASTEL_BLUE,
    accent: PASTEL_YELLOW,
    tint: '#9B59B6',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#9B59B6',
    success: SUCCESS,
    warning: WARNING,
    // Retro specific
    retroBorder: '#333333',
    retroBg: '#B3E5FC',
    retroLavender: PASTEL_PURPLE,
    retroMint: PASTEL_MINT,
    retroPeach: PASTEL_PEACH,
    retroIndigo: PASTEL_INDIGO,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** Lofi retro main font */
    sans: 'Segoe Print',
    /** Lofi serif - typewriter style */
    serif: 'Courier',
    /** Lofi rounded - handwritten feel */
    rounded: 'Chalkboard SE',
    /** Lofi monospace */
    mono: 'Menlo',
  },
  default: {
    sans: 'Comic Sans MS, cursive',
    serif: 'Courier',
    rounded: 'Comic Sans MS, cursive',
    mono: 'Courier New, monospace',
  },
  web: {
    sans: "'Comic Sans MS', 'Trebuchet MS', cursive, sans-serif",
    serif: "'Courier New', Courier, monospace",
    rounded: "'Segoe Print', 'Comic Sans MS', cursive, sans-serif",
    mono: "'Courier New', Courier, 'Liberation Mono', monospace",
  },
});
