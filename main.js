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
    for (let i = 0; i < rows; i++) {
        // insert an empty array into each row position
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            // fill each empty row arrays with cell objects
            board[i].push(Cell());
        }
    }

    // method allowing the UI to retrieve current state of the board array
    // without directly exposing the board variable externally
    const getBoard = () => board;

    const placeMarker = (row, column, player) => {
        // check if board position is available
        if (board[row][column].getValue() === "--") {
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
        if (value === "--") value = player;
    };

    const getValue = () => value;

    return { addMarker, getValue };
}



// manage game logic
function GameController(playerOneName = "Player One", playerTwoName = "Player Two") {
    
    const boardReference = GameBoard();

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
        boardReference.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    }

    // play a round of the game, check for win or tie, reprint new board and switch player turn
    const playRound = (row, column) => {

        // retrieve the board array for processing in checks
        const boardArrayReference = boardReference.getBoard();

        // run placeMarker function and save whether is was a success or failure
        const moveSuccessful = boardReference.placeMarker(row, column, activePlayer.token);

        // after a move is made, check for win or tie, otherwise continue
        if (moveSuccessful) {
            if (checkWin()) {
                console.log(`${activePlayer.name} wins!`);
                return;
            };
            if (checkTie()){
                console.log("Tie game. Better luck next time!");
                return;
            }
            //else
            switchPlayerTurn();
            printNewRound();
        }
        
        function checkWin() {
            const winningCombinations = [
                // Rows
                [[0, 0], [0, 1], [0, 2]],
                [[1, 0], [1, 1], [1, 2]],
                [[2, 0], [2, 1], [2, 2]],
                
                // Columns
                [[0, 0], [1, 0], [2, 0]],
                [[0, 1], [1, 1], [2, 1]],
                [[0, 2], [1, 2], [2, 2]],
                
                // Diagonals
                [[0, 0], [1, 1], [2, 2]],
                [[0, 2], [1, 1], [2, 0]]
            ];

            // check if all three cells contain the same player's token
            for (let combination of winningCombinations) {
                // use array destructuring to unpack the three array elements of the
                // combination array into individual variables a, b, and c
                const [a, b, c] = combination;
                // extract the combination array data at index 0 and 1, then use those
                // values as coordinates to search the board and extract the present value
                const valueA = boardArrayReference[a[0]][a[1]].getValue();
                const valueB = boardArrayReference[b[0]][b[1]].getValue();
                const valueC = boardArrayReference[c[0]][c[1]].getValue();

                // check if all three values match, not including default "--"
                if (valueA !== "--" && valueA === valueB && valueB === valueC) {
                    return true;
                }
            }
            // after all for loop checks run, declare false if no wins found
            return false;
        }

        function checkTie() {
            for (let row of boardArrayReference) {
                for (let cell of row) {
                    if(cell.getValue() === "--") {
                        // an empty cell still exists
                        return false;
                    }
                }
            }
            // no empty cells exist, it is a tie
            return true;
        }
    };

    // send initial play game message
    printNewRound();

    return { playRound, getActivePlayer };
}