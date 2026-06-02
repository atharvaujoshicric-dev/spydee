gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

let resizeTimeout;
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 150);
});
resizeCanvas();

let canvasConfig = {
    particleCount: 60,
    connectionRadius: 150,
    speedModifier: 1.0,
    hue: 160
};

class DataParticle {
    constructor() {
        this.reset();
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx * canvasConfig.speedModifier;
        this.y += this.vy * canvasConfig.speedModifier;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${canvasConfig.hue}, 100%, 70%, 0.8)`;
        ctx.fill();
    }
}

const particles = Array.from({ length: canvasConfig.particleCount }, () => new DataParticle());

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < canvasConfig.connectionRadius) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                const alpha = (1 - distance / canvasConfig.connectionRadius) * 0.18;
                ctx.strokeStyle = `hsla(${canvasConfig.hue}, 100%, 65%, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateCanvas);
}
animateCanvas();

function scrambleText(element, targetText, duration = 1.5) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    let progress = 0;
    const interval = 1000 / 30;
    
    const animation = setInterval(() => {
        progress += interval / (duration * 1000);
        if (progress >= 1) {
            element.innerText = targetText;
            clearInterval(animation);
        } else {
            element.innerText = targetText
                .split('')
                .map((char, index) => {
                    if (char === ' ') return ' ';
                    return index / targetText.length < progress 
                        ? targetText[index] 
                        : chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
        }
    }, interval);
}

document.addEventListener("DOMContentLoaded", () => {
    const subtitle = document.querySelector('.decode-text');
    if(subtitle) scrambleText(subtitle, "INNOVATIVE DIGITAL SOLUTIONS", 2.0);
});

gsap.to(canvasConfig, {
    connectionRadius: 80,
    speedModifier: 3.5,
    hue: 200,
    scrollTrigger: {
        trigger: "#services-stage",
        start: "top bottom",
        end: "top top",
        scrub: true
    }
});

gsap.to(canvasConfig, {
    connectionRadius: 220,
    speedModifier: 0.5,
    hue: 280,
    scrollTrigger: {
        trigger: "#control-stage",
        start: "top bottom",
        end: "top top",
        scrub: true
    }
});

gsap.to(canvasConfig, {
    connectionRadius: 150,
    speedModifier: 1.0,
    hue: 160,
    scrollTrigger: {
        trigger: "#contact-stage",
        start: "top bottom",
        end: "top center",
        scrub: true
    }
});

gsap.from(".terminal-line", {
    opacity: 0,
    x: -20,
    stagger: 0.3,
    duration: 1,
    scrollTrigger: {
        trigger: ".hud-display",
        start: "top 75%",
        toggleActions: "play none none reverse"
    }
});