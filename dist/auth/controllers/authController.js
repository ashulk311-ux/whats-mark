"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const User_1 = require("../../shared/models/User");
const Organization_1 = require("../../shared/models/Organization");
const logger_1 = require("../../shared/utils/logger");
class AuthController {
    async register(req, res) {
        try {
            const { email, password, firstName, lastName, organizationName, phone } = req.body;
            const existingUser = await User_1.User.findOne({ email });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
                return;
            }
            const organization = new Organization_1.Organization({
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
                    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    maxContacts: 1000,
                    maxMessagesPerMonth: 10000,
                    features: ['basic_chat', 'basic_analytics']
                }
            });
            await organization.save();
            const user = new User_1.User({
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
            const jwtSecret = process.env.JWT_SECRET;
            const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
            const accessToken = jwt.sign({ userId: user._id, organizationId: organization._id }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
            const refreshToken = jwt.sign({ userId: user._id }, refreshSecret, { expiresIn: '30d' });
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
        }
        catch (error) {
            logger_1.logger.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during registration'
            });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User_1.User.findOne({ email }).populate('organizationId');
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }
            if (!user.isActive) {
                res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
                return;
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }
            user.lastLogin = new Date();
            await user.save();
            const jwtSecret = process.env.JWT_SECRET;
            const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
            const accessToken = jwt.sign({ userId: user._id, organizationId: user.organizationId }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
            const refreshToken = jwt.sign({ userId: user._id }, refreshSecret, { expiresIn: '30d' });
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
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during login'
            });
        }
    }
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(401).json({
                    success: false,
                    message: 'Refresh token required'
                });
                return;
            }
            const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
            const decoded = jwt.verify(refreshToken, refreshSecret);
            const user = await User_1.User.findById(decoded.userId);
            if (!user || !user.isActive) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
                return;
            }
            const jwtSecret = process.env.JWT_SECRET;
            const accessToken = jwt.sign({ userId: user._id, organizationId: user.organizationId }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
            res.json({
                success: true,
                data: {
                    accessToken
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Token refresh error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
    }
    async logout(req, res) {
        try {
            res.json({
                success: true,
                message: 'Logout successful'
            });
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during logout'
            });
        }
    }
    async getProfile(req, res) {
        try {
            const user = await User_1.User.findById(req.user._id).select('-password');
            const organization = await Organization_1.Organization.findById(req.user.organizationId);
            res.json({
                success: true,
                data: {
                    user,
                    organization
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async updateProfile(req, res) {
        try {
            const { firstName, lastName, phone, profilePicture } = req.body;
            const userId = req.user._id;
            const user = await User_1.User.findByIdAndUpdate(userId, { firstName, lastName, phone, profilePicture }, { new: true, runValidators: true }).select('-password');
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { user }
            });
        }
        catch (error) {
            logger_1.logger.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map