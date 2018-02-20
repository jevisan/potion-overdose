BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		this.preloadBar = this.add.sprite(
            this.world.centerX,
            this.world.centerY, 'preloaderBar');

		this.preloadBar.anchor.setTo(0.5, 0.5);

		// SET preloadBar AS PRELOAD STATE BAR
		this.load.setPreloadSprite(this.preloadBar);

		// ALL ASSETS
		// sprites
		this.load.spritesheet('player', 'assets/player_tile_sheet_complete.png', 32, 32);
		this.load.spritesheet('redpotion', 'assets/potion1_floating.png', 32, 32);
		this.load.spritesheet('zombie', 'assets/zombie_tilesheet.png', 32, 32);
		this.load.spritesheet('main_menu_background', 'assets/main_menu_background.png', 256, 144);
		this.load.spritesheet('start_button', 'assets/start_button.png', 37, 12);
		this.load.spritesheet('main_menu_button', 'assets/main_menu_button.png', 61, 12);
		this.load.spritesheet('retry_button', 'assets/retry_button.png', 42, 12);
		this.load.spritesheet('continue_button', 'assets/continue_button.png', 57, 12);
		// tilesets and images
		this.load.image('level_tilesheet', 'assets/tilesets/level_tilesheet.png');
		this.load.image('background', 'assets/tilesets/background.png');
		this.load.image('vomit_left', 'assets/vomit_left.png');
		this.load.image('vomit_right', 'assets/vomit_right.png');
		this.load.image('overdose_bar', 'assets/overdose_bar.png');
		this.load.image('overdose_bar_fill', 'assets/overdose_bar_fill.png');
		this.load.image('tv_overlay', 'assets/tv_screen_overlay.png');
		this.load.image('news_bar', 'assets/news_bar.png');
		this.load.image('you_died', 'assets/you_died.png');
		this.load.image('level_cleared', 'assets/level_cleared.png');
		// music
		this.load.audio('magical_menu_screen', ['assets/audio/What_a_magical_menu_screen.ogg']);
		this.load.audio('magician_neck_spew', ['assets/audio/The_Magicians_Neck-spew.ogg']);
		// sound effects
		this.load.audio('player_death', ['assets/audio/soundEffects/player_death.wav']);
		this.load.audio('potion_gulp', ['assets/audio/soundEffects/potion_gulp01.wav']);
		this.load.audio('zombie_grunt', ['assets/audio/soundEffects/zombie_grunt03.wav']);
		this.load.audio('footstepA', ['assets/audio/soundEffects/footstep01.wav']);
		this.load.audio('footstepB', ['assets/audio/soundEffects/footstep02.wav']);
	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;

	},

	update: function () {

		// START MENU STATE
		this.state.start('MainMenu');

	}

};
