// Basic Functions
function isIn(item,array) {
    for (var i = 0; i < array.length; i++) {
        if (item == array[i]) {
            return true;
        }
    }
    
    return false;
}

function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max) - min + 1;
    return Math.floor(Math.random() * max) + min;
}

// Classes
function Button(x,y,w,h,img,click=function(){},txt='',alpha=1,fill="white",textFill="black"){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.click = click;
    this.txt = txt;
    this.isImg = (img != 0);
    if (this.isImg){
        this.img = new Image();
        this.img.src = img;
    }
    this.alpha = alpha;
    this.fill = fill;
    this.textFill = this.textFill;
    this.active = false;
}

Button.prototype.draw = function(){
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x,this.y,this.w,this.h);
    if (this.isImg){
        ctx.drawImage(this.img,this.x+5,this.y+5,this.w-10,this.h-10);
    }

    ctx.globalAlpha = 1;
}

// Data
var basicImagePath = 'BGCommonImages/';
var buttons = [];
var options = {};
var currentTurn = -1;
var players = [];
var playerEmails = [];
var cAccount;
var ctx;
var width = 1300;
var height = 600;
var winner = -1;

// Main Functions
$(document).ready(function(){
    document.body.innerHTML += '<canvas id="game" width="1300" height="600"></canvas>';
    document.body.innerHTML += "<div id='login'></div>";
    document.body.innerHTML += "<div id='menu'></div>";
    document.body.innerHTML += "<div id='nextTurn'></div>";
    document.body.innerHTML += "<div id='loadGame'></div>";
    document.body.innerHTML += "<div id='newGameMenu'></div>";
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    canvas.addEventListener("click", checkClick);

    document.getElementById("login").innerHTML += '<h2>Please Login or Register.</h2>';
    document.getElementById("login").innerHTML += '<p>Username: <input type="text" id="username"/></p>';
    document.getElementById("login").innerHTML += '<p>Password: <input type="password" id="password"></p>';
    document.getElementById("login").innerHTML += '<p><button onclick="register();">Register this as a new account.</button></p>';
    document.getElementById("login").innerHTML += '<p><button onclick="login();">Login</button></p>';

    document.getElementById("menu").innerHTML += '<h1 id="GameName">'+gameName+'</h1>';
    document.getElementById("menu").innerHTML += '<p><button onclick="showNewGame();">New Game</button></p>';
    document.getElementById("menu").innerHTML += '<p><button onclick="showLoadGame();">Load Game</button></p>';

    document.getElementById("newGameMenu").innerHTML += '<form>';
    document.getElementById("newGameMenu").innerHTML += '<h1 id="GameName">'+gameName+'</h1>';
    document.getElementById("newGameMenu").innerHTML += '<p>Players: <span id="playerNumShow"></span> <input onmousemove="updatePlayers();" type="range" id="playerNum"></input></p>';
    document.getElementById("newGameMenu").innerHTML += '<div id="PlayerOptions"></div>';
    document.getElementById("newGameMenu").innerHTML += '<div id="GameOptions"><h3>Additional Options</h3><p>Hotseat Game: <input id="isHotseat" type="checkbox"></input></p></div>';
    document.getElementById("newGameMenu").innerHTML += '<p><button onclick="validateGameOptions();">Start Game</button></p>';
    document.getElementById("newGameMenu").innerHTML += '</form>';

    document.getElementById("nextTurn").innerHTML += '<h1 id="whoseTurn"></h1>';
    document.getElementById("nextTurn").innerHTML += '<p><a id="sendEmail">Send Email</a></p>';

    document.getElementById("loadGame").innerHTML += '<h1>Load Game</h1>';
    document.getElementById("loadGame").innerHTML += '<p><textarea style="width:400px;height:170px; placeholder="Paste load data here" id="loadData"></textarea></p>';
    document.getElementById("loadGame").innerHTML += '<p><button onclick="loadGameData();">Load Game Data</button></p>';

    document.getElementById("playerNum").min = playerRange[0];
    document.getElementById("playerNum").max = playerRange[1];
    document.getElementById("playerNum").value = playerRange[1];

    $("#game").hide();
    $("#nextTurn").hide();
    $("#newGameMenu").hide();
    $("#menu").hide();
    $("#loadGame").hide();

    loadAccountsData();
    setupPlayers();
    updatePlayers();
    setup();
});

function setupPlayers(){
    document.getElementById("playerNumShow").innerHTML = playerRange[1];
    for (var i = 0; i < playerRange[1]; i++){
        document.getElementById("PlayerOptions").innerHTML += "<p id='player"+(i+1)+"'>Username: <input type='text' id='player_"+(i+1)+"'></input> Email: <input type='text' id='playerEmail_"+(i+1)+"'></input></p>";
    }
}

function updatePlayers(){
    var c = document.getElementById("playerNum").value;
    document.getElementById("playerNumShow").innerHTML = c;
    for (var i = 0; i < playerRange[1]; i++){
        if (i < c){
            $("#player"+(i+1)).show();
        } else {
            $("#player"+(i+1)).hide();
        }
    }
}

function loggedIn(username){
    cAccount = username;
    $("#menu").show();
    $("#login").hide();
}

function showNewGame(){
    $("#menu").hide();
    $("#newGameMenu").show();
}

function showLoadGame(){
    $("#menu").hide();
    $("#loadGame").show();
}

function validateGameOptions(){
    players = [];
    playerEmails = [];
    for (var i = 0; i < document.getElementById("playerNum").value; i++){
        p = document.getElementById("player_"+(i+1)).value;
        if (p == undefined){
            return alert('You must supply a username for each player!');
        }
        players.push(p);

        e = document.getElementById("playerEmail_"+(i+1)).value;
        if (e == undefined){e = "email@gmail.com";}
        playerEmails.push(e);
    }

    if (!isIn(cAccount,players)){
        if (!confirm("Are you sure you want to start a game without playing it?\n(You are not one of the players)")){
            return;
        }
    }

    options['hotseat'] = (document.getElementById("isHotseat").checked);
    $("#newGameMenu").hide();
    $("#game").show();
    startGame();
}

// Template Functions
function startGame(){}
function setup(){}
function checkClick(e){}
