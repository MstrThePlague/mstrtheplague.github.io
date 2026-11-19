// Brings the Home app previews on home.html to life with the demo's made-up data: the heat
// pump switches between the radiators and the tank, Control changes a setting now and then,
// Reports counts up and flips between Month and Year, and the Teletext clock ticks. Each phone
// only runs while it's on screen. With less motion asked for, everything stays as first drawn.
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phones = Array.prototype.slice.call(document.querySelectorAll('.hd-phone'));
  if (!phones.length) return;

  // Each phone's tick runs once a second while it's visible.
  var ticks = [];
  function every(phone, fn) {
    ticks.push({ phone: phone, fn: fn });
  }

  function field(root, name) {
    return root.querySelector('[data-f="' + name + '"]');
  }

  function set(root, name, text) {
    var el = field(root, name);
    if (el && el.textContent !== text) el.textContent = text;
  }

  // Greeting by the visitor's own time of day, as the app does.
  var hour = new Date().getHours();
  var greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  document.querySelectorAll('[data-greeting]').forEach(function (el) {
    el.textContent = greeting;
  });

  // The heat pump: ten seconds on the radiators while the tank cools a little, then on the tank
  // until it's back to 50°.
  function heatPump(phone) {
    var system = phone.querySelector('.hd-system');
    if (!system) return;
    var svg = system.querySelector('svg');
    var s = { mode: 'radiators', t: 0, tank: 49, room: 20.5 };
    var MODES = {
      radiators: { hz: 36, out: '38.5°', back: '33.5°' },
      tank: { hz: 44, out: '52.0°', back: '47.5°' },
    };

    function draw() {
      var m = MODES[s.mode];
      system.setAttribute('data-mode', s.mode);
      system.style.setProperty('--fan', Math.min(4, 36 / m.hz).toFixed(2) + 's');
      system.style.setProperty('--flow', Math.max(0.5, 1.6 - m.hz / 60).toFixed(2) + 's');
      svg.style.setProperty('--level', Math.min(1, (s.tank - 20) / 40).toFixed(3));
      set(phone, 'hz', m.hz + ' Hz');
      set(phone, 'out', m.out);
      set(phone, 'back', m.back);
      set(phone, 'tank', s.tank.toFixed(1) + '°');
      set(phone, 'reading', s.tank + '°');
      set(phone, 'room', s.room.toFixed(1));
      set(phone, 'below', (21 - s.room).toFixed(1));
      set(phone, 'words', s.mode === 'radiators'
        ? 'The compressor is running at ' + m.hz + ' Hz and the pump is sending the water to the radiators. The radiators took 5.0° out of the water.'
        : 'The compressor is running at ' + m.hz + ' Hz and the pump is sending the water to the tank. The radiators wait while the tank heats.');
      var note = field(phone, 'tanknote');
      if (note) note.hidden = s.tank < 49;
    }

    every(phone, function () {
      s.t++;
      if (s.mode === 'radiators') {
        if (s.t === 4 || s.t === 8) s.tank--;
        if (s.t === 5) s.room = 20.6;
        if (s.t >= 10) {
          s.mode = 'tank';
          s.t = 0;
          s.room = 20.5;
        }
      } else if (s.tank < 50) {
        if (s.t % 2 === 0) s.tank++;
      } else if (s.t > 8) {
        s.mode = 'radiators';
        s.t = 0;
      }
      draw();
    });
  }

  // Control: someone changes something every few seconds, and the row lights up as if tapped.
  function control(phone) {
    var steps = [
      ['room1', 'Off'],
      ['lounge', 'Heat · 21°'],
      ['heating', 'Room · 21.5°'],
      ['room1', 'All on at 31%'],
      ['lounge', 'Off'],
      ['heating', 'Room · 21.0°'],
    ];
    var i = 0;
    var t = 0;
    every(phone, function () {
      if (++t % 3) return;
      var step = steps[i++ % steps.length];
      var value = field(phone, step[0]);
      if (!value) return;
      var row = value.closest('.hd-row');
      row.classList.add('hd-tap');
      setTimeout(function () {
        row.classList.remove('hd-tap');
        value.textContent = step[1];
        value.classList.remove('hd-changed');
        void value.offsetWidth;
        value.classList.add('hd-changed');
      }, 350);
    });
  }

  // Reports: the figures count up, then it flips between this month and this year.
  function reports(phone) {
    var PERIODS = {
      month: {
        label: 'November 2026', span: '1 November to 18 November so far', what: 'month',
        cop: 3.07, used: 217, heat: 668, cost: 47.84, water: 10,
      },
      year: {
        label: '2026', span: '1 January to 18 November so far', what: 'year',
        cop: 3.32, used: 2140, heat: 7105, cost: 512.4, water: 18,
      },
    };
    var seg = phone.querySelector('.hd-seg');
    var period = 'month';
    var t = 0;
    var started = false;

    function number(value, decimals) {
      return value.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }

    function show(p, fraction) {
      var f = fraction == null ? 1 : fraction;
      set(phone, 'cop', number(p.cop * f, 2));
      set(phone, 'cop2', number(p.cop, 2));
      set(phone, 'used', number(Math.round(p.used * f), 0) + ' kWh');
      set(phone, 'heat', number(Math.round(p.heat * f), 0) + ' kWh');
      set(phone, 'cost', '£' + number(p.cost * f, 2));
      set(phone, 'water', Math.round(p.water * f) + '%');
    }

    function countUp(p) {
      var start = null;
      function frame(now) {
        if (start == null) start = now;
        var x = Math.min(1, (now - start) / 1100);
        show(p, 1 - Math.pow(1 - x, 3));
        if (x < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    function flip(to) {
      var p = PERIODS[to];
      period = to;
      seg.setAttribute('data-period', to);
      set(phone, 'label', p.label);
      set(phone, 'span', p.span);
      set(phone, 'what', p.what);
      set(phone, 'earlier', number(p.cop, 2) + ' over the same days a year earlier.');
      countUp(p);
    }

    every(phone, function () {
      if (!started) {
        started = true;
        countUp(PERIODS.month);
        return;
      }
      if (++t % 7 === 0) flip(period === 'month' ? 'year' : 'month');
    });
  }

  // Teletext's clock, as the app shows it.
  function clock(phone) {
    var el = field(phone, 'clock');
    if (!el) return;
    function draw() {
      var d = new Date();
      var day = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '');
      var time = d.toLocaleTimeString('en-GB', { hour12: false });
      el.textContent = day + ' ' + time;
    }
    draw();
    every(phone, draw);
  }

  phones.forEach(function (phone) {
    var kind = phone.getAttribute('data-demo');
    if (kind === 'teletext') clock(phone);
    if (reduced) return;
    if (kind === 'now' || kind === 'teletext') heatPump(phone);
    if (kind === 'control') control(phone);
    if (kind === 'reports') reports(phone);
  });

  // Run only the phones on screen, and pause the CSS animations of the rest.
  var visible = new Set();
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
        entry.target.classList.toggle('hd-paused', !entry.isIntersecting);
      });
    });
    phones.forEach(function (phone) {
      observer.observe(phone);
    });
  } else {
    phones.forEach(function (phone) {
      visible.add(phone);
    });
  }

  setInterval(function () {
    if (document.hidden) return;
    ticks.forEach(function (tick) {
      if (visible.has(tick.phone)) tick.fn();
    });
  }, 1000);
})();
