//andre controller-funksjoner
function waitingContinue() {
    return new Promise((resolve) => {
      document.addEventListener('keydown', pressedAny);
      function pressedAny(key) {
        if (key.keyCode) { //any-knapp
          document.removeEventListener('keydown', pressedAny);
          resolve();
        }
      }
    });
}

function waitingKeypress() { //håndter forskjellige keypresses for å navigere menu osv
    return new Promise((resolve) => {
      document.addEventListener('keydown', pressedKey);
      function pressedKey(key) {
          document.removeEventListener('keydown', pressedKey);
          resolve(key);
        };
    })
};
    
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

async function returnKeypress() { //Dette er for å bremse while-loop
    let response = await waitingKeypress();
    return new Promise((resolve) => {
        resolve(response);
    });
}

function returnLearnsetMoveString(pokemonId, level, moveNumber) {
    if (learnSet[pokemonId][moveNumber]) {
        console.log("Checking " + getPokemonNameFromId(pokemonId) + " at level " + level + " for " + moveNumber);
        if (learnSet[pokemonId][moveNumber].level <= level) {
            return getMoveStringFromId(learnSet[pokemonId][moveNumber].moveId)
        }
    }
    return null;
}

function submitNickname() {
    let nickname = document.getElementById('nicknameField').value;
    if (nickname) {
        return nickname;
    }
    else {
        //Feilmelding
        return null;
    }
    
}

function nickNameChosen() {
    return new Promise((resolve) => {
        document.addEventListener('click', pressedSubmitNickname);
        function pressedSubmitNickname(button) {
          let nickname = document.getElementById('nicknameField').value;
          if (button.srcElement.id == 'nicknameButton' && nickname) { //nickname-knappen
            
            document.removeEventListener('click', pressedSubmitNickname);
            resolve(nickname);
          }
        }
      });
}

function navigateButton(keycode) {
    //Legg til/trekk fra x og y for å huske på navigering
    switch (keycode) {
        case 39://høyre
            navX = Math.max(navX, 1);
            break;

        case 37://venstre
            navX = Math.min(navX, 0);
            break;

        case 38://opp
            navY = Math.min(navY, 0);
            break;

        case 40://ned
            navY = Math.max(navY, 1);
            break;
    }

    switch (true) { //Sjekk om vi har et valid valg
        case (navX == 0 && navY == 0):
            //øverst til venstre
            //Antar at denne alltid er sann
            break;
        
        case (navX == 1 && navY == 0):
            //øverst til høyre
            if (!document.getElementById("choice2").innerHTML) {
                navX = 0;
            } 
            break;
        
        case (navX == 0 && navY == 1):
            //nederst til venstre
            if (!document.getElementById("choice3").innerHTML) {
                navY = 0;
            } 
            break;
        
        case (navX == 1 && navY == 1):
            //nederst til høyre
            if (!document.getElementById("choice4").innerHTML) {
                switch (keycode) {
                    case 39://høyre
                        navY = 0; //Gå fra valg 3 til valg 2
                        break;

                    case 40://ned
                        navX = 0; //Gå fra valg 2 til valg 3
                        break;
                }
            } 
            break;
    }
}

function navigateUpDown(keycode, choices) {
    let numberOfChoices = choices.length
    switch (keycode) {
        case 38://opp
            navY -= 1;
            break;

        case 40://ned
            navY += 1;
            break;

        case 39://høyre, gå nederst
            navY = numberOfChoices - 1;
            break;

        case 37://venstre, gå til starten
            navY = 0;
            break;
    }
    switch (navY) {//sjekk om vi har et valid valg
        case -1: //Om vi prøver å bla bakover det første valget
            navY = 0;
            break;

        case numberOfChoices: //Om vi prøver å bla forbi det siste valget
            navY = numberOfChoices - 1;
            break;
    }

}

function navigateLeftRight(keycode, choices) {
    let numberOfChoices = choices.length
    navY = 0;
    switch (keycode) {
        case 38://opp, gå til starten
            navX = 0;
            break;

        case 40://ned, gå til slutten
            navX = numberOfChoices  - 1;
            break;

        case 39://høyre
            navX += 1;
            break;

        case 37://venstre
            navX -= 1;
            break;
    }
    switch (navX) {//Sjekk om vi har et valid valg
        case -1: //Om vi prøver å bla bakover det første valget
            navX = 0;
            break;
        
        case numberOfChoices: //Om vi prøver å bla forbi det siste valget
            navX = numberOfChoices - 1;
            break;
    }
}

function setButtonClasses(choices) {
    resetButtonClasses(choices);
    switch (true) {
        case (navX == 0 && navY == 0):
            //Sett øverst til venstre
            document.getElementById("choice1").className = 'buttonHovered';
            break;

        case (navX == 1 && navY == 0):
            //Sett øverst til høyre
            document.getElementById("choice2").className = 'buttonHovered';
            break;

        case (navX == 0 && navY == 1):
            //Sett nederst til venstre
            document.getElementById("choice3").className = 'buttonHovered';
            break;

        case (navX == 1 && navY == 1):
            //Sett nederst til høyre
            document.getElementById("choice4").className = 'buttonHovered';
            break;
    }
}

function setButtonClassesUpDown(choices) {
    resetButtonClasses(choices)
    let id = choices[navY];
    document.getElementById(id).className = 'buttonHovered';
}

function resetButtonClasses(choices) {

    for (choice in choices) {
        let num = Number(choice);
        num++;
        let id = 'choice' + num;
        if (document.getElementById(id).innerHTML) {
            document.getElementById(id).className = 'selectionButton';
        }
        
    }
    /*
    document.getElementById("choice1").className = '';
    document.getElementById("choice2").className = '';
    document.getElementById("choice3").className = '';
    document.getElementById("choice4").className = '';

    //Se etter tomme valg
    if (document.getElementById("choice1").innerHTML) {
        document.getElementById("choice1").className = 'selectionButton';
    }
    if (document.getElementById("choice2").innerHTML) {
        document.getElementById("choice2").className = 'selectionButton';
    }
    if (document.getElementById("choice3").innerHTML) {
        document.getElementById("choice3").className = 'selectionButton';
    }
    if (document.getElementById("choice4").innerHTML) {
        document.getElementById("choice4").className = 'selectionButton';
    }
    */
}

async function test() {
    console.log('waiting keypress..')
    let keypress = await waitingKeypress();
    console.log(keypress.keyCode);
    return new Promise((resolve) => {
        resolve();
    });
}

async function testTest() {
    while (true) {
        await test();
        console.log("wow");
    }
    
}