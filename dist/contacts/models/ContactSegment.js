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
exports.ContactSegment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ContactSegmentSchema = new mongoose_1.Schema({
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
                    type: mongoose_1.Schema.Types.Mixed,
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
                value: mongoose_1.Schema.Types.Mixed
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
ContactSegmentSchema.index({ organizationId: 1, name: 1 });
ContactSegmentSchema.index({ organizationId: 1, isDynamic: 1 });
ContactSegmentSchema.index({ createdBy: 1 });
exports.ContactSegment = mongoose_1.default.model('ContactSegment', ContactSegmentSchema);
//# sourceMappingURL=ContactSegment.js.map