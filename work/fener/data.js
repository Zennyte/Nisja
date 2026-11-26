/* Fener: everything the owner changes lives in this file.
   Prices in euro. Change a line, save, and the website updates. */
(function () {
  window.FENER = {
    demo: true,                       // true = bookings stay in this browser, nothing is sent (add ?test to the address to send real emails)
    formEndpoint: "https://formsubmit.co/ajax/41e7fb5e547431c7ebd7349e96f94390",

    // Opening hours by weekday (0 = Sunday). "close" can pass midnight.
    hours: { 0: ["17:00", "24:00"], 1: ["17:00", "01:00"], 2: ["17:00", "01:00"], 3: ["17:00", "01:00"], 4: ["17:00", "01:00"], 5: ["17:00", "02:00"], 6: ["17:00", "02:00"] },
    kitchenUntil: "23:00",
    goldenHour: ["17:00", "19:00"],   // "Ora e artë": classics for €5
    booking: { first: "17:00", last: "23:00", step: 30, minutes: 120, bigGroupMinutes: 150, maxOnline: 8, daysAhead: 21 },
    terraceOpen: [4, 10],             // months the terrace is open, April (4) to October (10)

    // Tables on the floor plan. x/y/w/h are in the plan's 640×400 grid.
    tables: [
      { id: "B1", zone: "bar", min: 1, max: 2, x: 120, y: 40, w: 60, h: 34, shape: "bar" },
      { id: "B2", zone: "bar", min: 1, max: 2, x: 196, y: 40, w: 60, h: 34, shape: "bar" },
      { id: "B3", zone: "bar", min: 1, max: 2, x: 272, y: 40, w: 60, h: 34, shape: "bar" },
      { id: "B4", zone: "bar", min: 1, max: 2, x: 348, y: 40, w: 60, h: 34, shape: "bar" },
      { id: "K1", zone: "booth", min: 3, max: 6, x: 30, y: 120, w: 110, h: 74, shape: "booth" },
      { id: "K2", zone: "booth", min: 3, max: 6, x: 30, y: 214, w: 110, h: 74, shape: "booth" },
      { id: "K3", zone: "booth", min: 4, max: 8, x: 30, y: 308, w: 150, h: 70, shape: "booth" },
      { id: "T1", zone: "room", min: 1, max: 2, x: 200, y: 130, w: 50, h: 50, shape: "round" },
      { id: "T2", zone: "room", min: 1, max: 2, x: 280, y: 130, w: 50, h: 50, shape: "round" },
      { id: "T3", zone: "room", min: 2, max: 4, x: 200, y: 222, w: 70, h: 60, shape: "rect" },
      { id: "T4", zone: "room", min: 2, max: 4, x: 300, y: 222, w: 70, h: 60, shape: "rect" },
      { id: "T5", zone: "room", min: 2, max: 4, x: 230, y: 318, w: 70, h: 56, shape: "rect" },
      { id: "T6", zone: "room", min: 1, max: 2, x: 360, y: 130, w: 50, h: 50, shape: "round" },
      { id: "V1", zone: "terrace", min: 2, max: 4, x: 470, y: 120, w: 70, h: 60, shape: "rect" },
      { id: "V2", zone: "terrace", min: 2, max: 4, x: 470, y: 212, w: 70, h: 60, shape: "rect" },
      { id: "V3", zone: "terrace", min: 4, max: 6, x: 470, y: 304, w: 140, h: 66, shape: "rect" },
      { id: "V4", zone: "terrace", min: 2, max: 4, x: 560, y: 120, w: 60, h: 60, shape: "round" }
    ],

    // Cocktails. Taste scores 0–10: sweet, sour, strong, bitter, fruit. "zero" = no alcohol.
    drinks: [
      { id: "fener", sq: "Fener", en: "Fener", price: 7, img: "smoke", color: "#D9902F", t: [5, 5, 6, 2, 3],
        dsq: "Raki rrushi e vjetër, mjaltë malesh, limon, gjethe dafine.", den: "Aged grape raki, mountain honey, lemon, bay leaf." },
      { id: "qershia", sq: "Qershia e Prizrenit", en: "Prizren Cherry", price: 8, img: "ice", color: "#8E2A1F", t: [4, 1, 9, 5, 4],
        dsq: "Burbon, liker qershie, vermut i kuq, angostura.", den: "Bourbon, cherry liqueur, red vermouth, Angostura." },
      { id: "shkendija", sq: "Shkëndija", en: "Spark", price: 7, img: "rosemary", color: "#F08A4B", t: [4, 7, 5, 2, 7],
        dsq: "Tekila, grejpfrut rozë, lime, sodë, kripë deti.", den: "Tequila, pink grapefruit, lime, soda, sea salt." },
      { id: "bjeshka", sq: "Bjeshka e Zezë", en: "Black Mountain", price: 7.5, img: "berry", color: "#4B1F3A", t: [5, 6, 6, 3, 8],
        dsq: "Xhin, manaferra, limon, shurup trëndafili të egër.", den: "Gin, blackberry, lemon, wild rose syrup." },
      { id: "kopshti", sq: "Kopshti", en: "The Garden", price: 6.5, img: "lime", color: "#B5D27A", t: [3, 6, 3, 1, 5],
        dsq: "Vodka, kastravec, mente, lime, sodë.", den: "Vodka, cucumber, mint, lime, soda." },
      { id: "aperitivo", sq: "Aperitivo i Hënës", en: "Moon Aperitivo", price: 6.5, img: "spritz", color: "#E8562A", t: [4, 3, 3, 7, 5],
        dsq: "Bitter italian, prosecco, portokall, sodë.", den: "Italian bitter, prosecco, orange, soda." },
      { id: "mjedra", sq: "Mjedra", en: "Raspberry", price: 6.5, img: "rasp", color: "#C2264B", t: [7, 5, 4, 1, 9],
        dsq: "Rum i bardhë, mjedër, lime, mente.", den: "White rum, raspberry, lime, mint." },
      { id: "nata", sq: "Kafe e Natës", en: "Night Coffee", price: 7, img: "", color: "#3A2418", t: [6, 1, 6, 6, 1],
        dsq: "Vodka, espresso i freskët, liker kafeje, vanilje.", den: "Vodka, fresh espresso, coffee liqueur, vanilla." },
      { id: "rugova", sq: "Rugova", en: "Rugova", price: 7.5, img: "", color: "#D7D9B0", t: [3, 7, 6, 2, 2],
        dsq: "Xhin, shurup bredhi, limon, e bardhë veze.", den: "Gin, pine syrup, lemon, egg white." },
      { id: "mali0", sq: "Çaj Mali 0%", en: "Mountain Tea 0%", price: 4.5, img: "", color: "#C99A4A", t: [5, 5, 0, 2, 3], zero: true,
        dsq: "Çaj mali i ftohtë, mjaltë, limon, sodë.", den: "Iced mountain tea, honey, lemon, soda." },
      { id: "shega0", sq: "Shega 0%", en: "Pomegranate 0%", price: 4.5, img: "", color: "#A3203A", t: [6, 6, 0, 1, 8], zero: true,
        dsq: "Shegë, xhenxhefil, lime, sodë.", den: "Pomegranate, ginger, lime, soda." }
    ],

    // Kitchen. Tags: v = vegetarian, g = gluten, l = milk, n = nuts
    food: [
      { sq: "Speca të pjekur me gjizë dhe vaj ulliri", en: "Roasted peppers, whipped curd, olive oil", price: 5, tags: ["v", "l"] },
      { sq: "Flija e vogël, mjaltë dhe djathë dhie", en: "Small flija, honey and goat cheese", price: 6, tags: ["v", "g", "l"] },
      { sq: "Qofte qengji, kos me hudhër", en: "Lamb köfte, garlic yoghurt", price: 7.5, tags: ["l"] },
      { sq: "Patate me trufë dhe parmixhano", en: "Truffle fries, parmesan", price: 4.5, tags: ["v", "l"] },
      { sq: "Pastërma e tymosur, turshi shtëpie", en: "Smoked pastrami, house pickles", price: 8, tags: [] },
      { sq: "Biftek i pjekur në thëngjill, salcë piperi", en: "Charcoal steak, pepper sauce", price: 16, tags: ["l"] },
      { sq: "Bukë misri, ajvar dhe djathë i bardhë", en: "Cornbread, ajvar and white cheese", price: 4, tags: ["v", "g", "l"] },
      { sq: "Trileçe me karamel të djegur", en: "Trileçe with burnt caramel", price: 4, tags: ["v", "g", "l"] },
      { sq: "Arra të karamelizuara me kripë deti", en: "Salted caramel walnuts", price: 3, tags: ["v", "n"] }
    ],

    // Weekly nights. day: 0 = Sunday … 6 = Saturday
    nights: [
      { day: 4, time: "21:00", sq: "Jazz live", en: "Live jazz", nsq: "Trio akustike, pa biletë.", nen: "Acoustic trio, no ticket." },
      { day: 5, time: "20:00", sq: "Bartender i ftuar", en: "Guest bartender", nsq: "Një meny e shkurtër nga një bar tjetër.", nen: "A short menu from another bar." },
      { day: 6, time: "22:00", sq: "Vinyl me DJ", en: "Vinyl DJ set", nsq: "Funk, soul dhe disco nga pllakat.", nen: "Funk, soul and disco on records." },
      { day: 0, time: "17:00", sq: "Klasikët për €5", en: "€5 classics", nsq: "Negroni, Old Fashioned dhe Daiquiri deri në 20:00.", nen: "Negroni, Old Fashioned and Daiquiri until 20:00." }
    ]
  };
})();
