/* broken photos remove themselves (replaces inline onerror, which the security policy blocks) */
function dropBroken(root) {
  root.querySelectorAll("img[data-drop-broken]").forEach(function (im) {
    if (im.complete && !im.naturalWidth) im.remove(); else im.addEventListener("error", function () { im.remove(); });
  });
}
dropBroken(document);
(function () {
  "use strict";
  var D = window.UDHA, $ = function (id) { return document.getElementById(id); };
  if (/[?&]test\b/.test(location.search)) D.demo = false; // test mode: booking requests are really emailed
  var EN = {
    "demo": "This is a <b>concept demo</b> made by <a href=\"../../\">Nisja Studio</a>. Want a site like this for your business?",
    "logo.sub": "Rent a Car · Gjakovë", "nav.cars": "Cars", "nav.how": "How it works", "nav.terms": "Terms", "nav.faq": "FAQ", "nav.contact": "Contact", "nav.cta": "Book",
    "hero.title": "Your car is waiting when you land.", "hero.lead": "Car rental in Gjakovë, with pickup at Prishtina Airport too. You see the full price before you book, and you only pay when you collect the car.",
    "hero.f1": "Unlimited kilometres", "hero.f2": "No online payment", "hero.f3": "Free cancellation",
    "search.title": "Find your car", "step.1": "Dates", "step.2": "Car", "step.3": "Your details", "search.pick": "Where do you pick up the car?", "search.diff": "Return it somewhere else", "search.ret": "Where do you return the car?",
    "search.from": "Pickup", "search.to": "Return", "search.btn": "See available cars", "search.note": "No credit card needed to book.",
    "p1.t": "Final price up front", "p1.d": "Every fee is shown here, before you book. Nothing gets added at the desk.",
    "p2.t": "A clear deposit", "p2.d": "We show it on every car and return it the day you bring the car back. With full cover there is no deposit at all.",
    "p3.t": "We wait at the airport", "p3.d": "We track your flight. If it's late, we wait at no extra cost.",
    "p4.t": "We photograph it together", "p4.d": "We check and photograph the car with you at pickup and return, so nobody pays for damage they didn't cause.",
    "fleet.title": "Our cars", "fleet.intro": "You get exactly the car you choose, not “one like it”. Prices change with the season and drop the more days you rent.",
    "f.all": "All", "f.auto": "Automatic", "f.big": "Families & groups",
    "book.title": "Finish your booking", "book.sub": "One more step. We confirm within 30 minutes by WhatsApp or phone.", "book.extras": "Extras",
    "x.full": "Full cover", "x.fullD": "Deposit and excess become €0. You pay nothing for scratches or damage.", "x.child": "Child seat", "x.childD": "For children up to 12.",
    "x.border": "Driving to Albania, North Macedonia, Montenegro", "x.borderD": "Green card included. Ask us about other countries.",
    "book.driver": "Driver", "d.name": "Full name", "d.phone": "Phone or WhatsApp", "d.age": "Driver's age", "d.age25": "25 or older", "d.age21": "21–24",
    "d.email": "Email", "opt": "(optional)", "d.flight": "Flight number", "d.flightH": "so we can track it if it's late", "d.notes": "Notes", "d.notesP": "E.g. a second driver, the address to bring the car to…",
    "d.terms": "I have read the <a href=\"#kushtet\">rental terms</a>.", "book.btn": "Send booking",
    "s.total": "Total", "s.pay": "Pay at pickup, by card or cash", "s.km": "Unlimited km · full-to-full fuel", "s.change": "Change car",
    "done.title": "Booking sent", "done.sub": "We'll message you within 30 minutes to confirm.", "done.code": "Your booking code",
    "done.n1": "We confirm by WhatsApp or phone within 30 minutes (08:00–20:00).", "done.n2": "At pickup, bring your ID or passport and your driving licence.", "done.n3": "We check the car together, take photos, and you pay by card or cash.",
    "done.wa": "Also send it on WhatsApp", "done.ics": "Add to calendar", "done.again": "New booking",
    "done.demo": "This is a demo: the booking was saved only in this browser. Try booking the same car on the same dates.",
    "how.title": "How it works", "how.intro": "Booking takes a minute. You pay nothing online.",
    "how.1t": "Pick dates and a car", "how.1d": "You only see cars that are free on your dates, with the full price.",
    "how.2t": "We confirm", "how.2d": "We message you on WhatsApp within 30 minutes. If plans change, cancel for free.",
    "how.3t": "Get the keys", "how.3d": "At our office, at your address or at the airport. We check the car together and you pay then.",
    "t.title": "Rental terms", "t.intro": "Written plainly, so there are no surprises at the desk.",
    "t.docs": "Documents", "t.docsD": "ID card or passport, and a driving licence held for at least 2 years. No credit card needed.",
    "t.age": "Age", "t.ageD": "From 21. Drivers aged 21–24 pay €5 extra per day.",
    "t.dep": "Deposit", "t.depD": "€200–500 depending on the car, by card or cash. Returned the day you bring the car back. With full cover: €0.",
    "t.ins": "Insurance", "t.insD": "Basic cover (CDW) is included, with an excess equal to the deposit. Full cover (€9/day) makes the excess €0.",
    "t.fuel": "Fuel and kilometres", "t.fuelD": "Full-to-full: return it with as much as you got. Unlimited kilometres.",
    "t.border": "Outside Kosovo", "t.borderD": "Albania, North Macedonia, Montenegro: €25 for the whole rental, green card included. Tell us when you book.",
    "t.air": "Airport", "t.airD": "Pickup or return at Prishtina Airport costs €30. Free waiting up to 60 minutes after landing.",
    "t.late": "Late return", "t.lateD": "You have 2 hours of grace. After that, one more day is charged.",
    "t.cancel": "Cancellation", "t.cancelD": "Free at any time, because you pay nothing in advance. Please let us know.",
    "q.title": "Frequently asked questions", "q.intro": "Can't find the answer? Message us on WhatsApp.",
    "q.1": "Do I need a credit card?", "q.1a": "No. You can leave the deposit in cash or with a debit card, and you get it back the day you return the car.",
    "q.2": "What if my flight is late?", "q.2a": "With your flight number we track your plane and wait for you. The booking isn't cancelled and you don't pay for the wait.",
    "q.3": "Do I get exactly the car I chose?", "q.3a": "Yes. We don't write “or similar”. If the car breaks down before your rental, we give you one of the same class or bigger, at no extra cost.",
    "q.4": "Can I drive to Albania or Montenegro?", "q.4a": "Yes. Tick the option when you book (€25 for the whole rental) and we hand you the green card with the keys.",
    "q.5": "What if the car breaks down on the road?", "q.5a": "Call us at any hour. We help you on the road and, if needed, bring you another car.",
    "q.6": "Can I extend the rental?", "q.6a": "Yes, if the car is free. Message us at least a day before the return and the price is worked out with the longer-rental discount.",
    "c.office": "Office", "c.hours": "Every day 08:00–20:00", "c.call": "Phone and WhatsApp", "c.callD": "For breakdowns: 24 hours", "c.air": "Airport", "c.airD": "We meet you at the arrivals exit with your name on a sign.",
    "foot.demo": "concept demo", "st.cars": "cars, from Polo to the 9-seat Vito", "st.help": "roadside help", "st.dep": "deposit with full cover", "st.wait": "free waiting at the airport", "foot.by": "Website by"
  };
  var TXT = {
    sq: { cls: { economy: "Ekonomike", compact: "Kompakte", estate: "Familjare", suv: "SUV", premium: "Premium", van: "Furgon 9 ulëse" }, gear: { manual: "Manual", auto: "Automatik" }, fuel: { petrol: "Benzinë", diesel: "Naftë", hybrid: "Hibrid" },
      seats: "ulëse", bags: "valixhe", ac: "A/C", day: "ditë", days: "ditë", perDay: "/ditë", from: "nga", total: "gjithsej", totalL: "Gjithsej", payAt: "paguani në marrje", choose: "Zgjidh këtë makinë", chosen: "E zgjedhur",
      busy: "E zënë në këto data", freeFrom: "E lirë nga", deposit: "Depozitë", dep0: "€0 me mbulim të plotë", noCars: "Asnjë makinë nuk përputhet me filtrin.",
      trip: "{d} ditë · {from} → {to}", tripNone: "Zgjidhni datat për të parë çmimin e plotë.", change: "Ndrysho",
      rent: "Qiraja", season: { low: "sezon i ulët", mid: "sezon mesatar", high: "sezon i lartë" }, discount: "Zbritje për {n}+ ditë (−{p}%)",
      full: "Mbulim i plotë", seat: "Ulëse për fëmijë", border: "Udhëtim jashtë Kosovës", young: "Shofer 21–24 vjeç", pickFee: "Marrja në aeroport", retFee: "Kthimi në aeroport",
      depositIs: "Depozitë: {v}", pickup: "Marrja", ret: "Kthimi", car: "Makina", name: "Emri", phone: "Telefoni",
      eDates: "Data e kthimit duhet të jetë pas marrjes.", ePast: "Marrja duhet të jetë të paktën 2 orë nga tani.", eName: "Shkruani emrin dhe mbiemrin.", ePhone: "Shkruani një numër telefoni që të mund t'ju konfirmojmë.", eTerms: "Konfirmoni që i keni lexuar kushtet.",
      eTaken: "Kjo makinë sapo u rezervua në këto data. Zgjidhni një tjetër.", eSend: "Rezervimi nuk u dërgua. Provoni përsëri ose na shkruani në WhatsApp.", sending: "Duke dërguar…",
      wa: "Përshëndetje! Dua të rezervoj:", icsPick: "Marrja e makinës", icsRet: "Kthimi i makinës", stepsLabel: "Hapat e rezervimit" },
    en: { cls: { economy: "Economy", compact: "Compact", estate: "Estate", suv: "SUV", premium: "Premium", van: "9-seat van" }, gear: { manual: "Manual", auto: "Automatic" }, fuel: { petrol: "Petrol", diesel: "Diesel", hybrid: "Hybrid" },
      seats: "seats", bags: "bags", ac: "A/C", day: "day", days: "days", perDay: "/day", from: "from", total: "total", totalL: "Total", payAt: "pay at pickup", choose: "Choose this car", chosen: "Selected",
      busy: "Taken on these dates", freeFrom: "Free from", deposit: "Deposit", dep0: "€0 with full cover", noCars: "No car matches this filter.",
      trip: "{d} days · {from} → {to}", tripNone: "Pick your dates to see the full price.", change: "Change",
      rent: "Rental", season: { low: "low season", mid: "mid season", high: "high season" }, discount: "{n}+ day discount (−{p}%)",
      full: "Full cover", seat: "Child seat", border: "Driving outside Kosovo", young: "Driver aged 21–24", pickFee: "Airport pickup", retFee: "Airport return",
      depositIs: "Deposit: {v}", pickup: "Pickup", ret: "Return", car: "Car", name: "Name", phone: "Phone",
      eDates: "The return must be after the pickup.", ePast: "Pickup must be at least 2 hours from now.", eName: "Enter your full name.", ePhone: "Enter a phone number so we can confirm.", eTerms: "Please confirm you've read the terms.",
      eTaken: "This car was just booked for these dates. Please choose another.", eSend: "The booking didn't go through. Try again or message us on WhatsApp.", sending: "Sending…",
      wa: "Hello! I'd like to book:", icsPick: "Car pickup", icsRet: "Car return", stepsLabel: "Booking steps" }
  };

  var lang = "sq", SQ = {};
  function T(k, v) { var s = k.split(".").reduce(function (o, p) { return o && o[p]; }, TXT[lang]); if (typeof s !== "string") return k; return v ? s.replace(/\{(\w+)\}/g, function (_, n) { return v[n]; }) : s; }
  var eur = function (n) { return "€" + Math.round(n).toLocaleString("de-DE"); };
  var loc = function () { return lang === "sq" ? "sq-AL" : "en-GB"; };
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var ymd = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var WD = ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"], MO = ["jan", "shk", "mar", "pri", "maj", "qer", "korr", "gush", "sht", "tet", "nën", "dhj"];
  function fmt(d) {
    var day = lang === "sq" ? WD[d.getDay()] + " " + d.getDate() + " " + MO[d.getMonth()] : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    return day + ", " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  function locName(id) { var l = D.locations.find(function (x) { return x.id === id; }); return l ? l[lang] : ""; }

  /* ---------- language ---------- */
  document.querySelectorAll("[data-i18n],[data-i18n-html],[data-i18n-ph]").forEach(function (el) {
    if (el.dataset.i18n) SQ[el.dataset.i18n] = el.textContent;
    if (el.dataset.i18nHtml) SQ[el.dataset.i18nHtml] = el.innerHTML;
    if (el.dataset.i18nPh) SQ[el.dataset.i18nPh] = el.getAttribute("placeholder");
  });
  function applyLang() {
    var dict = lang === "en" ? EN : SQ;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { var k = el.dataset.i18n; if (dict[k] != null) el.textContent = dict[k]; });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) { var k = el.dataset.i18nHtml; if (dict[k] != null) el.innerHTML = dict[k]; });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { var k = el.dataset.i18nPh; if (dict[k] != null) el.setAttribute("placeholder", dict[k]); });
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    document.querySelector(".steps").setAttribute("aria-label", T("stepsLabel"));
    fillLocations(); renderAll();
  }
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { lang = b.dataset.lang; try { localStorage.setItem("udha-lang", lang); } catch (e) {} applyLang(); });
  });

  /* ---------- search form ---------- */
  function fillLocations() {
    ["pickLoc", "retLoc"].forEach(function (id) {
      var sel = $(id), v = sel.value;
      sel.innerHTML = D.locations.map(function (l) { return '<option value="' + l.id + '">' + l[lang] + (l.fee ? " (+€" + l.fee + ")" : "") + "</option>"; }).join("");
      if (v) sel.value = v;
    });
  }
  var times = []; for (var h = 6; h <= 23; h++) { times.push(pad(h) + ":00"); if (h < 23) times.push(pad(h) + ":30"); }
  ["fromTime", "toTime"].forEach(function (id) { $(id).innerHTML = times.map(function (t) { return "<option>" + t + "</option>"; }).join(""); $(id).value = "10:00"; });
  var t0 = new Date(); t0.setDate(t0.getDate() + 1);
  var t1 = new Date(t0); t1.setDate(t1.getDate() + 3);
  $("fromDate").value = ymd(t0); $("toDate").value = ymd(t1); $("fromDate").min = ymd(new Date()); $("toDate").min = ymd(t0);
  $("fromDate").addEventListener("change", function () {
    $("toDate").min = $("fromDate").value;
    if ($("toDate").value <= $("fromDate").value) { var n = new Date($("fromDate").value + "T12:00"); n.setDate(n.getDate() + 3); $("toDate").value = ymd(n); }
  });
  $("diffReturn").addEventListener("change", function () { $("retWrap").hidden = !this.checked; if (!this.checked) $("retLoc").value = $("pickLoc").value; });
  $("pickLoc").addEventListener("change", function () { if (!$("diffReturn").checked) $("retLoc").value = this.value; });

  var S = { from: null, to: null, pick: "office", ret: "office", car: null, filter: "all", seats: 0 };
  function readSearch() {
    var f = new Date($("fromDate").value + "T" + $("fromTime").value), t = new Date($("toDate").value + "T" + $("toTime").value);
    if (isNaN(f) || isNaN(t) || t <= f) return T("eDates");
    if (f.getTime() < Date.now() + 2 * 36e5) return T("ePast");
    S.from = f; S.to = t; S.pick = $("pickLoc").value; S.ret = $("diffReturn").checked ? $("retLoc").value : S.pick;
    return "";
  }
  $("search").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = readSearch(); $("searchErr").textContent = err;
    if (err) return;
    if (S.car && !isFree(S.car)) S.car = null;
    setStep(S.car ? 3 : 2); renderAll();
    document.getElementById(S.car ? "rezervo" : "makinat").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  /* ---------- availability ---------- */
  function saved() { try { return JSON.parse(localStorage.getItem("udha-bookings") || "[]"); } catch (e) { return []; } }
  function allBookings() { return D.bookings.concat(saved()); }
  function overlaps(b, from, to) {
    var buf = D.bufferHours * 36e5, bf = new Date(b.from).getTime() - buf, bt = new Date(b.to).getTime() + buf;
    return from.getTime() < bt && bf < to.getTime();
  }
  function isFree(carId) { return !allBookings().some(function (b) { return b.car === carId && overlaps(b, S.from, S.to); }); }
  function freeFrom(carId) {
    var list = allBookings().filter(function (b) { return b.car === carId && overlaps(b, S.from, S.to); });
    var end = Math.max.apply(null, list.map(function (b) { return new Date(b.to).getTime() + D.bufferHours * 36e5; }));
    var d = new Date(end), len = S.to - S.from;
    // walk forward until the same length fits
    var open = function (x) { x = new Date(x); x.setMinutes(x.getMinutes() > 0 && x.getMinutes() <= 30 ? 30 : x.getMinutes() > 30 ? 60 : 0, 0, 0); if (x.getHours() >= 20 && (x.getHours() > 20 || x.getMinutes())) { x.setDate(x.getDate() + 1); x.setHours(8, 0); } if (x.getHours() < 8) x.setHours(8, 0); return x; };
    for (var i = 0; i < 60; i++) {
      d = open(d);
      var f = new Date(d.getTime()), t = new Date(f.getTime() + len);
      var clash = allBookings().filter(function (b) { return b.car === carId && overlaps(b, f, t); });
      if (!clash.length) return f;
      d = new Date(Math.max.apply(null, clash.map(function (b) { return new Date(b.to).getTime() + D.bufferHours * 36e5; })));
    }
    return d;
  }

  /* ---------- pricing ---------- */
  function seasonOf(d) {
    var md = pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    for (var i = 0; i < D.seasons.length; i++) {
      var s = D.seasons[i];
      if (s.from <= s.to ? (md >= s.from && md <= s.to) : (md >= s.from || md <= s.to)) return s.id;
    }
    return "low";
  }
  function dayCount(from, to) { return Math.max(1, Math.ceil(((to - from) - D.graceHours * 36e5) / 864e5)); }
  function quote(car, opts) {
    opts = opts || {};
    var days = dayCount(S.from, S.to), bySeason = {}, base = 0;
    for (var i = 0; i < days; i++) {
      var d = new Date(S.from.getTime() + i * 864e5), s = seasonOf(d), r = car.rates[s];
      base += r; bySeason[s] = bySeason[s] || { n: 0, rate: r }; bySeason[s].n++;
    }
    var lines = [];
    Object.keys(bySeason).forEach(function (s) { var x = bySeason[s]; lines.push({ l: T("rent") + ": " + x.n + " × " + eur(x.rate) + " (" + T("season." + s) + ")", v: x.n * x.rate }); });
    var disc = D.lengthDiscounts.find(function (x) { return days >= x.min; }), total = base;
    if (disc) { var dv = Math.round(base * disc.pct / 100); total -= dv; lines.push({ l: T("discount", { n: disc.min, p: disc.pct }), v: -dv, minus: true }); }
    if (opts.full) { var fv = D.fullCoverPerDay * days; total += fv; lines.push({ l: T("full") + ": " + days + " × " + eur(D.fullCoverPerDay), v: fv }); }
    if (opts.seats) { var sv = opts.seats * Math.min(D.childSeatPerDay * days, D.childSeatMax); total += sv; lines.push({ l: T("seat") + " × " + opts.seats, v: sv }); }
    if (opts.border) { total += D.crossBorder; lines.push({ l: T("border"), v: D.crossBorder }); }
    if (opts.young) { var yv = D.youngDriverPerDay * days; total += yv; lines.push({ l: T("young") + ": " + days + " × " + eur(D.youngDriverPerDay), v: yv }); }
    var pf = (D.locations.find(function (l) { return l.id === S.pick; }) || {}).fee || 0, rf = (D.locations.find(function (l) { return l.id === S.ret; }) || {}).fee || 0;
    if (pf) { total += pf; lines.push({ l: T("pickFee"), v: pf }); }
    if (rf) { total += rf; lines.push({ l: T("retFee"), v: rf }); }
    return { days: days, total: total, lines: lines, deposit: opts.full ? 0 : car.deposit, rental: total - pf - rf };
  }
  function opts() { return { full: $("xFull").checked, seats: S.seats, border: $("xBorder").checked, young: $("dAge").value === "21" }; }

  /* ---------- car pictures ---------- */
  var BODY = {
    hatch: { d: "M18 84 L18 66 Q20 56 34 53 L74 46 Q96 28 120 25 L170 25 Q186 25 198 38 L212 52 Q236 55 240 66 L240 84 Z", w: ["M84 47 Q102 33 122 31 L150 31 L150 47 Z", "M156 31 L170 31 Q182 31 192 42 L198 47 L156 47 Z"], wh: [66, 196] },
    sedan: { d: "M14 84 L14 64 Q16 56 28 54 L60 52 L80 34 Q92 25 112 24 L160 24 Q176 24 190 38 L204 50 Q236 53 242 64 L242 84 Z", w: ["M88 50 L100 36 Q108 30 118 30 L140 30 L140 50 Z", "M146 30 L160 30 Q172 30 184 42 L190 50 L146 50 Z"], wh: [62, 200] },
    wagon: { d: "M14 84 L14 66 Q16 57 30 54 L66 47 Q88 30 112 27 L220 26 Q234 26 238 38 L244 56 Q248 62 248 70 L248 84 Z", w: ["M76 48 Q94 34 114 32 L156 32 L156 48 Z", "M162 32 L216 32 Q227 32 231 42 L233 48 L162 48 Z"], wh: [62, 206] },
    suv: { d: "M16 86 L16 62 Q18 52 32 50 L64 46 L84 22 Q88 18 96 18 L196 18 Q210 18 216 30 L226 46 Q242 48 244 60 L244 86 Z", w: ["M92 24 L138 24 L138 44 L76 44 Z", "M144 24 L194 24 Q204 24 208 32 L214 44 L144 44 Z"], wh: [66, 194] },
    mpv: { d: "M14 86 L14 64 Q16 54 30 51 L58 46 Q76 22 100 19 L210 18 Q226 18 232 32 L242 56 Q246 62 246 70 L246 86 Z", w: ["M70 46 Q84 27 104 25 L140 25 L140 46 Z", "M146 25 L182 25 L182 46 L146 46 Z", "M188 25 L212 25 Q222 25 226 34 L230 46 L188 46 Z"], wh: [62, 200] },
    van: { d: "M12 88 L12 62 Q14 52 26 49 L46 44 L70 16 Q74 12 82 12 L234 12 Q246 12 248 24 L250 88 Z", w: ["M76 20 L118 20 L118 42 L56 42 Z", "M124 20 L170 20 L170 42 L124 42 Z", "M176 20 L222 20 L222 42 L176 42 Z"], wh: [60, 204] }
  };
  function carSvg(car) {
    var b = BODY[car.body], r = car.body === "suv" || car.body === "van" ? 17 : 15;
    return '<svg viewBox="0 0 260 108" aria-hidden="true"><ellipse cx="130" cy="98" rx="118" ry="6" fill="rgba(0,45,36,.14)"/>' +
      '<path d="' + b.d + '" fill="#002D24"/>' + b.w.map(function (w) { return '<path d="' + w + '" fill="#E9EFEB" opacity=".9"/>'; }).join("") +
      '<rect x="' + (car.body === "van" ? 236 : 228) + '" y="' + (car.body === "suv" || car.body === "mpv" || car.body === "van" ? 56 : 60) + '" width="12" height="6" rx="2" fill="#F2A516"/>' +
      '<rect x="' + (car.body === "van" ? 12 : 16) + '" y="62" width="8" height="6" rx="2" fill="#D4473B"/>' +
      b.wh.map(function (x) { return '<circle cx="' + x + '" cy="86" r="' + r + '" fill="#171717"/><circle cx="' + x + '" cy="86" r="' + (r - 9) + '" fill="#B9C2BD"/>'; }).join("") + "</svg>";
  }

  /* ---------- render ---------- */
  function setStep(n) { document.querySelectorAll(".steps li").forEach(function (li) { li.classList.toggle("on", +li.dataset.step <= n); }); }
  function renderTrip() {
    if (!S.from) { $("trip").textContent = T("tripNone"); return; }
    $("trip").innerHTML = T("trip", { d: dayCount(S.from, S.to), from: fmt(S.from), to: fmt(S.to) }).replace(/^(\d+ \S+)/, "$1<span>") + '</span><button type="button" id="editTrip">' + T("change") + "</button>";
    $("editTrip").addEventListener("click", function () { $("kerko").scrollIntoView({ behavior: "smooth" }); $("fromDate").focus({ preventScroll: true }); });
  }
  function renderCars() {
    var list = D.cars.filter(function (c) { return S.filter === "all" || (S.filter === "auto" ? c.gear === "auto" : (c.bags >= 4 || c.seats >= 7)); });
    var rows = list.map(function (c) { var q = S.from ? quote(c) : null; return { c: c, q: q, free: S.from ? isFree(c.id) : true }; });
    rows.sort(function (a, b) { return (b.free - a.free) || ((a.q ? a.q.total : a.c.rates.low) - (b.q ? b.q.total : b.c.rates.low)); });
    if (!rows.length) { $("cars").innerHTML = '<p class="empty">' + T("noCars") + "</p>"; return; }
    $("cars").innerHTML = rows.map(function (r) {
      var c = r.c, q = r.q, sel = S.car === c.id;
      var price = q ? '<b>' + eur(q.rental) + '</b><span>' + q.days + " " + (q.days === 1 ? T("day") : T("days")) + " · " + eur(q.rental / q.days) + T("perDay") + "</span>"
                    : '<b>' + eur(c.rates.low) + '</b><span>' + T("from") + " " + T("perDay").replace("/", "") + "</span>";
      var action = r.free
        ? '<button type="button" class="btn ' + (sel ? "btn-pine" : "btn-line") + '" data-car="' + c.id + '" aria-pressed="' + sel + '">' + (sel ? T("chosen") : T("choose")) + "</button>"
        : '<p class="busy">' + T("busy") + '</p><button type="button" class="btn btn-line" data-free="' + c.id + '">' + T("freeFrom") + " " + fmt(freeFrom(c.id)) + "</button>";
      return '<article data-id="' + c.id + '" class="car' + (sel ? " sel" : "") + (r.free ? "" : " off") + (SEEN[c.id] ? " in" : "") + (sel && JUST === c.id ? " just" : "") + '"><div class="art" style="background:' + c.color + '">' + carSvg(c) + (c.img ? '<img src="' + c.img + '" alt="' + c.name + '" loading="lazy" data-drop-broken>' : "") + '</div>' +
        '<div class="car-top"><h3>' + c.name + '</h3><span class="cls">' + T("cls." + c.cls) + "</span></div>" +
        '<ul class="specs"><li>' + T("gear." + c.gear) + "</li><li>" + T("fuel." + c.fuel) + "</li><li>" + c.seats + " " + T("seats") + "</li><li>" + c.bags + " " + T("bags") + "</li><li>" + T("ac") + "</li></ul>" +
        '<div class="price">' + price + '</div><p class="dep">' + T("deposit") + " " + eur(c.deposit) + " · " + T("dep0") + "</p>" + action + "</article>";
    }).join("");
    dropBroken($("cars"));
  }
  var SEEN = {}, JUST = null, lastSel = null, carIO = null;
  function animateCars() {
    if (S.car !== lastSel) { JUST = S.car; lastSel = S.car; } else JUST = null;
    var els = document.querySelectorAll("#cars .car:not(.in)");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach(function (e) { e.classList.add("in"); SEEN[e.dataset.id] = 1; }); return; }
    carIO = carIO || new IntersectionObserver(function (es) { es.forEach(function (e, i) { if (e.isIntersecting) { var el = e.target; setTimeout(function () { el.classList.add("in"); }, i * 110); SEEN[el.dataset.id] = 1; carIO.unobserve(el); } }); }, { threshold: .25 });
    els.forEach(function (e) { carIO.observe(e); });
  }
  function renderSummary() {
    var car = D.cars.find(function (c) { return c.id === S.car; });
    if (!car || !S.from) return;
    var q = quote(car, opts());
    $("sCar").textContent = car.name;
    $("sWhen").innerHTML = "<div><b>" + T("pickup") + ":</b> " + fmt(S.from) + "<br>" + locName(S.pick) + "</div><div><b>" + T("ret") + ":</b> " + fmt(S.to) + "<br>" + locName(S.ret) + "</div>";
    $("sLines").innerHTML = q.lines.map(function (l) { return '<li class="' + (l.minus ? "minus" : "") + '"><span>' + l.l + "</span><span>" + (l.v < 0 ? "−" + eur(-l.v) : eur(l.v)) + "</span></li>"; }).join("");
    $("sTotal").textContent = eur(q.total);
    $("sDeposit").textContent = T("depositIs", { v: eur(q.deposit) });
    $("payLine").innerHTML = "<b>" + T("totalL") + ": " + eur(q.total) + "</b><span>" + T("depositIs", { v: eur(q.deposit) }) + " · " + T("payAt") + "</span>";
    $("cFull").textContent = "+" + eur(D.fullCoverPerDay) + T("perDay");
    $("cBorder").textContent = "+" + eur(D.crossBorder);
    $("flightWrap").hidden = !(D.locations.find(function (l) { return l.id === S.pick; }) || {}).airport;
  }
  function renderAll() { if (S.car !== lastSel) { JUST = S.car; lastSel = S.car; } else JUST = null; renderTrip(); renderCars(); renderSummary(); animateCars(); JUST = null; }

  $("cars").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.free) {
      var f = freeFrom(b.dataset.free), len = S.to - S.from, t = new Date(f.getTime() + len);
      $("fromDate").value = ymd(f); $("fromTime").value = pad(f.getHours()) + ":" + (f.getMinutes() < 30 ? "00" : "30");
      $("toDate").value = ymd(t); $("toTime").value = $("fromTime").value;
      if (!readSearch()) { S.car = b.dataset.free; renderAll(); openBooking(); }
      return;
    }
    if (b.dataset.car) {
      if (!S.from) { var err = readSearch(); if (err) { $("searchErr").textContent = err; $("kerko").scrollIntoView(); return; } }
      S.car = b.dataset.car; renderAll(); openBooking();
    }
  });
  function openBooking() {
    $("rezervo").classList.add("open"); $("bookWrap").hidden = false; $("done").classList.remove("show");
    setStep(3); renderSummary();
    $("rezervo").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setTimeout(function () { $("dName").focus({ preventScroll: true }); }, 450);
  }
  document.querySelectorAll(".chip").forEach(function (ch) {
    ch.addEventListener("click", function () { S.filter = ch.dataset.filter; document.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", String(x === ch)); }); renderCars(); });
  });
  ["xFull", "xBorder", "dAge"].forEach(function (id) { $(id).addEventListener("change", renderSummary); });
  $("seatPlus").addEventListener("click", function () { S.seats = Math.min(3, S.seats + 1); $("seatN").textContent = S.seats; renderSummary(); });
  $("seatMinus").addEventListener("click", function () { S.seats = Math.max(0, S.seats - 1); $("seatN").textContent = S.seats; renderSummary(); });
  $("changeCar").addEventListener("click", function () { setStep(2); $("makinat").scrollIntoView({ behavior: "smooth" }); });

  /* ---------- submit ---------- */
  var last = null;
  $("bookForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("dName").value.trim(), phone = $("dPhone").value.trim(), err = "";
    if (name.length < 3) err = T("eName"); else if (phone.replace(/\D/g, "").length < 8) err = T("ePhone"); else if (!$("dTerms").checked) err = T("eTerms");
    else if (!isFree(S.car)) err = T("eTaken");
    $("bookErr").textContent = err;
    if (err) { var bad = err === T("eName") ? "dName" : err === T("ePhone") ? "dPhone" : err === T("eTerms") ? "dTerms" : null; if (bad) $(bad).focus(); if (err === T("eTaken")) renderCars(); return; }
    var car = D.cars.find(function (c) { return c.id === S.car; }), q = quote(car, opts());
    var code = "07-" + String(Math.floor(100 + Math.random() * 900)) + "-UD";
    last = { code: code, car: car, q: q, from: S.from, to: S.to, pick: S.pick, ret: S.ret, name: name, phone: phone, email: $("dEmail").value.trim(), flight: $("dFlight").value.trim(), notes: $("dNotes").value.trim(), o: opts() };
    var finish = function () {
      var list = saved(); list.push({ car: car.id, from: S.from.toISOString(), to: S.to.toISOString(), code: code });
      try { localStorage.setItem("udha-bookings", JSON.stringify(list)); } catch (x) {}
      showDone();
    };
    if (D.demo) { finish(); return; }
    var btn = $("bookBtn"); btn.disabled = true; btn.textContent = T("sending");
    fetch(D.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: "Rezervim i ri " + code + " · " + car.name, Kodi: code, Makina: car.name, Marrja: fmt(S.from) + " · " + locName(S.pick), Kthimi: fmt(S.to) + " · " + locName(S.ret),
        Gjithsej: eur(q.total), Depozita: eur(q.deposit), Shtesa: q.lines.map(function (l) { return l.l + " " + eur(l.v); }).join(" | "), Emri: name, Telefoni: phone, Email: last.email || "-", Fluturimi: last.flight || "-", Shenime: last.notes || "-", _template: "table" }) })
      .then(function (r) { if (!r.ok) throw 0; finish(); })
      .catch(function () { $("bookErr").textContent = T("eSend"); })
      .then(function () { btn.disabled = false; btn.textContent = lang === "en" ? EN["book.btn"] : SQ["book.btn"]; });
  });
  function waText() {
    var b = last; return T("wa") + "\n" + b.car.name + "\n" + T("pickup") + ": " + fmt(b.from) + ", " + locName(b.pick) + "\n" + T("ret") + ": " + fmt(b.to) + ", " + locName(b.ret) + "\n" + T("totalL") + ": " + eur(b.q.total) + "\n" + T("name") + ": " + b.name + "\n#" + b.code;
  }
  function showDone() {
    var b = last;
    $("bookWrap").hidden = true; $("done").classList.add("show");
    $("code").textContent = b.code;
    $("recap").innerHTML = [[T("car"), b.car.name], [T("pickup"), fmt(b.from) + " · " + locName(b.pick)], [T("ret"), fmt(b.to) + " · " + locName(b.ret)], [T("totalL"), eur(b.q.total)], [T("deposit"), eur(b.q.deposit)]]
      .map(function (r) { return "<div><span>" + r[0] + "</span><span>" + r[1] + "</span></div>"; }).join("");
    $("waBtn").href = "https://wa.me/" + (D.whatsapp || "") + "?text=" + encodeURIComponent(waText());
    $("demoNote").hidden = !D.demo;
    renderCars();
    $("done").focus({ preventScroll: true }); $("rezervo").scrollIntoView({ behavior: "smooth" });
  }
  $("icsBtn").addEventListener("click", function () {
    var b = last, st = function (d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00"; };
    var ev = function (uid, d, title, where) { var e = new Date(d.getTime() + 30 * 6e4); return ["BEGIN:VEVENT", "UID:" + uid + "@udha-rent", "DTSTAMP:" + st(new Date()), "DTSTART:" + st(d), "DTEND:" + st(e), "SUMMARY:" + title + " · " + b.car.name, "LOCATION:" + where, "DESCRIPTION:Udha Rent a Car · " + b.code, "END:VEVENT"].join("\r\n"); };
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Udha Rent a Car//SQ", ev(b.code + "-1", b.from, T("icsPick"), locName(b.pick)), ev(b.code + "-2", b.to, T("icsRet"), locName(b.ret)), "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "udha-" + b.code + ".ics"; document.body.appendChild(a); a.click(); a.remove();
  });
  $("again").addEventListener("click", function () {
    S.car = null; $("bookForm").reset(); S.seats = 0; $("seatN").textContent = "0"; $("done").classList.remove("show"); $("bookWrap").hidden = false; $("rezervo").classList.remove("open");
    setStep(2); renderAll(); $("makinat").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- start ---------- */
  /* ---------- live price: total for the cheapest free car, as the dates change ---------- */
  var lqShown = 0;
  function liveQuote() {
    var box = $("liveQuote"), f = new Date($("fromDate").value + "T" + $("fromTime").value), t = new Date($("toDate").value + "T" + $("toTime").value);
    if (isNaN(f) || isNaN(t) || t <= f) { box.hidden = true; return; }
    var keep = { from: S.from, to: S.to, pick: S.pick, ret: S.ret };
    S.from = f; S.to = t; S.pick = $("pickLoc").value; S.ret = $("diffReturn").checked ? $("retLoc").value : S.pick;
    var free = D.cars.filter(function (c) { return isFree(c.id); }), days = dayCount(f, t);
    var min = free.length ? Math.min.apply(null, free.map(function (c) { return quote(c).total; })) : 0;
    S.from = keep.from; S.to = keep.to; S.pick = keep.pick; S.ret = keep.ret;
    box.hidden = false;
    var en = lang === "en";
    $("lqText").textContent = free.length
      ? (en ? days + (days === 1 ? " day · " : " days · ") + free.length + " of " + D.cars.length + " cars free · cheapest total" : days + (days === 1 ? " ditë · " : " ditë · ") + free.length + " nga " + D.cars.length + " makina të lira · totali më i lirë")
      : (en ? "No cars free on these dates. Try other days." : "S'ka makina të lira në këto data. Provoni ditë të tjera.");
    var el = $("lqTotal"), from = lqShown, to = min, t0 = performance.now();
    if (!free.length) { el.textContent = "—"; lqShown = 0; return; }
    box.classList.remove("bump"); void box.offsetWidth; box.classList.add("bump");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = eur(to); lqShown = to; return; }
    (function tick(now) { var k = Math.min(1, (now - t0) / 500), e = 1 - Math.pow(1 - k, 3); el.textContent = eur(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(tick); else lqShown = to; })(t0);
  }
  ["fromDate", "fromTime", "toDate", "toTime", "pickLoc", "retLoc", "diffReturn"].forEach(function (id) { $(id).addEventListener("change", function () { setTimeout(liveQuote, 0); }); });
  document.querySelectorAll("[data-lang]").forEach(function (b) { b.addEventListener("click", function () { setTimeout(liveQuote, 0); }); });

  /* ---------- night road in the hero ---------- */
  (function () {
    var c = $("road"); if (!c || !c.getContext) return;
    var ctx = c.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 1.5), w, h, off = 0, vel = 0, lastY = window.scrollY, run = true;
    var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var car = null, tt = 0;
    function size() {
      w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* park the car in the left lane at the nearest depth where it covers no text and not the form */
      car = null;
      if (w < 760) return;
      var cr = c.getBoundingClientRect(), vx = w * .5, vy = h * .04, half = .72 * w * .5;
      /* tight boxes around each line of text, plus the whole search card */
      var blocks = [], add = function (r) { blocks.push({ l: r.left - cr.left - 12, r: r.right - cr.left + 12, t: r.top - cr.top - 10, b: r.bottom - cr.top + 10 }); };
      [".hero h1", ".hero .lead", ".hero .facts"].forEach(function (q) { var e = document.querySelector(q); if (!e) return; var rg = document.createRange(); rg.selectNodeContents(e); Array.prototype.forEach.call(rg.getClientRects(), add); });
      var sf = document.querySelector(".search"); if (sf) add(sf.getBoundingClientRect());
      for (var t = .97; t >= .3; t -= .01) {
        var hw = half * t, cw = hw * .36, ch = cw * .62, cx = vx - hw * .5, cy = vy + (h - vy) * t;
        var box = { l: cx - cw / 2 - 6, r: cx + cw / 2 + 6, t: cy - ch - 6, b: cy + 6 };
        var hit = blocks.some(function (k) { return box.l < k.r && k.l < box.r && box.t < k.b && k.t < box.b; });
        if (!hit && cw > 40) { car = { cx: cx, cy: cy, cw: cw, ch: ch }; break; }
      }
    }
    function rr(x, y, ww, hh, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + ww, y, x + ww, y + hh, r); ctx.arcTo(x + ww, y + hh, x, y + hh, r); ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + ww, y, r); ctx.closePath(); }
    function drawCar() {
      if (!car) return;
      var W = car.cw, H = car.ch, x = car.cx + Math.sin(tt * 1.3) * W * .035 - W / 2, by = car.cy + Math.sin(off * Math.PI * 2) * .8, y = by - H;
      var glow = Math.min(1, .45 + vel * .06);
      ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.beginPath(); ctx.ellipse(x + W / 2, by + 2, W * .56, H * .1, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#101010"; rr(x + W * .06, by - H * .2, W * .16, H * .22, 3); ctx.fill(); rr(x + W * .78, by - H * .2, W * .16, H * .22, 3); ctx.fill();
      ctx.fillStyle = "#C9CCC3"; ctx.beginPath(); ctx.moveTo(x + W * .2, y + H * .08); ctx.lineTo(x + W * .8, y + H * .08); ctx.lineTo(x + W * .92, y + H * .44); ctx.lineTo(x + W * .08, y + H * .44); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#171717"; ctx.beginPath(); ctx.moveTo(x + W * .25, y + H * .14); ctx.lineTo(x + W * .75, y + H * .14); ctx.lineTo(x + W * .84, y + H * .4); ctx.lineTo(x + W * .16, y + H * .4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#D6D8D0"; rr(x, y + H * .4, W, H * .44, H * .1); ctx.fill();
      ctx.fillStyle = "#002D24"; ctx.fillRect(x + W * .37, y + H * .62, W * .26, H * .12);
      ctx.save(); ctx.shadowColor = "rgba(255,60,40," + glow.toFixed(2) + ")"; ctx.shadowBlur = 10 + glow * 22; ctx.fillStyle = "rgb(" + Math.round(200 + 55 * glow) + ",50,38)";
      rr(x + W * .04, y + H * .48, W * .22, H * .1, 2); ctx.fill(); rr(x + W * .74, y + H * .48, W * .22, H * .1, 2); ctx.fill(); ctx.restore();
      ctx.fillStyle = "#2B2B2B"; rr(x + W * .1, y + H * .8, W * .8, H * .08, 2); ctx.fill();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      var vx = w * .5, vy = h * .04, spread = w < 760 ? 1.1 : .72;
      var L = function (t) { return vx + (-spread * w * .5 - 0) * t; }, R = function (t) { return vx + (spread * w * .5) * t; };
      var g = ctx.createLinearGradient(0, vy, 0, h); g.addColorStop(0, "rgba(0,30,24,0)"); g.addColorStop(1, "rgba(0,22,18,.55)");
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(L(1), h); ctx.lineTo(R(1), h); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(233,239,235,.28)";
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(L(1), h); ctx.moveTo(vx, vy); ctx.lineTo(R(1), h); ctx.stroke();
      for (var i = 0; i < 14; i++) {
        var p0 = ((i + off) % 14) / 14, p1 = p0 + .035;
        var y0 = vy + (h - vy) * p0 * p0, y1 = vy + (h - vy) * Math.min(1, p1 * p1);
        var hw0 = 1 + p0 * p0 * 7, hw1 = 1 + p1 * p1 * 7;
        ctx.beginPath(); ctx.moveTo(vx - hw0, y0); ctx.lineTo(vx + hw0, y0); ctx.lineTo(vx + hw1, y1); ctx.lineTo(vx - hw1, y1); ctx.closePath();
        ctx.fillStyle = "rgba(255,185,53," + (.15 + p0 * .75).toFixed(2) + ")"; ctx.fill();
      }
      drawCar();
      var hl = ctx.createRadialGradient(vx, h * 1.05, 0, vx, h * 1.05, h * .9); hl.addColorStop(0, "rgba(255,214,120,.16)"); hl.addColorStop(1, "rgba(255,214,120,0)");
      ctx.fillStyle = hl; ctx.fillRect(0, 0, w, h);
    }
    function frame() {
      var y = window.scrollY; vel = vel * .9 + Math.abs(y - lastY) * .1; lastY = y;
      if (run) { off = (off + .045 + Math.min(.5, vel * .02)) % 14; tt += 1 / 60; draw(); }
      requestAnimationFrame(frame);
    }
    size(); window.addEventListener("resize", function () { size(); if (still) draw(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { size(); if (still) draw(); });
    if (still) { draw(); return; }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { run = es[0].isIntersecting; }).observe(c);
    requestAnimationFrame(frame);
  })();

  try { lang = localStorage.getItem("udha-lang") || "sq"; } catch (e) { lang = "sq"; }
  readSearch(); applyLang(); liveQuote();
})();

