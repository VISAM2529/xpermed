import mongoose, { Schema, Document } from 'mongoose';

// Items within a B2B Order
const DistributorOrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true }, // ID in Distributor's inventory
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true }, // Agreed price at time of order
    totalPrice: { type: Number, required: true },
});

export interface IDistributorOrder extends Document {
    pharmacyId: mongoose.Types.ObjectId;   // Buyer
    distributorId: mongoose.Types.ObjectId; // Seller
    orderNumber: string; // PO-2026-001
    items: any[];
    totalAmount: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'PACKED' | 'SHIPPED' | 'DELIVERED';
    remarks?: string; // "Stock unavailable", "Will ship tomorrow"
    timeline: { status: string, timestamp: Date, remark: string }[];
    invoiceUrl?: string; // Generated PDF Link
    deliveryOtp?: string; // OTP for delivery verification
    assignedTo?: mongoose.Types.ObjectId; // Salesman ID
    createdAt: Date;
    updatedAt: Date;
}

const DistributorOrderSchema = new Schema<IDistributorOrder>(
    {
        pharmacyId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        distributorId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        orderNumber: { type: String, required: true },
        items: [DistributorOrderItemSchema],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'PACKED', 'SHIPPED', 'DELIVERED'],
            default: 'PENDING',
            index: true
        },
        remarks: String,
        timeline: [
            {
                status: String,
                timestamp: { type: Date, default: Date.now },
                remark: String
            }
        ],
        invoiceUrl: String,
        deliveryOtp: String,
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

export const DistributorOrder = mongoose.models.DistributorOrder || mongoose.model<IDistributorOrder>('DistributorOrder', DistributorOrderSchema);
