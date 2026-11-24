/* Mëndafsh Beauty Studio: everything the owner may want to change lives here.
   Prices in euro, durations in minutes. Day numbers: 0 = Sunday … 6 = Saturday. */
window.SITE = {
  demo: true,
  endpoint: "https://formsubmit.co/ajax/41e7fb5e547431c7ebd7349e96f94390",
  whatsapp: "",
  phone: "+383 49 000 000",
  address: "Rr. Nënë Tereza 22, Gjakovë",
  maps: "https://maps.google.com/?q=Gjakov%C3%AB",
  step: 15, noticeMin: 120, daysAhead: 21,
  hours: { 0: null, 1: ["10:00", "19:00"], 2: ["09:00", "19:00"], 3: ["09:00", "19:00"], 4: ["09:00", "20:00"], 5: ["09:00", "20:00"], 6: ["09:00", "17:00"] },
  bundle: { from: 2, pct: 10 },     // 2 or more services in one visit: 10% off the total. Set pct: 0 to turn off.

  groups: [
    { id: "nails", name: { sq: "Thonj", en: "Nails" }, img: "img/polish.jpg" },
    { id: "brows", name: { sq: "Vetulla & qerpikë", en: "Brows & lashes" }, img: "img/mirror.jpg" },
    { id: "skin",  name: { sq: "Lëkura", en: "Skin" }, img: "img/serum.jpg" },
    { id: "hair",  name: { sq: "Flokë", en: "Hair" }, img: "img/hair.jpg" }
  ],

  services: [
    { id: "mani",   g: "nails", min: 45, price: 15, name: { sq: "Manikyr me gel", en: "Gel manicure" }, note: { sq: "Përgatitje, formë, ngjyrë që zgjat 3 javë.", en: "Prep, shape, colour that lasts 3 weeks." }, refresh: 21 },
    { id: "ext",    g: "nails", min: 90, price: 28, name: { sq: "Zgjatje me akril", en: "Acrylic extensions" }, note: { sq: "Gjatësi dhe formë sipas dëshirës.", en: "Length and shape to your liking." }, refresh: 21 },
    { id: "pedi",   g: "nails", min: 60, price: 20, name: { sq: "Pedikyr spa", en: "Spa pedicure" }, note: { sq: "Banjë, peeling, kremim dhe gel.", en: "Soak, scrub, massage and gel." }, refresh: 28 },
    { id: "art",    g: "nails", min: 15, price: 5,  name: { sq: "Dizajn në thonj", en: "Nail art" }, note: { sq: "Shtesë: linja, gurë, kromë.", en: "Add-on: lines, stones, chrome." } },
    { id: "brow",   g: "brows", min: 30, price: 10, name: { sq: "Formim vetullash", en: "Brow shaping" }, note: { sq: "Me fije ose dyll, plus ngjyrosje e lehtë.", en: "Thread or wax, plus a light tint." }, refresh: 28 },
    { id: "lami",   g: "brows", min: 50, price: 25, name: { sq: "Laminim vetullash", en: "Brow lamination" }, note: { sq: "Vetulla të plota që qëndrojnë në vend 6 javë.", en: "Full brows that stay in place for 6 weeks." }, refresh: 42 },
    { id: "lash",   g: "brows", min: 60, price: 30, name: { sq: "Lash lift", en: "Lash lift" }, note: { sq: "Kaçurrela natyrale, pa zgjatime.", en: "Natural curl, no extensions." }, refresh: 42 },
    { id: "facial", g: "skin",  min: 60, price: 35, name: { sq: "Pastrim fytyre", en: "Deep-clean facial" }, note: { sq: "Analizë e lëkurës, pastrim, maskë.", en: "Skin check, cleanse, mask." }, refresh: 30 },
    { id: "hydra",  g: "skin",  min: 75, price: 45, name: { sq: "Hidratim intensiv", en: "Hydrating facial" }, note: { sq: "Për lëkurë të thatë në dimër.", en: "For dry winter skin." }, refresh: 30 },
    { id: "blow",   g: "hair",  min: 40, price: 12, name: { sq: "Larje & fen", en: "Wash & blow-dry" }, note: { sq: "Valë ose drejt, gati për darkë.", en: "Waves or straight, dinner-ready." } },
    { id: "color",  g: "hair",  min: 120, price: 40, name: { sq: "Ngjyrosje", en: "Colour" }, note: { sq: "Ngjyrë e plotë me trajtim mbrojtës.", en: "Full colour with a protective treatment." }, refresh: 42 }
  ],

  staff: [
    { id: "arta",  name: "Arta",  off: [1], tag: { sq: "Thonj dhe dizajn. 9 vjet përvojë.", en: "Nails and nail art. 9 years." }, does: ["mani", "ext", "pedi", "art", "brow"] },
    { id: "blerta", name: "Blerta", off: [3], tag: { sq: "Vetulla, qerpikë dhe lëkurë.", en: "Brows, lashes and skin." }, does: ["brow", "lami", "lash", "facial", "hydra", "mani", "art"] },
    { id: "vesa",  name: "Vesa",  off: [2], tag: { sq: "Flokë dhe ngjyra. Edhe pedikyr.", en: "Hair and colour. Pedicures too." }, does: ["blow", "color", "pedi", "facial", "brow"] }
  ],

  faq: [
    { q: { sq: "A mund të marr dy shërbime njëkohësisht?", en: "Can I book two services together?" }, a: { sq: "Po. Ndërtoni vizitën me sa shërbime të doni; i bëjmë njëra pas tjetrës me të njëjtën specialiste dhe zbresim 10% nga totali.", en: "Yes. Add as many services as you like; one specialist does them back to back and we take 10% off the total." } },
    { q: { sq: "Si i pastroni instrumentet?", en: "How do you clean your tools?" }, a: { sq: "Instrumentet metalike sterilizohen në autoklavë pas çdo klienteje. Limat dhe shkopinjtë janë një-përdorimshëm.", en: "Metal tools go through an autoclave after every client. Files and sticks are single-use." } },
    { q: { sq: "Po nëse vonohem?", en: "What if I'm late?" }, a: { sq: "Ju presim 15 minuta. Pas kësaj mund të shkurtojmë shërbimin që të mos vonojmë klienten tjetër.", en: "We wait 15 minutes. After that we may shorten the service so the next client isn't delayed." } },
    { q: { sq: "A ka parking?", en: "Is there parking?" }, a: { sq: "Po, parking publik në rrugën paralele, 2 minuta në këmbë.", en: "Yes, public parking on the parallel street, 2 minutes' walk." } }
  ]
};
