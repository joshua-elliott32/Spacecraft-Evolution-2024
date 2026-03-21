//setup socket connection 
let socket = io();

//define globals
let game = null
const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
let canvas
let font
let bg

//globals for spacestation, upgrades and resources
let spacestation
let upgradeMode = false
let uranium

//ship images
let shipImages

let ship1blue
let ship1green
let ship1orange
let ship1pink
let ship2blue
let ship2green
let ship2orange
let ship2pink
let ship3blue
let ship3green
let ship3orange
let ship3pink
let ship4blue
let ship4green
let ship4orange
let ship4pink

let bPos
let bVel
let mPos
let previousMPos
let a

let currentShip

//define buttons and inputs
let nameInp
let playBtn
let blueBtn
let pinkBtn
let greenBtn
let orangeBtn
let speedUpBtn
let damageUpBtn
let healthUpBtn

//ship buttons and images
let ship1Btn
let ship2Btn
let ship3Btn
let ship4Btn
let ship1BtnImg
let ship2BtnImg
let ship3BtnImg
let ship4BtnImg

/*
* Function built into p5 which preloads images
* and assets before running the project
*/
function preload() {
  bg = loadImage("assets/imgs/spacebg.png")

  spacestation = loadImage("assets/imgs/spacestation.png")

  uranium = loadImage("assets/imgs/uranium.png")

  ship1BtnImg = loadImage("assets/imgs/buttons/ship1Grey.png")
  ship2BtnImg = loadImage("assets/imgs/buttons/ship2Grey.png")
  ship3BtnImg = loadImage("assets/imgs/buttons/ship3Grey.png")
  ship4BtnImg = loadImage("assets/imgs/buttons/ship4Grey.png")
  
  ship1blue = loadImage("assets/imgs/ships/ship1Blue.png")
  ship1pink = loadImage("assets/imgs/ships/ship1Pink.png")
  ship1orange = loadImage("assets/imgs/ships/ship1Orange.png")
  ship1green = loadImage("assets/imgs/ships/ship1Green.png")
  
  ship2blue = loadImage("assets/imgs/ships/ship2Blue.png")
  ship2pink = loadImage("assets/imgs/ships/ship2Pink.png")
  ship2orange = loadImage("assets/imgs/ships/ship2Orange.png")
  ship2green = loadImage("assets/imgs/ships/ship2Green.png")

  ship3blue = loadImage("assets/imgs/ships/ship3Blue.png")
  ship3pink = loadImage("assets/imgs/ships/ship3Pink.png")
  ship3orange = loadImage("assets/imgs/ships/ship3Orange.png")
  ship3green = loadImage("assets/imgs/ships/ship3Green.png")

  ship4blue = loadImage("assets/imgs/ships/ship4Blue.png")
  ship4pink = loadImage("assets/imgs/ships/ship4Pink.png")
  ship4orange = loadImage("assets/imgs/ships/ship4Orange.png")
  ship4green = loadImage("assets/imgs/ships/ship4Green.png")
  
  font = loadFont("assets/fonts/SpaceMissionFont.otf")
  
}

/*
* Function built into p5 which is runs once
*/
function setup() {
  //stores ship images by index of ship type then colour
  shipImages = [
    [ship1blue, ship1pink, ship1orange, ship1green],
    [ship2blue, ship2pink, ship2orange, ship2green],
    [ship3blue, ship3pink, ship3orange, ship3green],
    [ship4blue, ship4pink, ship4orange, ship4green]
  ]
  
  canvas = createCanvas(WIDTH, HEIGHT)
  textFont(font)
  frameRate(20)

  //create all DOM inputs
  createInputs()

  //set vectors for background to 0
  bPos = createVector(0, 0)
  bVel = createVector(0, 0)

  //set vectors for mouse position to 0
  previousMPos = createVector(0, 0)
  mPos = createVector(0, 0)
  
  //listens for gamestate events
  socket.on('gamestate', function(data) {
    //update game data
    game = data
    bVel.x = game.players[socket.id].vel.x
    bVel.y = game.players[socket.id].vel.y
    bPos.x = (bPos.x - bVel.x)
    bPos.y = (bPos.y - bVel.y)
    socket.emit("changeScreenSize", WIDTH, HEIGHT, socket.id)
    //from = createVector(WIDTH/2, HEIGHT/2);

  })

  //if mouse if moved then update mouse angle
  calculateAngle = function() {
    previousMPos = mPos
    //if(mPos.x == previousMPos.x || mPos.y == previousMPos.y && game.players[socket.id]) {
      socket.emit("calculateAngle", {x: mouseX, 
                                    y: mouseY}, socket.id)
      previousMPos.set(mouseX, mouseY)
    //}
  }
  canvas.mouseMoved(calculateAngle)

}

