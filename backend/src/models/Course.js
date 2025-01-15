import db from '../config/database.js';

class Course {
  static create({ title, description, creatorId }) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO courses (title, description, creatorId) VALUES (?, ?, ?)',
        [title, description, creatorId],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, title, description, creatorId });
        }
      );
    });
  }

  static findByCreator(creatorId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM courses WHERE creatorId = ?', [creatorId], (err, courses) => {
        if (err) reject(err);
        resolve(courses);
      });
    });
  }

  static findEnrolledCourses(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT c.* FROM courses c
         JOIN course_enrollments ce ON c.id = ce.courseId
         WHERE ce.userId = ?`,
        [userId],
        (err, courses) => {
          if (err) reject(err);
          resolve(courses);
        }
      );
    });
  }

  static findEnrolledUsers(courseId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT u.id, u.name, u.email FROM users u
         JOIN course_enrollments ce ON u.id = ce.userId
         WHERE ce.courseId = ?`,
        [courseId],
        (err, users) => {
          if (err) reject(err);
          resolve(users);
        }
      );
    });
  }
}