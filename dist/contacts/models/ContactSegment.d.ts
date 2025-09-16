import mongoose, { Document } from 'mongoose';
export interface IContactSegment extends Document {
    _id: string;
    organizationId: string;
    name: string;
    description?: string;
    criteria: {
        conditions: Array<{
            field: string;
            operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists' | 'not_exists';
            value: any;
        }>;
        logic: 'AND' | 'OR';
    };
    filters: {
        tags?: string[];
        status?: string[];
        lifecycleStage?: string[];
        source?: string[];
        dateRange?: {
            field: 'createdAt' | 'lastInteraction' | 'updatedAt';
            start: Date;
            end: Date;
        };
        customFields?: Array<{
            field: string;
            operator: string;
            value: any;
        }>;
    };
    contactCount: number;
    lastCalculated: Date;
    isDynamic: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ContactSegment: mongoose.Model<IContactSegment, {}, {}, {}, mongoose.Document<unknown, {}, IContactSegment, {}, {}> & IContactSegment & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ContactSegment.d.ts.map