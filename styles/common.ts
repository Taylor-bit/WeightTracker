import { StyleSheet } from "react-native";

export type AppTheme = {
  background: string;
  surface: string;
  text: string;
  secondaryText: string;
  border: string;
  primary: string;
  primaryText: string;
  danger: string;
  inputBackground: string;
  modalOverlay: string;
};

export function makeCommonStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.surface,
    },

    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 24,
      paddingBottom: 24,
    },

    title: {
      fontSize: 30,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
      textAlign: "center",
    },

    subtitle: {
      fontSize: 16,
      color: theme.secondaryText,
      marginBottom: 16,
      textAlign: "center",
    },

    bodyText: {
      fontSize: 15,
      color: theme.text,
    },

    card: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },

    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },

    input: {
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      padding: 14,
      marginBottom: 12,
      fontSize: 16,
      color: theme.text,
    },

    primaryButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 6,
    },

    primaryButtonText: {
      color: theme.primaryText,
      fontSize: 16,
      fontWeight: "600",
    },

    secondaryButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 8,
      marginBottom: 16,
    },

    secondaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },

    dangerButton: {
      backgroundColor: theme.danger,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 8,
    },

    dangerButtonText: {
      color: theme.primaryText,
      fontWeight: "600",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: theme.modalOverlay,
      justifyContent: "center",
      padding: 24,
    },

    modalCard: {
      backgroundColor: theme.surface,
      borderRadius: 14,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },

    modalTitle: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 16,
      textAlign: "center",
      color: theme.text,
    },

    emptyText: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: "center",
      color: theme.secondaryText,
    },

    dateText: {
      fontSize: 16,
      color: theme.text,
    },

    deleteButton: {
      backgroundColor: theme.danger,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 8,
    },

    deleteButtonText: {
      color: theme.primaryText,
      fontWeight: "600",
    },
  });
}
