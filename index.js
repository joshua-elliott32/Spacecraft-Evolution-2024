//imports libraries
const express = require("express");
const socket = require("socket.io");
const Game = require("./Game.js");
const Player = require("./Player.js");
const Bullet = require("./Bullet.js");
const Spacestation = require("./Spacestation.js");
const Victor = require("victor");

//create express app and tells it what folder to serve
let app = express();
let PORT = 5500;
app.use(express.static("public"));

//Listening for client emits
let server = app.listen(PORT, function () {
  console.log("server running");
});

//setup socket connection
let io = socket(server);

//create new game instance
let game = new Game();

//send gamestate to client
setInterval(function () {
  playerLoop()
  for (let bullet of game.bullets) {
    if (bullet.update(game) == "OFFSCREEN") {
      game.bullets.splice(game.bullets.indexOf(bullet), 1);
    }
  }

  io.emit("gamestate", game);
}, 50);

//resource loop
setInterval(function () {
  //give every player a resource point every 5 seconds
  for (let player of Object.values(game.players)) {
    if (player.alive == true) {
      player.resources += 1;
    }
  }
}, 5000);

io.on("connection", function (socket) {
  //when a new player joins
  game.playerAmount += 1;
  if (game.playerAmount > game.maxPlayers) {
    game.playerAmount -= 1;
  } else {
    game.players[socket.id] = new Player(
      socket.id,
      game.playerAmount,
      game.maxPlayers,
      game.mapSize,
    );
    game.spacestations[socket.id] = new Spacestation(
      socket.id,
      game.players[socket.id].spawnPos,
    );
  }

  socket.on("disconnect", function () {
    //when a player disconnects
    delete game.players[socket.id];
    delete game.spacestations[socket.id];
    game.playerAmount -= 1;
  });

  socket.on("move", function (key, sID) {
    //get player object who called move event
    let player = game.players[sID];
    //check player exists and is alive
    if (player && player.alive) {
      //moves player
      player.move(key);
    }
  });

  socket.on("keyRelease", function (key, sID) {
    //get player object who called this event
    let player = game.players[sID];
    //check player exists and is dead
    //console.log(key)
    if (player && player.alive == false && key == "r") {
      player.respawn();
    }
    if (player && player.alive == false && key == "m") {
      player.alive = null;
    }
  });

  socket.on("mouseClick", function (mx, my, sID) {
    //when a player clicks the mouse
    let player = game.players[sID];
    if (player && player.alive) {
      //calculate bullet direction
      let xDiff = mx - player.screenWidth / 2;
      let yDiff = my - player.screenHeight / 2;
      let mouseDirection = new Victor(xDiff, yDiff);
      mouseDirection.normalize();

      //create bullet
      let newBullet = new Bullet(player, mouseDirection);
      game.bullets.push(newBullet);

      //timer to make bullets only travel for a few seconds
      setTimeout(function () {
        game.bullets.splice(game.bullets.indexOf(newBullet), 1);
      }, player.bulletRange * 1000);
    }
  });

  socket.on("changeScreenSize", function (w, h, sID) {
    //update screen size
    let player = game.players[sID];
    if (player) {
      player.screenWidth = w;
      player.screenHeight = h;
    }
  });

  socket.on("calculateAngle", function (mPos, sID) {
    //calculates the angle the player's ship should be rotated to anlign with mouse
    let player = game.players[sID];
    game.players[sID].angle =
      Math.atan2(
        mPos.y - player.screenHeight / 2,
        mPos.x - player.screenWidth / 2,
      ) +
      Math.PI / 2;
  });

  socket.on("spawn", function (c, name, s, sID) {
    //on player spawn
    if (game.players[sID]) {
      game.players[sID].colour = c;
      game.players[sID].name = name;
      game.players[sID].ship = s;
      game.players[sID].respawn();
    }
  });

  socket.on("upgrade", function (type, sID) {
    //when an upgrade button is pressed
    let player = game.players[sID];
    if (type == "health") player.healthUpgrade();
    if (type == "damage") player.damageUpgrade();
    if (type == "speed") player.speedUpgrade();
  });
});

/*
*function which loops through each player
*to handle collisions and
*prevent the player from leaving the map's bounds
*/
function playerLoop() {
  //loops through each player
  for (let player of Object.values(game.players)) {
    //if player out of the map
    //invert velocity so they cannot leave the map
    if (
      player.pos.x < -game.mapSize / 2 + player.width / 2 ||
      player.pos.y < -game.mapSize / 2 + player.width / 2 ||
      player.pos.x > game.mapSize / 2 - player.width / 2 ||
      player.pos.y > game.mapSize / 2 - player.width / 2
    ) {
      player.vel.invert();
    }

    //check if the player is in range of space station
    if (player.checkCollision(game.spacestations[player.id])) {
      player.inSpacestation = true;
    } else {
      player.inSpacestation = false;
    }

    //player bullet collsion handling
    if (player.alive == true) {
      player.update();
      for (let b of game.bullets) {
        if (player.checkCollision(b)) {
          let indexOfBullet = game.bullets.indexOf(b);
          player.takeDamage(b.damage);
          if (player.health <= 0) {
            player.deathTime = new Date().getTime();
            game.players[b.player.id].kills += 1;
            player.killedBy = game.players[b.player.id].name;
            player.alive = false;
          }
          game.bullets.splice(indexOfBullet, 1);
        }
      }
      //player player collision handling
      for (let p of Object.values(game.players)) {
        if (p.alive == true && player.alive == true)
          if (player.checkCollision(p) && player != p) {
            player.takeDamage(p.damage);
            if (player.health <= 0) {
              player.deathTime = new Date().getTime();
              game.players[p.id].kills += 1;
              player.killedBy = p.name;
              player.alive = false;
            }
            player.vel.invert();
          }
      }
    }
  }
}
