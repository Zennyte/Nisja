/* Vila Kroni: 12-month availability, a live quote by date, space, guests and menu, date holds and visit booking. Settings live in data.js. */
(function () {
  "use strict";
  var D = window.KRONI, $ = K.$, t = K.t, pad = K.pad;

  K.i18n({
    "demo": "This is a <b>concept project</b> by <a href=\"../../\">Nisja Studio</a>. The villa and the dates do not exist.",
    "nav.spaces": "Spaces", "nav.dates": "Dates and prices", "nav.day": "The day", "nav.visit": "Visit", "cta.dates": "See dates",
    "h.alt": "Newlyweds walking on a hill at sunset",
    "h.title": "Your wedding,<em>among the vineyards.</em>",
    "h.lead": "An olive garden, a stone hall and a terrace over the Rahovec valley, for 40 to 400 guests. See which dates are free and what your day costs, before you call us.",
    "h.cta": "Find our date", "h.cta2": "Book a visit",
    "s.title": "Three spaces, one day",
    "s.lead": "Many couples hold the ceremony in the garden and the dinner in the hall. The villa price includes every space you need that day.",
    "p.title": "Dates and prices",
    "p.lead": "Choose a free date, how many guests you have and the menu. The price changes with the day and the season, and here you see all of it, with no surprises.",
    "p.yearA": "Free Saturdays by month", "p.prev": "Previous month", "p.next": "Next month", "p.calA": "Calendar",
    "p.k1": "Free", "p.k2": "Free, high season", "p.k3": "Taken or too soon",
    "p.qT": "Your estimate", "p.space": "Main space", "p.guests": "Guests", "p.menu": "Menu", "p.extras": "Extras",
    "p.bEx": "Extras", "p.bTot": "Total",
    "p.names": "Your names", "p.namesPh": "Arta and Blerim", "p.phone": "Phone", "p.email": "Email (optional)",
    "p.okT": "The date is held for you", "p.new": "Look at another date",
    "d.alt": "Ceremony aisle with flowers and white chairs", "d.title": "How the day flows",
    "d.lead": "One of our coordinators is with you from morning to the end, so you never have to watch the clock.",
    "d.1": "Ceremony in the garden", "d.1a": "Under the olive arch, with 200 chairs and live music.",
    "d.2": "Drinks on the terrace", "d.2a": "Wine from the nearby vineyards and small plates, while the photographer works.",
    "d.3": "Dinner in the hall", "d.3a": "Long tables, the menu you chose, the speeches.",
    "d.4": "The first dance", "d.4a": "Then dancing until midnight, with a DJ or a band.",
    "d.5": "Closing", "d.5a": "We arrange the taxis, and the bridal suite is ready.",
    "g.1": "Long wedding table with flowers", "g.2": "The bride with her bouquet", "g.3": "Ceremony arch with flowers", "g.4": "Wedding rings",
    "v.title": "Come and see it", "v.lead": "A 45-minute walk with the coordinator, a short menu tasting and a glass of wine. No obligation.",
    "v.dayA": "Visit day", "v.timeA": "Visit time", "v.note": "Saturdays and Sundays during the day, other days after work.",
    "v.when": "When are you getting married, roughly?", "v.whenPh": "e.g. June 2027", "v.send": "Book the visit", "v.okT": "Visit booked", "v.ics": "Add to calendar",
    "i.title": "Getting here", "i.map": "Open in Google Maps", "i.lead": "25 minutes from Prizren, 50 from Prishtina. Parking for 150 cars.",
    "q.1": "What does the villa price include?", "q.1a": "Every space for the day, tables, chairs, linen, lighting, the coordinator and cleaning. Food and extras are charged separately.",
    "q.2": "How much is the deposit?", "q.2a": "20% of the total when you sign the contract. The date is held free for 7 days before that.",
    "q.3": "What if it rains on the garden?", "q.3a": "We have a large marquee ready, or we move the ceremony into the hall. We decide together two days before.",
    "q.4": "Can we bring our own sweets?", "q.4a": "Yes, you can bring the cake and traditional sweets yourselves, at no extra cost.",
    "foot": "Concept project by"
  });

  var eur = function (n) { return "€" + Math.round(n).toLocaleString("de-DE").replace(/\./g, " "); };
  var dayKey = function (d) { d = new Date(d); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var today = K.day0(new Date());
  var firstBookable = new Date(today); firstBookable.setDate(today.getDate() + D.minNoticeDays);

  /* ---------- availability ---------- */
  function demoBooked(d) {
    var s = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(); s = (s * 9301 + 49297) % 233280; var r = s / 233280;
    var m = d.getMonth() + 1, wd = d.getDay(), peak = D.seasons[m] === 1;
    var p = wd === 6 ? (peak ? .62 : .3) : wd === 5 || wd === 0 ? (peak ? .35 : .12) : .04;
    var monthsAway = (d - today) / (30 * 864e5); p *= Math.max(.35, 1 - monthsAway / 16); // the far future is emptier
    return r < p;
  }
  function held(d) { return K.saved("kroni-holds").some(function (h) { return h.day === dayKey(d); }); }
  function status(d) { if (d < firstBookable) return "soon"; if (demoBooked(d) || held(d)) return "booked"; return "free"; }
  function hire(d) { return Math.round(D.hire[d.getDay()] * D.seasons[d.getMonth() + 1] / 10) * 10; }
  function short(n) { return n >= 1000 ? "€" + (n / 1000).toFixed(n % 1000 ? 1 : 0).replace(".", K.lang === "sq" ? "," : ".") + "k" : "€" + n; }

  var Q = { date: null, month: 0, space: "garden", guests: 180, menu: "home", ex: { dj: true, flowers: true } };
  function monthStart(off) { var d = new Date(today.getFullYear(), today.getMonth() + off, 1); return d; }
  function freeSaturdays(off) {
    var m0 = monthStart(off), n = 0, d = new Date(m0);
    while (d.getMonth() === m0.getMonth()) { if (d.getDay() === 6 && status(d) === "free") n++; d.setDate(d.getDate() + 1); }
    return n;
  }
  function renderYear() {
    var box = $("year"); box.innerHTML = ""; var total = 0;
    for (var i = 0; i < 12; i++) {
      var n = freeSaturdays(i), m = monthStart(i); total += n;
      var b = document.createElement("button"); b.type = "button"; b.innerHTML = "<i></i><span></span>";
      b.children[0].style.height = (8 + n * 15) + "px"; b.children[1].textContent = K.MO[K.lang][m.getMonth()].slice(0, 3);
      b.setAttribute("aria-pressed", String(Q.month === i)); K.srText(b, K.MO[K.lang][m.getMonth()] + " " + m.getFullYear() + ": " + n + t(" të shtuna të lira", " free Saturdays"));
      b.title = n + t(" të shtuna të lira", " free Saturdays");
      (function (i) { b.addEventListener("click", function () { Q.month = i; renderYear(); renderCal(); }); })(i);
      box.appendChild(b);
    }
    $("freeN").textContent = total;
    var last = monthStart(11);
    $("freeT").textContent = t("të shtuna ende të lira deri në " + K.MO.sq[last.getMonth()] + " " + last.getFullYear(), "Saturdays still free until " + K.MO.en[last.getMonth()] + " " + last.getFullYear());
  }
  function renderCal() {
    var cal = $("cal"), m0 = monthStart(Q.month); cal.innerHTML = "";
    $("mName").textContent = K.MO[K.lang][m0.getMonth()].replace(/^./, function (c) { return c.toUpperCase(); }) + " " + m0.getFullYear();
    $("mPrev").disabled = Q.month === 0; $("mNext").disabled = Q.month === 11;
    [1, 2, 3, 4, 5, 6, 0].forEach(function (wd) { var s = document.createElement("span"); s.className = "wd"; s.setAttribute("aria-hidden", "true"); s.textContent = K.WS[K.lang][wd]; cal.appendChild(s); });
    for (var p = 0; p < (m0.getDay() + 6) % 7; p++) { var e = document.createElement("span"); e.className = "pad"; cal.appendChild(e); }
    var d = new Date(m0);
    while (d.getMonth() === m0.getMonth()) {
      var st = status(d), b = document.createElement("button"), price = hire(d);
      b.type = "button"; b.innerHTML = "<span></span><small></small>"; b.children[0].textContent = d.getDate();
      b.children[1].textContent = st === "free" ? short(price) : st === "booked" ? t("e zënë", "taken") : "";
      b.disabled = st !== "free";
      if (st === "booked") b.className = "booked"; else if (st === "free" && D.seasons[d.getMonth() + 1] === 1 && (d.getDay() === 6 || d.getDay() === 5 || d.getDay() === 0)) b.className = "peak";
      b.setAttribute("aria-pressed", String(Q.date === +d));
      K.srText(b, K.dayLabel(d) + ", " + (st === "free" ? t("e lirë, vila ", "free, villa ") + eur(price) : st === "booked" ? t("e zënë", "taken") : t("shumë afër", "too soon")));
      (function (dd) { b.addEventListener("click", function () { Q.date = +dd; renderCal(); paintQuote(); }); })(new Date(d));
      cal.appendChild(b);
      d.setDate(d.getDate() + 1);
    }
  }
  $("mPrev").addEventListener("click", function () { Q.month = Math.max(0, Q.month - 1); renderYear(); renderCal(); });
  $("mNext").addEventListener("click", function () { Q.month = Math.min(11, Q.month + 1); renderYear(); renderCal(); });
  (function pickDefault() {
    // the first free Saturday in high season, otherwise the first free Saturday at all
    var any = null, d = new Date(firstBookable);
    for (var i = 0; i < 365; i++, d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 6 || status(d) !== "free") continue;
      if (!any) any = new Date(d);
      if (D.seasons[d.getMonth() + 1] === 1) { any = new Date(d); break; }
    }
    if (any) { Q.date = +any; Q.month = (any.getFullYear() - today.getFullYear()) * 12 + any.getMonth() - today.getMonth(); }
  })();

  /* ---------- spaces ---------- */
  function spaceOk(s, d, guests) { if (guests > s.max) return t("deri në " + s.max + " veta", "up to " + s.max + " guests"); if (s.months && d && s.months.indexOf(new Date(d).getMonth() + 1) < 0) return t("vetëm " + K.MO.sq[s.months[0] - 1] + "–" + K.MO.sq[s.months[s.months.length - 1] - 1], "only " + K.MO.en[s.months[0] - 1] + "–" + K.MO.en[s.months[s.months.length - 1] - 1]); return ""; }
  function renderSpaces() {
    var box = $("spaces"); box.innerHTML = "";
    D.spaces.forEach(function (s) {
      var a = document.createElement("article"); a.className = "space";
      a.innerHTML = '<figure><img loading="lazy" alt=""></figure><h3></h3><div class="meta"><span></span><span></span></div><p></p>';
      a.querySelector("img").src = "img/" + s.img + ".jpg"; a.querySelector("img").alt = t(s.sq, s.en);
      a.querySelector("h3").textContent = t(s.sq, s.en);
      var m = a.querySelectorAll(".meta span"); m[0].textContent = t("Deri në " + s.max + " veta", "Up to " + s.max + " guests");
      m[1].textContent = s.months ? t(K.MO.sq[s.months[0] - 1] + " – " + K.MO.sq[s.months[s.months.length - 1] - 1], K.MO.en[s.months[0] - 1] + " – " + K.MO.en[s.months[s.months.length - 1] - 1]) : t("Gjithë vitin", "All year");
      a.querySelector("p").textContent = t(s.dsq, s.den);
      box.appendChild(a);
    });
  }

  /* ---------- quote ---------- */
  function paintQuote() {
    var d = Q.date ? new Date(Q.date) : null;
    $("qDate").textContent = d ? K.WD[K.lang][d.getDay()] + ", " + d.getDate() + " " + K.MO[K.lang][d.getMonth()] + " " + d.getFullYear() : t("Zgjidhni një datë në kalendar", "Choose a date on the calendar");
    var sp = $("qSpace"); sp.innerHTML = "";
    var cur = D.spaces.filter(function (s) { return s.id === Q.space; })[0];
    if (spaceOk(cur, Q.date, Q.guests)) { var fit = D.spaces.filter(function (s) { return !spaceOk(s, Q.date, Q.guests); })[0]; if (fit) Q.space = fit.id; }
    D.spaces.forEach(function (s) {
      var why = spaceOk(s, Q.date, Q.guests), b = document.createElement("button"); b.type = "button";
      b.innerHTML = "<b></b><span></span><small></small>"; b.children[0].textContent = t(s.sq, s.en);
      b.children[1].textContent = why || t("deri në " + s.max, "up to " + s.max);
      b.children[2].textContent = s.months ? t("Jashtë", "Outdoors") : t("Brenda", "Indoors");
      b.disabled = !!why; b.setAttribute("aria-pressed", String(Q.space === s.id));
      b.addEventListener("click", function () { Q.space = s.id; paintQuote(); });
      sp.appendChild(b);
    });
    $("qGuestsO").textContent = Q.guests;
    var mn = $("qMenu"); mn.innerHTML = "";
    D.menus.forEach(function (m) {
      var b = document.createElement("button"); b.type = "button"; b.innerHTML = "<b></b><span></span>";
      b.children[0].textContent = t(m.sq, m.en); b.children[1].textContent = eur(m.pp) + t(" / person", " / person");
      b.setAttribute("aria-pressed", String(Q.menu === m.id)); b.addEventListener("click", function () { Q.menu = m.id; paintQuote(); }); mn.appendChild(b);
    });
    var menu = D.menus.filter(function (m) { return m.id === Q.menu; })[0];
    $("qMenuDs").textContent = t(menu.dsq, menu.den);
    var ex = $("qEx");
    if (!ex.children.length || ex.dataset.lang !== K.lang) {
      ex.innerHTML = ""; ex.dataset.lang = K.lang;
      D.extras.forEach(function (x) {
        var l = document.createElement("label"); l.innerHTML = '<input type="checkbox"><span></span><span></span>';
        l.children[0].checked = !!Q.ex[x.id]; l.children[1].textContent = t(x.sq, x.en); l.children[2].textContent = eur(x.price);
        l.children[0].addEventListener("change", function () { Q.ex[x.id] = this.checked; paintQuote(); });
        ex.appendChild(l);
      });
    }
    var h = d ? hire(d) : 0, food = Q.guests * menu.pp, extras = D.extras.reduce(function (s, x) { return s + (Q.ex[x.id] ? x.price : 0); }, 0), tot = h + food + extras;
    $("bHireL").textContent = t("Vila", "Villa") + (d ? " · " + K.WD[K.lang][d.getDay()] + (D.seasons[d.getMonth() + 1] < 1 ? t(", jashtë sezonit", ", off season") : "") : "");
    $("bHire").textContent = d ? eur(h) : "–";
    $("bFoodL").textContent = t("Menyja " + t(menu.sq, menu.en).toLowerCase() + " · " + Q.guests + " × " + eur(menu.pp), menu.en + " menu · " + Q.guests + " × " + eur(menu.pp));
    $("bFood").textContent = eur(food); $("bEx").textContent = eur(extras); $("bTot").textContent = eur(tot);
    $("bPp").textContent = t(eur(tot / Q.guests) + " për të ftuar · paradhënie " + eur(tot * D.deposit), eur(tot / Q.guests) + " per guest · deposit " + eur(tot * D.deposit));
    var w = $("qWarn"), allBad = D.spaces.every(function (s) { return spaceOk(s, Q.date, Q.guests); });
    w.hidden = !allBad; if (allBad) w.textContent = t("Asnjë hapësirë nuk i nxë kaq të ftuar. Na telefononi për dasma mbi 400 veta.", "No space fits this many guests. Call us for weddings over 400.");
    $("holdBox").hidden = !d;
    $("hSend").textContent = d ? t("Mbaje këtë datë " + D.holdDays + " ditë, falas", "Hold this date for " + D.holdDays + " days, free") : t("Zgjidhni një datë", "Choose a date");
    $("hSend").disabled = !d || allBad;
  }
  $("qGuests").addEventListener("input", function () { Q.guests = +this.value; paintQuote(); });
  $("hSend").addEventListener("click", function () {
    var n = $("hN").value.trim(), p = $("hP").value.trim(), err = $("hErr");
    if (n.length < 3) { err.textContent = t("Shkruani emrat tuaj.", "Enter your names."); $("hN").focus(); return; }
    if (p.replace(/\D/g, "").length < 8) { err.textContent = t("Shkruani një numër telefoni të saktë.", "Enter a valid phone number."); $("hP").focus(); return; }
    err.textContent = ""; var btn = $("hSend"); btn.disabled = true;
    var d = new Date(Q.date), code = K.code("VK"), until = new Date(); until.setDate(until.getDate() + D.holdDays);
    var menu = D.menus.filter(function (m) { return m.id === Q.menu; })[0], space = D.spaces.filter(function (s) { return s.id === Q.space; })[0];
    K.submit({ demo: D.demo, endpoint: D.formEndpoint }, "Mbajtje date Vila Kroni " + code, {
      Kodi: code, Data: K.dayLabel(d) + " " + d.getFullYear(), Hapesira: space.sq, Te_ftuar: Q.guests, Menyja: menu.sq,
      Shtesat: D.extras.filter(function (x) { return Q.ex[x.id]; }).map(function (x) { return x.sq; }).join(", ") || "-", Totali: $("bTot").textContent,
      Emrat: n, Telefoni: p, Email: $("hE").value.trim(), _honey: ""
    }).then(function () {
      K.save("kroni-holds", { day: dayKey(d), code: code });
      $("qForm").hidden = true; $("qOk").hidden = false; $("hCode").textContent = code;
      $("hOkTxt").textContent = t(K.WD.sq[d.getDay()] + ", " + d.getDate() + " " + K.MO.sq[d.getMonth()] + " " + d.getFullYear() + " është e juaja deri më " + until.getDate() + " " + K.MO.sq[until.getMonth()] + ". Koordinatorja ju telefonon nesër për vizitën.",
                                  K.WD.en[d.getDay()] + " " + d.getDate() + " " + K.MO.en[d.getMonth()] + " " + d.getFullYear() + " is yours until " + until.getDate() + " " + K.MO.en[until.getMonth()] + ". The coordinator will call you tomorrow about a visit.");
      renderYear(); renderCal(); $("qOk").focus();
    }).catch(function () { err.textContent = t("Nuk u dërgua. Provoni përsëri ose telefononi.", "Not sent. Try again or call us."); })
      .then(function () { btn.disabled = false; });
  });
  $("hNew").addEventListener("click", function () { $("qOk").hidden = true; $("qForm").hidden = false; Q.date = null; paintQuote(); });

  /* ---------- visits ---------- */
  var V = { day: null, slot: null }, vRes = [{ id: "coord" }];
  var vBusy = K.demoBusy(["coord"], 15, function (wd) { return D.visits[wd]; }, { seed: 5, load: .35, block: 60 }).concat(K.saved("kroni-visits"));
  function vSlots(day) { var h = D.visits[day.getDay()]; return K.slots({ day: day, hours: h, step: 60, duration: 45, resources: vRes, busy: vBusy, noticeMin: 180 }); }
  function renderVDays() {
    var box = $("vDays"); box.innerHTML = "";
    for (var i = 0; i < 14; i++) {
      var d = new Date(today); d.setDate(today.getDate() + i);
      var free = vSlots(d).filter(function (s) { return s.free.length; }).length;
      if (V.day === null && free) V.day = +d;
      var b = document.createElement("button"); b.type = "button"; b.innerHTML = "<span></span><b></b>";
      b.children[0].textContent = i === 0 ? t("Sot", "Today") : K.WS[K.lang][d.getDay()]; b.children[1].textContent = d.getDate();
      b.disabled = !free; if (!free) b.style.opacity = .35;
      b.setAttribute("aria-pressed", String(V.day === +d)); K.srText(b, K.dayLabel(d));
      (function (d) { b.addEventListener("click", function () { V.day = +d; V.slot = null; renderVDays(); }); })(d);
      box.appendChild(b);
    }
    var sl = $("vSlots"); sl.innerHTML = "";
    if (V.day !== null) vSlots(new Date(V.day)).forEach(function (s) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = s.label; b.disabled = !s.free.length;
      b.setAttribute("aria-pressed", String(!!(V.slot && V.slot.t === s.t))); b.addEventListener("click", function () { V.slot = s; renderVDays(); }); sl.appendChild(b);
    });
  }
  var lastV = null;
  $("vSend").addEventListener("click", function () {
    var n = $("vN").value.trim(), p = $("vP").value.trim(), err = $("vErr");
    if (!V.slot) { err.textContent = t("Zgjidhni ditën dhe orën.", "Choose the day and time."); return; }
    if (n.length < 3) { err.textContent = t("Shkruani emrat tuaj.", "Enter your names."); $("vN").focus(); return; }
    if (p.replace(/\D/g, "").length < 8) { err.textContent = t("Shkruani një numër telefoni të saktë.", "Enter a valid phone number."); $("vP").focus(); return; }
    err.textContent = ""; var btn = $("vSend"); btn.disabled = true; var code = K.code("VZ");
    K.submit({ demo: D.demo, endpoint: D.formEndpoint }, "Vizitë Vila Kroni " + code, { Kodi: code, Vizita: K.dayLabel(V.slot.t) + " " + V.slot.label, Emrat: n, Telefoni: p, Dasma: $("vW").value.trim(), _honey: "" })
      .then(function () {
        var item = { res: "coord", start: V.slot.t, end: V.slot.t + 45 * 6e4 }; K.save("kroni-visits", item); vBusy.push(item); lastV = { t: V.slot.t, code: code };
        $("vForm").hidden = true; $("vOk").hidden = false; $("vCode").textContent = code;
        $("vOkTxt").textContent = t(K.dayLabel(V.slot.t) + " në " + V.slot.label + ". Ju pret koordinatorja te porta kryesore.", K.dayLabel(V.slot.t) + " at " + V.slot.label + ". The coordinator meets you at the main gate.");
        $("vOk").focus();
      }).catch(function () { err.textContent = t("Nuk u dërgua. Provoni përsëri.", "Not sent. Try again."); })
      .then(function () { btn.disabled = false; });
  });
  $("vIcs").addEventListener("click", function () { if (lastV) K.ics("kroni-" + lastV.code, [{ start: lastV.t, end: lastV.t + 45 * 6e4, title: "Vizitë te Vila Kroni", where: "Rruga e Vreshtave, Rahovec" }]); });

  function renderAll() { renderSpaces(); renderYear(); renderCal(); paintQuote(); renderVDays(); }
  K.onLang(renderAll);
  renderAll();
})();
