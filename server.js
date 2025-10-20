const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser'); 
const connectDB = require('./PoliArtGen/src/js/db_connector'); 
const path = require('path');
const User = require('./PoliArtGen/src/js/userModel');
const FRONTEND_ROOT = path.join(__dirname, 'PoliArtGen');
const SRC_ROOT = path.join(FRONTEND_ROOT, 'src');
const Image = require('./PoliArtGen/src/js/imageModel');
const FormData = require('form-data');
const axios = require('axios');

// ===== CONFIGURAÇÃO DA API DE IA =====
require('dotenv').config();

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(FRONTEND_ROOT));
app.use('/src', express.static(SRC_ROOT));

// Conecta ao banco de dados 
connectDB(); 

// ===== FUNÇÃO PARA GERAR IMAGEM COM STABILITY AI (SD3 - MAIS RÁPIDO) =====
async function gerarImagemStability(prompt) {
    console.log('🎨 Gerando imagem com Stability AI SD3...');
    console.log('📝 Prompt:', prompt);

    try {
        // Prepara os dados no formato FormData
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('output_format', 'png'); // ou 'jpeg' se preferir
        formData.append('aspect_ratio', '1:1'); // Proporção 1:1 (quadrada)
        formData.append('model', 'sd3'); // Modelo SD3

        // Faz a requisição para a API v2beta (mais rápida)
        const response = await axios.post(
            'https://api.stability.ai/v2beta/stable-image/generate/sd3',
            formData,
            {
                validateStatus: undefined,
                responseType: 'arraybuffer',
                headers: { 
                    Authorization: `Bearer ${STABILITY_API_KEY}`,
                    Accept: 'image/*',
                    ...formData.getHeaders()
                },
            }
        );

        if (response.status === 200) {
            // Converte o buffer da imagem para Base64
            const base64Image = Buffer.from(response.data).toString('base64');
            const imageUrl = `data:image/png;base64,${base64Image}`;
            
            console.log('✅ Imagem gerada com sucesso!');
            return imageUrl;
        } else {
            const errorText = Buffer.from(response.data).toString('utf-8');
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

    } catch (error) {
        console.error('❌ Erro ao gerar imagem:', error.message);
        
        // Mensagens de erro mais específicas
        if (error.response) {
            const status = error.response.status;
            if (status === 402) {
                throw new Error('Créditos insuficientes na conta Stability AI');
            } else if (status === 401) {
                throw new Error('Chave API inválida ou expirada');
            } else if (status === 429) {
                throw new Error('Limite de requisições atingido. Aguarde alguns minutos');
            }
        }
        throw error;
    }
}

/**
 * Constrói o prompt otimizado para geração de imagem educacional
 */
function construirPromptEducacional(dados) {
    const { materia, estilo, topicoEspecifico, nivelEducacional, detalhesAdicionais } = dados;
    
    // Mapeia estilos para descrições mais precisas
    const estilosMap = {
        'Realista': 'photorealistic, highly detailed, educational illustration',
        'Cartoon': 'cartoon style, colorful, friendly, educational illustration',
        'Minimalista': 'minimalist, clean, simple, vector art style',
        'Esquemático': 'technical diagram, educational schematic, labeled',
        '3D': '3D render, volumetric, professional lighting'
    };

    const estiloDescricao = estilosMap[estilo] || estilo;

    // Constrói o prompt em inglês (funciona melhor)
    let prompt = `Educational illustration: ${topicoEspecifico} from ${materia}. `;
    prompt += `Style: ${estiloDescricao}. `;
    prompt += `Level: ${nivelEducacional}. `;
    
    if (detalhesAdicionais) {
        prompt += `Details: ${detalhesAdicionais}. `;
    }
    
    prompt += `Clear, didactic, high quality, no text, clean background.`;

    return prompt;
}

// ===== ROTAS =====

// Rota de cadastro
app.post('/api/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const newUser = await User.createUserFromRegistration(nome, email, senha);
        return res.status(201).json({ 
            success: true, 
            message: 'Usuário cadastrado com sucesso!',
            userId: newUser._id 
        });
    } catch (error) {
        if (error.code === 11000 || error.message.includes('já está cadastrado')) {
            return res.status(409).json({ success: false, message: 'Este e-mail já está cadastrado.' });
        }
        console.error('Erro no cadastro:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

// Rota de login
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const user = await User.authenticate(email, senha);

        if (user) {
            console.log(`Usuário logado: ${user.email} (${user.userTipo})`);
            return res.status(200).json({ 
                success: true, 
                message: 'Login realizado com sucesso!',
                userTipo: user.userTipo,
                userId: user._id
            });
        } else {
            return res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

// Rota para buscar histórico
app.get('/api/history/:userId', async (req, res) => {
    const userId = req.params.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'ID de usuário inválido.' });
    }

    try {
        const history = await Image.getImageHistory(userId);
        return res.status(200).json({ 
            success: true, 
            history: history 
        });
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        return res.status(500).json({ success: false, message: 'Erro ao buscar dados.' });
    }
});

// ===== ROTA PRINCIPAL: GERAR IMAGEM COM STABILITY AI SD3 =====
app.post('/api/generate', async (req, res) => {
    const { userId, materia, estilo, topicoEspecifico, nivelEducacional, detalhesAdicionais } = req.body;

    // 1. Validação
    if (!userId || !materia || !estilo || !topicoEspecifico) {
        return res.status(400).json({ 
            success: false, 
            message: 'Dados incompletos. Preencha matéria, estilo e tópico.' 
        });
    }

    // 2. Verifica se a chave da API está configurada
    if (!STABILITY_API_KEY) {
        console.error('❌ ERRO: STABILITY_API_KEY não está definida no .env');
        return res.status(500).json({ 
            success: false, 
            message: 'Chave da API não configurada no servidor.' 
        });
    }

    try {
        // 3. Constrói o prompt otimizado
        const promptFinal = construirPromptEducacional({
            materia,
            estilo,
            topicoEspecifico,
            nivelEducacional,
            detalhesAdicionais
        });

        console.log(promptFinal)
        console.log('🚀 Iniciando geração de imagem...');
        console.log('📋 Dados:', { materia, estilo, topicoEspecifico, nivelEducacional });

        // 4. CHAMA A API DO STABILITY AI SD3 (RÁPIDO!)
        const urlDaImagem = await gerarImagemStability(promptFinal);

        // 5. Valida se a imagem foi gerada
        if (!urlDaImagem) {
            throw new Error('A API não retornou uma imagem válida');
        }

        // 6. Prepara os dados para salvar no MongoDB
        const imageData = {
            urlDaImagem: urlDaImagem,
            promptUtilizado: promptFinal,
            materia: materia,
            estilo: estilo,
            topicoEspecifico: topicoEspecifico,
            nivelEducacional: nivelEducacional,
        };

        // 7. Salva no histórico
        const savedImage = await Image.saveImage(userId, imageData);

        console.log('✅ Imagem gerada e salva com sucesso!');

        // 8. Resposta de SUCESSO
        return res.status(201).json({ 
            success: true, 
            message: 'Ilustração gerada e salva!',
            image: savedImage
        });

    } catch (error) {
        console.error('❌ Erro na geração/salvamento:', error);
        
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Erro ao processar a geração.',
            error: error.message 
        });
    }
});

