//Styre hvilke view som kommer her?
async function pokecenter(trainer) {
    for (pokemon in trainer.trainerPokemon) {
        trainer.trainerPokemon[pokemon].remainingHp = trainer.trainerPokemon[pokemon].stats['hp'];
        trainer.trainerPokemon[pokemon].status = 'neutral';
    }
    battleIsUnderway = false;
    overworldDialog = '';
    viewBattle();
    trainer.readyPokemon = trainer.trainerPokemon.length;
    trainer.faintedPokemon = 0;
    overworldDialog = '...';
    showOverworldDialog();
    await delay(1000);
    overworldDialog = 'Your pokemon have been restored to full health!  ▼';
    showOverworldDialog();
    await waitingContinue();
    overworldDialog = 'Safe travels!  ▼';
    showOverworldDialog();
    await waitingContinue();
    overworldDialog = '';
    showOverworldDialog();
    return new Promise((resolve) => {
        resolve();
    });
}

function runTrainerBattleInstancing() {
    //runTrainerInstancing();
    //testImmunities()
    let randomN = Math.floor(Math.random()*3);

    switch (randomN) {
        case 0:
            trainer1.challengePlayer();
            break;

        case 1:
            trainer2.challengePlayer();
            break;

        case 2:
            trainer3.challengePlayer();
            break;
    }
    overworldDialog = '';
}

function generateWildPokemon() {
    //Send inn parameter for hvilken route man er i for å sjekke en array etter hva slags pokemon man finner
    let wildPokemonId = Math.floor(Math.random()*(allPokemonCreatures.length));
    let wildPokemonName = getPokemonNameFromId(wildPokemonId);
    let wildPokemonLevel = Math.floor(Math.random()*100)+1; //Settes til route-info

    let wildMove1 = getMoveStringFromId(learnSet[wildPokemonId].move1.moveId);

    let wildMove2 = returnLearnsetMoveString(wildPokemonId, wildPokemonLevel, 'move2');
    let wildMove3 = returnLearnsetMoveString(wildPokemonId, wildPokemonLevel, 'move3');
    let wildMove4 = returnLearnsetMoveString(wildPokemonId, wildPokemonLevel, 'move4');

    wildPokemon = new Pokemon(wildPokemonName, wildPokemonLevel, wildMove1, wildMove2, wildMove3, wildMove4);
    wildHandler = new npcTrainer('wildHandler', wildPokemon, null, null, null, null, null, 0, '', '', ''); //Dette er bare for å få battle-funksjonene til å fungere bra
    wildBattle1 = new wildBattle(player, wildHandler);
}