//include libraries
const Victor = require('victor');

class Spacestation {
  constructor(sID, playerSpawnPos) {
    //set attributes
    this.id = sID
    this.pos = new Victor(playerSpawnPos.x, playerSpawnPos.y)
    this.playerAmount = 0
    this.heal = 1
    this.width = 400
    this.size = 150
  }
}

//exports game module
module.exports = Spacestation