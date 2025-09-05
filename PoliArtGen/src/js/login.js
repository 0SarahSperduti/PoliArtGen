// Usuários "mockados" (só para simulação)
const usuarios = [
    { usuario: "admin", senha: "1234" },
    { usuario: "sarah", senha: "5678" }
];

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const usuarioInput = document.getElementById("usuario").value;
    const senhaInput = document.getElementById("senha").value;

    const autenticado = usuarios.some(u => u.usuario === usuarioInput && u.senha === senhaInput);

    if (autenticado) {
        window.location.href = "pag_principal.html";
    } else {
        alert("Usuário ou senha inválidos!");
    }
});
