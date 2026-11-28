/* Test page: "Çfarë bëjmë" — the service closest to the middle of the screen lights up and the sticky
   demo switches to its animation (address bar and progress steps follow). Tapping a service scrolls to it. */
(function () {
  "use strict";
  var sec = document.querySelector(".svx"); if (!sec) return;
  var items = Array.prototype.slice.call(sec.querySelectorAll(".svx-item"));
  var stage = sec.querySelector(".svx-stage"), scenes = stage.querySelectorAll(".scene"), steps = stage.querySelectorAll(".svx-steps i");
  var url = stage.querySelector(".svx-url"), urls = (stage.getAttribute("data-urls") || "").split("|");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches, current = -1, onScreen = false, loopT = 0;

  function count(el) {
    if (!el) return;
    if (reduce) { el.textContent = "98"; return; }
    var t0 = performance.now();
    (function f(n) { var k = Math.min(1, Math.max(0, (n - t0 - 2400) / 1600)); el.textContent = Math.round(98 * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function show(i, force) {
    if (i === current && !force) return;
    current = i;
    items.forEach(function (it, k) { it.classList.toggle("is-on", k === i); });
    Array.prototype.forEach.call(steps, function (s, k) { s.classList.toggle("on", k === i); s.classList.toggle("done", k < i); });
    Array.prototype.forEach.call(scenes, function (s) { s.classList.remove("on"); });
    if (!onScreen) return;
    var sc = scenes[i]; aim(sc); void sc.offsetWidth;            // restart its animation
    sc.classList.add("on"); count(sc.querySelector("#swNum"));
    clearTimeout(loopT);                                          // play it again 7 s after it started, while it stays in focus
    if (!reduce) loopT = setTimeout(function () { if (onScreen && !document.hidden) show(current, true); }, 7000);
    if (url && urls[i]) url.textContent = urls[i];
  }
  // the cursor's targets: centre of each [data-tap] element, relative to the screen
  var screen = stage.querySelector(".ss-screen");
  function aim(sc) {
    var box = screen.getBoundingClientRect();
    sc.style.setProperty("--sx", (box.width * 1.05).toFixed(1) + "px"); sc.style.setProperty("--sy", (box.height * 0.95).toFixed(1) + "px");
    Array.prototype.forEach.call(sc.querySelectorAll("[data-tap]"), function (el) {
      var r = el.getBoundingClientRect(), n = el.getAttribute("data-tap");
      sc.style.setProperty("--cx" + n, (r.left - box.left + r.width / 2).toFixed(1) + "px");
      sc.style.setProperty("--cy" + n, (r.top - box.top + r.height / 2).toFixed(1) + "px");
    });
  }
  // loop the demo in focus while it stays on screen
  window.addEventListener("resize", function () { if (current >= 0) aim(scenes[current]); });

  // which service sits on the reading line (just above the middle of the screen)
  var line = function () { return window.innerWidth < 900 ? window.innerHeight * 0.7 : window.innerHeight * 0.5; };
  var ticking = false;
  function pick() {
    ticking = false;
    var y = line(), best = 0, bestD = Infinity;
    items.forEach(function (it, k) { var r = it.getBoundingClientRect(), mid = r.top + Math.min(r.height, 220) / 2, d = Math.abs(mid - y); if (d < bestD) { bestD = d; best = k; } });
    show(best);
  }
  window.addEventListener("scroll", function () { if (!ticking && onScreen) { ticking = true; requestAnimationFrame(pick); } }, { passive: true });
  new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; if (onScreen) { pick(); show(current < 0 ? 0 : current, true); } else Array.prototype.forEach.call(scenes, function (s) { s.classList.remove("on"); }); }, { threshold: 0.15 }).observe(sec);

  items.forEach(function (it, k) {
    it.querySelector(".svx-btn").addEventListener("click", function () {
      var r = it.getBoundingClientRect(), target = window.scrollY + r.top - line() + Math.min(r.height, 220) / 2;
      var ls = window.NisjaShowcase && window.NisjaShowcase.lenis;
      if (ls) ls.scrollTo(target, { duration: 0.9 }); else window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
      show(k);
    });
  });
})();
