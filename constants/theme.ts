/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    background: "#ffffff",
    surface: "#f4f4f5",
    text: "#18181b",
    secondaryText: "#71717a",
    border: "#e4e4e7",
    primary: "#3f3f46",
    primaryText: "#ffffff",
    danger: "#52525b",
    inputBackground: "#ffffff",
    modalOverlay: "rgba(0,0,0,0.35)",
  },

  dark: {
    background: "#1c1c1e",
    surface: "#2c2c2e",
    text: "#f4f4f5",
    secondaryText: "#a1a1aa",
    border: "#3f3f46",
    primary: "#3f3f46",
    primaryText: "#ffffff",
    danger: "#3f3f46",
    inputBackground: "#2c2c2e",
    modalOverlay: "rgba(0,0,0,0.55)",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