/*
* Function built into p5 which runs every frame
*/
function draw () {
  //set mPos vector to current mouse positions
  mPos.set(mouseX, mouseY);

  drawBG()

  //check what screen to draw
  if(game) {
    if(Object.values(game.players).length>0){
      //gameplay screen
      if(game.players[socket.id] && game.players[socket.id].alive == true){
        drawGame()
        movement()
      }
      //death screen
      else if (game.players[socket.id] && game.players[socket.id].alive == false) {
        drawEnd()
      }

      //start screen
      else if (game.players[socket.id] && game.players[socket.id].alive == null) {
        drawStart()
      }
    }
  }
}

/*
* This function checks the WASD inputs
* and if there is a key pressed then
* the move event is sent to the server
*/
function movement() {
  //if w key pressed down
  if (keyIsDown(87)) {
    socket.emit("move", "w", socket.id)
  }
  //if s key pressed down
  if (keyIsDown(83)) {
    socket.emit("move", "s", socket.id)
  }
  //if a key pressed down
  if (keyIsDown(65)) {
    socket.emit("move", "a", socket.id)
  }
  //if d key pressed down
  if (keyIsDown(68)) {
    socket.emit("move", "d", socket.id)
  }
}

/*
* Function built into p5 which is called when any key is released
* sends key release event to the server
* and checks for U button press for upgrade mode toggle
*/
function keyReleased() {
  //sends server the key that was just released
  socket.emit("keyRelease", key, socket.id)

  let player = game.players[socket.id]

  //check if player wants to upgrade
  if(player && player.alive==true && key == "u" && player.inSpacestation == true) {
    if(upgradeMode==true){
      upgradeMode=false
    }
    else {
      upgradeMode=true
    }
  }
}

/*
* Shows or hides upgrade buttons based on:
* whether upgrade mode is true and
* the player is within their space station
*/
function drawUpgrades() {
  //show upgrade buttons
  if (upgradeMode == true && game.players[socket.id].inSpacestation) {
    speedUpBtn.show()
    damageUpBtn.show()
    healthUpBtn.show()
  }
  //hide upgrade buttons
  else {
    speedUpBtn.hide()
    damageUpBtn.hide()
    healthUpBtn.hide()
  }
}

/*
* Function built into p5 called on every mouse press
* sends mouse click event to the server
*/
function mousePressed() {
  //if mouse is wihtin the screen
  if (mouseX > 0 && mouseY > 0 && mouseX < WIDTH && mouseY < HEIGHT) {
    socket.emit("mouseClick", mouseX, mouseY,socket.id)
  }
}

/*
* draws the players, bullets, map border, 
* space stations and upgrade prompts
*/
function drawGame () {
  //draw gameplay screen
  hideStartInputs()
  if(game) {
    if(Object.values(game.players).length>0){
      translate(WIDTH/2 - game.players[socket.id].pos.x, HEIGHT/2 - game.players[socket.id].pos.y)
      for(player of Object.values(game.players)){
        //for each player
        if(player.alive == true) {
          push()
          //draw health bars
          drawHealth(player)

          //position and rotate player ship
          translate(player.pos.x, player.pos.y)
          rotate(player.angle)

          //draw player ship
          fill("white")
          let showShip = shipImages[player.ship-1][player.colour.split(" ")[2]]
          image(showShip, -player.width/2, -player.width/2, player.width, player.width)
          pop()

          
          push()
          //draw player name
          fill("white")
          textSize(16)
          text(player.name, player.pos.x-player.width/14*player.name.length, player.pos.y+player.width/4*3)
          if(player == game.players[socket.id]) {
            //drawLeaderboard()
            drawResources(player)
            if(player.inSpacestation==true) {
              //draw upgrade prompts
              textSize(30)
              text("Press u to upgrade!", player.pos.x - 140, player.pos.y + 180)
              text("Upgrade Cost: "+ player.level, player.pos.x - 140, player.pos.y + 230)
              image(uranium, player.pos.x + 115, player.pos.y + 195, 50, 50)
            }
            }
          pop()
        }
      }

      push()
      //draw map border
      noFill()
      stroke("white")
      strokeWeight(8)
      rect(-game.mapSize/2, -game.mapSize/2, game.mapSize, game.mapSize, 10)
      pop()


      push()
      for (let s of Object.values(game.spacestations)) {
        //draw space stations
        image(spacestation, s.pos.x - s.size/2, s.pos.y-s.size/2, s.size, s.size)
        noFill()
        stroke("white")
        ellipseMode(CENTER)
        circle(s.pos.x, s.pos.y, s.width, s.width)
      }
      pop()

      drawUpgrades()

      for(bullet of game.bullets) {
        //draw bullets
        push()
        fill(bullet.colour.split(" ")[1])
        circle(bullet.pos.x, bullet.pos.y, bullet.width)
        pop()
      }
    }
    //check for WASD inputs
    movement()
  }
}

