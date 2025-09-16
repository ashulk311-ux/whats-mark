"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const validation_1 = require("../../shared/middleware/validation");
const router = (0, express_1.Router)();
const authController = new authController_1.AuthController();
const registerValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    (0, express_validator_1.body)('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    (0, express_validator_1.body)('organizationName').trim().isLength({ min: 1 }).withMessage('Organization name is required'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required')
];
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
];
const refreshTokenValidation = [
    (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token is required')
];
const updateProfileValidation = [
    (0, express_validator_1.body)('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
    (0, express_validator_1.body)('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('profilePicture').optional().isURL().withMessage('Valid URL is required')
];
router.post('/register', registerValidation, validation_1.validateRequest, authController.register);
router.post('/login', loginValidation, validation_1.validateRequest, authController.login);
router.post('/refresh-token', refreshTokenValidation, validation_1.validateRequest, authController.refreshToken);
router.get('/profile', auth_1.authenticateToken, authController.getProfile);
router.put('/profile', auth_1.authenticateToken, updateProfileValidation, validation_1.validateRequest, authController.updateProfile);
router.post('/logout', auth_1.authenticateToken, authController.logout);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map