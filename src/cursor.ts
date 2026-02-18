
export function initCursor() {
    // Create cursor elements if they don't exist
    let cursorDot = document.getElementById('cursor-dot');
    let cursorOutline = document.getElementById('cursor-outline');

    console.log('Initializing cursor. Found elements:', { dot: !!cursorDot, outline: !!cursorOutline });

    if (!cursorDot) {
        console.log('Creating cursor-dot');
        cursorDot = document.createElement('div');
        cursorDot.id = 'cursor-dot';
        document.body.appendChild(cursorDot);
    }

    if (!cursorOutline) {
        console.log('Creating cursor-outline');
        cursorOutline = document.createElement('div');
        cursorOutline.id = 'cursor-outline';
        document.body.appendChild(cursorOutline);
    }

    // Mouse Movement
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows instantly
        if (cursorDot) {
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
        }

        // Outline follows (smoothed by CSS transition)
        if (cursorOutline) {
            cursorOutline.style.left = `${posX}px`;
            cursorOutline.style.top = `${posY}px`;
        }

        // Update spotlight background
        document.body.style.setProperty('--mouse-x', `${posX}px`);
        document.body.style.setProperty('--mouse-y', `${posY}px`);
    });

    // Hover States - Use event delegation for better performance and dynamic elements
    document.body.addEventListener('mouseover', (e) => {
        const target = e.target as HTMLElement;
        if (target.matches('.hover-trigger, a, button, .project-card, input, textarea') || target.closest('.hover-trigger, a, button, .project-card')) {
            document.body.classList.add('hovering');
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        const target = e.target as HTMLElement;
        if (target.matches('.hover-trigger, a, button, .project-card, input, textarea') || target.closest('.hover-trigger, a, button, .project-card')) {
            document.body.classList.remove('hovering');
        }
    });
}
