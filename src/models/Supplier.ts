
import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
    contactPerson?: string;
    status: 'ACTIVE' | 'INACTIVE';
}

const SupplierSchema = new Schema<ISupplier>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true },
        email: String,
        phone: String,
        address: String,
        gstNumber: String,
        contactPerson: String,
        status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
    },
    { timestamps: true }
);

// Prevent duplicate supplier names for the same tenant
SupplierSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const Supplier = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
