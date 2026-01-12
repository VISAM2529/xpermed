import React from 'react';

// --- Card Component ---
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`soft-card p-6 ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
    );
}

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export function Button({ children, disabled, variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
    const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-sm",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500",
        outline: "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-400",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

// --- Input Component ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
            <input
                className={`w-full h-10 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${error
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                    } ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}
