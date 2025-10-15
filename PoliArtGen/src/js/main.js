// Lógica principal para a tela de Gerador (pag_principal.html)

document.addEventListener("DOMContentLoaded", () => {
    // Pega o ID do usuário logado do localStorage
    const userId = localStorage.getItem('userId');

    const formGerador = document.getElementById("formPrincipal");
    const resultadoDiv = document.getElementById("preview-img");
    const logoutBtn = document.querySelector(".logout");
    
    // Define os IDs exatos dos campos de entrada
    const inputMateria = document.getElementById("materia");
    const inputEstilo = document.getElementById("estilo");
    const inputTopico = document.getElementById("topico");
    const inputNivel = document.getElementById("nivel");
    const inputDetalhes = document.getElementById("detalhes");

    // Lógica para o formulário de geração
    if (formGerador) {
        formGerador.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!userId) {
                alert('Você precisa estar logado para gerar ilustrações.');
                window.location.href = 'pag_login.html'; // Redireciona
                return;
            }

            // Coleta os dados do formulário
            const dados = {
                materia: inputMateria.value,
                estilo: inputEstilo.value,
                topico: inputTopico.value.trim(),
                nivel: inputNivel.value,
                detalhes: inputDetalhes.value.trim()
            };
            
            // Validação mínima
            if (!dados.topico) {
                alert("Por favor, insira um tópico específico!");
                return;
            }

            // mostra a confirmação antes de enviar
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

            // Anexar event listeners aos botões de confirmação/cancelamento
            document.getElementById('btn-confirmar-geracao').addEventListener('click', () => {
                // Chama a função principal de API com os dados coletados
                executarGeracao(dados, resultadoDiv, userId);
            });

            document.getElementById('btn-cancelar-geracao').addEventListener('click', () => {
                resultadoDiv.innerHTML = `
                    <p>Sua ilustração aparecerá aqui</p>
                    <small>Preencha o formulário e clique em "Gerar Ilustração"</small>
                `;
            });
        });
    }
    
    

    // Lógica de logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const confirmar = confirm("Deseja realmente sair?");
            if (confirmar) {
                localStorage.removeItem('userId'); // Limpa a sessão
                localStorage.removeItem('userTipo'); 
                window.location.href = "pag_login.html";
            }
        });
    }
});


// Função de integração com o backend 

// Função que executa o FETCH e salva no MongoDB
function executarGeracao(dadosFormulario, container, userId) {
    
    container.innerHTML = '<p><strong>Gerando ilustração...</strong></p><div class="loading"></div>';
    
    // Prepara o pacote de dados para o nosso backend Node.js
    const dadosParaBackend = {
        userId: userId, 
        materia: dadosFormulario.materia,
        estilo: dadosFormulario.estilo,
        topicoEspecifico: dadosFormulario.topico,
        nivelEducacional: dadosFormulario.nivel,
        detalhesAdicionais: dadosFormulario.detalhes
    };
    
    // Faz a chamada para a rota que salva no MongoDB
    fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParaBackend)
    })
    .then(response => {
        if (response.ok) {
            return response.json(); 
        }
        return response.json().then(error => { throw new Error(error.message || 'Erro de servidor.'); });
    })
    .then(data => {
        // Renderiza o resultado
        if (data.success) {
            renderizarResultado(data.image, container); 
            console.log("Ilustração salva no histórico e exibida.");
        } else {
            container.innerHTML = `<p class="text-danger">❌ Erro na geração: ${data.message}</p>`;
        }
    })
    .catch(error => {
        console.error('Erro de Comunicação/Servidor:', error);
        container.innerHTML = `<p class="text-danger">Falha na comunicação: ${error.message}</p>`;
    });
}


// Função para renderizar o resultado da geração
function renderizarResultado(imagemGerada, container) {
    const dataCriacao = new Date(imagemGerada.dataCriacao).toLocaleDateString('pt-BR');

    container.innerHTML = `
        <p class="mensagem-sucesso">✅ Imagem gerada e salva no histórico em ${dataCriacao}!</p>
        <img src="${imagemGerada.urlDaImagem}" alt="Ilustração gerada">
        <p><strong>Prompt Salvo:</strong> ${imagemGerada.promptUtilizado}</p>
        <p><strong>Estilo:</strong> ${imagemGerada.estilo}</p>
        <a href="${imagemGerada.urlDaImagem}" download="ilustracao_${imagemGerada._id}.png" class="btn btn-primary mt-2">Baixar Imagem</a>
    `;
}