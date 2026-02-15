import './style.css'

// --- Custom Cursor ---
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

window.addEventListener('mousemove', (e) => {
  const posX = e.clientX;
  const posY = e.clientY;

  // Dot follows instantly
  if (cursorDot) {
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
  }

  // Outline follows with slight delay (handled by CSS transition or simple requestAnimationFrame if needed)
  if (cursorOutline) {
    cursorOutline.animate({
      left: `${posX}px`,
      top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
  }

  // Update spotlight background
  document.body.style.setProperty('--mouse-x', `${posX}px`);
  document.body.style.setProperty('--mouse-y', `${posY}px`);
});

// Hover States
const hoverTriggers = document.querySelectorAll('.hover-trigger, a, button, .project-card');
hoverTriggers.forEach(trigger => {
  trigger.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  trigger.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

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
const words = ["know", "a Creative Developer", "a Problem Solver"];
let i = 0;
// let timer: number;

function typeWriter() {
  const element = document.getElementById('typewriter');
  if (!element) return;

  const currentWord = words[i % words.length];
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

document.addEventListener('DOMContentLoaded', () => {
  typeWriter();
});
