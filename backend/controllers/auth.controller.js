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
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken: incomingRefreshToken } = req.body;
  if (!incomingRefreshToken) {
    return res.status(400).json({ message: 'Refresh token is required.' });
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

    return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error(err.message);
    return res.status(403).json({ message: 'Refresh token is invalid or expired.' });
  }
};

const logout = async (req, res) => {
  const { refreshToken: incomingRefreshToken } = req.body;
  if (!incomingRefreshToken) {
    return res.status(400).json({ message: 'Refresh token is required.' });
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, config.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.refreshToken === incomingRefreshToken) {
      user.refreshToken = null;
      await user.save();
    }

    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (err) {
    return res.status(200).json({ message: 'Logged out successfully.' });
  }
};

export { register, login, refreshToken, logout };
