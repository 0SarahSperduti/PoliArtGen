document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("historico-content");
    
    // obter id do usuário logado
    const userIdLogado = localStorage.getItem('userId');

    if (userIdLogado) {
        // Se o ID for encontrado, buscar os dados no backend
        fetchHistoricoDoBackend(container, userIdLogado);
    } else {
        // Se o ID não for encontrado, o usuário não está logado
        container.innerHTML = `<p class="alert alert-warning text-center">Você precisa estar logado para ver o histórico. <a href="pag_login.html">Faça login.</a></p>`;
        // Você pode redirecionar o usuário aqui se quiser forçar o login
        // window.location.href = "pag_login.html"; 
    }
    
    // Oculta/Exibe elementos que controlam o estado vazio do seu HTML
    const historicoVazio = document.getElementById("historico-vazio");
    if (historicoVazio) { historicoVazio.style.display = "none"; }
});


async function fetchHistoricoDoBackend(container, userId) {
    // Mostra um estado de carregamento enquanto aguarda a API
    container.innerHTML = '<p class="text-center">Carregando histórico...</p>';

    try {
        // 1. CHAMA A ROTA DA API (usando o ID dinâmico)
        const response = await fetch(`/api/history/${userId}`);
        const data = await response.json();

        if (data.success && data.history) {
            const historico = data.history;

            if (historico.length === 0) {
                renderizarVazio(container);
            } else {
                renderizarHistorico(historico, container);
            }
        } else {
            // Se o backend falhar (ex: data.success é false)
            container.innerHTML = `<p class="text-danger">Erro ao carregar o histórico: ${data.message || 'Falha desconhecida.'}</p>`;
        }

    } catch (error) {
        console.error('Erro de rede ou na API de Histórico:', error);
        container.innerHTML = `<p class="text-danger">Falha na comunicação com o servidor.</p>`;
    }
}


// --- FUNÇÕES DE RENDERIZAÇÃO ---

// Função para mostrar o estado vazio
function renderizarVazio(container) {
    container.innerHTML = `
        <div class="historico-box">
            <div class="historico-icon">
                <img src="src/img/icone-placeholder.png" alt="Nenhuma ilustração">
            </div>
            <p class="historico-info">Nenhuma ilustração ainda</p>
            <p class="historico-instrucao">Comece criando sua primeira ilustração no gerador</p>
            <a href="pag_principal.html" class="historico-btn">Ir para o Gerador</a>
        </div>
    `;
}


// Função para renderizar os itens do histórico (usando seus dados do MongoDB)
function renderizarHistorico(historico, container) {
    let html = `
        <div class="historico-grid">
            ${historico.map(item => {
                // Formata a data de criação do MongoDB
                const data = new Date(item.dataCriacao).toLocaleDateString('pt-BR');
                
                // Constrói o prompt com base nos campos salvos no MongoDB
                const promptDetalhes = `${item.materia || 'Geral'} | ${item.estilo || 'N/A'} | ${item.nivelEducacional || 'N/A'}`;

                return `
                    <div class="historico-item">
                        <img src="${item.urlDaImagem}" alt="Ilustração gerada">
                        <p><strong>Prompt:</strong> ${item.promptUtilizado}</p>
                        <p><strong>Detalhes:</strong> ${promptDetalhes}</p>
                        <p><small>${data}</small></p>
                        </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = html;
}