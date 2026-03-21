//include libraries
const Victor = require('victor');

class Bullet {
  constructor(player, vector) {
    //set attributes
    this.player = player
    this.pos = new Victor(this.player.pos.x, this.player.pos.y)
    this.vel = new Victor(vector.x, vector.y)
    this.width = 10
    this.damage = this.player.damage
    this.speed=player.maxSpeed*3
    this.colour = this.player.colour
    this.range = this.player.bulletRange
  }

  /*
  * update the position of the bullet and check it is 
  * within the bounds of the map
  * @param game - the game object so the function can access the map size
  */
  update (game) {
    //update position
    this.pos.x += (this.vel.x*(this.speed))
    this.pos.y += (this.vel.y*(this.speed))

    //check that the bullet is within the map
    if(this.pos.x < -game.mapSize/2 ||
       this.pos.y < -game.mapSize/2 ||
       this.pos.x > game.mapSize/2 ||
       this.pos.y > game.mapSize/2) {

      return 'OFFSCREEN';
    }
  }

}

//exports game module
module.exports = Bullet