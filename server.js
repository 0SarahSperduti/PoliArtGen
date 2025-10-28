const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./PoliArtGen/src/js/db_connector');
const path = require('path');
const User = require('./PoliArtGen/src/js/userModel');
const Image = require('./PoliArtGen/src/js/imageModel');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ====== CONFIGURAÇÃO DE PASTAS ======
const FRONTEND_ROOT = path.join(__dirname, 'PoliArtGen');
const SRC_ROOT = path.join(FRONTEND_ROOT, 'src');
const IMAGES_DIR = path.join(__dirname, 'generated_images');

// ====== MIDDLEWARE ======
app.use(bodyParser.json());
app.use(express.static(FRONTEND_ROOT));
app.use('/src', express.static(SRC_ROOT));

if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}
app.use('/generated_images', express.static(IMAGES_DIR));

// ====== CONEXÃO AO BANCO ======
connectDB();

// ===========================================================
// 📦 ROTAS PRINCIPAIS
// ===========================================================

// --- Cadastro de usuário ---
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

// --- Login ---
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

// --- Histórico de imagens ---
app.get('/api/history/:userId', async (req, res) => {
    const userId = req.params.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'ID de usuário inválido.' });
    }

    try {
        const history = await Image.getImageHistory(userId);
        return res.status(200).json({ success: true, history });
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        return res.status(500).json({ success: false, message: 'Erro ao buscar dados.' });
    }
});

// --- Perfil ---
app.get('/api/profile/:userId', async (req, res) => {
    const userId = req.params.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'ID inválido.' });
    }

    try {
        const user = await User.findById(userId).select('-password');
        if (user) {
            return res.status(200).json({ success: true, user });
        } else {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

// --- Atualizar perfil ---
app.post('/api/profile/update', async (req, res) => {
    const { userId, nome, email } = req.body;
    if (!userId || !nome || !email) {
        return res.status(400).json({ success: false, message: 'Dados incompletos.' });
    }

    try {
        const updatedUser = await User.updateProfileData(userId, nome, email);
        return res.status(200).json({ success: true, message: 'Dados atualizados!', user: updatedUser });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return res.status(500).json({ success: false, message: error.message || 'Falha ao atualizar.' });
    }
});

// --- Atualizar senha ---
app.post('/api/password/update', async (req, res) => {
    const { userId, senhaAtual, novaSenha } = req.body;
    if (!userId || !senhaAtual || !novaSenha) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        await User.updatePassword(userId, senhaAtual, novaSenha);
        return res.status(200).json({ success: true, message: 'Senha alterada!' });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        return res.status(401).json({ success: false, message: error.message || 'Falha ao alterar senha.' });
    }
});

// --- Proxy de imagem (CORS) ---
app.get('/api/proxy-image', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) {
        return res.status(400).json({ error: 'URL não fornecida' });
    }

    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.set('Access-Control-Allow-Origin', '*');
        res.send(Buffer.from(response.data));
    } catch (error) {
        console.error('Erro no proxy:', error);
        res.status(500).json({ error: 'Erro ao carregar imagem' });
    }
});

// ===========================================================
// 🎨 ROTA PARA GERAR IMAGEM VIA BACKEND (Hugging Face)
// ===========================================================
app.post('/api/gerar-imagem', async (req, res) => {
    const { materia, conteudo, estilo, infoAdicional } = req.body;

    try {
        const prompt = `${materia} ${conteudo} ${estilo} ${infoAdicional}`;
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
            { inputs: prompt },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        res.json({ success: true, image: `data:image/png;base64,${base64Image}` });

    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        res.status(500).json({ success: false, message: 'Erro ao gerar imagem.' });
    }
});

// ===========================================================
// 🚀 INICIA SERVIDOR
// ===========================================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
