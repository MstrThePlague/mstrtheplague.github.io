(function () {
  var canvas = document.getElementById('particles');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SPACING = 30;      // grid gap between particles
  var RADIUS = 190;      // cursor influence radius
  var PUSH = 55;         // max displacement from home
  var dpr, w, h, parts = [];
  var mouse = { x: -9999, y: -9999, active: 0 };

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    parts = [];
    for (var y = SPACING / 2; y < h; y += SPACING) {
      for (var x = SPACING / 2; x < w; x += SPACING) {
        parts.push({
          hx: x, hy: y, x: x, y: y, vx: 0, vy: 0,
          a: Math.random() * Math.PI * 2,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    mouse.active *= 0.985; // fade influence when the mouse stops/leaves
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.6;

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      // gentle idle drift
      var tx = p.hx + Math.cos(t / 2200 + p.phase) * 3;
      var ty = p.hy + Math.sin(t / 2600 + p.phase) * 3;

      var dx = p.x - mouse.x, dy = p.y - mouse.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      var k = 0;
      if (d < RADIUS) {
        k = (1 - d / RADIUS);
        k = k * k * mouse.active;
        // push away from cursor, with a slight swirl
        var nx = dx / (d || 1), ny = dy / (d || 1);
        tx += (nx * 0.85 - ny * 0.5) * PUSH * k;
        ty += (ny * 0.85 + nx * 0.5) * PUSH * k;
      }

      // spring toward target
      p.vx = (p.vx + (tx - p.x) * 0.08) * 0.82;
      p.vy = (p.vy + (ty - p.y) * 0.08) * 0.82;
      p.x += p.vx;
      p.y += p.vy;

      // dashes point around the cursor when near, otherwise rest horizontal-ish
      var target = k > 0.01 ? Math.atan2(mouse.y - p.y, mouse.x - p.x) + Math.PI / 2 : p.phase * 0.15;
      var da = target - p.a;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      p.a += da * (0.12 + k * 0.2);

      var len = 3 + k * 9;
      var hue = 215 + k * 130 + Math.sin(t / 3000 + p.phase) * 10; // blue -> magenta/orange
      var alpha = 0.16 + k * 0.8;
      ctx.strokeStyle = 'hsla(' + hue + ',' + (25 + k * 70) + '%,' + (62 + k * 8) + '%,' + alpha + ')';
      var ox = Math.cos(p.a) * len / 2, oy = Math.sin(p.a) * len / 2;
      ctx.beginPath();
      ctx.moveTo(p.x - ox, p.y - oy);
      ctx.lineTo(p.x + ox, p.y + oy);
      ctx.stroke();
    }
    if (!reduced) requestAnimationFrame(frame);
  }

  function move(x, y) {
    mouse.x = x; mouse.y = y; mouse.active = 1;
  }
  window.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); });
  window.addEventListener('touchmove', function (e) {
    var t = e.touches[0]; if (t) move(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('mouseleave', function () { mouse.active = 0; });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { build(); if (reduced) frame(0); }, 150);
  });

  build();
  requestAnimationFrame(frame);
})();
