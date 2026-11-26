/* Fener: lantern hero, cocktail finder, menu, floor-plan booking. Settings live in data.js. */
(function () {
  "use strict";
  var D = window.FENER, $ = K.$, t = K.t, pad = K.pad;

  K.i18n({
    "demo": "This is a <b>concept project</b> by <a href=\"../../\">Nisja Studio</a>. The bar does not exist.",
    "demo.staff": "Staff panel",
    "nav.find": "Cocktails", "nav.menu": "Menu", "nav.book": "Book", "nav.nights": "Nights", "nav.visit": "Visit",
    "cta.book": "Book a table",
    "h.title": "Light up<br><em>the night.</em>",
    "h.lead": "Cocktails with raki, gin and mountain tea, sharing plates from the charcoal grill and jazz every Thursday. Find your cocktail, then pick your own table.",
    "h.cta": "Pick your table", "h.cta2": "Find your cocktail",
    "h.golden": "Golden hour: classics for €5 every day",
    "f.title": "What are you in the mood for?",
    "f.lead": "Move the three sliders. Our bartender has scored every cocktail by taste, and the glass fills with the one that suits you best.",
    "f.sweet": "Sweet", "f.sour": "Sour", "f.a1": "From sweet to sour",
    "f.light": "Light", "f.strong": "Strong", "f.a2": "From light to strong",
    "f.fruit": "Fruity", "f.bitter": "Bitter", "f.a3": "From fruity to bitter",
    "f.zero": "No alcohol only",
    "m.title": "Menu", "m.lead": "The kitchen is open until 23:00. Plates are small, order two or three per person.",
    "m.tabs": "Menu", "m.drinks": "Cocktails", "m.food": "Kitchen",
    "m.veg": "Vegetarian", "m.nog": "Gluten free", "m.non": "Nut free",
    "m.legend": "V vegetarian · G gluten · L milk · N nuts. For allergies, tell your waiter.",
    "b.title": "Choose your table",
    "b.lead": "Not just a time: see the room and choose where you sit. At the bar for two, in a booth for the group, by the window for a long talk.",
    "b.s1": "1. Day", "b.s2": "2. How many of you?", "b.less": "Fewer", "b.more": "More", "b.s3": "3. Time", "b.dayA": "Day", "b.timeA": "Time",
    "b.free": "Free", "b.busy": "Taken", "b.sel": "Yours", "b.plan": "Floor plan of the room",
    "b.name": "Name", "b.phone": "Phone", "b.notes": "Note (optional)", "b.notesPh": "Birthday, allergies, high chair…",
    "b.send": "Book the table", "b.doneT": "Your table is held", "b.ics": "Add to calendar", "b.new": "Another booking",
    "n.title": "Nights of the week",
    "g.1": "Bottle shelves behind the bar", "g.2": "Three cocktails on the bar", "g.3": "Steak with fries", "g.4": "The bartender pouring a cocktail", "g.5": "Dinner at the table",
    "v.title": "Find us", "v.map": "Open in Google Maps",
    "q.1": "Can I come without booking?", "q.1a": "Yes. The bar and three tables are always kept for walk-ins.",
    "q.2": "How long do you hold the table?", "q.2a": "Two hours, two and a half for groups of five or more. If you are more than 15 minutes late, call us.",
    "q.3": "Groups bigger than 8?", "q.3a": "Write it in the note or call us. For 10 to 30 people we close the big booth or the terrace.",
    "foot": "Concept project by", "foot2": "Drink responsibly. Over 18 only.",
    "s.title": "Today's bookings", "close": "Close"
  });

  var now = function () { return new Date(); };
  var mins = function (d) { return d.getHours() * 60 + d.getMinutes(); };
  var toMin = function (s) { var m = K.toMin(s); return m; };
  var ZONES = { bar: ["Banaku", "Bar"], booth: ["Kabinë", "Booth"], room: ["Salla", "Room"], terrace: ["Terracë", "Terrace"] };

  /* ---------- open now + golden hour ---------- */
  function openState() {
    var n = now(), m = mins(n), wd = n.getDay(), prev = (wd + 6) % 7;
    var h = D.hours[wd], hp = D.hours[prev];
    var close = toMin(h[1]); if (close <= toMin(h[0])) close += 1440;
    var pClose = toMin(hp[1]); if (pClose <= toMin(hp[0])) pClose += 1440;
    if (pClose > 1440 && m < pClose - 1440) return { open: true, until: hp[1] };
    if (m >= toMin(h[0]) && m < close) return { open: true, until: h[1] };
    return { open: false, opens: h[0] };
  }
  function paintStatus() {
    var s = openState(), el = $("status");
    el.classList.toggle("open", s.open);
    $("statusTxt").textContent = s.open ? t("Hapur tani · mbyllet në " + s.until.replace("24:00", "00:00"), "Open now · closes at " + s.until.replace("24:00", "00:00"))
                                        : t("Hapet sot në " + s.opens, "Opens today at " + s.opens);
    var g0 = toMin(D.goldenHour[0]), g1 = toMin(D.goldenHour[1]), m = mins(now());
    if (m >= g0 && m < g1) {
      var left = g1 - m; $("goldenT").textContent = Math.floor(left / 60) + ":" + pad(left % 60);
      $("goldenS").textContent = t("Ora e artë po mbaron: klasikët për €5", "Golden hour is ending: classics for €5");
    } else {
      $("goldenT").textContent = D.goldenHour[0].slice(0, 2) + "–" + D.goldenHour[1].slice(0, 2);
      $("goldenS").textContent = t("Ora e artë: klasikët për €5 çdo ditë", "Golden hour: classics for €5 every day");
    }
  }

  /* ---------- lantern hero ---------- */
  (function () {
    var dark = $("dark"), hero = $("hero"), tx = 62, ty = 38, x = 62, y = 38, raf = 0, touched = false, t0 = performance.now();
    if (K.reduced) return;
    var fine = matchMedia("(pointer: fine)").matches;
    function loop(ts) {
      if (!fine || !touched) { var k = (ts - t0) / 1000, narrow = innerWidth < 760; tx = 55 + Math.sin(k * .35) * (narrow ? 26 : 22); ty = narrow ? 22 + Math.sin(k * .52) * 8 : 40 + Math.sin(k * .52) * 14; }
      x += (tx - x) * .08; y += (ty - y) * .08;
      dark.style.setProperty("--x", x.toFixed(2) + "%"); dark.style.setProperty("--y", y.toFixed(2) + "%");
      raf = requestAnimationFrame(loop);
    }
    hero.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = hero.getBoundingClientRect(); touched = true;
      tx = (e.clientX - r.left) / r.width * 100; ty = (e.clientY - r.top) / r.height * 100;
    });
    hero.addEventListener("pointerleave", function () { touched = false; t0 = performance.now(); });
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(loop); } else { cancelAnimationFrame(raf); raf = 0; } }); });
    io.observe(hero);
  })();

  /* ---------- cocktail finder ---------- */
  var sSour = $("sSour"), sStrong = $("sStrong"), sBitter = $("sBitter"), zero = $("zeroOnly");
  function score(d) {
    // tastes: [sweet, sour, strong, bitter, fruit]
    var sourPref = +sSour.value, strongPref = +sStrong.value, bitPref = +sBitter.value;
    var sweetSour = (d.t[1] - d.t[0] + 10) / 2;   // 0 sweet … 10 sour
    var fruitBitter = (d.t[3] - d.t[4] + 10) / 2; // 0 fruity … 10 bitter
    var dist = Math.pow(sweetSour - sourPref, 2) + Math.pow(d.t[2] - strongPref, 2) * 1.2 + Math.pow(fruitBitter - bitPref, 2);
    return Math.max(0, Math.round(100 - Math.sqrt(dist) * 9));
  }
  var current = null;
  function find(forceId) {
    var pool = D.drinks.filter(function (d) { return zero.checked ? d.zero : true; });
    var ranked = pool.map(function (d) { return { d: d, s: score(d) }; }).sort(function (a, b) { return b.s - a.s; });
    var top = forceId ? ranked.filter(function (r) { return r.d.id === forceId; })[0] : ranked[0];
    current = top.d;
    $("mScore").textContent = t("Përputhje " + top.s + "%", top.s + "% match");
    $("mName").textContent = t(top.d.sq, top.d.en);
    $("mDesc").textContent = t(top.d.dsq, top.d.den);
    $("mPrice").textContent = K.eur(top.d.price);
    var liq = $("liq"); liq.setAttribute("fill", top.d.color);
    liq.style.transform = "scaleY(" + (0.55 + top.s / 220).toFixed(3) + ")";
    $("garnish").setAttribute("stroke", top.d.zero ? "#8BD48B" : "#E3A857");
    var alts = $("mAlts"); alts.innerHTML = "";
    ranked.filter(function (r) { return r.d !== top.d; }).slice(0, 3).forEach(function (r) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = t(r.d.sq, r.d.en) + " · " + r.s + "%";
      b.addEventListener("click", function () { find(r.d.id); }); alts.appendChild(b);
    });
  }
  [sSour, sStrong, sBitter].forEach(function (s) { s.addEventListener("input", function () { find(); }); });
  zero.addEventListener("change", function () { find(); });

  /* ---------- menu ---------- */
  var tagSq = { v: "V", g: "G", l: "L", n: "N" };
  var tagName = { v: ["vegjetariane", "vegetarian"], g: ["gluten", "gluten"], l: ["qumësht", "milk"], n: ["arra", "nuts"] };
  var foodFilters = {};
  function renderMenu() {
    var dl = $("drinkList"); dl.innerHTML = "";
    D.drinks.forEach(function (d) {
      var li = document.createElement("li"); if (d.img) li.dataset.img = "img/" + d.img + ".jpg";
      li.innerHTML = '<span class="nm"></span><span class="pr"></span><span class="ds"></span>';
      li.children[0].textContent = t(d.sq, d.en); li.children[1].textContent = K.eur(d.price); li.children[2].textContent = t(d.dsq, d.den);
      dl.appendChild(li);
    });
    var fl = $("foodList"); fl.innerHTML = "";
    D.food.filter(function (f) {
      return Object.keys(foodFilters).every(function (k) {
        if (!foodFilters[k]) return true;
        return k[0] === "-" ? f.tags.indexOf(k.slice(1)) < 0 : f.tags.indexOf(k) >= 0;
      });
    }).forEach(function (f) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="nm"></span><span class="pr"></span>';
      li.children[0].textContent = t(f.sq, f.en); li.children[1].textContent = K.eur(f.price);
      if (f.tags.length) {
        var tg = document.createElement("span"); tg.className = "tg";
        f.tags.forEach(function (k) { var a = document.createElement("abbr"); a.className = k; a.textContent = tagSq[k]; a.title = t(tagName[k][0], tagName[k][1]); tg.appendChild(a); });
        li.children[0].appendChild(tg);
      }
      fl.appendChild(li);
    });
    if (!fl.children.length) { var e = document.createElement("li"); e.textContent = t("Asnjë pjatë me këto filtra.", "No dishes match these filters."); fl.appendChild(e); }
  }
  document.querySelectorAll(".chip[data-tag]").forEach(function (c) {
    c.addEventListener("click", function () {
      var on = c.getAttribute("aria-pressed") !== "true"; c.setAttribute("aria-pressed", String(on)); foodFilters[c.dataset.tag] = on; renderMenu();
    });
  });
  var tabs = [$("tabD"), $("tabF")];
  tabs.forEach(function (tb, i) {
    tb.addEventListener("click", function () { select(i); });
    tb.addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var j = (i + 1) % 2; select(j); tabs[j].focus(); } });
  });
  function select(i) {
    tabs.forEach(function (tb, j) { tb.setAttribute("aria-selected", String(i === j)); tb.tabIndex = i === j ? 0 : -1; });
    $("panD").hidden = i !== 0; $("panF").hidden = i !== 1;
  }
  select(0);
  (function peek() {
    var pk = $("peek"), im = $("peekImg"), list = $("drinkList"), x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    if (!matchMedia("(pointer: fine)").matches) return;
    list.addEventListener("pointerover", function (e) {
      var li = e.target.closest("li[data-img]"); if (!li) { pk.classList.remove("on"); return; }
      if (im.getAttribute("src") !== li.dataset.img) im.src = li.dataset.img;
      pk.classList.add("on");
    });
    list.addEventListener("pointerleave", function () { pk.classList.remove("on"); });
    list.addEventListener("pointermove", function (e) { x = e.clientX + 140; y = e.clientY; if (!raf) raf = requestAnimationFrame(step); });
    function step() { cx += (x - cx) * .2; cy += (y - cy) * .2; pk.style.left = cx + "px"; pk.style.top = cy + "px"; raf = Math.abs(x - cx) + Math.abs(y - cy) > .5 ? requestAnimationFrame(step) : 0; }
  })();

  /* ---------- booking ---------- */
  var DEMO_NAMES = ["Arta K.", "Blerim S.", "Dua H.", "Erion M.", "Fjolla B.", "Gent R.", "Hana L.", "Ilir T.", "Jeta D.", "Leon P.", "Mira G.", "Nora V."];
  var busyCache = {};
  function dayKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function demoBusy(day) {
    var key = dayKey(day); if (busyCache[key]) return busyCache[key];
    var seed = day.getFullYear() * 400 + day.getMonth() * 31 + day.getDate(), out = [];
    var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var wd = day.getDay(), load = wd === 5 || wd === 6 ? .36 : wd === 4 ? .28 : .17;
    D.tables.forEach(function (tb) {
      for (var m = toMin(D.booking.first); m <= toMin(D.booking.last); m += 30) {
        var curve = m < 1110 ? .35 : m < 1170 ? .8 : m < 1290 ? 1.25 : .7;
        if (rnd() < load * curve) {
          var s = new Date(day); s.setHours(Math.floor(m / 60), m % 60, 0, 0);
          var size = Math.max(tb.min, Math.min(tb.max, tb.min + Math.floor(rnd() * (tb.max - tb.min + 1))));
          out.push({ table: tb.id, start: s.getTime(), end: s.getTime() + D.booking.minutes * 6e4, party: size, name: DEMO_NAMES[Math.floor(rnd() * DEMO_NAMES.length)], demo: true });
          m += D.booking.minutes;
        }
      }
    });
    busyCache[key] = out; return out;
  }
  function bookingsFor(day) {
    var key = dayKey(day);
    return demoBusy(day).concat(K.saved("fener-bookings").filter(function (b) { return dayKey(new Date(b.start)) === key; }));
  }
  function terraceOpen(day) { var m = day.getMonth() + 1; return m >= D.terraceOpen[0] && m <= D.terraceOpen[1]; }
  var S = { day: K.day0(now()), party: 2, time: null, table: null };
  function duration() { return (S.party >= 5 ? D.booking.bigGroupMinutes : D.booking.minutes) * 6e4; }
  function fits(tb) { return S.party >= tb.min && S.party <= tb.max && (tb.zone !== "terrace" || terraceOpen(S.day)); }
  function freeAt(tb, start, list) {
    var end = start + duration();
    return !list.some(function (b) { return b.table === tb.id && b.start < end && start < b.end; });
  }
  function slotTimes() {
    var out = [], limit = Date.now() + 30 * 6e4;
    for (var m = toMin(D.booking.first); m <= toMin(D.booking.last); m += D.booking.step) {
      var s = new Date(S.day); s.setHours(Math.floor(m / 60), m % 60, 0, 0); out.push({ t: s.getTime(), past: s.getTime() < limit });
    }
    return out;
  }
  function renderDays() {
    var box = $("days"); box.innerHTML = "";
    for (var i = 0; i < D.booking.daysAhead; i++) {
      var d = K.day0(now()); d.setDate(d.getDate() + i);
      var b = document.createElement("button"); b.type = "button"; b.className = "day";
      b.setAttribute("aria-pressed", String(+d === +S.day));
      b.innerHTML = "<span></span><b></b><span></span>";
      b.children[0].textContent = i === 0 ? t("Sot", "Today") : i === 1 ? t("Nesër", "Tmrw") : K.WS[K.lang][d.getDay()];
      b.children[1].textContent = d.getDate();
      b.children[2].textContent = K.MO[K.lang][d.getMonth()].slice(0, 3);
      K.srText(b, K.dayLabel(d));
      (function (d) { b.addEventListener("click", function () { S.day = d; S.time = null; renderDays(); renderTimes(); }); })(d);
      box.appendChild(b);
    }
  }
  function renderTimes() {
    var box = $("times"), list = bookingsFor(S.day), any = 0; box.innerHTML = "";
    var fitting = D.tables.filter(fits);
    slotTimes().forEach(function (s) {
      var free = s.past ? 0 : fitting.filter(function (tb) { return freeAt(tb, s.t, list); }).length;
      var b = document.createElement("button"); b.type = "button"; b.className = "tm"; b.textContent = K.hm(s.t);
      b.disabled = !free; b.setAttribute("aria-pressed", String(S.time === s.t));
      if (free) any++;
      b.title = free ? t(free + " tavolina të lira", free + " tables free") : t("E plotë", "Full");
      b.addEventListener("click", function () { S.time = s.t; renderTimes(); });
      box.appendChild(b);
    });
    if (S.time && box.querySelector('.tm[aria-pressed="true"]:disabled')) S.time = null;
    if (!S.time) { var first = box.querySelector(".tm:not(:disabled)"); if (first) { S.time = slotTimes().filter(function (s) { return K.hm(s.t) === first.textContent; })[0].t; first.setAttribute("aria-pressed", "true"); } }
    $("timeNote").textContent = any ? t("Kuzhina merr porosi deri në " + D.kitchenUntil + ".", "The kitchen takes orders until " + D.kitchenUntil + ".")
                                    : t("S'ka më vende online për këtë ditë. Banaku mbetet për ata që vijnë pa rezervim.", "No more online tables for this day. The bar stays open for walk-ins.");
    renderPlan();
  }
  function party(n) {
    S.party = Math.max(1, Math.min(D.booking.maxOnline, n)); $("party").textContent = S.party;
    $("partyNote").textContent = S.party === D.booking.maxOnline ? t("Më shumë se 8? Na telefononi.", "More than 8? Call us.") : "";
    renderTimes();
  }
  $("minus").addEventListener("click", function () { party(S.party - 1); });
  $("plus").addEventListener("click", function () { party(S.party + 1); });

  var SVGNS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function renderPlan() {
    var svg = $("plan"); svg.innerHTML = "";
    var list = bookingsFor(S.day), open = terraceOpen(S.day);
    el("rect", { x: 10, y: 10, width: 430, height: 380, rx: 18, "class": "room" }, svg);
    el("rect", { x: 452, y: 96, width: 178, height: 294, rx: 18, "class": "terr" }, svg);
    el("rect", { x: 104, y: 18, width: 320, height: 16, rx: 6, "class": "counter" }, svg);
    var lb = function (x, y, txt) { var e = el("text", { x: x, y: y, "class": "zl" }, svg); e.textContent = txt; };
    lb(30, 30, t("BANAKU", "BAR")); lb(200, 108, t("SALLA", "ROOM")); lb(30, 110, t("KABINAT", "BOOTHS")); lb(468, 116, t("TERRACA", "TERRACE"));
    var door = el("text", { x: 350, y: 376, "class": "zl" }, svg); door.textContent = t("HYRJA ↓", "ENTRANCE ↓");
    if (!open) {
      var c = el("text", { x: 541, y: 250, "class": "closed" }, svg); c.textContent = t("Mbyllur deri në prill", "Closed until April");
    }
    D.tables.forEach(function (tb) {
      if (tb.zone === "terrace" && !open) return;
      var g = el("g", { "class": "tb", tabindex: "0", role: "button" }, svg);
      var busy = S.time ? !freeAt(tb, S.time, list) : false, fit = fits(tb);
      if (!fit) g.classList.add("fit"); else if (busy) g.classList.add("busy");
      if (S.table === tb.id && (busy || !fit)) S.table = null;
      if (S.table === tb.id) g.classList.add("sel");
      if (tb.shape === "round") el("circle", { cx: tb.x + tb.w / 2, cy: tb.y + tb.h / 2, r: tb.w / 2 }, g);
      else el("rect", { x: tb.x, y: tb.y, width: tb.w, height: tb.h, rx: tb.shape === "booth" ? 16 : tb.shape === "bar" ? 17 : 8 }, g);
      var tx = el("text", { x: tb.x + tb.w / 2, y: tb.y + tb.h / 2 - (tb.h > 40 ? 7 : 0) }, g); tx.textContent = tb.id;
      if (tb.h > 40) { var cp = el("text", { x: tb.x + tb.w / 2, y: tb.y + tb.h / 2 + 10, "class": "cap" }, g); cp.textContent = tb.min === tb.max ? tb.max : tb.min + "–" + tb.max; }
      var z = ZONES[tb.zone], state = !fit ? t("nuk ju përshtatet", "doesn't fit your group") : busy ? t("e zënë", "taken") : t("e lirë", "free");
      var ttl = el("title", {}, g); ttl.textContent = tb.id + ", " + t(z[0], z[1]) + ", " + tb.min + "–" + tb.max + " " + t("veta", "people") + ", " + state;
      g.dataset.id = tb.id;
      g.setAttribute("aria-pressed", String(S.table === tb.id));
      if (fit && !busy) {
        var pick = function () { S.table = tb.id; renderPlan(); $("fErr").textContent = ""; var n = document.querySelector('.tb[data-id="' + tb.id + '"]'); if (n) n.focus(); };
        g.addEventListener("click", pick);
        g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      } else g.setAttribute("aria-disabled", "true");
    });
    var head = $("planHead");
    if (!S.time) { head.textContent = t("Zgjidhni orën për të parë tavolinat.", "Choose a time to see the tables."); return; }
    var tb = D.tables.filter(function (x) { return x.id === S.table; })[0];
    head.innerHTML = "";
    var b = document.createElement("b");
    b.textContent = K.dayLabel(S.time, true) + " · " + K.hm(S.time) + " · " + S.party + " " + t("veta", "people");
    head.appendChild(b);
    head.appendChild(document.createTextNode(tb ? " · " + t("Tavolina ", "Table ") + tb.id + " (" + t(ZONES[tb.zone][0], ZONES[tb.zone][1]).toLowerCase() + ")" : " · " + t("prekni një tavolinë", "tap a table")));
  }

  var last = null;
  $("fSend").addEventListener("click", function () {
    var name = $("fName").value.trim(), phone = $("fPhone").value.trim(), err = $("fErr");
    if (!S.time) { err.textContent = t("Zgjidhni një orë.", "Choose a time."); return; }
    if (!S.table) { err.textContent = t("Prekni një tavolinë të lirë në planimetri.", "Tap a free table on the floor plan."); $("plan").scrollIntoView({ behavior: K.reduced ? "auto" : "smooth", block: "center" }); return; }
    if (name.length < 2) { err.textContent = t("Shkruani emrin.", "Enter your name."); $("fName").focus(); return; }
    if (phone.replace(/\D/g, "").length < 8) { err.textContent = t("Shkruani një numër telefoni të saktë.", "Enter a valid phone number."); $("fPhone").focus(); return; }
    err.textContent = ""; var btn = $("fSend"); btn.disabled = true; btn.textContent = t("Duke dërguar…", "Sending…");
    var code = K.code("F"), item = { table: S.table, start: S.time, end: S.time + duration(), party: S.party, name: name, code: code };
    K.submit({ demo: D.demo, endpoint: D.formEndpoint }, "Rezervim Fener " + code, {
      Kodi: code, Data: K.dayLabel(S.time), Ora: K.hm(S.time), Tavolina: S.table, Persona: S.party, Emri: name, Telefoni: phone, Shenim: $("fNote").value.trim(), _honey: ""
    }).then(function () {
      K.save("fener-bookings", item); last = item;
      $("bookForm").hidden = true; $("bookDone").hidden = false; $("dCode").textContent = code;
      $("dTxt").textContent = t("Tavolina " + S.table + ", " + K.dayLabel(S.time) + " në " + K.hm(S.time) + ", për " + S.party + " veta. Tregojeni kodin te hyrja. E mbajmë 15 minuta pas orës.",
                                "Table " + S.table + ", " + K.dayLabel(S.time) + " at " + K.hm(S.time) + ", for " + S.party + ". Show the code at the door. We hold it 15 minutes past the time.");
      $("dCode").focus && $("bookDone").setAttribute("tabindex", "-1"); $("bookDone").focus();
    }).catch(function () { err.textContent = t("Nuk u dërgua. Provoni përsëri ose telefononi.", "Not sent. Try again or call us."); })
      .then(function () { btn.disabled = false; btn.textContent = t("Rezervo tavolinën", "Book the table"); });
  });
  $("dIcs").addEventListener("click", function () { if (last) K.ics("fener-" + last.code, [{ start: last.start, end: last.end, title: "Fener · " + t("Tavolina ", "Table ") + last.table, where: "Rr. Agim Ramadani 15, Prishtinë" }]); });
  $("dNew").addEventListener("click", function () { $("bookDone").hidden = true; $("bookForm").hidden = false; S.table = null; renderTimes(); });

  /* ---------- nights, hours ---------- */
  function renderNights() {
    var box = $("nights"), today = now().getDay(); box.innerHTML = "";
    D.nights.forEach(function (n) {
      var d = document.createElement("article"); d.className = "night" + (n.day === today ? " tonight" : "");
      d.innerHTML = '<span class="dw"></span><h3></h3><p></p>';
      d.children[0].textContent = K.WD[K.lang][n.day] + " · " + n.time; d.children[0].dataset.t = t("Sonte", "Tonight");
      d.children[1].textContent = t(n.sq, n.en); d.children[2].textContent = t(n.nsq, n.nen);
      box.appendChild(d);
    });
  }
  function renderHours() {
    var tbl = $("hours"), today = now().getDay(); tbl.innerHTML = "";
    [1, 2, 3, 4, 5, 6, 0].forEach(function (wd) {
      var tr = document.createElement("tr"); if (wd === today) tr.className = "today";
      tr.innerHTML = "<td></td><td></td>"; tr.children[0].textContent = K.WD[K.lang][wd];
      tr.children[1].textContent = D.hours[wd][0] + "–" + D.hours[wd][1].replace("24:00", "00:00");
      tbl.appendChild(tr);
    });
    var tr2 = document.createElement("tr"); tr2.innerHTML = "<td></td><td></td>";
    tr2.children[0].textContent = t("Kuzhina", "Kitchen"); tr2.children[1].textContent = t("deri në ", "until ") + D.kitchenUntil; tbl.appendChild(tr2);
  }

  /* ---------- staff panel ---------- */
  var staff = $("staff");
  $("openStaff").addEventListener("click", function () {
    var list = bookingsFor(K.day0(now())).slice().sort(function (a, b) { return a.start - b.start; }), r = $("roster"); r.innerHTML = "";
    var guests = list.reduce(function (s, b) { return s + b.party; }, 0);
    $("staffMeta").textContent = list.length + t(" rezervime · ", " bookings · ") + guests + t(" mysafirë sonte. Rreshtat me ngjyrë janë bërë nga kjo faqe.", " guests tonight. Highlighted rows were made on this page.");
    list.forEach(function (b) {
      var row = document.createElement("div"); row.innerHTML = "<b></b><em></em><span></span><small></small>";
      row.children[0].textContent = K.hm(b.start); row.children[1].textContent = b.table;
      row.children[2].textContent = b.name + (b.demo ? "" : " ★"); row.children[3].textContent = b.party + " " + t("veta", "ppl");
      if (!b.demo) row.style.borderColor = "#E3A857";
      r.appendChild(row);
    });
    if (!list.length) r.textContent = t("Asnjë rezervim sot.", "No bookings today.");
    staff.showModal();
  });
  staff.addEventListener("click", function (e) { if (e.target === staff || e.target.closest("[data-close]")) staff.close(); });

  function renderAll() { document.querySelector(".plan-scroll").dataset.hint = t("← Rrëshqisni për të parë terracën →", "← Swipe to see the terrace →"); paintStatus(); find(current && current.id); renderMenu(); renderDays(); renderTimes(); renderNights(); renderHours(); }
  K.onLang(renderAll);
  renderAll();
  setInterval(paintStatus, 30000);
})();
