/* Lisi: everything the owner changes lives in this file. Prices in euro, sizes in centimetres. */
(function () {
  window.LISI = {
    demo: true,                       // true = requests stay in this browser (add ?test to the address to send real emails)
    formEndpoint: "https://formsubmit.co/ajax/41e7fb5e547431c7ebd7349e96f94390",

    delivery: [
      { id: "peje", sq: "Pejë dhe rrethina", en: "Pejë and around", fee: 0 },
      { id: "kosove", sq: "Kudo në Kosovë", en: "Anywhere in Kosovo", fee: 40 },
      { id: "pick", sq: "E marr vetë në punëtori", en: "I'll collect at the workshop", fee: 0 }
    ],
    assemblyPerItem: 25,

    // Materials shared by products. "k" multiplies the base price.
    woods: [
      { id: "oak", sq: "Lis", en: "Oak", k: 1, color: "#C49A6C", grain: "#A97C50" },
      { id: "walnut", sq: "Arrë", en: "Walnut", k: 1.18, color: "#6B4A33", grain: "#523623" },
      { id: "ash", sq: "Frasër", en: "Ash", k: .92, color: "#E2CFAE", grain: "#CDB58F" },
      { id: "black", sq: "Lis i nxirë", en: "Blackened oak", k: 1.08, color: "#2C2925", grain: "#1C1A17" }
    ],
    fabrics: [
      { id: "cognac", sq: "Lëkurë konjak", en: "Cognac leather", k: 1.25, color: "#9A5B32", img: "sofa" },
      { id: "moss", sq: "Kadife myshk", en: "Moss velvet", k: 1.1, color: "#2F5446", img: "velvet" },
      { id: "linen", sq: "Li natyral", en: "Natural linen", k: 1, color: "#D8CFBF" },
      { id: "stone", sq: "Bouclé guri", en: "Stone bouclé", k: 1.05, color: "#B9B4AA" },
      { id: "mustard", sq: "Stof mustardë", en: "Mustard weave", k: 1, color: "#C9962E", img: "armchair" }
    ],

    // w = width, d = depth (for the room planner). sizes: options that change width and price.
    products: [
      { id: "drini", sq: "Divani Drini", en: "Drini sofa", type: "sofa", img: "sofa", base: 1290, mat: "fabric", fabrics: ["cognac", "moss", "linen", "stone"], weeks: 5,
        sizes: [ { w: 200, d: 95, add: 0 }, { w: 230, d: 95, add: 180 }, { w: 260, d: 95, add: 340 } ],
        dsq: "Tre ulëse, sustë xhepi dhe gomë me densitet të lartë. Këmbët prej lisi.", den: "Three seats, pocket springs and high-density foam. Oak legs." },
      { id: "era", sq: "Kolltuku Era", en: "Era armchair", type: "chair", img: "armchair", base: 420, mat: "fabric", fabrics: ["mustard", "moss", "linen", "stone"], weeks: 4,
        sizes: [ { w: 78, d: 82, add: 0 } ],
        dsq: "Mbështetëse e lartë, krahë të ngushtë, i rehatshëm për lexim.", den: "High back, slim arms, made for reading." },
      { id: "lisi", sq: "Tryeza Lisi, me masë", en: "Lisi table, made to size", type: "table", img: "dining", base: 780, mat: "wood", woods: ["oak", "walnut", "ash", "black"], weeks: 6,
        custom: { min: 160, max: 260, step: 10, d: 90, perCm: 6.5 },
        dsq: "Pllakë masive 4 cm, vaj natyral. Zgjidhni gjatësinë me centimetër.", den: "Solid 4 cm top, natural oil finish. Choose the length to the centimetre." },
      { id: "bjeshka", sq: "Karrigia Bjeshka", en: "Bjeshka chair", type: "seat", img: "chair", base: 145, mat: "wood", woods: ["oak", "walnut", "ash", "black"], weeks: 4,
        sizes: [ { w: 50, d: 54, add: 0, n: 1 } ], qty: true,
        dsq: "Ulëse e veshur, këmbë prej druri të përkulura me dorë.", den: "Upholstered seat, hand-bent wooden legs." },
      { id: "studio", sq: "Tavolina Studio", en: "Studio desk", type: "desk", img: "desk", base: 540, mat: "wood", woods: ["oak", "walnut", "ash"], weeks: 4,
        sizes: [ { w: 140, d: 70, add: 0 }, { w: 160, d: 75, add: 90 } ],
        dsq: "Sirtar i fshehur për kabllot, pllakë 3 cm.", den: "Hidden cable drawer, 3 cm top." },
      { id: "gjumi", sq: "Shtrati Gjumi", en: "Gjumi bed", type: "bed", img: "bed", base: 980, mat: "wood", woods: ["oak", "walnut", "ash"], weeks: 6,
        sizes: [ { w: 160, d: 210, add: 0 }, { w: 180, d: 210, add: 140 } ],
        dsq: "Kokë e veshur me li, rrjetë druri. Dyshek jo i përfshirë.", den: "Linen headboard, wooden slats. Mattress not included." },
      { id: "rrethi", sq: "Tryeza Rrethi", en: "Rrethi round table", type: "round", img: "round", base: 460, mat: "wood", woods: ["oak", "ash", "black"], weeks: 4,
        sizes: [ { w: 100, d: 100, add: 0 }, { w: 120, d: 120, add: 120 } ],
        dsq: "Për kuzhina të vogla: katër veta në 100 cm.", den: "For small kitchens: four people at 100 cm." },
      { id: "kroni", sq: "Stoli Kroni", en: "Kroni stool", type: "stool", img: "stool", base: 95, mat: "wood", woods: ["oak", "black"], weeks: 3,
        sizes: [ { w: 40, d: 40, add: 0 } ], qty: true,
        dsq: "Lartësi 75 cm për banak kuzhine.", den: "75 cm high, for kitchen counters." }
    ]
  };
})();