/*
* draws the resource counter in the bottom right
*/
function drawResources(player) {
  //draw resource counter in bottom right
  push()
  textSize(30)
  console.log(player.resources)
  image(uranium, player.pos.x + WIDTH/2 - 140, player.pos.y + HEIGHT/2 - 90, 50, 50)
  text(player.resources, player.pos.x + WIDTH/2 - 70, player.pos.y + HEIGHT/2 - 50)
  pop()
}

/*
* draws the whole start screen and sets styles for DOM elements
*/
function drawStart (){
  //draw main menu start screen
  showStartInputs()
  push()
  let fontSize = 60
  nameInp.style("border-color", document.getElementsByClassName("active colourButtons")[0].attributes.colour.value.split(" ")[1])
  playBtn.style("border-color", document.getElementsByClassName("active colourButtons")[0].attributes.colour.value.split(" ")[1])
  ship1Btn.style("border-color", document.getElementsByClassName("active colourButtons")[0].attributes.colour.value.split(" ")[1])
  ship2Btn.style("border-color", document.getElementsByClassName("active colourButtons")[0].attributes.colour.value.split(" ")[1])
  ship3Btn.style("border-color", document.getElementsByClassName("active colourButtons")[0].attributes.colour.value.split(" ")[1])
  ship4Btn.style("border-color", document.getElementsByClassName("active colourButtons")[0].attributes.colour.value.split(" ")[1])
  fill("white")
  textSize(fontSize)
  text("Spacecraft Evolution", WIDTH/2 - fontSize*5, fontSize*1.5)
  pop()

}

/*
* draws the death screen
*/
function drawEnd() {
  let player = game.players[socket.id]
  push()
  //draw heading
  fill("white")
  textSize(80)
  text("You were killed by " + player.killedBy+"!", WIDTH/12, 80*1.5)
  textSize(50)

  //calculate time survived
  let dt = player.deathTime
  let st = player.spawnTime
  let duration = dt-st
  let minutes = floor(duration/(1000*60))
  let seconds = floor((duration-(minutes*60000)) /1000)
  let textDuration = minutes + "m " + seconds + "s"

  //draw death statistics
  text("Kills: "+ player.kills, WIDTH/20, HEIGHT/12*4)
  text("Time Survived: " + textDuration,  WIDTH/20, HEIGHT/12*6)
  image(shipImages[player.ship-1][player.colour.split(" ")[2]], WIDTH/3*2, HEIGHT/7*2, WIDTH/4, WIDTH/4)

  //draw prompts for next screen
  text("Press r to Respawn", WIDTH/20, HEIGHT/12*8)
  text("Press m to Main Menu", WIDTH/20, HEIGHT/12*10)

  pop()
}

/*
* draws background images in all areas player can see
*/
function drawBG() {
  let showX = bPos.x % WIDTH
  let showY = bPos.y % HEIGHT
  image(bg, showX, showY + HEIGHT, WIDTH, HEIGHT)
  image(bg, showX, showY, WIDTH, HEIGHT)
  image(bg, showX - WIDTH, showY, WIDTH, HEIGHT)
  image(bg, showX, showY - HEIGHT, WIDTH, HEIGHT)
  image(bg, showX - WIDTH, showY - HEIGHT, WIDTH, HEIGHT)
  image(bg, showX + WIDTH, showY, WIDTH, HEIGHT)
  image(bg, showX + WIDTH, showY + HEIGHT, WIDTH, HEIGHT)
  image(bg, showX - WIDTH, showY + HEIGHT, WIDTH, HEIGHT)
  image(bg, showX + WIDTH, showY - HEIGHT, WIDTH, HEIGHT)
}

/*
* If conditions are met sends spawn event to server
*/
function playBtnPressed () {
  //on play button pressed
  if(nameInp.value()) {
    //if name is given
    this.addClass("active")
    hideStartInputs()

    //get colour and ship attribute from active buttons
    let c = document.getElementsByClassName("active colourButtons")[0].attributes.colour.value
    let s = document.getElementsByClassName("active shipButtons")[0].attributes.ship.value

    //send spawn event to server
    socket.emit("spawn", c, nameInp.value(),s ,socket.id)
    
  }
}

