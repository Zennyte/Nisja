/* Nisja Studio — offline renderer for test page B (the 3D office).
   This never runs on the website. It is bundled into a local render page and driven by Playwright,
   which renders every frame of the camera flight at full quality (ambient occlusion, soft shadows,
   screen glow, area lights, studio reflections, MSAA) and saves them as WebP frame sequences.
   The website then only flips through those images (js/office.js), so it stays smooth on any phone.
   Usage in the render page: await window.setup({ device, width, height }); await window.frame(i, n) */
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
  var c = canvas(2048, 512), g = c.getContext("2d"), r = rand(seed);
  var grd = g.createLinearGradient(0, 0, 0, 512); grd.addColorStop(0, base[0]); grd.addColorStop(1, base[1]);
  g.fillStyle = grd; g.fillRect(0, 0, 2048, 512);
  for (var k = 0; k < 160; k++) {
    g.strokeStyle = "rgba(" + (r() > 0.55 ? "40,24,12" : "215,175,125") + "," + (0.05 + r() * 0.14) + ")"; g.lineWidth = 0.6 + r() * 2.4;
    var y = r() * 512; g.beginPath(); g.moveTo(0, y);
    for (var x = 0; x <= 2048; x += 48) g.lineTo(x, y + Math.sin(x / (180 + r() * 60) + k) * (2 + r() * 6));
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

/* ---------- build ---------- */
async function build() {
  RectAreaLightUniformsLib.init();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0b0a);

  var exr = await new Promise(function (res) { new EXRLoader().load("apartment.exr", res); });
  exr.mapping = THREE.EquirectangularReflectionMapping;
  var pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(exr).texture;
  scene.environmentIntensity = 0.22;

  var floorT = planks(), wallT = plaster("#2c2723", 4), backT = plaster("#25211e", 9);
  var oak = woodStrip(31, ["#b48a5e", "#9c7349"]), walnut = woodStrip(32, ["#5a3a24", "#45291a"]);
  var feltN = tex(heightToNormal(noiseTex(5, 512, 512, 0.5), 2), false, [6, 6]);
  var M = {
    floor: new THREE.MeshStandardMaterial({ map: floorT.map, normalMap: floorT.normalMap, roughnessMap: floorT.roughnessMap, roughness: 0.62, normalScale: new THREE.Vector2(0.6, 0.6) }),
    wall: new THREE.MeshStandardMaterial({ map: wallT.map, normalMap: wallT.normalMap, roughness: 0.94 }),
    back: new THREE.MeshStandardMaterial({ map: backT.map, normalMap: backT.normalMap, roughness: 0.96 }),
    ceil: new THREE.MeshStandardMaterial({ color: 0x161412, roughness: 1 }),
    oak: new THREE.MeshStandardMaterial({ map: oak, roughness: 0.48 }),
    table: new THREE.MeshStandardMaterial({ map: oak, roughness: 0.62, color: 0xc9b8a6 }),
    walnut: new THREE.MeshStandardMaterial({ map: walnut, roughness: 0.34 }),
    felt: new THREE.MeshStandardMaterial({ color: 0x151312, roughness: 1, normalMap: feltN }),
    steel: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.38, metalness: 0.8 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xc7c9cd, roughness: 0.26, metalness: 1 }),
    grey: new THREE.MeshStandardMaterial({ color: 0x3b3d42, roughness: 0.3, metalness: 1 }),
    key: new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: 0.55, metalness: 0.1 }),
    pad: new THREE.MeshStandardMaterial({ color: 0xb4b6ba, roughness: 0.42, metalness: 0.9 }),
    bezel: new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.12, metalness: 0.2 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: 0xe9e4dc, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
    ceramicDark: new THREE.MeshPhysicalMaterial({ color: 0x2b2a28, roughness: 0.5, clearcoat: 0.4 }),
    terracotta: new THREE.MeshStandardMaterial({ color: 0xa45a3b, roughness: 0.9 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x8b8277, roughness: 1, normalMap: feltN }),
    leather: new THREE.MeshPhysicalMaterial({ color: 0x5a3422, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.5 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xefe9de, roughness: 0.9 }),
    led: new THREE.MeshBasicMaterial({ color: 0xff7a3a }),
    lamp: new THREE.MeshBasicMaterial({ color: 0xfff3e0 }),
    rug: new THREE.MeshStandardMaterial({ color: 0x4a423a, roughness: 1, normalMap: tex(heightToNormal(noiseTex(8, 512, 512, 0.9), 3), false, [8, 5]) }),
    coffee: new THREE.MeshStandardMaterial({ color: 0x2a160b, roughness: 0.15 })
  };

  /* room: 8.4 × 7 × 3.1 m */
  var RW = 8.4, RH = 3.1, BACK = -3.6, FRONT = 3.4;
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, FRONT - BACK), M.floor); floor.rotation.x = -Math.PI / 2; floor.position.z = (FRONT + BACK) / 2; floor.receiveShadow = true; scene.add(floor);
  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, FRONT - BACK), M.ceil); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, RH, (FRONT + BACK) / 2); scene.add(ceil);
  var back = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), M.back); back.position.set(0, RH / 2, BACK); back.receiveShadow = true; scene.add(back);
  var lw = new THREE.Mesh(new THREE.PlaneGeometry(FRONT - BACK, RH), M.wall); lw.rotation.y = Math.PI / 2; lw.position.set(-RW / 2, RH / 2, (FRONT + BACK) / 2); lw.receiveShadow = true; scene.add(lw);
  var rw = lw.clone(); rw.rotation.y = -Math.PI / 2; rw.position.x = RW / 2; scene.add(rw);
  // skirting
  put(rbox(RW, 0.08, 0.02, M.steel, 0.004), 0, 0.04, BACK + 0.01);
  [-1, 1].forEach(function (s) { var k = rbox(0.02, 0.08, FRONT - BACK, M.steel, 0.004); put(k, s * (RW / 2 - 0.01), 0.04, (FRONT + BACK) / 2); });

  // acoustic oak slat wall behind the TV: felt backing + 34 slats
  put(rbox(4.2, RH - 0.02, 0.02, M.felt, 0.005), 0, RH / 2, BACK + 0.012);
  for (var s = 0; s < 34; s++) put(rbox(0.06, RH - 0.04, 0.035, M.oak, 0.008, 2), -2.06 + s * 0.1245, RH / 2, BACK + 0.04);
  // recessed LED line along the floor of the slat wall
  put(new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.012, 0.012), M.led), 0, 0.012, BACK + 0.07);
  var ledA = new THREE.RectAreaLight(0xff7a3a, 6, 4.2, 0.06); ledA.position.set(0, 0.02, BACK + 0.12); ledA.lookAt(0, 1.2, BACK + 0.12); scene.add(ledA);

  /* screens */
  function display(w, h, map, imgAspect, depth) {
    var g = new THREE.Group();
    var frame = rbox(w + 0.018, h + 0.018, depth || 0.03, M.bezel, 0.004); g.add(frame);
    if (imgAspect) coverUV(map, imgAspect, w / h);
    var scr = screenPlane(w, h, 0.002, map); scr.position.z = (depth || 0.03) / 2 + 0.0008; g.add(scr);
    var gl = glass(w, h, 0.002); gl.position.z = (depth || 0.03) / 2 + 0.0016; g.add(gl);
    return { group: g, screen: scr };
  }
  function screenLight(color, w, h, intensity, pos, look) {
    var l = new THREE.RectAreaLight(color, intensity, w, h); l.position.copy(pos); l.lookAt(look); scene.add(l); return l;
  }
  // main 85" TV, the two side TVs show other recordings
  var tvSpecs = [["kaliber", 2.2, 1.2375, new THREE.Vector3(0, 1.62, BACK + 0.09)], ["fener", 1.15, 0.647, new THREE.Vector3(-3.0, 1.68, BACK + 0.04)], ["kroni", 1.15, 0.647, new THREE.Vector3(3.0, 1.68, BACK + 0.04)]];
  for (var t = 0; t < tvSpecs.length; t++) {
    var sp = tvSpecs[t], first = await load("tv/" + sp[0] + "/001.jpg");
    var d = display(sp[1], sp[2], first, 1040 / 586, t === 0 ? 0.035 : 0.03);
    put(d.group, sp[3].x, sp[3].y, sp[3].z);
    var lt = screenLight(0xb8c6e0, sp[1], sp[2], t === 0 ? 2.6 : 1.4, new THREE.Vector3(sp[3].x, sp[3].y, sp[3].z + 0.05), new THREE.Vector3(sp[3].x, sp[3].y, sp[3].z + 2));
    tvs.push({ name: sp[0], screen: d.screen, light: lt, aspect: 1040 / 586, cache: {} });
  }
  // logo, lit from below
  var logoT = await load("logo.png"), la = logoT.image.height / logoT.image.width;
  var logo = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.78 * la), new THREE.MeshBasicMaterial({ map: logoT, transparent: true, toneMapped: false, color: 0xd9d4cc }));
  put(logo, 0, 2.62, BACK + 0.065);

  // floating walnut credenza with objects
  put(rbox(3.4, 0.46, 0.46, M.walnut, 0.015), 0, 0.42, BACK + 0.29);
  for (var dz = -1; dz <= 1; dz++) put(new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.42, 0.002), M.steel), dz * 0.85, 0.42, BACK + 0.521);
  put(new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.01, 0.01), M.led), 0, 0.185, BACK + 0.3);
  var underL = new THREE.RectAreaLight(0xffa060, 3, 3.3, 0.3); underL.position.set(0, 0.18, BACK + 0.3); underL.lookAt(0, 0, BACK + 0.3); scene.add(underL);
  // books, vase, bowl, small speaker
  var br = rand(77);
  for (var b = 0; b < 7; b++) { var bh = 0.2 + br() * 0.06; put(rbox(0.035 + br() * 0.02, bh, 0.16, new THREE.MeshStandardMaterial({ color: [0x9c4a2f, 0xd8cfc0, 0x2e3b36, 0x1f1d1b, 0xb68b4c, 0x55606a, 0xe3ddd2][b], roughness: 0.8 }), 0.004), -1.38 + b * 0.05, 0.65 + bh / 2, BACK + 0.3); }
  var vaseG = new THREE.LatheGeometry([[0, 0], [0.06, 0], [0.085, 0.06], [0.07, 0.18], [0.035, 0.26], [0.04, 0.3], [0.045, 0.31]].map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 48);
  var vase = new THREE.Mesh(vaseG, M.ceramicDark); vase.castShadow = true; put(vase, 1.12, 0.65, BACK + 0.28);
  var bowl = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.09, 0.005], [0.13, 0.05], [0.135, 0.055]].map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 48), M.ceramic); bowl.castShadow = true; put(bowl, -0.95, 0.65, BACK + 0.3);
  put(rbox(0.16, 0.24, 0.13, M.fabric, 0.03), 1.42, 0.77, BACK + 0.3);

  // plants: snake plants and a large leafy plant
  function leafGeo(len, width, bend) {
    var s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(width, len * 0.25, width * 0.9, len * 0.7, 0, len); s.bezierCurveTo(-width * 0.9, len * 0.7, -width, len * 0.25, 0, 0);
    var g = new THREE.ShapeGeometry(s, 12), p = g.attributes.position;
    for (var i = 0; i < p.count; i++) { var y = p.getY(i) / len, x = p.getX(i); p.setZ(i, bend * y * y + Math.abs(x) * 0.35 * -1); }
    g.computeVertexNormals(); return g;
  }
  function snakePlant(x, z, sc, potMat) {
    var g = new THREE.Group(), r = rand(Math.round(x * 97 + z * 13 + 500));
    var pot = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.34, 40), potMat); pot.position.y = 0.17; pot.castShadow = pot.receiveShadow = true; g.add(pot);
    var soil = new THREE.Mesh(new THREE.CircleGeometry(0.16, 32), new THREE.MeshStandardMaterial({ color: 0x24170f, roughness: 1 })); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.32; g.add(soil);
    for (var i = 0; i < 14; i++) {
      var len = 0.45 + r() * 0.5, m = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.27 + r() * 0.05, 0.42, 0.18 + r() * 0.08), roughness: 0.55, side: THREE.DoubleSide });
      var leaf = new THREE.Mesh(leafGeo(len, 0.035 + r() * 0.02, 0.06 + r() * 0.12), m);
      var a = r() * Math.PI * 2; leaf.position.set(Math.cos(a) * 0.06, 0.3, Math.sin(a) * 0.06); leaf.rotation.set(-0.12 - r() * 0.2, a, (r() - 0.5) * 0.35);
      leaf.castShadow = true; g.add(leaf);
    }
    g.scale.setScalar(sc); g.position.set(x, 0, z); scene.add(g); return g;
  }
  function leafyPlant(x, z, sc) {
    var g = new THREE.Group(), r = rand(Math.round(x * 31 + 900));
    var pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.46, 48), M.ceramic); pot.position.y = 0.23; pot.castShadow = true; g.add(pot);
    for (var i = 0; i < 9; i++) {
      var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.011, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x3c4a2a, roughness: 0.8 }));
      var a = r() * Math.PI * 2, tilt = 0.15 + r() * 0.3; stem.position.set(Math.cos(a) * 0.1, 1.0, Math.sin(a) * 0.1); stem.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt); g.add(stem);
      for (var k = 0; k < 4; k++) {
        var m = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.29 + r() * 0.04, 0.45, 0.16 + r() * 0.07), roughness: 0.45, side: THREE.DoubleSide });
        var leaf = new THREE.Mesh(leafGeo(0.22 + r() * 0.08, 0.12 + r() * 0.04, 0.05), m);
        var h = 0.7 + k * 0.28 + r() * 0.12, aa = a + (r() - 0.5) * 1.5;
        leaf.position.set(Math.cos(aa) * (0.12 + tilt * h * 0.5), h + 0.2, Math.sin(aa) * (0.12 + tilt * h * 0.5));
        leaf.rotation.set(-0.9 + r() * 0.4, aa + Math.PI / 2, (r() - 0.5) * 0.6); leaf.castShadow = true; g.add(leaf);
      }
    }
    g.scale.setScalar(sc); g.position.set(x, 0, z); scene.add(g); return g;
  }
  snakePlant(-1.65, BACK + 0.32, 0.55, M.ceramicDark).position.y = 0.65;
  leafyPlant(-3.55, BACK + 0.65, 1.25);
  snakePlant(3.6, BACK + 0.55, 1.15, M.terracotta);
  leafyPlant(3.5, 1.4, 1.1);

  // left wall: big window onto the city at dusk + sheer light
  var sky = (function () {
    var c = canvas(1024, 768), g = c.getContext("2d"), grd = g.createLinearGradient(0, 0, 0, 768);
    grd.addColorStop(0, "#141a33"); grd.addColorStop(0.45, "#4b3c5c"); grd.addColorStop(0.72, "#c4704a"); grd.addColorStop(0.86, "#f0a35e"); grd.addColorStop(1, "#f6c27e");
    g.fillStyle = grd; g.fillRect(0, 0, 1024, 768);
    var r = rand(12); for (var layer = 0; layer < 2; layer++) {
      g.fillStyle = layer ? "#0f0d0c" : "#2a2230"; var x = 0;
      while (x < 1024) { var bw = 26 + r() * 70, bh = (layer ? 120 : 200) + r() * (layer ? 220 : 160); g.fillRect(x, 768 - bh, bw, bh);
        if (layer) for (var k = 0; k < bh / 14; k++) for (var q = 0; q < bw / 12; q++) if (r() < 0.35) { g.fillStyle = "rgba(255," + (180 + r() * 50 | 0) + ",110," + (0.5 + r() * 0.5) + ")"; g.fillRect(x + 4 + q * 12, 768 - bh + 6 + k * 14, 4, 6); g.fillStyle = "#0f0d0c"; }
        x += bw + r() * 8; }
    }
    return tex(c, true);
  })();
  var win = new THREE.Group();
  var skyM = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.1), new THREE.MeshBasicMaterial({ map: sky, toneMapped: false })); skyM.position.z = -0.12; win.add(skyM);
  [[0, 1.08, 3.3, 0.06], [0, -1.08, 3.3, 0.06], [-1.62, 0, 0.06, 2.22], [1.62, 0, 0.06, 2.22], [-0.54, 0, 0.035, 2.16], [0.54, 0, 0.035, 2.16]].forEach(function (f) { put(rbox(f[2], f[3], 0.08, M.steel, 0.006), f[0], f[1], 0, win); });
  put(rbox(3.4, 0.04, 0.26, M.oak, 0.01), 0, -1.12, 0.1, win);
  win.rotation.y = Math.PI / 2; put(win, -RW / 2 + 0.03, 1.55, -0.6);
  var winL = new THREE.RectAreaLight(0xf1a46a, 7, 3.1, 2.0); winL.position.set(-RW / 2 + 0.06, 1.55, -0.6); winL.lookAt(0, 1.2, -0.6); scene.add(winL);
  var sun = new THREE.DirectionalLight(0xffb27a, 2.2); sun.position.set(-RW / 2 - 2, 2.6, 0.4); sun.target.position.set(0.5, 0.6, 0.2);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 6; sun.shadow.blurSamples = 16; sun.shadow.bias = -0.0003;
  var sc = sun.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 3; sc.bottom = -3; sc.near = 0.5; sc.far = 12;
  scene.add(sun, sun.target);

  // right wall: designer's desk, two monitors, chair
  var ws = new THREE.Group();
  put(rbox(1.9, 0.035, 0.75, M.oak, 0.01), 0, 0.74, 0, ws);
  [-0.88, 0.88].forEach(function (x) { put(rbox(0.04, 0.72, 0.65, M.steel, 0.006), x, 0.36, 0, ws); });
  var mons = [["lisi", -0.42, 0.14], ["embel", 0.42, -0.14]];
  for (var mi = 0; mi < mons.length; mi++) {
    var mt = await load(mons[mi][0] + ".webp"), md = display(0.8, 0.45, mt, 1.6, 0.025);
    md.group.position.set(mons[mi][1], 1.16, -0.18); md.group.rotation.y = mons[mi][2]; ws.add(md.group);
    put(rbox(0.035, 0.32, 0.03, M.grey, 0.006), mons[mi][1], 0.92, -0.22, ws); put(rbox(0.2, 0.012, 0.16, M.grey, 0.005), mons[mi][1], 0.765, -0.18, ws);
  }
  put(rbox(0.42, 0.018, 0.14, M.key, 0.006), 0, 0.767, 0.12, ws);
  ws.rotation.y = -Math.PI / 2; put(ws, RW / 2 - 0.45, 0, -1.25);
  var monL = new THREE.RectAreaLight(0xc9d6ea, 1.4, 1.6, 0.45); monL.position.set(RW / 2 - 0.68, 1.16, -1.25); monL.lookAt(0, 1.16, -1.25); scene.add(monL);

  // ceiling: two recessed light lines and a pendant over the table
  [-1.5, 1.5].forEach(function (x) {
    put(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 4.6), M.lamp), x, RH - 0.004, -0.9);
    var l = new THREE.RectAreaLight(0xfff0dc, 3.2, 0.05, 4.6); l.position.set(x, RH - 0.01, -0.9); l.lookAt(x, 0, -0.9); scene.add(l);
  });
  var pend = new THREE.Group();
  var shadeG = new THREE.LatheGeometry([[0.02, 0.2], [0.05, 0.19], [0.17, 0.08], [0.26, 0.0], [0.262, -0.005]].map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 64);
  pend.add(new THREE.Mesh(shadeG, new THREE.MeshStandardMaterial({ color: 0x1b1a19, roughness: 0.35, metalness: 0.7, side: THREE.DoubleSide })));
  var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 24, 16), M.lamp); bulb.position.y = 0.06; pend.add(bulb);
  var cord = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.9, 8), M.steel); cord.position.y = 0.65; pend.add(cord);
  put(pend, 0, RH - 1.1, 0.95);
  var key = new THREE.SpotLight(0xffe0bb, 9, 5, 0.85, 0.6, 1.4); key.position.set(0, RH - 1.1, 0.95); key.target.position.set(0, 0.75, 0.6);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 9; key.shadow.blurSamples = 20; key.shadow.bias = -0.0002; key.shadow.camera.near = 0.2;
  scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0xfff0e0, 0x20160f, 0.18));

  /* the client's table, chairs across it, rug */
  var TY = 0.75, TZ = 0.62;
  put(new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.4), M.rug), 0, 0.004, TZ - 0.1).rotation.x = -Math.PI / 2;
  put(rbox(2.0, 0.04, 1.0, M.table, 0.012), 0, TY - 0.02, TZ);
  [[-0.88, -0.38], [0.88, -0.38], [-0.88, 0.38], [0.88, 0.38]].forEach(function (p) { put(rbox(0.045, TY - 0.04, 0.045, M.steel, 0.008), p[0], (TY - 0.04) / 2, TZ + p[1]); });
  function chair(x, z, ry) {
    var g = new THREE.Group();
    put(rbox(0.46, 0.06, 0.46, M.leather, 0.025), 0, 0.46, 0, g);
    var backC = rbox(0.46, 0.36, 0.05, M.leather, 0.022); backC.position.set(0, 0.74, -0.21); backC.rotation.x = -0.12; g.add(backC);
    [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(function (p) { var l = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.44, 12), M.steel); l.position.set(p[0], 0.22, p[1]); l.castShadow = true; g.add(l); });
    g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  }
  chair(-0.45, TZ - 0.78, 0); chair(0.45, TZ - 0.78, 0);
  // coffee cup + saucer, notebook + pen
  var cupG = new THREE.LatheGeometry([[0, 0], [0.028, 0], [0.04, 0.012], [0.042, 0.07], [0.038, 0.071], [0.036, 0.012], [0.0, 0.01]].map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 48);
  var cup = new THREE.Mesh(cupG, M.ceramic); cup.castShadow = true; put(cup, 0.82, TY + 0.006, TZ + 0.22);
  var cof = new THREE.Mesh(new THREE.CircleGeometry(0.036, 32), M.coffee); cof.rotation.x = -Math.PI / 2; put(cof, 0.82, TY + 0.062, TZ + 0.22);
  var handle = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.005, 10, 24, Math.PI), M.ceramic); handle.rotation.z = -Math.PI / 2; put(handle, 0.862, TY + 0.045, TZ + 0.22);
  put(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.008, 48), M.ceramic), 0.82, TY + 0.004, TZ + 0.22).castShadow = true;
  var nb = rbox(0.15, 0.012, 0.21, M.paper, 0.004); nb.rotation.y = 0.22; put(nb, -0.8, TY + 0.006, TZ + 0.2);
  var cover = rbox(0.152, 0.004, 0.212, M.leather, 0.002); cover.rotation.y = 0.22; put(cover, -0.8, TY + 0.0005, TZ + 0.2);
  var pen = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.14, 16), M.steel); pen.rotation.set(Math.PI / 2, 0, 0.7); put(pen, -0.68, TY + 0.006, TZ + 0.24);

  /* devices: the one we fly into sits in front, the other two to the sides */
  var heroT = { laptop: await load("hero-laptop.webp"), tablet: await load("hero-tablet.webp"), phone: await load("hero-phone.webp") };
  var heroA = { laptop: 1440 / 900, tablet: 810 / 1080, phone: 390 / 844 };
  var order = { laptop: ["tablet", "phone"], tablet: ["laptop", "phone"], phone: ["laptop", "tablet"] }[target];
  function slot(name, g) {
    if (name === target) { g.position.set(0, TY, TZ + (name === "laptop" ? 0.16 : name === "tablet" ? 0.24 : 0.3)); g.rotation.y = 0; }
    else if (name === order[0]) { g.position.set(name === "laptop" ? -0.56 : -0.5, TY, TZ + 0.18); g.rotation.y = 0.36; }
    else { g.position.set(0.5, TY, TZ + 0.22); g.rotation.y = -0.4; }
    scene.add(g);
  }
  // laptop
  (function () {
    var sa = 1.6, Wd = 0.3, Hd = Wd / sa, g = new THREE.Group();
    var base = slab(0.312, 0.218, 0.006, 0.012, M.alu, 0.0025); base.rotation.x = -Math.PI / 2; base.position.y = 0.0055; g.add(base);
    var well = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.105), new THREE.MeshStandardMaterial({ color: 0x9fa2a7, roughness: 0.35, metalness: 1 })); well.rotation.x = -Math.PI / 2; well.position.set(0, 0.0112, -0.035); g.add(well);
    var keys = new THREE.InstancedMesh(new RoundedBoxGeometry(0.0155, 0.002, 0.0155, 2, 0.002), M.key, 80), mm = new THREE.Matrix4(), k = 0;
    for (var row = 0; row < 6; row++) for (var col = 0; col < 14 && k < 80; col++) {
      var kw = (row === 5 && col > 3 && col < 9) ? 0 : 1; if (!kw) continue;
      mm.makeTranslation(-0.1235 + col * 0.019, 0.0118, -0.083 + row * 0.019); keys.setMatrixAt(k++, mm);
    }
    var space = rbox(0.09, 0.002, 0.0155, M.key, 0.002); space.position.set(-0.0005, 0.0118, -0.083 + 5 * 0.019); g.add(space);
    keys.count = k; keys.castShadow = true; g.add(keys);
    var pad = slab(0.12, 0.075, 0.0006, 0.006, M.pad, 0.0004); pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.0112, 0.058); g.add(pad);
    var lid = new THREE.Group(); lid.position.set(0, 0.009, -0.106); lid.rotation.x = -0.27;
    var shell = slab(Wd + 0.012, Hd + 0.016, 0.003, 0.012, M.alu, 0.0015); shell.position.set(0, (Hd + 0.016) / 2, -0.0035); lid.add(shell);
    var bez = screenPlane(Wd + 0.01, Hd + 0.014, 0.011, null); bez.material = M.bezel; bez.position.set(0, (Hd + 0.016) / 2, 0.0002); lid.add(bez);
    var map = heroT.laptop; coverUV(map, heroA.laptop, sa);
    var scr = screenPlane(Wd, Hd, 0.003, map); scr.position.set(0, (Hd + 0.016) / 2 + 0.002, 0.0006); lid.add(scr);
    var gl = glass(Wd + 0.01, Hd + 0.014, 0.011); gl.position.set(0, (Hd + 0.016) / 2, 0.001); lid.add(gl);
    var hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.26, 16), M.grey); hinge.rotation.z = Math.PI / 2; hinge.position.set(0, 0.009, -0.106); g.add(hinge);
    g.add(lid); slot("laptop", g); screens.laptop = { mesh: scr, w: Wd, h: Hd };
  })();
  // tablet on an aluminium stand
  (function () {
    var sa = 0.75, Hd = 0.235, Wd = Hd * sa, g = new THREE.Group();
    var foot = slab(0.12, 0.13, 0.008, 0.02, M.alu, 0.002); foot.rotation.x = -Math.PI / 2; foot.position.y = 0.006; g.add(foot);
    var arm = rbox(0.06, 0.13, 0.008, M.alu, 0.003); arm.position.set(0, 0.07, -0.03); arm.rotation.x = -0.32; g.add(arm);
    var body = new THREE.Group(); body.position.set(0, 0.035 + Hd / 2 + 0.01, -0.01); body.rotation.x = -0.32;
    body.add(slab(Wd + 0.018, Hd + 0.018, 0.005, 0.018, M.grey, 0.0012));
    var bez = screenPlane(Wd + 0.014, Hd + 0.014, 0.016, null); bez.material = M.bezel; bez.position.z = 0.0042; body.add(bez);
    var map = heroT.tablet; coverUV(map, heroA.tablet, sa);
    var scr = screenPlane(Wd, Hd, 0.008, map); scr.position.z = 0.0046; body.add(scr);
    var gl = glass(Wd + 0.014, Hd + 0.014, 0.016); gl.position.z = 0.005; body.add(gl);
    g.add(body); slot("tablet", g); screens.tablet = { mesh: scr, w: Wd, h: Hd };
  })();
  // phone on a small stand
  (function () {
    var sa = 390 / 844, Hd = 0.142, Wd = Hd * sa, g = new THREE.Group();
    var foot = slab(0.07, 0.07, 0.006, 0.012, M.steel, 0.0015); foot.rotation.x = -Math.PI / 2; foot.position.y = 0.0045; g.add(foot);
    var lip = rbox(0.06, 0.012, 0.012, M.steel, 0.004); lip.position.set(0, 0.012, 0.018); g.add(lip);
    var body = new THREE.Group(); body.position.set(0, 0.012 + (Hd + 0.008) / 2, 0.006); body.rotation.x = -0.24;
    body.add(slab(Wd + 0.008, Hd + 0.008, 0.006, 0.012, M.grey, 0.0012));
    var bez = screenPlane(Wd + 0.006, Hd + 0.006, 0.011, null); bez.material = M.bezel; bez.position.z = 0.0043; body.add(bez);
    var map = heroT.phone; coverUV(map, heroA.phone, sa);
    var scr = screenPlane(Wd, Hd, 0.009, map); scr.position.z = 0.0047; body.add(scr);
    var island = screenPlane(0.018, 0.005, 0.0025, null); island.material = new THREE.MeshBasicMaterial({ color: 0x000000 }); island.position.set(0, Hd / 2 - 0.006, 0.0049); body.add(island);
    var gl = glass(Wd + 0.006, Hd + 0.006, 0.011); gl.position.z = 0.0052; body.add(gl);
    [[0.004, 0.02, 0.03], [0.004, 0.012, 0.005]].forEach(function (b, i) { var btn = rbox(0.002, b[1], 0.003, M.grey, 0.001); btn.position.set(i ? -(Wd / 2 + 0.005) : Wd / 2 + 0.005, b[2], 0); body.add(btn); });
    g.add(body); slot("phone", g); screens.phone = { mesh: scr, w: Wd, h: Hd };
  })();

  scene.traverse(function (o) { if (o.isMesh && !(o.material && o.material.isMeshBasicMaterial)) { o.castShadow = o.castShadow || false; o.receiveShadow = true; } });
}

