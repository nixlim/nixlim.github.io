(function () {
  'use strict';

  // Respect prefers-reduced-motion
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) return;

  var canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var fontSize = 14;
  var columns;
  var drops;
  var lastFrame = 0;
  var frameInterval = 1000 / 20; // ~20fps cap

  // Katakana + digits character set
  var chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = [];
    for (var i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
  }

  function draw(timestamp) {
    if (prefersReducedMotion.matches) return;

    if (timestamp - lastFrame < frameInterval) {
      requestAnimationFrame(draw);
      return;
    }
    lastFrame = timestamp;

    // Semi-transparent black to create fade trail
    ctx.fillStyle = 'rgba(10, 10, 10, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(0, 255, 65, 0.04)';
    ctx.font = fontSize + 'px monospace';

    for (var i = 0; i < columns; i++) {
      var char = chars[Math.floor(Math.random() * chars.length)];
      var x = i * fontSize;
      var y = drops[i] * fontSize;

      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    requestAnimationFrame(draw);
  }

  resize();
  requestAnimationFrame(draw);

  window.addEventListener('resize', resize);

  // Listen for motion preference changes
  prefersReducedMotion.addEventListener('change', function () {
    if (!prefersReducedMotion.matches) {
      requestAnimationFrame(draw);
    }
  });
})();
