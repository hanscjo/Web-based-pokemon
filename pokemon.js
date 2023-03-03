class Pokemon {
    
    stats = {};
    remainingHp;
    status; //Settes til fainted når fainted
    moveList;
    nickname;
    trainer;

    constructor(pokemonName, level, move1, move2, move3, move4) {
        this.pokemonData = getPokemonFromString(pokemonName);
        this.level = level;
        this.moveList = [];
        if (move1) {
            this.moveList.push(getMoveFromString(move1));
        }
        if (move2) {
            this.moveList.push(getMoveFromString(move2));           
        }
        if (move3) {
            this.moveList.push(getMoveFromString(move3));
        }
        if (move4) {
            this.moveList.push(getMoveFromString(move4));          
        }

        this.stats = {};
        setPokemonStats(this);
        this.setNickname(this.getPokemonName());
        this.remainingHp = this.stats['hp'];
        this.status = 'neutral';
    };

    levelUp() {
        this.level = Math.min(100, this.level + 1);
        setPokemonStats(this);
    }

    async evolve() {
        let nextStage = this.pokemonData.evolve['newPokemonId'];
        let newPokemonString = getPokemonNameFromId(nextStage)
        let newPokemon = getPokemonFromString(newPokemonString);
        let oldNickname = this.getNickname();
        let oldName = this.getPokemonName();

        let canvas2 = document.getElementById("overworldScreen");
        let ctx2 = canvas2.getContext("2d");
        ctx2.clearRect(0, 0, 1100, 700);

        let pokemonImg = new Image();
        pokemonImg.onload = function() {
            ctx2.drawImage(pokemonImg, 383, 183);
        };
        let playerPokemonId = this.getPokemonId();
        pokemonImg.src = `img/pokemon/${playerPokemonId}.png`;

        overworldDialog = `Oh? ${this.getNickname()} is evolving!  ▼`;
        showOverworldDialog();
        await waitingContinue();

        ctx2.fillStyle = "cyan";
        ctx2.beginPath();
        ctx2.arc(550, 350, 300, 0, 2 * Math.PI);
        ctx2.fill();

        overworldDialog = `Oh? ${this.getNickname()} is evolving!`;
        showOverworldDialog();
        await delay(2000);
        this.pokemonData = newPokemon;
        setPokemonStats(this);


        ctx2.fillStyle = "white";
        ctx2.beginPath();
        ctx2.arc(550, 350, 300, 0, 2 * Math.PI);
        ctx2.fill();

        let newPokemonImg = new Image();
        newPokemonImg.onload = function() {
            ctx2.drawImage(newPokemonImg, 383, 183);
        };
        newPokemonImg.src = `img/pokemon/${nextStage}.png`;

        
        await delay(1500);
        overworldDialog = `Congratulations! ${this.getNickname()} evolved into ${newPokemonString}!  ▼`;
        showOverworldDialog();
        await waitingContinue();

        if (oldNickname == oldName) {
            this.setNickname(newPokemonString);
        }

        return new Promise((resolve) => {
            resolve();
        });
    }
    
    getPokemonStats() { //returnerer en 'dictionary' med stats 
        console.log(this.getNickname());
        return this.stats;
    };

    getPokemonId() { //Tar inn et Pokemon-objekt og returnerer id
        return this.pokemonData.id;
    };

    getPokemonName() {
        return this.pokemonData.name;
    };

    getAvailableMoveCount() {
        return this.moveList.length;
    };

    getPokemonType() {
        return {'type1': this.pokemonData.type1, 'type2': this.pokemonData.type2};
    };

    getPokemonLevel() {
        return this.level;
    };

    getRemainingHp() {
        return this.remainingHp;
    };

    getMaxHp() {
        return this.stats['hp'];
    }

    getCatchRate() {
        return this.pokemonData.catchRate;
    }

    getStatus() {
        return this.status;
    };

    setTrainer(newTrainer) {
        this.trainer = newTrainer;
    }

    setNickname(newNickname) {
        this.nickname = newNickname;
    };

    getNickname() {
        return this.nickname;
    };
};

class battlePokemon extends Pokemon { //Brukes for å håndtere stat-boosts, skullbash osv
    preparingMove;
    toxicCount;
    stages = {};
    battleStats = {}; //Brukes for å håndtere statboosts. Hp tas vare på i remainingHp
    originalPokemon; //Brukes for å huske på den opprinnelige pokemonen

