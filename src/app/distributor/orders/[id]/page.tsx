"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Printer, MessageSquare, Clock, MapPin, Phone, Mail, Package } from 'lucide-react';
import { useSocket } from '@/providers/SocketProvider';
import ChatWindow from '@/components/b2b/ChatWindow';

export default function OrderDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [salesmen, setSalesmen] = useState<any[]>([]); // List of salesmen
    const [assigningId, setAssigningId] = useState('');
    const { socket } = useSocket();

    useEffect(() => {
        if (id) {
            fetchOrder();
            fetchSalesmen();
        }
    }, [id]);

    const fetchSalesmen = async () => {
        try {
            const res = await fetch('/api/distributor/salesmen', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.salesmen) setSalesmen(data.salesmen);
        } catch (error) {
            console.error(error);
        }
    };

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
            const res = await fetch(`/api/distributor/orders/${id}`);
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

    const assignSalesman = async (salesmanId: string | null) => {
        // Allow null for un-assignment
        if (salesmanId === undefined) return;

        try {
            const res = await fetch(`/api/distributor/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedTo: salesmanId })
            });
            const data = await res.json();
            if (res.ok) {
                setOrder(data.order);
                alert(salesmanId ? 'Salesman assigned successfully!' : 'Salesman removed!');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const updateStatus = async (status: string) => {
        let otp = '';

        if (status === 'DELIVERED') {
            const input = window.prompt("Enter Delivery OTP provided by Pharmacy:");
            if (!input) return; // Cancel if no OTP entered
            otp = input;
        } else {
            if (!confirm(`Are you sure you want to ${status} this order?`)) return;
        }

        try {
            const res = await fetch(`/api/distributor/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, otp })
            });
            const data = await res.json();

            if (res.ok) {
                setOrder(data.order);
                // Real-time notify
                if (socket) {
                    socket.emit('send_notification', {
                        recipientId: order.pharmacyId._id,
                        title: `Order ${status}`,
                        message: `Your order ${order.orderNumber} has been ${status}.`
                    });
                }
            } else {
                alert(data.error); // Show error if OTP is invalid
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Loading Order Details...</div>;
    if (!order) return <div className="p-10 text-center text-red-500">Order not found</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto print:p-0 print:max-w-none">
            <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors print:hidden">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
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
                                title="Chat with Pharmacy"
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

                {/* Right: Actions & Pharmacy Details */}
                <div className="space-y-6 print:hidden">

                    {/* Actions Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Actions</h3>

                        {order.status === 'PENDING' && (
                            <div className="space-y-3">
                                <button
                                    onClick={() => updateStatus('ACCEPTED')}
                                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" /> Accept Order
                                </button>
                                <button
                                    onClick={() => updateStatus('REJECTED')}
                                    className="w-full bg-white border border-red-200 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-5 h-5" /> Reject Order
                                </button>
                            </div>
                        )}

                        {order.status === 'ACCEPTED' && (
                            <button
                                onClick={() => updateStatus('PACKED')}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Package className="w-5 h-5" /> Mark as Packed
                            </button>
                        )}

                        {order.status === 'PACKED' && (
                            <button
                                onClick={() => updateStatus('SHIPPED')}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Package className="w-5 h-5" /> Mark as Shipped
                            </button>
                        )}

                        {order.status === 'SHIPPED' && (
                            <button
                                onClick={() => updateStatus('DELIVERED')}
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" /> Mark as Delivered
                            </button>
                        )}

                        {order.status === 'DELIVERED' && (
                            <div className="text-center py-4 bg-green-50 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2">
                                <CheckCircle className="w-5 h-5" /> Order Completed
                            </div>
                        )}

                        {order.status === 'REJECTED' && (
                            <div className="text-center py-4 bg-red-50 text-red-700 rounded-xl font-bold">
                                Order Rejected
                            </div>
                        )}

                        {/* Salesman Assignment */}
                        {['ACCEPTED', 'PACKED'].includes(order.status) && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Assign Delivery Agent</label>
                                {order.assignedTo ? (
                                    <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-indigo-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center font-bold">
                                                {order.assignedTo.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{order.assignedTo.name || 'Unknown Agent'}</div>
                                                <div className="text-xs opacity-75">Designated Agent</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => assignSalesman(null)}
                                            className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
                                            value={assigningId}
                                            onChange={(e) => setAssigningId(e.target.value)}
                                        >
                                            <option value="">Select Salesman...</option>
                                            {salesmen.map(s => (
                                                <option key={s._id} value={s._id}>
                                                    {s.name} (ID: {s._id.slice(-4)})
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => assignSalesman(assigningId)}
                                            disabled={!assigningId}
                                            className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                                        >
                                            Assign
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pharmacy Details */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Pharmacy Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 font-bold uppercase">Name</label>
                                <p className="font-medium text-slate-800">{order.pharmacyId?.name}</p>
                            </div>
                            <div className="flex gap-3">
                                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                                <span className="text-sm text-slate-600">{order.pharmacyId?.address}, {order.pharmacyId?.city}</span>
                            </div>
                            <div className="flex gap-3">
                                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                                <span className="text-sm text-slate-600">{order.pharmacyId?.phone}</span>
                            </div>
                            <div className="flex gap-3">
                                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                                <span className="text-sm text-slate-600">{order.pharmacyId?.contactEmail}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Chat Window */}
            {order && (
                <ChatWindow
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                    orderId={order._id}
                    recipientId={order.pharmacyId?._id}
                    title={`Chat: ${order.pharmacyId?.name}`}
                />
            )}
        </div>
    );
}
