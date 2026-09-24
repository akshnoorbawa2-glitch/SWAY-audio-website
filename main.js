/**
 * Sway — Frontend Interactive Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initStatsCountUp();
  initMobileMenu();
  initTabNavigation();
});

/**
 * 1) Metric Stats Count-Up with easeOutCubic and staggered timing
 */
function initStatsCountUp() {
  const statElements = document.querySelectorAll('.stat-num');
  if (!statElements.length) return;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateStat(el, index) {
    const target = parseFloat(el.getAttribute('data-target') || '0');
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    
    const duration = 1500 + index * 80;
    const startDelay = 480 + index * 90;

    setTimeout(() => {
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeVal = easeOutCubic(progress);
        const currentNum = easeVal * target;

        el.textContent = currentNum.toFixed(decimals) + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target.toFixed(decimals) + suffix;
        }
      }

      requestAnimationFrame(update);
    }, startDelay);
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statElements.forEach((el, index) => {
            animateStat(el, index);
          });
          obs.disconnect();
        }
      });
    },
    { threshold: 0.25 }
  );

  const statsFooter = document.querySelector('.stats-footer');
  if (statsFooter) {
    observer.observe(statsFooter);
  } else {
    statElements.forEach((el, index) => animateStat(el, index));
  }
}

/**
 * 2) Mobile Navigation & Hamburger Menu Controller
 */
function initMobileMenu() {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');

  if (!burgerBtn || !mobileMenu || !mobileOverlay) return;

  function openMenu() {
    burgerBtn.classList.add('open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    mobileOverlay.removeAttribute('hidden');
    mobileMenu.removeAttribute('hidden');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    burgerBtn.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    mobileOverlay.setAttribute('hidden', '');
    mobileMenu.setAttribute('hidden', '');
    document.body.classList.remove('menu-open');
  }

  function toggleMenu() {
    const isExpanded = burgerBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  burgerBtn.addEventListener('click', toggleMenu);
  mobileOverlay.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burgerBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  // Close on mobile nav link click
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-link, .mobile-action-pill');
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on resize > 768px
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && burgerBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
}

/**
 * 3) View Panels Tab Switcher Controller
 */
function initTabNavigation() {
  const desktopLinks = document.querySelectorAll('.nav-link[data-tab]');
  const mobileLinks = document.querySelectorAll('.mobile-link[data-tab]');
  const logoBtn = document.querySelector('.logo-btn[data-tab]');
  const allNavLinks = [...desktopLinks, ...mobileLinks];
  const panels = {
    home: document.getElementById('view-home'),
    features: document.getElementById('view-features'),
    architecture: document.getElementById('view-architecture')
  };

  function switchTab(tabId) {
    if (!panels[tabId]) tabId = 'home';

    // Update active view panel
    Object.keys(panels).forEach((key) => {
      const panel = panels[key];
      if (!panel) return;
      if (key === tabId) {
        panel.classList.add('active');
        panel.setAttribute('aria-hidden', 'false');
      } else {
        panel.classList.remove('active');
        panel.setAttribute('aria-hidden', 'true');
      }
    });

    // Update active class on nav links
    allNavLinks.forEach((link) => {
      const targetTab = link.getAttribute('data-tab');
      if (targetTab === tabId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update URL hash without jumping scroll
    if (window.location.hash !== `#${tabId}`) {
      history.pushState(null, '', `#${tabId}`);
    }
  }

  allNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const tabId = link.getAttribute('data-tab');
      if (tabId && panels[tabId]) {
        e.preventDefault();
        switchTab(tabId);
      }
    });
  });

  if (logoBtn) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('home');
    });
  }

  // Handle direct hash navigation on page load (e.g. #features, #architecture)
  function handleHash() {
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash && panels[currentHash]) {
      switchTab(currentHash);
    } else {
      switchTab('home');
    }
  }

  window.addEventListener('popstate', handleHash);
  handleHash();
}
