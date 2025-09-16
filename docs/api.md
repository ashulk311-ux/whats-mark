# API Documentation

## Base URL
```
Production: https://api.yourdomain.com/api
Development: http://localhost:3000/api
```

## Authentication

All API endpoints require authentication except for webhook endpoints and public routes. Include the access token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "My Company",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "organizationId": "org_id"
    },
    "organization": {
      "id": "org_id",
      "name": "My Company",
      "subscription": {
        "plan": "trial",
        "status": "trial"
      }
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "organizationId": "org_id",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "organization": {
      "id": "org_id",
      "name": "My Company"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### Refresh Token
```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token"
  }
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "organizationId": "org_id"
    },
    "organization": {
      "id": "org_id",
      "name": "My Company",
      "settings": {
        "timezone": "UTC",
        "currency": "USD"
      }
    }
  }
}
```

## WhatsApp Endpoints

### Send Message
```http
POST /whatsapp/send-message
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "to": "+1234567890",
  "type": "text",
  "content": {
    "text": "Hello, this is a test message!"
  },
  "conversationId": "optional-conversation-id",
  "campaignId": "optional-campaign-id",
  "flowId": "optional-flow-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "id": "message_id",
      "to": "+1234567890",
      "type": "text",
      "content": {
        "text": "Hello, this is a test message!"
      },
      "status": "sent",
      "wamid": "whatsapp_message_id",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "direction": "outbound"
    }
  }
}
```

### Send Template Message
```http
POST /whatsapp/send-template
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "to": "+1234567890",
  "template": {
    "name": "hello_world",
    "language": "en_US",
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "John"
          }
        ]
      }
    ]
  },
  "conversationId": "optional-conversation-id"
}
```

### Send Interactive Message
```http
POST /whatsapp/send-interactive
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "to": "+1234567890",
  "interactive": {
    "type": "button",
    "header": {
      "type": "text",
      "text": "Welcome!"
    },
    "body": {
      "text": "Please choose an option:"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "option1",
            "title": "Option 1"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "option2",
            "title": "Option 2"
          }
        }
      ]
    }
  }
}
```

### Upload Media
```http
POST /whatsapp/upload-media
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: [media file]
```

**Response:**
```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": {
    "mediaId": "media_id"
  }
}
```

### Get Message Templates
```http
GET /whatsapp/templates
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "template_id",
        "name": "hello_world",
        "status": "APPROVED",
        "category": "UTILITY",
        "language": "en_US",
        "components": [
          {
            "type": "BODY",
            "text": "Hello {{1}}!"
          }
        ]
      }
    ]
  }
}
```

### Create Message Template
```http
POST /whatsapp/templates
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "template": {
    "name": "my_template",
    "language": "en_US",
    "category": "UTILITY",
    "components": [
      {
        "type": "BODY",
        "text": "Hello {{1}}! This is a test message."
      }
    ]
  }
}
```

## Contacts Endpoints

### Get Contacts
```http
GET /contacts?page=1&limit=20&search=john&tags=vip,customer&status=active
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term for name, phone, or email
- `tags`: Comma-separated list of tags
- `status`: Contact status (active, inactive, blocked, opt_out)
- `lifecycleStage`: Lifecycle stage (new, engaged, qualified, customer, churned)
- `assignedAgent`: Assigned agent ID

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "contact_id",
        "phoneNumber": "+1234567890",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "tags": ["vip", "customer"],
        "status": "active",
        "lifecycleStage": "customer",
        "lastInteraction": "2024-01-01T00:00:00.000Z",
        "assignedAgent": {
          "id": "agent_id",
          "firstName": "Agent",
          "lastName": "Name"
        }
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}
```

### Create Contact
```http
POST /contacts
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "tags": ["vip", "customer"],
  "customFields": {
    "company": "Acme Corp",
    "industry": "Technology"
  }
}
```

### Update Contact
```http
PUT /contacts/{contactId}
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "tags": ["vip", "premium"],
  "lifecycleStage": "customer"
}
```

### Delete Contact
```http
DELETE /contacts/{contactId}
Authorization: Bearer <access-token>
```

### Import Contacts
```http
POST /contacts/import
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: [CSV or Excel file]
```

**Response:**
```json
{
  "success": true,
  "message": "Contacts imported successfully",
  "data": {
    "total": 100,
    "success": 95,
    "failed": 5,
    "errors": [
      {
        "row": 10,
        "error": "Invalid phone number format"
      }
    ]
  }
}
```

### Export Contacts
```http
GET /contacts/export?format=csv&tags=vip,customer
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `format`: Export format (csv, xlsx)
- `tags`: Comma-separated list of tags to filter
- `status`: Contact status filter
- `lifecycleStage`: Lifecycle stage filter

## Campaigns Endpoints

### Get Campaigns
```http
GET /campaigns?page=1&limit=20&status=running
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "campaign_id",
        "name": "Summer Sale Campaign",
        "description": "Promoting summer sale",
        "type": "broadcast",
        "status": "running",
        "analytics": {
          "totalRecipients": 1000,
          "sent": 800,
          "delivered": 750,
          "read": 600,
          "failed": 50
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

### Create Campaign
```http
POST /campaigns
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "Summer Sale Campaign",
  "description": "Promoting summer sale to all customers",
  "type": "broadcast",
  "message": {
    "type": "text",
    "content": {
      "text": "🎉 Summer Sale is here! Get 50% off on all items. Shop now!"
    }
  },
  "recipients": {
    "type": "all"
  },
  "schedule": {
    "type": "immediate"
  },
  "settings": {
    "rateLimit": {
      "messagesPerSecond": 1,
      "messagesPerMinute": 60,
      "messagesPerHour": 1000
    },
    "businessHours": {
      "enabled": true,
      "start": "09:00",
      "end": "17:00",
      "timezone": "UTC"
    }
  }
}
```

### Start Campaign
```http
POST /campaigns/{campaignId}/start
Authorization: Bearer <access-token>
```

### Pause Campaign
```http
POST /campaigns/{campaignId}/pause
Authorization: Bearer <access-token>
```

### Resume Campaign
```http
POST /campaigns/{campaignId}/resume
Authorization: Bearer <access-token>
```

### Cancel Campaign
```http
POST /campaigns/{campaignId}/cancel
Authorization: Bearer <access-token>
```

### Get Campaign Analytics
```http
GET /campaigns/{campaignId}/analytics
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "campaign_id",
      "name": "Summer Sale Campaign",
      "status": "completed"
    },
    "analytics": {
      "totalRecipients": 1000,
      "sent": 1000,
      "delivered": 950,
      "read": 800,
      "failed": 50,
      "clicked": 200,
      "replied": 150,
      "optOut": 5,
      "startTime": "2024-01-01T00:00:00.000Z",
      "endTime": "2024-01-01T01:00:00.000Z"
    },
    "queueStats": {
      "waiting": 0,
      "active": 0,
      "completed": 1000,
      "failed": 50
    }
  }
}
```

## Webhook Endpoints

### WhatsApp Webhook
```http
POST /whatsapp/webhook
```

This endpoint receives webhooks from WhatsApp Business API for:
- Incoming messages
- Message delivery status
- Message read receipts
- Message failures

**Webhook Verification (GET):**
```http
GET /whatsapp/webhook?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=VERIFY_TOKEN
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Authentication | 5 requests per minute |
| Send Message | 100 requests per minute |
| Upload Media | 10 requests per minute |
| General API | 1000 requests per hour |

## Pagination

All list endpoints support pagination:

```
GET /endpoint?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```
