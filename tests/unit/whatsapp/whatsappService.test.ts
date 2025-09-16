import { WhatsAppService } from '../../../src/whatsapp/services/WhatsAppService';
import { WhatsAppMessage } from '../../../src/shared/models/WhatsAppMessage';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../src/shared/models/WhatsAppMessage');

const MockedAxios = axios as jest.Mocked<typeof axios>;
const MockedWhatsAppMessage = WhatsAppMessage as jest.Mocked<typeof WhatsAppMessage>;

describe('WhatsAppService', () => {
  let whatsappService: WhatsAppService;
  let mockConfig: any;

  beforeEach(() => {
    mockConfig = {
      accessToken: 'test-access-token',
      phoneNumberId: 'test-phone-number-id',
      businessAccountId: 'test-business-account-id',
      webhookVerifyToken: 'test-webhook-verify-token'
    };

    whatsappService = new WhatsAppService(mockConfig);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send text message successfully', async () => {
      const messageOptions = {
        to: '+1234567890',
        type: 'text' as const,
        content: {
          text: 'Hello, this is a test message!'
        },
        organizationId: 'org123'
      };

      const mockResponse = {
        data: {
          messages: [{ id: 'wamid_123456789' }]
        }
      };

      // Mock axios post
      MockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        get: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      // Mock WhatsAppMessage constructor and save
      const mockMessage = {
        save: jest.fn().mockResolvedValue(true)
      };
      MockedWhatsAppMessage.mockImplementation(() => mockMessage as any);

      const result = await whatsappService.sendMessage(messageOptions);

      expect(result).toBeDefined();
      expect(mockMessage.save).toHaveBeenCalled();
    });

    it('should send image message successfully', async () => {
      const messageOptions = {
        to: '+1234567890',
        type: 'image' as const,
        content: {
          media: {
            id: 'media_123',
            mimeType: 'image/jpeg',
            sha256: 'hash123'
          },
          text: 'Check out this image!'
        },
        organizationId: 'org123'
      };

      const mockResponse = {
        data: {
          messages: [{ id: 'wamid_123456789' }]
        }
      };

      MockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        get: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const mockMessage = {
        save: jest.fn().mockResolvedValue(true)
      };
      MockedWhatsAppMessage.mockImplementation(() => mockMessage as any);

      const result = await whatsappService.sendMessage(messageOptions);

      expect(result).toBeDefined();
      expect(mockMessage.save).toHaveBeenCalled();
    });

    it('should handle message sending failure', async () => {
      const messageOptions = {
        to: '+1234567890',
        type: 'text' as const,
        content: {
          text: 'Hello, this is a test message!'
        },
        organizationId: 'org123'
      };

      const mockError = {
        response: {
          status: 400,
          data: {
            error: {
              type: 'OAuthException',
              message: 'Invalid phone number'
            }
          }
        }
      };

      MockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
        get: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const mockMessage = {
        save: jest.fn().mockResolvedValue(true)
      };
      MockedWhatsAppMessage.mockImplementation(() => mockMessage as any);

      await expect(whatsappService.sendMessage(messageOptions)).rejects.toThrow();
      expect(mockMessage.save).toHaveBeenCalled();
    });

    it('should throw error for unsupported message type', async () => {
      const messageOptions = {
        to: '+1234567890',
        type: 'unsupported' as any,
        content: {},
        organizationId: 'org123'
      };

      await expect(whatsappService.sendMessage(messageOptions)).rejects.toThrow('Unsupported message type');
    });
  });

  describe('sendTemplateMessage', () => {
    it('should send template message successfully', async () => {
      const template = {
        name: 'hello_world',
        language: 'en_US',
        components: []
      };

      const messageOptions = {
        to: '+1234567890',
        type: 'template' as const,
        content: { template },
        organizationId: 'org123'
      };

      const mockResponse = {
        data: {
          messages: [{ id: 'wamid_123456789' }]
        }
      };

      MockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        get: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const mockMessage = {
        save: jest.fn().mockResolvedValue(true)
      };
      MockedWhatsAppMessage.mockImplementation(() => mockMessage as any);

      const result = await whatsappService.sendTemplateMessage(
        '+1234567890',
        template,
        'org123'
      );

      expect(result).toBeDefined();
      expect(mockMessage.save).toHaveBeenCalled();
    });
  });

  describe('sendInteractiveMessage', () => {
    it('should send interactive message successfully', async () => {
      const interactive = {
        type: 'button' as const,
        header: {
          type: 'text',
          text: 'Welcome!'
        },
        body: {
          text: 'Please choose an option:'
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'option1',
                title: 'Option 1'
              }
            }
          ]
        }
      };

      const messageOptions = {
        to: '+1234567890',
        type: 'interactive' as const,
        content: { interactive },
        organizationId: 'org123'
      };

      const mockResponse = {
        data: {
          messages: [{ id: 'wamid_123456789' }]
        }
      };

      MockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        get: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const mockMessage = {
        save: jest.fn().mockResolvedValue(true)
      };
      MockedWhatsAppMessage.mockImplementation(() => mockMessage as any);

      const result = await whatsappService.sendInteractiveMessage(
        '+1234567890',
        interactive,
        'org123'
      );

      expect(result).toBeDefined();
      expect(mockMessage.save).toHaveBeenCalled();
    });
  });

  describe('uploadMedia', () => {
    it('should upload media successfully', async () => {
      const mediaBuffer = Buffer.from('test media content');
      const mimeType = 'image/jpeg';

      const mockResponse = {
        data: {
          id: 'media_123456789'
        }
      };

      MockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        get: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const result = await whatsappService.uploadMedia(mediaBuffer, mimeType);

      expect(result).toBe('media_123456789');
    });

    it('should handle media upload failure', async () => {
      const mediaBuffer = Buffer.from('test media content');
      const mimeType = 'image/jpeg';

      const mockError = {
        response: {
          status: 400,
          data: {
            error: {
              type: 'OAuthException',
              message: 'Invalid media file'
            }
          }
        }
      };

      MockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
        get: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      await expect(whatsappService.uploadMedia(mediaBuffer, mimeType)).rejects.toThrow();
    });
  });

  describe('getMediaUrl', () => {
    it('should get media URL successfully', async () => {
      const mediaId = 'media_123456789';
      const mockResponse = {
        data: {
          url: 'https://example.com/media/123456789'
        }
      };

      MockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
        post: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const result = await whatsappService.getMediaUrl(mediaId);

      expect(result).toBe('https://example.com/media/123456789');
    });
  });

  describe('downloadMedia', () => {
    it('should download media successfully', async () => {
      const mediaId = 'media_123456789';
      const mockMediaUrl = 'https://example.com/media/123456789';
      const mockMediaData = Buffer.from('downloaded media content');

      // Mock getMediaUrl
      jest.spyOn(whatsappService, 'getMediaUrl').mockResolvedValue(mockMediaUrl);

      MockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockMediaData }),
        post: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const result = await whatsappService.downloadMedia(mediaId);

      expect(result).toEqual(mockMediaData);
    });
  });

  describe('getMessageTemplates', () => {
    it('should get message templates successfully', async () => {
      const mockTemplates = [
        {
          id: 'template_123',
          name: 'hello_world',
          status: 'APPROVED',
          category: 'UTILITY',
          language: 'en_US'
        }
      ];

      const mockResponse = {
        data: {
          data: mockTemplates
        }
      };

      MockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
        post: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const result = await whatsappService.getMessageTemplates();

      expect(result).toEqual(mockTemplates);
    });
  });

  describe('createMessageTemplate', () => {
    it('should create message template successfully', async () => {
      const template = {
        name: 'my_template',
        language: 'en_US',
        category: 'UTILITY',
        components: [
          {
            type: 'BODY',
            text: 'Hello {{1}}!'
          }
        ]
      };

      const mockResponse = {
        data: {
          id: 'template_123',
          name: 'my_template',
          status: 'PENDING'
        }
      };

      MockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        get: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const result = await whatsappService.createMessageTemplate(template);

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateWebhook', () => {
    it('should update webhook successfully', async () => {
      const webhookUrl = 'https://example.com/webhook';
      const fields = ['messages', 'message_deliveries'];

      MockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: {} }),
        get: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      await whatsappService.updateWebhook(webhookUrl, fields);

      // Verify that post was called twice (once for subscribed_apps, once for webhook_url)
      expect(MockedAxios.create().post).toHaveBeenCalledTimes(2);
    });
  });

  describe('verifyWebhook', () => {
    it('should verify webhook successfully', async () => {
      const mode = 'subscribe';
      const token = 'test-webhook-verify-token';
      const challenge = 'challenge_string';

      const result = await whatsappService.verifyWebhook(mode, token, challenge);

      expect(result).toBe('challenge_string');
    });

    it('should return null for invalid webhook verification', async () => {
      const mode = 'subscribe';
      const token = 'invalid-token';
      const challenge = 'challenge_string';

      const result = await whatsappService.verifyWebhook(mode, token, challenge);

      expect(result).toBeNull();
    });
  });

  describe('getBusinessProfile', () => {
    it('should get business profile successfully', async () => {
      const mockProfile = {
        id: 'profile_123',
        name: 'My Business',
        description: 'Business description',
        email: 'business@example.com',
        website: 'https://example.com'
      };

      const mockResponse = {
        data: mockProfile
      };

      MockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
        post: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const result = await whatsappService.getBusinessProfile();

      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateBusinessProfile', () => {
    it('should update business profile successfully', async () => {
      const profile = {
        name: 'Updated Business Name',
        description: 'Updated description',
        email: 'updated@example.com'
      };

      const mockResponse = {
        data: {
          success: true
        }
      };

      MockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        get: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const result = await whatsappService.updateBusinessProfile(profile);

      expect(result).toEqual(mockResponse.data);
    });
  });
});
