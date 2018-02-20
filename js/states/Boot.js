var BasicGame = {
    PLAYER_SPAWN_X: 10,
    PLAYER_SPAWN_Y: 200,
    PLAYER_GRAVITY: 270,

    PLAYER_SPEED: 100,
    PLAYER_JUMP_SPEED: 150,

    SHOT_VELOCITY: 300,
    SHOT_DELAY: Phaser.Timer.SECOND * 0.4,

    RETURN_MESSAGE_DELAY: Phaser.Timer.SECOND * 2,
};

BasicGame.Boot = function (game) {};

BasicGame.Boot.prototype = {

    init: function () {

        this.input.maxPointers = 1;

        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = false;

        if (this.game.device.desktop)
        {
            //  If you have any desktop specific settings, they can go in here
            this.scale.pageAlignHorizontally = true;
        }

        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        this.game.scale.setUserScale(potionOD.scaleFactor, potionOD.scaleFactor);

        // enable crisp rendering
        this.game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

    },

    preload: function () {

        // ALL ASSETS FOR THE PRELOAD STATE
        this.load.image('preloaderBar', 'assets/preloader-bar.png');

    },

    create: function () {

        // START PRELOAD STATE
        this.state.start('Preloader');

    }

};
