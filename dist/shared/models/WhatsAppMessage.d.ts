import mongoose, { Document } from 'mongoose';
export interface IWhatsAppMessage extends Document {
    _id: string;
    organizationId: string;
    phoneNumberId: string;
    to: string;
    from: string;
    type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contact' | 'template' | 'interactive' | 'button' | 'list';
    content: {
        text?: string;
        media?: {
            id: string;
            mimeType: string;
            sha256: string;
            filename?: string;
        };
        location?: {
            latitude: number;
            longitude: number;
            name?: string;
            address?: string;
        };
        contact?: {
            name: {
                formatted_name: string;
                first_name?: string;
                last_name?: string;
            };
            phones: Array<{
                phone: string;
                type?: string;
            }>;
        };
        template?: {
            name: string;
            language: string;
            components?: any[];
        };
        interactive?: {
            type: 'button' | 'list';
            header?: any;
            body?: any;
            footer?: any;
            action: any;
        };
    };
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    messageId?: string;
    wamid?: string;
    timestamp: Date;
    direction: 'inbound' | 'outbound';
    conversationId?: string;
    campaignId?: string;
    flowId?: string;
    agentId?: string;
    metadata?: {
        [key: string]: any;
    };
    error?: {
        code: number;
        title: string;
        message: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const WhatsAppMessage: mongoose.Model<IWhatsAppMessage, {}, {}, {}, mongoose.Document<unknown, {}, IWhatsAppMessage, {}, {}> & IWhatsAppMessage & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=WhatsAppMessage.d.ts.map