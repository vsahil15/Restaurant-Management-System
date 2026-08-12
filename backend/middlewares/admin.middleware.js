import config from '../config/config.js';

export const adminOnly = (req, res, next) => {
  if (!req.user?.email) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const allowedEmails = (config.ADMIN_EMAIL || 'admin@gusto.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = req.user.email.toLowerCase();

  if (!allowedEmails.includes(userEmail)) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  next();
};
