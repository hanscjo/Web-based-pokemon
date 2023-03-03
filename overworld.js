//Styre hvilke view som kommer her?
async function pokecenter(trainer) {
    for (pokemon in trainer.trainerPokemon) {
        trainer.trainerPokemon[pokemon].remainingHp = trainer.trainerPokemon[pokemon].stats['hp'];
        trainer.trainerPokemon[pokemon].status = 'neutral';
    }
    battleIsUnderway = false;
    overworldDialog = '';
    changeScenery();
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
            let html = `<table id="swapping" style="width:50%; height:98%">
            <tr>
                <td id="choice1" rowspan="${totalPokemon}">${player.getLeadPokemon().getNickname()}</td>
            </tr>
            `;
            const choices = ['choice1'];
            for (i = 1; i < totalPokemon; i++) {
                let id = Number(i);
                id++; 
                html += `
                <tr>
                    <td id="choice${id}">${player.trainerPokemon[i].getNickname()}</td>
                </tr>
                `;
                choices.push('choice'+id);
            }
            html += `</table><p>Trykk backspace eller escape for å komme ut av menyen</p>`;
            document.getElementById("app").innerHTML = html;
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
                viewScenery();
            }
        }
}

async function browseShop() {
    let selectedItem = '';
    let totalItems = shopInventory.length;
    let pressedBackspace = false;
    navX = 0;
    navY = 0;

    while (pressedBackspace == false) {
        let html = `<h1>Velkommen til sjappa!</h1><table id="shop" style="width:50%; height:98%">
        `;
        const choices = [];
        for (i = 0; i < totalItems; i++) {
            let id = Number(i);
            id++; 
            html += `
            <tr>
                <th height="50px" id="choice${id}">${shopInventory[i].name}</th>
                <td>${shopInventory[i].price}</td>
            </tr>
            `;
            choices.push('choice'+id);
        }
        overworldDialog = `<p>Money: <b>${player.money}</b></p><p>Trykk backspace eller escape for å komme ut av menyen</p>`;
        html += `</table><div id="overworldMessage">${overworldDialog}</div>`;
        
        document.getElementById("app").innerHTML = html;
        setButtonClassesUpDown(choices);
        
        let keypress = await waitingKeypress();
        if (keypress.keyCode >= 37 && keypress.keyCode <= 40) {
            navigateUpDown(keypress.keyCode, choices);
        }
        else if (keypress.keyCode == 13)  { //Enter
            selectedItem = shopInventory[navY];
            console.log(selectedItem);
            await browseItem(selectedItem);

        }
        else if (keypress.keyCode == 8 || keypress.keyCode == 27) {//Backspace eller Escape 
            pressedBackspace = true;
            navX = 0;
            navY = 0; //Nullstille knappen
            overworldDialog = '';
            view();
            viewScenery()
        }
    }   
}

async function browseItem(selectedItem) {
    let pressedBackspace = false;
    let purchaseWasMade = false;
    let itemCount = 1;
    let price = selectedItem.price;

    while (pressedBackspace == false && purchaseWasMade == false) {
        price = selectedItem.price * itemCount;
        let html = `<div id="overworldMessage">Hvor mange ${selectedItem.name} ønsker du?<br>${itemCount}x, ${Number(price)}$<br><p>Money: <b>${player.money}</b></p><br>Trykk opp/ned/enter/backspace</div>`;
        document.getElementById("app").innerHTML = html;

        let keypress = await waitingKeypress();
        if (keypress.keyCode == 38 || keypress.keyCode == 40) {
            itemCount += 39 - keypress.keyCode;
            itemCount = Math.max(itemCount, 1);
        }
        else if (keypress.keyCode == 13)  { //Enter
            if (player.money >= price) {
                document.getElementById("overworldMessage").innerHTML = 'Solgt!  ▼'
                player.money -= price;
                let bagReference;
                switch (selectedItem.category) {
                    case 'Pokeballs':
                        bagReference = player.bag.content[2].items;
                        for (item in bagReference) {
                            if (bagReference[item].name == selectedItem.name) {
                                purchaseWasMade = true;
                                bagReference[item].count += itemCount;
                            }
                            
                        }
                        if (!purchaseWasMade) { //dvs vi har ikke itemet fra før av gitt løkka over
                            bagReference.push({name: selectedItem.name, count: itemCount});
                            purchaseWasMade = true;
                        }
                        break;
                    
                    case 'Medicine':
                        bagReference = player.bag.content[0].items;
                        for (item in bagReference) {
                            if (bagReference[item].name == selectedItem.name) {
                                purchaseWasMade = true;
                                bagReference[item].count += itemCount;
                            }
                            
                        }
                        if (!purchaseWasMade) { //dvs vi har ikke itemet fra før av gitt løkka over
                            bagReference.push({name: selectedItem.name, count: itemCount, effect: 'heal'});
                            purchaseWasMade = true;
                        }
                        break;
                }
                await waitingContinue();
            }
            else {
                document.getElementById("overworldMessage").innerHTML = 'Dette har du ikke råd til!  ▼'
                await waitingContinue();
            }

        }
        else if (keypress.keyCode == 8 || keypress.keyCode == 27) {//Backspace eller Escape 
            pressedBackspace = true;
        }
    }

    return new Promise((resolve) => {
        resolve();
    });
}

function viewScenery() {
    let canvas3 = document.getElementById("overworldScreen");
    let ctx3 = canvas3.getContext("2d");
    ctx3.clearRect(0, 0, 1100, 700);
    let landscapeImg = new Image();
    landscapeImg.onload = function() {
        ctx3.drawImage(landscapeImg, 0, 0);
    };
    landscapeImg.src = `img/landscape/${imgNumber}.png`;
}

function changeScenery() {
    imgNumber = Math.floor(Math.random()*5);
}