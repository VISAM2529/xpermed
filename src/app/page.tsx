"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";

// --- Inline SVGs ---
const Icons = {
    Zap: () => <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Chart: () => <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    Shield: () => <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Box: () => <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    User: () => <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Check: () => <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
};

// --- Animations ---
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden font-sans">

            {/* --- Navbar --- */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed w-full z-50 bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/50"
            >
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.7 }}
                            className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </motion.div>
                        <span className="text-2xl font-bold tracking-tight">XperMed</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Workflow', 'Testimonials', 'Pricing'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById(item.toLowerCase());
                                    if (element) {
                                        const offset = 80; // height of sticky navbar
                                        const bodyRect = document.body.getBoundingClientRect().top;
                                        const elementRect = element.getBoundingClientRect().top;
                                        const elementPosition = elementRect - bodyRect;
                                        const offsetPosition = elementPosition - offset;

                                        window.scrollTo({
                                            top: offsetPosition,
                                            behavior: 'smooth'
                                        });
                                    }
                                }}
                                className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                {item}
                            </a>
                        ))}
                        <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2.5 rounded-full bg-white text-slate-950 font-bold hover:bg-emerald-50 transition-all shadow-lg shadow-white/10 hover:shadow-white/20"
                            >
                                Sign In
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* --- Hero Section --- */}
            <section className="relative pt-40 pb-32 flex flex-col items-center text-center px-4 overflow-hidden perspective-[2000px]">
                {/* Ambient Glows */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 rounded-[100%] blur-[120px] pointer-events-none"
                />

                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={staggerContainer}
                    className="relative z-10 max-w-5xl mx-auto space-y-8"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-sm font-medium text-emerald-400">v2.0 is live: AI Stock Predictions</span>
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-500 pb-2"
                    >
                        Pharmacy OS <br /> for the <span className="italic font-serif text-emerald-400">future.</span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
                        Replace your clunky ERP with a beautiful, lightning-fast command center.
                        Save 10+ hours a week on billing, inventory, and compliance.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 40px -5px rgba(16,185,129,0.5)" }}
                                whileTap={{ scale: 0.95 }}
                                className="h-14 px-8 rounded-full bg-emerald-500 text-slate-950 font-bold text-lg shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
                            >
                                Get Started for Free
                            </motion.button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* 3D Dashboard Mockup */}
                <motion.div
                    initial={{ opacity: 0, rotateX: 20, y: 100 }}
                    animate={{ opacity: 1, rotateX: 10, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="mt-24 relative w-full max-w-6xl mx-auto px-4 group"
                >
                    <div className="relative rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 transform transition-all duration-700 ease-out hover:rotate-x-0 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent rounded-xl pointer-events-none"></div>
                        {/* Mock UI Header */}
                        <div className="h-12 border-b border-slate-800 flex items-center px-4 gap-2 bg-slate-950/50 backdrop-blur rounded-t-lg">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>
                        </div>
                        {/* Mock UI Body */}
                        <div className="bg-slate-950/80 overflow-hidden relative">
                            <img
                                src="/dashboard.png"
                                alt="XperMed Dashboard"
                                className="w-full h-auto object-cover opacity-90"
                            />
                            {/* Overlay Gradient for depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40"></div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* --- Bento Grid Features --- */}
            <section id="features" className="py-32 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-20"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Designed for speed.<br />Built for scale.</h2>
                        <p className="text-slate-400 text-xl max-w-2xl">Usually, "powerful" means "complicated". Not here. XperMed is the first ERP that feels like a consumer app.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-fr">
                        {/* --- Lightning POS (Storytelling Animation) --- */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover="hover"
                            transition={{ duration: 0.4 }}
                            viewport={{ once: true }}
                            className="md:col-span-2 xl:col-span-2 xl:row-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-colors flex flex-col min-h-[350px]"
                        >
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>

                            <div className="relative z-10 mb-8">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6"><Icons.Zap /></div>
                                <h3 className="text-2xl font-bold mb-2">Lightning POS</h3>
                                <p className="text-slate-400 text-sm">Process sales in under 3 seconds.</p>
                            </div>

                            {/* POS UI Simulation */}
                            <div className="mt-auto bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl">
                                {/* Header */}
                                <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center px-3 gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                                </div>

                                <div className="p-4 grid grid-cols-3 gap-4 h-48 relative">
                                    {/* Product Grid */}
                                    <div className="col-span-2 grid grid-cols-2 gap-2 content-start">
                                        {[1, 2, 3, 4].map(Box => (
                                            <div key={Box} className="h-10 bg-slate-800/50 rounded-lg flex items-center justify-center text-xs text-slate-500">Item {Box}</div>
                                        ))}
                                        {/* Target Item */}
                                        <motion.div
                                            className="h-10 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-center justify-center text-xs text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                            variants={{ hover: { scale: [1, 0.95, 1], borderColor: ["#10b98180", "#10b981", "#10b98180"] } }}
                                            transition={{ duration: 0.3, delay: 0.5 }}
                                        >
                                            Add Dolo
                                        </motion.div>
                                    </div>

                                    {/* Bill Section */}
                                    <div className="col-span-1 bg-slate-900 rounded-lg p-2 flex flex-col border border-slate-800">
                                        <div className="text-[10px] text-slate-500 border-b border-slate-800 pb-1 mb-2">BILL #001</div>

                                        {/* Dynamic List Item */}
                                        <motion.div
                                            className="flex justify-between text-[10px] text-emerald-400 mb-1"
                                            variants={{ hover: { opacity: [0, 0, 1], x: [-10, 0] } }}
                                            transition={{ duration: 0.4, delay: 0.8 }}
                                        >
                                            <span>Dolo</span><span>30</span>
                                        </motion.div>

                                        <div className="mt-auto pt-2 border-t border-slate-800">
                                            <div className="flex justify-between text-[10px] text-white font-bold">
                                                <span>Total</span>
                                                <motion.span
                                                    variants={{ hover: { opacity: [1, 0.5, 1], display: "inline" } }}
                                                >
                                                    <span className="hidden group-hover:inline">60</span><span className="group-hover:hidden">30</span>
                                                </motion.span>
                                            </div>
                                            {/* Print Button */}
                                            <motion.button
                                                className="w-full mt-2 h-6 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded flex items-center justify-center"
                                                variants={{ hover: { scale: [1, 0.9, 1] } }}
                                                transition={{ duration: 0.2, delay: 1.5 }}
                                            >
                                                PRINT
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Animated Cursor */}
                                    <motion.div
                                        className="absolute w-3 h-3 text-white z-50 drop-shadow-lg pointer-events-none"
                                        variants={{
                                            hover: {
                                                x: ["0%", "85%", "170%"],
                                                y: ["0%", "50%", "150%"],
                                                opacity: [0, 1, 1, 0]
                                            }
                                        }}
                                        transition={{ duration: 2, times: [0, 0.4, 0.8], repeat: Infinity, repeatDelay: 1 }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2.9-3.2-7.4-4.4 4V2z" /></svg>
                                    </motion.div>

                                    {/* Receipt Sliding Out */}
                                    <motion.div
                                        className="absolute top-0 right-4 w-24 bg-white text-slate-950 p-2 text-[8px] font-mono shadow-xl z-50 origin-top"
                                        variants={{ hover: { minHeight: ["0px", "100px"], opacity: [0, 1] } }}
                                        transition={{ duration: 0.8, delay: 1.8 }}
                                    >
                                        <div className="text-center font-bold border-b border-black pb-1 mb-1">RECEIPT</div>
                                        <div className="flex justify-between"><span>Dolo</span><span>30.00</span></div>
                                        <div className="flex justify-between"><span>Tax</span><span>2.50</span></div>
                                        <div className="mt-2 text-center">THANK YOU</div>
                                        <div className="mt-4 border-t border-black pt-1">BARCODE_|||</div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* --- Stock Insights (Storytelling Animation) --- */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover="hover"
                            transition={{ duration: 0.4 }}
                            viewport={{ once: true }}
                            className="md:col-span-1 xl:col-span-1 xl:row-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/50 transition-colors flex flex-col min-h-[350px]"
                        >
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>

                            <div className="relative z-10 mb-8">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6"><Icons.Box /></div>
                                <h3 className="text-2xl font-bold mb-2">Stock Insights</h3>
                                <p className="text-slate-400 text-sm">Auto-categorize short-expiry items.</p>
                            </div>

                            {/* Stock Scanner Animation */}
                            <div className="mt-auto bg-slate-950 border border-slate-800 rounded-xl p-4 relative overflow-hidden h-40 flex flex-col items-center justify-center shadow-lg">
                                {/* Barcode Scanning Beam */}
                                <motion.div
                                    className="absolute top-0 left-0 w-full h-1 bg-rose-500/50 shadow-[0_0_15px_#f43f5e] z-20"
                                    variants={{ hover: { top: ["0%", "100%"], opacity: [1, 0] } }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />

                                {/* Product Box */}
                                <motion.div
                                    className="w-20 h-24 bg-slate-800 rounded border border-slate-700 flex items-center justify-center relative mb-4"
                                    variants={{ hover: { borderColor: ["#334155", "#f43f5e", "#f43f5e"] } }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="text-[10px] text-slate-500 font-mono rotate-90">AUG-625</div>
                                    <motion.div
                                        className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-lg opacity-0"
                                        variants={{ hover: { opacity: 1, scale: [0, 1.2, 1] } }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        EXP!
                                    </motion.div>
                                </motion.div>

                                {/* Auto-Action Alert */}
                                <motion.div
                                    className="w-full bg-rose-500/10 border border-rose-500/20 rounded p-2 flex items-center gap-2"
                                    variants={{ hover: { y: [20, 0], opacity: [0, 1] } }}
                                    transition={{ delay: 1 }}
                                >
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                                    <span className="text-[10px] text-rose-400 font-bold">Moved to Return Bin</span>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* --- Real-time Data (Storytelling Animation) --- */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover="hover"
                            transition={{ duration: 0.4 }}
                            viewport={{ once: true }}
                            className="md:col-span-1 xl:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/50 transition-colors min-h-[350px] flex flex-col"
                        >
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
                            <div className="relative z-10 h-full flex flex-col">
                                <motion.div variants={{ hover: { y: -5 } }} className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6"><Icons.Chart /></motion.div>
                                <h3 className="text-2xl font-bold mb-2">Live Profit</h3>
                                <p className="text-slate-400 text-sm mb-4">Real-time P&L tracking.</p>

                                {/* Live Chart */}
                                <div className="mt-auto relative h-20 w-full">
                                    <svg className="w-full h-full overflow-visible">
                                        <motion.path
                                            d="M0 60 Q 30 50 50 30 T 100 10"
                                            fill="none"
                                            stroke="#a855f7"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            variants={{ hover: { pathLength: [0, 1] } }}
                                            transition={{ duration: 1.5, ease: "easeInOut" }}
                                        />
                                    </svg>
                                    {/* Floating Tooltip */}
                                    <motion.div
                                        className="absolute top-0 right-0 bg-white text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-lg"
                                        variants={{ hover: { opacity: [0, 1], y: [10, 0] } }}
                                        transition={{ delay: 1.2 }}
                                    >
                                        +₹2,450
                                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* --- Doctor CRM (Storytelling Animation) --- */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover="hover"
                            transition={{ duration: 0.4 }}
                            viewport={{ once: true }}
                            className="md:col-span-1 xl:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-pink-500/50 transition-colors min-h-[350px] flex flex-col"
                        >
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-all"></div>
                            <div className="relative z-10 h-full flex flex-col">
                                <motion.div variants={{ hover: { scale: 1.1 } }} className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6"><Icons.User /></motion.div>
                                <h3 className="text-2xl font-bold mb-2">Doctor CRM</h3>
                                <p className="text-slate-400 text-sm mb-0">Track top prescribers.</p>

                                {/* Profile Pop-up */}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <motion.div
                                        className="bg-slate-800 rounded-xl p-3 border border-slate-700 shadow-xl"
                                        variants={{ hover: { y: [50, 0], opacity: [0, 1] } }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xs">Dr</div>
                                            <div>
                                                <div className="text-white text-xs font-bold">Dr. Anjali</div>
                                                <div className="text-[10px] text-emerald-400">Top Prescriber</div>
                                            </div>
                                        </div>
                                        <motion.div
                                            className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-1 rounded"
                                            variants={{ hover: { scale: [0.9, 1], opacity: [0, 1] } }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            Generated ₹50k revenue this month
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- Workflow Section --- */}
            <section id="workflow" className="py-24 bg-slate-900/30 border-y border-slate-800/50">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold mb-4">How XperMed Works</h2>
                    </motion.div>

                    <div className="relative">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2"></div>
                        <div className="grid md:grid-cols-3 gap-12 relative z-10">
                            {[
                                { step: "01", title: "Import Data", desc: "Upload your CSV or scan stock." },
                                { step: "02", title: "Start Selling", desc: "Use the POS to bill customers." },
                                { step: "03", title: "Track Growth", desc: "View daily reports on sales." }
                            ].map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.2 }}
                                    viewport={{ once: true }}
                                    className="bg-slate-950 border border-slate-800 p-8 rounded-2xl relative group hover:-translate-y-2 transition-transform duration-300"
                                >
                                    <div className="absolute -top-6 left-8 bg-slate-900 border border-slate-700 text-emerald-400 font-bold px-4 py-2 rounded-lg shadow-lg">
                                        Step {s.step}
                                    </div>
                                    <h3 className="text-xl font-bold mt-4 mb-3">{s.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Distributor Section --- */}
            <section id="distributors" className="py-24 bg-gradient-to-b from-slate-900/30 to-slate-950 border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6 tracking-wide uppercase">
                                For Distributors
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                Expand your <br />
                                <span className="text-emerald-500">supply chain network.</span>
                            </h2>
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                Connect directly with thousands of pharmacies. Receive orders in real-time, manage fleet delivery, and automate your entire B2B workflow.
                            </p>

                            <ul className="space-y-4 mb-10">
                                {[
                                    "Direct-to-Pharmacy ordering portal",
                                    "Real-time inventory syncing",
                                    "Automated fleet & delivery tracking",
                                    "Instant credit ledger reconciliation"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 rounded-full bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition-colors"
                                >
                                    Become a Distributor Partner
                                </motion.button>
                            </Link>
                        </motion.div>

                        {/* Distributor Graphic/Mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-3xl"></div>
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative z-10 shadow-2xl">
                                {/* Mock B2B Dashboard UI */}
                                <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-mono">Incoming Orders</div>
                                        <div className="text-2xl font-bold text-white">12 Pending</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Icons.Box />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { pharmacy: "Apollo Pharmacy", items: "250 Items", status: "Ready", value: "₹45,000" },
                                        { pharmacy: "Wellness Forever", items: "120 Items", status: "Packing", value: "₹12,400" },
                                        { pharmacy: "City Medicos", items: "50 Items", status: "Dispatched", value: "₹8,200" },
                                    ].map((order, i) => (
                                        <div key={i} className="flex items-center justify-between bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                                    {order.pharmacy[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-200">{order.pharmacy}</div>
                                                    <div className="text-xs text-slate-500">{order.items}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-mono text-emerald-400">{order.value}</div>
                                                <div className="text-[10px] text-emerald-400 uppercase font-bold">{order.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Floating Live Map Element */}
                                <motion.div
                                    className="absolute -right-6 -bottom-6 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs font-bold text-slate-300">Live Delivery Tracking</span>
                                    </div>
                                    <div className="w-32 h-16 bg-slate-900 rounded-lg relative overflow-hidden opacity-50">
                                        {/* Mock Map Lines */}
                                        <svg className="w-full h-full stroke-slate-700" strokeWidth="1">
                                            <path d="M0 10 Q 15 5 30 20 T 60 10" fill="none" />
                                            <path d="M20 60 Q 40 40 60 50" fill="none" />
                                        </svg>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- Testimonials Section (Infinite Marquee) --- */}
            <section id="testimonials" className="py-32 bg-slate-950 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for speed.<br />Loved for simplicity.</h2>
                    <p className="text-slate-400 text-lg">See why 500+ pharmacies trust XperMed daily.</p>
                </div>

                <div className="relative w-full overflow-hidden group">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none"></div>

                    {/* Moving Row */}
                    <div className="flex gap-8">
                        <motion.div
                            className="flex gap-8 whitespace-nowrap"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        >
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex gap-8">
                                    {[
                                        { name: "Rahul Sharma", role: "Owner, Sharma Medicos", text: "The expiry alerts saved me ₹50k in a month. Unreal ROI.", rating: 5, tag: "Saved Money" },
                                        { name: "Dr. Anjali Gupta", role: "Apollo Franchisee", text: "Staff learned it in 10 mins. UI is stunning compared to old software.", rating: 5, tag: "Easy to Use" },
                                        { name: "Vikram Singh", role: "Wellness Chemist", text: "Finally, an ERP that works on my iPad. I check sales from home.", rating: 5, tag: "Mobile Ready" },
                                        { name: "Sneha Patel", role: "City Pharmacy", text: "Support is amazing. They helped me import 10,000 items in minutes.", rating: 5, tag: "Great Support" },
                                        { name: "Arjun Mehta", role: "Lifeline Drugs", text: "The billing speed is insane. Lines move so much faster now.", rating: 5, tag: "Fast Billing" }
                                    ].map((t, idx) => (
                                        <div key={idx} className="w-[350px] md:w-[450px] bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl hover:bg-slate-800/60 hover:border-emerald-500/30 transition-all cursor-default whitespace-normal relative overflow-hidden group/card shadow-xl">
                                            {/* Quote Icon Background */}
                                            <div className="absolute top-4 right-6 text-8xl font-serif text-slate-800/20 leading-none select-none group-hover/card:text-emerald-500/10 transition-colors">"</div>

                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="flex text-yellow-500">
                                                    {[...Array(5)].map((_, s) => <svg key={s} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                                                </div>
                                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{t.tag}</span>
                                            </div>

                                            <p className="text-slate-300 text-lg mb-8 leading-relaxed font-medium relative z-10">{t.text}</p>

                                            <div className="flex items-center gap-4 border-t border-slate-800/50 pt-6">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                                                    {t.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-base">{t.name}</div>
                                                    <div className="text-sm text-slate-500">{t.role}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- Final CTA (Holographic Space Warp) --- */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-950">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-950 to-slate-950"></div>
                    {/* Animated Grid */}
                    <motion.div
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight"
                    >
                        Ready to revolutionize <br />
                        <span className="text-emerald-400">your pharmacy?</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto"
                    >
                        Join the fastest growing network of modern chemists. Import your stock in minutes and start billing today.
                    </motion.p>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        viewport={{ once: true }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-12 py-5 bg-emerald-500 rounded-full text-slate-950 font-bold text-xl overflow-hidden shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)]"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="relative z-10">Start Free Trial</span>
                            </motion.button>
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(30, 41, 59, 1)" }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-5 rounded-full border border-slate-700 text-white font-medium hover:bg-slate-800 transition-colors"
                        >
                            Schedule Demo
                        </motion.button>
                    </motion.div>
                    <p className="mt-8 text-sm text-slate-500">No credit card required • 14-day free trial</p>
                </div>
            </section>

            {/* --- Mega Footer (System Status Theme) --- */}
            <footer className="bg-slate-950 border-t border-slate-900 pt-0 pb-10 relative overflow-hidden">
                {/* Animated ECG Pulse Border */}
                <div className="absolute top-0 left-0 right-0 h-px bg-slate-900 overflow-hidden">
                    <motion.div
                        className="absolute h-[2px] w-20 bg-emerald-500 shadow-[0_0_10px_#10b981]"
                        animate={{ left: ["-10%", "110%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                {/* Massive Watermark */}
                <div className="absolute -bottom-20 -right-20 pointer-events-none opacity-5 select-none overflow-hidden">
                    <span className="text-[15rem] font-bold text-white tracking-tighter whitespace-nowrap">XperMed</span>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-20 relative z-10">
                    <div className="grid md:grid-cols-12 gap-12 mb-20">
                        {/* Brand Column (System Status) */}
                        <div className="md:col-span-4 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-white tracking-tight">XperMed</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider">All Systems Normal</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-slate-400 leading-relaxed text-sm max-w-sm">
                                The operating system for modern healthcare. Connecting 500+ pharmacies to a global intelligence network.
                            </p>

                            {/* Terminal-style Socials */}
                            <div className="flex gap-3">
                                {['TWITTER', 'LINKEDIN', 'GITHUB'].map(social => (
                                    <motion.a
                                        key={social}
                                        href="#"
                                        whileHover={{ y: -2 }}
                                        className="px-3 py-1.5 border border-slate-800 rounded bg-slate-900/50 text-xs font-mono text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
                                    >
                                        {social}
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Grid - Designed like "Modules" */}
                        <div className="md:col-span-2">
                            <h4 className="text-slate-200 font-bold mb-6 flex items-center gap-2">
                                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                Product
                            </h4>
                            <ul className="space-y-3 font-mono text-xs text-slate-500">
                                {['Changlog v2.0', 'API Documentation', 'Status Page', 'Roadmap'].map(item => (
                                    <li key={item}><Link href="#" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500">&gt;</span>{item}</Link></li>
                                ))}
                            </ul>
                        </div>

                        <div className="md:col-span-2">
                            <h4 className="text-slate-200 font-bold mb-6 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                Company
                            </h4>
                            <ul className="space-y-3 font-mono text-xs text-slate-500">
                                {['About XperMed', 'Careers (Hiring!)', 'Brand Assets', 'Legal'].map(item => (
                                    <li key={item}><Link href="#" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">&gt;</span>{item}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter - Terminal Input Style */}
                        <div className="md:col-span-4 bg-slate-900/30 rounded-2xl p-6 border border-slate-800/50">
                            <h4 className="text-white font-bold mb-2">Initialize Update Stream</h4>
                            <p className="text-slate-500 text-xs mb-4 font-mono">Join the developer preview list.</p>
                            <div className="flex gap-0 relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-mono text-sm pointer-events-none">$</span>
                                <input
                                    type="email"
                                    placeholder="enter_email_address..."
                                    className="bg-slate-950 border border-slate-700 rounded-l-lg pl-8 pr-4 py-3 text-sm text-white w-full focus:outline-none focus:border-emerald-500 transition-colors font-mono placeholder:text-slate-700"
                                />
                                <motion.button
                                    whileHover={{ backgroundColor: "#10b981", color: "#020617" }}
                                    className="bg-slate-800 border-y border-r border-slate-700 text-emerald-400 px-6 py-2 rounded-r-lg font-mono text-xs font-bold transition-all uppercase tracking-wide"
                                >
                                    Exec_
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 font-mono text-xs relative z-10">
                        <p>SYSTEM_ID: XPM-2026 // SERVERS: MUMBAI-1</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-emerald-500 transition-colors">PRIVACY_PROTOCOL</a>
                            <a href="#" className="hover:text-emerald-500 transition-colors">TERMS_OF_USE</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
