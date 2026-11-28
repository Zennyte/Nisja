/* Nisja Studio — offline renderer for test page B (the desk).
   Never runs on the website. Bundled into a local render page and driven by Playwright, it renders the
   desk once at full quality (ambient occlusion, soft shadows, area lights, glow, studio reflections)
   in two depth layers plus a mask: "far" (wall, monitors) and "near" (desk, laptop, tablet, phone).
   It also reports where each screen lands in the image and how far it is from the camera, so the
   page (js/office.js) can map live HTML onto the screens and fly into the laptop with a GPU zoom.
   Usage: await window.setup({ framing: "land" | "port", width, height }); await window.pass(name) */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

var renderer, scene, camera, composer, target, aspect, W, H;
var tvs = [], screens = {}, path = {};
var loader = new THREE.TextureLoader();
function load(url, srgb) {
  return new Promise(function (res) {
    loader.load(url, function (t) { if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; res(t); });
  });
}
function rand(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

/* ---------- procedural surfaces with matching normal maps ---------- */
function canvas(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function heightToNormal(src, strength) {
  var w = src.width, h = src.height, g = src.getContext("2d"), d = g.getImageData(0, 0, w, h).data;
  var out = canvas(w, h), og = out.getContext("2d"), od = og.createImageData(w, h);
  function hv(x, y) { x = (x + w) % w; y = (y + h) % h; return d[(y * w + x) * 4] / 255; }
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
    var dx = (hv(x + 1, y) - hv(x - 1, y)) * strength, dy = (hv(x, y + 1) - hv(x, y - 1)) * strength;
    var l = Math.sqrt(dx * dx + dy * dy + 1), i = (y * w + x) * 4;
    od.data[i] = (-dx / l * 0.5 + 0.5) * 255; od.data[i + 1] = (dy / l * 0.5 + 0.5) * 255; od.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; od.data[i + 3] = 255;
  }
  og.putImageData(od, 0, 0); return out;
}
function tex(c, srgb, rep) {
  var t = new THREE.CanvasTexture(c); t.anisotropy = 16;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function planks() {                            // long oak floorboards: colour, height and roughness maps
  var S = 2048, col = canvas(S, S), hei = canvas(S, S), rou = canvas(S, S);
  var cg = col.getContext("2d"), hg = hei.getContext("2d"), rg = rou.getContext("2d"), r = rand(21);
  var rows = 10, bw = S / rows;
  for (var i = 0; i < rows; i++) {
    var x = -r() * 900;
    while (x < S) {
      var len = 700 + r() * 900, base = 0.82 + r() * 0.28, hue = r();
      cg.fillStyle = "rgb(" + (150 * base + hue * 16 | 0) + "," + (104 * base + hue * 6 | 0) + "," + (68 * base | 0) + ")";
      cg.fillRect(x, i * bw, len, bw);
      for (var k = 0; k < 26; k++) {
        cg.strokeStyle = "rgba(" + (r() > 0.5 ? "70,44,24" : "196,156,110") + "," + (0.05 + r() * 0.12) + ")"; cg.lineWidth = 0.6 + r() * 2;
        var yy = i * bw + r() * bw; cg.beginPath(); cg.moveTo(x, yy);
        cg.bezierCurveTo(x + len * 0.3, yy + (r() - 0.5) * 10, x + len * 0.7, yy + (r() - 0.5) * 10, x + len, yy + (r() - 0.5) * 8); cg.stroke();
      }
      if (r() < 0.4) { cg.fillStyle = "rgba(60,36,20,.3)"; cg.beginPath(); cg.ellipse(x + len * (0.2 + r() * 0.6), i * bw + bw * (0.3 + r() * 0.4), 6 + r() * 8, 2 + r() * 3, 0, 0, 7); cg.fill(); }
      hg.fillStyle = "rgb(" + (205 + r() * 30 | 0) + ",0,0)"; hg.fillRect(x + 3, i * bw + 3, len - 6, bw - 6);
      rg.fillStyle = "rgb(" + (120 + r() * 60 | 0) + ",0,0)"; rg.fillRect(x, i * bw, len, bw);
      cg.fillStyle = "rgba(25,14,6,.8)"; cg.fillRect(x, i * bw, 2, bw);
      x += len;
    }
    cg.fillStyle = "rgba(25,14,6,.8)"; cg.fillRect(0, i * bw, S, 2);
  }
  return { map: tex(col, true, [2.2, 2.2]), normalMap: tex(heightToNormal(hei, 3), false, [2.2, 2.2]), roughnessMap: tex(rou, false, [2.2, 2.2]) };
}
function plaster(color, seed) {
  var S = 1024, c = canvas(S, S), g = c.getContext("2d"), h = canvas(S, S), hg = h.getContext("2d"), r = rand(seed);
  g.fillStyle = color; g.fillRect(0, 0, S, S); hg.fillStyle = "#808080"; hg.fillRect(0, 0, S, S);
  for (var i = 0; i < 9000; i++) {
    var x = r() * S, y = r() * S, s = 2 + r() * 14, a = r() * 0.05;
    g.fillStyle = "rgba(" + (r() > 0.5 ? "255,245,230" : "0,0,0") + "," + a + ")"; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill();
    hg.fillStyle = "rgba(" + (r() > 0.5 ? "255,255,255" : "0,0,0") + "," + (r() * 0.08) + ")"; hg.beginPath(); hg.arc(x, y, s * 0.6, 0, 7); hg.fill();
  }
  return { map: tex(c, true, [3, 1.5]), normalMap: tex(heightToNormal(h, 1.2), false, [3, 1.5]) };
}
function woodStrip(seed, base) {                // long-grain oak / walnut for furniture
  var c = canvas(4096, 1024), g = c.getContext("2d"), r = rand(seed);
  var grd = g.createLinearGradient(0, 0, 0, 1024); grd.addColorStop(0, base[0]); grd.addColorStop(1, base[1]);
  g.fillStyle = grd; g.fillRect(0, 0, 4096, 1024);
  for (var k = 0; k < 420; k++) {
    g.strokeStyle = "rgba(" + (r() > 0.55 ? "40,24,12" : "215,175,125") + "," + (0.05 + r() * 0.14) + ")"; g.lineWidth = 0.6 + r() * 2.4;
    var y = r() * 1024; g.beginPath(); g.moveTo(0, y);
    for (var x = 0; x <= 4096; x += 48) g.lineTo(x, y + Math.sin(x / (260 + r() * 120) + k) * (2 + r() * 9));
    g.stroke();
  }
  var t = tex(c, true); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function noiseTex(seed, w, h, alpha) {
  var c = canvas(w, h), g = c.getContext("2d"), r = rand(seed);
  g.fillStyle = "#7a7a7a"; g.fillRect(0, 0, w, h);
  for (var i = 0; i < w * h / 6; i++) { g.fillStyle = "rgba(" + (r() > 0.5 ? "255,255,255" : "0,0,0") + "," + (r() * alpha) + ")"; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
  return c;
}

/* ---------- helpers ---------- */
function rbox(w, h, d, mat, r, seg) { var m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg || 4, r || Math.min(w, h, d) * 0.08), mat); m.castShadow = m.receiveShadow = true; return m; }
function put(o, x, y, z, parent) { o.position.set(x, y, z); (parent || scene).add(o); return o; }
function roundedRectShape(w, h, r) {
  var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
function slab(w, h, depth, r, mat, bevel) {      // extruded rounded rectangle, centred, facing +z
  var g = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), { depth: depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 16 });
  g.translate(0, 0, -depth / 2);
  var m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m;
}
function screenPlane(w, h, r, map) {             // rounded-corner screen with 0..1 UVs
  var g = new THREE.ShapeGeometry(roundedRectShape(w, h, r), 16), uv = g.attributes.uv, p = g.attributes.position;
  for (var i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
  return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: map, toneMapped: false }));
}
function glass(w, h, r) {                        // a faint reflective layer over every screen
  var m = new THREE.Mesh(new THREE.ShapeGeometry(roundedRectShape(w, h, r), 16), new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.18, envMapIntensity: 1.4, clearcoat: 1 }));
  return m;
}
function coverUV(t, imgAspect, screenAspect) {   // crop an image to the screen's shape, keeping the top
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  if (screenAspect > imgAspect) { t.repeat.set(1, imgAspect / screenAspect); t.offset.set(0, 1 - imgAspect / screenAspect); }
  else { t.repeat.set(screenAspect / imgAspect, 1); t.offset.set((1 - screenAspect / imgAspect) / 2, 0); }
}


