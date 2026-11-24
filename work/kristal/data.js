/* Kristal Dental: everything the owner may want to change lives here.
   Prices in euro, durations in minutes. Day numbers: 0 = Sunday … 6 = Saturday. */
window.SITE = {
  demo: true,
  endpoint: "https://formsubmit.co/ajax/41e7fb5e547431c7ebd7349e96f94390",
  whatsapp: "",
  phone: "+383 44 000 111",
  emergency: "+383 44 000 112",
  address: "Rr. Mbretëresha Teutë 31, Pejë",
  maps: "https://maps.google.com/?q=Pej%C3%AB",
  step: 15, noticeMin: 60, daysAhead: 21,
  hours: { 0: null, 1: ["08:30", "18:00"], 2: ["08:30", "18:00"], 3: ["08:30", "18:00"], 4: ["08:30", "18:00"], 5: ["08:30", "17:00"], 6: ["09:00", "14:00"] },
  emergencyTimes: ["12:00", "16:30"], // held free every working day for same-day emergencies; normal bookings cannot take them
  recallMonths: 6,

  /* visit types the finder can land on */
  visits: {
    check:   { min: 30, from: 15, to: 15, name: { sq: "Kontroll i përgjithshëm", en: "General check-up" }, what: { sq: "Kontroll i plotë, fotografi digjitale me rreze X nëse duhet, dhe plan i qartë me çmime para se të vendosni.", en: "Full check, digital X-ray if needed, and a clear priced plan before you decide anything." }, by: ["drita", "arber"] },
    clean:   { min: 45, from: 25, to: 35, name: { sq: "Pastrim profesional", en: "Professional cleaning" }, what: { sq: "Heqje e gurëzave me ultratinguj, polirim dhe këshilla për furçën dhe fillin.", en: "Ultrasonic scaling, polishing and tips on brushing and flossing." }, by: ["lule"] },
    pain:    { min: 45, from: 20, to: 60, name: { sq: "Vizitë për dhimbje", en: "Toothache visit" }, what: { sq: "Gjejmë shkakun me rreze X, qetësojmë dhimbjen në të njëjtën vizitë dhe ju tregojmë opsionet.", en: "We find the cause with an X-ray, relieve the pain in the same visit and explain your options." }, by: ["drita", "arber"] },
    filling: { min: 45, from: 30, to: 50, name: { sq: "Mbushje estetike", en: "Tooth-coloured filling" }, what: { sq: "Kompozit në ngjyrën e dhëmbit, me anestezi lokale. Zakonisht përfundon në një vizitë.", en: "Composite in your tooth's shade, with local anaesthetic. Usually done in one visit." }, by: ["drita", "arber"] },
    white:   { min: 75, from: 150, to: 200, name: { sq: "Zbardhim në klinikë", en: "In-clinic whitening" }, what: { sq: "Pastrim i shkurtër, pastaj zbardhim me dritë. 2–4 nuanca më e bardhë në një seancë.", en: "A short clean, then light-activated whitening. 2–4 shades whiter in one session." }, by: ["lule", "drita"] },
    implant: { min: 45, from: 0, to: 0, consult: true, name: { sq: "Konsultë për implant", en: "Implant consultation" }, what: { sq: "Skanim 3D, plan trajtimi dhe çmim i saktë me shkrim. Implanti vetë nga €550.", en: "3D scan, treatment plan and a written exact price. Implants themselves from €550." }, by: ["arber"] },
    ortho:   { min: 45, from: 0, to: 0, consult: true, name: { sq: "Konsultë për aparat", en: "Braces consultation" }, what: { sq: "Fotografi, matje dhe krahasim mes aparatit klasik dhe shiritave të padukshëm.", en: "Photos, measurements and a comparison of classic braces and clear aligners." }, by: ["drita"] },
    kids:    { min: 30, from: 15, to: 15, name: { sq: "Vizitë për fëmijë", en: "Child's visit" }, what: { sq: "Pa nxitim, me shpjegime për fëmijën. Kontroll, fluor dhe këshilla për prindërit.", en: "Unhurried, explained to your child. Check, fluoride and tips for parents." }, by: ["drita", "lule"] }
  },

  /* the finder: first question → either a visit, or a second question */
  finder: [
    { id: "pain", label: { sq: "Kam dhimbje", en: "I'm in pain" }, ask: { q: { sq: "Si është dhimbja?", en: "How bad is the pain?" }, opts: [
      { label: { sq: "E lehtë, vjen e shkon", en: "Mild, comes and goes" }, go: "pain" },
      { label: { sq: "E fortë, s'më lë të fle", en: "Strong, keeps me awake" }, go: "pain", urgent: true },
      { label: { sq: "Ka ënjtje ose temperaturë", en: "There's swelling or fever" }, go: "pain", urgent: true, call: true } ] } },
    { id: "check", label: { sq: "Kontroll ose pastrim", en: "Check-up or cleaning" }, ask: { q: { sq: "Kur ishit për herë të fundit?", en: "When was your last visit?" }, opts: [
      { label: { sq: "Brenda vitit", en: "Within a year" }, go: "clean" },
      { label: { sq: "Më shumë se një vit", en: "Over a year ago" }, go: "check" },
      { label: { sq: "Nuk e mbaj mend", en: "I can't remember" }, go: "check" } ] } },
    { id: "broken", label: { sq: "Dhëmb i thyer ose karies", en: "Broken tooth or cavity" }, go: "filling" },
    { id: "white", label: { sq: "Dua dhëmbë më të bardhë", en: "I want whiter teeth" }, go: "white" },
    { id: "missing", label: { sq: "Më mungon një dhëmb", en: "I'm missing a tooth" }, go: "implant" },
    { id: "ortho", label: { sq: "Dhëmbë të shtrembër", en: "Crooked teeth" }, go: "ortho" },
    { id: "kids", label: { sq: "Për fëmijën tim", en: "For my child" }, go: "kids" }
  ],

  doctors: [
    { id: "drita", name: "Dr. Drita K.", role: { sq: "Stomatologe e përgjithshme dhe ortodonci", en: "General dentistry and orthodontics" }, off: [6] },
    { id: "arber", name: "Dr. Arbër M.", role: { sq: "Kirurgji orale dhe implante", en: "Oral surgery and implants" }, off: [3] },
    { id: "lule",  name: "Lule H.",      role: { sq: "Higjieniste dentare", en: "Dental hygienist" }, off: [1] }
  ],

  prices: [
    { n: { sq: "Kontroll dhe plan trajtimi", en: "Check-up and treatment plan" }, p: "€15" },
    { n: { sq: "Rreze X digjitale (një dhëmb)", en: "Digital X-ray (one tooth)" }, p: "€5" },
    { n: { sq: "Ortopan (gjithë goja)", en: "Panoramic X-ray" }, p: "€15" },
    { n: { sq: "Pastrim profesional", en: "Professional cleaning" }, p: "€25–35" },
    { n: { sq: "Mbushje kompozit", en: "Composite filling" }, p: "€30–50" },
    { n: { sq: "Mjekim kanali (për kanal)", en: "Root canal (per canal)" }, p: "€40–60" },
    { n: { sq: "Nxjerrje dhëmbi", en: "Extraction" }, p: "€20–50" },
    { n: { sq: "Kurorë zirkoni", en: "Zirconia crown" }, p: "€180–220" },
    { n: { sq: "Implant me kurorë", en: "Implant with crown" }, p: { sq: "nga €550", en: "from €550" } },
    { n: { sq: "Zbardhim në klinikë", en: "In-clinic whitening" }, p: "€150–200" }
  ],

  faq: [
    { q: { sq: "Kam frikë nga dentisti. Çfarë bëni ndryshe?", en: "I'm scared of the dentist. What do you do differently?" }, a: { sq: "Ju shpjegojmë çdo hap para se ta bëjmë, ndalemi kur ngrini dorën dhe përdorim anestezi me gjilpërë të hollë. Vizita e parë është vetëm bisedë dhe kontroll.", en: "We explain each step before doing it, stop when you raise your hand and use fine-needle anaesthetic. The first visit is just a talk and a check." } },
    { q: { sq: "Vij nga diaspora për pak ditë. A mund ta planifikoj trajtimin para?", en: "I'm visiting from abroad for a few days. Can I plan treatment in advance?" }, a: { sq: "Po. Na dërgoni në WhatsApp një rreze X ose foto, ju kthejmë plan dhe çmim brenda 48 orëve dhe i rendisim vizitat sipas ditëve që jeni këtu.", en: "Yes. Send an X-ray or photo on WhatsApp, we reply with a plan and price within 48 hours and schedule the visits around the days you're here." } },
    { q: { sq: "A mund të paguaj me këste?", en: "Can I pay in instalments?" }, a: { sq: "Për trajtime mbi €300 ofrojmë pagesë në 3–6 këste pa kamatë.", en: "For treatments over €300 we offer 3–6 interest-free instalments." } },
    { q: { sq: "Si i sterilizoni instrumentet?", en: "How do you sterilise instruments?" }, a: { sq: "Çdo instrument paketohet dhe sterilizohet në autoklavë klasi B. Paketimin e hapim para jush.", en: "Every instrument is packed and sterilised in a class B autoclave. We open the pack in front of you." } }
  ]
};
