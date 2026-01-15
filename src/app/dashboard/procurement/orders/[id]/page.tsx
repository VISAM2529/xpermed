
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, MessageSquare, Clock, MapPin, Phone, Mail, Package, Store } from 'lucide-react';
import ChatWindow from '@/components/b2b/ChatWindow';
import { useSocket } from '@/providers/SocketProvider';

export default function PharmacyOrderDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { socket } = useSocket();

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    useEffect(() => {
        if (socket && order) {
            const handleMessage = (data: any) => {
                if (data.orderId === order._id && !showChat) {
                    setUnreadCount(prev => prev + 1);
                }
            };
            socket.on('receive_message', handleMessage);
            return () => {
                socket.off('receive_message', handleMessage);
            };
        }
    }, [socket, order, showChat]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/pharmacy/orders/${id}`);
            const data = await res.json();
            if (data.order) setOrder(data.order);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleChat = () => {
        if (!showChat) setUnreadCount(0);
        setShowChat(!showChat);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Loading Order Details...</div>;
    if (!order) return <div className="p-10 text-center text-red-500">Order not found</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto print:p-0 print:max-w-none">
            <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors print:hidden">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Orders
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Order Info & Items */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Header Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                    ${order.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                                        order.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Placed on {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex gap-2 print:hidden">
                            <button
                                onClick={handlePrint}
                                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                                title="Print Invoice"
                            >
                                <Printer className="w-5 h-5" />
                            </button>
                            <button
                                onClick={toggleChat}
                                className={`p-2 border border-slate-200 rounded-lg hover:bg-slate-50 relative ${showChat ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-600'}`}
                                title="Chat with Distributor"
                            >
                                <MessageSquare className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-slate-400" /> Order Items ({order.items.length})
                        </h3>
                        <div className="space-y-4">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 print:bg-white print:border-b print:rounded-none">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{item.name}</h4>
                                        <p className="text-xs text-slate-500">Unit Price: ₹{item.unitPrice}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-900">₹{item.totalPrice.toLocaleString()}</div>
                                        <div className="text-xs text-slate-500">Qty: {item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Total Amount</span>
                            <span className="text-3xl font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Distributor Details */}
                <div className="space-y-6">

                    {/* Distributor Details */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Store className="w-5 h-5 text-slate-400" /> Distributor Info
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 font-bold uppercase">Organization</label>
                                <p className="font-medium text-slate-800">{order.distributorId?.name}</p>
                            </div>
                            <div className="flex gap-3">
                                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                                <span className="text-sm text-slate-600">{order.distributorId?.address}, {order.distributorId?.city}</span>
                            </div>
                            <div className="flex gap-3">
                                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                                <span className="text-sm text-slate-600">{order.distributorId?.phone}</span>
                            </div>
                            <div className="flex gap-3">
                                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                                <span className="text-sm text-slate-600">{order.distributorId?.contactEmail}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery OTP - Only Show if Active */}
                    {order.deliveryOtp && ['ACCEPTED', 'PACKED', 'SHIPPED'].includes(order.status) && (
                        <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg border border-indigo-500 text-center">
                            <div className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">Delivery OTP</div>
                            <div className="text-4xl font-mono font-bold tracking-widest">{order.deliveryOtp}</div>
                            <div className="text-indigo-200 text-xs mt-2">Share this code with the delivery agent upon arrival.</div>
                        </div>
                    )}

                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100">
                        <strong>Note:</strong> Status updates will appear here in real-time. Use the chat feature to communicate directly with the distributor regarding this order.
                    </div>

                </div>
            </div>

            {/* Chat Window */}
            {order && (
                <ChatWindow
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                    orderId={order._id}
                    recipientId={order.distributorId?._id}
                    title={`Chat: ${order.distributorId?.name}`}
                />
            )}
        </div>
    );
}
