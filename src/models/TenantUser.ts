import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Tenant Schema ---
export interface ITenant extends Document {
    name: string;
    subdomain: string; // unique identifier for URL
    customDomain?: string;
    email: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
    licenseNumber?: string;
    currency: string;
    timezone: string;
    language: 'en' | 'mr'; // English or Marathi
    onboardingStatus: 'pending' | 'approved' | 'rejected'; // Approval Flow
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled';
    planId?: mongoose.Types.ObjectId;
    subscriptionExpiry?: Date;
    settings: {
        invoicePrefix: string;
        lowStockThreshold: number;
        enableExpiryAlerts: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
    {
        name: { type: String, required: true },
        subdomain: { type: String, required: true, unique: true, index: true },
        customDomain: { type: String, unique: true, sparse: true },
        email: { type: String, required: true },
        phone: String,
        address: String,
        gstNumber: String,
        licenseNumber: String,
        currency: { type: String, default: 'INR' },
        timezone: { type: String, default: 'Asia/Kolkata' },
        language: { type: String, enum: ['en', 'mr'], default: 'en' },
        onboardingStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date,
        subscriptionStatus: {
            type: String,
            enum: ['active', 'trialing', 'past_due', 'canceled'],
            default: 'trialing',
        },
        planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
        subscriptionExpiry: Date,
        settings: {
            invoicePrefix: { type: String, default: 'INV' },
            lowStockThreshold: { type: Number, default: 10 },
            enableExpiryAlerts: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

// --- User Schema ---
export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: 'platform_admin' | 'super_admin' | 'admin' | 'pharmacist' | 'accountant';
    tenantId: mongoose.Types.ObjectId; // Crucial for multi-tenancy
    permissions: string[]; // explicit permission overrides
    isActive: boolean;
    lastLogin?: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true }, // Index handled by compound/unique index below
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: ['platform_admin', 'super_admin', 'admin', 'pharmacist', 'accountant'],
            default: 'pharmacist',
        },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        permissions: [String],
        isActive: { type: Boolean, default: true },
        lastLogin: Date,
    },
    { timestamps: true }
);

// Compound index for unique email WITHIN a tenant (optional, depends if users are global or tenant-scoped)
// If users are unique globally (SaaS style), email should be unique globally.
// If same email can be in multiple tenants, use compound.
// Requirement: "One tenant can have multiple users". Usually SaaS emails are unique globally for login simplicity.
UserSchema.index({ email: 1 }, { unique: true });

export const Tenant = mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
