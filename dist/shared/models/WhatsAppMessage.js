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
exports.WhatsAppMessage = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const WhatsAppMessageSchema = new mongoose_1.Schema({
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
            components: [mongoose_1.Schema.Types.Mixed]
        },
        interactive: {
            type: {
                type: String,
                enum: ['button', 'list']
            },
            header: mongoose_1.Schema.Types.Mixed,
            body: mongoose_1.Schema.Types.Mixed,
            footer: mongoose_1.Schema.Types.Mixed,
            action: mongoose_1.Schema.Types.Mixed
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
    metadata: mongoose_1.Schema.Types.Mixed,
    error: {
        code: Number,
        title: String,
        message: String
    }
}, {
    timestamps: true
});
WhatsAppMessageSchema.index({ organizationId: 1, to: 1 });
WhatsAppMessageSchema.index({ organizationId: 1, timestamp: -1 });
WhatsAppMessageSchema.index({ conversationId: 1 });
WhatsAppMessageSchema.index({ campaignId: 1 });
WhatsAppMessageSchema.index({ wamid: 1 });
WhatsAppMessageSchema.index({ status: 1 });
exports.WhatsAppMessage = mongoose_1.default.model('WhatsAppMessage', WhatsAppMessageSchema);
//# sourceMappingURL=WhatsAppMessage.js.map