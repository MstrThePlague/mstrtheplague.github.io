// The home page's wind: streamlines drifting across a flow field behind the header and "Hello.",
// swirling round the pointer. It flows straight behind the text, never around it.
(function () {
  var hero = document.querySelector('.hero');
  var button = document.querySelector('.wind-toggle');
  var c = document.createElement('canvas');
  if (!hero || !c.getContext) return;

  // Dim on purpose: where a streak passes behind the text, ink still clears 4.5:1
  var PALETTES = {
    dark: { bg: '#0b100f', fade: 'rgba(11,16,15,0.06)', wind: 'rgba(72,92,83,0.75)' },
    light: { bg: '#f2f4f1', fade: 'rgba(242,244,241,0.06)', wind: 'rgba(160,176,168,0.75)' }
  };
  var root = document.documentElement;
  function palette() { return root.getAttribute('data-theme') === 'light' ? PALETTES.light : PALETTES.dark; }

  c.className = 'wind';
  c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);

  var ctx = c.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, P = [];
  var mouse = { x: -9999, y: -9999 };
  var pal = palette();
  var paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var onScreen = true;
  var raf = 0;

  function seed(p) {
    p.x = Math.random() * W; p.y = Math.random() * H; p.life = 80 + Math.random() * 260;
    return p;
  }
  function clear() { ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, W, H); }

  // The canvas runs from the top of the page to the bottom of the hero, under the header too
  function size() {
    var w = Math.max(1, document.documentElement.clientWidth);
    var h = Math.max(1, Math.round(hero.getBoundingClientRect().bottom + window.scrollY));
    if (w === W && h === H) return false;
    W = w; H = h;
    c.style.height = H + 'px';
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    clear();
    var want = Math.min(2400, Math.round(W * H / 700));
    P = [];
    for (var i = 0; i < want; i++) P.push(seed({}));
    return true;
  }

  function step(t) {
    ctx.fillStyle = pal.fade;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = pal.wind;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      var a = Math.sin(p.x * 0.0021 + t * 0.00011) * 1.3
            + Math.cos(p.y * 0.0027 - t * 0.00007) * 1.3
            + Math.sin((p.x + p.y) * 0.0012 + t * 0.00005);
      var vx = Math.cos(a) * 1.2 + 0.7, vy = Math.sin(a) * 1.2;
      // Within 280px of the pointer the wind turns and circles it
      var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 78400) {
        var d = Math.sqrt(d2) + 1, s = (1 - d / 280) * 4;
        vx += (-dy / d) * s - (dx / d) * s * 0.3;
        vy += (dx / d) * s - (dy / d) * s * 0.3;
      }
      ctx.moveTo(p.x, p.y);
      p.x += vx; p.y += vy; p.life--;
      ctx.lineTo(p.x, p.y);
      if (p.life < 0 || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) seed(p);
    }
    ctx.stroke();
  }

  // A still frame: a few seconds of wind drawn at once, for when it's paused
  function still() { clear(); for (var k = 0; k < 220; k++) step(k * 16); }

  function loop(t) {
    step(t);
    raf = requestAnimationFrame(loop);
  }
  // Only animate while it's running and the hero is on screen
  function update() {
    var run = !paused && onScreen;
    if (run && !raf) raf = requestAnimationFrame(loop);
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  function label() {
    if (!button) return;
    button.textContent = paused ? 'Start the wind' : 'Pause the wind';
    button.setAttribute('aria-pressed', paused ? 'true' : 'false');
  }

  size();
  if (paused) still();
  label();
  update();

  if (button) {
    button.hidden = false;
    button.addEventListener('click', function () {
      paused = !paused;
      label();
      update();
    });
  }

  function resized() { if (size() && paused) still(); }
  window.addEventListener('resize', resized);
  if (window.ResizeObserver) new ResizeObserver(resized).observe(hero);
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      update();
    }).observe(hero);
  }

  document.addEventListener('pointermove', function (e) {
    var r = c.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  document.addEventListener('pointerout', function (e) {
    if (!e.relatedTarget) { mouse.x = -9999; mouse.y = -9999; }
  });

  // Repaint in the new colours when the visitor switches between light and dark
  new MutationObserver(function () {
    pal = palette();
    if (paused) still(); else clear();
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();
