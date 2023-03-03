class Battle {

    turnIsUnderway;
    ranAway;
    playerCurrentPokemon;
    opponentCurrentPokemon;
    battleDialog;

    constructor(playerTrainer, opponent) {
        this.playerTrainer = playerTrainer;
        this.opponent = opponent;

        setBattlePokemon(playerTrainer); //I pokemon.js line 149
        setBattlePokemon(opponent);
        
        for (pokemon in playerTrainer.trainerPokemon) {
            if (playerTrainer.trainerPokemon[pokemon].getStatus() != 'fainted') { //finn første pokemon som ikke er fainted
                if (pokemon > 0) {
                    playerTrainer.swapBattlePokemon(0, pokemon);
                }
                this.playerCurrentPokemon = playerTrainer.battlePokemon[0];
                console.log("Picked " + this.playerCurrentPokemon.getNickname());
                break;
            }
        }
        
        this.opponentCurrentPokemon = opponent.battlePokemon[0];
        
        this.opponent.readyPokemon = this.opponent.trainerPokemon.length;
        
        battleIsUnderway = true; //global variabel for view
        this.turnIsUnderway = false;
        this.ranAway = false;

        navX = 0;
        navY = 0;

        viewBattle();
        this.startBattle();
        
    };

    async startBattle() {
        this.battleDialog = this.opponent.getName() + ' would like to battle!  ▼';
        this.showBattleDialog();
        await waitingContinue();
        this.battleDialog = this.opponent.getName() + ' sent out ' + this.opponentCurrentPokemon.getPokemonName() + '.';
        this.showBattleDialog();
        this.showOpponentPokemon();
        await delay(2000);
        this.battleDialog = "Go, " + this.playerCurrentPokemon.getNickname() + '!';
        this.showBattleDialog();
        await delay(1000);
        this.showPlayerPokemon();
        await delay(1000);
        this.showBattleSelection();
    };

    async selectPlayerPokemon() { //Dersom pokemon fainter
        navY = 0;
        let totalPokemon = this.playerTrainer.battlePokemon.length;
        let pokemonWasSelected = false;
        
        while (pokemonWasSelected == false) {
            this.battleDialog = `<table style="width:50%; height:98%">
            <tr>
                <td id="choice1" rowspan="${totalPokemon}">${this.playerCurrentPokemon.getNickname()}</td>
            </tr>
            `;
            const choices = ['choice1'];
            for (i = 1; i < totalPokemon; i++) {
                let id = Number(i);
                id++; 
                this.battleDialog += `
                <tr>
                    <td id="choice${id}">${this.playerTrainer.battlePokemon[i].getNickname()}</td>
                </tr>
                `;
                choices.push('choice'+id);
            }
            this.showBattleDialog();
            setButtonClassesUpDown(choices);
            let keypress = await waitingKeypress();
            if (keypress.keyCode >= 37 && keypress.keyCode <= 40) {
                navigateUpDown(keypress.keyCode, choices);
            }
            else if (keypress.keyCode == 13)  { //Enter
                pokemonWasSelected = await this.confirmPlayerPokemon(navY);
                if (pokemonWasSelected) {
                    navX = 0;
                    navY = 0;
                }
            }
    }
    return new Promise((resolve) => {
        resolve();
    });
}

    async confirmPlayerPokemon(index) { 
        //console.log("index: " + index);
        if (index >= this.playerTrainer.battlePokemon.length) { //index utenfor range
            return new Promise((resolve) => {
                resolve(false);
            });
        }
        
        let selectedPokemon = this.playerTrainer.battlePokemon[index];
        if (selectedPokemon.status == 'fainted') {
            this.battleDialog = selectedPokemon.getNickname() + ' is fainted. It cannot battle!  ▼';
            this.showBattleDialog();
            await waitingContinue();
            this.battleDialog = '';
            this.showBattleDialog();
            return new Promise((resolve) => {
                resolve(false);
            });
        }
        else if (navY == 0) {
            this.battleDialog = selectedPokemon.getNickname() + ' is already switched in!  ▼';
            this.showBattleDialog()
            await waitingContinue();
            return new Promise((resolve) => {
                resolve(false);
            });
        }
        else { 
            let stored = this.playerTrainer.getLeadBattlePokemon();
            this.battleDialog = stored.getNickname() + ', get back!';
            this.showBattleDialog();
            await delay(500);
            this.hidePlayerPokemon();
            this.hidePlayerHpBar();
            this.resetStats(stored);
            await delay(2000);
            this.playerTrainer.battlePokemon[0] = selectedPokemon;
            this.playerTrainer.battlePokemon[index] = stored;
            this.playerCurrentPokemon = selectedPokemon;
            this.battleDialog = 'Go, ' + selectedPokemon.getNickname() + "!";
            this.showBattleDialog();
            await delay(500);
            this.showPlayerPokemon();
            await delay(2000);
            return new Promise((resolve) => {
                resolve(true);
            });
        };
    };

    async updateBattleState() { //Kalles for å sjekke om pokemon ikke er fainted osv, og endrer neste valg i henhold til de pokemon som eksisterer
        //Gjør enringer...
        //Vis riktig battledialog dersom du må bytte ut pokemon elns

        if (this.opponent.readyPokemon == 0) {
            //Player vant
            await this.endBattle(true);
            if (this.playerTrainer.readyPokemon == 0) { //Ved død gjennom poison. Teller fortsatt som at player vant.
                await pokecenter(this.playerTrainer);
                viewBattle();
            } 
        }
        else if (this.playerTrainer.readyPokemon == 0) {
            //Player tapte
            await this.endBattle(false);
        };

        if (battleIsUnderway) {
            if (this.opponentCurrentPokemon.status == 'fainted') {
                //Send ut neste pokemon
                this.showNumberOfPokemon();
                await delay(1500);
                this.hideNumberOfPokemon();
                let nextPokemonIndex = this.opponent.faintedPokemon; //Denne inkrementeres naturligvis. I spillene gjøres det et logisk valg, men her velger vi bare neste
                this.opponentCurrentPokemon = this.opponent.battlePokemon[nextPokemonIndex];
                this.battleDialog = this.opponent.getName() + ' sent out ' + this.opponentCurrentPokemon.getPokemonName() + '.';
                this.showBattleDialog();
                this.showBall();
                await delay(500);
                this.showOpponentPokemon();
                await delay(2000);
                
            };
            if (this.playerCurrentPokemon.status == 'fainted') {
                //Send ut neste pokemon
                //se om promise objektet er riktig, om ikke, prøv igjen
                await this.selectPlayerPokemon();
            };

        };
        return new Promise((resolve) => {
            resolve();
        });
    };

    showBattleDialog() { //I svært mange tilfeller(kanskje alle) skriver jeg denne sammen med en melding. Vanligvis ville jeg sendt meldingen som parameter, men jeg vil holde meg til MVC!
        //vis battledialog
        //ventetid? slik at meldinger kan leses
        //sjekk om parameter, dersom det ikke er så skal keypress avansere dialog, dersom det er så skal det være timeout
        console.log('Battlestate current dialog = ' + this.battleDialog);     
        document.getElementById("battleMessage").innerHTML = this.battleDialog;
    };

    showPlayerPokemon() {
        if (this.playerCurrentPokemon.remainingHp > 0) {
            let canvas = document.getElementById("battleScreen");
            let ctx = canvas.getContext("2d");
            let pokemonImg = new Image();
            pokemonImg.onload = function() {
            console.log("loaded");
            ctx.drawImage(pokemonImg, 0, 350);
        };
        let playerPokemonId = this.playerCurrentPokemon.getPokemonId();
        pokemonImg.src = `img/pokemon/${playerPokemonId}.png`;
        this.drawPlayerHpBar(this.playerCurrentPokemon.getRemainingHp(), this.playerCurrentPokemon.getMaxHp());
        }
        else {
            this.hidePlayerPokemon();
            this.hidePlayerHpBar();
        };
        return new Promise((resolve) => {
            resolve();
        });
    };

    showOpponentPokemon() {
        if (this.opponentCurrentPokemon.remainingHp > 0) {
            let canvas = document.getElementById("battleScreen");
            let ctx = canvas.getContext("2d");
            let pokemonImg = new Image();
            pokemonImg.onload = function() {
            console.log("loaded");
            ctx.drawImage(pokemonImg, 700, 20);
        }
        let opposingPokemonId = this.opponentCurrentPokemon.getPokemonId();
        pokemonImg.src = `img/pokemon/${opposingPokemonId}.png`;
        this.drawOpponentHpBar(this.opponentCurrentPokemon.getRemainingHp(), this.opponentCurrentPokemon.getMaxHp());
        }
        else {
            this.hideOpponentPokemon();
            this.hideOpponentHpBar();
        };
        return new Promise((resolve) => {
            resolve();
        });
    };

    hidePlayerPokemon() {//Kjekt for pokemon swaps
        let canvas = document.getElementById("battleScreen");
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 350, 334, 334);
    };

    hidePlayerHpBar() {
        let canvas = document.getElementById("battleScreen");
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(330, 580, 550, 120);
    };

    hideOpponentPokemon() {//Kjekt for å kaste pokeball
        let canvas = document.getElementById("battleScreen");
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(700, 20, 334, 334);
    };

    hideOpponentHpBar() {
        let canvas = document.getElementById("battleScreen");
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(90, 0, 520, 120);
    };

    drawPlayerHpBar(currentHealth, maxHealth) {
        let canvas = document.getElementById("battleScreen");
        let ctx = canvas.getContext("2d");
        let hpWidth = currentHealth/maxHealth;

        this.hidePlayerHpBar();
        
        ctx.fillStyle = '#7CFC00';
        ctx.fillRect(350, 620, hpWidth*500, 40);
        ctx.fillStyle = 'crimson';
        ctx.fillRect(350 + (hpWidth*500), 620, (1 - hpWidth)*500, 40);

        ctx.beginPath();
        ctx.rect(350, 620, 500, 40)
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.font = "30px Arial"
        ctx.fillText(`${this.playerCurrentPokemon.getNickname()}`, 350, 610);
        ctx.fillText(`Lv${this.playerCurrentPokemon.getPokemonLevel()}`, 770, 610);

        let currentHpX = currentHealth.toString().length;
        let maxHpX = maxHealth.toString().length;
        let lengthPadding = 0.5/*skråstrek er tyldeigvis verdt halvparten*/ + currentHpX + maxHpX;
        ctx.fillText(`${currentHealth}/${maxHealth}`, 840 - 15*lengthPadding, 690);

        let status = this.playerCurrentPokemon.getStatus();
        switch (status) {
            case 'burn':
                ctx.fillStyle = 'red';
                ctx.fillText('BRN', 350, 690);
                break;

            case 'poison':
                ctx.fillStyle = 'purple';
                ctx.fillText('PSN', 350, 690);
                break;

            case 'toxic poison':
                ctx.fillStyle = 'purple';
                ctx.fillText('PSN', 350, 690);
                break;
        }
    };

    drawOpponentHpBar(currentHealth, maxHealth) {
        let canvas = document.getElementById("battleScreen");
        let ctx = canvas.getContext("2d");
        let hpWidth = currentHealth/maxHealth;

        this.hideOpponentHpBar();
        
        ctx.fillStyle = '#7CFC00';
        ctx.fillRect(100, 40, hpWidth*500, 40);
        ctx.fillStyle = 'crimson';
        ctx.fillRect(100 + (hpWidth*500), 40, (1 - hpWidth)*500, 40);

        ctx.beginPath();
        ctx.rect(100, 40, 500, 40)
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.font = "30px Arial"
        ctx.fillText(`${this.opponentCurrentPokemon.getPokemonName()}`, 100, 30); //Nickname vises ikke for opponent
        ctx.fillText(`Lv${this.opponentCurrentPokemon.getPokemonLevel()}`, 520, 30);

        let status = this.opponentCurrentPokemon.getStatus();
        switch (status) {
            case 'burn':
                ctx.fillStyle = 'red';
                ctx.fillText('BRN', 100, 110);
                break;

            case 'poison':
                ctx.fillStyle = 'purple';
                ctx.fillText('PSN', 100, 110);
                break;

            case 'toxic poison':
                ctx.fillStyle = 'purple';
                ctx.fillText('PSN', 100, 110);
                break;
        }
    };

    async updateHpBar(effect, delta, startingHp, givenPokemon) {
        
        if (givenPokemon.trainer == this.playerTrainer) {
            switch(effect) {
                case 'damage':
                    for (let i = 0; i < delta; i++) {
                        this.drawPlayerHpBar(startingHp - (i + 1), givenPokemon.getMaxHp());
                        await delay(20);
                    }
                    break;

                case 'healing':
                    for (let i = 0; i < delta; i++) {
                        this.drawPlayerHpBar(startingHp + (i + 1), givenPokemon.getMaxHp());
                        await delay(20);
                    }
                    break;
            }
        }

        else {
            switch(effect) {
                case 'damage':
                    for (let i = 0; i < delta; i++) {
                        this.drawOpponentHpBar(startingHp - (i + 1), givenPokemon.getMaxHp());
                        await delay(20);
                    }
                    break;

                case 'healing':
                    for (let i = 0; i < delta; i++) {
                        this.drawOpponentHpBar(startingHp + (i + 1), givenPokemon.getMaxHp());
                        await delay(20);
                    }
                    break;
            }
        }
        
        return new Promise((resolve) => {
            resolve();
        });
    }

    async showBattleSelection() {
        if (this.playerCurrentPokemon.preparingMove) {
            await this.handleTurn(0);
        }
        else {
            while (this.turnIsUnderway == false && this.ranAway == false) {
                this.battleDialog = "<table width='100%' height='100%'><tr><td colspan='2' rowspan='2'>What will " + this.playerCurrentPokemon.getNickname() + ` do?</td>
                    <td id="choice1">Fight</td>
                    <td id="choice2">Bag</td>
                </tr>
                <tr>
                    <td id="choice3">Pokemon</td>
                    <td id="choice4">Run away</td>
                </tr>
                </table>`;
                this.showBattleDialog();
                setButtonClasses(['choice1', 'choice2', 'choice3', 'choice4']);
                //await keypress
                let keypress = await waitingKeypress();
                if (keypress.keyCode >= 37 && keypress.keyCode <= 40) {
                    navigateButton(keypress.keyCode);
                }
                else if (keypress.keyCode == 13)  {//Enter
                //om enter, kjør en viss funksjon. Dette er kanskje krøllete, men jeg hadde problemer med å få onclick til å fungere på table-elementer
                    console.log("pressed enter");
                    switch (true) {
                        case (navX == 0 && navY == 0): //Fight
                            await this.showMoveSelection();
                            break;
    
                        case (navX == 1 && navY == 0): //Ball(eller bag?)
                            await this.showBagSelection();
                            break;
                            
                        case (navX == 0 && navY == 1): //Pokemon
                            await this.swapPokemonInBattle(); 
                            break;
                            
                        case (navX == 1 && navY == 1): //Run
                            if (this.calculateMoveOrder() || this instanceof trainerBattle) {
                                await this.runFromBattle();
                            }
                            else {
                                if (Math.floor(Math.random()*2) > 0) { //fifty-fifty
                                    await this.runFromBattle();
                                }
                                else {
                                    this.battleDialog = `Couldn't escape!`;
                                    this.showBattleDialog();
                                    await delay(2000);
    
                                    await this.opponentSoloTurn();                                
                                };
                                }
                                break;
                            }
                            
                            
                }
            }
        }
        
        if (this.turnIsUnderway) { //Den kommer her slik at vi unngår overlapping ved failed run away
            await this.endTurn();
        }
    };

    async showMoveSelection() {
        navX = 0;
        navY = 0;
        let moves = {1: '', 2: '', 3: '', 4: ''};
        let currentMoveCount = this.playerCurrentPokemon.getAvailableMoveCount();
        console.log("Movelist: " + this.playerCurrentPokemon.moveList)
        for (let i = 0; i < currentMoveCount; i++) {
            let index = (i + 1).toString();
            moves[index] = this.playerCurrentPokemon.moveList[i].moveName;
            
        }
        let pressedBackspace = false;

        while (this.turnIsUnderway == false && pressedBackspace == false) {
            let hoveredMove;
            switch (true) { //Se hvilken knapp som er valgt
                case (navX == 0 && navY == 0):
                    //øverst til venstre
                    hoveredMove = moves[1];
                    break;
        
                case (navX == 1 && navY == 0):
                    //øverst til høyre
                    hoveredMove = moves[2];
                    break;
        
                case (navX == 0 && navY == 1):
                    //nederst til venstre
                    hoveredMove = moves[3];
                    break;
        
                case (navX == 1 && navY == 1):
                    //nederst til høyre
                    hoveredMove = moves[4];
                    break;
            }
            let hoveredMoveObj = getMoveFromString(hoveredMove);

            this.battleDialog = `<table width='100%' height='100%'>
            <tr>
              <td id="choice1">${moves[1]}</td>
              <td id="choice2">${moves[2]}</td>
              <td width='25%' rowspan="2" colspan="2">Type: ${hoveredMoveObj.moveType}</td>
            </tr>
            <tr>
              <td id="choice3">${moves[3]}</td>
              <td id="choice4">${moves[4]}</td> 
            </tr>
            </table>`; //Table med valg, og await keypresses for navigering. Backspace eller escape går baklengs
        
            this.showBattleDialog();
            setButtonClasses(['choice1', 'choice2', 'choice3', 'choice4']);
            
            let keypress = await waitingKeypress();
            if (keypress.keyCode >= 37 && keypress.keyCode <= 40) {
                navigateButton(keypress.keyCode);
            }
            else if (keypress.keyCode == 13)  { //Enter
                await this.handleTurn(hoveredMoveObj.id);
                navX = 0;
                navY = 0;
            }
            else if (keypress.keyCode == 8 || keypress.keyCode == 27) {//Backspace eller Escape 
                pressedBackspace = true;
                navX = 0; //Gå tilbake der Fight står
                navY = 0;
            }
        } 
        
        return new Promise((resolve) => { //returner når move er valgt eller backspace/escape trykkes
            resolve();
        });
    };

    async showBagSelection() { 
        //Liste med valg, og await keypresses for navigering
        navX = 0;
        navY = 0;
        let bagReference = this.playerTrainer.bag.content;
        let pressedBackspace = false;
        let itemWasSelected = false; //velg effekt utifra navX siden da har vi kategori
        
        while (this.turnIsUnderway == false && itemWasSelected == false && pressedBackspace == false) {
            let totalItems = bagReference[navX].items.length; //bruk navX som indeks i bag
            this.battleDialog = `<table style="width:50%; height:98%">
                <tr>
                    <th rowspawn="${totalItems + 1}"><b>${bagReference[navX].category}</b></th>
                </tr>
            `;
            const choices = [];
            if (totalItems > 0) {
                for (i = 0; i < totalItems; i++) { //bruk navX som indeks i bag
                    let id = Number(i);
                    id++; 
                    this.battleDialog += `
                    <tr>
                        <td id="choice${id}">${bagReference[navX].items[i].name}</td>
                        <th>${bagReference[navX].items[i].count}</th>
                    </tr>
                    `;
                    choices.push('choice'+id);
                };
            }
            
            this.battleDialog += `</table>`;
            this.showBattleDialog();
            if (totalItems > 0) {
                setButtonClassesUpDown(choices);
            }

            let keypress = await waitingKeypress();
            if (keypress.keyCode == 37 || keypress.keyCode == 39) {//Høyre eller venstre, bytt kategori
                navigateLeftRight(keypress.keyCode, player.bag.content);
            }
            else if ((keypress.keyCode == 38 || keypress.keyCode == 40) && (totalItems > 0)) {//Opp eller ned, bla i items
                navigateUpDown(keypress.keyCode, choices);
            }
            else if ((keypress.keyCode == 13) && (totalItems > 0))  { //Enter
                //Item selected
                itemWasSelected = true;
                let selectedItem = bagReference[navX].items[navY].name;
                if (navX == 2) {
                    await this.throwBall(getPokeballIdFromString(selectedItem));
                }
                else {
                    //valgt noe annet enn en pokeball
                    this.battleDialog = this.playerTrainer.getName() + ' used ' + selectedItem + '!';
                    this.showBattleDialog();
                    this.turnIsUnderway = true;
                    await delay(2000);
                    
                    //sjekk hva itemet gjør
                    switch (bagReference[navX].items[navY].effect) {
                        case "heal":
                            this.healHealth(this.playerCurrentPokemon, healTable[0][selectedItem]);
                            this.battleDialog = `${this.playerCurrentPokemon.getNickname()} regained health!`;
                            this.showBattleDialog();
                            await delay(2000);
                            break;

                        case "momLunch":
                            this.battleDialog = `It was super delicious!`;
                            this.showBattleDialog();
                            await delay(2000);
                            this.battleDialog = `Your opponent got impatient!`;
                            this.showBattleDialog();
                            await delay(2000)
                            break;
                        }
                    bagReference[navX].items[navY].count--
                    if (bagReference[navX].items[navY].count == 0) {
                        this.playerTrainer.bag.deleteItem(navX, navY);
                    }
                    await this.opponentSoloTurn();
                }
                
                navX = 1; //Default til bag på battleselection
                navY = 0;
                
            }
            else if (keypress.keyCode == 8 || keypress.keyCode == 27) {//Backspace eller Escape 
                pressedBackspace = true;
                navX = 1; //Sette tilbake til der Pokemon knappen står
                navY = 0;
            }
        };

        return new Promise((resolve) => {
            resolve();
        });
    }

    async swapPokemonInBattle() { 
        //Åpne meny for å velge pokemon
        //Await riktig pokenon valg som i når pokemon er fainted
        navY = 0;
        let totalPokemon = this.playerTrainer.battlePokemon.length;
        let pressedBackspace = false;
        let pokemonWasSelected = false;
        
        while (this.turnIsUnderway == false && pokemonWasSelected == false && pressedBackspace == false) {
            this.battleDialog = `<table style="width:50%; height:98%">
            <tr>
                <td id="choice1" rowspan="${totalPokemon}">${this.playerCurrentPokemon.getNickname()}</td>
            </tr>
            `;
            const choices = ['choice1'];
            for (i = 1; i < totalPokemon; i++) {
                let id = Number(i);
                id++; 
                this.battleDialog += `
                <tr>
                    <td id="choice${id}">${this.playerTrainer.battlePokemon[i].getNickname()}</td>
                </tr>
                `;
                choices.push('choice'+id);
            }
            this.battleDialog += `</table>`;
            this.showBattleDialog();
            setButtonClassesUpDown(choices);
            let keypress = await waitingKeypress();
            if (keypress.keyCode >= 37 && keypress.keyCode <= 40) {
                navigateUpDown(keypress.keyCode, choices);
            }
            else if (keypress.keyCode == 13)  { //Enter
                pokemonWasSelected = await this.confirmPlayerPokemon(navY);
                if (pokemonWasSelected) {
                    await this.opponentSoloTurn();
                    navX = 0;
                    navY = 0;
                }
            }
            else if (keypress.keyCode == 8 || keypress.keyCode == 27) {//Backspace eller Escape 
                pressedBackspace = true;
                navY = 1; //Sette tilbake til der Pokemon knappen står
            }
        }
        return new Promise((resolve) => {
            resolve();
        });
    }

    async runFromBattle() { //Overstyr i trainer-battle
        this.ranAway = true;
        await this.endBattle(true);
        return new Promise((resolve) => {
            resolve();
        });
    }

    endBattle(playerWin) {
        if (playerWin == true) {
            for (pokemon in this.playerTrainer.battlePokemon) {
                //sett statuser og remaininghp
                let originalPokemon = this.playerTrainer.battlePokemon[pokemon].originalPokemon;
                let battlePokemon = this.playerTrainer.battlePokemon[pokemon];
                originalPokemon.remainingHp = battlePokemon.remainingHp;
                originalPokemon.status = battlePokemon.status;
            };
            
        };
        battleIsUnderway = false;
        viewBattle();
        this.opponent.faintedPokemon = 0;
        return new Promise((resolve) => {
            resolve();
        });
        //view funksjon for å slutte å vise kamp
    };

    async handleTurn(playerMove) { //moves går inn i id-format
        let opponentMove = Math.floor(Math.random()*this.opponentCurrentPokemon.getAvailableMoveCount());
        let opponentMoveIndex = this.opponentCurrentPokemon.moveList[opponentMove].id;

        this.turnIsUnderway = true;

        //Sjekk om to-turers moves er gjort klart, dvs skull bash
        if (this.opponentCurrentPokemon.preparingMove) {
            opponentMoveIndex = getMoveFromString(this.opponentCurrentPokemon.preparingMove).id;
        }
        if (this.playerCurrentPokemon.preparingMove) {
            playerMove = getMoveFromString(this.playerCurrentPokemon.preparingMove).id;
        }

        if (this.calculateMoveOrder()) { //Player går først
            console.log("Player went first");
            await this.handleMove(playerMove, this.playerCurrentPokemon, this.opponentCurrentPokemon); //Move, utøver, mottaker
            await this.handleMove(opponentMoveIndex, this.opponentCurrentPokemon, this.playerCurrentPokemon); 
            await this.damagePassive(this.playerCurrentPokemon);
            await this.damagePassive(this.opponentCurrentPokemon);
        }
        else { //Opponent går først
            console.log("Opponent went first");
            await this.handleMove(opponentMoveIndex,this.opponentCurrentPokemon, this.playerCurrentPokemon);
            await this.handleMove(playerMove, this.playerCurrentPokemon, this.opponentCurrentPokemon);
            await this.damagePassive(this.opponentCurrentPokemon);
            await this.damagePassive(this.playerCurrentPokemon);
        }
    };

    async handleMove(moveId, actingPokemon, receivingPokemon) {
        if (actingPokemon.status == 'fainted') {
            return;
        }
        else {
            //Use move
            let move = allPokemonMoves[moveId];
            let damageDone;
            this.battleDialog = actingPokemon.getNickname() + ' used ' + move.moveName + '!';
            this.showBattleDialog();
            await delay(2000);
            switch (move.effect) { //Er nok strengt tatt mer elegant å bygge funksjoner inn i selve move-objektene sånn at det blir enklere å lese og skalere
                case 'damage':
                    //console.log("Did a damaging move");
                    await this.damageDirect(move, actingPokemon, receivingPokemon);
                    break;
            
                case 'drain50percent':
                    //console.log("Did a draining move");
                    await this.drainHealth(actingPokemon, receivingPokemon, 50, move);
                    break;
        
                case 'damageBurn':
                    //console.log("Did a burning move");
                    damageDone = await this.damageDirect(move, actingPokemon, receivingPokemon);
                    
                    if (damageDone == 'immune') { //Ikke gidd å kjøre resten
                        break;
                    }

                    if (returnChance10Percent()) {
                        await this.setStatus(receivingPokemon, 'damageBurn');
                    };
                    //Set burn status chance
                    break;

                case 'damagePoison':
                    //console.log("Did a poisonous move");
                    damageDone = await this.damageDirect(move, actingPokemon, receivingPokemon);
                    
                    if (damageDone == 'immune') { //Ikke gidd å kjøre resten
                        //console.log("immune!")
                        break;
                    }

                    if (returnChance10Percent()) {
                        await this.setStatus(receivingPokemon, 'damagePoison');
                    };
                    //Set poison status chance
                    break;
            
                case 'toxicPoison':
                    //console.log("Used a badly toxic move");
                    await this.setStatus(receivingPokemon, 'toxic poison');
                    //Set toxicPoison status
                    break;

                case 'damageAtkBoost':
                    //console.log("Did an attack-boosting move")
                    damageDone = await this.damageDirect(move, actingPokemon, receivingPokemon);
                    if (returnChance10Percent()) {
                        await this.changeStat(actingPokemon, 'attack', 1);
                    };
                    //Attack up chance
                    break;

                case "atkChange":
                    //Attack up or down
                    await this.changeStat(receivingPokemon, 'attack', move.power);
                    break;

                case 'defChange':
                    //Defense up or down
                    await this.changeStat(actingPokemon, 'defense', move.power);
                    break;

                case 'spDefChange':
                    //Special defense up or down
                    await this.changeStat(actingPokemon, 'special defense', move.power);
                    break;

                case 'spDefAtkChange':
                    //Special defense and attack up or down
                    await this.changeStat(actingPokemon, 'special attack', move.power);
                    await this.changeStat(actingPokemon, 'special defense', move.power);
                    break;

                case 'healing':
                    //Heal back
                    let healing = actingPokemon.stats['hp']/(100/move.power); //move.power er %healing
                    await this.healHealth(actingPokemon, healing);
                    break;

                case 'skullBash':
                    if (actingPokemon.preparingMove) {
                        actingPokemon.preparingMove = false;
                        damageDone = await this.damageDirect(move, actingPokemon, receivingPokemon);
                    }
                    else {
                        actingPokemon.preparingMove = 'Skull Bash';
                        await this.changeStat(actingPokemon, 'defense', 1);
                        //Defense up
                    }
                    break;
            };
        };
        //console.log("move was handled by " + actingPokemon.getNickname());
        //this.showBattleDialog();
        await this.checkFainted(receivingPokemon);
        return new Promise((resolve) => {
            resolve();
        });
    };

    async opponentSoloTurn() {
        //Motstanderen får en tur
        let opponentMove = Math.floor(Math.random()*this.opponentCurrentPokemon.getAvailableMoveCount());
        let opponentMoveIndex = this.opponentCurrentPokemon.moveList[opponentMove].id;

        if (this.opponentCurrentPokemon.preparingMove) {
            opponentMoveIndex = getMoveFromString(this.opponentCurrentPokemon.preparingMove).id;
        };

        this.turnIsUnderway = true;
        await this.handleMove(opponentMoveIndex, this.opponentCurrentPokemon, this.playerCurrentPokemon); 
        await this.damagePassive(this.playerCurrentPokemon);
        await this.damagePassive(this.opponentCurrentPokemon);

        return new Promise((resolve) => {
            resolve();
        });
    };

    async endTurn() {
        //Forbered neste turn, gjør at man kan velge move?
        this.turnIsUnderway = false;
        console.log("endturn");
        await this.updateBattleState();
        if (battleIsUnderway) {
            this.showBattleSelection();
        }
        
    };

    calculateMoveOrder() {
        if (this.playerCurrentPokemon.stats['speed'] == this.opponentCurrentPokemon.stats['speed']) {
            return Math.floor(Math.random()*2); //Slår mynt om hvem som går først
        }
        else {
            return this.playerCurrentPokemon.stats['speed'] > this.opponentCurrentPokemon.stats['speed'];
        };
    };

    async setStatus(givenPokemon, newStatus) {
        let receivingType1 = givenPokemon.getPokemonType().type1;
        let receivingType2 = givenPokemon.getPokemonType().type2;
        switch (newStatus) {
            case 'fainted':
                givenPokemon.status = newStatus;
                this.battleDialog = givenPokemon.getNickname() + ' fainted!';
                break;

            case 'neutral':
                let oldStatus = givenPokemon.getStatus();
                givenPokemon.status = newStatus;
                this.battleDialog = givenPokemon.getNickname() + ' was cured of its ' + oldStatus + '!';
                break;

            case 'burn':
                if (receivingType1 == 'fire' || receivingType2 == 'fire' || givenPokemon.getStatus() != 'neutral') {
                    this.battleDialog = "The burn doesn't affect " + givenPokemon.getNickname() + "...";
                    break;
                }
                givenPokemon.status = newStatus;
                this.battleDialog = givenPokemon.getNickname() + ' was lit on fire!';
                break;

            case 'damageBurn': //Forksjellen er at denne skjer gjennom et annet move, istedet for et move som er kun for burn
                if (receivingType1 == 'fire' || receivingType2 == 'fire' || givenPokemon.getStatus() != 'neutral') {
                    break;
                }
                givenPokemon.status = 'burn';
                this.battleDialog = givenPokemon.getNickname() + ' was lit on fire!';
                break;

            case 'poison':
                if (receivingType1 == 'poison' || receivingType2 == 'poison' || givenPokemon.getStatus() != 'neutral') { //Vil ikke gjøre poison-type immun til vanlige poison moves. Kunne evt satt ting om til "poisonStatus" i stedet. Burde planlagt bedre.
                    this.battleDialog = "The poison doesn't affect " + givenPokemon.getNickname() + "...";
                    break;
                }
                if (receivingType1 == 'steel' || receivingType2 == 'steel' || givenPokemon.getStatus() != 'neutral') {//Kan forsåvidt sy disse to sammen, men tenker det er oversiktlig slik, i tillegg til at man da kan legge til mer særegen funksjonalitet per type
                    this.battleDialog = "The poison doesn't affect " + givenPokemon.getNickname() + "...";
                    break;
                }
                givenPokemon.status = newStatus;
                this.battleDialog = givenPokemon.getNickname() + ' was poisoned!';
                break;

            case 'damagePoison':
                if (receivingType1 == 'poison' || receivingType2 == 'poison' || givenPokemon.getStatus() != 'neutral') {
                    break;
                }
                if (receivingType1 == 'steel' || receivingType2 == 'steel' || givenPokemon.getStatus() != 'neutral') {//Kan forsåvidt sy disse to sammen, men tenker det er oversiktlig slik, i tillegg til at man da kan legge til mer særegen funksjonalitet per type
                    break;
                }
                givenPokemon.status = 'poison';
                this.battleDialog = givenPokemon.getNickname() + ' was poisoned!';
                break;

            case 'toxic poison':
                if (receivingType1 == 'poison' || receivingType2 == 'poison' || givenPokemon.getStatus() != 'neutral') {
                    this.battleDialog = "The poison doesn't affect " + givenPokemon.getNickname() + "...";
                    break;
                }
                if (receivingType1 == 'steel' || receivingType2 == 'steel' || givenPokemon.getStatus() != 'neutral') { 
                    this.battleDialog = "The poison doesn't affect " + givenPokemon.getNickname() + "...";
                    break;
                }
                givenPokemon.status = newStatus;
                this.battleDialog = givenPokemon.getNickname() + ' was badly poisoned!';
                break;
        }
        this.showBattleDialog();
        if (givenPokemon.trainer == this.playerTrainer) {
            this.drawPlayerHpBar(this.playerCurrentPokemon.getRemainingHp(), this.playerCurrentPokemon.getMaxHp());
        }
        else {
            this.drawOpponentHpBar(this.opponentCurrentPokemon.getRemainingHp(), this.opponentCurrentPokemon.getMaxHp());
        }
        
        
        await delay(2000);
        return new Promise((resolve) => {
            resolve();
        });
    };

    async checkFainted(givenPokemon) {
        if (givenPokemon.getRemainingHp() <= 0) { //Vil ha den her fremfor updateBattleState fordi idk
            
            await faintPokemon(givenPokemon);
            this.battleDialog = givenPokemon.getNickname() + ' fainted!';
            this.showBattleDialog();
            await delay(1000);
            if (givenPokemon.trainer == this.playerTrainer) {
                await this.showPlayerPokemon();
            }
            else {
                await this.showOpponentPokemon();
            }
            
            await delay(1000);
        };
        return new Promise((resolve) => {
            resolve();
        });
    }

    async damageHealth(givenPokemon, damage) {
        let fixedDamage = this.fixDamage(damage, givenPokemon);
        givenPokemon.remainingHp -= fixedDamage;
        await this.updateHpBar('damage', fixedDamage, givenPokemon.getRemainingHp() + fixedDamage, givenPokemon);
    };

    async healHealth(givenPokemon, healing) {
        healing = Math.ceil(healing); //Ønsker alltid å heal minimum 1;
        let startHp = givenPokemon.getRemainingHp();
        if ((startHp + healing) > givenPokemon.stats['hp']) { //Unngå å heale over maks
            healing = givenPokemon.stats['hp'] - startHp;
        }
        await this.updateHpBar('healing', healing, startHp, givenPokemon);
        givenPokemon.remainingHp += healing;
        this.battleDialog = givenPokemon.getNickname() + " regained health!";
        this.showBattleDialog();
        await delay(1500);
    };

    async damageDirect(move, actingPokemon, receivingPokemon) { //Direkte damage
        let damageDone = await this.damagingMove(move, actingPokemon, receivingPokemon);
        //console.log(damageDone);
        return new Promise((resolve) => {
            resolve(damageDone);
        });
    };

    async damagePassive(givenPokemon) {
        //Se etter status og legg på riktig damage
        switch (givenPokemon.getStatus()) {
            case "fainted":
                this.battleDialog = '';
                this.showBattleDialog();
                return new Promise((resolve) => {
                    resolve();
                });

            case "neutral":
                this.battleDialog = '';
                this.showBattleDialog();
                break;

            case "burn":
                this.battleDialog = givenPokemon.getNickname() + ' was hurt by its burn!';
                let burnDamage = Math.ceil((givenPokemon.stats['hp'])/16);
                burnDamage = this.fixDamage(burnDamage, givenPokemon)
                this.damageHealth(givenPokemon, burnDamage);
                await delay(1000);
                this.showBattleDialog();
                await delay(2000);
                break;

            case "poison":
                this.battleDialog = givenPokemon.getNickname() + ' was hurt by poison!';
                let poisonDamage = Math.ceil((givenPokemon.stats['hp'])/8);
                poisonDamage = this.fixDamage(poisonDamage, givenPokemon);
                this.damageHealth(givenPokemon, poisonDamage);
                await delay(1000);
                this.showBattleDialog();
                await delay(2000);
                break;

            case 'toxic poison':
                this.battleDialog = givenPokemon.getNickname() + ' was hurt by poison!';
                await this.damageToxic(givenPokemon);
                await delay(1000);
                this.showBattleDialog();
                await delay(2000);
                break;
        }

        await this.checkFainted(givenPokemon);
        return new Promise((resolve) => {
            resolve();
        });
    };

    async damageToxic(givenPokemon) {
        givenPokemon.toxicCount++;
        let damage = Math.ceil((givenPokemon.stats['hp']*givenPokemon.toxicCount)/16);
        damage = this.fixDamage(damage, givenPokemon);
        this.damageHealth(givenPokemon, damage); 
    };

    async damagingMove(move, actingPokemon, receivingPokemon) { //Formel tatt fra https://bulbapedia.bulbagarden.net/wiki/Damage#Damage_calculation generasjon 3, har kutta ut ting jeg ikke implementerte, type random, light screen osv. Har likeså physical/special split fra generasjon 4 :^)
        
        let receivingType1 = receivingPokemon.getPokemonType().type1;
        let receivingType2 = receivingPokemon.getPokemonType().type2;

        if (checkImmunity(move.moveType, receivingType1)) {
            this.battleDialog = "It doesn't affect " + receivingPokemon.getPokemonName() + '...';
            this.showBattleDialog();
            await delay(2000);
            return "immune";
        }
        if (checkImmunity(move.moveType, receivingType2)) {
            this.battleDialog = "It doesn't affect " + receivingPokemon.getPokemonName() + '...';
            this.showBattleDialog();
            await delay(2000);
            return "immune";
        }

        let attackingStat;
        let defendingStat;
        let burnFactor = 1;
        let damage;

        //Dialog-meldinger
        this.battleDialog = '';
        let resisted = false;
        let weakTo = false;

        //Sjekk om physical eller special move
        if (move.moveCategory == 'physical') {
            attackingStat = actingPokemon.battleStats['attack'];
            defendingStat = receivingPokemon.battleStats['defense'];
            if (actingPokemon.status == 'burn') {
                burnFactor = 0.5;
            }
        }
        else {
            attackingStat = actingPokemon.battleStats['special attack'];
            defendingStat = receivingPokemon.battleStats['special defense'];
        }
        
        //Base damage
        damage = ((((((2*actingPokemon.level)/5) + 2)* move.power * (attackingStat/defendingStat))/50)* burnFactor) + 2;
        
        //STAB(same-type-attack-bonus)
        if (move.moveType == actingPokemon.getPokemonType().type1 || move.moveType == actingPokemon.getPokemonType().type2) { 
            damage = damage*1.5;
        }

        //Sjekk resistance
        if (checkResistance(move.moveType, receivingType1)) {
            damage = damage/2;
            resisted = true;
        }
        if (checkResistance(move.moveType, receivingType2)) {
            damage = damage/2;
            resisted = true;
        }

        //Sjekk weakness
        if (checkWeakness(move.moveType, receivingType1)) {
            damage = damage*2;
            weakTo = true;
        }
        if (checkWeakness(move.moveType, receivingType2)) {
            damage = damage*2;
            weakTo = true;
        }

        damage = damage * ((100-(Math.floor(Math.random()*16))))/100 //random mellom 85-100%

        damage = Math.ceil(damage); //Ønsker alltid minimum 1 dmg derfor ceil

        //Tilbakemelding. Det skal ikke være noen tilbakemelding dersom både weakness og resist gjør utslag.
        if (resisted && !weakTo) {
            this.battleDialog = "It's not very effective...";
        }
        else if (weakTo && !resisted) {
            this.battleDialog = "It's super effective!";
        }

        console.log(damage + " damage dealt");
        damage = this.fixDamage(damage, receivingPokemon);
        await this.damageHealth(receivingPokemon, damage);

        //console.log(receivingPokemon.getPokemonName() + " took direct damage from a move with power " + move.power + " and type " + move.moveType + '. The move did ' + damage + ' damage.' + this.battleDialog);
        await delay(200);
        this.showBattleDialog();
        await delay(1500);
        return new Promise((resolve) => {
            resolve(damage);
        });
    };

    fixDamage(damage, receivingPokemon) {
        let remainingHp = receivingPokemon.getRemainingHp();
        if (damage > remainingHp) {
            damage = remainingHp; //Dette forbedrer performance + passer på at drain hp moves ikke gir ekstremt mye hp tilbake via overkill
        }
        return damage;
    };

    async drainHealth(actingPokemon, receivingPokemon, potency, move) { //Potency er gitt i %
        let damageDone = await this.damagingMove(move, actingPokemon, receivingPokemon);
        if (damageDone == 'immune') {
            return;
        }
        this.battleDialog = receivingPokemon.getNickname() + "'s health was drained!";
        this.showBattleDialog();
        await delay(1500);
        await this.healHealth(actingPokemon, damageDone/(100/potency)); //Potency blir omgjort til en brukbar divisor
        return new Promise((resolve) => {
            resolve();
        });
    }

    async changeStat(givenPokemon, stat, stage) {
        
        if (givenPokemon.stages[stat] == 6) {
            this.battleDialog = givenPokemon.getNickname() + "'s " + stat + " can't go any higher!";
        }
        else if (givenPokemon.stages[stat] == -6) {
            this.battleDialog = givenPokemon.getNickname() + "'s " + stat + " can't go any lower!";
        }
        else {        
            givenPokemon.stages[stat] += stage;
            if (givenPokemon.stages[stat] > 6) {
                givenPokemon.stages[stat] = 6
            }
            else if (givenPokemon.stages[stat] < -6) {
                givenPokemon.stages[stat] = -6
            }

            if (stage == 1) {
                this.battleDialog = givenPokemon.getNickname() + "'s " + stat + " went up!";
            }
            else if (stage > 1) {
                this.battleDialog = givenPokemon.getNickname() + "'s " + stat + " went up sharply!";
            }
            else if (stage == -1) {
                this.battleDialog = givenPokemon.getNickname() + "'s " + stat + " was lowered!";
            }
            else {
                this.battleDialog = givenPokemon.getNickname() + "'s " + stat + " was harshly lowered!";
            }
        }
        
        this.showBattleDialog();
        await delay(2000);
        this.updateStats(givenPokemon, stat);
    };

    updateStats(givenPokemon, stat) {
        //formel tatt fra https://bulbapedia.bulbagarden.net/wiki/Stat_modifier#Stage_multipliers 
        let stageConstant = 2;
        let stageFactor;
        
        if (givenPokemon.stages[stat] < 0) {
            stageFactor = (stageConstant/(2 + (-givenPokemon.stages[stat])));
        }

        else {
            stageFactor = ((2 + givenPokemon.stages[stat])/(stageConstant));
        }
        
        givenPokemon.battleStats[stat] = givenPokemon.stats[stat] * stageFactor;
    };

    resetStats(givenPokemon) {
        for (i in givenPokemon.stages) {
            givenPokemon.stages[i] = 0;
            this.updateStats(givenPokemon, i);
        }
    };

    async throwBall(pokeballId) { 
        this.battleDialog = this.playerTrainer.getName() + ' used ' + pokeballs[pokeballId].ballName + '!';
        this.showBattleDialog();
        this.turnIsUnderway = true;
        let ball = pokeballs[pokeballId];
        let ballString = ball.ballName;
        let bagReference = this.playerTrainer.bag.content[2].items;
        for (let ballIndex in bagReference) {
            if (bagReference[ballIndex].name == ballString) {
                bagReference[ballIndex].count--;
                if (bagReference[navY].count == 0) {
                    this.playerTrainer.bag.deleteItem(navX, navY);
                }
            }
        }
        await delay(3000);
        this.battleDialog = "The opposing trainer blocked the pokeball! ▼";
        this.showBattleDialog();
        await waitingContinue();
        this.battleDialog = "Don't be a thief! ▼";
        this.showBattleDialog();
        await waitingContinue();

        //Motstanderen får en tur
        await this.opponentSoloTurn();
        
        return new Promise((resolve) => {
            resolve();
        });
    };

    async showBall() {
        let canvas = document.getElementById("battleScreen");
        let ctx = canvas.getContext("2d");
        let pokeballImg = new Image();
        pokeballImg.onload = function() {
            ctx.drawImage(pokeballImg, 750, 150);
        };
        
        pokeballImg.src = 'img/ballStationary.png';
        
        return new Promise((resolve) => {
            resolve();
        });
    };

    showNumberOfPokemon() {
        let canvas = document.getElementById("battleScreen");
        let ctx = canvas.getContext("2d");
        
        for (let i = 1; i < 7; i++) {
            ctx.beginPath();
            ctx.arc((i*60), 75, 20, 0, 2 * Math.PI);
            if (i <= this.opponent.battlePokemon.length) {
                if (i <= this.opponent.readyPokemon) {
                    ctx.fillStyle = "red";
                }
                else {
                    ctx.fillStyle = "black";
                }
            }
            else {
                ctx.fillStyle = "lightgrey";
            }
            ctx.fill(); 
        }
         
    };

    hideNumberOfPokemon() {
        let canvas = document.getElementById("battleScreen");
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 380, 95);
    }
    
};

