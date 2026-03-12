"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout } from '@/lib/auth';
import { initCursor } from '@/cursor';

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('projects');
    const [isLoading, setIsLoading] = useState(true);

    // State for data
    const [projects, setProjects] = useState<any[]>([]);
    const [about, setAbout] = useState<any>({});
    const [marketValues, setMarketValues] = useState<any[]>([]);
    const [skills, setSkills] = useState<any[]>([]);
    const [certs, setCerts] = useState<any[]>([]);
    const [hobbies, setHobbies] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        initCursor();
        if (!isAuthenticated()) {
            router.replace('/login');
            return;
        }
        setIsLoading(false);
        loadData(activeTab);
    }, [activeTab, router]);

    const loadData = async (tab: string) => {
        try {
            if (tab === 'projects') {
                const res = await fetch('/api/get-projects');
                setProjects(await res.json());
            } else if (tab === 'about') {
                const res = await fetch('/api/about/get');
                setAbout(await res.json());
            } else if (tab === 'market') {
                const res = await fetch('/api/market-value/list');
                setMarketValues(await res.json());
            } else if (tab === 'skills') {
                const res = await fetch('/api/skills/list');
                setSkills(await res.json());
            } else if (tab === 'certs') {
                const res = await fetch('/api/certifications/list');
                setCerts(await res.json());
            } else if (tab === 'hobbies') {
                const res = await fetch('/api/hobbies/list');
                setHobbies(await res.json());
            } else if (tab === 'inbox') {
                const res = await fetch('/api/get-messages');
                setMessages(await res.json());
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (isLoading) return null;

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', paddingBottom: '3rem' }}>
            <header>
                <nav className="glass-nav">
                    <div className="logo">Admin Dashboard<span className="dot">.</span></div>
                    <ul className="nav-links">
                        <li><a href="/" target="_blank" className="hover-trigger">View Site</a></li>
                        <li><button onClick={logout} className="hover-trigger" style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>Logout</button></li>
                    </ul>
                </nav>
            </header>

            <main className="admin-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
                <div className="admin-header" style={{ marginBottom: '2rem' }}>
                    <h2 id="page-title">Data Tables</h2>
                </div>

                <div className="sub-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    {[
                        { id: 'projects', label: '📁 Projects' },
                        { id: 'about', label: '👤 About Me' },
                        { id: 'market', label: '💼 Market Value' },
                        { id: 'skills', label: '🛠 Skills' },
                        { id: 'certs', label: '🏆 Certifications' },
                        { id: 'hobbies', label: '🎯 Hobbies' },
                        { id: 'inbox', label: '📬 Inbox' }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`sub-tab-btn ${activeTab === tab.id ? 'active' : ''}`} style={{
                            padding: '0.45rem 1.1rem', background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${activeTab === tab.id ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: '20px', color: activeTab === tab.id ? 'white' : 'rgba(255, 255, 255, 0.6)', cursor: 'pointer'
                        }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'projects' && <ProjectsTab data={projects} reload={() => loadData('projects')} />}
                {activeTab === 'about' && <AboutTab data={about} reload={() => loadData('about')} />}
                {activeTab === 'market' && <MarketTab data={marketValues} reload={() => loadData('market')} />}
                {activeTab === 'skills' && <SkillsTab data={skills} reload={() => loadData('skills')} />}
                {activeTab === 'certs' && <CertsTab data={certs} reload={() => loadData('certs')} />}
                {activeTab === 'hobbies' && <HobbiesTab data={hobbies} reload={() => loadData('hobbies')} />}
                {activeTab === 'inbox' && <InboxTab data={messages} reload={() => loadData('inbox')} />}
            </main>
        </div>
    );
}

// ==========================================
// SUBCOMPONENTS for TABS
// ==========================================

function ProjectsTab({ data, reload }: { data: any[], reload: () => void }) {
    const [editing, setEditing] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const tags = (formData.get('tags') as string).split(',').map(s => s.trim()).filter(Boolean);
        await fetch('/api/projects/save', {
            method: 'POST', body: JSON.stringify({
                id: editing?.id || null,
                title: formData.get('title'),
                description: formData.get('description'),
                tags,
                link: formData.get('link') || null,
                image_url: formData.get('image') || null
            })
        });
        setIsOpen(false); setEditing(null); reload();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete?')) return;
        await fetch('/api/projects/delete', { method: 'POST', body: JSON.stringify({ id }) });
        reload();
    };

    return (
        <div>
            {isOpen && (
                <div className="inline-form-panel open" style={{ background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4>{editing ? 'Edit Project' : 'Add Project'}</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group"><label>Title</label><input name="title" defaultValue={editing?.title} required /></div>
                        <div className="form-group"><label>Tags</label><input name="tags" defaultValue={editing?.tags?.join(',')} /></div>
                        <div className="form-group"><label>Description</label><textarea name="description" defaultValue={editing?.description} required rows={3}></textarea></div>
                        <div className="form-group"><label>Link</label><input name="link" defaultValue={editing?.link} /></div>
                        <div className="form-group"><label>Image URL</label><input name="image" defaultValue={editing?.image_url} /></div>
                        <div className="actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn primary">Save</button>
                            <button type="button" className="btn secondary" onClick={() => setIsOpen(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Projects</h3>
                <button className="btn primary" onClick={() => { setEditing(null); setIsOpen(true); }}>+ Add</button>
            </div>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.02)' }}>
                <thead><tr><th style={{ textAlign: 'left', padding: '1rem' }}>Title</th><th style={{ textAlign: 'left', padding: '1rem' }}>Actions</th></tr></thead>
                <tbody>
                    {data.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem' }}>{p.title}</td>
                            <td style={{ padding: '1rem' }}>
                                <button className="btn secondary" style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem' }} onClick={() => { setEditing(p); setIsOpen(true); }}>Edit</button>
                                <button className="btn" style={{ background: 'rgba(255,50,50,0.2)', color: 'white', padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px' }} onClick={() => handleDelete(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AboutTab({ data, reload }: { data: any, reload: () => void }) {
    const handleSave = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await fetch('/api/about/save', {
            method: 'POST', body: JSON.stringify({
                title: formData.get('title'),
                description: formData.get('description'),
                image_url: formData.get('image_url') || null,
                github_url: formData.get('github_url') || null,
                linkedin_url: formData.get('linkedin_url') || null
            })
        });
        alert('Saved!'); reload();
    };

    const handleUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        const res = await fetch(`/api/upload-image?filename=${encodeURIComponent(file.name)}`, { method: 'POST', body: file });
        if (res.ok) {
            const out = await res.json();
            const input = document.getElementById('about-image-url') as HTMLInputElement;
            if (input) input.value = out.path;
            alert('Image uploaded. Remember to click save.');
        }
    };

    return (
        <div className="glass-card" style={{ padding: '2rem' }}>
            <h3>About Me</h3>
            <form onSubmit={handleSave}>
                <div className="form-group"><label>Title</label><input name="title" defaultValue={data.title} /></div>
                <div className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}><label>Image URL</label><input id="about-image-url" name="image_url" defaultValue={data.image_url} /></div>
                    <label className="btn secondary" style={{ cursor: 'pointer' }}>Upload<input type="file" style={{ display: 'none' }} onChange={handleUpload} /></label>
                </div>
                <div className="form-group"><label>Description</label><textarea name="description" defaultValue={data.description} rows={5}></textarea></div>
                <div className="form-group"><label>GitHub URL</label><input name="github_url" defaultValue={data.github_url} /></div>
                <div className="form-group"><label>LinkedIn URL</label><input name="linkedin_url" defaultValue={data.linkedin_url} /></div>
                <button type="submit" className="btn primary" style={{ marginTop: '1rem' }}>Save Form</button>
            </form>
        </div>
    );
}

function MarketTab({ data, reload }: { data: any[], reload: () => void }) {
    const [editing, setEditing] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await fetch('/api/market-value/save', {
            method: 'POST', body: JSON.stringify({
                id: editing?.id || null,
                title: formData.get('title'),
                description: formData.get('description')
            })
        });
        setIsOpen(false); setEditing(null); reload();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete?')) return;
        await fetch('/api/market-value/delete', { method: 'POST', body: JSON.stringify({ id }) });
        reload();
    };

    return (
        <div>
            {isOpen && (
                <div className="inline-form-panel open" style={{ background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4>{editing ? 'Edit' : 'Add'}</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group"><label>Title</label><input name="title" defaultValue={editing?.title} required /></div>
                        <div className="form-group"><label>Description</label><textarea name="description" defaultValue={editing?.description} required rows={3}></textarea></div>
                        <div className="actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn primary">Save</button>
                            <button type="button" className="btn secondary" onClick={() => setIsOpen(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Market Value</h3>
                <button className="btn primary" onClick={() => { setEditing(null); setIsOpen(true); }}>+ Add</button>
            </div>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.02)' }}>
                <thead><tr><th style={{ textAlign: 'left', padding: '1rem' }}>Title</th><th style={{ textAlign: 'left', padding: '1rem' }}>Actions</th></tr></thead>
                <tbody>
                    {data.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem' }}>{p.title}</td>
                            <td style={{ padding: '1rem' }}>
                                <button className="btn secondary" style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem' }} onClick={() => { setEditing(p); setIsOpen(true); }}>Edit</button>
                                <button className="btn" style={{ background: 'rgba(255,50,50,0.2)', color: 'white', padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px' }} onClick={() => handleDelete(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SkillsTab({ data, reload }: { data: any[], reload: () => void }) {
    const [editing, setEditing] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await fetch('/api/skills/save', {
            method: 'POST', body: JSON.stringify({
                id: editing?.id || null,
                category: formData.get('category'),
                skill: formData.get('skill')
            })
        });
        setIsOpen(false); setEditing(null); reload();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete?')) return;
        await fetch('/api/skills/delete', { method: 'POST', body: JSON.stringify({ id }) });
        reload();
    };

    return (
        <div>
            {isOpen && (
                <div className="inline-form-panel open" style={{ background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4>{editing ? 'Edit' : 'Add'}</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group"><label>Category</label><input name="category" defaultValue={editing?.category} required /></div>
                        <div className="form-group"><label>Skill</label><input name="skill" defaultValue={editing?.skill} required /></div>
                        <div className="actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn primary">Save</button>
                            <button type="button" className="btn secondary" onClick={() => setIsOpen(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Skills</h3>
                <button className="btn primary" onClick={() => { setEditing(null); setIsOpen(true); }}>+ Add</button>
            </div>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.02)' }}>
                <thead><tr><th style={{ textAlign: 'left', padding: '1rem' }}>Category</th><th style={{ textAlign: 'left', padding: '1rem' }}>Skill</th><th style={{ textAlign: 'left', padding: '1rem' }}>Actions</th></tr></thead>
                <tbody>
                    {data.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem' }}>{p.category}</td>
                            <td style={{ padding: '1rem' }}>{p.skill}</td>
                            <td style={{ padding: '1rem' }}>
                                <button className="btn secondary" style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem' }} onClick={() => { setEditing(p); setIsOpen(true); }}>Edit</button>
                                <button className="btn" style={{ background: 'rgba(255,50,50,0.2)', color: 'white', padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px' }} onClick={() => handleDelete(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function CertsTab({ data, reload }: { data: any[], reload: () => void }) {
    const [editing, setEditing] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await fetch('/api/certifications/save', {
            method: 'POST', body: JSON.stringify({
                id: editing?.id || null,
                title: formData.get('title'),
                issuer: formData.get('issuer'),
                date_year: formData.get('date_year'),
                certificate_link: formData.get('certificate_link') || null
            })
        });
        setIsOpen(false); setEditing(null); reload();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete?')) return;
        await fetch('/api/certifications/delete', { method: 'POST', body: JSON.stringify({ id }) });
        reload();
    };

    return (
        <div>
            {isOpen && (
                <div className="inline-form-panel open" style={{ background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4>{editing ? 'Edit' : 'Add'}</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group"><label>Title</label><input name="title" defaultValue={editing?.title} required /></div>
                        <div className="form-group"><label>Issuer</label><input name="issuer" defaultValue={editing?.issuer} required /></div>
                        <div className="form-group"><label>Year</label><input name="date_year" defaultValue={editing?.date_year} required /></div>
                        <div className="form-group"><label>Link</label><input name="certificate_link" defaultValue={editing?.certificate_link} /></div>
                        <div className="actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn primary">Save</button>
                            <button type="button" className="btn secondary" onClick={() => setIsOpen(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Certifications</h3>
                <button className="btn primary" onClick={() => { setEditing(null); setIsOpen(true); }}>+ Add</button>
            </div>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.02)' }}>
                <thead><tr><th style={{ textAlign: 'left', padding: '1rem' }}>Title</th><th style={{ textAlign: 'left', padding: '1rem' }}>Issuer</th><th style={{ textAlign: 'left', padding: '1rem' }}>Actions</th></tr></thead>
                <tbody>
                    {data.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem' }}>{p.title}</td>
                            <td style={{ padding: '1rem' }}>{p.issuer}</td>
                            <td style={{ padding: '1rem' }}>
                                <button className="btn secondary" style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem' }} onClick={() => { setEditing(p); setIsOpen(true); }}>Edit</button>
                                <button className="btn" style={{ background: 'rgba(255,50,50,0.2)', color: 'white', padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px' }} onClick={() => handleDelete(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function HobbiesTab({ data, reload }: { data: any[], reload: () => void }) {
    const [editing, setEditing] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await fetch('/api/hobbies/save', {
            method: 'POST', body: JSON.stringify({
                id: editing?.id || null,
                title: formData.get('title'),
                description: formData.get('description'),
                emoji: formData.get('emoji') || null
            })
        });
        setIsOpen(false); setEditing(null); reload();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete?')) return;
        await fetch('/api/hobbies/delete', { method: 'POST', body: JSON.stringify({ id }) });
        reload();
    };

    return (
        <div>
            {isOpen && (
                <div className="inline-form-panel open" style={{ background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4>{editing ? 'Edit' : 'Add'}</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group"><label>Title</label><input name="title" defaultValue={editing?.title} required /></div>
                        <div className="form-group"><label>Emoji</label><input name="emoji" defaultValue={editing?.emoji} /></div>
                        <div className="form-group"><label>Description</label><textarea name="description" defaultValue={editing?.description} required rows={3}></textarea></div>
                        <div className="actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn primary">Save</button>
                            <button type="button" className="btn secondary" onClick={() => setIsOpen(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Hobbies</h3>
                <button className="btn primary" onClick={() => { setEditing(null); setIsOpen(true); }}>+ Add</button>
            </div>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.02)' }}>
                <thead><tr><th style={{ textAlign: 'left', padding: '1rem' }}>Emoji</th><th style={{ textAlign: 'left', padding: '1rem' }}>Title</th><th style={{ textAlign: 'left', padding: '1rem' }}>Actions</th></tr></thead>
                <tbody>
                    {data.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem' }}>{p.emoji}</td>
                            <td style={{ padding: '1rem' }}>{p.title}</td>
                            <td style={{ padding: '1rem' }}>
                                <button className="btn secondary" style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem' }} onClick={() => { setEditing(p); setIsOpen(true); }}>Edit</button>
                                <button className="btn" style={{ background: 'rgba(255,50,50,0.2)', color: 'white', padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px' }} onClick={() => handleDelete(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function InboxTab({ data, reload }: { data: any[], reload: () => void }) {
    const handleDelete = async (id: number) => {
        if (!confirm('Delete message?')) return;
        await fetch('/api/delete-message', { method: 'POST', body: JSON.stringify({ id }) });
        reload();
    };

    if (data.length === 0) return <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>No messages yet.</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.map(m => (
                <div key={m.id} style={{ background: 'rgba(255,255,255,0.04)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div>
                            <h4 style={{ margin: 0, color: 'white' }}>{m.name}</h4>
                            <span style={{ fontSize: '0.85em', color: 'rgba(255,255,255,0.6)' }}>{m.email}</span>
                        </div>
                        <span style={{ fontSize: '0.8em', color: 'rgba(255,255,255,0.4)' }}>{m.date}</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.9rem', borderRadius: '8px', marginBottom: '0.9rem', whiteSpace: 'pre-wrap' }}>
                        {m.message}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <a href={`mailto:${m.email}`} className="btn secondary btn-sm" style={{ textDecoration: 'none', padding: '0.3rem 0.6rem' }}>Reply</a>
                        <button className="btn" style={{ background: 'rgba(255,50,50,0.2)', color: 'white', padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px' }} onClick={() => handleDelete(m.id)}>Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
