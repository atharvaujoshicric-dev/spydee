/* ═══════════════════════════════════════════
   SPYDARR — MAIN.JS
   Loader · Cursor · Three.js · GSAP · All UI
═══════════════════════════════════════════ */

/* ─── 1. GSAP SETUP ──────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ─── 2. GLOBALS ─────────────────────────── */
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX  = mouseX;
let ringY  = mouseY;

/* ─── 3. GRAIN SHIFT ─────────────────────── */
(function shiftGrain() {
  const grain = document.getElementById('grain');
  if (grain) {
    grain.style.backgroundPosition = Math.random() * 200 + 'px ' + Math.random() * 200 + 'px';
  }
  setTimeout(shiftGrain, 80);
})();

/* ─── 4. SCROLL PROGRESS ─────────────────── */
window.addEventListener('scroll', function() {
  var bar = document.getElementById('spbar');
  if (bar) {
    var p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    bar.style.transform = 'scaleX(' + p + ')';
  }
}, { passive: true });

/* ─── 5. CUSTOM CURSOR ───────────────────── */
(function() {
  var cur  = document.getElementById('cur');
  if (!cur) return;
  var dot  = cur.querySelector('.c-dot');
  var ring = cur.querySelector('.c-ring');

  // Hide on touch devices
  if ('ontouchstart' in window) {
    cur.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = 'translate(calc(' + mouseX + 'px - 50%), calc(' + mouseY + 'px - 50%))';
  });

  (function ringLoop() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    ring.style.transform = 'translate(calc(' + ringX + 'px - 50%), calc(' + ringY + 'px - 50%))';
    requestAnimationFrame(ringLoop);
  })();

  var hoverTargets = 'a, button, .port-item, .svc-card, .pill, .pf, .co, .bc';
  document.addEventListener('mouseover', function(e) {
    if (e.target.closest(hoverTargets)) document.body.classList.add('hovering');
  });
  document.addEventListener('mouseout', function(e) {
    if (e.target.closest(hoverTargets)) document.body.classList.remove('hovering');
  });
})();

/* ─── 6. MAGNETIC BUTTONS ────────────────── */
function initMagnetic() {
  document.querySelectorAll('.btn-fill, .btn-out, .nav-cta, .att-btn').forEach(function(btn) {
    btn.addEventListener('mousemove', function(e) {
      var r  = btn.getBoundingClientRect();
      var dx = (e.clientX - r.left - r.width  / 2) * 0.25;
      var dy = (e.clientY - r.top  - r.height / 2) * 0.25;
      btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.transform = '';
    });
  });
}

/* ─── 7. PAGE LOADER ─────────────────────── */
function initLoader() {
  var loader  = document.getElementById('loader');
  var barEl   = document.getElementById('ld-bar');
  var pctEl   = document.getElementById('ld-pct');
  var logoSpan = loader ? loader.querySelector('.ld-logo span') : null;

  if (!loader) { startPage(); return; }

  // Reveal logo text
  setTimeout(function() {
    if (logoSpan) logoSpan.style.transform = 'translateY(0)';
  }, 120);

  var progress = 0;
  var iv = setInterval(function() {
    progress += Math.random() * 14 + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(iv);
      setTimeout(function() {
        loader.classList.add('out');
        setTimeout(function() {
          loader.style.display = 'none';
          startPage();
        }, 850);
      }, 350);
    }
    if (barEl) barEl.style.width = progress + '%';
    if (pctEl) pctEl.textContent = Math.round(progress) + '%';
  }, 65);
}

