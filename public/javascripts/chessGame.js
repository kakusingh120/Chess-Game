const socket = io();
const chess = new Chess();
const boardElement = document.querySelector('.chessBoard');
let draggedPiece = null;
let sourceSquare = null;
let playerRole = "w"; // Default role as white


// Converts row-col coordinates to chess notation (e.g., 6, 4 → "e2")
const getChessNotation = (row, col) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']; // Columns in chess
    return files[col] + (8 - row);
};

const getPieceUnicode = (piece) => {
    const pieceUnicode = {
        'p': '♙',
        'r': '♖',
        'n': '♘',
        'b': '♗',
        'q': '♕',
        'k': '♔',
        'P': '♟',
        'R': '♜',
        'N': '♞',
        'B': '♝',
        'Q': '♛',
        'K': '♚'
    };
    return pieceUnicode[piece.type.toLowerCase()] || "";
}

const renderBoard = () => {
    const board = chess.board(); // Use the instance of Chess
    boardElement.innerHTML = "";
    // console.log(board); //print array of board
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            let squareElement = document.createElement('div');
            squareElement.classList.add("square", (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark");

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                let pieceElement = document.createElement("div");
                pieceElement.classList.add('piece', square.color === "w" ? "white" : "black");

                pieceElement.innerHTML = getPieceUnicode(square);
                // pieceElement.innerHTML = getPieceUnicode(square.type);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        // e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                })

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
            })

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                console.log("Drop event triggered!");
                console.log("Dragged Piece:", draggedPiece);
                console.log("Source Square:", sourceSquare);
                console.log("Target Square:", squareElement.dataset.row, squareElement.dataset.col);
                if (draggedPiece) {
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    }
                    handleMove(sourceSquare, targetSource);
                }
            })
            boardElement.appendChild(squareElement);
        });
    });

    if (playerRole === 'b') {
        boardElement.classList.add('flipped')
    } else {
        boardElement.classList.remove('flipped')
    }
}


const handleMove = (source, target) => {
    const from = getChessNotation(source.row, source.col);
    const to = getChessNotation(target.row, target.col);

    const move = chess.move({ from, to });

    if (move) {
        console.log(`Move: ${from} → ${to}`);
        socket.emit("move", move); // Send move to server (for multiplayer)
        renderBoard(); // Update board after move
    } else {
        console.log("Invalid move!");
    }
};


socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", (role) => {
    playerRole = null;
    renderBoard();
});


socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});


socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});


renderBoard();




// socket.emit("recived")
// socket.on("data data", () => {
//     console.log("data received on frontend");
// })






// const socket = io();
// const chess = new Chess();
// const boardElement = document.querySelector('.chessBoard');
// let draggedPiece = null;
// let sourceSquare = null;
// let playerRole = "w"; // Set player role (default to white)

// // Converts row-col coordinates to chess notation (e.g., 6, 4 → "e2")
// const getChessNotation = (row, col) => {
//     const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']; // Columns in chess
//     return files[col] + (8 - row);
// };

// // Function to get chess piece Unicode symbols
// const getPieceUnicode = (type) => {
//     const pieceUnicode = {
//         'p': '♙', 'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔',
//         'P': '♟', 'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚'
//     };
//     return pieceUnicode[type.toLowerCase()] || "";
// };

// const renderBoard = () => {
//     const board = chess.board();
//     boardElement.innerHTML = ""; // Clear previous board

//     board.forEach((row, rowIndex) => {
//         row.forEach((square, squareIndex) => {
//             let squareElement = document.createElement('div');
//             squareElement.classList.add("square", (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark");

//             squareElement.dataset.row = rowIndex;
//             squareElement.dataset.col = squareIndex;

//             if (square) {
//                 let pieceElement = document.createElement("div");
//                 pieceElement.classList.add('piece', square.color === "w" ? "white" : "black");

//                 pieceElement.innerHTML = getPieceUnicode(square.type);
//                 pieceElement.draggable = playerRole === square.color;

//                 pieceElement.addEventListener("dragstart", (e) => {
//                     if (pieceElement.draggable) {
//                         draggedPiece = pieceElement;
//                         sourceSquare = { row: rowIndex, col: squareIndex };
//                         e.dataTransfer.setData("text/plain", "");
//                     }
//                 });

//                 pieceElement.addEventListener("dragend", () => {
//                     draggedPiece = null;
//                     sourceSquare = null;
//                 });

//                 squareElement.appendChild(pieceElement);
//             }

//             squareElement.addEventListener("dragover", (e) => {
//                 e.preventDefault();
//             });

//             squareElement.addEventListener("drop", (e) => {
//                 e.preventDefault();
//                 if (draggedPiece) {
//                     const targetSquare = e.target.closest(".square"); // Ensure valid drop
//                     if (targetSquare) {
//                         const targetSource = {
//                             row: parseInt(targetSquare.dataset.row),
//                             col: parseInt(targetSquare.dataset.col)
//                         };
//                         handleMove(sourceSquare, targetSource);
//                     }
//                 }
//             });

//             boardElement.appendChild(squareElement); // Fix: Move this inside the second loop
//         });
//     });
// };

// // Function to handle a move
// const handleMove = (source, target) => {
//     const from = getChessNotation(source.row, source.col);
//     const to = getChessNotation(target.row, target.col);

//     const move = chess.move({ from, to });

//     if (move) {
//         console.log(`Move: ${from} → ${to}`);
//         socket.emit("move", move); // Send move to server (for multiplayer)
//         renderBoard(); // Update board after move
//     } else {
//         console.log("Invalid move!");
//     }
// };

// // Listen for player role
// socket.on("playerRole", (role) => {
//     playerRole = role;
//     renderBoard();
// });

// socket.on("spectatorRole", (role) => {
//     playerRole = null;
//     renderBoard();
// });

// // Sync board state from server
// socket.on("boardState", (fen) => {
//     chess.load(fen);
//     renderBoard();
// });

// // Receive moves from other players
// socket.on("move", (move) => {
//     chess.move(move);
//     renderBoard();
// });

// // Initial render
// renderBoard();
