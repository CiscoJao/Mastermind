// set up mastermind canvas
var canvas = document.querySelector('#mastermind');
canvas.width = 600;
canvas.height = 660;
var c = canvas.getContext('2d');


// GLOBALS
var gameWidth = 200; // width of the main game board
var xGame = canvas.width/2 - gameWidth/2; // starting X position of main game board
var yGame = 10; // starting Y position of main game board
var ballRadius = gameWidth/8; // radius of the circles of the code, based on the width to make sure 6 balls fit
var gameHeight = ballRadius*20 + 20*4; // height based on the height of the circles plus the spaces between the rows

var colours = ['#ff0303', '#13bf1f', '#0703ff', '#ff8e03', 'purple', 'black']; // the 6 colours of the game
var guessed = [[]]; // array to hold all the guessed colours, maximum should be 40 colours
var x = 0; // indexing variable to help control the 2D "guessed" array
var code = getCode(); // randomly generated colour code
var gameState = true; // controls the entire game, if false it will not listen to any inputs except space bar

// variables for the winning game screen
var winText = ['Verifying password...', 'Password verified', 'Retrieving essential files...', 'Verifying vital files...', 'Running tests...', 'Starting ship mainframe...', 'Starting life support...', 'Starting navigation...', 'Running diagnostics on weapon systems...', 'Starting non-essential systems...', 'Welcome, commander'];
var chars;
var words = 'ACCESS GRANTED';


// DISPLAYING THE ANSWER FOR TESTING, ET CETERA
document.getElementById('cheater-cheater-pumpkin-eater').style.display = 'none'; // comment this line out to reveal answer
document.getElementById('cheater-cheater-pumpkin-eater').innerHTML = (colours.indexOf(code[0])+1) + ' | ' + (colours.indexOf(code[1])+1) + ' | ' + (colours.indexOf(code[2])+1) + ' | ' + (colours.indexOf(code[3])+1);
console.log(code)


// draws the entire game, gets recalled to update the game images
function drawGameBoard() {
    // main game board
    c.fillStyle = 'grey';
    c.fillRect(xGame,yGame,gameWidth,gameHeight); // actual game board
    c.fillRect(xGame,gameHeight + 20,gameWidth,ballRadius*2); // code display
    c.textAlign = 'none';

    // colours game board
    c.fillRect(100,100,ballRadius*2, 315);

    // DRAWING CIRCLES
    // drawing the circles on the main board
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 4; j++) {
            c.beginPath();
            c.arc(ballRadius*2*j + xGame+ballRadius, ballRadius*2*i + (i*7) + yGame+ballRadius+8.5, ballRadius - 5, 0, Math.PI*2, true);

            // adding a circular gradient, I learned this function from W3Schools
            let grd = c.createRadialGradient(ballRadius*2*j + xGame+ballRadius, ballRadius*2*i + (i*7) + yGame+ballRadius+8.5, ballRadius,
                    ballRadius*2*j + xGame+ballRadius, ballRadius*2*i + (i*7) + yGame+ballRadius+18.5, ballRadius-10);
            // the try block here will essentially keep using the colours in the 2D array until it reaches the end, when it reaches the end of the 2D array an error will occur, thus controlling the flow of reprinting the colours on the board
            try {
                grd.addColorStop(0, 'white');
                grd.addColorStop(1, guessed[i][j]);
            } catch (e) {
                grd.addColorStop(0, 'black');
                grd.addColorStop(1, 'silver');
            }
            c.fillStyle = grd;
            c.fill();
        }
    }
    // drawing the circles of the code at the bottom
    for (var i = 0; i < 4; i++) {
        c.beginPath();
        c.arc(ballRadius*2*i + xGame+ballRadius, gameHeight+20+ballRadius, ballRadius-5, 0, Math.PI*2, true);

        let grd = c.createRadialGradient(ballRadius*2*i + xGame+ballRadius, gameHeight+20+ballRadius, ballRadius,
                ballRadius*2*i + xGame+ballRadius, gameHeight+30+ballRadius, ballRadius-10);
        grd.addColorStop(0, 'black');
        grd.addColorStop(1, 'silver');
        c.fillStyle = grd;
        c.fill();
    }
    //drawing the circles of the colours on the left
    for (var i = 0; i < 6; i++) {
        c.beginPath();
        c.arc(100 + ballRadius, 130 + ballRadius*2*i, ballRadius - 5, 0, Math.PI*2, true);

        let grd = c.createRadialGradient(100 + ballRadius, 130 + ballRadius*2*i, ballRadius,
                100 + ballRadius, 140 + ballRadius*2*i, ballRadius-10);
        grd.addColorStop(0, 'white');
        grd.addColorStop(1, colours[i]);
        c.fillStyle = grd;
        c.fill();

        c.fillStyle = 'white';
        c.font = '15px Marker Felt, fantasy';
        c.textAlign = 'center';
        c.fillText(i+1, 100 + ballRadius, 135 + ballRadius*2*i);
    }
}


