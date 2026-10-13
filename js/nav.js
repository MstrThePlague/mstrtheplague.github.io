// Single source of truth for site navigation.
// To add a page, add one line to PAGES. `also` lists child pages that
// should highlight this item (e.g. a project detail page).
(function () {
  var PAGES = [
    { label: 'Home', href: 'index.html' },
    { label: 'Projects', href: 'projects.html', also: ['interlude.html'] },
    { label: 'In memory of Tom', href: 'tribute.html' }
    // { label: 'Professional', href: 'professional.html' },
  ];

  var current = location.pathname.split('/').pop() || 'index.html';
  function isActive(p) {
    return p.href === current || (p.also || []).indexOf(current) !== -1 ||
      (current === '' && p.href === 'index.html');
  }

  var active = PAGES.filter(isActive)[0] || PAGES[0];

  var nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('aria-label', 'Main');

  var toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'nav-links');
  toggle.setAttribute('aria-label', 'Menu');
  toggle.innerHTML = '<span class="nav-current"></span><span class="nav-icon" aria-hidden="true"></span>';
  toggle.querySelector('.nav-current').textContent = active.label;

  var links = document.createElement('div');
  links.className = 'nav-links';
  links.id = 'nav-links';

  PAGES.forEach(function (p) {
    var a = document.createElement('a');
    a.href = p.href;
    a.textContent = p.label;
    if (p === active) { a.className = 'active'; a.setAttribute('aria-current', 'page'); }
    links.appendChild(a);
  });

  var contact = document.createElement('a');
  contact.href = '#';
  contact.id = 'contact';
  contact.className = 'nav-cta';
  contact.textContent = 'Reach out';
  contact.addEventListener('click', function (e) {
    e.preventDefault();
    var user = 'hellofromtheinternet.adwjuntact';
    var domain = 'passmail.net';
    window.location.href = 'mailto:' + user + '@' + domain;
  });
  links.appendChild(contact);

  nav.appendChild(toggle);
  nav.appendChild(links);
  document.body.appendChild(nav);

  function setOpen(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); }
  });
  links.addEventListener('click', function () { setOpen(false); });
})();
