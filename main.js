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
        if (board[row][column].getValue() === " ") {
            board[row][column].addMarker(player);
            // marker successfully placed (used in playRound())
            return true;
        } else {
            // marker placement invalid (used in playRound())
            return false;
        }
    }
    
    const printBoard = () => {
        // outer map iterates through each row, inner map iterates
        // through each cell and uses getValue to extract value
        const boardWithCells = board.map((row) => row.map((cell) => cell.getValue()));
        // render board as a table
        console.table(boardWithCells);
    }

    // reset and reinitialize the 3x3 grid
    const resetBoard = () => {
        board = [];
        for (let i = 0; i < rows; i++) {
            // insert an empty array into each row position
            board[i] = [];
            for (let j = 0; j < columns; j++) {
                // fill each empty row arrays with cell objects
                board[i].push(Cell());
            }
        }
    }

    // return public methods
    return { getBoard, placeMarker, printBoard, resetBoard };
}



// encapsulate behavior of a single cell on the game board
function Cell() {
    // initial value
    let value = " ";

    const addMarker = (player) => {
        if (value === " ") value = player;
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
    ]

    let activePlayer = players[0];

    const setPlayerNames = (nameOne, nameTwo) => {
        players[0].name = nameOne || players[0].name;
        players[1].name = nameTwo || players[1].name;
    }

    const getActivePlayer = () => activePlayer;

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }

    const printNewRound = () => {
        boardReference.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    }

    const declareWinner = () => {
        return `${activePlayer.name} wins!`;
    }

    const declareTie = () => {
        return "Tie game. Better luck next time!";
    }

    const invalidMove = () => {
        return "This spot is already taken, please choose another.";
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
                return "winner";
            }
            if (checkTie()){
                console.log("Tie game. Better luck next time!");
                return "tie";
            }
            //else
            switchPlayerTurn();
            printNewRound();
        } else {
            console.log("This spot is already taken, please choose another.");
            return "invalid";
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
            ]

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

                // check if all three values match, not including default " "
                if (valueA !== " " && valueA === valueB && valueB === valueC) {
                    return true;
                }
            }
            // after all for loop checks run, declare false if no wins found
            return false;
        }

        function checkTie() {
            for (let row of boardArrayReference) {
                for (let cell of row) {
                    if(cell.getValue() === " ") {
                        // an empty cell still exists
                        return false;
                    }
                }
            }
            // no empty cells exist, it is a tie
            return true;
        }
    }

    // send initial play game message
    printNewRound();

    // create internal call for getBoard() that can be shared with ScreenController
    // this helps maintain encapsulation, GameController() acts as a mediator between
    // the UI and underlying data
    const getBoard = () => boardReference.getBoard();

    const resetGame = () => {
        boardReference.resetBoard();
        activePlayer = players[0];
    }

    return { playRound, getActivePlayer, getBoard, declareWinner, declareTie, invalidMove, resetGame, setPlayerNames };
}



// update the screen with the state of the game board each turn
function ScreenController() {
    const gameReference = GameController();

    const boardDiv = document.querySelector(".board");
    const playerTurnDiv = document.querySelector(".turn");
    const messageDiv = document.querySelector(".message");
    const reset = document.querySelector(".reset");
    const modalOverlay = document.querySelector(".modal-overlay");
    const modalContent = document.querySelector(".modal-content");

    const updateScreen = () => {
        // clear the board on the DOM
        boardDiv.textContent = "";

        // fetch the most up-to-date board and active player
        let updatedBoard = gameReference.getBoard();
        let activePlayer = gameReference.getActivePlayer();

        // render the current player's turn on the DOM
        playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;

        // render each grid square on the DOM
        // forEach('current row/cell being processed (0,1,or 2)', 'the index of the current row/column'(same 0,1,or2))
        updatedBoard.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                // create clickable areas as buttons
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                // create a data attribute to identify the row and column of each cell created
                // the data is stored in the DOM, this makes it easier to identify which button
                // was clicked and be able to pass the coordinator data to the `playRound` function
                // specifically, this creates a data-row/column attribute on the button and assigns
                // it the value of rowIndex/columnIndex (the current row/column number)
                cellButton.dataset.row = rowIndex;
                cellButton.dataset.column = columnIndex;
                
                cellButton.textContent = cell.getValue();
                boardDiv.appendChild(cellButton);
            })
        })
    }

    // display content of message div
    const displayMessage = (message) => {
        messageDiv.textContent = message;
    }

    const showModal = (content) => {
        modalContent.innerHTML = content;
        modalOverlay.style.display = "flex";
        // rebind modal-specific events after content is injected
        bindModalEvents();
    }

    const hideModal = () => {
        modalOverlay.style.display = "none";
    }

    const bindModalEvents = () => {
        const player1Input = document.querySelector("#player1");
        const player2Input = document.querySelector("#player2");
        const startGameButton = document.querySelector("#start-game");
        const playAgainButton = document.querySelector("#play-again");
        const homeScreenButton = document.querySelector("#home-screen");

        //handle 'Start Game' button in homeScreenModal
        if (startGameButton) {
            startGameButton.addEventListener("click", () => {
                const player1Name = player1Input.value || "Player One";
                const player2Name = player2Input.value || "Player Two";
    
                // reset the game with new player names
                gameReference.setPlayerNames(player1Name, player2Name);
                hideModal();
                updateScreen();
                displayMessage("");
            });
        }

        // handle 'Play Again' button in endGameModal modal
        if (playAgainButton) {
            playAgainButton.addEventListener("click", () => {
                hideModal();
                gameReference.resetGame();
                updateScreen();
                displayMessage("");
            });
        }

        // handle 'Return to Home Screen' button in endGameModal modal
        if (homeScreenButton) {
            homeScreenButton.addEventListener("click", () => {
                gameReference.resetGame();
                homeScreenModal();
            });
        }
    }

    // render home screen modal and set up Start Game button functionality
    const homeScreenModal = () => {
        const homeScreenContent = `
            <h1>It's time to play Tic-Tac-Toe!</h1>
            <form id="player-form">
                <label for="player1">Player One:</label>
                <input type="text" id="player1" placeholder="Player One">
                <label for="player2">Player Two:</label>
                <input type="text" id="player2" placeholder="Player Two">
                <button type="button" id="start-game">Start Game</button>
            </form>
        `;
        showModal(homeScreenContent);
    }

    // dynamically modify modal window content for new game, win, or tie
    const endGameModal = (result) => {
        const endGameContent = `
            <h1>${result}</h1>
            <button id="play-again">Play Again</button>
            <button id="home-screen">Return to Home Screen</button>
        `;
        showModal(endGameContent);
    }
   
    // add event listener logic
    function clickHandlerBoard(e) {
        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;
        // ensure a valid element was clicked
        if (!selectedRow || !selectedColumn) return;

        // clear any existing message during the next round
        displayMessage("");

        // after click, check game status and update message div
        const status = gameReference.playRound(selectedRow, selectedColumn);
        updateScreen();

        switch (status) {
            case "winner":
                endGameModal(gameReference.declareWinner());
                break;
            case "tie":
                endGameModal(gameReference.declareTie());
                break;
            case "invalid":
                displayMessage(gameReference.invalidMove());
                break;
        }
    }

    // use the clickHandlerBoard function logic to listen for clicks
    boardDiv.addEventListener("click", clickHandlerBoard);

    // event listener for reset button press
    reset.addEventListener("click", () => {
        gameReference.resetGame();
        updateScreen();
        displayMessage("")
    });

    // show modal on load
    homeScreenModal();
    // initial render
    updateScreen();
}

ScreenController();