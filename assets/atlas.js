/* Knowledge Atlas: overview, three perspectives, search, selection, detail, list view.
   State lives in the URL: ?p=world|knowledge|lifecycle&d=<domain>&n=<node>&s=<stage>&v=list */
(function () {
  'use strict';
  var A = window.ATLAS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/ \(advanced\)/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = $('#atlasApp');
  if (!root) return;
  if (!A || !A.nodes) { root.innerHTML = '<p class="empty">The Atlas data did not load. Reload the page, or open the contributor form to see the full list of sections.</p>'; return; }

  /* ---- indexes ---- */
  var byId = {}, children = {}, domById = {};
  A.nodes.forEach(function (n) { byId[n.id] = n; });
  A.nodes.forEach(function (n) { var p = n.parent || ('domain:' + n.domain); (children[p] = children[p] || []).push(n); });
  A.domains.forEach(function (d) { domById[d.id] = d; });
  (A.platform || []).forEach(function (p) { byId[p.id] = p; });
  var STAT = { live: 'Live', building: 'Building', planned: 'Planned' };
  var STATDESC = { live: 'ready and checked', building: 'started, not yet checked', planned: 'not started' };
  function coverageOf(n) {
    if (n.coverage) return n.coverage;
    var c = { live: 0, building: 0, planned: 0 }, kids = children[n.id] || [];
    if (!kids.length) { c[n.status || 'planned'] = 1; return c; }
    kids.forEach(function (k) { var kc = coverageOf(k); c.live += kc.live; c.building += kc.building; c.planned += kc.planned; });
    return c;
  }
  var domCov = {};
  A.domains.forEach(function (d) { var c = { live: 0, building: 0, planned: 0 }; (children['domain:' + d.id] || []).forEach(function (n) { var kc = coverageOf(n); c.live += kc.live; c.building += kc.building; c.planned += kc.planned; }); domCov[d.id] = c; });
  function bar(c) { var t = Math.max(1, c.live + c.building + c.planned); return '<span class="bar"><i class="l" style="width:' + (c.live / t * 100).toFixed(1) + '%"></i><i class="b" style="width:' + (c.building / t * 100).toFixed(1) + '%"></i></span>'; }
  function covText(c) { var t = c.live + c.building + c.planned; return c.live + ' live, ' + c.building + ' building, ' + c.planned + ' planned of ' + t; }
  function readiness(c) { var t = c.live + c.building + c.planned; if (!t) return 'planned'; if (c.live === t) return 'live'; if (c.planned === t) return 'planned'; return 'mixed'; }
  function readinessNode(n) { var r = readiness(coverageOf(n)); if (r === 'planned' && (n.status === 'building' || n.status === 'live')) return 'building'; return r; }
  function readinessDomain(d) { var r = readiness(domCov[d.id]); if (r === 'planned' && (children['domain:' + d.id] || []).some(function (n) { return n.status === 'building' || n.status === 'live'; })) return 'building'; return r; }
  function scaffolded(d) { return (children['domain:' + d.id] || []).filter(function (n) { return n.status === 'building' || n.status === 'live'; }).length; }

  /* ---- state ---- */
  var state = { p: 'world', d: null, n: null, s: null, v: 'map' };
  function readURL() {
    var q = {}; location.search.replace(/^\?/, '').split('&').forEach(function (kv) { if (!kv) return; var m = kv.split('='); q[decodeURIComponent(m[0])] = decodeURIComponent(m[1] || ''); });
    state.p = /^(world|knowledge|lifecycle)$/.test(q.p) ? q.p : 'world';
    state.d = q.d && domById[q.d] ? q.d : null;
    state.n = q.n && byId[q.n] ? q.n : null;
    state.s = q.s || null;
    state.v = q.v === 'list' ? 'list' : 'map';
    if (state.n && !state.d) state.d = byId[state.n].domain || null;
  }
  function writeURL(push) {
    var parts = [];
    if (state.p !== 'world') parts.push('p=' + state.p);
    if (state.d) parts.push('d=' + state.d);
    if (state.n) parts.push('n=' + state.n);
    if (state.s) parts.push('s=' + state.s);
    if (state.v === 'list') parts.push('v=list');
    var url = location.pathname + (parts.length ? '?' + parts.join('&') : '');
    if (push) history.pushState(null, '', url); else history.replaceState(null, '', url);
  }
  function go(patch, push) { Object.keys(patch).forEach(function (k) { state[k] = patch[k]; }); writeURL(push !== false); render(); }
  addEventListener('popstate', function () { readURL(); render(); });

  /* ---- the map strip ---- */
  var ANCHORS = { places: { x: 600, z: 34 }, cities: { x: 690, z: 30 }, structures: { x: 375, z: 27 }, ground: { x: 345, z: -24 }, movement: { x: 1100, z: 28 }, water: { x: -985, z: 110 }, energy: { x: -450, z: 60 }, 'building-systems': { x: 820, z: 146 }, materials: { x: 160, z: 28 }, construction: { x: 1215, z: 54 }, operations: { x: 478, z: 20 }, environment: { x: 1500, z: 10 }, digital: { x: 240, z: 50 }, governance: { x: 950, z: 60 } };
  A.scene = ANCHORS;
  var strip = $('#strip'), stripHost = $('#stripScene'), scene = null, hots = [];
  if (stripHost && window.FLScene) {
    scene = window.FLScene.build(stripHost, { mode: 'atlas', alt: 'Section through a region of the built world, used as a map of the Atlas domains' });
    A.domains.forEach(function (d) {
      var anchor = (A.scene || {})[d.id]; if (!anchor) return;
      var b = document.createElement('button'); b.className = 'hot'; b.type = 'button'; b.textContent = d.name.split(',')[0].split(' and ')[0];
      b.setAttribute('aria-label', d.name); b.dataset.d = d.id;
      b.addEventListener('click', function () { go({ d: d.id, n: null, s: null, p: 'world', v: 'map' }); });
      strip.appendChild(b); hots.push({ el: b, d: d, x: anchor.x, z: anchor.z });
    });
    scene.live(!reduce);
  }
  var camCur = null, camRaf = 0;
  function stripCam() {
    var r = stripHost.getBoundingClientRect(), a = r.width > 0 && r.height > 0 ? r.width / r.height : 3;
    var d = state.d && (A.scene || {})[state.d];
    if (d && state.v === 'map') return { cx: d.x, cz: d.z - 4, w: Math.max(700, 420 * a), ve: 1.15 };
    var w = Math.max(2560, 230 * 2.4 * a); return { cx: 300, cz: 70, w: w, ve: 2.4 };
  }
  function placeHots(cam) {
    var r = stripHost.getBoundingClientRect(), a = r.width / Math.max(1, r.height), h = cam.w / a, ve = cam.ve || 1;
    var x0 = cam.cx - cam.w / 2, yc = 400 - cam.cz * ve, y0 = yc - h / 2;
    var placed = [];
    hots.slice().sort(function (p, q) { return p.x - q.x; }).forEach(function (hs) {
      var sx = (hs.x - x0) / cam.w * r.width, sy = ((400 - hs.z * ve) - y0) / h * r.height - 10;
      var w = hs.el.offsetWidth || 80, guard = 0;
      while (guard++ < 8 && placed.some(function (p) { return Math.abs(p.x - sx) < (p.w + w) / 2 + 6 && Math.abs(p.y - sy) < 30; })) sy -= 32;
      placed.push({ x: sx, y: sy, w: w });
      var vis = sx > 30 && sx < r.width - 30 && sy > 36 && sy < r.height - 8;
      hs.el.style.left = sx.toFixed(1) + 'px'; hs.el.style.top = sy.toFixed(1) + 'px';
      hs.el.style.display = vis ? '' : 'none';
      hs.el.setAttribute('aria-pressed', state.d === hs.d.id ? 'true' : 'false');
    });
  }
  function stripTo(cam, animate) {
    if (!scene) return;
    if (camRaf) cancelAnimationFrame(camRaf);
    if (!animate || !camCur || reduce) { camCur = cam; scene.apply(cam); placeHots(cam); return; }
    var from = camCur, t0 = performance.now(), dur = 800;
    (function step(t) {
      var u = Math.min(1, (t - t0) / dur), e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      var c = window.FLScene.lerp(from, cam, e); scene.apply(c); placeHots(c);
      if (u < 1) camRaf = requestAnimationFrame(step); else { camRaf = 0; camCur = cam; }
    })(t0);
  }
  addEventListener('resize', function () { if (scene) { scene.refresh(); stripTo(stripCam(), false); } });

  /* ---- search ---- */
  var searchIn = $('#atlasSearch'), results = $('#searchResults');
  var searchable = A.nodes.map(function (n) { return { n: n, t: (n.name + ' ' + (n.legacy || '') + ' ' + (domById[n.domain] ? domById[n.domain].name : '')).toLowerCase() }; });
  function doSearch() {
    var q = searchIn.value.trim().toLowerCase();
    if (q.length < 2) { results.classList.remove('open'); results.innerHTML = ''; return; }
    var hits = searchable.filter(function (s) { return s.t.indexOf(q) >= 0; }).sort(function (a, b) { var ai = a.n.name.toLowerCase().indexOf(q), bi = b.n.name.toLowerCase().indexOf(q); return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || (a.n.kind === 'topic' ? 1 : 0) - (b.n.kind === 'topic' ? 1 : 0); }).slice(0, 14);
    results.innerHTML = hits.length ? hits.map(function (h) { var d = domById[h.n.domain]; return '<button type="button" data-n="' + esc(h.n.id) + '"><span>' + esc(h.n.name) + '</span><small>' + esc((d ? d.name : '') + (h.n.parent && byId[h.n.parent] ? ' / ' + byId[h.n.parent].name : '')) + '</small></button>'; }).join('') : '<button type="button" disabled><span>Nothing matches "' + esc(searchIn.value) + '"</span><small></small></button>';
    results.classList.add('open');
  }
  if (searchIn) {
    searchIn.addEventListener('input', doSearch);
    searchIn.addEventListener('keydown', function (e) { if (e.key === 'Escape') { results.classList.remove('open'); } if (e.key === 'ArrowDown') { var f = results.querySelector('button:not([disabled])'); if (f) { e.preventDefault(); f.focus(); } } });
    results.addEventListener('keydown', function (e) { var bs = $$('button:not([disabled])', results), i = bs.indexOf(document.activeElement); if (e.key === 'ArrowDown' && bs[i + 1]) { e.preventDefault(); bs[i + 1].focus(); } if (e.key === 'ArrowUp') { e.preventDefault(); (bs[i - 1] || searchIn).focus(); } if (e.key === 'Escape') { results.classList.remove('open'); searchIn.focus(); } });
    results.addEventListener('click', function (e) { var b = e.target.closest('button[data-n]'); if (!b) return; var n = byId[b.dataset.n]; results.classList.remove('open'); searchIn.value = ''; go({ d: n.domain, n: n.id, s: null, v: 'map', p: state.p === 'lifecycle' ? 'world' : state.p }); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.search')) results.classList.remove('open'); });
  }

  /* ---- controls ---- */
  $$('#perspective button').forEach(function (b) { b.addEventListener('click', function () { go({ p: b.dataset.p, n: null, s: null }); }); });
  $$('#viewmode button').forEach(function (b) { b.addEventListener('click', function () { go({ v: b.dataset.v }); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !results.classList.contains('open')) { if (state.n) go({ n: null }); else if (state.d) go({ d: null, s: null }); } });

  /* ---- rendering ---- */
  var crumbs = $('#crumbs'), main = $('#atlasMain');
  function nodeButton(n, current) {
    return '<button type="button" data-n="' + esc(n.id) + '"' + (current ? ' aria-current="true"' : '') + '><span>' + esc(n.name) + '</span></button>';
  }
  function renderCrumbs() {
    var h = '<button type="button" data-go="root">Atlas</button>';
    if (state.p !== 'world') h += '<span class="sep">/</span><b>' + (state.p === 'knowledge' ? 'Knowledge' : 'Lifecycle') + '</b>';
    if (state.s) { var st = A.lifecycle.filter(function (l) { return l.id === state.s; })[0]; if (st) h += '<span class="sep">/</span><b>' + esc(st.name) + '</b>'; }
    if (state.d) h += '<span class="sep">/</span>' + (state.n ? '<button type="button" data-go="domain">' + esc(domById[state.d].name) + '</button>' : '<b>' + esc(domById[state.d].name) + '</b>');
    if (state.n) {
      var n = byId[state.n], chain = [];
      while (n) { chain.unshift(n); n = n.parent ? byId[n.parent] : null; }
      chain.forEach(function (c, i) { h += '<span class="sep">/</span>' + (i === chain.length - 1 ? '<b>' + esc(c.name) + '</b>' : '<button type="button" data-n="' + esc(c.id) + '">' + esc(c.name) + '</button>'); });
    }
    crumbs.innerHTML = h;
  }
  crumbs.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.go === 'root') go({ d: null, n: null, s: null });
    else if (b.dataset.go === 'domain') go({ n: null });
    else if (b.dataset.n) go({ n: b.dataset.n });
  });

  function renderOverview() {
    var h = '';
    if (state.p === 'world') {
      h += '';
      h += '<div class="domains">' + A.domains.map(function (d) { var c = domCov[d.id]; return '<button type="button" class="dcard" data-d="' + esc(d.id) + '"><span class="dname">' + esc(d.name) + '</span></button>'; }).join('') + '</div>';
    } else if (state.p === 'knowledge') {
      var disc = A.nodes.filter(function (n) { return !n.parent && n.kind === 'discipline'; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
      h += '<p class="label" style="margin-top:22px">' + disc.length + ' engineering disciplines and research fields</p>';
      h += '<div class="domains">' + disc.map(function (n) { var c = coverageOf(n), d = domById[n.domain]; return '<button type="button" class="dcard" data-n="' + esc(n.id) + '"><span class="dname">' + esc(n.name) + '</span><span class="dblurb">' + esc(d ? d.name : '') + '</span></button>'; }).join('') + '</div>';
    } else {
      h += '<p class="label" style="margin-top:22px">A project\'s life, in eleven stages. Pick one to see what serves it.</p>';
      h += '<div class="ribbon" style="margin-top:12px">' + A.lifecycle.map(function (l) { return '<button type="button" data-s="' + esc(l.id) + '"' + (state.s === l.id ? ' aria-current="true"' : '') + '>' + esc(l.name) + '</button>'; }).join('') + '</div>';
      if (state.s) {
        var serve = A.nodes.filter(function (n) { return (n.lifecycle || []).indexOf(state.s) >= 0 && n.kind !== 'topic'; });
        var byDom = {}; serve.forEach(function (n) { (byDom[n.domain] = byDom[n.domain] || []).push(n); });
        h += '<div class="explorer" style="margin-top:18px"><div class="list">' + A.domains.filter(function (d) { return byDom[d.id]; }).map(function (d) { return '<h3>' + esc(d.name) + '</h3>' + byDom[d.id].map(function (n) { return nodeButton(n, false); }).join(''); }).join('') + '</div><div class="detail"><p class="kind">Lifecycle</p><h2>' + esc(A.lifecycle.filter(function (l) { return l.id === state.s; })[0].name) + '</h2><p class="desc">What we work on at this stage. Select an area to see its topics and what it connects to.</p></div></div>';
      }
    }
    if (A.platform && A.platform.length && state.p !== 'lifecycle') {
      var groups = { capability: 'Capabilities', workflow: 'Workflows', trust: 'Verification and trust' }, g = {};
      A.platform.forEach(function (p) { (g[p.kind] = g[p.kind] || []).push(p); });
      h += '<p class="label" style="margin-top:34px">What the system can do with that knowledge</p><div class="domains">' + Object.keys(groups).filter(function (k) { return g[k]; }).map(function (k) { return '<div class="dcard" style="cursor:default"><span class="dname">' + groups[k] + '</span><span class="dblurb">' + g[k].map(function (p) { return esc(p.name); }).join(' · ') + '</span></div>'; }).join('') + '</div>';
    }
    main.innerHTML = h;
  }
  function renderDomain() {
    var d = domById[state.d], tops = children['domain:' + d.id] || [], sel = state.n ? byId[state.n] : null;
    var systems = tops.filter(function (n) { return n.kind === 'system'; }), discs = tops.filter(function (n) { return n.kind !== 'system'; });
    var list = (systems.length ? '<h3>Systems</h3>' + systems.map(function (n) { return nodeButton(n, sel && (sel.id === n.id || isUnder(sel, n))); }).join('') : '') + (discs.length ? '<h3>Disciplines</h3>' + discs.map(function (n) { return nodeButton(n, sel && (sel.id === n.id || isUnder(sel, n))); }).join('') : '');
    var det;
    if (!sel) {
      var c = domCov[d.id];
      det = '<h2>' + esc(d.name) + '</h2><p class="desc">' + esc(d.blurb || '') + '</p>' +
        '<h4>Alongside</h4><div class="chips">' + relatedDomains(d).map(function (rd) { return '<button type="button" data-d="' + esc(rd.id) + '">' + esc(rd.name) + '</button>'; }).join('') + '</div>' +
        '<h4>Areas</h4><div class="children">' + tops.map(function (n) { return '<button type="button" data-n="' + esc(n.id) + '"><span>' + esc(n.name) + '</span></button>'; }).join('') + '</div>';
    } else det = renderNode(sel);
    main.innerHTML = '<div class="explorer' + (sel ? ' focus' : '') + '"><div class="list">' + list + '</div><div class="detail">' + det + '</div></div>';
  }
  function isUnder(n, anc) { var p = n.parent ? byId[n.parent] : null; while (p) { if (p.id === anc.id) return true; p = p.parent ? byId[p.parent] : null; } return false; }
  function relatedDomains(d) {
    var score = {}; (children['domain:' + d.id] || []).forEach(function (n) { (n.related || []).forEach(function (r) { var rn = byId[r]; if (rn && rn.domain !== d.id) score[rn.domain] = (score[rn.domain] || 0) + 1; }); });
    return Object.keys(score).sort(function (a, b) { return score[b] - score[a]; }).slice(0, 5).map(function (id) { return domById[id]; }).filter(Boolean);
  }
  function renderNode(n) {
    var kids = children[n.id] || [], d = domById[n.domain];
    var h = '<p class="kind">' + (d ? esc(d.name) : '') + '</p><h2>' + esc(n.name) + '</h2>';
    if (n.desc) h += '<p class="desc">' + esc(n.desc) + '</p>';
    if (n.lifecycle && n.lifecycle.length) h += '<h4>When</h4><div class="ribbon">' + A.lifecycle.map(function (l) { return '<span' + (n.lifecycle.indexOf(l.id) >= 0 ? ' class="on"' : '') + '>' + esc(l.name) + '</span>'; }).join('') + '</div>';
    var rel = (n.related || []).map(function (id) { return byId[id]; }).filter(Boolean);
    if (!rel.length && n.parent && byId[n.parent]) rel = (byId[n.parent].related || []).map(function (id) { return byId[id]; }).filter(Boolean);
    if (rel.length) h += '<h4>Connects to</h4><div class="chips">' + rel.map(function (rn) { var rd = domById[rn.domain]; return '<button type="button" data-n="' + esc(rn.id) + '">' + esc(rn.name) + (rd && rd.id !== n.domain ? '<small>' + esc(rd.name) + '</small>' : '') + '</button>'; }).join('') + '</div>';
    if (kids.length) h += '<h4>Topics</h4><div class="children">' + kids.map(function (k) { return '<button type="button" data-n="' + esc(k.id) + '"><span>' + esc(k.name) + '</span></button>'; }).join('') + '</div>';
    if (n.kind === 'topic') h += '<h4>Work with us</h4><div class="chips"><a class="btn small" href="mailto:devanshpatel77@gmail.com?subject=' + encodeURIComponent('Formation Labs: ' + n.name) + '">Ask about ' + esc(n.name) + '</a></div>';
    return h;
  }
  function renderList() {
    main.innerHTML = '<div class="listview">' + A.domains.map(function (d) {
      var tops = children['domain:' + d.id] || [];
      return '<details' + (state.d === d.id ? ' open' : '') + '><summary><span>' + esc(d.name) + '</span></summary>' + tops.map(function (n) {
        var kids = children[n.id] || [];
        return '<div class="mod"><b>' + esc(n.name) + '</b><ul>' + kids.map(function (k) { return '<li>' + esc(k.name) + '</li>'; }).join('') + '</ul></div>';
      }).join('') + '</details>';
    }).join('') + '</div>';
  }
  function render() {
    $$('#perspective button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.p === state.p ? 'true' : 'false'); });
    $$('#viewmode button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.v === state.v ? 'true' : 'false'); });
    renderCrumbs();
    if (state.v === 'list') renderList();
    else if (state.d && state.p !== 'lifecycle') renderDomain();
    else renderOverview();
    if (scene) stripTo(stripCam(), true);
    var title = state.n ? byId[state.n].name : state.d ? domById[state.d].name : 'Knowledge Atlas';
    document.title = 'Formation Labs · ' + title;
    var live = $('#atlasLive'); if (live) live.textContent = 'Showing ' + title;
  }
  main.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.d) go({ d: b.dataset.d, n: null, p: 'world', v: 'map' });
    else if (b.dataset.n) { var n = byId[b.dataset.n]; go({ d: n.domain || state.d, n: n.id, v: 'map', p: state.p === 'lifecycle' ? 'world' : state.p }); if (innerWidth <= 860) $('#atlasMain').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    else if (b.dataset.s) go({ s: b.dataset.s === state.s ? null : b.dataset.s });
  });

  readURL();
  render();
  if (scene) requestAnimationFrame(function () { scene.refresh(); stripTo(stripCam(), false); });
  addEventListener('load', function () { if (scene) { scene.refresh(); stripTo(stripCam(), false); } });
})();
