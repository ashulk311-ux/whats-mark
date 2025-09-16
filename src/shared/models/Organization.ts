import mongoose, { Document, Schema } from 'mongoose';

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

const OrganizationSchema = new Schema<IOrganization>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  domain: {
    type: String,
    trim: true,
    lowercase: true
  },
  logo: {
    type: String
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    },
    businessHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '17:00'
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    },
    autoReply: {
      type: Boolean,
      default: true
    },
    maxAgents: {
      type: Number,
      default: 5
    },
    features: [{
      type: String
    }]
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'trial'],
      default: 'trial'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    maxContacts: {
      type: Number,
      default: 1000
    },
    maxMessagesPerMonth: {
      type: Number,
      default: 10000
    },
    features: [{
      type: String
    }]
  },
  whatsappConfig: {
    accessToken: {
      type: String
    },
    phoneNumberId: {
      type: String
    },
    businessAccountId: {
      type: String
    },
    webhookVerifyToken: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    lastSync: {
      type: Date
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
OrganizationSchema.index({ name: 1 });
OrganizationSchema.index({ domain: 1 });
OrganizationSchema.index({ 'subscription.status': 1 });

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
