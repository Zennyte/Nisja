(function () {
  "use strict";
  var S = window.SITE, $ = K.$, t = K.t;
  var KEY = "brisk-bookings";
  var IMGS = { arben: "img/window.jpg", leart: "img/bw.jpg", dion: "img/leather.jpg" };
  var ICON = { arben: "A", leart: "L", dion: "D" };

  /* ---------- schedule data ---------- */
  var hoursFor = function (wd) { return S.hours[wd] || null; };
  var barberHours = function (b) { var h = {}; for (var d = 0; d < 7; d++) h[d] = b.off.indexOf(d) > -1 ? null : hoursFor(d); return h; };
  var demo = K.demoBusy(S.barbers.map(function (b) { return b.id; }), S.daysAhead, hoursFor, { seed: 21, load: .42, block: 30 })
    .filter(function (x) { var b = S.barbers.find(function (y) { return y.id === x.res; }); return b.off.indexOf(new Date(x.start).getDay()) === -1; });
  var busy = function () { return demo.concat(K.saved(KEY).map(function (x) { return { res: x.res, start: x.start, end: x.end, mine: true, svc: x.svc }; })); };
  var svcBy = function (id) { return S.services.find(function (s) { return s.id === id; }); };
  var barberBy = function (id) { return S.barbers.find(function (b) { return b.id === id; }); };

  var st = { svc: "cut", barber: "any", day: null, slot: null, who: null };

  function slotsFor(svcId, barberId, day) {
    var svc = svcBy(svcId);
    var res = S.barbers.filter(function (b) { return b.does.indexOf(svcId) > -1 && (barberId === "any" || b.id === barberId); })
      .map(function (b) { return { id: b.id, hours: barberHours(b) }; });
    return K.slots({ day: day, hours: hoursFor(new Date(day).getDay()), step: S.step, duration: svc.min, resources: res, busy: busy(), noticeMin: S.noticeMin });
  }
  function nextFree(svcId, barberId) {
    for (var d = 0; d < S.daysAhead; d++) {
      var day = K.day0(new Date()); day.setDate(day.getDate() + d);
      var s = slotsFor(svcId, barberId, day).find(function (x) { return x.free.length; });
      if (s) return s;
    }
    return null;
  }

  /* ---------- live chairs ---------- */
  function renderLive() {
    var now = Date.now(), wd = new Date().getDay(), h = hoursFor(wd), box = $("live");
    var openTxt;
    if (h) {
      var o = new Date(); o.setHours(+h[0].slice(0, 2), +h[0].slice(3), 0, 0);
      var c = new Date(); c.setHours(+h[1].slice(0, 2), +h[1].slice(3), 0, 0);
      openTxt = now < o ? t("Hapet sot në ", "Opens today at ") + h[0] : now < c ? t("Hapur deri ", "Open until ") + h[1] : t("Mbyllur për sot", "Closed for today");
    } else openTxt = t("Mbyllur sot", "Closed today");
    $("openNow").textContent = openTxt;
    box.querySelectorAll(".chair").forEach(function (e) { e.remove(); });
    S.barbers.forEach(function (b) {
      var bh = barberHours(b)[wd], s = "off", line;
      if (!bh) line = t("Pushim sot", "Day off today");
      else {
        var o = new Date(); o.setHours(+bh[0].slice(0, 2), +bh[0].slice(3), 0, 0);
        var c = new Date(); c.setHours(+bh[1].slice(0, 2), +bh[1].slice(3), 0, 0);
        if (now < o.getTime()) line = t("Fillon në ", "Starts at ") + bh[0];
        else if (now >= c.getTime()) line = t("Mbaroi për sot", "Done for today");
        else {
          var mine = busy().filter(function (x) { return x.res === b.id; }).sort(function (a, z) { return a.start - z.start; });
          var cur = mine.find(function (x) { return x.start <= now && now < x.end; });
          if (cur) {
            var end = cur.end; mine.forEach(function (x) { if (x.start <= end && x.end > end) end = x.end; });
            s = "busy"; line = t("Me klient deri ", "With a client until ") + K.hm(end);
          } else {
            var nx = mine.find(function (x) { return x.start > now && x.start < c.getTime(); });
            s = "free"; line = nx ? t("I lirë tani, deri ", "Free now, until ") + K.hm(nx.start) : t("I lirë tani", "Free now");
          }
        }
      }
      var el = document.createElement("div"); el.className = "chair"; el.dataset.s = s;
      el.innerHTML = '<i class="dot"></i><b></b><span></span>';
      el.querySelector("b").textContent = b.name; el.querySelector("span").textContent = line;
      box.appendChild(el);
    });
  }

  /* ---------- menu board ---------- */
  function renderBoard() {
    var box = $("board"); box.innerHTML = "";
    S.services.forEach(function (s) {
      var b = document.createElement("button"); b.type = "button"; b.className = "svc";
      b.innerHTML = '<span class="n"></span><span class="p"></span><span class="d"></span><span class="m"></span>';
      b.querySelector(".n").textContent = t(s.name); b.querySelector(".p").textContent = K.eur(s.price);
      b.querySelector(".d").textContent = t(s.note); b.querySelector(".m").textContent = s.min + " min";
      b.addEventListener("click", function () { pickSvc(s.id); K.smooth("#termini"); });
      box.appendChild(b);
    });
  }

  /* ---------- booking UI ---------- */
  function pressed(box, attr, val) { box.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset[attr] === String(val))); }); }

  function renderSvcChips() {
    var box = $("svcChips"); box.innerHTML = "";
    S.services.forEach(function (s) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.id = s.id;
      b.innerHTML = '<span></span><small></small>';
      b.querySelector("span").textContent = t(s.name); b.querySelector("small").textContent = K.eur(s.price) + " · " + s.min + " min";
      b.addEventListener("click", function () { pickSvc(s.id); });
      box.appendChild(b);
    });
    pressed(box, "id", st.svc);
  }
  function pickSvc(id) {
    st.svc = id; st.slot = null;
    if (st.barber !== "any" && barberBy(st.barber).does.indexOf(id) === -1) st.barber = "any";
    pressed($("svcChips"), "id", id); renderBarbers(); renderDays(); renderSlots(); renderSummary();
  }

  function renderBarbers() {
    var box = $("barberCards"); box.innerHTML = "";
    var list = [{ id: "any", name: t("Kushdo", "Anyone") }].concat(S.barbers);
    list.forEach(function (b) {
      var el = document.createElement("button"); el.type = "button"; el.className = "bcard"; el.dataset.id = b.id;
      if (b.id === "any") el.dataset.any = "";
      var can = b.id === "any" || !st.svc || b.does.indexOf(st.svc) > -1;
      el.disabled = !can;
      el.innerHTML = '<span class="mono" aria-hidden="true"></span><b></b><span class="nf"></span>';
      el.querySelector(".mono").textContent = b.id === "any" ? "?" : ICON[b.id];
      el.querySelector("b").textContent = b.name;
      var nf = el.querySelector(".nf");
      if (!can) nf.textContent = t("Nuk e bën këtë shërbim", "Doesn't do this service");
      else if (!st.svc) nf.textContent = b.id === "any" ? t("Berberi i parë i lirë", "First free barber") : t(b.tag);
      else {
        var n = nextFree(st.svc, b.id);
        if (!n) nf.textContent = t("Plot në 2 javët e ardhshme", "Full for the next 2 weeks");
        else {
          var lbl = K.dayLabel(n.t, true).split(",")[0];
          nf.innerHTML = t("I lirë: ", "Free: ") + "<em></em>"; nf.querySelector("em").textContent = lbl + " " + n.label;
        }
      }
      el.addEventListener("click", function () { st.barber = b.id; st.slot = null; pressed(box, "id", b.id); renderDays(); renderSlots(); renderSummary(); });
      box.appendChild(el);
    });
    pressed(box, "id", st.barber);
  }

  function renderDays() {
    var box = $("days"); box.innerHTML = "";
    if (!st.day) st.day = K.day0(new Date()).getTime();
    for (var d = 0; d < S.daysAhead; d++) {
      var day = K.day0(new Date()); day.setDate(day.getDate() + d);
      var b = document.createElement("button"); b.type = "button"; b.className = "day"; b.dataset.t = day.getTime();
      var closed = !hoursFor(day.getDay());
      if (!closed && st.svc) closed = !slotsFor(st.svc, st.barber, day).some(function (x) { return x.free.length; });
      b.disabled = closed;
      b.innerHTML = "<span></span><b></b>";
      b.querySelector("span").textContent = d === 0 ? t("Sot", "Today") : d === 1 ? t("Nesër", "Tmrw") : K.WS[K.lang][day.getDay()];
      b.querySelector("b").textContent = day.getDate();
      b.title = K.dayLabel(day);
      if (closed) { var sr = document.createElement("span"); sr.className = "sr"; sr.textContent = t(" plot", " full"); b.appendChild(sr); }
      (function (ts) { b.addEventListener("click", function () { st.day = ts; st.slot = null; pressed(box, "t", ts); renderSlots(); renderSummary(); }); })(day.getTime());
      box.appendChild(b);
    }
    var cur = box.querySelector('[data-t="' + st.day + '"]');
    if (cur && cur.disabled) { var first = box.querySelector("button:not(:disabled)"); if (first) st.day = +first.dataset.t; }
    pressed(box, "t", st.day);
  }

  function renderSlots() {
    var box = $("slots"); box.innerHTML = "";
    if (!st.svc) { box.innerHTML = '<p class="empty"></p>'; box.firstChild.textContent = t("Zgjidhni shërbimin më lart për të parë orët.", "Pick a service above to see times."); $("slotHint").textContent = ""; return; }
    var list = slotsFor(st.svc, st.barber, st.day);
    var free = list.filter(function (x) { return x.free.length; }).length;
    $("slotHint").textContent = free ? free + t(" orë të lira", " free times") : "";
    if (!list.length) { box.innerHTML = '<p class="empty"></p>'; box.firstChild.textContent = t("S'ka më orë për këtë ditë. Provoni nesër.", "No more times this day. Try tomorrow."); return; }
    list.forEach(function (s) {
      var b = document.createElement("button"); b.type = "button"; b.className = "slot"; b.dataset.t = s.t; b.textContent = s.label;
      b.disabled = !s.free.length;
      if (b.disabled) { var sr = document.createElement("span"); sr.className = "sr"; sr.textContent = t(" e zënë", " taken"); b.appendChild(sr); }
      b.addEventListener("click", function () { st.slot = s.t; st.who = pickWho(s); pressed(box, "t", s.t); renderSummary(); });
      box.appendChild(b);
    });
    pressed(box, "t", st.slot);
  }
  /* "Anyone": give it to the free barber with the lightest day, so work spreads evenly */
  function pickWho(s) {
    if (st.barber !== "any") return st.barber;
    var d0 = K.day0(s.t).getTime(), d1 = d0 + 864e5;
    var load = function (id) { return busy().filter(function (x) { return x.res === id && x.start >= d0 && x.start < d1; }).length; };
    return s.free.slice().sort(function (a, b) { return load(a) - load(b); })[0];
  }

  function renderSummary() {
    var svc = st.svc && svcBy(st.svc);
    $("sSvc").textContent = svc ? t(svc.name) : "-";
    $("sBarber").textContent = st.slot ? barberBy(st.who).name + (st.barber === "any" ? t(" (i pari i lirë)", " (first free)") : "") : st.barber === "any" ? t("Kushdo", "Anyone") : barberBy(st.barber).name;
    $("sWhen").textContent = st.slot ? K.dayLabel(st.slot, true) + ", " + K.hm(st.slot) : "-";
    $("sDur").textContent = svc ? K.dur(svc.min) : "-";
    $("sTot").textContent = K.eur(svc ? svc.price : 0);
    $("confirm").disabled = !(svc && st.slot);
  }

  $("confirm").addEventListener("click", function () {
    var name = $("fName").value.trim(), phone = $("fPhone").value.trim(), err = $("err");
    if (!name) { err.textContent = t("Shkruani emrin.", "Please enter your name."); $("fName").focus(); return; }
    if (phone.replace(/\D/g, "").length < 8) { err.textContent = t("Shkruani një numër telefoni të saktë.", "Please enter a valid phone number."); $("fPhone").focus(); return; }
    var svc = svcBy(st.svc), start = st.slot, end = start + svc.min * 6e4, who = st.who;
    /* re-check: someone may have taken the chair while the form was open */
    var clash = busy().some(function (x) { return x.res === who && x.start < end && start < x.end; });
    if (clash) { err.textContent = t("Kjo orë sapo u zu. Zgjidhni një tjetër.", "That time was just taken. Pick another."); st.slot = null; renderSlots(); renderSummary(); return; }
    err.textContent = "";
    var code = K.code("BR"), b = barberBy(who);
    var when = K.dayLabel(start) + ", " + K.hm(start) + "–" + K.hm(end);
    var btn = $("confirm"); btn.disabled = true; btn.textContent = t("Duke dërguar…", "Sending…");
    K.submit(S, "Termin i ri " + code + ": " + svc.name.sq + ", " + b.name + ", " + K.hm(start), {
      Kodi: code, Sherbimi: svc.name.sq, Berberi: b.name, Kur: when, Cmimi: "€" + svc.price, Emri: name, Telefoni: phone, Shenim: $("fNote").value.trim() || "-"
    }).then(function (r) {
      K.save(KEY, { code: code, res: who, svc: svc.id, start: start, end: end, name: name });
      showTicket(code, svc, b, start, end, name, r.demo);
    }).catch(function () {
      err.textContent = t("Nuk u dërgua. Kontrolloni internetin ose na telefononi.", "Not sent. Check your connection or call us.");
    }).then(function () { btn.textContent = t("Konfirmo terminin", "Confirm booking"); renderSummary(); });
  });

  function showTicket(code, svc, b, start, end, name, demoMode) {
    $("bookForm").hidden = true; $("done").hidden = false;
    $("tCode").textContent = t("Kodi ", "Code ") + code;
    $("tSvc").textContent = t(svc.name); $("tBarber").textContent = b.name;
    $("tWhen").textContent = K.dayLabel(start, true) + ", " + K.hm(start); $("tTot").textContent = K.eur(svc.price);
    $("tMsg").textContent = demoMode ? t("Demo: në faqen e vërtetë berberi merr këtë termin menjëherë në email dhe WhatsApp.", "Demo: on the live site the barber gets this booking instantly by email and WhatsApp.") : t("Berberi u njoftua në email. Ju presim!", "The barber has been notified by email. See you soon!");
    var msg = "Përshëndetje Brisk, kam rezervuar: " + svc.name.sq + " me " + b.name + ", " + K.dayLabel(start) + " " + K.hm(start) + ". Kodi " + code + ". " + name;
    $("tWa").href = K.wa(S.whatsapp, msg);
    $("tIcs").onclick = function () { K.ics("brisk-" + code, [{ start: start, end: end, title: "Brisk Barber Club: " + t(svc.name) + " (" + b.name + ")", where: S.address }]); };
    $("ticket").focus(); K.smooth("#termini");
    renderLive(); renderBarbers(); renderAgenda();
  }
  $("tAgain").addEventListener("click", function () {
    st.slot = null; $("done").hidden = true; $("bookForm").hidden = false; renderDays(); renderSlots(); renderSummary();
  });

  /* ---------- team, hours, faq ---------- */
  function renderTeam() {
    var box = $("team"); box.innerHTML = "";
    S.barbers.forEach(function (b) {
      var off = b.off.map(function (d) { return K.WD[K.lang][d]; }).join(", ");
      var el = document.createElement("article"); el.className = "member";
      el.innerHTML = '<img loading="lazy" alt="" width="900" height="1350"><span class="big" aria-hidden="true"></span><div class="cap"><small></small><h3></h3><p></p></div>';
      el.querySelector("img").src = IMGS[b.id];
      el.querySelector(".big").textContent = ICON[b.id];
      el.querySelector("small").textContent = t("Në karrige që nga ", "In the chair since ") + b.since + " · " + t("pushim: ", "day off: ") + off;
      el.querySelector("h3").textContent = b.name; el.querySelector("p").textContent = t(b.tag);
      box.appendChild(el);
    });
  }
  function renderHours() {
    var tb = $("hours"), wd = new Date().getDay(), rows = "";
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
      var h = S.hours[d];
      rows += '<tr' + (d === wd ? ' class="today"' : "") + "><td>" + K.WD[K.lang][d] + (d === wd ? t(" (sot)", " (today)") : "") + "</td><td>" + (h ? h[0] + "–" + h[1] : t("Mbyllur", "Closed")) + "</td></tr>";
    });
    tb.innerHTML = rows;
  }
  function renderFaq() {
    var box = $("faq"); box.innerHTML = "";
    S.faq.forEach(function (f) { var d = document.createElement("details"); d.innerHTML = "<summary></summary><p></p>"; d.querySelector("summary").textContent = t(f.q); d.querySelector("p").textContent = t(f.a); box.appendChild(d); });
  }

  /* ---------- staff view ---------- */
  var DEMO_SVC = { 30: "cut", 60: "combo" };
  function renderAgenda() {
    var d0 = K.day0(new Date()).getTime(), d1 = d0 + 864e5, now = Date.now(), box = $("agenda"), total = 0, count = 0, mineN = 0;
    box.innerHTML = "";
    S.barbers.forEach(function (b) {
      var list = busy().filter(function (x) { return x.res === b.id && x.start >= d0 && x.start < d1; }).sort(function (a, z) { return a.start - z.start; });
      var col = document.createElement("div"), sum = 0;
      col.innerHTML = "<h4></h4><div class=\"sum\"></div>";
      col.querySelector("h4").textContent = b.name;
      if (b.off.indexOf(new Date().getDay()) > -1) { col.querySelector(".sum").textContent = t("Pushim sot", "Day off today"); box.appendChild(col); return; }
      list.forEach(function (x) {
        var svc = svcBy(x.svc || DEMO_SVC[(x.end - x.start) / 6e4] || "cut"); sum += svc.price;
        var r = document.createElement("div"); r.className = "appt" + (x.mine ? " new" : "") + (x.end < now ? " past" : "");
        r.innerHTML = "<b></b><span></span>"; r.querySelector("b").textContent = K.hm(x.start);
        r.querySelector("span").textContent = t(svc.name) + (x.mine ? t(" · online, i ri", " · online, new") : "");
        col.appendChild(r); if (x.mine) mineN++;
      });
      if (!list.length) { var e = document.createElement("p"); e.className = "sum"; e.textContent = t("Asnjë termin ende.", "No bookings yet."); col.appendChild(e); }
      col.querySelector(".sum").textContent = list.length + t(" termine · ", " bookings · ") + K.eur(sum);
      total += sum; count += list.length; box.appendChild(col);
    });
    $("kpis").innerHTML = "";
    [[count, t("termine sot", "bookings today")], [K.eur(total), t("të pritshme sot", "expected today")], [mineN, t("rezervuar online nga ju", "booked online by you")]].forEach(function (k) {
      var d = document.createElement("div"); d.innerHTML = "<b></b><span></span>"; d.querySelector("b").textContent = k[0]; d.querySelector("span").textContent = k[1]; $("kpis").appendChild(d);
    });
  }
  var dlg = $("staff");
  $("openStaff").addEventListener("click", function () { renderAgenda(); dlg.showModal(); });
  $("closeStaff").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  /* ---------- barber pole: base spin, faster while scrolling ---------- */
  (function () {
    var el = $("poleStripes"); if (!el || K.reduced) return;
    var y = 0, v = 0, last = window.scrollY, period = 58 * Math.SQRT2;
    function frame() {
      var sy = window.scrollY; v = v * .9 + Math.abs(sy - last) * .1; last = sy;
      y = (y + .35 + v * .35) % period; el.style.transform = "translateY(" + (-y).toFixed(2) + "px)";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  function renderAll() { renderLive(); renderBoard(); renderSvcChips(); renderBarbers(); renderDays(); renderSlots(); renderSummary(); renderTeam(); renderHours(); renderFaq(); }

  K.onLang(renderAll);
  K.i18n({
    "demo": 'This is a <b>concept project</b> by <a href="../../">Nisja Studio</a>. The barber shop is fictional.',
    "demo.staff": "See it the way the barber does",
    "nav.prices": "Prices", "nav.book": "Booking", "nav.team": "Barbers", "nav.visit": "Visit", "cta.book": "Book",
    "hero.alt": "Barber shop interior: leather chairs, brick walls and warm lights",
    "hero.l1": "Your chair.", "hero.l2": "Your time.",
    "hero.lead": "Pick your barber, see his free times and take the chair in 30 seconds. No phone calls, no waiting in line.",
    "hero.cta": "Book a time", "hero.cta2": "See prices", "hero.since": "Rr. Agim Ramadani, Prishtina. In the chair since 2011.",
    "live.title": "In the chair now",
    "prices.title": "Prices", "prices.lead": "The price you see is the price you pay. Tap a service and we'll put it straight into your booking.",
    "prices.foot": "Pay at the shop, cash or card.",
    "book.title": "Take the chair", "book.lead": "Free times update with every booking. If nothing fits, choose \"Anyone\" and we'll give you the first free barber.",
    "s1": "Service", "s2": "Barber", "s2.hint": "with his first free time", "s3": "Day", "s4": "Time", "s5": "Who's coming",
    "f.name": "Name", "f.phone": "Phone", "f.note": "Note for the barber (optional)", "f.note.ph": "e.g. sides only, keep the top long",
    "sum.title": "Your booking", "sum.svc": "Service", "sum.barber": "Barber", "sum.when": "When", "sum.dur": "Takes", "sum.total": "To pay at the shop",
    "sum.confirm": "Confirm booking", "sum.fine": "Free cancellation up to 2 hours before. Nothing is paid online.",
    "t.title": "The chair is yours", "t.ics": "Add to calendar", "t.wa": "Send on WhatsApp", "t.again": "Book another",
    "team.title": "Three chairs", "team.lead": "Each has his own style and his own day off. The booking system knows both.",
    "visit.title": "Find us", "visit.maps": "Open in Google Maps", "visit.park": "Public parking 50 m away, in front of the Youth Palace.",
    "faq.title": "Questions",
    "foot": 'Concept site by <a href="../../">Nisja Studio</a>. Photos: Unsplash.',
    "staff.title": "Today, for the staff", "staff.close": "Close",
    "staff.note": "New bookings show in red. The owner gets every booking by email and WhatsApp without opening the site."
  });

  $("cMaps").href = S.maps; $("yr").textContent = new Date().getFullYear();
  if (/[?&]staff\b/.test(location.search)) { renderAgenda(); dlg.showModal(); }
  setInterval(renderLive, 60000);
  K.reveal();
  requestAnimationFrame(function () { $("hero").classList.add("ready"); });
  window.BRISK = { st: st, slotsFor: slotsFor, nextFree: nextFree, busy: busy };
})();