    constructor(pokemonName, level, move1, move2, move3, move4, status, remainingHp, trainer, originalPokemon) {
        super(pokemonName, level, move1, move2, move3, move4);
        setPokemonStats(this);
        this.status = status;
        this.remainingHp = remainingHp;
        this.preparingMove = false;
        this.toxicCount = 0;
        this.stages = {'attack': 0,
        'defense': 0,
        'special attack': 0,
        'special defense': 0,
        'speed': 0
        };
        this.battleStats = {'attack': this.stats['attack'],
        'defense': this.stats['defense'],
        'special attack': this.stats['special attack'],
        'special defense': this.stats['special defense'],
        'speed': this.stats['speed'],
        };
        this.trainer = trainer;
        this.originalPokemon = originalPokemon;
        this.setNickname(originalPokemon.getNickname());
    };
};

function faintPokemon(givenPokemon) {
    givenPokemon.status = 'fainted'
    givenPokemon.trainer.faintedPokemon += 1;
    givenPokemon.trainer.readyPokemon -= 1;
    return new Promise((resolve) => {
        resolve();
    });
};

function getPokemonFromString(pokemon) {
    for (creature in allPokemonCreatures)  {
        if (allPokemonCreatures[creature].name == pokemon) {
            return allPokemonCreatures[creature];
        };
    };
};

function getPokemonNameFromId(pokemonId) {
    return allPokemonCreatures[pokemonId].name;
};

function getPokeballIdFromString(givenString) {
    for (ball in pokeballs) {
        if (pokeballs[ball].ballName == givenString) {
            return Number(ball);
        }
    }
}

function getMoveFromString(givenString) {
    for (move in allPokemonMoves) {
        if (allPokemonMoves[move].moveName == givenString) {
            return allPokemonMoves[move];
        };
    };
};

function getMoveStringFromId(moveId) {
    return allPokemonMoves[moveId].moveName;
}

function getBattlePokemon(pokemon) { //Kloner en pokemon til et battle-pokemon objekt slik at vi kan håndtere statboosts osv
    let move1;
    let move2;
    let move3;
    let move4;
    const readList = [];
    
    for (i in pokemon.moveList) {
        if (pokemon.moveList[i].moveName) {
            readList.push(pokemon.moveList[i].moveName);
        }
        else {
            readList.push(null);
        }
    }

    move1 = readList[0];
    move2 = readList[1];
    move3 = readList[2];
    move4 = readList[3];
    return new battlePokemon(pokemon.getPokemonName(), pokemon.getPokemonLevel(), move1, move2, move3, move4, pokemon.getStatus(), pokemon.getRemainingHp(), pokemon.trainer, pokemon);
}

function setBattlePokemon(trainer) {
    trainer.battlePokemon = [];
    for (pokemon in trainer.trainerPokemon) {
        givenPokemon = trainer.trainerPokemon[pokemon];
        if (givenPokemon) {
            trainer.battlePokemon.push(getBattlePokemon(givenPokemon));
        }
    }
}

function setPokemonStats(pokemon) { //Tar inn et Pokemon-objekt og setter stats
    level = pokemon.level;
    pokemon.stats['attack'] = calculateOtherStats(level, baseStats[pokemon.getPokemonId()].attack);
    pokemon.stats['defense'] = calculateOtherStats(level, baseStats[pokemon.getPokemonId()].defense);
    pokemon.stats['special attack'] = calculateOtherStats(level, baseStats[pokemon.getPokemonId()].specialAttack);
    pokemon.stats['special defense'] = calculateOtherStats(level, baseStats[pokemon.getPokemonId()].specialDefense);
    pokemon.stats['speed'] = calculateOtherStats(level, baseStats[pokemon.getPokemonId()].speed);
    pokemon.stats['hp'] = calculateHp(level, baseStats[pokemon.getPokemonId()].hp);
};

function calculateOtherStats(level, baseStat) { //Formel tatt og modifisert fra https://pokemon.fandom.com/wiki/Statistics, da jeg ikke ville implementere EVs og IVs
    return Math.floor(0.01 *(2 * baseStat)*level + 5);
};

function calculateHp(level, baseStat) { //Formel tatt fra https://pokemon.fandom.com/wiki/Statistics, da jeg ikke ville implementere EVs og IVs
    return Math.floor(0.01 *(2 * baseStat)*level + level + 10)
};