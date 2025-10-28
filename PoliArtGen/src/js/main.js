// main.js - Lógica principal para a tela de Gerador (pag_principal.html)

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

            // Coleta TODOS os dados do formulário
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

            // Log para debug - mostra o que será enviado
            console.log('📤 Dados capturados do formulário:');
            console.log({
                userId,
                materia: dados.materia,
                estilo: dados.estilo,
                topicoEspecifico: dados.topico,
                nivelEducacional: dados.nivel,
                detalhesAdicionais: dados.detalhes || '(nenhum)'
            });

            // Mostra a confirmação antes de enviar
            const confirmacaoHtml = `
                <div class="confirmacao-geracao">
                    <h4>Confirme sua Geração</h4>
                    <p><strong>Matéria:</strong> ${dados.materia}</p>
                    <p><strong>Estilo:</strong> ${dados.estilo}</p>
                    <p><strong>Tópico:</strong> ${dados.topico}</p>
                    <p><strong>Nível:</strong> ${dados.nivel}</p>
                    <p><strong>Detalhes:</strong> ${dados.detalhes || 'Nenhum'}</p>
                    <div class="botoes-confirmacao">
                        <button id="btn-confirmar-geracao" class="btn-confirmar">✅ Confirmar e Gerar</button>
                        <button id="btn-cancelar-geracao" class="btn-cancelar">❌ Cancelar</button>
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
    
    // Adiciona preview dos dados enquanto o usuário digita
    if (inputTopico) {
        inputTopico.addEventListener('input', (e) => {
            const topico = e.target.value;
            if (topico.length > 3) {
                console.log('💡 Tópico digitado:', topico);
            }
        });
    }

    if (inputDetalhes) {
        inputDetalhes.addEventListener('input', (e) => {
            const detalhes = e.target.value;
            if (detalhes.length > 10) {
                console.log('📝 Detalhes adicionados:', detalhes);
            }
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


// ===== FUNÇÃO DE INTEGRAÇÃO COM O BACKEND =====

/**
 * Função que executa o FETCH e salva no MongoDB
 * Envia TODOS os campos do formulário para a IA processar
 */
function executarGeracao(dadosFormulario, container, userId) {
    
    container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p style="margin-top: 15px;"><strong>🎨 Gerando ilustração...</strong></p>
            <small>A IA está processando seu pedido. Isso pode levar até 2 minutos.</small>
        </div>
    `;
    
    // Prepara o pacote de dados para o nosso backend Node.js
    // IMPORTANTE: Envia todos os campos para a IA entender o contexto completo
    const dadosParaBackend = {
        userId: userId, 
        materia: dadosFormulario.materia,
        estilo: dadosFormulario.estilo,
        topicoEspecifico: dadosFormulario.topico,
        nivelEducacional: dadosFormulario.nivel,
        detalhesAdicionais: dadosFormulario.detalhes
    };
    
    console.log('🚀 Enviando para a API:', dadosParaBackend);
    
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
        return response.json().then(error => { 
            throw new Error(error.message || 'Erro de servidor.'); 
        });
    })
    .then(data => {
        // Renderiza o resultado
        if (data.success) {
            console.log('✅ Sucesso! Dados recebidos:', data);
            renderizarResultado(data.image, container); 
            console.log("Ilustração salva no histórico e exibida.");
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #dc3545;">
                    <p style="font-size: 48px;">⚠️</p>
                    <p><strong>Erro na geração</strong></p>
                    <small>${data.message}</small>
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('❌ Erro de Comunicação/Servidor:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc3545;">
                <p style="font-size: 48px;">⚠️</p>
                <p><strong>Falha na comunicação</strong></p>
                <small>${error.message}</small>
                <br><br>
                <button onclick="location.reload()" class="btn btn-warning btn-sm">
                    🔄 Tentar Novamente
                </button>
            </div>
        `;
    });
}


/**
 * Função para renderizar o resultado da geração
 * Exibe a imagem e informações sobre o prompt usado
 */
function renderizarResultado(imagemGerada, container) {
    const dataCriacao = new Date(imagemGerada.dataCriacao).toLocaleDateString('pt-BR');

    container.innerHTML = `
        <div style="text-align: center;">
            <p class="mensagem-sucesso" style="color: #28a745; font-weight: bold; margin-bottom: 15px;">
                ✅ Imagem gerada e salva no histórico em ${dataCriacao}!
            </p>
            <img src="${imagemGerada.urlDaImagem}" 
                 alt="Ilustração gerada" 
                 id="imagem-resultado" 
                 crossorigin="anonymous"
                 style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); margin-bottom: 15px;">
            
            <div style="text-align: left; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin: 5px 0;"><strong>📝 Prompt usado pela IA:</strong></p>
                <small style="color: #666; word-wrap: break-word;">${imagemGerada.promptUtilizado}</small>
                <p style="margin: 10px 0 5px 0;"><strong>🎨 Estilo:</strong> ${imagemGerada.estilo}</p>
                <p style="margin: 5px 0;"><strong>📚 Matéria:</strong> ${imagemGerada.materia}</p>
                <p style="margin: 5px 0;"><strong>🎯 Tópico:</strong> ${imagemGerada.topicoEspecifico}</p>
                <p style="margin: 5px 0;"><strong>🎓 Nível:</strong> ${imagemGerada.nivelEducacional}</p>
            </div>
            
            <div class="download-buttons" style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="baixarImagem('${imagemGerada.urlDaImagem}', 'ilustracao_${imagemGerada._id}.png', 'png')" 
                        class="btn btn-primary">
                    📥 Baixar PNG
                </button>
                <button onclick="baixarImagem('${imagemGerada.urlDaImagem}', 'ilustracao_${imagemGerada._id}.jpg', 'jpeg')" 
                        class="btn btn-secondary">
                    📥 Baixar JPEG
                </button>
            </div>
        </div>
    `;
}


/**
 * Função para baixar a imagem em PNG ou JPEG
 * @param {string} imageUrl - URL da imagem
 * @param {string} filename - Nome do arquivo para download
 * @param {string} format - Formato: 'png' ou 'jpeg'
 */
function baixarImagem(imageUrl, filename, format) {
    // Mostra feedback visual
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '⏳ Processando...';
    btn.disabled = true;

    // Cria um canvas para converter a imagem
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Importante: permite carregar imagens de outros domínios
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        // Define o tamanho do canvas igual à imagem
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Se for JPEG, preenche o fundo com branco (JPEG não suporta transparência)
        if (format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Desenha a imagem no canvas
        ctx.drawImage(img, 0, 0);
        
        // Converte para o formato desejado
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const quality = format === 'jpeg' ? 0.95 : undefined; // Qualidade para JPEG
        
        canvas.toBlob(function(blob) {
            // Cria um link temporário para download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            
            // Simula o clique no link
            document.body.appendChild(link);
            link.click();
            
            // Limpa
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            // Restaura o botão
            btn.textContent = originalText;
            btn.disabled = false;
            
            // Feedback de sucesso
            alert(`✅ Imagem baixada com sucesso como ${format.toUpperCase()}!`);
        }, mimeType, quality);
    };
    
    img.onerror = function() {
        // Se falhar ao carregar (CORS ou outro erro), tenta download direto
        console.warn('Não foi possível converter a imagem. Tentando download direto...');
        
        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                btn.textContent = originalText;
                btn.disabled = false;
                alert(`✅ Imagem baixada com sucesso!`);
            })
            .catch(error => {
                console.error('Erro no download:', error);
                alert('❌ Erro ao baixar a imagem. Tente novamente.');
                btn.textContent = originalText;
                btn.disabled = false;
            });
    };
    
    // Inicia o carregamento da imagem
    img.src = imageUrl;
}