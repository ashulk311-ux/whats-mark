import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { User, IUser } from '../../shared/models/User';
import { Organization } from '../../shared/models/Organization';
import { logger } from '../../shared/utils/logger';

export interface AuthRequest extends Request {
  user?: IUser;
  organization?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or inactive user' 
      });
    }

    const organization = await Organization.findById(user.organizationId);
    if (!organization || !organization.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or inactive organization' 
      });
    }

    req.user = user;
    req.organization = organization;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        success: false, 
        message: `Permission '${permission}' required` 
      });
    }

    next();
  };
};

export const requireOrganization = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
  if (!req.organization) {
    return res.status(401).json({ 
      success: false, 
      message: 'Organization access required' 
    });
  }

  next();
};
