const allPokemonTypes = {  //Lager en dictionary som er 1:1 med weaknesses, resistances og immunities
    "normal": 0,
    "grass": 1,
    "fire": 2,
    "water": 3,
    "rock": 4,
    "poison": 5,
    "steel": 6,
    "flying": 7
};

const weaknesses = [ //Korresponderer indeks til allPokemonTypes.id
    [],
    ["fire", "poison", "flying"],
    ["water", "rock"],
    ["grass"],
    ["grass", "water", "steel"],
    [],
    ["fire"],
    ["rock"]
];

const resistances = [ //Korresponderer indeks til allPokemonTypes.id
    [],
    ["water", "rock", "grass"],
    ["grass", "steel", "fire"],
    ["fire", "steel", "water"],
    ["normal", "fire", "poison", "flying"],
    ["poison"],
    ["normal", "grass", "rock", "steel", "flying"],
    ["grass"]
];

const immunities = [ //Korresponderer indeks til allPokemonTypes.id
    [],
    [],
    [],
    [],
    [],
    [],
    ["poison"],
    []
];

const allPokemonCreatures = [
    {id: 0, name: "Bulbasaur", type1: "grass", type2: "poison", catchRate: 180, evolve: {level: 16, newPokemonId: 1}},
    {id: 1, name: "Ivysaur", type1: "grass", type2: "poison", catchRate: 90, evolve: {level: 32, newPokemonId: 2}},
    {id: 2, name: "Venusaur", type1: "grass", type2: "poison", catchRate: 45},
    {id: 3, name: "Charmander", type1: "fire", type2: null, catchRate: 180, evolve: {level: 16, newPokemonId: 4}},
    {id: 4, name: "Charmeleon", type1: "fire", type2: null, catchRate: 90, evolve: {level: 36, newPokemonId: 5}},
    {id: 5, name: "Charizard", type1: "fire", type2: "flying", catchRate: 45},
    {id: 6, name: "Squirtle", type1: "water", type2: null, catchRate: 180, evolve: {level: 16, newPokemonId: 7}},
    {id: 7, name: "Wartortle", type1: "water", type2: null, catchRate: 90, evolve: {level: 36, newPokemonId: 8}},
    {id: 8, name: "Blastoise", type1: "water", type2: null, catchRate: 45},
    {id: 9, name: "Sudowoodo", type1: "rock", type2: null, catchRate: 65},
    {id: 10, name: "Registeel", type1: "steel", type2: null, catchRate: 3}
];

const learnSet = [ //id korresponderer til hvilken pokemon, move-verdier korresponderer til indekser i allPokemonMoves
    {id: 0, move1: {level: 1, moveId: 1}, move2: {level: 6, moveId: 2}, move3: {level: 25, moveId: 6}, move4: {level: 45, moveId: 7}},
    {id: 1, move1: {level: 1, moveId: 1}, move2: {level: 1, moveId: 2}, move3: {level: 16, moveId: 6}, move4: {level: 38, moveId: 7}},
    {id: 2, move1: {level: 1, moveId: 1}, move2: {level: 1, moveId: 2}, move3: {level: 1, moveId: 6}, move4: {level: 32, moveId: 7}},
    {id: 3, move1: {level: 1, moveId: 0}, move2: {level: 10, moveId: 3}, move3: {level: 30, moveId: 8}, move4: null},
    {id: 4, move1: {level: 1, moveId: 0}, move2: {level: 1, moveId: 3}, move3: {level: 16, moveId: 8}, move4: null},
    {id: 5, move1: {level: 1, moveId: 0}, move2: {level: 1, moveId: 3}, move3: {level: 1, moveId: 8}, move4: {level: 36, moveId: 9}},
    {id: 6, move1: {level: 1, moveId: 1}, move2: {level: 10, moveId: 4}, move3: {level: 20, moveId: 11}, move4: {level: 55, moveId: 10}},
    {id: 7, move1: {level: 1, moveId: 1}, move2: {level: 1, moveId: 4}, move3: {level: 16, moveId: 11}, move4: {level: 42, moveId: 10}},
    {id: 8, move1: {level: 1, moveId: 1}, move2: {level: 1, moveId: 4}, move3: {level: 1, moveId: 11}, move4: {level: 36, moveId: 10}},
    {id: 9, move1: {level: 1, moveId: 1}, move2: {level: 5, moveId: 11}, move3: {level: 10, moveId: 5}, move4: {level: 20, moveId: 2}},
    {id: 10, move1: {level: 1, moveId: 1}, move2: {level: 15, moveId: 8}, move3: {level: 25, moveId: 11}, move4: {level: 35, moveId: 14}}
];