/* ---------- camera path ---------- */
function setupPath() {
  var EYE = new THREE.Vector3(0, 1.2, 1.95);
  var start = new THREE.Vector3(0, aspect < 1 ? 1.32 : 1.52, -3.6);
  var sc = screens[target]; sc.mesh.updateWorldMatrix(true, false);
  var c = new THREE.Vector3(); sc.mesh.getWorldPosition(c);
  var nrm = new THREE.Vector3(0, 0, 1).transformDirection(sc.mesh.matrixWorld), up = new THREE.Vector3(0, 1, 0).transformDirection(sc.mesh.matrixWorld);
  var endFov = 34, half = THREE.MathUtils.degToRad(endFov / 2);
  var d = Math.min((sc.h / 2) / Math.tan(half), (sc.w / 2) / (Math.tan(half) * aspect)) * 0.992;
  var pEnd = c.clone().addScaledVector(nrm, d);
  var qEnd = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(pEnd, c, up));
  var tmp = new THREE.PerspectiveCamera(); tmp.position.copy(EYE); tmp.lookAt(start); var qStart = tmp.quaternion.clone();
  var pMid = EYE.clone().lerp(pEnd, target === "laptop" ? 0.35 : 0.55); pMid.y = Math.max(pEnd.y + 0.12, EYE.y - 0.12);
  tmp.position.copy(pMid); tmp.lookAt(c); var qMid = tmp.quaternion.clone();
  var startFov = aspect < 0.6 ? 70 : aspect < 1 ? 58 : 46;
  path = { EYE: EYE, pMid: pMid, pEnd: pEnd, qStart: qStart, qMid: qMid, qEnd: qEnd, startFov: startFov, endFov: endFov };
}
function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function place(p) {
  var split = target === "laptop" ? 0.42 : 0.3;
  var a = THREE.MathUtils.clamp(p / split, 0, 1), b = THREE.MathUtils.clamp((p - split) / (1 - split), 0, 1), ea = ease(a), eb = ease(b);
  if (b <= 0) { camera.position.copy(path.EYE).lerp(path.pMid, ea); camera.quaternion.copy(path.qStart).slerp(path.qMid, ea); }
  else { camera.position.copy(path.pMid).lerp(path.pEnd, eb); camera.quaternion.copy(path.qMid).slerp(path.qEnd, eb); }
  var midFov = target === "laptop" ? path.startFov : Math.min(path.startFov, 56);
  camera.fov = b > 0 ? THREE.MathUtils.lerp(midFov, path.endFov, eb) : THREE.MathUtils.lerp(path.startFov, midFov, ea);
  camera.aspect = aspect; camera.updateProjectionMatrix();
  return eb;
}

