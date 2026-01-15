"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTenant } from '@/providers/TenantProvider';

export default function LoginPage() {
    const router = useRouter();
    const { setSession } = useTenant();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login Form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Set Session Context
            const tenantObj = {
                id: data.tenant?._id || 'session-id',
                name: data.tenant?.name || 'Pharmacy',
                subdomain: data.tenant?.subdomain || '',
                status: data.tenant?.onboardingStatus || 'approved',
                type: data.tenant?.type || 'PHARMACY'
            };

            const userObj = {
                name: data.user.name,
                email: data.user.email,
                role: data.user.role
            };

            setSession(tenantObj, userObj);
            localStorage.setItem('token', data.token); // Save token for API calls

            // Redirect based on Type
            if (userObj.role === 'salesman') {
                router.push('/salesman/orders');
            } else if (tenantObj.type === 'DISTRIBUTOR') {
                router.push('/distributor');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white text-slate-900 font-sans selection:bg-emerald-100">

            {/* Left: Login Form */}
            <div className="flex flex-col justify-center px-8 md:px-24 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-white to-white z-0 pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-12"
                    >
                        <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white transition-transform group-hover:rotate-12 shadow-lg shadow-emerald-200">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">XperMed</span>
                        </Link>
                        <h1 className="text-4xl font-bold tracking-tight mb-3 text-slate-900">Welcome back</h1>
                        <p className="text-slate-500 text-lg">Enter your details to access your workspace.</p>
                    </motion.div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100"
                            >
                                {error}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="name@pharmacy.com"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-slate-700">Password</label>
                                    <Link href="#" className="text-sm text-emerald-600 hover:text-emerald-500 font-medium">Forgot password?</Link>
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-center text-sm text-slate-500"
                        >
                            Don't have an account? <Link href="/signup" className="text-emerald-600 font-bold hover:underline">Register New Pharmacy</Link>
                        </motion.p>
                    </form>
                </div>
            </div>

            {/* Right: Visionary Art */}
            <div className="hidden lg:block relative overflow-hidden bg-slate-50">
                <div className="absolute inset-0 bg-emerald-900">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    {/* Abstract Gradient Mesh */}
                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-emerald-500 rounded-full blur-[150px] opacity-40 animate-pulse"></div>
                    <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600 rounded-full blur-[150px] opacity-40"></div>
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between p-20 text-white">
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-3 h-3 rounded-full bg-white/20"></div>)}
                    </div>

                    <div className="max-w-md">
                        <div className="text-6xl font-serif italic mb-6 opacity-30">"</div>
                        <h2 className="text-3xl font-bold leading-tight mb-6">
                            XperMed allows us to process 500+ bills a day with zero lag. It's the engine of our growth.
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg">
                                RS
                            </div>
                            <div>
                                <div className="font-bold">Rahul Sharma</div>
                                <div className="text-emerald-200 text-sm">Owner, Sharma Medicos</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
