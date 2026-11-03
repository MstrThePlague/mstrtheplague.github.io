// The home page's "Hello.": a landscape clip seen through the letters, a different one each visit.
// To add a clip, put a short muted mp4 (and a poster frame) in videos/ and add a line to CLIPS.
(function () {
  // Landscape clips are from Pexels (free to use, no credit required), credited here anyway
  var CLIPS = [
    { src: 'videos/hello-1.mp4', poster: 'videos/hello-1.jpg', place: 'waves on a rocky shore, from above' },
    { src: 'videos/monument-1.mp4', poster: 'videos/monument-1.jpg', place: 'Monument Valley, Arizona' }, // Chrystofer Santana
    { src: 'videos/highlands-1.mp4', poster: 'videos/highlands-1.jpg', place: 'a misty glen in the Scottish Highlands' }, // Dominik Gryzbon
    { src: 'videos/highlands-2.mp4', poster: 'videos/highlands-2.jpg', place: 'Glen Coe, Scotland' }, // Ben Blight
    { src: 'videos/iceland-1.mp4', poster: 'videos/iceland-1.jpg', place: 'the Icelandic highlands' }, // Rui Veiga
    { src: 'videos/iceland-2.mp4', poster: 'videos/iceland-2.jpg', place: 'a glacier in Iceland' } // Gylfi Gylfason
  ];

  var frame = document.getElementById('hello-frame');
  if (!frame) return;
  var video = document.getElementById('hello-video');
  var mask = document.getElementById('hello-mask');
  var caption = document.getElementById('hello-place');

  var clip = CLIPS[Math.floor(Math.random() * CLIPS.length)];
  video.poster = clip.poster;
  video.src = clip.src;
  if (caption) caption.textContent = clip.place;

  // Leave the clip on its first frame for visitors who prefer less motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.removeAttribute('autoplay');
  } else {
    video.play().catch(function () {});
  }

  // The canvas sits over the video like a stencil: it paints the page colour everywhere except
  // the letters of "Hello", then a solid full stop. (A video inside SVG isn't clipped on iOS.)
  var TEXT = 'Hello.';
  var SIZE = 300;
  var SPACING = -0.04 * SIZE;
  var FONT = '400 ' + SIZE + 'px "Instrument Serif", Georgia, serif';
  var PAD = 4;

  function draw() {
    var root = getComputedStyle(document.documentElement);
    var ctx = mask.getContext('2d');
    ctx.font = FONT;

    // Each letter's position, keeping the font's kerning and the tighter letter spacing
    var xs = [];
    for (var i = 0; i < TEXT.length; i++) xs.push(ctx.measureText(TEXT.slice(0, i)).width + i * SPACING);
    var m = ctx.measureText(TEXT);
    var ascent = Math.ceil(m.actualBoundingBoxAscent), descent = Math.ceil(m.actualBoundingBoxDescent);
    var w = Math.ceil(xs[TEXT.length - 1] + ctx.measureText('.').width) + PAD * 2;
    var h = ascent + descent + PAD * 2;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    mask.width = w * dpr;
    mask.height = h * dpr;
    frame.style.maxWidth = w + 'px';
    frame.style.aspectRatio = w + ' / ' + h;

    ctx = mask.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = FONT;
    ctx.textBaseline = 'alphabetic';
    var baseline = PAD + ascent;

    ctx.fillStyle = root.getPropertyValue('--bg').trim();
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'destination-out';
    for (i = 0; i < TEXT.length - 1; i++) ctx.fillText(TEXT[i], PAD + xs[i], baseline);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = root.getPropertyValue('--dot').trim();
    ctx.fillText('.', PAD + xs[TEXT.length - 1], baseline);

    frame.classList.add('ready');
  }

  var fontReady = document.fonts && document.fonts.load ? document.fonts.load(FONT) : Promise.resolve();
  fontReady.then(draw, draw);

  // Repaint the stencil when the visitor switches between light and dark
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