class wildBattle extends Battle {

    pokemonWasCaught;

    constructor(playerTrainer, opponent) {
        super(playerTrainer, opponent);
        this.pokemonWasCaught = false;
    }

    async startBattle() {
        this.opponentCurrentPokemon.setNickname('Wild ' + this.opponentCurrentPokemon.getPokemonName());
        this.battleDialog = this.opponentCurrentPokemon.getNickname() + ' appeared!  ▼';
        this.showBattleDialog();
        this.showOpponentPokemon();
        await waitingContinue();
        this.battleDialog = "Go, " + this.playerCurrentPokemon.getNickname() + '!';
        this.showBattleDialog();
        await delay(1000);
        this.showPlayerPokemon();
        await delay(1000);
        this.showBattleSelection();
    };

    async endBattle(playerWin) { //TODO sende pokemon til pc dersom man har 6 i party!!
        if (playerWin == true) {
            if (this.pokemonWasCaught) {
                this.battleDialog = this.opponentCurrentPokemon.getPokemonName() + ' was caught!';
                this.showBattleDialog();
                await delay(1500);

                this.battleDialog = `<table style="width:100%; height:100%">
                <tr>
                    <td rowspan="3">Would you like to nickname the newly caught ${this.opponentCurrentPokemon.getPokemonName()}?</td> 
                </tr>
                <tr>
                    <td id="choice1">Yes</td>
                </tr>
                <tr>
                    <td id="choice2">No</td>
                </tr>
                </table>`;
                this.showBattleDialog();
                let choices = ['choice1', 'choice2'];
                navY = 0;
                let keypress = 0; 
                //se om promise objektet er riktig, om ikke, prøv igjen
                while (keypress.keyCode != 13) { //Vent på enter
                    console.log("Choose y/n");
                    navigateUpDown(keypress.keyCode, choices);
                    setButtonClassesUpDown(choices);
                    keypress = await returnKeypress();
                }

                if (navY == 0) { //Valgt ja
                    this.battleDialog = `<input id='nicknameField' type='text' placeholder='${this.opponentCurrentPokemon.getPokemonName()}'></input>
                    <br><button id="nicknameButton" onclick="submitNickname()">Ok</button>`;
                    this.showBattleDialog()    
                    let nickname = await nickNameChosen();
                    this.opponentCurrentPokemon.originalPokemon.setNickname(nickname)
                }

                this.playerTrainer.battlePokemon.push(this.opponentCurrentPokemon); //For å ta vare på remainingHp og statuser
                this.playerTrainer.trainerPokemon.push(this.opponentCurrentPokemon.originalPokemon); //Dersom ikke nickname var valgt, så hentes det ekte navnet implisitt siden battlePokemon-objektet er det eneste som endrer nickname til Wild.
                this.playerTrainer.readyPokemon += 1;
                this.opponentCurrentPokemon.originalPokemon.trainer = this.playerTrainer;
                this.battleDialog = this.opponentCurrentPokemon.originalPokemon.getNickname() + ' was added to the party.  ▼';
                this.showBattleDialog();
            }

            else if (this.ranAway) {
                this.battleDialog = `Got away safely!  ▼`;
                this.showBattleDialog();
            }

            else {
                this.battleDialog = 'Player defeated ' + this.opponentCurrentPokemon.getNickname() + '!  ▼';
                this.showBattleDialog();
            }
            for (pokemon in this.playerTrainer.battlePokemon) {
                //sett statuser og remaininghp
                let originalPokemon = this.playerTrainer.battlePokemon[pokemon].originalPokemon;
                let battlePokemon = this.playerTrainer.battlePokemon[pokemon];
                originalPokemon.remainingHp = battlePokemon.remainingHp;
                originalPokemon.status = battlePokemon.status;
            };
            changeScenery();
            await waitingContinue();
        }
        else {
            this.battleDialog = "Player was defeated!  ▼";
            this.showBattleDialog();
            await waitingContinue();
            let moneyLoss = (this.playerTrainer.money)/2;
            this.playerTrainer.money -= moneyLoss
            this.battleDialog = `${this.playerTrainer.getName()} panicked and dropped ${moneyLoss}$...  ▼`
            this.showBattleDialog();
            await waitingContinue();
            this.battleDialog = `${this.playerTrainer.getName()} hurried to the pokecenter!  ▼`;
            this.showBattleDialog();
            await waitingContinue();
            await pokecenter(this.playerTrainer);
        };
        battleIsUnderway = false;
        this.opponent.faintedPokemon = 0;
        viewBattle();
        return new Promise((resolve) => {
            resolve();
        });
    };
  
