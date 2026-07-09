import { normalizeRole } from '../utils/roleHelpers.js';

export const authorize = (...roles) => (req, res, next) => {
  const allowed = roles.map(normalizeRole);
  const actual = normalizeRole(req.user?.role);
  if (!req.user || !allowed.includes(actual)) {
    res.status(403);
    throw new Error('Access denied');
  }
  next();
};
