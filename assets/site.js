/* Formation Labs homepage: navigation, the scroll-driven journey (one continuous
   timeline), the "how it connects" sequence, the foundation diagram, domain tiles. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };

  /* ---- nav ---- */
  var nav = $('#nav'), links = $('#navLinks'), toggle = $('#navToggle');
  function onScroll() { nav.classList.toggle('solid', scrollY > 24); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (toggle) {
    toggle.addEventListener('click', function () { var open = links.classList.toggle('open'); toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    $$('a', links).forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }); });
  }
  /* the brand link and "top" anchors return to the opening state */
  $$('a[href="#top"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); history.replaceState(null, '', location.pathname); }); });

  /* ---- review helper: ?from=<section id> hides everything before that section ---- */
  var fromParam = location.search.match(/[?&]from=([a-z-]+)/);
  if (fromParam) { var hit = false; $$('main > section').forEach(function (sec) { if (sec.id === fromParam[1]) hit = true; if (!hit) sec.style.display = 'none'; }); }

  /* ---- reveal ---- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('pending'); e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 }) : null;
  $$('.rv').forEach(function (el) { if (io && !reduce) { el.classList.add('pending'); io.observe(el); } });

  /* ---- the region strip: the Atlas map on the homepage ---- */
  var strip = $('#homestrip'), stripHost = $('#homestripScene');
  if (strip && stripHost && window.FLScene && window.ATLAS_DOMAINS) (function () {
    var ANCH = { places: { x: 600, z: 34 }, cities: { x: 690, z: 30 }, structures: { x: 375, z: 27 }, ground: { x: 345, z: -24 }, movement: { x: 1100, z: 28 }, water: { x: -985, z: 110 }, energy: { x: -450, z: 60 }, 'building-systems': { x: 820, z: 146 }, materials: { x: 160, z: 28 }, construction: { x: 1215, z: 54 }, operations: { x: 478, z: 20 }, environment: { x: 1500, z: 10 }, digital: { x: 240, z: 50 }, governance: { x: 950, z: 60 } };
    var sc = window.FLScene.build(stripHost, { mode: 'atlas' }), hots = [];
    window.ATLAS_DOMAINS.domains.forEach(function (d) {
      var a = ANCH[d.id]; if (!a) return;
      var el = document.createElement('a'); el.className = 'hot'; el.href = 'atlas.html?d=' + d.id; el.textContent = d.name.split(',')[0].split(' and ')[0];
      strip.appendChild(el); hots.push({ el: el, x: a.x, z: a.z });
    });
    function place() {
      var r = stripHost.getBoundingClientRect(), a = r.width > 0 && r.height > 0 ? r.width / r.height : 3, ve = 2.4;
      var cam = { cx: 300, cz: 70, w: Math.max(2560, 230 * ve * a), ve: ve };
      sc.apply(cam);
      var h = cam.w / a, x0 = cam.cx - cam.w / 2, y0 = (400 - cam.cz * ve) - h / 2, placed = [];
      hots.slice().sort(function (p, q) { return p.x - q.x; }).forEach(function (hs) {
        var sx = (hs.x - x0) / cam.w * r.width, sy = ((400 - hs.z * ve) - y0) / h * r.height - 18, w = hs.el.offsetWidth || 70, g = 0;
        while (g++ < 8 && placed.some(function (p) { return Math.abs(p.x - sx) < (p.w + w) / 2 + 4 && Math.abs(p.y - sy) < 26; })) sy -= 28;
        placed.push({ x: sx, y: sy, w: w });
        hs.el.style.left = sx.toFixed(1) + 'px'; hs.el.style.top = sy.toFixed(1) + 'px';
        hs.el.style.display = sx > 24 && sx < r.width - 24 && sy > 20 ? '' : 'none';
      });
    }
    place(); addEventListener('resize', place); addEventListener('load', function () { sc.refresh(); place(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { sc.live(es[0].isIntersecting && !document.hidden); }).observe(stripHost);
  })();

  if (!window.FLScene) return;
  var S = window.FLScene;

  /* ================= the journey ================= */
  var journey = $('#journey'), host = $('#journeyScene'), frame = host ? host.parentNode : null;
  if (journey && host) (function () {
    var scene = S.build(host, { mode: 'journey' });
    var caps = $$('.station', journey), rail = $$('#rail button');
    var N = S.STATIONS.length, cur = -1, lastP = -1;
    function aspect() { var r = host.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? r.width / r.height : 1.6; }
    if (!reduce && !location.search.match(/[?&]fix=/)) {
      scene.svg.classList.add('pre');
      requestAnimationFrame(function () { requestAnimationFrame(function () { scene.svg.classList.remove('pre'); }); });
    }
    function setStation(k) {
      if (k === cur) return;
      cur = k;
      scene.setStation(k);
      rail.forEach(function (b) { b.setAttribute('aria-current', +b.dataset.station === k ? 'true' : 'false'); });
    }
    /* seg = progress * (N-1). Camera and every layer are pure functions of seg, so scrolling
       back, scrolling fast, and stopping anywhere all resolve to one coherent state. */
    function renderAt(seg) {
      var k = clamp(Math.floor(seg), 0, N - 2), t = seg - k, a = aspect();
      var hold = .1, e = smooth((t - hold) / (1 - 2 * hold));
      if (reduce) e = t < .5 ? 0 : 1;
      var ws = [];
      for (var i = 0; i < N; i++) {
        var d = Math.abs(seg - i), w = reduce ? (d < .5 ? 1 : 0) : smooth(1 - d / .42);
        ws.push(w);
        frame.style.setProperty('--w' + i, w.toFixed(3));
      }
      frame.style.setProperty('--hero', (reduce ? (seg < .5 ? 1 : 0) : smooth(1 - seg / .3)).toFixed(3));
      scene.setWeights(ws);
      setStation(Math.round(clamp(seg, 0, N - 1)));
      scene.apply(S.lerp(S.viewFor(k, a), S.viewFor(k + 1, a), e));
      caps.forEach(function (c) { var i = +c.dataset.station; c.classList.toggle('on', ws[i] > .02); });
    }
    function progress() { var total = journey.offsetHeight - innerHeight; return total > 0 ? clamp(-journey.getBoundingClientRect().top / total, 0, 1) : 0; }
    function render() { var p = progress(); if (p === lastP) return; lastP = p; renderAt(p * (N - 1)); }
    var ticking = false;
    function onScrollJ() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; render(); }); } }
    addEventListener('scroll', onScrollJ, { passive: true });
    addEventListener('resize', function () { lastP = -1; scene.refresh(); render(); });
    addEventListener('load', function () { lastP = -1; scene.refresh(); render(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { scene.live(es[0].isIntersecting && !document.hidden); }).observe(host);
    document.addEventListener('visibilitychange', function () { if (document.hidden) scene.live(false); });

    function goTo(k) {
      var total = journey.offsetHeight - innerHeight, top = journey.offsetTop + total * (k / (N - 1));
      scrollTo({ top: Math.round(top), behavior: reduce ? 'auto' : 'smooth' });
    }
    rail.forEach(function (b) { b.addEventListener('click', function () { goTo(+b.dataset.station); }); });
    var next = $('#journeyNext'); if (next) next.addEventListener('click', function () { goTo(Math.min(N - 1, cur + 1)); });
    addEventListener('keydown', function (e) {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      var r = journey.getBoundingClientRect();
      if (r.bottom < innerHeight * .5 || r.top > innerHeight * .5) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.min(N - 1, cur + 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.max(0, cur - 1)); }
    });
    var fix = location.search.match(/[?&]fix=([0-9.]+)/);
    if (fix) { document.documentElement.classList.add('review'); render = function () { renderAt(clamp(+fix[1], 0, N - 1)); }; addEventListener('load', render); }
    var deep = location.search.match(/[?&]st=([0-7])/);
    if (deep) requestAnimationFrame(function () { goTo(+deep[1]); });
    render();
    window.__journey = { renderAt: renderAt, goTo: goTo, N: N, progress: progress };
  })();

  /* ================= how it connects: six steps on the crossing ================= */
  var ch = $('#connectScene');
  if (ch) (function () {
    var scene = S.build(ch, { mode: 'connect' });
    var steps = $$('#connectSteps button'), note = $('#connectNote'), evid = $('#connectEvidence');
    var VARS = ['src', 'reg', 'model', 'chg', 'flags', 'evid'];
    var D = .35, STATES = [
      { src: 1 }, { src: D, reg: 1 }, { src: D, reg: D, model: 1 }, { src: D, reg: D, model: D, chg: 1 },
      { src: D, reg: D, model: D, chg: D, flags: 1 }, { src: D, reg: D, model: D, chg: D, flags: D, evid: 1 }
    ];
    var cur = -1;
    function cam() { var r = ch.getBoundingClientRect(), a = r.width > 0 && r.height > 0 ? r.width / r.height : 2; return { cx: a < 1.1 ? 392 : 380, cz: a < 1.1 ? 8 : 6, w: a < 1.1 ? 180 : 200, ve: 1 }; }
    function set(k) {
      if (k === cur) return; cur = k;
      var st = STATES[k];
      VARS.forEach(function (v) { ch.style.setProperty('--' + v, st[v] ? String(st[v]) : '0'); });
      steps.forEach(function (b, i) { b.setAttribute('aria-selected', i === k ? 'true' : 'false'); b.classList.toggle('done', i < k); });
      if (note) note.textContent = steps[k].getAttribute('data-note') || '';
      if (evid) evid.classList.toggle('show', k === 5);
    }
    scene.apply(cam()); scene.live(true);
    steps.forEach(function (b, i) { b.addEventListener('click', function () { set(i); }); });
    var prev = $('#connectPrev'), nxt = $('#connectNext');
    if (prev) prev.addEventListener('click', function () { set(Math.max(0, cur - 1)); });
    if (nxt) nxt.addEventListener('click', function () { set(Math.min(5, cur + 1)); });
    addEventListener('resize', function () { scene.apply(cam()); scene.refresh(); });
    addEventListener('load', function () { scene.apply(cam()); scene.refresh(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { scene.live(es[0].isIntersecting && !document.hidden); }).observe(ch);
    var cs = location.search.match(/[?&]cs=([0-5])/);
    set(cs ? +cs[1] : 0);
  })();

  /* ---- foundation diagram ---- */
  var fh = $('#foundationFig');
  if (fh) {
    var W = 1000, H = 400, o = '';
    var T = function (x, y, s, cls, extra) { return '<text x="' + x + '" y="' + y + '" class="' + (cls || '') + '" ' + (extra || '') + '>' + s + '</text>'; };
    o += T(0, 18, 'A', 'k') + T(16, 18, 'RESEARCH AND CODES', 'k') + T(0, 46, 'Published knowledge', 'h');
    [['Design codes and standards', 0], ['Journal papers and theses', 1], ['Test standards and reports', 2], ['The judgment of senior engineers', 3]].forEach(function (s, i) {
      var y = 72 + i * 58, x = 8 + i * 6;
      o += '<rect x="' + x + '" y="' + y + '" width="230" height="44" fill="var(--paper)" stroke="var(--ink)" stroke-width="1"/>';
      for (var j = 0; j < 3; j++) o += '<rect x="' + (x + 12) + '" y="' + (y + 24 + j * 6) + '" width="' + (150 - j * 40) + '" height="2" fill="var(--line)"/>';
      o += T(x + 12, y + 16, s[0], '', 'font-size="12.5" fill="var(--ink)"');
    });
    var bx = 330, by = 60, bw = 300, bh = 240;
    o += T(bx, 18, 'B', 'k') + T(bx + 16, 18, 'EXPERIMENTAL DATA', 'k') + T(bx, 46, 'Physical tests', 'h');
    o += '<line x1="' + bx + '" y1="' + (by + bh) + '" x2="' + (bx + bw) + '" y2="' + (by + bh) + '" stroke="var(--ink)" stroke-width="1"/><line x1="' + bx + '" y1="' + by + '" x2="' + bx + '" y2="' + (by + bh) + '" stroke="var(--ink)" stroke-width="1"/>';
    o += T(bx + bw, by + bh + 14, 'deflection', '', 'text-anchor="end" font-size="11"') + T(bx - 4, by + 10, 'load', '', 'text-anchor="end" font-size="11"');
    function curve(t) { var y; if (t < .14) y = t / .14 * .92; else if (t < .2) y = .92 - (t - .14) / .06 * .3; else y = .62 + .1 * Math.sin((t - .2) * 9) * Math.exp(-(t - .2) * 2.5) - (t - .2) * .32; return Math.max(.05, y); }
    var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (var sp = 0; sp < 3; sp++) { var pts = []; for (var i = 0; i <= 60; i++) { var t = i / 60, v = curve(t) * (1 + (sp - 1) * .05) + (rnd() - .5) * .035; pts.push((bx + 8 + t * (bw - 16)).toFixed(1) + ',' + (by + bh - 10 - v * (bh - 30)).toFixed(1)); } o += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--ink-3)" stroke-width="1" opacity=".7"/>'; }
    var fit = []; for (i = 0; i <= 80; i++) { t = i / 80; fit.push((bx + 8 + t * (bw - 16)).toFixed(1) + ',' + (by + bh - 10 - curve(t) * (bh - 30)).toFixed(1)); }
    o += '<polyline points="' + fit.join(' ') + '" fill="none" stroke="var(--accent)" stroke-width="2.2"/>';
    o += T(bx + 10, by + bh + 34, 'measured, three specimens', '', 'font-size="11"') + '<line x1="' + (bx + 200) + '" y1="' + (by + bh + 30) + '" x2="' + (bx + 220) + '" y2="' + (by + bh + 30) + '" stroke="var(--accent)" stroke-width="2.2"/>' + T(bx + 226, by + bh + 34, 'fitted model', '', 'font-size="11"');
    var cx = 670;
    o += T(cx, 18, 'C', 'k') + T(cx + 16, 18, 'VERIFIED METHOD', 'k') + T(cx, 46, 'What the system is allowed to compute', 'h');
    o += '<rect x="' + cx + '" y="62" width="330" height="238" fill="var(--paper-2)" stroke="var(--ink)" stroke-width="1.2"/>';
    [['method', 'deterministic, versioned'], ['derived from', 'A and B, cited line by line'], ['benchmark', 'reference cases, tolerances'], ['verifier', 'named engineer, date, scope'], ['provenance', 'inputs, version, run record'], ['outside scope', 'it stops and says so']].forEach(function (r, i) {
      var y = 90 + i * 36;
      o += T(cx + 14, y, r[0], '', 'font-size="11" fill="var(--ink-3)"') + T(cx + 120, y, r[1], '', 'font-size="12.5" fill="var(--ink)"');
      if (i < 5) o += '<line x1="' + (cx + 14) + '" y1="' + (y + 12) + '" x2="' + (cx + 316) + '" y2="' + (y + 12) + '" stroke="var(--line-2)"/>';
    });
    o += '<defs><marker id="fdarr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink)"/></marker></defs>';
    o += '<line x1="256" y1="180" x2="322" y2="180" stroke="var(--ink)" stroke-width="1.2" marker-end="url(#fdarr)"/><line x1="636" y1="180" x2="662" y2="180" stroke="var(--ink)" stroke-width="1.2" marker-end="url(#fdarr)"/>';
    o += T(289, 168, 'read', '', 'text-anchor="middle" font-size="11"') + T(649, 168, 'fit', '', 'text-anchor="middle" font-size="11"');
    o += '<path d="M835,300 V352 H500 V368" fill="none" stroke="var(--accent)" stroke-width="1.4" marker-end="url(#fdarr)"/>';
    o += T(500, 392, 'applied to the region above, with its paper trail', 'acc', 'text-anchor="middle" font-size="12.5"');
    fh.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Diagram: published research and codes, plus physical test data, are fitted into a verified, versioned method with a benchmark, a named verifier, and provenance on every value">' + o + '</svg>';
  }
})();
