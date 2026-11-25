(function () {
  var MENU = {
    "Antipasti": [["Bruschetta", "€4", "Bukë e pjekur, domate, hudhër dhe borzilok.", true], ["Burrata", "€8", "Burrata e freskët me domate qershi dhe pesto.", true], ["Carpaccio", "€9", "Viç i prerë hollë, rukola dhe parmixhan."]],
    "Pasta": [["Tagliatelle al ragù", "€9", "Pastë e bërë me dorë dhe ragù viçi që zien 6 orë."], ["Cacio e pepe", "€8", "Pecorino, piper i zi dhe asgjë më shumë.", true], ["Carbonara", "€9", "Guanciale, të verdhë veze dhe pecorino."], ["Penne all'arrabbiata", "€7", "Salcë domatesh pikante me djegës.", true]],
    "Pizza": [["Margherita", "€6", "Domate San Marzano, mocarela dhe borzilok.", true], ["Diavola", "€8", "Salsiçe pikante dhe mocarela."], ["Quattro formaggi", "€9", "Katër djathëra italianë.", true], ["Prosciutto e rucola", "€10", "Proshutë e regjur, rukola dhe parmixhan."]],
    "Ëmbëlsira": [["Tiramisù", "€5", "Receta klasike me mascarpone dhe kafe.", true], ["Panna cotta", "€4", "Me salcë frutash të pyllit.", true], ["Cannoli", "€5", "Me ricotta dhe çokollatë.", true]]
  };
  var tabs = document.getElementById("tabs"), list = document.getElementById("menu-list");
  function show(cat) {
    Array.prototype.forEach.call(tabs.children, function (t) { t.setAttribute("aria-selected", t.textContent === cat ? "true" : "false"); });
    list.innerHTML = "";
    MENU[cat].forEach(function (d, i) {
      var el = document.createElement("article");
      el.className = "dish"; el.style.animationDelay = (i * 60) + "ms";
      var h = document.createElement("h3"); h.textContent = d[0];
      if (d[3]) { var v = document.createElement("span"); v.className = "veg"; v.textContent = "vegjetariane"; h.appendChild(v); }
      var dots = document.createElement("span"); dots.className = "dots";
      var pr = document.createElement("span"); pr.className = "price"; pr.textContent = d[1];
      var p = document.createElement("p"); p.textContent = d[2];
      el.appendChild(h); el.appendChild(dots); el.appendChild(pr); el.appendChild(p);
      list.appendChild(el);
    });
  }
  Object.keys(MENU).forEach(function (cat, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "tab"; b.setAttribute("role", "tab"); b.textContent = cat;
    b.addEventListener("click", function () { show(cat); });
    tabs.appendChild(b);
  });
  show("Pasta");

  // reservation demo
  var count = 2, out = document.getElementById("count");
  document.getElementById("minus").addEventListener("click", function () { count = Math.max(1, count - 1); out.textContent = count; });
  document.getElementById("plus").addEventListener("click", function () { count = Math.min(12, count + 1); out.textContent = count; });
  var dateIn = document.getElementById("r-date");
  var t = new Date(); dateIn.min = t.toISOString().slice(0, 10); dateIn.value = dateIn.min;
  document.getElementById("res-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("r-name").value.trim(), phone = document.getElementById("r-phone").value.trim(), time = document.getElementById("r-time").value;
    var err = !dateIn.value ? "datën" : !time ? "orën" : !name ? "emrin" : !phone ? "telefonin" : "";
    document.getElementById("r-err").textContent = err ? "Ju lutem plotësoni " + err + "." : "";
    if (err) return;
    var d = new Date(dateIn.value + "T00:00");
    document.getElementById("r-ok-text").textContent = name + ", tavolina për " + count + (count === 1 ? " person" : " veta") + " ju pret më " + d.toLocaleDateString("sq-AL", { day: "numeric", month: "long" }) + " në orën " + time + ".";
    Array.prototype.forEach.call(this.querySelectorAll("label, .btn, .err"), function (el) { el.style.display = "none"; });
    document.getElementById("r-ok").classList.add("show");
  });

  var els = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: .15 });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add("in"); });
})();

