/* Nisja Studio — showcase preview: live demos
   1. Hero strip: an endless row of every demo site on a 3D curve (real images,
      CSS perspective). Kalibër, Udha, Fener and Brisk show their hero; the rest
      show their most telling inner section (menu, cakes, prices…).
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
    "nika-2": { name: "Nika · Projektet", kind: "Klient i vërtetë", url: "https://nika-archi.vercel.app/#projektet", external: true },
    "nika-3": { name: "Nika · Rreth nesh", kind: "Klient i vërtetë", url: "https://nika-archi.vercel.app/#about", external: true },
    "nika-4": { name: "Nika · Kontakti", kind: "Klient i vërtetë", url: "https://nika-archi.vercel.app/#contact", external: true }
  };
  var STREAM = ["kaliber", "prush", "udha", "embel", "fener", "kroni", "brisk", "mendafsh", "lisi", "vrull", "kristal", "nika-2"];
  var HERO_SHOT = { kaliber: 1, udha: 1, fener: 1, brisk: 1 };   // these show their hero; the rest an inner section

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

  /* ================= 1. hero strip: sharp screenshots on a 3D curve ================= */
  (function () {
    var stage = $("sc-stream"), track = $("sc-stream-track");
    if (!stage || !track) return;
    var nameEl = $("sc-stream-name"), kindEl = $("sc-stream-kind");
    var COPIES = 1, P = 1300;                       // copies fill the loop on wide screens; P = perspective (px)
    var W = 0, H = 0, cw = 0, ch = 0, step = 0, L = 0, span = 1, zMax = 0;
    var cards = [];
    for (var r = 0; r < COPIES; r++) STREAM.forEach(function (id) {
      var el = document.createElement("div"); el.className = "sh-card"; el.dataset.id = id;
      var img = document.createElement("img");
      img.alt = ""; img.decoding = "async"; img.draggable = false;
      var f = id.replace(/-\d+$/, ""), small = (HERO_SHOT[id] ? "assets/demo/" : "assets/demo/sec/") + f + ".webp";
      img.src = small;
      img.srcset = small + " 720w, assets/demo/hd/" + f + ".webp 1280w";
      el.appendChild(img); track.appendChild(el);
      cards.push({ id: id, el: el, img: img });
    });
    function resize() {
      W = stage.clientWidth; H = stage.clientHeight;
      cw = W < 700 ? Math.round(W * 0.68) : Math.round(Math.min(500, Math.max(240, W * 0.3)));
      span = Math.max(W / 2, cw * 1.6);
      zMax = Math.min(220, cw * 0.42);
      var edgeScale = P / (P - zMax * Math.pow(Math.min(1.2, W / 2 / span), 2));
      ch = Math.round(cw * 0.625);
      if (ch * edgeScale > H * 0.94) { ch = Math.floor(H * 0.94 / edgeScale); cw = Math.round(ch / 0.625); }
      step = Math.round(cw * 1.06); L = step * cards.length;
      cards.forEach(function (c) { c.el.style.width = cw + "px"; c.el.style.height = ch + "px"; c.img.sizes = cw + "px"; });
      layout();
    }
    var offset = 0, speed = reduced ? 0 : 30, vel = speed, hover = false, dragging = false, visible = true, centerIdx = -1, tween = null;
    function layout() {
      if (!W) return;
      var best = 1e9;
      cards.forEach(function (c, i) {
        var x = i * step - offset;
        x = ((x + L / 2) % L + L) % L - L / 2;               // wrap into -L/2 … L/2 around the centre
        var nx = x / span, z = zMax * Math.min(1.44, nx * nx);
        c.el.style.transform = "translate3d(" + (x - cw / 2).toFixed(1) + "px," + (-ch / 2) + "px," + z.toFixed(1) + "px) rotateY(" + (-nx * 26).toFixed(2) + "deg)";
        c.el.style.visibility = Math.abs(x) > W / 2 + cw ? "hidden" : "visible";
        if (Math.abs(x) < best) { best = Math.abs(x); centerIdx = i; }
      });
      var d = DEMOS[cards[centerIdx].id];
      if (nameEl.textContent !== d.name) { nameEl.textContent = d.name; kindEl.textContent = d.kind; }
    }
    var lastT = 0;
    function tick() {
      var now = performance.now(), dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0;
      lastT = now;
      if (!visible || document.hidden) { lastT = 0; return; }
      if (!dragging && !tween) {
        var lv = NS.lenis ? NS.lenis.velocity : 0;
        vel += ((hover ? 0 : speed) + Math.abs(lv) * 6 - vel) * Math.min(1, dt * 3);
        offset += vel * dt;
      }
      layout();
    }
    if (window.gsap) gsap.ticker.add(tick); else (function loop() { tick(); requestAnimationFrame(loop); })();
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(stage);
    window.addEventListener("resize", resize);
    resize();

    // drag, flick and click
    var lastX = 0, moved = 0, dragVel = 0, lastMoveT = 0, downCard = null;
    stage.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      dragging = true; moved = 0; lastX = e.clientX; lastMoveT = performance.now();
      downCard = e.target.closest(".sh-card");
      stage.classList.add("is-dragging");
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      if (tween) { tween.kill(); tween = null; }
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) { hover = e.pointerType === "mouse" && !!e.target.closest(".sh-card"); return; }
      var dx = e.clientX - lastX, t = performance.now();
      offset -= dx; moved += Math.abs(dx);
      dragVel = -dx / Math.max(1, t - lastMoveT) * 1000;
      lastX = e.clientX; lastMoveT = t;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false; stage.classList.remove("is-dragging");
      if (moved < 6) { if (downCard) openDemo(downCard.dataset.id); }
      else if (!reduced) vel = Math.max(-1400, Math.min(1400, dragVel));
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", function () { dragging = false; stage.classList.remove("is-dragging"); });
    stage.addEventListener("pointerleave", function () { hover = false; });

    function go(dir) {
      var target = Math.round(offset / step + dir) * step;
      if (tween) tween.kill();
      if (reduced || !window.gsap) { offset = target; layout(); return; }
      var o = { v: offset };
      tween = gsap.to(o, { v: target, duration: 0.75, ease: "power3.inOut", onUpdate: function () { offset = o.v; }, onComplete: function () { tween = null; vel = 0; } });
    }
    function openCentre() { openDemo(cards[centerIdx < 0 ? 0 : centerIdx].id); }
    $("sc-stream-prev").addEventListener("click", function () { go(-1); });
    $("sc-stream-next").addEventListener("click", function () { go(1); });
    $("sc-stream-open").addEventListener("click", openCentre);
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCentre(); }
    });
  })();

  /* ================= 1b. other demos: the fanned deck and the scrolling windows open their demo too ================= */
  Array.prototype.forEach.call(document.querySelectorAll("[data-open-demo]"), function (el) {
    el.addEventListener("click", function () { openDemo(el.getAttribute("data-open-demo")); });
  });

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
