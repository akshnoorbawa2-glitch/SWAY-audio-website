/* ==========================================================
   SWAY — Tactile Dual-App Reaction Engine
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // DOM Elements: Controls & Triggers
  const btnPlayTrigger = document.getElementById('btn-play-trigger');
  const playSvg = document.getElementById('play-svg');
  const playBtnLabel = document.getElementById('play-btn-label');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // DOM Elements: Stage & Bridge Indicators
  const stageDot = document.getElementById('stage-dot');
  const stageStatusTitle = document.getElementById('stage-status-title');
  const bridgeBadge = document.getElementById('bridge-badge');
  const bridgeText = document.getElementById('bridge-text');

  // DOM Elements: Music Player Window (Spotify / Target)
  const musicFaderFill = document.getElementById('music-fader-fill');
  const musicFaderThumb = document.getElementById('music-fader-thumb');
  const musicVolLabel = document.getElementById('music-vol-label');
  const duckCallout = document.getElementById('duck-callout');
  const duckCalloutText = document.getElementById('duck-callout-text');
  const musicWaveBars = document.querySelectorAll('#music-wave-bars span');
  const vinylDisc = document.getElementById('vinyl-disc');

  // DOM Elements: Video Player Window (Trigger Source)
  const videoProgress = document.getElementById('video-progress');
  const videoAudioLabel = document.getElementById('video-audio-label');
  const videoLevelBars = document.querySelectorAll('#video-level-bars span');

  // Simulation State
  let isPlaying = false;
  let targetDuckFactor = 0.40; // 40% default
  let currentMusicVol = 100;
  let animProgress = 0;
  let restoreTimeout = null;
  let loopFrameId = null;

  // Preset Button Switching
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = parseInt(btn.getAttribute('data-val'), 10);
      targetDuckFactor = val / 100;

      if (isPlaying) {
        currentMusicVol = val;
        updateMusicFaderUI(val);
      }
    });
  });

  function updateMusicFaderUI(volPercent) {
    if (musicFaderFill) musicFaderFill.style.width = `${volPercent}%`;
    if (musicFaderThumb) musicFaderThumb.style.left = `${volPercent}%`;
    if (musicVolLabel) musicVolLabel.textContent = `${Math.round(volPercent)}%`;
  }

  // Animation Loop for Waveforms & Dynamic Scrubbing
  function simulationTick(timestamp) {
    if (isPlaying) {
      // 1. Scrub progress
      animProgress = (animProgress + 0.15) % 100;
      if (videoProgress) videoProgress.style.width = `${animProgress}%`;

      // 2. Video audio output bouncing
      if (videoAudioLabel) videoAudioLabel.textContent = 'Active Audio Output';
      videoLevelBars.forEach((bar, i) => {
        const active = Math.sin(timestamp * 0.008 + i) > -0.2;
        bar.style.backgroundColor = active ? '#10b981' : '#24242e';
      });

      // 3. Music wave compression (ducked)
      musicWaveBars.forEach((bar, i) => {
        const height = (15 + Math.sin(timestamp * 0.004 + i) * 10) * (targetDuckFactor / 0.4);
        bar.style.height = `${Math.max(6, height)}px`;
        bar.style.opacity = '0.5';
      });

      // 4. Smooth volume slide down
      const targetVol = targetDuckFactor * 100;
      if (currentMusicVol > targetVol) {
        currentMusicVol -= (currentMusicVol - targetVol) * 0.1;
        updateMusicFaderUI(currentMusicVol);
      }

    } else {
      // Idle state / Restored
      if (videoAudioLabel) videoAudioLabel.textContent = 'Silent (Paused)';
      videoLevelBars.forEach(bar => {
        bar.style.backgroundColor = '#24242e';
      });

      // Full music wave animation
      musicWaveBars.forEach((bar, i) => {
        const height = 8 + Math.sin(timestamp * 0.006 + i) * 8 + 4;
        bar.style.height = `${Math.max(4, height)}px`;
        bar.style.opacity = '1';
      });

      // Smooth volume slide back up
      if (currentMusicVol < 100) {
        currentMusicVol += (100 - currentMusicVol) * 0.08;
        if (Math.abs(100 - currentMusicVol) < 0.5) currentMusicVol = 100;
        updateMusicFaderUI(currentMusicVol);
      }
    }

    loopFrameId = requestAnimationFrame(simulationTick);
  }

  // Toggle Video Playback Interaction
  if (btnPlayTrigger) {
    btnPlayTrigger.addEventListener('click', () => {
      if (restoreTimeout) {
        clearTimeout(restoreTimeout);
        restoreTimeout = null;
      }

      if (!isPlaying) {
        // Start Video Playback -> Duck Music
        isPlaying = true;
        btnPlayTrigger.classList.add('playing');
        playBtnLabel.textContent = 'Pause Video';
        playSvg.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';

        if (stageDot) stageDot.classList.add('active');
        if (stageStatusTitle) stageStatusTitle.textContent = 'VIDEO DETECTED • SWAY ACTIVELY DUCKING MUSIC';
        if (bridgeBadge) bridgeBadge.classList.add('active');
        if (bridgeText) bridgeText.textContent = `SWAY DUCKED (-${Math.round((1 - targetDuckFactor) * 100)}%)`;

        if (duckCallout) duckCallout.classList.add('active');
        if (duckCalloutText) duckCalloutText.textContent = `Ducked to ${Math.round(targetDuckFactor * 100)}% • Video Audible`;

      } else {
        // Pause Video Playback -> Restoring Music
        isPlaying = false;
        btnPlayTrigger.classList.remove('playing');
        playBtnLabel.textContent = 'Play Video';
        playSvg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';

        if (stageStatusTitle) stageStatusTitle.textContent = 'VIDEO PAUSED • RESTORING MUSIC...';
        if (bridgeText) bridgeText.textContent = 'RESTORING AUDIO...';
        if (duckCalloutText) duckCalloutText.textContent = 'Restoring volume in 1.5s...';

        restoreTimeout = setTimeout(() => {
          if (stageDot) stageDot.classList.remove('active');
          if (stageStatusTitle) stageStatusTitle.textContent = 'INTERACTIVE SIMULATION • WAITING FOR VIDEO';
          if (bridgeBadge) bridgeBadge.classList.remove('active');
          if (bridgeText) bridgeText.textContent = 'SWAY DUCK ENGINE';
          if (duckCallout) duckCallout.classList.remove('active');
          if (duckCalloutText) duckCalloutText.textContent = 'Full Volume (100%) • Ready';
        }, 1500);
      }
    });
  }

  // Start animation loop
  loopFrameId = requestAnimationFrame(simulationTick);
});
