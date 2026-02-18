import './style.css'

import { initCursor } from './cursor';

// --- Custom Cursor ---
initCursor();

// --- Card Spotlight & Tilt Effect ---
const cards = document.querySelectorAll<HTMLElement>('[data-tilt]');

cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spotlight local coordinates
    card.style.setProperty('--card-mouse-x', `${x}px`);
    card.style.setProperty('--card-mouse-y', `${y}px`);

    // Tilt calculation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg tilt
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    // Reset transform
    card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
  });
});

// --- Typewriter Effect ---
let typewriterWords: string[] = ["know", "a Creative Developer", "a Problem Solver"];
let i = 0;
// let timer: number;

function typeWriter() {
  const element = document.getElementById('typewriter');
  if (!element) return;

  const currentWord = typewriterWords[i % typewriterWords.length];
  const isDeleting = element.getAttribute('data-deleting') === 'true';
  const text = element.innerText;

  if (isDeleting) {
    element.innerText = currentWord.substring(0, text.length - 1);
  } else {
    element.innerText = currentWord.substring(0, text.length + 1);
  }

  let typeSpeed = isDeleting ? 100 : 200;

  if (!isDeleting && text === currentWord) {
    typeSpeed = 2000; // Pause at end
    element.setAttribute('data-deleting', 'true');
  } else if (isDeleting && text === '') {
    isDeleting ? i++ : null;
    element.setAttribute('data-deleting', 'false');
    typeSpeed = 500;
  }

  setTimeout(typeWriter, typeSpeed);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  typeWriter();
});

// --- Dynamic Data Loading ---
async function loadData() {
  try {
    const [projectsRes, contentRes] = await Promise.all([
      fetch('/src/data/projects.json'),
      fetch('/src/data/content.json')
    ]);

    const projectsData = await projectsRes.json();
    const contentData = await contentRes.json();

    renderProjects(projectsData);
    renderContent(contentData);

    // Update typewriter words
    if (contentData.hero && contentData.hero.typewriterWords) {
      typewriterWords = contentData.hero.typewriterWords;
    }

  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function renderContent(contentData: any) {
  // Hero
  setText('hero-title', `${contentData.hero.title} <span class="gradient-text">${contentData.hero.highlight}</span>`, true);
  setText('hero-subtitle-prefix', contentData.hero.subtitlePrefix);
  setText('hero-cta-primary', contentData.hero.ctaPrimary);
  setText('hero-cta-secondary', contentData.hero.ctaSecondary);

  // Profile Image
  const profileImg = document.getElementById('hero-profile-img') as HTMLImageElement;
  if (profileImg) {
    if (contentData.hero.profileImage) {
      profileImg.src = contentData.hero.profileImage;
      profileImg.style.display = 'block';
    } else {
      profileImg.style.display = 'none';
    }
  }

  // About
  setText('about-title', contentData.about.title);
  setText('about-description', contentData.about.description);

  // Market Value
  setText('market-value-title', contentData.marketValue.title);
  const marketGrid = document.getElementById('market-value-grid');
  if (marketGrid) {
    marketGrid.innerHTML = contentData.marketValue.items.map((item: any) => `
      <div class="glass-card value-card" data-tilt>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `).join('');
    marketGrid.querySelectorAll<HTMLElement>('[data-tilt]').forEach(initTilt);
  }

  // Skills
  setText('skills-title', contentData.skills.title);
  const skillsGrid = document.getElementById('skills-grid');
  if (skillsGrid) {
    skillsGrid.innerHTML = contentData.skills.categories.map((cat: any) => `
       <div class="glass-card skill-category" data-tilt>
        <h3>${cat.title}</h3>
        <div class="tags big-tags">
          ${cat.items.map((item: string) => `<span>${item}</span>`).join('')}
        </div>
      </div>
    `).join('');
    skillsGrid.querySelectorAll<HTMLElement>('[data-tilt]').forEach(initTilt);
  }

  // Certificates
  setText('certificates-title', contentData.certificates.title);
  const certGrid = document.getElementById('certificates-grid');
  if (certGrid) {
    certGrid.innerHTML = contentData.certificates.items.map((cert: any) => `
      <div class="glass-card cert-card" data-tilt>
        <h3>${cert.title}</h3>
        <p class="cert-issuer">${cert.issuer}</p>
        <p class="cert-date">${cert.date}</p>
      </div>
    `).join('');
    certGrid.querySelectorAll<HTMLElement>('[data-tilt]').forEach(initTilt);
  }

  // Hobbies
  setText('hobbies-title', contentData.hobbies.title);
  const hobbyGrid = document.getElementById('hobbies-grid');
  if (hobbyGrid) {
    hobbyGrid.innerHTML = contentData.hobbies.items.map((hobby: any) => `
      <div class="glass-card hobby-card" data-tilt>
        <h3>${hobby.title}</h3>
        <p>${hobby.description}</p>
      </div>
    `).join('');
    hobbyGrid.querySelectorAll<HTMLElement>('[data-tilt]').forEach(initTilt);
  }

  // Contact
  setText('contact-title', contentData.contact.title);
  setText('contact-btn', contentData.contact.formButton);

  // Social Links
  if (contentData.hero.social) {
    const githubBtn = document.getElementById('github-btn') as HTMLAnchorElement;
    const linkedinBtn = document.getElementById('linkedin-btn') as HTMLAnchorElement;

    if (githubBtn && contentData.hero.social.github) {
      githubBtn.href = contentData.hero.social.github;
    }
    if (linkedinBtn && contentData.hero.social.linkedin) {
      linkedinBtn.href = contentData.hero.social.linkedin;
    }
  }
}

// Contact Form Handler
const contactForm = document.getElementById('contactForm') as HTMLFormElement;
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contact-btn') as HTMLButtonElement;
    const originalText = btn.innerText;

    // Get values
    const inputs = contactForm.querySelectorAll('input, textarea');
    const name = (inputs[0] as HTMLInputElement).value;
    const email = (inputs[1] as HTMLInputElement).value;
    const message = (inputs[2] as HTMLTextAreaElement).value;

    btn.innerText = 'Sending...';
    btn.disabled = true;

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (res.ok) {
        alert('Message sent successfully!');
        contactForm.reset();
      } else {
        alert('Failed to send message.');
      }
    } catch (error) {
      console.error(error);
      alert('Error sending message.');
    } finally {
      btn.innerText = originalText;
      btn.disabled = false;
    }
  });
}

function setText(id: string, text: string, isHTML = false) {
  const el = document.getElementById(id);
  if (el) {
    if (isHTML) el.innerHTML = text;
    else el.innerText = text;
  }
}

function renderProjects(projectsData: any[]) {
  const container = document.getElementById('projects-container');
  if (!container) return;

  container.innerHTML = projectsData.map((project: { id: number; title: string; description: string; tags: string[] }) => `
    <div class="glass-card project-card" data-tilt data-spotlight>
      <div class="project-info">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="tags">
          ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  // Re-initialize tilt effect for new elements
  const newCards = container.querySelectorAll<HTMLElement>('[data-tilt]');
  newCards.forEach(card => initTilt(card));
}

function initTilt(card: HTMLElement) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spotlight local coordinates
    card.style.setProperty('--card-mouse-x', `${x}px`);
    card.style.setProperty('--card-mouse-y', `${y}px`);

    // Tilt calculation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg tilt
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    // Reset transform
    card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
  });
}

