import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';

// Mock users for development (in production, this would come from database)
const mockUsers = [
  {
    id: 1,
    email: 'admin@beyblade.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
  },
  {
    id: 2,
    email: 'organizer@beyblade.com',
    password: 'organizer123',
    role: 'organizer',
    name: 'Tournament Organizer',
  },
  {
    id: 3,
    email: 'staff@beyblade.com',
    password: 'staff123',
    role: 'staff',
    name: 'Staff Member',
  },
];

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required',
        });
      }

      // Find user (in production, this would be a database query with hashed passwords)
      const user = mockUsers.find(
        u => u.email === email && u.password === password
      );

      if (!user) {
        logger.warn(`Failed login attempt for email: ${email}`);
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password',
        });
      }

      // Generate JWT token
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        logger.error('JWT_SECRET not configured');
        return res.status(500).json({
          status: 'error',
          message: 'Server configuration error',
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      logger.info(`User logged in: ${user.email}`);

      res.json({
        status: 'success',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
          },
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  },

  async me(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      // In production, you'd fetch full user data from database
      const userData = mockUsers.find(u => u.email === user.email);

      if (!userData) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      res.json({
        status: 'success',
        data: {
          user: {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            name: userData.name,
          },
        },
      });
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  },
};
