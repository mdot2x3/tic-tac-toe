// factory function - whenever you have a function that you're defining as a 
// class, it's best practice to use a capital letter

// initialize and manage game board
function GameBoard() {
    const rows = 3;
    const columns = 3;
    // declare empty array that holds the game state
    let board = [];

    // 2D nested array of cell objects representing the game board
    // row 0 represents the top row, column 0 represents the left-most column
    for(let i = 0; i < rows; i++) {
        // insert an empty array into each row position
        board[i] = [];
        for(let j = 0; j < columns; j++) {
            // fill each empty row arrays with cell objects
            board[i].push(Cell());
        }
    }

    // method allowing the UI to retrieve current state of the board
    // without directly exposing the board variable externally
    const getBoard = () => board;

    const placeMarker = (row, column, player) => {
        // check if board position is available
        if(board[row][column].getValue() === "--") {
            board[row][column].addMarker(player);
            // marker successfully placed (used in playRound())
            return true;
        } else {
            console.log("This spot is already taken, please choose another.");
            // marker placement invalid (used in playRound())
            return false;
        }
    };
    
    const printBoard = () => {
        // outer map iterates through each row, inner map iterates
        // through each cell and uses getValue to extract value
        const boardWithCells = board.map((row) => row.map((cell) => cell.getValue()));
        // render board as a table
        console.table(boardWithCells);
    };

    // return public methods
    return { getBoard, placeMarker, printBoard };
}

// encapsulate behavior of a single cell on the game board
function Cell() {
    // initial value
    let value = "--";

    const addMarker = (player) => {
        if(value === "--") value = player;
    };

    const getValue = () => value;

    return { addMarker, getValue };
}

// manage game logic
function GameController(playerOneName = "Player One", playerTwoName = "Player Two") {
    
    const board = GameBoard();

    // array of player objects, default names set in parameters unless assigned
    const players = [
        {
            name: playerOneName,
            token: "X"
        },
        {
            name: playerTwoName,
            token: "O"
        }
    ];

    let activePlayer = players[0];

    const getActivePlayer = () => activePlayer;

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    }

    // play a round of the game, check for win or tie, reprint new board and switch player turn
    const playRound = (row, column) => {
        const moveSuccessful = board.placeMarker(row, column, activePlayer.token);
        
        if(moveSuccessful) {

            //win logic here

            //else
            switchPlayerTurn();
        }
        // print board regardless of move success or failure
        printNewRound();
    };

    // send initial play game message
    printNewRound();

    return { playRound, getActivePlayer };
}