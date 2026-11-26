/* Nisja Studio site kit: shared, dependency-free helpers for the portfolio sites.
   i18n, Albanian/English dates, slot engine, booking submit (demo / ?test), .ics, WhatsApp, reveal-on-scroll. */
(function (w) {
  "use strict";
  var K = {};
  var pad = function (n) { return String(n).padStart(2, "0"); };
  K.pad = pad;
  K.$ = function (id) { return document.getElementById(id); };
  K.reduced = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- language ---------- */
  var SQ = {}, EN = {}, listeners = [];
  K.lang = "sq";
  try { K.lang = localStorage.getItem("nx-lang") || "sq"; } catch (e) {}
  K.i18n = function (en) {
    EN = en;
    document.querySelectorAll("[data-i18n],[data-i18n-html],[data-i18n-ph],[data-i18n-aria],[data-i18n-alt]").forEach(function (el) {
      if (el.dataset.i18n) SQ[el.dataset.i18n] = el.textContent;
      if (el.dataset.i18nHtml) SQ[el.dataset.i18nHtml] = el.innerHTML;
      if (el.dataset.i18nPh) SQ[el.dataset.i18nPh] = el.getAttribute("placeholder");
      if (el.dataset.i18nAria) SQ[el.dataset.i18nAria] = el.getAttribute("aria-label");
      if (el.dataset.i18nAlt) SQ[el.dataset.i18nAlt] = el.getAttribute("alt");
    });
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.addEventListener("click", function () { K.setLang(b.dataset.lang); });
    });
    K.setLang(K.lang);
  };
  K.onLang = function (fn) { listeners.push(fn); };
  K.setLang = function (l) {
    K.lang = l; try { localStorage.setItem("nx-lang", l); } catch (e) {}
    var d = l === "en" ? EN : SQ;
    document.documentElement.lang = l;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { var v = d[el.dataset.i18n]; if (v != null) el.textContent = v; });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) { var v = d[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { var v = d[el.dataset.i18nPh]; if (v != null) el.setAttribute("placeholder", v); });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) { var v = d[el.dataset.i18nAria]; if (v != null) el.setAttribute("aria-label", v); });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) { var v = d[el.dataset.i18nAlt]; if (v != null) el.setAttribute("alt", v); });
    document.querySelectorAll("[data-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === l)); });
    listeners.forEach(function (fn) { fn(l); });
  };
  /* pick a string: K.t({sq:"…", en:"…"}) or K.t("sq text", "en text") */
  K.t = function (a, b) { if (typeof a === "object") return a[K.lang] || a.sq; return K.lang === "en" ? b : a; };

  /* ---------- dates ---------- */
  var WD = { sq: ["E diel", "E hënë", "E martë", "E mërkurë", "E enjte", "E premte", "E shtunë"], en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] };
  var WS = { sq: ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"], en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] };
  var MO = { sq: ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"], en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] };
  K.WD = WD; K.WS = WS; K.MO = MO;
  K.day0 = function (d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  K.hm = function (d) { d = new Date(d); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  K.toMin = function (s) { var p = s.split(":"); return +p[0] * 60 + +p[1]; };
  K.dayLabel = function (d, short) {
    d = new Date(d); var l = K.lang, diff = Math.round((K.day0(d) - K.day0(new Date())) / 864e5);
    var rel = diff === 0 ? K.t("Sot", "Today") : diff === 1 ? K.t("Nesër", "Tomorrow") : (short ? WS : WD)[l][d.getDay()];
    return rel + ", " + d.getDate() + " " + (short ? MO[l][d.getMonth()].slice(0, 3) : MO[l][d.getMonth()]);
  };
  K.eur = function (n) { return "€" + (n % 1 ? n.toFixed(2).replace(".", K.lang === "sq" ? "," : ".") : n); };
  K.dur = function (m) { var h = Math.floor(m / 60), r = m % 60; return (h ? h + " " + K.t("orë", "h") + (r ? " " : "") : "") + (r ? r + " min" : ""); };

  /* ---------- slot engine ----------
     opts: { day: Date, hours: [open, close] | null, step: min, duration: min, resources: [{id, hours?: {weekday:[o,c]|null}}],
             busy: [{res, start(ms), end(ms)}], noticeMin }
     returns [{t: ms, label, free: [resourceIds]}] */
  K.slots = function (o) {
    var out = [], day = K.day0(o.day), limit = Date.now() + (o.noticeMin || 60) * 6e4;
    if (!o.hours) return out;
    var open = K.toMin(o.hours[0]), close = K.toMin(o.hours[1]);
    for (var m = open; m + o.duration <= close; m += o.step) {
      var s = new Date(day); s.setHours(Math.floor(m / 60), m % 60, 0, 0);
      var t = s.getTime(), e = t + o.duration * 6e4;
      if (t < limit) continue;
      var free = o.resources.filter(function (r) {
        var rh = r.hours ? r.hours[day.getDay()] : o.hours;
        if (!rh) return false;
        if (m < K.toMin(rh[0]) || m + o.duration > K.toMin(rh[1])) return false;
        return !o.busy.some(function (b) { return b.res === r.id && b.start < e && t < b.end; });
      }).map(function (r) { return r.id; });
      out.push({ t: t, label: K.hm(s), free: free });
    }
    return out;
  };
  /* deterministic fake bookings so demo calendars look lived-in */
  K.demoBusy = function (resIds, days, hours, opts) {
    opts = opts || {}; var seed = opts.seed || 11, out = [];
    var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (var d = 0; d < days; d++) {
      var day = K.day0(new Date()); day.setDate(day.getDate() + d);
      var h = hours(day.getDay()); if (!h) continue;
      var load = (opts.load || .45) * (day.getDay() === 5 || day.getDay() === 6 ? 1.35 : 1);
      resIds.forEach(function (r) {
        for (var m = K.toMin(h[0]); m < K.toMin(h[1]); m += (opts.block || 30)) {
          if (rnd() < load) {
            var s = new Date(day); s.setHours(Math.floor(m / 60), m % 60, 0, 0);
            var len = (opts.block || 30) * (rnd() < .3 ? 2 : 1);
            out.push({ res: r, start: s.getTime(), end: s.getTime() + len * 6e4 }); m += len - (opts.block || 30);
          }
        }
      });
    }
    return out;
  };

  /* ---------- storage ---------- */
  K.saved = function (key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { return []; } };
  K.save = function (key, item) { var l = K.saved(key); l.push(item); try { localStorage.setItem(key, JSON.stringify(l)); } catch (e) {} };

  /* ---------- submit ---------- */
  K.testMode = /[?&]test\b/.test(location.search);
  /* cfg: {demo, endpoint}; returns Promise */
  K.submit = function (cfg, subject, fields) {
    if (cfg.demo && !K.testMode) return Promise.resolve({ demo: true });
    var body = Object.assign({ _subject: subject, _template: "table" }, fields);
    return fetch(cfg.endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error("send"); return { demo: false }; });
  };
  K.code = function (prefix) { return prefix + "-" + String(Math.floor(1000 + Math.random() * 9000)); };
  K.wa = function (number, text) { return "https://wa.me/" + (number || "") + "?text=" + encodeURIComponent(text); };
  K.ics = function (name, events) {
    var st = function (d) { d = new Date(d); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00"; };
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nisja Studio//SQ"];
    events.forEach(function (e, i) { lines.push("BEGIN:VEVENT", "UID:" + name + "-" + i + "@nisjastudio", "DTSTAMP:" + st(new Date()), "DTSTART:" + st(e.start), "DTEND:" + st(e.end), "SUMMARY:" + e.title, "LOCATION:" + (e.where || ""), "END:VEVENT"); });
    lines.push("END:VCALENDAR");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" })); a.download = name + ".ics"; document.body.appendChild(a); a.click(); a.remove();
  };

  /* ---------- accessible names ----------
     Hides the short visible bits of a button from screen readers and adds a full
     description they read instead, e.g. "Sat 28 Nov" -> "Saturday, 28 November, full". */
  K.srText = function (el, text) {
    [].forEach.call(el.children, function (c) { c.setAttribute("aria-hidden", "true"); });
    var s = document.createElement("span"); s.textContent = text;
    s.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;";
    if (!el.isConnected || getComputedStyle(el).position === "static") el.style.position = "relative"; // keeps the hidden text inside scroll areas
    el.appendChild(s); el.removeAttribute("aria-label");
  };

  /* ---------- reveal on scroll ---------- */
  K.reveal = function (sel) {
    var els = document.querySelectorAll(sel || "[data-reveal]");
    if (K.reduced || !("IntersectionObserver" in w)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: .12 });
    els.forEach(function (e) { io.observe(e); });
  };
  K.smooth = function (el) { (typeof el === "string" ? document.querySelector(el) : el).scrollIntoView({ behavior: K.reduced ? "auto" : "smooth", block: "start" }); };

  w.K = K;
})(window);
