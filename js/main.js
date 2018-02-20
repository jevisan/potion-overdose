window.onload = function() {

	var game = new Phaser.Game(potionOD.baseWidth, potionOD.baseHeight, Phaser.CANVAS, 'gameContainer');

    // ALL GAME STATES
	game.state.add('Boot', BasicGame.Boot);
	game.state.add('Preloader', BasicGame.Preloader);
	game.state.add('MainMenu', BasicGame.MainMenu);
	game.state.add('LevelMaster', BasicGame.LevelMaster);
	game.state.add('Game', BasicGame.Game);

	//	START BOOT STATE
	game.state.start('Boot');
};
