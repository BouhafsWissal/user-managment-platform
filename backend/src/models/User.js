import db from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async create({ email, password, name, isCreator }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password, name, isCreator) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, isCreator],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, email, name, isCreator });
        }
      );
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) reject(err);
        resolve(user);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        if (err) reject(err);
        resolve(user);
      });
    });
  }
}