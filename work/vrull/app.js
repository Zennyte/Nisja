(function () {
  "use strict";
  var S = window.SITE, $ = K.$, t = K.t;
  var KC = "vrull-classes", KT = "vrull-trials", KJ = "vrull-joins";
  var st = { filter: "all", term: 1, student: false, tDay: null, tPart: "eve", tGoal: null, cls: null, plan: null };
  var coachBy = function (id) { return S.coaches.find(function (c) { return c.id === id; }); };

  /* each class occurrence in the next 7 days, with a stable id and seeded demo attendance */
  function occurrences() {
    var out = [];
    for (var d = 0; d < 7; d++) {
      var day = K.day0(new Date()); day.setDate(day.getDate() + d);
      S.classes.filter(function (c) { return c.d === day.getDay(); }).forEach(function (c) {
        var s = new Date(day); s.setHours(+c.at.slice(0, 2), +c.at.slice(3), 0, 0);
        var id = c.type + "-" + s.getTime();
        var seed = (s.getTime() / 6e4) % 97, base = Math.round(c.cap * (.35 + (seed % 60) / 100));
        if (c.at >= "18:00") base = Math.min(c.cap, base + 3);
        var mine = K.saved(KC).filter(function (x) { return x.id === id; });
        out.push(Object.assign({}, c, { id: id, start: s.getTime(), end: s.getTime() + c.min * 6e4, taken: Math.min(c.cap, base) + mine.filter(function (x) { return !x.wait; }).length, wait: mine.filter(function (x) { return x.wait; }).length + (base >= c.cap ? 2 : 0), mine: mine.length > 0 }));
      });
    }
    return out;
  }

  /* ---------- crowd meter ---------- */
  function renderCrowd() {
    var now = new Date(), h = now.getHours(), wd = now.getDay(), oh = S.hours[wd], box = $("meter"); box.innerHTML = "";
    var open = oh ? [+oh[0].slice(0, 2), +oh[1].slice(0, 2)] : null, isOpen = open && h >= open[0] && h < open[1];
    for (var x = 6; x <= 22; x++) {
      var v = S.crowd[x] || 0, b = document.createElement("div"); b.className = "bar";
      if (wd === 0 || wd === 6) v = Math.round(v * .7);
      b.style.height = Math.max(4, v) + "%";
      if (x === h && isOpen) { b.classList.add("now"); b.dataset.now = t("Tani", "Now"); } else if (x < h) b.classList.add("past");
      if (open && (x < open[0] || x >= open[1])) b.style.opacity = .25;
      var l = document.createElement("span"); l.textContent = x; b.appendChild(l); box.appendChild(b);
    }
    var cur = isOpen ? (S.crowd[h] || 0) * (wd === 0 || wd === 6 ? .7 : 1) : -1, el = $("crowdNow");
    var quiet = [], hrs = Object.keys(S.crowd).map(Number).filter(function (x) { return open && x > h && x < open[1]; });
    hrs.forEach(function (x) { if (S.crowd[x] <= 30) quiet.push(x); });
    if (cur < 0) { el.dataset.l = "low"; el.textContent = t("Mbyllur tani", "Closed now"); $("crowdTip").textContent = oh ? t("Hapemi nesër. Më e qetë: 10:00–15:00.", "We open tomorrow. Quietest: 10:00–15:00.") : t("Sot jemi mbyllur.", "Closed today."); }
    else {
      el.dataset.l = cur < 40 ? "low" : cur < 75 ? "mid" : "high";
      el.textContent = cur < 40 ? t("E qetë", "Quiet") : cur < 75 ? t("Mesatare", "Moderate") : t("Shumë plot", "Very busy");
      $("crowdTip").textContent = quiet.length ? t("Më e qetë sot: rreth ", "Quietest later today: around ") + quiet[0] + ":00." : t("Pjesa tjetër e ditës mbetet aktive. Mëngjesi para 9:00 është më i qeti.", "The rest of today stays busy. Early mornings before 9:00 are quietest.");
    }
    box.setAttribute("aria-label", t("Sa plot është palestra sipas orës sot. Tani: ", "How busy the gym is by hour today. Now: ") + el.textContent);
  }

  /* ---------- timetable ---------- */
  function renderFilters() {
    var box = $("filters"); box.innerHTML = "";
    [["all", { sq: "Të gjitha", en: "All" }, null]].concat(Object.keys(S.types).map(function (k) { return [k, S.types[k], S.types[k].c]; })).forEach(function (f) {
      var b = document.createElement("button"); b.type = "button"; b.className = "filt"; b.dataset.f = f[0];
      if (f[2]) { var i = document.createElement("i"); i.style.background = f[2]; b.appendChild(i); }
      b.appendChild(document.createTextNode(t(f[1])));
      b.setAttribute("aria-pressed", String(st.filter === f[0]));
      b.addEventListener("click", function () { st.filter = f[0]; renderFilters(); renderWeek(); });
      box.appendChild(b);
    });
  }
  function renderWeek() {
    var box = $("week"), occ = occurrences(), now = Date.now(); box.innerHTML = "";
    for (var d = 0; d < 7; d++) {
      var day = K.day0(new Date()); day.setDate(day.getDate() + d);
      var col = document.createElement("div"); col.className = "col" + (d === 0 ? " today" : "");
      var h = document.createElement("h3"); h.innerHTML = "<span></span><small></small>";
      h.firstChild.textContent = d === 0 ? t("Sot", "Today") : K.WS[K.lang][day.getDay()]; h.lastChild.textContent = day.getDate() + " " + K.MO[K.lang][day.getMonth()].slice(0, 3);
      col.appendChild(h);
      var list = occ.filter(function (o) { return K.day0(o.start).getTime() === day.getTime() && (st.filter === "all" || o.type === st.filter); });
      if (!list.length) { var n = document.createElement("p"); n.className = "none"; n.textContent = t("Pa klasa", "No classes"); col.appendChild(n); }
      list.forEach(function (o) {
        var b = document.createElement("button"); b.type = "button"; b.className = "cls" + (o.mine ? " mine" : ""); b.dataset.id = o.id;
        b.style.setProperty("--c", S.types[o.type].c);
        var left = o.cap - o.taken, past = o.start < now;
        b.disabled = past;
        b.innerHTML = '<span class="tm"></span><b></b><span class="co"></span><span class="sp"></span><span class="pips" aria-hidden="true"></span>';
        b.querySelector(".tm").textContent = o.at + "–" + K.hm(o.end);
        b.querySelector("b").textContent = t(S.types[o.type]);
        b.querySelector(".co").textContent = coachBy(o.coach).name + " · " + o.min + " min";
        var sp = b.querySelector(".sp");
        if (o.mine) sp.textContent = t("Jeni brenda", "You're in");
        else if (past) sp.textContent = t("Përfundoi", "Finished");
        else if (left <= 0) { sp.textContent = t("Plot · pritje: ", "Full · waitlist: ") + o.wait; sp.classList.add("full"); }
        else { sp.textContent = left + (left === 1 ? t(" vend i lirë", " spot left") : t(" vende të lira", " spots left")); if (left <= 3) sp.classList.add("low"); }
        var pips = b.querySelector(".pips"); for (var i = 0; i < o.cap; i++) { var p = document.createElement("i"); if (i < o.taken) p.className = "on"; pips.appendChild(p); }
        b.addEventListener("click", function () { openClass(o); });
        col.appendChild(b);
      });
      box.appendChild(col);
    }
  }
  function openClass(o) {
    st.cls = o; var full = o.taken >= o.cap;
    $("clsH").textContent = t(S.types[o.type]) + ", " + o.at;
    $("clsMeta").textContent = K.dayLabel(o.start) + " · " + coachBy(o.coach).name + " · " + o.min + " min · " + (full ? t("Klasa është plot. Hyni në listën e pritjes; nëse lirohet vend, ju kalon automatikisht.", "This class is full. Join the waitlist; if a spot opens, it's yours automatically.") : (o.cap - o.taken) + t(" vende të lira nga ", " spots left of ") + o.cap);
    $("cSend").textContent = full ? t("Hyr në listën e pritjes", "Join the waitlist") : t("Zë vendin", "Book my spot");
    $("clsForm").hidden = false; $("clsDone").hidden = true; $("cErr").textContent = "";
    $("clsDlg").showModal();
  }
  $("cSend").addEventListener("click", function () {
    var o = st.cls, name = $("cName").value.trim(), phone = $("cPhone").value.trim();
    if (!name) { $("cErr").textContent = t("Shkruani emrin.", "Please enter your name."); return; }
    if (phone.replace(/\D/g, "").length < 8) { $("cErr").textContent = t("Shkruani një numër telefoni të saktë.", "Please enter a valid phone number."); return; }
    var cur = occurrences().find(function (x) { return x.id === o.id; });
    if (cur.mine) { $("cErr").textContent = t("Jeni regjistruar tashmë në këtë klasë.", "You're already booked into this class."); return; }
    var wait = cur.taken >= cur.cap;
    $("cSend").disabled = true;
    K.submit(S, (wait ? "Listë pritjeje: " : "Klasë: ") + S.types[o.type].sq + " " + K.dayLabel(o.start) + " " + o.at, { Klasa: S.types[o.type].sq, Kur: K.dayLabel(o.start) + " " + o.at, Trajneri: coachBy(o.coach).name, Lloji: wait ? "Listë pritjeje (nr. " + (cur.wait + 1) + ")" : "Vend i zënë", Emri: name, Telefoni: phone })
      .then(function () {
        K.save(KC, { id: o.id, wait: wait, name: name, at: Date.now() });
        $("clsForm").hidden = true; $("clsDone").hidden = false;
        $("clsDoneTxt").textContent = wait ? t("Jeni i " + (cur.wait + 1) + "-i në listën e pritjes. Ju njoftojmë nëse lirohet vend.", "You're number " + (cur.wait + 1) + " on the waitlist. We'll tell you if a spot opens.") : t("Vendi është juaji. Ejani 5 minuta më herët.", "The spot is yours. Come 5 minutes early.");
        renderWeek();
      }).catch(function () { $("cErr").textContent = t("Nuk u dërgua. Provoni sërish.", "Not sent. Please try again."); })
      .then(function () { $("cSend").disabled = false; });
  });

  /* ---------- plans ---------- */
  function price(p) {
    var term = S.terms.find(function (x) { return x.months === st.term; });
    var m = p.price * (1 - term.off / 100) * (st.student ? 1 - S.studentOff / 100 : 1);
    m = Math.round(m * 2) / 2;
    return { month: m, total: Math.round(m * st.term * 100) / 100, was: p.price };
  }
  function renderTerms() {
    var box = $("terms"); box.innerHTML = "";
    S.terms.forEach(function (x) {
      var b = document.createElement("button"); b.type = "button"; b.dataset.m = x.months;
      b.textContent = x.months === 1 ? t("1 muaj", "1 month") : x.months + t(" muaj", " months");
      if (x.off) { var s = document.createElement("small"); s.textContent = "−" + x.off + "%"; b.appendChild(s); }
      b.setAttribute("aria-pressed", String(st.term === x.months));
      b.addEventListener("click", function () { st.term = x.months; renderTerms(); renderPlans(); });
      box.appendChild(b);
    });
  }
  $("student").addEventListener("change", function (e) { st.student = e.target.checked; renderPlans(); });
  function renderPlans() {
    var box = $("plans"); box.innerHTML = "";
    S.plans.forEach(function (p) {
      var pr = price(p), el = document.createElement("article"); el.className = "plan" + (p.best ? " best" : "");
      el.innerHTML = (p.best ? '<span class="flag"></span>' : "") + '<h3></h3><div class="price"><b></b><span></span> <s></s></div><div class="tot"></div><ul></ul><button class="btn" type="button"></button>';
      if (p.best) el.querySelector(".flag").textContent = t("Më e zgjedhura", "Most chosen");
      el.querySelector("h3").textContent = t(p.name);
      el.querySelector(".price b").textContent = K.eur(pr.month);
      el.querySelector(".price span").textContent = t("/ muaj", "/ month");
      el.querySelector(".price s").textContent = pr.month < pr.was ? K.eur(pr.was) : "";
      el.querySelector(".tot").textContent = st.term > 1 ? K.eur(pr.total) + t(" gjithsej për ", " total for ") + st.term + t(" muaj", " months") : t("Pa kontratë. Anuloni kur të doni.", "No contract. Cancel any time.");
      var ul = el.querySelector("ul"); t(p.gets).forEach(function (g) { var li = document.createElement("li"); li.textContent = g; ul.appendChild(li); });
      var b = el.querySelector("button"); b.textContent = t("Zgjidh ", "Choose ") + t(p.name);
      b.addEventListener("click", function () { openJoin(p); });
      box.appendChild(el);
    });
  }
  function openJoin(p) {
    st.plan = p; var pr = price(p);
    $("joinMeta").textContent = t(p.name) + " · " + K.eur(pr.month) + t(" / muaj", " / month") + " · " + (st.term === 1 ? t("1 muaj", "1 month") : st.term + t(" muaj", " months")) + (st.student ? t(" · student", " · student") : "") + (st.term > 1 ? " · " + K.eur(pr.total) + t(" gjithsej", " total") : "");
    $("joinForm").hidden = false; $("joinDone").hidden = true; $("jErr").textContent = "";
    $("joinDlg").showModal();
  }
  $("jSend").addEventListener("click", function () {
    var name = $("jName").value.trim(), phone = $("jPhone").value.trim(), p = st.plan, pr = price(p);
    if (!name) { $("jErr").textContent = t("Shkruani emrin.", "Please enter your name."); return; }
    if (phone.replace(/\D/g, "").length < 8) { $("jErr").textContent = t("Shkruani një numër telefoni të saktë.", "Please enter a valid phone number."); return; }
    $("jSend").disabled = true;
    K.submit(S, "Anëtar i ri: " + p.name.sq + " (" + st.term + " muaj)", { Plani: p.name.sq, Kohezgjatja: st.term + " muaj", Student: st.student ? "Po" : "Jo", Cmimi: "€" + pr.month + " / muaj, €" + pr.total + " gjithsej", Emri: name, Telefoni: phone })
      .then(function () {
        K.save(KJ, { plan: p.id, term: st.term, name: name, at: Date.now() });
        $("joinForm").hidden = true; $("joinDone").hidden = false;
        $("joinDoneTxt").textContent = t("Faleminderit, " + name + ". Abonimi juaj ju pret në recepsion; ju shkruajmë sot për ditën e parë.", "Thanks, " + name + ". Your membership is waiting at reception; we'll message you today about your first day.");
      }).catch(function () { $("jErr").textContent = t("Nuk u dërgua. Provoni sërish.", "Not sent. Please try again."); })
      .then(function () { $("jSend").disabled = false; });
  });

  /* ---------- trial ---------- */
  var PARTS = { morn: { sq: "Mëngjes 6–12", en: "Morning 6–12", h: 9 }, mid: { sq: "Pasdite 12–17", en: "Afternoon 12–17", h: 14 }, eve: { sq: "Mbrëmje 17–23", en: "Evening 17–23", h: 18 } };
  var GOALS = { lose: { sq: "Të dobësohem", en: "Lose weight" }, str: { sq: "Forcë", en: "Strength" }, fit: { sq: "Kondicion", en: "Fitness" }, box: { sq: "Boks", en: "Boxing" } };
  function pills(id, items, key, onPick) {
    var box = $(id); box.innerHTML = "";
    items.forEach(function (it) {
      var b = document.createElement("button"); b.type = "button"; b.className = "pill"; b.textContent = it.label; b.disabled = !!it.disabled;
      b.setAttribute("aria-pressed", String(st[key] === it.v));
      b.addEventListener("click", function () { st[key] = it.v; onPick && onPick(); renderTrial(); });
      box.appendChild(b);
    });
  }
  function renderTrial() {
    var days = [];
    for (var d = 0; d < 7; d++) {
      var day = K.day0(new Date()); day.setDate(day.getDate() + d);
      var oh = S.hours[day.getDay()], ok = !!oh;
      if (d === 0 && oh) ok = new Date().getHours() < +oh[1].slice(0, 2) - 2;
      days.push({ v: day.getTime(), label: K.dayLabel(day, true).split(",")[0] + " " + day.getDate(), disabled: !ok });
    }
    if (!st.tDay || days.find(function (x) { return x.v === st.tDay && x.disabled; })) st.tDay = (days.find(function (x) { return !x.disabled; }) || {}).v;
    pills("tDays", days, "tDay");
    var wd = new Date(st.tDay).getDay(), oh2 = S.hours[wd] || ["06:00", "23:00"];
    pills("tPart", Object.keys(PARTS).map(function (k) { var c = +oh2[0].slice(0, 2), e = +oh2[1].slice(0, 2); var range = { morn: [6, 12], mid: [12, 17], eve: [17, 23] }[k]; return { v: k, label: t(PARTS[k]), disabled: range[1] <= c || range[0] >= e }; }), "tPart");
    pills("tGoal", Object.keys(GOALS).map(function (k) { return { v: k, label: t(GOALS[k]) }; }), "tGoal");
  }
  $("tSend").addEventListener("click", function () {
    var name = $("tName").value.trim(), phone = $("tPhone").value.trim(), err = $("tErr");
    if (!st.tDay) { err.textContent = t("Zgjidhni ditën.", "Pick a day."); return; }
    if (!name) { err.textContent = t("Shkruani emrin.", "Please enter your name."); $("tName").focus(); return; }
    if (phone.replace(/\D/g, "").length < 8) { err.textContent = t("Shkruani një numër telefoni të saktë.", "Please enter a valid phone number."); $("tPhone").focus(); return; }
    if (K.saved(KT).some(function (x) { return x.phone.replace(/\D/g, "") === phone.replace(/\D/g, ""); })) { err.textContent = t("Ky numër e ka marrë tashmë ditën e provës.", "This number already has a trial day."); return; }
    err.textContent = "";
    var code = K.code("VR"), part = PARTS[st.tPart], day = new Date(st.tDay);
    $("tSend").disabled = true;
    K.submit(S, "Ditë prove: " + name + ", " + K.dayLabel(day) + " (" + part.sq + ")", { Kodi: code, Dita: K.dayLabel(day), Koha: part.sq, Qellimi: st.tGoal ? GOALS[st.tGoal].sq : "-", Emri: name, Telefoni: phone })
      .then(function (r) {
        K.save(KT, { code: code, day: st.tDay, part: st.tPart, goal: st.tGoal, name: name, phone: phone });
        $("trialForm").hidden = true; $("tPass").hidden = false; $("tCode").textContent = code;
        $("tInfo").textContent = K.dayLabel(day) + ", " + t(part).toLowerCase() + ". " + t("Tregojeni kodin në recepsion. ", "Show the code at reception. ") + (r.demo ? t("(Demo: në faqen e vërtetë recepsioni e merr menjëherë.)", "(Demo: on the live site reception gets it instantly.)") : "");
        var s = new Date(day); s.setHours(part.h, 0, 0, 0);
        $("tIcs").onclick = function () { K.ics("vrull-" + code, [{ start: s.getTime(), end: s.getTime() + 90 * 6e4, title: "Vrull Fitness: dita e provës (" + code + ")", where: S.address }]); };
        $("tWa").href = K.wa(S.whatsapp, "Përshëndetje Vrull, mora ditën e provës për " + K.dayLabel(day) + " (" + part.sq + "). Kodi " + code + ". " + name);
        $("tPass").focus();
      }).catch(function () { err.textContent = t("Nuk u dërgua. Provoni sërish.", "Not sent. Please try again."); })
      .then(function () { $("tSend").disabled = false; });
  });

  /* ---------- the rest ---------- */
  function renderCoaches() {
    var box = $("coaches"); box.innerHTML = "";
    S.coaches.forEach(function (c) {
      var n = S.classes.filter(function (x) { return x.coach === c.id; }).length;
      var el = document.createElement("article"); el.className = "coach";
      el.innerHTML = '<div class="ini" aria-hidden="true"></div><h3></h3><p></p><small></small>';
      el.querySelector(".ini").textContent = c.name[0]; el.querySelector("h3").textContent = c.name; el.querySelector("p").textContent = t(c.tag);
      el.querySelector("small").textContent = n + t(" klasa në javë", " classes a week");
      box.appendChild(el);
    });
  }
  function renderHours() {
    var wd = new Date().getDay(), rows = "";
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) { var h = S.hours[d]; rows += "<tr" + (d === wd ? ' class="today"' : "") + "><td>" + K.WD[K.lang][d] + "</td><td>" + (h ? h[0] + "–" + h[1] : t("Mbyllur", "Closed")) + "</td></tr>"; });
    $("hours").innerHTML = rows;
  }
  function renderFaq() {
    var box = $("faq"); box.innerHTML = "";
    S.faq.forEach(function (f) { var d = document.createElement("details"); d.innerHTML = "<summary></summary><p></p>"; d.querySelector("summary").textContent = t(f.q); d.querySelector("p").textContent = t(f.a); box.appendChild(d); });
  }
  function renderMarquee() {
    var tr = $("track"); tr.innerHTML = "";
    var words = Object.keys(S.types).map(function (k) { return t(S.types[k]); }).concat([t("Pesha të lira", "Free weights"), t("Trajner personal", "Personal coach")]);
    for (var r = 0; r < 4; r++) words.forEach(function (w) { var s = document.createElement("span"); s.textContent = w; tr.appendChild(s); });
  }
  function renderStaff() {
    var d0 = K.day0(new Date()).getTime(), d1 = d0 + 864e5, occ = occurrences().filter(function (o) { return o.start >= d0 && o.start < d1; });
    var trials = K.saved(KT).filter(function (x) { return x.day >= d0 && x.day < d0 + 7 * 864e5; }).length, joins = K.saved(KJ).length;
    var people = occ.reduce(function (a, o) { return a + o.taken; }, 0);
    $("kpis").innerHTML = "";
    [[occ.length, t("klasa sot", "classes today")], [people, t("vende të zëna", "spots booked")], [trials, t("ditë prove këtë javë", "trial days this week")], [joins, t("anëtarë të rinj online", "new members online")]].forEach(function (k) { var d = document.createElement("div"); d.innerHTML = "<b></b><span></span>"; d.querySelector("b").textContent = k[0]; d.querySelector("span").textContent = k[1]; $("kpis").appendChild(d); });
    var box = $("roster"); box.innerHTML = "";
    if (!occ.length) { box.innerHTML = "<p></p>"; box.firstChild.textContent = t("Sot nuk ka klasa.", "No classes today."); return; }
    occ.forEach(function (o) {
      var r = document.createElement("div"); r.innerHTML = "<b></b><span></span><span><em></em> <span class=\"wl\"></span></span>";
      r.querySelector("b").textContent = o.at; r.querySelector("span").textContent = t(S.types[o.type]) + " · " + coachBy(o.coach).name;
      r.querySelector("em").textContent = o.taken + "/" + o.cap; r.querySelector(".wl").textContent = o.wait ? t("pritje ", "waitlist ") + o.wait : "";
      box.appendChild(r);
    });
  }
  document.querySelectorAll("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d || e.target.hasAttribute("data-close")) d.close(); });
  });
  $("openStaff").addEventListener("click", function () { renderStaff(); $("staffDlg").showModal(); });

  /* ---------- motion: stretch the headline and push the marquee with scroll speed ---------- */
  (function () {
    var kin = $("kin"), lines = kin.querySelectorAll("span"), track = $("track"), img = $("bandImg");
    if (K.reduced) { lines.forEach(function (l) { l.style.setProperty("--w", "75%"); }); return; }
    var last = window.scrollY, vel = 0, x = 0, intro = 0, t0 = performance.now();
    function frame(now) {
      var y = window.scrollY, dy = y - last; last = y;
      vel = vel * .88 + dy * .12;
      intro = Math.min(1, (now - t0) / 1100);
      var ease = 1 - Math.pow(1 - intro, 3);
      var p = Math.min(1, y / 500);
      lines.forEach(function (l, i) {
        var w = 62 + ease * 13 + p * (i ? 45 : 30) + Math.min(14, Math.abs(vel) * .6);
        l.style.setProperty("--w", Math.min(125, w).toFixed(1) + "%");
      });
      x -= .6 + Math.abs(vel) * .5;
      var half = track.scrollWidth / 2; if (half && -x > half) x += half;
      track.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) img.style.transform = "translate3d(0," + (-(1 - (r.bottom / (innerHeight + r.height))) * 14).toFixed(2) + "%,0)";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  function renderAll() { renderCrowd(); renderFilters(); renderWeek(); renderTerms(); renderPlans(); renderTrial(); renderCoaches(); renderHours(); renderFaq(); renderMarquee(); }
  K.onLang(renderAll);
  K.i18n({
    "demo": 'This is a <b>concept project</b> by <a href="../../">Nisja Studio</a>. The gym is fictional.', "demo.staff": "Reception panel",
    "nav.classes": "Classes", "nav.plans": "Memberships", "nav.trial": "Free trial", "nav.visit": "Visit", "cta.trial": "Try free",
    "h.l1": "Get", "h.l2": "moving.", "h.lead": "Gym, group classes and coaches in Prizren. See how busy it is right now, book your spot in a class and try a day without paying a thing.",
    "h.cta": "Get your free day", "h.cta2": "Class timetable", "h.alt": "Weights room with rows of machines in low light",
    "st1": "of training space", "st2": "classes a week", "st3": "open every weekday", "st4": "your first day",
    "c.title": "How busy is it?", "k.title": "This week's classes", "k.lead": "Tap a class to book your spot. When it fills up, join the waitlist and the spot passes to you automatically if someone cancels.",
    "p.title": "Memberships", "p.student": "Student or pupil",
    "t.title": "One day, free", "t.lead": "No card, no commitment. Pick the day, get your code and show it at reception. A coach meets you and shows you the machines.",
    "t.day": "Day", "t.part": "When are you coming?", "t.goal": "Your goal", "t.send": "Get my trial code", "t.pass": "Your code", "t.ics": "Add to calendar", "t.wa": "Send on WhatsApp",
    "f.name": "Name", "f.phone": "Phone",
    "fl.title": "Inside", "fl.lead": "Free weights up to 50 kg, a full-size boxing ring, a functional zone with kettlebells and a spin room with 16 bikes.",
    "fl1": "Cardio with a view", "fl2": "Boxing", "fl3": "Free weights", "fl4": "Strength", "fl5": "Functional zone", "fl6": "Main floor",
    "co.title": "Coaches", "co.lead": "The same people you see in class are available for personal sessions.",
    "v.title": "Find us", "v.maps": "Open in Google Maps", "v.park": "Free parking for members behind the building.", "faq.title": "Questions",
    "foot": 'Concept site by <a href="../../">Nisja Studio</a>. Photos: Unsplash.',
    "close": "Close", "ok": "Done", "j.title": "Become a member", "j.send": "Reserve membership", "j.fine": "Pay at reception on your first day. The membership starts when you come in.",
    "s.title": "Reception, today", "s.note": "Class bookings, trial days and new members arrive by email and WhatsApp. The waitlist fills itself, no WhatsApp groups needed."
  });
  $("cMaps").href = S.maps; $("yr").textContent = new Date().getFullYear();
  if (/[?&]staff\b/.test(location.search)) { renderStaff(); $("staffDlg").showModal(); }
  setInterval(renderCrowd, 60000);
  window.VRULL = { st: st, occurrences: occurrences, price: price };
})();

