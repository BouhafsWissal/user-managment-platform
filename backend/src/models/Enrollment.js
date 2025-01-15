import db from '../config/database.js';

class Enrollment {
  static create({ userId, courseId }) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO course_enrollments (userId, courseId) VALUES (?, ?)',
        [userId, courseId],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, userId, courseId });
        }
      );
    });
  }

  static remove({ userId, courseId }) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM course_enrollments WHERE userId = ? AND courseId = ?',
        [userId, courseId],
        (err) => {
          if (err) reject(err);
          resolve(true);
        }
      );
    });
  }
}