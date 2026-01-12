import { NextRequest } from 'next/server';

/**
 * Extracts the subdomain from the Host header.
 * e.g., tenant.app.com -> tenant
 */
export function getSubdomain(host: string): string | null {
    // Localhost handling
    if (host.includes('localhost')) {
        // localhost:3000 -> null or specific mock
        // If using tenant.localhost:3000 -> tenant
        const parts = host.split('.');
        // localhost -> 1 part
        // tenant.localhost -> 2 parts
        if (parts.length > 1 && !parts[0].startsWith('localhost')) {
            return parts[0];
        }
        return null;
    }

    const parts = host.split('.');
    if (parts.length > 2) {
        return parts[0];
    }
    return null;
}

/**
 * Validates if the tenant exists (simplified for middleware usage).
 * In a real app, this might cache results or check DB.
 */
export async function validateTenant(subdomain: string) {
    // This logic usually sits in Middleware or a Cached Service.
    // For now, we return true to assume the subdomain is valid 
    // or we'd fetch from an API endpoint.
    return true;
}
