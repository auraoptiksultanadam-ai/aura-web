/**
 * Aura Optikal - Client Scripts (Tahap 3)
 * Menangani mobile navigation, auto-close menu, dan active scrollspy
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation & Auto-close
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav-panel');

  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileNav.classList.toggle('hidden');
    });

    // Auto-close ketika link di dalam mobile nav diklik
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.add('hidden');
      });
    });

    // Auto-close saat user klik di luar mobile nav
    document.addEventListener('click', (e) => {
      if (!mobileNav.contains(e.target) && !toggleBtn.contains(e.target)) {
        mobileNav.classList.add('hidden');
      }
    });
  }

  // 2. Active ScrollSpy Navigation
  const sectionIds = ['beranda', 'tentang-kami', 'produk', 'layanan', 'galeri', 'promo', 'lokasi'];
  const desktopLinks = document.querySelectorAll('header nav.hidden.xl\\:flex a[data-path]');
  const mobileLinks = document.querySelectorAll('#mobile-nav-panel a[data-path]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120; // 80px fixed header + 40px safe offset
    let activeId = sectionIds[0];

    for (const id of sectionIds) {
      const section = document.getElementById(id);
      if (section && section.offsetTop <= scrollPos) {
        activeId = id;
      }
    }

    // Terapkan ke desktop nav
    desktopLinks.forEach(link => {
      const isCurrent = link.getAttribute('data-path') === activeId;
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('bg-surface-container-high', 'text-primary', 'font-bold', 'rounded-lg', 'px-3');
        link.classList.remove('text-on-surface-variant');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('bg-surface-container-high', 'text-primary', 'font-bold', 'rounded-lg', 'px-3');
        link.classList.add('text-on-surface-variant');
      }
    });

    // Terapkan ke mobile nav
    mobileLinks.forEach(link => {
      const isCurrent = link.getAttribute('data-path') === activeId;
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('bg-surface-container-high', 'text-primary', 'font-bold', 'rounded-lg', 'px-3');
        link.classList.remove('text-on-surface-variant');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('bg-surface-container-high', 'text-primary', 'font-bold', 'rounded-lg', 'px-3');
        link.classList.add('text-on-surface-variant');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();
});


  // 3. Google rating: one endpoint feeds both rating placements.
  const ratingNodes = document.querySelectorAll('[data-google-rating]');
  const countNodes = document.querySelectorAll('[data-google-count]');
  const googleLinks = document.querySelectorAll('[data-google-link]');
  const ratingEndpoint = '/.netlify/functions/google-rating';

  function showRatingUnavailable() {
    ratingNodes.forEach(node => { node.textContent = '—'; });
    countNodes.forEach(node => { node.textContent = 'Rating belum tersedia'; });
  }

  fetch(ratingEndpoint, { headers: { Accept: 'application/json' } })
    .then(response => {
      if (!response.ok) throw new Error('Google rating endpoint unavailable');
      return response.json();
    })
    .then(data => {
      if (typeof data.rating !== 'number' || typeof data.userRatingCount !== 'number') {
        throw new Error('Google rating data incomplete');
      }
      const rating = data.rating.toFixed(1).replace('.', ',');
      const count = new Intl.NumberFormat('id-ID').format(data.userRatingCount);
      ratingNodes.forEach(node => { node.textContent = rating; });
      countNodes.forEach(node => { node.textContent = count; });
      if (data.googleMapsUri) {
        googleLinks.forEach(link => { link.href = data.googleMapsUri; });
      }
    })
    .catch(() => showRatingUnavailable());
