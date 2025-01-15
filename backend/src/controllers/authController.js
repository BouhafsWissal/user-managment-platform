import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    const { email, password, name, isCreator } = req.body;
    const user = await User.create({ email, password, name, isCreator });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, isCreator: user.isCreator },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

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
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};