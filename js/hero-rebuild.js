/* Nisja Studio — hero preview v2: "the rebuild"
   For each business: the old site → a dashed scanner turns it into a
   blueprint → the modern site follows behind the orange cut → the cut
   settles in the middle so visitors can compare → about 12 seconds after
   the rebuilt site first shows, it moves on to the next business.
   The small editor types the real changes as a diff, in step with the scan.
   Dragging (or the keyboard) hands control to the visitor; the tabs switch
   business. Pauses when the hero is off-screen or the tab is hidden. */
(function () {
  "use strict";

  var view = document.getElementById("rb-view");
  if (!view) return;
  var $ = function (id) { return document.getElementById(id); };
  var oldEl = $("rb-old"), wireEl = $("rb-wire"), newEl = $("rb-new");
  var handle = $("rb-handle"), stateEl = $("rb-state"), urlEl = $("rb-url");
  var diffEl = $("rb-diff"), code = diffEl.parentNode, hint = $("rb-hint");
  var tagNew = view.querySelector(".rb-tag-new"), tagOld = view.querySelector(".rb-tag-old");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".rb-tab"));
  var IMG = "assets/hero-rebuild/";

  var BIZ = [
    {
      id: "prush", url: "nisjastudio.com/work/prush",
      old: {
        head: "~*~ RESTORANT PRUSH ~*~", sub: "Mirë se vini në faqen tonë zyrtare!!!",
        nav: ["Kryefaqja", "Menyja", "Galeria", "Kontakti"],
        marq: "*** OFERTË SPECIALE!!! Mish në skarë 2 me 1 çdo të martë!!! *** Na telefononi!!! ***",
        big: "Ushqim i shijshëm!!!", text: "Ejani na vizitoni. Kemi mish, peshk dhe shumë gjëra tjera.",
        red: "Për rezervime na telefononi:<br>044 000 000", small: "Hapur: 10:00 - 23:00 (të dielën ndoshta)",
        caption: "foto e lokalit",
        boxes: [["", "MENYJA<br><small>(PDF, 8 MB)</small>"], ["o-build", "FAQJA NË<br>NDËRTIM"], ["", "Vizitorë:<br><b class=\"o-count\">001287</b>"]],
        foot: "Shikohet më mirë me Internet Explorer 6 · © 2009"
      },
      wire: { h1: "h1 · Bodoni 600", btn: "btn · rezervo" },
      neu: {
        logo: "Prush", links: ["Menyja", "Rreth nesh", "Kontakt"], open: "Hapur tani · deri në 23:00",
        h1: "Gatuar në prush druri.", p: "Mish, peshk dhe perime të pjekura ngadalë. Rezervoni tavolinën për 30 sekonda.",
        btns: ["Rezervo tavolinë", "Shiko menynë"], toast: ["✓ U rezervua", "Sot · 20:00 · 4 persona"],
        cards: [["t-burrata", "Burrata", "€8.00"], ["t-pasta", "Tagliatelle", "€11.00"], ["t-fondant", "Fondant", "€5.00"]]
      },
      diff: ["/* prush · rindërtimi */", '- font: "Times New Roman";', '+ font: "Bodoni Moda";', "- <marquee>OFERTË!!!</marquee>", '+ <a class="btn">Rezervo</a>',
             "- foto.jpg   (e turbullt)", "+ foto.webp  (e qartë, 25 KB)", "- tel: 044 000 000", "+ rezervo online, 24/7", "✓ gati për telefon"]
    },
    {
      id: "brisk", url: "nisjastudio.com/work/brisk",
      old: {
        head: "»» BRISK BARBER ««", sub: "Prerje për meshkuj — eja kur të duash!!!",
        nav: ["Ballina", "Çmimet", "Fotot", "Na gjeni"],
        marq: "!!! PRERJE + MJEKËR VETËM 7€ !!! NUK PRANOJMË REZERVIME, EJANI DREJTPËRDREJT !!!",
        big: "STILI YT!!!", text: "Berberi më i mirë në qytet. Pyetni për çmimet në lokal.",
        red: "Na thirrni:<br>049 000 000", small: "Hapur: kur jemi aty :)",
        caption: "foto nga 2011",
        boxes: [["", "ÇMIMET<br><small>(foto e tabelës)</small>"], ["o-neon", "LIBRI I<br>MYSAFIRËVE"], ["", "Vizitorë:<br><b class=\"o-count\">000412</b>"]],
        foot: "Rezolucioni më i mirë: 800×600 · © 2011"
      },
      wire: { h1: "h1 · Anton", btn: "btn · rezervo termin" },
      neu: {
        logo: "Brisk", links: ["Shërbimet", "Berberët", "Orari"], open: "3 karrige të lira tani",
        h1: "Prerje pa pritje.", p: "Zgjidhni berberin dhe orën online. Pa radhë, pa telefonata.",
        btns: ["Rezervo termin", "Çmimet"], toast: ["✓ Termini u ruajt", "Sot · 17:30 · prerje + mjekër"],
        cards: [["t-clippers", "Prerje", "€8"], ["t-scissors", "Prerje + mjekër", "€12"], ["t-chair", "Mjekër", "€5"]]
      },
      diff: ["/* brisk · rindërtimi */", "- color: #39FF14 on #000;", '+ font: "Anton"; color: #B3202A;', '- "pyetni për çmimet"', "+ çmimet e qarta online",
             '- "ejani drejtpërdrejt"', "+ rezervo te berberi yt", "- hapur: kur jemi aty", "+ orari live: 3 karrige të lira", "✓ gati për telefon"]
    },
    {
      id: "udha", url: "nisjastudio.com/work/udha",
      old: {
        head: "RENT A CAR UDHA", sub: "Makina me qira — çmime të lira!!!",
        nav: ["Home", "Makinat", "Çmimet", "Kontakt"],
        marq: "+++ MAKINA PËR DIASPORËN!!! Rezervimet vetëm me telefon ose Facebook +++",
        big: "MAKINA TË REJA!!!", text: "Kemi Golf, Passat dhe shumë makina tjera. Çmimet sipas marrëveshjes.",
        red: "Thirrni ose shkruani në Viber:<br>045 000 000", small: "Ofertat nuk vlejnë në gusht",
        caption: "makina jonë",
        boxes: [["", "FLOTA<br><small>(galeria, 12 MB)</small>"], ["o-flash", "▶ FLASH<br>INTRO"], ["", "Vizitorë:<br><b class=\"o-count\">003105</b>"]],
        foot: "Kjo faqe kërkon Flash Player · © 2010"
      },
      wire: { h1: "h1 · Barlow 700", btn: "btn · gjej makinën" },
      neu: {
        logo: "Udha", links: ["Makinat", "Si funksionon", "Kontakt"], open: "4 nga 6 makina të lira",
        h1: "Makina ju pret kur zbrisni.", p: "Zgjidhni datat, shihni vetëm makinat e lira dhe çmimin e plotë.",
        btns: ["Gjej makinën", "Çmimet"], toast: ["✓ Rezervimi u dërgua", "26–29 nëntor · VW Tiguan"],
        cards: [["t-polo", "VW Polo", "€22/ditë"], ["t-golf", "VW Golf", "€28/ditë"], ["t-octavia", "Octavia", "€36/ditë"]]
      },
      diff: ["/* udha · rindërtimi */", '- <embed src="intro.swf">', '+ <img src="tiguan.webp">', '- "çmimet sipas marrëveshjes"', "+ €22/ditë, pa surpriza",
             "- vetëm me telefon ose Viber", "+ makinat e lira sipas datave", "- vetëm shqip", "+ shqip · English · Deutsch", "✓ gati për telefon"]
    }
  ];
  // when each diff line starts typing, as % of the scan
  var DIFF_AT = [-1, 10, 16, 36, 42, 62, 68, 88, 93, 100];

  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };

  function render(b) {
    var o = b.old, n = b.neu;
    oldEl.innerHTML =
      '<div class="o-head"><b>' + esc(o.head) + "</b><u>" + esc(o.sub) + "</u></div>" +
      '<div class="o-nav">' + o.nav.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</div>" +
      '<div class="o-marq"><span>' + esc(o.marq + " " + o.marq) + "</span></div>" +
      '<div class="o-main"><div class="o-photo"><img src="' + IMG + b.id + '-old.jpg" alt="" width="36" height="38"><i>' + esc(o.caption) + "</i></div>" +
      '<div class="o-text"><p class="o-big">' + esc(o.big) + "</p><p>" + esc(o.text) + '</p><p class="o-red">' + o.red + '</p><p class="o-small">' + esc(o.small) + "</p></div></div>" +
      '<div class="o-foot">' + o.boxes.map(function (x) { return '<span class="o-box ' + x[0] + '">' + x[1] + "</span>"; }).join("") + "</div>" +
      '<p class="o-ie">' + esc(o.foot) + "</p>";
    wireEl.innerHTML =
      '<div class="w-box w-nav"><em>nav · logo + rezervo</em></div>' +
      '<div class="w-box w-copy"><em>' + esc(b.wire.h1) + '</em><span class="w-line"></span><span class="w-line w-short"></span><span class="w-btn">' + esc(b.wire.btn) + "</span></div>" +
      '<div class="w-box w-photo"><em>img · 4:5 · webp</em><span class="w-x"></span></div>' +
      '<div class="w-box w-c1"><em>kartë</em></div><div class="w-box w-c2"><em>kartë</em></div><div class="w-box w-c3"><em>kartë</em></div>' +
      '<span class="w-dim w-dim-h">1240 px</span><span class="w-dim w-dim-v">grid 12</span>';
    newEl.innerHTML =
      '<div class="n-nav"><b>' + esc(n.logo) + '</b><span class="n-links">' + n.links.map(function (x) { return "<i>" + esc(x) + "</i>"; }).join("") + '</span><span class="n-pill">Rezervo</span></div>' +
      '<div class="n-copy"><span class="n-open"><i></i>' + esc(n.open) + '</span><p class="n-h1">' + esc(n.h1) + '</p><p class="n-p">' + esc(n.p) + "</p>" +
      '<span class="n-btns"><span class="n-btn">' + esc(n.btns[0]) + '</span><span class="n-btn n-ghost">' + esc(n.btns[1]) + "</span></span></div>" +
      '<div class="n-photo"><img src="' + IMG + b.id + '.webp" alt="" width="560" height="588"><span class="n-toast"><b>' + esc(n.toast[0]) + "</b>" + esc(n.toast[1]) + "</span></div>" +
      '<div class="n-cards">' + n.cards.map(function (c) {
        return '<span class="n-card"><img src="' + IMG + c[0] + '.webp" alt="" width="160" height="160"><span><b>' + esc(c[1]) + "</b><i>" + esc(c[2]) + "</i></span></span>";
      }).join("") + "</div>";
    view.setAttribute("data-biz", b.id);
    urlEl.textContent = b.url;
  }
  function preload(b) {
    [b.id + ".webp", b.id + "-old.jpg"].concat(b.neu.cards.map(function (c) { return c[0] + ".webp"; })).forEach(function (f) { new Image().src = IMG + f; });
  }

  var clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)); };
  var inout = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var seg = function (t, a, d) { return clamp((t - a) / d, 0, 1); };

  var BAND = 9;           // blueprint strip between new and old while comparing (%)
  var REST = 56;          // where the cut settles for comparing (%)
  var SHOWN = 5.4;        // the rebuilt site is fully shown at this second
  var NEXT = SHOWN + 12;  // ...and 12 seconds later we move to the next business
  var CPS = 70;           // typing speed (characters per second)

  /* ---------- drawing ---------- */
  var lastN = -1;
  function set(n, w) {
    view.style.setProperty("--n", n.toFixed(2) + "%");
    view.style.setProperty("--w", w.toFixed(2) + "%");
    code.style.setProperty("--p", w.toFixed(1) + "%");
    tagNew.style.opacity = n > 14 ? 1 : 0;
    tagOld.style.opacity = w < 86 ? 1 : 0;
    var r = Math.round(n);
    if (r !== lastN) {
      lastN = r;
      handle.setAttribute("aria-valuenow", r);
      handle.setAttribute("aria-valuetext", r <= 1 ? "Faqja e vjetër" : r >= 99 ? "Faqja e re" : r + "% e faqes së re");
      stateEl.textContent = r <= 1 ? "2009" : r >= 99 ? "Sot ✓" : "2009 → Sot";
      stateEl.classList.toggle("is-new", r >= 50);
    }
  }

  /* ---------- the diff editor ---------- */
  var bi = 0;
  var cur = function () { return BIZ[bi]; };
  var rows = [];
  function resetDiff() {
    diffEl.textContent = "";
    rows = cur().diff.map(function (t, i) {
      return { t: t, at: DIFF_AT[i], c: t[0] === "-" ? "d-del" : t[0] === "+" ? "d-add" : t[0] === "✓" ? "d-ok" : "d-com", el: null, start: 0, done: false };
    });
  }
  function typeDiff(w, now, all) {
    var caretOn = null;
    rows.forEach(function (row) {
      if (!row.el && (all || w >= row.at)) {
        row.el = document.createElement("span");
        row.el.className = row.c;
        diffEl.appendChild(row.el);
        row.start = now;
      }
      if (row.el && !row.done) {
        var k = all ? row.t.length : Math.floor((now - row.start) / 1000 * CPS);
        row.el.textContent = row.t.slice(0, k);
        if (k >= row.t.length) row.done = true; else caretOn = row.el;
      }
    });
    Array.prototype.forEach.call(diffEl.children, function (el) { el.classList.toggle("d-caret", el === caretOn); });
    diffEl.scrollTop = diffEl.scrollHeight;
  }

  /* ---------- business switching ---------- */
  function choose(i) {
    bi = (i + BIZ.length) % BIZ.length;
    render(cur());
    resetDiff();
    tabs.forEach(function (tab, k) { tab.setAttribute("aria-pressed", k === bi ? "true" : "false"); tab.style.setProperty("--t", "0%"); });
    preload(BIZ[(bi + 1) % BIZ.length]);
  }

  /* ---------- autoplay ---------- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var manual = false, visible = true, raf = 0, t = 0, last = 0, ready = false, switching = false;

  function frame(now) {
    raf = 0;
    if (manual || !visible || document.hidden) { last = 0; return; }
    if (last) t += Math.min(0.05, (now - last) / 1000);
    last = now;

    if (t >= NEXT && !switching) {                      // fade out, swap business, start again
      switching = true;
      view.classList.add("is-switching");
      setTimeout(function () {
        if (manual) { switching = false; view.classList.remove("is-switching"); return; }
        choose(bi + 1); t = 0; ready = false;
        view.classList.remove("is-ready", "is-pulsing");
        view.classList.add("is-start", "is-idle");
        set(0, 0);
        view.classList.remove("is-switching");
        switching = false;
      }, 260);
    }

    if (!switching) {
      var n, w;
      if (t < 1.3) { n = 0; w = 0; }                                  // the old site, as it is
      else if (t < SHOWN) {                                           // scan + rebuild
        w = inout(seg(t, 1.3, 3.2)) * 100;
        n = inout(seg(t, 1.95, SHOWN - 1.95)) * 100;
      } else if (t < SHOWN + .8) { n = 100; w = 100; }                // done
      else {                                                          // settle in the middle to compare
        var k = inout(seg(t, SHOWN + .8, 1.1));
        n = 100 - (100 - REST) * k;
        w = Math.min(100, n + BAND * k);
      }
      view.classList.toggle("is-start", n < .2 && t < SHOWN);
      view.classList.toggle("is-idle", t < 1.3 || t >= SHOWN);
      if (t >= SHOWN + .8 && !ready) { ready = true; view.classList.add("is-ready", "is-pulsing"); hint.classList.add("is-in"); }
      set(n, w);
      typeDiff(w, now, false);
      tabs[bi].style.setProperty("--t", (clamp(t / NEXT, 0, 1) * 100).toFixed(1) + "%");
    }
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && !manual) raf = requestAnimationFrame(frame); }

  /* ---------- the visitor takes over ---------- */
  function showCompare() {
    view.classList.remove("is-start", "is-pulsing", "is-switching");
    view.classList.add("is-ready", "is-idle");
    hint.classList.add("is-in");
    typeDiff(100, performance.now(), true);
    tabs.forEach(function (tab) { tab.style.setProperty("--t", "0%"); });
  }
  function takeOver() {
    if (manual) return;
    manual = true;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    showCompare();
  }
  function setManual(n) {
    n = clamp(n, 0, 100);
    set(n, n >= 100 ? 100 : Math.min(100, n + BAND));
  }
  function fromPointer(e) {
    var r = view.getBoundingClientRect();
    setManual((e.clientX - r.left) / r.width * 100);
  }
  var dragging = false;
  view.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    takeOver(); dragging = true;
    try { view.setPointerCapture(e.pointerId); } catch (err) {}
    fromPointer(e);
  });
  view.addEventListener("pointermove", function (e) { if (dragging) fromPointer(e); });
  var stop = function () { dragging = false; };
  view.addEventListener("pointerup", stop);
  view.addEventListener("pointercancel", stop);
  handle.addEventListener("keydown", function (e) {
    var now = parseFloat(handle.getAttribute("aria-valuenow")) || 0, step = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") step = 4;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") step = -4;
    else if (e.key === "PageUp") step = 20;
    else if (e.key === "PageDown") step = -20;
    else if (e.key === "Home") step = -100;
    else if (e.key === "End") step = 100;
    else return;
    e.preventDefault(); takeOver(); setManual(now + step);
  });
  handle.addEventListener("focus", takeOver);

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      choose(parseInt(tab.getAttribute("data-i"), 10));
      if (manual) { showCompare(); setManual(REST); return; }
      // still playing: watch this business being rebuilt from the start
      t = 0; ready = false; switching = false;
      view.classList.remove("is-ready", "is-pulsing", "is-switching");
      view.classList.add("is-start", "is-idle");
      set(0, 0); kick();
    });
  });

  /* ---------- start ---------- */
  choose(0);
  if (reduced) {
    manual = true;
    showCompare();
    setManual(REST);
    return;
  }
  set(0, 0);
  view.classList.add("is-start", "is-idle");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }, { threshold: 0.15 }).observe(view);
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) kick(); });
  /* wait for the page loader to lift, so the old site is seen before the scan starts */
  if (document.documentElement.classList.contains("is-loading")) window.addEventListener("nisja:ready", function () { setTimeout(kick, 250); }, { once: true });
  else kick();
})();
