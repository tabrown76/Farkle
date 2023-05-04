/**
 * Executes a callback function when the DOM is fully loaded.
 *
 * @function
 * @param {function} callback - The function to execute when the DOM is loaded.
 * @returns {void}
 */
$(document).ready(() => {
    $('#add-player').on('click', (e) => {
        e.preventDefault();
        addPlayer();        
    });
    
    $('#player-name').on('keypress', (e) => {
        if (e.which === 13) {
            e.preventDefault();
            addPlayer();
        }
    });

    $('#start').on('click', () => {
        makeButtons();
    })

    $('#rolled-dice').on('click', (e) => {
        selectDice(e);
    })
})

/**
 * Dynamically creates buttons for starting/restarting the game and rolling/ending turns.
 *
 * @function
 * @returns {void}
 */
function makeButtons(){
    if($('#start').text() === ('Restart')){
        restartButton();
    } else{
        startButton();
    }
}

/**
 * Modifies the DOM to start the game by hiding the player name and color input fields and creating the game buttons.
 *
 * @function
 * @returns {void}
 */
function startButton(){
    $('#start').text('Restart');
    $('#start').addClass('btn-danger');
    $('#player-name').hide();
    $('#player-color').hide();
    $('#add-player').hide();
    
    rollAndSelectButton();
    endTurnButton();
    temporaryScoreDiv();
}

/**
 * Modifies the DOM to restart the game by resetting player scores, removing existing dice, and showing the player name and color input fields.
 *
 * @function
 * @returns {void}
 */
function restartButton(){
    $('#start').text('Start Game');
    $('#start').removeClass('btn-danger');
    for (let i = 1; i < playerCount; i++) {
        $(`#player-${i}`).empty();
        $(`#score-${i}`).empty();
    }      
    $('#game-buttons').empty();
    $('#rolled-dice').empty();
    $('#player-dice').empty();
    $('#player-name').show();
    $('#player-color').show();
    $('#add-player').show();
    playerCount = 1;
}

/**
 * Dynamically creates a button to roll and select dice, and modifies the DOM to add the button to the game buttons container.
 *
 * @function
 * @returns {void}
 */
function rollAndSelectButton(){
    let rollAndSelect = $('<div>').attr('id', 'roll-and-select').addClass('btn btn-success').text('Roll Dice!');

    $('#game-buttons').append(rollAndSelect);
    $('#roll-and-select').on('click', () => {
        if($('#roll-and-select').text() === 'Roll Dice!'){
            rollDice();
            allowSelect = true;
            $('#roll-and-select').text('Select Dice');
        } else{
            if(moveDice()){
                allowSelect = false;
                $('#roll-and-select').text('Roll Dice!');
            }
        }
    })
}

/**
 * Dynamically creates a button to end the turn, and modifies the DOM to add the button to the game buttons container.
 *
 * @function
 * @returns {void}
 */
function endTurnButton(){
    let end = $('<div>').attr('id', 'end').addClass('btn btn-danger').text('End Turn');
    $('#game-buttons').append(end);
    $('#end').on('click', () => {
        $('#rolled-dice').empty();
        $('#player-dice').empty();
        if($('#roll-and-select').text() !== 'Roll Dice!'){
            $('#roll-and-select').text('Roll Dice!');
        }

        numberOfDice = 6;

        incrementScore();
        $('.temp-score').text('0');
        nextPlayer();
    })
}

/**
 * Converts a hexadecimal color code to an RGBA color code with a specified opacity.
 *
 * @function
 * @param {string} hex - The hexadecimal color code to convert.
 * @param {number} alpha - The opacity value to use for the RGBA color code.
 * @returns {string} The RGBA color code.
 */