/* ---------- build: a desk against a slatted wall ---------- */
var near = [], far = [], screenMeshes = {};
function N(o) { near.push(o); return o; }        // tag an object as part of the near layer
async function build() {
  RectAreaLightUniformsLib.init();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0a09);
  var exr = await new Promise(function (res) { new EXRLoader().load("apartment.exr", res); });
  exr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = new THREE.PMREMGenerator(renderer).fromEquirectangular(exr).texture;
  scene.environmentIntensity = 0.2;

  var wallT = plaster("#26221f", 9), oak = woodStrip(31, ["#b48a5e", "#9c7349"]), walnut = woodStrip(32, ["#5a3a24", "#43281a"]);
  walnut.repeat.set(1, 1);
  var feltN = tex(heightToNormal(noiseTex(5, 512, 512, 0.5), 2), false, [6, 6]);
  var M = {
    wall: new THREE.MeshStandardMaterial({ map: wallT.map, normalMap: wallT.normalMap, roughness: 0.95 }),
    floor: new THREE.MeshStandardMaterial({ color: 0x1a1512, roughness: 0.7 }),
    oak: new THREE.MeshStandardMaterial({ map: oak, roughness: 0.5 }),
    desk: new THREE.MeshPhysicalMaterial({ map: walnut, roughness: 0.48, clearcoat: 0.35, clearcoatRoughness: 0.28 }),
    felt: new THREE.MeshStandardMaterial({ color: 0x131110, roughness: 1, normalMap: feltN }),
    steel: new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.38, metalness: 0.85 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xc5c7cb, roughness: 0.28, metalness: 1 }),
    grey: new THREE.MeshStandardMaterial({ color: 0x34363b, roughness: 0.32, metalness: 1 }),
    key: new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: 0.6, metalness: 0.1 }),
    pad: new THREE.MeshStandardMaterial({ color: 0xb0b2b6, roughness: 0.45, metalness: 0.9 }),
    bezel: new THREE.MeshStandardMaterial({ color: 0x060606, roughness: 0.15, metalness: 0.2 }),
    off: new THREE.MeshPhysicalMaterial({ color: 0x050607, roughness: 0.04, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: 0xe8e2d8, roughness: 0.35, clearcoat: 0.6 }),
    ceramicDark: new THREE.MeshPhysicalMaterial({ color: 0x2a2826, roughness: 0.5, clearcoat: 0.4 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xece5d9, roughness: 0.9 }),
    leather: new THREE.MeshPhysicalMaterial({ color: 0x5a3422, roughness: 0.55, clearcoat: 0.25 }),
    led: new THREE.MeshBasicMaterial({ color: 0xff7a3a }),
    coffee: new THREE.MeshStandardMaterial({ color: 0x2a160b, roughness: 0.12 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x2b2927, roughness: 1, normalMap: feltN })
  };

  var TY = 0.75, WIN = -1.7;
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshStandardMaterial({ color: 0x17120f, roughness: 0.45, metalness: 0 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshStandardMaterial({ color: 0x0c0b0a, roughness: 1 })); ceil.rotation.x = Math.PI / 2; ceil.position.y = 3.0; scene.add(ceil);

  /* the city at night, seen through floor-to-ceiling windows */
  var city = (function () {
    var Wc = 6144, Hc = 2304, c = canvas(Wc, Hc), g = c.getContext("2d"), r = rand(2026);
    var glow = canvas(Wc / 4, Hc / 4), gg = glow.getContext("2d");
    var sky = g.createLinearGradient(0, 0, 0, Hc);
    sky.addColorStop(0, "#02040a"); sky.addColorStop(0.4, "#070c1e"); sky.addColorStop(0.66, "#141834"); sky.addColorStop(0.82, "#2c2340"); sky.addColorStop(0.92, "#5a3330"); sky.addColorStop(1, "#7a442c");
    g.fillStyle = sky; g.fillRect(0, 0, Wc, Hc);
    for (var i = 0; i < 1600; i++) { var y = r() * Hc * 0.5; g.fillStyle = "rgba(255,255,255," + (0.12 + r() * 0.55) * (1 - y / (Hc * 0.55)) + ")"; g.fillRect(r() * Wc, y, r() < 0.05 ? 2 : 1, r() < 0.05 ? 2 : 1); }
    var mg = g.createRadialGradient(4700, 380, 0, 4700, 380, 260); mg.addColorStop(0, "rgba(255,246,228,1)"); mg.addColorStop(0.24, "rgba(255,246,228,1)"); mg.addColorStop(0.27, "rgba(255,236,210,.22)"); mg.addColorStop(1, "rgba(255,236,210,0)");
    g.fillStyle = mg; g.beginPath(); g.arc(4700, 380, 260, 0, 7); g.fill();
    var layers = [
      { base: 0.84, minH: 0.04, maxH: 0.16, col: [30, 32, 54], win: 0.14, ws: 4, haze: 0.6, w: [26, 70] },
      { base: 0.88, minH: 0.07, maxH: 0.26, col: [20, 21, 37], win: 0.2, ws: 5, haze: 0.42, w: [34, 96] },
      { base: 0.93, minH: 0.1, maxH: 0.4, col: [13, 13, 23], win: 0.28, ws: 6, haze: 0.24, w: [46, 130] },
      { base: 0.98, minH: 0.16, maxH: 0.56, col: [8, 8, 13], win: 0.36, ws: 8, haze: 0.08, w: [60, 170] }
    ];
    layers.forEach(function (L, li) {
      var x = -r() * 60;
      while (x < Wc) {
        var bw = L.w[0] + r() * (L.w[1] - L.w[0]), bh = (L.minH + r() * (L.maxH - L.minH)) * Hc;
        if (r() < 0.08) bh *= 1.45;
        var top = L.base * Hc - bh, shade = (r() - 0.5) * 6;
        g.fillStyle = "rgb(" + (L.col[0] + shade | 0) + "," + (L.col[1] + shade | 0) + "," + (L.col[2] + shade | 0) + ")"; g.fillRect(x, top, bw, bh + 6);
        if (r() < 0.3) { g.fillRect(x + bw * 0.3, top - bh * 0.05, bw * 0.4, bh * 0.05); if (r() < 0.5) g.fillRect(x + bw * 0.48, top - bh * 0.12, 2 + li, bh * 0.07); }
        var cols = Math.floor(bw / L.ws), rows = Math.floor(bh / (L.ws * 1.6)), lit = L.win * (0.5 + r());
        for (var cx = 1; cx < cols - 1; cx++) for (var ry = 1; ry < rows; ry++) {
          if (r() > lit) continue;
          var warm = r() < 0.72, a = 0.4 + r() * 0.6, wx = x + cx * L.ws, wy = top + ry * L.ws * 1.6;
          var col = warm ? "rgba(255," + (186 + r() * 50 | 0) + "," + (105 + r() * 60 | 0) + "," + a + ")" : "rgba(" + (165 + r() * 45 | 0) + ",208,255," + a + ")";
          g.fillStyle = col; g.fillRect(wx, wy, Math.max(1, L.ws * 0.45), Math.max(1, L.ws * 0.7));
          if (li >= 2 && r() < 0.35) { gg.fillStyle = col; gg.fillRect(wx / 4, wy / 4, 1.2, 1.2); }
        }
        if (bh > Hc * 0.3 && r() < 0.55) { g.fillStyle = "#ff2a1a"; g.beginPath(); g.arc(x + bw / 2, top - 4, 2 + li, 0, 7); g.fill(); gg.fillStyle = "rgba(255,40,20,.9)"; gg.fillRect((x + bw / 2) / 4 - 1, (top - 4) / 4 - 1, 3, 3); }
        if (L.haze) { g.fillStyle = "rgba(38,34,66," + L.haze * 0.5 + ")"; g.fillRect(x, top, bw, bh); }
        x += bw + r() * 10 * (li + 1);
      }
      var hz = g.createLinearGradient(0, L.base * Hc - Hc * 0.14, 0, L.base * Hc); hz.addColorStop(0, "rgba(120,70,60,0)"); hz.addColorStop(1, "rgba(160,86,58," + (0.2 - li * 0.04) + ")");
      g.fillStyle = hz; g.fillRect(0, L.base * Hc - Hc * 0.14, Wc, Hc * 0.14);
    });
    for (var k = 0; k < 420; k++) { var sx = r() * Wc, sy = Hc * (0.965 + r() * 0.035); g.fillStyle = "rgba(255," + (165 + r() * 70 | 0) + ",90," + (0.45 + r() * 0.5) + ")"; g.beginPath(); g.arc(sx, sy, 1 + r() * 2.6, 0, 7); g.fill(); gg.fillStyle = "rgba(255,170,90,.8)"; gg.fillRect(sx / 4, sy / 4, 2, 2); }
    // soft glow around the lights
    g.save(); g.globalCompositeOperation = "lighter"; g.filter = "blur(10px)"; g.globalAlpha = 0.9; g.drawImage(glow, 0, 0, Wc, Hc); g.filter = "blur(3px)"; g.globalAlpha = 0.6; g.drawImage(glow, 0, 0, Wc, Hc); g.restore();
    return tex(c, true);
  })();
  var cityM = new THREE.Mesh(new THREE.PlaneGeometry(64, 28), new THREE.MeshBasicMaterial({ map: city, toneMapped: false, fog: false, color: 0xbdbdbd }));
  cityM.position.set(0, 6.6, -26); scene.add(cityM);
  // window wall: black steel mullions, a sill and a soft reflection on the glass
  var frameM = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.5, metalness: 0.6 });
  for (var mx = -4.2; mx <= 4.2; mx += 1.4) put(rbox(0.06, 3.0, 0.1, frameM, 0.008), mx, 1.5, WIN);
  [0.12, 2.25, 2.96].forEach(function (y) { put(rbox(9, 0.06, 0.1, frameM, 0.008), 0, y, WIN); });
  var glassM = new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.14, envMapIntensity: 1.2 });
  var glassP = new THREE.Mesh(new THREE.PlaneGeometry(9, 3), glassM); glassP.position.set(0, 1.5, WIN + 0.01); scene.add(glassP);
  [-1, 1].forEach(function (sd) { var w = new THREE.Mesh(new THREE.PlaneGeometry(10, 3), new THREE.MeshStandardMaterial({ color: 0x15120f, roughness: 0.95 })); w.rotation.y = -sd * Math.PI / 2; w.position.set(sd * 4.5, 1.5, 0); scene.add(w); });
  var cityGlow = new THREE.RectAreaLight(0x6f7fb8, 0.55, 8, 2.6); cityGlow.position.set(0, 1.5, WIN + 0.05); cityGlow.lookAt(0, 1.2, 2); scene.add(cityGlow);

  /* desk, with a felt mat under the laptop */
  N(put(rbox(1.9, 0.036, 0.84, M.desk, 0.01), 0, TY - 0.018, -0.33));
  [[-0.88, -0.36], [0.88, -0.36], [-0.88, 0.0], [0.88, 0.0]].forEach(function (p) { N(put(rbox(0.04, TY - 0.036, 0.04, M.steel, 0.006), p[0], (TY - 0.036) / 2, -0.33 + p[1])); });
  var mat = slab(0.9, 0.42, 0.002, 0.03, M.felt, 0.001); mat.rotation.x = -Math.PI / 2; N(put(mat, 0.05, TY + 0.002, -0.14));

  /* monitors on weighted stands, standing on the desk */
  async function monitor(name, w, h, x, y, z, ry, glow, url, imgAspect) {
    var g = new THREE.Group();
    var head = new THREE.Group(); head.position.y = y - TY; g.add(head);
    head.add(rbox(w + 0.012, h + 0.012, 0.018, M.bezel, 0.003));
    var back = rbox(w * 0.42, h * 0.42, 0.035, M.grey, 0.012); back.position.z = -0.026; head.add(back);
    var map = await load(url); coverUV(map, imgAspect, w / h);
    map.generateMipmaps = false; map.minFilter = THREE.LinearFilter; map.anisotropy = 16;   // keep small screen text crisp (the render is supersampled)
    var scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: map, toneMapped: false, color: 0xd6d6d6 })); scr.position.z = 0.0095; head.add(scr);
    var gl = glass(w, h, 0.001); gl.position.z = 0.0102; head.add(gl);
    var neckH = y - TY - 0.02;
    var neck = rbox(0.06, neckH, 0.022, M.alu, 0.008); neck.position.set(0, neckH / 2 + 0.006, -0.075); g.add(neck);
    var link = rbox(0.06, 0.05, 0.06, M.alu, 0.01); link.position.set(0, y - TY, -0.05); g.add(link);
    var foot = slab(0.22, 0.17, 0.006, 0.03, M.alu, 0.002); foot.rotation.x = -Math.PI / 2; foot.position.set(0, 0.005, -0.05); g.add(foot);
    g.position.set(x, TY, z); g.rotation.y = ry; scene.add(g); g.updateMatrixWorld(true); N(g);
    var l = new THREE.RectAreaLight(glow, 2.0, w, h); var c = new THREE.Vector3(); scr.getWorldPosition(c);
    l.position.copy(c); var nrm = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion); l.lookAt(c.clone().add(nrm)); scene.add(l);
    screenMeshes[name] = { mesh: scr, w: w, h: h };
    return g;
  }
  await monitor("left", 0.6, 0.3375, -0.64, 1.07, -0.5, 0.4, 0x7a7f8a, "scr-nika.webp", 2000 / 1125);
  await monitor("mid", 0.66, 0.37, 0, 1.1, -0.58, 0, 0x55607a, "scr-editor.webp", 2560 / 1436);
  await monitor("right", 0.3, 0.533, 0.58, 1.08, -0.52, -0.4, 0x9fb59a, "scr-udha.webp", 1350 / 2400);

  /* headphones on a stand, back right */
  (function () {
    var g = new THREE.Group(), black = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.55, metalness: 0.2 });
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.012, 48), M.alu); base.position.y = 0.006; base.castShadow = true; g.add(base);
    var rod = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.27, 20), M.alu); rod.position.y = 0.14; rod.castShadow = true; g.add(rod);
    var hook = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 12, 40, Math.PI), M.alu); hook.position.y = 0.272; hook.castShadow = true; g.add(hook);
    var hp = new THREE.Group(); hp.position.y = 0.287;
    var band = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.011, 14, 56, Math.PI), black); band.scale.set(1, 1.1, 1.6); band.castShadow = true; hp.add(band);
    var pad = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.009, 12, 40, Math.PI * 0.6), M.leather); pad.rotation.z = Math.PI * 0.2; pad.scale.set(1, 1.1, 2); pad.position.y = -0.004; hp.add(pad);
    [-1, 1].forEach(function (sd) {
      var yoke = rbox(0.008, 0.05, 0.03, M.alu, 0.003); yoke.position.set(sd * 0.088, -0.02, 0); hp.add(yoke);
      var cup = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.034, 48), black); cup.rotation.z = Math.PI / 2; cup.position.set(sd * 0.1, -0.075, 0); cup.castShadow = true; hp.add(cup);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.013, 14, 40), M.leather); ring.rotation.y = Math.PI / 2; ring.position.set(sd * 0.08, -0.075, 0); hp.add(ring);
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 40), M.alu); cap.rotation.z = Math.PI / 2; cap.position.set(sd * 0.118, -0.075, 0); hp.add(cap);
    });
    g.add(hp); g.position.set(0.86, TY, -0.42); g.rotation.y = -0.5; N(g); scene.add(g);
  })();
  /* a warm lamp just out of frame on the left, pooling light on the desk */
  (function () {
    var sp = new THREE.SpotLight(0xffc68a, 6.5, 3, 0.8, 0.75, 1.6); sp.position.set(-1.25, 1.45, -0.35); sp.target.position.set(-0.2, TY, -0.25);
    sp.castShadow = true; sp.shadow.mapSize.set(2048, 2048); sp.shadow.radius = 8; sp.shadow.blurSamples = 16; sp.shadow.bias = -0.0003; sp.shadow.camera.near = 0.05;
    scene.add(sp, sp.target);
  })();
  /* mouse on the mat */
  (function () {
    var mo = new THREE.Mesh(new THREE.SphereGeometry(0.03, 32, 20), new THREE.MeshStandardMaterial({ color: 0xe9e7e2, roughness: 0.35 }));
    mo.scale.set(1, 0.38, 1.75); mo.position.set(0.35, TY + 0.011, -0.06); mo.castShadow = true; N(mo); scene.add(mo);
  })();
  /* the laptop, facing the camera */
  var lap = new THREE.Group(), Wd = 0.3, Hd = Wd / 1.6;
  var base = slab(0.312, 0.218, 0.006, 0.012, M.alu, 0.0025); base.rotation.x = -Math.PI / 2; base.position.y = 0.0055; lap.add(base);
  var well = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.105), new THREE.MeshStandardMaterial({ color: 0x9a9da2, roughness: 0.4, metalness: 1 })); well.rotation.x = -Math.PI / 2; well.position.set(0, 0.0112, -0.035); lap.add(well);
  var keys = new THREE.InstancedMesh(new RoundedBoxGeometry(0.0155, 0.002, 0.0155, 2, 0.002), M.key, 84), mm = new THREE.Matrix4(), k = 0;
  for (var row = 0; row < 6; row++) for (var col = 0; col < 14; col++) {
    if (row === 5 && col > 3 && col < 9) continue;
    mm.makeTranslation(-0.1235 + col * 0.019, 0.0118, -0.083 + row * 0.019); keys.setMatrixAt(k++, mm);
  }
  keys.count = k; keys.castShadow = true; lap.add(keys);
  var space = rbox(0.09, 0.002, 0.0155, M.key, 0.002); space.position.set(-0.0005, 0.0118, -0.083 + 5 * 0.019); lap.add(space);
  var pad = slab(0.12, 0.075, 0.0006, 0.006, M.pad, 0.0004); pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.0112, 0.058); lap.add(pad);
  var lid = new THREE.Group(); lid.position.set(0, 0.009, -0.106); lid.rotation.x = -0.24;
  var shell = slab(Wd + 0.012, Hd + 0.016, 0.003, 0.012, M.alu, 0.0015); shell.position.set(0, (Hd + 0.016) / 2, -0.0035); lid.add(shell);
  var bez = screenPlane(Wd + 0.01, Hd + 0.014, 0.011, null); bez.material = M.bezel; bez.position.set(0, (Hd + 0.016) / 2, 0.0002); lid.add(bez);
  var lscr = new THREE.Mesh(new THREE.PlaneGeometry(Wd, Hd), new THREE.MeshBasicMaterial({ color: 0x1a1612, toneMapped: false })); lscr.position.set(0, (Hd + 0.016) / 2 + 0.002, 0.0006); lid.add(lscr);
  var hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.26, 16), M.grey); hinge.rotation.z = Math.PI / 2; hinge.position.set(0, 0.009, -0.106); lap.add(hinge);
  lap.add(lid); lap.position.set(0, TY, -0.12); N(lap); scene.add(lap);
  screenMeshes.laptop = { mesh: lscr, w: Wd, h: Hd };
  var lapGlow = new THREE.RectAreaLight(0xd8c8b8, 0.5, Wd, Hd); scene.add(lapGlow);

  /* tablet and phone, switched off, lying on the desk */
  var tab = new THREE.Group();
  var tb = slab(0.18, 0.25, 0.005, 0.016, M.grey, 0.0012); tb.rotation.x = -Math.PI / 2; tb.position.y = 0.004; tab.add(tb);
  var ts = screenPlane(0.17, 0.24, 0.012, null); ts.material = M.off; ts.rotation.x = -Math.PI / 2; ts.position.y = 0.0072; tab.add(ts);
  tab.position.set(-0.44, TY, -0.1); tab.rotation.y = 0.22; N(tab); scene.add(tab);
  var ph = new THREE.Group();
  var pb = slab(0.072, 0.15, 0.006, 0.011, M.steel, 0.0012); pb.rotation.x = -Math.PI / 2; pb.position.y = 0.0045; ph.add(pb);
  var ps = screenPlane(0.066, 0.144, 0.009, null); ps.material = M.off; ps.rotation.x = -Math.PI / 2; ps.position.y = 0.0082; ph.add(ps);
  ph.position.set(0.6, TY, -0.1); ph.rotation.y = -0.25; N(ph); scene.add(ph);

  /* props on the desk */
  var cupG = new THREE.LatheGeometry([[0, 0], [0.03, 0], [0.042, 0.012], [0.044, 0.085], [0.04, 0.086], [0.038, 0.012], [0, 0.01]].map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 48);
  var cup = new THREE.Mesh(cupG, M.ceramicDark); cup.castShadow = true; N(put(cup, -0.42, TY, -0.4));
  var cof = new THREE.Mesh(new THREE.CircleGeometry(0.038, 32), M.coffee); cof.rotation.x = -Math.PI / 2; N(put(cof, -0.42, TY + 0.076, -0.4));
  var handle = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 10, 24, Math.PI), M.ceramicDark); handle.rotation.z = -Math.PI / 2; N(put(handle, -0.375, TY + 0.05, -0.4));
  var nb = rbox(0.15, 0.012, 0.21, M.paper, 0.004); nb.rotation.y = -0.15; N(put(nb, -0.7, TY + 0.006, -0.32));
  var cover = rbox(0.152, 0.004, 0.212, M.leather, 0.002); cover.rotation.y = -0.15; N(put(cover, -0.7, TY + 0.0005, -0.32));
  var pen = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.14, 16), M.steel); pen.rotation.set(Math.PI / 2, 0, -0.5); N(put(pen, -0.6, TY + 0.006, -0.25));
  // a small stack of books at the back left of the desk
  [[0.2, 0.03, 0.15, 0x2e3b36], [0.19, 0.026, 0.14, 0xd8cfc0], [0.17, 0.03, 0.13, 0x9c4a2f]].forEach(function (bk, i) {
    var m = rbox(bk[0], bk[1], bk[2], new THREE.MeshStandardMaterial({ color: bk[3], roughness: 0.8 }), 0.004); m.rotation.y = 0.1 - i * 0.12;
    N(put(m, -0.62, TY + 0.016 + i * 0.03, -0.66));
  });

  /* light */
  var key = new THREE.SpotLight(0xffc995, 4.2, 4, 0.75, 0.8, 1.4); key.position.set(-0.5, 2.3, 0.3); key.target.position.set(0, TY, -0.25);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 10; key.shadow.blurSamples = 20; key.shadow.bias = -0.0002;
  scene.add(key, key.target);
  var rim = new THREE.SpotLight(0x8fa4ff, 3, 5, 0.8, 0.8, 1.4); rim.position.set(-1.2, 2.0, -1.5); rim.target.position.set(0, TY, -0.3); scene.add(rim, rim.target);
  scene.add(new THREE.HemisphereLight(0xfff0e0, 0x20160f, 0.14));

  scene.traverse(function (o) { if (o.isMesh && !(o.material && o.material.isMeshBasicMaterial)) o.receiveShadow = true; });

  // the laptop's own glow
  lscr.updateWorldMatrix(true, false);
  var lc = new THREE.Vector3(); lscr.getWorldPosition(lc); var ln = new THREE.Vector3(0, 0, 1).transformDirection(lscr.matrixWorld);
  lapGlow.position.copy(lc).addScaledVector(ln, 0.002); lapGlow.lookAt(lc.clone().add(ln));
}

