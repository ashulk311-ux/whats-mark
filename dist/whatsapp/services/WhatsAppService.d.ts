import { IWhatsAppMessage } from '../../shared/models/WhatsAppMessage';
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
export declare class WhatsAppService {
    private apiClient;
    private config;
    constructor(config: WhatsAppConfig);
    private setupInterceptors;
    sendMessage(options: SendMessageOptions): Promise<IWhatsAppMessage>;
    private buildMessagePayload;
    sendTemplateMessage(to: string, template: MessageTemplate, organizationId: string, conversationId?: string): Promise<IWhatsAppMessage>;
    sendInteractiveMessage(to: string, interactive: any, organizationId: string, conversationId?: string): Promise<IWhatsAppMessage>;
    uploadMedia(mediaBuffer: Buffer, mimeType: string): Promise<string>;
    getMediaUrl(mediaId: string): Promise<string>;
    downloadMedia(mediaId: string): Promise<Buffer>;
    getMessageTemplates(): Promise<any[]>;
    createMessageTemplate(template: any): Promise<any>;
    updateWebhook(webhookUrl: string, fields: string[]): Promise<void>;
    verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null>;
    getBusinessProfile(): Promise<any>;
    updateBusinessProfile(profile: any): Promise<any>;
}
//# sourceMappingURL=WhatsAppService.d.ts.map