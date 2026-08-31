/* ==========================================================
   SWAY — Interactive Audio Ducking Simulation Logic
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
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
});
