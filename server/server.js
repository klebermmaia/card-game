const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Cria a aplicação Express
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Define a pasta pública para servir os arquivos HTML/CSS/JS
app.use(express.static(path.join(__dirname, '../public')));

// Variável para armazenar usuários à espera de um parceiro
let waitingUser = null;

// Armazena os pares de usuários conectados
const connectedPairs = {};

// Quando um usuário se conecta
io.on('connection', (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);

    // Quando o usuário clica para buscar outro usuário
    socket.on('searchingForUser', () => {
        if (waitingUser) {
          console.log(`Pareando ${socket.id} com ${waitingUser}`);
            // Se houver um usuário esperando, pareia os dois
            io.to(socket.id).emit('userFound', waitingUser);  // Informa o novo usuário sobre o par
            io.to(waitingUser).emit('userFound', socket.id);  // Informa o usuário à espera
            connectedPairs[socket.id] = waitingUser;  // Armazena os dois usuários pareados
            connectedPairs[waitingUser] = socket.id;  // Armazena o par
            waitingUser = null;  // Zera a variável, pois ambos foram pareados
        } else {
            // Se não houver ninguém esperando, o usuário fica à espera
            waitingUser = socket.id;
            socket.emit('waitingForUser');  // Informa que está na fila de espera
        }
    });

    // Quando o usuário envia uma mensagem
    socket.on('sendMessage', (message) => {
        const partnerId = connectedPairs[socket.id];
        if (partnerId) {
            io.to(partnerId).emit('receiveMessage', message);  // Envia a mensagem ao parceiro
        } else {
          console.log(`Nenhum parceiro encontrado para ${socket.id}`);  // Adicione esta linha
      }
    });

    // Quando o usuário se desconecta
    socket.on('disconnect', () => {
        console.log(`Usuário desconectado: ${socket.id}`);
        const partnerId = connectedPairs[socket.id];

        if (partnerId) {
            io.to(partnerId).emit('partnerDisconnected');  // Informa o parceiro que o outro desconectou
            delete connectedPairs[partnerId];  // Remove o par do parceiro desconectado
            waitingUser = partnerId;  // Coloca o parceiro na fila de espera
        }

        delete connectedPairs[socket.id];  // Remove o par do usuário desconectado

        if (waitingUser === socket.id) {
            waitingUser = null;  // Limpa a fila de espera se o usuário que estava aguardando sair
        }
    });
});

// Configura o servidor para ouvir na porta 3000
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
