/* Nisja Studio — test page B: a Nisja workstation by a window over the city at night; one scroll flies
   into the laptop and on into the real site, one scroll up brings you back.
   The scene was rendered once, offline and supersampled (js-src/desk-render.src.js), as two depth layers:
   "far" (the window and the night skyline) and "near" (the desk and everything on it, monitors showing
   Nika, the code editor and Udha already baked in with their glow and glass reflections).
   Every frame is drawn fresh on a GPU canvas from the full-resolution images, so the picture stays sharp
   at every point of the zoom. The fly-in is a depth-correct dolly: each layer scales by z / (z − d), so
   the desk rushes past faster than the city. When the laptop's screen fills the view, the canvas fades
   into the real homepage hero, which is pinned underneath. */
(function () {
  "use strict";
  var wrap = document.getElementById("zyra"), hero = document.querySelector(".sh");
  if (!wrap || !hero || !window.gsap || !window.ScrollTrigger) return;
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
    kEnd = framing === "land" ? Math.max(vw / (s0 * lw), vh / (s0 * lh)) : vw / (s0 * lw);
    var sh = s0 * kEnd * lh;
    endPos = framing === "land" ? [vw / 2, Math.min(vh / 2, sh / 2)] : [vw / 2, vh / 2];
    want();
  }

  /* ---------- the dolly, drawn from the source pixels every frame ---------- */
  var progress = 0, mx = 0, my = 0, sx = 0, sy = 0;
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function draw() {
    if (!ready) return;
    var e = ease(Math.min(1, progress / 0.86));
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

  /* ---------- scroll ---------- */
  root.classList.add("zy-cover"); window.__nisjaPaused = true;
  var st = ScrollTrigger.create({
    trigger: hero,
    start: function () { return "top " + (header ? header.offsetHeight : 0) + "px"; },
    end: "+=180%", pin: true, pinSpacing: true, refreshPriority: 1, scrub: true,
    onUpdate: function (self) {
      progress = self.progress; want();
      if ((progress > 0.01) !== wrap.classList.contains("is-moving")) wrap.classList.toggle("is-moving");
      var fade = Math.min(1, Math.max(0, (progress - 0.86) / 0.12));
      var op = String(1 - fade); if (wrap.style.opacity !== op) wrap.style.opacity = op;
      var covered = progress < 0.84;                               // the hero's own effects stay paused while covered
      if (covered !== window.__nisjaPaused) { window.__nisjaPaused = covered; root.classList.toggle("zy-cover", covered); }
      var done = fade >= 1;
      if (done === active) { active = !done; wrap.classList.toggle("is-done", done); if (active) want(); }
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
  layout(); ScrollTrigger.refresh();
})();