    async throwBall(pokeballId) { //Formel tatt fra https://bulbapedia.bulbagarden.net/wiki/Catch_rate#Capture_method_.28Generation_III-IV.29 
        let ball = pokeballs[pokeballId];
        let ballString = ball.ballName;
        let bagReference = this.playerTrainer.bag.content[2].items;
        let currentStatus = this.opponentCurrentPokemon.getStatus();
        let chanceMultiplier = ball.multiplier;
        let statusMultiplier = 1;
        let shakeCount = 0;
        this.turnIsUnderway = true;

        for (let ballIndex in bagReference) {
            if (bagReference[ballIndex].name == ballString) {
                bagReference[ballIndex].count--;
                if (bagReference[navY].count == 0) {
                    this.playerTrainer.bag.deleteItem(navX, navY);
                }
            }
        }

        //Sjekk spesial-baller
        if (ball.specialCondition) {
            switch (ballString) {
                case 'Dive Ball':
                    if (this.opponentCurrentPokemon.type1 == 'water' || this.opponentCurrentPokemon.type2 == 'water') {
                        chanceMultiplier = 3;
                    }
                    break;
                
            };
        };
        //Sjekk status
        if (currentStatus == 'sleep') {
            statusMultiplier = 2;
        }
        if (currentStatus == 'paralyze' || currentStatus == 'poison' || currentStatus == 'toxic poison' || currentStatus == 'burn' || currentStatus == 'frozen') {
            statusMultiplier = 1.5;
        }
        //Formel fra https://bulbapedia.bulbagarden.net/wiki/Catch_rate#Capture_method_.28Generation_III-IV.29 
        let modifiedCatchRate = ((((3 * this.opponentCurrentPokemon.stats['hp']) - (2 * this.opponentCurrentPokemon.remainingHp))* this.opponentCurrentPokemon.getCatchRate() * chanceMultiplier)/(3 * this.opponentCurrentPokemon.stats['hp'])) * statusMultiplier;

        this.battleDialog = this.playerTrainer.getName() + ' used ' + ballString + '!';
        this.showBattleDialog();
        await delay(1500);
        this.hideOpponentPokemon();
        this.showBall(`img/ballStationary.png`);
        await delay(1500);

        if (this.shakeCheck(modifiedCatchRate)) {
            //Ballen rister en gang
            console.log('the ball shook once')
            shakeCount++;
            await this.shakeRight();
            if (this.shakeCheck(modifiedCatchRate)) {
                //to ganger
                console.log('the ball shook twice')
                shakeCount++;
                await this.shakeLeft();
                if (this.shakeCheck(modifiedCatchRate)) {
                    //tre ganger
                    console.log('the ball shook three times')
                    shakeCount++;
                    await this.shakeRight();
                    if (this.shakeCheck(modifiedCatchRate)) {
                        //Pokemonen ble fanget!
                        await delay(2000)
                        this.pokemonWasCaught = true;
                    }
                }
            }
        }

        if (this.pokemonWasCaught == true) { //Man klarte å fange pokemonen
            await this.endBattle(true);
        }
        else { //Man klarte ikke fange pokemonen
            this.battleDialog = ballShakeMessage[shakeCount];
            this.showBattleDialog();
            this.hideOpponentPokemon();
            this.showOpponentPokemon();
            await delay(2000);

            await this.opponentSoloTurn();
        };

        return new Promise((resolve) => {
            resolve();
        });
    };

