/* Kalibër Motors: stock filters, compare, car detail with options and finance, test-drive booking. Settings live in data.js. */
(function () {
  "use strict";
  var D = window.KALIBER, $ = K.$, t = K.t;

  K.i18n({
    "demo": "This is a <b>concept project</b> by <a href=\"../../\">Nisja Studio</a>. The showroom and offers do not exist.",
    "nav.stock": "Stock", "nav.fin": "Finance", "nav.check": "Inspection", "nav.visit": "Showroom", "cta.td": "Test drive",
    "h.alt": "White Porsche 911 on a snowy road",
    "h.title": "Cars that passed 160 checks.",
    "h.lead": "Porsche, BMW M, Mercedes-AMG and Audi RS from Germany, with service history, customs cleared and a 12-month warranty. The price you see is the price on Kosovo plates.",
    "h.feat": "In the showroom today", "h.year": "Year", "h.km": "Kilometres", "h.hp": "Power", "h.price": "Price", "h.open": "See the car",
    "t.1": "inspection points before sale", "t.2": "months of warranty included", "t.3": "extra customs or VAT", "t.4": "from payment to handover",
    "s.title": "In stock now",
    "s.lead": "Every car is in the showroom and ready to drive. Compare up to three, or open one to work out the monthly payment with the options you want.",
    "s.tools": "Filters", "s.max": "Up to", "s.sort": "Sort",
    "s.o1": "Newest", "s.o2": "Price: low to high", "s.o3": "Price: high to low", "s.o4": "Kilometres: fewest", "s.o5": "Power: most",
    "f.title": "What is it per month?",
    "f.lead": "Choose the car, the down payment and the term. The calculation uses our partner bank's rate, so the number is close to the offer you get in the office.",
    "f.s1": "Apply here or in the showroom", "f.s2": "You need your ID card and proof of salary.",
    "f.s3": "The bank answers within one working day", "f.s4": "We send the file, you don't go to the bank.",
    "f.s5": "Sign and take the keys", "f.s6": "Plates and insurance are done the same day.",
    "f.car": "Car", "f.down": "Down payment", "f.term": "Term", "f.month": "Monthly payment", "f.total": "Total cost of credit",
    "c.alt": "A car headlight in the dark",
    "c.title": "What we check",
    "c.lead": "Every car goes through our workshop before it reaches the showroom. You get the inspection report with the car, with photos and measurements.",
    "c.1": "Service history and mileage, by VIN", "c.2": "Paint thickness on every panel", "c.3": "Full computer diagnostics", "c.4": "Brakes, discs and dampers",
    "c.5": "Tyres, at least 5 mm", "c.6": "40 km road test with a technician", "c.7": "Steam-cleaned interior", "c.8": "Fresh oil and filter service",
    "d.title": "Book a test drive",
    "d.lead": "45 minutes, with an advisor, on real roads. Choose the car and the time, and we have it ready and washed when you arrive.",
    "d.car": "Car", "d.day": "Day", "d.dayA": "Day", "d.time": "Time", "d.timeA": "Time",
    "d.name": "Full name", "d.phone": "Phone", "d.trade": "Have a car to trade in? (optional)", "d.tradePh": "e.g. VW Golf 7, 2016, 140,000 km",
    "d.lic": "I have held a valid driving licence for at least 3 years and I am over 23.",
    "d.send": "Book test drive", "d.fine": "We call you the day before to confirm. Bring your licence.",
    "d.okT": "Test drive booked", "d.ics": "Add to calendar", "d.new": "Another booking",
    "v.title": "Showroom", "v.map": "Open in Google Maps",
    "q.1": "Are the cars customs cleared?", "q.1a": "Yes. The price includes customs, excise and VAT. You only pay for registration, unless you choose it as an option.",
    "q.2": "What does the warranty cover?", "q.2a": "Engine, gearbox, differential and electronics for 12 months with no mileage limit. You can extend it by 12 months.",
    "q.3": "Do you take my car as part payment?", "q.3a": "Yes. Write it on the test drive form and we value it the same day, with no obligation.",
    "q.4": "Can you bring a car from Germany that you don't have?", "q.4a": "Yes, to order. We search, inspect and bring it within 3 to 5 weeks, with the same warranty.",
    "foot": "Concept project by",
    "cmp.bar": "Comparison", "cmp.open": "Compare", "cmp.clear": "Clear", "cmp.title": "Comparison",
    "cd.ex": "Options", "cd.tot": "Total", "cd.td": "Book test drive", "cd.cmp": "Add to compare",
    "close": "Close"
  });

  var F = D.finance, eur = function (n) { return "€" + Math.round(n).toLocaleString("de-DE").replace(/\./g, " "); };
  var km = function (n) { return n.toLocaleString("de-DE").replace(/\./g, " ") + " km"; };
  var byId = function (id) { return D.cars.filter(function (c) { return c.id === id; })[0]; };
  var BODY = { all: ["Të gjitha", "All"], coupe: ["Coupé", "Coupé"], sedan: ["Sedan", "Saloon"], suv: ["SUV", "SUV"], wagon: ["Station wagon", "Estate"] };
  var FUEL = { petrol: ["Benzinë", "Petrol"], diesel: ["Naftë", "Diesel"] };
  function monthly(price, downPct, months) {
    var p = price * (1 - downPct / 100), r = F.apr / 100 / 12;
    return r ? p * r / (1 - Math.pow(1 + r, -months)) : p / months;
  }
  function title(c) { return c.make + " " + c.model; }

  /* ---------- hero ---------- */
  var feat = D.cars.filter(function (c) { return c.isNew; })[0] || D.cars[0];
  function paintSpec() {
    $("spCar").textContent = title(feat); $("spPrice").textContent = eur(feat.price);
    if (!countDone) { $("spYear").textContent = feat.year; $("spKm").textContent = km(feat.km).replace(" km", ""); $("spHp").textContent = feat.hp + " hp"; }
  }
  var countDone = false;
  (function count() {
    if (K.reduced) { countDone = true; return; }
    var t0 = performance.now(), dur = 1400;
    function step(ts) {
      var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      $("spYear").textContent = Math.round(1990 + (feat.year - 1990) * e);
      $("spKm").textContent = Math.round(feat.km * e).toLocaleString("de-DE").replace(/\./g, " ");
      $("spHp").textContent = Math.round(feat.hp * e) + " hp";
      if (k < 1) requestAnimationFrame(step); else countDone = true;
    }
    requestAnimationFrame(step);
  })();
  $("spOpen").addEventListener("click", function () { openCar(feat.id); });
  (function zoom() {
    var img = $("heroImg"), hero = $("hero"), ticking = false;
    if (K.reduced) return;
    addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { var r = hero.getBoundingClientRect(), k = Math.min(1, Math.max(0, -r.top / r.height)); img.style.setProperty("--z", (1.06 + k * .08).toFixed(3)); ticking = false; });
    }, { passive: true });
  })();

  /* ---------- stock ---------- */
  var S = { body: "all", max: 140000, sort: "new", cmp: [] };
  function renderSeg() {
    var seg = $("bodySeg"); seg.innerHTML = "";
    Object.keys(BODY).forEach(function (k) {
      var n = k === "all" ? D.cars.length : D.cars.filter(function (c) { return c.body === k; }).length;
      if (!n) return;
      var b = document.createElement("button"); b.type = "button"; b.textContent = t(BODY[k][0], BODY[k][1]) + " " + n;
      b.setAttribute("aria-pressed", String(S.body === k));
      b.addEventListener("click", function () { S.body = k; renderSeg(); renderGrid(); });
      seg.appendChild(b);
    });
  }
  function renderGrid() {
    var list = D.cars.filter(function (c) { return (S.body === "all" || c.body === S.body) && c.price <= S.max; });
    var sorters = { new: function (a, b) { return b.year - a.year || a.km - b.km; }, pa: function (a, b) { return a.price - b.price; }, pd: function (a, b) { return b.price - a.price; }, km: function (a, b) { return a.km - b.km; }, hp: function (a, b) { return b.hp - a.hp; } };
    list.sort(sorters[S.sort]);
    var g = $("grid"); g.innerHTML = "";
    $("count").textContent = list.length + " " + t(list.length === 1 ? "makinë" : "makina", list.length === 1 ? "car" : "cars");
    list.forEach(function (c) {
      var a = document.createElement("article"); a.className = "car-c";
      a.innerHTML = '<div class="ph" role="button" tabindex="0"><img loading="lazy" alt=""></div>' +
        '<div class="row1"><h3><span></span><small></small></h3><span class="pr"></span></div>' +
        '<div class="meta"><span></span><span></span><span></span></div>' +
        '<div class="row2"><span class="mo"></span><label class="cmp"><input type="checkbox"><span></span></label></div>';
      var ph = a.querySelector(".ph"), img = a.querySelector("img");
      img.src = "img/" + c.img + ".jpg"; img.alt = title(c);
      K.srText(ph, t("Hap ", "Open ") + title(c));
      if (c.isNew) { var tg = document.createElement("span"); tg.className = "tag"; tg.textContent = t("E sapoardhur", "Just arrived"); ph.insertBefore(tg, ph.firstChild); }
      a.querySelector("h3 span").textContent = title(c);
      a.querySelector("h3 small").textContent = c.gen + " · " + t(c.color.sq, c.color.en);
      a.querySelector(".pr").textContent = eur(c.price);
      var m = a.querySelectorAll(".meta span"); m[0].textContent = c.year; m[1].textContent = km(c.km); m[2].textContent = c.hp + " hp";
      a.querySelector(".mo").textContent = t("ose ", "or ") + eur(monthly(c.price, F.down, F.term)) + t("/muaj", "/mo");
      var cb = a.querySelector(".cmp input"); cb.checked = S.cmp.indexOf(c.id) >= 0;
      a.querySelector(".cmp span").textContent = t("Krahaso", "Compare");
      cb.setAttribute("aria-label", t("Krahaso ", "Compare ") + title(c));
      cb.addEventListener("change", function () { toggleCmp(c.id, cb.checked); });
      ph.addEventListener("click", function () { openCar(c.id); });
      ph.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCar(c.id); } });
      g.appendChild(a);
    });
    if (!list.length) { var e = document.createElement("p"); e.className = "empty"; e.textContent = t("Asnjë makinë me këto filtra. Rritni çmimin maksimal ose na kërkoni një me porosi.", "No cars match. Raise the maximum price or ask us to source one."); g.appendChild(e); }
  }
  $("maxP").addEventListener("input", function () { S.max = +this.value; $("maxPo").textContent = eur(S.max); renderGrid(); });
  $("sort").addEventListener("change", function () { S.sort = this.value; renderGrid(); });

  /* ---------- compare ---------- */
  function toggleCmp(id, on) {
    var i = S.cmp.indexOf(id);
    if (on && i < 0) { if (S.cmp.length >= 3) S.cmp.shift(); S.cmp.push(id); }
    if (!on && i >= 0) S.cmp.splice(i, 1);
    paintCmp(); renderGrid();
  }
  function paintCmp() {
    var bar = $("cmpbar"); bar.classList.toggle("on", S.cmp.length > 0);
    $("cmpTxt").textContent = S.cmp.length + t(" nga 3 makina të zgjedhura", " of 3 cars selected");
    $("cmpOpen").disabled = S.cmp.length < 2;
    bar.querySelectorAll("button").forEach(function (b) { b.tabIndex = S.cmp.length ? 0 : -1; });
  }
  $("cmpClear").addEventListener("click", function () { S.cmp = []; paintCmp(); renderGrid(); });
  $("cmpOpen").addEventListener("click", function () {
    var cars = S.cmp.map(byId), tbl = $("cmpTbl"); tbl.innerHTML = "";
    var rows = [
      [t("Çmimi", "Price"), function (c) { return eur(c.price); }, "min", "price"],
      [t("Kësti", "Monthly"), function (c) { return eur(monthly(c.price, F.down, F.term)); }, "min", "price"],
      [t("Viti", "Year"), function (c) { return c.year; }, "max", "year"],
      [t("Kilometra", "Kilometres"), function (c) { return km(c.km); }, "min", "km"],
      [t("Fuqia", "Power"), function (c) { return c.hp + " hp"; }, "max", "hp"],
      ["0–100 km/h", function (c) { return c.acc.toFixed(1).replace(".", K.lang === "sq" ? "," : ".") + " s"; }, "min", "acc"],
      [t("Tërheqja", "Drive"), function (c) { return c.drive; }],
      [t("Kutia", "Gearbox"), function (c) { return c.gear; }],
      [t("Karburanti", "Fuel"), function (c) { return t(FUEL[c.fuel][0], FUEL[c.fuel][1]); }],
      [t("Pronarë", "Owners"), function (c) { return c.owners; }, "min", "owners"],
      [t("Servisi", "Service"), function (c) { return t(c.service.sq, c.service.en); }]
    ];
    var thead = document.createElement("thead"), hr = document.createElement("tr"); hr.appendChild(document.createElement("th"));
    cars.forEach(function (c) { var th = document.createElement("th"); th.scope = "col"; th.innerHTML = '<img alt=""><span></span>'; th.querySelector("img").src = "img/" + c.img + ".jpg"; th.querySelector("span").textContent = title(c); hr.appendChild(th); });
    thead.appendChild(hr); tbl.appendChild(thead);
    var tb = document.createElement("tbody");
    rows.forEach(function (r) {
      var tr = document.createElement("tr"), th = document.createElement("th"); th.scope = "row"; th.textContent = r[0]; tr.appendChild(th);
      var vals = cars.map(function (c) { return r[3] ? c[r[3]] : null; });
      var best = r[2] === "min" ? Math.min.apply(null, vals) : r[2] === "max" ? Math.max.apply(null, vals) : null;
      cars.forEach(function (c, i) { var td = document.createElement("td"); td.textContent = r[1](c); if (best != null && vals[i] === best && cars.length > 1) td.className = "best"; tr.appendChild(td); });
      tb.appendChild(tr);
    });
    tbl.appendChild(tb);
    $("cmpDlg").showModal();
  });

  /* ---------- car detail ---------- */
  var cur = null, extras = {}, cd = { down: F.down, term: F.term };
  function openCar(id) {
    cur = byId(id); extras = {};
    $("cdT").textContent = title(cur) + " · " + cur.year;
    $("cdImg").src = "img/" + cur.img + ".jpg"; $("cdImg").alt = title(cur);
    var spec = [
      [t("Gjenerata", "Generation"), cur.gen], [t("Kilometra", "Kilometres"), km(cur.km)], [t("Fuqia", "Power"), cur.hp + " hp"],
      ["0–100 km/h", cur.acc.toFixed(1).replace(".", K.lang === "sq" ? "," : ".") + " s"], [t("Kutia", "Gearbox"), cur.gear], [t("Tërheqja", "Drive"), cur.drive],
      [t("Karburanti", "Fuel"), t(FUEL[cur.fuel][0], FUEL[cur.fuel][1])], [t("Ngjyra", "Colour"), t(cur.color.sq, cur.color.en)],
      [t("Pronarë të mëparshëm", "Previous owners"), cur.owners], [t("Servisi", "Service"), t(cur.service.sq, cur.service.en)]
    ];
    var tbl = $("cdSpec"); tbl.innerHTML = "";
    spec.forEach(function (s) { var tr = document.createElement("tr"); tr.innerHTML = "<th scope=\"row\"></th><td></td>"; tr.children[0].textContent = s[0]; tr.children[1].textContent = s[1]; tbl.appendChild(tr); });
    var ex = $("cdEx"); ex.innerHTML = "";
    D.extras.forEach(function (x) {
      var l = document.createElement("label"); l.innerHTML = '<input type="checkbox"><span></span><span></span>';
      l.children[1].textContent = t(x.sq, x.en); l.children[2].textContent = "+" + eur(x.price);
      l.children[0].addEventListener("change", function () { extras[x.id] = this.checked; paintDet(); });
      ex.appendChild(l);
    });
    $("cdCmp").textContent = S.cmp.indexOf(cur.id) >= 0 ? t("Hiq nga krahasimi", "Remove from compare") : t("Shto te krahasimi", "Add to compare");
    paintDet();
    $("carDlg").showModal();
  }
  function detTotal() { return cur.price + D.extras.reduce(function (s, x) { return s + (extras[x.id] ? x.price : 0); }, 0); }
  function paintDet() {
    var tot = detTotal();
    $("cdTot").textContent = eur(tot);
    $("cdDownO").textContent = cd.down + "% · " + eur(tot * cd.down / 100);
    $("cdTermO").textContent = cd.term + t(" muaj", " months");
    $("cdMonth").textContent = eur(monthly(tot, cd.down, cd.term));
  }
  [["cdDown", "down", F.downMin, F.downMax], ["cdTerm", "term", F.termMin, F.termMax]].forEach(function (a) {
    var el = $(a[0]); el.min = a[2]; el.max = a[3]; el.value = cd[a[1]];
    el.addEventListener("input", function () { cd[a[1]] = +el.value; paintDet(); });
  });
  $("cdTd").addEventListener("click", function () { $("carDlg").close(); $("tdCar").value = cur.id; tdCarChanged(); K.smooth("#testdrive"); });
  $("cdCmp").addEventListener("click", function () { toggleCmp(cur.id, S.cmp.indexOf(cur.id) < 0); $("carDlg").close(); });
  document.querySelectorAll("dialog").forEach(function (d) { d.addEventListener("click", function (e) { if (e.target === d || e.target.closest("[data-close]")) d.close(); }); });

  /* ---------- finance band ---------- */
  var fin = { car: D.cars[2].id, down: F.down, term: F.term };
  function renderFinCars() {
    var s = $("fCar"); s.innerHTML = "";
    D.cars.forEach(function (c) { var o = document.createElement("option"); o.value = c.id; o.textContent = title(c) + " · " + eur(c.price); s.appendChild(o); });
    s.value = fin.car;
  }
  function paintFin() {
    var c = byId(fin.car), m = monthly(c.price, fin.down, fin.term), loan = c.price * (1 - fin.down / 100);
    $("fDownO").textContent = fin.down + "% · " + eur(c.price * fin.down / 100);
    $("fTermO").textContent = fin.term + t(" muaj", " months");
    $("fMonth").textContent = eur(m);
    $("fTotal").textContent = eur(m * fin.term - loan);
    $("fFine").textContent = t("Shembull me normë vjetore " + String(F.apr).replace(".", ",") + "%, kredi " + eur(loan) + ". Oferta përfundimtare varet nga banka.",
                               "Example at " + F.apr + "% annual rate, loan " + eur(loan) + ". The final offer depends on the bank.");
  }
  $("fCar").addEventListener("change", function () { fin.car = this.value; paintFin(); });
  [["fDown", "down", F.downMin, F.downMax], ["fTerm", "term", F.termMin, F.termMax]].forEach(function (a) {
    var el = $(a[0]); el.min = a[2]; el.max = a[3]; el.value = fin[a[1]];
    el.addEventListener("input", function () { fin[a[1]] = +el.value; paintFin(); });
  });

  /* ---------- test drive ---------- */
  var TD = D.testDrive, td = { car: feat.id, day: null, slot: null };
  var busy = K.demoBusy(TD.advisors, TD.daysAhead + 1, function (wd) { return D.hours[wd]; }, { seed: 7, load: .3, block: 60 })
    .concat(K.saved("kaliber-td").map(function (b) { return { res: b.res, start: b.start, end: b.end }; }));
  var resources = TD.advisors.map(function (id) { return { id: id }; });
  function slotsFor(day) { var h = D.hours[day.getDay()]; return K.slots({ day: day, hours: h, step: TD.step, duration: TD.minutes, resources: resources, busy: busy, noticeMin: 120 }); }
  function renderTdCars() {
    var s = $("tdCar"); s.innerHTML = "";
    D.cars.forEach(function (c) { var o = document.createElement("option"); o.value = c.id; o.textContent = title(c) + " (" + c.year + ")"; s.appendChild(o); });
    s.value = td.car;
  }
  function tdCarChanged() {
    td.car = $("tdCar").value; var c = byId(td.car);
    $("tdImg").src = "img/" + c.img + ".jpg"; $("tdName").textContent = title(c);
    $("tdMeta").textContent = c.year + " · " + km(c.km) + " · " + eur(c.price);
  }
  $("tdCar").addEventListener("change", tdCarChanged);
  function renderTdDays() {
    var box = $("tdDays"); box.innerHTML = "";
    for (var i = 0; i < TD.daysAhead; i++) {
      var d = K.day0(new Date()); d.setDate(d.getDate() + i);
      var free = slotsFor(d).filter(function (s) { return s.free.length; }).length;
      if (td.day === null && free) td.day = +d;
      var b = document.createElement("button"); b.type = "button"; b.innerHTML = "<span></span><b></b>";
      b.children[0].textContent = i === 0 ? t("Sot", "Today") : K.WS[K.lang][d.getDay()]; b.children[1].textContent = d.getDate();
      b.disabled = !free; b.setAttribute("aria-pressed", String(td.day === +d)); K.srText(b, K.dayLabel(d) + (free ? "" : t(", plot", ", full")));
      (function (d) { b.addEventListener("click", function () { td.day = +d; td.slot = null; renderTdDays(); }); })(d);
      box.appendChild(b);
    }
    renderTdSlots();
  }
  function renderTdSlots() {
    var box = $("tdSlots"); box.innerHTML = "";
    if (td.day === null) return;
    slotsFor(new Date(td.day)).forEach(function (s) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = s.label; b.disabled = !s.free.length;
      b.setAttribute("aria-pressed", String(!!(td.slot && td.slot.t === s.t)));
      b.addEventListener("click", function () { td.slot = s; renderTdSlots(); $("tdE").textContent = ""; });
      box.appendChild(b);
    });
  }
  var lastTd = null;
  $("tdS").addEventListener("click", function () {
    var n = $("tdN").value.trim(), p = $("tdP").value.trim(), e = $("tdE");
    if (!td.slot) { e.textContent = t("Zgjidhni një orë.", "Choose a time."); return; }
    if (n.length < 3) { e.textContent = t("Shkruani emrin dhe mbiemrin.", "Enter your full name."); $("tdN").focus(); return; }
    if (p.replace(/\D/g, "").length < 8) { e.textContent = t("Shkruani një numër telefoni të saktë.", "Enter a valid phone number."); $("tdP").focus(); return; }
    if (!$("tdL").checked) { e.textContent = t("Konfirmoni patentën dhe moshën.", "Confirm your licence and age."); return; }
    e.textContent = ""; var btn = $("tdS"); btn.disabled = true; btn.textContent = t("Duke dërguar…", "Sending…");
    var c = byId(td.car), code = K.code("KM"), res = td.slot.free[0];
    K.submit({ demo: D.demo, endpoint: D.formEndpoint }, "Test drive " + code + " · " + title(c), {
      Kodi: code, Makina: title(c) + " " + c.year, Data: K.dayLabel(td.slot.t), Ora: td.slot.label, Emri: n, Telefoni: p, Nderrim: $("tdT").value.trim(), _honey: ""
    }).then(function () {
      var item = { res: res, start: td.slot.t, end: td.slot.t + TD.minutes * 6e4, car: c.id, code: code };
      K.save("kaliber-td", item); busy.push(item); lastTd = item;
      $("tdForm").hidden = true; $("tdOk").hidden = false; $("tdCode").textContent = code;
      $("tdOkTxt").textContent = t(title(c) + ", " + K.dayLabel(td.slot.t) + " në " + td.slot.label + ". Këshilltari juaj: " + (res === "arben" ? "Arben" : "Lira") + ". Ju telefonojmë një ditë më parë.",
                                   title(c) + ", " + K.dayLabel(td.slot.t) + " at " + td.slot.label + ". Your advisor: " + (res === "arben" ? "Arben" : "Lira") + ". We call you the day before.");
      $("tdOk").focus();
    }).catch(function () { e.textContent = t("Nuk u dërgua. Provoni përsëri ose telefononi.", "Not sent. Try again or call us."); })
      .then(function () { btn.disabled = false; btn.textContent = t("Rezervo test drive", "Book test drive"); });
  });
  $("tdIcs").addEventListener("click", function () { if (lastTd) K.ics("kaliber-" + lastTd.code, [{ start: lastTd.start, end: lastTd.end, title: "Test drive · " + title(byId(lastTd.car)), where: "Kalibër Motors, Magjistralja Prishtinë–Ferizaj km 6" }]); });
  $("tdNew").addEventListener("click", function () { $("tdOk").hidden = true; $("tdForm").hidden = false; td.slot = null; renderTdDays(); });

  function renderHours() {
    var tbl = $("hours"), today = new Date().getDay(); tbl.innerHTML = "";
    [1, 2, 3, 4, 5, 6, 0].forEach(function (wd) {
      var tr = document.createElement("tr"); if (wd === today) tr.className = "today";
      tr.innerHTML = "<td></td><td></td>"; tr.children[0].textContent = K.WD[K.lang][wd];
      tr.children[1].textContent = D.hours[wd] ? D.hours[wd].join("–") : t("Mbyllur", "Closed"); tbl.appendChild(tr);
    });
  }

  function renderAll() { paintSpec(); renderSeg(); renderGrid(); paintCmp(); renderFinCars(); paintFin(); renderTdCars(); tdCarChanged(); renderTdDays(); renderHours(); }
  K.onLang(renderAll);
  renderAll();
})();
