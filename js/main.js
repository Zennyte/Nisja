/* Nisja Studio — core script
   - Albanian / English switch (Albanian is the default, written in the HTML)
   - mobile menu, header state, package pre-select, footer year
   Other scripts can react to a language change with:
   window.Nisja.onLangChange(function (lang) { ... })
*/
(function () {
  "use strict";

  var EN = {
    "skip": "Skip to content",
    "menu": "Menu",
    "nav.services": "Services",
    "nav.work": "Work",
    "nav.process": "How it works",
    "nav.pricing": "Pricing",
    "nav.contact": "Contact",
    "cta.start": "Start your project",

    "hero.status": "Taking on new projects",
    "hero.title": "Every success has a beginning.",
    "hero.sub": "Modern websites that make your business visible — fast, beautiful and ready for mobile.",
    "hero.secondary": "See our work",

    "mq.1": "Websites",
    "mq.2": "Logos",
    "mq.3": "Online booking",
    "mq.4": "Google-ready",
    "mq.5": "Your business, launched",

    "services.title": "What we do",
    "services.intro_old": "Everything your business needs to be found online, all in one place.",
    "s1.title": "Websites",
    "s1.text": "Custom design, not templates. Sites that load fast, look great on every screen and turn visitors into customers.",
    "s2.title": "Logo and identity",
    "s2.text": "A clear logo, colours and fonts that make your business recognisable wherever it appears.",
    "s3.title": "Online booking",
    "s3.text": "Customers book a table, an appointment or a car right from your site, and you’re notified instantly.",
    "demo.booked": "Booking confirmed",

    "work.title": "Recent work",
    "work.intro": "Sites we built, live now. Hover over a project to scroll through it.",
    "work.visit": "Open the live site",
    "w1.text": "A portfolio for an architecture and engineering studio in Gjakova: a video intro, a project gallery and quick contact.",
    "w2.text": "A grill restaurant in Prishtina: a menu with prices, live open/closed status and table booking by free time slot.",
    "w3.text": "Car rental in Gjakova: cars that are free on your dates, the full price up front and airport pickup.",
    "work.concepts": "A site for every business",
    "work.conceptsIntro": "Concept projects for the businesses that lose the most time on the phone. Each has a system that saves the owner work.",
    "work.try": "Try the demo",
    "services.intro": "Everything your business needs to be found online, from one place. Pick a service and watch it work.",
    "nav.design": "Design it",
    "sv.web": "Websites", "sv.webd": "Custom design, not a template. Loads fast and looks right on every screen.",
    "sv.book": "Online booking", "sv.bookd": "Customers book a table, a slot or a car themselves, and you're notified instantly.",
    "sv.google": "Found on Google", "sv.googled": "Google Maps, basic optimisation and accurate details, so customers find you when they search.",
    "sv.logo": "Logo and identity", "sv.logod": "A logo, colours and fonts that make your business recognisable everywhere.",
    "sv.lang": "Albanian and English", "sv.langd": "One tap and the site speaks to tourists and the diaspora.",
    "sv.care": "You make the changes", "sv.cared": "Update prices, texts and photos yourself, or message us and we'll do it.",
    "sv.speed": "phone speed score", "sv.newbook": "New booking", "sv.newbookd": "4 people · Saturday 20:00", "sv.query": "barber near me",
    "sv.gmeta": "Barber · Prishtina · Open now", "sv.gweb": "Website", "sv.gcall": "Call", "sv.gdir": "Directions",
    "sv.item1": "Classic cut", "sv.item2": "Cut + beard", "sv.item3": "Kids", "sv.saved": "Saved · live on the site",
    "dz.title": "Design it yourself", "dz.intro": "A little game: pick your business, colours and style, and see how your site could look. When you like it, send it to us as an idea.",
    "dz.name": "Business name", "dz.type": "Type", "dz.colors": "Colours", "dz.font": "Fonts", "dz.layout": "Homepage", "dz.rand": "Surprise me", "dz.send": "Send this idea",
    "work.client": "Real client · live",
    "reel.t1": "Barber", "reel.t2": "Salon", "reel.t3": "Gym", "reel.t4": "Dentist",
    "reel.k1": "Barber · Prishtina", "reel.k2": "Beauty salon · Gjakova", "reel.k3": "Gym · Prizren", "reel.k4": "Dental clinic · Peja",
    "reel.p1": "Clients pick a barber and see only his free times. The owner sees each barber's day on one screen.",
    "reel.p2": "Clients pick several services and see the time and price before booking. After the visit they get a refresh reminder.",
    "reel.p3": "The class timetable shows free spots and fills the waitlist by itself. Trial days are booked online, with a code for reception.",
    "reel.p4": "Two questions tell patients which visit to book. Two urgent slots are kept free every day for toothaches.",
    "c1.text": "Barber in Prishtina: booking by barber with his own free times, live chair status and a day view for the staff.",
    "c2.text": "Beauty studio in Gjakova: clients build a visit from several services, see the time and price, and get a refresh reminder.",
    "c3.text": "Gym in Prizren: how busy it is right now, a class timetable with spots and a waitlist, memberships and a free trial day.",
    "c4.text": "Dental clinic in Peja: two questions find the right visit, urgent slots every day and a plan for patients from abroad.",
    "tag.byBarber": "Booking by barber",
    "tag.builder": "Visit builder",
    "tag.classes": "Classes with spots",
    "tag.finder": "Visit finder",
    "work.older": "Older demo:",
    "d1.text": "A barbershop site with prices, team, opening hours and three-step online booking.",
    "d2.text": "A restaurant site with a menu by category, the venue’s story and table booking.",
    "d3.text": "A dental clinic site with services and guide prices, the team and online appointment requests.",
    "tag.request": "Appointment requests",
    "tag.concept": "Concept demo",
    "tag.project": "Concept project",
    "tag.table": "Table booking",
    "work.open": "Open the site",
    "tag.booking": "Online booking",
    "tag.portfolio": "Portfolio",
    "tag.video": "Video intro",
    "tag.gallery": "Gallery",
    "tag.menu": "Online menu",
    "tag.hours": "Opening hours",
    "tag.maps": "Google Maps",
    "tag.fleet": "Fleet",
    "tag.prices": "Daily prices",

    "process.title": "How it works",
    "process.intro": "From the first message to a live website, in four simple steps.",
    "p1.title": "We talk",
    "p1.text": "Tell us about your business and what you need. We send you a free quote.",
    "p2.title": "We design",
    "p2.text": "You see the design before anything is built, and ask for the changes you want.",
    "p3.title": "We build",
    "p3.text": "We build your site and test it on phone, tablet and desktop.",
    "p4.title": "We launch",
    "p4.text": "Your site goes live and we show you how to update it yourself.",

    "pricing.title": "Pricing",
    "pricing.intro": "Clear prices from the start. The final price depends on the project, and the quote is always free.",
    "price.from": "from",
    "plan1.for": "For businesses that want to be online fast.",
    "plan1.f1": "One-page website, ready for mobile",
    "plan1.f2": "Buttons for phone, email and Instagram",
    "plan1.f3": "Google Map with your location",
    "plan2.badge": "Most popular",
    "plan2.name": "Business",
    "plan2.for": "The package most businesses choose.",
    "plan2.f1": "Up to 5 pages",
    "plan2.f2": "Albanian and English",
    "plan2.f3": "Edit texts and photos yourself",
    "plan2.f4": "Basic Google optimisation",
    "plan3.for": "For businesses that want more from their site.",
    "plan3.f1": "Everything in Business",
    "plan3.f2": "An online booking system",
    "plan3.f3": "More pages and languages",
    "plan.choose": "Choose this package",
    "extra1.title": "Monthly care plan",
    "extra1.text": "from €20 a month: hosting, small edits and updates, so you don’t have to think about any of it.",
    "extra2.title": "Logo",
    "extra2.text": "from €80, with files ready for your website, social media and print.",

    "faq.title": "Frequently asked questions",
    "faq.intro": "Can’t find your answer? Message us and we’ll reply the same day.",
    "faq1.q": "How long does a website take?",
    "faq1.a": "It depends on the project. A simple site can be ready in a few days, a bigger one takes a few weeks. Your quote includes an exact timeline.",
    "faq2.q": "How do I pay?",
    "faq2.a": "By bank transfer. The payment terms are written clearly in your quote before any work starts.",
    "faq3.q": "Can I edit the site myself later?",
    "faq3.a": "Yes. With the Business and Premium packages you change texts and photos yourself, no code needed. We show you how when the site launches.",
    "faq4.q": "Are the domain and hosting included?",
    "faq4.a": "Hosting is included in the monthly care plan. The domain (e.g. yourbusiness.com) is paid separately, usually around €10–20 a year, and is registered in your name.",
    "faq5.q": "Will my business show up on Google?",
    "faq5.a": "Every site is built so Google can read it easily, and the Business package includes search optimisation. We also help you set up your free Google Maps profile.",
    "faq6.q": "Do you work with businesses outside Kosovo?",
    "faq6.a": "Yes. We work online with businesses anywhere, including diaspora businesses in Germany, Switzerland and beyond, in Albanian or English.",
    "faq7.q": "What do I need to prepare?",
    "faq7.a": "Not much: your logo if you have one, a few photos and the basics about your business. No logo or texts yet? We can make them.",

    "contact.title": "Let’s get started.",
    "contact.intro": "Tell us about your business and what you have in mind. We usually reply within a day.",
    "form.name": "Name",
    "form.business": "Your business (optional)",
    "form.plan": "Package",
    "form.unsure": "Not sure yet",
    "form.plan2": "Business — €550",
    "form.message": "Message",
    "form.send": "Send message",

    "footer.slogan": "Your business, launched."
  };

  var META = {
    sq: {
      title: "Nisja Studio — Faqe interneti dhe logo për biznese në Kosovë",
      toggle: "EN",
      toggleLabel: "Switch to English",
      subject: "Mesazh i ri nga faqja e Nisja Studio"
    },
    en: {
      title: "Nisja Studio — Websites and logos for businesses",
      toggle: "SQ",
      toggleLabel: "Kalo në shqip",
      subject: "New message from the Nisja Studio website"
    }
  };

  var listeners = [];
  window.Nisja = {
    lang: "sq",
    onLangChange: function (fn) { listeners.push(fn); }
  };

  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  // Remember the Albanian text written in the HTML so we can switch back.
  nodes.forEach(function (el) { el.setAttribute("data-sq", el.textContent); });

  var toggle = document.getElementById("lang-toggle");
  var subjectField = document.querySelector('input[name="_subject"]');

  function setLang(lang) {
    nodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent = lang === "en" && EN[key] ? EN[key] : el.getAttribute("data-sq");
    });
    document.documentElement.lang = lang;
    document.title = META[lang].title;
    toggle.textContent = META[lang].toggle;
    toggle.setAttribute("aria-label", META[lang].toggleLabel);
    if (subjectField) subjectField.value = META[lang].subject;
    window.Nisja.lang = lang;
    try { localStorage.setItem("nisja-lang", lang); } catch (e) { /* storage unavailable */ }
    listeners.forEach(function (fn) { fn(lang); });
  }

  var saved = null;
  try { saved = localStorage.getItem("nisja-lang"); } catch (e) { /* storage unavailable */ }
  // Apply a saved English choice once every script has registered its listeners.
  if (saved === "en") {
    document.addEventListener("DOMContentLoaded", function () { setLang("en"); });
  }

  toggle.addEventListener("click", function () {
    setLang(document.documentElement.lang === "en" ? "sq" : "en");
  });

  // Mobile menu
  var menuBtn = document.getElementById("menu-toggle");
  var nav = document.getElementById("site-nav");
  function closeMenu() {
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") closeMenu();
  });

  // Header border + scroll progress bar
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 8);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Package buttons pre-select the package in the form
  var planSelect = document.getElementById("f-plan");
  Array.prototype.forEach.call(document.querySelectorAll("[data-plan]"), function (btn) {
    btn.addEventListener("click", function () {
      if (planSelect) planSelect.value = btn.getAttribute("data-plan");
    });
  });

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();

