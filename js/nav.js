// Single source of truth for the skip link, site header and footer.
// To add a page, add one line to PAGES. `also` lists child pages that
// should highlight this item (e.g. a project detail page).
// The site name is the link home, so the home page has no line of its own.
(function () {
  var PAGES = [
    { label: 'Projects', href: 'projects.html', also: ['interlude.html', 'hd60.html'] },
    { label: 'Tom', href: 'tribute.html' }
    // { label: 'Professional', href: 'professional.html' },
  ];

  // GitHub Pages serves both /projects and /projects.html, so compare without the extension
  function bare(href) { return href.replace(/\.html$/, ''); }
  var current = bare(location.pathname.split('/').pop() || 'index.html');
  function isActive(p) {
    return bare(p.href) === current || (p.also || []).map(bare).indexOf(current) !== -1;
  }

  // Theme: dark unless the visitor has picked light (the inline script in <head> applies it before paint)
  var root = document.documentElement;
  function isDark() { return root.getAttribute('data-theme') !== 'light'; }

  // Skip link: the first thing a keyboard reaches on every page
  var skip = document.createElement('a');
  skip.className = 'skip-link';
  // The full address, because the 404 page's <base href="/"> would send a bare #main home
  skip.href = location.href.split('#')[0] + '#main';
  skip.textContent = 'Skip to content';

  var header = document.createElement('header');
  header.className = 'site-header';

  var name = document.createElement('a');
  name.className = 'site-name';
  name.href = 'index.html';
  name.textContent = 'benbull.org';
  if (current === 'index') name.setAttribute('aria-current', 'page');
  header.appendChild(name);

  var nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('aria-label', 'Main');

  PAGES.forEach(function (p) {
    var a = document.createElement('a');
    a.href = p.href;
    a.textContent = p.label;
    if (isActive(p)) a.setAttribute('aria-current', 'page');
    nav.appendChild(a);
  });

  var contact = document.createElement('a');
  contact.href = '#';
  contact.className = 'nav-cta';
  contact.textContent = 'Write to me';
  contact.addEventListener('click', function (e) {
    e.preventDefault();
    var user = 'hellofromtheinternet.adwjuntact';
    var domain = 'passmail.net';
    window.location.href = 'mailto:' + user + '@' + domain;
  });
  nav.appendChild(contact);

  // A pill that names the mode it switches to; js/wind.js watches data-theme to repaint
  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'pill theme-toggle';
  function label() {
    toggle.textContent = isDark() ? 'Light mode' : 'Dark mode';
    toggle.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
  }
  toggle.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    if (next === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem('theme', next); } catch (e) {}
    label();
  });
  label();
  nav.appendChild(toggle);

  header.appendChild(nav);
  document.body.insertBefore(header, document.body.firstChild);
  document.body.insertBefore(skip, header);

  // Footer: an honest note, when the site last changed, and the fish
  var footer = document.createElement('footer');
  footer.className = 'site-footer';

  var note = document.createElement('span');
  var updated = new Date(document.lastModified);
  var when = isNaN(updated) ? '' : 'Last updated ' + updated.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  note.textContent = 'No ads, no feeds, just a quiet visit counter.' + (when ? ' · ' + when : '');
  footer.appendChild(note);

  // Pages marked "quiet" (the Tom page) keep the footer plain: no counter line, no fish
  if (document.body.classList.contains('quiet')) {
    note.textContent = when;
  } else {
    var fish = document.createElement('a');
    fish.className = 'fish';
    fish.href = 'twister.html';
    fish.setAttribute('aria-label', 'Something swims here');
    fish.textContent = '><(((º>';
    footer.appendChild(fish);
  }

  document.body.appendChild(footer);
})();
