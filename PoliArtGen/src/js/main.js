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
                window.location.href = 'pag_login.html';
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

            // Log para debug
            console.log('📤 Dados capturados do formulário:', {
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
                localStorage.removeItem('userId');
                localStorage.removeItem('userTipo');
                window.location.href = "pag_login.html";
            }
        });
    }
});


// ===== FUNÇÃO DE GERAÇÃO COM API DIRETA =====

/**
 * Função que executa a geração chamando o api.js (VERSÃO BROWSER)
 */
async function executarGeracao(dadosFormulario, container, userId) {

    container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p style="margin-top: 15px;"><strong>🎨 Gerando ilustração...</strong></p>
            <small>A IA está processando seu pedido. Isso pode levar até 2 minutos.</small>
            <br><br>
            <div id="progress-info" style="font-size: 12px; color: #666; margin-top: 10px;">
                ⏳ Aguardando resposta da API...
            </div>
        </div>
    `;

    try {
        console.log('🚀 Iniciando geração com dados:', dadosFormulario);

        // Atualiza o status a cada 5 segundos
        const progressInfo = document.getElementById('progress-info');
        let segundos = 0;
        const interval = setInterval(() => {
            segundos += 5;
            if (progressInfo) {
                progressInfo.textContent = `⏳ Processando há ${segundos} segundos...`;
            }
        }, 5000);

        // Chama a função do api.js ATUALIZADA para gerar a imagem
        const imageBase64 = await gerarImagemAPI(
            dadosFormulario.materia,
            dadosFormulario.topico,      // tópico específico
            dadosFormulario.estilo,      // estilo da imagem
            dadosFormulario.nivel,       // nível educacional
            dadosFormulario.detalhes     // detalhes adicionais
        );

        clearInterval(interval);
        console.log('✅ Imagem gerada com sucesso!');

        // Agora salva no banco de dados (se você tiver backend)
        const dadosParaSalvar = {
            userId: userId,
            urlDaImagem: imageBase64,
            promptUtilizado: `${dadosFormulario.materia}, ${dadosFormulario.topico}, ${dadosFormulario.estilo}, ${dadosFormulario.detalhes}`,
            materia: dadosFormulario.materia,
            estilo: dadosFormulario.estilo,
            topicoEspecifico: dadosFormulario.topico,
            nivelEducacional: dadosFormulario.nivel,
            dataCriacao: new Date().toISOString()
        };

        console.log('💾 Salvando no banco:', dadosParaSalvar);

        // Tenta salvar no backend (se disponível)
        try {
            const responseSave = await fetch('/api/save-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaSalvar)
            });

            const dataSave = await responseSave.json();

            if (dataSave.success) {
                console.log('✅ Imagem salva no banco!');
                renderizarResultado(dataSave.image, container);
            } else {
                throw new Error('Erro ao salvar no banco');
            }
        } catch (saveError) {
            // Se não houver backend, mostra a imagem mesmo assim
            console.warn('⚠️ Backend indisponível. Mostrando imagem sem salvar:', saveError);
            renderizarResultado(dadosParaSalvar, container);
        }

    } catch (error) {
        console.error('💥 Erro na geração:', error);
        
        // Mensagens de erro específicas
        let mensagemErro = error.message;
        let sugestao = '';
        
        if (error.message.includes('Modelo carregando')) {
            sugestao = '⏰ O modelo está sendo carregado. Aguarde 20-30 segundos e tente novamente.';
        } else if (error.message.includes('Token inválido')) {
            sugestao = '🔑 Verifique se o token da API está correto no arquivo api.js';
        } else if (error.message.includes('Limite de requisições')) {
            sugestao = '⏸️ Você atingiu o limite. Aguarde alguns minutos antes de tentar novamente.';
        } else {
            sugestao = '🔄 Tente novamente em alguns instantes.';
        }
        
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc3545;">
                <p style="font-size: 48px;">⚠️</p>
                <p><strong>Erro na geração</strong></p>
                <p style="font-size: 14px; margin: 10px 0;">${mensagemErro}</p>
                <p style="font-size: 12px; color: #666; margin-bottom: 20px;">${sugestao}</p>
                <button onclick="location.reload()" class="btn btn-warning btn-sm">
                    🔄 Tentar Novamente
                </button>
            </div>
        `;
    }
}


