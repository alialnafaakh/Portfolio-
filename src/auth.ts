export const AUTH_KEY = 'admin_authenticated';

export function login(username: string, password: string): boolean {
    // Simple hardcoded credentials
    if (username === 'admin' && password === 'admin123') {
        localStorage.setItem(AUTH_KEY, 'true');
        return true;
    }
    return false;
}

export function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/login.html';
}

export function checkAuth() {
    const isAuthenticated = localStorage.getItem(AUTH_KEY) === 'true';
    if (!isAuthenticated) {
        window.location.href = '/login.html';
    }
}

export function isAuthenticated(): boolean {
    return localStorage.getItem(AUTH_KEY) === 'true';
}
