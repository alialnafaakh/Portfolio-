import './style.css';
import { initCursor } from './cursor';
import { checkAuth, logout } from './auth';

// Auth Check
checkAuth();

// Logout Handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

interface Project {
    id: number;
    title: string;
    description: string;
    tags: string[];
}

// Variables to hold data
let projects: Project[] = [];
let content: any = {};

// Fetch initial data
async function loadAdminData() {
    try {
        const [projRes, contRes] = await Promise.all([
            fetch('/src/data/projects.json'),
            fetch('/src/data/content.json')
        ]);

        projects = await projRes.json();
        content = await contRes.json();

        renderList();
    } catch (error) {
        console.error('Error loading admin data:', error);
        alert('Failed to load data. The admin dashboard may not function correctly.');
    }
}

// Load data on init
loadAdminData();

// View Switching
const tabProjects = document.getElementById('tab-projects')!;
const tabContent = document.getElementById('tab-content')!;
const tabInbox = document.getElementById('tab-inbox')!;
const viewProjects = document.getElementById('view-projects')!;
const viewContent = document.getElementById('view-content')!;
const viewInbox = document.getElementById('view-inbox')!;
const addProjectBtn = document.getElementById('add-project-btn')!;
const saveContentBtn = document.getElementById('save-content-btn')!;
const refreshInboxBtn = document.getElementById('refresh-inbox-btn')!;
const pageTitle = document.getElementById('page-title')!;

function switchTab(view: 'projects' | 'content' | 'inbox') {
    // Reset all
    viewProjects.style.display = 'none';
    viewContent.style.display = 'none';
    viewInbox.style.display = 'none';
    addProjectBtn.style.display = 'none';
    saveContentBtn.style.display = 'none';
    refreshInboxBtn.style.display = 'none';

    tabProjects.className = 'btn secondary hover-trigger';
    tabContent.className = 'btn secondary hover-trigger';
    tabInbox.className = 'btn secondary hover-trigger';

    if (view === 'projects') {
        viewProjects.style.display = 'block';
        addProjectBtn.style.display = 'block';
        tabProjects.className = 'btn primary hover-trigger';
        pageTitle.innerText = 'Manage Projects';
    } else if (view === 'content') {
        viewContent.style.display = 'block';
        saveContentBtn.style.display = 'block';
        tabContent.className = 'btn primary hover-trigger';
        pageTitle.innerText = 'Manage Content';
        if (content && Object.keys(content).length > 0) {
            populateContentForm();
        } else {
            setTimeout(() => { if (content) populateContentForm(); }, 500);
        }
    } else if (view === 'inbox') {
        viewInbox.style.display = 'block';
        refreshInboxBtn.style.display = 'block';
        tabInbox.className = 'btn primary hover-trigger';
        pageTitle.innerText = 'Inbox';
        loadMessages();
    }
}

tabProjects.addEventListener('click', () => switchTab('projects'));
tabContent.addEventListener('click', () => switchTab('content'));
tabInbox.addEventListener('click', () => switchTab('inbox'));
refreshInboxBtn.addEventListener('click', () => loadMessages());

// --- Projects Logic ---
const listContainer = document.getElementById('admin-project-list')!;
const editor = document.getElementById('project-editor')!;
const form = document.getElementById('project-form') as HTMLFormElement;
const cancelBtn = document.getElementById('cancel-edit')!;

// Inputs
const idInput = document.getElementById('project-id') as HTMLInputElement;
const titleInput = document.getElementById('project-title') as HTMLInputElement;
const descInput = document.getElementById('project-desc') as HTMLTextAreaElement;
const tagsInput = document.getElementById('project-tags') as HTMLInputElement;
const editorTitle = document.getElementById('editor-title')!;

