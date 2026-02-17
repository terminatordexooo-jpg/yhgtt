/* ============================================
   TRAFFIC PRO — Script
   ============================================ */

// ---------- Particles Background ----------
(function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.size = Math.random() * 1.5 + 0.5;
            this.opacity = Math.random() * 0.3 + 0.05;
            const colors = ['0, 240, 255', '123, 97, 255', '255, 77, 166'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) {
                this.reset();
                this.x = Math.random() > 0.5 ? 0 : w;
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    const COUNT = Math.min(80, Math.floor(w * h / 15000));
    for (let i = 0; i < COUNT; i++) {
        particles.push(new Particle());
    }

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    const opacity = (1 - dist / 140) * 0.07;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawLines();
        requestAnimationFrame(animate);
    }
    animate();
})();

// ---------- Navbar Scroll ----------
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
                ticking = false;
            });
            ticking = true;
        }
    });
})();

// ---------- Scroll Animations ----------
(function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    elements.forEach(el => observer.observe(el));
})();

// ---------- Counter Animation ----------
(function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const duration = 1800;
                const start = performance.now();
                function update(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(target * eased);
                    if (progress < 1) requestAnimationFrame(update);
                    else el.textContent = target;
                }
                requestAnimationFrame(update);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
})();

// ---------- Lead Form ----------
(function initForm() {
    const form = document.getElementById('telegram-form');
    const input = document.getElementById('telegram-input');
    const inputWrapper = document.getElementById('input-wrapper');
    const submitBtn = document.getElementById('submit-btn');
    const formError = document.getElementById('form-error');
    const leadSuccess = document.getElementById('lead-success');

    if (!form) return;

    // Strip @ if user types it
    input.addEventListener('input', () => {
        let val = input.value;
        if (val.startsWith('@')) {
            input.value = val.substring(1);
        }
        // Remove invalid chars
        input.value = input.value.replace(/[^a-zA-Z0-9_]/g, '');
        inputWrapper.classList.remove('error');
        formError.textContent = '';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = input.value.trim();

        // Validate
        if (!username || username.length < 3) {
            inputWrapper.classList.add('error');
            formError.textContent = 'Введи корректный username (минимум 3 символа)';
            input.focus();
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            inputWrapper.classList.add('error');
            formError.textContent = 'Только латинские буквы, цифры и _';
            input.focus();
            return;
        }

        // Show loading
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        formError.textContent = '';

        // Save to localStorage
        try {
            const leads = JSON.parse(localStorage.getItem('trafficpro_leads') || '[]');
            leads.push({
                username: '@' + username,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
            localStorage.setItem('trafficpro_leads', JSON.stringify(leads));
        } catch (e) {
            console.error('Error saving lead:', e);
        }

        // Simulate network request
        await new Promise(r => setTimeout(r, 1200));

        // Success state
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('success-state');
        inputWrapper.classList.add('success');

        await new Promise(r => setTimeout(r, 600));

        // Hide form, show success
        form.style.display = 'none';
        leadSuccess.classList.add('visible');

        console.log(`✅ New lead: @${username}`);
    });
})();

// ---------- Smooth scroll for anchor links ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
