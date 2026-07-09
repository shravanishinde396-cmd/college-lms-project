export const normalizeRole = (role = '') => {
  const value = String(role).toLowerCase();
  if (value === 'teacher') return 'faculty';
  return value;
};

export const isFacultyRole = (role = '') => normalizeRole(role) === 'faculty';