function renderList() {
    listContainer.innerHTML = projects.map(p => `
    <div class="glass-card admin-card">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
            <h3>${p.title}</h3>
            <p style="color: rgba(255,255,255,0.7); font-size: 0.9em;">${p.description}</p>
            <div class="tags" style="margin-top: 0.5rem;">
                ${p.tags.map(t => `<span>${t}</span>`).join('')}
            </div>
        </div>
        <div class="actions">
            <button class="btn secondary hover-trigger" onclick="window.editProject(${p.id})">Edit</button>
            <button class="btn btn-danger hover-trigger" onclick="window.deleteProject(${p.id})">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function saveProjects() {
    try {
        const res = await fetch('/api/save-projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projects, null, 2)
        });
        if (res.ok) {
            alert('Projects saved successfully!\n\nRefresh the main page (http://localhost:5173/) to see your changes.');
        } else {
            alert('Failed to save projects.');
        }
    } catch (e) {
        console.error(e);
        alert('Error saving projects.');
    }
}

// Expose to window for inline onclicks
(window as any).editProject = (id: number) => {
    const p = projects.find(proj => proj.id === id);
    if (!p) return;

    idInput.value = p.id.toString();
    titleInput.value = p.title;
    descInput.value = p.description;
    tagsInput.value = p.tags.join(', ');

    editorTitle.innerText = 'Edit Project';
    editor.style.display = 'block';
    editor.scrollIntoView({ behavior: 'smooth' });
};

(window as any).deleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    projects = projects.filter(p => p.id !== id);
    renderList();
    await saveProjects();
};

addProjectBtn.addEventListener('click', () => {
    form.reset();
    idInput.value = '';
    editorTitle.innerText = 'Add New Project';
    editor.style.display = 'block';
    editor.scrollIntoView({ behavior: 'smooth' });
});

cancelBtn.addEventListener('click', () => {
    editor.style.display = 'none';
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = idInput.value ? parseInt(idInput.value) : Date.now();
    const title = titleInput.value;
    const desc = descInput.value;
    const tags = tagsInput.value.split(',').map(s => s.trim()).filter(Boolean);

    const newProject: Project = { id, title, description: desc, tags };

    if (idInput.value) {
        // Edit
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) projects[index] = newProject;
    } else {
        // Add
        projects.push(newProject);
    }

    editor.style.display = 'none';
    renderList();
    await saveProjects();
});


// --- Content Logic ---

function getInput(id: string) {
    return document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
}

function populateContentForm() {
    getInput('hero-title-input').value = content.hero.title;
    getInput('hero-profile-image-input').value = content.hero.profileImage || '';
    getInput('hero-highlight-input').value = content.hero.highlight;
    getInput('hero-subtitle-prefix-input').value = content.hero.subtitlePrefix;
    getInput('hero-typewriter-input').value = content.hero.typewriterWords.join(', ');

    // Social Links
    if (content.hero.social) {
        getInput('social-github-input').value = content.hero.social.github || '';
        getInput('social-linkedin-input').value = content.hero.social.linkedin || '';
    } else {
        getInput('social-github-input').value = '';
        getInput('social-linkedin-input').value = '';
    }

    getInput('about-title-input').value = content.about.title;
    getInput('about-desc-input').value = content.about.description;

    getInput('market-title-input').value = content.marketValue.title;
    getInput('market-items-input').value = JSON.stringify(content.marketValue.items, null, 2);

    getInput('skills-title-input').value = content.skills.title;
    getInput('skills-items-input').value = JSON.stringify(content.skills.categories, null, 2);

    getInput('certs-title-input').value = content.certificates.title;
    getInput('certs-items-input').value = JSON.stringify(content.certificates.items, null, 2);

    getInput('hobbies-title-input').value = content.hobbies.title;
    getInput('hobbies-items-input').value = JSON.stringify(content.hobbies.items, null, 2);

    getInput('contact-title-input').value = content.contact.title;
    getInput('contact-btn-input').value = content.contact.formButton;
}

// Image Upload Logic
const imageUploadInput = document.getElementById('hero-image-upload') as HTMLInputElement;
const imagePathInput = document.getElementById('hero-profile-image-input') as HTMLInputElement;

if (imageUploadInput && imagePathInput) {
    imageUploadInput.addEventListener('change', async () => {
        const file = imageUploadInput.files?.[0];
        if (!file) return;

        // Show loading state
        const originalText = imagePathInput.placeholder;
        imagePathInput.placeholder = 'Uploading...';

        try {
            const response = await fetch(`/api/upload-image?filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                body: file
            });

            if (response.ok) {
                const data = await response.json();
                imagePathInput.value = data.path;
                alert('Image uploaded successfully!');
            } else {
                alert('Upload failed.');
                console.error(await response.text());
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Error uploaded image.');
        } finally {
            imagePathInput.placeholder = originalText;
        }
    });
}

