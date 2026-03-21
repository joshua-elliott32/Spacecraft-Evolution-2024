//include libraries
const Victor = require('victor');

class Player {
  constructor(sID, numberOfPlayers, maxPlayers, mapSize) {
    //socket id of the player
    this.id = sID
    
    //set movement attributes
    this.vel = new Victor(0,0)
    this.acc = 1
    this.dec = 0.4
    this.maxSpeed = 12

    //set visual and collision attributes
    this.width = 75
    this.angle
    this.a
    this.b
    this.c
    this.colour
    this.name
    this.ship
    this.inSpacestation = true

    //set health and damage attributes
    this.alive = null
    this.maxHealth = 5
    this.health = this.maxHealth
    this.damage = 1
    this.bulletRange = 3
    
    //set upgrade attributes
    this.resources = 0
    this.level = 1
    
    
    //set statistic attributes
    this.killedBy
    this.spawnTime
    this.deathTime
    this.kills = 0

    //set spawn point
    if(numberOfPlayers < maxPlayers/2+1) {
      this.spawnPos = new Victor(mapSize/(maxPlayers/2+1)*numberOfPlayers- mapSize/2, -mapSize/3)
    }
    else {
      this.spawnPos = new Victor (mapSize/(maxPlayers/2+1)*(numberOfPlayers-maxPlayers/2)-mapSize/2, mapSize/3)
    }
    this.pos = new Victor (this.spawnPos.x, this.spawnPos.y)
    
  }

  /*
  * increases the velocity of the player based on player key press
  * on the condition the player is not already at max speed
  * @param key - the key which has been pressed by the player
  */
  move(key) {
    //only allow increase of velocity if below max speed
    //y direction
    if (Math.abs(this.vel.y) < this.maxSpeed) {
      if (key == "w") this.vel.y -= this.acc
      if (key == "s") this.vel.y += this.acc
    }
    //x direction
    if (Math.abs(this.vel.x) < this.maxSpeed) {
      if (key == "a") this.vel.x -= this.acc
      if (key == "d") this.vel.x += this.acc
    }
  }

  /*
  *decelerates the player and moves the player by its velocity
  */
  update() {	    
    //check what direction player travelling and then decrease absolute velocity
    Math.sign(this.vel.x)==0 ? this.vel.x = 0 : Math.sign(this.vel.x)==1 ? this.vel.x-=this.dec: this.vel.x+=this.dec;
    Math.sign(this.vel.y)==0 ? this.vel.y = 0 : Math.sign(this.vel.y)==1 ? this.vel.y-=this.dec: this.vel.y+=this.dec;

    if(Math.abs(this.vel.x)<this.acc) this.vel.x = 0
    if(Math.abs(this.vel.y)<this.acc) this.vel.y = 0

    //move player by velocity
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y

  }

  /*
  * checks for collisions between the player and another object
  * @param o - object to use to check for collisions
  */
  checkCollision(o) {
    //check for collsion between circlular object o and the player
    this.a = (this.pos.x - o.pos.x) ** 2
    this.b = (this.pos.y - o.pos.y) ** 2
    this.c = Math.sqrt(this.a + this.b)
    if ((this.c) <= (this.width / 2) + (o.width / 2)) {
      if (this != o.player) {
        return true;
      }
    }
    return false;
  }

  /*
  * resets values on the player respawning
  */
  respawn () {
    this.pos.x = this.spawnPos.x
    this.pos.y = this.spawnPos.y
    this.vel.x = 0
    this.vel.y = 0
    this.health = this.maxHealth
    this.alive = true
    this.spawnTime = (new Date()).getTime()
    this.inSpacestation = true
    
  }

  /*
  * reduces the player's health by a set amount of damage
  * @param damage - damage dealt by other player
  */
  takeDamage (damage) {
    this.health -= damage
  }

  //upgrade attribute, level and decrease resources
  healthUpgrade() {
    if(this.resources>=this.level) {
      this.resources -= this.level
      this.maxHealth+=1
      this.health+=1
      this.level+=1
    }
  }
  //upgrade attribute, level and decrease resources
  damageUpgrade() {
    if(this.resources>=this.level) {
      this.resources -= this.level
      this.damage+=1
      this.level+=1
    }
  }
  //upgrade attribute, level and decrease resources
  speedUpgrade() {
    if(this.resources>=this.level) {
      this.resources -= this.level
      this.maxSpeed+=1
      this.level+=1
    }
  }

}

//exports player module
module.exports = Player

