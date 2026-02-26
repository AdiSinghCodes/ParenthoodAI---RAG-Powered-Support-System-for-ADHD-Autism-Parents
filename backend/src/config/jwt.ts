// Centralized JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

console.log('[JWT Config] JWT_SECRET loaded:', JWT_SECRET);
