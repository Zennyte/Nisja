/* Ëmbël: today's counter with hold-for-pickup, and a live cake builder with a capacity calendar. Settings live in data.js. */
(function () {
  "use strict";
  var D = window.EMBEL, $ = K.$, t = K.t, pad = K.pad;

  K.i18n({
    "demo": "This is a <b>concept project</b> by <a href=\"../../\">Nisja Studio</a>. The pastry shop does not exist.",
    "nav.case": "Today's counter", "nav.cake": "Custom cake", "nav.how": "How it works", "nav.visit": "Visit", "cta.cake": "Build your cake",
    "h.title": "You draw the cake. <span>We bake it.</span>",
    "h.lead": "Choose the tiers, sponge, cream and decoration, and see how it looks and what it costs before you order. Every morning there is also a counter of croissants and pastries you can hold for later.",
    "h.cta": "Build your cake", "h.cta2": "What's on the counter today",
    "h.f1": "the oven starts every day", "h.f2": "is enough for a cake", "h.f3": "margarine, only butter",
    "h.badge": "Real<br>butter<br>cream", "h.alt1": "Decorating a cake with chocolate cream", "h.alt2": "Two-tier cake with forest berries",
    "c.title": "Today's counter", "c.lead": "Baked in the morning and gone when it's gone. Hold it here and pick it up whenever you like, until closing.",
    "c.bag": "To pick up", "c.when": "When are you coming?", "c.name": "Name", "c.phone": "Phone", "c.send": "Hold them for me",
    "c.doneT": "We're holding them", "c.new": "Hold something else",
    "b.title": "Build your cake",
    "b.lead": "Every choice changes the cake and the price straight away. Then choose the day: the calendar shows the days when the oven still has room.",
    "b.inside": "Inside", "b.serves": "Slices", "b.price": "Price", "b.earliest": "Earliest",
    "b.shape": "Shape", "b.tiers": "Tiers", "b.size": "Size of the bottom tier", "b.sponge": "Sponge", "b.filling": "Filling",
    "b.frost": "Outside cream", "b.deco": "Decoration (as many as you like)", "b.msg": "Message on the plaque", "b.msgPh": "Happy 30th, Arta!",
    "b.whenT": "When do you want it?", "b.i1": "The box, the message plaque and candles are free.", "b.i2": "The final price is confirmed by phone, before we start.", "b.i3": "Free changes up to 24 hours before pickup.", "b.calA": "Pickup day", "b.howA": "Pickup or delivery", "b.pick": "I'll pick it up", "b.deliver": "Deliver it (+€5)",
    "b.time": "Time", "b.addr": "Address in Gjakovë", "b.send": "Send the order",
    "b.fine": "We call you within two hours to confirm. Pay when you pick it up.",
    "b.doneT": "Order sent", "b.ics": "Add to calendar", "b.new": "Another cake",
    "g.title": "From our oven",
    "g.1": "White cake with blackberries and flowers", "g.2": "Chocolate drip cake", "g.3": "Colourful macarons", "g.4": "Pink cake with sprinkles", "g.5": "Small cake with macarons", "g.6": "Fresh croissants",
    "s.title": "How it works", "s.1": "Build and send", "s.1a": "Choose everything here. No online payment.",
    "s.2": "We call you", "s.2a": "Within two hours, about colours, the message and allergies.",
    "s.3": "Pick it up or we bring it", "s.3a": "In a cool box, with instructions on how to keep it.",
    "v.title": "Find us", "v.map": "Open in Google Maps",
    "q.1": "How many days ahead should I order?", "q.1a": "Two days for one tier, three days for two or three tiers. The calendar hides the days that are too close.",
    "q.2": "Do you make gluten-free or sugar-free cakes?", "q.2a": "Gluten-free yes, with almond flour, for +€6. Sugar-free no, because the cream doesn't hold.",
    "q.3": "How do I keep the cake?", "q.3a": "In the fridge, and take it out 30 minutes before cutting. It keeps for three days.",
    "v.allergy": "Our kitchen uses gluten, eggs, milk, nuts and pistachios. If you have a serious allergy, tell us when we call you.",
    "foot": "Concept project by"
  });

  var now = function () { return new Date(); };
  var toMin = K.toMin, mins = function (d) { return d.getHours() * 60 + d.getMinutes(); };
  var dayKey = function (d) { d = new Date(d); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var eur = function (n) { return K.eur(Math.round(n * 10) / 10); };

  /* ======================= today's counter ======================= */
  var bag = {};
  function openToday() { var h = D.hours[now().getDay()]; return h && mins(now()) < toMin(h[1]) - 30 ? h : null; }
  function counterDay() { var d = K.day0(now()); if (!openToday()) { do { d.setDate(d.getDate() + 1); } while (!D.hours[d.getDay()]); } return d; }
  function remaining(it) {
    var d = counterDay(), h = D.hours[d.getDay()], key = dayKey(d);
    var held = K.saved("embel-holds").filter(function (x) { return x.day === key; }).reduce(function (s, x) { return s + (x.items[it.id] || 0); }, 0);
    if (+d !== +K.day0(now())) return Math.max(0, it.made - held);
    var open = toMin(h[0]), close = toMin(h[1]), k = Math.min(1, Math.max(0, (mins(now()) - open) / (close - open)));
    var speed = { croissant: 1.25, tiramisu: .85, macarons: .7, pannacotta: .8, brownie: .9, oreo: 1.1 }[it.id] || 1;
    return Math.max(0, Math.round(it.made * (1 - Math.min(1, k * speed * .9))) - held);
  }
  function renderCounter() {
    var box = $("items"); box.innerHTML = ""; var total = 0;
    D.counter.forEach(function (it) {
      var left = remaining(it); total += left;
      if ((bag[it.id] || 0) > left) bag[it.id] = left;
      var a = document.createElement("article"); a.className = "it";
      a.innerHTML = '<div class="ph"><img loading="lazy" alt=""></div><h3></h3><span class="pr"></span><p class="left"></p><div class="bar"><i></i></div><div class="qty"><button type="button">−</button><output>0</output><button type="button">+</button></div>';
      var img = a.querySelector("img"); img.src = "img/" + it.img + ".jpg"; img.alt = t(it.sq, it.en);
      a.querySelector("h3").textContent = t(it.sq, it.en); a.querySelector(".pr").textContent = eur(it.price);
      a.querySelector(".left").textContent = left ? t("Mbeten " + left + " nga " + it.made, left + " of " + it.made + " left") : t("Mbaroi për sot", "Sold out for today");
      var bar = a.querySelector(".bar i"); bar.style.width = (left / it.made * 100) + "%"; if (left / it.made > .4) bar.className = "ok";
      if (!left) { var s = document.createElement("div"); s.className = "sold"; s.textContent = t("Mbaroi", "Sold out"); a.querySelector(".ph").appendChild(s); }
      var bs = a.querySelectorAll(".qty button"), out = a.querySelector(".qty output"), q = bag[it.id] || 0;
      out.textContent = q; bs[0].disabled = !q; bs[1].disabled = q >= left;
      bs[0].setAttribute("aria-label", t("Një më pak ", "One fewer ") + t(it.sq, it.en)); bs[1].setAttribute("aria-label", t("Shto një ", "Add one ") + t(it.sq, it.en));
      bs[0].addEventListener("click", function () { bag[it.id] = Math.max(0, q - 1); renderCounter(); });
      bs[1].addEventListener("click", function () { bag[it.id] = Math.min(left, q + 1); renderCounter(); });
      box.appendChild(a);
    });
    $("liveTxt").textContent = t("Përditësuar në " + K.hm(now()) + " · " + total + " copë në vitrinë", "Updated at " + K.hm(now()) + " · " + total + " pieces on the counter");
    renderBag();
  }
  function renderBag() {
    var list = $("bagList"), d = counterDay(), lines = D.counter.filter(function (it) { return bag[it.id]; }), sum = 0;
    $("bagSub").textContent = +d === +K.day0(now()) ? t("Për sot, " + K.dayLabel(d), "For today, " + K.dayLabel(d)) : t("Sot jemi mbyllur. Mbajmë për " + K.dayLabel(d) + ".", "We're closed today. Holding for " + K.dayLabel(d) + ".");
    list.innerHTML = "";
    if (!lines.length) { var e = document.createElement("p"); e.className = "empty"; e.textContent = t("Shtoni ëmbëlsira me butonin +.", "Add pastries with the + button."); list.appendChild(e); }
    else {
      var ul = document.createElement("ul");
      lines.forEach(function (it) { var li = document.createElement("li"), q = bag[it.id]; sum += q * it.price; li.innerHTML = "<span></span><span></span>"; li.children[0].textContent = q + " × " + t(it.sq, it.en); li.children[1].textContent = eur(q * it.price); ul.appendChild(li); });
      list.appendChild(ul);
      var tt = document.createElement("div"); tt.className = "tot"; tt.innerHTML = "<span></span><span></span>"; tt.children[0].textContent = t("Totali", "Total"); tt.children[1].textContent = eur(sum); list.appendChild(tt);
    }
    var sel = $("bagTime"), prev = sel.value; sel.innerHTML = "";
    var h = D.hours[d.getDay()], start = +d === +K.day0(now()) ? Math.ceil((mins(now()) + 30) / 30) * 30 : toMin(h[0]);
    for (var m = Math.max(start, toMin(h[0])); m <= toMin(h[1]) - 30; m += 30) { var o = document.createElement("option"); o.value = m; o.textContent = pad(Math.floor(m / 60)) + ":" + pad(m % 60); sel.appendChild(o); }
    if (prev && sel.querySelector('option[value="' + prev + '"]')) sel.value = prev;
  }
  var lastHold = null;
  $("bagSend").addEventListener("click", function () {
    var items = {}, n = 0, sum = 0; D.counter.forEach(function (it) { if (bag[it.id]) { items[it.id] = bag[it.id]; n += bag[it.id]; sum += bag[it.id] * it.price; } });
    var name = $("bagName").value.trim(), phone = $("bagPhone").value.trim(), err = $("bagErr");
    if (!n) { err.textContent = t("Shtoni të paktën një ëmbëlsirë.", "Add at least one pastry."); return; }
    if (name.length < 2) { err.textContent = t("Shkruani emrin.", "Enter your name."); $("bagName").focus(); return; }
    if (phone.replace(/\D/g, "").length < 8) { err.textContent = t("Shkruani një numër telefoni të saktë.", "Enter a valid phone number."); $("bagPhone").focus(); return; }
    err.textContent = ""; var btn = $("bagSend"); btn.disabled = true;
    var d = counterDay(), m = +$("bagTime").value, code = K.code("E"), when = new Date(d); when.setHours(Math.floor(m / 60), m % 60, 0, 0);
    var summary = D.counter.filter(function (it) { return items[it.id]; }).map(function (it) { return items[it.id] + "× " + it.sq; }).join(", ");
    K.submit({ demo: D.demo, endpoint: D.formEndpoint }, "Vitrina Ëmbël " + code, { Kodi: code, Marrja: K.dayLabel(when) + " " + K.hm(when), Porosia: summary, Totali: eur(sum), Emri: name, Telefoni: phone, _honey: "" })
      .then(function () {
        K.save("embel-holds", { day: dayKey(d), items: items, code: code }); lastHold = code; bag = {};
        $("bagForm").hidden = true; $("bagDone").hidden = false; $("bagCode").textContent = code;
        $("bagDoneTxt").textContent = t(n + " copë, " + eur(sum) + ". Ju presin te banaku " + K.dayLabel(when).toLowerCase() + " në " + K.hm(when) + ". Paguani kur i merrni.",
                                        n + " pieces, " + eur(sum) + ". Waiting at the counter " + K.dayLabel(when) + " at " + K.hm(when) + ". Pay when you collect.");
        renderCounter(); $("bagDone").focus();
      }).catch(function () { err.textContent = t("Nuk u dërgua. Provoni përsëri.", "Not sent. Try again."); })
      .then(function () { btn.disabled = false; });
  });
  $("bagNew").addEventListener("click", function () { $("bagDone").hidden = true; $("bagForm").hidden = false; });

  /* ======================= cake builder ======================= */
  var C = { shape: "round", tiers: 2, size: 20, sponge: "van", fill: "rasp", frost: "pink", deco: { berries: true }, msg: "", day: null, delivery: false };
  var find = function (arr, id) { return arr.filter(function (x) { return x.id === id; })[0]; };
  function tierCms() { var out = []; for (var i = 0; i < C.tiers; i++) out.push(C.size - i * 4); return out; }
  function servesFor(cm) { var s = D.sizes.filter(function (x) { return x.cm === cm; })[0]; return s ? s.serves : cm === 12 ? 6 : 3; }
  function serves() { return tierCms().reduce(function (s, cm) { return s + servesFor(cm); }, 0); }
  function price() {
    var sp = find(D.sponges, C.sponge), fi = find(D.fillings, C.fill);
    var p = serves() * D.perSlice + D.tierFee[C.tiers] + (sp.add + fi.add) * C.tiers + (C.shape === "square" ? D.squareFee : 0);
    D.decorations.forEach(function (d) { if (C.deco[d.id]) p += d.add; });
    return Math.round(p);
  }
  function pills(boxId, items, cur, label, onPick) {
    var box = $(boxId); box.innerHTML = "";
    items.forEach(function (it) {
      var b = document.createElement("button"); b.type = "button"; b.className = "pill";
      var on = typeof cur === "function" ? cur(it) : it.id === cur; b.setAttribute("aria-pressed", String(!!on));
      if (it.color) { var i = document.createElement("i"); i.style.background = it.color; b.appendChild(i); }
      b.appendChild(document.createTextNode(label(it)));
      if (it.add) { var s = document.createElement("small"); s.textContent = "+" + eur(it.add); b.appendChild(s); }
      if (it.disabled) b.disabled = true;
      b.addEventListener("click", function () { onPick(it); });
      box.appendChild(b);
    });
  }
  function renderOpts() {
    pills("oShape", [{ id: "round", sq: "E rrumbullakët", en: "Round" }, { id: "square", sq: "Katrore", en: "Square", add: D.squareFee }], C.shape, function (x) { return t(x.sq, x.en); }, function (x) { C.shape = x.id; update(); });
    pills("oTiers", [1, 2, 3].map(function (n) { return { id: n, sq: n + (n === 1 ? " kat" : " kate"), en: n + (n === 1 ? " tier" : " tiers"), disabled: n === 3 && C.size === 16 }; }), C.tiers, function (x) { return t(x.sq, x.en); }, function (x) { C.tiers = x.id; update(true); });
    pills("oSize", D.sizes.map(function (s) { return { id: s.cm, sq: s.cm + " cm", en: s.cm + " cm" }; }), C.size, function (x) { return t(x.sq, x.en); }, function (x) { C.size = x.id; if (C.size === 16 && C.tiers === 3) C.tiers = 2; update(true); });
    pills("oSponge", D.sponges, C.sponge, function (x) { return t(x.sq, x.en); }, function (x) { C.sponge = x.id; update(); });
    pills("oFill", D.fillings, C.fill, function (x) { return t(x.sq, x.en); }, function (x) { C.fill = x.id; update(); });
    pills("oDeco", D.decorations, function (x) { return C.deco[x.id]; }, function (x) { return t(x.sq, x.en); }, function (x) { C.deco[x.id] = !C.deco[x.id]; update(); });
    var sw = $("oFrost"); sw.innerHTML = "";
    D.frostings.forEach(function (f) {
      var b = document.createElement("button"); b.type = "button"; b.style.background = f.color; b.setAttribute("aria-pressed", String(C.frost === f.id)); b.setAttribute("aria-label", t(f.sq, f.en)); b.title = t(f.sq, f.en);
      b.addEventListener("click", function () { C.frost = f.id; update(); }); sw.appendChild(b);
    });
    $("oFrostName").textContent = t(find(D.frostings, C.frost).sq, find(D.frostings, C.frost).en);
  }

  /* --- drawing --- */
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function mix(hex, w, k) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255, m = w === "w" ? 255 : 0; r = Math.round(r + (m - r) * k); g = Math.round(g + (m - g) * k); b = Math.round(b + (m - b) * k); return "rgb(" + r + "," + g + "," + b + ")"; }
  var prevTiers = 0;
  function draw(animate) {
    var svg = $("cake"), desc = $("cakeDesc"); while (svg.lastChild !== desc) svg.removeChild(svg.lastChild);
    var fr = find(D.frostings, C.frost).color, seed = 7, rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var defs = el("defs", {}, svg), g = el("linearGradient", { id: "shade", x1: "0", x2: "1" }, defs);
    el("stop", { offset: "0", "stop-color": "#3B1E19", "stop-opacity": ".22" }, g); el("stop", { offset: ".35", "stop-color": "#3B1E19", "stop-opacity": "0" }, g);
    el("stop", { offset: ".7", "stop-color": "#fff", "stop-opacity": ".18" }, g); el("stop", { offset: "1", "stop-color": "#3B1E19", "stop-opacity": ".12" }, g);
    // stand
    el("ellipse", { cx: 180, cy: 318, rx: 70, ry: 7, fill: "#3B1E19", opacity: ".12" }, svg);
    el("path", { d: "M160 300 L152 318 H208 L200 300 Z", fill: "#E9D6CF" }, svg);
    el("ellipse", { cx: 180, cy: 298, rx: 156, ry: 15, fill: "#fff" }, svg);
    el("ellipse", { cx: 180, cy: 301, rx: 156, ry: 13, fill: "none", stroke: "#E7C2C9", "stroke-width": 1.5 }, svg);
    var y = 296, heights = [72, 62, 54], cms = tierCms(), tops = [];
    cms.forEach(function (cm, i) {
      var w = cm * 9.2, h = heights[i], x0 = 180 - w / 2, x1 = 180 + w / 2, ry = C.shape === "round" ? w * .085 : w * .06, yTop = y - h;
      var tg = el("g", { "class": animate && i >= prevTiers ? "tier" : "" }, svg);
      if (animate && i >= prevTiers) tg.style.animationDelay = ((i - prevTiers) * .12) + "s";
      if (C.shape === "round") {
        el("path", { d: "M" + x0 + " " + yTop + " L" + x0 + " " + y + " A" + w / 2 + " " + ry + " 0 0 0 " + x1 + " " + y + " L" + x1 + " " + yTop + " Z", fill: fr }, tg);
        el("path", { d: "M" + x0 + " " + yTop + " L" + x0 + " " + y + " A" + w / 2 + " " + ry + " 0 0 0 " + x1 + " " + y + " L" + x1 + " " + yTop + " Z", fill: "url(#shade)" }, tg);
        el("ellipse", { cx: 180, cy: yTop, rx: w / 2, ry: ry, fill: mix(fr, "w", .28) }, tg);
      } else {
        el("rect", { x: x0, y: yTop, width: w, height: h, fill: fr }, tg);
        el("rect", { x: x0, y: yTop, width: w, height: h, fill: "url(#shade)" }, tg);
        el("path", { d: "M" + x0 + " " + yTop + " L" + (x0 + ry * 1.6) + " " + (yTop - ry * 1.3) + " L" + (x1 - ry * 1.6) + " " + (yTop - ry * 1.3) + " L" + x1 + " " + yTop + " Z", fill: mix(fr, "w", .28) }, tg);
      }
      // bead border at the base
      var beads = Math.floor(w / 11);
      for (var b = 0; b <= beads; b++) {
        var bx = x0 + b * (w / beads), by = C.shape === "round" ? y + Math.sqrt(Math.max(0, 1 - Math.pow((bx - 180) / (w / 2), 2))) * ry - 2 : y - 2;
        el("circle", { cx: bx, cy: by, r: 5, fill: mix(fr, "w", .45), stroke: mix(fr, "k", .12), "stroke-width": .8 }, tg);
      }
      if (C.deco.drip) {
        var drip = "#4A2418";
        if (C.shape === "round") el("ellipse", { cx: 180, cy: yTop, rx: w / 2 + 1, ry: ry + 1, fill: drip }, tg);
        else el("path", { d: "M" + x0 + " " + yTop + " L" + (x0 + ry * 1.6) + " " + (yTop - ry * 1.3) + " L" + (x1 - ry * 1.6) + " " + (yTop - ry * 1.3) + " L" + x1 + " " + yTop + " Z", fill: drip }, tg);
        el("rect", { x: x0, y: yTop - 1, width: w, height: 8, fill: drip }, tg);
        for (var d = x0 + 6; d < x1 - 6; d += 13 + rnd() * 6) {
          var len = 10 + rnd() * (h * .45), curve = C.shape === "round" ? Math.sqrt(Math.max(0, 1 - Math.pow((d - 180) / (w / 2), 2))) * ry : 0;
          el("rect", { x: d - 4, y: yTop, width: 8, height: len + curve, rx: 4, fill: drip }, tg);
        }
      }
      if (C.deco.sprinkles) {
        var cols = ["#F2C14E", "#7FB7E6", "#E85D8A", "#8FCB7A", "#fff"];
        for (var s = 0; s < w / 4; s++) {
          var sx = x0 + 8 + rnd() * (w - 16), sy = yTop + 14 + rnd() * (h - 24);
          el("rect", { x: sx, y: sy, width: 7, height: 2.4, rx: 1.2, fill: cols[s % cols.length], transform: "rotate(" + Math.round(rnd() * 180) + " " + sx + " " + sy + ")" }, tg);
        }
      }
      if (C.deco.flowers) {
        [[x0 + 12, yTop + 16], [x1 - 16, yTop + h * .55]].forEach(function (p, k) {
          var fg = el("g", { transform: "translate(" + p[0] + " " + p[1] + ")" }, tg), pc = k % 2 ? "#fff" : "#F28CA8";
          for (var a = 0; a < 5; a++) { var an = a / 5 * Math.PI * 2; el("circle", { cx: Math.cos(an) * 6, cy: Math.sin(an) * 6, r: 5.5, fill: pc, stroke: "#E7C2C9", "stroke-width": .6 }, fg); }
          el("circle", { cx: 0, cy: 0, r: 3.6, fill: "#F2C14E" }, fg);
          el("path", { d: "M6 6 q8 4 14 0", stroke: "#7AA35E", "stroke-width": 2.4, fill: "none", "stroke-linecap": "round" }, fg);
        });
      }
      tops.push({ yTop: yTop, w: w, ry: ry, g: tg });
      y = yTop;
    });
    var top = tops[tops.length - 1];
    if (C.deco.berries) {
      for (var k = 0; k < 9; k++) {
        var bx2 = 180 - top.w * .32 + k * (top.w * .64 / 8), byy = top.yTop + (k % 2 ? 2 : -3) - Math.sin(k / 8 * Math.PI) * 2;
        var col = k % 3 === 0 ? "#2D2C5A" : "#7A1230";
        el("circle", { cx: bx2, cy: byy - 5, r: 7, fill: col }, top.g); el("circle", { cx: bx2 - 2.4, cy: byy - 7.5, r: 1.8, fill: "#fff", opacity: ".55" }, top.g);
      }
    }
    if (C.deco.macarons) {
      var mc = ["#F6B9C8", "#C9DBA8", "#D3C4EC", "#F7D58C"];
      for (var j = 0; j < 4; j++) {
        var mx = 180 - top.w * .28 + j * (top.w * .56 / 3), my = top.yTop - 12 - (j % 2) * 4;
        el("rect", { x: mx - 10, y: my - 3, width: 20, height: 9, rx: 4.5, fill: mc[j] }, top.g);
        el("rect", { x: mx - 9, y: my + 1, width: 18, height: 2.4, fill: "#FFF8F4" }, top.g);
      }
    }
    if (C.msg) {
      var py = top.yTop - (C.deco.macarons ? 50 : C.deco.berries ? 44 : 34);
      el("line", { x1: 180, y1: py + 26, x2: 180, y2: top.yTop + 2, stroke: "#C9A27A", "stroke-width": 2.5 }, top.g);
      var tw = Math.min(200, Math.max(70, C.msg.length * 8.2 + 26));
      el("rect", { x: 180 - tw / 2, y: py, width: tw, height: 28, rx: 14, fill: "#FFF8F4", stroke: "#3B1E19", "stroke-width": 1.4 }, top.g);
      var tx = el("text", { x: 180, y: py + 18.5, "text-anchor": "middle", "font-family": "Young Serif, Georgia, serif", "font-size": 13, fill: "#3B1E19" }, top.g); tx.textContent = C.msg;
    }
    prevTiers = C.tiers;
    var sp = find(D.sponges, C.sponge), fi = find(D.fillings, C.fill), fro = find(D.frostings, C.frost);
    desc.textContent = t("Tortë " + (C.shape === "round" ? "e rrumbullakët" : "katrore") + " me " + C.tiers + " kate, krem " + fro.sq.toLowerCase() + ", brumë " + sp.sq.toLowerCase() + " me " + fi.sq.toLowerCase() + ".",
                         (C.shape === "round" ? "Round" : "Square") + " " + C.tiers + "-tier cake, " + fro.en.toLowerCase() + " cream, " + sp.en.toLowerCase() + " sponge with " + fi.en.toLowerCase() + ".");
    var ls = $("layers").children; [0, 2, 4].forEach(function (i) { ls[i].style.background = sp.color; }); [1, 3].forEach(function (i) { ls[i].style.background = fi.color; });
  }

  /* --- capacity calendar --- */
  function booked(d) { var s = d.getFullYear() * 500 + d.getMonth() * 40 + d.getDate(); s = (s * 9301 + 49297) % 233280; var base = d.getDay() === 6 || d.getDay() === 5 ? 4 : 2; return base + Math.floor(s / 233280 * 4) + K.saved("embel-cakes").filter(function (c) { return c.day === dayKey(d); }).reduce(function (a, c) { return a + c.tiers; }, 0); }
  function earliest() { return new Date(Date.now() + D.noticeHours[C.tiers] * 36e5); }
  function dayState(d) {
    if (!D.hours[d.getDay()]) return "closed";
    var e = earliest(), lastPick = new Date(d); lastPick.setHours(Math.floor(toMin(D.pickup.last) / 60), 0, 0, 0);
    if (lastPick < e) return "soon";
    if (booked(d) + C.tiers > D.capacityPerDay) return "full";
    return "ok";
  }
  function renderCal() {
    var cal = $("cal"); cal.innerHTML = "";
    var start = K.day0(now()); start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    [1, 2, 3, 4, 5, 6, 0].forEach(function (wd) { var s = document.createElement("span"); s.className = "wd"; s.textContent = K.WS[K.lang][wd]; s.setAttribute("aria-hidden", "true"); cal.appendChild(s); });
    var firstOk = null, today = K.day0(now());
    for (var i = 0; i < 28; i++) {
      var d = new Date(start); d.setDate(start.getDate() + i);
      var b = document.createElement("button"); b.type = "button";
      var st = d < today ? "past" : dayState(d);
      b.innerHTML = "<span></span><small></small>"; b.children[0].textContent = d.getDate();
      b.children[1].textContent = st === "full" ? t("plot", "full") : st === "closed" ? t("mbyllur", "closed") : st === "ok" ? (D.capacityPerDay - booked(d) <= 2 ? t("pak vende", "few left") : "") : "";
      b.disabled = st !== "ok";
      if (st === "ok" && !firstOk) firstOk = +d;
      K.srText(b, K.dayLabel(d) + (st === "ok" ? "" : st === "full" ? t(", plot", ", full") : st === "closed" ? t(", mbyllur", ", closed") : t(", shumë afër", ", too soon")));
      b.setAttribute("aria-pressed", String(C.day === +d));
      (function (d) { b.addEventListener("click", function () { C.day = +d; renderCal(); renderTimes(); }); })(d);
      cal.appendChild(b);
    }
    if (!C.day || dayState(new Date(C.day)) !== "ok") { C.day = firstOk; if (firstOk) { var on = [].filter.call(cal.querySelectorAll("button"), function (x) { return !x.disabled; })[0]; if (on) on.setAttribute("aria-pressed", "true"); } }
    $("calNote").textContent = t("Për " + C.tiers + (C.tiers === 1 ? " kat" : " kate") + " na duhen " + D.noticeHours[C.tiers] + " orë. Ditët e hënës jemi mbyllur.",
                                 "For " + C.tiers + (C.tiers === 1 ? " tier" : " tiers") + " we need " + D.noticeHours[C.tiers] + " hours. We're closed on Mondays.");
    $("sEarly").textContent = firstOk ? (function (d) { return d.getDate() + " " + K.MO[K.lang][d.getMonth()].slice(0, 3); })(new Date(firstOk)) : "–";
    renderTimes();
  }
  function renderTimes() {
    var sel = $("cTime"), prev = sel.value; sel.innerHTML = ""; if (!C.day) return;
    var d = new Date(C.day), h = D.hours[d.getDay()], e = earliest();
    for (var m = Math.max(toMin(D.pickup.first), toMin(h[0]) + 60); m <= Math.min(toMin(D.pickup.last), toMin(h[1]) - 60); m += D.pickup.step) {
      var s = new Date(d); s.setHours(Math.floor(m / 60), m % 60, 0, 0); if (s < e) continue;
      var o = document.createElement("option"); o.value = m; o.textContent = pad(Math.floor(m / 60)) + ":" + pad(m % 60); sel.appendChild(o);
    }
    if (prev && sel.querySelector('option[value="' + prev + '"]')) sel.value = prev;
  }
  function update(animate) {
    renderOpts(); draw(animate);
    $("sServes").textContent = serves(); $("sPrice").textContent = eur(price() + (C.delivery ? D.pickup.deliveryFee : 0));
    renderCal();
  }
  $("oMsg").addEventListener("input", function () { C.msg = this.value.trim(); $("oMsgN").textContent = this.value.length + "/22"; draw(false); });
  [["tPick", false], ["tDel", true]].forEach(function (p) {
    $(p[0]).addEventListener("click", function () { C.delivery = p[1]; $("tPick").setAttribute("aria-pressed", String(!p[1])); $("tDel").setAttribute("aria-pressed", String(p[1])); $("addrF").hidden = !p[1]; $("sPrice").textContent = eur(price() + (C.delivery ? D.pickup.deliveryFee : 0)); });
  });
  var lastCake = null;
  $("cSend").addEventListener("click", function () {
    var name = $("cName").value.trim(), phone = $("cPhone").value.trim(), err = $("cErr");
    if (!C.day || !$("cTime").value) { err.textContent = t("Zgjidhni ditën dhe orën.", "Choose the day and time."); return; }
    if (C.delivery && $("cAddr").value.trim().length < 5) { err.textContent = t("Shkruani adresën.", "Enter the address."); $("cAddr").focus(); return; }
    if (name.length < 2) { err.textContent = t("Shkruani emrin.", "Enter your name."); $("cName").focus(); return; }
    if (phone.replace(/\D/g, "").length < 8) { err.textContent = t("Shkruani një numër telefoni të saktë.", "Enter a valid phone number."); $("cPhone").focus(); return; }
    err.textContent = ""; var btn = $("cSend"); btn.disabled = true;
    var m = +$("cTime").value, when = new Date(C.day); when.setHours(Math.floor(m / 60), m % 60, 0, 0);
    var sp = find(D.sponges, C.sponge), fi = find(D.fillings, C.fill), fro = find(D.frostings, C.frost), code = K.code("T"), total = price() + (C.delivery ? D.pickup.deliveryFee : 0);
    var deco = D.decorations.filter(function (d) { return C.deco[d.id]; }).map(function (d) { return d.sq; }).join(", ") || "-";
    K.submit({ demo: D.demo, endpoint: D.formEndpoint }, "Tortë Ëmbël " + code, {
      Kodi: code, Torta: (C.shape === "round" ? "E rrumbullakët" : "Katrore") + ", " + C.tiers + " kate, " + C.size + " cm, " + serves() + " copë",
      Brumi: sp.sq, Mbushja: fi.sq, Kremi: fro.sq, Dekorimi: deco, Mbishkrimi: C.msg || "-", Data: K.dayLabel(when) + " " + K.hm(when),
      Marrja: C.delivery ? "Dërgesë: " + $("cAddr").value.trim() : "Në dyqan", Cmimi: eur(total), Emri: name, Telefoni: phone, _honey: ""
    }).then(function () {
      K.save("embel-cakes", { day: dayKey(when), tiers: C.tiers, code: code }); lastCake = { code: code, when: +when };
      $("cakeForm").hidden = true; $("cakeDone").hidden = false; $("cCode").textContent = code;
      $("cDoneTxt").textContent = t("Tortë me " + C.tiers + (C.tiers === 1 ? " kat" : " kate") + ", " + serves() + " copë, " + eur(total) + ". " + (C.delivery ? "Ua sjellim " : "Gati për ju ") + K.dayLabel(when).toLowerCase() + " në " + K.hm(when) + ". Ju telefonojmë brenda dy orësh.",
                                    C.tiers + "-tier cake, " + serves() + " slices, " + eur(total) + ". " + (C.delivery ? "Delivered " : "Ready for you ") + K.dayLabel(when) + " at " + K.hm(when) + ". We'll call you within two hours.");
      $("cakeDone").focus();
    }).catch(function () { err.textContent = t("Nuk u dërgua. Provoni përsëri ose telefononi.", "Not sent. Try again or call us."); })
      .then(function () { btn.disabled = false; });
  });
  $("cIcs").addEventListener("click", function () { if (lastCake) K.ics("embel-" + lastCake.code, [{ start: lastCake.when, end: lastCake.when + 30 * 6e4, title: t("Merr tortën te Ëmbël", "Collect the cake at Ëmbël"), where: "Rr. Ismail Qemali 22, Gjakovë" }]); });
  $("cNew").addEventListener("click", function () { $("cakeDone").hidden = true; $("cakeForm").hidden = false; renderCal(); });

  function renderHours() {
    var tbl = $("hours"), today = now().getDay(); tbl.innerHTML = "";
    [1, 2, 3, 4, 5, 6, 0].forEach(function (wd) { var tr = document.createElement("tr"); if (wd === today) tr.className = "today"; tr.innerHTML = "<td></td><td></td>"; tr.children[0].textContent = K.WD[K.lang][wd]; tr.children[1].textContent = D.hours[wd] ? D.hours[wd].join("–") : t("Mbyllur", "Closed"); tbl.appendChild(tr); });
  }

  function renderAll(first) { renderCounter(); update(first === true); renderHours(); }
  K.onLang(renderAll);
  renderAll(true);
  setInterval(renderCounter, 60000);
})();
