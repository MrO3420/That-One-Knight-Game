const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = 1899
canvas.height = 925

// c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 1

class Sprite {
    constructor({ position, velocity, imageSrc }) {
        this.position = position
        this.velocity = velocity
        this.height = 150
        this.lastKey

        this.image = new Image();
        this.image.src = imageSrc;
    }

    // draw() {
    // c.fillStyle = 'red'
    // c.fillRect(this.position.x, this.position.y, 50, this.height)

    //  }

    draw(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y);
    }

    update() {
           this.draw(ctx)
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y


        if (this.position.y + this.height + this.velocity.y >= canvas.height) {
            this.velocity.y = 0
        } else this.velocity.y += gravity
    }
}

// const playerSprite = new Image();
// playerSprite.src = "/assets/_idle.gif";



const player = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/Idle.gif'
})

const enemy = new Sprite({
    position: {
        x: 1850,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/_Idle.gif'
})




// const enemy = new Sprite({
//     position: {
//         x: 1850,
//         y: 0
//     },
//     velocity: {
//         x: 0,
//         y: 0
//     }
// })



console.log(player)

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }


}

function drawPlayer() {
    ctx.drawImage(
        playerSprite,
        player.x - camera.x,
        player.y,
        player.width,
        player.height
    );
}


function animate() {
    window.requestAnimationFrame(animate)
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    enemy.update()

    player.velocity.x = 0
    enemy.velocity.x = 0

    //player 1 movement
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -6
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 6
    }


    //player 2 movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -6
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 6
    }

}

animate()
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = true
            player.lastKey = 'd'
            break

        case 'a':
            keys.a.pressed = true
            player.lastKey = 'a'
            break

        case 'w':
            player.velocity.y = -20
            break

        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            enemy.lastKey = 'ArrowRight'

            break

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            enemy.lastKey = 'ArrowLeft'
            break

        case 'ArrowUp':
            enemy.velocity.y = -20
            break
    }
    console.log(event.key);
})



window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 'w':
            keys.w.pressed = false
            break
    }

    // enemy keys
    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
        case 'ArrowUp':
            keys.ArrowUp.pressed = false
            break
    }
    console.log(event.key);
})
