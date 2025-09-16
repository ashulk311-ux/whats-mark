import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { logger } from '../src/shared/utils/logger';

let mongoServer: MongoMemoryServer;

// Mock logger to avoid console output during tests
jest.mock('../src/shared/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock external services
jest.mock('axios');
jest.mock('socket.io');
jest.mock('bull');

beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Close database connection
  await mongoose.disconnect();
  
  // Stop the in-memory MongoDB instance
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    organizationId: '507f1f77bcf86cd799439012',
    isActive: true,
    permissions: ['all'],
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockOrganization: () => ({
    _id: '507f1f77bcf86cd799439012',
    name: 'Test Organization',
    settings: {
      timezone: 'UTC',
      currency: 'USD',
      language: 'en',
      businessHours: {
        start: '09:00',
        end: '17:00',
        timezone: 'UTC',
      },
      autoReply: true,
      maxAgents: 5,
      features: ['basic_chat', 'basic_analytics'],
    },
    subscription: {
      plan: 'trial',
      status: 'trial',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      maxContacts: 1000,
      maxMessagesPerMonth: 10000,
      features: ['basic_chat', 'basic_analytics'],
    },
    whatsappConfig: {
      isVerified: false,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockContact: () => ({
    _id: '507f1f77bcf86cd799439013',
    organizationId: '507f1f77bcf86cd799439012',
    phoneNumber: '+1234567890',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    tags: ['vip', 'customer'],
    customFields: new Map(),
    source: 'manual',
    status: 'active',
    optOut: false,
    lastInteraction: new Date(),
    conversationId: '507f1f77bcf86cd799439014',
    assignedAgent: '507f1f77bcf86cd799439011',
    leadScore: 75,
    lifecycleStage: 'customer',
    notes: [],
    interactions: {
      totalMessages: 10,
      lastMessageAt: new Date(),
      responseRate: 80,
      averageResponseTime: 300,
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      communicationFrequency: 'medium',
      preferredContactTime: {
        start: '09:00',
        end: '17:00',
      },
    },
    metadata: new Map(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockCampaign: () => ({
    _id: '507f1f77bcf86cd799439015',
    organizationId: '507f1f77bcf86cd799439012',
    name: 'Test Campaign',
    description: 'Test campaign description',
    type: 'broadcast',
    status: 'draft',
    message: {
      type: 'text',
      content: {
        text: 'Hello, this is a test message!',
      },
    },
    recipients: {
      type: 'all',
    },
    schedule: {
      type: 'immediate',
    },
    settings: {
      rateLimit: {
        messagesPerSecond: 1,
        messagesPerMinute: 60,
        messagesPerHour: 1000,
      },
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 5000,
      },
      timezone: 'UTC',
      businessHours: {
        enabled: false,
        start: '09:00',
        end: '17:00',
        timezone: 'UTC',
      },
    },
    analytics: {
      totalRecipients: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      clicked: 0,
      replied: 0,
      optOut: 0,
    },
    createdBy: '507f1f77bcf86cd799439011',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockWhatsAppMessage: () => ({
    _id: '507f1f77bcf86cd799439016',
    organizationId: '507f1f77bcf86cd799439012',
    phoneNumberId: '123456789',
    to: '+1234567890',
    from: '123456789',
    type: 'text',
    content: {
      text: 'Hello, this is a test message!',
    },
    status: 'sent',
    messageId: 'msg_123456789',
    wamid: 'wamid_123456789',
    timestamp: new Date(),
    direction: 'outbound',
    conversationId: '507f1f77bcf86cd799439014',
    campaignId: '507f1f77bcf86cd799439015',
    flowId: null,
    agentId: '507f1f77bcf86cd799439011',
    metadata: new Map(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ userId: '507f1f77bcf86cd799439011', organizationId: '507f1f77bcf86cd799439012' })),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => 'hashed-password'),
  compare: jest.fn(() => true),
  genSalt: jest.fn(() => 'salt'),
}));

// Mock Redis
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    on: jest.fn(),
  })),
}));

// Mock Bull Queue
jest.mock('bull', () => ({
  Queue: jest.fn(() => ({
    add: jest.fn(),
    addBulk: jest.fn(),
    getJobs: jest.fn(() => []),
    process: jest.fn(),
    on: jest.fn(),
  })),
  Worker: jest.fn(() => ({
    on: jest.fn(),
  })),
}));

