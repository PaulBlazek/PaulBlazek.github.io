// Required data for BGLib
var playerRange = [2,8];
var gameName = "Journey";
var gameImagePath = "JourneyImages/";

function setup(){
    buttons = [];
    buttons.push(new Button(600,250,100,100,basicImagePath+"rolling-dices.png",click=function(){
        this.active = false;
        currentTurnState = 'rollingDice';
        rollDice();
    }));

    document.getElementById("GameOptions").innerHTML+="<p>Finish Line: <input id='goal' type='text' value='50'></input></p>";
}

// Classes
class ButtonWithDesc extends Button {
    constructor(x,y,w,h,img,click=function(){},txt='',alpha=1,fill="white",textFill="black",desc="",confirmButtonTxt="Activate"){
        super(x,y,w,h,img,click=click,txt=txt,alpha=alpha,fill=fill,textFill=textFill);
        this.desc = reg(desc,18);
        this.confirmButtonTxt = confirmButtonTxt;
        this.click = this.toggleDesc;
        this.finalClick = click;
        this.descActive = false;
        this.descButton = new Button(x+25,y-30,50,25,0,this.finalClick,confirmButtonTxt,alpha/2,fill,textFill);
        buttons.push(this);
        buttons.push(this.descButton);
    }

    toggleDesc(){
        this.descActive = !this.descActive;
        this.descButton.active = !this.descButton.active;
        showGame();
    }

    draw(){
        super.draw();
        if (this.descActive){
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.globalAlpha = this.alpha/2;
            ctx.fillRect(this.x-10,this.y-120,120,120);
            ctx.globalAlpha = 1;

            for (var i = 0; i < this.desc.length; i++){
                ctx.fillText(this.desc[i],this.x+this.w/2,this.y-108+i*15);
            }
        }
    }
}

function player(user){
    this.user = user;
    this.progress = 0;
    this.role = '';
    this.effects = {};
    this.data = {};
    this.hp = 10;
    this.maxHp = this.hp;
    this.deathStagesLeft = 2;
}

player.prototype.hasEffect = function(name){
    var names = [];
    for (var e in this.effects){
        names.push(e);
    }
    
    return isIn(name,names);
}

player.prototype.inflictDamage = function(amount,otherPlayer){
    otherPlayer.hp -= amount;
    if (otherPlayer.hp < 1){
        otherPlayer.hp = 0;
        msg(otherPlayer.user+" died.");
    }
}

