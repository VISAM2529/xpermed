
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTenant } from './TenantProvider';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { tenant } = useTenant();

    useEffect(() => {
        // Connect to Socket Server (Use Env Var for Prod)
        const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        const socketInstance = io(URL, {
            transports: ['websocket'], // Force WebSocket for better performance
            autoConnect: false // Wait until we explicitly connect
        });

        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('Socket Connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket Disconnected');
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Join Tenant Room when tenant is available and socket is ready
    useEffect(() => {
        if (socket && tenant?.id) {
            if (!socket.connected) socket.connect();

            socket.emit('join_tenant', tenant.id);
            console.log(`Joining room for Tenant: ${tenant.id} (${tenant.name})`);
        }
    }, [socket, tenant]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