/*
* sets active class to only the colour button which is selected
*/
function colourButtonPressed () {
  //remove active class
  greenBtn.removeClass("active")
  blueBtn.removeClass("active")
  pinkBtn.removeClass("active")
  orangeBtn.removeClass("active")
  //set button to active when pressed
  this.addClass("active")
}

/*
* sets active class to only the ship button which is selected
*/
function shipButtonPressed() {
  //remove active class
  ship1Btn.removeClass("active")
  ship2Btn.removeClass("active")
  ship3Btn.removeClass("active")
  ship4Btn.removeClass("active")
  //set button to active when pressed
  this.addClass("active")
  
}

/*
* Limits the name length to 14 characters
*/
function nameInput() {
  //sets max name length
  let name = this.value()
  if (name.length > 14) {
    this.value(name.substring(0, name.length - 1))
  }
  return name
}

/*
* hides all inputs and buttons on the start screen
*/
function hideStartInputs () {
  //hide all buttons on start screen
  playBtn.hide()
  greenBtn.hide()
  blueBtn.hide()
  pinkBtn.hide()
  orangeBtn.hide()
  nameInp.hide()
  ship1Btn.hide()
  ship2Btn.hide()
  ship3Btn.hide()
  ship4Btn.hide()
}

/*
* shows all inputs and buttons on the start screen
*/
function showStartInputs () {
  //show all buttons on start screen
  playBtn.show()
  greenBtn.show()
  blueBtn.show()
  pinkBtn.show()
  orangeBtn.show()
  nameInp.show()
  ship1Btn.show()
  ship2Btn.show()
  ship3Btn.show()
  ship4Btn.show()
}

