/* Nisja Studio — test page B: a Nisja workstation by a window over the city at night; one scroll flies
   into the laptop and on into the real site, one scroll up brings you back.
   The scene was rendered once, offline (js-src/desk-render.src.js), as two depth layers: "far" (the
   window and the night skyline) and "near" (the desk and everything on it: monitors on their stands,
   the laptop, headphones on a stand, and a tablet and phone that are switched off). Here those layers are two
   images, and the fly-in is a dolly done with CSS transforms only: each layer scales by its own depth
   (z / (z − d)), so the desk rushes past faster than the city, all on the GPU. The screens are live
   HTML mapped onto the render in perspective with matrix3d: Nika's project strip, a code editor that
   types, Udha's hero and booking confirmation, and the Nisja homepage on the laptop. When the laptop's
   screen fills the view, the overlay fades into the real homepage hero, which is pinned underneath. */
(function () {
  "use strict";
  var wrap = document.getElementById("zyra"), hero = document.querySelector(".sh");
  if (!wrap || !hero || !window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { wrap.remove(); return; }
  var root = document.documentElement, header = document.querySelector(".site-header");
  var T = (window.Nisja && window.Nisja.t) || function (sq) { return sq; };
  var hint = wrap.querySelector(".zy-hint"); if (hint) hint.textContent = T("Lëvizni poshtë", "Scroll down");

  /* where everything sits in the two renders (image pixels) and how far it is from the camera (m) */
  var INFO = {
    land: { w: 3000, h: 1875,
      laptop: [[1247.9, 1098.69], [1752.1, 1098.69], [1752.1, 1413.81], [1247.9, 1413.81]], zNear: 1.62,
      left: [[-5.61, 600.58], [978.65, 599.3], [1000.03, 1082.54], [64.24, 1147.19]],
      mid: [[1008.55, 528.63], [1991.45, 528.63], [1968.89, 1072.68], [1031.11, 1072.68]],
      right: [[2156.82, 433.03], [2643.36, 422.55], [2564.04, 1252.27], [2113.92, 1213.52]], zFar: 3.0 },
    port: { w: 1290, h: 2580,
      laptop: [[345.76, 1464.17], [944.24, 1464.17], [944.24, 1838.23], [345.76, 1838.23]], zNear: 1.12,
      left: [[-1128.25, 878.98], [61.68, 916.16], [93.82, 1459.69], [-1012.52, 1525.29]],
      mid: [[89.88, 829.31], [1200.12, 829.31], [1165.64, 1447.37], [124.36, 1447.37]],
      right: [[1389.28, 718.37], [1974.4, 681.84], [1847.4, 1646.7], [1323.78, 1603.96]], zFar: 2.5 }
  };
  var SIZE = { laptop: [1440, 900], left: [1600, 900], mid: [1280, 718], right: [900, 1600] };

  var stage = wrap.querySelector(".zy-stage"), farG = wrap.querySelector(".zy-far"), nearG = wrap.querySelector(".zy-near");
  var farImg = farG.querySelector(".zy-img"), nearImg = nearG.querySelector(".zy-img");
  var framing = null, F, vw, vh, s0, ox, oy, V, kEnd, endPos;

  /* ---------- perspective mapping: a w×h box onto any four corners ---------- */
  function homography(w, h, q) {
    var src = [[0, 0], [w, 0], [w, h], [0, h]], A = [], b = [];
    for (var i = 0; i < 4; i++) {
      var x = src[i][0], y = src[i][1], u = q[i][0], v = q[i][1];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
    }
    for (var c = 0; c < 8; c++) {                                // Gaussian elimination
      var p = c; for (var r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      var t = A[c]; A[c] = A[p]; A[p] = t; t = b[c]; b[c] = b[p]; b[p] = t;
      for (r = c + 1; r < 8; r++) { var f = A[r][c] / A[c][c]; for (var k = c; k < 8; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
    }
    var m = new Array(8);
    for (var i2 = 7; i2 >= 0; i2--) { var s = b[i2]; for (var j = i2 + 1; j < 8; j++) s -= A[i2][j] * m[j]; m[i2] = s / A[i2][i2]; }
    return "matrix3d(" + [m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, 1].map(function (n) { return +n.toFixed(9); }).join(",") + ")";
  }
  function grow(q, px) {                                         // a hair larger, so no seam shows at the edges
    var cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2;
    return q.map(function (p) { var dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * px, p[1] + dy / l * px]; });
  }

  function layout() {
    vw = window.innerWidth; vh = window.innerHeight;
    var f = vw / vh < 0.85 ? "port" : "land";
    if (f !== framing) {
      framing = f; F = INFO[f];
      farImg.src = "assets/office/desk-" + f + "-far.webp"; nearImg.src = "assets/office/desk-" + f + "-near.webp";
      [farImg, nearImg, stage].forEach(function (el) { el.style.width = F.w + "px"; el.style.height = F.h + "px"; });
      ["laptop", "left", "mid", "right"].forEach(function (name) {
        var el = wrap.querySelector(".zy-" + name); if (!el) return;
        el.style.width = SIZE[name][0] + "px"; el.style.height = SIZE[name][1] + "px";
        el.style.transform = homography(SIZE[name][0], SIZE[name][1], grow(F[name], 1.2));
      });
    }
    var L = F.laptop, lw = L[1][0] - L[0][0], lh = L[2][1] - L[1][1];
    V = [(L[0][0] + L[1][0]) / 2, (L[0][1] + L[2][1]) / 2];
    s0 = Math.max(vw / F.w, vh / F.h);
    // start: the laptop centred left-right (kept inside the picture), the picture centred up-down
    ox = Math.min(0, Math.max(vw - F.w * s0, vw / 2 - V[0] * s0)); oy = (vh - F.h * s0) / 2;
    // end: the laptop's screen covers the view (on tall screens it fills the width, then fades)
    kEnd = framing === "land" ? Math.max(vw / (s0 * lw), vh / (s0 * lh)) : vw / (s0 * lw);
    var sh = s0 * kEnd * lh;
    endPos = framing === "land" ? [vw / 2, Math.min(vh / 2, sh / 2)] : [vw / 2, vh / 2];
    render();
  }

  /* ---------- the dolly ---------- */
  var progress = 0, mx = 0, my = 0, sx = 0, sy = 0;
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function render() {
    var e = ease(Math.min(1, progress / 0.86));
    var zn = F.zNear, zf = F.zFar, d = e * zn * (1 - 1 / kEnd);
    var kn = zn / (zn - d), kf = zf / (zf - d);
    var st = [ox + V[0] * s0, oy + V[1] * s0], pe = e * e * (3 - 2 * e);
    var px = st[0] + (endPos[0] - st[0]) * pe, py = st[1] + (endPos[1] - st[1]) * pe;
    var look = 1 - Math.min(1, progress * 5), dx = -sx * 18 * look, dy = -sy * 12 * look;
    farG.style.transform = "translate3d(" + (px - V[0] * s0 * kf + dx * 0.55).toFixed(2) + "px," + (py - V[1] * s0 * kf + dy * 0.55).toFixed(2) + "px,0) scale(" + (s0 * kf).toFixed(5) + ")";
    nearG.style.transform = "translate3d(" + (px - V[0] * s0 * kn + dx).toFixed(2) + "px," + (py - V[1] * s0 * kn + dy).toFixed(2) + "px,0) scale(" + (s0 * kn).toFixed(5) + ")";
  }

  var editor = wrap.querySelector(".zy-mid");
  if (editor) buildEditor(editor);

  /* ---------- frames only when something changed ---------- */
  var raf = 0, active = true;
  function tick() {
    raf = 0; if (!active) return;
    sx += (mx - sx) * 0.08; sy += (my - sy) * 0.08;
    render();
    if (Math.abs(mx - sx) > 0.001 || Math.abs(my - sy) > 0.001) raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf && active) raf = requestAnimationFrame(tick); }
  window.addEventListener("pointermove", function (e) { mx = e.clientX / vw - 0.5; my = e.clientY / vh - 0.5; kick(); }, { passive: true });

  /* ---------- scroll ---------- */
  root.classList.add("zy-cover"); window.__nisjaPaused = true;
  var st = ScrollTrigger.create({
    trigger: hero,
    start: function () { return "top " + (header ? header.offsetHeight : 0) + "px"; },
    end: "+=180%", pin: true, pinSpacing: true, refreshPriority: 1, scrub: true,
    onUpdate: function (self) {
      progress = self.progress; kick();
      if ((progress > 0.01) !== wrap.classList.contains("is-moving")) wrap.classList.toggle("is-moving");
      var fade = Math.min(1, Math.max(0, (progress - 0.86) / 0.12));
      var op = String(1 - fade); if (wrap.style.opacity !== op) wrap.style.opacity = op;
      var covered = progress < 0.84;                               // the hero's own effects stay paused while covered
      if (covered !== window.__nisjaPaused) { window.__nisjaPaused = covered; root.classList.toggle("zy-cover", covered); }
      var done = fade >= 1;
      if (done === active) { active = !done; wrap.classList.toggle("is-done", done); if (editor) editor.classList.toggle("is-paused", done); if (active) kick(); }
    }
  });

  /* ---------- one scroll, swipe or key plays the whole fly-in (and one back up returns) ---------- */
  var auto = false, touchY = null;
  function lenis() { return window.NisjaShowcase && window.NisjaShowcase.lenis; }
  function go(dir) {
    if (auto) return;
    var to = dir > 0 ? st.end : st.start;
    if (Math.abs(window.scrollY - to) < 2) return;
    auto = true;
    var done = function () { auto = false; }, ls = lenis();
    if (ls) ls.scrollTo(to, { duration: dir > 0 ? 1.8 : 1.4, easing: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }, lock: true, force: true, onComplete: done });
    else { window.scrollTo({ top: to, behavior: "smooth" }); setTimeout(done, 1300); }
  }
  function zone(dir) {                                           // inside the intro, or at the hero's top going back up
    var y = window.scrollY;
    return dir > 0 ? y < st.end - 2 : (y > st.start + 2 && y <= st.end + 6);
  }
  function grab(e, dir) { if (!zone(dir) && !auto) return false; e.preventDefault(); e.stopImmediatePropagation(); if (!auto) go(dir); return true; }
  window.addEventListener("wheel", function (e) { if (Math.abs(e.deltaY) < 1) return; grab(e, e.deltaY > 0 ? 1 : -1); }, { passive: false, capture: true });
  window.addEventListener("touchstart", function (e) { touchY = e.touches[0].clientY; }, { passive: true, capture: true });
  window.addEventListener("touchmove", function (e) {
    if (touchY === null) return;
    var dy = touchY - e.touches[0].clientY; if (Math.abs(dy) < 8) { if (auto) e.preventDefault(); return; }
    if (grab(e, dy > 0 ? 1 : -1)) touchY = null;
  }, { passive: false, capture: true });
  window.addEventListener("touchend", function () { touchY = null; }, { passive: true, capture: true });
  window.addEventListener("keydown", function (e) {
    var k = e.key, dir = (k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey)) ? 1 : (k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey)) ? -1 : 0;
    if (!dir || /input|textarea|select/i.test((e.target && e.target.tagName) || "")) return;
    grab(e, dir);
  }, { capture: true });

  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { layout(); ScrollTrigger.refresh(); }, 120); });
  var pending = 2;
  [farImg, nearImg].forEach(function (img) { img.addEventListener("load", function () { if (--pending === 0) wrap.classList.add("is-ready"); }, { once: true }); });
  layout(); ScrollTrigger.refresh();

  /* ---------- the code editor on the middle monitor ---------- */
  function buildEditor(el) {
    var code = [
      ["c", "/* Nisja Studio — hero strip: every demo site on a 3D curve */"],
      ["k", "import", "p", " { gsap } ", "k", "from", "s", " \"gsap\"", "p", ";"],
      ["k", "import", "p", " { ScrollTrigger } ", "k", "from", "s", " \"gsap/ScrollTrigger\"", "p", ";"],
      [],
      ["k", "const", "v", " STREAM", "p", " = [", "s", "\"kaliber\"", "p", ", ", "s", "\"prush\"", "p", ", ", "s", "\"udha\"", "p", ", ", "s", "\"embel\"", "p", ", ", "s", "\"fener\"", "p", "];"],
      ["k", "const", "v", " P", "p", " = ", "n", "1300", "p", ";  ", "c", "// perspective in px"],
      [],
      ["k", "function", "f", " layout", "p", "(", "v", "offset", "p", ") {"],
      ["p", "  cards.", "f", "forEach", "p", "((", "v", "card", "p", ", ", "v", "i", "p", ") => {"],
      ["k", "    const", "v", " x", "p", " = ", "f", "wrap", "p", "(i * step - offset, L);"],
      ["k", "    const", "v", " th", "p", " = x / R;               ", "c", "// angle on the cylinder"],
      ["p", "    card.style.transform = ", "s", "`translate3d(${", "p", "R * Math.", "f", "sin", "p", "(th)", "s", "}px, 0, ${", "p", "R * (", "n", "1", "p", " - Math.", "f", "cos", "p", "(th))", "s", "}px)`", "p", ";"],
      ["p", "  });"],
      ["p", "}"],
      [],
      ["f", "ScrollTrigger", "p", ".", "f", "create", "p", "({"],
      ["v", "  trigger", "p", ": hero, ", "v", "pin", "p", ": ", "k", "true", "p", ", ", "v", "scrub", "p", ": ", "k", "true", "p", ","],
      ["v", "  onUpdate", "p", ": (", "v", "self", "p", ") => ", "f", "render", "p", "(self.progress),"],
      ["p", "});"],
      [],
      ["k", "export async function", "f", " book", "p", "(", "v", "car", "p", ", ", "v", "dates", "p", ") {"],
      ["k", "  const", "v", " res", "p", " = ", "k", "await", "f", " fetch", "p", "(", "s", "\"/api/rezervo\"", "p", ", { ", "v", "method", "p", ": ", "s", "\"POST\"", "p", " });"],
      ["k", "  return", "p", " res.", "f", "json", "p", "();  ", "c", "// { code: \"UD 4821\" }"],
      ["p", "}"]
    ];
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function line(parts) {
      var out = "";
      for (var i = 0; i < parts.length; i += 2) out += '<span class="t-' + parts[i] + '">' + esc(parts[i + 1]) + "</span>";
      return out || "&nbsp;";
    }
    var tree = ["nisja", "  css", "    showcase.css", "  js", "    showcase.js", "    showcase-demos.js", "    office.js", "  work", "    kaliber", "    udha", "    prush", "  index.html", "  vercel.json"];
    var lines = code.map(function (c, i) { return '<div class="ed-l"><i>' + (i + 1) + "</i><span>" + line(c) + "</span></div>"; }).join("");
    el.innerHTML =
      '<div class="ed-top"><b></b><b></b><b></b><span>nisja — showcase-demos.js</span></div>' +
      '<div class="ed-body"><aside class="ed-tree">' + tree.map(function (t, i) { return '<div class="' + (i === 5 ? "on" : "") + '">' + t.replace(/ /g, "&nbsp;") + "</div>"; }).join("") + "</aside>" +
      '<div class="ed-main"><div class="ed-tabs"><span>index.html</span><span class="on">showcase-demos.js</span><span>office.js</span></div>' +
      '<div class="ed-code">' + lines + '<div class="ed-l"><i>' + (code.length + 1) + '</i><span class="ed-type"></span><span class="ed-cur"></span></div></div></div>' +
      '<div class="ed-map">' + code.map(function (c) { var w = 0; for (var i = 1; i < c.length; i += 2) w += c[i].length; return '<i style="width:' + Math.min(100, w * 1.4) + '%"></i>'; }).join("") + "</div></div>" +
      '<div class="ed-term"><span class="t-c">~/nisja $</span> vercel --prod<br><span class="t-s">✓</span> Deployed to <span class="t-f">nisjastudio.com</span> <span class="t-c">[1.8s]</span></div>';
    var typed = el.querySelector(".ed-type"), text = "book(\"Škoda Octavia\", { nga: \"29 nën\", deri: \"2 dhj\" });", n = 0;
    setInterval(function () {
      if (el.classList.contains("is-paused") || document.hidden) return;
      n = (n + 1) % (text.length + 18); typed.textContent = text.slice(0, Math.min(n, text.length));
    }, 85);
  }
})();