/* ─── 8. START PAGE (after loader) ──────── */
function startPage() {
  // Nav slide in
  gsap.fromTo('nav', { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power4.out', delay: 0.1 });

  // Hero eyebrow
  var eyeSpan = document.querySelector('.hero-eyebrow > span');
  if (eyeSpan) {
    gsap.to(eyeSpan, { y: '0%', duration: 1.2, ease: 'expo.out', delay: 0.35 });
  }

  // Hero title lines — staggered wipe
  gsap.to('.ht-inner', { y: '0%', duration: 1.5, ease: 'expo.out', stagger: 0.12, delay: 0.45 });

  // Hero subtitle
  var heroSub = document.querySelector('.hero-sub > span');
  if (heroSub) {
    gsap.to(heroSub, { y: '0%', duration: 1.2, ease: 'expo.out', delay: 0.9 });
  }

  // Hero CTAs
  gsap.to('.hero-ctas > *', { y: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)', stagger: 0.1, delay: 1.1 });

  // Init Three.js canvas
  initHeroCanvas();

  // Scroll hint after delay
  setTimeout(function() {
    var hint = document.getElementById('scroll-hint');
    if (hint && window.scrollY < 50) hint.classList.add('show');
  }, 2400);
  window.addEventListener('scroll', function() {
    var hint = document.getElementById('scroll-hint');
    if (hint && window.scrollY > 80) hint.classList.remove('show');
  }, { passive: true });
}

/* ─── 9. THREE.JS HERO CANVAS ────────────── */
function initHeroCanvas() {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
  camera.position.z = 4;

  function resize() {
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* Particles */
  var COUNT = 3000;
  var positions = new Float32Array(COUNT * 3);
  var colors    = new Float32Array(COUNT * 3);
  var speeds    = new Float32Array(COUNT);

  for (var i = 0; i < COUNT; i++) {
    positions[i*3]   = (Math.random() - 0.5) * 14;
    positions[i*3+1] = (Math.random() - 0.5) * 10;
    positions[i*3+2] = (Math.random() - 0.5) * 6;
    var t = Math.random();
    colors[i*3]   = 1;
    colors[i*3+1] = 0.92 - t * 0.65;
    colors[i*3+2] = 0.92 - t * 0.82;
    speeds[i] = Math.random() * 0.4 + 0.1;
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  var mat = new THREE.PointsMaterial({ size: 0.038, vertexColors: true, transparent: true, opacity: 0.65, depthWrite: false });
  var particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* Wireframe orb 1 */
  var orbMat = new THREE.MeshBasicMaterial({ color: 0xff3f1a, wireframe: true, transparent: true, opacity: 0.07 });
  var orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 2), orbMat);
  orb.position.set(2.6, 0.2, -1);
  scene.add(orb);

  /* Wireframe orb 2 */
  var orb2 = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.4, 1),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.025 })
  );
  orb2.position.set(-2.2, 0.6, -2);
  scene.add(orb2);

  /* Connection lines */
  var lineMat = new THREE.LineBasicMaterial({ color: 0xff3f1a, transparent: true, opacity: 0.1 });
  for (var j = 0; j < 14; j++) {
    var pts = [
      new THREE.Vector3((Math.random()-0.5)*12, (Math.random()-0.5)*8, (Math.random()-0.5)*4),
      new THREE.Vector3((Math.random()-0.5)*12, (Math.random()-0.5)*8, (Math.random()-0.5)*4)
    ];
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }

  var tx = 0, ty = 0, camTX = 0, camTY = 0, tick = 0;

  document.addEventListener('mousemove', function(e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 0.4;
    ty = -(e.clientY / window.innerHeight - 0.5) * 0.3;
  });

  (function animate() {
    requestAnimationFrame(animate);
    tick += 0.008;

    camTX += (tx - camTX) * 0.04;
    camTY += (ty - camTY) * 0.04;
    camera.position.x = camTX;
    camera.position.y = camTY;
    camera.lookAt(0, 0, 0);

    orb.rotation.x  += 0.003;
    orb.rotation.y  += 0.005;
    orb2.rotation.x -= 0.002;
    orb2.rotation.y += 0.003;

    var pos = geo.attributes.position.array;
    for (var k = 0; k < COUNT; k++) {
      pos[k*3+1] += Math.sin(tick + speeds[k] * 10) * 0.0006;
    }
    geo.attributes.position.needsUpdate = true;

    orbMat.opacity = 0.05 + Math.sin(tick * 0.8) * 0.03;
    renderer.render(scene, camera);
  })();
}

/* ─── 10. NAVIGATION ─────────────────────── */
function initNav() {
  var navEl = document.getElementById('nav');

  window.addEventListener('scroll', function() {
    if (navEl) navEl.classList.toggle('solid', window.scrollY > 80);
  }, { passive: true });

  var hamBtn  = document.getElementById('ham');
  var mobMenu = document.getElementById('mobMenu');

  if (hamBtn && mobMenu) {
    hamBtn.addEventListener('click', function() {
      hamBtn.classList.toggle('open');
      mobMenu.classList.toggle('open');
    });
    mobMenu.querySelectorAll('.mob-link').forEach(function(l) {
      l.addEventListener('click', function() {
        hamBtn.classList.remove('open');
        mobMenu.classList.remove('open');
      });
    });
  }

  // Active nav link on scroll
  var sections = document.querySelectorAll('section[id]');
  var links    = document.querySelectorAll('.nl');
  var secObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        links.forEach(function(l) { l.classList.remove('act'); });
        var a = document.querySelector('.nl[href="#' + e.target.id + '"]');
        if (a) a.classList.add('act');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(function(s) { secObs.observe(s); });
}

