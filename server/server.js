const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

let waitingUsers = [];
let userNames = {}; // Armazena os nomes dos usuários associados aos IDs de socket

io.on('connection', (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  socket.on('searchingForUser', (username) => {
    socket.emit('teste', username)
    userNames[socket.id] = username; // Associa o nome do usuário ao socket.id
    waitingUsers.push(socket.id); // Adiciona o usuário à fila

    // Verifica se há um par para formar uma sala
    if (waitingUsers.length >= 2) {
      const user1 = waitingUsers.shift();
      const user2 = waitingUsers.shift();

      const roomId = `${user1}_${user2}`;
      io.to(user1).socketsJoin(roomId);
      io.to(user2).socketsJoin(roomId);

      // Envia confirmação de conexão e informações sobre o par
      io.to(user1).emit('userFound', { partnerId: user2, partnerName: userNames[user2] });
      io.to(user2).emit('userFound', { partnerId: user1, partnerName: userNames[user1] });
    } else {
      socket.emit('waitingForUser'); // Informa que está na fila de espera
    }
  });

  socket.on('sendMessage', ({ message }) => {
    const rooms = Array.from(socket.rooms);
    const roomId = rooms.find(room => room !== socket.id);
    
    if (roomId) {
      io.to(roomId).emit('receiveMessage', {
        message,
        sender: userNames[socket.id] || "Usuário"
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado: ${socket.id}`);
    delete userNames[socket.id]; // Remove o nome do usuário

    // Remove o usuário da fila de espera, se estiver lá
    waitingUsers = waitingUsers.filter(id => id !== socket.id);

    // Notifica outros usuários na sala e libera a sala
    const rooms = Array.from(socket.rooms);
    rooms.forEach(roomId => {
      if (roomId !== socket.id) {
        io.to(roomId).emit('partnerDisconnected'); // Informa ao parceiro que o outro usuário saiu
        socket.to(roomId).leave(roomId); // Remove o socket da sala
      }
    });
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
