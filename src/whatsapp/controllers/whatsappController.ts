import { Request, Response } from 'express';
import { WhatsAppService } from '../services/WhatsAppService';
import { Organization } from '../../shared/models/Organization';
import { logger } from '../../shared/utils/logger';
import { AuthRequest } from '../../auth/middleware/auth';

export class WhatsAppController {
  private getWhatsAppService(organizationId: string): WhatsAppService {
    // In a real implementation, you would get the config from the organization
    // For now, we'll use environment variables
    const config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!
    };

    return new WhatsAppService(config);
  }

  public async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { to, type, content, conversationId, campaignId, flowId } = req.body;
      const organizationId = req.organization!._id;

      const whatsappService = this.getWhatsAppService(organizationId);
      
      const message = await whatsappService.sendMessage({
        to,
        type,
        content,
        organizationId,
        conversationId,
        campaignId,
        flowId,
        agentId: req.user!._id
      });

      res.json({
        success: true,
        message: 'Message sent successfully',
        data: { message }
      });
    } catch (error: any) {
      logger.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
      });
    }
  }

  public async sendTemplateMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { to, template, conversationId } = req.body;
      const organizationId = req.organization!._id;

      const whatsappService = this.getWhatsAppService(organizationId);
      
      const message = await whatsappService.sendTemplateMessage(
        to,
        template,
        organizationId,
        conversationId
      );

      res.json({
        success: true,
        message: 'Template message sent successfully',
        data: { message }
      });
    } catch (error: any) {
      logger.error('Send template message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send template message',
        error: error.message
      });
    }
  }

  public async sendInteractiveMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { to, interactive, conversationId } = req.body;
      const organizationId = req.organization!._id;

      const whatsappService = this.getWhatsAppService(organizationId);
      
      const message = await whatsappService.sendInteractiveMessage(
        to,
        interactive,
        organizationId,
        conversationId
      );

      res.json({
        success: true,
        message: 'Interactive message sent successfully',
        data: { message }
      });
    } catch (error: any) {
      logger.error('Send interactive message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send interactive message',
        error: error.message
      });
    }
  }

  public async uploadMedia(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      const organizationId = req.organization!._id;
      const whatsappService = this.getWhatsAppService(organizationId);
      
      const mediaId = await whatsappService.uploadMedia(
        req.file.buffer,
        req.file.mimetype
      );

      res.json({
        success: true,
        message: 'Media uploaded successfully',
        data: { mediaId }
      });
    } catch (error: any) {
      logger.error('Upload media error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload media',
        error: error.message
      });
    }
  }

  public async getMessageTemplates(req: AuthRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.organization!._id;
      const whatsappService = this.getWhatsAppService(organizationId);
      
      const templates = await whatsappService.getMessageTemplates();

      res.json({
        success: true,
        data: { templates }
      });
    } catch (error: any) {
      logger.error('Get message templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get message templates',
        error: error.message
      });
    }
  }

  public async createMessageTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { template } = req.body;
      const organizationId = req.organization!._id;
      const whatsappService = this.getWhatsAppService(organizationId);
      
      const createdTemplate = await whatsappService.createMessageTemplate(template);

      res.json({
        success: true,
        message: 'Message template created successfully',
        data: { template: createdTemplate }
      });
    } catch (error: any) {
      logger.error('Create message template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create message template',
        error: error.message
      });
    }
  }

  public async getBusinessProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.organization!._id;
      const whatsappService = this.getWhatsAppService(organizationId);
      
      const profile = await whatsappService.getBusinessProfile();

      res.json({
        success: true,
        data: { profile }
      });
    } catch (error: any) {
      logger.error('Get business profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get business profile',
        error: error.message
      });
    }
  }

  public async updateBusinessProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { profile } = req.body;
      const organizationId = req.organization!._id;
      const whatsappService = this.getWhatsAppService(organizationId);
      
      const updatedProfile = await whatsappService.updateBusinessProfile(profile);

      res.json({
        success: true,
        message: 'Business profile updated successfully',
        data: { profile: updatedProfile }
      });
    } catch (error: any) {
      logger.error('Update business profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update business profile',
        error: error.message
      });
    }
  }

  public async webhook(req: Request, res: Response): Promise<void> {
    try {
      const { mode, token, challenge } = req.query;
      
      if (mode === 'subscribe') {
        const whatsappService = this.getWhatsAppService('');
        const verificationResult = await whatsappService.verifyWebhook(
          mode as string,
          token as string,
          challenge as string
        );
        
        if (verificationResult) {
          res.status(200).send(verificationResult);
          return;
        }
      }

      // Handle incoming messages
      if (req.body.object === 'whatsapp_business_account') {
        const entries = req.body.entry;
        
        for (const entry of entries) {
          const changes = entry.changes;
          
          for (const change of changes) {
            if (change.field === 'messages') {
              await this.handleIncomingMessages(change.value);
            }
          }
        }
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error('Webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }

  private async handleIncomingMessages(value: any): Promise<void> {
    try {
      const messages = value.messages || [];
      const statuses = value.statuses || [];

      // Process incoming messages
      for (const message of messages) {
        await this.processIncomingMessage(message, value);
      }

      // Process message statuses
      for (const status of statuses) {
        await this.processMessageStatus(status);
      }
    } catch (error) {
      logger.error('Error handling incoming messages:', error);
    }
  }

  private async processIncomingMessage(message: any, value: any): Promise<void> {
    try {
      // This would be implemented to save incoming messages to database
      // and trigger appropriate responses based on chatbot flows
      logger.info('Processing incoming message:', message);
    } catch (error) {
      logger.error('Error processing incoming message:', error);
    }
  }

  private async processMessageStatus(status: any): Promise<void> {
    try {
      // This would be implemented to update message status in database
      logger.info('Processing message status:', status);
    } catch (error) {
      logger.error('Error processing message status:', error);
    }
  }
}
