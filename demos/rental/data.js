/* Udha Rent a Car: everything the owner changes lives in this file.
   Prices are per day in euro. Change a number, save, and the website updates. */
(function () {
  // Demo only: makes a few cars "taken" around today so the date check is visible.
  // A real business replaces these with real bookings, e.g. { car: "golf", from: "2027-07-01T10:00", to: "2027-07-08T10:00" }.
  function day(offset, hour) {
    var d = new Date(); d.setHours(hour || 10, 0, 0, 0); d.setDate(d.getDate() + offset);
    var p = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":00";
  }

  window.UDHA = {
    demo: true,                       // true = bookings are only saved in this browser, nothing is sent
    formEndpoint: "https://formsubmit.co/ajax/YOUR-FORMSUBMIT-CODE", // where booking requests are emailed
    whatsapp: "",                     // owner's WhatsApp number, digits only, e.g. "38349123456"

    // Seasons by month-day. Days that match none are "low" season.
    seasons: [
      { id: "high", from: "07-01", to: "08-31" },
      { id: "high", from: "12-20", to: "01-07" },
      { id: "mid", from: "04-01", to: "06-30" },
      { id: "mid", from: "09-01", to: "10-31" }
    ],
    lengthDiscounts: [ { min: 14, pct: 25 }, { min: 7, pct: 15 }, { min: 3, pct: 7 } ],
    graceHours: 2,                    // late return allowed before an extra day is counted
    bufferHours: 2,                   // time to clean the car between two rentals

    locations: [
      { id: "office", sq: "Zyra jonë në Gjakovë", en: "Our office in Gjakovë", fee: 0 },
      { id: "address", sq: "Në adresën tuaj në Gjakovë", en: "Your address in Gjakovë", fee: 0 },
      { id: "prn", sq: "Aeroporti i Prishtinës", en: "Prishtina Airport", fee: 30, airport: true }
    ],

    fullCoverPerDay: 9,               // deposit and excess become €0
    childSeatPerDay: 3, childSeatMax: 30,
    crossBorder: 25,                  // Albania, North Macedonia, Montenegro, green card included
    youngDriverPerDay: 5,             // drivers aged 21–24

    cars: [
      { id: "polo", name: "VW Polo", cls: "economy", body: "hatch", gear: "manual", fuel: "petrol", seats: 5, bags: 2, rates: { low: 24, mid: 30, high: 42 }, deposit: 200, color: "#C9D6CF" },
      { id: "yaris", name: "Toyota Yaris Hybrid", cls: "economy", body: "hatch", gear: "auto", fuel: "hybrid", seats: 5, bags: 2, rates: { low: 29, mid: 36, high: 49 }, deposit: 200, color: "#E7D9C0" },
      { id: "golf", name: "VW Golf 8", cls: "compact", body: "hatch", gear: "manual", fuel: "diesel", seats: 5, bags: 3, rates: { low: 32, mid: 40, high: 55 }, deposit: 300, color: "#BFCAD6" },
      { id: "octavia", name: "Škoda Octavia Combi", cls: "estate", body: "wagon", gear: "auto", fuel: "diesel", seats: 5, bags: 5, rates: { low: 39, mid: 48, high: 66 }, deposit: 300, color: "#D5CFC6" },
      { id: "duster", name: "Dacia Duster 4x4", cls: "suv", body: "suv", gear: "manual", fuel: "diesel", seats: 5, bags: 3, rates: { low: 36, mid: 45, high: 60 }, deposit: 300, color: "#D9C9B0" },
      { id: "touran", name: "VW Touran", cls: "seven", body: "mpv", gear: "auto", fuel: "diesel", seats: 7, bags: 3, rates: { low: 52, mid: 64, high: 86 }, deposit: 400, color: "#C6D2CC" },
      { id: "vito", name: "Mercedes Vito Tourer", cls: "van", body: "van", gear: "auto", fuel: "diesel", seats: 9, bags: 6, rates: { low: 75, mid: 92, high: 125 }, deposit: 500, color: "#CFD3D6" }
    ],

    bookings: [
      { car: "golf", from: day(0, 9), to: day(6, 18) },
      { car: "touran", from: day(1, 8), to: day(5, 20) },
      { car: "yaris", from: day(6, 10), to: day(9, 10) },
      { car: "octavia", from: day(12, 10), to: day(20, 10) }
    ]
  };
})();
