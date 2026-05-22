const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/mail');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const userId = await User.create({ name, email, password, role });
    const user = await User.findById(userId);
    const token = signToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await User.comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findByEmail(req.user.email);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (currentPassword && newPassword) {
      const valid = await User.comparePassword(currentPassword, user.password);
      if (!valid) return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (newPassword) updates.password = newPassword;

    await User.update(req.user.id, updates);
    const updated = await User.findById(req.user.id);
    const token = signToken(updated);
    res.json({ user: updated, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'No hay cuenta con ese email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora
    await User.setResetToken(email, resetToken, expires);

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${FRONTEND_URL}/#/reset-password/${resetToken}`;

    await sendPasswordResetEmail({
      to: email,
      name: user.name,
      resetLink,
    });

    res.json({ message: 'Revisa tu correo para restablecer la contraseña' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al solicitar restablecimiento' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token y contraseña requeridos' });

    const user = await User.findByResetToken(token);
    if (!user) return res.status(400).json({ error: 'Token inválido o expirado' });

    await User.update(user.id, { password });
    await User.setResetToken(user.email, null, null);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
};
