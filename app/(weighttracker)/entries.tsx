import * as Notifications from "expo-notifications";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { DatePickerModal } from "react-native-paper-dates";

import {
  createWeightEntry,
  deleteWeightEntry,
  getCurrentUser,
  getEarliestWeightEntry,
  getPreviousWeightEntry,
  getUserById,
  getWeightEntriesForUser,
} from "@/database/database";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WeightEntry } from "@/models/weightEntry";

export default function EntriesScreen() {
  const [userName, setUserName] = useState("");
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [weight, setWeight] = useState("");
  const [entryDate, setEntryDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const { theme, insets, styles } = useAppStyles();

  function loadData() {
    const currentUserId = getCurrentUser();

    if (!currentUserId) {
      setUserName("");
      setEntries([]);
      return;
    }

    const user = getUserById(currentUserId);
    const userEntries = getWeightEntriesForUser(currentUserId);

    setUserName(user?.name ?? "");
    setEntries(userEntries);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  async function maybeNotifyGoalAchieved(userId: number, newWeight: number) {
    try {
      const user = getUserById(userId);
      if (!user?.goal_weight) return;

      const goal = user.goal_weight;

      const baselineEntry = getEarliestWeightEntry(userId);
      const previousEntry = getPreviousWeightEntry(userId);

      // do nothing if there are no previous entries
      if (!baselineEntry || !previousEntry) return;

      const baselineWeight = baselineEntry.weight;
      const previousWeight = previousEntry.weight;

      let crossed = false;

      // Determine direction
      if (baselineWeight > goal) {
        // Losing weight
        crossed = previousWeight > goal && newWeight <= goal;
      } else if (baselineWeight < goal) {
        // Gaining weight
        crossed = previousWeight < goal && newWeight >= goal;
      }

      if (!crossed) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Goal achieved!",
          body: `You reached your goal weight of ${goal}! Nice work!`,
        },
        trigger: null, // immediate
      });
    } catch (ex) {
      console.log(ex);
    }
  }

  async function handleCreateEntry() {
    const currentUserId = getCurrentUser();
    const formattedEntryDate = `${entryDate.getFullYear()}-${String(
      entryDate.getMonth() + 1,
    ).padStart(2, "0")}-${String(entryDate.getDate()).padStart(2, "0")}`;

    if (!currentUserId) {
      Alert.alert("No user selected", "Please select a user first.");
      return;
    }

    const parsedWeight = Number(weight);

    if (!weight || Number.isNaN(parsedWeight)) {
      Alert.alert("Invalid weight", "Please enter a valid weight.");
      return;
    }

    createWeightEntry(currentUserId, parsedWeight, formattedEntryDate);
    await maybeNotifyGoalAchieved(currentUserId, parsedWeight);

    setWeight("");
    setEntryDate(new Date());
    setShowForm(false);
    loadData();
  }

  function handleDeleteEntry(entryId: number) {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteWeightEntry(entryId);
          loadData();
        },
      },
    ]);
  }

  return (
    <View style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Entries</Text>
        {!!userName && (
          <Text style={styles.subtitle}>Current User: {userName}</Text>
        )}

        {entries.length === 0 ? (
          <Text style={styles.emptyText}>No weight entries yet.</Text>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.entryCard}>
                <View>
                  <Text style={[styles.entryWeight, { color: theme.text }]}>
                    {item.weight}
                  </Text>
                  <Text style={[styles.entryDate, { color: theme.text }]}>
                    {item.entry_date}
                  </Text>
                </View>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDeleteEntry(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>
            )}
          />
        )}

        <Pressable
          style={styles.secondaryButton}
          onPress={() => setShowForm((prev) => !prev)}
        >
          <Text style={styles.secondaryButtonText}>
            {showForm ? "Hide Form" : "Add Entry"}
          </Text>
        </Pressable>

        {showForm && (
          <Modal
            visible={showForm}
            animationType="slide"
            transparent
            onRequestClose={() => {
              setOpenDatePicker(false);
              setShowForm(false);
            }}
          >
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.modalWrapper}
              >
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Add Entry</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Weight"
                    placeholderTextColor={theme.text}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />

                  <Pressable
                    style={styles.input}
                    onPress={() => setOpenDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      Entry Date:{" "}
                      {`${entryDate.getFullYear()}-${String(
                        entryDate.getMonth() + 1,
                      ).padStart(
                        2,
                        "0",
                      )}-${String(entryDate.getDate()).padStart(2, "0")}`}
                    </Text>
                  </Pressable>

                  <DatePickerModal
                    locale="en"
                    mode="single"
                    visible={openDatePicker}
                    onDismiss={() => setOpenDatePicker(false)}
                    date={entryDate}
                    onConfirm={(params) => {
                      setOpenDatePicker(false);
                      if (params.date) setEntryDate(params.date);
                    }}
                  />

                  <Pressable
                    style={styles.primaryButton}
                    onPress={handleCreateEntry}
                  >
                    <Text style={styles.primaryButtonText}>Save Entry</Text>
                  </Pressable>

                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => {
                      setOpenDatePicker(false);
                      setShowForm(false);
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
            </View>
          </Modal>
        )}
      </View>
    </View>
  );
}
