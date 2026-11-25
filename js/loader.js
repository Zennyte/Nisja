(function () {
  var root = document.documentElement, loader = document.getElementById("loader"), seen = false;
  try { seen = sessionStorage.getItem("nisja-loaded") === "1"; } catch (e) {}
  if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { loader.remove(); return; }
  root.classList.add("is-loading");
  var start = Date.now(), finished = false;
  function finish() {
    if (finished) return; finished = true;
    setTimeout(function () {
      root.classList.remove("is-loading");
      loader.classList.add("is-done");
      try { sessionStorage.setItem("nisja-loaded", "1"); } catch (e) {}
      window.dispatchEvent(new Event("nisja:ready"));
      setTimeout(function () { loader.remove(); }, 1000);
    }, Math.max(0, 1900 - (Date.now() - start)));
  }
  window.addEventListener("load", finish);
  setTimeout(finish, 4500);
})();

