require("dotenv").config();

const express = require('express');
const app = express();
const path = require('path');
const socketIO = require('socket.io');



app.get(["/","/index.html"], (req, res) => { res.sendFile(path.join(__dirname, "index.html")) });

app.use("/public", express.static(path.join(__dirname, "public")));




const server = app.listen(process.env.PORT , "0.0.0.0", () => {
    console.log("Servidor rodando")
});

const io = socketIO(server, {
    cors: {
        origin: [
            "http://127.0.0.1:5000",
            "http://localhost:5000",
            "http://192.168.1.2:5000",
            "https://valdivinosammy.github.io"
        ]
    }
});


let userVez;
let ultimoUser;
io.on("connect", socket => {

    // avisando para os usuarios online que alguem entrou no chat
    socket.broadcast.emit("msg_server_aviso", "Alguem acabou de ficar online ◉")

    // entregand todas as mensagens do chat para o novo usuario

    socket.emit("msg_server_allMsg");


    // recebe a mensagem do usuario e manda para todos os outros
    
    socket.on("msg_client", mensagem => {

        userVez = mensagem.user;
        if (userVez === ultimoUser) { mensagem.user = ""; }

        socket.emit("msg_server_push", mensagem);
        io.emit("msg_server", mensagem);
        ultimoUser = userVez;
    });

    // recebendo o aviso de que o nome do chat/grupo foi alterado

    socket.on("msg_cliet_reload", newNome => {
        if (newNome)
            io.emit("msg_server_reload", newNome);
        io.emit("msg_server_reload");
    });

    socket.on("msg_client_tradeNick", dados=>{
        socket.broadcast.emit("msg_server_tradeNick", `${dados.user} acabou de alterar seu apelido para ${dados.newNick}, atualize a pagina para melhor experiência`)
    })
})

