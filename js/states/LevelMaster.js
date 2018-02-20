BasicGame.LevelMaster = function() {};

var levels = ['level1', 'level2', 'level3'];
// var levels = ['level2'];

BasicGame.LevelMaster.prototype = {

    init: function(levelData) {
        if (!levelData) {
            levelData = {
                level: 0,
                levelArr: levels,
                conditions: {
                    zombies2kill: 0,
                    potions2grab: 0,
                },
            };
        }

        this.levelData = levelData;
    },

    create: function() {
        this.decideLevel();
    },

    decideLevel: function() {
        // reset the next level for testing
        if (this.levelData.level == levels.length) {
            this.levelData.level = 0;
            this.state.start('MainMenu', true, false, '');
        } else {
            this.nextLevel();
        }
    },

    nextLevel: function() {
        this.levelData.level ++;
        this.state.start('Game', true, false, this.levelData);
    },
};
