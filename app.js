/* ==========================================================
   SWAY — Session Manager Interactive Simulation Logic
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Control Elements
  const btnTestDucking = document.getElementById('btn-test-ducking');
  const testDuckingLabel = document.getElementById('test-ducking-label');
  const liveIndicatorBadge = document.getElementById('live-indicator-badge');
  const liveIndicatorText = document.getElementById('live-indicator-text');

  // Trigger Session Elements (Chrome)
  const triggerSubtext = document.getElementById('trigger-subtext');
  const meterTriggerFill = document.getElementById('meter-trigger-fill');
  const triggerMeterLabel = document.getElementById('trigger-meter-label');

  // Target Session Elements (Spotify)
  const spotifySliderFill = document.getElementById('spotify-slider-fill');
  const spotifySliderThumb = document.getElementById('spotify-slider-thumb');
  const spotifyVolLabel = document.getElementById('spotify-vol-label');
  const targetRoleBadge = document.getElementById('target-role-badge');
  const statusDuckFactor = document.getElementById('status-duck-factor');

  // State
  let isPlaying = false;
  let currentVol = 100;
  const targetDuckVol = 40;
  let restoreTimeout = null;
  let animationFrameId = null;

  function updateSlider(vol) {
    if (spotifySliderFill) spotifySliderFill.style.width = `${vol}%`;
    if (spotifySliderThumb) spotifySliderThumb.style.left = `${vol}%`;
    if (spotifyVolLabel) spotifyVolLabel.textContent = `Volume: ${Math.round(vol)}%`;
  }

  function animationLoop(timestamp) {
    if (isPlaying) {
      // 1. Simulate active trigger output bouncing
      const meterVal = 55 + Math.sin(timestamp * 0.008) * 35 + Math.random() * 8;
      if (meterTriggerFill) meterTriggerFill.style.width = `${Math.min(100, Math.max(15, meterVal))}%`;

      // 2. Smooth volume slide down to 40%
      if (currentVol > targetDuckVol) {
        currentVol -= (currentVol - targetDuckVol) * 0.12;
        if (Math.abs(currentVol - targetDuckVol) < 0.5) currentVol = targetDuckVol;
        updateSlider(currentVol);
      }
    } else {
      // 1. Trigger output idle
      if (meterTriggerFill) meterTriggerFill.style.width = '0%';

      // 2. Smooth volume slide back up to 100%
      if (currentVol < 100) {
        currentVol += (100 - currentVol) * 0.09;
        if (Math.abs(100 - currentVol) < 0.5) currentVol = 100;
        updateSlider(currentVol);
      }
    }

    animationFrameId = requestAnimationFrame(animationLoop);
  }

  if (btnTestDucking) {
    btnTestDucking.addEventListener('click', () => {
      if (restoreTimeout) {
        clearTimeout(restoreTimeout);
        restoreTimeout = null;
      }

      if (!isPlaying) {
        // Start Video Playback -> Duck Music
        isPlaying = true;
        btnTestDucking.classList.add('playing');
        if (testDuckingLabel) testDuckingLabel.textContent = 'Stop Video Simulation';

        if (liveIndicatorText) liveIndicatorText.textContent = 'Trigger Active • Ducking Spotify';
        if (triggerSubtext) triggerSubtext.textContent = 'PID 14280 • YouTube Video Stream (Playing Audio)';
        if (triggerMeterLabel) triggerMeterLabel.textContent = '-6 dB (Active)';
        if (targetRoleBadge) targetRoleBadge.textContent = 'Ducked to 40%';
        if (statusDuckFactor) statusDuckFactor.textContent = 'Duck Target: 40% (Active)';

      } else {
        // Stop Video Playback -> Restoring Music
        isPlaying = false;
        btnTestDucking.classList.remove('playing');
        if (testDuckingLabel) testDuckingLabel.textContent = 'Simulate Video Playback';

        if (liveIndicatorText) liveIndicatorText.textContent = 'Audio Ended • Restoring...';
        if (triggerSubtext) triggerSubtext.textContent = 'PID 14280 • YouTube Video Stream (Silent)';
        if (triggerMeterLabel) triggerMeterLabel.textContent = 'Silent';
        if (targetRoleBadge) targetRoleBadge.textContent = 'Restoring...';
        if (statusDuckFactor) statusDuckFactor.textContent = 'Duck Target: 40% (Idle)';

        restoreTimeout = setTimeout(() => {
          if (liveIndicatorText) liveIndicatorText.textContent = 'WASAPI Active • Ready';
          if (targetRoleBadge) targetRoleBadge.textContent = 'Ducked Target';
        }, 1200);
      }
    });
  }

  // Start smooth 60fps loop
  animationFrameId = requestAnimationFrame(animationLoop);
});
