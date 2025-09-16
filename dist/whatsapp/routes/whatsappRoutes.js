"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const whatsappController_1 = require("../controllers/whatsappController");
const auth_1 = require("../../auth/middleware/auth");
const express_validator_1 = require("express-validator");
const validation_1 = require("../../shared/middleware/validation");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const whatsappController = new whatsappController_1.WhatsAppController();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760')
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'video/mp4', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only images, audio, video, and documents are allowed.'));
        }
    }
});
const sendMessageValidation = [
    (0, express_validator_1.body)('to').isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('type').isIn(['text', 'image', 'document', 'audio', 'video', 'location', 'contact', 'template', 'interactive']).withMessage('Valid message type is required'),
    (0, express_validator_1.body)('content').isObject().withMessage('Content is required'),
    (0, express_validator_1.body)('conversationId').optional().isString(),
    (0, express_validator_1.body)('campaignId').optional().isString(),
    (0, express_validator_1.body)('flowId').optional().isString()
];
const sendTemplateValidation = [
    (0, express_validator_1.body)('to').isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('template').isObject().withMessage('Template is required'),
    (0, express_validator_1.body)('template.name').isString().withMessage('Template name is required'),
    (0, express_validator_1.body)('template.language').isString().withMessage('Template language is required'),
    (0, express_validator_1.body)('conversationId').optional().isString()
];
const sendInteractiveValidation = [
    (0, express_validator_1.body)('to').isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('interactive').isObject().withMessage('Interactive content is required'),
    (0, express_validator_1.body)('conversationId').optional().isString()
];
const createTemplateValidation = [
    (0, express_validator_1.body)('template').isObject().withMessage('Template is required'),
    (0, express_validator_1.body)('template.name').isString().withMessage('Template name is required'),
    (0, express_validator_1.body)('template.language').isString().withMessage('Template language is required'),
    (0, express_validator_1.body)('template.category').isString().withMessage('Template category is required'),
    (0, express_validator_1.body)('template.components').isArray().withMessage('Template components are required')
];
const updateProfileValidation = [
    (0, express_validator_1.body)('profile').isObject().withMessage('Profile is required')
];
router.post('/webhook', whatsappController.webhook);
router.post('/send-message', auth_1.authenticateToken, (0, auth_1.requirePermission)('send_messages'), sendMessageValidation, validation_1.validateRequest, whatsappController.sendMessage);
router.post('/send-template', auth_1.authenticateToken, (0, auth_1.requirePermission)('send_messages'), sendTemplateValidation, validation_1.validateRequest, whatsappController.sendTemplateMessage);
router.post('/send-interactive', auth_1.authenticateToken, (0, auth_1.requirePermission)('send_messages'), sendInteractiveValidation, validation_1.validateRequest, whatsappController.sendInteractiveMessage);
router.post('/upload-media', auth_1.authenticateToken, (0, auth_1.requirePermission)('upload_media'), upload.single('media'), whatsappController.uploadMedia);
router.get('/templates', auth_1.authenticateToken, (0, auth_1.requirePermission)('view_templates'), whatsappController.getMessageTemplates);
router.post('/templates', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin', 'manager']), (0, auth_1.requirePermission)('create_templates'), createTemplateValidation, validation_1.validateRequest, whatsappController.createMessageTemplate);
router.get('/business-profile', auth_1.authenticateToken, (0, auth_1.requirePermission)('view_business_profile'), whatsappController.getBusinessProfile);
router.put('/business-profile', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin', 'manager']), (0, auth_1.requirePermission)('update_business_profile'), updateProfileValidation, validation_1.validateRequest, whatsappController.updateBusinessProfile);
exports.default = router;
//# sourceMappingURL=whatsappRoutes.js.map