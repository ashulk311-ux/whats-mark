import mongoose, { Document } from 'mongoose';
export interface IContact extends Document {
    _id: string;
    organizationId: string;
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string;
    tags: string[];
    customFields: {
        [key: string]: any;
    };
    source: 'manual' | 'import' | 'webhook' | 'api' | 'chatbot' | 'campaign';
    status: 'active' | 'inactive' | 'blocked' | 'opt_out';
    optOut: boolean;
    optOutDate?: Date;
    lastInteraction?: Date;
    conversationId?: string;
    assignedAgent?: string;
    leadScore?: number;
    lifecycleStage: 'new' | 'engaged' | 'qualified' | 'customer' | 'churned';
    notes: Array<{
        content: string;
        createdBy: string;
        createdAt: Date;
    }>;
    interactions: {
        totalMessages: number;
        lastMessageAt?: Date;
        responseRate: number;
        averageResponseTime: number;
    };
    preferences: {
        language: string;
        timezone: string;
        communicationFrequency: 'high' | 'medium' | 'low';
        preferredContactTime: {
            start: string;
            end: string;
        };
    };
    metadata: {
        [key: string]: any;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Contact: mongoose.Model<IContact, {}, {}, {}, mongoose.Document<unknown, {}, IContact, {}, {}> & IContact & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Contact.d.ts.map