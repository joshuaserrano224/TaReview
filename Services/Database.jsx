// Services/Database.jsx

import * as FileSystem from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";

let db = null;

// TABLE NAMES
const USER_TABLE = "users";
const SAVED_REVIEWERS_TABLE = "saved_reviewers";
const QUIZ_RESULTS_TABLE = "quiz_results";

export { db };

// ------------------------------------
// DATABASE INITIALIZATION (CLEAN RESET)
// ------------------------------------
export const initDatabase = async () => {
    if (db) return;

    try {
        db = await SQLite.openDatabaseAsync("user.db");
        console.log("Database opened.");

        // ❌ NO MORE DROPPING TABLES
        // ✔ Create only if not existing
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

            CREATE TABLE IF NOT EXISTS ${SAVED_REVIEWERS_TABLE} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                date_saved DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS ${QUIZ_RESULTS_TABLE} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                score TEXT NOT NULL,
                percentage INTEGER NOT NULL,
                date TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);

        console.log("Tables ensured.");
    } catch (err) {
        console.error("DB Init Error:", err);
        throw err;
    }
};


// ------------------------------------
// REVIEWER FUNCTIONS
// ------------------------------------
export const insertReviewer = async ({ user_id, title, content }) => {
    try {
        if (!db) throw new Error("DB not initialized.");

        const result = await db.runAsync(
            `
            INSERT INTO ${SAVED_REVIEWERS_TABLE} (user_id, title, content)
            VALUES (?, ?, ?)
            `,
            [user_id, title, content]
        );

        console.log("Reviewer saved:", result.lastInsertRowId);
        return result.lastInsertRowId;
    } catch (err) {
        console.error("insertReviewer ERROR:", err);
        throw err;
    }
};

export const fetchAllReviewers = async (user_id) => {
    if (!db) throw new Error("DB not initialized.");

    return await db.getAllAsync(
        `
        SELECT id, title, date_saved
        FROM ${SAVED_REVIEWERS_TABLE}
        WHERE user_id = ?
        ORDER BY date_saved DESC
        `,
        [user_id]
    );
};

export const fetchReviewersByUser = async (user_id) => {
    try {
        const result = await db.getAllAsync(
            "SELECT * FROM saved_reviewers WHERE user_id = ? ORDER BY date_saved DESC",
            [user_id]
        );

        return result || [];
    } catch (error) {
        console.error("fetchReviewersByUser ERROR:", error);
        return [];
    }
};


export const getReviewerById = async (id, userId) => {
    try {
        if (!db) throw new Error("DB not initialized.");

        const reviewer = await db.getFirstAsync(
            `
            SELECT *
            FROM saved_reviewers
            WHERE id = ? AND user_id = ?
            `,
            [id, userId]
        );

        return reviewer || null;
    } catch (err) {
        console.error("getReviewerById ERROR:", err);
        return null;
    }
};


export const deleteReviewerById = async (id, user_id) => {
    if (!db) throw new Error("DB not initialized.");

    const result = await db.runAsync(
        `
        DELETE FROM ${SAVED_REVIEWERS_TABLE}
        WHERE id = ? AND user_id = ?
        `,
        [id, user_id]
    );

    return result.changes > 0;
};

// ------------------------------------
// QUIZ RESULTS
// ------------------------------------
export const insertQuizResult = async (quizData) => {
    try {
        if (!db) throw new Error("DB not initialized.");

        // Use the modern db.runAsync() for a single INSERT operation
        const result = await db.runAsync(
            `
            INSERT INTO ${QUIZ_RESULTS_TABLE} (user_id, title, score, percentage, date) 
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                quizData.userId, // Note: You used 'userId' in quizData, but the table uses 'user_id'. This must match!
                quizData.title,
                quizData.score,
                quizData.percentage,
                quizData.date,
            ]
        );
        
        console.log("Quiz result saved with ID:", result.lastInsertRowId);
        return result.lastInsertRowId;
    } catch (err) {
        console.error("insertQuizResult ERROR:", err);
        throw err;
    }
};

export const fetchAllQuizResults = async (user_id) => {
    try {
        if (!db) throw new Error("DB not initialized.");

        const results = await db.getAllAsync(
            `
            SELECT id, title, score, percentage, date
            FROM ${QUIZ_RESULTS_TABLE}
            WHERE user_id = ?
            ORDER BY date DESC
            `,
            [user_id] // Correctly passing user_id inside an array.
        );
        return results || [];
    } catch (err) {
        console.error("fetchAllQuizResults ERROR:", err);
        throw err;
    }
};
// ------------------------------------
// USER MANAGEMENT
// ------------------------------------
export const insertUser = async ({
    firstName,
    lastName,
    authAccount,
    password,
    fieldOfInterest,
    schoolLevel,
    signupDate,
}) => {
    if (!db) throw new Error("DB not initialized.");

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
};

export const getUserByAuthAccount = async (authAccount, password) => {
    if (!db) throw new Error("DB not initialized.");

    return await db.getFirstAsync(
        `
        SELECT * FROM ${USER_TABLE}
        WHERE authAccount = ? AND password = ?
        `,
        [authAccount, password]
    );
};

// ------------------------------------
// EXPORTS / ALIASES
// ------------------------------------
export const getReviewers = fetchAllReviewers;
export const getReviewerContent = getReviewerById;
export const getQuizResults = fetchAllQuizResults;

export const exportJSON = async () => {
    const users = await db.getAllAsync(`SELECT * FROM ${USER_TABLE}`);
    const filePath = FileSystem.documentDirectory + "users.json";
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(users, null, 2));
    return filePath;
};
