/* Nisja Studio — showcase preview: live demos
   1. Tilted stream: an endless row of our demo sites on a curved band
      (after 21st.dev "Tilted Grid Hero"). Drawn on a canvas in thin vertical
      slices: each slice is stretched more the closer it is to the edges, so
      the cards bend toward the viewer there and fade out.
   2. Folders: frosted-glass folders whose cards are demo sites.
   3. Live demo window: clicking any card opens that site inside the page. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var NS = window.NisjaShowcase || {};
  var reduced = NS.reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DEMOS = {
    udha:     { name: "Udha", kind: "Rent a car · koncept", url: "work/udha/" },
    prush:    { name: "Prush", kind: "Restorant · koncept", url: "work/prush/" },
    brisk:    { name: "Brisk Barber Club", kind: "Berber · koncept", url: "work/brisk/" },
    mendafsh: { name: "Mëndafsh", kind: "Sallon bukurie · koncept", url: "work/mendafsh/" },
    vrull:    { name: "Vrull", kind: "Palestër · koncept", url: "work/vrull/" },
    kristal:  { name: "Kristal Dental", kind: "Dentist · koncept", url: "work/kristal/" },
    kaliber:  { name: "Kalibër Motors", kind: "Auto sallon · koncept", url: "work/kaliber/" },
    kroni:    { name: "Vila Kroni", kind: "Vend dasmash · koncept", url: "work/kroni/" },
    fener:    { name: "Fener", kind: "Bar kokteji · koncept", url: "work/fener/" },
    embel:    { name: "Ëmbël", kind: "Pastiçeri · koncept", url: "work/embel/" },
    lisi:     { name: "Lisi", kind: "Mobilje me masë · koncept", url: "work/lisi/" },
    "nika-1": { name: "Nika Architecture Studio", kind: "Klient i vërtetë", url: "https://nika-archi.vercel.app/", external: true },
    "nika-2": { name: "Nika · Projektet", kind: "Klient i vërtetë", url: "https://nika-archi.vercel.app/#projects", external: true },
    "nika-3": { name: "Nika · Rreth nesh", kind: "Klient i vërtetë", url: "https://nika-archi.vercel.app/#about", external: true },
    "nika-4": { name: "Nika · Kontakti", kind: "Klient i vërtetë", url: "https://nika-archi.vercel.app/#contact", external: true }
  };
  var STREAM = ["kaliber", "udha", "kroni", "nika-1", "fener", "prush", "embel", "brisk", "lisi", "mendafsh", "vrull", "kristal"];

  /* ================= live demo window ================= */
  var dlg = $("sc-demo"), frame = $("sc-demo-frame"), urlEl = $("sc-demo-url"), newEl = $("sc-demo-new");
  var lastFocus = null;
  function openDemo(id) {
    var d = DEMOS[id]; if (!d) return;
    // our own demos open inside the page; the client's live site opens in a new tab
    if (d.external || !dlg || typeof dlg.showModal !== "function") { window.open(d.url, "_blank", "noopener"); return; }
    lastFocus = document.activeElement;
    urlEl.textContent = "nisjastudio.com/" + d.url.replace(/\/$/, "");
    newEl.href = d.url;
    frame.title = "Demo live: " + d.name;
    frame.src = d.url;
    dlg.showModal();
    if (NS.lenis) NS.lenis.stop();
  }
  function closeDemo() { if (dlg.open) dlg.close(); }
  if (dlg) {
    $("sc-demo-close").addEventListener("click", closeDemo);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDemo(); });   // click on the dimmed backdrop
    dlg.addEventListener("close", function () {
      frame.src = "about:blank";
      if (NS.lenis) NS.lenis.start();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
  }

  /* ================= 1. tilted stream ================= */
  (function () {
    var stage = $("sc-stream"), canvas = $("sc-stream-canvas");
    if (!stage || !canvas) return;
    var ctx = canvas.getContext("2d");
    var nameEl = $("sc-stream-name"), kindEl = $("sc-stream-kind");
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, cw = 0, ch = 0, gap = 0, step = 0, L = 0;
    var BEND = 0.5;        // how much taller the cards get at the edges
    var SLICE = 2;         // slice width in CSS px

    // cards: the screenshot drawn once into a rounded offscreen canvas
    var cards = STREAM.map(function (id) {
      var c = { id: id, img: new Image(), ready: false, canvas: document.createElement("canvas") };
      c.img.decoding = "async";
      c.img.onload = function () { c.ready = true; paintCard(c); };
      c.img.src = "assets/demo/" + id + ".webp";
      return c;
    });
    function paintCard(c) {
      var w = Math.round(cw * DPR), h = Math.round(ch * DPR), r = 16 * DPR;
      c.canvas.width = w; c.canvas.height = h;
      var g = c.canvas.getContext("2d");
      g.clearRect(0, 0, w, h);
      g.save();
      g.beginPath();
      if (g.roundRect) g.roundRect(0, 0, w, h, r); else g.rect(0, 0, w, h);
      g.clip();
      g.fillStyle = "#1F1B18"; g.fillRect(0, 0, w, h);
      if (c.ready) {
        var s = Math.max(w / c.img.naturalWidth, h / c.img.naturalHeight);
        g.drawImage(c.img, (w - c.img.naturalWidth * s) / 2, 0, c.img.naturalWidth * s, c.img.naturalHeight * s);
      }
      g.restore();
      g.strokeStyle = "rgba(245,239,230,.14)"; g.lineWidth = DPR;
      g.beginPath(); if (g.roundRect) g.roundRect(.5 * DPR, .5 * DPR, w - DPR, h - DPR, r); else g.rect(0, 0, w, h); g.stroke();
    }
    function resize() {
      W = stage.clientWidth; H = stage.clientHeight;
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      cw = Math.round(Math.min(480, Math.max(230, W * 0.3)));
      ch = Math.round(cw * 0.625);
      if (ch * (1 + BEND) > H * 0.96) { ch = Math.floor(H * 0.96 / (1 + BEND)); cw = Math.round(ch / 0.625); }
      gap = Math.round(cw * 0.07);
      step = cw + gap; L = step * cards.length;
      cards.forEach(paintCard);
      draw();
    }

    var offset = 0;                 // how far the row has moved (px)
    var speed = reduced ? 0 : 34;   // px per second
    var vel = speed, hover = false, dragging = false, visible = true, centerIdx = -1, tween = null;

    function draw() {
      if (!W) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var half = W / 2, base = ((offset % L) + L) % L;
      var first = Math.floor((base - half - cw / 2) / step);   // first card that reaches the left edge
      for (var k = first; k * step - base + half - cw / 2 < W; k++) {
        var c = cards[((k % cards.length) + cards.length) % cards.length];
        var left = k * step - base + half - cw / 2;            // card k is centred when offset = k * step
        if (left > W || left + cw < 0) continue;
        var srcW = c.canvas.width, srcH = c.canvas.height;
        for (var x = Math.max(left, 0); x < Math.min(left + cw, W); x += SLICE) {
          var nx = (x + SLICE / 2 - half) / half;              // -1 … 1 across the stage
          var a = Math.min(1, Math.max(0, (1.04 - Math.abs(nx)) / 0.32));
          if (a <= 0) continue;
          var s = 1 + BEND * nx * nx, h = ch * s, y = (H - h) / 2;
          var sx = (x - left) / cw * srcW;
          ctx.globalAlpha = a;
          ctx.drawImage(c.canvas, sx, 0, Math.max(1, SLICE / cw * srcW), srcH, x * DPR, y * DPR, SLICE * DPR + 0.6, h * DPR);
        }
      }
      ctx.globalAlpha = 1;
      // which card sits in the middle
      var ci = Math.round(base / step) % cards.length;
      if (ci !== centerIdx) {
        centerIdx = ci;
        var d = DEMOS[cards[ci].id];
        nameEl.textContent = d.name; kindEl.textContent = d.kind;
      }
    }
    function cardAt(px) {
      var base = ((offset % L) + L) % L;
      var k = Math.floor((px - W / 2 + cw / 2 + base) / step);
      var left = k * step - base + W / 2 - cw / 2;
      if (px > left + cw) return null;                       // in the gap
      return cards[((k % cards.length) + cards.length) % cards.length];
    }

    var lastT = 0;
    function tick() {
      var now = performance.now(), dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0;
      lastT = now;
      if (!visible || document.hidden) { lastT = 0; return; }
      if (!dragging && !tween) {
        var target = hover ? 0 : speed;
        var lv = NS.lenis ? NS.lenis.velocity : 0;
        vel += (target + Math.abs(lv) * 6 - vel) * Math.min(1, dt * 3);
        offset += vel * dt;
      }
      draw();
    }
    if (window.gsap) gsap.ticker.add(tick); else (function loop() { tick(); requestAnimationFrame(loop); })();
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(stage);
    window.addEventListener("resize", resize);
    resize();

    // drag + click
    var downX = 0, lastX = 0, moved = 0, dragVel = 0, lastMoveT = 0;
    stage.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      dragging = true; moved = 0; downX = lastX = e.clientX; lastMoveT = performance.now();
      stage.classList.add("is-dragging");
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      if (tween) { tween.kill(); tween = null; }
    });
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      hover = e.pointerType === "mouse" && !!cardAt(e.clientX - r.left);
      if (!dragging) return;
      var dx = e.clientX - lastX, t = performance.now();
      offset -= dx; moved += Math.abs(dx);
      dragVel = -dx / Math.max(1, t - lastMoveT) * 1000;
      lastX = e.clientX; lastMoveT = t;
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false; stage.classList.remove("is-dragging");
      if (moved < 6) {                                       // a click, not a drag
        var r = stage.getBoundingClientRect(), c = cardAt(e.clientX - r.left);
        if (c) openDemo(c.id);
      } else if (!reduced) vel = Math.max(-1600, Math.min(1600, dragVel));
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", function () { dragging = false; stage.classList.remove("is-dragging"); });
    stage.addEventListener("pointerleave", function () { hover = false; });

    // buttons: centre the previous / next card, open the one in the middle
    function go(dir) {
      var base = ((offset % L) + L) % L;
      var target = offset - base + (Math.round(base / step) + dir) * step;
      if (tween) tween.kill();
      if (reduced || !window.gsap) { offset = target; tween = null; draw(); return; }
      var o = { v: offset };
      tween = gsap.to(o, { v: target, duration: 0.7, ease: "power3.inOut", onUpdate: function () { offset = o.v; }, onComplete: function () { tween = null; vel = 0; } });
    }
    $("sc-stream-prev").addEventListener("click", function () { go(-1); });
    $("sc-stream-next").addEventListener("click", function () { go(1); });
    $("sc-stream-open").addEventListener("click", function () { openDemo(cards[centerIdx < 0 ? 0 : centerIdx].id); });
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDemo(cards[centerIdx < 0 ? 0 : centerIdx].id); }
    });
  })();

  /* ================= 2. folders ================= */
  Array.prototype.forEach.call(document.querySelectorAll(".fd-card"), function (card) {
    card.addEventListener("click", function () {
      if (card.classList.contains("is-new")) return;
      openDemo(card.getAttribute("data-demo"));
    });
  });
  // touch: the first tap opens the folder, the next tap opens a card
  Array.prototype.forEach.call(document.querySelectorAll(".fd"), function (fd) {
    fd.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      if (!fd.classList.contains("is-open")) {
        if (e.target.closest(".fd-btn")) return;
        fd.classList.add("is-open");
        e.preventDefault();
        var shield = function (ev) { ev.stopPropagation(); ev.preventDefault(); fd.removeEventListener("click", shield, true); };
        fd.addEventListener("click", shield, true);
      }
    });
  });
  document.addEventListener("pointerdown", function (e) {
    Array.prototype.forEach.call(document.querySelectorAll(".fd.is-open"), function (fd) { if (!fd.contains(e.target)) fd.classList.remove("is-open"); });
  });

  // "+": your site becomes the next card in the folder, then we go to the form
  var add = $("fd-add"), added = false;
  if (add) add.addEventListener("click", function () {
    if (!added) {
      added = true;
      var holder = $("fd-demo-cards"), n = holder.children.length;
      var card = document.createElement("button");
      card.type = "button";
      card.className = "fd-card is-new";
      card.style.setProperty("--i", n);
      $("fd-demo").style.setProperty("--n", n + 1);
      card.innerHTML = '<span class="fd-card-head"><b>Faqja juaj</b><i>së shpejti</i></span><span class="fd-ghost">Biznesi juaj këtu</span>';
      holder.appendChild(card);
      $("fd-demo-count").textContent = n + 1;
      if (window.gsap && !reduced) gsap.from(card, { y: -260, rotation: -8, opacity: 0, duration: 0.9, ease: "back.out(1.4)" });
      card.addEventListener("click", goContact);
    }
    setTimeout(goContact, reduced ? 0 : 900);
  });
  function goContact() {
    var msg = $("f-message");
    if (msg && !msg.value) msg.value = "Përshëndetje! Dua që faqja e biznesit tim të jetë karta e radhës në dosjen tuaj.";
    var target = $("contact");
    if (NS.lenis) NS.lenis.scrollTo(target, { offset: -40, duration: 1.4, onComplete: function () { $("f-name").focus({ preventScroll: true }); } });
    else { target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); setTimeout(function () { $("f-name").focus({ preventScroll: true }); }, 600); }
  }

  // "•••": spread the client's cards out above the folder
  var spread = $("fd-spread"), fan = $("fd-client");
  if (spread) spread.addEventListener("click", function () {
    var on = fan.classList.toggle("is-spread");
    spread.setAttribute("aria-expanded", on ? "true" : "false");
    spread.setAttribute("aria-label", on ? "Mbylli kartat e Nikës" : "Hapi kartat e Nikës");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && fan && fan.classList.contains("is-spread")) { fan.classList.remove("is-spread"); spread.setAttribute("aria-expanded", "false"); }
  });
})();
