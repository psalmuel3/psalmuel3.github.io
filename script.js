/* ════════════════════════════════════════════
   Portfolio — script.js
   - Sticky nav background on scroll
   - Scroll-reveal (Intersection Observer)
   - Typing animation (hero)
   - Active nav link highlighting
   - Hamburger / mobile menu
   - Contact form success state
════════════════════════════════════════════ */

// ── Helpers ─────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

// ── NAV: background on scroll ───────────────
(function initNavScroll() {
  const header = $('#navHeader');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── SCROLL REVEAL ────────────────────────────
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

  // Stagger sibling reveals
  const parents = new Set(items.map((el) => el.parentElement));
  parents.forEach((parent) => {
    const siblings = [...parent.querySelectorAll(':scope > .reveal')];
    siblings.forEach((el, i) => {
      el.style.transitionDelay = `${i * 80}ms`;
    });
  });

  items.forEach((el) => observer.observe(el));
})();

// ── TYPING ANIMATION ─────────────────────────
(function initTyping() {
  const el = $('#typed');
  if (!el) return;

  const phrases = [
    'Full-Stack Developer',
    'Freelancer',
    'Problem Solver',
    'UI Craftsman',
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

    let delay = isDeleting ? 55 : 90;

    if (!isDeleting && charIndex === current.length) {
      // Finished typing — pause then delete
      if (pause) { pause = false; isDeleting = true; delay = 1600; }
      else { pause = true; delay = 1600; }
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 300;
    }

    setTimeout(tick, delay);
  }

  // Start after hero entrance animations
  setTimeout(tick, 1200);
})();

// ── ACTIVE NAV LINK ───────────────────────────
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a, .mobile-menu a');

  const setActive = () => {
    let current = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach((a) => {
      a.classList.remove('active');
      if (a.getAttribute('href') === `#${current}`) {
        a.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();

// ── HAMBURGER / MOBILE MENU ───────────────────
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

  // Close on menu link click
  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) toggle();
  });
})();

// ── CONTACT FORM ──────────────────────────────
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const inputs = form.querySelectorAll('input, textarea');

    // Basic validation
    let valid = true;
    inputs.forEach((input) => {
      input.style.borderColor = '';
      if (!input.value.trim()) {
        input.style.borderColor = '#ef4444';
        valid = false;
      }
    });
    if (!valid) return;

    // Simulate send (replace with real API call / EmailJS / Formspree)
    btn.disabled = true;
    btn.classList.add('sent');

    // Reset after 4s so they can send again
    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove('sent');
      form.reset();
    }, 4000);
  });
})();

// ── SMOOTH SCROLL for anchor links ───────────
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 68;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
