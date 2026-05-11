/* ════════════════════════════════════════════
   Portfolio — script.js
   Samuel Korede Ogbara
   ════════════════════════════════════════════
   - Custom cursor (dot + ring, throttled rAF)
   - Scroll progress bar
   - Sticky nav background on scroll
   - Live UTC clock
   - Scroll-reveal (IntersectionObserver)
   - Typing animation (hero)
   - Marquee track (auto-duplicated)
   - Animated stat counters
   - 3D tilt on cards (mouse parallax)
   - Magnetic buttons
   - Project filter tabs
   - Active nav link highlighting
   - Hamburger / mobile menu
   - Contact form validation & success
   - Smooth anchor scrolling
═══════════════════════════════════════════════ */

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

// ════════════════════════════════════════════
// CUSTOM CURSOR (lightweight — no blend-modes, throttled)
// ════════════════════════════════════════════
(function initCursor() {
  if (isTouch || prefersReducedMotion) return;
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let dotX = mx, dotY = my;
  let raf = null;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!raf) raf = requestAnimationFrame(frame);
  }, { passive: true });

  function frame() {
    // Dot snaps almost instantly; ring trails faster than before
    dotX += (mx - dotX) * 0.75;
    dotY += (my - dotY) * 0.75;
    rx += (mx - rx) * 0.38;
    ry += (my - ry) * 0.38;

    dot.style.transform  = `translate3d(${dotX - 2.5}px, ${dotY - 2.5}px, 0)`;
    ring.style.transform = `translate3d(${rx - 13}px, ${ry - 13}px, 0)`;

    // Keep rAF alive while still settling
    if (Math.abs(mx - rx) > 0.4 || Math.abs(my - ry) > 0.4) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = null;
    }
  }
  frame();

  // hover state on interactive elements (delegated)
  const hoverSel = 'a, button, .filter-tab, .skill-tags span, .project-card, .disc-card, .skills-group, input, textarea, .contact-item, .hamburger';
  let isHover = false;
  document.addEventListener('mouseover', (e) => {
    const match = e.target.closest && e.target.closest(hoverSel);
    if (match && !isHover) { ring.classList.add('hover'); isHover = true; }
  }, { passive: true });
  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(hoverSel)) {
      ring.classList.remove('hover'); isHover = false;
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0'; ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1'; ring.style.opacity = '1';
  });
})();