    shakeCheck(modifiedCatchRate) {
        let shakeProbability = 1048560/(Math.sqrt(Math.sqrt((16711680/modifiedCatchRate)))) // https://bulbapedia.bulbagarden.net/wiki/Catch_rate#Capture_method_.28Generation_III-IV.29 
        return shakeProbability >= Math.random()*65536;
    };

    async showBall(ballImgSrc) {
        let canvas = document.getElementById("battleScreen");
        let ctx = canvas.getContext("2d");
        let pokeballImg = new Image();
        pokeballImg.onload = function() {
            ctx.drawImage(pokeballImg, 750, 150);
        };
        
        pokeballImg.src = ballImgSrc; //Kunne implementert flere ballimgs, men meh
        
        return new Promise((resolve) => {
            resolve();
        });
    }

    async shakeRight() {
        this.hideOpponentPokemon();//Fungerer som en slags clear for skjermen på dette området
        await this.showBall(`img/ballRight.png`);
        await delay(500);
        this.hideOpponentPokemon();
        await this.showBall(`img/ballStationary.png`);
        await delay(1000)
        return new Promise((resolve) => {
            resolve();
        });
    };

    async shakeLeft() {
        this.hideOpponentPokemon();
        await this.showBall(`img/ballLeft.png`);
        await delay(500);
        this.hideOpponentPokemon();
        await this.showBall(`img/ballStationary.png`);
        await delay(1000);
        return new Promise((resolve) => {
            resolve();
        });
    }
    
};

