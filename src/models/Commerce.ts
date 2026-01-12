import mongoose, { Schema, Document } from 'mongoose';

// --- Order Item Schema (Embedded or Reference) ---
// Embedded effectively in Order for snapshotting price/batch
const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true }, // Deduct from specific batch
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true }, // Price at time of sale
    totalPrice: { type: Number, required: true }, // q * price - discount
    taxAmount: { type: Number, default: 0 },
});

// --- Order Schema ---
export interface IOrder extends Document {
    tenantId: mongoose.Types.ObjectId;
    orderNumber: string; // INV-1001
    customerId?: mongoose.Types.ObjectId; // Optional customer link
    customerName?: string; // Walk-in
    customerPhone?: string;
    doctorName?: string; // Doctor tagging
    items: any[];
    subTotal: number;
    taxTotal: number;
    discountTotal: number;
    grandTotal: number;
    status: 'pending' | 'completed' | 'cancelled' | 'refunded';
    paymentStatus: 'paid' | 'unpaid' | 'partial';
    paymentMethods: {
        method: 'cash' | 'card' | 'upi' | 'netbanking';
        amount: number;
        transactionId?: string;
    }[];
    createdBy: mongoose.Types.ObjectId; // User who billed
}

const OrderSchema = new Schema<IOrder>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        orderNumber: { type: String, required: true, index: true },
        customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
        customerName: String,
        customerPhone: String,
        doctorName: String, // Analytics: Doctor Influence
        items: [OrderItemSchema],
        subTotal: { type: Number, required: true },
        taxTotal: { type: Number, default: 0 },
        discountTotal: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled', 'refunded'],
            default: 'completed',
        },
        paymentStatus: {
            type: String,
            enum: ['paid', 'unpaid', 'partial'],
            default: 'paid',
        },
        paymentMethods: [
            {
                method: { type: String, enum: ['cash', 'card', 'upi', 'netbanking'], default: 'cash' },
                amount: Number,
                transactionId: String,
            },
        ],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

// Unique Order Number per Tenant
OrderSchema.index({ tenantId: 1, orderNumber: 1 }, { unique: true });

// --- Payment Schema ---
// Tracks individual payment transactions, especially strictly for accounting/ledger
export interface IPayment extends Document {
    tenantId: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId; // Linked to Sales Order
    purchaseId?: mongoose.Types.ObjectId; // Linked to Purchase Order
    amount: number;
    method: 'cash' | 'card' | 'upi' | 'netbanking' | 'cheque';
    type: 'credit' | 'debit'; // Credit = Income (Sale), Debit = Expense (Purchase)
    transactionId?: string;
    notes?: string;
    recordedBy: mongoose.Types.ObjectId;
}

const PaymentSchema = new Schema<IPayment>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
        purchaseId: { type: Schema.Types.ObjectId, ref: 'Purchase' },
        amount: { type: Number, required: true },
        method: { type: String, required: true },
        type: { type: String, enum: ['credit', 'debit'], required: true },
        transactionId: String,
        notes: String,
        recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
