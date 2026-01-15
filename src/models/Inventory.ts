import mongoose, { Schema, Document } from 'mongoose';

// --- Product Schema ---
export interface IProduct extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    sku?: string;
    description?: string;
    category?: string;
    manufacturer?: string;
    minStockLevel: number; // For low stock alerts
    unit: string; // strip, bottle, tablet
    isPrescriptionRequired: boolean;
    gstRate: number; // 0, 5, 12, 18, 28
    hsnCode?: string;
    seasonality?: 'All Year' | 'Summer' | 'Winter' | 'Monsoon';
    isActive: boolean;
}

const ProductSchema = new Schema<IProduct>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true, index: true }, // Indexed for search
        sku: String,
        description: String,
        category: String,
        manufacturer: String,
        minStockLevel: { type: Number, default: 10 },
        unit: { type: String, default: 'strip' },
        isPrescriptionRequired: { type: Boolean, default: false },
        gstRate: { type: Number, default: 0 },
        hsnCode: String,
        seasonality: { type: String, enum: ['All Year', 'Summer', 'Winter', 'Monsoon'], default: 'All Year' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Compound index for unique SKU per tenant
// Compound index for unique SKU per tenant (only if SKU exists and is a string)
ProductSchema.index({ tenantId: 1, sku: 1 }, { unique: true, partialFilterExpression: { sku: { $type: "string" } } });


// --- Batch Schema (Inventory) ---
export interface IBatch extends Document {
    tenantId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    batchNumber: string;
    expiryDate: Date;
    quantity: number;
    mrp: number; // Maximum Retail Price
    purchaseRate: number; // Cost Price
    supplierId?: mongoose.Types.ObjectId;
    rackLocation?: string; // Physical location
}

const BatchSchema = new Schema<IBatch>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        batchNumber: { type: String, required: true },
        expiryDate: { type: Date, required: true, index: true }, // Index for expiry queries
        quantity: { type: Number, required: true, min: 0 },
        mrp: { type: Number, required: true },
        purchaseRate: { type: Number, required: true },
        supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
        rackLocation: String,
    },
    { timestamps: true }
);

// Compound index to prevent duplicate batch numbers for the same product in a tenant
BatchSchema.index({ tenantId: 1, productId: 1, batchNumber: 1 }, { unique: true });

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export const Batch = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);