/* ---------- camera: on the laptop screen's axis, so its screen is a clean rectangle ---------- */
var framing, cam = {};
function setupCamera() {
  var sc = screenMeshes.laptop; sc.mesh.updateWorldMatrix(true, false);
  var c = new THREE.Vector3(); sc.mesh.getWorldPosition(c);
  var nrm = new THREE.Vector3(0, 0, 1).transformDirection(sc.mesh.matrixWorld), up = new THREE.Vector3(0, 1, 0).transformDirection(sc.mesh.matrixWorld);
  var dist = framing === "land" ? 1.62 : 1.12;
  camera.fov = framing === "land" ? 38 : 60;
  camera.aspect = aspect; camera.near = 0.02; camera.far = 30;
  camera.position.copy(c).addScaledVector(nrm, dist);
  camera.up.copy(up); camera.lookAt(c);
  // shift the framing up a little so the monitors sit higher in the picture
  camera.setViewOffset(W, H, 0, framing === "land" ? -H * 0.17 : -H * 0.14, W, H);
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  cam = { center: c, normal: nrm, dist: dist };
}
function project(name) {
  var s = screenMeshes[name], hw = s.w / 2, hh = s.h / 2;
  s.mesh.updateWorldMatrix(true, false);
  var pts = [[-hw, hh], [hw, hh], [hw, -hh], [-hw, -hh]].map(function (q) {
    var v = new THREE.Vector3(q[0], q[1], 0).applyMatrix4(s.mesh.matrixWorld).project(camera);
    return [+(((v.x * 0.5 + 0.5) * W).toFixed(2)), +(((1 - (v.y * 0.5 + 0.5)) * H).toFixed(2))];
  });
  var c = new THREE.Vector3(); s.mesh.getWorldPosition(c);
  var depth = c.clone().applyMatrix4(camera.matrixWorldInverse).z * -1;
  return { corners: pts, depth: +depth.toFixed(4) };
}