class trainerBattle extends Battle {
    
    constructor(playerTrainer, opponent) {
        super(playerTrainer, opponent);
        for (pokemon in opponent.battlePokemon) {
            opponent.battlePokemon[pokemon].setNickname("Foe's " + this.opponent.battlePokemon[pokemon].getPokemonName());
        }
        //this.opponentCurrentPokemon.setNickname("Foe's " + this.opponentCurrentPokemon.getPokemonName());
        this.battleDialog = opponent.getName() + ' would like to battle!';
    };

    async startBattle() {
        this.battleDialog = this.opponent.getName() + ' would like to battle!  ▼';
        this.showBattleDialog();
        this.showOpponentPortrait();
        this.showNumberOfPokemon();
        await waitingContinue();
        this.hideNumberOfPokemon();
        this.battleDialog = this.opponent.getName() + ' sent out ' + this.opponentCurrentPokemon.getPokemonName() + '.';
        this.showBattleDialog();
        this.hideOpponenPortrait();
        this.showBall();
        await delay(1000);
        this.showOpponentPokemon();
        await delay(1000);
        this.battleDialog = "Go, " + this.playerCurrentPokemon.getNickname() + '!';
        this.showBattleDialog();
        await delay(1000);
        this.showPlayerPokemon();
        await delay(1000);
        this.showBattleSelection();
    };

