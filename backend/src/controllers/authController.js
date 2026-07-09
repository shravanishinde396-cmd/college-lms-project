import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import TeacherProfile from '../models/TeacherProfile.js';
import { normalizeRole, isFacultyRole } from '../utils/roleHelpers.js';
import { sendResetEmail } from '../utils/mailer.js';

// Access token generator (short-lived)
const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Refresh token generator (long-lived)
const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id, normalizeRole(user.role));
  const refreshToken = generateRefreshToken(user._id, normalizeRole(user.role));

  // Store refresh token in user document
  user.refreshToken = refreshToken;
  await user.save();

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Lax works well with localhost for dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(statusCode).json({
    success: true,
    token: accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      department: user.department,
      avatar: user.avatar,
    }
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student', department, semester } = req.body;
  const safeRole = normalizeRole(role);
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!name || !normalizedEmail || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  if (safeRole === 'student' && !department) {
    res.status(400);
    throw new Error('Student registration requires department');
  }

  if (safeRole === 'faculty' && !department) {
    res.status(400);
    throw new Error('Faculty registration requires department');
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email: normalizedEmail, password, role: safeRole, department: department || undefined });

  if (safeRole === 'student') {
    await StudentProfile.create({ user: user._id, rollNumber: `STU-${Date.now().toString().slice(-6)}`, semester: Number(semester) || 1 });
  }

  if (isFacultyRole(safeRole)) {
    await TeacherProfile.create({ user: user._id, designation: 'Assistant Professor' });
  }

  const safeUser = await User.findById(user._id).populate('department');
  await sendTokenResponse(safeUser, 201, res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  
  const user = await User.findOne({ email: normalizedEmail }).populate('department');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  await sendTokenResponse(user, 200, res);
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (refreshToken) {
    // Clear in database
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = '';
      await user.save();
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401);
    throw new Error('Refresh token missing');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id, refreshToken }).populate('department');

    if (!user) {
      res.status(401);
      throw new Error('Session expired or user not found');
    }

    const accessToken = generateAccessToken(user._id, normalizeRole(user.role));
    res.json({
      success: true,
      token: accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
        department: user.department,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('department');
  res.json({ success: true, user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: String(email || '').trim().toLowerCase() });
  
  if (!user) {
    // Obfuscate for security, but return success
    res.json({ success: true, message: 'If this email exists, reset instructions have been sent.' });
    return;
  }

  // Generate random token and set expiry
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  // Send stub email
  await sendResetEmail(user.email, resetToken);

  res.json({ success: true, message: 'Reset link generated successfully. See server logs.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400);
    throw new Error('Token and password are required');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = newPassword;
  user.resetPasswordToken = '';
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful. You can now log in.' });
});
