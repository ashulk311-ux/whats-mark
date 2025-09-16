import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    _id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'super_admin' | 'admin' | 'manager' | 'agent' | 'supervisor';
    organizationId: string;
    isActive: boolean;
    lastLogin?: Date;
    profilePicture?: string;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map