function hexToRgba(hex, alpha){
    hex = hex.replace('#', '');
    const [r, g, b] = hex.match(/\w\w/g).map((c) => parseInt(c, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Handles the logic for selecting and deselecting dice on click, based on the current game state.
 *
 * @function
 * @param {Event} e - The event object for the click event on the dice element.
 * @returns {void}
 */
let numberOfSelectedDice = 0;
let allowSelect = true;

function selectDice(e){
    if(!allowSelect){
        return;
    }

    const target = $(e.target);
    const isDice = target.hasClass('dice') || target.parent().hasClass('dice');
    const diceElement = target.hasClass('dice') ? target : target.parent();

    if(isDice){
        diceElement.toggleClass('selected');
        if(diceElement.hasClass('selected')){
            const currentColor = $(`.player-${currentPlayer}`).attr('id');
            const semiTransparentColor = hexToRgba(currentColor, 0.5);
            diceElement.find('i').css({
                color: semiTransparentColor
            });
            numberOfSelectedDice ++;
            numberOfDice --;
        } else{
            const currentColor = $(`.player-${currentPlayer}`).attr('id');
            const opaqueColor = hexToRgba(currentColor, 1);
            diceElement.find('i').css({
                color: opaqueColor
            });
            numberOfSelectedDice --;
            numberOfDice ++;
        }
    }
}

/**
 * Moves the selected dice from the rolled dice container to the player's active dice container and updates the view.
 *
 * @function
 * @returns {boolean} A boolean indicating whether or not dice were moved successfully.
 */
function moveDice() {
    const roll = $('<div>').html(`<u>Roll: ${diceRoll}</u>`).addClass('text-center');
    const selectedDice = $('.selected');

    if (numberOfSelectedDice === 0) {
        alert("Please select a die or End Turn.");
        return false;
    }

    selectedDice.toggleClass(`selected temp-dice roll-${diceRoll}`);
    selectedDice.detach();
    selectedDice.css({
        position: 'static',
        left: '',
        top: '',
        border: 'none'
    });

    const playerDice = $('#player-dice');
    const existingRows = playerDice.children('.row');
    let lastRow = existingRows.last();
    if (!lastRow.length || lastRow.children('.roll-container').length >= 6) {
        lastRow = $('<div>').addClass('row');
        playerDice.append(lastRow);
    }

    const rollContainer = $('<div>').addClass('col-12 col-md-6 col-lg-4 col-xl-2 roll-container');
    const diceGrid = $('<div>').addClass('container');
    roll.append(diceGrid);

    let currentRow;
    selectedDice.each(function (index, die) {
        const col = $('<div>').addClass('col-6');
        col.append(die);

        if (index % 2 === 0) {
            currentRow = $('<div>').addClass('row');
            diceGrid.append(currentRow);
        }
        currentRow.append(col);
    });

    rollContainer.append(roll);
    lastRow.append(rollContainer);

    numberOfSelectedDice = 0;

    temporaryScore();

    return true;
}

/**
 * Converts a value in view height units (vh) to pixels.
 *
 * @function
 * @param {number} vh - The value in view height units (vh) to be converted.
 * @returns {number} The value in pixels.
 */
function vhToPixels(vh){
    return (vh * document.documentElement.clientHeight) /100;
}

/**
 * Returns a random position within a container, with a minimum distance between any two objects within the container.
 *
 * @function
 * @param {object} container - The container element to generate a position within.
 * @param {object} existingDice - Optional. An existing jQuery collection of dice elements within the container.
 * @returns {object} An object containing the x and y coordinates of the random position.
 */
function getRandomPosition(container, existingDice = $()) {
    const containerWidth = container.width();
    const containerHeight = container.height();
    const dieSize = vhToPixels(5);
    const minDistance = dieSize * 1.95;

    let x, y;

    let validPosition = false;
    while(!validPosition){
        x =  Math.floor(Math.random() * (containerWidth - dieSize));
        y = Math.floor(Math.random() * (containerHeight - dieSize));

        validPosition = true;

        existingDice.each(function() {
            const existingX = parseInt($(this).css('left'));
            const existingY = parseInt($(this).css('top'));

            const distanceX = Math.abs(x - existingX);
            const distanceY = Math.abs(y - existingY);
            const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

            if(distance < minDistance){
                validPosition = false;
            }
        })
    }
    return {x, y};
}

/**
 * Creates a new dice element with the specified value and position.
 *
 * @function
 * @param {number} value - The value of the dice (1-6).
 * @param {object} existingDice - An existing jQuery collection of dice elements within the container.
 * @returns {object} A new jQuery object representing the dice element.
 */
function createDiceElement(value, existingDice) {
    const diceNames = ['one', 'two', 'three', 'four', 'five', 'six'];
    const position = getRandomPosition($('#rolled-dice'), existingDice);
    const color = $(`.player-${currentPlayer}`).attr('id');
    const diceHtml = $('<div>').addClass('dice ' + diceNames[value -1]).css({
        position: 'absolute',
        left: position.x + 'px',
        top: position.y + 'px'
    }).html(`<i class="fa-solid fa-dice-${diceNames[value -1]}" style="color: ${color}"></i>`);

    return diceHtml;
}

/**
 * Rolls a set of dice and adds them to the rolled-dice container.
 *
 * @function
 * @returns {void}
 */
let diceRoll = 0;
let numberOfDice = 6;

function rollDice(){
    $('#rolled-dice').empty();

    if(numberOfDice === 0){
        numberOfDice = 6;
    }
    for(let i = 0; i < numberOfDice; i++){
        const diceValue = Math.floor(Math.random() * 6) + 1;
        const existingDice = $('#rolled-dice .dice');
        const diceElement = createDiceElement(diceValue, existingDice);
        $('#rolled-dice').append(diceElement);  
    }
    diceRoll ++;
}

/**
 * Appends player name and score of 0 to the player container.
 * Checks for player name/player count validity.
 *
 * @function
 * @returns {void}
 */
let playerCount = 1;

function addPlayer(){
    let $player = $('#player-name').val().trim();
    let playerColor = $('#player-color').val();    

    if(playerCount === 7){
        alert('This game supports up to 6 players.');
        return;
    }
    if($player === '' || $player.length > 5){
        alert('Enter between 1 and 5 characters.');
        return;
    }

    let playerNameSpan = $('<span>')
        .text($player)
        .css('color', playerColor);
    let playerDiv = $('<div>')
        .attr('id', playerColor)
        .addClass(`player-${playerCount}`)
        .append($('<u>').css('color', 'white').append(playerNameSpan));
    
    $(`#player-${playerCount}`).append(playerDiv);
    $('#player-name').val('');

    let playerScore = 0;
    let scoreDiv = $('<div>').addClass(`score-${playerCount}`).text(playerScore);
    $(`#score-${playerCount}`).append(scoreDiv);

    playerCount++;
}

/**
 * Sets the current player to the next player in the rotation.
 * Resets the dice roll count to 0.
 *
 * @function
 * @returns {void}
 */
let currentPlayer = 1;

function nextPlayer(){
    if(currentPlayer === playerCount - 1){
        currentPlayer = 1;
    }else {
        currentPlayer++;
    }

    if(diceRoll !== 0){
        diceRoll = 0;
    }
}

/**
 *Increments the current player's score by the value of their temporary score.
 *@function
 *@returns {void}
 */
function incrementScore(){
    let currentScore = parseInt($(`.score-${currentPlayer}`).text());
    let tempScore = parseInt($('.temp-score').text());
    let newScore = currentScore + tempScore;

    $(`.score-${currentPlayer}`).text(newScore);
}

/**
 *Creates a container for displaying the temporary score and adds it to the game buttons container.
 *@function
 *@returns {void}
 */
function temporaryScoreDiv(){
    let tempScoreDiv = $('<div>').addClass('temp-score-container').html('<u>Potential Points</u>');
    $('#game-buttons').append(tempScoreDiv);

    let tempScore = $('<div>').addClass('temp-score').text('0');
    tempScoreDiv.append(tempScore);
}

/**
 *Calculates the score based on the dice values in the temporary dice container.
 *@function
 *@param {jQuery} tempDice - The collection of dice elements in the temporary dice container.
 *@returns {number} The calculated score.
 */
function calcScore(tempDice){
    let diceObject = {};
    const wordToNumber = {
        'one': 1,
        'two': 2,
        'three': 3,
        'four': 4,
        'five': 5,
        'six': 6,
    };

    tempDice.each(function (){
        const dieClass = $(this).attr('class').split(' ')[1];

        if (diceObject.hasOwnProperty(dieClass)){
            diceObject[dieClass] += 1;
        } else {
            diceObject[dieClass] = 1;
        }
    });

    let score = 0;
    let numSingles = 0;
    let numDoubles = 0;
    let numTriplets = 0;
    let threeDoubles = false;

    for (let key in diceObject){
        const dieValue = wordToNumber[key];
        const count = diceObject[key];

        if(diceObject[key] === 2){
            numDoubles++;
        }

        if(numDoubles === 3){
            score += 1500;
            threeDoubles = true;
            break;
        }
    }

    if(!threeDoubles){
        for(let key in diceObject){
            const dieValue = wordToNumber[key];
            const count = diceObject[key];

            if(diceObject[key] === 1){
                numSingles++;
                if(numSingles === 6){
                    score += 1500;
                } else if(dieValue === 1){
                    score += 100;
                } else if(dieValue === 5){
                    score += 50;
                }
            } else if(diceObject[key] === 2){
                if(dieValue === 1){
                    score += count * 100;
                } else if(dieValue === 5){
                    score += count * 50;
                }
            } else if(diceObject[key] === 3){
                numTriplets++;
                if(numTriplets === 2){
                    score += 2500;
                } else {
                    if(dieValue === 1){
                        score += 300;
                    } else {
                        score += dieValue * 100;
                    }
                }
            } else if(diceObject[key] === 4){
                if(numDoubles === 2){
                    score += 1500;
                } else{
                    score += 1000;
                }
            } else if(diceObject[key] === 5){
                score += 2000;
            } else if(diceObject[key] === 6) {
                score += 3000;
            }
        }
    }
    return score;
}

/**
 *Updates the temporary score based on the selected dice in the temporary dice container.
 *@function
 *@returns {void}
 */
function temporaryScore(){
    let tempDice = $('.temp-dice');
    let currentDiceRoll = `roll-${diceRoll}`;
    let currentTempDice = tempDice.filter(`.${currentDiceRoll}`);
    
    let currentScore = parseInt($('.temp-score').text());

    const calculateScore = calcScore(currentTempDice);   
    let newTempScore = calculateScore + currentScore;

    $('.temp-score').text(newTempScore);
}