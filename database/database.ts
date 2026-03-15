import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("weight-tracker.db");

export function initDatabase() {
  db.execSync(`
       CREATE TABLE IF NOT EXISTS users (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           name TEXT NOT NULL,
           goal_weight REAL NOT NULL,
           goal_date TEXT NOT NULL
       );
   `);

  db.execSync(`
       CREATE TABLE IF NOT EXISTS app_state (
           key TEXT PRIMARY KEY,
           value TEXT
       );
   `);

  db.execSync(`
       CREATE TABLE IF NOT EXISTS weight_entries (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           user_id INTEGER NOT NULL,
           weight REAL NOT NULL,
           entry_date TEXT NOT NULL,
           FOREIGN KEY (user_id) REFERENCES users(id)
       );
   `);
}

export function getUsers() {
  return db.getAllSync<{
    id: number;
    name: string;
    goal_weight: number;
    goal_date: string;
  }>(`SELECT * FROM users ORDER BY name`);
}

export function createUser(name: string, goalWeight: number, goalDate: string) {
  const result = db.runSync(
    `INSERT INTO users (name, goal_weight, goal_date) VALUES (?, ?, ?)`,
    [name, goalWeight, goalDate],
  );

  return result.lastInsertRowId;
}

export function setCurrentUser(userId: number) {
  db.runSync(
    `INSERT OR REPLACE INTO app_state (key, value) VALUES ('current_user_id', ?)`,
    [String(userId)],
  );
}

export function getCurrentUser() {
  const row = db.getFirstSync<{ value: string }>(
    `SELECT value FROM app_state WHERE key = 'current_user_id'`,
  );

  return row ? Number(row.value) : null;
}

export function getUserById(userId: number) {
  return db.getFirstSync<{
    id: number;
    name: string;
    goal_weight: number;
    goal_date: string;
  }>(`SELECT * FROM users WHERE id = ?`, [userId]);
}

export function updateUserGoals(
  userId: number,
  goalWeight: number,
  goalDate: string,
) {
  db.runSync(
    `UPDATE users
      SET goal_weight = ?, goal_date = ?
      WHERE id = ?`,
    [goalWeight, goalDate, userId],
  );
}

export function getWeightEntriesForUser(userId: number) {
  return db.getAllSync<{
    id: number;
    user_id: number;
    weight: number;
    entry_date: string;
  }>(
    `SELECT * FROM weight_entries
      WHERE user_id = ?
      ORDER BY entry_date DESC, id DESC`,
    [userId],
  );
}

export function createWeightEntry(
  userId: number,
  weight: number,
  entryDate: string,
) {
  const result = db.runSync(
    `INSERT INTO weight_entries (user_id, weight, entry_date)
      VALUES (?, ?, ?)`,
    [userId, weight, entryDate],
  );

  return result.lastInsertRowId;
}

export function deleteWeightEntry(entryId: number) {
  db.runSync(`DELETE FROM weight_entries WHERE id = ?`, [entryId]);
}

export function updateWeightEntry(
  entryId: number,
  weight: number,
  entryDate: string,
) {
  db.runSync(
    `UPDATE weight_entries
      SET weight = ?, entry_date = ?
      WHERE id = ?`,
    [weight, entryDate, entryId],
  );
}