// Concept sites: tabbed browser frame. One muted clip per site, loaded only when the block is on screen.
(function () {
  "use strict";
  var root = document.getElementById("reel");
  if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll(".reel-tab"));
  var video = document.getElementById("reelVideo"), url = document.getElementById("reelUrl"), prog = document.getElementById("reelProg"), screen = document.getElementById("reelScreen");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var current = 0, visible = false, touched = false;
  if (reduced) video.setAttribute("controls", "");

  function load(i, play) {
    var slug = tabs[i].getAttribute("data-slug");
    if (visible) {
      video.poster = "assets/work/reel/" + slug + ".jpg";
      if (video.getAttribute("src") !== "assets/work/reel/" + slug + ".mp4") video.src = "assets/work/reel/" + slug + ".mp4";
      if (play && !reduced) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    }
  }
  function select(i, opts) {
    opts = opts || {};
    current = (i + tabs.length) % tabs.length;
    tabs.forEach(function (t, k) {
      var on = k === current;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    url.textContent = "/work/" + tabs[current].getAttribute("data-slug");
    prog.style.transform = "scaleX(0)";
    if (opts.focus) tabs[current].focus();
    if (opts.user) { touched = true; if (history.replaceState) history.replaceState(null, "", "#" + tabs[current].id); }
    load(current, true);
  }
  tabs.forEach(function (t, k) {
    t.addEventListener("click", function () { select(k, { user: true }); });
    t.addEventListener("keydown", function (e) {
      var to = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault(); select(to, { user: true, focus: true });
    });
  });
  /* swipe on the screen to change site */
  var x0 = null;
  screen.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  screen.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) select(current + (dx < 0 ? 1 : -1), { user: true });
  });
  /* until someone picks a tab, the clips play one after another */
  video.addEventListener("ended", function () { if (touched) { video.currentTime = 0; video.play(); } else select(current + 1); });
  video.addEventListener("timeupdate", function () { if (video.duration) prog.style.transform = "scaleX(" + (video.currentTime / video.duration).toFixed(3) + ")"; });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) load(current, true); else if (!video.paused) video.pause();
    }, { rootMargin: "150px 0px" }).observe(root);
  } else { visible = true; load(current, false); }

  /* deep links: #punet-berber, #punet-sallon, #punet-palester, #punet-dentist */
  function fromHash() {
    var k = tabs.findIndex ? tabs.findIndex(function (t) { return "#" + t.id === location.hash; }) : -1;
    if (k > -1) { touched = true; select(k); }
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();

  if (window.Nisja && window.Nisja.onLangChange) {
    var label = function (l) {
      root.querySelector(".reel-tabs").setAttribute("aria-label", l === "en" ? "Concept projects by industry" : "Projekte koncept sipas industrisë");
      video.setAttribute("aria-label", l === "en" ? "Short recording of the site" : "Regjistrim i shkurtër i faqes");
    };
    window.Nisja.onLangChange(label); label(window.Nisja.lang || "sq");
  }
})();

