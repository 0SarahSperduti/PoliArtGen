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
// GARANTA QUE SEU main.js TENHA EXATAMENTE ESTE CÓDIGO
document.addEventListener('DOMContentLoaded', () => {

    const formGerador = document.getElementById('formPrincipal');
    const resultadoDiv = document.getElementById('preview-img');

    // Função que será chamada APENAS quando o usuário clicar em "Confirmar".
    function executarGeracao(dadosParaApi) {
        resultadoDiv.innerHTML = '<p>Gerando sua ilustração, aguarde um momento...</p>';
        const apiUrl = 'http://localhost:8080/gerar-imagem';

        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaApi)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na resposta do servidor: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.imageUrl) {
                // --- MUDANÇA ACONTECE AQUI ---
                // Agora, além da imagem, adicionamos um parágrafo com a mensagem de sucesso.
                resultadoDiv.innerHTML = `
                    <img src="${data.imageUrl}" alt="Ilustração gerada">
                    <p class="mensagem-sucesso">Sua imagem foi salva no histórico com sucesso!</p>
                `;
            } else {
                resultadoDiv.innerHTML = '<p>Ocorreu um erro ao gerar a imagem.</p>';
            }
        })
        .catch(error => {
            console.error('Erro na chamada da API:', error);
            resultadoDiv.innerHTML = '<p>Oops! Falha na comunicação com o servidor.</p>';
        });
    }

    if (formGerador) {
        formGerador.addEventListener('submit', function (event) {
            event.preventDefault();

            const dados = {
                materia: document.getElementById('materia').value,
                estilo: document.getElementById('estilo').value,
                topico: document.getElementById('topico').value,
                nivel: document.getElementById('nivel').value,
                detalhes: document.getElementById('detalhes').value
            };

            const confirmacaoHtml = `
                <div class="confirmacao-geracao">
                    <h4>Confirme sua Geração</h4>
                    <p><strong>Matéria:</strong> ${dados.materia}</p>
                    <p><strong>Estilo:</strong> ${dados.estilo}</p>
                    <p><strong>Tópico:</strong> ${dados.topico || 'Nenhum'}</p>
                    <p><strong>Nível:</strong> ${dados.nivel}</p>
                    <p><strong>Detalhes:</strong> ${dados.detalhes || 'Nenhum'}</p>
                    <div class="botoes-confirmacao">
                        <button id="btn-confirmar-geracao" class="btn-confirmar">Confirmar e Gerar</button>
                        <button id="btn-cancelar-geracao" class="btn-cancelar">Cancelar</button>
                    </div>
                </div>
            `;

            resultadoDiv.innerHTML = confirmacaoHtml;

            const btnConfirmar = document.getElementById('btn-confirmar-geracao');
            const btnCancelar = document.getElementById('btn-cancelar-geracao');

            btnConfirmar.addEventListener('click', () => {
                executarGeracao(dados);
            });

            btnCancelar.addEventListener('click', () => {
                resultadoDiv.innerHTML = `
                    <p>Sua ilustração aparecerá aqui</p>
                    <small>Preencha o formulário e clique em "Gerar Ilustração"</small>
                `;
            });
        });
    }
});