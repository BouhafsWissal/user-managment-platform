import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database(join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Database initialization
function initializeDatabase() {
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
    `);
  });
}

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, isCreator } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, password, name, isCreator) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, isCreator],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Email already exists' });
        }

        const token = jwt.sign(
          { id: this.lastID, email, isCreator },
          process.env.JWT_SECRET || 'your-secret-key'
        );

        res.json({ token });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isCreator: user.isCreator },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    res.json({ token });
  });
});

// Course routes
app.post('/api/courses', authenticateToken, (req, res) => {
  const { title, description } = req.body;
  const creatorId = req.user.id;

  if (!req.user.isCreator) {
    return res.status(403).json({ error: 'Only creators can create courses' });
  }

  db.run(
    'INSERT INTO courses (title, description, creatorId) VALUES (?, ?, ?)',
    [title, description, creatorId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating course' });
      }
      res.status(201).json({ id: this.lastID, title, description });
    }
  );
});

app.get('/api/courses/created', authenticateToken, (req, res) => {
  if (!req.user.isCreator) {
    return res.status(403).json({ error: 'Only creators can view created courses' });
  }

  db.all(
    'SELECT * FROM courses WHERE creatorId = ?',
    [req.user.id],
    (err, courses) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching courses' });
      }
      res.json(courses);
    }
  );
});

app.get('/api/courses/enrolled', authenticateToken, (req, res) => {
  db.all(
    `SELECT c.* FROM courses c
     JOIN course_enrollments ce ON c.id = ce.courseId
     WHERE ce.userId = ?`,
    [req.user.id],
    (err, courses) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching enrolled courses' });
      }
      res.json(courses);
    }
  );
});

// Course invitation routes
app.post('/api/courses/:courseId/invite', authenticateToken, (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.body;

  db.get(
    'SELECT * FROM courses WHERE id = ? AND creatorId = ?',
    [courseId, req.user.id],
    (err, course) => {
      if (err || !course) {
        return res.status(403).json({ error: 'Not authorized to invite to this course' });
      }

      db.run(
        'INSERT INTO course_invites (courseId, userId) VALUES (?, ?)',
        [courseId, userId],
        (err) => {
          if (err) {
            return res.status(400).json({ error: 'Invite already exists' });
          }
          res.status(201).json({ message: 'Invitation sent' });
        }
      );
    }
  );
});

app.post('/api/invites/:inviteId/respond', authenticateToken, (req, res) => {
  const { inviteId } = req.params;
  const { accept } = req.body;

  db.get(
    'SELECT * FROM course_invites WHERE id = ? AND userId = ?',
    [inviteId, req.user.id],
    (err, invite) => {
      if (err || !invite) {
        return res.status(404).json({ error: 'Invite not found' });
      }

      if (accept) {
        db.run(
          'INSERT INTO course_enrollments (userId, courseId) VALUES (?, ?)',
          [req.user.id, invite.courseId],
          (err) => {
            if (err) {
              return res.status(400).json({ error: 'Already enrolled' });
            }
            db.run(
              'UPDATE course_invites SET status = ? WHERE id = ?',
              ['accepted', inviteId]
            );
            res.json({ message: 'Course joined successfully' });
          }
        );
      } else {
        db.run(
          'UPDATE course_invites SET status = ? WHERE id = ?',
          ['rejected', inviteId]
        );
        res.json({ message: 'Invite rejected' });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});