/* ═══════════════════════════════════════════
   ACERA FIGHTER – main.js
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAVBAR: scroll shrink + mobile toggle ── */
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
  });

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ── ACTIVE NAV LINK on scroll ── */
  const sections = document.querySelectorAll('section[id]');
  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const sectionTop    = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const id            = section.getAttribute('id');
      const link          = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= sectionTop && scrollY < sectionTop + sectionHeight);
      }
    });
  }

  /* ── CAROUSEL ── */
  const track     = document.getElementById('carouselTrack');
  const prevBtn   = document.getElementById('prevBtn');
  const nextBtn   = document.getElementById('nextBtn');
  const dotsWrap  = document.getElementById('carouselDots');
  const cards     = document.querySelectorAll('.dev-card');

  let currentIndex = 0;
  let cardWidth    = 0;
  let visibleCards = 0;

  function calcCarousel() {
    const container = track.parentElement;
    cardWidth    = cards[0].offsetWidth + 20; // 20 = gap
    visibleCards = Math.floor(container.offsetWidth / cardWidth);
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const totalDots = Math.max(0, cards.length - visibleCards + 1);
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(idx) {
    const maxIndex = Math.max(0, cards.length - visibleCards);
    currentIndex   = Math.min(Math.max(idx, 0), maxIndex);
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentIndex));
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
  });

  // Touch / drag
  let touchStartX = 0;
  let isDragging  = false;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; isDragging = false; }, { passive: true });
  track.addEventListener('touchmove',  e => { if (Math.abs(e.touches[0].clientX - touchStartX) > 8) isDragging = true; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (isDragging && Math.abs(diff) > 40) goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
  });

  function initCarousel() {
    calcCarousel();
    buildDots();
    goTo(0);
  }

  initCarousel();
  window.addEventListener('resize', () => { calcCarousel(); buildDots(); goTo(0); });

  /* ── STAR RATING (leave review) ── */
  const starInputs  = document.querySelectorAll('.star-inp');
  const ratingLabel = document.getElementById('ratingLabel');
  const labels      = ['', 'Muy malo 😞', 'Regular 😐', 'Bien 🙂', 'Muy bueno 😄', 'Excelente! 🔥'];
  let selectedRating = 0;

  starInputs.forEach(star => {
    star.addEventListener('mouseover', () => {
      const val = +star.dataset.val;
      starInputs.forEach(s => s.classList.toggle('selected', +s.dataset.val <= val));
      ratingLabel.textContent = labels[val];
    });
    star.addEventListener('mouseout', () => {
      starInputs.forEach(s => s.classList.toggle('selected', +s.dataset.val <= selectedRating));
      ratingLabel.textContent = selectedRating ? labels[selectedRating] : 'Haz clic para calificar';
    });
    star.addEventListener('click', () => {
      selectedRating = +star.dataset.val;
      starInputs.forEach(s => s.classList.toggle('selected', +s.dataset.val <= selectedRating));
      ratingLabel.textContent = labels[selectedRating];
    });
  });

  /* ── SUBMIT REVIEW ── */
  const submitReview  = document.getElementById('submitReview');
  const reviewSuccess = document.getElementById('reviewSuccess');
  const reviewName    = document.getElementById('reviewName');
  const reviewText    = document.getElementById('reviewText');

  submitReview.addEventListener('click', () => {
    if (!selectedRating) { alert('Por favor selecciona una calificación ⭐'); return; }
    if (!reviewName.value.trim()) { alert('Por favor escribe tu nombre'); return; }
    if (!reviewText.value.trim()) { alert('Por favor escribe un comentario'); return; }

    // Append comment to DOM
    const comments = document.querySelector('.comments-section');
    const initials = reviewName.value.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const stars    = '★'.repeat(selectedRating) + '☆'.repeat(5 - selectedRating);
    const card     = document.createElement('div');
    card.className = 'comment-card';
    card.style.animation = 'heroReveal 0.5s ease forwards';
    card.innerHTML = `
      <div class="comment-header">
        <div class="avatar">${initials}</div>
        <div class="comment-meta">
          <strong>${reviewName.value.trim()}</strong>
          <div class="comment-stars">${stars}</div>
        </div>
        <span class="comment-date">Ahora mismo</span>
      </div>
      <p>${reviewText.value.trim()}</p>
    `;
    comments.prepend(card);

    // Reset
    reviewName.value = '';
    reviewText.value = '';
    selectedRating = 0;
    starInputs.forEach(s => s.classList.remove('selected'));
    ratingLabel.textContent = 'Haz clic para calificar';

    reviewSuccess.style.display = 'block';
    setTimeout(() => { reviewSuccess.style.display = 'none'; }, 4000);
  });

  /* ── CONTACT FORM ── */
  const contactForm    = document.getElementById('contactForm');
  const formSuccessMsg = document.getElementById('formSuccess');

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    formSuccessMsg.style.display = 'block';
    contactForm.reset();
    setTimeout(() => { formSuccessMsg.style.display = 'none'; }, 5000);
  });

  /* ── DONATE AMOUNT SELECTOR ── */
  const amountBtns   = document.querySelectorAll('.amount-btn');
  const customInput  = document.getElementById('customAmount');

  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      customInput.style.display = btn.dataset.amount === 'custom' ? 'block' : 'none';
      if (btn.dataset.amount !== 'custom') customInput.value = '';
    });
  });

  /* ── SCROLL REVEAL (simple IntersectionObserver) ── */
  const revealItems = document.querySelectorAll('.dev-card, .comment-card, .step, .platform-card, .ss-card, .contact-item, .donor-tag');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealItems.forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
    revealObserver.observe(el);
  });

  /* ── SMOOTH SCROLL offset fix for fixed navbar ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

});
