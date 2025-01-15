import db from '../config/database.js';

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          isConsumer BOOLEAN DEFAULT true,
          isCreator BOOLEAN DEFAULT false,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Courses table
      db.run(`
        CREATE TABLE IF NOT EXISTS courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          creatorId INTEGER NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (creatorId) REFERENCES users(id)
        )
      `);

      // Course enrollments table
      db.run(`
        CREATE TABLE IF NOT EXISTS course_enrollments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          courseId INTEGER NOT NULL,
          enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (courseId) REFERENCES courses(id),
          UNIQUE(userId, courseId)
        )
      `);

      // Course invites table
      db.run(`
        CREATE TABLE IF NOT EXISTS course_invites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          courseId INTEGER NOT NULL,
          userId INTEGER NOT NULL,
          status TEXT DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (courseId) REFERENCES courses(id),
          FOREIGN KEY (userId) REFERENCES users(id),
          UNIQUE(courseId, userId)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}