/* Vrull Fitness: everything the owner may want to change lives here.
   Day numbers: 0 = Sunday … 6 = Saturday. Prices in euro per month. */
window.SITE = {
  demo: true,
  endpoint: "https://formsubmit.co/ajax/41e7fb5e547431c7ebd7349e96f94390",
  whatsapp: "",
  phone: "+383 45 000 000",
  address: "Rr. Remzi Ademaj 9, Prizren",
  maps: "https://maps.google.com/?q=Prizren",
  hours: { 0: ["09:00", "15:00"], 1: ["06:00", "23:00"], 2: ["06:00", "23:00"], 3: ["06:00", "23:00"], 4: ["06:00", "23:00"], 5: ["06:00", "23:00"], 6: ["08:00", "20:00"] },

  /* how full the gym usually is, by hour (0–100). Members use it to pick quiet times. */
  crowd: { 6: 25, 7: 45, 8: 40, 9: 30, 10: 25, 11: 22, 12: 30, 13: 28, 14: 25, 15: 35, 16: 55, 17: 80, 18: 95, 19: 90, 20: 70, 21: 45, 22: 25 },

  plans: [
    { id: "gym",  price: 25, name: { sq: "Palestra", en: "Gym" }, gets: { sq: ["Zona e peshave dhe kardio", "Dushe dhe dollapë", "Aplikacioni i stërvitjeve"], en: ["Weights and cardio floor", "Showers and lockers", "Training app"] } },
    { id: "plus", price: 35, name: { sq: "Vrull Plus", en: "Vrull Plus" }, best: true, gets: { sq: ["Gjithçka te Palestra", "Të gjitha klasat në grup", "Ring boksi në orët e lira", "1 analizë trupi në muaj"], en: ["Everything in Gym", "All group classes", "Boxing ring in open hours", "1 body scan a month"] } },
    { id: "pt",   price: 79, name: { sq: "Me trajner", en: "Coached" }, gets: { sq: ["Gjithçka te Plus", "4 seanca personale në muaj", "Plan ushqimi i përshtatur", "Mesazhe me trajnerin"], en: ["Everything in Plus", "4 personal sessions a month", "Tailored meal plan", "Messaging with your coach"] } }
  ],
  terms: [ { months: 1, off: 0 }, { months: 3, off: 10 }, { months: 12, off: 20 } ],
  studentOff: 15,

  types: {
    hiit:   { sq: "HIIT", en: "HIIT", c: "#FF6B3D" },
    box:    { sq: "Boks", en: "Boxing", c: "#F2F5EF" },
    str:    { sq: "Forcë", en: "Strength", c: "#C6FF3D" },
    mob:    { sq: "Lëvizshmëri", en: "Mobility", c: "#38E0A8" },
    spin:   { sq: "Spinning", en: "Spin", c: "#B07CFF" }
  },
  coaches: [
    { id: "driton", name: "Driton", tag: { sq: "Forcë dhe powerlifting. Ish-garues kombëtar.", en: "Strength and powerlifting. Former national competitor." } },
    { id: "elira",  name: "Elira",  tag: { sq: "HIIT, spinning dhe lëvizshmëri.", en: "HIIT, spin and mobility." } },
    { id: "besnik", name: "Besnik", tag: { sq: "Boks për të gjitha nivelet.", en: "Boxing for every level." } }
  ],
  /* the weekly class timetable */
  classes: [
    { d: 1, at: "07:00", type: "hiit", coach: "elira", min: 45, cap: 14 }, { d: 1, at: "18:00", type: "str", coach: "driton", min: 60, cap: 10 }, { d: 1, at: "19:30", type: "box", coach: "besnik", min: 60, cap: 12 },
    { d: 2, at: "07:00", type: "mob", coach: "elira", min: 45, cap: 14 }, { d: 2, at: "18:00", type: "spin", coach: "elira", min: 45, cap: 16 }, { d: 2, at: "19:30", type: "str", coach: "driton", min: 60, cap: 10 },
    { d: 3, at: "07:00", type: "hiit", coach: "elira", min: 45, cap: 14 }, { d: 3, at: "18:00", type: "box", coach: "besnik", min: 60, cap: 12 }, { d: 3, at: "19:30", type: "spin", coach: "elira", min: 45, cap: 16 },
    { d: 4, at: "07:00", type: "mob", coach: "elira", min: 45, cap: 14 }, { d: 4, at: "18:00", type: "str", coach: "driton", min: 60, cap: 10 }, { d: 4, at: "19:30", type: "hiit", coach: "elira", min: 45, cap: 14 },
    { d: 5, at: "07:00", type: "spin", coach: "elira", min: 45, cap: 16 }, { d: 5, at: "18:00", type: "box", coach: "besnik", min: 60, cap: 12 },
    { d: 6, at: "10:00", type: "hiit", coach: "elira", min: 45, cap: 14 }, { d: 6, at: "11:30", type: "str", coach: "driton", min: 60, cap: 10 },
    { d: 0, at: "10:00", type: "mob", coach: "elira", min: 60, cap: 14 }
  ],

  faq: [
    { q: { sq: "Si funksionon dita e provës?", en: "How does the free trial work?" }, a: { sq: "Zgjidhni ditën, vini me kodin që merrni këtu dhe stërviteni gjithë ditën, edhe në klasa. Pa kartelë, pa detyrim.", en: "Pick a day, show the code you get here and train all day, classes included. No card, no commitment." } },
    { q: { sq: "A mund ta ngrij abonimin?", en: "Can I freeze my membership?" }, a: { sq: "Po, deri në 30 ditë në vit për udhëtim ose sëmundje. Na shkruani një mesazh.", en: "Yes, up to 30 days a year for travel or illness. Just send us a message." } },
    { q: { sq: "Po nëse klasa është plot?", en: "What if a class is full?" }, a: { sq: "Hyni në listën e pritjes. Nëse dikush anulon, vendi ju kalon automatikisht dhe ju njoftojmë.", en: "Join the waitlist. If someone cancels, the spot passes to you automatically and we let you know." } },
    { q: { sq: "Si paguaj?", en: "How do I pay?" }, a: { sq: "Në recepsion me kartelë ose para, ose me transfer bankar mujor.", en: "At reception by card or cash, or by monthly bank transfer." } }
  ]
};
