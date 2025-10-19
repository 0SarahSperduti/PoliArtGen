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
        <img src="${imagemGerada.urlDaImagem}" alt="Ilustração gerada" id="imagem-resultado" crossorigin="anonymous">
        <p><strong>Prompt Salvo:</strong> ${imagemGerada.promptUtilizado}</p>
        <p><strong>Estilo:</strong> ${imagemGerada.estilo}</p>
        <div class="download-buttons">
            <button onclick="baixarImagem('${imagemGerada.urlDaImagem}', 'ilustracao_${imagemGerada._id}.png', 'png')" class="btn btn-primary mt-2">
                📥 Baixar PNG
            </button>
            <button onclick="baixarImagem('${imagemGerada.urlDaImagem}', 'ilustracao_${imagemGerada._id}.jpg', 'jpeg')" class="btn btn-secondary mt-2">
                📥 Baixar JPEG
            </button>
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
    const originalText = event.target.textContent;
    event.target.textContent = '⏳ Processando...';
    event.target.disabled = true;

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
            event.target.textContent = originalText;
            event.target.disabled = false;
            
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
                
                event.target.textContent = originalText;
                event.target.disabled = false;
                alert(`✅ Imagem baixada com sucesso!`);
            })
            .catch(error => {
                console.error('Erro no download:', error);
                alert('❌ Erro ao baixar a imagem. Tente novamente.');
                event.target.textContent = originalText;
                event.target.disabled = false;
            });
    };
    
    // Inicia o carregamento da imagem
    img.src = imageUrl;
}

app.post('/api/profile/update', async (req, res) => {
    const { userId, nome, email } = req.body;

    if (!userId || !nome || !email) {
        return res.status(400).json({ success: false, message: 'Dados incompletos.' });
    }
    
    try {
        const updatedUser = await User.updateProfileData(userId, nome, email);
        return res.status(200).json({ success: true, message: 'Dados atualizados com sucesso!', user: updatedUser });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return res.status(500).json({ success: false, message: error.message || 'Falha ao atualizar dados.' });
    }
});

app.post('/api/password/update', async (req, res) => {
    const { userId, senhaAtual, novaSenha } = req.body;

    if (!userId || !senhaAtual || !novaSenha) {
        return res.status(400).json({ success: false, message: 'Todos os campos de senha são obrigatórios.' });
    }

    try {
        await User.updatePassword(userId, senhaAtual, novaSenha);
        return res.status(200).json({ success: true, message: 'Senha alterada com sucesso!' });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        // Retorna 401 (Não Autorizado) se a senha atual estiver incorreta
        return res.status(401).json({ success: false, message: error.message || 'Falha ao alterar senha.' });
    }
});