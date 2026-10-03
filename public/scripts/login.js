const tradeCard = document.querySelector("#alter-LR");
const cardLogin = document.querySelector("#card-login");
const cardRegister = document.querySelector("#card-register");

const nomeR = document.querySelector("#userNomeR");
const emailR = document.querySelector("#userEmailR");
const senhaR = document.querySelector("#userSenhaR");

const emailL = document.querySelector("#userEmailL");
const senhaL = document.querySelector("#userSenhaL");

const btnRegister = document.querySelector("#registrar");
const btnLogin = document.querySelector("#logar");

let userVelhoDoChat = Boolean(localStorage.getItem("userVelhoDoChat"));
let loginOuRegis = false



btnLogin.addEventListener("click", async () => {
    try {
        const resposta = await fetch("https://api-login-jwt-mepp.onrender.com/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: emailL.value,
                senha: senhaL.value
            })
        });
        if (!resposta.ok) {
            const mensagem = await resposta.text();
            alert("Error no login:", mensagem);
            return
        }
        tudoCerto(resposta);

    } catch (error) {
        alert("Erro de conexão com a API:", error);
    }
});


btnRegister.addEventListener("click", async () => {
    try {
        const resposta = await fetch("https://api-login-jwt-mepp.onrender.com/user/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: nomeR.value,
                email: emailR.value,
                senha: senhaR.value
            })
        });
        if (!resposta.ok) {
            const mensagem = await resposta.text();
            alert("Erro no registro:", mensagem);
            return
        }
        alert("Registro realizado com sucesso!")
        tudoCerto(resposta);
    } catch (error) {
        alert("Não foi possível conectar com a API:", error)
    };
});


tradeCard.addEventListener("click", (evento) => {
    if (!loginOuRegis) {
        evento.target.innerText = "Não é registrado(a)? Faça seu registro.";
        loginOuRegis = true;

        cardRegister.style.display = "none";
        cardLogin.style.display = "";

    } else if (loginOuRegis) {
        evento.target.innerText = "Já é registrado(a)? Faça seu login.";
        loginOuRegis = false;

        cardRegister.style.display = "";
        cardLogin.style.display = "none";
    }
})

window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("tokenCHAT");
    if (!token) {
        if (userVelhoDoChat) tradeCard.click();
        return};

    const resposta = await fetch("https://api-login-jwt-mepp.onrender.com/user/verificar",
        { headers: { "auth-token": token } });
    if (resposta.ok) {
        window.location.href = "./public/chat.html";
    } else {
        localStorage.removeItem("tokenCHAT");
        if (userVelhoDoChat) tradeCard.click();
    }

});

tudoCerto = async function (resposta) {
    const token = resposta.headers.get("auth-token");
    let usuario = await resposta.text();
    localStorage.setItem("usuarioName_chat", usuario);
    localStorage.setItem("tokenCHAT", token);
    localStorage.setItem("userVelhoDoChat", true);
    window.location.href = "./public/chat.html";
}