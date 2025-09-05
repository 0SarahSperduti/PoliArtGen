const axios = require('axios');

// Suas chaves e URLs
const OPENROUTER_API_KEY = "<SUA_CHAVE_DE_API_OPENROUTER>"; // (Estou procurando uma API)
const YOUR_SITE_URL = "<URL_DO_SITE>";                  
const YOUR_SITE_NAME = "<NOME_DO_SITE>";                

// URL da API do OpenRouter
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Dados da requisição para gerar uma imagem
const payload = {
    // Escolha um modelo de geração de imagens do OpenRouter
    model: "stabilityai/stable-diffusion-xl", 
    messages: [
        {
            role: "user",
            content: "A painting of a futuristic cityscape at night, with flying cars and neon lights." // Descreva a imagem que queremos gerar aqui.
        }
    ]
};

// Faz a chamada à API
axios.post(OPENROUTER_API_URL, payload, {
    headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': YOUR_SITE_URL, 
        'X-Title': YOUR_SITE_NAME      
    }
})
.then(response => {
    // A resposta conterá uma URL da imagem gerada.
    // O formato da resposta pode variar dependendo do modelo.
    // É comum que a URL esteja em uma estrutura aninhada, como abaixo.
    // Verifique a documentação do modelo escolhido para a estrutura exata.
    console.log("Imagem gerada (URL):", response.data.choices[0].message.content);
})
.catch(error => {
    // Trata erros
    console.error('Erro na chamada à API:', error.response ? error.response.data : error.message);
});