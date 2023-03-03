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

async function swapPokemonOutside() {
        let totalPokemon = player.trainerPokemon.length;
        let pressedBackspace = false;
        let pokemon1 = '';
        let pokemon2 = '';
        navY = 0;
        
        while (pressedBackspace == false) {
            overworldDialog = `<table style="width:50%; height:98%">
            <tr>
                <td id="choice1" rowspan="${totalPokemon}">${player.getLeadPokemon().getNickname()}</td>
            </tr>
            `;
            const choices = ['choice1'];
            for (i = 1; i < totalPokemon; i++) {
                let id = Number(i);
                id++; 
                overworldDialog += `
                <tr>
                    <td id="choice${id}">${player.trainerPokemon[i].getNickname()}</td>
                </tr>
                `;
                choices.push('choice'+id);
            }
            overworldDialog += `</table><p>Trykk backspace eller escape for å komme ut av menyen</p>`;
            showOverworldDialog();
            setButtonClassesUpDown(choices);
            if (typeof pokemon1 == 'number') {
                document.getElementById(`choice` + Number(pokemon1 + 1)).className = 'buttonSelected';
            }
            let keypress = await waitingKeypress();
            if (keypress.keyCode >= 37 && keypress.keyCode <= 40) {
                navigateUpDown(keypress.keyCode, choices);
            }
            else if (keypress.keyCode == 13)  { //Enter
                if (!(typeof pokemon1 == 'number')) {
                    pokemon1 = navY;                   
                }
                else {
                    pokemon2 = navY;
                    player.swapPokemon(Number(pokemon1), Number(pokemon2));
                    pokemon1 = '';
                    pokemon2 = '';
                }
            }
            else if (keypress.keyCode == 8 || keypress.keyCode == 27) {//Backspace eller Escape 
                pressedBackspace = true;
                navY = 0; //Nullstille knappen
                overworldDialog = '';
                view();
            }
        }
}