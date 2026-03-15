import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

import { createUser, getUsers, setCurrentUser } from "@/database/database";

type User = {
  id: number;
  name: string;
  goal_weight: number;
  goal_date: string;
};

export default function UsersScreen() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [goalDate, setGoalDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [entryDate, setEntryDate] = useState(new Date());

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
    const formattedGoalDate = goalDate.toISOString().split("T")[0];

    if (!trimmedName) {
      Alert.alert("Missing name", "Please enter a name.");
      return;
    }

    if (!goalWeight || Number.isNaN(parsedWeight)) {
      Alert.alert("Invalid goal weight", "Please enter a valid goal weight.");
      return;
    }

    if (!formattedGoalDate.trim()) {
      Alert.alert("Missing goal date", "Please enter a goal date.");
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Choose a User</Text>

      {users.length === 0 ? (
        <Text style={styles.emptyText}>No users yet. Create one below.</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.userCard}
              onPress={() => handleSelectUser(item.id)}
            >
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userDetail}>
                Goal Weight: {item.goal_weight}
              </Text>
              <Text style={styles.userDetail}>Goal Date: {item.goal_date}</Text>
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
              style={styles.modalWrapper}
            >
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Create New User</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Goal Weight"
                  keyboardType="numeric"
                  value={goalWeight}
                  onChangeText={setGoalWeight}
                />

                <Pressable
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    Goal Date: {goalDate.toISOString().split("T")[0]}
                  </Text>
                </Pressable>

                <DatePickerModal
                  locale="en"
                  mode="single"
                  visible={showDatePicker}
                  onDismiss={() => setOpenDatePicker(false)}
                  date={goalDate}
                  onConfirm={(params) => {
                    setOpenDatePicker(false);
                    if (params.date) setEntryDate(params.date);
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 16,
  },
  userCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  userDetail: {
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "#e5e5e5",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  form: {
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
  },

  modalWrapper: {
    justifyContent: "center",
  },

  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },

  dateText: {
    fontSize: 16,
    color: "#111",
  },
});
