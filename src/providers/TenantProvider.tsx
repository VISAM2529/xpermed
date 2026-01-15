"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    status: string;
    type: 'PHARMACY' | 'DISTRIBUTOR';
}

interface User {
    name: string;
    email: string;
    role: string;
}

interface TenantContextType {
    tenant: Tenant | null;
    user: User | null;
    setSession: (tenant: Tenant, user: User) => void;
    clearSession: () => void;
    logout: () => void;
    isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load from localStorage on mount
        const storedTenant = localStorage.getItem('tenant_data');
        const storedUser = localStorage.getItem('user_data');

        if (storedTenant && storedUser) {
            const parsedTenant = JSON.parse(storedTenant);
            setTenant(parsedTenant);
            setUser(JSON.parse(storedUser));

            // Ensure cookie is synced with the correct ID (ObjectId)
            if (parsedTenant.id) {
                document.cookie = `x-tenant-id=${parsedTenant.id}; path=/; max-age=86400; SameSite=Strict`;
            }
        }
        setIsLoading(false);
    }, []);

    const setSession = (newTenant: Tenant, newUser: User) => {
        setTenant(newTenant);
        setUser(newUser);
        localStorage.setItem('tenant_data', JSON.stringify(newTenant));
        localStorage.setItem('user_data', JSON.stringify(newUser));
        // Also set cookie for middleware via document.cookie for immediate availability
        document.cookie = `x-tenant-id=${newTenant.id}; path=/; max-age=86400; SameSite=Strict`;
    };

    const clearSession = () => {
        setTenant(null);
        setUser(null);
        localStorage.removeItem('tenant_data');
        localStorage.removeItem('user_data');
        document.cookie = `x-tenant-id=; path=/; max-age=0`;
    };

    return (
        <TenantContext.Provider value={{ tenant, user, setSession, clearSession, logout: clearSession, isLoading }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
