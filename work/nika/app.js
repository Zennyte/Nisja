(function () {
  "use strict";
  var $ = K.$, t = K.t;
  /* the studio's projects. Names describe what the images show; no invented clients or places */
  var P = [
    { img: ["p01a", "p01b"], n: { sq: "Vilë me pishinë", en: "Villa with pool" }, ty: { sq: "Banim individual", en: "Private house" }, yr: "2025" },
    { img: ["p02"], n: { sq: "Ndërtesë banimi", en: "Residential building" }, ty: { sq: "Banim urban", en: "Urban housing" }, yr: "2025" },
    { img: ["p03a", "p03b"], n: { sq: "Restorant", en: "Restaurant" }, ty: { sq: "Hapësirë afariste", en: "Commercial" }, yr: "2025" },
    { img: ["p04a", "p04b"], n: { sq: "Interier me oxhak", en: "Interior with fireplace" }, ty: { sq: "Interier", en: "Interior" }, yr: "2025" },
    { img: ["p05"], n: { sq: "Renovim shtëpie", en: "House renovation" }, ty: { sq: "Renovim", en: "Renovation" }, yr: "" },
    { img: ["p06"], n: { sq: "Shtëpi me dy kate", en: "Two-storey house" }, ty: { sq: "Banim individual", en: "Private house" }, yr: "" },
    { img: ["p07"], n: { sq: "Banesa kolektive", en: "Apartment block" }, ty: { sq: "Banim urban", en: "Urban housing" }, yr: "" },
    { img: ["p08"], n: { sq: "Shtëpi me tarracë", en: "House with terrace" }, ty: { sq: "Banim individual", en: "Private house" }, yr: "" },
    { img: ["p09"], n: { sq: "Shtëpi në shpat", en: "Hillside house" }, ty: { sq: "Banim individual", en: "Private house" }, yr: "" },
    { img: ["p10"], n: { sq: "Shtëpi familjare", en: "Family house" }, ty: { sq: "Banim individual", en: "Private house" }, yr: "" }
  ];
  var pad = function (i) { return (i + 1 < 10 ? "0" : "") + (i + 1); };
  var ARROW = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 11 11 3M5 3h6v6" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';

  /* project slider */
  var at = 0, x = 0, trackEl = $("track"), slides = [];
  function renderSlider() {
    trackEl.innerHTML = "";
    P.forEach(function (p, i) {
      var el = document.createElement("div"); el.className = "slide"; el.setAttribute("role", "group"); el.setAttribute("aria-roledescription", "slide");
      el.setAttribute("aria-label", (i + 1) + " / " + P.length);
      el.innerHTML = '<div class="frame"><img alt="" loading="lazy" width="1600" height="900"><span class="cutl" aria-hidden="true"></span></div><div class="cap"><span class="no"></span><h3></h3><span class="meta"></span><button type="button" class="open"><span></span>' + ARROW + "</button></div>";
      var im = el.querySelector("img"); im.src = "img/" + p.img[0] + (window.innerWidth < 760 ? "-s" : "") + ".webp"; im.alt = t(p.n);
      el.querySelector(".no").textContent = "A-" + pad(i); el.querySelector("h3").textContent = t(p.n);
      el.querySelector(".meta").textContent = t(p.ty) + (p.yr ? " · " + p.yr : "");
      el.querySelector(".open span").textContent = t("Hap fletën", "Open sheet");
      el.querySelector(".open").addEventListener("click", function () { open(i); });
      trackEl.appendChild(el);
    });
    slides = Array.prototype.slice.call(trackEl.children);
    go(at, true);
  }
  function step() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 1; }
  function maxAt() { var vw = trackEl.parentNode.clientWidth, sw = step(); return Math.max(0, Math.ceil((trackEl.scrollWidth - vw) / sw)); }
  function go(i, instant) {
    at = Math.max(0, Math.min(P.length - 1, i));
    x = -slides[at].offsetLeft;
    trackEl.style.transition = instant || K.reduced ? "none" : "transform .8s cubic-bezier(.2,.7,.2,1)";
    trackEl.style.transform = "translate3d(" + x + "px,0,0)";
    slides.forEach(function (s, k) { s.classList.toggle("active", k === at); if (k >= at && k <= at + 1) s.classList.add("seen"); s.setAttribute("aria-hidden", String(k < at || k > at + 2)); s.querySelector(".open").tabIndex = k === at ? 0 : -1; });
    $("count").innerHTML = "<b>" + pad(at) + "</b> / " + pad(P.length - 1);
    var w = 100 / P.length; $("prog").style.width = w + "%"; $("prog").style.left = (at * w) + "%";
    $("prev").disabled = at === 0; $("next").disabled = at === P.length - 1;
  }
  $("prev").addEventListener("click", function () { go(at - 1); });
  $("next").addEventListener("click", function () { go(at + 1); });
  $("slider").addEventListener("keydown", function (e) { if (e.target.closest("dialog")) return; if (e.key === "ArrowRight") { e.preventDefault(); go(at + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(at - 1); } });
  $("slider").tabIndex = 0;
  /* drag / swipe with momentum, then snap to the nearest slide */
  (function () {
    var down = false, sx = 0, sy = 0, base = 0, lastX = 0, lastT = 0, v = 0, moved = false, locked = null;
    trackEl.addEventListener("pointerdown", function (e) { if (e.button !== 0) return; down = true; moved = false; locked = null; sx = lastX = e.clientX; sy = e.clientY; lastT = performance.now(); base = x; v = 0; trackEl.style.transition = "none"; });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (locked === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (locked !== "x") return;
      moved = true; trackEl.classList.add("drag");
      var now = performance.now(); v = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
      var nx = base + dx, min = -slides[P.length - 1].offsetLeft;
      if (nx > 0) nx *= .35; if (nx < min) nx = min + (nx - min) * .35;
      x = nx; trackEl.style.transform = "translate3d(" + x + "px,0,0)";
    });
    window.addEventListener("pointerup", function () {
      if (!down) return; down = false; trackEl.classList.remove("drag");
      if (!moved) return;
      var target = -(x + v * 260) / step();
      go(Math.round(target));
    });
    trackEl.addEventListener("click", function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    window.addEventListener("resize", function () { go(at, true); });
  })();

  /* project sheet */
  var cur = 0, dlg = $("dlg");
  function open(i) {
    cur = (i + P.length) % P.length; var p = P[cur];
    $("dN").textContent = "A-" + pad(cur); $("dT").textContent = t(p.n);
    $("dImgs").innerHTML = ""; p.img.forEach(function (k) { var im = document.createElement("img"); im.src = "img/" + k + ".webp"; im.alt = t(p.n); im.width = 1600; im.height = 900; $("dImgs").appendChild(im); });
    $("dMeta").innerHTML = ""; [[t("Lloji", "Type"), t(p.ty)], [t("Viti", "Year"), p.yr || "—"], [t("Studio", "Studio"), "Nika Architecture Studio"]].forEach(function (m) { var d = document.createElement("div"); d.innerHTML = "<span></span><b></b>"; d.firstChild.textContent = m[0]; d.lastChild.textContent = m[1]; $("dMeta").appendChild(d); });
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
  }
  $("dPrev").addEventListener("click", function () { open(cur - 1); });
  $("dNext").addEventListener("click", function () { open(cur + 1); });
  $("dClose").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") open(cur + 1); if (e.key === "ArrowLeft") open(cur - 1); });

  /* hero: draw the lines, sweep the section line to reveal the render, then hand the line to the visitor */
  (function () {
    var view = $("view"), sheet = $("sheet"), set = function (k, v) { view.style.setProperty(k, v); sheet.style.setProperty(k, v); $("hint").style.setProperty(k, v); };
    var done = false;
    function finish() { set("--draw", "110%"); set("--cut", "46%"); set("--lo", ".35"); set("--co", "1"); set("--dim", "1"); done = true; }
    if (K.reduced) { finish(); }
    else {
      var t0 = null;
      var ease = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
      requestAnimationFrame(function step(now) {
        if (t0 === null) t0 = now; var s = (now - t0) / 1000;
        var d = Math.min(1, s / 2.2), c = Math.min(1, Math.max(0, (s - 2.4) / 1.6));
        set("--dim", ease(Math.min(1, s / 1.2)).toFixed(3));
        set("--draw", (22 + ease(d) * 88).toFixed(2) + "%");
        set("--co", c > 0 ? "1" : "0");
        set("--cut", (100 - ease(c) * 54).toFixed(2) + "%");
        set("--lo", (1 - ease(c) * .65).toFixed(3));
        if (s < 4.1 && !done) requestAnimationFrame(step); else finish();
      });
    }
    /* drag the section line */
    var dragging = false;
    function move(e) { var r = view.getBoundingClientRect(), x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); done = true; set("--cut", (x * 100).toFixed(2) + "%"); set("--lo", (.2 + .8 * x).toFixed(2)); set("--draw", "110%"); set("--co", "1"); }
    view.addEventListener("pointerdown", function (e) { dragging = true; view.setPointerCapture(e.pointerId); move(e); });
    view.addEventListener("pointermove", function (e) { if (dragging) move(e); });
    view.addEventListener("pointerup", function () { dragging = false; });
    view.addEventListener("pointercancel", function () { dragging = false; });
    view.tabIndex = 0;
    view.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return; e.preventDefault();
      var c = parseFloat(view.style.getPropertyValue("--cut")) || 46; c = Math.min(100, Math.max(0, c + (e.key === "ArrowRight" ? 5 : -5)));
      done = true; set("--cut", c + "%"); set("--lo", (.2 + .8 * c / 100).toFixed(2)); set("--draw", "110%"); set("--co", "1");
    });
  })();

  /* level marker reads your scroll depth as an elevation */
  (function () {
    var el = $("lvl"), last = -1;
    function upd() { var m = window.scrollY / 120 * .3; if (Math.abs(m - last) < .005) return; last = m; el.textContent = (m < .005 ? "±" : "+") + m.toFixed(2); }
    window.addEventListener("scroll", upd, { passive: true }); upd();
  })();

  /* reveals: rules extend, cuts open, plan icons draw */
  (function () {
    var els = document.querySelectorAll("[data-reveal], [data-reveal-rule], [data-cut], #scopes");
    if (K.reduced || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .18, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) { io.observe(e); });
  })();

  K.onLang(function () { renderSlider(); if (dlg.open) open(cur); });
  K.i18n({
    "demo": 'Alternative design proposal by <a href="../../">Nisja Studio</a>. The studio\'s current site: <a href="https://nika-archi.vercel.app/">nika-archi.vercel.app</a>',
    "nav.p": "Projects", "nav.s": "Services", "nav.a": "Studio", "nav.c": "Contact", "cta.c": "Contact us",
    "h.k": "Architecture & engineering · Gjakova", "h.t": "From idea <em>to reality.</em>",
    "h.l": "We design houses, apartments, commercial spaces and renovations, and follow them on site down to the last detail.",
    "h.c1": "See the projects", "h.c2": "Start a project", "h.alt": "Technical drawing of a house turning into the final visualisation",
    "tb.1": "Project", "tb.1v": "Family house", "tb.2": "Sheet", "tb.3": "View", "tb.3v": "Section A–A", "tb.4": "Scale",
    "h.hint": "Drag the red line: from drawing to building.",
    "p.t": "Projects", "p.aria": "Projects", "p.prev": "Previous project", "p.next": "Next project", "p.l": "Every project is a unique dialogue between the landscape, the client's vision and our commitment to lasting architectural form.",
    "f1": "Villa with pool", "f1s": "Private house · 2025", "f2": "Residential building", "f2s": "Urban housing", "f3": "Restaurant", "f3s": "Commercial · 2025",
    "s.t": "What we design", "s.l": "Four kinds of project, one way of working: we read the place and the needs, then we draw.",
    "s1": "Private houses", "s1d": "Private homes and family spaces.", "s2": "Urban housing", "s2d": "Apartments, spatial planning and interiors.",
    "s3": "Commercial spaces", "s3d": "Work, service and retail spaces.", "s4": "Renovations", "s4d": "Renovating, improving and transforming existing spaces.",
    "m.t": "Site supervision", "m.l": "NIKA ARCHITECTURE STUDIO supervises work on site so the building is delivered exactly to the architectural design, technical documentation, materials and approved details.",
    "m1": "Listening", "m1d": "The place, the landscape, natural conditions and the people who will use the space.",
    "m2": "Concept and visuals", "m2d": "Form, function and materials, seen before they are built.",
    "m3": "Technical design", "m3d": "Documentation and details for construction.",
    "m4": "Supervision", "m4d": "Coordination on site so every phase keeps the quality and the approved details.",
    "m.c": "House renovation", "m.cs": "After renovation",
    "a.q": "Architecture is not only a functional answer. It is <em>how we live, work and feel</em> every day.",
    "a.1": "NIKA ARCHITECTURE STUDIO, led by Ing. dipl. arch. Nike Prela, was founded on the belief that architecture should be a well-considered process, closely tied to how people live, work, move and feel.",
    "a.2": "For us, a building doesn't end at its form or facade. It must have durability, character and spatial clarity; respect its context and stay valuable over time.",
    "a.3": "Our approach begins with listening. From that careful reading comes balanced architecture, where function, aesthetics and identity come together.",
    "a.s": "Founder",
    "c.t": "Let's draw it together.", "c.wa": "Message on WhatsApp", "c.map": "Open the map",
    "c.s": "Studio", "c.h": "Hours", "c.hv": "Monday – Friday, 09:00 – 17:00<br>Saturday, 09:00 – 15:00", "c.w": "Work", "c.wv": "Across Kosovo, meetings at the studio or on site.",
    "foot": 'Design proposal by <a href="../../">Nisja Studio</a>', "close": "Close"
  });
  $("yr").textContent = new Date().getFullYear();
})();

