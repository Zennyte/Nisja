/* Vila Kroni: everything the owner changes lives in this file. Prices in euro. */
(function () {
  window.KRONI = {
    demo: true,                       // true = requests stay in this browser (add ?test to the address to send real emails)
    formEndpoint: "https://formsubmit.co/ajax/41e7fb5e547431c7ebd7349e96f94390",

    // Venue hire for the whole day, by day of week (0 = Sunday), before the season multiplier.
    hire: { 0: 1600, 1: 900, 2: 900, 3: 900, 4: 900, 5: 1600, 6: 2400 },
    seasons: { 1: .6, 2: .6, 3: .6, 4: .8, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: .8, 11: .6, 12: .6 }, // by month
    minNoticeDays: 21,
    holdDays: 7,
    deposit: .2,

    spaces: [
      { id: "garden", sq: "Kopshti i ullinjve", en: "The olive garden", max: 250, months: [5, 6, 7, 8, 9], img: "lawn",
        dsq: "Ceremoni dhe darkë nën qiell, mes vreshtave. Tendë rezervë nëse bie shi.", den: "Ceremony and dinner under the sky, among the vineyards. A spare marquee if it rains." },
      { id: "hall", sq: "Salla e gurit", en: "The stone hall", max: 400, months: null, img: "barn",
        dsq: "Mure guri, tra druri dhe 400 vende. E ngrohtë në dimër, e freskët në gusht.", den: "Stone walls, wooden beams and 400 seats. Warm in winter, cool in August." },
      { id: "terrace", sq: "Terraca e perëndimit", en: "The sunset terrace", max: 120, months: [4, 5, 6, 7, 8, 9, 10], img: "setting",
        dsq: "Për dasma të vogla: 120 veta, me pamje nga lugina në perëndim.", den: "For small weddings: 120 people, looking over the valley at sunset." }
    ],

    menus: [
      { id: "classic", sq: "Klasik", en: "Classic", pp: 28, dsq: "Meze, supë, mish viçi ose pule, tortë.", den: "Starters, soup, beef or chicken, cake." },
      { id: "home", sq: "Shtëpiak", en: "Homestyle", pp: 34, dsq: "Flija, fërgesë, tavë kosi, qengj i pjekur, bakllava.", den: "Flija, fërgesë, baked lamb, bakllava." },
      { id: "chef", sq: "Darka e shefit", en: "Chef's dinner", pp: 45, dsq: "Pesë pjata me verë nga vreshtat e Rahovecit.", den: "Five courses with wine from Rahovec vineyards." }
    ],

    extras: [
      { id: "dj", sq: "DJ dhe zëri", en: "DJ and sound", price: 450 },
      { id: "band", sq: "Orkestër live", en: "Live band", price: 1200 },
      { id: "flowers", sq: "Lule dhe dekor", en: "Flowers and decor", price: 900 },
      { id: "photo", sq: "Kënd fotografish", en: "Photo corner", price: 250 },
      { id: "suite", sq: "Suita e nuses, nata para", en: "Bridal suite, night before", price: 180 }
    ],

    visits: { 0: ["11:00", "16:00"], 6: ["11:00", "16:00"], 1: ["17:00", "19:00"], 2: ["17:00", "19:00"], 3: ["17:00", "19:00"], 4: ["17:00", "19:00"], 5: ["17:00", "19:00"] }
  };
})();
