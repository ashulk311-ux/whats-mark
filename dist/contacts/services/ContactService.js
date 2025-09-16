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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const Contact_1 = require("../models/Contact");
const ContactSegment_1 = require("../models/ContactSegment");
const logger_1 = require("../../shared/utils/logger");
const csv_parser_1 = __importDefault(require("csv-parser"));
const XLSX = __importStar(require("xlsx"));
const stream_1 = require("stream");
class ContactService {
    async createContact(contactData) {
        try {
            const existingContact = await Contact_1.Contact.findOne({
                organizationId: contactData.organizationId,
                phoneNumber: contactData.phoneNumber
            });
            if (existingContact) {
                throw new Error('Contact with this phone number already exists');
            }
            const contact = new Contact_1.Contact(contactData);
            await contact.save();
            logger_1.logger.info(`Contact created: ${contact._id}`);
            return contact;
        }
        catch (error) {
            logger_1.logger.error('Failed to create contact:', error);
            throw error;
        }
    }
    async getContacts(organizationId, filters = {}, page = 1, limit = 20) {
        try {
            const query = { organizationId };
            if (filters.search) {
                query.$or = [
                    { firstName: { $regex: filters.search, $options: 'i' } },
                    { lastName: { $regex: filters.search, $options: 'i' } },
                    { phoneNumber: { $regex: filters.search, $options: 'i' } },
                    { email: { $regex: filters.search, $options: 'i' } }
                ];
            }
            if (filters.tags && filters.tags.length > 0) {
                query.tags = { $in: filters.tags };
            }
            if (filters.status && filters.status.length > 0) {
                query.status = { $in: filters.status };
            }
            if (filters.lifecycleStage && filters.lifecycleStage.length > 0) {
                query.lifecycleStage = { $in: filters.lifecycleStage };
            }
            if (filters.source && filters.source.length > 0) {
                query.source = { $in: filters.source };
            }
            if (filters.assignedAgent) {
                query.assignedAgent = filters.assignedAgent;
            }
            if (filters.dateRange) {
                query[filters.dateRange.field] = {
                    $gte: filters.dateRange.start,
                    $lte: filters.dateRange.end
                };
            }
            if (filters.customFields && filters.customFields.length > 0) {
                for (const customField of filters.customFields) {
                    const fieldPath = `customFields.${customField.field}`;
                    switch (customField.operator) {
                        case 'equals':
                            query[fieldPath] = customField.value;
                            break;
                        case 'not_equals':
                            query[fieldPath] = { $ne: customField.value };
                            break;
                        case 'contains':
                            query[fieldPath] = { $regex: customField.value, $options: 'i' };
                            break;
                        case 'not_contains':
                            query[fieldPath] = { $not: { $regex: customField.value, $options: 'i' } };
                            break;
                        case 'greater_than':
                            query[fieldPath] = { $gt: customField.value };
                            break;
                        case 'less_than':
                            query[fieldPath] = { $lt: customField.value };
                            break;
                        case 'in':
                            query[fieldPath] = { $in: customField.value };
                            break;
                        case 'not_in':
                            query[fieldPath] = { $nin: customField.value };
                            break;
                        case 'exists':
                            query[fieldPath] = { $exists: true };
                            break;
                        case 'not_exists':
                            query[fieldPath] = { $exists: false };
                            break;
                    }
                }
            }
            const skip = (page - 1) * limit;
            const [contacts, total] = await Promise.all([
                Contact_1.Contact.find(query)
                    .sort({ lastInteraction: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('assignedAgent', 'firstName lastName email')
                    .lean(),
                Contact_1.Contact.countDocuments(query)
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                contacts,
                total,
                page,
                totalPages
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get contacts:', error);
            throw error;
        }
    }
    async getContactById(contactId, organizationId) {
        try {
            const contact = await Contact_1.Contact.findOne({
                _id: contactId,
                organizationId
            }).populate('assignedAgent', 'firstName lastName email');
            return contact;
        }
        catch (error) {
            logger_1.logger.error('Failed to get contact by ID:', error);
            throw error;
        }
    }
    async updateContact(contactId, organizationId, updateData) {
        try {
            const contact = await Contact_1.Contact.findOneAndUpdate({ _id: contactId, organizationId }, updateData, { new: true, runValidators: true });
            if (contact) {
                logger_1.logger.info(`Contact updated: ${contactId}`);
            }
            return contact;
        }
        catch (error) {
            logger_1.logger.error('Failed to update contact:', error);
            throw error;
        }
    }
    async deleteContact(contactId, organizationId) {
        try {
            const result = await Contact_1.Contact.findOneAndDelete({
                _id: contactId,
                organizationId
            });
            if (result) {
                logger_1.logger.info(`Contact deleted: ${contactId}`);
                return true;
            }
            return false;
        }
        catch (error) {
            logger_1.logger.error('Failed to delete contact:', error);
            throw error;
        }
    }
    async addContactTag(contactId, organizationId, tag) {
        try {
            const contact = await Contact_1.Contact.findOneAndUpdate({ _id: contactId, organizationId }, { $addToSet: { tags: tag } }, { new: true });
            return contact;
        }
        catch (error) {
            logger_1.logger.error('Failed to add contact tag:', error);
            throw error;
        }
    }
    async removeContactTag(contactId, organizationId, tag) {
        try {
            const contact = await Contact_1.Contact.findOneAndUpdate({ _id: contactId, organizationId }, { $pull: { tags: tag } }, { new: true });
            return contact;
        }
        catch (error) {
            logger_1.logger.error('Failed to remove contact tag:', error);
            throw error;
        }
    }
    async addContactNote(contactId, organizationId, content, createdBy) {
        try {
            const contact = await Contact_1.Contact.findOneAndUpdate({ _id: contactId, organizationId }, {
                $push: {
                    notes: {
                        content,
                        createdBy,
                        createdAt: new Date()
                    }
                }
            }, { new: true });
            return contact;
        }
        catch (error) {
            logger_1.logger.error('Failed to add contact note:', error);
            throw error;
        }
    }
    async updateContactCustomField(contactId, organizationId, field, value) {
        try {
            const contact = await Contact_1.Contact.findOneAndUpdate({ _id: contactId, organizationId }, { [`customFields.${field}`]: value }, { new: true });
            return contact;
        }
        catch (error) {
            logger_1.logger.error('Failed to update contact custom field:', error);
            throw error;
        }
    }
    async optOutContact(contactId, organizationId) {
        try {
            const contact = await Contact_1.Contact.findOneAndUpdate({ _id: contactId, organizationId }, {
                optOut: true,
                optOutDate: new Date(),
                status: 'opt_out'
            }, { new: true });
            return contact;
        }
        catch (error) {
            logger_1.logger.error('Failed to opt out contact:', error);
            throw error;
        }
    }
    async importContacts(organizationId, fileBuffer, fileName, createdBy) {
        try {
            const result = {
                total: 0,
                success: 0,
                failed: 0,
                errors: []
            };
            const fileExtension = fileName.split('.').pop()?.toLowerCase();
            if (fileExtension === 'csv') {
                await this.importFromCSV(organizationId, fileBuffer, createdBy, result);
            }
            else if (['xlsx', 'xls'].includes(fileExtension || '')) {
                await this.importFromExcel(organizationId, fileBuffer, createdBy, result);
            }
            else {
                throw new Error('Unsupported file format. Please use CSV or Excel files.');
            }
            logger_1.logger.info(`Contact import completed: ${result.success}/${result.total} successful`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Failed to import contacts:', error);
            throw error;
        }
    }
    async importFromCSV(organizationId, fileBuffer, createdBy, result) {
        return new Promise((resolve, reject) => {
            const contacts = [];
            let rowNumber = 0;
            const stream = stream_1.Readable.from(fileBuffer.toString());
            stream
                .pipe((0, csv_parser_1.default)())
                .on('data', (row) => {
                rowNumber++;
                result.total++;
                try {
                    const contactData = this.parseContactRow(row, organizationId, createdBy);
                    contacts.push(contactData);
                    result.success++;
                }
                catch (error) {
                    result.failed++;
                    result.errors.push({
                        row: rowNumber,
                        error: error.message
                    });
                }
            })
                .on('end', async () => {
                try {
                    await Contact_1.Contact.insertMany(contacts, { ordered: false });
                    resolve();
                }
                catch (error) {
                    if (error.code === 11000) {
                        const duplicateCount = error.writeErrors?.length || 0;
                        result.success -= duplicateCount;
                        result.failed += duplicateCount;
                        error.writeErrors?.forEach((writeError) => {
                            result.errors.push({
                                row: writeError.index + 1,
                                error: 'Duplicate phone number'
                            });
                        });
                    }
                    resolve();
                }
            })
                .on('error', reject);
        });
    }
    async importFromExcel(organizationId, fileBuffer, createdBy, result) {
        try {
            const workbook = XLSX.read(fileBuffer);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            const contacts = [];
            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i];
                result.total++;
                try {
                    const contactData = this.parseContactRow(row, organizationId, createdBy);
                    contacts.push(contactData);
                    result.success++;
                }
                catch (error) {
                    result.failed++;
                    result.errors.push({
                        row: i + 1,
                        error: error.message
                    });
                }
            }
            await Contact_1.Contact.insertMany(contacts, { ordered: false });
        }
        catch (error) {
            if (error.code === 11000) {
                const duplicateCount = error.writeErrors?.length || 0;
                result.success -= duplicateCount;
                result.failed += duplicateCount;
                error.writeErrors?.forEach((writeError) => {
                    result.errors.push({
                        row: writeError.index + 1,
                        error: 'Duplicate phone number'
                    });
                });
            }
            else {
                throw error;
            }
        }
    }
    parseContactRow(row, organizationId, createdBy) {
        const phoneNumber = row.phone || row.phoneNumber || row.phone_number;
        if (!phoneNumber) {
            throw new Error('Phone number is required');
        }
        return {
            organizationId,
            phoneNumber: phoneNumber.toString().trim(),
            firstName: row.firstName || row.first_name || row.firstname || '',
            lastName: row.lastName || row.last_name || row.lastname || '',
            email: row.email || '',
            tags: row.tags ? row.tags.split(',').map((tag) => tag.trim()) : [],
            source: 'import',
            createdBy
        };
    }
    async exportContacts(organizationId, filters = {}, format = 'csv') {
        try {
            const query = { organizationId };
            if (filters.search) {
                query.$or = [
                    { firstName: { $regex: filters.search, $options: 'i' } },
                    { lastName: { $regex: filters.search, $options: 'i' } },
                    { phoneNumber: { $regex: filters.search, $options: 'i' } },
                    { email: { $regex: filters.search, $options: 'i' } }
                ];
            }
            if (filters.tags && filters.tags.length > 0) {
                query.tags = { $in: filters.tags };
            }
            if (filters.status && filters.status.length > 0) {
                query.status = { $in: filters.status };
            }
            if (filters.lifecycleStage && filters.lifecycleStage.length > 0) {
                query.lifecycleStage = { $in: filters.lifecycleStage };
            }
            const contacts = await Contact_1.Contact.find(query)
                .sort({ createdAt: -1 })
                .lean();
            if (format === 'csv') {
                return this.exportToCSV(contacts);
            }
            else {
                return this.exportToExcel(contacts);
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to export contacts:', error);
            throw error;
        }
    }
    exportToCSV(contacts) {
        const headers = ['Phone Number', 'First Name', 'Last Name', 'Email', 'Tags', 'Status', 'Lifecycle Stage', 'Created At'];
        const csvRows = [headers.join(',')];
        for (const contact of contacts) {
            const row = [
                contact.phoneNumber,
                contact.firstName || '',
                contact.lastName || '',
                contact.email || '',
                contact.tags.join(';'),
                contact.status,
                contact.lifecycleStage,
                contact.createdAt.toISOString()
            ];
            csvRows.push(row.join(','));
        }
        return Buffer.from(csvRows.join('\n'));
    }
    exportToExcel(contacts) {
        const worksheet = XLSX.utils.json_to_sheet(contacts.map(contact => ({
            'Phone Number': contact.phoneNumber,
            'First Name': contact.firstName || '',
            'Last Name': contact.lastName || '',
            'Email': contact.email || '',
            'Tags': contact.tags.join(';'),
            'Status': contact.status,
            'Lifecycle Stage': contact.lifecycleStage,
            'Created At': contact.createdAt.toISOString()
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
    async createSegment(segmentData) {
        try {
            const segment = new ContactSegment_1.ContactSegment(segmentData);
            await segment.save();
            await this.calculateSegmentContactCount(segment._id);
            logger_1.logger.info(`Contact segment created: ${segment._id}`);
            return segment;
        }
        catch (error) {
            logger_1.logger.error('Failed to create contact segment:', error);
            throw error;
        }
    }
    async getSegments(organizationId) {
        try {
            const segments = await ContactSegment_1.ContactSegment.find({ organizationId })
                .sort({ createdAt: -1 })
                .lean();
            return segments;
        }
        catch (error) {
            logger_1.logger.error('Failed to get contact segments:', error);
            throw error;
        }
    }
    async calculateSegmentContactCount(segmentId) {
        try {
            const segment = await ContactSegment_1.ContactSegment.findById(segmentId);
            if (!segment) {
                throw new Error('Segment not found');
            }
            const query = this.buildSegmentQuery(segment);
            const count = await Contact_1.Contact.countDocuments(query);
            await ContactSegment_1.ContactSegment.findByIdAndUpdate(segmentId, {
                contactCount: count,
                lastCalculated: new Date()
            });
            return count;
        }
        catch (error) {
            logger_1.logger.error('Failed to calculate segment contact count:', error);
            throw error;
        }
    }
    buildSegmentQuery(segment) {
        const query = { organizationId: segment.organizationId };
        if (segment.criteria.conditions.length > 0) {
            const conditions = segment.criteria.conditions.map(condition => {
                const fieldPath = condition.field.startsWith('customFields.')
                    ? condition.field
                    : condition.field;
                switch (condition.operator) {
                    case 'equals':
                        return { [fieldPath]: condition.value };
                    case 'not_equals':
                        return { [fieldPath]: { $ne: condition.value } };
                    case 'contains':
                        return { [fieldPath]: { $regex: condition.value, $options: 'i' } };
                    case 'not_contains':
                        return { [fieldPath]: { $not: { $regex: condition.value, $options: 'i' } } };
                    case 'greater_than':
                        return { [fieldPath]: { $gt: condition.value } };
                    case 'less_than':
                        return { [fieldPath]: { $lt: condition.value } };
                    case 'in':
                        return { [fieldPath]: { $in: condition.value } };
                    case 'not_in':
                        return { [fieldPath]: { $nin: condition.value } };
                    case 'exists':
                        return { [fieldPath]: { $exists: true } };
                    case 'not_exists':
                        return { [fieldPath]: { $exists: false } };
                    default:
                        return {};
                }
            });
            if (segment.criteria.logic === 'AND') {
                query.$and = conditions;
            }
            else {
                query.$or = conditions;
            }
        }
        if (segment.filters.tags && segment.filters.tags.length > 0) {
            query.tags = { $in: segment.filters.tags };
        }
        if (segment.filters.status && segment.filters.status.length > 0) {
            query.status = { $in: segment.filters.status };
        }
        if (segment.filters.lifecycleStage && segment.filters.lifecycleStage.length > 0) {
            query.lifecycleStage = { $in: segment.filters.lifecycleStage };
        }
        if (segment.filters.source && segment.filters.source.length > 0) {
            query.source = { $in: segment.filters.source };
        }
        if (segment.filters.dateRange) {
            query[segment.filters.dateRange.field] = {
                $gte: segment.filters.dateRange.start,
                $lte: segment.filters.dateRange.end
            };
        }
        return query;
    }
}
exports.ContactService = ContactService;
//# sourceMappingURL=ContactService.js.map