
BasicGame.MainMenu = function (game) {};

BasicGame.MainMenu.prototype = {

	create: function () {
		this.setUpTitle();
	},

	update: function () {
	},

	/*==========================CREATE ASSOCIATED FUNCTIONS==========================*/

	setUpTitle: function() {
		this.music = this.add.audio('magical_menu_screen');
		this.music.loop = true;
		this.music.play();

		this.background = this.add.sprite(0, 0, 'main_menu_background');
		this.background.animations.add('static', [0, 1, 2], 7, true);
		this.background.animations.play('static');

		this.news_bar = this.add.sprite(10, this.camera.height - 11, 'news_bar');
		this.game.physics.arcade.enable(this.news_bar);
		this.news_bar.checkWorldBounds = true;
		this.news_bar.onOutOfBoundsKill = true;
		this.news_bar.body.velocity.x = -30;
		this.start_button = this.add.button(((this.camera.width / 2) - 15), this.camera.y + 95, 'start_button', this.startGame, this, 1,0,0);
		this.tv_overlay =  this.add.sprite(0, 0, 'tv_overlay');
	},

	startGame: function (pointer) {
		//	stop music or it'll carry on playing
		this.music.stop();
		//	And start the actual game
		this.state.start('LevelMaster');

	},

};
