/* Nisja Studio — test page B: a Nisja workstation by a window over the city at night. One scroll, swipe
   or key press plays the dive into the laptop and lands at the top of the real site; one back up at the
   very top plays it in reverse.
   The scene was rendered once, offline and supersampled (js-src/desk-render.src.js), as two depth layers:
   "far" (the window and the night skyline) and "near" (the desk and everything on it, monitors showing
   Nika, the code editor and Udha already baked in with their glow and glass reflections).
   Every frame is drawn fresh on a GPU canvas from the full-resolution images, so the picture stays sharp
   at every point of the zoom. The fly-in is a depth-correct dolly: each layer scales by z / (z − d), so
   the desk rushes past faster than the city. When the laptop's screen fills the view, the canvas fades
   into the real homepage, which sits underneath at the top of the page. */
(function () {
  "use strict";
  var wrap = document.getElementById("zyra"), hero = document.querySelector(".sh");
  if (!wrap || !hero || !window.gsap) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { wrap.remove(); return; }
  var root = document.documentElement, header = document.querySelector(".site-header");
  var T = (window.Nisja && window.Nisja.t) || function (sq) { return sq; };
  var hint = wrap.querySelector(".zy-hint"); if (hint) hint.textContent = T("Lëvizni poshtë", "Scroll down");
  var canvas = wrap.querySelector("canvas"), ctx = canvas.getContext("2d", { alpha: false });

  /* where the laptop screen sits in each render (image px) and the layer depths (m) */
  var INFO = {
    land: { w: 3200, h: 2000, laptop: [1331.09, 1171.93, 1868.91, 1508.07], zNear: 1.62, zFar: 3.0 },
    port: { w: 1400, h: 2800, laptop: [375.24, 1589.03, 1024.76, 1994.97], zNear: 1.12, zFar: 2.5 }
  };
  var imgs = {}, framing = null, F, vw, vh, dpr, s0, ox, oy, V, lw, lh, kEnd, endPos, ready = false;
  function load(src) { var im = new Image(); im.decoding = "async"; im.src = src; return im; }
  var heroImg = load("assets/office/hero-laptop.webp");

  function layout() {
    vw = window.innerWidth; vh = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    var f = vw / vh < 0.85 ? "port" : "land";
    if (f !== framing) {
      framing = f; F = INFO[f]; ready = false;
      var far = load("assets/office/desk-" + f + "-far.webp"), near = load("assets/office/desk-" + f + "-near.webp");
      imgs = { far: far, near: near };
      Promise.all([far, near, heroImg].map(function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); })).then(function () {
        if (imgs.far !== far) return;
        ready = true; wrap.classList.add("is-ready"); want();
      });
    }
    var L = F.laptop; lw = L[2] - L[0]; lh = L[3] - L[1];
    V = [(L[0] + L[2]) / 2, (L[1] + L[3]) / 2];
    s0 = Math.max(vw / F.w, vh / F.h);
    ox = Math.min(0, Math.max(vw - F.w * s0, vw / 2 - V[0] * s0)); oy = (vh - F.h * s0) / 2;
    kEnd = Math.max(vw / (s0 * lw), vh / (s0 * lh));               // the laptop screen ends up covering the whole view
    var sh = s0 * kEnd * lh;
    endPos = [vw / 2, Math.min(vh / 2, sh / 2)];                     // keep its top (the site's header) at the top
    want();
  }

  /* ---------- the dolly, drawn from the source pixels every frame ---------- */
  var progress = 0, mx = 0, my = 0, sx = 0, sy = 0;
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function draw() {
    if (!ready) return;
    var e = Math.min(1, progress / 0.86);
    var zn = F.zNear, zf = F.zFar, d = e * zn * (1 - 1 / kEnd);
    var kn = zn / (zn - d), kf = zf / (zf - d);
    var st0 = [ox + V[0] * s0, oy + V[1] * s0], pe = e * e * (3 - 2 * e);
    var px = st0[0] + (endPos[0] - st0[0]) * pe, py = st0[1] + (endPos[1] - st0[1]) * pe;
    var look = 1 - Math.min(1, progress * 5), dx = -sx * 18 * look, dy = -sy * 12 * look;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    var sf = s0 * kf, sn = s0 * kn;
    ctx.setTransform(dpr * sf, 0, 0, dpr * sf, dpr * (px - V[0] * sf + dx * 0.4), dpr * (py - V[1] * sf + dy * 0.4));
    ctx.drawImage(imgs.far, 0, 0);
    ctx.setTransform(dpr * sn, 0, 0, dpr * sn, dpr * (px - V[0] * sn + dx), dpr * (py - V[1] * sn + dy));
    ctx.drawImage(imgs.near, 0, 0);
    ctx.drawImage(heroImg, F.laptop[0], F.laptop[1], lw, lh);
  }

  var raf = 0, active = true;
  function tick() {
    raf = 0; if (!active) return;
    sx += (mx - sx) * 0.08; sy += (my - sy) * 0.08;
    draw();
    if (Math.abs(mx - sx) > 0.001 || Math.abs(my - sy) > 0.001) raf = requestAnimationFrame(tick);
  }
  function want() { if (!raf && active) raf = requestAnimationFrame(tick); }
  window.addEventListener("pointermove", function (e) { mx = e.clientX / vw - 0.5; my = e.clientY / vh - 0.5; want(); }, { passive: true });

  /* ---------- one gesture plays the dive; the page stays locked while the desk shows ----------
     Mobile browsers start scrolling natively before a script can react, so the dive is not tied to the
     page's scroll at all: it is a timed animation, and when it ends you are at the top of the real site.
     One scroll or swipe back up at the very top plays it in reverse. */
  var mode = window.scrollY > 10 ? "site" : "intro", state = { p: mode === "site" ? 1 : 0 }, tween = null, touchY = null;
  function lenis() { return window.NisjaShowcase && window.NisjaShowcase.lenis; }
  function lock(on) {
    root.classList.toggle("zy-lock", on); window.__nisjaPaused = on; root.classList.toggle("zy-cover", on);
    var ls = lenis(); if (ls) { if (on) ls.stop(); else ls.start(); }
  }
  function apply() {
    progress = state.p; draw();
    if ((progress > 0.01) !== wrap.classList.contains("is-moving")) wrap.classList.toggle("is-moving");
    var fade = Math.min(1, Math.max(0, (progress - 0.84) / 0.14));
    wrap.style.opacity = String(1 - fade);
  }
  function play(dir) {
    if (mode === "playing") return;
    mode = "playing"; active = true;
    if (dir < 0) { var ls = lenis(); if (ls) ls.scrollTo(0, { immediate: true, force: true }); window.scrollTo(0, 0); wrap.classList.remove("is-done"); }
    lock(true);
    if (tween) tween.kill();
    tween = gsap.to(state, { p: dir > 0 ? 1 : 0, duration: dir > 0 ? 1.75 : 1.3, ease: "power2.inOut", onUpdate: apply, onComplete: function () {
      if (dir > 0) { mode = "site"; active = false; wrap.classList.add("is-done"); lock(false); }
      else { mode = "intro"; }
    } });
  }
  function atTop() { return window.scrollY <= 1; }
  window.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaY) < 1) return;
    if (mode === "playing" || (mode === "intro") || (mode === "site" && e.deltaY < 0 && atTop())) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (mode === "intro" && e.deltaY > 0) play(1); else if (mode === "site") play(-1);
    }
  }, { passive: false, capture: true });
  window.addEventListener("touchstart", function (e) { touchY = e.touches[0].clientY; }, { passive: true, capture: true });
  window.addEventListener("touchmove", function (e) {
    if (touchY === null) return;
    var dy = touchY - e.touches[0].clientY;                       // > 0: finger moves up (scroll down)
    if (mode === "intro" || mode === "playing") {
      e.preventDefault();                                           // from the very first pixel: no native scroll at all
      if (mode === "intro" && dy > 6) { touchY = null; play(1); }
    } else if (mode === "site" && atTop() && dy < -6) {
      e.preventDefault(); touchY = null; play(-1);
    }
  }, { passive: false, capture: true });
  window.addEventListener("touchend", function () { touchY = null; }, { passive: true, capture: true });
  window.addEventListener("keydown", function (e) {
    if (/input|textarea|select/i.test((e.target && e.target.tagName) || "")) return;
    var k = e.key, down = k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey), up = k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey);
    if (mode === "playing" && (down || up)) { e.preventDefault(); return; }
    if (mode === "intro" && down) { e.preventDefault(); play(1); }
    else if (mode === "site" && up && atTop()) { e.preventDefault(); play(-1); }
  }, { capture: true });

  window.__zySeek = function (p) { if (tween) tween.kill(); state.p = p; active = true; apply(); };   // for screenshots and tests
  if (mode === "site") { active = false; wrap.classList.add("is-done"); wrap.style.opacity = "0"; }
  else lock(true);

  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
  layout();
})();
