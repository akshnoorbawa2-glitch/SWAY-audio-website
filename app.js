/* ==========================================================
   SWAY — Interactive Audio Stream & Mixer Simulation Logic
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------
     1. Mouse Parallax & Stream Dynamics for Hero Visual
     -------------------------------------------------------- */
  const streamViewport = document.getElementById('card-stream-viewport');
  const streamLanes = document.getElementById('streamLanes');
  const tracks = document.querySelectorAll('.stream-track');

  if (streamViewport && streamLanes) {
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
      const rect = streamViewport.getBoundingClientRect();
      // Calculate normalized mouse coords relative to viewport
      const x = (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
      
      targetX = x * 14; // degrees
      targetY = -y * 14;
    });

    function renderParallax() {
      mouseX += (targetX - mouseX) * 0.08;
      mouseY += (targetY - mouseY) * 0.08;

      streamLanes.style.transform = `perspective(1000px) rotateY(${mouseX}deg) rotateX(${mouseY}deg)`;
      requestAnimationFrame(renderParallax);
    }
    requestAnimationFrame(renderParallax);

    // Scroll speed reaction: slightly accelerate streaming on active scroll
    let lastScrollY = window.scrollY;
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      const delta = Math.abs(window.scrollY - lastScrollY);
      lastScrollY = window.scrollY;

      tracks.forEach(track => {
        track.style.animationDuration = delta > 15 ? '12s' : '';
      });

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        tracks.forEach(track => {
          track.style.animationDuration = '';
        });
      }, 300);
    }, { passive: true });
  }

  /* --------------------------------------------------------
     2. Interactive Sound Ducking Simulation Demo
     -------------------------------------------------------- */
  const btnToggle = document.getElementById('btn-toggle-playback');
  const statusDot = document.querySelector('.demo-status-indicator .status-dot');
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

    // Simulate Trigger (Browser) audio output bouncing
    if (isPlaying && meterTrigger) {
      const triggerLevel = 55 + Math.sin(timestamp * 0.009) * 30 + Math.random() * 12;
      meterTrigger.style.width = `${Math.max(15, Math.min(100, triggerLevel))}%`;
    } else if (meterTrigger) {
      meterTrigger.style.width = '0%';
    }

    // Fading interpolation
    if (isPlaying && spotifySlider && spotifyValLabel && meterTarget) {
      const progress = Math.min(1, elapsed / fadeDownMs);
      const target = 80 * duckFactor;
      currentDuckedVolume = startVolume - (startVolume - target) * progress;
      
      spotifySlider.value = Math.round(currentDuckedVolume);
      spotifyValLabel.textContent = `${Math.round(currentDuckedVolume)}%`;
      
      const targetLevel = (currentDuckedVolume * 0.75) + Math.sin(timestamp * 0.005) * 6;
      meterTarget.style.width = `${Math.max(5, targetLevel)}%`;
    } else if (isRestoring && spotifySlider && spotifyValLabel && meterTarget) {
      const progress = Math.min(1, elapsed / fadeUpMs);
      const target = 80;
      currentDuckedVolume = startVolume + (target - startVolume) * progress;
      
      spotifySlider.value = Math.round(currentDuckedVolume);
      spotifyValLabel.textContent = `${Math.round(currentDuckedVolume)}%`;
      
      const targetLevel = (currentDuckedVolume * 0.75) + Math.sin(timestamp * 0.005) * 10;
      meterTarget.style.width = `${Math.max(5, targetLevel)}%`;

      if (progress >= 1) {
        isRestoring = false;
        if (statusDot) statusDot.className = 'status-dot active';
        if (statusText) statusText.textContent = 'SWAY Idle';
      }
    } else if (spotifySlider && spotifyValLabel && meterTarget) {
      spotifySlider.value = 80;
      spotifyValLabel.textContent = '80%';
      const targetLevel = 62 + Math.sin(timestamp * 0.003) * 10;
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

        btnToggle.textContent = 'Pause Video';
        btnToggle.classList.remove('btn-hero-purple');
        btnToggle.classList.add('btn-nav-cta');
        
        if (statusDot) statusDot.className = 'status-dot ducking';
        if (statusText) statusText.textContent = 'Ducking Active (20%)';
      } else {
        // Stop playback -> Restore delay -> Fade up
        isPlaying = false;
        btnToggle.textContent = 'Play Video';
        btnToggle.classList.remove('btn-nav-cta');
        btnToggle.classList.add('btn-hero-purple');
        
        if (statusText) statusText.textContent = 'Restoring...';

        restoreTimeout = setTimeout(() => {
          isRestoring = true;
          fadeStartTime = performance.now();
          startVolume = currentDuckedVolume;
        }, restoreDelayMs);
      }
    });
  }

  // Kick off continuous animation loop
  animationFrameId = requestAnimationFrame(updateMixerSimulation);

  /* --------------------------------------------------------
     3. Scroll Reveal Animations (IntersectionObserver)
     -------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  revealElements.forEach((el) => observer.observe(el));
});
