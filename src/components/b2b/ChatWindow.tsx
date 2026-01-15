
"use client";

import { useEffect, useState, useRef } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import { useSocket } from '@/providers/SocketProvider';
import { useTenant } from '@/providers/TenantProvider';

interface ChatWindowProps {
    orderId: string;
    recipientId: string; // The other party (Distributor or Pharmacy)
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

export default function ChatWindow({ orderId, recipientId, isOpen, onClose, title = "Order Chat" }: ChatWindowProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const { socket } = useSocket();
    const { tenant } = useTenant();
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Fetch History
    useEffect(() => {
        if (isOpen && orderId) {
            fetch(`/api/b2b/chat?orderId=${orderId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.messages) setMessages(data.messages);
                    scrollToBottom();
                });
        }
    }, [isOpen, orderId]);

    // 2. Real-time Listener
    useEffect(() => {
        if (socket && isOpen) {
            socket.on('receive_message', (data: any) => {
                if (data.orderId === orderId) {
                    setMessages(prev => [...prev, data]);
                    scrollToBottom();
                }
            });
            return () => {
                socket.off('receive_message');
            };
        }
    }, [socket, isOpen, orderId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 100);
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const msgData = {
            orderId,
            senderId: tenant?.id, // My Tenant ID
            senderName: tenant?.name || 'User',
            message: newMessage,
            timestamp: new Date().toISOString()
        };

        // UI Optimistic Update
        setMessages(prev => [...prev, msgData]);
        setNewMessage('');
        scrollToBottom();

        // Socket Emit (To connection room or direct)
        if (socket) {
            socket.emit('send_message', {
                ...msgData,
                recipientId // Send to the other tenant
            });
        }

        // Persist DB
        await fetch('/api/b2b/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msgData)
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-bold">{title}</span>
                </div>
                <button onClick={onClose} className="hover:bg-slate-800 p-1 rounded">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === tenant?.id;
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                                }`}>
                                {!isMe && <div className="text-[10px] font-bold opacity-50 mb-1">{msg.senderName}</div>}
                                {msg.message}
                                <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
