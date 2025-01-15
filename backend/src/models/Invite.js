import db from '../config/database.js';

class Invite {
  static create({ courseId, userId }) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO course_invites (courseId, userId) VALUES (?, ?)',
        [courseId, userId],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, courseId, userId, status: 'pending' });
        }
      );
    });
  }

  static findById(id, userId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM course_invites WHERE id = ? AND userId = ?',
        [id, userId],
        (err, invite) => {
          if (err) reject(err);
          resolve(invite);
        }
      );
    });
  }

  static updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE course_invites SET status = ? WHERE id = ?',
        [status, id],
        (err) => {
          if (err) reject(err);
          resolve(true);
        }
      );
    });
  }
}