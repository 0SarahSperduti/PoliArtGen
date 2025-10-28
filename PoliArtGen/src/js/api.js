// ============================================
// 🌐 CONFIGURAÇÃO
// ============================================

const CONFIG = {
  API_EM_USO: 'huggingface',
  huggingface: {
    apiKey: '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',
    endpoint: 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
    model: 'black-forest-labs/FLUX.1-schnell'
  },
};

function verificarConfiguracao() {
  const apiAtual = CONFIG[CONFIG.API_EM_USO];

  if (!apiAtual) throw new Error(`❌ API "${CONFIG.API_EM_USO}" não encontrada.`);
  if (!apiAtual.apiKey || apiAtual.apiKey === 'SEU_TOKEN_AQUI')
    throw new Error('⚠️ Cole seu token Hugging Face no arquivo config.js!');
  if (!apiAtual.apiKey.startsWith('hf_'))
    throw new Error('❌ Token inválido! Deve começar com "hf_".');

  console.log('✅ Configuração válida!');
  return true;
}

// ============================================
// 🧠 PROMPT
// ============================================

function criarPrompt(materia, conteudo, estilo, infoAdicional) {
  const prompts = {
    quimica: {
      'tabela-periódica': 'periodic table of elements with colorful boxes, scientific poster style',
      'reações-químicas': 'chemical reaction diagram showing molecular bonds and atoms',
      'ligação-covalente': 'covalent bond diagram with atoms sharing electrons, molecular structure'
    },
    fisica: {
      'resistores': 'electrical resistors in circuit diagram, electronic components illustration',
      'capacitores': 'capacitors in electrical circuit, electronic schematic',
      'geradores': 'electrical generator cross-section diagram, physics illustration',
      'blocos': 'physics blocks on surface with force arrows and vectors',
      'plano-inclinado': 'inclined plane with object, force vectors diagram, physics',
      'roldanas': 'pulley system with ropes and weights, mechanical advantage diagram'
    }
  };

  const estiloMap = {
    'molecular': 'molecular 3D visualization style, scientific rendering',
    '3d': '3D realistic style, professional illustration',
    'esquemático': 'schematic technical drawing style, clean lines',
    'minimalista': 'minimalist design, simple and clean, modern'
  };

  let prompt = prompts[materia]?.[conteudo] || `${materia} ${conteudo} educational illustration`;

  if (estilo && estiloMap[estilo]) prompt += `, ${estiloMap[estilo]}`;
  if (infoAdicional && infoAdicional.trim()) prompt += `, ${infoAdicional}`;

  prompt += ', high quality, detailed, educational content, professional, white background';
  return prompt;
}

// ============================================
// 🎨 GERAÇÃO DE IMAGEM (via servidor Express)
// ============================================

async function gerarImagemAPI(materia, conteudo, estilo, infoAdicional) {
  const startTime = Date.now();

  try {
    verificarConfiguracao();

    const prompt = criarPrompt(materia, conteudo, estilo, infoAdicional);
    console.log('📝 Prompt enviado:', prompt);

    console.log('⏳ Enviando requisição ao servidor...');
    const response = await fetch('./src/js/pag_principal.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materia, conteudo, estilo, infoAdicional })
    });

    // 💡 Corrigido: Verificar tipo de resposta ANTES de tentar converter
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', response.status, errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    if (contentType.includes('application/json')) {
      // ✅ Backend retornou JSON (esperado)
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Erro ao gerar imagem.');
      console.log('✅ Imagem recebida do servidor.');
      return data.image;
    } else {
      // ⚠️ Backend retornou HTML (erro provável)
      const text = await response.text();
      console.error('❌ Resposta inesperada do servidor:', text.slice(0, 200));
      throw new Error('Falha na comunicação com o servidor. Verifique se o back-end está rodando.');
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('💥 Erro completo:', error);

    await logGeneration({
      materia, conteudo, estilo,
      status: 'error',
      message: error.message,
      duration
    });

    throw error;
  }
}

// ============================================
// 📊 SISTEMA DE LOGS
// ============================================

async function logGeneration(data) {
  try {
    let logs = [];
    try {
      const result = await window.storage.get('pictura-logs');
      if (result) logs = JSON.parse(result.value);
    } catch (e) {}

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      timestampBR: new Date().toLocaleString('pt-BR'),
      ...data
    };

    logs.unshift(newLog);
    if (logs.length > 100) logs = logs.slice(0, 100);

    await window.storage.set('pictura-logs', JSON.stringify(logs));
    console.log('📊 Log registrado');
  } catch (error) {
    console.warn('Não foi possível salvar log:', error);
  }
}

// ============================================
// 📋 EVENTOS DO FORMULÁRIO
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('picturaForm');
  if (!form) {
    console.error('❌ Formulário não encontrado! ID deve ser "picturaForm".');
    return;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const materia = document.getElementById('opcoes-materia')?.value;
    const conteudo = document.getElementById('conteudo')?.value;
    const estilo = document.getElementById('estilo-imagem')?.value;
    const infoAdicional = document.getElementById('info-adicional')?.value || '';

    if (!materia || !conteudo || !estilo) {
      alert('❌ Preencha todos os campos obrigatórios: Matéria, Conteúdo e Estilo.');
      return;
    }

    const btnEnviar = document.querySelector('.btn-enviar');
    if (!btnEnviar) return;

    const textoOriginal = btnEnviar.textContent;
    btnEnviar.disabled = true;
    btnEnviar.textContent = '⏳ Gerando...';

    try {
      if (typeof openPopup === 'function') openPopup('', materia, conteudo, estilo);

      console.log('🚀 Iniciando geração...');
      const imageUrl = await gerarImagemAPI(materia, conteudo, estilo, infoAdicional);

      const generatedImage = document.getElementById('generatedImage');
      const loadingContainer = document.getElementById('loadingContainer');
      const imageResultContainer = document.getElementById('imageResultContainer');

      if (generatedImage && loadingContainer && imageResultContainer) {
        generatedImage.src = imageUrl;
        loadingContainer.style.display = 'none';
        imageResultContainer.classList.add('active');
      }

    } catch (error) {
      console.error('💥 Erro ao gerar:', error);
      if (typeof closePopup === 'function') closePopup();
      alert(error.message);
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.textContent = textoOriginal;
    }
  });

  console.log('✅ Sistema carregado! Preencha o formulário e clique em enviar.');
});