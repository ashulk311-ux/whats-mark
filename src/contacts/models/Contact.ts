import mongoose, { Document, Schema } from 'mongoose';

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

const ContactSchema = new Schema<IContact>({
  organizationId: {
    type: String,
    required: true,
    ref: 'Organization'
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  profilePicture: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  },
  source: {
    type: String,
    enum: ['manual', 'import', 'webhook', 'api', 'chatbot', 'campaign'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked', 'opt_out'],
    default: 'active'
  },
  optOut: {
    type: Boolean,
    default: false
  },
  optOutDate: {
    type: Date
  },
  lastInteraction: {
    type: Date
  },
  conversationId: {
    type: String
  },
  assignedAgent: {
    type: String,
    ref: 'User'
  },
  leadScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lifecycleStage: {
    type: String,
    enum: ['new', 'engaged', 'qualified', 'customer', 'churned'],
    default: 'new'
  },
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdBy: {
      type: String,
      required: true,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  interactions: {
    totalMessages: {
      type: Number,
      default: 0
    },
    lastMessageAt: {
      type: Date
    },
    responseRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    communicationFrequency: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    preferredContactTime: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '17:00'
      }
    }
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ContactSchema.index({ organizationId: 1, phoneNumber: 1 });
ContactSchema.index({ organizationId: 1, status: 1 });
ContactSchema.index({ organizationId: 1, tags: 1 });
ContactSchema.index({ organizationId: 1, lifecycleStage: 1 });
ContactSchema.index({ organizationId: 1, assignedAgent: 1 });
ContactSchema.index({ organizationId: 1, lastInteraction: -1 });
ContactSchema.index({ organizationId: 1, createdAt: -1 });

// Compound indexes for complex queries
ContactSchema.index({ organizationId: 1, status: 1, lifecycleStage: 1 });
ContactSchema.index({ organizationId: 1, tags: 1, status: 1 });

export const Contact = mongoose.model<IContact>('Contact', ContactSchema);
