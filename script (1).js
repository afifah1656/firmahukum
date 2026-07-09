document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Toast helper ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function showToast(message, type = 'success') {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.className = 'toast show' + (type === 'error' ? ' error' : '');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4000);
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('open'));
  });

  /* ---------- Scroll progress + scroll-top button ---------- */
  const progressRule = document.getElementById('progressRule');
  const scrollTopBtn = document.getElementById('scrollTop');

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressRule.style.width = pct + '%';
    scrollTopBtn.classList.toggle('show', scrollTop > 480);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Scrollspy ---------- */
  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = '#' + entry.target.id;
      const link = document.querySelector(`[data-nav][href="${id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active-link'));
        link.classList.add('active-link');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(sec => spyObserver.observe(sec));

  /* ---------- Testimonial carousel ---------- */
  const slides = Array.from(document.querySelectorAll('.quote-slide'));
  const dotsWrap = document.getElementById('quoteDots');
  let current = 0;
  let autoTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Testimoni ' + (i + 1));
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goToSlide(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    restartAutoplay();
  }
  function restartAutoplay() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goToSlide(current + 1), 6000);
  }
  restartAutoplay();

  /* ---------- Article search filter ---------- */
  const searchInput = document.getElementById('articleSearch');
  const articleCards = Array.from(document.querySelectorAll('.article-card'));
  const noResults = document.getElementById('noResults');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;
    articleCards.forEach(card => {
      const matches = card.dataset.title.toLowerCase().includes(q) ||
                      card.dataset.category.toLowerCase().includes(q);
      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });
    noResults.classList.toggle('show', visibleCount === 0);
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.accordion-item').forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.accordion-panel').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Live chat modal ---------- */
  const chatModal = document.getElementById('chatModal');
  const liveChatBtn = document.getElementById('liveChatBtn');
  const chatModalClose = document.getElementById('chatModalClose');
  let lastFocused = null;

  function openChatModal() {
    lastFocused = document.activeElement;
    chatModal.classList.add('open');
    chatModal.setAttribute('aria-hidden', 'false');
    chatModalClose.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeChatModal() {
    chatModal.classList.remove('open');
    chatModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }
  liveChatBtn.addEventListener('click', openChatModal);
  chatModalClose.addEventListener('click', closeChatModal);
  chatModal.addEventListener('click', (e) => { if (e.target === chatModal) closeChatModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatModal.classList.contains('open')) closeChatModal();
  });

  /* ---------- Consultation form validation ---------- */
  const consultForm = document.getElementById('consultForm');
  const formSuccess = document.getElementById('formSuccess');

  function setError(field, message) {
    const row = field.closest('.form-row');
    const errorEl = row.querySelector('.form-error');
    if (message) { row.classList.add('error'); errorEl.textContent = message; }
    else { row.classList.remove('error'); errorEl.textContent = ''; }
  }

  function validateField(field) {
    const value = field.value.trim();
    if (field.hasAttribute('required') && !value) {
      setError(field, 'Wajib diisi.');
      return false;
    }
    if (field.type === 'email' && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) { setError(field, 'Format email tidak valid.'); return false; }
    }
    if (field.type === 'tel' && value) {
      const phonePattern = /^[+0-9\s-]{8,}$/;
      if (!phonePattern.test(value)) { setError(field, 'Format nomor tidak valid.'); return false; }
    }
    setError(field, '');
    return true;
  }

  consultForm.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
  });

  consultForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = Array.from(consultForm.querySelectorAll('input, select, textarea'));
    const allValid = fields.map(validateField).every(Boolean);

    if (allValid) {
      formSuccess.classList.add('show');
      showToast('Konsultasi Anda telah kami terima.');
      consultForm.reset();
      setTimeout(() => formSuccess.classList.remove('show'), 6000);
    } else {
      formSuccess.classList.remove('show');
      showToast('Mohon lengkapi semua field dengan benar.', 'error');
      const firstError = consultForm.querySelector('.form-row.error input, .form-row.error select, .form-row.error textarea');
      if (firstError) firstError.focus();
    }
  });

  /* ---------- Newsletter form ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input');
    if (!input.value.trim()) return;
    showToast('Berhasil berlangganan newsletter.');
    newsletterForm.reset();
  });

});
