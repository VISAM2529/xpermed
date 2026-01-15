import mongoose, { Schema, Document } from 'mongoose';

export interface ITrend extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string; // e.g., "Flu Season", "Dengue Outbreak"
    affectedCategories: string[]; // e.g., ["Antibiotics", "Antipyretics"]
    boostFactor: number; // e.g., 1.5 (50% increase)
    isActive: boolean;
}

const TrendSchema = new Schema<ITrend>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true },
        affectedCategories: [{ type: String }],
        boostFactor: { type: Number, default: 1.2 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Trend = mongoose.models.Trend || mongoose.model<ITrend>('Trend', TrendSchema);
