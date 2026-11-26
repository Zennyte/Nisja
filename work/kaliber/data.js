/* Kalibër Motors: everything the owner changes lives in this file.
   Prices in euro, already with customs and VAT for Kosovo. */
(function () {
  window.KALIBER = {
    demo: true,                       // true = requests stay in this browser (add ?test to the address to send real emails)
    formEndpoint: "https://formsubmit.co/ajax/41e7fb5e547431c7ebd7349e96f94390",

    finance: { apr: 6.9, downMin: 10, downMax: 60, down: 30, termMin: 12, termMax: 84, term: 60 }, // example bank terms
    hours: { 0: null, 1: ["09:00", "19:00"], 2: ["09:00", "19:00"], 3: ["09:00", "19:00"], 4: ["09:00", "19:00"], 5: ["09:00", "19:00"], 6: ["10:00", "16:00"] },
    testDrive: { minutes: 45, step: 60, advisors: ["arben", "lira"], daysAhead: 12 },

    extras: [
      { id: "war12", sq: "Garanci shtesë 12 muaj", en: "Extra 12-month warranty", price: 1450 },
      { id: "ceramic", sq: "Mbrojtje qeramike e bojës", en: "Ceramic paint protection", price: 890 },
      { id: "winter", sq: "Set gomash dimri me rrota", en: "Winter wheel and tyre set", price: 1950 },
      { id: "plates", sq: "Regjistrimi dhe targat", en: "Registration and plates", price: 420 }
    ],

    // body: coupe | sedan | suv | wagon. Power in hp, 0–100 in seconds.
    cars: [
      { id: "911", make: "Porsche", model: "911 Carrera S", gen: "992", year: 2021, km: 28400, fuel: "petrol", gear: "PDK 8", hp: 450, acc: 3.5, body: "coupe", drive: "RWD", color: { sq: "E bardhë Carrara", en: "Carrara White" }, price: 118900, img: "hero-960", owners: 1, service: { sq: "Servis te Porsche, i plotë", en: "Full Porsche dealer history" }, isNew: true },
      { id: "gtr", make: "Mercedes-AMG", model: "GT R", gen: "C190", year: 2019, km: 21300, fuel: "petrol", gear: "DCT 7", hp: 585, acc: 3.6, body: "coupe", drive: "RWD", color: { sq: "Gri Selenite", en: "Selenite Grey" }, price: 139000, img: "gtr", owners: 1, service: { sq: "Servis te Mercedes, i plotë", en: "Full Mercedes dealer history" } },
      { id: "m5", make: "BMW", model: "M5 Competition", gen: "F90", year: 2021, km: 42100, fuel: "petrol", gear: "M Steptronic 8", hp: 625, acc: 3.3, body: "sedan", drive: "AWD", color: { sq: "E bardhë Frozen", en: "Frozen White" }, price: 84900, img: "m5", owners: 2, service: { sq: "Servis te BMW, i plotë", en: "Full BMW dealer history" } },
      { id: "panamera", make: "Porsche", model: "Panamera 4S", gen: "971", year: 2020, km: 61000, fuel: "petrol", gear: "PDK 8", hp: 440, acc: 4.2, body: "sedan", drive: "AWD", color: { sq: "E zezë Jet", en: "Jet Black" }, price: 79500, img: "panamera", owners: 1, service: { sq: "Servis te Porsche, i plotë", en: "Full Porsche dealer history" } },
      { id: "amg", make: "Mercedes-AMG", model: "GT", gen: "C190", year: 2018, km: 39500, fuel: "petrol", gear: "DCT 7", hp: 476, acc: 4.0, body: "coupe", drive: "RWD", color: { sq: "E verdhë Solarbeam", en: "Solarbeam Yellow" }, price: 82000, img: "amg", owners: 2, service: { sq: "Servis te Mercedes", en: "Mercedes dealer history" } },
      { id: "m4", make: "BMW", model: "M4 Competition", gen: "F82", year: 2020, km: 35200, fuel: "petrol", gear: "M DCT 7", hp: 450, acc: 4.0, body: "coupe", drive: "RWD", color: { sq: "Gri Mineral", en: "Mineral Grey" }, price: 62900, img: "m4", owners: 1, service: { sq: "Servis te BMW, i plotë", en: "Full BMW dealer history" } },
      { id: "nissan", make: "Nissan", model: "GT-R Black Edition", gen: "R35", year: 2017, km: 52000, fuel: "petrol", gear: "DCT 6", hp: 570, acc: 2.9, body: "coupe", drive: "AWD", color: { sq: "Argjend Ultimate", en: "Ultimate Silver" }, price: 74900, img: "nissan", owners: 2, service: { sq: "Servis i autorizuar", en: "Authorised service history" } },
      { id: "rs6", make: "Audi", model: "RS6 Avant performance", gen: "C7", year: 2018, km: 96000, fuel: "petrol", gear: "Tiptronic 8", hp: 605, acc: 3.7, body: "wagon", drive: "AWD", color: { sq: "E zezë Mythos", en: "Mythos Black" }, price: 58500, img: "rs6", owners: 2, service: { sq: "Servis te Audi, i plotë", en: "Full Audi dealer history" } },
      { id: "rrs", make: "Range Rover", model: "Sport HSE 3.0 SDV6", gen: "L494", year: 2019, km: 88000, fuel: "diesel", gear: "Automatik 8", hp: 306, acc: 7.2, body: "suv", drive: "AWD", color: { sq: "E zezë Santorini", en: "Santorini Black" }, price: 49800, img: "rrs", owners: 1, service: { sq: "Servis i autorizuar", en: "Authorised service history" } }
    ]
  };
})();
