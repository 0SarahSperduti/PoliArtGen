// ============================================
// 🌐 CONFIGURAÇÃO
// ============================================

const CONFIG = {
  API_TOKEN: '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', 
  MODEL_URL: 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
  TIMEOUT: 60000 // 60 segundos
};

function verificarConfiguracao() {
  if (!CONFIG.API_TOKEN || CONFIG.API_TOKEN === 'SEU_TOKEN_AQUI') {
    throw new Error('⚠️ Cole seu token Hugging Face no arquivo api.js!');
  }
  if (!CONFIG.API_TOKEN.startsWith('hf_')) {
    throw new Error('❌ Token inválido! Deve começar com "hf_".');
  }
  console.log('✅ Configuração válida!');
  return true;
}

// ============================================
// 🧠 PROMPT BUILDER
// ============================================

function criarPrompt(materia, topico, estilo, nivel, detalhes) {
  const estiloMap = {
    'realista': 'photorealistic, detailed, high quality',
    'cartoon': 'cartoon style, colorful, fun illustration',
    'minimalista': 'minimalist design, simple and clean, modern',
    'esquemático': 'schematic technical drawing, clean lines, diagram',
    '3d': '3D rendering, professional illustration, realistic lighting'
  };

  const nivelMap = {
    'ensino fundamental i': 'simple, easy to understand, colorful',
    'ensino fundamental ii': 'educational, clear, informative',
    'ensino médio': 'detailed, academic, professional'
  };

  // Monta o prompt base
  let prompt = `educational illustration about ${topico || materia}`;
  
  // Adiciona estilo
  if (estilo && estiloMap[estilo.toLowerCase()]) {
    prompt += `, ${estiloMap[estilo.toLowerCase()]}`;
  }
  
  // Adiciona nível educacional
  if (nivel && nivelMap[nivel.toLowerCase()]) {
    prompt += `, ${nivelMap[nivel.toLowerCase()]}`;
  }
  
  // Adiciona detalhes personalizados
  if (detalhes && detalhes.trim()) {
    prompt += `, ${detalhes.trim()}`;
  }
  
  // Finaliza com qualidade
  prompt += ', high quality, professional, white background, educational content';
  
  return prompt;
}

// ============================================
// 🎨 GERAÇÃO DE IMAGEM
// ============================================

async function gerarImagemAPI(materia, topico, estilo, nivel, detalhes) {
  const startTime = Date.now();
  
  try {
    verificarConfiguracao();
    
    const prompt = criarPrompt(materia, topico, estilo, nivel, detalhes);
    console.log('🔍 Prompt enviado:', prompt);
    console.log('⏳ Gerando imagem...');
    
    // Chama a API do Hugging Face
    const response = await fetch(CONFIG.MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        inputs: prompt,
        options: {
          wait_for_model: true
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', response.status, errorText);
      
      // Tratamento de erros específicos
      if (response.status === 503) {
        throw new Error('Modelo carregando. Aguarde 20 segundos e tente novamente.');
      } else if (response.status === 401) {
        throw new Error('Token inválido! Verifique sua API key.');
      } else if (response.status === 429) {
        throw new Error('Limite de requisições atingido. Aguarde alguns minutos.');
      } else {
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    }
    
    // Converte a resposta para blob e depois para base64
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Imagem gerada em ${duration}ms`);
    
    // Registra log de sucesso
    await logGeneration({
      materia,
      topico,
      estilo,
      nivel,
      prompt,
      status: 'success',
      duration
    });
    
    return base64;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('💥 Erro completo:', error);
    
    await logGeneration({
      materia,
      topico,
      estilo,
      nivel,
      status: 'error',
      message: error.message,
      duration
    });
    
    throw error;
  }
}

// ============================================
// 🔧 FUNÇÃO AUXILIAR - BLOB TO BASE64
// ============================================

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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
    } catch (e) {
      // Storage não disponível ou chave não existe
      console.warn('Storage não disponível:', e);
    }
    
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
// 📥 FUNÇÃO PARA BAIXAR IMAGEM
// ============================================

function baixarImagem(base64Data, filename = 'ilustracao_poliartgen.png') {
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log('💾 Download iniciado');
}

console.log('✅ API.js carregado! Pronto para gerar imagens.');