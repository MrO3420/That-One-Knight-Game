# Phaser Setup Tutorial

This tutorial builds a small Phaser project the way you would naturally think through it while developing:

1. Make a web page for the game.
2. Load Phaser.
3. Create a game canvas.
4. Add a player and ground.
5. Read keyboard input.
6. Move, jump, and swap player images.

The goal is not just to paste a finished file. The goal is to understand why each piece gets added.

## 1. Create the project folder

Start with a folder named `phaser-setup`.

Inside it, create these files:

```text
phaser-setup/
  index.html
  main.js
  README.md
```

This project also expects an `assets` folder one level above `phaser-setup`, because the code loads files like this:

```js
this.load.image("idle", "../assets/Idle.gif");
```

That `../` means "go up one folder, then look inside `assets`."

## 2. Make the HTML page

Phaser games run inside a normal web page. So first, `index.html` needs the basic page structure.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phaser Game</title>
</head>
<body>
</body>
</html>
```

Now add a place where Phaser can put the game canvas.

```html
<div id="game-container"></div>
```

Put that inside the `<body>`.

Next, load Phaser from a CDN in the `<head>`. A CDN is a hosted file on the internet, so you do not have to install Phaser yet.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.55.2/phaser.min.js"></script>
```

Then load your own game code after Phaser.

```html
<script src="main.js" defer></script>
```

By the end, the important parts of your `index.html` should look like this:

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phaser Game</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.55.2/phaser.min.js"></script>
    <script src="main.js" defer></script>
</head>
<body>
    <div id="game-container"></div>
