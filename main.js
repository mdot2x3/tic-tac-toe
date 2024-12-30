// whenever you have a function that you're defining as a class it's best practice to use a capital letter
function Gameboard() {
    const rows = 3;
    const columns = 3;
    let board = [];

    // 2D array representing the game board
    // row 0 represents the top row, column 0 represents the left-most column
    for(let i = 0; i < rows; i++) {
        board[i] = [];
        for(let j = 0; j < columns; j++) {
            board[i].push("--");
        }
    }
    console.log(board);
}