
import * as SQLite from "expo-sqlite";

let db = null;
const USER_TABLE = "users";


export const initDatabase = async () => {
  if (db) return;

  try {
    db = await SQLite.openDatabaseAsync("user.db");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${USER_TABLE} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        authAccount TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fieldOfInterest TEXT,
        schoolLevel TEXT,
        signupDate TEXT NOT NULL
      );
    `);

    console.log("Database initialized.");
  } catch (err) {
    console.error("Error initializing DB:", err);
    throw err;
  }
};

import * as FileSystem from "expo-file-system";
const exportJSON = async () => {
  try {
    const users = await db.getAllAsync(`SELECT * FROM users`);
    const json = JSON.stringify(users, null, 2);

    const filePath = FileSystem.documentDirectory + "users.json";

    await FileSystem.writeAsStringAsync(filePath, json);

    console.log("Database exported to JSON at:", filePath);
    return filePath;
  } catch (err) {
    console.log("Error exporting JSON:", err);
  }
};

export const insertUser = async ({
  firstName,
  lastName,
  authAccount,
  password,
  fieldOfInterest,
  schoolLevel,
  signupDate,
}) => {
  if (!db) throw new Error("Database not initialized.");

  try {
    const result = await db.runAsync(
      `
      INSERT INTO ${USER_TABLE}
      (firstName, lastName, authAccount, password, fieldOfInterest, schoolLevel, signupDate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        firstName,
        lastName,
        authAccount,
        password,
        fieldOfInterest,
        schoolLevel,
        signupDate,
      ]
    );

    return result.lastInsertRowId;
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      throw new Error("That email/mobile is already in use.");
    }
    console.error("Insert error:", err);
    throw err;
  }
};

export const getUserByAuthAccount = async (
  authAccount,
  password
) => {
  if (!db) throw new Error("Database not initialized.");

  try {
    const result = await db.getFirstAsync(
      `SELECT * FROM ${USER_TABLE} WHERE authAccount = ? AND password = ?`,
      [authAccount, password]
    );

    return result ?? null;
  } catch (err) {
    console.error("Login query error:", err);
    throw err;
  }
};
