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
