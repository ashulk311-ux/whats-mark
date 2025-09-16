import request from 'supertest';
import express from 'express';
import { AuthController } from '../../../src/auth/controllers/authController';
import { User } from '../../../src/shared/models/User';
import { Organization } from '../../../src/shared/models/Organization';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../../src/shared/models/User');
jest.mock('../../../src/shared/models/Organization');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const MockedUser = User as jest.Mocked<typeof User>;
const MockedOrganization = Organization as jest.Mocked<typeof Organization>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthController', () => {
  let app: express.Application;
  let authController: AuthController;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    authController = new AuthController();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Test Company',
        phone: '+1234567890'
      };

      // Mock organization creation
      const mockOrganization = {
        _id: 'org123',
        name: 'Test Company',
        save: jest.fn().mockResolvedValue(true)
      };
      MockedOrganization.mockImplementation(() => mockOrganization as any);

      // Mock user creation
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        organizationId: 'org123',
        save: jest.fn().mockResolvedValue(true)
      };
      MockedUser.mockImplementation(() => mockUser as any);

      // Mock JWT signing
      mockedJwt.sign.mockReturnValue('mock-jwt-token');

      // Mock user findOne to return null (user doesn't exist)
      MockedUser.findOne.mockResolvedValue(null);

      const req = {
        body: userData
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: expect.objectContaining({
          user: expect.objectContaining({
            id: 'user123',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'admin',
            organizationId: 'org123'
          }),
          organization: expect.objectContaining({
            id: 'org123',
            name: 'Test Company'
          }),
          tokens: expect.objectContaining({
            accessToken: 'mock-jwt-token',
            refreshToken: 'mock-jwt-token'
          })
        })
      });
    });

    it('should return error if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Test Company'
      };

      // Mock user findOne to return existing user
      MockedUser.findOne.mockResolvedValue({ _id: 'existing-user' } as any);

      const req = {
        body: userData
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists with this email'
      });
    });

    it('should handle registration errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Test Company'
      };

      // Mock user findOne to throw error
      MockedUser.findOne.mockRejectedValue(new Error('Database error'));

      const req = {
        body: userData
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error during registration'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        organizationId: 'org123',
        isActive: true,
        lastLogin: new Date(),
        save: jest.fn().mockResolvedValue(true),
        comparePassword: jest.fn().mockResolvedValue(true),
        organizationId: {
          _id: 'org123',
          name: 'Test Company'
        }
      };

      // Mock user findOne with populate
      MockedUser.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      } as any);

      // Mock JWT signing
      mockedJwt.sign.mockReturnValue('mock-jwt-token');

      const req = {
        body: loginData
      } as any;

      const res = {
        json: jest.fn()
      } as any;

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: expect.objectContaining({
          user: expect.objectContaining({
            id: 'user123',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'admin',
            organizationId: 'org123'
          }),
          organization: expect.objectContaining({
            _id: 'org123',
            name: 'Test Company'
          }),
          tokens: expect.objectContaining({
            accessToken: 'mock-jwt-token',
            refreshToken: 'mock-jwt-token'
          })
        })
      });
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Mock user findOne to return null
      MockedUser.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      } as any);

      const req = {
        body: loginData
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should return error for inactive user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isActive: false,
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      MockedUser.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      } as any);

      const req = {
        body: loginData
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account is deactivated'
      });
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      MockedUser.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      } as any);

      const req = {
        body: loginData
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshData = {
        refreshToken: 'valid-refresh-token'
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isActive: true,
        organizationId: 'org123'
      };

      // Mock JWT verify
      mockedJwt.verify.mockReturnValue({ userId: 'user123' } as any);

      // Mock user findById
      MockedUser.findById.mockResolvedValue(mockUser as any);

      // Mock JWT sign for new access token
      mockedJwt.sign.mockReturnValue('new-access-token');

      const req = {
        body: refreshData
      } as any;

      const res = {
        json: jest.fn()
      } as any;

      await authController.refreshToken(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          accessToken: 'new-access-token'
        }
      });
    });

    it('should return error for missing refresh token', async () => {
      const req = {
        body: {}
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Refresh token required'
      });
    });

    it('should return error for invalid refresh token', async () => {
      const refreshData = {
        refreshToken: 'invalid-refresh-token'
      };

      // Mock JWT verify to throw error
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const req = {
        body: refreshData
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid refresh token'
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const req = {
        user: { _id: 'user123' }
      } as any;

      const res = {
        json: jest.fn()
      } as any;

      await authController.logout(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful'
      });
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        organizationId: 'org123'
      };

      const mockOrganization = {
        _id: 'org123',
        name: 'Test Company',
        settings: {
          timezone: 'UTC',
          currency: 'USD'
        }
      };

      // Mock user findById
      MockedUser.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      } as any);

      // Mock organization findById
      MockedOrganization.findById.mockResolvedValue(mockOrganization as any);

      const req = {
        user: { _id: 'user123' }
      } as any;

      const res = {
        json: jest.fn()
      } as any;

      await authController.getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser,
          organization: mockOrganization
        }
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1234567890'
      };

      const mockUpdatedUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1234567890'
      };

      // Mock user findByIdAndUpdate
      MockedUser.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser)
      } as any);

      const req = {
        user: { _id: 'user123' },
        body: updateData
      } as any;

      const res = {
        json: jest.fn()
      } as any;

      await authController.updateProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        data: { user: mockUpdatedUser }
      });
    });
  });
});