// updates and re draws the game board based on keys pressed by the user
canvas.addEventListener('keydown', eventListener);
function eventListener(e) {
    let tmp = [];
    let colour = '';

    if (e.keyCode == 32) {
        // if space bar is pressed, reload the page
        location.reload();
    } else if (!gameState) {
        // exit out of listening function to prevent unwanted key pressed when in the loss screen
        return;
    }

    switch (e.keyCode) {
        case 49:
            colour = colours[0];
            drawGameBoard();
            break;
        case 50:
            colour = colours[1]; 
            drawGameBoard();
            break;
        case 51:
            colour = colours[2];
            drawGameBoard();
            break;
        case 52:
            colour = colours[3];
            drawGameBoard();
            break;
        case 53:
            colour = colours[4];
            drawGameBoard();
            break;
        case 54:
            colour = colours[5];
            drawGameBoard();
            break;
        case 8:
            // BACKSPACE | undo feature that clears the current row
            guessed[guessed.length-1] = [];
            drawGameBoard();
            return;
        case 13:
            // ENTER | if the row isn't finished yet
            if (guessed[guessed.length-1].length != 4) {
                alert("Complete the current row first!");
                return;
            }
            var blacks = 0;
            // counting how many black pegs needed
            for (var i = 0; i < 4; i++) {
                if (guessed[guessed.length-1][i] == code[i]) {
                    blacks++;
                }
            }
            var reds = 0;
            // count how many red pegs needed (these can be overlapped by the black pegs)
            for (var i = 0; i < 4; i++) {
                if (guessed[guessed.length-1].includes(code[i])) {
                    reds++;
                }
            }

            if (blacks == 4) {
                endGame('winner-winner-chicken-dinner');
                return;
            } else if (guessed.length == 10) {
                endGame('loser-loser-chicken-snoozer');
                return;
            }

            printPegs(blacks, reds);
            guessed.push(tmp); // makes a new column in the 2D array to prepare
            return;
        default:
           return;
    }

    if (guessed[guessed.length-1].length != 4) {
        // manipulates and updates the 2D array of "guessed" colours depending on the colour chosen
        if (guessed[x].length == 4) {
            x++;
            guessed[x].push(colour);
        } else {
            guessed[x].push(colour);
        }
    }

    // redraw game board will all the updated things
    drawGameBoard();
}


// printing the pegs on the right for the current row player is on
function printPegs(b, r) {
    let x = guessed.length - 1;

    // drawing the red pegs
    for (var i = 0; i < r; i++) {
        c.beginPath();
        c.arc(ballRadius*i + 450 + (ballRadius/2), ballRadius*2*x + (x*7) + yGame+ballRadius+8.5, ballRadius - 15, 0, Math.PI*2, true);

        let grd = c.createRadialGradient(ballRadius*i + 450 + (ballRadius/2), ballRadius*2*x + (x*7) + yGame+ballRadius+8.5, ballRadius-25,
                ballRadius*i + 450 + (ballRadius/2), ballRadius*2*x + (x*7) + yGame+ballRadius+8.5, ballRadius);
        grd.addColorStop(0, 'pink');
        grd.addColorStop(1, 'red');
        c.fillStyle = grd;
        c.fill();
    }

    // drawing the black pegs which will overlap the red pegs
    for (var i = 0; i < b; i++) {
        c.beginPath();
        c.arc(ballRadius*i + 450 + (ballRadius/2), ballRadius*2*x + (x*7) + yGame+ballRadius+8.5, ballRadius - 15, 0, Math.PI*2, true);

        let grd = c.createRadialGradient(ballRadius*i + 450 + (ballRadius/2), ballRadius*2*x + (x*7) + yGame+ballRadius+8.5, ballRadius-25,
                ballRadius*i + 450 + (ballRadius/2), ballRadius*2*x + (x*7) + yGame+ballRadius+8.5, ballRadius);
        grd.addColorStop(0, 'grey');
        grd.addColorStop(1, 'black');
        c.fillStyle = grd;
        c.fill();
    }
}


