/* Nisja Studio — test page B: the client's view of a made-up Nisja office.
   The office was rendered offline at full quality (js-src/office-render.src.js) into three frame
   sequences: laptop (16:10), tablet (3:4) and phone (9:19.5). This player picks the one that fits
   the visitor's screen and flips through it on a canvas as they scroll, so there is no 3D work on
   the device at all. Frames load progressively: the first frame, then every 8th, 4th, 2nd, then the
   rest; until a frame arrives the nearest loaded one is shown. When the device screen fills the
   view, the canvas fades out over the real homepage hero, which is pinned underneath. */
(function () {
  "use strict";
  var wrap = document.getElementById("zyra"), hero = document.querySelector(".sh");
  if (!wrap || !hero || !window.gsap || !window.ScrollTrigger) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { wrap.remove(); return; }                         // straight to the real site
  var canvas = wrap.querySelector("canvas"), ctx = canvas.getContext("2d", { alpha: false });
  var veil = wrap.querySelector(".zy-veil"), header = document.querySelector(".site-header");
  var T = (window.Nisja && window.Nisja.t) || function (sq) { return sq; };
  var label = wrap.querySelector(".zy-hint"); if (label) label.textContent = T("Lëvizni poshtë për të hyrë", "Scroll to step inside");

  var N = 90;
  function pick() {
    var w = window.innerWidth, a = w / window.innerHeight;
    if (w < 700 && a < 0.8) return "phone";
    if (a < 0.95) return "tablet";
    return "laptop";
  }
  var seq = pick();
  var frames = new Array(N), ready = new Array(N), loadedCount = 0;
  function url(i) { return "assets/office/seq/" + seq + "/f" + String(i).padStart(3, "0") + ".webp"; }

  /* ---------- progressive loading ---------- */
  var order = [0], seen = { 0: 1 };
  [8, 4, 2, 1].forEach(function (step) { for (var i = 0; i < N; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); } });
  if (!seen[N - 1]) order.push(N - 1);
  var next = 0, inflight = 0, MAX = 6;
  function pump() {
    while (inflight < MAX && next < order.length) loadOne(order[next++]);
  }
  var gen = 0;
  function loadOne(i) {
    inflight++; var g = gen;
    var img = new Image(); img.decoding = "async"; img.src = url(i);
    var done = function () {
      inflight--; if (g !== gen) { pump(); return; } frames[i] = img; ready[i] = true; loadedCount++;
      if (veil) veil.style.setProperty("--p", (loadedCount / N).toFixed(3));
      if (i === 0) { wrap.classList.add("is-ready"); }
      if (loadedCount === N) wrap.classList.add("is-loaded");
      want = true; pump();
    };
    img.onload = function () { if (img.decode) img.decode().then(done, done); else done(); };
    img.onerror = function () { inflight--; pump(); };
  }

  /* ---------- drawing ---------- */
  var W = 0, H = 0, current = -1, want = true, progress = 0;
  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.round(window.innerWidth * dpr); H = Math.round(window.innerHeight * dpr);
    canvas.width = W; canvas.height = H; current = -1; want = true;
  }
  function nearest(i) {
    if (ready[i]) return i;
    for (var d = 1; d < N; d++) { if (i - d >= 0 && ready[i - d]) return i - d; if (i + d < N && ready[i + d]) return i + d; }
    return -1;
  }
  function draw() {
    var target = Math.round(Math.min(1, progress / 0.92) * (N - 1)), k = nearest(target);
    if (k < 0 || (k === current && !want)) return;
    var img = frames[k], iw = img.naturalWidth, ih = img.naturalHeight;
    var s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
    // keep the top of the frame on screen at the end, so the header lines up with the real page
    var t = Math.min(1, Math.max(0, (progress - 0.6) / 0.25));
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2 * (1 - t), dw, dh);
    current = k; want = false;
  }

  /* ---------- the client glances around before scrolling ---------- */
  var mx = 0, my = 0, sx = 0, sy = 0;
  window.addEventListener("pointermove", function (e) { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; }, { passive: true });

  var running = true;
  function loop() {
    if (!running) return;
    draw();
    sx += (mx - sx) * 0.06; sy += (my - sy) * 0.06;
    var look = Math.max(0, 1 - progress * 6);
    canvas.style.transform = look > 0 ? "scale(" + (1 + 0.035 * look) + ") translate3d(" + (-sx * 14 * look).toFixed(2) + "px," + (-sy * 10 * look).toFixed(2) + "px,0)" : "";
    requestAnimationFrame(loop);
  }

  /* ---------- scroll: pin the real hero while the camera flies, then fade into it ---------- */
  ScrollTrigger.create({
    trigger: hero,
    start: function () { return "top " + (header ? header.offsetHeight : 0) + "px"; },
    end: "+=260%", pin: true, pinSpacing: true, refreshPriority: 1, scrub: true,
    onUpdate: function (self) {
      progress = self.progress; want = true;
      wrap.classList.toggle("is-moving", progress > 0.02);
      var fade = Math.min(1, Math.max(0, (progress - 0.9) / 0.1));
      wrap.style.opacity = String(1 - fade);
      var done = fade >= 1;
      if (done !== wrap.classList.contains("is-done")) {
        wrap.classList.toggle("is-done", done);
        running = !done; if (running) loop();
      }
    }
  });
  ScrollTrigger.refresh();

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      size();
      var s = pick();
      if (s !== seq) { seq = s; gen++; frames = new Array(N); ready = new Array(N); loadedCount = 0; next = 0; current = -1; pump(); }
    }, 150);
  });

  size(); pump(); loop();
})();
