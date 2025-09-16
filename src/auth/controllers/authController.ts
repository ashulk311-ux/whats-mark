import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { User, IUser } from '../../shared/models/User';
import { Organization } from '../../shared/models/Organization';
import { logger } from '../../shared/utils/logger';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, organizationName, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
        return;
      }

      // Create organization
      const organization = new Organization({
        name: organizationName,
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          language: 'en',
          businessHours: {
            start: '09:00',
            end: '17:00',
            timezone: 'UTC'
          },
          autoReply: true,
          maxAgents: 5,
          features: ['basic_chat', 'basic_analytics']
        },
        subscription: {
          plan: 'trial',
          status: 'trial',
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          maxContacts: 1000,
          maxMessagesPerMonth: 10000,
          features: ['basic_chat', 'basic_analytics']
        }
      });

      await organization.save();

      // Create user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: 'admin',
        organizationId: organization._id,
        permissions: ['all']
      });

      await user.save();

      // Generate tokens
      const jwtSecret = process.env.JWT_SECRET as string;
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET as string;
      const accessToken = (jwt.sign as any)(
        { userId: user._id, organizationId: organization._id },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const refreshToken = (jwt.sign as any)(
        { userId: user._id },
        refreshSecret,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organizationId: user.organizationId
          },
          organization: {
            id: organization._id,
            name: organization.name,
            subscription: organization.subscription
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user with organization
      const user = await User.findOne({ email }).populate('organizationId');
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
        return;
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const jwtSecret = process.env.JWT_SECRET as string;
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET as string;
      const accessToken = (jwt.sign as any)(
        { userId: user._id, organizationId: user.organizationId },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const refreshToken = (jwt.sign as any)(
        { userId: user._id },
        refreshSecret,
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organizationId: user.organizationId,
            lastLogin: user.lastLogin
          },
          organization: user.organizationId,
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
        return;
      }

      const refreshSecret = process.env.REFRESH_TOKEN_SECRET as string;
      const decoded = jwt.verify(refreshToken, refreshSecret) as any;
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
        return;
      }

      // Generate new access token
      const jwtSecret = process.env.JWT_SECRET as string;
      const accessToken = (jwt.sign as any)(
        { userId: user._id, organizationId: user.organizationId },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        data: {
          accessToken
        }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }

  public async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      // In a production environment, you might want to blacklist the token
      // For now, we'll just return a success response
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      });
    }
  }

  public async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.user!._id).select('-password');
      const organization = await Organization.findById(req.user!.organizationId);

      res.json({
        success: true,
        data: {
          user,
          organization
        }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  public async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { firstName, lastName, phone, profilePicture } = req.body;
      const userId = req.user!._id;

      const user = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, phone, profilePicture },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
