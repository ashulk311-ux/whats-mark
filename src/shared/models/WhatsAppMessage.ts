import mongoose, { Document, Schema } from 'mongoose';

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

const WhatsAppMessageSchema = new Schema<IWhatsAppMessage>({
  organizationId: {
    type: String,
    required: true,
    ref: 'Organization'
  },
  phoneNumberId: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'document', 'audio', 'video', 'location', 'contact', 'template', 'interactive', 'button', 'list'],
    required: true
  },
  content: {
    text: String,
    media: {
      id: String,
      mimeType: String,
      sha256: String,
      filename: String
    },
    location: {
      latitude: Number,
      longitude: Number,
      name: String,
      address: String
    },
    contact: {
      name: {
        formatted_name: String,
        first_name: String,
        last_name: String
      },
      phones: [{
        phone: String,
        type: String
      }]
    },
    template: {
      name: String,
      language: String,
      components: [Schema.Types.Mixed]
    },
    interactive: {
      type: {
        type: String,
        enum: ['button', 'list']
      },
      header: Schema.Types.Mixed,
      body: Schema.Types.Mixed,
      footer: Schema.Types.Mixed,
      action: Schema.Types.Mixed
    }
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  messageId: String,
  wamid: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  conversationId: String,
  campaignId: String,
  flowId: String,
  agentId: String,
  metadata: Schema.Types.Mixed,
  error: {
    code: Number,
    title: String,
    message: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
WhatsAppMessageSchema.index({ organizationId: 1, to: 1 });
WhatsAppMessageSchema.index({ organizationId: 1, timestamp: -1 });
WhatsAppMessageSchema.index({ conversationId: 1 });
WhatsAppMessageSchema.index({ campaignId: 1 });
WhatsAppMessageSchema.index({ wamid: 1 });
WhatsAppMessageSchema.index({ status: 1 });

export const WhatsAppMessage = mongoose.model<IWhatsAppMessage>('WhatsAppMessage', WhatsAppMessageSchema);
