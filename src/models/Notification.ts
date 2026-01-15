
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    recipientId: mongoose.Types.ObjectId; // Tenant ID or User ID (usually Tenant for B2B)
    type: 'ORDER_REQ' | 'ORDER_UPDATE' | 'CHAT_MSG' | 'CONNECTION_REQ';
    title: string;
    message: string;
    referenceId?: mongoose.Types.ObjectId; // OrderId or LinkId
    referenceLink?: string; // URL to redirect
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        recipientId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        type: {
            type: String,
            enum: ['ORDER_REQ', 'ORDER_UPDATE', 'CHAT_MSG', 'CONNECTION_REQ'],
            required: true
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        referenceId: { type: Schema.Types.ObjectId },
        referenceLink: String,
        isRead: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
