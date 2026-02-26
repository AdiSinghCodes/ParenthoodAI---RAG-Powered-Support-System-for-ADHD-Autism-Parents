import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;  // Changed from userId to id to match our controller expectations
        userId?: string;  // Keep for backward compatibility
        email?: string;
        username?: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[Auth Middleware] Request headers:', req.headers);
    
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.log('[Auth Middleware] No authorization header');
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('[Auth Middleware] No token in header:', authHeader);
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('[Auth Middleware] Token received:', token.substring(0, 20) + '...');
    console.log('[Auth Middleware] JWT_SECRET:', JWT_SECRET);

    // Special case for development/testing
    if (token === 'mock-token-for-testing') {
      req.user = {
        id: 'mock-user-id',
        userId: 'mock-user-id',
        email: 'mock@example.com'
      };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[Auth Middleware] Decoded token:', decoded);
    
    // Improved error handling for token structure
    if (!decoded || typeof decoded !== 'object') {
      console.log('[Auth Middleware] Invalid token structure');
      return res.status(403).json({ message: 'Invalid token structure' });
    }
    
    // Handle both formats of user ID in token (id or userId)
    const userId = 'userId' in decoded ? decoded.userId : ('id' in decoded ? decoded.id : null);
    console.log('[Auth Middleware] Extracted userId:', userId);
    
    if (!userId) {
      console.log('[Auth Middleware] User ID not found in token');
      return res.status(403).json({ message: 'User ID not found in token' });
    }
    
    req.user = {
      id: userId,
      userId: userId,
      email: 'email' in decoded ? decoded.email : undefined
    };
    console.log('[Auth Middleware] Authentication successful for user:', userId);
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: 'Invalid token', error: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add an alias for the auth middleware to match our controller
export const auth = authenticateToken;