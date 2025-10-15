const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser'); 
const connectDB = require('./PoliArtGen/src/js/db_connector'); 
const path = require('path');
const User = require('./PoliArtGen/src/js/userModel');
const FRONTEND_ROOT = path.join(__dirname, 'PoliArtGen');
const SRC_ROOT = path.join(FRONTEND_ROOT, 'src');
const Image = require('./PoliArtGen/src/js/imageModel');

const app = express();
const PORT = process.env.PORT || 3000;

// Permite que o servidor leia dados JSON do frontend
app.use(bodyParser.json());
// Permite que o Express sirva seus arquivos estáticos (HTML, CSS, JS do frontend)
app.use(express.static(FRONTEND_ROOT));
app.use('/src', express.static(SRC_ROOT));

// conecta ao banco de dados 
connectDB(); 

// rota de cadastro (POST /api/cadastro)
app.post('/api/cadastro', async (req, res) => {
    
    // Desestrutura os dados enviados pelo fetch() do frontend
    const { nome, email, senha } = req.body;

    // Validação do lado do servidor (IMPORTANTE: Nunca confie apenas no frontend)
    if (!nome || !email || !senha) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Chama a função estática que criamos no UserModel para criar e criptografar a senha
        // Note: Se você renomeou o método, ajuste aqui.
        const newUser = await User.createUserFromRegistration(nome, email, senha);

        // Resposta de SUCESSO para o frontend (Status 201 Created)
        return res.status(201).json({ 
            success: true, 
            message: 'Usuário cadastrado com sucesso!',
            userId: newUser._id 
        });

    } catch (error) {
        // Trata erro de DUPLICIDADE (Mongoose/MongoDB código 11000)
        if (error.code === 11000 || error.message.includes('já está cadastrado')) {
            return res.status(409).json({ success: false, message: 'Este e-mail já está cadastrado.' });
        }
        
        // Outros erros (conexão, validação, etc.)
        console.error('Erro no cadastro:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor. Tente novamente.' });
    }
});


// INICIA O SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Rota de login (POST /api/login)
app.post('/api/login', async (req, res) => {
    
    const { email, senha } = req.body;

    // Validação de entrada
    if (!email || !senha) {
        return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // Chama o método estático de autenticação que criamos no UserModel
        const user = await User.authenticate(email, senha);

        if (user) {
            // Usuário autenticado.
            console.log(`Usuário logado com sucesso: ${user.email} (${user.userTipo})`);
            
            // Aqui, em uma aplicação real, você criaria uma SESSÃO ou um TOKEN JWT.
            // Por enquanto, apenas confirmamos o sucesso e enviamos o tipo de usuário.
            
            return res.status(200).json({ 
                success: true, 
                message: 'Login realizado com sucesso!',
                userTipo: user.userTipo, // Útil para redirecionamento no frontend
                userId: user._id // O ID é essencial para o histórico
            });
        } else {
            // FALHA na autenticação (senha ou e-mail incorretos)
            return res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });
        }

    } catch (error) {
        console.error('Erro no processo de login:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor. Tente novamente.' });
    }
});

// rota para buscar o histórico de imagens (GET /api/history/:userId)
app.get('/api/history/:userId', async (req, res) => {
    
    // Pega o ID do usuário da URL
    const userId = req.params.userId;

    // Verificação básica do ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'ID de usuário inválido.' });
    }

    try {
        // Chama o método estático para buscar todas as imagens
        const history = await Image.getImageHistory(userId);

        // Resposta de SUCESSO
        return res.status(200).json({ 
            success: true, 
            history: history 
        });

    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        return res.status(500).json({ success: false, message: 'Erro ao buscar dados no servidor.' });
    }
});