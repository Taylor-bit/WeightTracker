import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useAppStyles } from "@/hooks/useAppStyles";

export default function WelcomeScreen() {
  const { styles, insets } = useAppStyles();

  function handleContinue() {
    router.push("./users");
  }

  return (
    <View style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top + 32 }]}>
        <Text style={styles.title}>Welcome</Text>

        <Text style={styles.subtitle}>Welcome to the WeightTracker app.</Text>

        <Text
          style={[styles.bodyText, { textAlign: "center", marginBottom: 32 }]}
        >
          Track your weight progress and stay motivated as you work toward your
          goals.
        </Text>

        <Pressable style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}
