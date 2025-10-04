// logica prncipal (captura do formulario, api, exibe resultado)
// src/js/main.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formPrincipal");
    const preview = document.getElementById("preview-img");
    const logoutBtn = document.querySelector(".logout");

    // Evento de envio do formulário
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const materia = document.getElementById("materia").value;
        const estilo = document.getElementById("estilo").value;
        const topico = document.getElementById("topico").value.trim();
        const nivel = document.getElementById("nivel").value;
        const detalhes = document.getElementById("detalhes").value.trim();

        if (!topico) {
            alert("Por favor, insira um tópico específico!");
            return;
        }

        // Simulação de geração de imagem
        preview.innerHTML = `
            <p><strong>Gerando ilustração...</strong></p>
            <div class="loading"></div>
        `;

        // Simula tempo de geração
        setTimeout(() => {
            preview.innerHTML = `
                <img src="https://via.placeholder.com/400x250.png?text=${encodeURIComponent(topico)}" 
                    alt="Ilustração gerada">
                <p><strong>${materia}</strong> - ${estilo}</p>
                <small>${nivel}</small>
                <p>${detalhes || "Sem detalhes adicionais."}</p>
            `;
        }, 1500);
    });

    // Evento de logout
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const confirmar = confirm("Deseja realmente sair?");
        if (confirmar) {
            window.location.href = "pag_login.html";
        }
    });
});
