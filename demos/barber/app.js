(function () {
  var SERVICES = [["Prerje klasike", 8], ["Skin fade", 10], ["Mjekër me brisk", 5], ["Prerje + mjekër", 12], ["Fëmijë", 6]];
  var DAYS = ["Diel", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"];
  var MONTHS = ["jan", "shk", "mar", "pri", "maj", "qer", "korr", "gush", "sht", "tet", "nën", "dhj"];
  var state = { service: null, day: null, time: null };
  var $ = function (id) { return document.getElementById(id); };

  function chip(label, small, onClick, disabled) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.setAttribute("aria-pressed", "false");
    b.textContent = label;
    if (small) { var s = document.createElement("small"); s.textContent = small; b.appendChild(s); }
    if (disabled) b.disabled = true;
    b.addEventListener("click", function () {
      Array.prototype.forEach.call(b.parentNode.children, function (c) { c.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      onClick();
    });
    return b;
  }

  SERVICES.forEach(function (s, i) {
    $("services").appendChild(chip(s[0], "€" + s[1], function () { state.service = i; update(); }));
  });

  var today = new Date(), dayIndex = 0;
  for (var i = 0; dayIndex < 6; i++) {
    var d = new Date(today); d.setDate(today.getDate() + i);
    if (d.getDay() === 0) continue; // closed on Sunday
    (function (d) {
      var c = chip(i === 0 ? "Sot" : DAYS[d.getDay()], d.getDate() + " " + MONTHS[d.getMonth()], function () { state.day = d; state.time = null; renderTimes(); update(); });
      c.classList.add("day-chip");
      $("days").appendChild(c);
    })(d);
    dayIndex++;
  }

  function renderTimes() {
    var box = $("times"); box.innerHTML = "";
    if (!state.day) { box.innerHTML = '<span style="color:var(--muted);font-size:14px">Zgjidhni një ditë.</span>'; return; }
    var seed = state.day.getDate();
    ["09:00", "10:00", "11:00", "12:30", "14:00", "15:00", "16:30", "17:30", "18:30"].forEach(function (t, j) {
      var taken = (seed + j * 3) % 4 === 0; // a few slots look booked, for realism
      box.appendChild(chip(t, null, function () { state.time = t; update(); }, taken));
    });
  }
  renderTimes();

  function update() {
    var price = state.service !== null ? SERVICES[state.service][1] : 0;
    $("total").innerHTML = "Totali: <span>€" + price + "</span>";
    $("b-error").textContent = "";
  }

  $("booking-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("b-name").value.trim(), phone = $("b-phone").value.trim();
    var missing = state.service === null ? "shërbimin" : !state.day ? "ditën" : !state.time ? "orën" : !name ? "emrin" : !phone ? "telefonin" : "";
    if (missing) { $("b-error").textContent = "Ju lutem plotësoni " + missing + "."; return; }
    var d = state.day;
    $("done-text").textContent = name + ", ju presim " + (DAYS[d.getDay()] === DAYS[today.getDay()] && d.getDate() === today.getDate() ? "sot" : "më " + d.getDate() + " " + MONTHS[d.getMonth()]) + " në orën " + state.time + " për " + SERVICES[state.service][0].toLowerCase() + ".";
    $("booking-form").style.display = "none";
    $("done").classList.add("show");
  });
  $("again").addEventListener("click", function () {
    $("done").classList.remove("show"); $("booking-form").style.display = ""; $("booking-form").reset();
    state = { service: null, day: null, time: null };
    document.querySelectorAll('.chip[aria-pressed="true"]').forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    renderTimes(); update();
  });

  // highlight today in opening hours (list starts on Monday)
  var idx = (today.getDay() + 6) % 7;
  var li = document.querySelectorAll("#hours li")[idx]; if (li) li.classList.add("today");

  // reveal on scroll
  var els = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: .15 });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add("in"); });
})();