// Mock Socket.io
jest.mock('socket.io', () => ({
  Server: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn(() => ({
      emit: jest.fn(),
    })),
  })),
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  })),
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn(() => Promise.resolve({
          choices: [{
            message: {
              content: 'Mock AI response',
            },
          }],
        })),
      },
    },
  })),
}));

// Mock Razorpay
jest.mock('razorpay', () => ({
  Razorpay: jest.fn(() => ({
    orders: {
      create: jest.fn(() => Promise.resolve({ id: 'order_123' })),
    },
    payments: {
      capture: jest.fn(() => Promise.resolve({ id: 'payment_123' })),
    },
  })),
}));

// Mock Stripe
jest.mock('stripe', () => ({
  default: jest.fn(() => ({
    paymentIntents: {
      create: jest.fn(() => Promise.resolve({ id: 'pi_123' })),
      confirm: jest.fn(() => Promise.resolve({ id: 'pi_123' })),
    },
  })),
}));

// Mock Twilio
jest.mock('twilio', () => ({
  default: jest.fn(() => ({
    messages: {
      create: jest.fn(() => Promise.resolve({ sid: 'msg_123' })),
    },
  })),
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'msg_123' })),
  })),
}));

// Mock multer
jest.mock('multer', () => ({
  memoryStorage: jest.fn(),
  default: jest.fn(() => ({
    single: jest.fn(() => (req: any, res: any, next: any) => {
      req.file = {
        buffer: Buffer.from('test file content'),
        mimetype: 'text/plain',
        originalname: 'test.txt',
      };
      next();
    }),
  })),
}));

// Mock sharp
jest.mock('sharp', () => {
  return jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn(() => Promise.resolve(Buffer.from('processed image'))),
  }));
});

// Mock csv-parser
jest.mock('csv-parser', () => {
  return jest.fn(() => ({
    pipe: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
  }));
});

// Mock xlsx
jest.mock('xlsx', () => ({
  read: jest.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {},
    },
  })),
  utils: {
    sheet_to_json: jest.fn(() => []),
    json_to_sheet: jest.fn(() => ({})),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn(() => Buffer.from('mock excel file')),
}));

// Mock moment
jest.mock('moment', () => {
  const moment = jest.requireActual('moment');
  return moment;
});

// Mock lodash
jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

// Mock compression
jest.mock('compression', () => jest.fn(() => (req: any, res: any, next: any) => next()));

// Mock morgan
jest.mock('morgan', () => jest.fn(() => (req: any, res: any, next: any) => next()));

// Mock helmet
jest.mock('helmet', () => jest.fn(() => (req: any, res: any, next: any) => next()));

// Mock cors
jest.mock('cors', () => jest.fn(() => (req: any, res: any, next: any) => next()));

// Mock express-rate-limit
jest.mock('express-rate-limit', () => jest.fn(() => (req: any, res: any, next: any) => next()));

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn(() => ({
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    isMobilePhone: jest.fn().mockReturnThis(),
    isObject: jest.fn().mockReturnThis(),
    isString: jest.fn().mockReturnThis(),
    isArray: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
  })),
  validationResult: jest.fn(() => ({
    isEmpty: jest.fn(() => true),
    array: jest.fn(() => []),
  })),
}));

// Mock swagger-ui-express
jest.mock('swagger-ui-express', () => ({
  setup: jest.fn(),
  serve: jest.fn(),
}));

// Mock swagger-jsdoc
jest.mock('swagger-jsdoc', () => jest.fn(() => ({})));

// Mock winston
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    add: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    prettyPrint: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    File: jest.fn(),
    Console: jest.fn(),
  },
}));

// Mock joi
jest.mock('joi', () => ({
  object: jest.fn(() => ({
    validate: jest.fn(() => ({ error: null, value: {} })),
  })),
  string: jest.fn(() => ({
    required: jest.fn().mockReturnThis(),
    email: jest.fn().mockReturnThis(),
    min: jest.fn().mockReturnThis(),
    max: jest.fn().mockReturnThis(),
  })),
  number: jest.fn(() => ({
    required: jest.fn().mockReturnThis(),
    min: jest.fn().mockReturnThis(),
    max: jest.fn().mockReturnThis(),
  })),
  boolean: jest.fn(() => ({
    required: jest.fn().mockReturnThis(),
  })),
  array: jest.fn(() => ({
    required: jest.fn().mockReturnThis(),
    items: jest.fn().mockReturnThis(),
  })),
}));

// Global test timeout
jest.setTimeout(30000);
