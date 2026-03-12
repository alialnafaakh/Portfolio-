"use client";

import { useEffect, useState, useRef } from 'react';
import { initCursor } from '../cursor';

export default function Home() {
  const [content, setContent] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const typewriterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // 1. Initialize cursor
    initCursor();

    // 2. Fetch data
    Promise.all([
      fetch('/api/get-projects').then(res => res.json()),
      fetch('/api/get-content').then(res => res.json())
    ]).then(([projectsData, contentData]) => {
      setProjects(projectsData);
      setContent(contentData);
    });

    // 3. Typewriter effect
    let words = ["know", "a Creative Developer", "a Problem Solver"];
    let i = 0;
    let timer: NodeJS.Timeout;
    let isDeleting = false;

    function typeWriter() {
      const element = typewriterRef.current;
      if (!element) {
        timer = setTimeout(typeWriter, 500);
        return;
      }

      const currentWord = words[i % words.length];
      const text = element.innerText;

      if (isDeleting) {
        element.innerText = currentWord.substring(0, text.length - 1);
      } else {
        element.innerText = currentWord.substring(0, text.length + 1);
      }

      let typeSpeed = isDeleting ? 100 : 200;

      if (!isDeleting && element.innerText === currentWord) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && element.innerText === '') {
        isDeleting = false;
        i++;
        typeSpeed = 500;
      }

      timer = setTimeout(typeWriter, typeSpeed);
    }
    
    typeWriter();

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // 4. Tilt Effect Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--card-mouse-x', `${x}px`);
    card.style.setProperty('--card-mouse-y', `${y}px`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
  };

  const TiltCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div 
      className={`glass-card ${className}`} 
      data-tilt 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );

  const TiltLink = ({ children, className = "", href }: { children: React.ReactNode, className?: string, href: string }) => (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`glass-card ${className}`} 
      data-tilt 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </a>
  );

  async function handleContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSending(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message')
        })
      });
      if (res.ok) {
        alert('Message sent successfully!');
        (e.target as HTMLFormElement).reset();
      } else {
        alert('Failed to send message.');
      }
    } catch {
      alert('Error sending message.');
    } finally {
      setIsSending(false);
    }
  }

  if (!content) return null; // Or a loading spinner

  return (
    <>
      <header>
        <nav className="glass-nav">
          <div className="logo">Ali Al-nafaakh<span className="dot">.</span></div>
          <ul className="nav-links">
            <li><a href="#about" className="hover-trigger">About</a></li>
            <li><a href="#skills" className="hover-trigger">Skills</a></li>
            <li><a href="#projects" className="hover-trigger">Work</a></li>
            <li><a href="#contact" className="hover-trigger">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="hero">
          <div className="hero-content" data-tilt onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {content.about?.image_url && (
              <img src={content.about.image_url} alt="Profile" className="profile-img" />
            )}
            <h1>Welcome to <span className="gradient-text">My Portfolio</span></h1>
            <p className="subtitle">
              <span>Get to </span>
              <span ref={typewriterRef}></span>
            </p>
            <div className="cta-buttons">
              <a href="#about" className="btn primary hover-trigger">Get to Know Me</a>
              <a href="#projects" className="btn secondary hover-trigger">View My Work</a>
            </div>
            <div className="social-links">
              {content.about?.github_url && (
                <a href={content.about.github_url} target="_blank" rel="noopener noreferrer" className="social-btn hover-trigger" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </a>
              )}
              {content.about?.linkedin_url && (
                <a href={content.about.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-btn hover-trigger" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </section>

        <section id="about">
          <div className="container">
            <h2 className="section-title">{content.about?.title || 'About Me'}</h2>
            <TiltCard>
              <p>{content.about?.description}</p>
            </TiltCard>
          </div>
        </section>

        <section id="market-value">
          <div className="container">
            <h2 className="section-title">{content.marketValue?.title || 'My Market Value'}</h2>
            <div className="grid">
              {content.marketValue?.items?.map((item: any, i: number) => (
                <TiltCard key={i} className="value-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        <section id="skills">
          <div className="container">
            <h2 className="section-title">{content.skills?.title || 'Technical Skills'}</h2>
            <div className="skills-grid">
              {content.skills?.categories?.map((cat: any, i: number) => (
                <TiltCard key={i} className="skill-category">
                  <h3>{cat.title}</h3>
                  <div className="tags big-tags">
                    {cat.items.map((skill: string, j: number) => (
                      <span key={j}>{skill}</span>
                    ))}
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        <section id="projects">
          <div className="container">
            <h2 className="section-title">Selected Projects</h2>
            <div className="grid">
              {projects.map((project: any) => (
                <TiltCard key={project.id} className="project-card">
                  <div className="project-info">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="tags">
                      {project.tags?.map((tag: string, i: number) => (
                        <span key={i}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        <section id="certificates">
          <div className="container">
            <h2 className="section-title">{content.certificates?.title || 'Certifications'}</h2>
            <div className="grid">
              {content.certificates?.items?.map((cert: any, i: number) => {
                const inner = (
                  <>
                    <h3>{cert.title}</h3>
                    <p className="cert-issuer">{cert.issuer}</p>
                    <p className="cert-date">{cert.date}</p>
                    {cert.link && <span className="cert-link-hint">View Certificate ↗</span>}
                  </>
                );
                return cert.link ? (
                  <TiltLink key={i} href={cert.link} className="cert-card cert-link">
                    {inner}
                  </TiltLink>
                ) : (
                  <TiltCard key={i} className="cert-card">
                    {inner}
                  </TiltCard>
                );
              })}
            </div>
          </div>
        </section>

        <section id="hobbies">
          <div className="container">
            <h2 className="section-title">{content.hobbies?.title || 'Hobbies & Interests'}</h2>
            <div className="grid">
              {content.hobbies?.items?.map((hobby: any, i: number) => (
                <TiltCard key={i} className="hobby-card">
                  {hobby.emoji && <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{hobby.emoji}</div>}
                  <h3>{hobby.title}</h3>
                  <p>{hobby.description}</p>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        <section id="contact">
          <div className="container">
            <h2 className="section-title">{content.contact?.title || "Let's Connect"}</h2>
            <TiltCard className="contact-form">
              <form onSubmit={handleContact}>
                <div className="form-group">
                  <input type="text" name="name" placeholder="Name" required className="hover-trigger" />
                </div>
                <div className="form-group">
                  <input type="email" name="email" placeholder="Email" required className="hover-trigger" />
                </div>
                <div className="form-group">
                  <textarea name="message" rows={5} placeholder="Message" required className="hover-trigger"></textarea>
                </div>
                <button type="submit" className="btn primary hover-trigger" disabled={isSending}>
                  {isSending ? 'Sending...' : (content.contact?.formButton || 'Send Message')}
                </button>
              </form>
            </TiltCard>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} Ali. All rights reserved.</p>
      </footer>
    </>
  );
}
