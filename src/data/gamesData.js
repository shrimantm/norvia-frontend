// ─── Word-Based Game Data ──────────────────────────────────

export const WORD_CHALLENGES = [
  // Unscramble challenges
  { id: "w1", type: "unscramble", scrambled: "BCARNO", answer: "CARBON", hint: "Element in CO₂" },
  { id: "w2", type: "unscramble", scrambled: "MTCAILE", answer: "CLIMATE", hint: "Earth's long-term weather" },
  { id: "w3", type: "unscramble", scrambled: "RLOAS", answer: "SOLAR", hint: "Energy from the sun" },
  { id: "w4", type: "unscramble", scrambled: "CYREELC", answer: "RECYCLE", hint: "Reuse materials to reduce waste" },
  { id: "w5", type: "unscramble", scrambled: "FOERTS", answer: "FOREST", hint: "Lungs of the Earth" },
  { id: "w6", type: "unscramble", scrambled: "NOISSIME", answer: "EMISSION", hint: "Release of greenhouse gases" },
  { id: "w7", type: "unscramble", scrambled: "BLEWARENE", answer: "RENEWABLE", hint: "Energy that replenishes naturally" },
  { id: "w8", type: "unscramble", scrambled: "TALPULNOI", answer: "POLLUTION", hint: "Contamination of the environment" },

  // Fill in the blank challenges
  { id: "w9", type: "fill", sentence: "The _____ layer protects Earth from UV radiation.", answer: "OZONE", hint: "O₃ gas in the stratosphere" },
  { id: "w10", type: "fill", sentence: "_____ energy comes from the movement of water.", answer: "HYDRO", hint: "Power from rivers and dams" },
  { id: "w11", type: "fill", sentence: "The Paris _____ aims to limit global warming to 1.5°C.", answer: "AGREEMENT", hint: "International climate treaty" },
  { id: "w12", type: "fill", sentence: "_____ gases trap heat in the atmosphere.", answer: "GREENHOUSE", hint: "CO₂, methane, etc." },
  { id: "w13", type: "fill", sentence: "Electric _____ produce zero direct emissions.", answer: "VEHICLES", hint: "Cars powered by batteries" },
  { id: "w14", type: "fill", sentence: "_____ is the process of planting trees to restore forests.", answer: "REFORESTATION", hint: "Opposite of deforestation" },

  // Choose the correct word
  { id: "w15", type: "choose", question: "What is the main greenhouse gas from burning fossil fuels?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], answer: "Carbon Dioxide" },
  { id: "w16", type: "choose", question: "Which renewable energy source uses wind turbines?", options: ["Solar", "Wind", "Geothermal", "Nuclear"], answer: "Wind" },
  { id: "w17", type: "choose", question: "What does 'net zero' mean?", options: ["No internet", "Zero emissions produced", "Balance emissions with removal", "Zero carbon tax"], answer: "Balance emissions with removal" },
  { id: "w18", type: "choose", question: "Which gas is most responsible for ozone depletion?", options: ["CO₂", "CFCs", "Methane", "Oxygen"], answer: "CFCs" },
  { id: "w19", type: "choose", question: "What is the largest source of ocean pollution?", options: ["Oil spills", "Plastic waste", "Sewage", "Industrial chemicals"], answer: "Plastic waste" },
  { id: "w20", type: "choose", question: "Which country emits the most CO₂ globally?", options: ["USA", "India", "China", "Russia"], answer: "China" },
];

// ─── Pattern Recognition Game Data ─────────────────────────

export const PATTERN_CHALLENGES = [
  // Number sequences
  { id: "p1", type: "number", sequence: [2, 4, 6, 8], answer: 10, options: [9, 10, 11, 12], hint: "Add 2 each time" },
  { id: "p2", type: "number", sequence: [3, 6, 12, 24], answer: 48, options: [36, 42, 48, 30], hint: "Double each time" },
  { id: "p3", type: "number", sequence: [1, 1, 2, 3, 5], answer: 8, options: [6, 7, 8, 10], hint: "Sum of previous two" },
  { id: "p4", type: "number", sequence: [100, 90, 81, 73], answer: 66, options: [64, 65, 66, 67], hint: "Subtract decreasing amounts" },
  { id: "p5", type: "number", sequence: [1, 4, 9, 16], answer: 25, options: [20, 25, 30, 36], hint: "Perfect squares" },
  { id: "p6", type: "number", sequence: [2, 6, 18, 54], answer: 162, options: [108, 128, 162, 180], hint: "Multiply by 3" },
  { id: "p7", type: "number", sequence: [5, 10, 20, 35], answer: 55, options: [45, 50, 55, 60], hint: "Differences increase by 5" },
  { id: "p8", type: "number", sequence: [0, 1, 3, 6, 10], answer: 15, options: [13, 14, 15, 16], hint: "Triangle numbers" },

  // Symbol/shape sequences
  { id: "p9", type: "symbol", sequence: ["🌱", "🌿", "🌳", "🌲"], answer: "🏔️", options: ["🌱", "🏔️", "🌊", "☀️"], hint: "Growth stages of nature" },
  { id: "p10", type: "symbol", sequence: ["🌑", "🌒", "🌓", "🌔"], answer: "🌕", options: ["🌖", "🌕", "🌑", "⭐"], hint: "Moon phases" },
  { id: "p11", type: "symbol", sequence: ["❄️", "🌸", "☀️"], answer: "🍂", options: ["🌧️", "🍂", "❄️", "🌪️"], hint: "Seasons cycle" },
  { id: "p12", type: "symbol", sequence: ["💧", "💧💧", "💧💧💧"], answer: "💧💧💧💧", options: ["💧💧💧💧", "💧💧", "💧", "💧💧💧💧💧"], hint: "One more each time" },

  // Mixed patterns
  { id: "p13", type: "number", sequence: [1, 2, 4, 7, 11], answer: 16, options: [14, 15, 16, 17], hint: "Add 1, 2, 3, 4, ..." },
  { id: "p14", type: "number", sequence: [81, 27, 9, 3], answer: 1, options: [0, 1, 2, 3], hint: "Divide by 3" },
  { id: "p15", type: "number", sequence: [2, 3, 5, 7, 11], answer: 13, options: [12, 13, 14, 15], hint: "Prime numbers" },
  { id: "p16", type: "symbol", sequence: ["🔴", "🟠", "🟡", "🟢"], answer: "🔵", options: ["🟣", "🔵", "⚫", "🟤"], hint: "Rainbow colors" },
];

// ─── Maze Templates ────────────────────────────────────────
// 0 = path, 1 = wall, 2 = start, 3 = exit
// Each maze is 9x9

export const MAZE_LEVELS = [
  {
    id: "m1",
    name: "Green Valley",
    maxMoves: 25,
    grid: [
      [2, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 3],
    ],
  },
  {
    id: "m2",
    name: "Carbon Forest",
    maxMoves: 30,
    grid: [
      [2, 0, 0, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 3],
    ],
  },
  {
    id: "m3",
    name: "Solar Maze",
    maxMoves: 35,
    grid: [
      [2, 0, 1, 1, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 3],
    ],
  },
  {
    id: "m4",
    name: "Wind Tunnel",
    maxMoves: 30,
    grid: [
      [1, 1, 1, 1, 2, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 3, 1, 1, 1, 1],
    ],
  },
];
