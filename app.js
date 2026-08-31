/* ==========================================================
   SWAY — Acoustic Soundstage Visualization Engine
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const timelineCursor = document.getElementById('timeline-cursor');
  const musicDbVal = document.getElementById('music-db-val');
  const triggerStateVal = document.getElementById('trigger-state-val');

  let cursorX = 50;
  let direction = 1;
  const minX = 40;
  const maxX = 860;
  const speed = 1.4;

  function soundstageTick() {
    cursorX += speed * direction;
    if (cursorX >= maxX) {
      cursorX = maxX;
      direction = -1;
    } else if (cursorX <= minX) {
      cursorX = minX;
      direction = 1;
    }

    if (timelineCursor) {
      timelineCursor.setAttribute('x1', cursorX);
      timelineCursor.setAttribute('x2', cursorX);
    }

    // Determine current audio phase based on cursor position
    if (cursorX >= 300 && cursorX <= 670) {
      // In ducking & speech active zone
      if (musicDbVal) musicDbVal.textContent = '-8 dB (40% Ducked)';
      if (triggerStateVal) triggerStateVal.textContent = 'Voice Audio Active';
    } else if ((cursorX > 260 && cursorX < 300) || (cursorX > 670 && cursorX < 710)) {
      // Linear ramp transition
      if (musicDbVal) musicDbVal.textContent = '-4 dB (Interpolating)';
      if (triggerStateVal) triggerStateVal.textContent = 'Transitioning';
    } else {
      // Baseline 100% volume zone
      if (musicDbVal) musicDbVal.textContent = '0 dB (100% Full)';
      if (triggerStateVal) triggerStateVal.textContent = 'Silent (Idle)';
    }

    requestAnimationFrame(soundstageTick);
  }

  requestAnimationFrame(soundstageTick);
});
