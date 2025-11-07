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
                <img src="src/img/icon_no_image.png" alt="Nenhuma ilustração">
            </div>
            <p class="historico-info">Nenhuma ilustração ainda</p>
            <p class="historico-instrucao">Comece criando sua primeira ilustração no gerador</p>
            <a href="pag_principal.html" class="historico-btn">Ir para o Gerador</a>
        </div>
    `;
}


// Função para renderizar os itens do histórico (usando seus dados do MongoDB)
function renderizarHistorico(historico, container) {
    let html = '<div class="row g-3" id="historico-grid">';
    
    historico.forEach(item => {
        // Formata a data de criação do MongoDB
        const data = new Date(item.dataCriacao).toLocaleDateString('pt-BR');
        
        // Monta o prompt resumido apenas com matéria e tópico (sem descrição detalhada)
        const materia = item.materia || 'Geral';
        const topico = item.topico || item.estilo || 'Sem tópico';
        const promptResumido = `${materia} - ${topico}`;

        html += `
            <div class="col-12 col-sm-6 col-lg-4 col-xl-3" data-id="${item._id}">
                <div class="historico-card h-100">
                    <button class="btn-excluir" onclick="excluirImagem('${item._id}')" title="Excluir imagem">
                        ×
                    </button>
                    <div class="historico-card-img-wrapper">
                        <img src="${item.urlDaImagem}" alt="Ilustração gerada" class="img-fluid w-100">
                    </div>
                    <div class="historico-card-info">
                        <p class="historico-card-titulo">${promptResumido}</p>
                        <p class="historico-card-data">Gerado em: ${data}</p>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}


// --- FUNÇÃO DE EXCLUSÃO ---

async function excluirImagem(imagemId) {
    // Confirmação antes de excluir
    if (!confirm('Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.')) {
        return;
    }

    const userIdLogado = localStorage.getItem('userId');
    
    if (!userIdLogado) {
        alert('Você precisa estar logado para excluir imagens.');
        return;
    }

    try {
        // Chama a API para excluir a imagem do banco de dados
        const response = await fetch(`/api/history/${userIdLogado}/${imagemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            // Remove o card visualmente da página
            const cardElement = document.querySelector(`[data-id="${imagemId}"]`);
            if (cardElement) {
                // Animação de fade out antes de remover
                cardElement.style.transition = 'opacity 0.3s ease';
                cardElement.style.opacity = '0';
                
                setTimeout(() => {
                    cardElement.remove();
                    
                    // Verifica se ainda existem cards
                    const historicoGrid = document.getElementById('historico-grid');
                    const remainingCards = historicoGrid.querySelectorAll('[data-id]');
                    
                    if (remainingCards.length === 0) {
                        // Se não há mais cards, mostra o estado vazio
                        const container = document.getElementById("historico-content");
                        renderizarVazio(container);
                    }
                }, 300);
            }

            // Mensagem de sucesso
            alert('Imagem excluída com sucesso!');
        } else {
            alert(`Erro ao excluir imagem: ${data.message || 'Falha desconhecida'}`);
        }

    } catch (error) {
        console.error('Erro ao excluir imagem:', error);
        alert('Falha na comunicação com o servidor. Tente novamente.');
    }
}

// Torna a função excluirImagem acessível globalmente
window.excluirImagem = excluirImagem;