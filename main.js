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

// -----------------------------
// 3) scene lifecycle methods
// -----------------------------
function preload() {

    //add heart image for player health
    this.load.image("heart", "assets/heart.png");

    this.load.image("playerIdle", "assets/1/Idle.gif");
    this.load.image("playerRun", "assets/1/Run.gif");
    this.load.image("playerJump", "assets/1/Jump.gif");
    this.load.image("playerFall", "assets/1/Fall.gif");

    // Player 1 attack spritesheet.
    // attack.png is 600 x 160, made from 120 x 80 frames.
    
    this.load.spritesheet("playerAttack", "assets/1/AttackCombo.png", {
        frameWidth: 120,
        frameHeight: 80
        
    });

    this.load.spritesheet("playerTwoAttack", "assets/2/2AttackCombo.png", {
        frameWidth: 120,
        frameHeight: 80
        
    });



    this.load.image("playerTwoIdle", "assets/2/2Idle.gif");
    this.load.image("playerTwoRun", "assets/2/2Run.gif");
    this.load.image("playerTwoJump", "assets/2/2Jump.gif");
    this.load.image("playerTwoFall", "assets/2/2JumpFallInbetween.gif");

    // Player 2 will use the same "playerAttack" spritesheet as Player 1.
}

function create() {

    //game width and height variables for easier access
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    // create a ground rectangle that spans the width of the game and is 50 pixels tall
    ground = this.add.rectangle(gameWidth / 2, gameHeight - 25, gameWidth, 50, 0x8b5a2b);
    this.physics.add.existing(ground, true);

    // player 1 and 2 add physics 
    player = this.physics.add.sprite(120, gameHeight - 400, "playerIdle");
    this.physics.add.existing(player);
    player.setScale(4);

    playerTwo = this.physics.add.sprite(1620, gameHeight - 400, "playerTwoIdle");
    this.physics.add.existing(playerTwo);
    playerTwo.setScale(4);

    // player 1 and 2 add collider boxes ( SO THEY DON'T FALL OFF THE SCREEN )
    const playerBody = player.body;
    playerBody.setCollideWorldBounds(true);
    playerBody.setBounce(0.05);

    const playerTwoBody = playerTwo.body;
    playerTwoBody.setCollideWorldBounds(true);
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

    // 5 hearts for Player 1 on the left, 5 hearts for Player 2 on the right.
    // for loop ( kinda advanced - explain)
    for (let i = 0; i < 5; i += 1) {
        this.add.image(40 + i * 45, 40, "heart").setScale(0.07);
        this.add.image(gameWidth - 40 - i * 45, 40, "heart").setScale(0.07);
    }

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
            player.setTexture("playerIdle");
        }
    });

    // add event listeners for when the attack animations complete ( 'go back to idle')
    playerTwo.on("animationcomplete", (animation) => {
        if (animation.key === "playerTwoAttackAnimation") {
            playerTwoIsAttacking = false;
            playerTwo.setTexture("playerTwoIdle");
        }
    });
}

function update() {
    // -----------------------------
    // PLAYER ONE 
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

    //code to handle player attack animation and state

    if (!playerIsAttacking) {
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
        playerIsAttacking = true;
        player.play("playerAttackAnimation", true);
    }

    // -----------------------------
    // PLAYER TWO 
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

    //code to handle player attack animation and state 
    if (!playerTwoIsAttacking) {
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
        playerTwoIsAttacking = true;
        playerTwo.play("playerTwoAttackAnimation", true);
    }

}
