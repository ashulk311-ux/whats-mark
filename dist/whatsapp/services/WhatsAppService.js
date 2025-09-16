"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../../shared/utils/logger");
const WhatsAppMessage_1 = require("../../shared/models/WhatsAppMessage");
class WhatsAppService {
    constructor(config) {
        this.config = config;
        this.apiClient = axios_1.default.create({
            baseURL: 'https://graph.facebook.com/v18.0',
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        this.apiClient.interceptors.request.use((config) => {
            logger_1.logger.info(`WhatsApp API Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            logger_1.logger.error('WhatsApp API Request Error:', error);
            return Promise.reject(error);
        });
        this.apiClient.interceptors.response.use((response) => {
            logger_1.logger.info(`WhatsApp API Response: ${response.status} ${response.config.url}`);
            return response;
        }, (error) => {
            logger_1.logger.error('WhatsApp API Response Error:', error.response?.data || error.message);
            return Promise.reject(error);
        });
    }
    async sendMessage(options) {
        try {
            const messageData = this.buildMessagePayload(options);
            const response = await this.apiClient.post(`/${this.config.phoneNumberId}/messages`, messageData);
            const wamid = response.data.messages[0].id;
            const message = new WhatsAppMessage_1.WhatsAppMessage({
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
            logger_1.logger.info(`Message sent successfully: ${wamid}`);
            return message;
        }
        catch (error) {
            logger_1.logger.error('Failed to send WhatsApp message:', error);
            const failedMessage = new WhatsAppMessage_1.WhatsAppMessage({
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
    buildMessagePayload(options) {
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
    async sendTemplateMessage(to, template, organizationId, conversationId) {
        return this.sendMessage({
            to,
            type: 'template',
            content: { template },
            organizationId,
            conversationId
        });
    }
    async sendInteractiveMessage(to, interactive, organizationId, conversationId) {
        return this.sendMessage({
            to,
            type: 'interactive',
            content: { interactive },
            organizationId,
            conversationId
        });
    }
    async uploadMedia(mediaBuffer, mimeType) {
        try {
            const formData = new FormData();
            formData.append('file', new Blob([mediaBuffer], { type: mimeType }));
            formData.append('type', mimeType);
            formData.append('messaging_product', 'whatsapp');
            const response = await this.apiClient.post(`/${this.config.phoneNumberId}/media`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.id;
        }
        catch (error) {
            logger_1.logger.error('Failed to upload media:', error);
            throw error;
        }
    }
    async getMediaUrl(mediaId) {
        try {
            const response = await this.apiClient.get(`/${mediaId}`);
            return response.data.url;
        }
        catch (error) {
            logger_1.logger.error('Failed to get media URL:', error);
            throw error;
        }
    }
    async downloadMedia(mediaId) {
        try {
            const mediaUrl = await this.getMediaUrl(mediaId);
            const response = await this.apiClient.get(mediaUrl, {
                responseType: 'arraybuffer'
            });
            return Buffer.from(response.data);
        }
        catch (error) {
            logger_1.logger.error('Failed to download media:', error);
            throw error;
        }
    }
    async getMessageTemplates() {
        try {
            const response = await this.apiClient.get(`/${this.config.businessAccountId}/message_templates`);
            return response.data.data;
        }
        catch (error) {
            logger_1.logger.error('Failed to get message templates:', error);
            throw error;
        }
    }
    async createMessageTemplate(template) {
        try {
            const response = await this.apiClient.post(`/${this.config.businessAccountId}/message_templates`, template);
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('Failed to create message template:', error);
            throw error;
        }
    }
    async updateWebhook(webhookUrl, fields) {
        try {
            await this.apiClient.post(`/${this.config.phoneNumberId}/subscribed_apps`, {
                subscribed_fields: fields
            });
            await this.apiClient.post(`/${this.config.phoneNumberId}`, {
                webhook_url: webhookUrl,
                webhook_verify_token: this.config.webhookVerifyToken
            });
            logger_1.logger.info('Webhook updated successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to update webhook:', error);
            throw error;
        }
    }
    async verifyWebhook(mode, token, challenge) {
        if (mode === 'subscribe' && token === this.config.webhookVerifyToken) {
            logger_1.logger.info('Webhook verified successfully');
            return challenge;
        }
        return null;
    }
    async getBusinessProfile() {
        try {
            const response = await this.apiClient.get(`/${this.config.phoneNumberId}/whatsapp_business_profile`);
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('Failed to get business profile:', error);
            throw error;
        }
    }
    async updateBusinessProfile(profile) {
        try {
            const response = await this.apiClient.post(`/${this.config.phoneNumberId}/whatsapp_business_profile`, profile);
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('Failed to update business profile:', error);
            throw error;
        }
    }
}
exports.WhatsAppService = WhatsAppService;
//# sourceMappingURL=WhatsAppService.js.map