/* ─── 11. SCROLL REVEAL ──────────────────── */
function initReveal() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.r-up, .r-scale').forEach(function(el) { obs.observe(el); });
}

/* ─── 12. ABOUT WORD SCRUB (GSAP) ────────── */
function initAboutScrub() {
  var el = document.getElementById('aboutText');
  if (!el) return;

  // Split text preserving <em>
  var original = el.innerHTML;
  var tmp = document.createElement('div');
  tmp.innerHTML = original;
  var result = '';

  tmp.childNodes.forEach(function(node) {
    if (node.nodeType === 3) {
      node.textContent.split(/\s+/).filter(Boolean).forEach(function(w) {
        result += '<span class="wmask"><span class="w" style="opacity:.12">' + w + '</span></span> ';
      });
    } else {
      node.textContent.split(/\s+/).filter(Boolean).forEach(function(w) {
        result += '<span class="wmask"><span class="w" style="opacity:.12;color:var(--accent);font-style:italic">' + w + '</span></span> ';
      });
    }
  });
  el.innerHTML = result;

  // Inline style for word masks
  var st = document.createElement('style');
  st.textContent = '.wmask{display:inline-block;overflow:hidden}.w{display:inline-block}';
  document.head.appendChild(st);

  ScrollTrigger.create({
    trigger: el,
    start: 'top 75%',
    end: 'bottom 30%',
    scrub: 1,
    onUpdate: function(self) {
      var words = el.querySelectorAll('.w');
      words.forEach(function(w, i) {
        var thresh = i / words.length;
        var alpha  = Math.min(1, Math.max(0.12, (self.progress - thresh + 0.18) / 0.18));
        w.style.opacity = alpha;
      });
    }
  });
}

/* ─── 13. HORIZONTAL SERVICES DRAG ──────── */
function initHScroll() {
  var track = document.getElementById('h-track');
  var fill  = document.querySelector('.h-prog-fill');
  if (!track) return;

  var isDown = false, startX, startScroll;

  track.addEventListener('mousedown', function(e) {
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    startScroll = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });
  document.addEventListener('mouseup', function() {
    isDown = false;
    track.style.cursor = '';
  });
  track.addEventListener('mousemove', function(e) {
    if (!isDown) return;
    e.preventDefault();
    var x = e.pageX - track.offsetLeft;
    track.scrollLeft = startScroll - (x - startX) * 1.4;
    updateProg();
  });
  track.addEventListener('scroll', updateProg, { passive: true });

  function updateProg() {
    if (!fill) return;
    var max = track.scrollWidth - track.clientWidth;
    fill.style.width = (max > 0 ? track.scrollLeft / max * 100 : 0) + '%';
  }
}

/* ─── 14. COUNTERS ───────────────────────── */
function initCounters() {
  document.querySelectorAll('.cnt').forEach(function(el) {
    var to = parseInt(el.dataset.to, 10);
    var obs = new IntersectionObserver(function(entries) {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      var start = performance.now();
      var dur   = 2000;
      (function loop(now) {
        var p    = Math.min((now - start) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(ease * to);
        if (p < 1) requestAnimationFrame(loop);
        else el.textContent = to;
      })(start);
    }, { threshold: 0.5 });
    obs.observe(el);
  });
}

/* ─── 15. PORTFOLIO FILTER ───────────────── */
function initPortfolioFilter() {
  document.querySelectorAll('.pf').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.pf').forEach(function(b) { b.classList.remove('on'); });
      btn.classList.add('on');
      var f = btn.dataset.f;
      document.querySelectorAll('.port-item').forEach(function(item) {
        var match = f === 'all' || item.dataset.cat === f;
        gsap.to(item, { opacity: match ? 1 : 0.18, scale: match ? 1 : 0.96, duration: 0.4, ease: 'power2.out' });
        item.style.pointerEvents = match ? '' : 'none';
      });
    });
  });
}

