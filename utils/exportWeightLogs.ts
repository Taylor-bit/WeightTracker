import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { getAllWeightEntriesAscending, getUserById } from "@/database/database";

// Handles commas, quotes, etc. so CSV doesn't break
function escapeCsv(value: string | number) {
  const str = String(value);

  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export async function exportWeightLogsCsv(userId: number) {
  const user = getUserById(userId);
  const entries = getAllWeightEntriesAscending(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Header row
  const header = ["entry_date", "weight"];

  // Data rows
  const rows = entries.map((entry) => [entry.entry_date, entry.weight]);

  const csvLines = [
    header.join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ];

  const csvContent = csvLines.join("\n");

  // Clean filename
  const safeName = user.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const fileName = `${safeName}_weight_logs.csv`;

  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  // Write file to device
  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // Open share dialog (save/send file)
  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: "Export weight logs",
      UTI: "public.comma-separated-values-text",
    });
  } else {
    console.log("Sharing not available on this device");
  }

  return fileUri;
}
