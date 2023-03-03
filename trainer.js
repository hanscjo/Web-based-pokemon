class Trainer {
    
    trainerPokemon = []; //Brukes til å håndtere pokemon utenfor kamp
    battlePokemon = []; //Brukes til å håndtere pokemon under kamp
    faintedPokemon;
    readyPokemon;
    money;

    constructor(trainerName, pokemon1, pokemon2, pokemon3, pokemon4, pokemon5, pokemon6, money) {
        this.trainerName = trainerName;
        this.setPokemon(pokemon1);
        this.setPokemon(pokemon2);
        this.setPokemon(pokemon3);
        this.setPokemon(pokemon4);
        this.setPokemon(pokemon5);
        this.setPokemon(pokemon6);
        this.money = money;
        this.faintedPokemon = 0;
        this.readyPokemon = this.trainerPokemon.length;
    };

    setPokemon(pokemon) {
        if (pokemon) {
            pokemon.trainer = this;
            this.trainerPokemon.push(pokemon); 
        }
    }

    getLeadPokemon() {
        return this.trainerPokemon[0];
    }

    getLeadBattlePokemon() {
        return this.battlePokemon[0];
    }

    getName() {
        return this.trainerName;
    }

};

class npcTrainer extends Trainer {

    challengeDialogue = "Heisann!";
    winDialogue = "Hurra! Jeg vant!";
    loseDialogue = "Godt spilt!";
    portrait = 'img/trainers/placeholder.png';

    constructor(trainerName, pokemon1, pokemon2, pokemon3, pokemon4, pokemon5, pokemon6, money, challengeDialogue, winDialogue, loseDialogue, portrait) {
        super(trainerName, pokemon1, pokemon2, pokemon3, pokemon4, pokemon5, pokemon6, money);
        
        if (challengeDialogue) {
            this.challengeDialogue = challengeDialogue;
        };

        if (winDialogue) {
            this.winDialogue = winDialogue;
        };

        if (loseDialogue) {
            this.loseDialogue = loseDialogue;
        };

        if (portrait) {
            this.portrait = portrait;
        }
        
    }

    async challengePlayer() {
        //Send seg selv sammen med player inn i konstruktøren til et battle-objekt
        overworldDialog = this.getChallengeDialogue() + `  ▼`;
        showOverworldDialog();
        await waitingContinue();
        new trainerBattle(player, this);
    };

    getChallengeDialogue() {
        return this.challengeDialogue;
    };

    getWinDialogue() {
        return this.winDialogue;
    };

    getLoseDialogue() {
        return this.loseDialogue;
    };

    getPortraitSrc() {
        return this.portrait;
    };

}

class playerTrainer extends Trainer {

    bag;

    constructor(trainerName, pokemon1, pokemon2, pokemon3, pokemon4, pokemon5, pokemon6) {
        super(trainerName, pokemon1, pokemon2, pokemon3, pokemon4, pokemon5, pokemon6, 3000); //Player starter med 3000 money.
        this.bag = this.setBag();
    };

    swapPokemon(index1, index2) {
        let selectedPokemon = this.trainerPokemon[index2];
        
        let stored = this.trainerPokemon[index1];
        this.trainerPokemon[index1] = selectedPokemon;
        this.trainerPokemon[index2] = stored;
        
    };

    swapBattlePokemon(index1, index2) {
        let selectedPokemon = this.battlePokemon[index2];
        
        let stored = this.battlePokemon[index1];
        this.battlePokemon[index1] = selectedPokemon;
        this.battlePokemon[index2] = stored;
    };

    setBag() {
        return new Bag(this);
    }
};

class Bag {

    content;
    trainer;

    constructor(trainer) {
        this.trainer = trainer;
        
        this.content = [ //Push objekter med itemnavn, effekt og antall. Fjern ting dersom count = 0
        {category: 'Medicine', items: [{name: 'Potion', count: 1, effect: 'heal'}]},
        {category: 'Berries', items: []},
        {category: 'Pokeballs', items: [{name: 'Pokeball', count: 5}, {name: 'Great Ball', count: 2}, {name: 'Ultra Ball', count: 1}, {name: 'Dive Ball', count: 1}, {name: 'Master Ball', count: 1}]}, //bare sammenlign med ballName
        {category: 'Key items', items: [{name: "Mom's lunch", count: 1, effect: 'momLunch'}]}
        ];
    }

    deleteItem(categoryIndex, itemIndex) { //Kalles når count går til 0
        this.content[categoryIndex].items.splice(itemIndex, 1);
    }
}