/* ─── 16. PROCESS DOTS ───────────────────── */
function initProcessDots() {
  document.querySelectorAll('.proc-item').forEach(function(item) {
    var dot = item.querySelector('.proc-dot');
    var obs = new IntersectionObserver(function(entries) {
      entries[0].isIntersecting ? item.classList.add('lit') : item.classList.remove('lit');
    }, { threshold: 0.6 });
    obs.observe(item);
  });
}

/* ─── 17. TESTIMONIALS SLIDER ────────────── */
function initTestimonials() {
  var track = document.getElementById('tTrack');
  if (!track) return;
  var cards = track.querySelectorAll('.tc');
  var cur   = 0;
  var perView = window.innerWidth > 768 ? 2 : 1;
  var max = cards.length - perView;

  function slideTo(i) {
    cur = Math.max(0, Math.min(i, max));
    var cardW = cards[0].offsetWidth + 20;
    gsap.to(track, { x: -cur * cardW, duration: 0.7, ease: 'expo.out' });
  }

  var prev = document.getElementById('tPrev');
  var next = document.getElementById('tNext');
  if (prev) prev.addEventListener('click', function() { slideTo(cur - 1); });
  if (next) next.addEventListener('click', function() { slideTo(cur + 1); });

  var auto = setInterval(function() { slideTo(cur >= max ? 0 : cur + 1); }, 5000);
  var outer = track.closest('.testi-outer');
  if (outer) {
    outer.addEventListener('mouseenter', function() { clearInterval(auto); });
    outer.addEventListener('mouseleave', function() {
      auto = setInterval(function() { slideTo(cur >= max ? 0 : cur + 1); }, 5000);
    });
  }
}

/* ─── 18. TECH CARDS REVEAL ──────────────── */
function initTechReveal() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.tc-card').forEach(function(el, i) {
    el.style.setProperty('--td', i * 0.07 + 's');
    obs.observe(el);
  });
}

/* ─── 19. BLOG CARDS REVEAL ──────────────── */
function initBlogReveal() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.bc').forEach(function(el, i) {
    el.style.setProperty('--d', i * 0.1 + 's');
    obs.observe(el);
  });
}

/* ─── 20. QUOTE CALCULATOR ───────────────── */
function initCalculator() {
  var qVal   = document.getElementById('qVal');
  var qRange = document.getElementById('qRange');
  if (!qVal) return;

  var mn = 25000, mx = 80000, mul = 1, timeAdd = 0, addonTotal = 0;

  function fmt(n) {
    return '\u20B9' + Math.round(n).toLocaleString('en-IN');
  }

  function update() {
    var lo = Math.round(mn * mul + timeAdd + addonTotal);
    var hi = Math.round(mx * mul + timeAdd + addonTotal);
    qVal.textContent   = fmt(lo);
    qRange.textContent = 'Estimated range: ' + fmt(lo) + ' \u2013 ' + fmt(hi);
    qVal.classList.remove('pop');
    void qVal.offsetWidth;
    qVal.classList.add('pop');
    setTimeout(function() { qVal.classList.remove('pop'); }, 320);
  }

  // Type buttons
  document.querySelectorAll('#cType .co').forEach(function(b) {
    b.addEventListener('click', function() {
      document.querySelectorAll('#cType .co').forEach(function(x) { x.classList.remove('on'); });
      b.classList.add('on');
      mn = +b.dataset.mn; mx = +b.dataset.mx;
      update();
    });
  });

  // Complexity buttons
  document.querySelectorAll('#cComp .co').forEach(function(b) {
    b.addEventListener('click', function() {
      document.querySelectorAll('#cComp .co').forEach(function(x) { x.classList.remove('on'); });
      b.classList.add('on');
      mul = +b.dataset.mul;
      update();
    });
  });

  // Timeline buttons
  document.querySelectorAll('#cTime .co').forEach(function(b) {
    b.addEventListener('click', function() {
      document.querySelectorAll('#cTime .co').forEach(function(x) { x.classList.remove('on'); });
      b.classList.add('on');
      timeAdd = +b.dataset.add;
      update();
    });
  });

  // Addon checkboxes
  document.querySelectorAll('#cAddons input').forEach(function(cb) {
    cb.addEventListener('change', function() {
      addonTotal = Array.from(document.querySelectorAll('#cAddons input:checked'))
        .reduce(function(s, el) { return s + (+el.dataset.add); }, 0);
      update();
    });
  });

  update();
}

