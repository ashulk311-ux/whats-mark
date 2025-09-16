import { Request, Response } from 'express';
import { AuthRequest } from '../../auth/middleware/auth';
export declare class WhatsAppController {
    private getWhatsAppService;
    sendMessage(req: AuthRequest, res: Response): Promise<void>;
    sendTemplateMessage(req: AuthRequest, res: Response): Promise<void>;
    sendInteractiveMessage(req: AuthRequest, res: Response): Promise<void>;
    uploadMedia(req: AuthRequest, res: Response): Promise<void>;
    getMessageTemplates(req: AuthRequest, res: Response): Promise<void>;
    createMessageTemplate(req: AuthRequest, res: Response): Promise<void>;
    getBusinessProfile(req: AuthRequest, res: Response): Promise<void>;
    updateBusinessProfile(req: AuthRequest, res: Response): Promise<void>;
    webhook(req: Request, res: Response): Promise<void>;
    private handleIncomingMessages;
    private processIncomingMessage;
    private processMessageStatus;
}
//# sourceMappingURL=whatsappController.d.ts.map