import mongoose, { Schema, Document } from 'mongoose';

export interface IDistributorLink extends Document {
    pharmacyId: mongoose.Types.ObjectId;   // The Pharmacy (Buyer)
    distributorId: mongoose.Types.ObjectId; // The Distributor (Seller)
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestDate: Date;
    responseDate?: Date;
    priceListId?: string; // Optional: Link to specific price catalogue
    creditLimit: number; // Max credit allowed by distributor
    outstandingDues: number; // Current debt
    createdAt: Date;
    updatedAt: Date;
}

const DistributorLinkSchema = new Schema<IDistributorLink>(
    {
        pharmacyId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        distributorId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING',
            index: true
        },
        requestDate: { type: Date, default: Date.now },
        responseDate: Date,
        priceListId: String,
        creditLimit: { type: Number, default: 0 },
        outstandingDues: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Ensure unique link between a specific pharmacy and distributor
DistributorLinkSchema.index({ pharmacyId: 1, distributorId: 1 }, { unique: true });

export const DistributorLink = mongoose.models.DistributorLink || mongoose.model<IDistributorLink>('DistributorLink', DistributorLinkSchema);
