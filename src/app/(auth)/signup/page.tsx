"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [direction, setDirection] = useState(0); // For slide animation direction

    const [formData, setFormData] = useState({
        tenantName: '',
        subdomain: '',
        gstNumber: '',
        licenseNumber: '',
        email: '',
        password: '',
        phone: '',
        address: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateStep1 = () => {
        if (!formData.tenantName || !formData.subdomain) {
            setError('Please fill in required fields.');
            return false;
        }
        setError('');
        return true;
    };

    const nextStep = () => {
        if (step === 1 && validateStep1()) {
            setDirection(1);
            setStep(2);
        }
    };

    const prevStep = () => {
        setDirection(-1);
        setStep(1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Success
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Animation Variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white text-slate-900 font-sans selection:bg-emerald-100">

            {/* Left: Registration Form */}
            <div className="flex flex-col justify-center px-6 md:px-16 py-12 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-white to-white z-0 pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white transition-transform group-hover:rotate-12 shadow-lg shadow-emerald-200">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">XperMed</span>
                        </Link>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                            <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                        </div>
                        <p className="text-sm font-bold text-emerald-600">Step {step} of 2: {step === 1 ? 'Business Info' : 'Owner Details'}</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="relative min-h-[400px]">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 text-red-600 p-4 mb-4 rounded-xl text-sm border border-red-100"
                            >
                                {error}
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait" custom={direction}>
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">Tell us about your pharmacy</h1>
                                    <p className="text-slate-500 mb-8">We'll set up your customized dashboard.</p>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Pharmacy Name</label>
                                            <input
                                                name="tenantName"
                                                required
                                                value={formData.tenantName}
                                                onChange={handleChange}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                                placeholder="e.g. Apollo Pharmacy"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Desired Subdomain</label>
                                            <div className="flex">
                                                <input
                                                    name="subdomain"
                                                    required
                                                    value={formData.subdomain}
                                                    onChange={handleChange}
                                                    className="w-full h-12 px-4 rounded-l-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                                                    placeholder="apollo"
                                                />
                                                <span className="h-12 px-4 flex items-center bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl text-slate-500 text-sm font-medium">.xpermed.com</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">GST No. <span className="text-slate-400 font-normal">(Optional)</span></label>
                                                <input
                                                    name="gstNumber"
                                                    value={formData.gstNumber}
                                                    onChange={handleChange}
                                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                                    placeholder="27ABC..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">License No. <span className="text-slate-400 font-normal">(Optional)</span></label>
                                                <input
                                                    name="licenseNumber"
                                                    value={formData.licenseNumber}
                                                    onChange={handleChange}
                                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                                    placeholder="MH-TZ..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            Next Step
                                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">Secure your account</h1>
                                    <p className="text-slate-500 mb-8">Create login credentials for the Owner.</p>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                                placeholder="owner@pharmacy.com"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                                placeholder="Min 8 characters"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                                placeholder="+91"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="h-12 px-6 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 h-12 rounded-xl bg-emerald-500 text-white font-bold text-lg shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? <span className="animate-pulse">Creating...</span> : 'Complete Registration'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500">
                                Already have an account? <Link href="/login" className="text-emerald-600 font-bold hover:underline">Sign In</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right: Visionary Art (Sticky) */}
            <div className="hidden lg:block relative overflow-hidden bg-slate-50 sticky top-0 h-screen">
                <div className="absolute inset-0 bg-emerald-900">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-teal-500 rounded-full blur-[150px] opacity-40"
                    />
                    <motion.div
                        initial={{ scale: 1.2 }}
                        animate={{ scale: [1.2, 0.8, 1.2] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-emerald-600 rounded-full blur-[150px] opacity-40"
                    />
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between p-20 text-white">
                    <div className="flex justify-end gap-2">
                        <motion.div
                            animate={{ width: step === 1 ? 24 : 12, opacity: step === 1 ? 1 : 0.5 }}
                            className="h-3 rounded-full bg-white transition-all"
                        />
                        <motion.div
                            animate={{ width: step === 2 ? 24 : 12, opacity: step === 2 ? 1 : 0.5 }}
                            className="h-3 rounded-full bg-white transition-all"
                        />
                    </div>

                    <div className="max-w-md ml-auto text-right">
                        <div className="text-6xl font-serif italic mb-6 opacity-30">"</div>
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="q1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <h2 className="text-3xl font-bold leading-tight mb-6">
                                        We switched 14 franchise stores to XperMed. The migration tool is magic.
                                    </h2>
                                    <div className="flex items-center justify-end gap-4">
                                        <div className="text-right">
                                            <div className="font-bold">Dr. Anjali Gupta</div>
                                            <div className="text-emerald-200 text-sm">Director, Apollo Franchisee</div>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg">AG</div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="q2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <h2 className="text-3xl font-bold leading-tight mb-6">
                                        The analytics dashboard helped me cut my expiry losses by 80% in 2 months.
                                    </h2>
                                    <div className="flex items-center justify-end gap-4">
                                        <div className="text-right">
                                            <div className="font-bold">Vikram Singh</div>
                                            <div className="text-emerald-200 text-sm">Owner, Wellness Chemist</div>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg">VS</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
