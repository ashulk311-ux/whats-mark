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
exports.Contact = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ContactSchema = new mongoose_1.Schema({
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
        of: mongoose_1.Schema.Types.Mixed
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
        of: mongoose_1.Schema.Types.Mixed
    }
}, {
    timestamps: true
});
ContactSchema.index({ organizationId: 1, phoneNumber: 1 });
ContactSchema.index({ organizationId: 1, status: 1 });
ContactSchema.index({ organizationId: 1, tags: 1 });
ContactSchema.index({ organizationId: 1, lifecycleStage: 1 });
ContactSchema.index({ organizationId: 1, assignedAgent: 1 });
ContactSchema.index({ organizationId: 1, lastInteraction: -1 });
ContactSchema.index({ organizationId: 1, createdAt: -1 });
ContactSchema.index({ organizationId: 1, status: 1, lifecycleStage: 1 });
ContactSchema.index({ organizationId: 1, tags: 1, status: 1 });
exports.Contact = mongoose_1.default.model('Contact', ContactSchema);
//# sourceMappingURL=Contact.js.map