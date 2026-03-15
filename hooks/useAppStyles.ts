import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/useAppTheme";
import { makeCommonStyles } from "@/styles/common";

export function useAppStyles() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useAppTheme();
  const styles = makeCommonStyles(theme);

  return {
    theme,
    isDark,
    insets,
    styles,
  };
}
