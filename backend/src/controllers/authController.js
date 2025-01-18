import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Fonction d'inscription
export const register = async (req, res) => {
  try {
    const { email, password, name, isCreator } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer un nouvel utilisateur dans la base de données
    const user = await User.create({ email, password: hashedPassword, name, isCreator });

    // Générer un token JWT avec les informations de l'utilisateur
    const token = jwt.sign(
      { id: user.id, email: user.email, isCreator: user.isCreator },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Répondre avec le token généré
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Fonction de connexion
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe dans la base de données
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Vérifier si le mot de passe est correct
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Générer un token JWT avec les informations de l'utilisateur
    const token = jwt.sign(
      { id: user.id, email: user.email, isCreator: user.isCreator },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Répondre avec le token généré
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
};
