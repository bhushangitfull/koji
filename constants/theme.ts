/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Primary aesthetic colors from palette
const PRIMARY = '#B19CD9';
const SECONDARY = '#7FE5DE';
const ACCENT = '#FFB6D9';
const BACKGROUND = '#FFFACD';
const SURFACE = '#FFFFFF';
const DARK_BG = '#000000';

// Text colors
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#666666';

// Status colors
const SUCCESS = '#A8E6CF';
const WARNING = '#FFCC99';

export const Colors = {
  light: {
    text: TEXT_PRIMARY,
    textSecondary: TEXT_SECONDARY,
    background: BACKGROUND,
    surface: SURFACE,
    primary: PRIMARY,
    secondary: SECONDARY,
    accent: ACCENT,
    tint: PRIMARY,
    icon: TEXT_SECONDARY,
    tabIconDefault: TEXT_SECONDARY,
    tabIconSelected: PRIMARY,
    success: SUCCESS,
    warning: WARNING,
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: DARK_BG,
    surface: '#1A1A1A',
    primary: SECONDARY,
    secondary: PRIMARY,
    accent: ACCENT,
    tint: SECONDARY,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: SECONDARY,
    success: SUCCESS,
    warning: WARNING,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
