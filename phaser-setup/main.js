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
        // there are two physics systems in pahser, arcade for simple games and matter for more omcplex phhysics simulations
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

// -----------------------------
// 3) scene lifecycle methods
// -----------------------------
function preload() {
    // load character gif states from the parent assets folder.
    this.load.image("idle", "../assets/Idle.gif");
    this.load.image("run", "../assets/Run.gif");
    this.load.image("jump", "../assets/Jump.gif");
    this.load.image("fall", "../assets/Fall.gif");


    this.load.image("idle2", "../assets/2Idle.gif");
    this.load.image("run2", "../assets/2Run.gif");
    this.load.image("jump2", "../assets/2Jump.gif");
    this.load.image("fall2", "../assets/2Fall.gif");
}

function create() {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    // create a static ground body near the bottom of the screen.
    // a static body does not move when bumped.
    ground = this.add.rectangle(gameWidth / 2, gameHeight - 40, gameWidth, 100, 0x8b5a2b);
    this.physics.add.existing(ground, true);

    // create player as a sprite image so we can swap visual states.
    player = this.physics.add.image(120, gameHeight - 200, "idle");
    this.physics.add.existing(player);
    player.setScale(2);

    playerTwo = this.physics.add.image(9000, gameHeight - 200, "idle2");
    this.physics.add.existing(playerTwo);
    playerTwo.setScale(2);

    // access the arcade body for physics settings.
    const playerBody = player.body;
    playerBody.setCollideWorldBounds(true); // keep player inside canvas
    playerBody.setBounce(0.05); // small bounce for feel

    const playerTwoBody = playerTwo.body;
    playerTwoBody.setCollideWorldBounds(true); // keep player inside canvas
    playerTwoBody.setBounce(0.05); // small bounce for feel

    // let player stand and collide on the ground.
    this.physics.add.collider(player, ground);

    this.physics.add.collider(playerTwo, ground);

    // track keyboard keys for wasd movement.
    keys = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        jump: Phaser.Input.Keyboard.KeyCodes.W
    });

    keysTwo = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        jump: Phaser.Input.Keyboard.KeyCodes.UP
    });

    // keep world bounds synced with current screen size.
    this.physics.world.setBounds(0, 0, gameWidth, gameHeight);

    // handle browser resize so the game truly stays fullscreen.
    this.scale.on("resize", (gameSize) => {
        const newWidth = gameSize.width;
        const newHeight = gameSize.height;

        ground.setPosition(newWidth / 2, newHeight - 25);
        ground.width = newWidth;
        ground.body.updateFromGameObject();

        this.physics.world.setBounds(0, 0, newWidth, newHeight);


        
    });
}

function update() {
    const playerBody = player.body;

    // horizontal movement
    if (keys.left.isDown) {
        playerBody.setVelocityX(-320);
        player.setFlipX(true);
    } else if (keys.right.isDown) {
        playerBody.setVelocityX(320);
        player.setFlipX(false);
    } else {
        // no key pressed: stop left/right movement
        playerBody.setVelocityX(0);
    }

    // jump only if touching the ground.
    //   this prevents infinite jumping in the air.
    if (keys.jump.isDown && playerBody.blocked.down) {
        playerBody.setVelocityY(-450);
    }

    // simple state-based visual swap using gif textures.
    if (!playerBody.blocked.down) {
        if (playerBody.velocity.y < 0) {
            player.setTexture("jump");
        } else {
            player.setTexture("fall");
        }
    } else if (playerBody.velocity.x !== 0) {
        player.setTexture("run");
    } else {
        player.setTexture("idle");
    }



    const playerTwoBody = playerTwo.body;

    // horizontal movement
    if (keysTwo.left.isDown) {
        playerTwoBody.setVelocityX(-320);
        playerTwo.setFlipX(true);
    } else if (keysTwo.right.isDown) {
        playerTwoBody.setVelocityX(320);
        playerTwo.setFlipX(false);
    } else {
        // no key pressed: stop left/right movement
        playerTwoBody.setVelocityX(0);
    }

    // jump only if touching the ground.
    //   this prevents infinite jumping in the air.
    if (keysTwo.jump.isDown && playerTwoBody.blocked.down) {
        playerTwoBody.setVelocityY(-450);
    }

    // simple state-based visual swap using gif textures.
    if (!playerTwoBody.blocked.down) {
        if (playerTwoBody.velocity.y < 0) {
            playerTwo.setTexture("jump2");
        } else {
            playerTwo.setTexture("fall2");
        }
    } else if (playerTwoBody.velocity.x !== 0) {
        playerTwo.setTexture("run2");
    } else {
        playerTwo.setTexture("idle2");
    }
}









