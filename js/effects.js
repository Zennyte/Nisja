/* Nisja Studio — interactive effects
   - reactive dot field behind the hero
   - headline "decode" effect
   - word-by-word heading reveals and block reveals on scroll
   - cursor ring, magnetic buttons, card spotlight and tilt
   - process progress line, footer arrow, contact form terminal
   Everything respects prefers-reduced-motion.
*/
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var onLang = (window.Nisja && window.Nisja.onLangChange) || function () {};

  // Run once the loading screen has lifted (or right away if there is none).
  function whenReady(fn) {
    if (document.documentElement.classList.contains("is-loading")) {
      window.addEventListener("nisja:ready", function once() { window.removeEventListener("nisja:ready", once); fn(); });
    } else fn();
  }

  /* ---------- Hero dot field ---------- */
  (function dotField() {
    var canvas = document.querySelector(".hero-field");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentNode;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var dots = [], w = 0, h = 0, gap = 30;
    var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    var visible = true, raf = null, t = 0;

    function build() {
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (var y = gap / 2; y < h; y += gap) {
        for (var x = gap / 2; x < w; x += gap) dots.push({ x: x, y: y });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      t += 0.012;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        var dx = d.x - mouse.x, dy = d.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var force = Math.max(0, 1 - dist / 180);
        // a slow wave keeps the field breathing even without the mouse
        var wave = (Math.sin(d.x * 0.012 + t) + Math.cos(d.y * 0.015 + t * 0.8)) * 0.5;
        var px = d.x + (dist > 0 ? dx / dist : 0) * force * 18;
        var py = d.y + (dist > 0 ? dy / dist : 0) * force * 18;
        var r = 1 + force * 1.8 + wave * 0.25;
        if (force > 0.02) {
          ctx.fillStyle = "rgba(255," + Math.round(107 + (1 - force) * 80) + "," + Math.round(44 + (1 - force) * 120) + "," + (0.25 + force * 0.75) + ")";
        } else {
          ctx.fillStyle = "rgba(245,239,230," + (0.08 + (wave + 1) * 0.04) + ")";
        }
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.6, r), 0, 6.283);
        ctx.fill();
      }
      raf = visible && !reduce ? requestAnimationFrame(draw) : null;
    }

    build();
    draw();
    window.addEventListener("resize", function () { build(); if (!raf) draw(); });
    if (!reduce) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
        if (mouse.x < -999) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
      });
      hero.addEventListener("pointerleave", function () { mouse.tx = -9999; mouse.ty = -9999; });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) {
          visible = en[0].isIntersecting;
          if (visible && !raf) draw();
        }).observe(hero);
      }
    }
  })();

  /* ---------- Hero trail: the full stop turns into an arrow ----------
     The "." shrinks away and an orange line grows from it: it drops into the
     gap under the headline (never over the text below), runs right and turns
     into the code editor. On phones it runs down the right margin instead. */
  var trail = (function () {
    var title = document.querySelector(".hero-title");
    var inner = document.querySelector(".hero-inner");
    var copy = document.querySelector(".hero-copy");
    var sub = document.querySelector(".hero-sub");
    var editor = document.querySelector(".editor");
    if (!title || !inner || !editor) return { run: function () {}, refresh: function () {} };

    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "hero-trail");
    svg.setAttribute("aria-hidden", "true");
    var line = document.createElementNS(NS, "path");
    line.setAttribute("class", "trail-line");
    line.setAttribute("pathLength", "1");
    var head = document.createElementNS(NS, "path");
    head.setAttribute("class", "trail-head");
    svg.appendChild(line); svg.appendChild(head);
    inner.insertBefore(svg, inner.firstChild);
    var drawn = false;

    function wrapDot() {
      var text = title.textContent.trim();
      if (text.slice(-1) !== ".") return null;
      title.innerHTML = "";
      title.appendChild(document.createTextNode(text.slice(0, -1)));
      var dot = document.createElement("span");
      dot.className = "hero-dot";
      dot.setAttribute("aria-hidden", "true");
      dot.textContent = ".";
      title.appendChild(dot);
      return dot;
    }

    function rounded(pts, r) {
      var d = "M" + pts[0][0] + " " + pts[0][1];
      for (var i = 1; i < pts.length - 1; i++) {
        var p = pts[i], a = pts[i - 1], b = pts[i + 1];
        var la = Math.hypot(p[0] - a[0], p[1] - a[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
        var rr = Math.min(r, la / 2, lb / 2);
        var p1 = [p[0] + (a[0] - p[0]) / la * rr, p[1] + (a[1] - p[1]) / la * rr];
        var p2 = [p[0] + (b[0] - p[0]) / lb * rr, p[1] + (b[1] - p[1]) / lb * rr];
        d += " L" + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " Q" + p[0] + " " + p[1] + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
      }
      var last = pts[pts.length - 1];
      return d + " L" + last[0] + " " + last[1];
    }

    function geometry(dot) {
      var o = inner.getBoundingClientRect();
      var rel = function (r) { return { l: r.left - o.left, t: r.top - o.top, r: r.right - o.left, b: r.bottom - o.top, w: r.width, h: r.height }; };
      var d = rel(dot.getBoundingClientRect()), h1 = rel(title.getBoundingClientRect());
      var sb = rel((sub || title).getBoundingClientRect()), ed = rel(editor.getBoundingClientRect());
      var fs = parseFloat(getComputedStyle(title).fontSize) || 80;
      var x0 = Math.round(d.l + d.w * 0.5), y0 = Math.round(d.t + d.h * 0.74);
      // a lane between the headline's descenders and the first line of the paragraph
      var lane = Math.round((h1.b + fs * 0.1 + sb.t + 6) / 2);
      var pts;
      if (ed.l > h1.l + h1.w * 0.6) {
        // editor to the right: drop into the lane, run right, turn into the editor
        var textRight = Math.max(d.r, sb.r);
        var xm = Math.round(textRight + (ed.l - textRight) * 0.55);
        var xe = Math.round(ed.l - 16);
        var ye = Math.round(Math.min(Math.max(ed.t + 110, ed.t + 40), ed.b - 60));
        pts = [[x0, y0], [x0, lane], [xm, lane], [xm, ye], [xe, ye]];
      } else {
        // editor below the text (tablets and phones)
        var actions = document.querySelector(".hero-actions");
        var act = rel((actions || sub || title).getBoundingClientRect());
        var actRight = act.l;
        if (actions) Array.prototype.forEach.call(actions.children, function (c) { actRight = Math.max(actRight, rel(c.getBoundingClientRect()).r); });
        var subRight = sb.l;
        if (sub) { var rg = document.createRange(); rg.selectNodeContents(sub); Array.prototype.forEach.call(rg.getClientRects(), function (r) { subRight = Math.max(subRight, r.right - o.left); }); }
        var textRight = Math.max(d.r, subRight, actRight);
        if (textRight + 40 < ed.r - 40) {
          // room on the right: run right in the lane, then straight down into the editor
          var xd = Math.round(Math.min(ed.r - 48, textRight + (ed.r - textRight) / 2));
          pts = [[x0, y0], [x0, lane], [xd, lane], [xd, Math.round(ed.t - 14)]];
        } else {
          // narrow phones: down the right margin, under the buttons, then into the editor
          var xr = Math.round(Math.min(inner.clientWidth - 8, Math.max(textRight, ed.r) + 10));
          var yg = Math.round(act.b + 22);
          var xk = Math.round(ed.r - 52);
          pts = [[x0, y0], [x0, lane], [xr, lane], [xr, yg], [xk, yg], [xk, Math.round(ed.t - 14)]];
        }
      }
      return pts;
    }

    function arrowHead(pts) {
      var a = pts[pts.length - 2], b = pts[pts.length - 1];
      var ang = Math.atan2(b[1] - a[1], b[0] - a[0]), s = 13, spread = 0.75;
      var p1 = [b[0] - s * Math.cos(ang - spread), b[1] - s * Math.sin(ang - spread)];
      var p2 = [b[0] - s * Math.cos(ang + spread), b[1] - s * Math.sin(ang + spread)];
      return "M" + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " L" + b[0] + " " + b[1] + " L" + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
    }

    function place(dot) {
      var pts = geometry(dot);
      line.setAttribute("d", rounded(pts, 22));
      head.setAttribute("d", arrowHead(pts));
    }

    return {
      run: function () {
        var dot = wrapDot();
        if (!dot) { window.dispatchEvent(new Event("nisja:arrow")); return; }
        place(dot);
        if (reduce || drawn) {
          line.classList.add("is-static"); head.classList.add("is-in"); dot.classList.add("is-gone");
          if (!drawn) window.dispatchEvent(new Event("nisja:arrow"));
          drawn = true;
          return;
        }
        drawn = true;
        line.getBoundingClientRect(); // commit the starting state before animating
        requestAnimationFrame(function () {
          dot.classList.add("is-gone");
          line.classList.add("is-drawing");
        });
        setTimeout(function () {
          head.classList.add("is-in");
          window.dispatchEvent(new Event("nisja:arrow"));
        }, 1900);
      },
      refresh: function () {
        var dot = title.querySelector(".hero-dot");
        if (dot && drawn) place(dot);
      }
    };
  })();

  var resizeTimer;
  window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(trail.refresh, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { trail.refresh(); });

  whenReady(function () {
    var go = function () { setTimeout(trail.run, 450); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  });
  onLang(function () {
    if (document.documentElement.classList.contains("is-loading")) return;
    trail.run(); // redraws the arrow for the new headline (no replay)
  });

  /* ---------- Heading word reveal + block reveal ---------- */
  function split(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", words.join(" "));
    el.innerHTML = words.map(function (wd, i) {
      return '<span class="w" aria-hidden="true"><span style="transition-delay:' + (i * 70) + 'ms">' + wd.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</span></span>";
    }).join(" ");
  }
  var splitEls = $$(".split");
  splitEls.forEach(split);
  onLang(function () { splitEls.forEach(function (el) { split(el); }); });

  var revealEls = $$(".tile, .work-card, .plan, .step, .extras, .contact-form, .contact-direct, .faq-item");
  revealEls.forEach(function (el, i) {
    el.classList.add("reveal");
    // stagger siblings a little
    var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.transitionDelay = Math.min(idx, 4) * 80 + "ms";
  });

  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });
    splitEls.concat(revealEls).forEach(function (el) { io.observe(el); });
  } else {
    splitEls.concat(revealEls).forEach(function (el) { el.classList.add("is-in"); });
  }
  // remove the stagger delay once revealed, so hover transitions stay snappy
  revealEls.forEach(function (el) {
    el.addEventListener("transitionend", function clear() {
      if (el.classList.contains("is-in")) { el.style.transitionDelay = ""; el.removeEventListener("transitionend", clear); }
    });
  });

  /* ---------- Spotlight on cards ---------- */
  $$(".spotlight").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Pointer-only effects ---------- */
  if (finePointer && !reduce) {
    // cursor ring
    var ring = document.querySelector(".cursor-ring");
    var pos = { x: -100, y: -100 }, cur = { x: -100, y: -100 };
    document.documentElement.classList.add("has-cursor");
    window.addEventListener("pointermove", function (e) { pos.x = e.clientX; pos.y = e.clientY; }, { passive: true });
    (function loop() {
      cur.x += (pos.x - cur.x) * 0.2; cur.y += (pos.y - cur.y) * 0.2;
      ring.style.transform = "translate(" + cur.x + "px," + cur.y + "px)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", function (e) {
      ring.classList.toggle("is-hover", !!e.target.closest("a, button, select, .tilt"));
    });
    document.addEventListener("pointerleave", function () { ring.style.opacity = "0"; });
    document.addEventListener("pointerenter", function () { ring.style.opacity = ""; });

    // magnetic buttons
    $$(".magnetic").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });

    // 3D tilt on project cards
    $$(".tilt").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(1200px) rotateX(" + (-py * 5) + "deg) rotateY(" + (px * 6) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- Process progress line ---------- */
  (function steps() {
    var wrap = document.getElementById("steps");
    if (!wrap) return;
    var items = $$(".step", wrap);
    function update() {
      var r = wrap.getBoundingClientRect();
      var vh = window.innerHeight;
      // 0 when the steps enter the lower part of the screen, 1 when they reach the upper third
      var p = (vh * 0.85 - r.top) / (vh * 0.55);
      p = Math.max(0, Math.min(1, p));
      if (reduce) p = r.top < vh ? 1 : 0;
      wrap.style.setProperty("--progress", p.toFixed(3));
      items.forEach(function (el, i) {
        el.classList.toggle("is-active", p >= (items.length > 1 ? i / (items.length - 1) : 0) - 0.001 && p > 0);
      });
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  })();

  /* ---------- Footer arrow ---------- */
  var footer = document.querySelector(".site-footer");
  if (footer) {
    if ("IntersectionObserver" in window && !reduce) {
      var fo = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { footer.classList.add("is-in"); fo.disconnect(); }
      }, { threshold: 0.3 });
      fo.observe(footer);
    } else footer.classList.add("is-in");
  }

  /* ---------- Contact form with terminal feedback ---------- */
  (function contact() {
    var form = document.getElementById("contact-form");
    var term = document.getElementById("form-terminal");
    if (!form || !term || !window.fetch) return;

    var TXT = {
      sq: {
        cmd: "$ nisja dergo --mesazh",
        sending: "→ Duke dërguar mesazhin…",
        ok: "✓ U dërgua! Do t’ju shkruajmë së shpejti.",
        err: "✗ Mesazhi nuk u dërgua. Na shkruani direkt te nisjastudio@gmail.com."
      },
      en: {
        cmd: "$ nisja send --message",
        sending: "→ Sending your message…",
        ok: "✓ Sent! We’ll get back to you soon.",
        err: "✗ The message didn’t go through. Email us directly at nisjastudio@gmail.com."
      }
    };

    function line(text, cls, delay) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          var div = document.createElement("div");
          if (cls) div.className = cls;
          div.textContent = text;
          term.appendChild(div);
          resolve();
        }, reduce ? 0 : delay);
      });
    }

    var openedAt = Date.now();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector('[name="_honey"]').value) return;
      /* nobody types a name, email and message in under 4 seconds: that's a bot, so drop it quietly */
      if (Date.now() - openedAt < 4000) { form.reset(); return; }
      var t = TXT[(window.Nisja && window.Nisja.lang) === "en" ? "en" : "sq"];
      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      term.hidden = false;
      term.textContent = "";

      var request = fetch("https://formsubmit.co/ajax/41e7fb5e547431c7ebd7349e96f94390", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      }).then(function (res) { return res.json().catch(function () { return {}; }).then(function (data) {
        return res.ok && String(data.success) !== "false";
      }); }).catch(function () { return false; });

      line(t.cmd, "dim", 0)
        .then(function () { return line(t.sending, "", 350); })
        .then(function () { return request; })
        .then(function (ok) {
          return line(ok ? t.ok : t.err, ok ? "ok" : "err", 450).then(function () {
            button.disabled = false;
            if (ok) form.reset();
          });
        });
    });
  })();
})();
