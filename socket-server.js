
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow Next.js frontend
        methods: ["GET", "POST"]
    }
});

// Store active connections: { tenantId: socketId } or map to rooms
const activeTenants = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a specific room based on Tenant ID (Pharmacy or Distributor)
    socket.on('join_tenant', (tenantId) => {
        if (!tenantId) return;
        socket.join(tenantId);
        console.log(`Socket ${socket.id} joined tenant room: ${tenantId}`);
    });

    // Handle B2B Chat Messages
    socket.on('send_message', (data) => {
        // data: { orderId, senderId, recipientId, message, timestamp }
        const { recipientId, message, orderId } = data;

        // Emit to recipient's room
        io.to(recipientId).emit('receive_message', data);

        // Also emit back to sender (optimistic UI usually handles this, but good for confirmation)
        // io.to(senderId).emit('message_sent', data);
    });

    // Handle Order Notifications
    socket.on('send_notification', (data) => {
        // data: { type, recipientId, message, referenceId }
        const { recipientId } = data;
        io.to(recipientId).emit('receive_notification', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3001; // Run on different port than Next.js
server.listen(PORT, () => {
    console.log(`Socket Server running on port ${PORT}`);
});
