import { Colors } from "@/constants/theme";
import { useColorScheme } from "react-native";

export function useAppTheme() {
  const colorScheme = useColorScheme();

  const theme = Colors[colorScheme ?? "light"];

  return {
    theme,
    isDark: colorScheme === "dark",
  };
}
