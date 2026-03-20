import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

import { createUser, getUsers, setCurrentUser } from "@/database/database";
import { useAppStyles } from "@/hooks/useAppStyles";
import { User } from "@/models/user";
import { formatLocalDate } from "@/utils/dateHelper";

export default function UsersScreen() {
  const router = useRouter();
  const { styles, theme, insets } = useAppStyles();

  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [goalDate, setGoalDate] = useState(new Date());
  const [name, setName] = useState("");
  const [goalWeight, setGoalWeight] = useState("");

  function loadUsers() {
    const allUsers = getUsers();
    setUsers(allUsers);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleSelectUser(userId: number) {
    setCurrentUser(userId);
    router.replace("/entries");
  }

  function handleCreateUser() {
    const trimmedName = name.trim();
    const parsedWeight = Number(goalWeight);
    const formattedGoalDate = formatLocalDate(goalDate);

    if (!trimmedName) {
      Alert.alert("Missing name", "Please enter a name.");
      return;
    }

    if (!goalWeight || Number.isNaN(parsedWeight)) {
      Alert.alert("Invalid goal weight", "Please enter a valid goal weight.");
      return;
    }

    const newUserId = createUser(trimmedName, parsedWeight, formattedGoalDate);
    setCurrentUser(Number(newUserId));

    setName("");
    setGoalWeight("");
    setGoalDate(new Date());
    setShowDatePicker(false);
    setShowForm(false);

    loadUsers();
    router.replace("/entries");
  }

  return (
    <View style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Choose a User</Text>

        {users.length === 0 ? (
          <Text style={styles.emptyText}>No users yet. Create one below.</Text>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 16 }}
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() => handleSelectUser(item.id)}
              >
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.bodyText}>
                  Goal Weight: {item.goal_weight}
                </Text>
                <Text style={styles.bodyText}>Goal Date: {item.goal_date}</Text>
              </Pressable>
            )}
          />
        )}

        <Pressable
          style={styles.secondaryButton}
          onPress={() => setShowForm((prev) => !prev)}
        >
          <Text style={styles.secondaryButtonText}>
            {showForm ? "Hide Form" : "Create New User"}
          </Text>
        </Pressable>

        {showForm && (
          <Modal
            visible={showForm}
            animationType="slide"
            transparent
            onRequestClose={() => {
              setShowDatePicker(false);
              setShowForm(false);
            }}
          >
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Create New User</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor={theme.secondaryText}
                    cursorColor={theme.text}
                    selectionColor={theme.text}
                    value={name}
                    onChangeText={setName}
                  />

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
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      Goal Date: {formatLocalDate(goalDate)}
                    </Text>
                  </Pressable>

                  <DatePickerModal
                    locale="en"
                    mode="single"
                    visible={showDatePicker}
                    onDismiss={() => setShowDatePicker(false)}
                    date={goalDate}
                    onConfirm={({ date }) => {
                      setShowDatePicker(false);
                      if (date) setGoalDate(date);
                    }}
                  />

                  <Pressable
                    style={styles.primaryButton}
                    onPress={handleCreateUser}
                  >
                    <Text style={styles.primaryButtonText}>Save User</Text>
                  </Pressable>

                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => {
                      setShowDatePicker(false);
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
