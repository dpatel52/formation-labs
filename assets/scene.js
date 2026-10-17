/* Formation Labs: one region of the built world, in section.
   From a dam and its reservoir in the hills, down a valley crossed by a transmission
   line and a road, over a three-span river bridge, through a town and a downtown with
   a metro beneath it, through a rock tunnel to a port on the coast.
   World x in metres, z is elevation. Drawn true to scale; a vertical stretch (VE)
   is applied only by the camera when it is pulled far back, and relaxes to 1 as it
   zooms in. SVG y = 400 - z in the world group, which the camera scales about y=400. */
(function (global) {
  'use strict';

  var Y = function (z) { return 400 - z; };

  /* ---------- profiles (x, z) ---------- */
  var SURF = [[-2000,200],[-1500,160],[-1400,150],[-1300,130],[-1200,112],[-1100,100],[-1000,86],[-950,72],[-920,58],[-908,42],[-900,30],[-830,30],[-815,32],[-790,34],[-748,36],[-732,30],[-716,17],[-702,10.5],[-686,9.5],[-672,12],[-656,24],[-642,34],[-624,38],[-550,36],[-450,33],[-350,29],[-250,25],[-150,21],[-60,18],[0,16],[80,15.6],[150,16.3],[230,16.8],[295,17.2],[300,17.6],[306,16.5],[316,12],[324,7],[331,3],[338,-0.5],[348,-2.5],[362,-4],[380,-5.2],[398,-5.6],[412,-4.6],[422,-2.4],[429,0.6],[435,3.6],[441,8],[446,13],[450,16.6],[456,17.2],[480,18],[505,20],[525,22],[560,22.6],[620,22.2],[690,21.6],[720,21.4],[760,21],[1000,20.5],[1020,24],[1045,36],[1080,58],[1110,70],[1140,62],[1165,40],[1180,24],[1192,14],[1200,10],[1250,10],[1252,-2],[1265,-12],[1350,-16],[1500,-20],[1700,-26],[2400,-32]];
  var ROAD = [[-2000,34],[-900,34],[-830,34],[-790,36],[-740,38],[-650,40],[-550,38],[-450,35],[-350,31],[-250,27],[-150,23],[-60,19],[0,16.4],[190,16.8],[230,19],[270,22.4],[300,24],[375,24.6],[450,24],[490,23.4],[520,22.9],[560,22.95],[700,22],[760,21.4],[980,21],[1030,16.5],[1175,16.5],[1198,10.5],[1250,10.5],[2400,10.5]];
  var ROCK = [[-2000,196],[-1400,146],[-1200,106],[-1000,80],[-950,64],[-920,50],[-905,34],[-900,30],[-830,30],[-790,28],[-748,27],[-732,22],[-716,11],[-702,6],[-686,5],[-672,7],[-656,17],[-642,25],[-624,28],[-550,18],[-450,10],[-350,2],[-250,-6],[-150,-10],[0,-14],[200,-17],[300,-19],[345,-21],[405,-23],[450,-24],[520,-25],[720,-27],[760,-27],[900,-30],[1000,-26],[1030,0],[1060,30],[1110,48],[1160,22],[1185,-2],[1200,-10],[1250,-14],[1400,-24],[2400,-36]];
  var ALLUV = [[-2000,197],[-1400,148],[-1200,108],[-1000,82],[-950,66],[-920,52],[-905,36],[-900,31],[-830,31],[-790,29.5],[-748,29],[-732,25],[-716,13.5],[-702,8.5],[-686,7.5],[-672,9.5],[-656,20],[-642,28],[-624,31],[-550,22],[-450,15],[-350,8],[-250,2],[-150,0],[0,5],[200,4],[300,0.5],[345,-10],[405,-12.5],[450,-9],[520,-4],[720,-2],[760,-1.5],[900,-5],[1000,-4],[1030,2],[1060,32],[1110,50],[1160,24],[1185,0],[1200,-6],[1250,-9],[1400,-16],[2400,-26]];
  var CLAY = [[-2000,196.5],[-1400,147],[-1200,107],[-1000,81],[-950,65],[-920,51],[-905,35],[-900,30.5],[-830,30.5],[-790,29],[-748,28],[-732,23.5],[-716,12],[-702,7],[-686,6],[-672,8],[-656,18.5],[-642,26.5],[-624,29.5],[-550,20],[-450,12.5],[-350,5],[-250,-2],[-150,-5],[0,-6],[300,-10.5],[345,-16],[405,-17.5],[450,-15.5],[720,-11],[760,-11],[900,-16],[1000,-14],[1030,1],[1060,31],[1110,49],[1160,23],[1185,-1],[1200,-8],[1250,-12],[1400,-21],[2400,-32]];
  var GW = [[-2000,190],[-1400,142],[-1200,104],[-1000,80],[-950,64],[-920,52],[-910,44],[-900,40],[-830,30],[-790,29],[-748,28],[-716,14],[-690,10],[-660,16],[-640,24],[-624,28],[-550,27],[-450,22],[-350,17],[-250,13],[-150,11],[0,10],[200,8],[290,4.5],[331,2],[435,2],[480,5],[600,9],[720,10],[1000,9],[1030,12],[1110,40],[1160,20],[1185,4],[1200,0],[2400,0]];
  var HILL1 = [[-2000,260],[-1600,232],[-1300,196],[-1100,150],[-950,112],[-800,84],[-650,70],[-500,58],[-350,46],[-200,40],[-60,36],[60,32],[180,38],[300,32],[420,35],[560,42],[700,38],[850,46],[980,54],[1100,92],[1180,70],[1240,40],[1260,2],[2400,2]];
  var HILL3 = [[-2000,360],[-1500,330],[-1100,270],[-800,200],[-500,150],[-200,120],[100,110],[400,118],[700,126],[950,150],[1120,160],[1220,110],[1252,2],[2400,2]];
  var HILL2 = [[-2000,300],[-1500,268],[-1200,214],[-1000,170],[-800,128],[-600,96],[-400,74],[-200,60],[0,52],[200,56],[400,50],[600,58],[800,62],[1000,76],[1120,110],[1200,86],[1250,20],[1262,2],[2400,2]];

  function f(pts) {
    return function (x) {
      if (x <= pts[0][0]) return pts[0][1];
      for (var i = 1; i < pts.length; i++) {
        if (x <= pts[i][0]) { var a = pts[i - 1], b = pts[i], t = (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * t; }
      }
      return pts[pts.length - 1][1];
    };
  }
  var surf = f(SURF), road = f(ROAD), alluv = f(ALLUV), clay = f(CLAY), rock = f(ROCK), gw = f(GW), hill1 = f(HILL1), hill2 = f(HILL2), hill3 = f(HILL3);
  var WL = 2.0, SEA = 0, RES = 108, CREST = 116, FLOOD = 12.0, FLOOD2 = 12.6;
  var X0 = -2000, X1 = 2400;

  function deckTop(x) { return 24 + 0.6 * Math.sin(Math.PI * (x - 300) / 150); }
  var GIRDER = 2.4;
  function soffit(x) { return deckTop(x) - GIRDER; }

  function n(v) { return (Math.round(v * 100) / 100).toString(); }
  function P(x, z) { return n(x) + ',' + n(Y(z)); }
  function band(top, bot, xa, xb, step) {
    step = step || 4;
    var pts = [], x;
    for (x = xa; x <= xb; x += step) pts.push(P(x, top(x)));
    pts.push(P(xb, top(xb)));
    for (x = xb; x >= xa; x -= step) pts.push(P(x, bot(x)));
    pts.push(P(xa, bot(xa)));
    return pts.join(' ');
  }
  function poly(fn, xa, xb, step) {
    var pts = [], x; step = step || 4;
    for (x = xa; x <= xb; x += step) pts.push(P(x, fn(x)));
    pts.push(P(xb, fn(xb)));
    return pts.join(' ');
  }
  function rect(x, z, w, h, attrs) { return '<rect x="' + n(x) + '" y="' + n(Y(z + h)) + '" width="' + n(w) + '" height="' + n(h) + '" ' + (attrs || '') + '/>'; }
  function line(xa, za, xb, zb, attrs) { return '<line x1="' + n(xa) + '" y1="' + n(Y(za)) + '" x2="' + n(xb) + '" y2="' + n(Y(zb)) + '" ' + (attrs || '') + '/>'; }
  function pg(points, attrs) { return '<polygon points="' + points + '" ' + (attrs || '') + '/>'; }
  function pl(points, attrs) { return '<polyline points="' + points + '" fill="none" ' + (attrs || '') + '/>'; }
  function circ(x, z, r, attrs) { return '<circle cx="' + n(x) + '" cy="' + n(Y(z)) + '" r="' + n(r) + '" ' + (attrs || '') + '/>'; }
  var NS = 'vector-effect="non-scaling-stroke"';
  /* oblique projection for the top surface and side faces: depth d (metres into the picture)
     shifts a point right by OX*d and up by OZ*d, before the camera's vertical stretch */
  var OX = 0.52, OZ = 0.30;
  function Q(x, z, d) { return P(x + OX * d, z + OZ * d); }
  function obliqueBand(fn, xa, xb, d0, d1, step) {
    var pts = [], x; step = step || 6;
    for (x = xa; x <= xb; x += step) pts.push(Q(x, fn(x), d0));
    pts.push(Q(xb, fn(xb), d0));
    for (x = xb; x >= xa; x -= step) pts.push(Q(x, fn(x), d1));
    pts.push(Q(xa, fn(xa), d1));
    return pts.join(' ');
  }
  function shade(hex, k) { /* darken (k<1) or lighten (k>1) a hex colour */
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    var f = function (v) { v = k < 1 ? v * k : v + (255 - v) * (k - 1); return ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); };
    return '#' + f(r) + f(g) + f(b);
  }

  /* ---------- palette ---------- */
  var C = {
    paper: '#f3eee5', sky2: '#e6dccb', skyTop: '#c9d6de', haze: '#d8cdb9', hill1: '#b9ad99', hill2: '#cfc5b2', land: '#b9b58a', land2: '#a7a97a', field: '#c9c08f',
    fill: '#8f7256', alluv: '#c9aa7b', clay: '#8d8976', gravel: '#ab9474', rock: '#564e46', rock2: '#3b3530', marine: '#7f8a82',
    veg: '#6c7846', water1: '#6a98a6', water2: '#244b5a', waterline: '#b9d6db', sea1: '#7fa6b1', sea2: '#2d5a6b',
    conc1: '#dad4c7', conc2: '#a39c8f', conc3: '#8d8679', road: '#6b675f', parapet: '#e6e0d4',
    ink: '#1d1b17', ink2: '#514e47', ink3: '#7d7970', steel: '#3f6f83', sewer: '#746e62', wire: '#4a4640',
    bldg1: '#d7cdbb', bldg2: '#b6aa96', win: '#8a8071', roof: '#7a6a5b', glass1: '#c7cfcc', glass2: '#8e9a98',
    tree1: '#7c875a', tree2: '#5f6b45', trunk: '#5a4836', earth2: '#7a6a52', hull: '#2f3a44', hull2: '#8a2f24', box1: '#9a5a3c', box2: '#5f7f8c', box3: '#b8a56a',
    accent: '#e0522a', accentInk: '#b03d1a'
  };

  /* ---------- defs ---------- */
  function defs(id) {
    var u = function (s) { return id + '-' + s; };
    return '<defs>' +
      '<linearGradient id="' + u('night') + '" gradientUnits="userSpaceOnUse" x1="0" y1="' + n(Y(900)) + '" x2="0" y2="' + n(Y(-500)) + '"><stop offset="0" stop-color="#121a28"/><stop offset=".5" stop-color="#22304a"/><stop offset=".59" stop-color="#5c4a5a"/><stop offset=".625" stop-color="#a0744f"/><stop offset=".66" stop-color="#3a3a42"/><stop offset="1" stop-color="#1c1c22"/></linearGradient>' +
      '<radialGradient id="sunglow"><stop offset="0" stop-color="#fff8ea" stop-opacity=".95"/><stop offset=".55" stop-color="#fbf1df" stop-opacity=".5"/><stop offset="1" stop-color="#f3eee5" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + u('sky') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.skyTop + '"/><stop offset=".34" stop-color="#e4e3dc"/><stop offset=".6" stop-color="' + C.paper + '"/><stop offset="1" stop-color="' + C.sky2 + '"/></linearGradient>' +
      '<linearGradient id="' + u('deep') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.rock + '"/><stop offset="1" stop-color="' + C.rock2 + '"/></linearGradient>' +
      '<linearGradient id="' + u('water') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.water1 + '"/><stop offset="1" stop-color="' + C.water2 + '"/></linearGradient>' +
      '<linearGradient id="' + u('sea') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.sea1 + '"/><stop offset=".5" stop-color="' + C.sea2 + '"/><stop offset="1" stop-color="#1f4150"/></linearGradient>' +
      '<linearGradient id="' + u('conc') + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + C.conc1 + '"/><stop offset=".55" stop-color="' + C.conc2 + '"/><stop offset="1" stop-color="' + C.conc3 + '"/></linearGradient>' +
      '<linearGradient id="' + u('concv') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.conc1 + '"/><stop offset="1" stop-color="' + C.conc2 + '"/></linearGradient>' +
      '<linearGradient id="' + u('shade') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + u('bldg') + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + C.bldg1 + '"/><stop offset=".6" stop-color="' + C.bldg1 + '"/><stop offset="1" stop-color="' + C.bldg2 + '"/></linearGradient>' +
      '<linearGradient id="' + u('glass') + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + C.glass1 + '"/><stop offset=".55" stop-color="' + C.glass1 + '"/><stop offset="1" stop-color="' + C.glass2 + '"/></linearGradient>' +
      '<pattern id="' + u('hclay') + '" width="6" height="3" patternUnits="userSpaceOnUse"><line x1="0" y1="1.5" x2="3.4" y2="1.5" stroke="#6d6a5b" stroke-width=".35"/></pattern>' +
      '<pattern id="' + u('hgrav') + '" width="5" height="4" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r=".45" fill="#7d6a50"/><circle cx="3.6" cy="3" r=".35" fill="#7d6a50"/></pattern>' +
      '<pattern id="' + u('hall') + '" width="7" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="1.5" r=".3" fill="#a48860"/><circle cx="5.5" cy="4.5" r=".3" fill="#a48860"/></pattern>' +
      '<pattern id="' + u('hrock') + '" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><line x1="0" y1="2" x2="4" y2="2" stroke="#3a342e" stroke-width=".45"/><line x1="4" y1="6" x2="8" y2="6" stroke="#3a342e" stroke-width=".45"/></pattern>' +
      '<pattern id="' + u('hfill') + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1="0" y1="3" x2="2.5" y2="3" stroke="#6e5640" stroke-width=".35"/></pattern>' +
      '<pattern id="' + u('hdraw') + '" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="2.4" stroke="' + C.ink + '" stroke-width=".25" opacity=".55"/></pattern>' +
      '<pattern id="' + u('hglass') + '" width="2.6" height="3.4" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="2.6" height="3.4" fill="' + C.glass1 + '"/><rect x=".3" y=".3" width="2" height="2.5" fill="' + C.glass2 + '" opacity=".55"/></pattern>' +
      '<marker id="' + u('arr') + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C.ink + '"/></marker>' +
      '<marker id="' + u('tick') + '" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><line x1="3" y1="8" x2="7" y2="2" stroke="' + C.ink + '" stroke-width="1.2"/></marker>' +
      '</defs>';
  }

  /* ---------- backdrop ---------- */
  function sky(id) { return '<rect x="' + X0 + '" y="' + n(Y(900)) + '" width="' + (X1 - X0) + '" height="1300" fill="url(#' + id + '-sky)"/>'; }
  function hills() {
    var sun = '<circle cx="1480" cy="' + n(Y(230)) + '" r="300" fill="url(#sunglow)" class="sun"/>';
    var h3 = pg(poly(hill3, X0, X1, 24) + ' ' + P(X1, -100) + ' ' + P(X0, -100), 'fill="#e2dacb"');
    var h2 = pg(poly(hill2, X0, X1, 20) + ' ' + P(X1, -100) + ' ' + P(X0, -100), 'fill="' + C.hill2 + '"');
    var h1 = pg(poly(hill1, X0, X1, 16) + ' ' + P(X1, -100) + ' ' + P(X0, -100), 'fill="' + C.hill1 + '"');
    var cloud = function (x, z, k) { return '<g class="cloud" opacity=".55"><ellipse cx="' + x + '" cy="' + n(Y(z)) + '" rx="' + (60 * k) + '" ry="' + (14 * k) + '" fill="#fff"/><ellipse cx="' + (x + 40 * k) + '" cy="' + n(Y(z + 8 * k)) + '" rx="' + (46 * k) + '" ry="' + (16 * k) + '" fill="#fff"/><ellipse cx="' + (x - 36 * k) + '" cy="' + n(Y(z + 5 * k)) + '" rx="' + (38 * k) + '" ry="' + (12 * k) + '" fill="#fff"/></g>'; };
    var clouds = '<g class="clouds">' + cloud(-1350, 330, 1.3) + cloud(-300, 260, 1) + cloud(520, 300, 1.2) + cloud(1380, 250, .9) + '</g>';
    var haze = '<rect x="' + X0 + '" y="' + n(Y(46)) + '" width="' + (X1 - X0) + '" height="146" fill="' + C.haze + '" opacity=".5"/>';
    return '<g class="hills">' + sun + h3 + clouds + h2 + h1 + haze + '</g>';
  }
  function topSurface(id) {
    var D = 110, o = '';
    /* land */
    o += pg(obliqueBand(surf, X0, 1251, 0, D, 8), 'fill="' + C.land + '"');
    /* a second, lighter tone deeper in, for atmosphere */
    o += pg(obliqueBand(surf, X0, 1251, D * .55, D, 8), 'fill="' + C.land2 + '" opacity=".55"');
    /* fields on the valley floor */
    [[-640, -560], [-520, -430], [-250, -130], [20, 110], [560, 700]].forEach(function (f, i) {
      o += pg(obliqueBand(surf, f[0], f[1], 18 + (i % 2) * 14, 60 + (i % 3) * 14, 8), 'fill="' + C.field + '" opacity=".75"');
    });
    /* reservoir and sea in plan */
    o += pg(obliqueBand(function () { return RES; }, -1162, -900, 0, D, 8), 'fill="url(#' + id + '-water)"');
    o += pg(obliqueBand(function () { return SEA; }, 1251, X1, 0, D, 8), 'fill="url(#' + id + '-sea)"');
    /* the river in plan, meandering away from the crossing */
    var riv = [];
    [[331, 435, 0], [326, 440, 18], [340, 456, 40], [372, 488, 62], [410, 520, 84], [430, 540, D]].forEach(function (r) { riv.push(Q(r[0], WL, r[2])); });
    [[430, 540, D], [410, 520, 84], [372, 488, 62], [340, 456, 40], [326, 440, 18], [331, 435, 0]].forEach(function (r) { riv.push(Q(r[1], WL, r[2])); });
    o += pg(riv.join(' '), 'fill="url(#' + id + '-water)"');
    /* the stream in the gorge */
    o += pg([Q(-706, 10.6, 0), Q(-668, 10.6, 0), Q(-650, 10.6, 40), Q(-640, 10.6, D), Q(-660, 10.6, D), Q(-690, 10.6, 40)].join(' '), 'fill="url(#' + id + '-water)"');
    /* the road, a strip just behind the cut */
    o += pg(obliqueBand(road, -905, 300, 2, 7, 6), 'fill="' + C.road + '"');
    o += pg(obliqueBand(road, 450, 1250, 2, 7, 6), 'fill="' + C.road + '"');
    /* streets running back into the town and the downtown */
    [540, 600, 660, 760, 850, 940].forEach(function (sx) { o += pg([Q(sx, road(sx), 7), Q(sx + 4, road(sx), 7), Q(sx + 4, road(sx), D), Q(sx, road(sx), D)].join(' '), 'fill="' + C.road + '" opacity=".8"'); });
    /* blocks behind the town and downtown */
    var seed = 11, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (var bx = 528; bx < 1000; bx += 14) for (var dd = 16; dd < 96; dd += 20) {
      if (rnd() < .35 || (bx > 700 && bx < 760)) continue;
      var w = 8 + rnd() * 5, h = bx > 745 ? 10 + rnd() * 40 : 4 + rnd() * 6, dpt = 10;
      var z = road(bx) + 0.2;
      o += pg([Q(bx, z, dd), Q(bx + w, z, dd), Q(bx + w, z, dd + dpt), Q(bx, z, dd + dpt)].join(' '), 'fill="' + shade(C.bldg2, .9) + '"');
      o += pg([Q(bx + w, z, dd), Q(bx + w, z + h, dd), Q(bx + w, z + h, dd + dpt), Q(bx + w, z, dd + dpt)].join(' '), 'fill="' + shade(C.bldg2, .72) + '"');
      o += pg([Q(bx, z, dd), Q(bx + w, z, dd), Q(bx + w, z + h, dd), Q(bx, z + h, dd)].join(' '), 'fill="' + C.bldg1 + '"');
      o += pg([Q(bx, z + h, dd), Q(bx + w, z + h, dd), Q(bx + w, z + h, dd + dpt), Q(bx, z + h, dd + dpt)].join(' '), 'fill="' + shade(C.bldg1, 1.12) + '"');
    }
    /* trees scattered on the land */
    seed = 5;
    for (var t = 0; t < 140; t++) {
      var tx = X0 + 150 + rnd() * (1100 - X0), td = 8 + rnd() * (D - 12);
      if (tx > 320 && tx < 450) continue; if (tx > 520 && tx < 1010 && td < 100) continue; if (tx < -900) continue;
      var tz = surf(tx), ox = tx + OX * td, oz = tz + OZ * td, r = .9 + rnd() * 1.1;
      o += circ(ox, oz, r, 'fill="' + (rnd() < .5 ? C.tree1 : C.tree2) + '"');
    }
    /* the cut edge */
    o += pl(poly(surf, X0, 1251, 2), 'stroke="' + shade(C.land, .7) + '" stroke-width=".8" ' + NS);
    return '<g class="topsurface">' + o + '</g>';
  }
  function ground(id) {
    var o = '';
    o += pg(poly(rock, X0, X1) + ' ' + P(X1, -500) + ' ' + P(X0, -500), 'fill="url(#' + id + '-deep)"');
    o += pg(poly(rock, X0, X1) + ' ' + P(X1, -500) + ' ' + P(X0, -500), 'class="hatch" fill="url(#' + id + '-hrock)"');
    o += pg(band(clay, rock, X0, X1), 'fill="' + C.gravel + '"') + pg(band(clay, rock, X0, X1), 'class="hatch" fill="url(#' + id + '-hgrav)"');
    o += pg(band(alluv, clay, X0, X1), 'fill="' + C.clay + '"') + pg(band(alluv, clay, X0, X1), 'class="hatch" fill="url(#' + id + '-hclay)"');
    o += pg(band(surf, alluv, X0, 1251, 2), 'fill="' + C.alluv + '"') + pg(band(surf, alluv, X0, 1251, 2), 'class="hatch" fill="url(#' + id + '-hall)"');
    o += pg(band(surf, alluv, 1251, X1, 2), 'fill="' + C.marine + '"');
    var fillTop = function (x) { return surf(x); };
    var fillBot = function (x) { var s = surf(x); return s > 4 ? Math.max(s - 2.2, alluv(x)) : s; };
    o += pg(band(fillTop, fillBot, X0, 1200, 2), 'fill="' + C.fill + '"') + pg(band(fillTop, fillBot, X0, 1200, 2), 'class="hatch" fill="url(#' + id + '-hfill)"');
    o += pg(band(road, surf, 150, 300, 2), 'fill="' + C.fill + '" opacity=".92"') + pg(band(road, surf, 450, 530, 2), 'fill="' + C.fill + '" opacity=".92"');
    o += pl(poly(surf, X0, 331, 2), 'stroke="' + C.veg + '" stroke-width=".9" ' + NS);
    o += pl(poly(surf, 435, 1200, 2), 'stroke="' + C.veg + '" stroke-width=".9" ' + NS);
    o += pl(poly(surf, 331, 435, 2), 'stroke="' + C.earth2 + '" stroke-width=".7" ' + NS + ' opacity=".5"');
    o += pl(poly(road, -905, 300, 2), 'stroke="' + C.road + '" stroke-width="1.1"');
    o += pl(poly(road, 450, 1250, 2), 'stroke="' + C.road + '" stroke-width="1.1"');
    return '<g class="ground">' + o + '</g>';
  }

  function water(id) {
    var o = '';
    o += pg(band(function () { return WL; }, surf, 331, 435, 2), 'fill="url(#' + id + '-water)"');
    o += rect(343, -2.3, 4.2, 4.3, 'fill="#000" opacity=".16"') + rect(403, -5.6, 4.4, 7.6, 'fill="#000" opacity=".16"');
    o += line(331, WL, 435, WL, 'stroke="' + C.waterline + '" stroke-width=".6" ' + NS);
    o += '<g class="shimmer">' + line(350, WL - .6, 362, WL - .6, 'stroke="' + C.waterline + '" stroke-width=".35" opacity=".7"') + line(392, WL - 1.1, 409, WL - 1.1, 'stroke="' + C.waterline + '" stroke-width=".35" opacity=".55"') + line(372, WL - 1.7, 381, WL - 1.7, 'stroke="' + C.waterline + '" stroke-width=".35" opacity=".45"') + line(418, WL - .8, 428, WL - .8, 'stroke="' + C.waterline + '" stroke-width=".35" opacity=".6"') + '</g>';
    var shore = -1162;
    o += pg(band(function () { return RES; }, surf, shore, -900, 4), 'fill="url(#' + id + '-water)"');
    o += line(shore, RES, -900, RES, 'stroke="' + C.waterline + '" stroke-width=".6" ' + NS);
    o += '<g class="shimmer">' + line(-1080, RES - 2, -1040, RES - 2, 'stroke="' + C.waterline + '" stroke-width=".5" opacity=".6"') + line(-1000, RES - 4, -960, RES - 4, 'stroke="' + C.waterline + '" stroke-width=".5" opacity=".5"') + '</g>';
    o += pg(band(function () { return 32.5; }, surf, -830, -760, 2), 'fill="url(#' + id + '-water)"');
    o += pg(band(function () { return SEA; }, surf, 1251, X1, 4), 'fill="url(#' + id + '-sea)"');
    o += line(1251, SEA, X1, SEA, 'stroke="' + C.waterline + '" stroke-width=".7" ' + NS);
    o += '<g class="shimmer">' + line(1420, SEA - 1.5, 1470, SEA - 1.5, 'stroke="' + C.waterline + '" stroke-width=".5" opacity=".6"') + line(1600, SEA - 2.5, 1680, SEA - 2.5, 'stroke="' + C.waterline + '" stroke-width=".5" opacity=".5"') + line(1900, SEA - 1.2, 1990, SEA - 1.2, 'stroke="' + C.waterline + '" stroke-width=".5" opacity=".5"') + '</g>';
    return '<g class="water">' + o + '</g>';
  }

  /* ---------- the dam, powerhouse and reservoir ---------- */
  function dam(id) {
    var o = '';
    o += pg([Q(-830, 30, 0), Q(-830, 30, 60), Q(-892, CREST, 60), Q(-892, CREST, 0)].join(' '), 'fill="' + shade(C.conc2, .82) + '"');
    o += pg([Q(-900, CREST, 0), Q(-892, CREST, 0), Q(-892, CREST, 60), Q(-900, CREST, 60)].join(' '), 'fill="' + shade(C.conc1, 1.05) + '"');
    o += pg([P(-900, 30), P(-900, CREST), P(-892, CREST), P(-830, 30)].join(' '), 'fill="url(#' + id + '-conc)" stroke="' + C.conc3 + '" stroke-width=".2"');
    o += pg([P(-900, CREST), P(-897, CREST - 6), P(-889, CREST - 6), P(-886, CREST - 4.5), P(-892, CREST)].join(' '), 'fill="' + C.conc2 + '"');
    o += line(-900, CREST, -892, CREST, 'stroke="' + C.road + '" stroke-width=".9"') + rect(-900.6, CREST, 9.2, 1.1, 'fill="' + C.parapet + '"');
    o += rect(-893, 40, 2.4, 2.6, 'fill="' + C.rock2 + '" opacity=".6"') + rect(-891, 70, 2.4, 2.6, 'fill="' + C.rock2 + '" opacity=".6"') + rect(-889, 98, 2.4, 2.6, 'fill="' + C.rock2 + '" opacity=".6"');
    o += pg([P(-892, CREST), P(-830, 30), P(-836, 30), P(-893, CREST - 2)].join(' '), 'fill="#000" opacity=".12"');
    o += line(-897, 30, -897, -14, 'class="curtain" stroke="' + C.steel + '" stroke-width="1" stroke-dasharray="2 2" ' + NS);
    o += line(-888, 30, -888, 2, 'class="curtain" stroke="' + C.steel + '" stroke-width=".8" stroke-dasharray="1 2" ' + NS);
    o += rect(-918, 44, 3.4, 70, 'fill="url(#' + id + '-conc)" stroke="' + C.conc3 + '" stroke-width=".2"') + rect(-919, 114, 5.4, 2.4, 'fill="' + C.conc2 + '"');
    o += line(-916.3, 58, -900, 58, 'stroke="' + C.steel + '" stroke-width="2.2"') + pl([P(-900, 58), P(-868, 46), P(-826, 40)].join(' '), 'stroke="' + C.steel + '" stroke-width="2.2"');
    o += rect(-830, 32, 34, 16, 'fill="url(#' + id + '-bldg)" stroke="' + C.conc3 + '" stroke-width=".2"') + rect(-830.5, 48, 35, .8, 'fill="' + C.roof + '"');
    [-824, -816, -808].forEach(function (wx) { o += rect(wx, 38, 4, 6, 'fill="' + C.win + '" opacity=".7"'); });
    o += rect(-828, 32, 30, 4, 'fill="' + C.rock2 + '" opacity=".35"');
    [-790, -784, -778].forEach(function (tx) { o += rect(tx, 34.2, 3, 4, 'fill="' + C.ink2 + '"') + line(tx + 1.5, 38.2, tx + 1.5, 42, 'stroke="' + C.wire + '" stroke-width=".4"'); });
    o += line(-794, 43, -774, 43, 'stroke="' + C.wire + '" stroke-width=".5"');
    o += rect(-834, 29, 60, 1.2, 'fill="' + C.conc2 + '"');
    o += '<g class="spill">' + pg([P(-893, CREST - 6), P(-889, CREST - 6), P(-828.5, 30.5), P(-835, 30.5)].join(' '), 'fill="' + C.water1 + '" opacity=".75"') + pl([P(-891, CREST - 6), P(-831.5, 30.5)].join(' '), 'class="flow" stroke="' + C.waterline + '" stroke-width=".5" stroke-dasharray="2 3" ' + NS) + '<ellipse cx="-826" cy="' + n(Y(31.2)) + '" rx="5" ry="1.2" fill="' + C.waterline + '" opacity=".7"/><ellipse cx="-818" cy="' + n(Y(32.6)) + '" rx="3.4" ry=".9" fill="' + C.waterline + '" opacity=".5"/></g>';
    o += tree(-905, surf(-905) + 3, 2.4) + tree(-1180, surf(-1180), 3) + tree(-1230, surf(-1230), 2.6) + tree(-1120, surf(-1120), 2.2);
    return '<g class="dam">' + o + '</g>';
  }

  /* ---------- the valley: turbines, transmission line ---------- */
  function turbine(x, z, h, r, a0) {
    var o = pg([P(x - 1.6, z), P(x - .7, z + h), P(x + .7, z + h), P(x + 1.6, z)].join(' '), 'fill="' + C.conc1 + '" stroke="' + C.conc3 + '" stroke-width=".2"');
    o += rect(x - 2.2, z + h - 1.2, 5, 2.4, 'fill="' + C.conc2 + '"');
    o += '<g class="blades">';
    for (var k = 0; k < 3; k++) {
      var a = a0 + k * 2.0944;
      o += line(x, z + h, x + r * Math.cos(a), z + h + r * Math.sin(a), 'stroke="' + C.conc1 + '" stroke-width="1.1" stroke-linecap="round"') + line(x, z + h, x + r * Math.cos(a), z + h + r * Math.sin(a), 'stroke="' + C.conc3 + '" stroke-width=".3" stroke-linecap="round"');
    }
    o += circ(x, z + h, r, 'fill="none" stroke="none"') + '</g>';
    return o + circ(x, z + h, 1.1, 'fill="' + C.conc2 + '"');
  }
  function tower(x, z, h) {
    var w = h * .22, o = '<g stroke="' + C.ink2 + '" stroke-width=".3" fill="none" opacity=".9">';
    o += pl([P(x - w / 2, z), P(x - w * .11, z + h), P(x + w * .11, z + h), P(x + w / 2, z)].join(' '));
    for (var k = 1; k <= 6; k++) {
      var zz = z + h * k / 7, ww = w * (1 - k / 7 * .78), z2 = z + h * (k - 1) / 7, w2 = w * (1 - (k - 1) / 7 * .78);
      o += line(x - ww / 2, zz, x + ww / 2, zz) + line(x - w2 / 2, z2, x + ww / 2, zz) + line(x + w2 / 2, z2, x - ww / 2, zz);
    }
    o += line(x - w * .8, z + h * .72, x + w * .8, z + h * .72) + line(x - w * .62, z + h * .86, x + w * .62, z + h * .86) + '</g>';
    return o;
  }
  function catenary(xa, za, xb, zb, sag) {
    var pts = [];
    for (var i = 0; i <= 16; i++) { var t = i / 16; pts.push(P(xa + (xb - xa) * t, za + (zb - za) * t - sag * 4 * t * (1 - t))); }
    return pl(pts.join(' '), 'stroke="' + C.wire + '" stroke-width=".45" ' + NS + ' opacity=".8"');
  }
  var TOWERS = [[-780, 30], [-560, 30], [-340, 30], [-120, 30], [100, 30], [250, 34], [480, 36], [700, 30]];
  function powerline(id) {
    var o = '', i, k;
    for (i = 0; i < TOWERS.length; i++) {
      var t = TOWERS[i], base = surf(t[0]);
      o += tower(t[0], base, t[1]);
      if (i > 0) {
        var p = TOWERS[i - 1], pb = surf(p[0]), span = t[0] - p[0], sag = Math.min(14, 3 + span * span / 9000), dz = [0.72, 0.86], arm = [0.8, 0.62];
        for (k = 0; k < 2; k++) {
          o += catenary(p[0] - p[1] * .22 * arm[k], pb + p[1] * dz[k], t[0] - t[1] * .22 * arm[k], base + t[1] * dz[k], sag);
          o += catenary(p[0] + p[1] * .22 * arm[k], pb + p[1] * dz[k], t[0] + t[1] * .22 * arm[k], base + t[1] * dz[k], sag);
        }
      }
    }
    var sx = 724, sz = surf(730);
    o += rect(sx, sz, 24, .6, 'fill="' + C.conc2 + '"');
    [sx + 3, sx + 10, sx + 17].forEach(function (tx) { o += rect(tx, sz + .6, 4, 3.4, 'fill="' + C.ink2 + '"') + line(tx + 2, sz + 4, tx + 2, sz + 8, 'stroke="' + C.wire + '" stroke-width=".4"'); });
    o += line(sx + 1, sz + 8.5, sx + 23, sz + 8.5, 'stroke="' + C.wire + '" stroke-width=".5"') + line(sx + 1, sz, sx + 1, sz + 9, 'stroke="' + C.ink2 + '" stroke-width=".35"') + line(sx + 23, sz, sx + 23, sz + 9, 'stroke="' + C.ink2 + '" stroke-width=".35"');
    o += '<g class="turbines">' + turbine(-620, surf(-620), 55, 24, 0.5) + turbine(-520, surf(-520), 55, 24, 1.6) + '</g>';
    /* the gorge: a stream, and the road carried over it on a tall-pier viaduct */
    o += pg(band(function () { return 10.6; }, surf, -706, -668, 2), 'fill="url(#' + id + '-water)"');
    [-722, -690, -658].forEach(function (px) {
      var top = road(px) - 2.1, base = surf(px);
      o += pg([P(px - 1.4, top), P(px + 1.4, top), P(px + 2, base), P(px - 2, base)].join(' '), 'fill="url(#' + id + '-conc)"');
      o += rect(px - 4, base - 2, 8, 2.2, 'fill="url(#' + id + '-conc)" stroke="' + C.conc3 + '" stroke-width=".15"');
    });
    o += pg(band(function (x) { return road(x); }, function (x) { return road(x) - 2.1; }, -748, -626, 2), 'fill="url(#' + id + '-concv)"');
    o += pg(band(function (x) { return road(x) + 1; }, function (x) { return road(x); }, -748, -626, 2), 'fill="' + C.parapet + '" stroke="' + C.conc3 + '" stroke-width=".15"');
    o += pl(poly(function (x) { return road(x) - 2.1; }, -748, -626, 2), 'stroke="' + C.conc3 + '" stroke-width=".35"');
    /* a solar farm on the south-facing slope */
    for (var sx2 = -500; sx2 <= -436; sx2 += 12) {
      var sz2 = surf(sx2);
      o += line(sx2, sz2 + 1.2, sx2 + 8, sz2 + 3.6, 'stroke="#2f4858" stroke-width="1.3"') + line(sx2, sz2 + 1.2, sx2 + 8, sz2 + 3.6, 'stroke="#8fb3c4" stroke-width=".35"') + line(sx2 + 1, sz2, sx2 + 1, sz2 + 1.5, 'stroke="' + C.ink2 + '" stroke-width=".3"') + line(sx2 + 7, sz2, sx2 + 7, sz2 + 3.3, 'stroke="' + C.ink2 + '" stroke-width=".3"');
    }
    o += tree(-700, surf(-700), 2.4) + tree(-430, surf(-430), 2.6) + tree(-300, surf(-300), 2.2) + tree(-180, surf(-180), 2.8) + tree(-40, surf(-40), 2.4);
    return '<g class="powerline">' + o + '</g>';
  }

  /* ---------- the crossing ---------- */
  function pier(id, x, bedZ, rockZ) {
    var capTop = soffit(x) - 0.4, capBot = capTop - 1.5, pcTop = bedZ - 1.3, pcBot = pcTop - 2.5, o = '';
    [-3.6, -1.2, 1.2, 3.6].forEach(function (dx) { o += rect(x + dx - .45, rockZ - 1.2, .9, pcBot - (rockZ - 1.2), 'fill="url(#' + id + '-conc)"'); });
    o += rect(x - 5, pcBot, 10, 2.5, 'fill="url(#' + id + '-conc)" stroke="' + C.conc3 + '" stroke-width=".15"');
    o += pg([Q(x + 1.6, capBot, 0), Q(x + 1.6, capBot, 9), Q(x + 1.9, pcTop, 9), Q(x + 1.9, pcTop, 0)].join(' '), 'fill="' + shade(C.conc2, .8) + '"');
    o += pg([P(x - 1.6, capBot), P(x + 1.6, capBot), P(x + 1.9, pcTop), P(x - 1.9, pcTop)].join(' '), 'fill="url(#' + id + '-conc)"');
    o += rect(x - 2.6, capBot, 5.2, 1.5, 'fill="url(#' + id + '-conc)" stroke="' + C.conc3 + '" stroke-width=".15"');
    o += rect(x - 1.1, capTop, .9, .4, 'fill="' + C.ink2 + '"') + rect(x + .2, capTop, .9, .4, 'fill="' + C.ink2 + '"');
    o += rect(x - 2.7, capBot - 3, 5.4, 4.5, 'fill="url(#' + id + '-shade)"');
    return o;
  }
  function abutment(id, x, side) {
    var o = '', dir = side === 'A' ? -1 : 1, top = road(x), foot = 12;
    o += rect(side === 'A' ? x - 2.6 : x, foot, 2.6, top - foot, 'fill="url(#' + id + '-conc)"');
    o += rect(side === 'A' ? x - 7 : x - 1, foot - 1.5, 8, 1.5, 'fill="url(#' + id + '-conc)" stroke="' + C.conc3 + '" stroke-width=".15"');
    var wx = x + dir * 9, wz = surf(wx) + 1;
    o += pg([P(x + dir * 2.6, top - 1.2), P(x + dir * 2.6, top - 7), P(wx, Math.max(wz, foot)), P(wx, Math.max(wz, foot) + 1.2)].join(' '), 'fill="' + C.conc2 + '" opacity=".85"');
    o += rect(side === 'A' ? x - 1.8 : x + .4, top - .4, 1.4, .4, 'fill="' + C.ink2 + '"');
    return o;
  }
  function vehicle(x, w, h, kind, onRoad) {
    var z = onRoad ? road(x) : deckTop(x), o = rect(x, z + .5, w, h - .5, 'fill="' + C.ink + '" rx=".3"');
    if (kind === 'car') o += rect(x + 1.2, z + 1.2, 2, .9, 'fill="' + C.ink + '" rx=".2"');
    if (kind === 'truck') o += rect(x, z + .5, 2.4, 2, 'fill="' + C.ink2 + '"');
    return o + circ(x + .9, z + .45, .45, 'fill="' + C.ink + '"') + circ(x + w - .9, z + .45, .45, 'fill="' + C.ink + '"');
  }
  function deck(id) {
    var o = '', x, top = [], bot = [];
    for (x = 300; x <= 450; x += 2) top.push(P(x, deckTop(x)));
    for (x = 450; x >= 300; x -= 2) bot.push(P(x, soffit(x)));
    o += pg(obliqueBand(function (x) { return deckTop(x) + 1.1; }, 300, 450, 0, 11, 4), 'fill="' + shade(C.road, 1.35) + '"');
    o += pg(obliqueBand(function (x) { return deckTop(x) + 1.1; }, 300, 450, 0, 1.2, 4), 'fill="' + C.parapet + '"');
    o += pg(obliqueBand(function (x) { return deckTop(x) + 1.1; }, 300, 450, 9.8, 11, 4), 'fill="' + C.parapet + '"');
    o += pl(obliqueBand(function (x) { return deckTop(x) + 1.1; }, 300, 450, 5.4, 5.6, 4), 'stroke="#efe9dc" stroke-width=".25" stroke-dasharray="3 2"');
    o += pg(top.join(' ') + ' ' + bot.join(' '), 'fill="url(#' + id + '-concv)"');
    o += pl(poly(soffit, 300, 450, 2), 'stroke="' + C.conc3 + '" stroke-width=".4"') + pl(poly(function (x) { return deckTop(x) - .6; }, 300, 450, 2), 'stroke="' + C.conc3 + '" stroke-width=".25" opacity=".7"');
    o += pl(poly(deckTop, 300, 450, 2), 'stroke="' + C.road + '" stroke-width="1"');
    o += pg(band(function (x) { return deckTop(x) + 1.1; }, deckTop, 300, 450, 2), 'fill="' + C.parapet + '" stroke="' + C.conc3 + '" stroke-width=".15"');
    for (x = 302; x <= 448; x += 6) o += rect(x - .2, deckTop(x) + .5, .4, .6, 'fill="' + C.conc3 + '"');
    o += pl(poly(function (x) { return soffit(x) - .55; }, 302, 448, 2), 'class="main main-deck" stroke="' + C.steel + '" stroke-width=".7"');
    [312, 350, 388, 426].forEach(function (lx) { var z0 = deckTop(lx) + 1.1; o += line(lx, z0, lx, z0 + 8.6, 'stroke="' + C.ink2 + '" stroke-width=".3"') + line(lx, z0 + 8.6, lx + 2.2, z0 + 8.9, 'stroke="' + C.ink2 + '" stroke-width=".3"') + rect(lx + 1.8, z0 + 8.6, 1.1, .4, 'fill="' + C.ink2 + '"') + '<g class="lights">' + circ(lx + 2.3, z0 + 8.3, 3.2, 'fill="#ffd27a" opacity=".35"') + circ(lx + 2.3, z0 + 8.5, .7, 'fill="#fff1c2"') + '</g>'; });
    o += '<g class="car-moving">' + vehicle(296, 4.4, 1.5, 'car', true) + '</g>' + vehicle(366, 8.5, 3.2, 'truck') + vehicle(424, 4.4, 1.5, 'car') + vehicle(586, 10, 2.9, 'bus', true) + vehicle(-300, 4.4, 1.5, 'car', true) + vehicle(-690, 8.5, 3.2, 'truck', true) + vehicle(860, 4.4, 1.5, 'car', true) + vehicle(1100, 8.5, 3.2, 'truck', true);
    return '<g class="deck">' + o + '</g>';
  }
  function bridge(id) { return '<g class="bridge">' + abutment(id, 300, 'A') + abutment(id, 450, 'B') + pier(id, 345, surf(345), rock(345)) + pier(id, 405, surf(405), rock(405)) + deck(id) + '</g>'; }

  /* ---------- buildings ---------- */
  function building(id, x, w, h, kind, base, glass) {
    var z = base, dp = Math.min(22, Math.max(8, w * .8)), o = '';
    var sideCol = glass ? shade(C.glass2, .78) : shade(C.bldg2, .78), roofCol = glass ? shade(C.glass1, 1.08) : shade(C.bldg1, 1.1);
    /* side face and roof top first, then the front face over them */
    o += pg([Q(x + w, z, 0), Q(x + w, z, dp), Q(x + w, z + h, dp), Q(x + w, z + h, 0)].join(' '), 'fill="' + sideCol + '"');
    if (kind === 'pitch') {
      o += pg([Q(x + w, z + h, 0), Q(x + w, z + h, dp), Q(x + w / 2, z + h + w * .32, dp), Q(x + w / 2, z + h + w * .32, 0)].join(' '), 'fill="' + shade(C.roof, 1.18) + '"');
      o += pg([Q(x, z + h, 0), Q(x, z + h, dp), Q(x + w / 2, z + h + w * .32, dp), Q(x + w / 2, z + h + w * .32, 0)].join(' '), 'fill="' + shade(C.roof, .85) + '"');
      o += pg([P(x - .4, z + h), P(x + w / 2, z + h + w * .32), P(x + w + .4, z + h)].join(' '), 'fill="' + C.roof + '"');
    } else if (kind === 'spire') {
      o += pg([Q(x, z + h, 0), Q(x + w, z + h, 0), Q(x + w, z + h, dp), Q(x, z + h, dp)].join(' '), 'fill="' + roofCol + '"');
      o += pg([P(x - .3, z + h), P(x + w / 2, z + h + w * 1.6), P(x + w + .3, z + h)].join(' '), 'fill="' + C.roof + '"');
    } else {
      o += pg([Q(x, z + h, 0), Q(x + w, z + h, 0), Q(x + w, z + h, dp), Q(x, z + h, dp)].join(' '), 'fill="' + roofCol + '" stroke="' + shade(roofCol, .8) + '" stroke-width=".15"');
      if (glass && h > 60) o += pg([Q(x + 2, z + h + .4, 2), Q(x + w - 2, z + h + .4, 2), Q(x + w - 2, z + h + .4, dp - 2), Q(x + 2, z + h + .4, dp - 2)].join(' '), 'fill="' + shade(roofCol, .9) + '"');
    }
    o += rect(x, z, w, h, 'fill="url(#' + id + (glass ? '-glass' : '-bldg') + ')"');
    var lit = '', seed = Math.round(x * 7 + h * 3), rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    if (glass) {
      o += rect(x + .6, z + 1, w - 1.2, h - 2, 'fill="url(#' + id + '-hglass)"') + rect(x + w * .62, z, w * .38, h, 'fill="#000" opacity=".12"');
      if (h > 80) o += rect(x + w / 2 - 1, z + h + .5, 2, h * .12, 'fill="' + C.conc2 + '"') + line(x + w / 2, z + h + h * .12, x + w / 2, z + h + h * .2, 'stroke="' + C.ink2 + '" stroke-width=".5"') + circ(x + w / 2, z + h + h * .2, .8, 'class="beacon" fill="' + C.accent + '"');
      for (var gi = 0; gi < Math.floor((w - 1.2) / 2.6); gi++) for (var gj = 0; gj < Math.floor((h - 2) / 3.4); gj++) if (rnd() < .3) lit += rect(x + .9 + gi * 2.6, z + 1.3 + gj * 3.4, 2, 2.5, 'fill="#ffd27a"');
    } else {
      var cols = Math.max(1, Math.floor(w / 3.2)), rows = Math.max(1, Math.floor((h - 1.5) / 3)), i, j, gx = w / cols, gz = (h - 1.2) / rows;
      for (i = 0; i < cols; i++) for (j = 0; j < rows; j++) { o += rect(x + i * gx + gx * .3, z + .9 + j * gz + gz * .25, gx * .4, gz * .5, 'fill="' + C.win + '" opacity=".85"'); if (rnd() < .5) lit += rect(x + i * gx + gx * .3, z + .9 + j * gz + gz * .25, gx * .4, gz * .5, 'fill="#ffd27a"'); }
    }
    return o + '<g class="lights">' + lit + '</g>';
  }
  function tree(x, z, r) { return line(x, z, x, z + r * 1.2, 'stroke="' + C.trunk + '" stroke-width=".5"') + circ(x, z + r * 1.5, r, 'fill="' + C.tree1 + '"') + circ(x - r * .35, z + r * 1.35, r * .75, 'fill="' + C.tree2 + '"'); }
  function town(id) {
    var b = 22.6, o = tree(521, surf(521), 2.4);
    o += building(id, 528, 18, 11, 'flat', b) + building(id, 550, 16, 8, 'pitch', b) + tree(569.5, b, 1.8) + building(id, 573, 22, 14, 'flat', b) + building(id, 598, 9, 22, 'spire', b) + building(id, 610, 26, 9, 'pitch', b) + tree(639, b, 2.2) + building(id, 644, 19, 12, 'flat', b) + building(id, 666, 30, 7, 'pitch', b) + building(id, 700, 16, 10, 'flat', b) + tree(720, surf(720), 2.4);
    return '<g class="town">' + o + '</g>';
  }
  function downtown(id) {
    var b = 20.6, o = '';
    o += rect(806, 9, 28, 11.6, 'fill="' + C.conc2 + '" stroke="' + C.conc3 + '" stroke-width=".2"');
    [9, 12.8, 16.6].forEach(function (lz) { o += line(806, lz, 834, lz, 'stroke="' + C.conc3 + '" stroke-width=".3"'); });
    o += rect(805, 7.5, 30, 1.5, 'fill="url(#' + id + '-conc)"');
    [-11, -7, -3, 1, 5, 9, 13].forEach(function (dx) { o += rect(820 + dx - .5, rock(820) - 1.5, 1, 7.5 - (rock(820) - 1.5), 'fill="url(#' + id + '-conc)"'); });
    o += rect(779, 17.4, 22, 1.6, 'fill="url(#' + id + '-conc)"') + rect(903, 17.8, 28, 1.4, 'fill="url(#' + id + '-conc)"');
    [-10, -4, 2, 8].forEach(function (dx) { o += rect(917 + dx - .4, 4, .8, 13.8, 'fill="url(#' + id + '-conc)"'); });
    o += building(id, 752, 22, 58, 'flat', b, true) + building(id, 780, 20, 86, 'flat', b, true) + building(id, 806, 28, 124, 'flat', b, true) + building(id, 842, 22, 66, 'flat', b, false) + building(id, 872, 24, 44, 'flat', b, false) + building(id, 904, 26, 98, 'flat', b, true) + building(id, 936, 20, 52, 'flat', b, false) + building(id, 962, 24, 36, 'pitch', b, false) + building(id, 990, 16, 28, 'flat', b, false);
    o += tree(747, b, 2) + tree(868, b, 1.8) + tree(933, b, 1.8) + tree(1010, surf(1010), 2.4);
    o += '<g class="metro">';
    o += rect(732, -10, 118, 7, 'fill="' + C.paper + '" fill-opacity=".9" stroke="' + C.conc3 + '" stroke-width=".35"') + rect(905, -10, 108, 7, 'fill="' + C.paper + '" fill-opacity=".9" stroke="' + C.conc3 + '" stroke-width=".35"');
    o += line(732, -9.2, 850, -9.2, 'stroke="' + C.ink2 + '" stroke-width=".3"') + line(905, -9.2, 1013, -9.2, 'stroke="' + C.ink2 + '" stroke-width=".3"');
    o += rect(850, -13, 55, 33.6, 'fill="' + C.paper + '" fill-opacity=".92" stroke="' + C.conc3 + '" stroke-width=".4"');
    o += line(850, 8, 905, 8, 'stroke="' + C.conc3 + '" stroke-width=".35"') + line(850, -2, 905, -2, 'stroke="' + C.conc3 + '" stroke-width=".35"');
    o += '<g class="train">' + rect(858, -9.2, 10, 3.2, 'fill="' + C.ink2 + '" rx=".4"') + rect(869, -9.2, 10, 3.2, 'fill="' + C.ink2 + '" rx=".4"') + rect(880, -9.2, 10, 3.2, 'fill="' + C.ink2 + '" rx=".4"') + '</g>';
    o += line(860, -2, 868, 8, 'stroke="' + C.ink2 + '" stroke-width=".3"') + line(884, 8, 892, 20.6, 'stroke="' + C.ink2 + '" stroke-width=".3"') + '</g>';
    return '<g class="downtown">' + o + '</g>';
  }
  function plant(id) {
    var o = '', z = function (x) { return road(x) - .3; };
    [120, 146].forEach(function (cx) { o += rect(cx - 10, z(cx), 20, 3.2, 'fill="url(#' + id + '-conc)" stroke="' + C.conc3 + '" stroke-width=".15"') + line(cx, z(cx) + 3.2, cx, z(cx) + 5.2, 'stroke="' + C.ink2 + '" stroke-width=".3"') + line(cx - 9.5, z(cx) + 5.2, cx + 9.5, z(cx) + 5.2, 'stroke="' + C.ink2 + '" stroke-width=".3"'); });
    o += rect(165, z(180), 36, 6.5, 'fill="url(#' + id + '-bldg)"') + rect(164.6, z(180) + 6.5, 36.8, .5, 'fill="' + C.roof + '"') + rect(188, z(180) + 7, 6, 2.2, 'fill="' + C.bldg2 + '"');
    [170, 178, 186, 194].forEach(function (wx) { o += rect(wx, z(180) + 2.4, 2, 2.2, 'fill="' + C.win + '" opacity=".85"'); });
    o += rect(238, z(238), 1.8, 22, 'fill="' + C.conc2 + '"') + '<ellipse cx="238.9" cy="' + n(Y(z(238) + 25)) + '" rx="5.2" ry="3.4" fill="url(#' + id + '-concv)" stroke="' + C.conc3 + '" stroke-width=".15"/>';
    o += tree(104, z(104), 2.2) + tree(212, z(212), 2.4) + tree(262, road(262) - .2, 2) + tree(282, surf(282), 2.4);
    return '<g class="plant">' + o + '</g>';
  }

  /* ---------- the ridge tunnel and the port ---------- */
  function tunnel(id) {
    var o = rect(1030, 16, 145, 10, 'fill="' + C.paper + '" fill-opacity=".92" stroke="' + C.conc3 + '" stroke-width=".4"');
    o += line(1030, 16.6, 1175, 16.6, 'stroke="' + C.road + '" stroke-width="1"') + line(1030, 25.2, 1175, 25.2, 'stroke="' + C.conc3 + '" stroke-width=".3"');
    for (var x = 1034; x < 1175; x += 8) o += rect(x, 24.2, .6, .4, 'fill="' + C.ink2 + '"');
    o += rect(1026, 14, 5, 16, 'fill="url(#' + id + '-conc)" stroke="' + C.conc3 + '" stroke-width=".2"') + rect(1174, 14, 5, 15, 'fill="url(#' + id + '-conc)" stroke="' + C.conc3 + '" stroke-width=".2"');
    o += '<g class="bolts">';
    for (x = 1040; x < 1170; x += 10) o += line(x, 26, x, 30, 'stroke="' + C.steel + '" stroke-width=".4" ' + NS);
    o += '</g>' + tree(1050, surf(1050), 2.2) + tree(1095, surf(1095), 2.6) + tree(1130, surf(1130), 2.2) + tree(1160, surf(1160), 2);
    return '<g class="tunnel">' + o + '</g>';
  }
  function port(id) {
    var o = pg(band(function () { return 10; }, surf, 1200, 1250, 2), 'fill="' + C.fill + '" opacity=".92"');
    o += rect(1236, -14, 16, 24, 'fill="url(#' + id + '-conc)" stroke="' + C.conc3 + '" stroke-width=".25"') + pg(obliqueBand(function () { return 10.2; }, 1200, 1252, 0, 40, 8), 'fill="' + shade(C.conc1, .96) + '"') + rect(1200, 9.2, 52, 1, 'fill="' + C.conc1 + '"') + rect(1251.4, 1, 1.2, 8, 'fill="' + C.ink + '" rx=".4"');
    [1206, 1222, 1238].forEach(function (bx) { o += rect(bx, 10.2, 1.6, 1, 'fill="' + C.ink2 + '"'); });
    o += pg([P(1230, -14), P(1258, -14), P(1262, -17), P(1226, -17)].join(' '), 'fill="' + C.gravel + '"');
    function crane(x) {
      var z = 10.2, h = 42, o2 = '<g stroke="' + C.ink2 + '" stroke-width=".5" fill="none">';
      o2 += line(x, z, x, z + h) + line(x + 12, z, x + 12, z + h) + line(x, z + h * .5, x + 12, z + h * .5) + line(x, z + h, x + 12, z + h);
      o2 += line(x - 2, z + h, x + 60, z + h) + line(x + 6, z + h + 10, x + 56, z + h) + line(x + 6, z + h + 10, x - 2, z + h) + line(x + 6, z + h, x + 6, z + h + 10) + '</g>';
      o2 += rect(x + 2, z + h - 4, 8, 4, 'fill="' + C.ink2 + '"') + '<g class="trolley">' + rect(x + 34, z + h - 2.4, 4, 2.4, 'fill="' + C.ink2 + '"') + line(x + 36, z + h - 2.4, x + 36, z + 14, 'stroke="' + C.ink2 + '" stroke-width=".35"') + rect(x + 32, z + 12, 8, 2, 'fill="' + C.box1 + '"') + '</g>';
      return o2;
    }
    o += crane(1205) + crane(1230);
    var hz = -8, dz = 6;
    o += pg([P(1262, dz), P(1262, hz + 2), P(1268, hz), P(1372, hz), P(1392, hz + 6), P(1398, dz)].join(' '), 'fill="' + C.hull + '"');
    o += pg([P(1262, hz + 2), P(1268, hz), P(1372, hz), P(1392, hz + 6), P(1392, -1), P(1262, -1)].join(' '), 'fill="' + C.hull2 + '"');
    o += rect(1262, dz - .9, 136, .9, 'fill="' + C.conc2 + '"') + rect(1276, dz, 16, 16, 'fill="' + C.conc1 + '" stroke="' + C.conc3 + '" stroke-width=".2"') + rect(1279, dz + 16, 10, 4, 'fill="' + C.conc2 + '"') + rect(1292.5, dz, 3, 11, 'fill="' + C.ink2 + '"');
    [1276, 1280, 1284, 1288].forEach(function (wx) { for (var k = 0; k < 4; k++) o += rect(wx + .6, dz + 2 + k * 3.4, 2.4, 1.6, 'fill="' + C.win + '" opacity=".8"'); });
    var cols = [C.box1, C.box2, C.box3, C.conc2];
    for (var bx = 1300; bx < 1380; bx += 6.2) for (var k = 0; k < 3; k++) o += rect(bx, dz + k * 2.6, 5.8, 2.4, 'fill="' + cols[(Math.round(bx / 6.2) + k) % 4] + '" opacity=".92"');
    o += pg([P(1480, surf(1480)), P(1512, 5), P(1526, 5), P(1560, surf(1560))].join(' '), 'fill="' + C.gravel + '" stroke="' + C.conc3 + '" stroke-width=".2"') + pg([P(1480, surf(1480)), P(1512, 5), P(1526, 5), P(1560, surf(1560))].join(' '), 'fill="url(#' + id + '-hgrav)"');
    o += rect(1516, 5, 6, 2.2, 'fill="' + C.conc2 + '"') + line(1519, 7.2, 1519, 11, 'stroke="' + C.ink2 + '" stroke-width=".5"') + circ(1519, 11.5, .9, 'fill="' + C.accent + '"');
    o += circ(1440, 0.8, 1.2, 'fill="' + C.accent + '"') + line(1440, 0.8, 1440, -14, 'stroke="' + C.ink2 + '" stroke-width=".25" stroke-dasharray="1 1"');
    o += pl([P(1000, 17), P(1190, -4), P(1300, -14)].join(' '), 'class="sewer" stroke="' + C.sewer + '" stroke-width=".9"');
    return '<g class="port">' + o + '</g>';
  }

  function utilities() {
    var o = pl(poly(function (x) { return road(x) - 1.9; }, -900, 168, 4), 'class="main raw" stroke="' + C.steel + '" stroke-width=".7" stroke-dasharray="3 1.5"');
    o += pl(poly(function (x) { return road(x) - 1.6; }, 170, 298, 2), 'class="main" stroke="' + C.steel + '" stroke-width=".7"') + pl(poly(function (x) { return road(x) - 1.6; }, 452, 1000, 2), 'class="main" stroke="' + C.steel + '" stroke-width=".7"');
    [230, 478, 760, 900].forEach(function (vx) { o += rect(vx - .9, road(vx) - 2.3, 1.8, 1.8, 'class="main" fill="none" stroke="' + C.steel + '" stroke-width=".3"'); });
    o += pl([P(560, 20.2), P(500, 16.6), P(446, 5.6)].join(' '), 'class="sewer" stroke="' + C.sewer + '" stroke-width=".9"') + rect(437.2, 4.1, 3.6, 3.2, 'class="sewer" fill="' + C.conc2 + '" stroke="' + C.conc3 + '" stroke-width=".15"') + circ(438.6, 5.5, .55, 'fill="' + C.ink2 + '"');
    return '<g class="utilities">' + o + '</g>';
  }

  /* ---------- knowledge layers ---------- */
  function boreholes() {
    var o = '';
    [[282, surf(282)], [352, surf(352)], [398, surf(398)], [462, surf(462)]].forEach(function (h) {
      var x = h[0], top = h[1], bottom = rock(x) - 2, w = 2.4, o2 = '';
      var seg = function (z1, z2, col) { if (z1 <= z2) return ''; return rect(x - w / 2, z2, w, z1 - z2, 'fill="' + col + '"'); };
      var fillB = top > 4 ? Math.max(top - 2.2, alluv(x)) : top;
      o2 += seg(top, fillB, C.fill) + seg(fillB, Math.min(fillB, alluv(x)), C.alluv) + seg(alluv(x), clay(x), C.clay) + seg(clay(x), rock(x), C.gravel) + seg(rock(x), bottom, C.rock);
      o2 += rect(x - w / 2, bottom, w, top - bottom, 'fill="none" stroke="' + C.ink + '" stroke-width=".35" ' + NS);
      if (top < WL) o2 += line(x, top, x, WL + 1.2, 'stroke="' + C.ink + '" stroke-width=".5" ' + NS) + rect(x - 3, WL - .3, 6, .9, 'fill="' + C.ink2 + '"');
      o += '<g class="bh">' + o2 + '</g>';
    });
    return '<g class="layer boreholes">' + o + '</g>';
  }
  var ID = '';
  function strataLines() {
    var o = pl(poly(alluv, 232, 580, 3), 'class="strat" pathLength="1" stroke="' + C.ink + '" stroke-width="1.1" ' + NS) + pl(poly(clay, 232, 580, 3), 'class="strat" pathLength="1" stroke="' + C.ink + '" stroke-width="1.1" ' + NS) + pl(poly(rock, 232, 580, 3), 'class="strat" pathLength="1" stroke="' + C.ink + '" stroke-width="1.1" ' + NS);
    o += pl(poly(gw, 232, 331, 3), 'class="gwl" stroke="' + C.steel + '" stroke-width="1" stroke-dasharray="4 3" ' + NS) + pl(poly(gw, 435, 580, 3), 'class="gwl" stroke="' + C.steel + '" stroke-width="1" stroke-dasharray="4 3" ' + NS);
    [250, 275, 300].forEach(function (ax) { o += line(ax, gw(ax) - 3, ax + 9, gw(ax + 9) - 3.6, 'class="seep" stroke="' + C.steel + '" stroke-width=".9" ' + NS + ' marker-end="url(#' + ID + '-arr)"'); });
    [505, 480, 455].forEach(function (ax) { o += line(ax, gw(ax) - 3, ax - 9, gw(ax - 9) - 3.6, 'class="seep" stroke="' + C.steel + '" stroke-width=".9" ' + NS + ' marker-end="url(#' + ID + '-arr)"'); });
    return '<g class="layer strata">' + o + '</g>';
  }
  function structureModel(id) {
    var o = '', x, cl = function (x) { return deckTop(x) - 1.2; };
    for (x = 306; x <= 444; x += 6) o += line(x, cl(x) + 7.5, x, cl(x) + 2.2, 'stroke="' + C.ink + '" stroke-width=".9" ' + NS + ' marker-end="url(#' + id + '-arr)"');
    o += pl(poly(function (x) { return cl(x) + 7.5; }, 306, 444, 2), 'stroke="' + C.ink + '" stroke-width="1" ' + NS);
    o += pl(poly(cl, 300, 450, 2), 'class="member" pathLength="1" stroke="' + C.accent + '" stroke-width="2.2" ' + NS);
    [[300, 'pin'], [345, 'roller'], [405, 'roller'], [450, 'roller']].forEach(function (s) {
      var sx = s[0], sz = cl(sx);
      o += circ(sx, sz, 1.1, 'fill="' + C.paper + '" stroke="' + C.ink + '" stroke-width="1.2" ' + NS) + pg([P(sx, sz - 1.1), P(sx - 2.2, sz - 4.4), P(sx + 2.2, sz - 4.4)].join(' '), 'fill="' + C.paper + '" stroke="' + C.ink + '" stroke-width="1.1" ' + NS);
      if (s[1] === 'roller') o += circ(sx - 1.2, sz - 5.2, .7, 'fill="none" stroke="' + C.ink + '" stroke-width="1" ' + NS) + circ(sx + 1.2, sz - 5.2, .7, 'fill="none" stroke="' + C.ink + '" stroke-width="1" ' + NS);
      else o += line(sx - 2.8, sz - 4.4, sx + 2.8, sz - 4.4, 'stroke="' + C.ink + '" stroke-width="1.1" ' + NS);
    });
    var L1 = 45, L2 = 60, w = 1, M = -w * (L1 * L1 * L1 + L2 * L2 * L2) / 4 / (2 * L1 + 3 * L2);
    var spans = [[300, 345, 0, M], [345, 405, M, M], [405, 450, M, 0]], pts = [], k = 0.05, base = function (x) { return cl(x) - 8; };
    spans.forEach(function (s) { var L = s[1] - s[0]; for (var i = 0; i <= 24; i++) { var xx = s[0] + L * i / 24, u = L * i / 24, m = s[2] * (1 - u / L) + s[3] * (u / L) + w * u * (L - u) / 2; pts.push(P(xx, base(xx) - m * k)); } });
    o += pl(poly(base, 300, 450, 10), 'stroke="' + C.ink + '" stroke-width=".8" ' + NS + ' opacity=".6"');
    o += pg(pts.join(' ') + ' ' + P(450, base(450)) + ' ' + P(300, base(300)), 'class="moment" fill="' + C.accent + '" fill-opacity=".16" stroke="' + C.accent + '" stroke-width="1.2" ' + NS);
    return '<g class="layer structure">' + o + '</g>';
  }
  function floodAndScour() {
    var o = '<g class="flood">' + line(250, FLOOD, 540, FLOOD, 'stroke="' + C.accentInk + '" stroke-width="1.2" stroke-dasharray="7 4" ' + NS) + '</g>';
    var hole = function (depth) { return pg([P(394, surf(394)), P(398, surf(398) - depth * .55), P(402, surf(402) - depth), P(409, surf(409) - depth), P(414, surf(414) - depth * .5), P(418, surf(418))].join(' '), 'fill="' + C.water2 + '" stroke="' + C.accent + '" stroke-width="1.1" ' + NS); };
    o += '<g class="scour scour-a">' + hole(2.1) + '</g><g class="scour scour-b">' + hole(3.0) + '</g>';
    o += pg(band(function () { return FLOOD2; }, function (x) { return Math.min(surf(x), FLOOD2); }, 314, 446, 2), 'class="floodwater" fill="' + C.water1 + '" opacity=".55"');
    return '<g class="layer hydro">' + o + '</g>';
  }
  function drawingFragment(id) {
    var x = 405, capTop = soffit(x) - .4, capBot = capTop - 1.5, pcTop = surf(x) - 1.3, pcBot = pcTop - 2.5, tip = rock(x) - 1.2;
    var o = '', L = 'stroke="' + C.ink + '" stroke-width="1" ' + NS + ' fill="none"';
    o += rect(x - 15, tip - 5, 30, capTop + 4 - (tip - 5), 'fill="' + C.paper + '" fill-opacity=".6" stroke="' + C.ink + '" stroke-width=".8" ' + NS);
    o += rect(x - 2.6, capBot, 5.2, 1.5, L) + pg([P(x - 1.6, capBot), P(x + 1.6, capBot), P(x + 1.9, pcTop), P(x - 1.9, pcTop)].join(' '), L) + rect(x - 5, pcBot, 10, 2.5, L);
    [-3.6, -1.2, 1.2, 3.6].forEach(function (dx) { o += rect(x + dx - .45, tip, .9, pcBot - tip, L) + rect(x + dx - .45, tip, .9, pcBot - tip, 'fill="url(#' + id + '-hdraw)"'); });
    o += pl([P(x - 14, surf(394)), P(x - 6, surf(399)), P(x + 6, surf(411)), P(x + 14, surf(419))].join(' '), 'stroke="' + C.ink + '" stroke-width=".8" stroke-dasharray="3 2" ' + NS + ' fill="none"');
    var D = 'stroke="' + C.ink + '" stroke-width=".8" ' + NS + ' marker-start="url(#' + id + '-tick)" marker-end="url(#' + id + '-tick)"';
    o += line(x + 9, capTop, x + 9, pcTop, D) + line(x + 9, pcTop, x + 9, tip, D) + line(x - 5, pcBot - 2, x + 5, pcBot - 2, D) + line(x - 1.6, capTop + 3, x + 1.6, capTop + 3, D);
    o += line(x + 3, capTop, x + 10, capTop, 'stroke="' + C.ink + '" stroke-width=".5" ' + NS) + line(x + 3, pcTop, x + 10, pcTop, 'stroke="' + C.ink + '" stroke-width=".5" ' + NS) + line(x + 5, tip, x + 10, tip, 'stroke="' + C.ink + '" stroke-width=".5" ' + NS);
    return '<g class="layer drawing"><g class="sheet">' + o + '</g></g>';
  }
  function changeFlags() {
    var o = '', src = [302, FLOOD2];
    [[405, -7.5], [405, -20], [375, 17], [318, 12.6], [438.6, 5.5]].forEach(function (t) { o += line(src[0], src[1], t[0], t[1], 'stroke="' + C.accent + '" stroke-width="1" stroke-dasharray="3 3" ' + NS + ' opacity=".75" pathLength="1" class="lead"'); });
    o += line(375, FLOOD2, 375, soffit(375), 'stroke="' + C.accentInk + '" stroke-width="1" ' + NS);
    return '<g class="layer change">' + o + '</g>';
  }
  function routes() {
    var waterR = poly(function (x) { return road(x) - 1.9; }, -900, 168, 6) + ' ' + poly(function (x) { return road(x) - 1.6; }, 170, 298, 4) + ' ' + poly(function (x) { return soffit(x) - .55; }, 302, 448, 4) + ' ' + poly(function (x) { return road(x) - 1.6; }, 452, 1000, 6);
    var powerR = TOWERS.map(function (t) { return P(t[0], surf(t[0]) + t[1] * .86); }).join(' ');
    var roadR = poly(function (x) { return road(x) + 1.2; }, -900, 300, 6) + ' ' + poly(function (x) { return deckTop(x) + 1.2; }, 300, 450, 4) + ' ' + poly(function (x) { return road(x) + 1.2; }, 450, 1250, 6);
    return '<g class="layer routes">' + pl(waterR, 'class="route" pathLength="1" stroke="' + C.steel + '" stroke-width="2.2" ' + NS) + pl(powerR, 'class="route" pathLength="1" stroke="' + C.accent + '" stroke-width="2" ' + NS) + pl(roadR, 'class="route" pathLength="1" stroke="' + C.ink + '" stroke-width="2" ' + NS) + '</g>';
  }

  /* ---------- annotations: pixel-sized, pinned to world points ---------- */
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function pin(cls, x, z, dx, dy, text, sub, opts) {
    opts = opts || {};
    var o = '<g class="ann ' + cls + (opts.flag ? ' flag' : '') + (opts.minor ? ' minor' : '') + '" data-x="' + n(x) + '" data-z="' + n(z) + '">';
    if (!opts.nodot) o += '<circle r="3.2" class="dot"/>';
    o += '<line x1="0" y1="0" x2="' + dx + '" y2="' + dy + '" class="stalk"/>';
    var w = Math.max(text.length, (sub || '').length * .92) * 6.9 + 18, h = sub ? 34 : 22, ax = dx >= 0 ? 0 : -w, ay = -h / 2;
    o += '<g transform="translate(' + dx + ',' + dy + ')"><rect class="chip" x="' + ax + '" y="' + ay + '" width="' + w + '" height="' + h + '" rx="1"/>' +
      '<text class="t1" x="' + (ax + 9) + '" y="' + (ay + 15) + '">' + esc(text) + '</text>' + (sub ? '<text class="t2" x="' + (ax + 9) + '" y="' + (ay + 28) + '">' + esc(sub) + '</text>' : '') + '</g></g>';
    return o;
  }
  function marker(cls, x, z, num, text) {
    var w = text.length * 7.4 + 44;
    return '<g class="ann mark ' + cls + '" data-x="' + n(x) + '" data-z="' + n(z) + '"><line x1="0" y1="0" x2="0" y2="-34" class="stalk"/><g transform="translate(0,-48)"><rect class="chip" x="-14" y="-14" width="' + w + '" height="28" rx="14"/><circle cx="0" cy="0" r="10" class="num"/><text class="tn" x="0" y="4" text-anchor="middle">' + num + '</text><text class="t1" x="18" y="4.5">' + esc(text) + '</text></g></g>';
  }
  function annotations() {
    var o = '';
    o += pin('s1', -1000, RES, 16, 36, 'The reservoir', 'water level, measured daily');
    o += pin('s1', -896, CREST - 6, 50, -36, 'The spillway', 'where floodwater goes over');
    o += pin('s1', -897, 14, -60, 6, 'Sealed rock under the dam', 'from the construction records');
    o += pin('s1', -813, 48, 44, -30, 'The power station', 'water from the dam drives it', { minor: true });
    o += pin('s1', -888, 44, 60, 30, 'Water pressure under the dam', 'measured inside the dam', { minor: true });
    o += pin('s2', -450, surf(-450) + 24.5, 0, -46, 'Power lines sag in heat', 'from the line study', { nodot: true });
    o += pin('s2', -340, surf(-340) + 1, 40, 30, 'Tower footing', 'four concrete pads', { minor: true });
    o += pin('s2', -520, surf(-520) + 55, 44, -8, 'Wind turbines', 'two years of wind data');
    o += pin('s2', -270, road(-270) - 1.9, -30, 44, 'Water pipe, 900 mm', 'reservoir to the treatment plant');
    o += pin('s2', -690, road(-690) - 2.1, -40, 40, 'Road bridge over the gorge', 'three piers, 28 m tall', { minor: true });
    o += pin('s2', -470, surf(-470) + 3, 20, -36, 'Solar panels', 'on the sunny slope', { minor: true });
    o += pin('s3', 405, soffit(405) - 1.9, 70, -30, 'The old drawing', 'pier 2, from 1994');
    o += pin('s3', 375, deckTop(375) - 1.2, 36, -52, 'The structural model', 'how the deck carries traffic', { nodot: true });
    o += pin('s3', 282, surf(282) - 6, -20, 30, 'Soil sample 1', '2023', { minor: true });
    o += pin('s3', 462, surf(462) - 6, 24, 30, 'Soil sample 4', '2023', { minor: true });
    o += pin('s3', 409, rock(405) - 1.2, 24, 44, 'Piles reach the rock', 'soil sample 3 confirms it');
    o += pin('s3', 522, FLOOD, 20, -30, 'Planned flood level', 'flood study, 2019', { minor: true });
    o += pin('s3', 404, surf(404) - 2.1, -40, 40, 'Riverbed washed 2.1 m deeper', 'diver report, 2024');
    o += pin('s4', 302, FLOOD2, -10, -54, 'Flood 0.6 m higher', 'the what-if', { flag: true });
    o += pin('s4', 405, -7.5, 80, 30, 'Riverbed depth', 'recheck', { flag: true });
    o += pin('s4', 405, -20, 80, 60, 'Pile depth', 'recheck', { flag: true });
    o += pin('s4', 375, 17, 24, -34, 'Gap under the deck', 'recheck', { flag: true });
    o += pin('s4', 318, 12.6, -40, 46, 'Road embankment', 'recheck', { flag: true, minor: true });
    o += pin('s4', 438.6, 5.5, 40, 46, 'Drain outlet', 'recheck', { flag: true });
    o += pin('s5', 820, 20.6 + 124, 40, -30, 'Tower, 124 m, on piles to rock', 'from its structural model');
    o += pin('s5', 834, 14, 40, -14, 'Three basement levels', 'in wet ground');
    o += pin('s5', 800, -6.5, 30, 36, 'Metro, 27 m down', 'as built');
    o += pin('s5', 877, -1, 50, 50, 'Metro station', 'the towers above are monitored', { minor: true });
    o += pin('s5', 960, road(960) - 1.6, 20, 44, 'Clean water pipe', 'from the plant, under the bridge', { minor: true });
    o += pin('s6', 1100, 26, -20, -46, 'Road tunnel, 145 m', '40 m of rock above it');
    o += pin('s6', 1252, -2, 60, -34, 'Quay wall', 'water 14 m deep alongside');
    o += pin('s6', 1330, -8, 50, 30, 'Ship unloading', 'it pushes and pulls on the quay', { minor: true });
    o += pin('s6', 1512, 6, -36, -44, 'Breakwater', 'built for a once-in-100-years storm', { nodot: true, minor: true });
    o += pin('s6', 1440, 0.8, -46, 30, 'Tide gauge', 'the sea rises and falls 2 m', { minor: true });
    o += pin('s6', 1212, -6.4, -36, 44, 'City drain outlet', 'into the sea', { minor: true });
    o += marker('s7', -890, CREST + 2, '1', 'Water');
    o += marker('s7', -120, surf(-120) + 32, '2', 'Power');
    o += marker('s7', 375, 28, '3', 'The crossing');
    o += marker('s7', 820, 150, '4', 'The city');
    o += marker('s7', 1330, 8, '5', 'The port');
    return '<g class="anns">' + o + '</g>';
  }

  /* ---------- camera ---------- */
  function Camera(svg, world, host, anns) { this.svg = svg; this.world = world; this.host = host; this.anns = anns; this.cur = null; this.weights = null; this.lastS = -1;
    for (var i = 0; i < anns.length; i++) { var m = /\bs(\d)\b/.exec(anns[i].getAttribute('class')); anns[i].__st = m ? +m[1] : -1; } }
  Camera.prototype.aspect = function () { var r = this.host.getBoundingClientRect(); return r.height > 0 ? r.width / r.height : 1.6; };
  Camera.prototype.apply = function (cam) {
    var a = this.aspect(), w = cam.w, h = w / a, ve = cam.ve || 1;
    this.world.setAttribute('transform', 'matrix(1 0 0 ' + n(ve) + ' 0 ' + n(400 - 400 * ve) + ')');
    var yc = 400 - cam.cz * ve, x = cam.cx - w / 2, y = yc - h / 2;
    this.svg.setAttribute('viewBox', n(x) + ' ' + n(y) + ' ' + n(w) + ' ' + n(h));
    var px = this.host.getBoundingClientRect().width || 800, s = w / px * (px < 520 ? .8 : 1);
    this.svg.classList.toggle('small', px < 520);
    this.svg.classList.toggle('narrow', a < 1.15);
    this.svg.classList.toggle('far', w > 520);
    var ws = this.weights, sChanged = Math.abs(s - this.lastS) > 1e-4 || !this.cur || (this.cur.ve || 1) !== ve;
    for (var i = 0; i < this.anns.length; i++) {
      var g = this.anns[i];
      /* only annotations that can be seen are repositioned; hidden ones catch up when their station nears */
      if (ws && g.__st >= 0) {
        /* hidden annotations are taken out of layout entirely; text layout is the costliest part of a frame */
        var off = ws[g.__st] < .01;
        if (off !== g.__off) { g.style.display = off ? 'none' : ''; g.__off = off; }
        if (off) continue;
      }
      g.setAttribute('transform', 'translate(' + g.getAttribute('data-x') + ',' + n(400 - parseFloat(g.getAttribute('data-z')) * ve) + ') scale(' + n(s) + ')');
    }
    this.lastS = s;
    this.cur = cam;
  };
  function lerpCam(a, b, e) {
    return { cx: a.cx + (b.cx - a.cx) * e, cz: a.cz + (b.cz - a.cz) * e, w: Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * e), ve: (a.ve || 1) + ((b.ve || 1) - (a.ve || 1)) * e };
  }

  /* ---------- build ---------- */
  var count = 0;
  function build(host, opts) {
    opts = opts || {};
    var id = 'fl' + (++count); ID = id;
    var html = '<svg xmlns="http://www.w3.org/2000/svg" class="fl-scene" role="img" aria-label="' + (opts.alt || 'Section through a region of the built world: a dam and reservoir in the hills, wind turbines and a transmission line down the valley, a water treatment plant, a three-span river bridge on piled foundations, a town, a downtown with a metro beneath it, a road tunnel through a coastal ridge, and a port with a quay, a container ship and a breakwater, with the ground and the groundwater drawn beneath all of it') + '" preserveAspectRatio="xMidYMid slice">' +
      defs(id) + '<g class="world">' + sky(id) + hills() + '<g class="intro-ground">' + topSurface(id) + ground(id) + water(id) + utilities() + '<rect class="night" x="' + X0 + '" y="' + n(Y(900)) + '" width="' + (X1 - X0) + '" height="1400" fill="url(#' + id + '-night)"/></g><g class="intro-built">' + dam(id) + powerline(id) + plant(id) + town(id) + downtown(id) + tunnel(id) + port(id) + bridge(id) + '</g>' +
      strataLines() + boreholes() + floodAndScour() + structureModel(id) + drawingFragment(id) + changeFlags() + routes() + '</g>' + annotations() + '</svg>';
    host.innerHTML = html;
    var svg = host.querySelector('svg'), world = svg.querySelector('.world');
    var anns = Array.prototype.slice.call(svg.querySelectorAll('.ann'));
    var cam = new Camera(svg, world, host, anns);
    function fitChips() {
      anns.forEach(function (g) {
        var t1 = g.querySelector('.t1'), t2 = g.querySelector('.t2'), chip = g.querySelector('.chip');
        if (!t1 || !chip) return;
        var w1 = t1.getComputedTextLength ? t1.getComputedTextLength() : 0, w2 = t2 && t2.getComputedTextLength ? t2.getComputedTextLength() : 0;
        var isMark = g.classList.contains('mark'), w = Math.max(w1, w2) + (isMark ? 34 : 18);
        if (w > 10) { chip.setAttribute('width', n(w)); if (!isMark && parseFloat(chip.getAttribute('x')) < 0) { chip.setAttribute('x', n(-w)); t1.setAttribute('x', n(-w + 9)); if (t2) t2.setAttribute('x', n(-w + 9)); } }
      });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitChips); else fitChips();
    requestAnimationFrame(fitChips);
    var api = {
      svg: svg, camera: cam, id: id,
      setStation: function (k) { for (var i = 0; i <= 8; i++) svg.classList.remove('st-' + i); svg.classList.add('st-' + k); },
      setWeights: function (ws) { cam.weights = ws; },
      apply: function (c) { cam.apply(c); },
      refresh: function () { if (cam.cur) cam.apply(cam.cur); fitChips(); },
      live: function (on) { svg.classList.toggle('live', !!on); }
    };
    if (opts.mode) svg.classList.add('mode-' + opts.mode);
    global.FLScene.last = api;
    return api;
  }

  /* stations: camera keyframes; w is the world width, ve the vertical stretch */
  var STATIONS = [
    { cx: 300, cz: 96, w: 2560, ve: 2.4 },        /* 0 the region */
    { cx: -905, cz: 82, w: 430, ve: 1.15 },       /* 1 the dam */
    { cx: -420, cz: 62, w: 760, ve: 1.4 },        /* 2 power across the valley */
    { cx: 384, cz: -9, w: 268, ve: 1 },           /* 3 the crossing and what it stands on */
    { cx: 378, cz: 6, w: 200, ve: 1 },            /* 4 one change */
    { cx: 870, cz: 46, w: 340, ve: 1 },           /* 5 above and below the street */
    { cx: 1262, cz: 30, w: 570, ve: 1.1 },        /* 6 to the sea */
    { cx: 300, cz: 80, w: 2560, ve: 2.4 }         /* 7 one picture */
  ];
  function viewFor(st, aspect) {
    var v = STATIONS[st], w = v.w, cx = v.cx, cz = v.cz;
    if (aspect < 1.15) {
      if (st === 0 || st === 7) { w = 1250; cx = 620; }
      else w = v.w * 1.25;
      /* on phones the caption sits over the top of the frame, so push the subject down */
      cz += (w / aspect / v.ve) * 0.12;
    } else if (st === 0 || st === 7) { var h = w / aspect, need = 230 * v.ve; if (h < need) w = need * aspect; }
    return { cx: cx, cz: cz, w: w, ve: v.ve };
  }

  global.FLScene = { build: build, STATIONS: STATIONS, viewFor: viewFor, lerp: lerpCam, Y: Y };
  global.FLScene.last = null;
})(window);
