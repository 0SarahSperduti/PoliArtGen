// funcoes para integrar com a api de ia

// Exemplo de chamada GET
fetch("google/gemini-2.5-flash-image-preview")
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro na requisição: " + response.status);
        }
        return response.json(); // converte para JSON
    })
    .then(data => {
        console.log("Usuários recebidos:", data);
        // aqui você pode manipular o resultado, exibir na tela etc.
    })
    .catch(error => {
        console.error("Erro ao conectar na API:", error);
    });
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    fetch("google/gemini-2.5-flash-image-preview", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario, senha })
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                window.location.href = "pag_principal.html";
            } else {
                alert("Usuário ou senha inválidos!");
            }
        })
        .catch(error => {
            console.error("Erro na requisição:", error);
        });
});
