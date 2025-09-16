import { IContact } from '../models/Contact';
import { IContactSegment } from '../models/ContactSegment';
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
export declare class ContactService {
    createContact(contactData: Partial<IContact>): Promise<IContact>;
    getContacts(organizationId: string, filters?: ContactSearchFilters, page?: number, limit?: number): Promise<{
        contacts: IContact[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getContactById(contactId: string, organizationId: string): Promise<IContact | null>;
    updateContact(contactId: string, organizationId: string, updateData: Partial<IContact>): Promise<IContact | null>;
    deleteContact(contactId: string, organizationId: string): Promise<boolean>;
    addContactTag(contactId: string, organizationId: string, tag: string): Promise<IContact | null>;
    removeContactTag(contactId: string, organizationId: string, tag: string): Promise<IContact | null>;
    addContactNote(contactId: string, organizationId: string, content: string, createdBy: string): Promise<IContact | null>;
    updateContactCustomField(contactId: string, organizationId: string, field: string, value: any): Promise<IContact | null>;
    optOutContact(contactId: string, organizationId: string): Promise<IContact | null>;
    importContacts(organizationId: string, fileBuffer: Buffer, fileName: string, createdBy: string): Promise<ContactImportResult>;
    private importFromCSV;
    private importFromExcel;
    private parseContactRow;
    exportContacts(organizationId: string, filters?: ContactSearchFilters, format?: 'csv' | 'xlsx'): Promise<Buffer>;
    private exportToCSV;
    private exportToExcel;
    createSegment(segmentData: Partial<IContactSegment>): Promise<IContactSegment>;
    getSegments(organizationId: string): Promise<IContactSegment[]>;
    calculateSegmentContactCount(segmentId: string): Promise<number>;
    private buildSegmentQuery;
}
//# sourceMappingURL=ContactService.d.ts.map