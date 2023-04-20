/**
* Executes a function when the DOM is fully loaded.
*
* @function
* @param {function} callback - The function to execute when the DOM is loaded.
* @returns {void}
*/
$(document).ready(() => {
    $(document).on('click', (e) => {
        if (e.target.id === 'add-player') {
            e.preventDefault();
            addPlayer();
        }
    });
    
    $(document).on('touchstart', (e) => {
        if (e.target.id === 'add-player') {
            e.preventDefault();
            addPlayer();
        }
    });
    
    $(document).on('keypress', (e) => {
        if (e.target.id === 'player-name' && e.which === 13) {
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
        $('#start').text('Start Game');
        $('#start').removeClass('btn-danger');
        $('#player-1, #player-2, #player-3, #player-4, #player-5, #player-6').empty();
        $('#score-1, #score-2, #score-3, #score-4, #score-5, #score-6').empty();
        $('#game-buttons').empty();
        $('#rolled-dice').empty();
        $('#player-dice').empty();
        $('#player-name').show();
        $('#player-color').show();
        $('#add-player').show();
        playerCount = 1;
    } else{
        $('#start').text('Restart');
        $('#start').addClass('btn-danger');
        $('#player-name').hide();
        $('#player-color').hide();
        $('#add-player').hide();
        
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

        let end = $('<div>').attr('id', 'end').addClass('btn btn-danger').text('End Turn');
        $('#game-buttons').append(end);
        $('#end').on('click', () => {
            $('#rolled-dice').empty();
            $('#player-dice').empty();

            numberOfDice = 6;

            nextPlayer();
        })
    }
}

function hexToRgba(hex, alpha){
    hex = hex.replace('#', '');
    const [r, g, b] = hex.match(/\w\w/g).map((c) => parseInt(c, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
* Moves a dice from the rolled dice container to the player's active dice container.
*
* @function
* @param {Event} e - The event object for the click event on the rolled dice.
* @returns {void}
*/
function moveDice() {
    const roll = $('<div>').html(`<u>Roll: ${diceRoll}</u>`).addClass('text-center');
    const selectedDice = $('.selected');

    if (numberOfSelectedDice === 0) {
        alert("Please select a die or End Turn.");
        return false;
    }

    selectedDice.toggleClass('selected');
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

    return true;
}

/**
* Converts a value in view height units (vh) to pixels.
* @param {number} vh - The value in view height units (vh) to be converted.
* @returns {number} The value in pixels.
*/
function vhToPixels(vh){
    return (vh * document.documentElement.clientHeight) /100;
}

/**
* Returns a random position within a container, with a minimum distance between any two objects within the container.
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
*/
let playerCount = 1;

function addPlayer(){
    let $player = $('#player-name').val().trim();
    let playerColor = $('#player-color').val();    

    if(playerCount === 7){
        alert('This game supports up to 6 players.');
        return;
    }
    if($player === ''){
        alert('Enter a valid name.');
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