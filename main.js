// -----------------------------
// 1) phaser game configuration
// -----------------------------

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "game-container",
    backgroundColor: "#000000", // black background
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 900 }, // pulls player downward
            debug: false // shows debug boxes for physics bodies, useful for development
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

// -----------------------------
// 2) variables used by scene
// -----------------------------
let player;
let playerTwo;
let ground;
let keys;
let keysTwo;

// add a variable to track if the player is attacking
let playerIsAttacking = false;
let playerTwoIsAttacking = false;
let playerHearts = [];
let playerTwoHearts = [];
let gameOver = false;
// players must be this close for an attack to remove a heart
const attackRange = 300;

//let debounce = false
//let debounce2 = false


// -----------------------------
// 3) scene lifecycle methods
// -----------------------------




function preload() {

    //add heart image for player health
    this.load.image("heart", "../assets/heart.png");

    this.load.image("playerIdle", "../assets/1/Idle.gif");
    this.load.image("playerRun", "../assets/1/Run.gif");
    this.load.image("playerJump", "../assets/1/Jump.gif");
    this.load.image("playerFall", "../assets/1/Fall.gif");

    // Player 1 attack spritesheet.
    // attack.png is 600 x 160, made from 120 x 80 frames.
    this.load.spritesheet("playerAttack", "../assets/1/attack.png", {
        frameWidth: 120,
        frameHeight: 80
    });
//Background
this.load.image('background', 'assets/CastleBackground.jpg')


    this.load.spritesheet("playerTwoAttack", "../assets/2/2attack.png", {
        frameWidth: 120,
        frameHeight: 80
    });


    this.load.image("playerTwoIdle", "../assets/2/2Idle.gif");
    this.load.image("playerTwoRun", "../assets/2/2Run.gif");
    this.load.image("playerTwoJump", "../assets/2/2Jump.gif");
    this.load.image("playerTwoFall", "../assets/2/2JumpFallInbetween.gif");

    // Player 2 will use the same "playerAttack" spritesheet as Player 1.
}

function create() {

    //game width and height variables for easier access
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    gameOver = false;
    playerIsAttacking = false;
    playerTwoIsAttacking = false;
// Background
this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');

    this.add.image(0, 0, 'background')
        .setOrigin(0, 0)
        .setDisplaySize(window.innerWidth, window.innerHeight)


    // create a ground rectangle that spans the width of the game and is 50 pixels tall
    ground = this.add.rectangle(gameWidth / 2, gameHeight - 25, gameWidth, 50, 0x8b5a2b);
    this.physics.add.existing(ground, true);

    // player 1 and 2 add physics 
    player = this.physics.add.sprite(120, gameHeight - 800, "playerIdle");
    this.physics.add.existing(player);
    player.setScale(6);

    playerTwo = this.physics.add.sprite(1620, gameHeight - 800, "playerTwoIdle");
    this.physics.add.existing(playerTwo);
    playerTwo.setScale(6);

    // player 1 and 2 add collider boxes ( SO THEY DON'T FALL OFF THE SCREEN )
    const playerBody = player.body;
    playerBody.setBounce(0.05);

    const playerTwoBody = playerTwo.body;
    playerTwoBody.setBounce(0.05);

    // add collider between player and ground
    this.physics.add.collider(player, ground);
    this.physics.add.collider(playerTwo, ground);

    // -----------------------------
    // 3) controls for player 1 and 2
    // -----------------------------

    keys = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        jump: Phaser.Input.Keyboard.KeyCodes.W,

        //add attack key
        attack: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    keysTwo = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        jump: Phaser.Input.Keyboard.KeyCodes.UP,

        //add attack key
        attack: Phaser.Input.Keyboard.KeyCodes.ENTER
    });

    // 3 hearts for Player 1 on the left, 3 hearts for Player 2 on the right.
    // for loop ( kinda advanced - explain)
    playerHearts = [];
    playerTwoHearts = [];
    for (let i = 0; i < 10; i += 1) {
        playerHearts.push(this.add.image(40 + i * 45, 40, "heart").setScale(0.07));
        playerTwoHearts.push(this.add.image(gameWidth - 420 + i * 45, 40, "heart").setScale(0.07));
    }

    this.add.text(gameWidth / 2, 40, "Reset", {
        fontSize: "28px",
        fill: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        this.scene.restart();
    });

    this.physics.world.setBounds(0, 0, gameWidth, gameHeight);

    this.scale.on("resize", (gameSize) => {
        const newWidth = gameSize.width;
        const newHeight = gameSize.height;

        ground.setPosition(newWidth / 2, newHeight - 25);
        ground.width = newWidth;
        ground.body.updateFromGameObject();

        this.physics.world.setBounds(0, 0, newWidth, newHeight);
    });

    // add player attack animation
    this.anims.create({
        key: "playerAttackAnimation",
        frames: this.anims.generateFrameNumbers("playerAttack", { start: 0, end: 9 }),
        frameRate: 10,
        repeat: 0 // 0 means play one time
    });

    // add player 2 attack animation
    this.anims.create({
        key: "playerTwoAttackAnimation",
        frames: this.anims.generateFrameNumbers("playerTwoAttack", { start: 0, end: 9 }),
        frameRate: 10,
        repeat: 0 // 0 means play one time
    });

    // add event listeners for when the attack animations complete ( 'go back to idle')
    player.on("animationcomplete", (animation) => {
        if (animation.key === "playerAttackAnimation") {
            playerIsAttacking = false;
            debounce = false;
            player.setTexture("playerIdle");
        }
    });

    // add event listeners for when the attack animations complete ( 'go back to idle')
    playerTwo.on("animationcomplete", (animation) => {
        if (animation.key === "playerTwoAttackAnimation") {
            playerTwoIsAttacking = false;
            debounce2 = false;
            playerTwo.setTexture("playerTwoIdle");
        }
    });
}

