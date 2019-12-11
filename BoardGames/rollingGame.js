// Required data for BGLib
var playerRange = [2,6];
var gameName = "Journey";

function setup(){
    buttons.push(new Button(600,250,100,100,basicImagePath+"rolling-dices.png",click=function(){
        this.active = false;
        currentTurnState = 'rollingDice';
        rollDice();
    }));
}

// Classes
function player(user){
    this.user = user;
    this.progress = 0;
}

function Die(x,y){
    this.x = x;
    this.y = y;
    this.imgs = [];
    for (var i = 0; i < 6; i++){
        this.imgs.push(new Image());
        this.imgs[i].src = basicImagePath+'perspective-dice-six-faces-'+numberNames[i]+'.png';
    }
    this.currentFace = random(1,6);
    this.randTicksLeft = 12;
}

Die.prototype.draw = function(static=false){
    if (!static){
        this.currentFace = random(1,6);
        this.randTicksLeft -= 1;
    }
    
    ctx.drawImage(this.imgs[this.currentFace-1],this.x,this.y,70,70);
}

// Variables
var currentTurnState;
var numberNames = [
    'one','two','three','four','five','six'
];
var log = [];

// Functions
journeyPlayers = [];
function startGame(){
    for (var i = 0; i < players.length; i++){
        journeyPlayers.push(new player(players[i]));
    }

    nextTurn();
}

function nextTurn(){
    currentTurnState = 'start';
    currentTurn++;
    if (currentTurn >= players.length){currentTurn = 0;}
    if (!options["hotseat"] && players[currentTurn] != cAccount){
        exportNextTurn();
        return;
    }
    
    log.unshift("It's "+players[currentTurn]+"'s turn!");
    buttons[0].active = true;
    showGame();
}

function showGame(){
    ctx.textAlign = 'center';
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle = 'rgb(200,200,200)';
    ctx.fillRect(0,0,width,height);

    ctx.fillStyle = 'white';
    ctx.fillRect(width-260,0,260,300);

    ctx.fillStyle = 'black';
    if (currentTurnState == 'start'){
        ctx.font = '40px Arial';
        if (options["hotseat"]){
            ctx.fillText("It's "+players[currentTurn]+"'s turn! Click to roll the dice!",1300/2,50);
        } else {
            ctx.fillText("It's your turn! Click to roll the dice!",1300/2,50);
        }
        
    }

    ctx.font = '35px Fantasy';
    ctx.fillText("Players",width-130,40);

    ctx.font = '20px Arial';
    sortedPlayers = sortPlayers(journeyPlayers);
    for (var i = 0; i < sortedPlayers.length; i++){
        ctx.fillText(sortedPlayers[i].user+" - "+sortedPlayers[i].progress,width-130,80+i*30);
    }

    for (var i = 0; i < buttons.length; i++){
        if (buttons[i].active){
            buttons[i].draw();
        }
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,300,height)
    ctx.fillStyle = 'black';
    ctx.font = '15px Arial';
    for (var i = 0; i < log.length; i++) {
        ctx.fillText(log[i],150,550 - i * 30);
        if (i > 15) {
            break;
        }
    }
    
    ctx.fillStyle = 'white';
    for (var j = 400; j > 0; j-=4) {
        ctx.globalAlpha = j / 400;
        ctx.fillRect(0,400-j,300,4);
    }
    
    ctx.globalAlpha = 1;
}

function sortPlayers(j){
    sortedPlayers = [];
    p = [];
    for (var i = 0; i < j.length; i++){
        p.push(j[i]);
    }

    while (p.length > 0){
        largest = {};
        largest.progress = -1;
        for (var i = 0; i < p.length; i++){
            if (p[i].progress > largest.progress){
                largest = p[i];
            }
        }

        sortedPlayers.push(largest);
        for (var i = 0; i < p.length; i++){
            if (p[i] == largest){
                p.splice(i,1);
                break;
            }
        }
    }
    return sortedPlayers;
}

function exportNextTurn(){
    $("#game").hide();
    $("#nextTurn").show();

    document.getElementById("whoseTurn").innerHTML = "It's "+players[currentTurn]+"'s Turn!";
    document.getElementById("sendEmail").href = "mailto:"+playerEmails[currentTurn]+"?subject="+gameName+" - It's Your Turn, "+players[currentTurn]+"!&body="+exportGame();
}

function exportGame(){
    data = {
        "players":players,
        "journeyPlayers":journeyPlayers,
        "options":options,
        "currentTurn":currentTurn,
        "emails":playerEmails,
        "log":log,
        "winner":winner
    }
    return JSON.stringify(data);
}

function loadGameData(){
    data = document.getElementById("loadData").value;
    if (data == undefined){return alert("Please paste the load data in first!")}

    data = JSON.parse(data);
    players = data.players;
    journeyPlayers = data.journeyPlayers;
    options = data.options;
    currentTurn = data.currentTurn-1;
    emails = data.playerEmails;
    log = data.log;
    $("#loadGame").hide();
    $("#game").show();
    setup();
    nextTurn();
}

function checkClick(e){
    x = e.clientX-10;
    y = e.clientY-10;

    for (var i = 0; i < buttons.length; i++){
        if (buttons[i].active &&
             buttons[i].x+buttons[i].w > x && x > buttons[i].x &&
             buttons[i].y+buttons[i].h > y && y > buttons[i].y){
            buttons[i].click();
        }
    }
}

function rollDice(){
    die1 = new Die(630,280);
    die2 = new Die(670,320);
    updateDice();
    diceInterval = window.setInterval(updateDice,500);
}

function updateDice(){
    showGame();
    die1.draw();
    die2.draw();
    if (die1.randTicksLeft <= 0){
        window.clearInterval(diceInterval);
        log.unshift(players[currentTurn]+" rolled a "+die1.currentFace+" + "+die2.currentFace);
        log.unshift("for a total of "+(die1.currentFace+die2.currentFace)+" movement!");
        journeyPlayers[currentTurn].progress += die1.currentFace+die2.currentFace;
        currentTurnState = 'endTurn';
        if (journeyPlayers[currentTurn].progress >= 50){
            log.unshift(players[currentTurn]+" has won!");
            currentTurnState = 'gameOver';
            winner = players[currentTurn];
        }
        showGame();
        die1.draw(true);
        die2.draw(true);
        if (currentTurnState == 'endTurn'){
            window.setTimeout(nextTurn,3000);
            return;
        } else {

        }
    }
}