</body>
```

The order matters: Phaser must load before `main.js`, because `main.js` uses the `Phaser` object.

## 3. Start `main.js` with the game configuration

In Phaser, the first big decision is the game configuration. This tells Phaser how large the game is, where to place it, and which scene functions to run.

Start with this:

```js
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "game-container",
    backgroundColor: "#000000"
};
```

Here is what those lines mean:

- `type: Phaser.AUTO` lets Phaser choose the best renderer.
- `width` and `height` use the browser window size.
- `parent` matches the `id` from the HTML.
- `backgroundColor` makes the empty game black.

Now tell Phaser how the game should resize. Since this is another setting inside `config`, add a comma after `backgroundColor`.

```js
backgroundColor: "#000000",
scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
}
```

Add the `scale` section inside the `config` object, after `backgroundColor`.

## 4. Turn on simple physics

For a platformer-style character, we need gravity and collisions. Phaser's Arcade physics system is good for this kind of simple movement.

Add this inside `config`. Put a comma after the `scale` section before adding `physics`.

```js
physics: {
    default: "arcade",
    arcade: {
        gravity: { y: 900 },
        debug: true
    }
}
```

`gravity.y` pulls the player downward. `debug: true` draws physics boxes, which is useful while learning. Later, you can set it to `false`.

## 5. Tell Phaser which scene functions to use

A Phaser scene usually has three important functions:

- `preload` loads images and other assets.
- `create` builds the starting game objects.
- `update` runs every frame.

Add this inside `config`. Put a comma after the `physics` section before adding `scene`.

```js
scene: {
    preload,
    create,
    update
}
```

Then create the game:

```js
const game = new Phaser.Game(config);
```

At this point, Phaser knows what kind of game to make, but the scene functions do not exist yet. That is okay. We will write them next.

## 6. Add variables the whole scene can share

The player needs to be created in `create`, but moved in `update`. That means both functions need access to it.

Create shared variables near the top of `main.js`:

```js
let player;
let ground;
let keys;
```

These start empty. Later, `create` will fill them in.

## 7. Load the player images

Before Phaser can show an image, it has to load it in `preload`.

Create the function:

```js
function preload() {
}
```

Inside it, load the idle image first:

```js
this.load.image("idle", "../assets/Idle.gif");
```

The first value, `"idle"`, is the nickname Phaser will use for that image. The second value is the file path.

Then add the other movement states:

```js
this.load.image("run", "../assets/Run.gif");
this.load.image("jump", "../assets/Jump.gif");
this.load.image("fall", "../assets/Fall.gif");
```

Now the game can switch the player's texture depending on what the player is doing.

## 8. Start the scene with screen size values

The `create` function runs once, right after the assets finish loading.

Start it like this:

```js
function create() {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
}
```

These values make it easier to place things relative to the current browser size.

## 9. Add the ground

A player needs something to land on. We can make a simple brown rectangle near the bottom of the screen.

Inside `create`, add:

```js
ground = this.add.rectangle(
    gameWidth / 2,
    gameHeight - 25,
    gameWidth,
    50,
    0x8b5a2b
);
```

That creates the visual rectangle, but it does not have physics yet.

Add a static physics body:

```js
this.physics.add.existing(ground, true);
```

The `true` means the ground is static. It can block the player, but gravity will not pull it down.

## 10. Add the player

Now create the player above the ground.

```js
player = this.physics.add.image(120, gameHeight - 200, "idle");
```

This does two things at once:

- Shows the `"idle"` image.
- Gives the player an Arcade physics body.

Make the character larger:

```js
player.setScale(2);
```

Then adjust the player's physics body:

```js
const playerBody = player.body;
playerBody.setCollideWorldBounds(true);
playerBody.setBounce(0.05);
```

`setCollideWorldBounds(true)` keeps the player inside the game area. `setBounce(0.05)` gives a tiny bit of physical softness.

## 11. Make the player collide with the ground

Right now the player and ground both have physics, but Phaser still needs to know they should collide.

Add this inside `create`:

```js
this.physics.add.collider(player, ground);
```

Now gravity can pull the player down, and the ground can stop the fall.

## 12. Read the keyboard

The player will use WASD controls:

- `A` moves left.
- `D` moves right.
- `W` jumps.

Inside `create`, add:

```js
keys = this.input.keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    jump: Phaser.Input.Keyboard.KeyCodes.W
});
```

This does not move the player by itself. It only gives us a clean way to check which keys are pressed later in `update`.

## 13. Keep physics inside the screen

Because the game uses the browser size, set the physics world bounds to match.

```js
this.physics.world.setBounds(0, 0, gameWidth, gameHeight);
```

This works with `playerBody.setCollideWorldBounds(true)` from earlier.

## 14. Move the player every frame

The `update` function runs over and over while the game is active. This is where movement belongs.

Start the function:

```js
function update() {
    const playerBody = player.body;
}
```

Now check for left movement:

```js
if (keys.left.isDown) {
    playerBody.setVelocityX(-320);
    player.setFlipX(true);
}
```

Negative X moves left. `setFlipX(true)` turns the player image around.

Add right movement:

```js
else if (keys.right.isDown) {
    playerBody.setVelocityX(320);
    player.setFlipX(false);
}
```

Positive X moves right.

Finally, stop the player when neither key is pressed:

```js
else {
    playerBody.setVelocityX(0);
}
```

That gives the movement a simple thought process:

```text
if left is pressed, move left
else if right is pressed, move right
else stop moving sideways
```

## 15. Add jumping

Jumping is vertical movement, so it changes `velocityY`.

Add this inside `update`:

```js
if (keys.jump.isDown && playerBody.blocked.down) {
    playerBody.setVelocityY(-450);
}
```

The important part is:

```js
playerBody.blocked.down
```

That checks whether the player is touching the ground. Without that check, the player could jump again and again in the air.

The jump velocity is negative because, in canvas coordinates, up is negative Y.

## 16. Change the image based on movement

Now the character can move, but the image should also match what is happening.

First, handle the air:

```js
if (!playerBody.blocked.down) {
    if (playerBody.velocity.y < 0) {
        player.setTexture("jump");
    } else {
        player.setTexture("fall");
    }
}
```

If the player is not on the ground and moving upward, show `"jump"`. If the player is moving downward, show `"fall"`.

Next, handle running on the ground:

```js
else if (playerBody.velocity.x !== 0) {
    player.setTexture("run");
}
```

Finally, if nothing else is happening, show idle:

```js
else {
    player.setTexture("idle");
}
```

The order matters. Air checks come first because jumping and falling should win over running.

## 17. Handle browser resizing

Because the game fills the window, resizing the browser should move the ground and update the physics bounds.

Add this inside `create`:

```js
this.scale.on("resize", (gameSize) => {
    const newWidth = gameSize.width;
    const newHeight = gameSize.height;
});
```

Inside that resize function, move the ground back to the bottom:

```js
ground.setPosition(newWidth / 2, newHeight - 25);
ground.width = newWidth;
ground.body.updateFromGameObject();
```

Then update the physics world:

```js
this.physics.world.setBounds(0, 0, newWidth, newHeight);
```

This keeps the canvas, ground, and physics world thinking in the same screen size.

## 18. Create a simple README

In `README.md`, write a short description:

```md
# Phaser Game Setup

A beginner Phaser project with a player, ground, gravity, WASD movement, and simple visual states.
```

You can add more notes later as the project grows.

## 19. Run the game

Open `index.html` in a browser.

If everything is connected correctly, you should see:

- A black background.
- A brown ground platform.
- A player image.
- Debug physics boxes.
- `A` and `D` movement.
- `W` jumping.
- Different images for idle, run, jump, and fall.

## Troubleshooting

If the screen is blank, check that the Phaser script loads before `main.js`.

If the player image does not appear, check that the asset path is correct:

```js
"../assets/Idle.gif"
```

If the player falls forever, make sure the ground has static physics:

```js
this.physics.add.existing(ground, true);
```

If the player passes through the ground, make sure the collider exists:

```js
this.physics.add.collider(player, ground);
```

If movement does nothing, make sure `keys` is created in `create` and checked in `update`.

## What to experiment with next

Try changing one value at a time:

- Increase `320` to make left and right movement faster.
- Increase `-450` to make the jump stronger.
- Change `gravity: { y: 900 }` to make the jump feel heavier or floatier.
- Set `debug: false` once the movement feels right.

Small changes are the best way to learn Phaser. Change one thing, refresh, observe what happened, then change the next thing.