function update() {
    if (gameOver) {
        return;
    }

    // -----------------------------
    // PLAYER ONE UPDATES
    // -----------------------------
    const playerBody = player.body;

    if (keys.left.isDown) {
        playerBody.setVelocityX(-320);
        player.setFlipX(true);
    } else if (keys.right.isDown) {
        playerBody.setVelocityX(320);
        player.setFlipX(false);
    } else {
        playerBody.setVelocityX(0);
    }

    if (keys.jump.isDown && playerBody.blocked.down) {
        playerBody.setVelocityY(-450);
    }

    //new code to handle player attack animation and state ⬇️

    if (!playerIsAttacking) {
      //  debounce = true;
        if (!playerBody.blocked.down) {
            if (playerBody.velocity.y < 0) {
                player.setTexture("playerJump");
            } else {
                player.setTexture("playerFall");
            }
        } else if (playerBody.velocity.x !== 0) {
            player.setTexture("playerRun");
        } else {
            player.setTexture("playerIdle");
        }
    }

    if (Phaser.Input.Keyboard.JustDown(keys.attack)) {
      //  if (debounce) {return}  
        playerIsAttacking = true;
        player.play("playerAttackAnimation", true);

        if (Phaser.Math.Distance.Between(player.x, player.y, playerTwo.x, playerTwo.y) < attackRange) {
            if (loseHeart(playerTwoHearts)) {
                showWinScreen(this, "Player 1 Wins!");
            }
        }
    }

    // -----------------------------
    // PLAYER TWO UPDATES
    // -----------------------------

    const playerTwoBody = playerTwo.body;

    if (keysTwo.left.isDown) {
        playerTwoBody.setVelocityX(-320);
        playerTwo.setFlipX(true);
    } else if (keysTwo.right.isDown) {
        playerTwoBody.setVelocityX(320);
        playerTwo.setFlipX(false);
    } else {
        playerTwoBody.setVelocityX(0);
    }

    if (keysTwo.jump.isDown && playerTwoBody.blocked.down) {
        playerTwoBody.setVelocityY(-450);
    }

    //new code to handle player attack animation and state ⬇️
    if (!playerTwoIsAttacking) {
       // debounce2 = true;
        if (!playerTwoBody.blocked.down) {
            if (playerTwoBody.velocity.y < 0) {
                playerTwo.setTexture("playerTwoJump");
            } else {
                playerTwo.setTexture("playerTwoFall");
            }
        } else if (playerTwoBody.velocity.x !== 0) {
            playerTwo.setTexture("playerTwoRun");
        } else {
            playerTwo.setTexture("playerTwoIdle");
        }
    }

    if (Phaser.Input.Keyboard.JustDown(keysTwo.attack)) {
         //if (debounce2) {return}  
        playerTwoIsAttacking = true;
        playerTwo.play("playerTwoAttackAnimation", true);

        if (Phaser.Math.Distance.Between(player.x, player.y, playerTwo.x, playerTwo.y) < attackRange) {
            if (loseHeart(playerHearts)) {
                showWinScreen(this, "Player 2 Wins!");
            }
        }
    }

}

function loseHeart(hearts) {
    // health is the number of hearts left in the array
    const heart = hearts.pop();

    if (heart) {
        heart.destroy();
    }

    return hearts.length === 0;
}

function showWinScreen(scene, message) {
    gameOver = true;
    scene.physics.pause();
    scene.add.rectangle(scene.scale.width / 2, scene.scale.height / 2, scene.scale.width, scene.scale.height, 0x000000, 0.8);
    scene.add.text(scene.scale.width / 2, scene.scale.height / 2, message, {
        fontSize: "64px",
        fill: "#ffffff"
    }).setOrigin(0.5);
}
