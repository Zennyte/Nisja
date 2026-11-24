/* Nisja Studio — hero "live build"
   Code types into the editor line by line; each finished line makes its
   part of the website appear in the preview. Loops through a few example
   businesses. Pauses when the hero is off-screen or the tab is hidden.
*/
(function () {
  "use strict";

  var codeEl = document.getElementById("code");
  var scroller = document.getElementById("editor-code");
  var preview = document.getElementById("preview");
  if (!codeEl || !preview) return;

  var urlEl = document.getElementById("pv-url");
  var liveEl = document.getElementById("pv-live");
  var logoEl = document.getElementById("pv-logo");
  var titleEl = document.getElementById("pv-title");
  var btnEl = document.getElementById("pv-btn");
  var cards = preview.querySelectorAll(".pv-card");
  var parts = {};
  Array.prototype.forEach.call(preview.querySelectorAll("[data-pv]"), function (el) {
    parts[el.getAttribute("data-pv")] = el;
  });

  var PROJECTS = [
    {
      name: "Bella Pizza", url: "bellapizza.com", color: "#E4572E",
      title: "Pica e vërtetë italiane", button: "Rezervo tavolinë",
      items: [["Margherita", "€6"], ["Diavola", "€8"], ["Quattro", "€9"]],
      list: "menu"
    },
    {
      name: "Barber 21", url: "barber21.com", color: "#B8860B",
      title: "Prerje që flasin vetë", button: "Rezervo terminin",
      items: [["Prerje", "€8"], ["Mjekra", "€5"], ["Paketa", "€12"]],
      list: "sherbimet"
    },
    {
      name: "Iron Gym", url: "irongym.com", color: "#16A34A",
      title: "Fillo sot, jo nesër", button: "Anëtarësohu",
      items: [["Mujore", "€25"], ["3 muaj", "€65"], ["Vjetore", "€220"]],
      list: "planet"
    }
  ];

  function linesFor(p) {
    return [
      { t: "<!-- faqja e re për " + p.name + " -->" },
      { t: '<nav class="nav">' },
      { t: '  <a class="logo">' + p.name + "</a>", show: "nav" },
      { t: "</nav>" },
      { t: '<section class="hero" style="--c:' + p.color + '">' },
      { t: "  <h1>" + p.title + "</h1>", show: "title" },
      { t: '  <a class="btn">' + p.button + "</a>", show: "btn" },
      { t: "</section>" },
      { t: '<ul class="' + p.list + '">' },
      { t: "  <li>" + p.items[0][0] + " <b>" + p.items[0][1] + "</b></li>", show: "card1" },
      { t: "  <li>" + p.items[1][0] + " <b>" + p.items[1][1] + "</b></li>", show: "card2" },
      { t: "  <li>" + p.items[2][0] + " <b>" + p.items[2][1] + "</b></li>", show: "card3" },
      { t: "</ul>" },
      { t: "<!-- gati për publikim -->", show: "live" }
    ];
  }

  // Split a line into coloured tokens.
  function tokenize(line) {
    if (/^\s*<!--/.test(line)) return [{ s: line, c: "tk-com" }];
    var out = [];
    var re = /(<\/?[a-z0-9]+)|(\s[a-z-]+=)|("[^"]*")|(>)|([^<>"]+)/gi;
    var m;
    while ((m = re.exec(line)) !== null) {
      if (m[1]) out.push({ s: m[1], c: "tk-tag" });
      else if (m[2]) out.push({ s: m[2], c: "tk-attr" });
      else if (m[3]) out.push({ s: m[3], c: "tk-str" });
      else if (m[4]) out.push({ s: m[4], c: "tk-tag" });
      else if (m[5]) out.push({ s: m[5], c: "" });
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    return out;
  }

  function fill(p) {
    preview.style.setProperty("--pc", p.color);
    urlEl.textContent = p.url;
    logoEl.textContent = p.name;
    titleEl.textContent = p.title;
    btnEl.textContent = p.button;
    Array.prototype.forEach.call(cards, function (card, i) {
      card.querySelector(".pv-name").textContent = p.items[i][0];
      card.querySelector(".pv-price").textContent = p.items[i][1];
    });
  }

  function show(key) {
    if (key === "live") { liveEl.classList.add("is-live"); liveEl.textContent = "Live ✓"; return; }
    if (parts[key]) parts[key].classList.add("is-in");
  }

  function resetPreview() {
    Object.keys(parts).forEach(function (k) { parts[k].classList.remove("is-in"); });
    liveEl.classList.remove("is-live");
    liveEl.textContent = "Live";
  }

  function appendToken(lineEl, cls) {
    var span = document.createElement("span");
    if (cls) span.className = cls;
    lineEl.appendChild(span);
    return span;
  }

  // Reduced motion: show one finished build, no typing.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var p0 = PROJECTS[0];
    fill(p0);
    linesFor(p0).forEach(function (l, i) {
      tokenize(l.t).forEach(function (tk) { appendToken(codeEl, tk.c).textContent = tk.s; });
      codeEl.appendChild(document.createTextNode("\n"));
      if (l.show) show(l.show);
    });
    return;
  }

  var running = true;
  var visible = true;
  var timer = null;
  var state = null;

  function schedule(fn, ms) { timer = setTimeout(fn, ms); }

  function startProject(index) {
    var p = PROJECTS[index % PROJECTS.length];
    codeEl.textContent = "";
    scroller.scrollTop = 0;
    resetPreview();
    fill(p);
    state = { index: index, lines: linesFor(p), line: 0, token: 0, char: 0, tokens: null, lineEl: null, span: null };
    schedule(step, 500);
  }

  function step() {
    if (!running || !visible) return; // resumed by the visibility handlers
    var s = state;
    if (s.line >= s.lines.length) {
      schedule(function () { startProject(s.index + 1); }, 2800);
      return;
    }
    if (!s.tokens) {
      s.tokens = tokenize(s.lines[s.line].t);
      s.token = 0; s.char = 0;
      s.lineEl = document.createElement("span");
      codeEl.appendChild(s.lineEl);
      s.span = null;
    }
    var tk = s.tokens[s.token];
    if (!tk) {
      // line finished
      codeEl.appendChild(document.createTextNode("\n"));
      var key = s.lines[s.line].show;
      if (key) show(key);
      s.line++; s.tokens = null;
      scroller.scrollTop = scroller.scrollHeight;
      schedule(step, key ? 260 : 120);
      return;
    }
    if (!s.span) s.span = appendToken(s.lineEl, tk.c);
    // type 1–2 characters per tick for a natural rhythm
    var n = Math.random() < 0.3 ? 2 : 1;
    s.span.textContent += tk.s.substr(s.char, n);
    s.char += n;
    if (s.char >= tk.s.length) { s.token++; s.char = 0; s.span = null; }
    scroller.scrollTop = scroller.scrollHeight;
    schedule(step, 18 + Math.random() * 34);
  }

  function resume() {
    if (running && visible && state) { clearTimeout(timer); step(); }
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) resume();
    }, { threshold: 0.1 }).observe(preview.parentNode);
  }
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) resume();
  });

  // Start typing when the headline's arrow reaches the editor (fallback timer just in case).
  var started = false;
  function begin() { if (started) return; started = true; startProject(0); }
  window.addEventListener("nisja:arrow", begin);
  setTimeout(begin, 9000);
})();
