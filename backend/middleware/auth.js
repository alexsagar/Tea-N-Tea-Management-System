import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Support for both Authorization: Bearer ... and auth-token header
    let token =
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.header('auth-token');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or inactive user' });
    }

    // Attach user info (including shopId) to req.user for all downstream logic
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      shopId: user.shopId,
      permissions: user.permissions || [],
      name: user.name,
      email: user.email
      // ...add more as needed
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      // Always get user from req.user set by authMiddleware
      const { role, permissions } = req.user;

      // Admin has all permissions
      if (role === 'admin') {
        return next();
      }

      // Check if the permission exists for this module/action
      const hasPermission = Array.isArray(permissions)
        ? permissions.some(
            (perm) =>
              perm.module === module &&
              (Array.isArray(perm.actions)
                ? perm.actions.includes(action)
                : perm[action] === true)
          )
        : false;

      if (!hasPermission) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};
