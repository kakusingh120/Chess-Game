const express = require('express');
const app = express();
const { Server } = require('socket.io');

const http = require('http');
const path = require('path');
const server = http.createServer(app);
// const io = new Server(server);  // Correct way to initialize socket.io


const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ["polling"] // Force long polling instead of WebSockets
  });
  

const { Chess } = require('chess.js');
const chess = new Chess();


let players = {};
let currPlayer = "w";


// // Basics of socket.io
// io.on("connection", (socket) => {
//     console.log("connected✅");
//     socket.on("recived", () => {
//         console.log("data recevied on backend")
//         io.emit("data data")
//     })
//     socket.on("disconnect", () => {
//         console.log("socket disconnected");
//     })
// })


io.on('connection', (socket) => {
    console.log("connected✅")
    if (!players.white) {
        players.white = socket.id
        socket.emit("playerRole", "w");
    }
    else if (!players.black) {
        players.black = socket.id
        socket.emit("playerRole", "b");
    }
    else {
        socket.emit("spectatorRole")
    }

    socket.on('disconnect', () => {
        if (socket.id === players.white) {
            delete players.white
        }
        else if (socket.id === players.black) {
            delete players.black
        }
    });

    socket.on('move', (move) => {
        try {
            if (chess.turn() === 'w' && socket.id !== players.white) return;
            if (chess.turn() === 'b' && socket.id !== players.black) return;

            const result = chess.move(move);
            if (result) { // if truthy value is found.
                currPlayer = chess.turn();
                io.emit('move', move);
                io.emit("boardState", chess.fen()); // chess.fen() board ki currState milti hai 
            }else {
                console.log("Invalid move", move);
                socket.emit('Invalid move', move);
            }
        }
        catch (err) {
            console.error(err);
            socket.emit('Invalid move', move);
        }
    })

})



// Middleware setup
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', { title: "Chess game" });
})

server.listen(8088 , () => {
    console.log(`Server is listening on port http://localhost:8088`);
});