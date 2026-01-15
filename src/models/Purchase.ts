
import mongoose, { Schema, Document } from 'mongoose';

const PurchaseItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    batchNumber: { type: String, required: true }, // The batch created from this purchase
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 1 },
    purchaseRate: { type: Number, required: true }, // Cost per unit
    mrp: { type: Number, required: true },
    totalAmount: { type: Number, required: true }, // qty * purchaseRate
    scheme: String, // Free goods (e.g. 10+1)
    taxPercentage: { type: Number, default: 0 },
});

export interface IDistributorPurchase extends Document {
    tenantId: mongoose.Types.ObjectId;
    supplierId: mongoose.Types.ObjectId;
    billNumber: string;
    billDate: Date;
    entryDate: Date;
    items: any[];
    transportCost: number;
    otherCharges: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number; // Grand Total
    paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL';
    remarks?: string;
    createdBy: mongoose.Types.ObjectId;
}

const DistributorPurchaseSchema = new Schema<IDistributorPurchase>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
        billNumber: { type: String, required: true },
        billDate: { type: Date, required: true },
        entryDate: { type: Date, default: Date.now },
        items: [PurchaseItemSchema],
        transportCost: { type: Number, default: 0 },
        otherCharges: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        paymentStatus: { type: String, enum: ['PAID', 'UNPAID', 'PARTIAL'], default: 'UNPAID' },
        remarks: String,
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

// Index to prevent duplicate bill entry for same supplier
DistributorPurchaseSchema.index({ tenantId: 1, supplierId: 1, billNumber: 1 }, { unique: true });

export const DistributorPurchase = mongoose.models.DistributorPurchase || mongoose.model<IDistributorPurchase>('DistributorPurchase', DistributorPurchaseSchema);