const allPokemonMoves = [ //id er egt bare for å holde oversikt over indeks imens man mapper moves
    {id: 0, moveName: "Scratch", power: 40, accuracy: 100, moveType: "normal", effect: "damage", moveCategory: "physical"},
    {id: 1, moveName: "Tackle", power: 35, accuracy: 95, moveType: "normal", effect: "damage", moveCategory: "physical"},
    {id: 2, moveName: "Absorb", power: 20, accuracy: 100, moveType: "grass", effect: "drain50percent", moveCategory: "special"},
    {id: 3, moveName: "Ember", power: 40, accuracy: 100, moveType: "fire", effect: "damageBurn", moveCategory: "special"},
    {id: 4, moveName: "Water Gun", power: 40, accuracy: 100, moveType: "water", effect: "damage", moveCategory: "special"},
    {id: 5, moveName: "Rock Throw", power: 50, accuracy: 90, moveType: "rock", effect: "damage", moveCategory: "physical"},
    {id: 6, moveName: "Poison Sting", power: 20, accuracy: 100, moveType: "poison", effect: "damagePoison", moveCategory: "physical"},
    {id: 7, moveName: "Toxic", power: 0, accuracy: 90, moveType: "poison", effect: "toxicPoison", moveCategory: "special"},
    {id: 8, moveName: "Metal Claw", power: 50, accuracy: 95, moveType: "steel", effect: "damageAtkBoost", moveCategory: "physical"},
    {id: 9, moveName: "Wing Attack", power: 60, accuracy: 100, moveType: "flying", effect: "damage", moveCategory: "physical"},
    {id: 10, moveName: "Skull Bash", power: 100, accuracy: 100, moveType: "normal", effect: "skullBash", moveCategory: "physical"},
    {id: 11, moveName: "Harden", power: 1, accuracy: 100, moveType: "rock", effect: "defChange", moveCategory: "physical"}, //Power korresponderer til hvor mange stadier defense skal opp
    {id: 12, moveName: "Amnesia", power: 2, accuracy: 100, moveType: "psychic", effect: "spDefChange", moveCategory: "special"},
    {id: 13, moveName: "Calm Mind", power: 1, accuracy: 100, moveType: "psychic", effect: "spDefAtkChange", moveCategory: "special"},
    {id: 14, moveName: "Softboiled", power: 50, accuracy: 100, moveType: "normal", effect: "healing", moveCategory: "special"},
    {id: 15, moveName: "Feather Dance", power: -2, accuracy: 100, moveType: "flying", effect: "atkChange", moveCategory: "special"},
    //{id: 16, moveName: "Pokeball", power: 0, accuracy: 100, moveType: "normal", effect: "pokeball", moveCategory: "physical"}
];

const baseStats = [ //id korresponderer til hvilken pokemon, verdier tatt fra pokemondb.net
    {id: 0, attack: 49, specialAttack: 65, defense: 49, specialDefense: 65, speed: 45, hp: 45},
    {id: 1, attack: 62, specialAttack: 80, defense: 63, specialDefense: 80, speed: 60, hp: 62},
    {id: 2, attack: 82, specialAttack: 100, defense: 83, specialDefense: 100, speed: 80, hp: 80},
    {id: 3, attack: 52, specialAttack: 60, defense: 43, specialDefense: 50, speed: 65, hp: 39},
    {id: 4, attack: 64, specialAttack: 80, defense: 58, specialDefense: 65, speed: 80, hp: 58},
    {id: 5, attack: 84, specialAttack: 109, defense: 78, specialDefense: 85, speed: 100, hp: 78},
    {id: 6, attack: 48, specialAttack: 50, defense: 65, specialDefense: 64, speed: 43, hp: 44},
    {id: 7, attack: 63, specialAttack: 65, defense: 80, specialDefense: 80, speed: 58, hp: 59},
    {id: 8, attack: 83, specialAttack: 85, defense: 100, specialDefense: 105, speed: 78, hp: 79},
    {id: 9, attack: 100, specialAttack: 30, defense: 115, specialDefense: 65, speed: 30, hp: 70},
    {id: 10, attack: 75, specialAttack: 75, defense: 150, specialDefense: 150, speed: 50, hp: 80},
];

const pokeballs = [
    {id: 0, ballName: 'Pokeball', multiplier: 1, specialCondition: false},
    {id: 1, ballName: 'Great Ball', multiplier: 1.5, specialCondition: false},
    {id: 2, ballName: 'Ultra Ball', multiplier: 2, specialCondition: false},
    {id: 3, ballName: 'Master Ball', multiplier: 255, specialCondition: false}, //Multiplier garanterer gjennom formelen så lenge catchRate aldri går mindre enn 3(noe som ikke skjer i spillene)
    {id: 4, ballName: 'Dive Ball', multiplier: 1, specialCondition: true}
];

const ballShakeMessage = [
    "Oh no, it broke free!",
    "Aww, it appeared to be caught.",
    "Almost had it!",
    "Shoot! It was so close!"
];

const medicine = [
    {name: 'Potion', effect: 'heal', healing: 20}, //Skriv om til heal?
    {name: 'Super Potion', effect: 'heal', healing: 50},
    {name: 'Hyper Potion', effect: 'heal', healing: 200}
]

const healTable =  [
    {'Potion': 20,
    'Super Potion': 50,
    'Hyper Potion': 200}
]

const bagTemplate = [ //Push objekter med itemnavn, effekt og antall
    {category: 'Medicine', items: []},
    {category: 'Berries', items: []},
    {category: 'Pokeballs', items: []},
    {category: 'Key items', items: []}
];

const shopInventory = [
    {category: 'Pokeballs', name: 'Pokeball', price: 100},
    {category: 'Pokeballs', name: 'Great Ball', price: 400},
    {category: 'Pokeballs', name: 'Ultra Ball', price: 800},
    {category: 'Pokeballs', name: 'Dive Ball', price: 500},
    {category: 'Medicine', name: 'Potion', price: 200},
    {category: 'Medicine', name: 'Super Potion', price: 500},
    {category: 'Medicine', name: 'Hyper Potion', price: 1000}
]