/*
* creates all DOM inputs and buttons
*/
function createInputs() {
  //create play button
  playBtn = createButton('Play')
  playBtn.addClass("buttons")
  playBtn.addClass("playButton")
  playBtn.position(WIDTH / 2 - WIDTH/8, HEIGHT - 40 - HEIGHT/100*15)
  playBtn.size(WIDTH / 4, HEIGHT/100*15)
  playBtn.mousePressed(playBtnPressed)

  //create green button
  greenBtn = createButton("")
  greenBtn.addClass("buttons")
  greenBtn.addClass("colourButtons")
  greenBtn.addClass("greenButton")
  greenBtn.addClass("active")
  greenBtn.position((WIDTH/2 - HEIGHT/10*2) - HEIGHT/20, HEIGHT/5*3)
  greenBtn.size(HEIGHT/10, HEIGHT/10)
  greenBtn.mousePressed(colourButtonPressed)
  greenBtn.attribute("colour", "green #1ded40 3")

  //blue button
  blueBtn = createButton("")
  blueBtn.addClass("buttons")
  blueBtn.addClass("colourButtons")
  blueBtn.addClass("blueButton")
  blueBtn.position((WIDTH/2 - HEIGHT/15) - HEIGHT/20, HEIGHT/5*3)
  blueBtn.size(HEIGHT/10, HEIGHT/10)
  blueBtn.mousePressed(colourButtonPressed)
  blueBtn.attribute("colour", "blue #00B7ef 0")

  //pink button
  pinkBtn = createButton("")
  pinkBtn.addClass("buttons")
  pinkBtn.addClass("colourButtons")
  pinkBtn.addClass("pinkButton")
  pinkBtn.position((WIDTH/2 + HEIGHT/15) - HEIGHT/20, HEIGHT/5*3)
  pinkBtn.size(HEIGHT/10, HEIGHT/10)
  pinkBtn.mousePressed(colourButtonPressed)
  pinkBtn.attribute("colour", "pink #f70ac8 1")

  //orange button
  orangeBtn = createButton("")
  orangeBtn.addClass("buttons")
  orangeBtn.addClass("colourButtons")
  orangeBtn.addClass("orangeButton")
  orangeBtn.position((WIDTH/2 + HEIGHT/10*2) - HEIGHT/20, HEIGHT/5*3)
  orangeBtn.size(HEIGHT/10, HEIGHT/10)
  orangeBtn.mousePressed(colourButtonPressed)
  orangeBtn.attribute("colour", "orange #ff3700 2")

  //name input
  nameInp = createInput("")
  nameInp.addClass("inputs")
  nameInp.position(WIDTH / 2 - WIDTH/4, HEIGHT/5)
  nameInp.size(WIDTH/2, HEIGHT/100*15)
  nameInp.input(nameInput)

  //ship3btn
  ship3Btn = createImg("assets/imgs/buttons/ship3Grey.png")
  ship3Btn.addClass("buttons")
  ship3Btn.addClass("shipButtons")
  ship3Btn.position(WIDTH/2 + ((HEIGHT/100*15)*0.6) - HEIGHT/100*15/2, HEIGHT/5*2)
  ship3Btn.size(HEIGHT/100*15, HEIGHT/100*15)
  ship3Btn.mousePressed(shipButtonPressed)
  ship3Btn.attribute("ship", "3")

  //ship4btn 
  ship4Btn = createImg("assets/imgs/buttons/ship4Grey.png")
  ship4Btn.addClass("buttons")
  ship4Btn.addClass("shipButtons")
  ship4Btn.position(WIDTH/2 + ((HEIGHT/100*15)*1.8) - HEIGHT/100*15/2, HEIGHT/5*2)
  ship4Btn.size(HEIGHT/100*15, HEIGHT/100*15)
  ship4Btn.mousePressed(shipButtonPressed)
  ship4Btn.attribute("ship", "4")

  //ship1btn
  ship1Btn = createImg("assets/imgs/buttons/ship1Grey.png")
  ship1Btn.addClass("buttons")
  ship1Btn.addClass("shipButtons")
  ship1Btn.addClass("active")
  ship1Btn.position(WIDTH/2 - ((HEIGHT/100*15)*1.8) - HEIGHT/100*15/2, HEIGHT/5*2)
  ship1Btn.size(HEIGHT/100*15, HEIGHT/100*15)
  ship1Btn.mousePressed(shipButtonPressed)
  ship1Btn.attribute("ship", "1")

  //ship2btn
  ship2Btn = createImg("assets/imgs/buttons/ship2Grey.png")
  ship2Btn.addClass("buttons")
  ship2Btn.addClass("shipButtons")
  ship2Btn.position(WIDTH/2 - ((HEIGHT/100*15)*0.6) - HEIGHT/100*15/2, HEIGHT/5*2)
  ship2Btn.size(HEIGHT/100*15, HEIGHT/100*15)
  ship2Btn.mousePressed(shipButtonPressed)
  ship2Btn.attribute("ship", "2")

  //speedUpBtn
  speedUpBtn = createButton ("Speed")
  speedUpBtn.addClass("buttons")
  speedUpBtn.addClass("upgradeButtons")
  speedUpBtn.position(WIDTH/2 - HEIGHT/100*15, HEIGHT/2)
  speedUpBtn.size(HEIGHT/100*30, HEIGHT/100*15)
  speedUpBtn.mousePressed(speedUpgrade)
  speedUpBtn.hide()

  //damageUpBtn
  damageUpBtn = createButton ("Damage")
  damageUpBtn.addClass("buttons")
  damageUpBtn.addClass("upgradeButtons")
  damageUpBtn.position(WIDTH/2 + (HEIGHT/100*30)*1.5 - HEIGHT/100*15, HEIGHT/2)
  damageUpBtn.size(HEIGHT/100*30, HEIGHT/100*15)
  damageUpBtn.mousePressed(damageUpgrade)
  damageUpBtn.hide()

  //healthUpBtn
  healthUpBtn = createButton ("Health")
  healthUpBtn.addClass("buttons")
  healthUpBtn.addClass("upgradeButtons")
  healthUpBtn.position(WIDTH/2 - (HEIGHT/100*30)*1.5 - HEIGHT/100*15, HEIGHT/2)
  healthUpBtn.size(HEIGHT/100*30, HEIGHT/100*15)
  healthUpBtn.mousePressed(healthUpgrade)
  healthUpBtn.hide()
  
}

//send event to server on upgrade pressed
function healthUpgrade() {
  socket.emit("upgrade", "health", socket.id)
}
//send event to server on upgrade pressed
function damageUpgrade() {
  socket.emit("upgrade", "damage", socket.id)
}
//send event to server on upgrade pressed
function speedUpgrade() {
  socket.emit("upgrade", "speed", socket.id)
}

/*
* draws the health bars for each player
* 
* @param player the player which health bar is being drawn
*/
function drawHealth(player) {
  //draw player health bars
  push()
  noFill()
  stroke("white")
  rect(player.pos.x - 50, player.pos.y- 70, 100, 20, 10)
  fill(player.colour.split(" ")[1])
  rect(player.pos.x - 50, player.pos.y- 70, player.health/player.maxHealth*100, 20, 10)
  pop()
}

