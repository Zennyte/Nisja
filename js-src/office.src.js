/* Nisja Studio — test page B: the client's view of a made-up Nisja office.
   Real-time three.js scene. TVs and monitors play our demo sites; a laptop, tablet and phone sit on
   the table, each showing the homepage at that size. Scrolling lowers the client's gaze and flies
   into the device that matches the visitor's screen; when its screen fills the view the canvas fades
   out over the real homepage hero (pinned underneath), and the page carries on as normal.
   Built with esbuild into js/office.js (three.js is bundled, so nothing loads from other sites). */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

(function () {
  "use strict";
  var wrap = document.getElementById("zyra");
  var hero = document.querySelector(".sh");
  if (!wrap || !hero || !window.gsap || !window.ScrollTrigger) return;
  var canvas = wrap.querySelector("canvas");
  var veil = wrap.querySelector(".zy-veil");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var T = (window.Nisja && window.Nisja.t) || function (sq) { return sq; };

  /* ---------- which device do we fly into? ---------- */
  function pickDevice() {
    var w = window.innerWidth, h = window.innerHeight;
    if (w < 700) return "phone";
    if (w < 1100 || h > w) return "tablet";
    return "laptop";
  }
  var target = pickDevice();
  var aspect = window.innerWidth / window.innerHeight;
  var small = window.innerWidth < 700;

  /* ---------- renderer ---------- */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !small, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0c0b);
  scene.fog = new THREE.Fog(0x0e0c0b, 7, 14);
  var pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  var camera = new THREE.PerspectiveCamera(50, aspect, 0.01, 40);

  var manager = new THREE.LoadingManager();
  var texLoader = new THREE.TextureLoader(manager);
  var maxAniso = renderer.capabilities.getMaxAnisotropy();
  function tex(url, srgb) {
    var t = texLoader.load(url);
    if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, maxAniso);
    return t;
  }

  /* ---------- procedural textures (no image downloads) ---------- */
  function canvasTex(w, h, draw, repeat) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, maxAniso);
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    return t;
  }
  function rand(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  var floorTex = canvasTex(1024, 1024, function (g, w, h) {            // oak planks
    var r = rand(7), rows = 8, pw = h / rows;
    for (var i = 0; i < rows; i++) {
      var x = -r() * 400;
      while (x < w) {
        var len = 300 + r() * 420, base = 96 + r() * 26;
        g.fillStyle = "rgb(" + (base + 40 | 0) + "," + (base + 18 | 0) + "," + (base - 8 | 0) + ")";
        g.fillRect(x, i * pw, len, pw);
        for (var k = 0; k < 14; k++) {                                   // grain
          g.strokeStyle = "rgba(60,36,18," + (0.05 + r() * 0.08) + ")"; g.lineWidth = 1 + r() * 2;
          var y = i * pw + r() * pw; g.beginPath(); g.moveTo(x, y);
          g.bezierCurveTo(x + len * 0.3, y + (r() - 0.5) * 8, x + len * 0.7, y + (r() - 0.5) * 8, x + len, y + (r() - 0.5) * 6); g.stroke();
        }
        g.fillStyle = "rgba(30,18,10,.55)"; g.fillRect(x, i * pw, 2, pw);
        x += len;
      }
      g.fillStyle = "rgba(30,18,10,.6)"; g.fillRect(0, i * pw, w, 2);
    }
  }, [3, 3]);
  var wallTex = canvasTex(512, 512, function (g, w, h) {               // soft plaster
    g.fillStyle = "#2b2622"; g.fillRect(0, 0, w, h);
    var r = rand(3);
    for (var i = 0; i < 2600; i++) { g.fillStyle = "rgba(" + (r() > 0.5 ? "255,240,220" : "0,0,0") + "," + (r() * 0.035) + ")"; g.fillRect(r() * w, r() * h, 2 + r() * 6, 2 + r() * 6); }
  }, [4, 2]);
  var walnutTex = canvasTex(1024, 256, function (g, w, h) {            // desk top
    var grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, "#4a2f1e"); grd.addColorStop(1, "#3b2416");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    var r = rand(11);
    for (var k = 0; k < 90; k++) {
      g.strokeStyle = "rgba(" + (r() > 0.5 ? "110,70,40" : "25,14,8") + "," + (0.12 + r() * 0.2) + ")"; g.lineWidth = 0.6 + r() * 2.2;
      var y = r() * h; g.beginPath(); g.moveTo(0, y);
      for (var x = 0; x <= w; x += 64) g.lineTo(x, y + Math.sin(x / 140 + k) * (3 + r() * 5));
      g.stroke();
    }
  });
  var skyTex = canvasTex(512, 512, function (g, w, h) {                // dusk over the city, through the window
    var grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#1b2340"); grd.addColorStop(0.55, "#6a4a6a"); grd.addColorStop(0.8, "#e58a4e"); grd.addColorStop(1, "#f2b26b");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    var r = rand(5); g.fillStyle = "#14110f";
    var x = 0; while (x < w) { var bw = 18 + r() * 46, bh = 60 + r() * 170; g.fillRect(x, h - bh, bw, bh); x += bw + r() * 6; }
    for (var i = 0; i < 160; i++) { g.fillStyle = "rgba(255,200,120," + (0.4 + r() * 0.5) + ")"; g.fillRect(r() * w, h - r() * 150, 2, 3); }
  });

  /* ---------- materials ---------- */
  var M = {
    wall: new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 }),
    floor: new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55, metalness: 0 }),
    ceil: new THREE.MeshStandardMaterial({ color: 0x1a1715, roughness: 1 }),
    walnut: new THREE.MeshStandardMaterial({ map: walnutTex, roughness: 0.38 }),
    black: new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.45, metalness: 0.6 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xb9bbbf, roughness: 0.32, metalness: 0.9 }),
    darkAlu: new THREE.MeshStandardMaterial({ color: 0x2e3034, roughness: 0.35, metalness: 0.85 }),
    bezel: new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2, metalness: 0.3 }),
    oak: new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.6 }),
    pot: new THREE.MeshStandardMaterial({ color: 0xd8d1c6, roughness: 0.8 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x2f5a35, roughness: 0.7, side: THREE.DoubleSide }),
    led: new THREE.MeshBasicMaterial({ color: 0xff6a2b }),
    lamp: new THREE.MeshBasicMaterial({ color: 0xfff1dc }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x3a3632, roughness: 1 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xece6db, roughness: 0.9 })
  };
  function screenMat(map) { return new THREE.MeshBasicMaterial({ map: map, toneMapped: false, color: 0xe8e8e8 }); }

  function box(w, h, d, mat, r) {
    var geo = r ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d);
    var m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m;
  }
  function add(o, x, y, z, parent) { o.position.set(x, y, z); (parent || scene).add(o); return o; }

  /* ---------- room: 8 m wide, 7 m deep, 3.2 m high ---------- */
  var RW = 8, RD = 7, RH = 3.2, BACK = -3.6;
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD + 2), M.floor);
  floor.rotation.x = -Math.PI / 2; floor.position.z = BACK + RD / 2; floor.receiveShadow = true; scene.add(floor);
  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD + 2), M.ceil);
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, RH, BACK + RD / 2); scene.add(ceil);
  var back = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), M.wall); back.position.set(0, RH / 2, BACK); back.receiveShadow = true; scene.add(back);
  var left = new THREE.Mesh(new THREE.PlaneGeometry(RD + 2, RH), M.wall); left.rotation.y = Math.PI / 2; left.position.set(-RW / 2, RH / 2, BACK + RD / 2); left.receiveShadow = true; scene.add(left);
  var right = left.clone(); right.rotation.y = -Math.PI / 2; right.position.x = RW / 2; scene.add(right);

  // vertical oak slats behind the main TV
  for (var s = 0; s < 26; s++) add(box(0.05, RH - 0.1, 0.04, M.oak), -1.9 + s * 0.152, RH / 2, BACK + 0.03);
  // orange LED strip along the floor of the back wall + a warm wash
  add(box(RW, 0.012, 0.02, M.led), 0, 0.06, BACK + 0.08);
  var ledLight = new THREE.PointLight(0xff6a2b, 2.2, 5, 2); ledLight.position.set(0, 0.25, BACK + 0.4); scene.add(ledLight);

  /* ---------- screens: TVs and monitors playing our demo sites ---------- */
  var videos = [];
  function videoTex(name) {
    var v = document.createElement("video");
    v.src = "assets/work/reel/" + name + ".mp4"; v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", "");
    v.preload = "auto"; v.crossOrigin = "anonymous";
    videos.push(v);
    var t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function display(w, h, map, opts) {
    opts = opts || {};
    var g = new THREE.Group();
    var frame = box(w + 0.04, h + 0.04, 0.05, opts.alu ? M.darkAlu : M.bezel, 0.01); g.add(frame);
    var scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), screenMat(map)); scr.position.z = 0.0262; g.add(scr);
    return g;
  }
  // main TV (video), two side TVs (video on desktop, posters on phones)
  var tvMain = add(display(2.3, 1.29, videoTex("kaliber")), 0, 1.72, BACK + 0.09);
  add(display(1.25, 0.70, small ? tex("assets/work/reel/fener.jpg") : videoTex("fener")), -2.75, 1.9, BACK + 0.06);
  add(display(1.25, 0.70, small ? tex("assets/work/reel/kroni.jpg") : videoTex("kroni")), 2.75, 1.9, BACK + 0.06);
  // light spilling from the main TV
  var tvLight = new THREE.PointLight(0x9fb4d8, 1.6, 4.5, 2); tvLight.position.set(0, 1.7, BACK + 0.8); scene.add(tvLight);

  // logo above the main TV
  var logoTex = tex("assets/logo/nisja-logo-for-dark-bg.png");
  var logo = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9 * 0.42), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, toneMapped: false }));
  logo.position.set(0, 2.72, BACK + 0.08); scene.add(logo);
  logoTex.onUpdate = function () { var im = logoTex.image; if (im && im.width) logo.scale.y = (im.height / im.width) / 0.42; };

  // credenza under the TV with plants and a portrait screen
  add(box(3.0, 0.55, 0.45, M.walnut, 0.02), 0, 0.3, BACK + 0.3);
  add(box(3.02, 0.03, 0.47, M.black), 0, 0.585, BACK + 0.3);
  function plant(x, z, sc) {
    var g = new THREE.Group();
    var pot = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.26, 24), M.pot); pot.position.y = 0.13; pot.castShadow = true; g.add(pot);
    var r = rand(Math.round(x * 100 + 999));
    for (var i = 0; i < 16; i++) {
      var leaf = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), M.leaf);
      leaf.scale.set(0.45, 1.6, 0.12);
      var a = r() * Math.PI * 2, tilt = 0.25 + r() * 0.55;
      leaf.position.set(Math.cos(a) * 0.08, 0.36 + r() * 0.28, Math.sin(a) * 0.08);
      leaf.rotation.set(Math.sin(a) * tilt, a, Math.cos(a) * tilt);
      leaf.castShadow = true; g.add(leaf);
    }
    g.scale.setScalar(sc); g.position.set(x, 0, z); scene.add(g); return g;
  }
  plant(-1.25, BACK + 0.3, 1).position.y = 0.6;
  plant(1.3, BACK + 0.3, 0.8).position.y = 0.6;
  plant(-3.55, BACK + 0.6, 2.4);
  plant(3.5, BACK + 0.55, 2.1);
  add(display(0.32, 0.58, tex("assets/work/prush-phone.webp")), 0.55, 0.93, BACK + 0.3).rotation.x = -0.05;

  // left wall: window onto the city at dusk
  var win = new THREE.Group();
  var sky = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.7), new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: false, fog: false }));
  win.add(sky);
  [[0, 0.87, 2.5, 0.05], [0, -0.87, 2.5, 0.05], [-1.22, 0, 0.05, 1.8], [1.22, 0, 0.05, 1.8], [0, 0, 0.03, 1.7]].forEach(function (f) {
    var m = box(f[2], f[3], 0.06, M.black); m.position.set(f[0], f[1], 0.02); win.add(m);
  });
  win.rotation.y = Math.PI / 2; add(win, -RW / 2 + 0.02, 1.65, -0.9);
  var dusk = new THREE.SpotLight(0xffa26a, 18, 7, 0.7, 0.8, 1.6); dusk.position.set(-RW / 2 + 0.3, 2.2, -0.9); dusk.target.position.set(0, 0.6, -0.4); scene.add(dusk, dusk.target);

  // right wall: a designer's desk with two monitors
  var ws = new THREE.Group();
  ws.add(add(box(1.8, 0.04, 0.7, M.walnut, 0.01), 0, 0.74, 0, ws));
  [-0.8, 0.8].forEach(function (x) { add(box(0.04, 0.72, 0.6, M.black), x, 0.37, 0, ws); });
  [["kroni", -0.42], ["lisi", 0.42]].forEach(function (m) {
    var d = display(0.78, 0.44, tex("assets/demo/hd/" + m[0] + ".webp"), { alu: true }); d.position.set(m[1], 1.13, -0.2); d.rotation.y = m[1] < 0 ? 0.12 : -0.12; ws.add(d);
    add(box(0.04, 0.3, 0.04, M.darkAlu), m[1], 0.9, -0.24, ws);
  });
  ws.rotation.y = -Math.PI / 2; add(ws, RW / 2 - 0.45, 0, -1.2);

  // ceiling: two linear lamps and pendant over the table
  [[-1.6], [1.6]].forEach(function (l) { add(box(0.06, 0.03, 3.2, M.lamp), l[0], RH - 0.02, -1.2); });
  var pend = new THREE.Group();
  var shade = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.28, 0.22, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.5, side: THREE.DoubleSide }));
  pend.add(shade);
  var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), M.lamp); bulb.position.y = -0.05; pend.add(bulb);
  var cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.6, 6), M.black); cord.position.y = 0.4; pend.add(cord);
  add(pend, 0, RH - 0.62, 0.9);

  /* ---------- the client's table and the three devices ---------- */
  var TABLE_Y = 0.75, TABLE_Z = 0.35;
  add(box(2.1, 0.045, 1.0, M.walnut, 0.012), 0, TABLE_Y - 0.0225, TABLE_Z);
  [[-0.95, -0.4], [0.95, -0.4], [-0.95, 0.4], [0.95, 0.4]].forEach(function (p) { add(box(0.05, TABLE_Y - 0.045, 0.05, M.black), p[0], (TABLE_Y - 0.045) / 2, TABLE_Z + p[1]); });
  // a notebook and a pen beside the devices
  add(box(0.15, 0.012, 0.21, M.paper, 0.004), -0.82, TABLE_Y + 0.006, TABLE_Z + 0.18).rotation.y = 0.25;
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 8), M.led), -0.7, TABLE_Y + 0.006, TABLE_Z + 0.2).rotation.set(Math.PI / 2, 0, 0.6);

  var heroMaps = { laptop: tex("assets/office/hero-laptop.webp"), tablet: tex("assets/office/hero-tablet.webp"), phone: tex("assets/office/hero-phone.webp") };
  var heroAspect = { laptop: 1440 / 900, tablet: 820 / 1180, phone: 390 / 844 };
  // the device we fly into gets a screen shaped like the visitor's viewport
  function screenAspect(name, fallback) { return name === target ? aspect : fallback; }
  function coverMap(name, sa) {        // crop the screenshot to the screen's shape, keeping the top (header + headline)
    var t = heroMaps[name];
    var ia = heroAspect[name];
    if (sa > ia) { t.repeat.set(1, ia / sa); t.offset.set(0, 1 - ia / sa); } else { t.repeat.set(sa / ia, 1); t.offset.set((1 - sa / ia) / 2, 0); }
    return t;
  }
  var screens = {};
  // the device we fly into sits in front of the client; the other two sit to either side
  var order = { laptop: ["tablet", "phone"], tablet: ["laptop", "phone"], phone: ["laptop", "tablet"] }[target];
  function slot(name, g) {
    if (name === target) { g.position.set(0, TABLE_Y, TABLE_Z + (name === "laptop" ? 0.12 : name === "tablet" ? 0.2 : 0.3)); g.rotation.y = 0; }
    else if (name === order[0]) { g.position.set(name === "laptop" ? -0.55 : -0.46, TABLE_Y, TABLE_Z + 0.16); g.rotation.y = 0.34; }
    else { g.position.set(0.47, TABLE_Y, TABLE_Z + 0.2); g.rotation.y = -0.38; }
    scene.add(g);
  }

  // laptop: open, lid tilted back, facing the client
  (function () {
    var sa = Math.min(2.2, Math.max(1.3, screenAspect("laptop", 1.6)));
    var W = 0.34, H = W / sa;
    var g = new THREE.Group();
    g.add(add(box(W + 0.03, 0.012, 0.24, M.alu, 0.005), 0, 0.006, 0, g));
    var keys = box(W - 0.02, 0.002, 0.11, M.darkAlu); keys.position.set(0, 0.013, -0.025); g.add(keys);
    var lid = new THREE.Group(); lid.position.set(0, 0.012, -0.118); lid.rotation.x = -0.26;
    var shell = box(W + 0.03, H + 0.03, 0.007, M.alu, 0.003); shell.position.set(0, (H + 0.03) / 2, -0.004); lid.add(shell);
    var bez = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.022, H + 0.022), M.bezel); bez.position.set(0, (H + 0.03) / 2, 0.0001); lid.add(bez);
    var scr = new THREE.Mesh(new THREE.PlaneGeometry(W, H), screenMat(coverMap("laptop", sa))); scr.position.set(0, (H + 0.03) / 2, 0.0006); lid.add(scr);
    g.add(lid);
    slot("laptop", g);
    screens.laptop = { mesh: scr, w: W, h: H };
  })();
  // tablet on a small stand, to the client's left
  (function () {
    var sa = screenAspect("tablet", 0.75);
    var H = sa < 1 ? 0.24 : 0.17, W = H * sa;
    var g = new THREE.Group();
    var stand = box(0.12, 0.012, 0.12, M.darkAlu, 0.004); stand.position.y = 0.006; g.add(stand);
    var arm = box(0.02, 0.09, 0.012, M.darkAlu); arm.position.set(0, 0.05, -0.02); arm.rotation.x = -0.3; g.add(arm);
    var body = new THREE.Group(); body.position.set(0, 0.03 + (H + 0.024) / 2, -0.01); body.rotation.x = -0.3;
    var shell = box(W + 0.024, H + 0.024, 0.007, M.darkAlu, 0.006); body.add(shell);
    var bez = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.016, H + 0.016), M.bezel); bez.position.z = 0.0036; body.add(bez);
    var scr = new THREE.Mesh(new THREE.PlaneGeometry(W, H), screenMat(coverMap("tablet", sa))); scr.position.z = 0.004; body.add(scr);
    g.add(body);
    slot("tablet", g);
    screens.tablet = { mesh: scr, w: W, h: H };
  })();
  // phone on a stand, to the client's right
  (function () {
    var sa = Math.min(0.62, screenAspect("phone", 0.46));
    var H = 0.135, W = H * sa;
    var g = new THREE.Group();
    var stand = box(0.07, 0.008, 0.07, M.black, 0.003); stand.position.y = 0.004; g.add(stand);
    var body = new THREE.Group(); body.position.set(0, 0.012 + (H + 0.01) / 2, 0); body.rotation.x = -0.22;
    var shell = box(W + 0.01, H + 0.01, 0.008, M.black, 0.006); body.add(shell);
    var scr = new THREE.Mesh(new THREE.PlaneGeometry(W, H), screenMat(coverMap("phone", sa))); scr.position.z = 0.0042; body.add(scr);
    g.add(body);
    slot("phone", g);
    screens.phone = { mesh: scr, w: W, h: H };
  })();

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0xfff0e0, 0x1a120c, 0.35));
  var key = new THREE.SpotLight(0xffe2c0, 26, 6, 0.75, 0.6, 1.5);
  key.position.set(0.2, RH - 0.1, 0.6); key.target.position.set(0, TABLE_Y, TABLE_Z);
  key.castShadow = true; key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048); key.shadow.bias = -0.0004; key.shadow.radius = 4;
  scene.add(key, key.target);
  var fill = new THREE.SpotLight(0xffd6b0, 12, 9, 0.9, 0.9, 1.4); fill.position.set(0, RH - 0.05, -1.5); fill.target.position.set(0, 1.2, BACK); scene.add(fill, fill.target);
  [[-1.6], [1.6]].forEach(function (l) { var p = new THREE.PointLight(0xfff1dc, 2.2, 5, 2); p.position.set(l[0], RH - 0.25, -1.2); scene.add(p); });

  /* ---------- post: gentle glow on screens and LEDs (not on phones) ---------- */
  var composer = null, bloom = null;
  if (!small) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.22, 0.5, 0.93);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  /* ---------- camera path ---------- */
  var EYE = new THREE.Vector3(0, 1.22, 1.55);
  var startLook = new THREE.Vector3(0, 1.62, BACK);
  var qStart = new THREE.Quaternion(), qEnd = new THREE.Quaternion(), qMid = new THREE.Quaternion();
  var pEnd = new THREE.Vector3(), pMid = new THREE.Vector3(), devCenter = new THREE.Vector3();
  var tmpCam = new THREE.PerspectiveCamera();
  var startFov, endFov = 36;

  function lookQuat(from, to, out) { tmpCam.position.copy(from); tmpCam.up.set(0, 1, 0); tmpCam.lookAt(to); return out.copy(tmpCam.quaternion); }
  function setupPath() {
    aspect = window.innerWidth / window.innerHeight;
    startFov = aspect < 1 ? 74 : aspect < 1.4 ? 60 : 50;      // narrow screens see the same wall
    var sc = screens[target]; sc.mesh.updateWorldMatrix(true, false);
    sc.mesh.getWorldPosition(devCenter);
    var normal = new THREE.Vector3(0, 0, 1).transformDirection(sc.mesh.matrixWorld);
    var up = new THREE.Vector3(0, 1, 0).transformDirection(sc.mesh.matrixWorld);
    var half = THREE.MathUtils.degToRad(endFov / 2);
    var d = Math.min((sc.h / 2) / Math.tan(half), (sc.w / 2) / (Math.tan(half) * aspect)) * 0.995;   // screen just fills the view
    pEnd.copy(devCenter).addScaledVector(normal, d);
    var m = new THREE.Matrix4().lookAt(pEnd, devCenter, up); qEnd.setFromRotationMatrix(m);
    startLook.y = aspect < 1 ? 1.36 : 1.62;
    lookQuat(EYE, startLook, qStart);
    pMid.copy(EYE).lerp(pEnd, target === "laptop" ? 0.35 : 0.58); pMid.y = Math.max(pEnd.y + 0.12, EYE.y - 0.12);   // lean in first, then dive
    lookQuat(pMid, devCenter, qMid);
  }
  setupPath();

  var state = { p: 0 }, mouse = { x: 0, y: 0 }, sm = { x: 0, y: 0 };
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  var qa = new THREE.Quaternion(), pa = new THREE.Vector3();
  function placeCamera() {
    var p = state.p;
    var split = target === "laptop" ? 0.42 : 0.3;
    var a = THREE.MathUtils.clamp(p / split, 0, 1), b = THREE.MathUtils.clamp((p - split) / (0.92 - split), 0, 1);
    var ea = ease(a), eb = ease(b);
    if (b <= 0) { pa.copy(EYE).lerp(pMid, ea); qa.copy(qStart).slerp(qMid, ea); }
    else { pa.copy(pMid).lerp(pEnd, eb); qa.copy(qMid).slerp(qEnd, eb); }
    camera.position.copy(pa); camera.quaternion.copy(qa);
    var look = 1 - Math.min(1, p * 2.2);                              // the client glances around before scrolling
    camera.rotateY(-sm.x * 0.08 * look); camera.rotateX(-sm.y * 0.05 * look);
    var midFov = target === "laptop" ? startFov : Math.min(startFov, 58);
    camera.fov = b > 0 ? THREE.MathUtils.lerp(midFov, endFov, eb) : THREE.MathUtils.lerp(startFov, midFov, ea); camera.aspect = aspect; camera.updateProjectionMatrix();
    if (bloom) bloom.strength = 0.22 * (1 - eb);                   // no glow once the screen is the page
    if (screens[target]) screens[target].mesh.material.color.setScalar(0.91 + 0.09 * eb);   // full brightness at hand-off
    wrap.classList.toggle("is-moving", p > 0.03);
  }

  /* ---------- scroll: pin the real hero while the camera flies, then fade into it ---------- */
  var header = document.querySelector(".site-header");
  document.documentElement.classList.add("zy-on");
  var st = ScrollTrigger.create({
    trigger: hero,
    start: function () { return "top " + (header ? header.offsetHeight : 0) + "px"; },
    end: "+=" + (reduce ? 120 : 260) + "%",
    pin: true, pinSpacing: true, refreshPriority: 1, scrub: reduce ? true : 0.6,
    onUpdate: function (self) {
      state.p = self.progress;
      var fade = THREE.MathUtils.clamp((self.progress - 0.9) / 0.1, 0, 1);
      wrap.style.opacity = String(1 - fade);
      var done = fade >= 1;
      if (done !== wrap.classList.contains("is-done")) {
        wrap.classList.toggle("is-done", done);
        document.documentElement.classList.toggle("zy-on", !done);
        running = !done; if (running) tick();
      }
    }
  });
  ScrollTrigger.refresh();

  window.addEventListener("pointermove", function (e) { mouse.x = e.clientX / window.innerWidth - 0.5; mouse.y = e.clientY / window.innerHeight - 0.5; }, { passive: true });

  var resizeT;
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      if (composer) composer.setSize(window.innerWidth, window.innerHeight);
      if (pickDevice() !== target) { target = pickDevice(); }
      setupPath(); ScrollTrigger.refresh();
    }, 150);
  });

  /* ---------- render loop (stops once we're inside the real site) ---------- */
  var running = true;
  function tick() {
    if (!running) return;
    sm.x += (mouse.x - sm.x) * 0.06; sm.y += (mouse.y - sm.y) * 0.06;
    placeCamera();
    if (composer) composer.render(); else renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  manager.onProgress = function (u, loaded, total) { if (veil) veil.style.setProperty("--p", (loaded / total).toFixed(2)); };
  manager.onLoad = function () {
    videos.forEach(function (v) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); });
    wrap.classList.add("is-ready");
    tick();
  };
  var label = wrap.querySelector(".zy-hint");
  if (label) label.textContent = T("Lëvizni poshtë për të hyrë", "Scroll to step inside");
})();
