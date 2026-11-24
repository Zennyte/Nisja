/* Brisk Barber Club: everything the owner may want to change lives here.
   Prices in euro, durations in minutes, hours as "HH:MM". Day numbers: 0 = Sunday … 6 = Saturday. */
window.SITE = {
  demo: true,                       // true = concept site: bookings stay in this browser unless the URL has ?test
  endpoint: "https://formsubmit.co/ajax/41e7fb5e547431c7ebd7349e96f94390",
  whatsapp: "",                     // owner's WhatsApp in international format without +, e.g. "38344123456"; empty = share sheet
  phone: "+383 44 000 000",
  address: "Rr. Agim Ramadani 14, Prishtinë",
  maps: "https://maps.google.com/?q=Rr.+Agim+Ramadani,+Prishtin%C3%AB",
  instagram: "#",
  step: 15,                         // a new slot every 15 minutes
  noticeMin: 30,                    // earliest booking: 30 minutes from now
  daysAhead: 14,
  hours: { 0: ["10:00", "15:00"], 1: ["09:00", "20:00"], 2: ["09:00", "20:00"], 3: ["09:00", "20:00"], 4: ["09:00", "20:00"], 5: ["09:00", "21:00"], 6: ["08:00", "19:00"] },

  services: [
    { id: "cut",   min: 30, price: 8,  name: { sq: "Qethje klasike", en: "Classic cut" }, note: { sq: "Me gërshërë ose makinë, larje dhe stilim.", en: "Scissors or clipper, wash and style." } },
    { id: "fade",  min: 40, price: 10, name: { sq: "Skin fade", en: "Skin fade" }, note: { sq: "Kalim i pastër deri në lëkurë, me brisk në skaje.", en: "Clean blend down to the skin, razor-finished edges." } },
    { id: "beard", min: 20, price: 6,  name: { sq: "Mjekër me peshqir të nxehtë", en: "Hot-towel beard" }, note: { sq: "Formë, konture me brisk dhe vaj.", en: "Shape, razor outline and oil." } },
    { id: "combo", min: 50, price: 13, name: { sq: "Qethje + mjekër", en: "Cut + beard" }, note: { sq: "Më e kërkuara. Gati për fotografi.", en: "Our most booked. Photo-ready." } },
    { id: "shave", min: 35, price: 9,  name: { sq: "Rruajtje tradicionale", en: "Traditional shave" }, note: { sq: "Brisk i drejtë, dy peshqirë, balsam.", en: "Straight razor, two towels, balm." } },
    { id: "kids",  min: 25, price: 6,  name: { sq: "Fëmijë deri 12 vjeç", en: "Kids up to 12" }, note: { sq: "Me durim, pa nxitim.", en: "Patient, never rushed." } },
    { id: "full",  min: 75, price: 20, name: { sq: "Paketa Brisk", en: "The Brisk package" }, note: { sq: "Qethje, mjekër, maskë fytyre dhe vetulla.", en: "Cut, beard, face mask and brows." } }
  ],

  barbers: [
    { id: "arben", name: "Arben", since: 2011, off: [0], tag: { sq: "Themelues. Klasike dhe rruajtje me brisk.", en: "Founder. Classics and straight-razor shaves." }, does: ["cut", "beard", "combo", "shave", "full", "kids"] },
    { id: "leart", name: "Leart", since: 2018, off: [1], tag: { sq: "Fade të pastra dhe stile moderne.", en: "Clean fades and modern styles." }, does: ["cut", "fade", "beard", "combo", "full", "kids"] },
    { id: "dion",  name: "Dion",  since: 2021, off: [3], tag: { sq: "Mjekra, teksturë dhe flokë kaçurrela.", en: "Beards, texture and curly hair." }, does: ["cut", "fade", "beard", "combo", "kids"] }
  ],

  faq: [
    { q: { sq: "A pranoni klientë pa termin?", en: "Do you take walk-ins?" }, a: { sq: "Po, kur ka karrige të lirë. Statusi live më lart ju tregon kush është i lirë tani.", en: "Yes, when a chair is free. The live status above shows who is free right now." } },
    { q: { sq: "Si e anuloj terminin?", en: "How do I cancel?" }, a: { sq: "Na shkruani në WhatsApp me kodin e terminit, të paktën 2 orë para. Pa pagesë.", en: "Message us on WhatsApp with your booking code, at least 2 hours before. No charge." } },
    { q: { sq: "Si paguaj?", en: "How do I pay?" }, a: { sq: "Me para në dorë ose me kartelë në lokal. Nuk paguani asgjë online.", en: "Cash or card at the shop. Nothing is paid online." } },
    { q: { sq: "Sa vonesë pranohet?", en: "What if I'm late?" }, a: { sq: "Mbajmë karrigen 10 minuta. Pas kësaj termini mund të shkurtohet ose të zhvendoset.", en: "We hold the chair for 10 minutes. After that the visit may be shortened or moved." } }
  ]
};
