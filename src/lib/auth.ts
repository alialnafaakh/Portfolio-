"use client";

export const AUTH_KEY = 'admin_authenticated';

export function login(username: string, password: string): boolean {
    const adminUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (username === adminUser && password === adminPass) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_KEY, 'true');
        }
        return true;
    }
    return false;
}

export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_KEY);
        window.location.href = '/login';
    }
}

export function isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(AUTH_KEY) === 'true';
    }
    return false;
}