// Rota para buscar perfil
app.get('/api/profile/:userId', async (req, res) => {
    const userId = req.params.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'ID inválido.' });
    }

    try {
        const user = await User.findById(userId).select('-password');
        if (user) {
            return res.status(200).json({ success: true, user: user });
        } else {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

// Rota para atualizar perfil
app.post('/api/profile/update', async (req, res) => {
    const { userId, nome, email } = req.body;

    if (!userId || !nome || !email) {
        return res.status(400).json({ success: false, message: 'Dados incompletos.' });
    }
    
    try {
        const updatedUser = await User.updateProfileData(userId, nome, email);
        return res.status(200).json({ 
            success: true, 
            message: 'Dados atualizados!', 
            user: updatedUser 
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Falha ao atualizar.' 
        });
    }
});

// Rota para atualizar senha
app.post('/api/password/update', async (req, res) => {
    const { userId, senhaAtual, novaSenha } = req.body;

    if (!userId || !senhaAtual || !novaSenha) {
        return res.status(400).json({ 
            success: false, 
            message: 'Todos os campos são obrigatórios.' 
        });
    }

    try {
        await User.updatePassword(userId, senhaAtual, novaSenha);
        return res.status(200).json({ 
            success: true, 
            message: 'Senha alterada!' 
        });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        return res.status(401).json({ 
            success: false, 
            message: error.message || 'Falha ao alterar senha.' 
        });
    }
});

// Proxy para download de imagens (resolve problemas de CORS)
app.get('/api/proxy-image', async (req, res) => {
    const imageUrl = req.query.url;
    
    if (!imageUrl) {
        return res.status(400).json({ error: 'URL não fornecida' });
    }

    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });

        const contentType = response.headers['content-type'];
        res.set('Content-Type', contentType);
        res.set('Access-Control-Allow-Origin', '*');
        res.send(Buffer.from(response.data));

    } catch (error) {
        console.error('Erro no proxy:', error);
        res.status(500).json({ error: 'Erro ao carregar imagem' });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`🔑 Stability API Key: ${STABILITY_API_KEY ? '✅ Configurada' : '❌ NÃO configurada'}`);
});