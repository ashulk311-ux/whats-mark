import mongoose, { Document, Schema } from 'mongoose';

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

const ContactSegmentSchema = new Schema<IContactSegment>({
  organizationId: {
    type: String,
    required: true,
    ref: 'Organization'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  criteria: {
    conditions: [{
      field: {
        type: String,
        required: true
      },
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'greater_than', 'less_than', 'in', 'not_in', 'exists', 'not_exists'],
        required: true
      },
      value: {
        type: Schema.Types.Mixed,
        required: true
      }
    }],
    logic: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'AND'
    }
  },
  filters: {
    tags: [String],
    status: [String],
    lifecycleStage: [String],
    source: [String],
    dateRange: {
      field: {
        type: String,
        enum: ['createdAt', 'lastInteraction', 'updatedAt']
      },
      start: Date,
      end: Date
    },
    customFields: [{
      field: String,
      operator: String,
      value: Schema.Types.Mixed
    }]
  },
  contactCount: {
    type: Number,
    default: 0
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  },
  isDynamic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ContactSegmentSchema.index({ organizationId: 1, name: 1 });
ContactSegmentSchema.index({ organizationId: 1, isDynamic: 1 });
ContactSegmentSchema.index({ createdBy: 1 });

export const ContactSegment = mongoose.model<IContactSegment>('ContactSegment', ContactSegmentSchema);
