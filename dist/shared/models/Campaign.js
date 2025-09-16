"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CampaignSchema = new mongoose_1.Schema({
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
        content: mongoose_1.Schema.Types.Mixed
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
CampaignSchema.index({ organizationId: 1, status: 1 });
CampaignSchema.index({ organizationId: 1, createdAt: -1 });
CampaignSchema.index({ 'schedule.scheduledAt': 1 });
CampaignSchema.index({ createdBy: 1 });
exports.Campaign = mongoose_1.default.model('Campaign', CampaignSchema);
//# sourceMappingURL=Campaign.js.map