import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { DatePickerModal } from "react-native-paper-dates";

import {
  createWeightEntry,
  deleteWeightEntry,
  getCurrentUser,
  getUserById,
  getWeightEntriesForUser,
} from "@/database/database";
import { useAppStyles } from "@/hooks/useAppStyles";

type WeightEntry = {
  id: number;
  user_id: number;
  weight: number;
  entry_date: string;
};

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

  function handleCreateEntry() {
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
            contentContainerStyle={localStyles.listContent}
            renderItem={({ item }) => (
              <View style={localStyles.entryCard}>
                <View>
                  <Text style={localStyles.entryWeight}>{item.weight}</Text>
                  <Text style={localStyles.entryDate}>{item.entry_date}</Text>
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
                style={localStyles.modalWrapper}
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

const localStyles = StyleSheet.create({
  listContent: {
    paddingBottom: 16,
  },
  entryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2c2c2e",
  },
  entryWeight: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    color: "#f4f4f5",
  },
  entryDate: {
    fontSize: 14,
    color: "#f4f4f5",
  },
  modalWrapper: {
    justifyContent: "center",
  },
});
