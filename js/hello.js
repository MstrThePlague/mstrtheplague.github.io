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

  var svg = document.getElementById('hello-svg');
  if (!svg) return;
  // The video shows through "Hello" only; a hidden "Hello." gives the size and where the full stop goes
  var letters = document.getElementById('hello-measure');
  var frame = document.getElementById('hello-frame');
  var video = document.getElementById('hello-video');
  var dot = document.getElementById('hello-dot');
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

  // Fit the SVG to the letters, so "Hello." sits at its natural size
  function fit() {
    var b = letters.getBBox();
    if (!b.width) return;
    var x = Math.floor(b.x), y = Math.floor(b.y), w = Math.ceil(b.width), h = Math.ceil(b.height);
    svg.setAttribute('viewBox', x + ' ' + y + ' ' + w + ' ' + h);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    // Inset the video slightly: browsers can let its edge show past the clip, and no letter reaches the box edge
    frame.setAttribute('x', x + 3);
    frame.setAttribute('y', y + 3);
    frame.setAttribute('width', w - 6);
    frame.setAttribute('height', h - 6);
    // Paint the full stop in colour, exactly over the one in the letters
    dot.setAttribute('x', letters.getStartPositionOfChar(5).x);
    dot.removeAttribute('visibility');
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); else fit();
})();
