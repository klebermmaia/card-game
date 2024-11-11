/*
------ Para Fazer -------
Validador de nickname, para remover espaços, simboloes e etc.

*/
const socket = io();
const btnStarGame = document.getElementById("btnStarGame");
const btnCancelGame = document.getElementById("btnCancelGame");
const nicknameInput = document.getElementById("nickname");

const testes = document.querySelector(".testes");

let partnerId = null;
let isConnected = false;
let username = "";

// Evento para iniciar busca por outro usuário
btnStarGame.addEventListener("click", () => {
  let nickname = nicknameInput.value.trim();
  // console.log(nickname)
  if (!nickname) {
    alert("Por favor insira um nickname.", nickname);
    return;
  }

  socket.emit("searchingForOpponent", nickname); // Envia o Nick para o server
  testes.innerText = "";
  btnStarGame.disabled = true;
});

socket.on('confirmaJogo', ()=>{
  const displaycheck = document.querySelector('.displaycheck');
  const btnConfirme = document.querySelector('#btnConfirme');
  const btnRecursa = document.querySelector('#btnRecursa');
  
  [btnConfirme, btnRecursa].forEach((btn) => {
    const checkbox = document.querySelector(`#${btn.id}`);
    if (checkbox.checked) {
      console.log(`O botão ${btn.id} está marcado`);
    }
    else{
      console.log(':(');
    }
  });
  
  displaycheck.style.display = 'flex';
});

// Desativa botão de busca e ativa o de cancelar
socket.on("toggleBtnCancelGame", (check) => {
  btnStarGame.classList.add("disable");
  btnCancelGame.classList.add("active");
});

// Evento disparado quando um par é encontrado
socket.on("userFound", ({ partnerId: id, partnerName }) => {
  partnerId = id;
  statusDisplay.innerText = `Conectado a ${partnerName}!`;
  isConnected = true;

  messageInput.disabled = false;
  sendButton.disabled = false;
});


socket.on("teste", (t) => {
  console.log(t);
});
