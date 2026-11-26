/* Nisja Studio — showcase preview (hero-v2.html): sections taken from the live homepage.
   1. The live hero: dot field, the full stop that turns into an arrow, and the code editor.
      Each site the editor finishes rises out of the "Demo live" folder, marked Live.
   2. "Punë të fundit": the tabbed video player (one clip per site, loaded only on screen).
   3. "Çfarë bëjmë": each service card plays its small demo while it is on screen.
   Everything respects prefers-reduced-motion. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  /* ================= 1a. dot field behind the build section ================= */
  var hero = $("nisja");
  (function dotField() {
    var canvas = hero && hero.querySelector(".hero-field");
    if (!canvas) return;
    var ctx = canvas.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var dots = [], w = 0, h = 0, gap = 30, mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 }, visible = false, raf = null, t = 0;
    function build() {
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (var y = gap / 2; y < h; y += gap) for (var x = gap / 2; x < w; x += gap) dots.push({ x: x, y: y });
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.12; mouse.y += (mouse.ty - mouse.y) * 0.12; t += 0.012;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i], dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.sqrt(dx * dx + dy * dy);
        var force = Math.max(0, 1 - dist / 180), wave = (Math.sin(d.x * 0.012 + t) + Math.cos(d.y * 0.015 + t * 0.8)) * 0.5;
        var px = d.x + (dist > 0 ? dx / dist : 0) * force * 18, py = d.y + (dist > 0 ? dy / dist : 0) * force * 18;
        ctx.fillStyle = force > 0.02
          ? "rgba(255," + Math.round(107 + (1 - force) * 80) + "," + Math.round(44 + (1 - force) * 120) + "," + (0.25 + force * 0.75) + ")"
          : "rgba(245,239,230," + (0.08 + (wave + 1) * 0.04) + ")";
        ctx.beginPath(); ctx.arc(px, py, Math.max(0.6, 1 + force * 1.8 + wave * 0.25), 0, 6.283); ctx.fill();
      }
      raf = visible && !reduce ? requestAnimationFrame(draw) : null;
    }
    build(); draw();
    window.addEventListener("resize", function () { build(); if (!raf) draw(); });
    if (reduce) return;
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect(); mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
      if (mouse.x < -999) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    });
    hero.addEventListener("pointerleave", function () { mouse.tx = -9999; mouse.ty = -9999; });
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible && !raf) draw(); }).observe(hero);
  })();

  /* ================= 1b. the full stop turns into an arrow that runs into the editor ================= */
  var trail = (function () {
    var title = hero && hero.querySelector(".hero-title"), inner = hero && hero.querySelector(".hero-inner");
    var sub = hero && hero.querySelector(".hero-sub"), actions = hero && hero.querySelector(".hero-actions");
    var editor = hero && hero.querySelector("[data-trail-target]");
    if (!title || !inner || !editor) return { run: function (cb) { cb && cb(); }, refresh: function () {} };
    var svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "hero-trail"); svg.setAttribute("aria-hidden", "true");
    var line = document.createElementNS(NS, "path"); line.setAttribute("class", "trail-line"); line.setAttribute("pathLength", "1");
    var head = document.createElementNS(NS, "path"); head.setAttribute("class", "trail-head");
    svg.appendChild(line); svg.appendChild(head); inner.insertBefore(svg, inner.firstChild);
    var dot = null, drawn = false;
    function wrapDot() {
      var text = title.textContent.trim(); if (text.slice(-1) !== ".") return null;
      title.setAttribute("aria-label", text);
      title.innerHTML = ""; title.appendChild(document.createTextNode(text.slice(0, -1)));
      var d = document.createElement("span"); d.className = "hero-dot"; d.setAttribute("aria-hidden", "true"); d.textContent = "."; title.appendChild(d);
      return d;
    }
    function rounded(pts, r) {
      var d = "M" + pts[0][0] + " " + pts[0][1];
      for (var i = 1; i < pts.length - 1; i++) {
        var p = pts[i], a = pts[i - 1], b = pts[i + 1], la = Math.hypot(p[0] - a[0], p[1] - a[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]), rr = Math.min(r, la / 2, lb / 2);
        var p1 = [p[0] + (a[0] - p[0]) / la * rr, p[1] + (a[1] - p[1]) / la * rr], p2 = [p[0] + (b[0] - p[0]) / lb * rr, p[1] + (b[1] - p[1]) / lb * rr];
        d += " L" + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " Q" + p[0] + " " + p[1] + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
      }
      var last = pts[pts.length - 1]; return d + " L" + last[0] + " " + last[1];
    }
    function geometry() {
      var o = inner.getBoundingClientRect();
      var rel = function (r) { return { l: r.left - o.left, t: r.top - o.top, r: r.right - o.left, b: r.bottom - o.top, w: r.width, h: r.height }; };
      var d = rel(dot.getBoundingClientRect()), h1 = rel(title.getBoundingClientRect()), sb = rel(sub.getBoundingClientRect()), ed = rel(editor.getBoundingClientRect());
      var fs = parseFloat(getComputedStyle(title).fontSize) || 80;
      var x0 = Math.round(d.l + d.w * 0.5), y0 = Math.round(d.t + d.h * 0.74), lane = Math.round((h1.b + fs * 0.1 + sb.t + 6) / 2);
      if (ed.l > h1.l + h1.w * 0.6) {
        var right = Math.max(d.r, sb.r), xm = Math.round(right + (ed.l - right) * 0.55), ye = Math.round(Math.min(ed.t + 110, ed.b - 60));
        return [[x0, y0], [x0, lane], [xm, lane], [xm, ye], [Math.round(ed.l - 16), ye]];
      }
      var act = rel(actions.getBoundingClientRect()), actRight = act.l, subRight = sb.l;
      Array.prototype.forEach.call(actions.children, function (c) { actRight = Math.max(actRight, rel(c.getBoundingClientRect()).r); });
      var rg = document.createRange(); rg.selectNodeContents(sub); Array.prototype.forEach.call(rg.getClientRects(), function (r) { subRight = Math.max(subRight, r.right - o.left); });
      var textRight = Math.max(d.r, subRight, actRight);
      if (textRight + 40 < ed.r - 40) {
        var xd = Math.round(Math.min(ed.r - 48, textRight + (ed.r - textRight) / 2));
        return [[x0, y0], [x0, lane], [xd, lane], [xd, Math.round(ed.t - 14)]];
      }
      var xr = Math.round(Math.min(inner.clientWidth - 8, Math.max(textRight, ed.r) + 10)), yg = Math.round(act.b + 22), xk = Math.round(ed.r - 52);
      return [[x0, y0], [x0, lane], [xr, lane], [xr, yg], [xk, yg], [xk, Math.round(ed.t - 14)]];
    }
    function place() {
      var pts = geometry(), a = pts[pts.length - 2], b = pts[pts.length - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), s = 13;
      line.setAttribute("d", rounded(pts, 22));
      head.setAttribute("d", "M" + (b[0] - s * Math.cos(ang - 0.75)).toFixed(1) + " " + (b[1] - s * Math.sin(ang - 0.75)).toFixed(1) + " L" + b[0] + " " + b[1] + " L" + (b[0] - s * Math.cos(ang + 0.75)).toFixed(1) + " " + (b[1] - s * Math.sin(ang + 0.75)).toFixed(1));
    }
    return {
      run: function (done) {
        dot = wrapDot(); if (!dot) { done(); return; }
        place(); drawn = true;
        if (reduce) { line.classList.add("is-static"); head.classList.add("is-in"); dot.classList.add("is-gone"); done(); return; }
        line.getBoundingClientRect();
        requestAnimationFrame(function () { dot.classList.add("is-gone"); line.classList.add("is-drawing"); });
        setTimeout(function () { head.classList.add("is-in"); done(); }, 1900);
      },
      refresh: function () { if (drawn && dot) place(); }
    };
  })();
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(trail.refresh, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { trail.refresh(); });

  /* ================= 1c. the editor types a site; when it's done, that card rises out of the folder ================= */
  (function () {
    var codeEl = $("code"), scroller = $("editor-code"), fileEl = $("bf-file"), stateEl = $("bf-state"), folder = $("fd-demo");
    if (!codeEl || !folder) return;
    var SITES = [
      { id: "kaliber", file: "kaliber/index.html", name: "Kalibër Motors", color: "#0E4A36", title: "Makina që kanë kaluar 160 kontrolle.", button: "Rezervo test drive",
        list: "stoku", items: [["Porsche 911 Carrera S", "€118 900"], ["BMW M5 Competition", "€84 900"], ["Audi RS6 Avant", "€58 500"]] },
      { id: "kroni", file: "kroni/index.html", name: "Vila Kroni", color: "#3F4A2E", title: "Dasma juaj, mes vreshtave.", button: "Gjej datën tonë",
        list: "hapesirat", items: [["Kopshti i ullinjve", "250 veta"], ["Salla e gurit", "400 veta"], ["Terraca", "120 veta"]] },
      { id: "fener", file: "fener/index.html", name: "Fener", color: "#E3A857", title: "Ndriço natën.", button: "Zgjidh tavolinën",
        list: "kokteje", items: [["Fener", "€7"], ["Qershia e Prizrenit", "€8"], ["Bjeshka e Zezë", "€7.5"]] },
      { id: "embel", file: "embel/index.html", name: "Ëmbël", color: "#B81D4A", title: "Ju e vizatoni tortën. Ne e pjekim.", button: "Ndërto tortën",
        list: "vitrina", items: [["Kroasant me fistëk", "€2.2"], ["Tiramisu në gotë", "€3.5"], ["Makarona, 6 copë", "€6"]] },
      { id: "lisi", file: "lisi/index.html", name: "Lisi", color: "#2F4234", title: "Mobilje me masat e shtëpisë suaj.", button: "Provo në dhomën tënde",
        list: "koleksioni", items: [["Divani Drini", "€1 290"], ["Tryeza Lisi, me masë", "€718"], ["Kolltuku Era", "€420"]] },
      { id: "udha", file: "udha/index.html", name: "Udha Rent a Car", color: "#F5B700", title: "Makina ju pret kur zbrisni nga avioni.", button: "Shiko makinat",
        list: "makinat", items: [["VW Polo", "nga €24/ditë"], ["Škoda Octavia", "nga €39/ditë"], ["VW Tiguan", "nga €45/ditë"]] }
    ];
    function linesFor(p) {
      return [
        { t: "<!-- faqja e re për " + p.name + " -->" },
        { t: '<nav class="nav">' },
        { t: '  <a class="logo">' + p.name + "</a>" },
        { t: "</nav>" },
        { t: '<section class="hero" style="--c:' + p.color + '">' },
        { t: "  <h1>" + p.title + "</h1>" },
        { t: '  <a class="btn">' + p.button + "</a>" },
        { t: "</section>" },
        { t: '<ul class="' + p.list + '">' },
        { t: "  <li>" + p.items[0][0] + " <b>" + p.items[0][1] + "</b></li>" },
        { t: "  <li>" + p.items[1][0] + " <b>" + p.items[1][1] + "</b></li>" },
        { t: "  <li>" + p.items[2][0] + " <b>" + p.items[2][1] + "</b></li>" },
        { t: "</ul>" },
        { t: "<!-- gati, në dosje -->", live: true }
      ];
    }
    function tokenize(line) {
      if (/^\s*<!--/.test(line)) return [{ s: line, c: "tk-com" }];
      var out = [], re = /(<\/?[a-z0-9]+)|(\s[a-z-]+=)|("[^"]*")|(>)|([^<>"]+)/gi, m;
      while ((m = re.exec(line)) !== null) {
        if (m[1]) out.push({ s: m[1], c: "tk-tag" }); else if (m[2]) out.push({ s: m[2], c: "tk-attr" }); else if (m[3]) out.push({ s: m[3], c: "tk-str" });
        else if (m[4]) out.push({ s: m[4], c: "tk-tag" }); else if (m[5]) out.push({ s: m[5], c: "" });
        if (re.lastIndex === m.index) re.lastIndex++;
      }
      return out;
    }
    function tok(el, cls) { var s = document.createElement("span"); if (cls) s.className = cls; el.appendChild(s); return s; }
    function cardFor(id) { return folder.querySelector('.fd-card[data-demo="' + id + '"]'); }
    function live(p, on) {
      var c = cardFor(p.id); if (!c) return;
      c.classList.toggle("is-live", on);
      stateEl.textContent = on ? "Live ✓" : "";
      stateEl.classList.toggle("is-live", on);
    }

    if (reduce) {   // one finished build, no typing
      var p0 = SITES[0]; fileEl.textContent = p0.file;
      linesFor(p0).forEach(function (l) { tokenize(l.t).forEach(function (tk) { tok(codeEl, tk.c).textContent = tk.s; }); codeEl.appendChild(document.createTextNode("\n")); });
      trail.run(function () {}); live(p0, true);
      return;
    }

    var running = true, visible = false, timer = null, st = null, started = false;
    function later(fn, ms) { clearTimeout(timer); timer = setTimeout(fn, ms); }
    function start(i) {
      var p = SITES[i % SITES.length];
      if (st && st.p) live(st.p, false);
      codeEl.textContent = ""; scroller.scrollTop = 0; fileEl.textContent = p.file;
      st = { i: i, p: p, lines: linesFor(p), line: 0, token: 0, ch: 0, tokens: null, lineEl: null, span: null };
      later(step, 500);
    }
    function step() {
      if (!running || !visible) return;
      var s = st;
      if (s.line >= s.lines.length) { later(function () { start(s.i + 1); }, 3200); return; }
      if (!s.tokens) { s.tokens = tokenize(s.lines[s.line].t); s.token = 0; s.ch = 0; s.lineEl = document.createElement("span"); codeEl.appendChild(s.lineEl); s.span = null; }
      var tk = s.tokens[s.token];
      if (!tk) {
        codeEl.appendChild(document.createTextNode("\n"));
        if (s.lines[s.line].live) live(s.p, true);
        s.line++; s.tokens = null; scroller.scrollTop = scroller.scrollHeight;
        later(step, 120); return;
      }
      if (!s.span) s.span = tok(s.lineEl, tk.c);
      var n = Math.random() < 0.3 ? 2 : 1;
      s.span.textContent += tk.s.substr(s.ch, n); s.ch += n;
      if (s.ch >= tk.s.length) { s.token++; s.ch = 0; s.span = null; }
      scroller.scrollTop = scroller.scrollHeight;
      later(step, 16 + Math.random() * 30);
    }
    function resume() { if (running && visible && st) step(); }
    document.addEventListener("visibilitychange", function () { running = !document.hidden; if (running) resume(); });
    // the arrow draws the first time the section is well on screen; typing starts when it reaches the editor
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !started) { started = true; trail.run(function () { start(0); }); }
      else if (visible) resume();
    }, { threshold: 0.35 }).observe(hero);
  })();

  /* ================= 2. "Punë të fundit": tabbed video player ================= */
  (function () {
    var root = $("reel"); if (!root) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll(".reel-tab"));
    var video = $("reelVideo"), url = $("reelUrl"), prog = $("reelProg"), screen = $("reelScreen");
    var current = 0, visible = false, touched = false;
    if (reduce) video.setAttribute("controls", "");
    function load(i, play) {
      var slug = tabs[i].getAttribute("data-slug");
      if (!visible) return;
      video.poster = "assets/work/reel/" + slug + ".jpg";
      if (video.getAttribute("src") !== "assets/work/reel/" + slug + ".mp4") video.src = "assets/work/reel/" + slug + ".mp4";
      if (play && !reduce) { var pr = video.play(); if (pr && pr.catch) pr.catch(function () {}); }
    }
    function select(i, opts) {
      opts = opts || {};
      current = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) {
        var on = k === current;
        t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1;
        $(t.getAttribute("aria-controls")).hidden = !on;
      });
      url.textContent = "/work/" + tabs[current].getAttribute("data-slug");
      prog.style.transform = "scaleX(0)";
      if (opts.focus) tabs[current].focus();
      if (opts.user) touched = true;
      load(current, true);
    }
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { select(k, { user: true }); });
      t.addEventListener("keydown", function (e) {
        var to = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (to === undefined) return; e.preventDefault(); select(to, { user: true, focus: true });
      });
    });
    var x0 = null;
    screen.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    screen.addEventListener("touchend", function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) select(current + (dx < 0 ? 1 : -1), { user: true });
    });
    video.addEventListener("ended", function () { if (touched) { video.currentTime = 0; video.play(); } else select(current + 1); });
    video.addEventListener("timeupdate", function () { if (video.duration) prog.style.transform = "scaleX(" + (video.currentTime / video.duration).toFixed(3) + ")"; });
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) load(current, true); else if (!video.paused) video.pause();
    }, { rootMargin: "150px 0px" }).observe(root);
  })();

  /* ================= 3. "Çfarë bëjmë": each card plays its demo while it's on screen ================= */
  (function () {
    var cards = document.querySelectorAll(".sv-card");
    if (!cards.length) return;
    function count(el) {
      if (!el) return;
      if (reduce) { el.textContent = "98"; return; }
      var t0 = performance.now();
      (function f(n) { var k = Math.min(1, Math.max(0, (n - t0 - 500) / 1600)); el.textContent = Math.round(98 * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var sc = e.target.querySelector(".scene");
        if (e.isIntersecting && !sc.classList.contains("on")) { sc.classList.add("on"); count(sc.querySelector("#swNum")); }
        else if (!e.isIntersecting && sc.classList.contains("on")) sc.classList.remove("on");   // replays next time it slides in
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(cards, function (c) { io.observe(c); });
  })();
})();
