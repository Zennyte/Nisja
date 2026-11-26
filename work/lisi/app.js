/* Lisi: configurable products, a drag-and-drop room planner with fit checks, and an offer list. Settings live in data.js. */
(function () {
  "use strict";
  var D = window.LISI, $ = K.$, t = K.t;

  K.i18n({
    "demo": "This is a <b>concept project</b> by <a href=\"../../\">Nisja Studio</a>. The workshop does not exist.",
    "nav.coll": "Collection", "nav.plan": "Room planner", "nav.shop": "Workshop", "nav.visit": "Showroom", "nav.list": "List",
    "h.title": "Furniture made to the size of your home.",
    "h.lead": "Sofas, tables and beds in solid wood, made by hand in our workshop in Pejë. Choose the wood and the fabric, try them in your room plan, then ask us for an offer.",
    "h.cta": "See the collection", "h.cta2": "Try it in your room", "h.f1": "workshop since", "h.f2": "weeks to make", "h.f3": "year frame warranty",
    "h.alt": "Living room with a grey sofa and a wooden table",
    "c.title": "Collection", "c.lead": "Every piece is made after you order it, in the wood, fabric and size you choose. Open one to see the price.",
    "p.title": "Will it fit?", "p.lead": "Type the size of your room, add furniture and drag it with your finger or mouse. The plan tells you if something sticks out, sits on something else or blocks the door.",
    "p.room": "Room (cm)", "p.w": "Width", "p.l": "Length", "p.add": "Add", "p.in": "In the room",
    "p.aria": "Room plan. Select a piece with Tab, move it with the arrow keys, rotate it with R.",
    "p.hint": "Keyboard: Tab to select, arrow keys to move 10 cm, R to rotate, Delete to remove.",
    "w.alt": "Wooden dining table with green chairs", "w.title": "From the log to your home",
    "w.lead": "We buy our wood from the sawmill in Rugova and dry it ourselves for two years. One carpenter makes each piece from start to finish, and signs it underneath.",
    "w.y": "years", "w.1": "of natural wood drying", "w.2": "MDF or plywood boards", "w.3": "carpenters in the workshop", "w.4": "year warranty on the frame",
    "l.title": "Your list", "l.lead": "This is not a payment. Send us the list and we reply with an offer and a delivery date within one working day.",
    "l.sTitle": "Free samples", "l.sLead": "Choose up to three fabric or wood samples. We post them in 2–3 days.",
    "l.sub": "Subtotal", "l.del": "Delivery", "l.tot": "Approximate total",
    "l.name": "Name", "l.phone": "Phone", "l.city": "Town and address", "l.note": "Note (optional)", "l.notePh": "e.g. third floor, no lift",
    "l.send": "Ask for the offer", "l.okT": "List sent", "l.new": "Start a new list",
    "v.title": "Showroom and workshop", "v.map": "Open in Google Maps",
    "q.1": "How long does it take to make?", "q.1a": "Three to six weeks, depending on the piece. Your list shows the approximate date for the whole order.",
    "q.2": "Can I see the wood before ordering?", "q.2a": "Yes. Visit the showroom, or ask for up to three free samples by post.",
    "q.3": "How do I pay?", "q.3a": "30% when you sign the order, the rest on delivery. No online payment.",
    "q.4": "Do you make completely different sizes?", "q.4a": "Yes. Write the sizes in the note or bring a sketch. We make most pieces in any size.",
    "foot": "Concept project by",
    "pd.size": "Size", "pd.len": "Length", "pd.wide": "wide", "pd.qty": "Quantity", "pd.less": "Fewer", "pd.more": "More",
    "pd.add": "Add to list", "pd.plan": "Try it in the plan", "close": "Close"
  });

  var eur = function (n) { return "€" + Math.round(n).toLocaleString("de-DE").replace(/\./g, " "); };
  var P = function (id) { return D.products.filter(function (p) { return p.id === id; })[0]; };
  var mat = function (p, id) { return (p.mat === "wood" ? D.woods : D.fabrics).filter(function (m) { return m.id === id; })[0]; };
  function toast(msg) { var el = $("toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(function () { el.classList.remove("on"); }, 2200); }

  /* ---------- pricing ---------- */
  function cfgPrice(c) {
    var p = P(c.id), m = mat(p, c.mat), base = p.base;
    if (p.custom) base += (c.len - p.custom.min) * p.custom.perCm; else base += p.sizes[c.size].add;
    return Math.round(base * m.k) * (c.qty || 1);
  }
  function cfgSize(c) { var p = P(c.id); return p.custom ? { w: c.len, d: p.custom.d } : p.sizes[c.size]; }
  function defaultCfg(p) { return { id: p.id, mat: (p.mat === "wood" ? p.woods : p.fabrics)[0], size: 0, len: p.custom ? p.custom.min + 40 : 0, qty: p.qty ? 4 : 1 }; }

  /* ---------- collection ---------- */
  function renderColl() {
    var box = $("coll"); box.innerHTML = "";
    D.products.forEach(function (p) {
      var b = document.createElement("button"); b.type = "button"; b.className = "prod";
      b.innerHTML = '<span class="ph"><img loading="lazy" alt=""></span><h3></h3><span class="sub"><span></span><b></b></span><span class="dots"></span>';
      b.querySelector("img").src = "img/" + p.img + ".jpg";
      b.querySelector("h3").textContent = t(p.sq, p.en);
      var s = p.custom ? p.custom.min + "–" + p.custom.max + " cm" : p.sizes.map(function (z) { return z.w; }).join(" / ") + " cm";
      b.querySelector(".sub span").textContent = s;
      var min = Math.min.apply(null, (p.mat === "wood" ? p.woods : p.fabrics).map(function (id) { return Math.round(p.base * mat(p, id).k); }));
      b.querySelector(".sub b").textContent = t("nga ", "from ") + eur(min);
      var dots = b.querySelector(".dots");
      (p.mat === "wood" ? p.woods : p.fabrics).forEach(function (id) { var i = document.createElement("i"); i.style.background = mat(p, id).color; dots.appendChild(i); });
      
      b.addEventListener("click", function () { openP(p.id); });
      box.appendChild(b);
    });
  }

  /* ---------- product dialog ---------- */
  var cur = null;
  function openP(id) { cur = defaultCfg(P(id)); paintP(); $("pDlg").showModal(); }
  function paintP() {
    var p = P(cur.id), m = mat(p, cur.mat);
    $("pdT").textContent = t(p.sq, p.en); $("pdDs").textContent = t(p.dsq, p.den);
    var img = $("pdImg"), src = "img/" + (m.img || p.img) + ".jpg";
    if (img.getAttribute("src") !== src) { img.style.opacity = 0; img.onload = function () { img.style.opacity = 1; }; img.src = src; }
    img.alt = t(p.sq, p.en) + ", " + t(m.sq, m.en);
    // for woods and fabrics without their own photo, tint the photo to suggest the colour
    var tint = $("pdTint"); tint.style.background = m.color; tint.style.opacity = m.img || (p.mat === "wood" && cur.mat === p.woods[0]) || (p.mat === "fabric" && cur.mat === p.fabrics[0]) ? 0 : .22;
    $("pdMatL").textContent = p.mat === "wood" ? t("Druri", "Wood") : t("Stofi", "Fabric");
    $("pdMatN").textContent = t(m.sq, m.en) + (m.k !== 1 ? " (" + (m.k > 1 ? "+" : "−") + Math.round(Math.abs(m.k - 1) * 100) + "%)" : "");
    var mats = $("pdMats"); mats.innerHTML = "";
    (p.mat === "wood" ? p.woods : p.fabrics).forEach(function (id) {
      var mm = mat(p, id), b = document.createElement("button"); b.type = "button";
      b.style.background = p.mat === "wood" ? "repeating-linear-gradient(100deg, " + mm.color + " 0 6px, " + mm.grain + " 6px 7px, " + mm.color + " 7px 13px)" : mm.color;
      b.setAttribute("aria-pressed", String(cur.mat === id)); b.setAttribute("aria-label", t(mm.sq, mm.en)); b.title = t(mm.sq, mm.en);
      b.addEventListener("click", function () { cur.mat = id; paintP(); }); mats.appendChild(b);
    });
    $("pdSizeG").hidden = !!p.custom || p.sizes.length < 2; $("pdLenG").hidden = !p.custom; $("pdQtyG").hidden = !p.qty;
    if (!p.custom) {
      var sz = $("pdSizes"); sz.innerHTML = "";
      p.sizes.forEach(function (s, i) { var b = document.createElement("button"); b.type = "button"; b.textContent = s.w + " × " + s.d + " cm"; b.setAttribute("aria-pressed", String(cur.size === i)); b.addEventListener("click", function () { cur.size = i; paintP(); }); sz.appendChild(b); });
      $("pdSizeN").textContent = p.sizes[cur.size].w + " × " + p.sizes[cur.size].d + " cm";
    } else {
      var l = $("pdLen"); l.min = p.custom.min; l.max = p.custom.max; l.step = p.custom.step; l.value = cur.len; $("pdLenO").textContent = cur.len + " cm";
    }
    $("pdQ").textContent = cur.qty;
    $("pdP").textContent = eur(cfgPrice(cur));
    $("pdW").textContent = t("Gati për " + p.weeks + " javë", "Ready in " + p.weeks + " weeks") + (cur.qty > 1 ? " · " + cur.qty + " × " + eur(cfgPrice(cur) / cur.qty) : "");
  }
  $("pdLen").addEventListener("input", function () { cur.len = +this.value; $("pdLenO").textContent = cur.len + " cm"; $("pdP").textContent = eur(cfgPrice(cur)); });
  $("pdQm").addEventListener("click", function () { cur.qty = Math.max(1, cur.qty - 1); paintP(); });
  $("pdQp").addEventListener("click", function () { cur.qty = Math.min(12, cur.qty + 1); paintP(); });
  $("pdAdd").addEventListener("click", function () { addToList(cur); $("pDlg").close(); toast(t("U shtua në listë", "Added to your list")); });
  $("pdPlan").addEventListener("click", function () { var p = P(cur.id); placeItem(cur); $("pDlg").close(); K.smooth("#plani"); });
  $("pDlg").addEventListener("click", function (e) { if (e.target === this || e.target.closest("[data-close]")) this.close(); });

  /* ---------- list ---------- */
  var list = K.saved("lisi-list");
  function saveList() { try { localStorage.setItem("lisi-list", JSON.stringify(list)); } catch (e) {} }
  function addToList(c) { list.push(JSON.parse(JSON.stringify(c))); saveList(); renderList(); }
  function cfgLabel(c) {
    var p = P(c.id), m = mat(p, c.mat), s = cfgSize(c);
    return t(m.sq, m.en) + " · " + s.w + " × " + s.d + " cm" + (c.qty > 1 ? " · " + c.qty + t(" copë", " pcs") : "");
  }
  function renderList() {
    $("listN").textContent = list.length;
    var ul = $("lines"); ul.innerHTML = "";
    if (!list.length) { var e = document.createElement("li"); e.className = "empty"; e.style.display = "block"; e.textContent = t("Lista është bosh. Hapni një copë nga koleksioni dhe shtypni “Shto në listë”.", "Your list is empty. Open a piece from the collection and press “Add to list”."); ul.appendChild(e); }
    var sub = 0, weeks = 0, pieces = 0;
    list.forEach(function (c, i) {
      var p = P(c.id), price = cfgPrice(c); sub += price; weeks = Math.max(weeks, p.weeks); pieces += c.qty || 1;
      var li = document.createElement("li"); li.innerHTML = '<img alt=""><div><b></b><small></small></div><div class="r"><span></span><button type="button"></button></div>';
      li.querySelector("img").src = "img/" + (mat(p, c.mat).img || p.img) + ".jpg";
      li.querySelector("b").textContent = t(p.sq, p.en); li.querySelector("small").textContent = cfgLabel(c);
      li.querySelector(".r span").textContent = eur(price);
      var rm = li.querySelector(".r button"); rm.textContent = t("Hiq", "Remove"); rm.setAttribute("aria-label", t("Hiq ", "Remove ") + t(p.sq, p.en));
      rm.addEventListener("click", function () { list.splice(i, 1); saveList(); renderList(); });
      ul.appendChild(li);
    });
    var del = D.delivery.filter(function (d) { return d.id === $("oDel").value; })[0] || D.delivery[0];
    var asm = $("oAsm").checked && del.id !== "pick" ? pieces * D.assemblyPerItem : 0;
    $("oAsm").disabled = del.id === "pick";
    $("oAsmL").textContent = t("Montimi në shtëpi (" + eur(D.assemblyPerItem) + " për copë)", "Assembly at home (" + eur(D.assemblyPerItem) + " per piece)");
    $("oSub").textContent = eur(sub); $("oTot").textContent = eur(sub + del.fee + asm);
    if (weeks) { var d = new Date(); d.setDate(d.getDate() + weeks * 7 + 3); $("oReady").hidden = false; $("oReady").textContent = t("Gati rreth " + d.getDate() + " " + K.MO.sq[d.getMonth()] + " (" + weeks + " javë prodhim, pastaj dorëzimi).", "Ready around " + d.getDate() + " " + K.MO.en[d.getMonth()] + " (" + weeks + " weeks to make, then delivery)."); }
    else $("oReady").hidden = true;
  }
  function renderDel() {
    var s = $("oDel"), prev = s.value; s.innerHTML = "";
    D.delivery.forEach(function (d) { var o = document.createElement("option"); o.value = d.id; o.textContent = t(d.sq, d.en) + (d.fee ? " · " + eur(d.fee) : t(" · falas", " · free")); s.appendChild(o); });
    if (prev) s.value = prev;
  }
  $("oDel").addEventListener("change", renderList); $("oAsm").addEventListener("change", renderList);
  function renderSamples() {
    var box = $("samples"), prev = [].map.call(box.querySelectorAll("input:checked"), function (i) { return i.value; }); box.innerHTML = "";
    D.fabrics.concat(D.woods).forEach(function (m) {
      var l = document.createElement("label"); l.innerHTML = '<input type="checkbox"><i></i><span></span>';
      l.querySelector("input").value = m.id; l.querySelector("input").checked = prev.indexOf(m.id) >= 0;
      l.querySelector("i").style.background = m.grain ? "repeating-linear-gradient(100deg, " + m.color + " 0 4px, " + m.grain + " 4px 5px)" : m.color;
      l.querySelector("span").textContent = t(m.sq, m.en);
      l.querySelector("input").addEventListener("change", function () {
        var on = box.querySelectorAll("input:checked"); if (on.length > 3) { this.checked = false; toast(t("Deri në tri mostra.", "Up to three samples.")); }
      });
      box.appendChild(l);
    });
  }
  $("oSend").addEventListener("click", function () {
    var name = $("oName").value.trim(), phone = $("oPhone").value.trim(), city = $("oCity").value.trim(), err = $("oErr");
    var samples = [].map.call($("samples").querySelectorAll("input:checked"), function (i) { var m = D.fabrics.concat(D.woods).filter(function (x) { return x.id === i.value; })[0]; return m.sq; });
    if (!list.length && !samples.length) { err.textContent = t("Shtoni të paktën një copë ose një mostër.", "Add at least one piece or one sample."); return; }
    if (name.length < 2) { err.textContent = t("Shkruani emrin.", "Enter your name."); $("oName").focus(); return; }
    if (phone.replace(/\D/g, "").length < 8) { err.textContent = t("Shkruani një numër telefoni të saktë.", "Enter a valid phone number."); $("oPhone").focus(); return; }
    if (city.length < 3) { err.textContent = t("Shkruani qytetin dhe adresën.", "Enter the town and address."); $("oCity").focus(); return; }
    err.textContent = ""; var btn = $("oSend"); btn.disabled = true;
    var code = K.code("L"), lines = list.map(function (c) { return P(c.id).sq + " (" + cfgLabel(c) + ") " + eur(cfgPrice(c)); }).join("; ");
    K.submit({ demo: D.demo, endpoint: D.formEndpoint }, "Ofertë Lisi " + code, { Kodi: code, Lista: lines || "-", Mostra: samples.join(", ") || "-", Dorezimi: $("oDel").selectedOptions[0].textContent, Montimi: $("oAsm").checked ? "Po" : "Jo", Totali: $("oTot").textContent, Emri: name, Telefoni: phone, Adresa: city, Shenim: $("oNote").value.trim(), _honey: "" })
      .then(function () {
        $("offerForm").hidden = true; $("offerOk").hidden = false; $("oCode").textContent = code;
        $("oOkTxt").textContent = t("Ju telefonojmë brenda një dite pune me ofertën dhe datën e dorëzimit." + (samples.length ? " Mostrat (" + samples.length + ") nisen nesër me postë." : ""),
                                    "We'll call you within one working day with the offer and delivery date." + (samples.length ? " Your samples (" + samples.length + ") go out by post tomorrow." : ""));
        $("offerOk").focus();
      }).catch(function () { err.textContent = t("Nuk u dërgua. Provoni përsëri ose telefononi.", "Not sent. Try again or call us."); })
      .then(function () { btn.disabled = false; });
  });
  $("oNew").addEventListener("click", function () { list = []; saveList(); renderList(); $("offerOk").hidden = true; $("offerForm").hidden = false; });

  /* ---------- room planner ---------- */
  var room = { w: 420, l: 360 }, items = [], selId = null, uid = 0;
  var DOOR = 90, NS = "http://www.w3.org/2000/svg";
  var FILL = { sofa: "#C9D6C3", chair: "#E8D2A8", table: "#E5CDB0", seat: "#E5CDB0", desk: "#E5CDB0", bed: "#D6DCE6", round: "#E5CDB0", stool: "#E5CDB0" };
  function el(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function placeItem(c) {
    var s = cfgSize(c), p = P(c.id), n = p.qty ? Math.min(c.qty || 1, 8) : 1;
    for (var i = 0; i < n; i++) {
      var spot = findSpot(s.w, s.d);
      items.push({ uid: ++uid, id: c.id, w: s.w, d: s.d, x: spot.x, y: spot.y, rot: spot.rot, label: t(p.sq, p.en).replace(/, me masë| made to size/, "") });
    }
    selId = items[items.length - 1].uid; renderPlan();
  }
  // first free place on a 10 cm grid, trying both orientations; falls back to the top-left corner
  function findSpot(w, d) {
    var door = { x: 30, y: room.l - DOOR, w: DOOR, h: DOOR };
    for (var r = 0; r < 2; r++) {
      var bw = r ? d : w, bh = r ? w : d;
      for (var y = 10; y + bh <= room.l; y += 10) for (var x = 10; x + bw <= room.w; x += 10) {
        var b = { x: x, y: y, w: bw, h: bh };
        if (overlap(b, door)) continue;
        if (items.some(function (it) { var o = box(it); return overlap({ x: b.x - 10, y: b.y - 10, w: b.w + 20, h: b.h + 20 }, o); })) continue;
        return { x: x, y: y, rot: !!r };
      }
    }
    return { x: 10, y: 10, rot: false };
  }
  function box(it) { return it.rot ? { x: it.x, y: it.y, w: it.d, h: it.w } : { x: it.x, y: it.y, w: it.w, h: it.d }; }
  function overlap(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }
  function problems() {
    var bad = {}, msgs = [], door = { x: 30, y: room.l - DOOR, w: DOOR, h: DOOR };
    items.forEach(function (it) {
      var b = box(it);
      if (b.x < 0 || b.y < 0 || b.x + b.w > room.w || b.y + b.h > room.l) { bad[it.uid] = 1; msgs.push(t(it.label + " del jashtë dhomës.", it.label + " sticks out of the room.")); }
      if (overlap(b, door)) { bad[it.uid] = 1; msgs.push(t(it.label + " zë derën.", it.label + " blocks the door.")); }
    });
    for (var i = 0; i < items.length; i++) for (var j = i + 1; j < items.length; j++) {
      if (overlap(box(items[i]), box(items[j]))) { bad[items[i].uid] = bad[items[j].uid] = 1; msgs.push(t(items[i].label + " dhe " + items[j].label + " bien mbi njëra-tjetrën.", items[i].label + " and " + items[j].label + " overlap.")); }
    }
    return { bad: bad, msgs: msgs };
  }
  function renderPlan() {
    var svg = $("room"), pad = 40; svg.innerHTML = "";
    svg.setAttribute("viewBox", (-pad) + " " + (-pad) + " " + (room.w + pad * 2) + " " + (room.l + pad * 2));
    el("rect", { x: 0, y: 0, width: room.w, height: room.l, "class": "floor" }, svg);
    var g = el("g", { "class": "grid" }, svg);
    for (var x = 50; x < room.w; x += 50) el("line", { x1: x, y1: 0, x2: x, y2: room.l }, g);
    for (var y = 50; y < room.l; y += 50) el("line", { x1: 0, y1: y, x2: room.w, y2: y }, g);
    el("rect", { x: 30, y: room.l - 4, width: DOOR, height: 8, "class": "gap" }, svg);
    el("path", { d: "M30 " + room.l + " A" + DOOR + " " + DOOR + " 0 0 1 " + (30 + DOOR) + " " + (room.l - DOOR) + " L" + (30 + DOOR) + " " + room.l, "class": "door" }, svg);
    el("line", { x1: room.w * .35, y1: 0, x2: room.w * .75, y2: 0, "class": "win" }, svg);
    var lw = el("text", { x: room.w / 2, y: -14, "text-anchor": "middle", "class": "lbl" }, svg); lw.textContent = room.w + " cm";
    var ll = el("text", { x: -14, y: room.l / 2, "text-anchor": "middle", "class": "lbl", transform: "rotate(-90 -14 " + room.l / 2 + ")" }, svg); ll.textContent = room.l + " cm";
    var dl = el("text", { x: 30 + DOOR / 2, y: room.l + 26, "text-anchor": "middle", "class": "lbl" }, svg); dl.textContent = t("dera", "door");
    var pr = problems(), used = 0;
    items.slice().sort(function (a, b) { return (a.uid === selId) - (b.uid === selId); }).forEach(function (it) {
      var b = box(it); used += b.w * b.h;
      var gi = el("g", { "class": "it" + (pr.bad[it.uid] ? " bad" : "") + (selId === it.uid ? " sel" : ""), tabindex: "0", role: "button", "data-uid": it.uid, transform: "translate(" + b.x + " " + b.y + ")" }, svg);
      el("title", {}, gi).textContent = it.label + ", " + b.w + " × " + b.h + " cm" + (pr.bad[it.uid] ? t(", ka problem", ", has a problem") : "");
      el("rect", { "class": "body", width: b.w, height: b.h, fill: FILL[P(it.id).type] || "#ddd" }, gi);
      if (P(it.id).type === "round") { gi.firstChild.setAttribute("rx", b.w / 2); }
      if (b.w > 70 && b.h > 34) {
        var tx = el("text", { x: b.w / 2, y: b.h / 2 - (b.h > 60 ? 8 : 0) }, gi); tx.textContent = it.label;
        if (b.h > 60) { var dm = el("text", { x: b.w / 2, y: b.h / 2 + 10, "class": "dim" }, gi); dm.textContent = b.w + "×" + b.h; }
      }
      bindDrag(gi, it);
    });
    $("roomInfo").innerHTML = ""; var bb = document.createElement("b"); bb.textContent = (room.w / 100).toFixed(1).replace(".", ",") + " × " + (room.l / 100).toFixed(1).replace(".", ",") + " m"; $("roomInfo").appendChild(bb);
    $("roomInfo").appendChild(document.createTextNode(" · " + Math.round(room.w * room.l / 1e4 * 10) / 10 + " m²"));
    var free = Math.max(0, 100 - Math.round(used / (room.w * room.l) * 100));
    $("floorInfo").textContent = t("Dysheme e lirë: " + free + "%", "Free floor: " + free + "%");
    var ch = $("checks"); ch.innerHTML = "";
    if (!items.length) { var li0 = document.createElement("li"); li0.className = "warn"; li0.textContent = t("Shtoni një mobilje nga lista sipër.", "Add a piece from the list above."); ch.appendChild(li0); }
    else if (!pr.msgs.length) { var li = document.createElement("li"); li.className = "ok"; li.textContent = free < 40 ? t("Nxë, por dhoma do të jetë e ngushtë.", "It fits, but the room will feel tight.") : t("Gjithçka nxë dhe dera hapet lirshëm.", "Everything fits and the door opens freely."); ch.appendChild(li); }
    pr.msgs.slice(0, 4).forEach(function (m) { var li = document.createElement("li"); li.className = "warn"; li.textContent = m; ch.appendChild(li); });
    var ul = $("placed"); ul.innerHTML = "";
    items.forEach(function (it, i) {
      var li = document.createElement("li"); li.innerHTML = "<span></span><button type=\"button\">↻</button><button type=\"button\">×</button>";
      li.children[0].textContent = it.label; var sm = document.createElement("small"); sm.textContent = box(it).w + " × " + box(it).h + " cm"; li.children[0].appendChild(sm);
      li.children[1].setAttribute("aria-label", t("Rrotullo ", "Rotate ") + it.label); li.children[2].setAttribute("aria-label", t("Hiq ", "Remove ") + it.label);
      li.children[1].addEventListener("click", function () { it.rot = !it.rot; renderPlan(); });
      li.children[2].addEventListener("click", function () { items.splice(i, 1); renderPlan(); });
      ul.appendChild(li);
    });
  }
  function svgPoint(e) { var svg = $("room"), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); }
  function bindDrag(g, it) {
    g.addEventListener("pointerdown", function (e) {
      e.preventDefault(); selId = it.uid; var start = svgPoint(e), ox = it.x, oy = it.y, moved = false;
      g.setPointerCapture(e.pointerId); g.classList.add("sel");
      function mv(ev) { var p = svgPoint(ev); it.x = Math.round((ox + p.x - start.x) / 5) * 5; it.y = Math.round((oy + p.y - start.y) / 5) * 5; moved = true; g.setAttribute("transform", "translate(" + it.x + " " + it.y + ")"); }
      function up() { g.removeEventListener("pointermove", mv); g.removeEventListener("pointerup", up); g.removeEventListener("pointercancel", up); renderPlan(); var n = document.querySelector('.it[data-uid="' + it.uid + '"]'); if (n && !moved) n.focus(); }
      g.addEventListener("pointermove", mv); g.addEventListener("pointerup", up); g.addEventListener("pointercancel", up);
    });
    g.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 50 : 10, k = e.key, used = true;
      if (k === "ArrowLeft") it.x -= step; else if (k === "ArrowRight") it.x += step; else if (k === "ArrowUp") it.y -= step; else if (k === "ArrowDown") it.y += step;
      else if (k === "r" || k === "R") it.rot = !it.rot; else if (k === "Delete" || k === "Backspace") { items = items.filter(function (x) { return x !== it; }); } else used = false;
      if (used) { e.preventDefault(); selId = it.uid; renderPlan(); var n = document.querySelector('.it[data-uid="' + it.uid + '"]'); if (n) n.focus(); }
    });
  }
  function renderPalette() {
    var pal = $("palette"); pal.innerHTML = "";
    D.products.forEach(function (p) { var b = document.createElement("button"); b.type = "button"; b.textContent = "+ " + t(p.sq, p.en).replace(/, me masë| made to size/, ""); b.addEventListener("click", function () { placeItem(defaultCfg(p)); }); pal.appendChild(b); });
  }
  [["rW", "w"], ["rL", "l"]].forEach(function (a) {
    $(a[0]).addEventListener("change", function () { var v = Math.max(200, Math.min(900, Math.round(+this.value / 10) * 10 || room[a[1]])); this.value = v; room[a[1]] = v; renderPlan(); });
  });
  // a starting layout so the planner is never empty
  (function seed() {
    items.push({ uid: ++uid, id: "drini", w: 230, d: 95, x: 150, y: 20, rot: false, label: "" });
    items.push({ uid: ++uid, id: "era", w: 78, d: 82, x: 300, y: 200, rot: false, label: "" });
    items.push({ uid: ++uid, id: "rrethi", w: 100, d: 100, x: 170, y: 150, rot: false, label: "" });
  })();

  function renderHours() {
    var H = { 0: null, 1: ["09:00", "18:00"], 2: ["09:00", "18:00"], 3: ["09:00", "18:00"], 4: ["09:00", "18:00"], 5: ["09:00", "18:00"], 6: ["10:00", "15:00"] };
    var tbl = $("hours"), today = new Date().getDay(); tbl.innerHTML = "";
    [1, 2, 3, 4, 5, 6, 0].forEach(function (wd) { var tr = document.createElement("tr"); if (wd === today) tr.className = "today"; tr.innerHTML = "<td></td><td></td>"; tr.children[0].textContent = K.WD[K.lang][wd]; tr.children[1].textContent = H[wd] ? H[wd].join("–") : t("Mbyllur", "Closed"); tbl.appendChild(tr); });
  }

  function renderAll() {
    items.forEach(function (it) { it.label = t(P(it.id).sq, P(it.id).en).replace(/, me masë| made to size/, ""); });
    renderColl(); renderPalette(); renderPlan(); renderDel(); renderSamples(); renderList(); renderHours();
    if (cur && $("pDlg").open) paintP();
  }
  K.onLang(renderAll);
  renderAll();
})();
