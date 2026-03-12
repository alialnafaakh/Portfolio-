"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, isAuthenticated } from '@/lib/auth';
import { initCursor } from '@/cursor';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        initCursor();
        if (isAuthenticated()) {
            router.replace('/admin');
        }

        const handleMouseMove = (e: MouseEvent) => {
            const spotlight = document.getElementById('spotlight-bg');
            if (spotlight) {
                const x = e.clientX;
                const y = e.clientY;
                spotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.05), transparent 40%)`;
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, [router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(username, password)) {
            router.push('/admin');
        } else {
            setError(true);
            setPassword('');
            setTimeout(() => setError(false), 3000);
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
            margin: 0, backgroundColor: '#0a0a0a', overflow: 'hidden'
        }}>
            <div id="spotlight-bg" style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0) 70%)',
                pointerEvents: 'none', zIndex: 1
            }}></div>

            <div className="login-container" style={{ width: '100%', maxWidth: '400px', padding: '2rem', zIndex: 10 }}>
                <div className="login-card" style={{
                    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '2.5rem',
                    textAlign: 'center', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
                }}>
                    <h1 className="login-title" style={{
                        fontSize: '2rem', marginBottom: '0.5rem',
                        background: 'linear-gradient(to right, #fff, #aaa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>Admin Access</h1>
                    <p className="login-subtitle" style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        Please enter your password to continue
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                                autoFocus
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white',
                                    fontFamily: 'inherit', boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white',
                                    fontFamily: 'inherit', boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <button type="submit" className="btn-login" style={{
                            width: '100%', padding: '1rem', background: 'white', color: 'black', border: 'none',
                            borderRadius: '8px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer'
                        }}>Sign In</button>
                        <div className={`error-message ${error ? 'visible' : ''}`} style={{
                            color: '#ff5050', marginTop: '1rem', fontSize: '0.9rem', minHeight: '1.2em',
                            opacity: error ? 1 : 0, transition: 'opacity 0.3s ease'
                        }}>
                            Invalid username or password
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
