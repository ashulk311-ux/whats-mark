import { Contact, IContact } from '../models/Contact';
import { ContactSegment, IContactSegment } from '../models/ContactSegment';
import { logger } from '../../shared/utils/logger';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';

export interface ContactImportResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

export interface ContactSearchFilters {
  search?: string;
  tags?: string[];
  status?: string[];
  lifecycleStage?: string[];
  source?: string[];
  assignedAgent?: string;
  dateRange?: {
    field: 'createdAt' | 'lastInteraction' | 'updatedAt';
    start: Date;
    end: Date;
  };
  customFields?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
}

export class ContactService {
  public async createContact(contactData: Partial<IContact>): Promise<IContact> {
    try {
      // Check if contact already exists
      const existingContact = await Contact.findOne({
        organizationId: contactData.organizationId,
        phoneNumber: contactData.phoneNumber
      });

      if (existingContact) {
        throw new Error('Contact with this phone number already exists');
      }

      const contact = new Contact(contactData);
      await contact.save();

      logger.info(`Contact created: ${contact._id}`);
      return contact;
    } catch (error) {
      logger.error('Failed to create contact:', error);
      throw error;
    }
  }

  public async getContacts(
    organizationId: string,
    filters: ContactSearchFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ contacts: IContact[]; total: number; page: number; totalPages: number }> {
    try {
      const query: any = { organizationId };

      // Apply filters
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

      // Apply custom field filters
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
        Contact.find(query)
          .sort({ lastInteraction: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('assignedAgent', 'firstName lastName email')
          .lean(),
        Contact.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        contacts,
        total,
        page,
        totalPages
      };
    } catch (error) {
      logger.error('Failed to get contacts:', error);
      throw error;
    }
  }

  public async getContactById(contactId: string, organizationId: string): Promise<IContact | null> {
    try {
      const contact = await Contact.findOne({
        _id: contactId,
        organizationId
      }).populate('assignedAgent', 'firstName lastName email');

      return contact;
    } catch (error) {
      logger.error('Failed to get contact by ID:', error);
      throw error;
    }
  }

  public async updateContact(
    contactId: string,
    organizationId: string,
    updateData: Partial<IContact>
  ): Promise<IContact | null> {
    try {
      const contact = await Contact.findOneAndUpdate(
        { _id: contactId, organizationId },
        updateData,
        { new: true, runValidators: true }
      );

      if (contact) {
        logger.info(`Contact updated: ${contactId}`);
      }

      return contact;
    } catch (error) {
      logger.error('Failed to update contact:', error);
      throw error;
    }
  }

  public async deleteContact(contactId: string, organizationId: string): Promise<boolean> {
    try {
      const result = await Contact.findOneAndDelete({
        _id: contactId,
        organizationId
      });

      if (result) {
        logger.info(`Contact deleted: ${contactId}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to delete contact:', error);
      throw error;
    }
  }

  public async addContactTag(
    contactId: string,
    organizationId: string,
    tag: string
  ): Promise<IContact | null> {
    try {
      const contact = await Contact.findOneAndUpdate(
        { _id: contactId, organizationId },
        { $addToSet: { tags: tag } },
        { new: true }
      );

      return contact;
    } catch (error) {
      logger.error('Failed to add contact tag:', error);
      throw error;
    }
  }

  public async removeContactTag(
    contactId: string,
    organizationId: string,
    tag: string
  ): Promise<IContact | null> {
    try {
      const contact = await Contact.findOneAndUpdate(
        { _id: contactId, organizationId },
        { $pull: { tags: tag } },
        { new: true }
      );

      return contact;
    } catch (error) {
      logger.error('Failed to remove contact tag:', error);
      throw error;
    }
  }

  public async addContactNote(
    contactId: string,
    organizationId: string,
    content: string,
    createdBy: string
  ): Promise<IContact | null> {
    try {
      const contact = await Contact.findOneAndUpdate(
        { _id: contactId, organizationId },
        {
          $push: {
            notes: {
              content,
              createdBy,
              createdAt: new Date()
            }
          }
        },
        { new: true }
      );

      return contact;
    } catch (error) {
      logger.error('Failed to add contact note:', error);
      throw error;
    }
  }

  public async updateContactCustomField(
    contactId: string,
    organizationId: string,
    field: string,
    value: any
  ): Promise<IContact | null> {
    try {
      const contact = await Contact.findOneAndUpdate(
        { _id: contactId, organizationId },
        { [`customFields.${field}`]: value },
        { new: true }
      );

      return contact;
    } catch (error) {
      logger.error('Failed to update contact custom field:', error);
      throw error;
    }
  }

  public async optOutContact(
    contactId: string,
    organizationId: string
  ): Promise<IContact | null> {
    try {
      const contact = await Contact.findOneAndUpdate(
        { _id: contactId, organizationId },
        {
          optOut: true,
          optOutDate: new Date(),
          status: 'opt_out'
        },
        { new: true }
      );

      return contact;
    } catch (error) {
      logger.error('Failed to opt out contact:', error);
      throw error;
    }
  }

  public async importContacts(
    organizationId: string,
    fileBuffer: Buffer,
    fileName: string,
    createdBy: string
  ): Promise<ContactImportResult> {
    try {
      const result: ContactImportResult = {
        total: 0,
        success: 0,
        failed: 0,
        errors: []
      };

      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        await this.importFromCSV(organizationId, fileBuffer, createdBy, result);
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        await this.importFromExcel(organizationId, fileBuffer, createdBy, result);
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel files.');
      }

      logger.info(`Contact import completed: ${result.success}/${result.total} successful`);
      return result;
    } catch (error) {
      logger.error('Failed to import contacts:', error);
      throw error;
    }
  }

  private async importFromCSV(
    organizationId: string,
    fileBuffer: Buffer,
    createdBy: string,
    result: ContactImportResult
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const contacts: any[] = [];
      let rowNumber = 0;

      const stream = Readable.from(fileBuffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (row) => {
          rowNumber++;
          result.total++;

          try {
            const contactData = this.parseContactRow(row, organizationId, createdBy);
            contacts.push(contactData);
            result.success++;
          } catch (error: any) {
            result.failed++;
            result.errors.push({
              row: rowNumber,
              error: error.message
            });
          }
        })
        .on('end', async () => {
          try {
            await Contact.insertMany(contacts, { ordered: false });
            resolve();
          } catch (error: any) {
            // Handle duplicate key errors
            if (error.code === 11000) {
              // Some contacts were inserted successfully, others failed due to duplicates
              const duplicateCount = error.writeErrors?.length || 0;
              result.success -= duplicateCount;
              result.failed += duplicateCount;
              
              error.writeErrors?.forEach((writeError: any) => {
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

  private async importFromExcel(
    organizationId: string,
    fileBuffer: Buffer,
    createdBy: string,
    result: ContactImportResult
  ): Promise<void> {
    try {
      const workbook = XLSX.read(fileBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const contacts: any[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        result.total++;

        try {
          const contactData = this.parseContactRow(row, organizationId, createdBy);
          contacts.push(contactData);
          result.success++;
        } catch (error: any) {
          result.failed++;
          result.errors.push({
            row: i + 1,
            error: error.message
          });
        }
      }

      await Contact.insertMany(contacts, { ordered: false });
    } catch (error: any) {
      if (error.code === 11000) {
        // Handle duplicate key errors
        const duplicateCount = error.writeErrors?.length || 0;
        result.success -= duplicateCount;
        result.failed += duplicateCount;
        
        error.writeErrors?.forEach((writeError: any) => {
          result.errors.push({
            row: writeError.index + 1,
            error: 'Duplicate phone number'
          });
        });
      } else {
        throw error;
      }
    }
  }

  private parseContactRow(row: any, organizationId: string, createdBy: string): any {
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
      tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : [],
      source: 'import',
      createdBy
    };
  }

  public async exportContacts(
    organizationId: string,
    filters: ContactSearchFilters = {},
    format: 'csv' | 'xlsx' = 'csv'
  ): Promise<Buffer> {
    try {
      const query: any = { organizationId };

      // Apply same filters as getContacts method
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

      const contacts = await Contact.find(query)
        .sort({ createdAt: -1 })
        .lean();

      if (format === 'csv') {
        return this.exportToCSV(contacts);
      } else {
        return this.exportToExcel(contacts);
      }
    } catch (error) {
      logger.error('Failed to export contacts:', error);
      throw error;
    }
  }

  private exportToCSV(contacts: any[]): Buffer {
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

  private exportToExcel(contacts: any[]): Buffer {
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

  // Segment management methods
  public async createSegment(segmentData: Partial<IContactSegment>): Promise<IContactSegment> {
    try {
      const segment = new ContactSegment(segmentData);
      await segment.save();

      // Calculate initial contact count
      await this.calculateSegmentContactCount(segment._id);

      logger.info(`Contact segment created: ${segment._id}`);
      return segment;
    } catch (error) {
      logger.error('Failed to create contact segment:', error);
      throw error;
    }
  }

  public async getSegments(organizationId: string): Promise<IContactSegment[]> {
    try {
      const segments = await ContactSegment.find({ organizationId })
        .sort({ createdAt: -1 })
        .lean();

      return segments;
    } catch (error) {
      logger.error('Failed to get contact segments:', error);
      throw error;
    }
  }

  public async calculateSegmentContactCount(segmentId: string): Promise<number> {
    try {
      const segment = await ContactSegment.findById(segmentId);
      if (!segment) {
        throw new Error('Segment not found');
      }

      const query = this.buildSegmentQuery(segment);
      const count = await Contact.countDocuments(query);

      await ContactSegment.findByIdAndUpdate(segmentId, {
        contactCount: count,
        lastCalculated: new Date()
      });

      return count;
    } catch (error) {
      logger.error('Failed to calculate segment contact count:', error);
      throw error;
    }
  }

  private buildSegmentQuery(segment: IContactSegment): any {
    const query: any = { organizationId: segment.organizationId };

    // Apply criteria conditions
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
      } else {
        query.$or = conditions;
      }
    }

    // Apply filters
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
