/* Nisja Studio — hero preview v2: "the rebuild"
   Timeline (loops until the visitor touches it):
     old site → a dashed scanner turns it into a blueprint → the modern site
     follows behind the orange cut → hold → the cut settles in the middle so
     visitors can drag it and compare. The small editor types the real changes
     as a diff, in step with the scanner.
   Pauses when the hero is off-screen or the tab is hidden. */
(function () {
  "use strict";

  var view = document.getElementById("rb-view");
  if (!view) return;
  var handle = document.getElementById("rb-handle");
  var stateEl = document.getElementById("rb-state");
  var diffEl = document.getElementById("rb-diff");
  var code = diffEl.parentNode;
  var hint = document.getElementById("rb-hint");
  var tagNew = view.querySelector(".rb-tag-new");
  var tagOld = view.querySelector(".rb-tag-old");

  var BAND = 9;          // width of the blueprint strip between new and old while comparing (%)
  var REST = 56;         // where the cut settles for comparing (%)
  var DIFF = [
    { at: -1, t: "/* trattoria-rosa.com */", c: "d-com" },
    { at: 10, t: '- font: "Times New Roman";', c: "d-del" },
    { at: 16, t: '+ font: "Bricolage Grotesque";', c: "d-add" },
    { at: 36, t: "- <marquee>OFERTË!!!</marquee>", c: "d-del" },
    { at: 42, t: '+ <a class="btn">Rezervo</a>', c: "d-add" },
    { at: 62, t: "- foto.jpg   (e turbullt)", c: "d-del" },
    { at: 68, t: "+ foto.webp  (e qartë, 41 KB)", c: "d-add" },
    { at: 88, t: "- tel: 044 000 000", c: "d-del" },
    { at: 93, t: "+ rezervo online, 24/7", c: "d-add" },
    { at: 100, t: "✓ gati për telefon", c: "d-ok" }
  ];
  var CPS = 70;          // typing speed, characters per second

  var clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)); };
  var inout = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var seg = function (t, a, d) { return clamp((t - a) / d, 0, 1); };

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
  var rows = [];
  function resetDiff() {
    diffEl.textContent = "";
    rows = DIFF.map(function (d) { return { d: d, el: null, start: 0, done: false }; });
  }
  function typeDiff(w, now, all) {
    var caretOn = null;
    rows.forEach(function (row) {
      if (!row.el && (all || w >= row.d.at)) {
        row.el = document.createElement("span");
        row.el.className = row.d.c;
        diffEl.appendChild(row.el);
        row.start = now;
      }
      if (row.el && !row.done) {
        var k = all ? row.d.t.length : Math.floor((now - row.start) / 1000 * CPS);
        row.el.textContent = row.d.t.slice(0, k);
        if (k >= row.d.t.length) row.done = true; else caretOn = row.el;
      }
    });
    Array.prototype.forEach.call(diffEl.children, function (el) { el.classList.toggle("d-caret", el === caretOn); });
    diffEl.scrollTop = diffEl.scrollHeight;
  }

  /* ---------- autoplay ---------- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var manual = false, visible = true, raf = 0, t = 0, last = 0, ready = false;
  var LOOP = 14.6;

  function frame(now) {
    raf = 0;
    if (manual || !visible || document.hidden) { last = 0; return; }
    if (last) t += Math.min(0.05, (now - last) / 1000);
    last = now;
    if (t >= LOOP) { t = 0; resetDiff(); view.classList.remove("is-ready", "is-pulsing"); }

    var n, w;
    if (t < 1.3) { n = 0; w = 0; }                                   // the old site, as it is
    else if (t < 5.4) {                                               // scan + rebuild
      w = inout(seg(t, 1.3, 3.2)) * 100;
      n = inout(seg(t, 1.95, 3.45)) * 100;
    } else if (t < 6.2) { n = 100; w = 100; }                         // done
    else if (t < 13.6) {                                              // settle in the middle to compare
      n = 100 - (100 - REST) * inout(seg(t, 6.2, 1.1));
      w = Math.min(100, n + BAND * inout(seg(t, 6.2, 1.1)));
    } else {                                                          // back to 2009 for the next run
      n = REST * (1 - inout(seg(t, 13.6, .9)));
      w = Math.min(100, n + BAND * (1 - inout(seg(t, 13.6, .9))));
    }
    view.classList.toggle("is-start", n < .2 && t < 6);
    view.classList.toggle("is-idle", t < 1.3 || t >= 5.4);
    if (t >= 6.2 && t < 13.6 && !ready) { ready = true; view.classList.add("is-ready", "is-pulsing"); hint.classList.add("is-in"); }
    if (t >= 13.6 && ready) { ready = false; view.classList.remove("is-ready", "is-pulsing"); }
    set(n, w);
    typeDiff(w, now, false);
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && !manual) raf = requestAnimationFrame(frame); }

  /* ---------- the visitor takes over ---------- */
  function takeOver() {
    if (manual) return;
    manual = true;
    if (raf) cancelAnimationFrame(raf), raf = 0;
    view.classList.remove("is-start", "is-pulsing");
    view.classList.add("is-ready", "is-idle");
    hint.classList.add("is-in");
    typeDiff(100, performance.now(), true);
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
    var cur = parseFloat(handle.getAttribute("aria-valuenow")) || 0, step = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") step = 4;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") step = -4;
    else if (e.key === "PageUp") step = 20;
    else if (e.key === "PageDown") step = -20;
    else if (e.key === "Home") step = -100;
    else if (e.key === "End") step = 100;
    else return;
    e.preventDefault(); takeOver(); setManual(cur + step);
  });
  handle.addEventListener("focus", function () { takeOver(); });

  /* ---------- start ---------- */
  resetDiff();
  if (reduced) {
    manual = true;
    view.classList.add("is-ready", "is-idle");
    hint.classList.add("is-in");
    typeDiff(100, 0, true);
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
