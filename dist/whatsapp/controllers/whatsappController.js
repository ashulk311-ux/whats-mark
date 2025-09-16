"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppController = void 0;
const WhatsAppService_1 = require("../services/WhatsAppService");
const logger_1 = require("../../shared/utils/logger");
class WhatsAppController {
    getWhatsAppService(organizationId) {
        const config = {
            accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
            phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
            businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
            webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
        };
        return new WhatsAppService_1.WhatsAppService(config);
    }
    async sendMessage(req, res) {
        try {
            const { to, type, content, conversationId, campaignId, flowId } = req.body;
            const organizationId = req.organization._id;
            const whatsappService = this.getWhatsAppService(organizationId);
            const message = await whatsappService.sendMessage({
                to,
                type,
                content,
                organizationId,
                conversationId,
                campaignId,
                flowId,
                agentId: req.user._id
            });
            res.json({
                success: true,
                message: 'Message sent successfully',
                data: { message }
            });
        }
        catch (error) {
            logger_1.logger.error('Send message error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send message',
                error: error.message
            });
        }
    }
    async sendTemplateMessage(req, res) {
        try {
            const { to, template, conversationId } = req.body;
            const organizationId = req.organization._id;
            const whatsappService = this.getWhatsAppService(organizationId);
            const message = await whatsappService.sendTemplateMessage(to, template, organizationId, conversationId);
            res.json({
                success: true,
                message: 'Template message sent successfully',
                data: { message }
            });
        }
        catch (error) {
            logger_1.logger.error('Send template message error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send template message',
                error: error.message
            });
        }
    }
    async sendInteractiveMessage(req, res) {
        try {
            const { to, interactive, conversationId } = req.body;
            const organizationId = req.organization._id;
            const whatsappService = this.getWhatsAppService(organizationId);
            const message = await whatsappService.sendInteractiveMessage(to, interactive, organizationId, conversationId);
            res.json({
                success: true,
                message: 'Interactive message sent successfully',
                data: { message }
            });
        }
        catch (error) {
            logger_1.logger.error('Send interactive message error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send interactive message',
                error: error.message
            });
        }
    }
    async uploadMedia(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
                return;
            }
            const organizationId = req.organization._id;
            const whatsappService = this.getWhatsAppService(organizationId);
            const mediaId = await whatsappService.uploadMedia(req.file.buffer, req.file.mimetype);
            res.json({
                success: true,
                message: 'Media uploaded successfully',
                data: { mediaId }
            });
        }
        catch (error) {
            logger_1.logger.error('Upload media error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload media',
                error: error.message
            });
        }
    }
    async getMessageTemplates(req, res) {
        try {
            const organizationId = req.organization._id;
            const whatsappService = this.getWhatsAppService(organizationId);
            const templates = await whatsappService.getMessageTemplates();
            res.json({
                success: true,
                data: { templates }
            });
        }
        catch (error) {
            logger_1.logger.error('Get message templates error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get message templates',
                error: error.message
            });
        }
    }
    async createMessageTemplate(req, res) {
        try {
            const { template } = req.body;
            const organizationId = req.organization._id;
            const whatsappService = this.getWhatsAppService(organizationId);
            const createdTemplate = await whatsappService.createMessageTemplate(template);
            res.json({
                success: true,
                message: 'Message template created successfully',
                data: { template: createdTemplate }
            });
        }
        catch (error) {
            logger_1.logger.error('Create message template error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create message template',
                error: error.message
            });
        }
    }
    async getBusinessProfile(req, res) {
        try {
            const organizationId = req.organization._id;
            const whatsappService = this.getWhatsAppService(organizationId);
            const profile = await whatsappService.getBusinessProfile();
            res.json({
                success: true,
                data: { profile }
            });
        }
        catch (error) {
            logger_1.logger.error('Get business profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get business profile',
                error: error.message
            });
        }
    }
    async updateBusinessProfile(req, res) {
        try {
            const { profile } = req.body;
            const organizationId = req.organization._id;
            const whatsappService = this.getWhatsAppService(organizationId);
            const updatedProfile = await whatsappService.updateBusinessProfile(profile);
            res.json({
                success: true,
                message: 'Business profile updated successfully',
                data: { profile: updatedProfile }
            });
        }
        catch (error) {
            logger_1.logger.error('Update business profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update business profile',
                error: error.message
            });
        }
    }
    async webhook(req, res) {
        try {
            const { mode, token, challenge } = req.query;
            if (mode === 'subscribe') {
                const whatsappService = this.getWhatsAppService('');
                const verificationResult = await whatsappService.verifyWebhook(mode, token, challenge);
                if (verificationResult) {
                    res.status(200).send(verificationResult);
                    return;
                }
            }
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
        }
        catch (error) {
            logger_1.logger.error('Webhook error:', error);
            res.status(500).json({
                success: false,
                message: 'Webhook processing failed'
            });
        }
    }
    async handleIncomingMessages(value) {
        try {
            const messages = value.messages || [];
            const statuses = value.statuses || [];
            for (const message of messages) {
                await this.processIncomingMessage(message, value);
            }
            for (const status of statuses) {
                await this.processMessageStatus(status);
            }
        }
        catch (error) {
            logger_1.logger.error('Error handling incoming messages:', error);
        }
    }
    async processIncomingMessage(message, value) {
        try {
            logger_1.logger.info('Processing incoming message:', message);
        }
        catch (error) {
            logger_1.logger.error('Error processing incoming message:', error);
        }
    }
    async processMessageStatus(status) {
        try {
            logger_1.logger.info('Processing message status:', status);
        }
        catch (error) {
            logger_1.logger.error('Error processing message status:', error);
        }
    }
}
exports.WhatsAppController = WhatsAppController;
//# sourceMappingURL=whatsappController.js.map