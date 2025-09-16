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
exports.Organization = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const OrganizationSchema = new mongoose_1.Schema({
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
OrganizationSchema.index({ name: 1 });
OrganizationSchema.index({ domain: 1 });
OrganizationSchema.index({ 'subscription.status': 1 });
exports.Organization = mongoose_1.default.model('Organization', OrganizationSchema);
//# sourceMappingURL=Organization.js.map