const socket = io();  // Conexão com o servidor via Socket.IO
const searchButton =document.getElementById('search-button')
const chatDisplay =document.getElementById('chat-window')
const statusDisplay =document.getElementById('status')
const messageInput = document.getElementById('message-input')
const sendButton = document.getElementById('send-button')

let partnerId = null;  // ID do parceiro conectado
let isConnected = false;

// Ao clicar no botão "Procurar usuário"
searchButton.addEventListener('click', () => {
  socket.emit('searchingForUser');  // Envia ao servidor que o usuário está procurando um par
  statusDisplay.innerText = "Procurando outro usuário...";
  searchButton.disabled = true;
});

// Quando o usuário é colocado na fila de espera
socket.on('waitingForUser', () => {
  statusDisplay.innerText = "Aguardando outro usuário...";
});

// Quando um par é encontrado
socket.on('userFound', (id) => {
  partnerId = id;
  statusDisplay.innerText = "Conectado a outro usuário!";
  isConnected = true;

  // Habilita o input de mensagens e o botão de envio
  messageInput.disabled = false;
  sendButton.disabled = false;

  // Função para enviar mensagem
  sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message !== '') {
      appendMessage("Você", message);  // Exibe a mensagem enviada no chat
      socket.emit('sendMessage', message);  // Envia a mensagem ao servidor
      messageInput.value = '';  // Limpa o campo de input
    } else {
      console.log("Mensagem vazia não enviada.");  // Adicione esta linha
  }
  });
});

// Quando recebe uma mensagem do outro usuário
socket.on('receiveMessage', (message) => {
  appendMessage("Outro Usuário", message);  // Exibe a mensagem recebida no chat
});

// Quando o parceiro se desconecta
socket.on('partnerDisconnected', () => {
  statusDisplay.innerText = "Seu parceiro desconectou. Aguardando novo par...";
  messageInput.disabled = true;
  sendButton.disabled = true;
  isConnected = false;

  // O usuário volta a procurar outro usuário
  socket.emit('searchingForUser');
});

// Função para exibir mensagens no chat
function appendMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${sender}: ${message}`;
  chatDisplay.appendChild(messageElement);
}