/**
 * Função para renderizar o resultado da geração
 */
function renderizarResultado(imagemGerada, container) {
    const dataCriacao = imagemGerada.dataCriacao 
        ? new Date(imagemGerada.dataCriacao).toLocaleDateString('pt-BR')
        : new Date().toLocaleDateString('pt-BR');

    const imageId = imagemGerada._id || Date.now();

    container.innerHTML = `
        <div style="text-align: center;">
            <p class="mensagem-sucesso" style="color: #28a745; font-weight: bold; margin-bottom: 15px;">
                ✅ Imagem gerada com sucesso em ${dataCriacao}!
            </p>
            <img src="${imagemGerada.urlDaImagem}" 
                alt="Ilustração gerada" 
                id="imagem-resultado" 
                style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); margin-bottom: 15px;">
            
            <div style="text-align: left; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin: 5px 0;"><strong>📝 Prompt usado pela IA:</strong></p>
                <small style="color: #666; word-wrap: break-word;">${imagemGerada.promptUtilizado}</small>
                <p style="margin: 10px 0 5px 0;"><strong>🎨 Estilo:</strong> ${imagemGerada.estilo}</p>
                <p style="margin: 5px 0;"><strong>📚 Matéria:</strong> ${imagemGerada.materia}</p>
                <p style="margin: 5px 0;"><strong>🎯 Tópico:</strong> ${imagemGerada.topicoEspecifico}</p>
                <p style="margin: 5px 0;"><strong>🎓 Nível:</strong> ${imagemGerada.nivelEducacional}</p>
            </div>
            
            <div class="download-buttons" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button onclick="baixarImagemLocal('${imagemGerada.urlDaImagem}', 'ilustracao_${imageId}.png')" 
                        class="btn btn-primary">
                    📥 Baixar PNG
                </button>
                <button onclick="baixarImagemLocal('${imagemGerada.urlDaImagem}', 'ilustracao_${imageId}.jpg')" 
                        class="btn btn-secondary">
                    📥 Baixar JPEG
                </button>
                <button onclick="compartilharImagem('${imagemGerada.urlDaImagem}')" 
                        class="btn btn-success">
                    📤 Compartilhar
                </button>
            </div>
        </div>
    `;
}


/**
 * Função para baixar a imagem localmente (base64)
 */
function baixarImagemLocal(base64Data, filename) {
    try {
        const link = document.createElement('a');
        link.href = base64Data;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('💾 Download iniciado:', filename);
        alert(`✅ Download iniciado: ${filename}`);
    } catch (error) {
        console.error('Erro ao baixar:', error);
        alert('❌ Erro ao baixar a imagem. Tente com o botão direito > Salvar imagem.');
    }
}


/**
 * Função para compartilhar a imagem (Web Share API)
 */
async function compartilharImagem(imageUrl) {
    try {
        // Converte base64 para blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'ilustracao_poliartgen.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'Ilustração PoliArtGen',
                text: 'Confira essa ilustração educacional que eu criei!',
                files: [file]
            });
            console.log('✅ Imagem compartilhada com sucesso!');
        } else {
            // Fallback: copia o link
            alert('📋 Compartilhamento não disponível. Use os botões de download.');
        }
    } catch (error) {
        console.error('Erro ao compartilhar:', error);
        alert('❌ Erro ao compartilhar. Use os botões de download.');
    }
}


/**
 * Função alternativa para baixar com conversão de formato
 */
function baixarImagem(imageUrl, filename, format) {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '⏳ Processando...';
    btn.disabled = true;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;

        if (format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const quality = format === 'jpeg' ? 0.95 : undefined;

        canvas.toBlob(function (blob) {
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

            alert(`✅ Imagem baixada como ${format.toUpperCase()}!`);
        }, mimeType, quality);
    };

    img.onerror = function () {
        console.warn('Não foi possível converter. Tentando download direto...');

        // Fallback para base64
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        btn.textContent = originalText;
        btn.disabled = false;
        alert(`✅ Download iniciado!`);
    };

    img.src = imageUrl;
}