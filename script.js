/* ==========================================================
   STUTTGART ATELIER — script.js
   Modullar: preloader, navbar, reveal, counters, particles,
   parallax, magnit tugma, galereya lightbox, forma validatsiyasi
   ========================================================== */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- 1. Preloader ---------- */
  const hidePreloader = () => $('#preloader')?.classList.add('done');
  window.addEventListener('load', () => setTimeout(hidePreloader, 500));
  setTimeout(hidePreloader, 3500); // zaxira

  /* ---------- 2. Navbar: scrollda blur fon + faol havola ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const links = $$('.nav-link');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => spy.observe(s));

  // Mobil menyu havola bosilganda yopilsin
  $$('#menu .nav-link, #menu .btn').forEach((a) => a.addEventListener('click', () => {
    const el = $('#menu');
    if (el.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(el).hide();
  }));

  /* ---------- 3. Scroll reveal ---------- */
  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => revealObs.observe(el));

  /* ---------- 4. Counter animatsiyasi ---------- */
  const animateCount = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => { if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countObs.observe(el));

  /* ---------- 5. Hero particles (yengil canvas) ---------- */
  const canvas = $('#particles');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, dots = [], running = true, raf;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.floor(w / 22)); // ekranga qarab kam miqdor
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.4 + .4,
        vx: (Math.random() - .5) * .18, vy: -(Math.random() * .25 + .05),
        a: Math.random() * .5 + .15
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -5) { d.y = h + 5; d.x = Math.random() * w; }
        if (d.x < -5) d.x = w + 5; if (d.x > w + 5) d.x = -5;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(194,168,120,${d.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    draw();
    // Hero ko'rinmasa — animatsiyani to'xtat (CPU tejash)
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; draw(); }
      else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    }).observe($('#hero'));
  }

  /* ---------- 6. Parallax (hero matni) ---------- */
  const px = $('[data-parallax]');
  if (px && !reduceMotion) {
    const k = +px.dataset.parallax;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight);
        px.style.transform = `translateY(${y * k}px)`;
        px.style.opacity = String(1 - y / (window.innerHeight * 0.9));
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- 7. Magnit tugmalar ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('.magnet').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- 8. Galereya lightbox ---------- */
  const lbEl = $('#lightbox');
  const lb = new bootstrap.Modal(lbEl);
  $$('.g-item').forEach((btn) => btn.addEventListener('click', () => {
    const img = $('img', btn);
    $('#lbTitle').textContent = btn.dataset.title;
    const box = $('#lbMedia');
    box.className = 'lb-media ' + [...btn.classList].find((c) => /^g\d$/.test(c));
    box.innerHTML = '';
    if (img) {
      const big = document.createElement('img');
      big.src = img.src; big.alt = img.alt;
      box.appendChild(big);
    }
    lb.show();
  }));

  /* ---------- 9. Forma validatsiyasi ---------- */
  const form = $('#contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    $$('.form-control', form).forEach((f) => {
      const valid = f.checkValidity();
      f.classList.toggle('is-invalid', !valid);
      f.classList.toggle('is-valid', valid);
      if (!valid) ok = false;
    });
    const msg = $('#formOk');
    if (ok) {
      // Bu yerda haqiqiy yuborish (fetch) ulanadi
      msg.hidden = false;
      form.reset();
      $$('.form-control', form).forEach((f) => f.classList.remove('is-valid'));
    } else {
      msg.hidden = true;
      $('.is-invalid', form)?.focus();
    }
  });
  // Yozish davomida xatoni olib tashlash
  $$('.form-control', form).forEach((f) => f.addEventListener('input', () => {
    if (f.classList.contains('is-invalid') && f.checkValidity()) f.classList.remove('is-invalid');
  }));
})();
