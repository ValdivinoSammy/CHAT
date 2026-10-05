const mensagens = document.getElementById("mensagens");
const btnEnviar = document.getElementById("enviar");
const textCampo = document.getElementById("text-campo");
const ChatName = document.getElementById("chatName");
const btnOptions = document.getElementById("imgOptions");
const cardOptions = document.getElementById("card-options");
const cardChatName = document.getElementById("card-chatName");
const fecharOptions = document.getElementById("fechar-options");
const fecharAltname = document.getElementById("fechar-altname");
const alterar = document.getElementById("alterar");
const darkMode = document.getElementById("darkMode");
const lightMode = document.getElementById("lightMode");
const altChatName = document.getElementById("altChatName");
const delMsgs = document.getElementById("delMsgs");
const divsOptions = document.getElementsByClassName("divs-options");
const cards = document.getElementsByClassName("cards");

const logOut = document.getElementById("LogOut");
const socket = io("https://chat-4ba7.onrender.com");


const token = localStorage.getItem("tokenCHAT");
const usuario = localStorage.getItem("usuarioName_chat");



socket.on("msg_server_allMsg", () => {
    buscarAllMsgs();
});

socket.on("msg_server", dados => {
    mostrarMsgs(dados)
});

socket.on("msg_server_reload", () => {
    alert("Esse chat precisa ser atualizado devido a mudanças feita pelo Adm");
    window.location.reload();
})

socket.on("msg_server_aviso", msg => {
    const aviso = document.createElement("b");
    aviso.innerText = msg;
    mensagens.appendChild(aviso);
})

socket.on("msg_server_push", mensagem => {
    pushMessageForMongo(mensagem)
})


//-------Funções------- 

function mostrarMsgs(dados) {
    let msgCard = "";

    const cardUser = document.createElement("div");
    if (dados.id === usuario) {
        cardUser.id = dados.id;
        cardUser.classList.add("myMsg");
        msgCard = `
                <p class="myMsg">${dados.msg}</p>
              `;
        cardUser.innerHTML = msgCard
        mensagens.appendChild(cardUser);
        mensagens.scrollTop = mensagens.scrollHeight;
    } else {
        if (dados.user === "") {
            msgCard = `
                <div class="bgc">
                    <p>${dados.msg}</p>
                </div>
              `;
        } else {
            msgCard = `
                <div class="bgc">
                    <h3>${dados.user}</h3>
                    <p>${dados.msg}</p>
                </div>
              `;
        }
        cardUser.innerHTML = msgCard
        mensagens.appendChild(cardUser);
        mensagens.scrollTop = mensagens.scrollHeight;
    }

};

async function buscarAllMsgs(log) {
    const resposta = await fetch("https://api-login-jwt-mepp.onrender.com/user/getAllMessages",
        { headers: { "auth-token": token } });
    if (!resposta.ok) {
        const error = resposta.text();
        alert("Erro ao tentar buscar mensagens: " + error);
        return;
    };
    const docs = await resposta.json();
    if (docs.length < 1) return;
    docs.forEach(log => {
        let msgCard = "";
        const cardUser = document.createElement("div");
        if (log.id !== usuario) {
            if (log.user === "") {
                msgCard = `
                <div class="bgc">
                    <p>${log.msg}</p>
                </div>
              `;
            } else {
                msgCard = `
                <div class="bgc">
                    <h3>${log.user}</h3>
                    <p >${log.msg}</p>
                </div>
              `;
            }
            cardUser.innerHTML = msgCard
            mensagens.appendChild(cardUser);
            mensagens.scrollTop = mensagens.scrollHeight;
        }
        else {
            cardUser.id = log.id;
            cardUser.classList.add("myMsg");
            msgCard = `
                <p class="myMsg">${log.msg}</p>
              `;
            cardUser.innerHTML = msgCard
            mensagens.appendChild(cardUser);
            mensagens.scrollTop = mensagens.scrollHeight;
        }
    })
}

function darkModeOn() {
    document.body.style.backgroundColor = "#333";
    document.body.style.color = "#fff";
    alterar.style.backgroundColor = "#777";
    alterar.style.color = "#fff";
    ChatName.style.backgroundColor = "#333";
    [...cards].forEach(card => { card.style.backgroundColor = "#333"; });
    [...divsOptions].forEach(div => { div.style.backgroundColor = "#777" });
    document.getElementById("topBarChat").style.backgroundColor = "#777";
    localStorage.setItem("darkModeOn_chat", "true");

    darkMode.style.display = "none";
    lightMode.style.display = "";
}

