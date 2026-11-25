(function () {
  var part = null;
  document.querySelectorAll(".slot").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".slot").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true"); part = b.textContent;
    });
  });
  var d = document.getElementById("date"); var t = new Date();
  d.min = t.toISOString().slice(0, 10);
  document.getElementById("f").addEventListener("submit", function (e) {
    e.preventDefault();
    var svc = document.getElementById("svc").value, name = document.getElementById("name").value.trim(), phone = document.getElementById("phone").value.trim();
    var miss = !svc ? "shërbimin" : !d.value ? "datën" : !part ? "pjesën e ditës" : !name ? "emrin" : !phone ? "telefonin" : "";
    document.getElementById("err").textContent = miss ? "Ju lutem zgjidhni ose plotësoni " + miss + "." : "";
    if (miss) return;
    var day = new Date(d.value + "T00:00").toLocaleDateString("sq-AL", { weekday: "long", day: "numeric", month: "long" });
    document.getElementById("ok-text").textContent = name + ", kërkesa për " + svc.toLowerCase() + " më " + day + " (" + part.toLowerCase() + ") u pranua. Ju telefonojmë në " + phone + " për ta konfirmuar.";
    Array.prototype.forEach.call(this.children, function (el) { if (el.id !== "ok") el.style.display = "none"; });
    document.getElementById("ok").classList.add("show");
  });
  var els = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add("in"); });
})();

