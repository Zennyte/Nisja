(function () {
  "use strict";
  var S = window.SITE, $ = K.$, t = K.t, KEY = "mendafsh-bookings", BUFFER = 15;
  var svcBy = function (id) { return S.services.find(function (s) { return s.id === id; }); };
  var staffBy = function (id) { return S.staff.find(function (s) { return s.id === id; }); };
  var hoursFor = function (wd) { return S.hours[wd] || null; };
  var staffHours = function (p) { var h = {}; for (var d = 0; d < 7; d++) h[d] = p.off.indexOf(d) > -1 ? null : hoursFor(d); return h; };
  var demo = K.demoBusy(S.staff.map(function (p) { return p.id; }), S.daysAhead, hoursFor, { seed: 7, load: .34, block: 45 })
    .filter(function (x) { return staffBy(x.res).off.indexOf(new Date(x.start).getDay()) === -1; });
  var busy = function () { return demo.concat(K.saved(KEY).map(function (x) { return { res: x.res, start: x.start, end: x.end, mine: true, svcs: x.svcs }; })); };

  var st = { tab: "nails", picked: [], who: "any", day: null, slot: null, assigned: null };

  function totals() {
    var min = 0, sub = 0;
    st.picked.forEach(function (id) { var s = svcBy(id); min += s.min; sub += s.price; });
    var disc = st.picked.length >= S.bundle.from ? Math.round(sub * S.bundle.pct) / 100 : 0;
    return { min: min, sub: sub, disc: disc, tot: sub - disc };
  }
  var canDoAll = function (p) { return st.picked.every(function (id) { return p.does.indexOf(id) > -1; }); };
  function slotsFor(who, day) {
    var tt = totals();
    var res = S.staff.filter(function (p) { return canDoAll(p) && (who === "any" || p.id === who); }).map(function (p) { return { id: p.id, hours: staffHours(p) }; });
    /* every visit holds the chair for its length plus a 15-minute buffer, so nobody is rushed */
    var withBuf = busy().map(function (b) { return { res: b.res, start: b.start - BUFFER * 6e4, end: b.end + BUFFER * 6e4 }; });
    return K.slots({ day: day, hours: hoursFor(new Date(day).getDay()), step: S.step, duration: tt.min, resources: res, busy: withBuf, noticeMin: S.noticeMin });
  }
  function nextFree(who) {
    for (var d = 0; d < S.daysAhead; d++) { var day = K.day0(new Date()); day.setDate(day.getDate() + d); var s = slotsFor(who, day).find(function (x) { return x.free.length; }); if (s) return s; }
    return null;
  }

  /* ---------- builder ---------- */
  function renderTabs() {
    var box = $("tabs"); box.innerHTML = "";
    S.groups.forEach(function (g) {
      var n = st.picked.filter(function (id) { return svcBy(id).g === g.id; }).length;
      var b = document.createElement("button"); b.type = "button"; b.className = "tab"; b.setAttribute("role", "tab"); b.id = "tab-" + g.id;
      b.setAttribute("aria-selected", String(st.tab === g.id)); b.setAttribute("aria-controls", "menu");
      b.textContent = t(g.name);
      if (n) { var c = document.createElement("span"); c.className = "n"; c.textContent = n; b.appendChild(c); }
      b.addEventListener("click", function () { st.tab = g.id; renderTabs(); renderMenu(); });
      box.appendChild(b);
    });
    $("menu").setAttribute("aria-labelledby", "tab-" + st.tab);
  }
  function renderMenu() {
    var box = $("menu"); box.innerHTML = "";
    S.services.filter(function (s) { return s.g === st.tab; }).forEach(function (s) {
      var b = document.createElement("button"); b.type = "button"; b.className = "item"; b.dataset.id = s.id;
      b.setAttribute("aria-pressed", String(st.picked.indexOf(s.id) > -1));
      b.innerHTML = '<span><b></b><small></small></span><span class="pm"><strong></strong><span></span></span><span class="tick" aria-hidden="true"></span>';
      b.querySelector("b").textContent = t(s.name); b.querySelector("small").textContent = t(s.note);
      b.querySelector("strong").textContent = K.eur(s.price); b.querySelector(".pm > span").textContent = K.dur(s.min);
      b.addEventListener("click", function () { toggle(s.id); });
      box.appendChild(b);
    });
  }
  function toggle(id) {
    var i = st.picked.indexOf(id);
    if (i > -1) st.picked.splice(i, 1); else st.picked.push(id);
    st.slot = null;
    if (st.who !== "any" && !canDoAll(staffBy(st.who))) st.who = "any";
    renderTabs(); renderMenu(); renderVisit(); renderWhen();
  }
  function renderVisit() {
    var tt = totals(), ul = $("picked"); ul.innerHTML = "";
    if (!st.picked.length) { var e = document.createElement("li"); e.className = "none"; e.textContent = t("Asgjë ende. Prekni një shërbim.", "Nothing yet. Tap a service."); ul.appendChild(e); }
    st.picked.forEach(function (id) {
      var s = svcBy(id), li = document.createElement("li");
      li.innerHTML = "<span></span><span><span></span> <button type=\"button\"></button></span>";
      li.firstChild.textContent = t(s.name); li.querySelector("span span").textContent = K.eur(s.price);
      var rm = li.querySelector("button"); rm.textContent = t("hiq", "remove"); rm.setAttribute("aria-label", t("Hiq ", "Remove ") + t(s.name));
      rm.addEventListener("click", function () { toggle(id); });
      ul.appendChild(li);
    });
    $("vTime").textContent = tt.min ? K.dur(tt.min) : "0 min";
    $("vSub").textContent = K.eur(tt.sub);
    var on = tt.disc > 0;
    $("vDiscL").hidden = $("vDisc").hidden = !on;
    $("vDiscL").textContent = t("Zbritje për ", "Bundle discount ") + S.bundle.pct + "%"; $("vDisc").textContent = "−" + K.eur(tt.disc);
    $("vTot").textContent = K.eur(tt.tot);
    var hint = "";
    if (!st.picked.length) hint = t("Shtoni të paktën një shërbim.", "Add at least one service.");
    else if (!S.staff.some(canDoAll)) hint = t("Asnjë specialiste nuk i bën të gjitha këto në një vizitë. Ndajini në dy rezervime.", "No single specialist does all of these in one visit. Split them into two bookings.");
    else if (st.picked.length < S.bundle.from && S.bundle.pct) hint = t("Shtoni edhe një shërbim dhe merrni " + S.bundle.pct + "% zbritje.", "Add one more service for " + S.bundle.pct + "% off.");
    else hint = t("Specialistja i bën njëra pas tjetrës, pa pritje mes tyre.", "One specialist does them back to back, no waiting in between.");
    $("vHint").textContent = hint;
    var ok = st.picked.length && S.staff.some(canDoAll);
    $("toWhen").setAttribute("aria-disabled", String(!ok)); $("toWhen").style.opacity = ok ? 1 : .45;
    $("barTot").textContent = K.eur(tt.tot); $("barTime").textContent = (tt.min ? K.dur(tt.min) : "0 min") + " · " + st.picked.length + t(" shërbime", " services");
    $("bar").classList.toggle("show", !!st.picked.length && !barHidden);
  }
  $("toWhen").addEventListener("click", function (e) { e.preventDefault(); if ($("toWhen").getAttribute("aria-disabled") === "true") return; K.smooth("#kur"); });

  /* ---------- when ---------- */
  function pressed(box, attr, val) { box.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset[attr] === String(val))); }); }
  function renderWhen() { renderStaff(); renderDays(); renderSlots(); renderConfirm(); }
  function renderStaff() {
    var box = $("staffCards"); box.innerHTML = "";
    [{ id: "any", name: t("Kushdo", "Anyone") }].concat(S.staff).forEach(function (p) {
      var b = document.createElement("button"); b.type = "button"; b.className = "who"; b.dataset.id = p.id;
      var can = st.picked.length && (p.id === "any" ? S.staff.some(canDoAll) : canDoAll(p));
      b.disabled = !can;
      b.innerHTML = '<span class="ini" aria-hidden="true"></span><b></b><span></span>';
      b.querySelector(".ini").textContent = p.id === "any" ? "✦" : p.name[0];
      b.querySelector("b").textContent = p.name;
      var line = b.querySelector("span:last-child");
      if (!st.picked.length) line.textContent = p.id === "any" ? t("E para e lirë", "First available") : t(p.tag);
      else if (!can) line.textContent = t("Nuk i bën të gjitha", "Doesn't do all of these");
      else { var n = nextFree(p.id); line.textContent = n ? t("E lirë: ", "Free: ") + K.dayLabel(n.t, true).split(",")[0] + " " + n.label : t("E zënë 3 javë", "Booked for 3 weeks"); }
      b.addEventListener("click", function () { st.who = p.id; st.slot = null; pressed(box, "id", p.id); renderDays(); renderSlots(); renderConfirm(); });
      box.appendChild(b);
    });
    pressed(box, "id", st.who);
  }
  function renderDays() {
    var box = $("days"); box.innerHTML = "";
    if (!st.day) st.day = K.day0(new Date()).getTime();
    for (var d = 0; d < S.daysAhead; d++) {
      var day = K.day0(new Date()); day.setDate(day.getDate() + d);
      var b = document.createElement("button"); b.type = "button"; b.className = "day"; b.dataset.t = day.getTime(); b.title = K.dayLabel(day);
      var closed = !hoursFor(day.getDay()) || (st.picked.length && !slotsFor(st.who, day).some(function (x) { return x.free.length; }));
      b.disabled = !!closed || !st.picked.length;
      b.innerHTML = "<span></span><b></b>";
      b.querySelector("span").textContent = d === 0 ? t("Sot", "Today") : d === 1 ? t("Nesër", "Tmrw") : K.WS[K.lang][day.getDay()];
      b.querySelector("b").textContent = day.getDate();
      (function (ts) { b.addEventListener("click", function () { st.day = ts; st.slot = null; pressed(box, "t", ts); renderSlots(); renderConfirm(); }); })(day.getTime());
      box.appendChild(b);
    }
    var cur = box.querySelector('[data-t="' + st.day + '"]');
    if (cur && cur.disabled) { var f = box.querySelector("button:not(:disabled)"); if (f) st.day = +f.dataset.t; }
    pressed(box, "t", st.day);
  }
  function renderSlots() {
    var box = $("slots"); box.innerHTML = "";
    var msg = function (s) { var p = document.createElement("p"); p.className = "empty"; p.textContent = s; box.appendChild(p); };
    if (!st.picked.length) return msg(t("Ndërtoni vizitën më lart dhe këtu shfaqen orët ku nxë e gjitha.", "Build your visit above and the times that fit it all appear here."));
    var list = slotsFor(st.who, st.day);
    if (!list.some(function (x) { return x.free.length; })) return msg(t("S'ka vend për këtë vizitë këtë ditë. Provoni një ditë tjetër.", "No room for this visit on this day. Try another day."));
    list.forEach(function (s) {
      var b = document.createElement("button"); b.type = "button"; b.className = "slot"; b.dataset.t = s.t; b.textContent = s.label; b.disabled = !s.free.length;
      b.addEventListener("click", function () { st.slot = s.t; st.assigned = pickWho(s); pressed(box, "t", s.t); renderConfirm(); });
      box.appendChild(b);
    });
    pressed(box, "t", st.slot);
  }
  function pickWho(s) {
    if (st.who !== "any") return st.who;
    var d0 = K.day0(s.t).getTime(), d1 = d0 + 864e5;
    var load = function (id) { return busy().filter(function (x) { return x.res === id && x.start >= d0 && x.start < d1; }).length; };
    return s.free.slice().sort(function (a, b) { return load(a) - load(b); })[0];
  }
  function names() { return st.picked.map(function (id) { return t(svcBy(id).name); }).join(", "); }
  function renderConfirm() {
    var tt = totals();
    $("cSvcs").textContent = st.picked.length ? names() : "-";
    $("cWith").textContent = st.slot ? staffBy(st.assigned).name : st.who === "any" ? t("Kushdo", "Anyone") : staffBy(st.who).name;
    $("cWhen").textContent = st.slot ? K.dayLabel(st.slot, true) + ", " + K.hm(st.slot) + "–" + K.hm(st.slot + tt.min * 6e4) : "-";
    $("cTot").textContent = st.picked.length ? K.eur(tt.tot) : "-";
    $("confirm").disabled = !(st.picked.length && st.slot);
  }

  $("confirm").addEventListener("click", function () {
    var name = $("fName").value.trim(), phone = $("fPhone").value.trim(), err = $("err");
    if (!name) { err.textContent = t("Shkruani emrin.", "Please enter your name."); $("fName").focus(); return; }
    if (phone.replace(/\D/g, "").length < 8) { err.textContent = t("Shkruani një numër telefoni të saktë.", "Please enter a valid phone number."); $("fPhone").focus(); return; }
    var tt = totals(), start = st.slot, end = start + tt.min * 6e4, who = st.assigned;
    if (busy().some(function (x) { return x.res === who && x.start < end + BUFFER * 6e4 && start < x.end + BUFFER * 6e4; })) { err.textContent = t("Kjo orë sapo u zu. Zgjidhni një tjetër.", "That time was just taken. Pick another."); st.slot = null; renderSlots(); renderConfirm(); return; }
    err.textContent = "";
    var code = K.code("MD"), p = staffBy(who), sqNames = st.picked.map(function (id) { return svcBy(id).name.sq; }).join(", ");
    var btn = $("confirm"); btn.disabled = true; btn.textContent = t("Duke dërguar…", "Sending…");
    K.submit(S, "Vizitë e re " + code + ": " + sqNames + ", " + p.name + ", " + K.dayLabel(start) + " " + K.hm(start), {
      Kodi: code, Sherbimet: sqNames, Specialistja: p.name, Kur: K.dayLabel(start) + ", " + K.hm(start) + "–" + K.hm(end), Kohezgjatja: tt.min + " min", Totali: "€" + tt.tot + (tt.disc ? " (me zbritje " + S.bundle.pct + "%)" : ""), Emri: name, Telefoni: phone, Shenim: $("fNote").value.trim() || "-"
    }).then(function (r) {
      K.save(KEY, { code: code, res: who, svcs: st.picked.slice(), start: start, end: end, name: name });
      showTicket(code, p, start, end, tt, name, r.demo);
    }).catch(function () { err.textContent = t("Nuk u dërgua. Kontrolloni internetin ose na telefononi.", "Not sent. Check your connection or call us."); })
      .then(function () { btn.textContent = t("Konfirmo vizitën", "Confirm visit"); renderConfirm(); });
  });

  function showTicket(code, p, start, end, tt, name, demoMode) {
    $("flow").hidden = true; $("done").hidden = false; barHidden = true; $("bar").classList.remove("show");
    $("tCode").textContent = t("Kodi ", "Code ") + code;
    $("tSvcs").textContent = names(); $("tWith").textContent = p.name; $("tWhen").textContent = K.dayLabel(start, true) + ", " + K.hm(start); $("tTot").textContent = K.eur(tt.tot);
    $("tMsg").textContent = demoMode ? t("Demo: në faqen e vërtetë studioja merr këtë vizitë menjëherë në email dhe WhatsApp.", "Demo: on the live site the studio gets this visit instantly by email and WhatsApp.") : t("Studioja u njoftua. Shihemi së shpejti!", "The studio has been notified. See you soon!");
    /* refresh reminder: the soonest refresh among the picked services */
    var days = st.picked.map(function (id) { return svcBy(id).refresh; }).filter(Boolean);
    var events = [{ start: start, end: end, title: "Mëndafsh: " + names(), where: S.address }];
    if (days.length) {
      var dd = Math.min.apply(null, days), r = new Date(start); r.setDate(r.getDate() + dd); r.setHours(10, 0, 0, 0);
      $("tRefresh").hidden = false;
      $("tRefresh").innerHTML = t("Rifreskimi rekomandohet rreth ", "We recommend a refresh around ") + "<b></b>. " + t("E shtojmë si kujtesë në kalendarin tuaj, bashkë me vizitën.", "We'll add it as a reminder to your calendar together with this visit.");
      $("tRefresh").querySelector("b").textContent = r.getDate() + " " + K.MO[K.lang][r.getMonth()];
      events.push({ start: r.getTime(), end: r.getTime() + 15 * 6e4, title: t("Kujtesë: rezervo rifreskimin te Mëndafsh", "Reminder: book your refresh at Mëndafsh"), where: location.href.split("?")[0] });
    } else $("tRefresh").hidden = true;
    $("tIcs").onclick = function () { K.ics("mendafsh-" + code, events); };
    $("tWa").href = K.wa(S.whatsapp, "Përshëndetje Mëndafsh, rezervova: " + st.picked.map(function (id) { return svcBy(id).name.sq; }).join(", ") + " me " + p.name + ", " + K.dayLabel(start) + " " + K.hm(start) + ". Kodi " + code + ". " + name);
    $("ticket").focus(); K.smooth("#vizita");
  }
  $("tAgain").addEventListener("click", function () { st.picked = []; st.slot = null; barHidden = false; $("done").hidden = true; $("flow").hidden = false; renderAll(); });

  /* ---------- rest ---------- */
  function renderGroups() {
    var box = $("groups"); box.innerHTML = "";
    S.groups.forEach(function (g) {
      var list = S.services.filter(function (s) { return s.g === g.id; }), from = Math.min.apply(null, list.map(function (s) { return s.price; }));
      var f = document.createElement("button"); f.type = "button"; f.className = "group";
      f.innerHTML = '<img loading="lazy" alt="" width="900" height="1300"><span class="cap"><b></b><span></span></span>';
      f.querySelector("img").src = g.img; f.querySelector("b").textContent = t(g.name);
      f.querySelector(".cap span").textContent = list.length + t(" shërbime · nga ", " services · from ") + K.eur(from);
      f.addEventListener("click", function () { st.tab = g.id; renderTabs(); renderMenu(); K.smooth("#vizita"); });
      box.appendChild(f);
    });
  }
  function renderTeam() {
    var box = $("team"); box.innerHTML = "";
    S.staff.forEach(function (p) {
      var el = document.createElement("article"); el.className = "member";
      el.innerHTML = '<span class="ini" aria-hidden="true"></span><h3></h3><p></p><small></small>';
      el.querySelector(".ini").textContent = p.name[0]; el.querySelector("h3").textContent = p.name; el.querySelector("p").textContent = t(p.tag);
      el.querySelector("small").textContent = t("Pushim: ", "Day off: ") + p.off.map(function (d) { return K.WD[K.lang][d]; }).join(", ");
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
  function renderAgenda() {
    var d0 = K.day0(new Date()).getTime(), d1 = d0 + 864e5, now = Date.now(), box = $("agenda"), count = 0, total = 0, mineN = 0;
    box.innerHTML = "";
    S.staff.forEach(function (p) {
      var col = document.createElement("div"); col.innerHTML = "<h4></h4><p class=\"sum\"></p>"; col.querySelector("h4").textContent = p.name;
      if (p.off.indexOf(new Date().getDay()) > -1 || !hoursFor(new Date().getDay())) { col.querySelector(".sum").textContent = t("Pushim sot", "Day off today"); box.appendChild(col); return; }
      var list = busy().filter(function (x) { return x.res === p.id && x.start >= d0 && x.start < d1; }).sort(function (a, z) { return a.start - z.start; }), sum = 0;
      list.forEach(function (x) {
        var ids = x.svcs || [p.does[(x.start / 6e4) % p.does.length | 0]];
        var price = ids.reduce(function (a, id) { return a + svcBy(id).price; }, 0); sum += price;
        var r = document.createElement("div"); r.className = "appt" + (x.mine ? " new" : "") + (x.end < now ? " past" : "");
        r.innerHTML = "<b></b><span></span>"; r.querySelector("b").textContent = K.hm(x.start);
        r.querySelector("span").textContent = ids.map(function (id) { return t(svcBy(id).name); }).join(" + ") + (x.mine ? t(" · online", " · online") : "");
        col.appendChild(r); if (x.mine) mineN++;
      });
      col.querySelector(".sum").textContent = list.length + t(" vizita · ", " visits · ") + K.eur(sum);
      count += list.length; total += sum; box.appendChild(col);
    });
    $("kpis").innerHTML = "";
    [[count, t("vizita sot", "visits today")], [K.eur(total), t("të pritshme sot", "expected today")], [mineN, t("rezervuar online nga ju", "booked online by you")]].forEach(function (k) { var d = document.createElement("div"); d.innerHTML = "<b></b><span></span>"; d.querySelector("b").textContent = k[0]; d.querySelector("span").textContent = k[1]; $("kpis").appendChild(d); });
  }
  var dlg = $("staffDlg");
  $("openStaff").addEventListener("click", function () { renderAgenda(); dlg.showModal(); });
  $("closeStaff").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  /* hide the phone bar while the time picker is on screen */
  var barHidden = false;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { barHidden = e.isIntersecting || !$("done").hidden; $("bar").classList.toggle("show", !!st.picked.length && !barHidden); }); }, { threshold: .05 }).observe($("kur"));

  /* ---------- silk: soft ribbons drifting behind the hero ---------- */
  (function () {
    var c = $("silk"), ctx = c.getContext("2d"), w, h, dpr = Math.min(window.devicePixelRatio || 1, 1.5), run = true, t0 = performance.now();
    var bands = [
      { y: .30, a: 70, f: 1.1, s: .00018, ph: 0, th: 130, c1: "rgba(232,203,200,.55)", c2: "rgba(242,225,222,0)" },
      { y: .55, a: 90, f: .8, s: .00013, ph: 2, th: 170, c1: "rgba(214,160,170,.30)", c2: "rgba(251,245,243,0)" },
      { y: .78, a: 60, f: 1.4, s: .00022, ph: 4, th: 110, c1: "rgba(166,75,96,.12)", c2: "rgba(251,245,243,0)" }
    ];
    function size() { w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function edge(b, x, tm, off) { return b.y * h + Math.sin(x / w * Math.PI * 2 * b.f + tm * b.s * 6.283 + b.ph + off) * b.a + Math.sin(x / w * 9 + tm * b.s * 3 + off) * 12; }
    function draw(tm) {
      ctx.clearRect(0, 0, w, h);
      bands.forEach(function (b) {
        ctx.beginPath();
        for (var x = 0; x <= w; x += 12) ctx.lineTo(x, edge(b, x, tm, 0));
        for (var x2 = w; x2 >= 0; x2 -= 12) ctx.lineTo(x2, edge(b, x2, tm, .9) + b.th);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, b.y * h - b.a, 0, b.y * h + b.th + b.a); g.addColorStop(0, b.c1); g.addColorStop(1, b.c2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); for (var x3 = 0; x3 <= w; x3 += 12) ctx.lineTo(x3, edge(b, x3, tm, 0) + 2);
        ctx.strokeStyle = "rgba(255,255,255,.65)"; ctx.lineWidth = 1.2; ctx.stroke();
      });
    }
    function loop(now) { if (run) draw(now - t0); requestAnimationFrame(loop); }
    size(); window.addEventListener("resize", size);
    if (K.reduced) { draw(0); return; }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { run = es[0].isIntersecting; }).observe(c);
    requestAnimationFrame(loop);
  })();

  function renderAll() { renderTabs(); renderMenu(); renderVisit(); renderWhen(); renderGroups(); renderTeam(); renderHours(); renderFaq(); }
  K.onLang(renderAll);
  K.i18n({
    "demo": 'This is a <b>concept project</b> by <a href="../../">Nisja Studio</a>. The studio is fictional.', "demo.staff": "See the staff calendar",
    "nav.build": "Build your visit", "nav.menu": "Services", "nav.care": "Hygiene", "nav.find": "Find us", "cta.book": "Book",
    "hero.l1": "One hour", "hero.l2": "just for you.",
    "hero.lead": "Nails, brows and skin in the heart of Gjakova. Choose what you'd like, see how long it takes and what it costs, and book without a single phone call.",
    "hero.cta": "Build your visit", "hero.cta2": "See services", "hero.alt": "Soft pink nails with gold details among eucalyptus sprigs",
    "tag1": "Sterilised tools", "tag2": "10% off 2+ services", "tag3": "Refresh reminders",
    "b.title": "Build your visit", "b.lead": "Add one or more services. We work out the time and price, find the specialist who does them all, and show only the times your whole visit fits.",
    "v.title": "Your visit", "v.time": "Time", "v.sub": "Subtotal", "v.total": "Total", "v.next": "Choose a time", "v.hint": "Add at least one service.",
    "w.staff": "With whom?", "w.day": "Which day?", "w.time": "What time?", "w.you": "Your details",
    "f.name": "Name", "f.phone": "Phone", "f.note": "Colour, shape or anything we should know (optional)", "f.note.ph": "e.g. almond shape, nude colour",
    "c.svcs": "Services", "c.with": "With", "c.when": "When", "c.confirm": "Confirm visit", "c.fine": "Pay at the studio. Free cancellation up to 24 hours before.",
    "t.title": "See you soon", "t.ics": "Add to calendar", "t.wa": "Send on WhatsApp", "t.again": "Another visit",
    "m.title": "What we do", "m.lead": "Four areas, one standard: enough time for every client and products we use ourselves.",
    "c2.title": "Clean, no compromise",
    "p1": "Autoclave after every client", "p1d": "Metal tools are sterilised at 134°C and opened in front of you.",
    "p2": "Single-use files and sticks", "p2d": "Take them home, or we bin them in front of you.",
    "p3": "Enough time", "p3d": "Our system leaves 15 minutes between clients, so nobody is rushed.",
    "team.title": "The specialists", "team.lead": "The booking system knows who does what and when each one is off, so it never gives you a wrong time.",
    "f2.title": "Find us", "f2.maps": "Open in Google Maps", "faq.title": "Questions",
    "foot": 'Concept site by <a href="../../">Nisja Studio</a>. Photos: Unsplash.',
    "s.title": "Today at the studio", "s.close": "Close", "s.note": "Every online booking goes to the owner by email and WhatsApp. Clients get their own refresh reminder, so they come back without being chased."
  });
  $("cMaps").href = S.maps; $("yr").textContent = new Date().getFullYear();
  if (/[?&]staff\b/.test(location.search)) { renderAgenda(); dlg.showModal(); }
  K.reveal();
  window.MENDAFSH = { st: st, totals: totals, slotsFor: slotsFor, busy: busy };
})();