function lightModeOn() {
    document.body.style.backgroundColor = "";
    document.body.style.color = "";
    alterar.style.backgroundColor = "";
    alterar.style.color = "";
    ChatName.style.backgroundColor = "";
    [...cards].forEach(card => { card.style.backgroundColor = ""; });
    [...divsOptions].forEach(div => { div.style.backgroundColor = "" });
    document.getElementById("topBarChat").style.backgroundColor = "";
    localStorage.setItem("darkModeOn_chat", "false");

    lightMode.style.display = "none";
    darkMode.style.display = "";
}
let DMO = localStorage.getItem("darkModeOn_chat");
if (DMO === "true") { darkModeOn() };



async function chatNameAlt() {
    const resposta = await fetch(`https://api-login-jwt-mepp.onrender.com/admin/tradeName?nome=${ChatName.innerText}`,
        {
            method: "PUT",
            headers: {
                "auth-token": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                novoNome: document.getElementById("newName-campo").value
            })
        });
    if (!resposta.ok) {
        let error = await resposta.text();
        alert("Error: " + error);
        return
    };
    socket.emit("msg_cliet_reload");
}

async function delAllMsgs() {
    const resposta = await fetch("https://api-login-jwt-mepp.onrender.com/admin/msgDel",
        {
            method: "DELETE",
            headers: { "auth-token": token },
        });
    if (!resposta.ok) {
        let error = await resposta.text();
        alert("Error: " + error);
        return
    };
    let msgApagadas = await resposta.json();
    if (msgApagadas.deletedCount >= 1) {
        alert("Vc apagou um total de: " + msgApagadas.deletedCount + " Mensagens");
        socket.emit("msg_cliet_reload");
    }
}

function hiddenAndDisabledBtn() {
    btnEnviar.disabled = true;
    btnEnviar.style.borderRadius = "";
    btnEnviar.style.color = "#fff";
}

async function pushMessageForMongo(mensagem) {
    const resposta = await fetch("https://api-login-jwt-mepp.onrender.com/user/message",
        {
            method: "POST",
            headers: {
                "auth-token": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: mensagem.id,
                user: mensagem.user,
                msg: mensagem.msg
            })
        });
    if (!resposta.ok) {
        const error = await resposta.text();
        alert("Houve um erro: " + error);
        return
    };
};


// -----após a pagina carregar------

window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("tokenCHAT");
    if (!token) {
        window.location.href = "../index.html";
        return
    };

    const resposta = await fetch("https://api-login-jwt-mepp.onrender.com/user/verificar",
        { headers: { "auth-token": token } });
    if (!resposta.ok) {
        localStorage.removeItem("tokenCHAT");
        window.location.href = "../index.html";
        return
    }

    const res = await fetch("https://api-login-jwt-mepp.onrender.com/user/getChatName",
        { headers: { "auth-token": token } });
    const chatName = await res.json();
    ChatName.innerText = chatName[0].nome;

    const response = await fetch("https://api-login-jwt-mepp.onrender.com/admin",
        { headers: { "auth-token": token } });
    const iAmAdmin = await response.json();
    if (!iAmAdmin) {
        altChatName.style.display = "none";
        delMsgs.style.display = "none";
    };

    btnOptions.addEventListener("click", () => {
        cardOptions.style.display = "";
        fecharOptions.addEventListener("click", () => { cardOptions.style.display = "none"; });
        darkMode.addEventListener("click", darkModeOn);
        lightMode.addEventListener("click", lightModeOn);
        if (iAmAdmin) {
            altChatName.addEventListener("click", () => {
                cardChatName.style.display = "";
                cardOptions.style.display = "none";
                alterar.addEventListener("click", chatNameAlt);
                fecharAltname.addEventListener("click", () => {
                    cardChatName.style.display = "none";
                    cardOptions.style.display = "";
                })
            });
            delMsgs.addEventListener("click", delAllMsgs);
        };
    });

    logOut.addEventListener("click", () => {
        localStorage.removeItem("tokenCHAT");
        localStorage.removeItem("usuarioName_chat");
        window.location.href = "../index.html";
    })


    btnEnviar.addEventListener("click", () => {
        let mensagem = {
            id: usuario,
            user: usuario,
            msg: textCampo.value
        };

        socket.emit("msg_client", mensagem);

        textCampo.value = "";
        hiddenAndDisabledBtn();
    });

    textCampo.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            btnEnviar.click();
        }
    });

    textCampo.addEventListener("input", () => {
        if (textCampo.value.trim() !== "") {
            btnEnviar.disabled = false;
            btnEnviar.style.borderRadius = "20px"
            btnEnviar.style.color = "";
        } else {
            hiddenAndDisabledBtn();
        }
    })
    hiddenAndDisabledBtn();
})



