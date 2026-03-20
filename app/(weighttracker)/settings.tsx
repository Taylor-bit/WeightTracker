import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { DatePickerModal } from "react-native-paper-dates";

import {
  getCurrentUser,
  getUserById,
  updateUserGoals,
} from "@/database/database";
import { useAppStyles } from "@/hooks/useAppStyles";
import { formatLocalDate, parseLocalDate } from "@/utils/dateHelper";

function handleSwitchUser() {
  router.replace("/(auth)/users");
}

export default function SettingsScreen() {
  const { styles, theme, insets } = useAppStyles();

  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [goalDate, setGoalDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);

  useEffect(() => {
    const currentUserId = getCurrentUser();

    if (!currentUserId) {
      return;
    }

    const user = getUserById(currentUserId);

    if (!user) {
      return;
    }

    setUserId(user.id);
    setName(user.name);
    setGoalWeight(String(user.goal_weight));

    setGoalDate(parseLocalDate(user.goal_date));
  }, []);

  function handleSave() {
    if (!userId) {
      Alert.alert("No user selected", "Please select a user first.");
      return;
    }

    const parsedWeight = Number(goalWeight);

    if (!goalWeight || Number.isNaN(parsedWeight)) {
      Alert.alert("Invalid goal weight", "Please enter a valid goal weight.");
      return;
    }

    updateUserGoals(userId, parsedWeight, formatLocalDate(goalDate));
    Alert.alert("Saved", "Your goal settings were updated.");
  }

  return (
    <View style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{name || "No user selected"}</Text>

          <TextInput
            style={styles.input}
            placeholder="Goal Weight"
            placeholderTextColor={theme.secondaryText}
            cursorColor={theme.text}
            selectionColor={theme.text}
            keyboardType="numeric"
            value={goalWeight}
            onChangeText={setGoalWeight}
          />

          <Pressable
            style={styles.input}
            onPress={() => setOpenDatePicker(true)}
          >
            <Text style={styles.dateText}>
              Goal Date: {formatLocalDate(goalDate)}
            </Text>
          </Pressable>

          <DatePickerModal
            locale="en"
            mode="single"
            visible={openDatePicker}
            onDismiss={() => setOpenDatePicker(false)}
            date={goalDate}
            onConfirm={({ date }) => {
              setOpenDatePicker(false);
              if (date) setGoalDate(date);
            }}
          />

          <Pressable style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save Changes</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleSwitchUser}>
            <Text style={styles.secondaryButtonText}>Switch User</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
