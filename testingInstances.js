function runTrainerInstancing(playerName) {
    //pokemon1 = new Pokemon("Bulbasaur", 5, "Tackle", "Absorb", null, null);
    pokemon1 = new Pokemon("Sudowoodo", 10, "Scratch", "Metal Claw", "Rock Throw", null);
    pokemon2 = new Pokemon('Registeel', 50, "Metal Claw", null, null, null);
    pokemon3 = new Pokemon("Sudowoodo", 50, "Rock Throw", "Skull Bash", "Harden", null);
    pokemon4 = new Pokemon("Venusaur", 50, "Absorb", "Toxic", "Calm Mind", "Feather Dance");
    pokemon5 = new Pokemon("Registeel", 100, "Metal Claw", null, null, null);
    pokemon6 = new Pokemon("Charizard", 50, "Ember", "Metal Claw", null, null);
    pokemon7 = new Pokemon("Venusaur", 50, "Toxic", null, null, null);
    trainer1 = new npcTrainer('Joel', pokemon1, pokemon2, null, null, null, null, 200, 'Liker du fisk?', 'Hold i torsken!', 'Fisk er sunt!', 'img/trainers/joel.png');
    trainer2 = new npcTrainer('Romero', pokemon4, null, null, null, null, null, 200, 'Lykke til!', 'Bedre lykke nestegang!', 'Wow... Du er flink...', 'img/trainers/romero.png');
    trainer3 = new npcTrainer("Ashley", pokemon6, null, null, null, null, null, 500, null, null, null, null);
    player = new playerTrainer(playerName, pokemon3, null, null, null, null, null);
    view();
    viewScenery();
}

function testImmunities() {
    pokemon1 = new Pokemon('Registeel', 1, "Metal Claw", null, null, null);
    pokemon2 = new Pokemon('Venusaur', 10, "Toxic", "Softboiled", null, null);
    trainer1 = new npcTrainer('Romero', pokemon1, null, null, null, null, null, 100);
    player = new playerTrainer('Hans', pokemon2, null, null, null, null, null);
}

