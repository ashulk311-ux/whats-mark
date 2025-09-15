# WhatsApp Marketing Automation Platform

A production-ready, enterprise-class WhatsApp marketing automation platform that leverages the latest technologies for reliability, scalability, and extensibility.

## 🚀 Features

### Core Features
- **WhatsApp Business API Integration**: Full integration with Meta Cloud API
- **Multi-tenant Architecture**: Support for multiple brands/accounts with multi-user roles
- **Scalable Broadcasting Engine**: Handle several lakh daily messages with rate limiting
- **Advanced Contact Management**: Import, segment, tag, filter, and export contacts
- **Drag-and-Drop Chatbot Builder**: Intuitive flow builder with conditional logic
- **AI/NLP Integration**: OpenAI GPT-4, Google Dialogflow integration
- **Multi-agent Shared Inbox**: Web-based live chat with agent routing
- **Campaign Management**: Scheduling, drip marketing, behavioral triggers
- **Payment Integration**: Seamless payments using Razorpay, Paytm, Stripe, UPI
- **Multi-channel Support**: Email, SMS, and push notifications

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with scalable schema design
- **Queue System**: Redis with Bull for job processing
- **Message Broker**: Kafka for reliable message handling
- **Authentication**: JWT with OAuth 2.0 and RBAC
- **Real-time**: Socket.io for WebSocket connections

### Frontend Stack
- **Framework**: React.js with TypeScript
- **UI Library**: Material-UI (MUI) for modern design
- **State Management**: React Query for server state
- **Routing**: React Router for navigation
- **Forms**: React Hook Form with Yup validation
- **Charts**: Recharts for analytics visualization

## 📦 Installation

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whatsapp-marketing-platform
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/whatsapp-marketing
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id

# AI/NLP Configuration
OPENAI_API_KEY=your-openai-api-key

# Payment Gateway Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

## 🚀 Deployment

### Docker Deployment

```bash
docker build -t whatsapp-marketing-platform .
docker-compose up -d
```

### Kubernetes Deployment

```bash
kubectl apply -f k8s/
```

## 📚 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "My Company"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### WhatsApp API

#### Send Message
```http
POST /api/whatsapp/send-message
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "to": "+1234567890",
  "type": "text",
  "content": {
    "text": "Hello, this is a test message!"
  }
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- SSL/TLS encryption for data in transit
- Comprehensive input validation
- API rate limiting
- GDPR compliance

## 📊 Monitoring

- Structured logging with Winston
- Health checks and performance metrics
- Error tracking and alerting
- Resource monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- [GitHub Issues](https://github.com/your-org/whatsapp-marketing-platform/issues)
- Email: support@yourcompany.com

---

**Built with ❤️ by the WhatsApp Marketing Platform Team**# whats-mark
