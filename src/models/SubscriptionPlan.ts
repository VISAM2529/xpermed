import mongoose, { Schema, Document } from 'mongoose';

// --- Plan Schema ---
export interface IPlan extends Document {
    name: string; // Basic, Pro, Enterprise
    price: number;
    currency: string;
    interval: 'monthly' | 'yearly';
    features: {
        maxUsers: number;
        maxProducts: number;
        maxBranches: number;
        hasAnalytics: boolean;
        hasExpiryPrediction: boolean;
    };
    isActive: boolean;
}

const PlanSchema = new Schema<IPlan>(
    {
        name: { type: String, required: true, unique: true },
        price: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        interval: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
        features: {
            maxUsers: { type: Number, default: 1 },
            maxProducts: { type: Number, default: 100 },
            maxBranches: { type: Number, default: 1 },
            hasAnalytics: { type: Boolean, default: false },
            hasExpiryPrediction: { type: Boolean, default: false },
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// --- Subscription Schema ---
export interface ISubscription extends Document {
    tenantId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    startDate: Date;
    endDate: Date; // Next billing date
    paymentMethodId?: string; // Stripe/Razorpay ID
    cancelAtPeriodEnd: boolean;
}

const SubscriptionSchema = new Schema<ISubscription>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
        status: {
            type: String,
            enum: ['active', 'canceled', 'past_due', 'trialing'],
            default: 'active',
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true }, // Logic: if now > endDate, check grace period or suspend
        paymentMethodId: String,
        cancelAtPeriodEnd: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Plan = mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);
export const Subscription = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
