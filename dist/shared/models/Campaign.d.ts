import mongoose, { Document } from 'mongoose';
export interface ICampaign extends Document {
    _id: string;
    organizationId: string;
    name: string;
    description?: string;
    type: 'broadcast' | 'drip' | 'automated' | 'template';
    status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
    message: {
        type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'template' | 'interactive';
        content: any;
    };
    recipients: {
        type: 'all' | 'segment' | 'list';
        segmentId?: string;
        contactListId?: string;
        contacts?: string[];
    };
    schedule: {
        type: 'immediate' | 'scheduled' | 'recurring';
        scheduledAt?: Date;
        recurring?: {
            frequency: 'daily' | 'weekly' | 'monthly';
            interval: number;
            endDate?: Date;
        };
    };
    settings: {
        rateLimit: {
            messagesPerSecond: number;
            messagesPerMinute: number;
            messagesPerHour: number;
        };
        retryPolicy: {
            maxRetries: number;
            retryDelay: number;
        };
        timezone: string;
        businessHours: {
            enabled: boolean;
            start: string;
            end: string;
            timezone: string;
        };
    };
    analytics: {
        totalRecipients: number;
        sent: number;
        delivered: number;
        read: number;
        failed: number;
        clicked: number;
        replied: number;
        optOut: number;
        startTime?: Date;
        endTime?: Date;
    };
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Campaign: mongoose.Model<ICampaign, {}, {}, {}, mongoose.Document<unknown, {}, ICampaign, {}, {}> & ICampaign & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Campaign.d.ts.map