player.prototype.heal = function(amount){
    if (this.hp == 0){return false}
    if (this.hp >= this.maxHp){
        return false;
    }

    this.hp += amount;
    if (this.hp > this.maxHp){this.hp = this.maxHp;}
    return true;
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
var heartImg = new Image();
heartImg.src = gameImagePath+"heart.png";
var deathImg = new Image();
deathImg.src = gameImagePath+"death-skull.png";
var currentTurnState;
var numberNames = [
    'one','two','three','four','five','six'
];
var log = [];
var playerClasses = [];
var classDesc = {
    'barbarian':'Do 2 damage whenever you pass an opponent.',
    'bard':'-1 Speed, opponents within 5 distance have -2 speed.',
    'cleric':'Heal yourself 2 hp and other players within 3 distance 1 hp each turn.',
    //'fighter':'Strike 3. (During your skill phase, you may do 3 damage to an opponent within 3 distance.)',
    //'mage':'Mana 10. (You regain 1 mana per turn, and may spend it to cast certain spells.)',
    'medusa':'Kill any players who are on the same space as you when you start your turn.',
    'rogue':'-2 HP, +1 Speed, on doubles, players you pass through take 3 damage.',
    'soldier':'You can never move less than 5 with your main movement.',
    'sonic':'+3 Speed, -5 HP',
};
for (var c in classDesc){
    playerClasses.push(c);
}
var classStats = {
    'barbarian':{'strength':2},
    'bard':{'strength':-1},
    'cleric':{'strength':0},
    'medusa':{'strength':-1},
    'rogue':{'strength':0},
    'soldier':{'strength':1},
    'sonic':{'strength':0}
}

// Functions
journeyPlayers = [];
function startGame(){
    options['goal'] = Number(document.getElementById('goal').value);
    for (var i = 0; i < players.length; i++){
        journeyPlayers.push(new player(players[i]));
    }

    nextTurn();
}

function msg(m){
    log.unshift(m);
}

function nextTurn(){
    buttons = [buttons[0]];
    if (winner == -1){
        currentTurnState = 'start';
    }
    
    currentTurn++;
    if (currentTurn >= players.length){currentTurn = 0;}
    if (!options["hotseat"] && players[currentTurn] != cAccount && !gameover){
        exportNextTurn();
        return;
    }

    currentPlayer = journeyPlayers[currentTurn];
    if (currentPlayer.hp <= 0){
        currentPlayer.deathStagesLeft -= 1;
        if (currentPlayer.deathStagesLeft >= 0){
            msg(currentPlayer.user+" is still recovering.");
            window.setTimeout(nextTurn,2200);
            return;
        } else {
            msg(currentPlayer.user+" has recovered!");
            currentPlayer.hp = currentPlayer.maxHp;
            currentPlayer.deathStagesLeft = 2;
        }
    }

    if (winner == -1){
        log.unshift("It's "+players[currentTurn]+"'s turn!");
        buttons[0].active = true;
    }

    if (currentPlayer.role == 'medusa'){
        for (var i = 0; i < players.length; i++){
            if (players[i] == currentPlayer.user || journeyPlayers[i].hp <= 0){continue;}
            if (journeyPlayers[i].progress == currentPlayer.progress){
                journeyPlayers[i].hp = 0;
                msg(players[i]+" was turned to stone by "+currentPlayer.user);
            }
        }
    } else if (currentPlayer.role == 'cleric'){
        if (currentPlayer.heal(2)){
            msg(currentPlayer.user+" heals themself for 2.");
        }

        for (var i = 0; i < players.length; i++){
            if (players[i] == currentPlayer.user || journeyPlayers[i].hp <= 0){continue;}
            if (Math.abs(journeyPlayers[i].progress-currentPlayer.progress) <= 3){
                if (journeyPlayers[i].heal(1)){
                    msg(currentPlayer.user+" kindly heals "+players[i]+" for 1.")
                }
            }
        }
    } else if (currentPlayer.role == 'fighter'){
        // Add attack button
    }

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
            ctx.fillText(players[currentTurn]+"'s turn! Click to roll the dice!",1300/2+10,50);
        } else {
            ctx.fillText("It's your turn! Click to roll the dice!",1300/2,50);
        }
        
    }

    ctx.font = '35px Fantasy';
    ctx.fillText("Players",width-130,40);

    ctx.font = '20px Arial';
    sortedPlayers = sortPlayers(journeyPlayers);
    for (var i = 0; i < sortedPlayers.length; i++){
        var x = ''
        if (sortedPlayers[i].role != ""){
            x = " ("+capitalize(sortedPlayers[i].role)+")"
        }
        ctx.fillText(sortedPlayers[i].user+x+" - "+sortedPlayers[i].progress,width-130,80+i*30);
        if (sortedPlayers[i].hp > 0){
            ctx.drawImage(heartImg,width-260,60+i*30,20,20+2);
            ctx.font = '15px Arial';
            ctx.fillText(sortedPlayers[i].hp,width-250,80+i*30-5);
            ctx.font = '20px Arial';
        } else {
            ctx.fillStyle = 'bisque';
            ctx.drawImage(deathImg,width-260,60+i*30,20,20+2);
            ctx.font = '25px Arial';
            ctx.fillText(sortedPlayers[i].deathStagesLeft,width-250,80+i*30-5+5);
            ctx.font = '20px Arial';
            ctx.fillStyle = 'black';
        }
        
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
        if (typeof log[i] != "string"){
            ctx.font = '8px Arial';
            for (var j = 0; j < log[i].length; j++){
                ctx.fillText(log[i][j],150,550-i*30-10+j*10)
            }
            ctx.font = '15px Arial';
        } else {
            ctx.fillText(log[i],150,550 - i * 30);
        }

        if (i > 20) {
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

    if (currentTurnState == 'gameOver'){
        document.getElementById("whoseTurn").innerHTML = "You've won, just tell all the other players about it!";
        var m = "mailto:"+playerEmails[currentTurn];
        for (var i = 0; i < playerEmails.length; i++){
            if (i == currentTurn){continue;}
            m += ','+playerEmails[i]
        }
        m += "?subject="+gameName+" - "+winner+" has won!, "+"Everyone"+"!&body="+exportGame()
        document.getElementById("sendEmail").href = m;
        return;
    }
    document.getElementById("whoseTurn").innerHTML = "It's "+players[currentTurn]+"'s Turn!";
    document.getElementById("sendEmail").href = "mailto:"+playerEmails[currentTurn]+"?subject="+gameName+" - It's Your Turn, "+players[currentTurn]+"!&body="+exportGame();
}

function exportGame(){
    data = {
        "players":players,
        "journeyPlayers":journeyPlayers,
        "options":options,
        "currentTurn":currentTurn,
        "playerEmails":playerEmails,
        "log":log,
        "winner":winner,
        "options":options
    }
    return JSON.stringify(data);
}

var gameover = false;
function loadGameData(){
    data = document.getElementById("loadData").value;
    if (data == undefined){return alert("Please paste the load data in first!")}

    data = JSON.parse(data);
    players = data.players;
    journeyPlayers = data.journeyPlayers;
    options = data.options;
    currentTurn = data.currentTurn-1;
    playerEmails = data.playerEmails;
    log = data.log;
    winner = data.winner;
    options = data.options;
    gameover = !(winner == -1);

    for (var i = 0; i < log.length; i++){
        log[i] = log[i].replace('   ',' + ')
    }
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
    diceInterval = window.setInterval(updateDice,300);
}

function updateDice(){
    showGame();
    die1.draw();
    die2.draw();
    if (die1.randTicksLeft <= 0){
        window.clearInterval(diceInterval);
        var l1 = players[currentTurn]+" rolled a "+die1.currentFace+" + "+die2.currentFace;
        var totalMove = die1.currentFace+die2.currentFace;
        var l3 = '';
        var previousSpot = currentPlayer.progress;
        if (currentPlayer.role == "sonic"){
            totalMove += 3
            l3 = "(+3 Move for being Sonic Class)";
        } else if (currentPlayer.role == "rogue"){
            totalMove += 1;
            l3 = "(+1 Move for being Rogue Class)";
        } else if (currentPlayer.role == "bard"){
            totalMove -= 1;
            l3 = "(-1 Move for being Bard Class)";
        }
        
        log.unshift(l1);
        if (currentPlayer.role != ''){
            for (var i = 0; i < players.length; i++){
                if (players[i] == currentPlayer.user){continue;}
                if (journeyPlayers[i].role == 'bard' && journeyPlayers[i].hp > 0 && Math.abs(journeyPlayers[i].progress-currentPlayer.progress) <= 5){
                    totalMove -= 2;
                    msg("(-2 Move from "+journeyPlayers[i].user+" bardic song.");
                }
            }
        } if (totalMove < 0){
            totalMove = 0;
        }
        log.unshift("for a total of "+totalMove+" movement!");
        
        if (currentPlayer.role == "soldier" && totalMove < 5){
            totalMove = 5;
            l3 = "(Movement upped to 5 for being Soldier Class)";
        }

        if (l3 != ''){log.unshift(l3);}

        journeyPlayers[currentTurn].progress += totalMove;

        if (currentPlayer.role == "rogue" && die1.currentFace == die2.currentFace){
            for (var i = 0; i < players.length; i++){
                if (players[i] == currentPlayer.user || journeyPlayers[i].hp <= 0){continue;}
                if (journeyPlayers[i].progress > previousSpot && journeyPlayers[i].progress < currentPlayer.progress){
                    msg(currentPlayer.user+" backstabbed "+players[i]+" for 3 damage! (base)");
                    currentPlayer.inflictDamage(3,journeyPlayers[i]);
                }
            }
        } else if (currentPlayer.role == "barbarian"){
            for (var i = 0; i < players.length; i++){
                if (players[i] == currentPlayer.user || journeyPlayers[i].hp <= 0){continue;}
                if (journeyPlayers[i].progress > previousSpot && journeyPlayers[i].progress < currentPlayer.progress){
                    msg(currentPlayer.user+" bashed "+players[i]+" for 2 damage! (base)");
                    currentPlayer.inflictDamage(2,journeyPlayers[i]);
                }
            }
        }

        currentTurnState = 'adventure';
        if (journeyPlayers[currentTurn].progress >= options['goal']){
            log.unshift(players[currentTurn]+" has won!");
            currentTurnState = 'gameOver';
            winner = players[currentTurn];
        }

        showGame();
        die1.draw(true);
        die2.draw(true);
        if (currentTurnState == 'adventure'){
            window.setTimeout(adventure,3000);
            return;
        } else if (!options.hotseat) {
            window.setTimeout(nextTurn,3000);
            return;
        }
    }
}

function adventure(){
    if (journeyPlayers[currentTurn].role == ''){
        pickRole();
        //window.setTimeout(nextTurn,3000);
        return;
    }

    if (die1.currentFace == die2.currentFace){
        switch (die1.currentFace){
            case 1:
                
            default:
                break;
        }
        //return;
    }
    window.setTimeout(nextTurn,3000);

}

var roleButtons;
function pickRole(){
    log.unshift(players[currentTurn]+" is choosing their class...");
    playerClasses = shuffle(playerClasses);
    roleOptions = [];
    for (var i = 0; i < 3; i++){roleOptions.push(playerClasses[i])}
    for (var i = 0; i < roleOptions.length; i++){
        var b = new ButtonWithDesc(500+i*110,200,100,100,gameImagePath+roleOptions[i]+'.png',function(){roleChosen(this.d)},'',1,'black','black',capitalize(roleOptions[i])+'~'+classDesc[roleOptions[i]],"Choose");
        b.active = true;
        buttons[buttons.length-1].d = roleOptions[i];
    }
    showGame();
    window.setTimeout(showGame,100);
}

function roleChosen(role){
    journeyPlayers[currentTurn].role = role;
    switch (role){
        case 'rogue':
            currentPlayer.hp -= 2;
            currentPlayer.maxHp -= 2;
            break;
        case 'sonic':
            currentPlayer.hp -= 5;
            currentPlayer.maxHp -= 5;
    }
    msg(currentPlayer.user+" has chosen the class of "+capitalize(role)+"!");
    msg(reg("("+classDesc[role]+")",25));
    window.setTimeout(nextTurn,3000);
    buttons = [buttons[0]];
    showGame();
}
