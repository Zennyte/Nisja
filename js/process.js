/* Nisja Studio — "Si punojmë": a pinned stage that redraws one demo page from a hand sketch to a
   wireframe to the finished design (an orange scan line sweeps each stage in), then a phone joins for
   testing, then it goes live: the address gets a lock, a "Live" badge appears and a booking arrives. */
(function () {
  "use strict";
  if (!window.gsap || !window.ScrollTrigger) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".site-header");
  function hdr() { return header ? header.offsetHeight : 0; }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function seg(v, a, b) { return clamp((v - a) / (b - a)); }

  /* ---------- the pinned process stage ---------- */
  (function () {
    var sec = document.querySelector(".lb-proc"); if (!sec) return;
    var pin = sec.querySelector(".lb-pin"), view = sec.querySelector(".lb-view"), copy = sec.querySelector(".lb-copy");
    var steps = sec.querySelectorAll(".lb-step");
    var current = -1;
    function setStep(i) {
      if (i === current) return; current = i;
      Array.prototype.forEach.call(steps, function (s, k) { s.classList.toggle("is-on", k === i); s.classList.toggle("is-past", k < i); });
      var p = steps[i] && steps[i].querySelector("p"); if (copy && p) copy.setAttribute("data-text", p.textContent);
    }
    function render(p) {
      var v = p * 4;                                     // 0..4, one unit per step
      var w = seg(v, 0.55, 1.15), d = seg(v, 1.45, 2.15);
      view.style.setProperty("--w", w.toFixed(4));
      view.style.setProperty("--d", d.toFixed(4));
      var scanning = (w > 0 && w < 1) ? w : (d > 0 && d < 1) ? d : -1;
      view.style.setProperty("--scan", scanning < 0 ? 0 : scanning.toFixed(4));
      view.style.setProperty("--scanO", scanning < 0 ? 0 : 1);
      sec.classList.toggle("is-build", v >= 2.35);
      sec.classList.toggle("is-live", v >= 3.2);
      setStep(Math.min(3, Math.floor(v + 0.1)));
    }
    if (reduced) { render(1); return; }
    render(0);
    ScrollTrigger.create({
      trigger: pin, pin: true, start: function () { return "top " + hdr() + "px"; }, end: "+=280%", scrub: 0.5, refreshPriority: 1,
      onUpdate: function (self) { render(self.progress); }
    });
  })();

  ScrollTrigger.refresh();
})();
