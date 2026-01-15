
import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderChat extends Document {
    orderId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    senderName: string;
    message: string;
    isSystemMessage: boolean;
    timestamp: Date;
}

const OrderChatSchema = new Schema<IOrderChat>(
    {
        orderId: { type: Schema.Types.ObjectId, ref: 'DistributorOrder', required: true, index: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional for system messages
        senderName: { type: String, required: true },
        message: { type: String, required: true },
        isSystemMessage: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now }
    },
    {
        timestamps: true
    }
);

export const OrderChat = mongoose.models.OrderChat || mongoose.model<IOrderChat>('OrderChat', OrderChatSchema);
