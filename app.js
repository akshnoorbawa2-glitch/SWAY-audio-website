/* ==========================================================
   SWAY — Page Load Fade-In Transitions & WASAPI Simulation
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------
     1. Anime.js v4 Load Transition for Main Text & Visuals
     -------------------------------------------------------- */
  function initEntranceAnimations() {
    // Check if Anime.js v4 (or UMD bundle) is loaded
    const animeLib = window.anime;

    if (animeLib && (typeof animeLib.animate === 'function' || typeof animeLib === 'function')) {
      const animate = animeLib.animate || animeLib;
      const stagger = animeLib.stagger || ((val, opts) => (i) => i * (typeof val === 'number' ? val : 80));
      const createTimeline = animeLib.createTimeline || (() => ({ add: () => ({ add: () => {} }) }));
      const createScope = animeLib.createScope || (() => ({ add: (cb) => cb({ matches: { portrait: false } }) }));
      const createDrawable = animeLib.createDrawable || ((el) => el);
      const onScroll = animeLib.onScroll || (() => true);

      // Main Text Fade In Transition on Home Page Load
      animate('.animate-fade-in', {
        opacity: [0, 1],
        translateY: [16, 0],
        delay: stagger(80, { start: 100 }),
        duration: 700,
        ease: 'out(3)'
      });

      // SVG Path Drawing Transition
      try {
        const svgPaths = document.querySelectorAll('.brand-icon path, .brand-icon line');
        if (svgPaths.length > 0 && typeof createDrawable === 'function') {
          animate(createDrawable('path, line'), {
            draw: ['0 0', '0 1', '1 1'],
            delay: stagger(40),
            ease: 'inOut(3)',
            autoplay: typeof onScroll === 'function' ? onScroll({ sync: true }) : true,
          });
        }
      } catch (err) {
        // Fallback for drawable elements
      }

      // Grid Stagger Timeline
      const options = {
        grid: [13, 13],
        from: 'center',                       
      };

      try {
        createTimeline()
          .add('.dot', {
            scale: stagger([1.1, .75], options),
            ease: 'inOutQuad',
          }, stagger(200, options));
      } catch (err) {
        // Dot timeline initialization
      }

      // Orientation Scope Transition
      try {
        createScope({
          mediaQueries: {
            portrait: '(orientation: portrait)',
          }
        })
        .add(({ matches }) => {
          const isPortrait = matches.portrait;
          createTimeline().add('.circle', {
            y: isPortrait ? 0 : [-50, 50, -50],
            x: isPortrait ? [-50, 50, -50] : 0,
          }, stagger(100));
        });
      } catch (err) {
        // Scope initialization
      }

    } else {
      // Graceful CSS transition fallback
      const elements = document.querySelectorAll('.animate-fade-in');
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.style.transition = 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 100 + index * 75);
      });
    }
  }

  initEntranceAnimations();

  /* --------------------------------------------------------
     2. Interactive Sound Ducking Simulation Demo
     -------------------------------------------------------- */
  const btnToggle = document.getElementById('btn-toggle-playback');
  const statusDot = document.getElementById('demo-dot');
  const statusText = document.getElementById('demo-status-text');
  
  const spotifySlider = document.getElementById('spotify-volume-slider');
  const spotifyValLabel = document.getElementById('spotify-volume-value');
  
  const meterTrigger = document.getElementById('meter-fill-trigger');
  const meterTarget = document.getElementById('meter-fill-target');

  let isPlaying = false;
  let currentDuckedVolume = 80;
  let animationFrameId = null;

  const fadeDownMs = 1000;
  const fadeUpMs = 1000;
  const duckFactor = 0.25; // 25% target volume (80 * 0.25 = 20%)
  const restoreDelayMs = 1500;
  
  let fadeStartTime = null;
  let startVolume = 80;
  let isRestoring = false;
  let restoreTimeout = null;

  function updateMixerSimulation(timestamp) {
    if (!fadeStartTime) fadeStartTime = timestamp;
    const elapsed = timestamp - fadeStartTime;

    // Simulate Trigger (Browser) audio meter activity
    if (isPlaying && meterTrigger) {
      const triggerLevel = 50 + Math.sin(timestamp * 0.008) * 30 + Math.random() * 12;
      meterTrigger.style.width = `${Math.max(12, Math.min(100, triggerLevel))}%`;
    } else if (meterTrigger) {
      meterTrigger.style.width = '0%';
    }

    // Fading interpolation
    if (isPlaying && spotifySlider && spotifyValLabel && meterTarget) {
      const progress = Math.min(1, elapsed / fadeDownMs);
      const target = 80 * duckFactor;
      currentDuckedVolume = startVolume - (startVolume - target) * progress;
      
      spotifySlider.value = Math.round(currentDuckedVolume);
      spotifyValLabel.textContent = `Volume: ${Math.round(currentDuckedVolume)}% (Ducked)`;
      
      const targetLevel = (currentDuckedVolume * 0.7) + Math.sin(timestamp * 0.004) * 6;
      meterTarget.style.width = `${Math.max(4, targetLevel)}%`;
    } else if (isRestoring && spotifySlider && spotifyValLabel && meterTarget) {
      const progress = Math.min(1, elapsed / fadeUpMs);
      const target = 80;
      currentDuckedVolume = startVolume + (target - startVolume) * progress;
      
      spotifySlider.value = Math.round(currentDuckedVolume);
      spotifyValLabel.textContent = `Volume: ${Math.round(currentDuckedVolume)}%`;
      
      const targetLevel = (currentDuckedVolume * 0.7) + Math.sin(timestamp * 0.004) * 10;
      meterTarget.style.width = `${Math.max(4, targetLevel)}%`;

      if (progress >= 1) {
        isRestoring = false;
        if (statusDot) statusDot.className = 'status-indicator-dot';
        if (statusText) statusText.textContent = 'Engine Ready • Idle';
      }
    } else if (spotifySlider && spotifyValLabel && meterTarget) {
      spotifySlider.value = 80;
      spotifyValLabel.textContent = 'Volume: 80%';
      const targetLevel = 58 + Math.sin(timestamp * 0.003) * 8;
      meterTarget.style.width = `${targetLevel}%`;
    }

    animationFrameId = requestAnimationFrame(updateMixerSimulation);
  }

  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      if (restoreTimeout) {
        clearTimeout(restoreTimeout);
        restoreTimeout = null;
      }

      if (!isPlaying) {
        // Start Ducking
        isPlaying = true;
        isRestoring = false;
        fadeStartTime = performance.now();
        startVolume = currentDuckedVolume;

        btnToggle.textContent = 'Stop Playback Simulation';
        btnToggle.classList.add('btn-secondary');
        
        if (statusDot) statusDot.className = 'status-indicator-dot ducking';
        if (statusText) statusText.textContent = 'Active • Ducking Target (20%)';
      } else {
        // Stop playback -> Restore delay -> Fade up
        isPlaying = false;
        btnToggle.textContent = 'Simulate Video Playback';
        btnToggle.classList.remove('btn-secondary');
        
        if (statusText) statusText.textContent = 'Audio Stopped • Restoring...';

        restoreTimeout = setTimeout(() => {
          isRestoring = true;
          fadeStartTime = performance.now();
          startVolume = currentDuckedVolume;
        }, restoreDelayMs);
      }
    });
  }

  // Start continuous mixer animation loop
  animationFrameId = requestAnimationFrame(updateMixerSimulation);

  /* --------------------------------------------------------
     3. Scroll Reveal Observer
     -------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal, .reveal-group');
  
  if ('IntersectionObserver' in window) {
    const scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => scrollObserver.observe(el));
  } else {
    // Fallback: activate immediately
    revealElements.forEach(el => el.classList.add('active'));
  }
});

