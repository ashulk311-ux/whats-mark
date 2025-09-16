import { Request, Response, NextFunction } from 'express';
import { IUser } from '../../shared/models/User';
export interface AuthRequest extends Request {
    user?: IUser;
    organization?: any;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response | void>;
export declare const requireRole: (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response | void;
export declare const requirePermission: (permission: string) => (req: AuthRequest, res: Response, next: NextFunction) => Response | void;
export declare const requireOrganization: (req: AuthRequest, res: Response, next: NextFunction) => Response | void;
//# sourceMappingURL=auth.d.ts.map