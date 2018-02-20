BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    var jump_timer = 0;

};


BasicGame.Game.prototype = {

    init: function(levelData) {
        this.levelData = levelData;
    },

    preload: function() {
        this.loadLevel();
    },

    create: function () {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.setUpInput();
        this.setUpMap();
        this.setUpPlayer();
        this.setUpFire();
        this.setUpPotions();
        this.setUpEnemies();
        this.setUpODBar();
        this.setUpConditions();
        this.setUpAudio();
    },

    update: function () {
        this.processCollisions();
        this.processPlayerInput();
        this.processDelayedEffects();
        this.checkGameConditions();
    },

    render: function() {
        // this.game.debug.body(this.player);
    },

    quitGame: function () {
        this.cleanUp();
        // lets go back to the menu
        this.state.start('MainMenu', false, false, '');
    },

    /*==========================PRELOAD ASSOCIATED FUNCTIONS==========================*/

    loadLevel: function() {
        //  key, source, null, Phaser.TileMap.TILED_JSON
        this.load.tilemap('level', 'assets/levels/' + (this.levelData.levelArr[this.levelData.level-1]) + '.json', null, Phaser.Tilemap.TILED_JSON);
    },

    /*==========================CREATE ASSOCIATED FUNCTIONS==========================*/
    setUpInput: function() {
        // arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.inputEnabled = true;
    },

    setUpAudio: function() {
        this.music = this.add.audio('magician_neck_spew');
        this.music.loop = true;
        this.music.play();

        this.playerDeath = this.add.audio('player_death');
        this.zombieGrunt = this.add.audio('zombie_grunt');
        this.potionGulp = this.add.audio('potion_gulp');
        this.footstepA = this.add.audio('footstepA');
        this.footstepB = this.add.audio('footstepB');
    },

    setUpPlayer: function() {
        var result = this.findObjectsByType('playerStart', this.map, 'playerStart');

        this.player = this.add.sprite(result[0].x, result[0].y, 'player');

        this.player.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enable(this.player);
        this.camera.follow(this.player);

        this.player.animations.add('die-left', [0, 1, 2, 3], 6, false);
        this.player.animations.add('die-right', [4, 5, 6, 7], 6, false);
        this.player.animations.add('vomit-left', [8, 9, 10, 11], 10, true);
        this.player.animations.add('vomit-right', [12, 13, 14,  15], 10, true);
        this.player.animations.add('idle-left', [16, 17,  18, 19], 10, true);
        this.player.animations.add('idle-right', [20, 21, 22, 23], 10, true);
        this.player.animations.add('walk-left', [24, 25, 26, 27], 10, true);
        this.player.animations.add('walk-right', [28, 29, 30, 31], 10, true);

        this.player.speed = BasicGame.PLAYER_SPEED;
        this.player.jump_speed = BasicGame.PLAYER_JUMP_SPEED;
        this.player.body.gravity.y = BasicGame.PLAYER_GRAVITY;
        this.player.body.maxVelocity.x = 100;
        this.player.body.maxVelocity.y = 200;
        this.player.body.collideWorldBounds = true;

        // 16 x 28 pixel hitbox, centered a little bit higher than the center
        this.player.body.setSize(16, 28, 8, 4);

        this.player.last_direction = 'left';
        this.player.overdosed = false;
        this.player.odLevel = 0;
        this.player.alive = true;
    },

    setUpMap: function() {
        this.map = this.game.add.tilemap('level');
        // (tileset_name, asset_key) the PNG ASSET
        this.map.addTilesetImage('background', 'background');
        this.map.addTilesetImage('level_tilesheet', 'level_tilesheet');
        // background layer
        this.backgroundLayer = this.map.createLayer('background');
        // collisionable layer
        this.collisionLayer = this.map.createLayer('collisionable');

        // this.collisionLayer.debug = true;

        //collision with blockedLayer
        this.map.setCollisionBetween(1, 2000, true, this.collisionLayer);
        // resizing to fit backgroundLayer
        this.backgroundLayer.resizeWorld();
        // this.collisionLayer.resizeWorld();
    },


    setUpPotions: function() {
        this.potionPool = this.game.add.group();
        this.potionPool.enableBody = true;
        // get all items from potion layer
        result = this.findObjectsByType('item', this.map, 'potions');
        result.forEach(function(element) {
            this.createFromTiledObject(element, this.potionPool);
        }, this);

        // floaty animation
        this.potionPool.forEach(function(potion) {
            potion.anchor.setTo(0.5, 0.5)
            potion.animations.add('float', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 7, true);
            potion.play('float');
        });
    },

    setUpEnemies: function() {
        this.enemyPool = this.game.add.group();
        this.enemyPool.enableBody = true;
        this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
        // get all enemies from enemy layer
        result = this.findObjectsByType('enemy', this.map, 'enemies');
        result.forEach(function(element) {
            this.createFromTiledObject(element, this.enemyPool);
        }, this);

        // set animations for enemies
        this.enemyPool.forEach(function(enemy) {
            enemy.anchor.setTo(0.5, 0.5);
            enemy.body.immovable = true;
            enemy.animations.add('idle-left', [0,1,2,3], 7, true);
            enemy.animations.add('idle-right', [4,5,6,7], 7, true);
            enemy.animations.add('walk-left', [8,9,10,11], 7, true);
            enemy.animations.add('walk-right', [12,13,14,15], 7, true);

            enemy.play('idle-left');
        });
    },

    setUpFire: function() {
        this.leftFirePool = this.add.group();
        this.rightFirePool = this.add.group();
        this.leftFirePool.enableBody = true;
        this.rightFirePool.enableBody = true;
        this.leftFirePool.physicsBodyType = Phaser.Physics.ARCADE;
        this.rightFirePool.physicsBodyType = Phaser.Physics.ARCADE;

        // 50 fire elements on goup
        this.leftFirePool.createMultiple(50, 'vomit_left');
        // center pool anchor
        this.leftFirePool.setAll('anchor.x', 0.5);
        this.leftFirePool.setAll('anchor.y', 0.5);
        // kill on out of border
        this.leftFirePool.setAll('outOfBoundsKill', true);
        this.leftFirePool.setAll('checkWorldBounds', true);

        // 50 fire elements on goup
        this.rightFirePool.createMultiple(50, 'vomit_right');
        // center pool anchor
        this.rightFirePool.setAll('anchor.x', 0.5);
        this.rightFirePool.setAll('anchor.y', 0.5);
        // kill on out of border
        this.rightFirePool.setAll('outOfBoundsKill', true);
        this.rightFirePool.setAll('checkWorldBounds', true);

        // delay
        this.nextShotAt = 0;
        this.shotDelay = BasicGame.SHOT_DELAY;
    },

    setUpODBar: function() {
        this.odBar = this.game.add.sprite(4, 16, 'overdose_bar');
        console.log(this.odBar.y);
        this.odBar.fixedToCamera = true;
        this.odBar.anchor.y = 0.5;

        this.odFill = this.game.add.sprite(this.odBar.x + 38, this.odBar.y - 4, 'overdose_bar_fill');
        this.odFill.fixedToCamera = true;
        this.odFill.anchor.y = 0.5;
        this.odFill.width = 0;
        this.odFill.maxFill = 55;

        // od fills when reaching 55 width
    },

    setUpConditions: function() {
        this.potions_collected = 0;
        this.zombies_killed = 0;
        this.endScreen = false;
        // set up level conditions
        this.conditions = this.levelData.conditions;
        this.conditions.potions2grab = this.potionPool.total;
        this.conditions.zombies2kill = this.enemyPool.total;
        // set up overdose fill ratio
        this.percentagePerPotion = 100 / this.potionPool.total;

        this.odPerBarWith = this.percentagePerPotion * this.odFill.maxFill / 100;
    },

    /*==========================UPDATE ASSOCIATED FUNCTIONS==========================*/

    processCollisions: function() {
        // collison between player and collision layer
        this.game.physics.arcade.collide(this.player, this.collisionLayer);
        // collision between player and enemies
        this.game.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);
        // collision between vomit and enemies
        this.game.physics.arcade.overlap(this.leftFirePool, this.enemyPool, this.enemyHit, null, this);
        this.game.physics.arcade.overlap(this.rightFirePool, this.enemyPool, this.enemyHit, null, this);
    },

    processPlayerInput: function() {
        // reset movement and frame
        this.player.body.velocity.x = 0;
        // cannot move if already dead
        if (!this.inputEnabled || !this.player.alive) {
            return;
        }

        // right/left movement
        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -this.player.speed;
            this.player.last_direction = 'left';
            if (!this.player.overdosed) {
                this.player.animations.play('walk-left');
            } else {
                this.player.animations.play('vomit-left');
            }
            // this.footstepA.play();
            // this.footstepB.play();
        } else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = this.player.speed;
            this.player.last_direction = 'right';
            if (!this.player.overdosed) {
                this.player.animations.play('walk-right');
            } else {
                this.player.animations.play('vomit-right');
            }
            // this.footstepA.play();
            // this.footstepB.play();

        // iddling
        } else {
            switch (this.player.last_direction) {
                case 'left':
                    if (!this.player.overdosed) {
                        this.player.animations.play('idle-left');
                    } else {
                        this.player.animations.play('vomit-left');
                    }
                    break;

                case 'right':
                    if (!this.player.overdosed) {
                        this.player.animations.play('idle-right');
                    } else {
                        this.player.animations.play('vomit-right')
                    }
                    break;
                default:
                    break;
            }
        }

        // jumping
        if (this.cursors.up.isDown) { // player pressed jump
            if (this.player.body.blocked.down && (jump_timer === 0)) {
                jump_timer = 1;
                this.player.body.velocity.y = -this.player.jump_speed;
            }  else if (this.player.body.blocked.up) {
                jump_timer = 0;
            } else if (jump_timer > 0 && jump_timer < 31) {
                jump_timer ++;
                this.player.body.velocity.y = -this.player.jump_speed + (jump_timer * 2);
            }
        } else {
            jump_timer = 0;
        }

        // potion collecting
        if (this.input.keyboard.isDown(Phaser.Keyboard.Z)) {
            this.game.physics.arcade.overlap(this.player, this.potionPool, this.collect, null, this);
        }
    },

    processDelayedEffects: function() {
        if (this.showReturn && this.time.now > this.showReturn) {
            this.main_menu_button = this.add.button((this.camera.x + this.camera.width / 2) - 22,
                                                    this.camera.y + 70,
                                                    'main_menu_button', this.quitGame, this, 0,0,1);
            this.continue_button = this.add.button((this.camera.x + this.camera.width / 2) - 20,
                                                    this.camera.y + 90,
                                                    'continue_button', this.nextLevel, this, 0,0,1);
            this.showReturn = false;
        }
    },


    /*==========================SPECIFIC GAME LOGIC==========================*/

    collect: function(player, collectable) {
        this.potionGulp.play();
        this.getOverdosed();
        collectable.destroy();
        this.potions_collected ++;
    },

    getOverdosed: function() {
        this.player.odLevel += this.percentagePerPotion;
        this.odFill.width += this.odPerBarWith;
        // if player overdosed
        if (this.player.odLevel == 100) {
            this.player.overdosed = true;
        }
    },

    playerHit: function() {
        // cant die if already dead
        if (!this.player.alive) {
            return;
        }
        this.player.alive = false;
        // die left or right
        switch (this.player.last_direction) {
            case 'left':
                var dead = this.player.animations.play('die-left');
                break;
            case 'right':
                var dead = this.player.animations.play('die-right');
                break;
            default:
                break;
        }
        // death audio plays
        dead.onComplete.addOnce(function() {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
            this.playerDeath.play();
        }, this);
    },

    enemyHit: function(fire, enemy) {
        fire.kill();
        this.zombieGrunt.play();
        enemy.kill()
        this.zombies_killed ++;
    },

    vomit: function() {
        // cannot shot if dead or until a time passes
        if (!this.player.alive || this.nextShotAt > this.time.now) {
            return;
        }
        // fire in the hall
        this.nextShotAt = this.time.now + this.shotDelay;

        // reset sprite in new position
        switch (this.player.last_direction) {
            case 'left':
                if (this.leftFirePool.countDead() === 0) {
                    return;
                }
                // first shot dead in group
                var shot = this.leftFirePool.getFirstExists(false);
                shot.reset(this.player.x - 20, this.player.y + 1);
                shot.body.velocity.x = -BasicGame.SHOT_VELOCITY;
                break;
            case 'right':
                if (this.rightFirePool.countDead() === 0) {
                    return;
                }
                // first shot dead in group
                var shot = this.rightFirePool.getFirstExists(false);
                shot.reset(this.player.x + 20, this.player.y + 1);
                shot.body.velocity.x = BasicGame.SHOT_VELOCITY;
                break;
            default:
                break;
        }
    },

    displayEnd: function(victory) {

        // dont set the endscreen if already set
        if (this.endScreen) {
            return;
        }
        // make sure the player has stoped moving and its on the floor
        if (this.player.body.velocity.x === 0 &&
            this.player.body.velocity.y === 0 &&
            this.player.body.blocked.down) {
            // stop following player
            this.camera.follow(null);
            if (victory) {
                this.endScreen = true;
                this.victoryScreen = this.add.sprite(this.camera.x, this.camera.y, 'level_cleared');
                this.inputEnabled = false;
                this.showReturn = this.time.now + BasicGame.RETURN_MESSAGE_DELAY;
            } else {
                this.endScreen = true;
                this.deathScreen = this.add.sprite(this.camera.x, this.camera.y, 'you_died');
                this.main_menu_button = this.add.button((this.camera.x + this.camera.width/2) - 24,
                                                        (this.camera.y + 70),
                                                        'main_menu_button', this.quitGame, this, 0,0,1);
                    this.retry_button = this.add.button((this.camera.x + this.camera.width/2) - 16,
                                                        (this.camera.y + 90),
                                                        'retry_button', this.retryLevel, this, 0,0,1);
            }
        }

    },

    retryLevel: function() {
        this.music.stop();
        this.cleanUp();
        this.state.start('Game', true, false, this.levelData);
    },

    nextLevel: function() {
            this.music.stop();
            this.cleanUp();
            this.state.start('LevelMaster', true, false, this.levelData)
    },

    checkGameConditions: function() {
        // check if player overdosed
        if (this.player.overdosed) {
            this.vomit();
        }
        // check victory/defeat contiditions
        if (this.potions_collected == this.conditions.potions2grab &&
            this.zombies_killed == this.conditions.zombies2kill) {
            this.displayEnd(true);

        } else if (!this.player.alive) {
            this.displayEnd(false)
        }
    },


    /*==========================UTILITY FUNCTIONS==========================*/

    // find objects in a tiled layer that contain a property called "type" equal to a given value
    findObjectsByType: function(type, map, layer) {
        var result = new Array();
        if (this.map.objects[layer]){
            this.map.objects[layer].forEach(function (element) {
                if (element.properties.type === type) {
                    element.y -= map.tileHeight;
                    // gotta push the element half their dimensions 'cuz of anchor
                    element.y += element.height/2;
                    element.x += element.width/2;
                    result.push(element);
                }
            });
        }
        return result;
    },

    // create a sprite from an object
    createFromTiledObject: function(element, group) {
        var sprite = group.create(element.x, element.y, element.properties.sprite);

        // copy properties of the sprite
        Object.keys(element.properties).forEach(function(key) {
            sprite[key] = element.properties[key];
        });
    },

    cleanUp: function() {
        // burn it all
        this.player.destroy();
        this.potionPool.destroy();
        this.enemyPool.destroy();
        this.leftFirePool.destroy();
        this.rightFirePool.destroy();
        this.map.destroy();
        this.odBar.destroy();
        this.odFill.destroy();
        this.music.destroy();
    }
};
