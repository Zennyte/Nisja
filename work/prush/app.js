/* broken photos remove themselves (replaces inline onerror, which the security policy blocks) */
function dropBroken(root) {
  root.querySelectorAll("img[data-drop-broken]").forEach(function (im) {
    if (im.complete && !im.naturalWidth) im.remove(); else im.addEventListener("error", function () { im.remove(); });
  });
}
dropBroken(document);
(function () {
  "use strict";
  var D = window.PRUSH, $ = function (id) { return document.getElementById(id); };
  if (/[?&]test\b/.test(location.search)) D.demo = false;
  var EN = {
    "demo": "This is a <b>concept project</b> made by <a href=\"../../\">Nisja Studio</a>. The restaurant doesn't exist.",
    "nav.menu": "Menu", "nav.about": "About", "nav.res": "Book", "nav.visit": "Find us", "nav.cta": "Book a table",
    "hero.place": "Agim Ramadani St, Prishtina", "hero.title": "Cooked over <em>wood</em> embers.", "hero.lead": "Meat, fish and vegetables slow-grilled over beech embers, with cocktails made at the bar. Book your table in a minute.", "hero.cta": "Book a table", "hero.menu": "See the menu",
    "f1.t": "Beech embers, every day", "f1.d": "We light the fire in the morning and cook everything over it.", "f2.t": "The menu with prices, online", "f2.d": "You know what you'll pay before you come.", "f3.t": "Your table, guaranteed", "f3.d": "Your booking is confirmed straight away and the table waits 15 minutes for you.",
    "about.k": "About us", "about.t": "Fire is our first chef.", "about.p1": "There's no gas stove at Prush. Every plate passes over beech embers: meat picks up the smoke, fish stays juicy, vegetables turn sweet.", "about.p2": "The menu is short on purpose. We buy from Kosovo farmers every morning and change dishes with the seasons.", "about.sign": "The Prush team",
    "menu.k": "Menu", "menu.t": "What's on the embers today", "menu.p": "Prices are in euro and include VAT. Tell us about allergies when you book.", "menu.note": "V = vegetarian. For groups over 8 we prepare a set menu.",
    "res.k": "Book", "res.t": "Book your table", "res.s1": "How many people?", "res.big": "More than 8? <a href=\"tel:+38344000000\">Call us</a> for a group table or the private room.", "res.s2": "Which day?", "res.s3": "What time?", "res.s4": "Your details",
    "d.name": "Full name", "d.phone": "Phone or WhatsApp", "d.email": "Email", "opt": "(optional)", "d.occ": "Occasion", "occ.0": "None", "occ.1": "Birthday", "occ.2": "Anniversary", "occ.3": "Business dinner", "occ.4": "Date night", "d.notes": "Allergies or requests", "d.notesP": "E.g. nut allergy, a high chair, a table on the terrace…",
    "res.btn": "Confirm booking", "t.title": "Your booking", "t.party": "Guests", "t.day": "Date", "t.time": "Time", "t.table": "Table",
    "t.n1": "No prepayment, no credit card", "t.n2": "Your table waits 15 minutes past the time", "t.n3": "Cancel or change for free with one message",
    "done.t": "The table is yours.", "done.p": "We've sent your confirmation. See you soon.", "done.code": "booking code", "done.wa": "Send on WhatsApp", "done.ics": "Add to calendar", "done.again": "New booking",
    "done.demo": "This is a demo: the booking was saved only in this browser. Try the same time again to see it fill up.",
    "v.t": "Find us", "v.addr": "Address", "v.park": "Free parking behind the restaurant", "v.hours": "Opening hours", "v.call": "Contact", "v.callD": "For groups, parties and business dinners",
    "foot.c": "concept project", "foot.by": "Website by"
  };
  var TX = {
    sq: { wd: ["Diel", "Hënë", "Martë", "Mërkurë", "Enjte", "Premte", "Shtunë"], wds: ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"], mo: ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"],
      today: "Sot", tomorrow: "Nesër", open: "Hapur tani", closedNow: "Mbyllur tani", until: "deri në {t}", opensAt: "Hapet sot në {t}", opensDay: "Hapet {d} në {t}", closedDay: "Mbyllur",
      lunch: "Dreka", dinner: "Darka", free: "e lirë", few: "tavolina e fundit", full: "plot", noSlots: "Asnjë orë e lirë këtë ditë për {n} veta. Provoni një ditë tjetër.", closed: "Të hënën jemi mbyllur.",
      people: "{n} persona", person: "1 person", tableFor: "Tavolinë për {n}", pick: "Zgjidhni orën",
      eSlot: "Zgjidhni një orë.", eName: "Shkruani emrin dhe mbiemrin.", ePhone: "Shkruani një numër telefoni që t'ju gjejmë nëse vonoheni.", eGone: "Kjo orë sapo u mbush. Zgjidhni një orë tjetër.", eSend: "Rezervimi nuk u dërgua. Provoni përsëri ose na telefononi.", sending: "Duke dërguar…",
      wa: "Përshëndetje! Rezervim te Prush:", ics: "Darkë te Prush", name: "Emri", occ: "Rasti", notes: "Shënime" },
    en: { wd: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], wds: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], mo: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      today: "Today", tomorrow: "Tomorrow", open: "Open now", closedNow: "Closed now", until: "until {t}", opensAt: "Opens today at {t}", opensDay: "Opens {d} at {t}", closedDay: "Closed",
      lunch: "Lunch", dinner: "Dinner", free: "free", few: "last table", full: "full", noSlots: "No free times this day for {n}. Try another day.", closed: "We're closed on Mondays.",
      people: "{n} people", person: "1 person", tableFor: "Table for {n}", pick: "Pick a time",
      eSlot: "Pick a time.", eName: "Enter your full name.", ePhone: "Enter a phone number so we can reach you if you're running late.", eGone: "This time just filled up. Please pick another.", eSend: "The booking didn't go through. Try again or call us.", sending: "Sending…",
      wa: "Hello! Booking at Prush:", ics: "Dinner at Prush", name: "Name", occ: "Occasion", notes: "Notes" }
  };
  var lang = "sq", SQ = {};
  try { lang = localStorage.getItem("prush-lang") || "sq"; } catch (e) {}
  var T = function (k, v) { var s = TX[lang][k]; return v ? s.replace(/\{(\w+)\}/g, function (_, n) { return v[n]; }) : s; };
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var hm = function (d) { return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  var toMin = function (s) { var p = s.split(":"); return +p[0] * 60 + +p[1]; };
  var eur = function (n) { return "€" + (n % 1 ? n.toFixed(2).replace(".", lang === "sq" ? "," : ".") : n); };
  var dayStart = function (d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  function dayLabel(d) {
    var t0 = dayStart(new Date()), diff = Math.round((dayStart(d) - t0) / 864e5);
    var base = lang === "sq" ? d.getDate() + " " + TX.sq.mo[d.getMonth()] : d.getDate() + " " + TX.en.mo[d.getMonth()];
    return (diff === 0 ? T("today") : diff === 1 ? T("tomorrow") : TX[lang].wd[d.getDay()]) + ", " + base;
  }

  /* ---------- language ---------- */
  document.querySelectorAll("[data-i18n],[data-i18n-html],[data-i18n-ph]").forEach(function (el) {
    if (el.dataset.i18n) SQ[el.dataset.i18n] = el.textContent;
    if (el.dataset.i18nHtml) SQ[el.dataset.i18nHtml] = el.innerHTML;
    if (el.dataset.i18nPh) SQ[el.dataset.i18nPh] = el.getAttribute("placeholder");
  });
  function applyLang() {
    var dict = lang === "en" ? EN : SQ;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { if (dict[el.dataset.i18n] != null) el.textContent = dict[el.dataset.i18n]; });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) { if (dict[el.dataset.i18nHtml] != null) el.innerHTML = dict[el.dataset.i18nHtml]; });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { if (dict[el.dataset.i18nPh] != null) el.setAttribute("placeholder", dict[el.dataset.i18nPh]); });
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    renderToday(); renderHours(); renderTabs(); renderMenu(); renderParty(); renderDays(); renderSlots(); renderTicket();
  }
  document.querySelectorAll(".lang button").forEach(function (b) { b.addEventListener("click", function () { lang = b.dataset.lang; try { localStorage.setItem("prush-lang", lang); } catch (e) {} applyLang(); }); });

  /* ---------- open now + hours ---------- */
  function renderToday() {
    var now = new Date(), h = D.hours[now.getDay()], m = now.getHours() * 60 + now.getMinutes(), box = $("today");
    var openNow = h && m >= toMin(h[0]) && m < toMin(h[1] === "24:00" ? "23:59" : h[1]) + (h[1] === "24:00" ? 1 : 0);
    box.classList.toggle("closed", !openNow);
    $("todayState").textContent = openNow ? T("open") : T("closedNow");
    if (openNow) { $("todayHours").textContent = T("until", { t: h[1] === "24:00" ? "00:00" : h[1] }); return; }
    if (h && m < toMin(h[0])) { $("todayHours").textContent = T("opensAt", { t: h[0] }); return; }
    for (var i = 1; i < 8; i++) { var d = new Date(); d.setDate(d.getDate() + i); var hh = D.hours[d.getDay()]; if (hh) { $("todayHours").textContent = T("opensDay", { d: i === 1 ? T("tomorrow").toLowerCase() : TX[lang].wd[d.getDay()], t: hh[0] }); return; } }
  }
  function renderHours() {
    var order = [1, 2, 3, 4, 5, 6, 0], now = new Date().getDay();
    $("hours").innerHTML = order.map(function (w) { var h = D.hours[w]; return '<li class="' + (w === now ? "now" : "") + '"><span>' + TX[lang].wd[w] + "</span><span>" + (h ? h[0] + "–" + (h[1] === "24:00" ? "00:00" : h[1]) : T("closedDay")) + "</span></li>"; }).join("");
  }

  /* ---------- menu ---------- */
  var cat = D.menu[0].id;
  function setPh(src, cap) {
    var ph = $("menuPh"), old = ph.querySelector("img");
    if (old && old.getAttribute("src") === src) { $("menuCap").textContent = cap; return; }
    if (old) old.remove();
    if (src) { var im = new Image(); im.alt = cap; im.loading = "lazy"; im.onerror = function () { im.remove(); }; im.src = src; ph.insertBefore(im, ph.firstChild); }
    $("menuCap").textContent = cap;
  }
  var menuSeen = false;
  function staggerDishes() { var u = $("dishes"); if (!menuSeen) return; u.classList.remove("in"); void u.offsetWidth; u.classList.add("in"); }
  function renderTabs() {
    $("tabs").innerHTML = D.menu.map(function (c) { return '<button type="button" class="tab" role="tab" id="tab-' + c.id + '" aria-selected="' + (c.id === cat) + '" data-cat="' + c.id + '">' + c[lang] + "</button>"; }).join("");
  }
  function renderMenu() {
    var c = D.menu.find(function (x) { return x.id === cat; });
    $("dishPanel").setAttribute("aria-labelledby", "tab-" + c.id);
    $("dishes").innerHTML = c.items.map(function (it, i) {
      return '<li class="dish" data-i="' + i + '" style="--i:' + i + '"><div class="row"><h3>' + it[lang] + (it.veg ? '<span class="veg" title="Vegjetariane">V</span>' : "") + '</h3><span class="lead-dots"></span><span class="price">' + eur(it.price) + "</span></div><p>" + (lang === "sq" ? it.dsq : it.den) + "</p></li>";
    }).join("");
    var match = c.items.find(function (it) { return it.img === c.img; });
    setPh(c.img, match ? match[lang] : c[lang]);
  }
  $("tabs").addEventListener("click", function (e) { var b = e.target.closest(".tab"); if (!b) return; cat = b.dataset.cat; renderTabs(); renderMenu(); $("tab-" + cat).focus(); });
  $("tabs").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var i = D.menu.findIndex(function (c) { return c.id === cat; }); i = (i + (e.key === "ArrowRight" ? 1 : -1) + D.menu.length) % D.menu.length;
    cat = D.menu[i].id; renderTabs(); renderMenu(); $("tab-" + cat).focus(); e.preventDefault();
  });
  $("dishes").addEventListener("mouseover", function (e) {
    var li = e.target.closest(".dish"); if (!li) return;
    var c = D.menu.find(function (x) { return x.id === cat; }), it = c.items[+li.dataset.i];
    if (it.img) setPh(it.img, it[lang]);
  });

  /* ---------- reservation engine ---------- */
  var S = { party: 2, day: null, slot: null };
  function saved() { try { return JSON.parse(localStorage.getItem("prush-bookings") || "[]"); } catch (e) { return []; } }
  var demo = D.demoBookings();
  function bookings() { return demo.concat(saved()); }
  function freeTable(party, start) {
    var mins = D.stayMinutes(party), end = start + mins * 6e4, all = bookings();
    var sizes = D.fit[party] || [];
    for (var i = 0; i < sizes.length; i++) {
      var t = D.tables.find(function (x) { return x.seats === sizes[i]; }); if (!t) continue;
      var used = all.filter(function (b) { return b.seats === t.seats && b.start < end && start < b.start + b.mins * 6e4; }).length;
      if (t.count - used > 0) return { seats: t.seats, left: t.count - used };
    }
    return null;
  }
  function leftFor(party, start) {
    var mins = D.stayMinutes(party), end = start + mins * 6e4, all = bookings(), n = 0;
    (D.fit[party] || []).forEach(function (s) {
      var t = D.tables.find(function (x) { return x.seats === s; }); if (!t) return;
      n += Math.max(0, t.count - all.filter(function (b) { return b.seats === s && b.start < end && start < b.start + b.mins * 6e4; }).length);
    });
    return n;
  }
  function slotsFor(day) {
    var h = D.hours[day.getDay()]; if (!h) return [];
    var out = [], from = toMin(D.firstSlot), to = toMin(D.lastSlot), limit = Date.now() + D.minNoticeMinutes * 6e4;
    for (var m = from; m <= to; m += D.slotMinutes) {
      var s = new Date(day); s.setHours(Math.floor(m / 60), m % 60, 0, 0);
      if (s.getTime() < limit) continue;
      out.push({ t: s.getTime(), label: hm(s), left: leftFor(S.party, s.getTime()), lunch: m < toMin(D.lunchUntil) });
    }
    return out;
  }
  var _renderMenu = renderMenu; renderMenu = function () { _renderMenu(); staggerDishes(); };
  var lastSlot = null, ltShown = 0;
  function liveTables() {
    var box = $("liveTables"); if (!S.day) { box.hidden = true; return; }
    var list = slotsFor(new Date(S.day)), free = list.filter(function (x) { return x.left > 0; }), en = lang === "en";
    box.hidden = false;
    $("ltText").textContent = free.length
      ? (en ? (free.length === 1 ? "time" : "times") + " with a free table for " + S.party + (S.party === 1 ? " person" : " people") + " · soonest " + free[0].label
            : (free.length === 1 ? "orë" : "orë") + " me tavolinë të lirë për " + S.party + (S.party === 1 ? " person" : " veta") + " · më e afërta " + free[0].label)
      : (en ? "Full for " + S.party + " on this day. Try another day." : "Plot për " + S.party + " veta këtë ditë. Provoni një ditë tjetër.");
    var el = $("ltN"), from = ltShown, to = free.length, t0 = performance.now();
    box.classList.remove("bump"); void box.offsetWidth; box.classList.add("bump");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = to; ltShown = to; return; }
    (function tick(now) { var k = Math.min(1, (now - t0) / 450), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * e); if (k < 1) requestAnimationFrame(tick); else ltShown = to; })(t0);
  }
  function renderParty() {
    var html = ""; for (var n = 1; n <= D.maxParty; n++) html += '<button type="button" class="pill" data-n="' + n + '" aria-pressed="' + (S.party === n) + '" aria-label="' + (n === 1 ? T("person") : T("people", { n: n })) + '">' + n + "</button>";
    $("party").innerHTML = html;
  }
  function renderDays() {
    var html = "";
    for (var i = 0; i < D.daysAhead; i++) {
      var d = dayStart(new Date()); d.setDate(d.getDate() + i);
      var closed = !D.hours[d.getDay()], has = !closed && slotsFor(d).some(function (s) { return s.left > 0; });
      if (!S.day && has) S.day = d.getTime();
      var lbl = i === 0 ? T("today") : i === 1 ? T("tomorrow") : TX[lang].wds[d.getDay()];
      html += '<button type="button" class="day" data-d="' + d.getTime() + '" aria-pressed="' + (S.day === d.getTime()) + '"' + (closed ? " disabled" : "") + ' aria-label="' + lbl + " " + d.getDate() + " " + TX[lang].mo[d.getMonth()].slice(0, 3) + " (" + dayLabel(d) + (closed ? ", " + T("closedDay") : "") + ')"><small>' + lbl + "</small><b>" + d.getDate() + "</b><small>" + TX[lang].mo[d.getMonth()].slice(0, 3) + "</small></button>";
    }
    $("days").innerHTML = html;
  }
  function renderSlots() {
    if (!S.day) { $("slotWrap").innerHTML = '<p class="no-slots">' + T("closed") + "</p>"; return; }
    var list = slotsFor(new Date(S.day));
    if (S.slot && !list.some(function (s) { return s.t === S.slot && s.left > 0; })) S.slot = null;
    if (!list.some(function (s) { return s.left > 0; })) { $("slotWrap").innerHTML = '<p class="no-slots">' + T("noSlots", { n: S.party }) + "</p>"; return; }
    var group = function (arr, title) {
      if (!arr.length) return "";
      return '<p class="slots-label">' + title + '</p><div class="slots">' + arr.map(function (s) {
        var st = s.left === 0 ? T("full") : s.left === 1 ? T("few") : T("free");
        return '<button type="button" class="slot' + (s.left === 1 ? " few" : "") + '" data-t="' + s.t + '" aria-pressed="' + (S.slot === s.t) + '"' + (s.left === 0 ? " disabled" : "") + ' aria-label="' + s.label + ", " + st + '"><b>' + s.label + "</b><small>" + st + "</small></button>";
      }).join("") + "</div>";
    };
    $("slotWrap").innerHTML = group(list.filter(function (s) { return s.lunch; }), T("lunch")) + group(list.filter(function (s) { return !s.lunch; }), T("dinner"));
    if (S.slot && S.slot !== lastSlot) { var j = $("slotWrap").querySelector('.slot[data-t="' + S.slot + '"]'); if (j) j.classList.add("just"); }
    lastSlot = S.slot;
  }
  function renderTicket() {
    $("tParty").textContent = S.party === 1 ? T("person") : T("people", { n: S.party });
    $("tDay").textContent = S.day ? dayLabel(new Date(S.day)) : "—";
    $("tTime").textContent = S.slot ? hm(new Date(S.slot)) : T("pick");
    var ft = S.slot ? freeTable(S.party, S.slot) : null;
    $("tTable").textContent = ft ? T("tableFor", { n: ft.seats }) : "—";
  }
  $("party").addEventListener("click", function (e) { var b = e.target.closest(".pill"); if (!b) return; S.party = +b.dataset.n; renderParty(); renderSlots(); renderTicket(); liveTables(); });
  $("days").addEventListener("click", function (e) { var b = e.target.closest(".day"); if (!b || b.disabled) return; S.day = +b.dataset.d; S.slot = null; renderDays(); renderSlots(); renderTicket(); liveTables(); });
  $("slotWrap").addEventListener("click", function (e) { var b = e.target.closest(".slot"); if (!b || b.disabled) return; S.slot = +b.dataset.t; renderSlots(); renderTicket(); $("resErr").textContent = ""; });

  /* ---------- submit ---------- */
  var last = null;
  $("resForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("dName").value.trim(), phone = $("dPhone").value.trim(), err = "", focus = null;
    if (!S.slot) { err = T("eSlot"); focus = document.querySelector(".slot:not(:disabled)"); }
    else if (name.length < 3) { err = T("eName"); focus = $("dName"); }
    else if (phone.replace(/\D/g, "").length < 8) { err = T("ePhone"); focus = $("dPhone"); }
    var ft = S.slot ? freeTable(S.party, S.slot) : null;
    if (!err && !ft) { err = T("eGone"); renderSlots(); }
    $("resErr").textContent = err; if (err) { if (focus) focus.focus(); return; }
    var code = "PR-" + String(Math.floor(1000 + Math.random() * 9000));
    var occSel = $("dOcc"), occ = occSel.value ? occSel.options[occSel.selectedIndex].text : "";
    last = { code: code, party: S.party, start: S.slot, seats: ft.seats, name: name, phone: phone, email: $("dEmail").value.trim(), occ: occ, notes: $("dNotes").value.trim() };
    var finish = function () {
      var list = saved(); list.push({ seats: ft.seats, start: S.slot, mins: D.stayMinutes(S.party), code: code });
      try { localStorage.setItem("prush-bookings", JSON.stringify(list)); } catch (x) {}
      showDone();
    };
    if (D.demo) { finish(); return; }
    var btn = $("resBtn"); btn.disabled = true; btn.textContent = T("sending");
    fetch(D.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: "Rezervim " + code + " · " + S.party + " persona · " + dayLabel(new Date(S.slot)) + " " + hm(new Date(S.slot)), _template: "table",
        Kodi: code, Persona: S.party, Data: dayLabel(new Date(S.slot)), Ora: hm(new Date(S.slot)), Tavolina: "për " + ft.seats, Emri: name, Telefoni: phone, Email: last.email || "-", Rasti: occ || "-", Shenime: last.notes || "-" }) })
      .then(function (r) { if (!r.ok) throw 0; finish(); })
      .catch(function () { $("resErr").textContent = T("eSend"); })
      .then(function () { btn.disabled = false; btn.textContent = (lang === "en" ? EN : SQ)["res.btn"]; });
  });
  function showDone() {
    var b = last, when = dayLabel(new Date(b.start)) + ", " + hm(new Date(b.start));
    $("resGrid").hidden = true; $("done").classList.add("show");
    $("code").textContent = b.code;
    var rows = [[T("name"), b.name], [EN["t.party"] && (lang === "en" ? EN["t.party"] : SQ["t.party"]), b.party === 1 ? T("person") : T("people", { n: b.party })], [lang === "en" ? EN["t.day"] : SQ["t.day"], when], [lang === "en" ? EN["t.table"] : SQ["t.table"], T("tableFor", { n: b.seats })]];
    if (b.occ) rows.push([T("occ"), b.occ]);
    $("stub").innerHTML = rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("");
    var txt = T("wa") + "\n" + (b.party === 1 ? T("person") : T("people", { n: b.party })) + "\n" + when + "\n" + T("name") + ": " + b.name + "\n#" + b.code;
    $("waBtn").href = "https://wa.me/" + (D.whatsapp || "") + "?text=" + encodeURIComponent(txt);
    $("demoNote").hidden = !D.demo;
    $("done").focus({ preventScroll: true }); $("rezervo").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  $("icsBtn").addEventListener("click", function () {
    var b = last, st = function (d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00"; };
    var s = new Date(b.start), e = new Date(b.start + D.stayMinutes(b.party) * 6e4);
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Prush//SQ", "BEGIN:VEVENT", "UID:" + b.code + "@prush", "DTSTAMP:" + st(new Date()), "DTSTART:" + st(s), "DTEND:" + st(e), "SUMMARY:" + T("ics") + " · " + b.party, "LOCATION:Rr. Agim Ramadani, Prishtinë", "DESCRIPTION:" + b.code, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "prush-" + b.code + ".ics"; document.body.appendChild(a); a.click(); a.remove();
  });
  $("again").addEventListener("click", function () {
    S.slot = null; $("resForm").reset(); $("done").classList.remove("show"); $("resGrid").hidden = false; renderSlots(); renderTicket();
  });

  /* menu reveal when it scrolls into view */
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var mio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { menuSeen = true; staggerDishes(); mio.disconnect(); } }, { threshold: .15 });
    mio.observe($("dishes"));
  } else { menuSeen = true; $("dishes").classList.add("in"); }

  /* embers off the grill */
  (function () {
    var c = $("embers"); if (!c || !c.getContext) return;
    var ctx = c.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 1.5), w, h, P = [], vel = 0, lastY = window.scrollY, run = true, blocks = [];
    var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function measure() {
      var cr = c.getBoundingClientRect(); blocks = [];
      document.querySelectorAll(".hero .place, .hero h1, .hero .lead, .hero .actions, .hero .today").forEach(function (e) {
        var rg = document.createRange(); rg.selectNodeContents(e);
        var rs = e.matches(".actions, .today") ? [e.getBoundingClientRect()] : rg.getClientRects();
        Array.prototype.forEach.call(rs, function (r) { blocks.push({ l: r.left - cr.left - 16, r: r.right - cr.left + 16, t: r.top - cr.top - 14, b: r.bottom - cr.top + 14 }); });
      });
    }
    function size() { w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); measure(); }
    function spawn(n) { for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: h + 8, vx: (Math.random() - .5) * .35, vy: -(.5 + Math.random() * 1.1), r: 1 + Math.random() * 2.6, life: 0, max: 220 + Math.random() * 260, ph: Math.random() * 6.28 }); }
    function hidden(x, y) { for (var i = 0; i < blocks.length; i++) { var k = blocks[i]; if (x > k.l && x < k.r && y > k.t && y < k.b) return true; } return false; }
    function draw() {
      ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = "lighter";
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i], boost = 1 + Math.min(3, vel * .08);
        p.life++; p.ph += .05; p.x += p.vx + Math.sin(p.ph) * .35; p.y += p.vy * boost;
        if (p.life > p.max || p.y < -10) { P.splice(i, 1); continue; }
        if (hidden(p.x, p.y)) continue;
        var a = Math.sin(Math.PI * p.life / p.max) * (.55 + .45 * Math.sin(p.ph * 3));
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, "rgba(255,200,120," + (a * .95).toFixed(3) + ")"); g.addColorStop(.35, "rgba(240,110,45," + (a * .55).toFixed(3) + ")"); g.addColorStop(1, "rgba(212,96,47,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }
    function frame() {
      var y = window.scrollY; vel = vel * .9 + Math.abs(y - lastY) * .1; lastY = y;
      if (run) { if (P.length < 110 + vel * 4) spawn(Math.random() < .6 + vel * .05 ? 1 + Math.round(vel * .08) : 0); draw(); }
      requestAnimationFrame(frame);
    }
    size(); window.addEventListener("resize", size);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    if (still) { spawn(60); P.forEach(function (p) { p.y = h * (.45 + Math.random() * .55); p.life = p.max / 2; }); draw(); return; }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { run = es[0].isIntersecting; }).observe(c);
    requestAnimationFrame(frame);
  })();

  applyLang(); liveTables();
  document.querySelectorAll("[data-lang]").forEach(function (b) { b.addEventListener("click", function () { setTimeout(liveTables, 0); }); });
})();