// ════════════════════════════════════════════
// SCROLL PROGRESS BAR
// ════════════════════════════════════════════
(function initProgress() {
  const bar = $('#scrollProgress');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ════════════════════════════════════════════
// NAV: background on scroll
// ════════════════════════════════════════════
(function initNavScroll() {
  const header = $('#navHeader');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ════════════════════════════════════════════
// LIVE CLOCK (UTC)
// ════════════════════════════════════════════
(function initClock() {
  const el = $('#liveClock');
  if (!el) return;
  const tick = () => {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');
    el.textContent = `UTC · ${h}:${m}:${s}`;
  };
  tick();
  setInterval(tick, 1000);
})();

// ════════════════════════════════════════════
// SCROLL REVEAL
// ════════════════════════════════════════════
(function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  const parents = new Set(items.map((el) => el.parentElement));
  parents.forEach((parent) => {
    const siblings = [...parent.querySelectorAll(':scope > .reveal')];
    siblings.forEach((el, i) => {
      el.style.transitionDelay = `${i * 70}ms`;
    });
  });

  items.forEach((el) => observer.observe(el));
})();

// ════════════════════════════════════════════
// TYPING ANIMATION
// ════════════════════════════════════════════
(function initTyping() {
  const el = $('#typed');
  if (!el) return;

  const phrases = [
    'Full-Stack Developer',
    'Graphic Designer',
    'Shopify Specialist',
    'SEO Strategist',
    'Brand Designer',
    'Problem Solver',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let pause = false;

  function tick() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 45 : 80;

    if (!isDeleting && charIndex === current.length) {
      if (pause) { pause = false; isDeleting = true; delay = 1800; }
      else { pause = true; delay = 1800; }
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 300;
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 1200);
})();

// ════════════════════════════════════════════
// MARQUEE — build & duplicate (single-word ticker)
// ════════════════════════════════════════════
(function initMarquee() {
  const track = $('#marqueeTrack');
  if (!track) return;

  const items = [
    'Design', 'Develop', 'Shopify', 'Firebase',
    'Ship', 'Polish', 'React', 'Next.js',
    'Figma', 'SEO', 'Brand', 'Craft',
  ];

  const build = () =>
    items.map((label) =>
      `<span class="marquee-item"><span class="marquee-label">${label}</span><span class="marquee-star">✦</span></span>`
    ).join('');

  track.innerHTML = build() + build();
})();

// ════════════════════════════════════════════
// ANIMATED STAT COUNTERS
// ════════════════════════════════════════════
(function initCounters() {
  const els = $$('[data-count]');
  if (!els.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(easeOut(t) * target);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  els.forEach((el) => io.observe(el));
})();

// ════════════════════════════════════════════
// 3D TILT — cards follow mouse
// ════════════════════════════════════════════
(function initTilt() {
  if (isTouch || prefersReducedMotion) return;
  const cards = $$('[data-tilt]');
  if (!cards.length) return;

  const MAX = 6; // degrees
  cards.forEach((card) => {
    let rect = null;

    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
      card.style.transition = 'transform 0.15s var(--ease)';
    });

    card.addEventListener('mousemove', (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rx = (-dy * MAX).toFixed(2);
      const ry = (dx * MAX).toFixed(2);
      card.style.transform =
        `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s var(--ease-out)';
      card.style.transform = '';
      rect = null;
    });
  });
})();

// ════════════════════════════════════════════
// MAGNETIC BUTTONS
// ════════════════════════════════════════════
(function initMagnetic() {
  if (isTouch || prefersReducedMotion) return;
  const buttons = $$('.btn, .nav-cta');
  buttons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

// ════════════════════════════════════════════
// PROJECT FILTER TABS
// ════════════════════════════════════════════
(function initFilter() {
  const tabs = $$('.filter-tab');
  const cards = $$('#projectsGrid .project-card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const f = tab.dataset.filter;

      cards.forEach((card) => {
        const cat = card.dataset.cat;
        const match = f === 'all' || cat === f;
        card.classList.toggle('hidden', !match);
      });
    });
  });
})();

// ════════════════════════════════════════════
// ACTIVE NAV LINK
// ════════════════════════════════════════════
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a, .mobile-menu a');

  const setActive = () => {
    let current = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach((a) => {
      a.classList.remove('active');
      if (a.getAttribute('href') === `#${current}`) a.classList.add('active');
    });
  };

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();

// ════════════════════════════════════════════
// HAMBURGER / MOBILE MENU
// ════════════════════════════════════════════
(function initHamburger() {
  const btn = $('#hamburger');
  const menu = $('#mobileMenu');
  if (!btn || !menu) return;

  const toggle = () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  btn.addEventListener('click', toggle);

  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) toggle();
  });
})();

// ════════════════════════════════════════════
// CONTACT FORM — submits via Web3Forms (free relay)
// ════════════════════════════════════════════
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errorBox = $('#formError');

  const showError = (msg) => {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.classList.add('visible');
  };
  const clearError = () => {
    if (!errorBox) return;
    errorBox.textContent = '';
    errorBox.classList.remove('visible');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const btn = form.querySelector('button[type="submit"]');
    const fields = [
      { id: 'name',    test: (v) => v.trim().length > 1 },
      { id: 'email',   test: (v) => emailRegex.test(v.trim()) },
      { id: 'message', test: (v) => v.trim().length > 2 },
    ];

    let valid = true;
    fields.forEach(({ id, test }) => {
      const input = form.querySelector(`#${id}`);
      const group = input.closest('.form-group');
      if (!test(input.value)) {
        group.classList.add('error');
        valid = false;
      } else {
        group.classList.remove('error');
      }
    });

    if (!valid) return;

    // Use the user-typed subject as the email subject line if provided
    const subjectInput = form.querySelector('#subject_user');
    const subjectHidden = form.querySelector('input[name="subject"]');
    if (subjectInput && subjectHidden && subjectInput.value.trim()) {
      subjectHidden.value = `Portfolio: ${subjectInput.value.trim()}`;
    }

    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        btn.classList.add('sent');
        form.reset();
        setTimeout(() => {
          btn.disabled = false;
          btn.classList.remove('sent');
        }, 4500);
      } else {
        const msg = data.message || 'Something went wrong. Please email skogbarao3@gmail.com directly.';
        showError(msg);
        btn.disabled = false;
      }
    } catch (err) {
      showError('Network error. Please check your connection or email skogbarao3@gmail.com directly.');
      btn.disabled = false;
    }
  });

  // Clear error state as user types
  form.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('input', () => {
      const group = el.closest('.form-group');
      if (group) group.classList.remove('error');
      clearError();
    });
  });
})();

// ════════════════════════════════════════════
// SMOOTH SCROLL for anchor links
// ════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
