(function () {
  var root = document.documentElement, loader = document.getElementById("loader"), seen = false;
  try { seen = sessionStorage.getItem("nisja-loaded") === "1"; } catch (e) {}
  // on phones the desk intro is the opening screen, so the loader would only hold the page back
  var deskFirst = document.getElementById("zyra") && window.innerWidth < 700 && location.hash.length < 2 && window.scrollY < 11;
  if (deskFirst) root.classList.add("desk-first");
  if (seen || deskFirst || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { loader.remove(); return; }
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

