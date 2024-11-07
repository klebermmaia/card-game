/*
------ Para Fazer -------
Validador de nickname, para remover espaços, simboloes e etc.

*/

const socket = io();
const searchButton = document.getElementById('search-button');
const chatDisplay = document.getElementById('chat-window');
const statusDisplay = document.getElementById('status');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const usernameInput = document.getElementById('username-input'); // Campo de nome

const starGame = document.getElementById('StarGame');
const nicknameInput = document.getElementById('nickname');

const testes = document.querySelector('.testes');

let partnerId = null;
let isConnected = false;
let username = "";

// Evento para iniciar busca por outro usuário
starGame.addEventListener('click', () =>{
  let nickname = nicknameInput.value.trim();
  // console.log(nickname)
  if(!nickname){
    alert("Por favor insira um nickname.", nickname)
    return
  }
  
  socket.emit('searchingForOpponent', nickname); // Envia o Nick para o server
  testes.innerText = ''
  starGame.disabled = true;
})

// searchButton.addEventListener('click', () => {
//   username = usernameInput.value.trim();
//   if (!username) {
//     alert("Por favor, insira seu nome.");
//     return;
//   }

//   socket.emit('searchingForUser', username); // Envia o nome ao servidor
//   statusDisplay.innerText = "Procurando outro usuário...";
//   searchButton.disabled = true;
// });

// Evento disparado quando um par é encontrado
socket.on('userFound', ({ partnerId: id, partnerName }) => {
  partnerId = id;
  statusDisplay.innerText = `Conectado a ${partnerName}!`;
  isConnected = true;

  messageInput.disabled = false;
  sendButton.disabled = false;
});

// Envia a mensagem apenas se conectado e a mensagem não estiver vazia
// sendButton.addEventListener('click', () => {
//   if (!isConnected) return; // Só envia se estiver conectado

//   const message = messageInput.value.trim();
//   if (message !== '') {
//     appendMessage("Você", message);  // Exibe a mensagem enviada no chat
//     socket.emit('sendMessage', { message });  // Envia a mensagem ao servidor
//     messageInput.value = '';  // Limpa o campo de input
//   }
// });

// Recebe a mensagem do parceiro
socket.on('receiveMessage', ({ message, sender }) => {
  appendMessage(sender, message);
});

// Quando o parceiro se desconecta
socket.on('partnerDisconnected', () => {
  statusDisplay.innerText = "Seu parceiro desconectou. Aguardando novo par...";
  messageInput.disabled = true;
  sendButton.disabled = true;
  isConnected = false;
  socket.emit('searchingForUser', username); // Retorna à fila de espera
});

// Função para exibir mensagens no chat
function appendMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${sender}: ${message}`;
  chatDisplay.appendChild(messageElement);
}

socket.on('teste',(t)=>{
  console.log(t)
})