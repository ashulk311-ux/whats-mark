const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'WhatsApp Marketing Platform is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    version: '1.0.0',
    features: [
      'WhatsApp Business API Integration',
      'Contact Management',
      'Campaign Broadcasting',
      'Real-time Chat',
      'Analytics Dashboard',
      'Multi-tenant Support'
    ]
  });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, organizationName } = req.body;
  
  if (!email || !password || !firstName || !lastName || !organizationName) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  // Mock registration response
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: 'user_123',
        email,
        firstName,
        lastName,
        role: 'admin',
        organizationId: 'org_123'
      },
      organization: {
        id: 'org_123',
        name: organizationName,
        subscription: {
          plan: 'trial',
          status: 'trial'
        }
      },
      tokens: {
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Mock login response
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: 'user_123',
        email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        organizationId: 'org_123',
        lastLogin: new Date().toISOString()
      },
      organization: {
        id: 'org_123',
        name: 'Test Company'
      },
      tokens: {
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }
    }
  });
});

// WhatsApp routes
app.post('/api/whatsapp/send-message', (req, res) => {
  const { to, type, content } = req.body;
  
  if (!to || !type || !content) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  // Mock message sending
  res.json({
    success: true,
    message: 'Message sent successfully',
    data: {
      message: {
        id: 'msg_123',
        to,
        type,
        content,
        status: 'sent',
        wamid: 'wamid_123456789',
        timestamp: new Date().toISOString(),
        direction: 'outbound'
      }
    }
  });
});

// Contacts routes
app.get('/api/contacts', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  // Mock contacts response
  res.json({
    success: true,
    data: {
      contacts: [
        {
          id: 'contact_1',
          phoneNumber: '+1234567890',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          tags: ['vip', 'customer'],
          status: 'active',
          lastInteraction: new Date().toISOString()
        },
        {
          id: 'contact_2',
          phoneNumber: '+1234567891',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          tags: ['customer'],
          status: 'active',
          lastInteraction: new Date().toISOString()
        }
      ],
      total: 2,
      page: parseInt(page),
      totalPages: 1
    }
  });
});

// Campaigns routes
app.get('/api/campaigns', (req, res) => {
  // Mock campaigns response
  res.json({
    success: true,
    data: {
      campaigns: [
        {
          id: 'campaign_1',
          name: 'Welcome Campaign',
          description: 'Welcome new users',
          type: 'broadcast',
          status: 'running',
          analytics: {
            totalRecipients: 100,
            sent: 80,
            delivered: 75,
            read: 60,
            failed: 5
          },
          createdAt: new Date().toISOString()
        }
      ],
      total: 1,
      page: 1,
      totalPages: 1
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Marketing Platform server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/status`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  /health - Health check`);
  console.log(`  GET  /api/status - API status`);
  console.log(`  POST /api/auth/register - User registration`);
  console.log(`  POST /api/auth/login - User login`);
  console.log(`  POST /api/whatsapp/send-message - Send WhatsApp message`);
  console.log(`  GET  /api/contacts - Get contacts`);
  console.log(`  GET  /api/campaigns - Get campaigns`);
});

module.exports = app;