    async runFromBattle() {
        this.battleDialog = `There is no running away from a trainer battle!  ▼`;
        this.showBattleDialog();
        await waitingContinue();
    }
    //Metode for å gi ut penger og skrive ut dialog
    async endBattle(playerWin) {
        if (playerWin == true) {
            for (pokemon in this.playerTrainer.battlePokemon) {
                //sett statuser og remaininghp
                let originalPokemon = this.playerTrainer.battlePokemon[pokemon].originalPokemon;
                let battlePokemon = this.playerTrainer.battlePokemon[pokemon];
                originalPokemon.remainingHp = battlePokemon.remainingHp;
                originalPokemon.status = battlePokemon.status;
                originalPokemon.levelUp();
            };
            this.battleDialog = 'Player defeated ' + this.opponent.getName() + '!  ▼';
            this.showBattleDialog();
            await waitingContinue();
            this.showOpponentPortrait();
            this.battleDialog = this.opponent.getLoseDialogue() + '  ▼';
            this.showBattleDialog();
            await waitingContinue();
            this.playerTrainer.money += this.opponent.money;
            this.battleDialog = `${this.playerTrainer.getName()} got ${this.opponent.money}$ for winning!  ▼`;
            this.showBattleDialog();
            await waitingContinue();
            overworldDialog = `Your pokemon levelled up!  ▼`;
            changeScenery();
        }
        else {
            this.battleDialog = "Player was defeated!  ▼";
            this.showBattleDialog();
            await waitingContinue();
            this.hideOpponentHpBar();
            this.hideOpponentPokemon();
            this.showOpponentPortrait();
            this.battleDialog = this.opponent.getWinDialogue() + '  ▼';
            this.showBattleDialog();
            await waitingContinue();
            let moneyLoss = (this.playerTrainer.money)/2;
            this.playerTrainer.money -= moneyLoss
            this.battleDialog = `${this.playerTrainer.getName()} paid out ${moneyLoss}$ in winnings...  ▼`
            this.showBattleDialog();
            await waitingContinue();
            this.battleDialog = `${this.playerTrainer.getName()} hurried to the pokecenter!  ▼`;
            this.showBattleDialog();
            await waitingContinue();
            await pokecenter(this.playerTrainer);
        };
        battleIsUnderway = false;
        this.opponent.faintedPokemon = 0;
        viewBattle();
        return new Promise((resolve) => {
            resolve();
        });
    };

