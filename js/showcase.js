/* Nisja Studio — showcase preview (hero-v2.html)
   Effects shared by most of Awwwards' top 10 studios, rebuilt for Nisja:
     preloader with counter + scrambled words ... Immersive Garden, Locomotive
     WebGL hero ................................. Active Theory, Resn, Immersive Garden, Merci-Michel, Dogstudio
     smooth scroll (Lenis) ...................... Locomotive, Immersive Garden, Hello Monday, AQuest, makemepulse
     custom cursor with labels .................. Immersive Garden, makemepulse
     letter-by-letter headline .................. Dogstudio
     rolling link text .......................... Merci-Michel
     pinned horizontal work + counter ........... Monks, Merci-Michel
     image that follows the cursor on a list .... Locomotive
     showreel that grows with the scroll ........ Locomotive, Hello Monday, AQuest
     sound toggle ............................... Active Theory, Dogstudio, Immersive Garden, Resn
     film grain ................................. makemepulse
   Everything respects prefers-reduced-motion and works with touch and keyboard. */
(function () {
  "use strict";

  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var yearEl = $("year"); if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Without the animation library, show everything as a normal page.
  if (!window.gsap || !window.ScrollTrigger) {
    var l = $("sc-loader"); if (l) l.remove();
    return;
  }
  root.classList.add("sc-js");
  if (fine) root.classList.add("sc-fine");
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  if (window.ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);

  /* ================= sound (off until the visitor turns it on) ================= */
  var Sound = (function () {
    var ctx = null, on = false, pad = null;
    function ensure() {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ctx = new AC();
      }
      if (ctx.state === "suspended") ctx.resume();
      return true;
    }
    function blip(f, d, g) {
      if (!on || !ctx) return;
      var t = ctx.currentTime, o = ctx.createOscillator(), a = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 1.5, t + d);
      a.gain.setValueAtTime(g, t);
      a.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(a); a.connect(ctx.destination);
      o.start(t); o.stop(t + d + 0.02);
    }
    function startPad() {
      var t = ctx.currentTime, out = ctx.createGain(), lp = ctx.createBiquadFilter();
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(0.02, t + 1.6);
      lp.type = "lowpass"; lp.frequency.value = 650;
      lp.connect(out); out.connect(ctx.destination);
      var nodes = [110, 164.8, 220.5].map(function (f, i) {
        var o = ctx.createOscillator();
        o.type = i ? "sine" : "triangle";
        o.frequency.value = f; o.detune.value = (i - 1) * 7;
        o.connect(lp); o.start();
        return o;
      });
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 0.07; lg.gain.value = 240;
      lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
      pad = { out: out, nodes: nodes.concat([lfo]) };
    }
    function stopPad() {
      if (!pad) return;
      var p = pad, t = ctx.currentTime;
      p.out.gain.cancelScheduledValues(t);
      p.out.gain.setValueAtTime(p.out.gain.value, t);
      p.out.gain.linearRampToValueAtTime(0, t + 0.5);
      setTimeout(function () { p.nodes.forEach(function (n) { try { n.stop(); } catch (e) {} }); }, 600);
      pad = null;
    }
    return {
      toggle: function () {
        if (!ensure()) return false;
        on = !on;
        if (on) { startPad(); blip(880, 0.12, 0.05); } else stopPad();
        return on;
      },
      hover: function () { blip(1320, 0.05, 0.018); },
      click: function () { blip(660, 0.09, 0.035); }
    };
  })();
  var soundBtn = $("sc-sound");
  if (soundBtn) soundBtn.addEventListener("click", function () {
    var on = Sound.toggle();
    soundBtn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  document.addEventListener("click", function (e) { if (e.target.closest("a, button")) Sound.click(); });

  /* ================= smooth scroll ================= */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // shared with js/showcase-demos.js
  window.NisjaShowcase = { lenis: lenis, sound: Sound, reduced: reduced, fine: fine };

  /* ================= header: menu, progress, rolling links, anchors ================= */
  var header = document.querySelector(".site-header");
  var nav = $("site-nav"), menuBtn = $("menu-toggle");
  function closeMenu() { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  Array.prototype.forEach.call(document.querySelectorAll(".sc-roll"), function (a) {
    var t = a.textContent;
    a.innerHTML = "";
    var s1 = document.createElement("span"), s2 = document.createElement("span");
    s1.textContent = t; s2.textContent = t; s2.setAttribute("aria-hidden", "true");
    a.appendChild(s1); a.appendChild(s2);
  });

  var progress = document.querySelector(".scroll-progress");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: function (self) {
      progress.style.transform = "scaleX(" + self.progress.toFixed(4) + ")";
      header.classList.toggle("is-scrolled", self.scroll() > 8);
    }
  });

  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(el, { offset: id === "#top" ? -200 : -40, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    if (history.replaceState) history.replaceState(null, "", id);
  });

  // keyboard focus: make sure the focused element is on screen (smooth scroll can't rely on the browser for this)
  document.addEventListener("focusin", function (e) {
    var el = e.target; if (!lenis || el.closest(".sc-card")) return;
    var r = el.getBoundingClientRect();
    if (r.bottom < 80 || r.top > window.innerHeight - 40) lenis.scrollTo(el, { offset: -window.innerHeight * 0.35, immediate: true });
  });

  /* ================= cursor + magnetic ================= */
  if (fine) {
    var cur = document.querySelector(".sc-cursor");
    var dot = cur.querySelector(".sc-cursor-dot"), ring = cur.querySelector(".sc-cursor-ring");
    var label = $("sc-cursor-label");
    var dx = gsap.quickSetter(dot, "x", "px"), dy = gsap.quickSetter(dot, "y", "px");
    var rx = gsap.quickTo(ring, "x", { duration: reduced ? 0 : 0.45, ease: "power3" });
    var ry = gsap.quickTo(ring, "y", { duration: reduced ? 0 : 0.45, ease: "power3" });
    var current = null;
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      cur.classList.remove("is-hidden");
    });
    document.addEventListener("pointerover", function (e) {
      var t = e.target.closest("[data-cursor], a, button, .sc-row, input, textarea, select");
      if (t === current) return;
      current = t;
      cur.classList.remove("is-label", "is-hover");
      if (!t || t.matches("input, textarea, select")) return;
      if (t.hasAttribute("data-cursor")) { label.textContent = t.getAttribute("data-cursor"); cur.classList.add("is-label"); }
      else cur.classList.add("is-hover");
      Sound.hover();
    });
    document.addEventListener("pointerleave", function () { cur.classList.add("is-hidden"); });
    window.addEventListener("pointerdown", function () { cur.classList.add("is-down"); });
    window.addEventListener("pointerup", function () { cur.classList.remove("is-down"); });

    if (!reduced) {
      Array.prototype.forEach.call(document.querySelectorAll("[data-magnetic]"), function (el) {
        var mx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" }), my = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          mx((e.clientX - r.left - r.width / 2) * 0.32);
          my((e.clientY - r.top - r.height / 2) * 0.32);
        });
        el.addEventListener("pointerleave", function () { mx(0); my(0); });
      });
    }
  }

  /* ================= WebGL hero: ember field that bends around the cursor ================= */
  (function () {
    var canvas = $("sc-gl");
    var gl = canvas && (canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }));
    if (!gl) return;   // the CSS gradient stays
    var VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    var FS = [
      "precision mediump float;",
      "uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uHeat;",
      "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
      "float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);",
      " return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}",
      "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}",
      "void main(){",
      " vec2 uv=gl_FragCoord.xy/uRes;",
      " vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;",
      " vec2 m=(uMouse-.5)*vec2(uRes.x/uRes.y,1.);",
      " float d=length(p-m);",
      " float t=uTime*.6;",
      " vec2 q=vec2(fbm(p*1.5+vec2(0.,t*.12)),fbm(p*1.5+vec2(5.2,-t*.1)));",
      " vec2 r=vec2(fbm(p*1.9+q*1.7+vec2(1.7,9.2)+t*.08),fbm(p*1.9+q*1.7+vec2(8.3,2.8)-t*.07));",
      " r+=.35*exp(-d*3.2)*(p-m);",
      " float f=fbm(p*1.3+r*2.1);",
      " float k=f+.28*exp(-d*2.6)*uHeat;",
      " vec3 night=vec3(.071,.063,.055),ember=vec3(.34,.1,.035),fire=vec3(1.,.42,.17),sand=vec3(.96,.92,.86);",
      " vec3 c=mix(night,ember,smoothstep(.42,.68,k));",
      " c=mix(c,fire,smoothstep(.62,.86,k));",
      " c=mix(c,sand,smoothstep(.88,1.02,k)*.55);",
      " c*=mix(.42,1.,smoothstep(-.55,.75,p.x));",
      " c=mix(c,night,smoothstep(.28,0.,uv.y));",
      " gl_FragColor=vec4(c,1.);",
      "}"
    ].join("\n");
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, "uRes"), uTime = gl.getUniformLocation(prog, "uTime");
    var uMouse = gl.getUniformLocation(prog, "uMouse"), uHeat = gl.getUniformLocation(prog, "uHeat");
    // the field is soft anyway: render at half resolution, and never more than ~360k pixels
    function scale() { var px = canvas.clientWidth * canvas.clientHeight; return Math.min(0.6, Math.sqrt(360000 / Math.max(1, px))); }
    // no real graphics chip (software rendering): draw one still frame instead of animating
    var dbg = gl.getExtension("WEBGL_debug_renderer_info");
    var renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
    var still = reduced || /swiftshader|llvmpipe|software|basic render/i.test(renderer);
    function size() {
      var S = scale(), w = Math.max(1, Math.round(canvas.clientWidth * S)), h = Math.max(1, Math.round(canvas.clientHeight * S));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(uRes, w, h);
    }
    var mouse = { x: 0.72, y: 0.6 }, target = { x: 0.72, y: 0.6 }, heat = 0, heatT = 0.4;
    canvas.parentNode.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
      heatT = 1;
    });
    canvas.parentNode.addEventListener("pointerleave", function () { heatT = 0.4; });
    var visible = true, start = performance.now();
    function draw(now) {
      size();
      mouse.x += (target.x - mouse.x) * 0.06; mouse.y += (target.y - mouse.y) * 0.06;
      heat += (heatT - heat) * 0.04;
      gl.uniform1f(uTime, still ? 8 : (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uHeat, heat);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (still) { draw(performance.now()); window.addEventListener("resize", function () { draw(performance.now()); }); return; }
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(canvas);
    var odd = false, slow = 0, last = 0;
    function loop() {
      if (!visible || document.hidden) return;
      odd = !odd; if (odd) return;               // 30 fps is plenty for a slow field
      var now = performance.now();
      if (last && now - last > 70 && ++slow > 40) { gsap.ticker.remove(loop); return; }   // a weak device: freeze on the current frame
      last = now;
      draw(now);
    }
    draw(performance.now());
    window.addEventListener("load", function () { gsap.ticker.add(loop); });
    if (document.readyState === "complete") gsap.ticker.add(loop);
  })();

  /* ================= text: split headings, reveals, scroll-lit words ================= */
  var heroSplit = null;
  if (!reduced && window.SplitText) {
    heroSplit = SplitText.create($("sc-hero-title"), { type: "words,chars", mask: "chars" });
    gsap.set(heroSplit.chars, { yPercent: 118 });
    Array.prototype.forEach.call(document.querySelectorAll("[data-split]"), function (el) {
      SplitText.create(el, {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        }
      });
    });
    var big = $("sc-bigline");
    var bigSplit = SplitText.create(big, { type: "words", wordsClass: "word", aria: "none" });
    gsap.to(bigSplit.words, { color: "#F5EFE6", ease: "none", stagger: 0.12, scrollTrigger: { trigger: big, start: "top 82%", end: "bottom 45%", scrub: true } });
  }
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });
  if (!reduced) {
    gsap.from(".plan", { y: 36, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".plans", start: "top 92%", once: true } });
  }

  // scramble on hover (Locomotive)
  if (window.ScrambleTextPlugin && !reduced) {
    Array.prototype.forEach.call(document.querySelectorAll(".sc-scramble"), function (a) {
      var text = a.textContent;
      a.addEventListener("pointerenter", function () { gsap.to(a, { duration: 0.7, scrambleText: { text: text, chars: "lowerCase", speed: 0.6 }, overwrite: true }); });
    });
  }

  /* ================= hero entrance + preloader ================= */
  function heroIntro() {
    if (heroSplit) gsap.to(heroSplit.chars, { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.024 });
    gsap.to(".sh .sc-in", { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: heroSplit ? 0.45 : 0 });
  }
  (function () {
    var loader = $("sc-loader"), skip = false;
    try { skip = sessionStorage.getItem("sc-loaded") === "1"; } catch (e) {}
    if (reduced || skip || !loader) { if (loader) loader.remove(); heroIntro(); return; }
    if (lenis) lenis.stop();
    var cEl = $("sc-loader-count"), bar = $("sc-loader-bar"), word = $("sc-loader-word"), c = { v: 0 };
    var tl = gsap.timeline();
    tl.to(c, {
      v: 100, duration: 1.4, ease: "power2.inOut",
      onUpdate: function () { cEl.textContent = ("00" + Math.round(c.v)).slice(-3); bar.style.transform = "scaleX(" + (c.v / 100).toFixed(3) + ")"; }
    }, 0);
    if (window.ScrambleTextPlugin) {
      ["Faqe interneti", "Rezervime online", "Logo", "Nisja Studio"].forEach(function (w, i) {
        tl.to(word, { duration: 0.32, scrambleText: { text: w, chars: "upperAndLowerCase", speed: 0.8 } }, i * 0.34);
      });
    }
    tl.to(loader, { yPercent: -100, duration: 0.85, ease: "expo.inOut" }, 1.5);
    tl.add(heroIntro, 1.8);
    tl.add(function () {
      loader.remove();
      try { sessionStorage.setItem("sc-loaded", "1"); } catch (e) {}
      if (lenis) lenis.start();
    }, 2.4);
  })();

  /* ================= marquee: speed and lean follow the scroll ================= */
  (function () {
    var mq = $("sc-marquee"); if (!mq || reduced) return;
    var half = 0, x = 0, dir = 1, lean = 0, on = true;
    function measure() { half = mq.scrollWidth / 2; }
    measure(); window.addEventListener("resize", measure); window.addEventListener("load", measure);
    new IntersectionObserver(function (en) { on = en[0].isIntersecting; }).observe(mq);
    gsap.ticker.add(function (time, dt) {
      if (!on) return;
      var v = lenis ? lenis.velocity : 0;
      if (v > 0.3) dir = 1; else if (v < -0.3) dir = -1;
      x -= (1.1 + Math.min(Math.abs(v) * 0.7, 22)) * dir * (dt / 16.67);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      lean += (gsap.utils.clamp(-9, 9, -v * 0.5) - lean) * 0.12;
      mq.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0) skewX(" + lean.toFixed(2) + "deg)";
    });
  })();

  /* ================= pinned sideways rows (services): the row slides while the page scrolls ================= */
  var mm = gsap.matchMedia();
  mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", function () {
    var offs = [];
    Array.prototype.forEach.call(document.querySelectorAll("[data-hpin]"), function (sec) {
      var track = sec.querySelector(".hp-track"), now = sec.querySelector(".hp-now"), line = sec.querySelector(".hp-line");
      var n = track.querySelectorAll(":scope > :not(.sc-card--end)").length;
      sec.querySelector(".hp-total").textContent = ("0" + n).slice(-2);
      function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: {
          trigger: sec, pin: sec.querySelector(".sc-work-pin"), start: "top top", end: function () { return "+=" + dist(); },
          scrub: 1, invalidateOnRefresh: true,
          onUpdate: function (self) {
            now.textContent = ("0" + Math.min(n, Math.floor(self.progress * n) + 1)).slice(-2);
            line.style.transform = "scaleX(" + self.progress.toFixed(4) + ")";
          }
        }
      });
      // keyboard: tabbing to something off to the side scrolls the page so it slides into view
      function onFocus(e) {
        var card = e.target.closest(".hp-track > *"); if (!card) return;
        var st = tween.scrollTrigger, p = gsap.utils.clamp(0, 1, (card.offsetLeft - window.innerWidth * 0.2) / Math.max(1, dist()));
        var y = st.start + (st.end - st.start) * p;
        if (lenis) lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
      }
      track.addEventListener("focusin", onFocus);
      offs.push(function () { track.removeEventListener("focusin", onFocus); });
    });
    return function () { offs.forEach(function (f) { f(); }); };
  });

  /* ================= process: cards stack and shrink ================= */
  if (!reduced) {
    var steps = gsap.utils.toArray(".sc-step");
    steps.forEach(function (step, i) {
      var next = steps[i + 1];
      if (!next) return;
      gsap.to(step, {
        scale: 1 - (steps.length - 1 - i) * 0.035, ease: "none",
        scrollTrigger: { trigger: next, start: "top 85%", end: "top 30%", scrub: true }
      });
    });
  }

  /* ================= pricing: spotlight + tilt ================= */
  Array.prototype.forEach.call(document.querySelectorAll(".plan"), function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      if (fine && !reduced) gsap.to(card, { rotationY: (px - 0.5) * 8, rotationX: (0.5 - py) * 8, transformPerspective: 900, duration: 0.5, ease: "power3" });
    });
    card.addEventListener("pointerleave", function () { if (fine && !reduced) gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.7, ease: "power3" }); });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-plan]"), function (btn) {
    btn.addEventListener("click", function () { var s = $("f-plan"); if (s) s.value = btn.getAttribute("data-plan"); });
  });

  /* ================= footer wordmark draws itself ================= */
  if (!reduced) {
    gsap.fromTo("#sc-footer-mark", { "--draw": 1, "--dot": 0 }, { "--draw": 0, "--dot": 1, ease: "none", scrollTrigger: { trigger: ".sc-footer", start: "top bottom", end: "bottom bottom", scrub: true } });
  }

  /* ================= contact form ================= */
  (function () {
    var form = $("contact-form"), status = $("sc-form-status"), openedAt = Date.now();
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector('[name="_honey"]').value) return;
      if (Date.now() - openedAt < 4000) { form.reset(); return; }   // nobody fills this in under 4 seconds
      status.className = "sc-form-status field--full";
      status.textContent = "→ Duke dërguar…";
      var slow = setTimeout(function () { status.textContent = "→ Shërbimi i email-it po e konfirmon, zakonisht 5–10 sekonda."; }, 2500);
      fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form), keepalive: true })
        .then(function (r) { return r.ok; })
        .catch(function () { return false; })
        .then(function (ok) {
          clearTimeout(slow);
          if (ok) { status.textContent = "✓ U dërgua! Ju shkruajmë brenda një dite."; status.classList.add("is-ok"); form.reset(); }
          else { status.textContent = "✗ Nuk u dërgua. Na shkruani te nisjastudio@gmail.com."; status.classList.add("is-err"); }
        });
    });
  })();

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