// generate a random 4 colour code depending on if the user wants duplicates or not
function getCode() {
    let x = [];
    let choice = prompt("Allow duplicates in the code? (yes/no)");
    let exp = /y(es)*|n(o)*/gi; // regex to check for yes-like and no-like inputs
    // error checking
    while (!exp.test(choice)) {
        choice = prompt("Invalid answer, it's a yes or no question.");
    }

    // asks them again if the user put both y and n in the same answer
    if (choice.toLowerCase().includes('y') && choice.toLowerCase().includes('n')) {
        choice = getCode();
    } else if (choice.toLowerCase().includes('y')) {
        // allowing duplicates
        for (var i = 0; i < 4; i++) {
            x.push(colours[Math.floor(Math.random() * colours.length)]);
        }
        return x;
    } else if (choice.toLowerCase().includes('n')) {
        // removes the colour when it is chosen from the "tmp" array so it can't get picked twice
        let tmp = ['#ff0303', '#13bf1f', '#0703ff', '#ff8e03', 'purple', 'black'];
        for (var i = 0; i < 4; i++) {
            x.push(tmp[Math.floor(Math.random() * tmp.length)]);
            tmp.splice(tmp.indexOf(x[i]),1);
        }
        return x;
    }
}


// print the peg holes
function printPegHoles() {
    c.fillStyle = 'grey';
    c.fillRect(450,yGame,gameWidth/2,gameHeight);
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 4; j++) {
            c.beginPath();
            c.arc(ballRadius*j + 450 + (ballRadius/2), ballRadius*2*i + (i*7) + yGame+ballRadius+8.5, ballRadius - 15, 0, Math.PI*2, true);

            let grd = c.createRadialGradient(ballRadius*j + 450 + (ballRadius/2), ballRadius*2*i + (i*7) + yGame+ballRadius+8.5, ballRadius-1,
                    ballRadius*j + 450 + (ballRadius/2), ballRadius*2*i + (i*7) + yGame+ballRadius+20, ballRadius-15);
            grd.addColorStop(0, 'black');
            grd.addColorStop(1, 'silver');
            c.fillStyle = grd;
            c.fill();
        }
    }
}


// prints a winning or losing screen on the canvas
function endGame(s) {
    gameState = false;
    // player won the game
    if (s == 'winner-winner-chicken-dinner') {
        printPegs(4,0);
        for (var i = 0; i < 4; i++) {
            c.beginPath();
            c.arc(ballRadius*2*i + xGame+ballRadius, gameHeight+20+ballRadius, ballRadius-5, 0, Math.PI*2, true);
    
            let grd = c.createRadialGradient(ballRadius*2*i + xGame+ballRadius, gameHeight+20+ballRadius, ballRadius,
                    ballRadius*2*i + xGame+ballRadius, gameHeight+30+ballRadius, ballRadius-10);
            grd.addColorStop(0, 'white');
            grd.addColorStop(1, code[i]);
            c.fillStyle = grd;
            c.fill();
        }
        accessGranted();
    } 
    // player lost the game
    else if (s == 'loser-loser-chicken-snoozer') {
       c.clearRect(0, 0, canvas.width, canvas.height);
       c.fillStyle = 'black';
       c.fillRect(0, 0, canvas.width, canvas.height);
       c.fillStyle = 'red';
       c.textAlign = 'center';
       c.font = '50px Gugi, monospace';
       c.fillText('ACCESS DENIED', canvas.width/2, canvas.height/2);
    }
}


// I learned how to implement this from http://www.java2s.com/Tutorials/Javascript/Canvas_How_to/Animation/Create_character_Typing_in_animation.htm
var count1 = 0; // counter needs to be global cause accessGranted() is recursive
function accessGranted() {
    count1++;
    c.fillStyle = 'black';
    c.fillRect(0, canvas.height/2-50, canvas.width, 50);
    chars = words.slice(0, count1);
    c.fillStyle = 'green';
    c.font = '50px Gugi, monospace';
    c.fillText(chars, canvas.width/2, canvas.height/2);
    if (count1 < words.length) {
        setTimeout(accessGranted, 150);
        return;
    }
    blackDrop(); // start the next animation when this finishes
}


// printing black screen animation for winning cut scene
var count2 = 0;
var h = canvas.height/10;
function blackDrop() {
    c.fillStyle = 'black';
    c.fillRect(0, 0 + count2*h, canvas.width, h);
    count2++;
    if (count2 < 10) {
        setTimeout(blackDrop, 300);
        return;
    }
    c.fillRect(0, 0, canvas.width, canvas.height);
    typingAnimation(); // start the next animation when this finishes
}


// printing the typing animation
var count3 = 0;
var s = winText[0];
function typingAnimation() {
    count3++;
    chars = s.slice(0, count3);
    c.fillStyle = 'green';
    c.font = '20px MuseoModerno, monospace';
    c.textAlign = 'left';
    c.fillText(chars, 0, 20 + 30*(11-winText.length));
    if (count3 < s.length) {
        setTimeout(typingAnimation, 100);
        return;
    }
    count3 = 0; // reset counter for next line of message
    winText.splice(0, 1); // remove the previous message from array
    s = winText[0]; // set "s" to the next message to print
    typingAnimation();
}


//start the whole game
printPegHoles();
drawGameBoard();