saveContentBtn.addEventListener('click', async () => {
    try {
        content.hero.title = getInput('hero-title-input').value;
        content.hero.profileImage = getInput('hero-profile-image-input').value;
        content.hero.highlight = getInput('hero-highlight-input').value;
        content.hero.subtitlePrefix = getInput('hero-subtitle-prefix-input').value;
        content.hero.typewriterWords = getInput('hero-typewriter-input').value.split(',').map(s => s.trim()).filter(Boolean);

        // Social Links
        content.hero.social = {
            github: getInput('social-github-input').value,
            linkedin: getInput('social-linkedin-input').value
        };

        content.about.title = getInput('about-title-input').value;
        content.about.description = getInput('about-desc-input').value;

        content.marketValue.title = getInput('market-title-input').value;
        content.marketValue.items = JSON.parse(getInput('market-items-input').value);

        content.skills.title = getInput('skills-title-input').value;
        content.skills.categories = JSON.parse(getInput('skills-items-input').value);

        content.certificates.title = getInput('certs-title-input').value;
        content.certificates.items = JSON.parse(getInput('certs-items-input').value);

        content.hobbies.title = getInput('hobbies-title-input').value;
        content.hobbies.items = JSON.parse(getInput('hobbies-items-input').value);

        content.contact.title = getInput('contact-title-input').value;
        content.contact.formButton = getInput('contact-btn-input').value;

        const res = await fetch('/api/save-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content, null, 2)
        });

        if (res.ok) {
            alert('Content saved successfully!\n\nRefresh the main page (http://localhost:5173/) to see your changes.');
        } else {
            alert('Failed to save content.');
        }
    } catch (e) {
        console.error(e);
        alert('Error saving content. Check JSON syntax for array fields.');
    }
});


// --- Inbox Logic ---
const inboxList = document.getElementById('inbox-list')!;

async function loadMessages() {
    inboxList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5);">Loading messages...</p>';
    try {
        const res = await fetch('/api/get-messages');
        const messages = await res.json();

        if (messages.length === 0) {
            inboxList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5);">No messages found.</p>';
            return;
        }

        // Sort new to old
        messages.sort((a: any, b: any) => b.id - a.id);

        inboxList.innerHTML = messages.map((msg: any) => `
            <div class="glass-card admin-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div>
                        <h4 style="margin: 0; color: white;">${msg.name}</h4>
                        <span style="font-size: 0.85em; color: rgba(255,255,255,0.6);">${msg.email}</span>
                    </div>
                    <span style="font-size: 0.8em; color: rgba(255,255,255,0.4);">${msg.date}</span>
                </div>
                <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <p style="margin: 0; color: rgba(255,255,255,0.9); white-space: pre-wrap;">${msg.message}</p>
                </div>
                <div style="text-align: right;">
                    <a href="mailto:${msg.email}" class="btn secondary hover-trigger" style="font-size: 0.8em; padding: 0.4rem 1rem;">Reply</a>
                    <button class="btn btn-danger hover-trigger" onclick="window.deleteMessage(${msg.id})" style="font-size: 0.8em; padding: 0.4rem 1rem;">Delete</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading messages:', error);
        inboxList.innerHTML = '<p style="text-align: center; color: #ff5050;">Failed to load messages.</p>';
    }
}

(window as any).deleteMessage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
        const res = await fetch('/api/delete-message', {
            method: 'POST',
            body: JSON.stringify({ id })
        });
        if (res.ok) {
            loadMessages();
        } else {
            alert('Failed to delete message.');
        }
    } catch (error) {
        alert('Error deleting message.');
    }
};


// Init
document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    renderList();
});
