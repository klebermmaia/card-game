const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "../public")));

// let waitingUsers = [];
const waitingPlayers = []; // Fila para armazenar jogadores que estão aguardando
let userNames = {}; // Armazena os nomes dos usuários associados aos IDs de socket

io.on("connection", (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  socket.on("searchingForOpponent", (userName) => {
    // console.log('userName')
    // socket.emit("teste", userNames);

    waitingPlayers.push({ id: socket.id, username: userName }); // Adiciona o usuário à fila
    console.log(`${userName} entrou na fila de espera`);
    userNames[socket.id] = userName; // Associa o nome do usuário ao socket.id

    // Verifica se há jogadores suficientes na fila para criar uma partida
    if (waitingPlayers.length >= 2) {
      criarParDeJogadores();
    }
    function criarParDeJogadores() {
      // Remove os dois primeiros jogadores da fila
      const p1 = waitingPlayers.shift();
      const p2 = waitingPlayers.shift();

      // Nome da sala baseado nos IDs dos jogadores
      const roomName = `room-${p1.id}-${p2.id}`;
      console.log(`Sala criada com ${userNames[p1.id]} e ${userNames[p2.id]}`)
      socket.emit("teste", roomName);

    }
  });

  socket.on("sendMessage", ({ message }) => {
    const rooms = Array.from(socket.rooms);
    const roomId = rooms.find((room) => room !== socket.id);

    if (roomId) {
      io.to(roomId).emit("receiveMessage", {
        message,
        sender: userNames[socket.id] || "Usuário",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Usuário desconectado: ${socket.id}`);
    delete userNames[socket.id]; // Remove o nome do usuário

    // Remove o usuário da fila de espera, se estiver lá
    // waitingUsers = waitingUsers.filter((id) => id !== socket.id);

    // Notifica outros usuários na sala e libera a sala
    const rooms = Array.from(socket.rooms);
    rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        io.to(roomId).emit("partnerDisconnected"); // Informa ao parceiro que o outro usuário saiu
        socket.to(roomId).leave(roomId); // Remove o socket da sala
      }
    });
  });
});

server.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
