/* The world inside the mark. A slowly turning globe is seen through the logo silhouette;
   scrolling zooms the silhouette until the world fills the screen. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.getElementById('hero'), pin = hero && hero.querySelector('.pin');
  var cv = document.getElementById('globe'), maskG = document.getElementById('maskG'), maskUse = document.getElementById('maskUse');
  var inkG = document.getElementById('inkG'), inkFill = document.getElementById('inkFill'), inkLine = document.getElementById('inkLine');
  var head = document.getElementById('heroHead'), tail = document.getElementById('heroTail');
  if (!hero || !cv || !maskG || !window.d3) return;
  var ctx = cv.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
  var W = 0, H = 0, dots = [], cities = [
    [-74.0, 40.7], [-0.13, 51.5], [139.7, 35.7], [72.9, 19.1], [121.5, 31.2], [-46.6, -23.5], [-99.1, 19.4], [31.2, 30.1], [3.4, 6.5],
    [151.2, -33.9], [37.6, 55.8], [-122.4, 37.8], [2.35, 48.9], [103.8, 1.35], [77.2, 28.6], [-43.2, -22.9], [28.0, -26.2], [55.3, 25.3],
    [116.4, 39.9], [-112.1, 33.4], [100.5, 13.8], [-58.4, -34.6], [18.4, -33.9], [-3.7, 40.4], [126.98, 37.6], [-87.6, 41.9]
  ];
  var arcs = [[[-74, 40.7], [-0.13, 51.5]], [[139.7, 35.7], [-122.4, 37.8]], [[72.9, 19.1], [55.3, 25.3]], [[-46.6, -23.5], [3.4, 6.5]], [[121.5, 31.2], [151.2, -33.9]], [[2.35, 48.9], [37.6, 55.8]], [[-99.1, 19.4], [-58.4, -34.6]], [[28, -26.2], [77.2, 28.6]]];
  var lambda = -30, last = 0, p = 0, live = true;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var wide0 = function (w) { return w > 860; };
  var wide0 = function (w) { return w > 860; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };

  function size() {
    var r = pin.getBoundingClientRect(); W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
  }
  function buildDots(land) {
    var Wd = 720, Hd = 360, off = document.createElement('canvas'); off.width = Wd; off.height = Hd;
    var oc = off.getContext('2d'), proj = d3.geoEquirectangular().scale(Wd / (2 * Math.PI)).translate([Wd / 2, Hd / 2]);
    oc.fillStyle = '#000'; oc.beginPath(); d3.geoPath(proj, oc)(land); oc.fill();
    var img = oc.getImageData(0, 0, Wd, Hd).data, step = 1.5;
    for (var lat = -62; lat <= 84; lat += step) {
      var dl = step / Math.max(.2, Math.cos(lat * Math.PI / 180));
      for (var lon = -180; lon < 180; lon += dl) {
        var q = proj([lon, lat]), px = Math.floor(q[0]), py = Math.floor(q[1]);
        if (img[(py * Wd + px) * 4 + 3] > 128) dots.push([lon, lat]);
      }
    }
  }
  /* geometry of the reveal at progress p */
  function layout() {
    var e = smooth(p);
    var logoH0 = wide0(W) ? Math.min(H * .5, W * .56) : Math.min(H * .38, W * .78), wide = wide0(W);
    var m = smooth((e - .3) / .45);
    var cx = W / 2 + (wide ? (W * .62 - W / 2) * m : 0), cy = (wide ? H * .47 : H * .42) + (wide ? H * .03 * m : -H * .04 * m);
    /* the mark's own box is 5898 x 5521 units; scale so its height is logoH */
    var k0 = logoH0 / 5521, kEnd = H * 1.25 / 5521;
    var k = Math.exp(Math.log(k0) + (Math.log(kEnd) - Math.log(k0)) * e);
    var need = k * 4100, R1 = Math.min(W * (wide ? .33 : .46), H * .38);
    var R = e < .3 ? need : need + (R1 - need) * smooth((e - .3) / .45);
    return { cx: cx, cy: cy, k: k, R: R, e: e };
  }
  function drawGlobe(ts, L) {
    var dt = last ? Math.min(50, ts - last) : 16; last = ts;
    if (!reduce && live) lambda += dt * .004;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var proj = d3.geoOrthographic().scale(L.R).translate([L.cx, L.cy]).rotate([lambda, -18]).clipAngle(90);
    var path = d3.geoPath(proj, ctx), center = [-lambda, 18];
    /* night sky, faint stars, only once the paper has gone dark */
    if (L.e > .3) { ctx.fillStyle = 'rgba(243,238,229,.55)'; var sa = clamp((L.e - .3) / .4, 0, 1); ctx.globalAlpha = sa; for (var st = 0; st < 90; st++) { var sx = ((st * 97) % 1000) / 1000 * W, sy = ((st * 57) % 1000) / 1000 * H; if (Math.hypot(sx - L.cx, sy - L.cy) < L.R + 10) continue; ctx.fillRect(sx, sy, st % 3 ? 1 : 1.6, st % 3 ? 1 : 1.6); } ctx.globalAlpha = 1; }
    /* sphere: sea */
    var g = ctx.createRadialGradient(L.cx - L.R * .35, L.cy - L.R * .4, L.R * .1, L.cx, L.cy, L.R);
    g.addColorStop(0, '#7fa6b1'); g.addColorStop(.7, '#2d5a6b'); g.addColorStop(1, '#1b3a48');
    ctx.fillStyle = g; ctx.beginPath(); path({ type: 'Sphere' }); ctx.fill();
    ctx.strokeStyle = 'rgba(243,238,229,.35)'; ctx.lineWidth = .6; ctx.beginPath(); path(d3.geoGraticule10()); ctx.stroke();
    /* land dots */
    var sz = Math.min(3.2, Math.max(1.2, L.R / 120));
    ctx.fillStyle = '#efe6d2';
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i], dist = d3.geoDistance(d, center); if (dist > 1.55) continue;
      var q = proj(d); ctx.globalAlpha = .35 + .65 * Math.cos(dist);
      ctx.fillRect(q[0] - sz / 2, q[1] - sz / 2, sz, sz);
    }
    /* arcs */
    /* cities */
    for (i = 0; i < cities.length; i++) {
      var c = cities[i], cd = d3.geoDistance(c, center); if (cd > 1.5) continue;
      var cq = proj(c); ctx.globalAlpha = Math.cos(cd); ctx.fillStyle = '#e0522a';
      ctx.beginPath(); ctx.arc(cq[0], cq[1], Math.min(4.5, Math.max(1.6, L.R / 90)), 0, 6.29); ctx.fill();
    }
    /* limb shading */
    ctx.globalAlpha = 1;
    var s = ctx.createRadialGradient(L.cx - L.R * .3, L.cy - L.R * .3, L.R * .5, L.cx, L.cy, L.R * 1.02);
    s.addColorStop(0, 'rgba(0,0,0,0)'); s.addColorStop(.85, 'rgba(0,0,0,.08)'); s.addColorStop(1, 'rgba(0,0,0,.45)');
    ctx.fillStyle = s; ctx.beginPath(); path({ type: 'Sphere' }); ctx.fill();
  }
  function applyMask(L) {
    /* the <use> draws the mark at 5898 x 5521 units about its own box; centre it */
    var tr = 'translate(' + (L.cx - 2949 * L.k) + ',' + (L.cy - 2760 * L.k) + ') scale(' + L.k + ')';
    maskG.setAttribute('transform', tr); inkG.setAttribute('transform', tr);
    /* the ink logo is what you see first; the world shows through as you scroll, the outline lingers */
    inkFill.style.opacity = (1 - clamp(L.e / .22, 0, 1)).toFixed(3);
    inkLine.style.opacity = (1 - clamp((L.e - .65) / .2, 0, 1)).toFixed(3);
    inkLine.setAttribute('stroke-width', (1.2 / Math.max(.02, L.k)).toFixed(1));
    /* the paper around the mark turns to night as the world grows, then clears */
    var dark = smooth(clamp((L.e - .44) / .14, 0, 1)), fade = clamp((L.e - .6) / .22, 0, 1);
    var mix = function (a, b, t) { return Math.round(a + (b - a) * t); };
    var col = 'rgb(' + mix(244, 20, dark) + ',' + mix(241, 26, dark) + ',' + mix(234, 34, dark) + ')';
    var paper = document.getElementById('maskPaper'); paper.setAttribute('fill', col); paper.style.opacity = (1 - fade).toFixed(3);
    pin.style.background = col;
    if (head) head.style.opacity = (1 - clamp(L.e / .12, 0, 1)).toFixed(3);
    var nav = document.getElementById('nav'); if (nav) nav.classList.toggle('night', dark > .5);
    if (tail) { var t = clamp((L.e - .8) / .16, 0, 1); tail.style.opacity = t.toFixed(3); tail.style.pointerEvents = t > .5 ? 'auto' : 'none'; }
  }
  function progress() { var total = hero.offsetHeight - innerHeight; return total > 0 ? clamp(-hero.getBoundingClientRect().top / total, 0, 1) : 0; }
  var fix = location.search.match(/[?&]gp=([0-9.]+)/);
  function frame(ts) {
    if (!W || Math.abs(pin.getBoundingClientRect().width - W) > 1) size();
    p = fix ? +fix[1] : progress();
    if (reduce) p = p < .5 ? .3 : 1;
    var L = layout();
    if (live || fix) drawGlobe(ts, L);
    applyMask(L);
    requestAnimationFrame(frame);
  }
  addEventListener('resize', function () { size(); });
  addEventListener('load', function () { size(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { live = es[0].isIntersecting && !document.hidden; }).observe(pin);
  document.addEventListener('visibilitychange', function () { if (document.hidden) live = false; });
  var next = document.getElementById('heroNext');
  if (next) next.addEventListener('click', function () { scrollTo({ top: hero.offsetTop + hero.offsetHeight - innerHeight, behavior: reduce ? 'auto' : 'smooth' }); });
  size();
  requestAnimationFrame(frame);
  if (window.LAND_110M && window.topojson) buildDots(topojson.feature(window.LAND_110M, window.LAND_110M.objects.land));
  else if (window.topojson) fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json').then(function (r) { return r.json(); }).then(function (w) { buildDots(topojson.feature(w, w.objects.land)); }).catch(function () { /* graticule, arcs and cities still draw */ });
})();