/* ---------- API ---------- */
window.setup = async function (o) {
  framing = o.framing; W = o.width; H = o.height; aspect = W / H;
  var cv = document.createElement("canvas"); cv.width = W; cv.height = H; document.body.appendChild(cv);
  renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, preserveDrawingBuffer: true, alpha: false });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.AgXToneMapping; renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  camera = new THREE.PerspectiveCamera(40, aspect, 0.02, 30);
  await build(); setupCamera();
  var rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  var ao = new GTAOPass(scene, camera, W, H);
  ao.updateGtaoMaterial({ radius: 0.25, distanceExponent: 1.2, thickness: 1.2, scale: 1.1, samples: 16 });
  ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
  ao.blendIntensity = 0.9; composer.addPass(ao);
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.25, 0.5, 0.92));
  composer.addPass(new OutputPass());
  var info = { width: W, height: H, laptop: project("laptop"), left: project("left"), mid: project("mid"), right: project("right") };
  return JSON.stringify(info);
};
function setVisible(list, v) { list.forEach(function (o) { o.visible = v; }); }
window.pass = async function (name) {
  var farObjs = scene.children.filter(function (o) { return near.indexOf(o) < 0 && !o.isLight; });
  if (name === "full") { setVisible(near, true); setVisible(farObjs, true); composer.render(); }
  else if (name === "far") { setVisible(near, false); setVisible(farObjs, true); composer.render(); setVisible(near, true); }
  else if (name === "mask") {
    // near objects white on black, rendered at 2x for smooth edges (downscaled afterwards)
    setVisible(farObjs, false); setVisible(near, true);
    var bg = scene.background, tm = renderer.toneMapping, sh = renderer.shadowMap.enabled;
    scene.background = new THREE.Color(0x000000); scene.overrideMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.render(scene, camera);
    var url = renderer.domElement.toDataURL("image/png");
    scene.background = bg; scene.overrideMaterial = null; renderer.toneMapping = tm; renderer.setSize(W, H, false); setupCamera(); setVisible(farObjs, true);
    return url;
  }
  return renderer.domElement.toDataURL("image/png");
};
