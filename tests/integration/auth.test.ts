import request from 'supertest';
import { app } from '../../index';
import { User } from '../../src/shared/models/User';
import { Organization } from '../../src/shared/models/Organization';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    // Clear all collections before each test
    await User.deleteMany({});
    await Organization.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Test Company',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.lastName).toBe(userData.lastName);
      expect(response.body.data.organization.name).toBe(userData.organizationName);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user?.firstName).toBe(userData.firstName);
      expect(user?.lastName).toBe(userData.lastName);
      expect(user?.role).toBe('admin');

      // Verify organization was created
      const organization = await Organization.findById(user?.organizationId);
      expect(organization).toBeTruthy();
      expect(organization?.name).toBe(userData.organizationName);
    });

    it('should return error if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Test Company'
      };

      // Create existing user
      const organization = new Organization({
        name: 'Existing Company',
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
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          maxContacts: 1000,
          maxMessagesPerMonth: 10000,
          features: ['basic_chat', 'basic_analytics']
        }
      });
      await organization.save();

      const user = new User({
        email: userData.email,
        password: 'hashedpassword',
        firstName: 'Existing',
        lastName: 'User',
        role: 'admin',
        organizationId: organization._id,
        permissions: ['all']
      });
      await user.save();

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists with this email');
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        firstName: '',
        lastName: '',
        organizationName: ''
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    let organization: any;
    let user: any;

    beforeEach(async () => {
      // Create test organization
      organization = new Organization({
        name: 'Test Company',
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
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          maxContacts: 1000,
          maxMessagesPerMonth: 10000,
          features: ['basic_chat', 'basic_analytics']
        }
      });
      await organization.save();

      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 12);
      user = new User({
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        organizationId: organization._id,
        permissions: ['all'],
        isActive: true
      });
      await user.save();
    });

    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.user.firstName).toBe('John');
      expect(response.body.data.user.lastName).toBe('Doe');
      expect(response.body.data.organization.name).toBe('Test Company');
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();

      // Verify lastLogin was updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.lastLogin).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return error for inactive user', async () => {
      // Deactivate user
      user.isActive = false;
      await user.save();

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account is deactivated');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let organization: any;
    let user: any;
    let refreshToken: string;

    beforeEach(async () => {
      // Create test organization
      organization = new Organization({
        name: 'Test Company',
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
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          maxContacts: 1000,
          maxMessagesPerMonth: 10000,
          features: ['basic_chat', 'basic_analytics']
        }
      });
      await organization.save();

      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 12);
      user = new User({
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        organizationId: organization._id,
        permissions: ['all'],
        isActive: true
      });
      await user.save();

      // Generate refresh token
      refreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret',
        { expiresIn: '30d' }
      );
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();

      // Verify the new token is valid
      const decoded = jwt.verify(
        response.body.data.accessToken,
        process.env.JWT_SECRET || 'test-jwt-secret'
      ) as any;
      expect(decoded.userId).toBe(user._id.toString());
      expect(decoded.organizationId).toBe(organization._id.toString());
    });

    it('should return error for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Refresh token required');
    });

    it('should return error for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid refresh token');
    });

    it('should return error for inactive user', async () => {
      // Deactivate user
      user.isActive = false;
      await user.save();

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid refresh token');
    });
  });

  describe('GET /api/auth/profile', () => {
    let organization: any;
    let user: any;
    let accessToken: string;

    beforeEach(async () => {
      // Create test organization
      organization = new Organization({
        name: 'Test Company',
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
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          maxContacts: 1000,
          maxMessagesPerMonth: 10000,
          features: ['basic_chat', 'basic_analytics']
        }
      });
      await organization.save();

      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 12);
      user = new User({
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        organizationId: organization._id,
        permissions: ['all'],
        isActive: true
      });
      await user.save();

      // Generate access token
      accessToken = jwt.sign(
        { userId: user._id, organizationId: organization._id },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: '7d' }
      );
    });

    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.firstName).toBe('John');
      expect(response.body.data.user.lastName).toBe('Doe');
      expect(response.body.data.organization.name).toBe('Test Company');
    });

    it('should return error for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let organization: any;
    let user: any;
    let accessToken: string;

    beforeEach(async () => {
      // Create test organization
      organization = new Organization({
        name: 'Test Company',
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
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          maxContacts: 1000,
          maxMessagesPerMonth: 10000,
          features: ['basic_chat', 'basic_analytics']
        }
      });
      await organization.save();

      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 12);
      user = new User({
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        organizationId: organization._id,
        permissions: ['all'],
        isActive: true
      });
      await user.save();

      // Generate access token
      accessToken = jwt.sign(
        { userId: user._id, organizationId: organization._id },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: '7d' }
      );
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1234567890'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data.user.firstName).toBe(updateData.firstName);
      expect(response.body.data.user.lastName).toBe(updateData.lastName);
      expect(response.body.data.user.phone).toBe(updateData.phone);

      // Verify user was updated in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.firstName).toBe(updateData.firstName);
      expect(updatedUser?.lastName).toBe(updateData.lastName);
      expect(updatedUser?.phone).toBe(updateData.phone);
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        firstName: '',
        lastName: '',
        phone: 'invalid-phone'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    let organization: any;
    let user: any;
    let accessToken: string;

    beforeEach(async () => {
      // Create test organization
      organization = new Organization({
        name: 'Test Company',
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
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          maxContacts: 1000,
          maxMessagesPerMonth: 10000,
          features: ['basic_chat', 'basic_analytics']
        }
      });
      await organization.save();

      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 12);
      user = new User({
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        organizationId: organization._id,
        permissions: ['all'],
        isActive: true
      });
      await user.save();

      // Generate access token
      accessToken = jwt.sign(
        { userId: user._id, organizationId: organization._id },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: '7d' }
      );
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });
});
