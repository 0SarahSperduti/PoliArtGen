// src/js/main.js
// Lógica principal (captura do formulário, simula geração, salva no histórico e exibe o resultado)

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formPrincipal");
    const preview = document.getElementById("preview-img");
    const logoutBtn = document.querySelector(".logout");

    // 🚨 Verificação de segurança (caso o HTML ainda não tenha carregado completamente)
    if (!form || !preview) {
        console.warn("Formulário principal ou área de preview não encontrados.");
        return;
    }

    // Evento de envio do formulário
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Captura dos campos
        const materia = document.getElementById("materia").value;
        const estilo = document.getElementById("estilo").value;
        const topico = document.getElementById("topico").value.trim();
        const nivel = document.getElementById("nivel").value;
        const detalhes = document.getElementById("detalhes").value.trim();

        // Validação
        if (!topico) {
            alert("Por favor, insira um tópico específico!");
            return;
        }

        // Mostra carregamento
        preview.innerHTML = `
            <p><strong>Gerando ilustração...</strong></p>
            <div class="loading"></div>
        `;

        // Simula tempo de geração
        setTimeout(() => {
            // Gera URL simulada (placeholder)
            const imagemGeradaURL = `https://via.placeholder.com/400x250.png?text=${encodeURIComponent(topico)}`;

            // Mostra a imagem gerada
            preview.innerHTML = `
                <img src="${imagemGeradaURL}" alt="Ilustração gerada">
                <p><strong>${materia}</strong> - ${estilo}</p>
                <small>${nivel}</small>
                <p>${detalhes || "Sem detalhes adicionais."}</p>
            `;

            // 💾 Salva no histórico localStorage
            const prompt = `${materia} | ${estilo} | ${topico} | ${nivel} | ${detalhes}`;
            gerarIlustracao(prompt, imagemGeradaURL);

        }, 1500);
    });

    // Evento de logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const confirmar = confirm("Deseja realmente sair?");
            if (confirmar) {
                window.location.href = "pag_login.html";
            }
        });
    }
});

// 🧠 Função global para salvar ilustração no histórico
function gerarIlustracao(prompt, imagemGeradaURL) {
    const ilustracao = {
        prompt,
        imagem: imagemGeradaURL,
        data: new Date().toLocaleString()
    };

    // Busca o histórico atual
    let historico = JSON.parse(localStorage.getItem("historicoIlustracoes")) || [];

    // Adiciona nova imagem
    historico.push(ilustracao);

    // Atualiza localStorage
    localStorage.setItem("historicoIlustracoes", JSON.stringify(historico));

    console.log("✅ Ilustração salva no histórico:", ilustracao);
}
