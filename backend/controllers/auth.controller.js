import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import config from '../config/config.js';

function createAccessToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    config.JWT_SECRET,
    { expiresIn: config.ACCESS_TOKEN_EXPIRES_IN }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRES_IN }
  );
}

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const existingUserByName = await User.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existingUserByName) {
      return res.status(409).json({ message: 'Username is already taken.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Username/Email and password are required.' });
  }

  try {
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { name: new RegExp(`^${email.trim()}$`, 'i') }
      ]
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username/email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username/email or password.' });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    const allowedEmails = (config.ADMIN_EMAIL || 'admin@gusto.com')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = allowedEmails.includes(user.email.toLowerCase());

    // Set refresh token as httpOnly cookie (secure:false for localhost HTTP)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: isAdmin
      }
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

const refreshToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    return res.status(401).json({ message: 'Refresh token is required.' });
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, config.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err.message);
    return res.status(403).json({ message: 'Refresh token is invalid or expired.' });
  }
};

const logout = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  try {
    if (incomingRefreshToken) {
      const decoded = jwt.verify(incomingRefreshToken, config.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.refreshToken === incomingRefreshToken) {
        user.refreshToken = null;
        await user.save();
      }
    }
  } catch (err) {
    // Token may be expired/invalid, still clear the cookie
  }

  // Clear the refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return res.status(200).json({ message: 'Logged out successfully.' });
};

export { register, login, refreshToken, logout };
