import mongoose, { Schema, Document } from 'mongoose';

// --- Supplier Schema ---
export interface ISupplier extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
    gstNumber?: string;
    address?: string;
    openingBalance: number; // Ledger start
}

const SupplierSchema = new Schema<ISupplier>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true },
        email: String,
        phone: String,
        gstNumber: String,
        address: String,
        openingBalance: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// --- Purchase Schema ---
// Inward Stock Logic
export interface IPurchase extends Document {
    tenantId: mongoose.Types.ObjectId;
    supplierId: mongoose.Types.ObjectId;
    invoiceNumber: string;
    invoiceDate: Date;
    items: {
        productId: mongoose.Types.ObjectId;
        batchNumber: string;
        expiryDate: Date;
        quantity: number;
        freeQuantity?: number; // Scheme (10 + 1 free)
        costPrice: number;
        mrp: number;
        taxAmount: number;
    }[];
    totalAmount: number;
    paidAmount: number; // Balance = Total - Paid
    paymentStatus: 'paid' | 'partial' | 'due';
    status: 'received' | 'pending' | 'returned';
}

const PurchaseSchema = new Schema<IPurchase>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
        invoiceNumber: { type: String, required: true },
        invoiceDate: { type: Date, required: true },
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                batchNumber: String,
                expiryDate: Date,
                quantity: Number,
                freeQuantity: { type: Number, default: 0 },
                costPrice: Number,
                mrp: Number,
                taxAmount: Number,
            },
        ],
        totalAmount: { type: Number, required: true },
        paidAmount: { type: Number, default: 0 },
        paymentStatus: {
            type: String,
            enum: ['paid', 'partial', 'due'],
            default: 'due',
        },
        status: {
            type: String,
            enum: ['received', 'pending', 'returned'],
            default: 'received',
        },
    },
    { timestamps: true }
);

// Compound index for unique supplier invoice
PurchaseSchema.index({ tenantId: 1, supplierId: 1, invoiceNumber: 1 }, { unique: true });

export const Supplier = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
export const Purchase = mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);