    showOpponentPortrait() {
        let canvas = document.getElementById("battleScreen");
        let ctx = canvas.getContext("2d");
        let portraitImg = new Image();
        portraitImg.onload = function() {
            ctx.drawImage(portraitImg, 600, 0);
        };
        
        portraitImg.src = `${this.opponent.getPortraitSrc()}`;
    };

    hideOpponenPortrait() {
        let canvas = document.getElementById("battleScreen");
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(600, 0, 500, 500)
    };

};

function checkResistance(moveType, defendingType) {
    if (defendingType == null) { //Mer eller mindre enn throw-exception
        return false;
    }
    let defendingTypeId = allPokemonTypes[defendingType];
    return resistances[defendingTypeId].includes(moveType);
};

function checkWeakness(moveType, defendingType) {
    if (defendingType == null) { //Mer eller mindre enn throw-exception
        return false;
    }
    let defendingTypeId = allPokemonTypes[defendingType];
    return weaknesses[defendingTypeId].includes(moveType);
}

function checkImmunity(moveType, defendingType) {
    if (defendingType == null) { //Mer eller mindre enn throw-exception
        return false;
    }
    let defendingTypeId = allPokemonTypes[defendingType];
    return immunities[defendingTypeId].includes(moveType);
}

function returnChance10Percent() {
    return Math.floor((Math.floor(Math.random()*11))/10);
}