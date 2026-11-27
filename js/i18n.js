/* Nisja Studio — Albanian / English switch for the homepage.
   Albanian is written in the HTML. This runs before the effect scripts, so when English is chosen
   every effect (split headings, rolling links, the hero full stop) is built from the English text.
   Switching language saves the choice and reloads the page, which rebuilds those effects cleanly.
   Other scripts: window.Nisja.lang ("sq" | "en") and window.Nisja.t("albanian", "english"). */
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

    "footer.slogan": "Your business, launched.",

    // new homepage (2026-11)
    "v2.hint": "Click a site to view it",
    "v2.fdPages": "sites",
    "v2.endText": "Need something else?",
    "v2.ask": "Ask us",
    "v2.navFaq": "FAQ",
    "v2.heroSub": "Websites, online booking and logos for businesses in Kosovo. Here are a few we've built.",
    "v2.viewLive": "View live",
    "v2.buildTitle": "From code to a live site.",
    "v2.buildSub": "We write every line ourselves, no templates. When the code is done, the site goes live and lands in our folder. Open the folder and try any of them.",
    "v2.k.lisi": "custom furniture",
    "v2.k.embel": "pastry shop",
    "v2.k.fener": "cocktail bar",
    "v2.k.kroni": "wedding venue",
    "v2.k.kaliber": "car dealership",
    "v2.k.udha": "rent a car · now",
    "v2.fdTitle": "Live demos",
    "v2.workLead": "Sites we've built, live now. Hover over a phone to scroll through it, or pick a business in the video.",
    "v2.tab.auto": "Car dealer",
    "v2.tab.dasma": "Weddings",
    "v2.tab.bar": "Bar",
    "v2.tab.past": "Pastry",
    "v2.tab.mob": "Furniture",
    "v2.rk.kaliber": "Car dealership · Prishtina",
    "v2.rk.kroni": "Wedding venue · Rahovec",
    "v2.rk.fener": "Cocktail bar · Prishtina",
    "v2.rk.embel": "Pastry shop · Gjakova",
    "v2.rk.lisi": "Custom furniture · Peja",
    "v2.rt.kaliber": "Customers filter the stock, compare up to three cars and see the monthly payment for the options they pick. Test drives are booked by the hour.",
    "v2.rt.kroni": "Couples see free dates 12 months ahead and the full price by day, guest count and menu. A date is held for 7 days at no cost.",
    "v2.rt.fener": "Guests find their cocktail with three taste sliders and pick their own table on the bar's floor plan.",
    "v2.rt.embel": "Customers build their cake and see the price live. The calendar only shows days the bakery still has room.",
    "v2.rt.lisi": "Customers choose the wood and size, try the furniture in a plan of their own room and ask for a quote with free samples.",
    "v2.svLead": "Everything your business needs to be found online, from one place.",
    "v2.bigline": "Have a business that deserves to be seen? Let's get it started together, today.",
    "v2.openNew": "Open in a new tab",
    // test pages (lab)
    "lab.live": "Live",
    "lab.cap": "Prush Grill & Bar · concept",
    "lab.gq": "grill restaurant prishtina",
    "lab.gmeta": "Restaurant · Prishtina · Open now"
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

  // labels on the custom cursor
  var CURSOR = { "Dërgo": "Send", "Hap": "Open", "Rrëshqit": "Swipe", "Shfleto": "Browse", "Shiko": "View", "Shkruaj": "Write", "Shto": "Add", "Zgjidh": "Pick" };

  var lang = "sq";
  try { if (localStorage.getItem("nisja-lang") === "en") lang = "en"; } catch (e) { /* storage unavailable */ }
  var listeners = [];
  window.Nisja = {
    lang: lang,
    t: function (sq, en) { return lang === "en" ? en : sq; },
    onLangChange: function (fn) { listeners.push(fn); }
  };

  if (lang === "en") {
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (el) {
      var v = EN[el.getAttribute("data-i18n")]; if (v) el.textContent = v;
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-cursor]"), function (el) {
      var v = CURSOR[el.getAttribute("data-cursor")]; if (v) el.setAttribute("data-cursor", v);
    });
    document.documentElement.lang = "en";
  }
  document.title = META[lang].title;
  var subjectField = document.querySelector('input[name="_subject"]');
  if (subjectField) subjectField.value = META[lang].subject;

  var toggle = document.getElementById("lang-toggle");
  if (toggle) {
    toggle.textContent = META[lang].toggle;
    toggle.setAttribute("aria-label", META[lang].toggleLabel);
    toggle.addEventListener("click", function () {
      try { localStorage.setItem("nisja-lang", lang === "en" ? "sq" : "en"); } catch (e) { return; }
      location.reload();
    });
  }
})();
