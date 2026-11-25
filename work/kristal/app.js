(function () {
  "use strict";
  var S = window.SITE, $ = K.$, t = K.t, KEY = "kristal-bookings";
  var docBy = function (id) { return S.doctors.find(function (d) { return d.id === id; }); };
  var hoursFor = function (wd) { return S.hours[wd] || null; };
  var docHours = function (d) { var h = {}; for (var i = 0; i < 7; i++) h[i] = d.off.indexOf(i) > -1 ? null : hoursFor(i); return h; };
  var emTimes = S.emergencyTimes.map(K.toMin);
  var isEm = function (ms) { var d = new Date(ms); return emTimes.indexOf(d.getHours() * 60 + d.getMinutes()) > -1; };
  var demo = K.demoBusy(S.doctors.map(function (d) { return d.id; }), S.daysAhead, hoursFor, { seed: 33, load: .38, block: 45 })
    .filter(function (x) { return docBy(x.res).off.indexOf(new Date(x.start).getDay()) === -1 && !emTimes.some(function (m) { var d = new Date(x.start), s = d.getHours() * 60 + d.getMinutes(), e = s + (x.end - x.start) / 6e4; return m < e && s < m + 45; }); });
  var busy = function () { return demo.concat(K.saved(KEY).map(function (x) { return { res: x.res, start: x.start, end: x.end, mine: true, visit: x.visit, urgent: x.urgent }; })); };

  var st = { a1: null, a2: null, visit: null, urgent: false, call: false, doc: "any", day: null, slot: null, who: null };

  /* normal visits cannot sit on an emergency hold; urgent visits can only use holds today/tomorrow, or the first free time */
  function slotsFor(docId, day) {
    var v = S.visits[st.visit], wd = new Date(day).getDay();
    var res = S.doctors.filter(function (d) { return v.by.indexOf(d.id) > -1 && (docId === "any" || d.id === docId); }).map(function (d) { return { id: d.id, hours: docHours(d) }; });
    var b = busy();
    if (!st.urgent) {
      S.doctors.forEach(function (d) { emTimes.forEach(function (m) { var s = K.day0(day); s.setMinutes(m); b.push({ res: d.id, start: s.getTime(), end: s.getTime() + 45 * 6e4 }); }); });
    }
    var list = K.slots({ day: day, hours: hoursFor(wd), step: S.step, duration: v.min, resources: res, busy: b, noticeMin: st.urgent ? 20 : S.noticeMin });
    return list.map(function (s) { s.em = isEm(s.t); return s; });
  }
  function nextFree(docId) {
    for (var d = 0; d < S.daysAhead; d++) { var day = K.day0(new Date()); day.setDate(day.getDate() + d); var s = slotsFor(docId, day).find(function (x) { return x.free.length; }); if (s) return s; }
    return null;
  }

  /* ---------- finder ---------- */
  function opt(box, label, pressed, fn) {
    var b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.textContent = label; b.setAttribute("aria-pressed", String(!!pressed)); b.addEventListener("click", fn); box.appendChild(b);
  }
  function renderFinder() {
    var box = $("q1"); box.innerHTML = "";
    S.finder.forEach(function (f) { opt(box, t(f.label), st.a1 === f.id, function () { st.a1 = f.id; st.a2 = null; if (f.go) { setVisit(f.go, false, false); } else { st.visit = null; } renderFinder(); }); });
    var f = S.finder.find(function (x) { return x.id === st.a1; });
    var q2 = $("q2wrap");
    if (f && f.ask) {
      q2.hidden = false; $("q2").textContent = t(f.ask.q); var ob = $("q2opts"); ob.innerHTML = ""; ob.setAttribute("aria-label", t(f.ask.q));
      f.ask.opts.forEach(function (o, i) { opt(ob, t(o.label), st.a2 === i, function () { st.a2 = i; setVisit(o.go, !!o.urgent, !!o.call); renderFinder(); }); });
    } else q2.hidden = true;
    renderResult();
  }
  function setVisit(id, urgent, call) {
    var changed = st.visit !== id || st.urgent !== urgent;
    st.visit = id; st.urgent = urgent; st.call = call;
    if (changed) { st.slot = null; st.day = null; if (st.doc !== "any" && S.visits[id].by.indexOf(st.doc) === -1) st.doc = "any"; }
    renderBook();
    if (changed && !K.reduced) setTimeout(function () { $("result").scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 60);
  }
  function priceText(v) { return v.consult ? t("Konsulta €15", "Consultation €15") : v.from === v.to ? K.eur(v.from) : K.eur(v.from) + "–" + v.to; }
  function renderResult() {
    var box = $("result");
    if (!st.visit) { box.hidden = true; $("book").hidden = true; return; }
    var v = S.visits[st.visit]; box.hidden = false; box.innerHTML = "";
    var left = document.createElement("div");
    if (st.urgent) { var bd = document.createElement("span"); bd.className = "badge"; bd.textContent = t("Urgjente: ju japim orën e parë të lirë, edhe sot", "Urgent: we'll give you the first free time, even today"); left.appendChild(bd); }
    var h = document.createElement("h3"); h.textContent = t(v.name); left.appendChild(h);
    var p = document.createElement("p"); p.textContent = t(v.what); left.appendChild(p);
    var facts = document.createElement("div"); facts.className = "facts";
    [[K.dur(v.min), t("zgjat", "takes")], [priceText(v), t("çmimi", "price")], [v.by.map(function (id) { return docBy(id).name.replace("Dr. ", "Dr "); }).join(", "), t("e bën", "done by")]].forEach(function (f) { var d = document.createElement("div"); d.innerHTML = "<b></b><span></span>"; d.firstChild.textContent = f[0]; d.lastChild.textContent = f[1]; facts.appendChild(d); });
    left.appendChild(facts);
    if (st.call) { var cb = document.createElement("div"); cb.className = "callbox"; cb.innerHTML = "<span></span><br><a></a>"; cb.firstChild.textContent = t("Ënjtja ose temperatura duan vëmendje sot. Telefononi linjën urgjente, ose rezervoni orën e parë më poshtë.", "Swelling or fever needs attention today. Call the urgent line, or book the first time below."); var a = cb.querySelector("a"); a.href = "tel:" + S.emergency.replace(/\s/g, ""); a.textContent = S.emergency; left.appendChild(cb); }
    box.appendChild(left);
    var go = document.createElement("a"); go.className = "btn" + (st.urgent ? " red" : ""); go.href = "#book"; go.textContent = st.urgent ? t("Merr orën urgjente", "Get the urgent time") : t("Zgjidh orën", "Choose a time");
    go.addEventListener("click", function (e) { e.preventDefault(); K.smooth("#book"); });
    box.appendChild(go);
    $("book").hidden = false;
  }

  /* ---------- booking ---------- */
  function pressed(box, attr, val) { box.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset[attr] === String(val))); }); }
  function renderBook() { if (!st.visit) return; renderDocs(); renderDays(); renderSlots(); renderSide(); }
  function renderDocs() {
    var box = $("docs"), v = S.visits[st.visit]; box.innerHTML = "";
    [{ id: "any", name: t("I pari i lirë", "First available"), role: { sq: "Ju jep orën më të afërt", en: "Gives you the soonest time" } }].concat(S.doctors).forEach(function (d) {
      var b = document.createElement("button"); b.type = "button"; b.className = "doc"; b.dataset.id = d.id;
      var can = d.id === "any" || v.by.indexOf(d.id) > -1; b.disabled = !can;
      b.innerHTML = "<b></b><span></span><em></em>"; b.querySelector("b").textContent = d.name; b.querySelector("span").textContent = t(d.role);
      var n = can ? nextFree(d.id) : null;
      b.querySelector("em").textContent = !can ? t("Nuk e bën këtë vizitë", "Doesn't do this visit") : n ? K.dayLabel(n.t, true).split(",")[0] + " " + n.label : t("Pa orë të lira", "No free times");
      b.addEventListener("click", function () { st.doc = d.id; st.slot = null; pressed(box, "id", d.id); renderDays(); renderSlots(); renderSide(); });
      box.appendChild(b);
    });
    pressed(box, "id", st.doc);
  }
  function renderDays() {
    var box = $("days"), first = null; box.innerHTML = "";
    for (var d = 0; d < S.daysAhead; d++) {
      var day = K.day0(new Date()); day.setDate(day.getDate() + d);
      var b = document.createElement("button"); b.type = "button"; b.className = "day"; b.dataset.t = day.getTime(); b.title = K.dayLabel(day);
      var ok = hoursFor(day.getDay()) && slotsFor(st.doc, day).some(function (x) { return x.free.length; });
      b.disabled = !ok; if (ok && first === null) first = day.getTime();
      b.innerHTML = "<span></span><b></b>"; b.querySelector("span").textContent = d === 0 ? t("Sot", "Today") : d === 1 ? t("Nesër", "Tmrw") : K.WS[K.lang][day.getDay()]; b.querySelector("b").textContent = day.getDate();
      (function (ts) { b.addEventListener("click", function () { st.day = ts; st.slot = null; pressed(box, "t", ts); renderSlots(); renderSide(); }); })(day.getTime());
      box.appendChild(b);
    }
    var cur = st.day && box.querySelector('[data-t="' + st.day + '"]');
    if (!cur || cur.disabled) st.day = first;
    pressed(box, "t", st.day);
  }
  function renderSlots() {
    var box = $("slots"); box.innerHTML = "";
    if (!st.day) { var p = document.createElement("p"); p.className = "empty"; p.textContent = t("Nuk ka orë të lira në 3 javët e ardhshme. Na telefononi.", "No free times in the next 3 weeks. Please call us."); box.appendChild(p); return; }
    slotsFor(st.doc, st.day).forEach(function (s) {
      var b = document.createElement("button"); b.type = "button"; b.className = "slot" + (s.em && st.urgent ? " em" : ""); b.dataset.t = s.t; b.textContent = s.label; b.disabled = !s.free.length;
      if (s.em && st.urgent) b.title = t("Orë urgjente", "Urgent slot");
      b.addEventListener("click", function () { st.slot = s.t; st.who = pickWho(s); pressed(box, "t", s.t); renderSide(); });
      box.appendChild(b);
    });
    pressed(box, "t", st.slot);
  }
  function pickWho(s) {
    if (st.doc !== "any") return st.doc;
    var d0 = K.day0(s.t).getTime(), d1 = d0 + 864e5, load = function (id) { return busy().filter(function (x) { return x.res === id && x.start >= d0 && x.start < d1; }).length; };
    return s.free.slice().sort(function (a, b) { return load(a) - load(b); })[0];
  }
  function renderSide() {
    var v = st.visit && S.visits[st.visit];
    $("sVisit").textContent = v ? t(v.name) : "-";
    $("sDoc").textContent = st.slot ? docBy(st.who).name : st.doc === "any" ? t("I pari i lirë", "First available") : docBy(st.doc).name;
    $("sWhen").textContent = st.slot ? K.dayLabel(st.slot, true) + ", " + K.hm(st.slot) : "-";
    $("sPrice").textContent = v ? priceText(v) : "-";
    $("confirm").disabled = !(v && st.slot);
  }
  $("confirm").addEventListener("click", function () {
    var name = $("fName").value.trim(), phone = $("fPhone").value.trim(), err = $("err");
    if (name.length < 3) { err.textContent = t("Shkruani emrin dhe mbiemrin.", "Please enter your full name."); $("fName").focus(); return; }
    if (phone.replace(/\D/g, "").length < 8) { err.textContent = t("Shkruani një numër telefoni të saktë.", "Please enter a valid phone number."); $("fPhone").focus(); return; }
    var v = S.visits[st.visit], start = st.slot, end = start + v.min * 6e4, who = st.who;
    if (busy().some(function (x) { return x.res === who && x.start < end && start < x.end; })) { err.textContent = t("Kjo orë sapo u zu. Zgjidhni një tjetër.", "That time was just taken. Pick another."); st.slot = null; renderSlots(); renderSide(); return; }
    err.textContent = "";
    var code = K.code("KD"), d = docBy(who), btn = $("confirm"); btn.disabled = true; btn.textContent = t("Duke dërguar…", "Sending…");
    K.submit(S, (st.urgent ? "URGJENTE " : "") + "Termin " + code + ": " + v.name.sq + ", " + d.name + ", " + K.dayLabel(start) + " " + K.hm(start), {
      Kodi: code, Vizita: v.name.sq, Urgjente: st.urgent ? "PO" : "Jo", Mjeku: d.name, Kur: K.dayLabel(start) + ", " + K.hm(start) + "–" + K.hm(end), Pacient_i_ri: $("fFirst").value === "yes" ? "Po" : "Jo", Gjuha: $("fLang").value, Emri: name, Telefoni: phone, Shenim: $("fNote").value.trim() || "-"
    }).then(function (r) {
      K.save(KEY, { code: code, res: who, visit: st.visit, urgent: st.urgent, start: start, end: end, name: name });
      $("flow").hidden = true; $("done").hidden = false;
      $("tCode").textContent = t("Kodi ", "Code ") + code; $("tVisit").textContent = t(v.name); $("tDoc").textContent = d.name; $("tWhen").textContent = K.dayLabel(start, true) + ", " + K.hm(start); $("tPrice").textContent = priceText(v);
      var rc = new Date(start); rc.setMonth(rc.getMonth() + S.recallMonths); rc.setHours(10, 0, 0, 0);
      $("tRecall").textContent = t("Kontrolli i radhës: ", "Next check-up: ") + K.MO[K.lang][rc.getMonth()] + " " + rc.getFullYear() + t(". E shtojmë si kujtesë në kalendarin tuaj.", ". We'll add it as a reminder to your calendar.");
      $("tMsg").textContent = r.demo ? t("Demo: në faqen e vërtetë klinika e merr menjëherë në email dhe WhatsApp dhe ju konfirmon me SMS.", "Demo: on the live site the clinic gets it instantly by email and WhatsApp and confirms by SMS.") : t("Klinika u njoftua. Ju konfirmojmë me SMS.", "The clinic has been notified. We'll confirm by SMS.");
      $("tIcs").onclick = function () { K.ics("kristal-" + code, [{ start: start, end: end, title: "Kristal Dental: " + t(v.name) + " (" + d.name + ")", where: S.address }, { start: rc.getTime(), end: rc.getTime() + 15 * 6e4, title: t("Kujtesë: rezervo kontrollin te Kristal Dental", "Reminder: book your check-up at Kristal Dental"), where: location.href.split("?")[0] }]); };
      $("tWa").href = K.wa(S.whatsapp, "Përshëndetje Kristal Dental, rezervova " + v.name.sq + " me " + d.name + ", " + K.dayLabel(start) + " " + K.hm(start) + ". Kodi " + code + ". " + name);
      $("ticket").focus(); K.smooth("#vizita");
    }).catch(function () { err.textContent = t("Nuk u dërgua. Kontrolloni internetin ose na telefononi.", "Not sent. Check your connection or call us."); })
      .then(function () { btn.textContent = t("Konfirmo terminin", "Confirm booking"); renderSide(); });
  });
  $("tAgain").addEventListener("click", function () { st.slot = null; $("done").hidden = true; $("flow").hidden = false; renderBook(); });

  /* ---------- rest ---------- */
  function renderPrices() { var box = $("plist"); box.innerHTML = ""; S.prices.forEach(function (p) { var d = document.createElement("div"); d.innerHTML = "<span></span><b></b>"; d.firstChild.textContent = t(p.n); d.lastChild.textContent = typeof p.p === "string" ? p.p : t(p.p); box.appendChild(d); }); }
  function renderTeam() {
    var box = $("team"); box.innerHTML = "";
    S.doctors.forEach(function (d) {
      var el = document.createElement("article"); el.className = "member";
      var ini = d.name.replace("Dr. ", "").split(" ").map(function (w) { return w[0]; }).join("");
      el.innerHTML = '<div class="ini" aria-hidden="true"><span></span></div><h3></h3><p></p><small></small>';
      el.querySelector(".ini span").textContent = ini; el.querySelector("h3").textContent = d.name; el.querySelector("p").textContent = t(d.role);
      el.querySelector("small").textContent = t("Jo në klinikë: ", "Not in: ") + d.off.map(function (x) { return K.WD[K.lang][x]; }).join(", ");
      box.appendChild(el);
    });
  }
  function renderHours() { var wd = new Date().getDay(), rows = ""; [1, 2, 3, 4, 5, 6, 0].forEach(function (d) { var h = S.hours[d]; rows += "<tr" + (d === wd ? ' class="today"' : "") + "><td>" + K.WD[K.lang][d] + "</td><td>" + (h ? h[0] + "–" + h[1] : t("Mbyllur", "Closed")) + "</td></tr>"; }); $("hours").innerHTML = rows; }
  function renderFaq() { var box = $("faq"); box.innerHTML = ""; S.faq.forEach(function (f) { var d = document.createElement("details"); d.innerHTML = "<summary></summary><p></p>"; d.querySelector("summary").textContent = t(f.q); d.querySelector("p").textContent = t(f.a); box.appendChild(d); }); }
  function renderAgenda() {
    var d0 = K.day0(new Date()).getTime(), d1 = d0 + 864e5, now = Date.now(), box = $("agenda"), count = 0, urg = 0, newP = 0; box.innerHTML = "";
    var open = hoursFor(new Date().getDay());
    S.doctors.forEach(function (doc) {
      var col = document.createElement("div"); col.innerHTML = "<h4></h4><p class=\"sum\"></p>"; col.querySelector("h4").textContent = doc.name;
      if (!open || doc.off.indexOf(new Date().getDay()) > -1) { col.querySelector(".sum").textContent = t("Jo në klinikë sot", "Not in today"); box.appendChild(col); return; }
      var list = busy().filter(function (x) { return x.res === doc.id && x.start >= d0 && x.start < d1; });
      emTimes.forEach(function (m) { var s = K.day0(new Date()); s.setMinutes(m); if (!list.some(function (x) { return x.start === s.getTime(); })) list.push({ hold: true, start: s.getTime(), end: s.getTime() + 45 * 6e4 }); });
      list.sort(function (a, z) { return a.start - z.start; });
      var n = 0;
      list.forEach(function (x) {
        var r = document.createElement("div"), vis = x.visit ? S.visits[x.visit] : S.visits[doc.id === "lule" ? "clean" : ["check", "filling", "pain"][(x.start / 6e4 / 45 | 0) % 3]];
        r.className = "appt" + (x.hold ? " hold" : x.urgent ? " urg" : x.mine ? " new" : "") + (x.end < now ? " past" : "");
        r.innerHTML = "<b></b><span></span>"; r.querySelector("b").textContent = K.hm(x.start);
        r.querySelector("span").textContent = x.hold ? t("Mbajtur për urgjenca", "Held for emergencies") : t(vis.name) + (x.mine ? t(" · online", " · online") : "");
        col.appendChild(r); if (!x.hold) n++; if (x.urgent) urg++; if (x.mine) newP++;
      });
      col.querySelector(".sum").textContent = n + t(" pacientë", " patients");
      count += n; box.appendChild(col);
    });
    $("kpis").innerHTML = "";
    [[count, t("pacientë sot", "patients today")], [urg, t("urgjenca të rezervuara", "urgent bookings")], [newP, t("rezervuar online nga ju", "booked online by you")]].forEach(function (k) { var d = document.createElement("div"); d.innerHTML = "<b></b><span></span>"; d.querySelector("b").textContent = k[0]; d.querySelector("span").textContent = k[1]; $("kpis").appendChild(d); });
  }
  var dlg = $("staffDlg");
  $("openStaff").addEventListener("click", function () { renderAgenda(); dlg.showModal(); });
  $("closeStaff").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  /* gem: light sweep only while visible; facets brighten toward the pointer */
  (function () {
    var g = $("gem"), facets = g.querySelectorAll(".facet");
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { g.classList.toggle("run", es[0].isIntersecting && !K.reduced); }).observe(g);
    if (K.reduced || !window.matchMedia("(pointer: fine)").matches) return;
    g.addEventListener("pointermove", function (e) {
      var r = g.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      facets[0].style.opacity = (.4 + x * .6).toFixed(2); facets[1].style.opacity = (1 - x * .6).toFixed(2); facets[2].style.opacity = (.3 + (1 - x) * y).toFixed(2); facets[3].style.opacity = (.2 + x * y).toFixed(2);
    });
  })();

  function renderAll() { renderFinder(); renderBook(); renderPrices(); renderTeam(); renderHours(); renderFaq(); $("diaWa").href = K.wa(S.whatsapp, t("Përshëndetje Kristal Dental, vij nga diaspora dhe dua një plan trajtimi. Do të jem në Pejë nga ... deri ...", "Hello Kristal Dental, I'm visiting from abroad and would like a treatment plan. I'll be in Peja from ... to ...")); }
  K.onLang(renderAll);
  K.i18n({
    "demo": 'This is a <b>concept project</b> by <a href="../../">Nisja Studio</a>. The clinic is fictional.', "demo.staff": "See the clinic calendar",
    "nav.find": "Find your visit", "nav.prices": "Prices", "nav.dia": "From abroad", "nav.visit": "Contact", "cta.book": "Book",
    "h.l1": "A calm smile,", "h.l2": "without fear.", "h.lead": "A dental clinic in Peja where the price is given before treatment and every step is explained. Tell us what's bothering you and we'll find the right visit and a free time.",
    "h.cta": "Find your visit", "h.cta2": "See prices", "h.urg": "Severe pain? We keep two urgent slots free every day.", "h.alt": "Clinic treatment room: dental chair in bright white light",
    "tag1": "Written price", "tag1s": "before any treatment", "tag2": "Digital scan", "tag2s": "no impression trays",
    "tr1": "Class B autoclave", "tr1s": "pack opened in front of you", "tr2": "Digital X-rays", "tr2s": "up to 90% less radiation", "tr3": "Interest-free instalments", "tr3s": "for treatment over €300", "tr4": "6-month reminders", "tr4s": "so you never forget a check-up",
    "f.title": "What brings you in?", "f.lead": "Two questions and we'll tell you which visit to book, how long it takes, what it costs and who does it. The times you see are the real free times.",
    "f.q1": "Choose what describes you best",
    "b.doc": "Which dentist?", "b.day": "Day", "b.time": "Time", "b.you": "Your details",
    "fl.name": "Full name", "fl.phone": "Phone", "fl.first": "First time with us?", "fl.yes": "Yes, new patient", "fl.no": "No, I've been before", "fl.lang": "Language", "fl.note": "Note for the dentist (optional)", "fl.note.ph": "e.g. lower left tooth, sensitive to cold",
    "s.title": "Your booking", "s.visit": "Visit", "s.doc": "Dentist", "s.when": "When", "s.price": "Price", "s.confirm": "Confirm booking", "s.fine": "We confirm by SMS. For changes, message us up to 24 hours before.",
    "t.title": "Your visit is booked", "t.ics": "Add to calendar", "t.wa": "Send on WhatsApp", "t.again": "Book another",
    "p.title": "Prices, no surprises", "p.lead": "You get the exact price in writing after the check-up. These are our usual ranges.", "p.note": "The check-up fee is deducted if you go ahead with treatment within 30 days.",
    "c.title": "The clinic and the team", "c.lead": "Three treatment rooms, a quiet waiting room and instruments you watch being unpacked.",
    "d.title": "Visiting from abroad?", "d.lead": "Many patients come for 1–2 weeks in summer or over the holidays. Plan your treatment before you arrive so you don't lose days.",
    "d1": "Send us a photo or X-ray", "d1s": "On WhatsApp, even from your phone.", "d2": "Get a written plan and price", "d2s": "Within 48 hours, in Albanian, English or German.", "d3": "We schedule visits around your days", "d3s": "So treatment is finished before you fly back.", "d.cta": "Send on WhatsApp",
    "v.title": "Find us in Peja", "v.maps": "Open in Google Maps", "v.access": "Ground floor, step-free. Parking in front of the clinic.", "faq.title": "Common questions",
    "foot": 'Concept site by <a href="../../">Nisja Studio</a>. Photos: Unsplash.',
    "st.title": "Today's calendar", "st.close": "Close", "st.note": "Red dashed urgent slots stay free until a patient in pain takes them. Patients arrive with the right visit already chosen, so durations are accurate."
  });
  $("cMaps").href = S.maps; $("yr").textContent = new Date().getFullYear();
  if (/[?&]staff\b/.test(location.search)) { renderAgenda(); dlg.showModal(); }
  window.KRISTAL = { st: st, slotsFor: slotsFor, busy: busy, isEm: isEm };
})();

