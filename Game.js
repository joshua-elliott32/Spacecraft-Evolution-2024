class Game {
  constructor() {
    //set attributes
    this.players = {}
    this.bullets = []
    this.playerAmount = 0
    this.leaderboard = {}
    this.spacestations = {}
    this.mapSize = 5000
    this.maxPlayers = 6
  }
}

//exports game module
module.exports = Game