// Services stage: each service plays a short demo; auto-cycles while on screen until someone picks one
(function () {
  "use strict";
  var root = document.getElementById("svc"); if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll(".svc-tab")), scenes = root.querySelectorAll(".scene"), stage = document.getElementById("svs");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches, cur = 0, timer = null, visible = false, user = false, DUR = 5500;
  var urls = { web: "biznesijuaj.com", book: "biznesijuaj.com/rezervo", google: "google.com/maps", logo: "biznesijuaj.com/logo", lang: "biznesijuaj.com/en", care: "biznesijuaj.com/admin" };
  function count() { var el = document.getElementById("swNum"), t0 = performance.now(); if (reduced) { el.textContent = "98"; return; } (function f(n) { var k = Math.min(1, (n - t0 - 500) / 1600); if (k < 0) k = 0; el.textContent = Math.round(98 * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0); }
  function show(i, focus) {
    cur = (i + tabs.length) % tabs.length; var key = tabs[cur].getAttribute("data-s");
    tabs.forEach(function (t, k) { t.setAttribute("aria-selected", k === cur ? "true" : "false"); t.tabIndex = k === cur ? 0 : -1; });
    stage.setAttribute("aria-labelledby", tabs[cur].id);
    Array.prototype.forEach.call(scenes, function (s) { s.classList.remove("on"); });
    var sc = root.querySelector('.scene[data-s="' + key + '"]'); void sc.offsetWidth; sc.classList.add("on");
    document.getElementById("ssUrl").textContent = urls[key];
    if (key === "web") count();
    if (focus) tabs[cur].focus();
    schedule();
  }
  function schedule() { clearTimeout(timer); if (!user && visible && !reduced) timer = setTimeout(function () { show(cur + 1); }, DUR); }
  tabs.forEach(function (t, k) {
    t.addEventListener("click", function () { user = true; root.classList.add("paused"); show(k); });
    t.addEventListener("keydown", function (e) { var to = { ArrowDown: cur + 1, ArrowRight: cur + 1, ArrowUp: cur - 1, ArrowLeft: cur - 1, Home: 0, End: tabs.length - 1 }[e.key]; if (to === undefined) return; e.preventDefault(); user = true; root.classList.add("paused"); show(to, true); });
  });
  if (reduced) root.classList.add("paused");
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { var was = visible; visible = es[0].isIntersecting; if (visible && !was) show(cur); else if (!visible) clearTimeout(timer); }, { threshold: .35 }).observe(root);
  else { visible = true; show(0); }
})();

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
    var c = document.getElementById("contact"); if (c) c.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setTimeout(function () { var n = document.querySelector("#contact input"); if (n) n.focus({ preventScroll: true }); }, 700);
  });
  /* build it only when the section comes near, so its photo and fonts don't slow the page load */
  var built = false, build = function () { if (built) return; built = true; renderControls(); render(false); };
  if ("IntersectionObserver" in window) { var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { build(); io.disconnect(); } }, { rootMargin: "600px 0px" }); io.observe(site); } else build();
  if (window.Nisja && window.Nisja.onLangChange) window.Nisja.onLangChange(function () { if (built) { renderControls(); render(false); } });
})();

