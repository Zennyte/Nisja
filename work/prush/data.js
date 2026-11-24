/* Prush Grill & Bar: everything the owner changes lives in this file (menu, prices, tables, hours). */
(function () {
  window.PRUSH = {
    demo: true,                       // true = bookings are only saved in this browser; add ?test to the address to send real emails
    formEndpoint: "https://formsubmit.co/ajax/41e7fb5e547431c7ebd7349e96f94390",
    whatsapp: "",                     // owner's WhatsApp, digits only, e.g. "38344123456"

    // 0 = Sunday … 6 = Saturday. null = closed.
    hours: { 0: ["12:00", "23:00"], 1: null, 2: ["12:00", "23:00"], 3: ["12:00", "23:00"], 4: ["12:00", "23:00"], 5: ["12:00", "24:00"], 6: ["12:00", "24:00"] },
    firstSlot: "12:00", lastSlot: "21:30", slotMinutes: 30,
    lunchUntil: "16:00",              // slots before this are shown under "Dreka"
    minNoticeMinutes: 60,             // no online bookings closer than this
    daysAhead: 21,
    maxParty: 8,                      // bigger groups are asked to call
    holdMinutes: 15,                  // how long a table is held for late guests
    tables: [ { seats: 2, count: 6 }, { seats: 4, count: 7 }, { seats: 6, count: 2 }, { seats: 8, count: 1 } ],
    // which table sizes a party can use
    fit: { 1: [2, 4], 2: [2, 4], 3: [4, 6], 4: [4, 6], 5: [6, 8], 6: [6, 8], 7: [8], 8: [8] },
    stayMinutes: function (party) { return party <= 4 ? 120 : 150; },

    menu: [
      { id: "start", sq: "Fillimi", en: "To start", img: "img/burrata.jpg", items: [
        { sq: "Burrata me domate të pjekura", en: "Burrata with ember-roasted tomatoes", dsq: "Domate qershi të pjekura në prush, vaj borziloku, bukë e thekur.", den: "Cherry tomatoes roasted on the embers, basil oil, toasted bread.", price: 7.5, veg: true, img: "img/burrata.jpg" },
        { sq: "Oktapod në prush", en: "Grilled octopus", dsq: "Patate të shtypura, paprikë e tymosur, limon.", den: "Crushed potatoes, smoked paprika, lemon.", price: 12, img: "img/octopus.jpg" },
        { sq: "Speca të pjekur me djathë të bardhë", en: "Roasted peppers with white cheese", dsq: "Speca të kuq nga prushi, djathë i bardhë, hudhër, majdanoz.", den: "Red peppers from the embers, white cheese, garlic, parsley.", price: 5, veg: true },
        { sq: "Sallatë me rukolë dhe dardhë", en: "Rocket and pear salad", dsq: "Parmixhan, arra të karamelizuara, salcë mjalti.", den: "Parmesan, caramelised walnuts, honey dressing.", price: 6, veg: true }
      ] },
      { id: "fire", sq: "Nga prushi", en: "From the embers", img: "img/steak.jpg", items: [
        { sq: "Ribeye 300 g", en: "Ribeye 300 g", dsq: "Mish viçi i maturuar, kripë deti, chimichurri.", den: "Aged beef, sea salt, chimichurri.", price: 22, img: "img/steak.jpg" },
        { sq: "Tagliata viçi", en: "Beef tagliata", dsq: "Filetë e prerë hollë, rukolë, parmixhan, balsamik.", den: "Thinly sliced fillet, rocket, parmesan, balsamic.", price: 16 },
        { sq: "Bërxolla qengji", en: "Lamb chops", dsq: "Rozmarinë, hudhër, kos me nenexhik.", den: "Rosemary, garlic, mint yoghurt.", price: 15, img: "img/lamb.jpg" },
        { sq: "Qebapa të shtëpisë", en: "House qebapa", dsq: "10 copë, ajvar, qepë, bukë e pjekur në prush.", den: "10 pieces, ajvar, onion, flatbread from the embers.", price: 6 },
        { sq: "Smash burger Prush", en: "Prush smash burger", dsq: "Dy copa mishi, çedar i maturuar, salca e shtëpisë, patate.", den: "Double patty, aged cheddar, house sauce, fries.", price: 8, img: "img/burger.jpg" }
      ] },
      { id: "fish", sq: "Peshk", en: "Fish", img: "img/seabass.jpg", items: [
        { sq: "Levrek në prush", en: "Sea bass on the embers", dsq: "Gjalpë me limon, zarzavate të freskëta.", den: "Lemon butter, fresh greens.", price: 14, img: "img/seabass.jpg" },
        { sq: "Karkaleca me hudhër", en: "Garlic prawns", dsq: "Djegës, verë e bardhë, bukë e thekur.", den: "Chilli, white wine, toasted bread.", price: 11 }
      ] },
      { id: "pasta", sq: "Pasta", en: "Pasta", img: "img/pasta.jpg", items: [
        { sq: "Tagliatelle me tartuf", en: "Truffle tagliatelle", dsq: "Krem tartufi, parmixhan, piper i zi.", den: "Truffle cream, parmesan, black pepper.", price: 10, veg: true, img: "img/pasta.jpg" },
        { sq: "Rigatoni me ragù viçi", en: "Rigatoni with beef ragù", dsq: "Ragù i gatuar ngadalë për 6 orë.", den: "Ragù slow-cooked for 6 hours.", price: 9 }
      ] },
      { id: "sweet", sq: "Ëmbëlsira", en: "Desserts", img: "img/fondant.jpg", items: [
        { sq: "Fondant çokollate", en: "Chocolate fondant", dsq: "Çokollatë e zezë e ngrohtë, akullore vanilje.", den: "Warm dark chocolate, vanilla ice cream.", price: 4.5, veg: true, img: "img/fondant.jpg" },
        { sq: "Tiramisu", en: "Tiramisu", dsq: "Mascarpone, kafe espresso, kakao.", den: "Mascarpone, espresso, cocoa.", price: 4, veg: true },
        { sq: "Panna cotta me fiq", en: "Panna cotta with figs", dsq: "Fiq të karamelizuar, mjaltë.", den: "Caramelised figs, honey.", price: 4, veg: true }
      ] },
      { id: "bar", sq: "Koktej", en: "Cocktails", img: "img/signature.jpg", items: [
        { sq: "Prush Old Fashioned", en: "Prush Old Fashioned", dsq: "Burbon i tymosur, mjaltë, portokall. Koktej i shtëpisë.", den: "Smoked bourbon, honey, orange. Our house cocktail.", price: 8, img: "img/signature.jpg" },
        { sq: "Negroni", en: "Negroni", dsq: "Xhin, Campari, vermut i kuq.", den: "Gin, Campari, red vermouth.", price: 7, img: "img/negroni.jpg" },
        { sq: "Espresso Martini", en: "Espresso Martini", dsq: "Vodka, espresso, liker kafeje.", den: "Vodka, espresso, coffee liqueur.", price: 7, img: "img/espresso.jpg" },
        { sq: "Limonadë me borzilok", en: "Basil lemonade", dsq: "Pa alkool. Limon, borzilok, sodë.", den: "Alcohol-free. Lemon, basil, soda.", price: 3.5, veg: true }
      ] }
    ],

    // Demo only: fills the busy evenings so "almost full" and "full" slots are visible.
    demoBookings: function () {
      var out = [], seed = 7, rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      var load = { 0: .55, 2: .35, 3: .4, 4: .55, 5: .9, 6: .95 };
      for (var d = 0; d < 21; d++) {
        var day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() + d);
        var w = day.getDay(); if (!(w in load)) continue;
        this.tables.forEach(function (t) {
          for (var i = 0; i < t.count; i++) {
            var early = false;
            [[13, 0], [19, 0], [21, 0]].forEach(function (hm, k) {
              var p = load[w] * (k === 0 ? .5 : 1);
              if (k === 2 && early) return;
              if (rnd() < p) { var s = new Date(day); s.setHours(hm[0], hm[1]); out.push({ seats: t.seats, start: s.getTime(), mins: 120 }); if (k === 1) early = true; }
            });
          }
        });
      }
      return out;
    }
  };
})();
