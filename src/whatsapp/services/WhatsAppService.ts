import axios, { AxiosInstance } from 'axios';
import { logger } from '../../shared/utils/logger';
import { WhatsAppMessage, IWhatsAppMessage } from '../../shared/models/WhatsAppMessage';

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
}

export interface SendMessageOptions {
  to: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contact' | 'template' | 'interactive';
  content: any;
  organizationId: string;
  conversationId?: string;
  campaignId?: string;
  flowId?: string;
  agentId?: string;
}

export interface MessageTemplate {
  name: string;
  language: string;
  components?: any[];
}

export class WhatsAppService {
  private apiClient: AxiosInstance;
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
    this.apiClient = axios.create({
      baseURL: 'https://graph.facebook.com/v18.0',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.apiClient.interceptors.request.use(
      (config) => {
        logger.info(`WhatsApp API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('WhatsApp API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.apiClient.interceptors.response.use(
      (response) => {
        logger.info(`WhatsApp API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('WhatsApp API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  public async sendMessage(options: SendMessageOptions): Promise<IWhatsAppMessage> {
    try {
      const messageData = this.buildMessagePayload(options);
      
      const response = await this.apiClient.post(
        `/${this.config.phoneNumberId}/messages`,
        messageData
      );

      const wamid = response.data.messages[0].id;
      
      // Save message to database
      const message = new WhatsAppMessage({
        organizationId: options.organizationId,
        phoneNumberId: this.config.phoneNumberId,
        to: options.to,
        from: this.config.phoneNumberId,
        type: options.type,
        content: options.content,
        status: 'sent',
        wamid,
        direction: 'outbound',
        conversationId: options.conversationId,
        campaignId: options.campaignId,
        flowId: options.flowId,
        agentId: options.agentId,
        timestamp: new Date()
      });

      await message.save();
      logger.info(`Message sent successfully: ${wamid}`);
      
      return message;
    } catch (error: any) {
      logger.error('Failed to send WhatsApp message:', error);
      
      // Save failed message to database
      const failedMessage = new WhatsAppMessage({
        organizationId: options.organizationId,
        phoneNumberId: this.config.phoneNumberId,
        to: options.to,
        from: this.config.phoneNumberId,
        type: options.type,
        content: options.content,
        status: 'failed',
        direction: 'outbound',
        conversationId: options.conversationId,
        campaignId: options.campaignId,
        flowId: options.flowId,
        agentId: options.agentId,
        timestamp: new Date(),
        error: {
          code: error.response?.status || 500,
          title: error.response?.data?.error?.type || 'Unknown Error',
          message: error.response?.data?.error?.message || error.message
        }
      });

      await failedMessage.save();
      throw error;
    }
  }

  private buildMessagePayload(options: SendMessageOptions): any {
    const basePayload = {
      messaging_product: 'whatsapp',
      to: options.to,
      type: options.type
    };

    switch (options.type) {
      case 'text':
        return {
          ...basePayload,
          text: {
            body: options.content.text
          }
        };

      case 'image':
      case 'document':
      case 'audio':
      case 'video':
        return {
          ...basePayload,
          [options.type]: {
            id: options.content.media.id,
            caption: options.content.text
          }
        };

      case 'location':
        return {
          ...basePayload,
          location: {
            latitude: options.content.location.latitude,
            longitude: options.content.location.longitude,
            name: options.content.location.name,
            address: options.content.location.address
          }
        };

      case 'contact':
        return {
          ...basePayload,
          contacts: [options.content.contact]
        };

      case 'template':
        return {
          ...basePayload,
          template: {
            name: options.content.template.name,
            language: {
              code: options.content.template.language
            },
            components: options.content.template.components || []
          }
        };

      case 'interactive':
        return {
          ...basePayload,
          interactive: options.content.interactive
        };

      default:
        throw new Error(`Unsupported message type: ${options.type}`);
    }
  }

  public async sendTemplateMessage(
    to: string,
    template: MessageTemplate,
    organizationId: string,
    conversationId?: string
  ): Promise<IWhatsAppMessage> {
    return this.sendMessage({
      to,
      type: 'template',
      content: { template },
      organizationId,
      conversationId
    });
  }

  public async sendInteractiveMessage(
    to: string,
    interactive: any,
    organizationId: string,
    conversationId?: string
  ): Promise<IWhatsAppMessage> {
    return this.sendMessage({
      to,
      type: 'interactive',
      content: { interactive },
      organizationId,
      conversationId
    });
  }

  public async uploadMedia(mediaBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([mediaBuffer], { type: mimeType }));
      formData.append('type', mimeType);
      formData.append('messaging_product', 'whatsapp');

      const response = await this.apiClient.post(
        `/${this.config.phoneNumberId}/media`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.id;
    } catch (error) {
      logger.error('Failed to upload media:', error);
      throw error;
    }
  }

  public async getMediaUrl(mediaId: string): Promise<string> {
    try {
      const response = await this.apiClient.get(`/${mediaId}`);
      return response.data.url;
    } catch (error) {
      logger.error('Failed to get media URL:', error);
      throw error;
    }
  }

  public async downloadMedia(mediaId: string): Promise<Buffer> {
    try {
      const mediaUrl = await this.getMediaUrl(mediaId);
      const response = await this.apiClient.get(mediaUrl, {
        responseType: 'arraybuffer'
      });
      return Buffer.from(response.data);
    } catch (error) {
      logger.error('Failed to download media:', error);
      throw error;
    }
  }

  public async getMessageTemplates(): Promise<any[]> {
    try {
      const response = await this.apiClient.get(
        `/${this.config.businessAccountId}/message_templates`
      );
      return response.data.data;
    } catch (error) {
      logger.error('Failed to get message templates:', error);
      throw error;
    }
  }

  public async createMessageTemplate(template: any): Promise<any> {
    try {
      const response = await this.apiClient.post(
        `/${this.config.businessAccountId}/message_templates`,
        template
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to create message template:', error);
      throw error;
    }
  }

  public async updateWebhook(webhookUrl: string, fields: string[]): Promise<void> {
    try {
      await this.apiClient.post(
        `/${this.config.phoneNumberId}/subscribed_apps`,
        {
          subscribed_fields: fields
        }
      );

      // Update webhook URL
      await this.apiClient.post(
        `/${this.config.phoneNumberId}`,
        {
          webhook_url: webhookUrl,
          webhook_verify_token: this.config.webhookVerifyToken
        }
      );

      logger.info('Webhook updated successfully');
    } catch (error) {
      logger.error('Failed to update webhook:', error);
      throw error;
    }
  }

  public async verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null> {
    if (mode === 'subscribe' && token === this.config.webhookVerifyToken) {
      logger.info('Webhook verified successfully');
      return challenge;
    }
    return null;
  }

  public async getBusinessProfile(): Promise<any> {
    try {
      const response = await this.apiClient.get(
        `/${this.config.phoneNumberId}/whatsapp_business_profile`
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to get business profile:', error);
      throw error;
    }
  }

  public async updateBusinessProfile(profile: any): Promise<any> {
    try {
      const response = await this.apiClient.post(
        `/${this.config.phoneNumberId}/whatsapp_business_profile`,
        profile
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to update business profile:', error);
      throw error;
    }
  }
}
