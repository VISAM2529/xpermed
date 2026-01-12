import mongoose, { Schema, Document } from 'mongoose';

// --- AuditLog Schema ---
export interface IAuditLog extends Document {
    tenantId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    action: string; // 'CREATE_ORDER', 'UPDATE_PRODUCT', 'LOGIN'
    resource: string; // 'Order', 'Product', 'Auth'
    resourceId?: string; // ID of the affected object
    details?: any; // JSON diff or description
    ipAddress?: string;
    userAgent?: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        action: { type: String, required: true },
        resource: { type: String, required: true },
        resourceId: String,
        details: Schema.Types.Mixed, // Flexible for JSON
        ipAddress: String,
        userAgent: String,
    },
    { timestamps: true } // createdAt is the log timestamp
);

// TTL Index for auto-archiving logs after 1 year (optional)
// AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