/* ---------- API for the render page ---------- */
window.setup = async function (o) {
  target = o.device; W = o.width; H = o.height; aspect = W / H;
  var cv = document.createElement("canvas"); cv.width = W; cv.height = H; document.body.appendChild(cv);
  renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.AgXToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  camera = new THREE.PerspectiveCamera(46, aspect, 0.01, 40);
  await build();
  setupPath();
  var rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  var ao = new GTAOPass(scene, camera, W, H); ao.output = GTAOPass.OUTPUT.Default;
  ao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.2, thickness: 1.2, scale: 1.1, samples: 16 });
  ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
  ao.blendIntensity = 0.9;
  composer.addPass(ao);
  window.__bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.28, 0.55, 0.9);
  composer.addPass(window.__bloom);
  composer.addPass(new OutputPass());
  return true;
};
window.frame = async function (i, n) {
  var p = n > 1 ? i / (n - 1) : 0;
  var eb = place(p);
  window.__bloom.strength = 0.28 * (1 - eb);
  // the TVs play their recordings as the camera moves
  for (var t = 0; t < tvs.length; t++) {
    var tv = tvs[t], idx = 1 + Math.floor(p * 46 + t * 7) % 49, key = String(idx).padStart(3, "0");
    if (!tv.cache[key]) tv.cache[key] = await load("tv/" + tv.name + "/" + key + ".jpg");
    var tx = tv.cache[key]; tx.repeat.copy(tvs[t].screen.material.map.repeat); tx.offset.copy(tvs[t].screen.material.map.offset);
    tv.screen.material.map = tx; tv.screen.material.needsUpdate = true;
  }
  // the device we fly into reaches full brightness at the hand-off
  screens[target].mesh.material.color.setScalar(0.9 + 0.1 * eb);
  composer.render();
  // where the target screen lands in the image, so the true-colour screenshot can be laid over it
  var sc = screens[target], hw = sc.w / 2, hh = sc.h / 2, pts = [[-hw, hh], [hw, hh], [hw, -hh], [-hw, -hh]].map(function (q) {
    var v = new THREE.Vector3(q[0], q[1], 0).applyMatrix4(sc.mesh.matrixWorld).project(camera);
    return [(v.x * 0.5 + 0.5) * W, (1 - (v.y * 0.5 + 0.5)) * H];
  });
  return JSON.stringify({ img: renderer.domElement.toDataURL("image/webp", o_quality()), corners: pts, dim: 0.9 + 0.1 * eb });
};
function o_quality() { return window.__q || 0.84; }
