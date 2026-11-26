/* Ëmbël: everything the owner changes lives in this file. Prices in euro. */
(function () {
  window.EMBEL = {
    demo: true,                       // true = orders stay in this browser (add ?test to the address to send real emails)
    formEndpoint: "https://formsubmit.co/ajax/41e7fb5e547431c7ebd7349e96f94390",

    hours: { 0: ["09:00", "18:00"], 1: null, 2: ["08:00", "20:00"], 3: ["08:00", "20:00"], 4: ["08:00", "20:00"], 5: ["08:00", "20:00"], 6: ["08:00", "20:00"] },
    pickup: { first: "10:00", last: "19:00", step: 60, deliveryFee: 5 },
    capacityPerDay: 8,                // how many cake tiers the kitchen can make per day
    noticeHours: { 1: 48, 2: 72, 3: 72 }, // notice needed by number of tiers

    // Cake builder. "serves" = slices for one tier of that size.
    sizes: [ { cm: 16, serves: 10 }, { cm: 20, serves: 16 }, { cm: 24, serves: 24 } ],
    perSlice: 2.4,
    tierFee: { 1: 0, 2: 15, 3: 35 },
    squareFee: 6,
    sponges: [
      { id: "van", sq: "Vanilje", en: "Vanilla", color: "#F4E2B8", add: 0 },
      { id: "choc", sq: "Çokollatë", en: "Chocolate", color: "#5B3326", add: 0 },
      { id: "red", sq: "Red velvet", en: "Red velvet", color: "#9E2B33", add: 4 },
      { id: "pist", sq: "Fistëk", en: "Pistachio", color: "#B9C98A", add: 8 },
      { id: "car", sq: "Karrotë me arra", en: "Carrot and walnut", color: "#D9984E", add: 4 }
    ],
    fillings: [
      { id: "vcream", sq: "Krem vanilje", en: "Vanilla cream", color: "#FFF4DD", add: 0 },
      { id: "rasp", sq: "Mjedër e freskët", en: "Fresh raspberry", color: "#D8456B", add: 5 },
      { id: "caramel", sq: "Karamel e kripur", en: "Salted caramel", color: "#C98A3D", add: 4 },
      { id: "hazel", sq: "Krem lajthie", en: "Hazelnut cream", color: "#7A4A2E", add: 4 },
      { id: "lemon", sq: "Krem limoni", en: "Lemon curd", color: "#F2D65C", add: 3 }
    ],
    frostings: [
      { id: "white", sq: "E bardhë", en: "White", color: "#FFF9F3" },
      { id: "pink", sq: "Rozë", en: "Pink", color: "#F6B9C8" },
      { id: "pist", sq: "Fistëk", en: "Pistachio", color: "#C9DBA8" },
      { id: "choc", sq: "Çokollatë", en: "Chocolate", color: "#6B3B2A" },
      { id: "blue", sq: "Blu pastel", en: "Pastel blue", color: "#BFD6EA" },
      { id: "lav", sq: "Livando", en: "Lavender", color: "#D3C4EC" }
    ],
    decorations: [
      { id: "berries", sq: "Fruta pylli", en: "Forest berries", add: 8 },
      { id: "flowers", sq: "Lule të freskëta", en: "Fresh flowers", add: 12 },
      { id: "macarons", sq: "Makarona", en: "Macarons", add: 10 },
      { id: "drip", sq: "Rrjedhje çokollate", en: "Chocolate drip", add: 6 },
      { id: "sprinkles", sq: "Spërkatje", en: "Sprinkles", add: 3 }
    ],

    // Today's counter. "made" = pieces baked this morning; the page counts down during the day for the demo.
    counter: [
      { id: "croissant", sq: "Kroasant me fistëk", en: "Pistachio croissant", price: 2.2, made: 30, img: "croissant", tags: ["g", "l", "n"] },
      { id: "tiramisu", sq: "Tiramisu në gotë", en: "Tiramisu cup", price: 3.5, made: 18, img: "tiramisu", tags: ["g", "l", "e"] },
      { id: "macarons", sq: "Makarona, kuti me 6", en: "Macarons, box of 6", price: 6, made: 14, img: "macaron", tags: ["l", "n", "e"] },
      { id: "pannacotta", sq: "Panna cotta me luleshtrydhe", en: "Strawberry panna cotta", price: 3, made: 16, img: "jars", tags: ["l"] },
      { id: "brownie", sq: "Brownie me çokollatë të zezë", en: "Dark chocolate brownie", price: 2.5, made: 24, img: "brownie", tags: ["g", "l", "e"] },
      { id: "oreo", sq: "Torta e ditës: Oreo, copë", en: "Cake of the day: Oreo, slice", price: 3.2, made: 12, img: "oreo", tags: ["g", "l", "e"] }
    ]
  };
})();
