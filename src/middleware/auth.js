/**
 * Simple authentication and admin middleware without JWT
 * -------------------------------------------------------
 * For prototype or local-only usage.
 * 
 * - Uses a basic "x-user-email" header to identify users.
 * - Uses a simple admin bypass: if `isAdmin` flag is true or 
 *   header contains admin email, grants access.
 * 
 * In production, replace this with proper session or JWT handling.
 */

import User from '../models/User.js';

// Basic protection: verify user by email header
export const protect = async (req, res, next) => {
  try {
    const email = req.headers['x-user-email'];
    if (!email) {
      return res.status(401).json({ error: 'No user email header provided' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Admin-only route guard
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};
