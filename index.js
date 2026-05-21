const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1899
canvas.height = 925

c.fillRect(0, 0, canvas.width, canvas.height)

class Sprite {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
    }

draw() {
c.fillStyle = 'red'
c.fillRect(this.position.x, this.position.y, 50, 150)

 }

 update() {
    
 }
}



const player = new Sprite({
    position: {
    x: 0,
    y: 0
    },
    velocity: {
       x: 0,
       y: 0
    }
})

player.draw()

const enemy  = new Sprite({
    position: {
    x: 1899,
    y: 925
    },
    velocity: {
       x: 0,
       y: 0
    }
})

enemy.draw()

console.log(player)

function animate() {
    window.requestAnimationFrame(animate)
    console.log('move')
}

animate()
