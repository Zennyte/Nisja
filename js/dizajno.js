/* Nisja Studio — "Dizajno" mini-game: pick a business, colours and style, see a sample site, send it as an idea. */
// Design it yourself: a toy site builder whose choices can be sent as a project idea
(function () {
  "use strict";
  var site = document.getElementById("dzSite"); if (!site) return;
  var L = function () { return (window.Nisja && window.Nisja.lang) || "sq"; }, tx = function (o) { return o[L()] || o.sq; };
  var TYPES = [
    { id: "rest", n: { sq: "Restorant", en: "Restaurant" }, img: "work/prush/img/hero-960.jpg", h: { sq: "Shija që ju sjell sërish.", en: "The taste that brings you back." }, p: { sq: "Menu me çmime, orari i sotëm dhe tavolina të lira, në një vend.", en: "Menu with prices, today's hours and free tables, in one place." }, b: { sq: "Rezervo tavolinë", en: "Book a table" }, c: [{ sq: "Menuja", en: "Menu" }, { sq: "Rezervo", en: "Book" }, { sq: "Na gjeni", en: "Find us" }], links: { sq: "Menuja · Rreth nesh · Kontakt", en: "Menu · About · Contact" } },
    { id: "barber", n: { sq: "Berber", en: "Barber" }, img: "work/brisk/img/hero-960.jpg", h: { sq: "Karrigia juaj, ora juaj.", en: "Your chair, your time." }, p: { sq: "Zgjidhni berberin dhe orën e lirë, pa telefonata.", en: "Pick your barber and a free time, no phone calls." }, b: { sq: "Rezervo termin", en: "Book a time" }, c: [{ sq: "Çmimet", en: "Prices" }, { sq: "Berberët", en: "Barbers" }, { sq: "Orari", en: "Hours" }], links: { sq: "Çmimet · Berberët · Kontakt", en: "Prices · Barbers · Contact" } },
    { id: "car", n: { sq: "Rent a car", en: "Car rental" }, img: "work/udha/img/hero-960.jpg", h: { sq: "Makina ju pret në aeroport.", en: "Your car waits at the airport." }, p: { sq: "Makinat e lira sipas datave dhe çmimi i plotë që në fillim.", en: "Free cars for your dates and the full price up front." }, b: { sq: "Shiko makinat", en: "See the cars" }, c: [{ sq: "Makinat", en: "Cars" }, { sq: "Kushtet", en: "Terms" }, { sq: "Aeroporti", en: "Airport" }], links: { sq: "Makinat · Kushtet · Kontakt", en: "Cars · Terms · Contact" } },
    { id: "dent", n: { sq: "Dentist", en: "Dentist" }, img: "work/kristal/img/hero-960.jpg", h: { sq: "Buzëqeshje pa frikë.", en: "Smile without fear." }, p: { sq: "Çmimet e qarta dhe termini online, edhe për urgjencat.", en: "Clear prices and online booking, emergencies included." }, b: { sq: "Merr termin", en: "Book a visit" }, c: [{ sq: "Shërbimet", en: "Services" }, { sq: "Çmimet", en: "Prices" }, { sq: "Ekipi", en: "Team" }], links: { sq: "Shërbimet · Çmimet · Kontakt", en: "Services · Prices · Contact" } },
    { id: "salon", n: { sq: "Sallon bukurie", en: "Beauty salon" }, img: "work/mendafsh/img/art.jpg", h: { sq: "Një orë vetëm për ju.", en: "One hour just for you." }, p: { sq: "Zgjidhni shërbimet, shihni kohën dhe çmimin, rezervoni.", en: "Pick services, see the time and price, book." }, b: { sq: "Ndërto vizitën", en: "Build your visit" }, c: [{ sq: "Thonj", en: "Nails" }, { sq: "Vetulla", en: "Brows" }, { sq: "Lëkura", en: "Skin" }], links: { sq: "Shërbimet · Higjiena · Kontakt", en: "Services · Hygiene · Contact" } }
  ];
  var PALS = [
    { id: "ember", n: { sq: "Prush", en: "Ember" }, bg: "#16130F", fg: "#F5EFE6", ac: "#FF6B2C", mu: "#B5ABA0", card: "#231F1A", on: "#16130F" },
    { id: "forest", n: { sq: "Pyll", en: "Forest" }, bg: "#D6D8D0", fg: "#171717", ac: "#002D24", mu: "#4B524E", card: "#C7CAC0", on: "#fff" },
    { id: "rose", n: { sq: "Rozë", en: "Rose" }, bg: "#FBF5F3", fg: "#3A1E2A", ac: "#A64B60", mu: "#76586A", card: "#F2E1DE", on: "#fff" },
    { id: "ocean", n: { sq: "Det", en: "Ocean" }, bg: "#EEF4F7", fg: "#0F2C46", ac: "#1D6AAD", mu: "#4B5F72", card: "#DDE8EF", on: "#fff" },
    { id: "mono", n: { sq: "Bardhezi", en: "Mono" }, bg: "#FFFFFF", fg: "#111111", ac: "#111111", mu: "#666666", card: "#F1F1F1", on: "#fff" },
    { id: "gold", n: { sq: "Ar", en: "Gold" }, bg: "#121212", fg: "#F3EDE2", ac: "#C9A469", mu: "#A8A196", card: "#1E1D1B", on: "#121212" }
  ];
  var FONTS = [
    { id: "classic", n: { sq: "Klasike", en: "Classic" }, df: "'DzItaliana', Georgia, serif", bf: "'DM Sans', Inter, system-ui, sans-serif", dw: 400, dl: "0", dt: "none" },
    { id: "modern", n: { sq: "Moderne", en: "Modern" }, df: "'DzSora', Inter, system-ui, sans-serif", bf: "Inter, system-ui, sans-serif", dw: 600, dl: "-.03em", dt: "none" },
    { id: "bold", n: { sq: "E fortë", en: "Bold" }, df: "'DzAnton', Impact, sans-serif", bf: "Inter, system-ui, sans-serif", dw: 400, dl: ".01em", dt: "uppercase" }
  ];
  var LAYS = [{ id: "split", n: { sq: "E ndarë", en: "Split" } }, { id: "photo", n: { sq: "Foto e madhe", en: "Big photo" } }, { id: "minimal", n: { sq: "Minimale", en: "Minimal" } }];
  var st = { type: "rest", pal: "ember", font: "classic", lay: "split" };
  var by = function (arr, id) { return arr.filter(function (x) { return x.id === id; })[0]; };
  function radios(boxId, arr, key, cls) {
    var box = document.getElementById(boxId); box.innerHTML = "";
    arr.forEach(function (o) {
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", String(st[key] === o.id));
      if (cls === "sw") { b.className = "dz-swb"; b.setAttribute("aria-label", tx(o.n)); b.title = tx(o.n); var sp = document.createElement("span"); sp.style.setProperty("--a", o.bg); sp.style.setProperty("--b", o.ac); b.appendChild(sp); }
      else { b.className = "dz-chip"; b.textContent = tx(o.n); }
      b.addEventListener("click", function () { st[key] = o.id; renderControls(); render(true); });
      box.appendChild(b);
    });
  }
  function renderControls() { radios("dzType", TYPES, "type"); radios("dzPal", PALS, "pal", "sw"); radios("dzFont", FONTS, "font"); radios("dzLay", LAYS, "lay"); }
  function slug(v) { return (v || "biznesijuaj").toLowerCase().replace(/[ëé]/g, "e").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "").slice(0, 22) || "biznesijuaj"; }
  function render(anim) {
    var t = by(TYPES, st.type), p = by(PALS, st.pal), f = by(FONTS, st.font), name = document.getElementById("dzName").value.trim() || "Biznesi Juaj";
    var v = { "--bg": p.bg, "--fg": p.fg, "--ac": p.ac, "--mu": p.mu, "--card": p.card, "--on": p.on, "--df": f.df, "--bf": f.bf, "--dw": f.dw, "--dl": f.dl, "--dt": f.dt };
    Object.keys(v).forEach(function (k) { site.style.setProperty(k, v[k]); });
    site.setAttribute("data-lay", st.lay);
    document.getElementById("dzsLogo").textContent = name;
    document.getElementById("dzsLinks").textContent = tx(t.links);
    document.getElementById("dzsCta").textContent = tx(t.b);
    document.getElementById("dzsH").textContent = tx(t.h);
    document.getElementById("dzsP").textContent = tx(t.p);
    document.getElementById("dzsBtn").textContent = tx(t.b);
    document.getElementById("dzsImg").style.backgroundImage = "url('" + t.img + "')";
    document.getElementById("dzsCards").innerHTML = t.c.map(function (c, i) { return "<div><b></b><span></span></div>"; }).join("");
    Array.prototype.forEach.call(document.querySelectorAll("#dzsCards div"), function (d, i) { d.querySelector("b").textContent = tx(t.c[i]); d.querySelector("span").textContent = L() === "en" ? "Tap to open" : "Prekni për ta hapur"; });
    document.getElementById("dzUrl").textContent = slug(name) + ".com";
    if (anim) { site.classList.remove("swap"); void site.offsetWidth; site.classList.add("swap"); }
  }
  document.getElementById("dzName").addEventListener("input", function () { render(false); });
  document.getElementById("dzRand").addEventListener("click", function () {
    var pick = function (a, cur) { var o; do { o = a[Math.floor(Math.random() * a.length)].id; } while (o === cur && a.length > 1); return o; };
    st.type = pick(TYPES, st.type); st.pal = pick(PALS, st.pal); st.font = pick(FONTS, st.font); st.lay = pick(LAYS, st.lay); renderControls(); render(true);
  });
  document.getElementById("dzSend").addEventListener("click", function () {
    var t = by(TYPES, st.type), p = by(PALS, st.pal), f = by(FONTS, st.font), l = by(LAYS, st.lay), name = document.getElementById("dzName").value.trim() || "Biznesi Juaj";
    var msg = L() === "en"
      ? "Hi! I designed this on your site and would like something similar:\n• Business: " + name + " (" + t.n.en + ")\n• Colours: " + p.n.en + "\n• Fonts: " + f.n.en + "\n• Homepage: " + l.n.en
      : "Përshëndetje! E dizajnova këtë në faqen tuaj dhe dua diçka të ngjashme:\n• Biznesi: " + name + " (" + t.n.sq + ")\n• Ngjyrat: " + p.n.sq + "\n• Shkronjat: " + f.n.sq + "\n• Faqja kryesore: " + l.n.sq;
    var m = document.getElementById("f-message"); if (m) m.value = msg;
    var plan = document.getElementById("f-plan");
    if (plan) { var want = st.type === "car" || st.type === "barber" || st.type === "dent" || st.type === "salon" || st.type === "rest" ? /premium/i : /biznes/i; Array.prototype.forEach.call(plan.options, function (o) { if (want.test(o.value) || want.test(o.textContent)) plan.value = o.value; }); }
    var biz = document.getElementById("f-business") || document.querySelector('#contact input[name="business"]'); if (biz && !biz.value) biz.value = name;
    var c = document.getElementById("contact"), ls = window.NisjaShowcase && window.NisjaShowcase.lenis; if (c && ls) ls.scrollTo(c, { offset: -80 }); else if (c) c.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setTimeout(function () { var n = document.querySelector("#contact input"); if (n) n.focus({ preventScroll: true }); }, 700);
  });
  /* build it only when the section comes near, so its photo and fonts don't slow the page load */
  var built = false, build = function () { if (built) return; built = true; renderControls(); render(false); };
  if ("IntersectionObserver" in window) { var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { build(); io.disconnect(); } }, { rootMargin: "600px 0px" }); io.observe(site); } else build();
  if (window.Nisja && window.Nisja.onLangChange) window.Nisja.onLangChange(function () { if (built) { renderControls(); render(false); } });
})();