/* ─── 21. CARD 3D TILT ───────────────────── */
function initTilt() {
  document.querySelectorAll('.port-item, .svc-card, .tc').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var r  = card.getBoundingClientRect();
      var x  = (e.clientX - r.left)  / r.width  - 0.5;
      var y  = (e.clientY - r.top)   / r.height - 0.5;
      card.style.transform = 'perspective(900px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 6) + 'deg)';
    });
    card.addEventListener('mouseleave', function() { card.style.transform = ''; });
  });
}

/* ─── 22. PILL RIPPLE ────────────────────── */
function initPillRipple() {
  document.querySelectorAll('.pill').forEach(function(p) {
    p.style.position = 'relative';
    p.style.overflow = 'hidden';
    p.addEventListener('click', function(e) {
      var r = p.getBoundingClientRect();
      var s = document.createElement('span');
      Object.assign(s.style, {
        position: 'absolute',
        borderRadius: '50%',
        width: '4px', height: '4px',
        background: 'var(--accent)',
        left: (e.clientX - r.left) + 'px',
        top: (e.clientY - r.top) + 'px',
        transform: 'scale(0)',
        opacity: '0.5',
        animation: 'ripple .6s ease-out forwards',
        pointerEvents: 'none'
      });
      p.appendChild(s);
      setTimeout(function() { s.remove(); }, 650);
    });
  });
}

/* ─── 23. FORM SUBMIT ────────────────────── */
function initForm() {
  var form = document.getElementById('cform');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    var orig = btn.innerHTML;
    btn.innerHTML = '<span>Sent!</span><span></span>';
    gsap.to(btn, { background: '#1aff8c', duration: 0.4 });
    showToast('Message sent — we\'ll reply within 24 hours!');
    setTimeout(function() {
      btn.innerHTML = orig;
      gsap.to(btn, { background: 'var(--accent)', duration: 0.4 });
      form.reset();
    }, 4000);
  });
}

/* ─── 24. TOAST ──────────────────────────── */
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 3600);
}

/* ─── 25. SMOOTH ANCHORS ─────────────────── */
function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
    });
  });
  var backTop = document.querySelector('.back-top');
  if (backTop) {
    backTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ─── 26. GSAP ADVANCED SCROLL ───────────── */
function initGsapEffects() {
  // Hero parallax
  gsap.to('#hero-canvas', {
    y: '28%', ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });
  gsap.to('.hero-inner', {
    y: '14%', opacity: 0.2, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'center top', end: 'bottom top', scrub: 1 }
  });

  // Numbers band clip reveal
  gsap.fromTo('#numbers',
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', ease: 'expo.out', duration: 1.4,
      scrollTrigger: { trigger: '#numbers', start: 'top 80%', toggleActions: 'play none none none' } }
  );

  // Numbers items stagger
  gsap.fromTo('.num-item',
    { opacity: 0, y: 36 },
    { opacity: 1, y: 0, stagger: 0.1, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '#numbers', start: 'top 75%', toggleActions: 'play none none none' } }
  );

  // About number parallax
  gsap.to('.about-num', {
    y: -70, ease: 'none',
    scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 2 }
  });

  // Attention headline parallax
  var attH = document.querySelector('.att-h');
  if (attH) {
    gsap.to(attH, {
      y: -40, ease: 'none',
      scrollTrigger: { trigger: '#attention', start: 'top bottom', end: 'bottom top', scrub: 2 }
    });
  }

  // Process items stagger
  gsap.fromTo('.proc-item',
    { opacity: 0, y: 32 },
    { opacity: 1, y: 0, stagger: 0.12, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: '#process', start: 'top 78%', toggleActions: 'play none none none' } }
  );
}

/* ─── 27. BOOT ───────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  initLoader();
  initNav();
  initReveal();
  initAboutScrub();
  initHScroll();
  initCounters();
  initPortfolioFilter();
  initProcessDots();
  initTestimonials();
  initTechReveal();
  initBlogReveal();
  initCalculator();
  initTilt();
  initPillRipple();
  initForm();
  initAnchors();
  initMagnetic();
  initGsapEffects();
});
