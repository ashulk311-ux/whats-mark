import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsappController';
import { authenticateToken, requireRole, requirePermission } from '../../auth/middleware/auth';
import { body } from 'express-validator';
import { validateRequest } from '../../shared/middleware/validation';
import multer from 'multer';

const router: Router = Router();
const whatsappController = new WhatsAppController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'video/mp4', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, audio, video, and documents are allowed.'));
    }
  }
});

// Validation rules
const sendMessageValidation = [
  body('to').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('type').isIn(['text', 'image', 'document', 'audio', 'video', 'location', 'contact', 'template', 'interactive']).withMessage('Valid message type is required'),
  body('content').isObject().withMessage('Content is required'),
  body('conversationId').optional().isString(),
  body('campaignId').optional().isString(),
  body('flowId').optional().isString()
];

const sendTemplateValidation = [
  body('to').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('template').isObject().withMessage('Template is required'),
  body('template.name').isString().withMessage('Template name is required'),
  body('template.language').isString().withMessage('Template language is required'),
  body('conversationId').optional().isString()
];

const sendInteractiveValidation = [
  body('to').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('interactive').isObject().withMessage('Interactive content is required'),
  body('conversationId').optional().isString()
];

const createTemplateValidation = [
  body('template').isObject().withMessage('Template is required'),
  body('template.name').isString().withMessage('Template name is required'),
  body('template.language').isString().withMessage('Template language is required'),
  body('template.category').isString().withMessage('Template category is required'),
  body('template.components').isArray().withMessage('Template components are required')
];

const updateProfileValidation = [
  body('profile').isObject().withMessage('Profile is required')
];

// Public webhook route (no authentication required)
router.post('/webhook', whatsappController.webhook);

// Protected routes
router.post('/send-message', 
  authenticateToken, 
  requirePermission('send_messages'),
  sendMessageValidation, 
  validateRequest, 
  whatsappController.sendMessage
);

router.post('/send-template', 
  authenticateToken, 
  requirePermission('send_messages'),
  sendTemplateValidation, 
  validateRequest, 
  whatsappController.sendTemplateMessage
);

router.post('/send-interactive', 
  authenticateToken, 
  requirePermission('send_messages'),
  sendInteractiveValidation, 
  validateRequest, 
  whatsappController.sendInteractiveMessage
);

router.post('/upload-media', 
  authenticateToken, 
  requirePermission('upload_media'),
  upload.single('media'),
  whatsappController.uploadMedia
);

router.get('/templates', 
  authenticateToken, 
  requirePermission('view_templates'),
  whatsappController.getMessageTemplates
);

router.post('/templates', 
  authenticateToken, 
  requireRole(['admin', 'manager']),
  requirePermission('create_templates'),
  createTemplateValidation, 
  validateRequest, 
  whatsappController.createMessageTemplate
);

router.get('/business-profile', 
  authenticateToken, 
  requirePermission('view_business_profile'),
  whatsappController.getBusinessProfile
);

router.put('/business-profile', 
  authenticateToken, 
  requireRole(['admin', 'manager']),
  requirePermission('update_business_profile'),
  updateProfileValidation, 
  validateRequest, 
  whatsappController.updateBusinessProfile
);

export default router;
