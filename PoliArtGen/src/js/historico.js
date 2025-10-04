document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("historico-content");

    // Busca histórico salvo
    const historico = JSON.parse(localStorage.getItem("historicoIlustracoes")) || [];

    if (historico.length === 0) {
        container.innerHTML = `
            <div class="historico-box">
                <div class="historico-icon">
                    <img src="../src/img/icone-placeholder.png" alt="Nenhuma ilustração">
                </div>
                <p class="historico-info">Nenhuma ilustração ainda</p>
                <p class="historico-instrucao">Comece criando sua primeira ilustração no gerador</p>
                <a href="pag_principal.html" class="historico-btn">Ir para o Gerador</a>
            </div>
        `;
        return;
    }

    // Caso tenha ilustrações no histórico
    let html = `
        <div class="historico-grid">
            ${historico.map(item => `
                <div class="historico-item">
                    <img src="${item.imagem}" alt="Ilustração gerada">
                    <p><strong>Prompt:</strong> ${item.prompt}</p>
                    <p><small>${item.data}</small></p>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
});
document.getElementById("historico-vazio").style.display = "none";
document.getElementById("historico-grid").style.display = "grid";
