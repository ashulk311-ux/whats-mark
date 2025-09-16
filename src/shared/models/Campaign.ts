import mongoose, { Document, Schema } from 'mongoose';

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

const CampaignSchema = new Schema<ICampaign>({
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
  type: {
    type: String,
    enum: ['broadcast', 'drip', 'automated', 'template'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  message: {
    type: {
      type: String,
      enum: ['text', 'image', 'document', 'audio', 'video', 'template', 'interactive'],
      required: true
    },
    content: Schema.Types.Mixed
  },
  recipients: {
    type: {
      type: String,
      enum: ['all', 'segment', 'list'],
      required: true
    },
    segmentId: String,
    contactListId: String,
    contacts: [String]
  },
  schedule: {
    type: {
      type: String,
      enum: ['immediate', 'scheduled', 'recurring'],
      default: 'immediate'
    },
    scheduledAt: Date,
    recurring: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly']
      },
      interval: Number,
      endDate: Date
    }
  },
  settings: {
    rateLimit: {
      messagesPerSecond: {
        type: Number,
        default: 1
      },
      messagesPerMinute: {
        type: Number,
        default: 60
      },
      messagesPerHour: {
        type: Number,
        default: 1000
      }
    },
    retryPolicy: {
      maxRetries: {
        type: Number,
        default: 3
      },
      retryDelay: {
        type: Number,
        default: 5000
      }
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    businessHours: {
      enabled: {
        type: Boolean,
        default: false
      },
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
    }
  },
  analytics: {
    totalRecipients: {
      type: Number,
      default: 0
    },
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    read: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    replied: {
      type: Number,
      default: 0
    },
    optOut: {
      type: Number,
      default: 0
    },
    startTime: Date,
    endTime: Date
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
CampaignSchema.index({ organizationId: 1, status: 1 });
CampaignSchema.index({ organizationId: 1, createdAt: -1 });
CampaignSchema.index({ 'schedule.scheduledAt': 1 });
CampaignSchema.index({ createdBy: 1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
