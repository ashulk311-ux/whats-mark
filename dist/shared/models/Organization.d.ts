import mongoose, { Document } from 'mongoose';
export interface IOrganization extends Document {
    _id: string;
    name: string;
    domain?: string;
    logo?: string;
    settings: {
        timezone: string;
        currency: string;
        language: string;
        businessHours: {
            start: string;
            end: string;
            timezone: string;
        };
        autoReply: boolean;
        maxAgents: number;
        features: string[];
    };
    subscription: {
        plan: 'free' | 'basic' | 'professional' | 'enterprise';
        status: 'active' | 'inactive' | 'cancelled' | 'trial';
        startDate: Date;
        endDate?: Date;
        maxContacts: number;
        maxMessagesPerMonth: number;
        features: string[];
    };
    whatsappConfig: {
        accessToken?: string;
        phoneNumberId?: string;
        businessAccountId?: string;
        webhookVerifyToken?: string;
        isVerified: boolean;
        lastSync?: Date;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Organization: mongoose.Model<IOrganization, {}, {}, {}, mongoose.Document<unknown, {}, IOrganization, {}, {}> & IOrganization & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Organization.d.ts.map