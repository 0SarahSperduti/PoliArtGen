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

// Rota para gerar uma nova imagem 
app.post('/api/generate', async (req, res) => {
    
    // Obtém os dados do formulário (enviados pelo frontend)
    const { userId, materia, estilo, topicoEspecifico, nivelEducacional, detalhesAdicionais } = req.body;

    // 1. Validação essencial
    if (!userId || !materia || !estilo) {
        return res.status(400).json({ success: false, message: 'Dados de geração incompletos.' });
    }

    try {
        // --- SIMULAÇÃO DA IA: Esta é a parte que a IA real faria ---
        // Aqui, o código chamaria o serviço externo de IA.
        // Simulamos a URL que a IA devolveria e o prompt final que será salvo.
        const URL_IMAGEM_REAL_TESTE = 'https://cdn.pixabay.com/photo/2025/10/09/08/14/mushroom-9883036_640.jpg';
        const promptFinal = `${topicoEspecifico} (${materia} / ${nivelEducacional}). Detalhes: ${detalhesAdicionais}`;

        // Montar o objeto de dados para o Modelo
        const imageData = {
            urlDaImagem: URL_IMAGEM_REAL_TESTE,
            promptUtilizado: promptFinal,
            materia: materia,
            estilo: estilo,
            topicoEspecifico: topicoEspecifico,
            nivelEducacional: nivelEducacional,
        };

        // 3. Salvar no Histórico (usando o método estático do ImageModel)
        const savedImage = await Image.saveImage(userId, imageData);

        // 4. Resposta de SUCESSO para o frontend (com a nova imagem)
        return res.status(201).json({ 
            success: true, 
            message: 'Ilustração gerada e salva!',
            image: savedImage // Devolve o objeto salvo (com o ID e a URL)
        });

    } catch (error) {
        console.error('Erro na geração/salvamento da imagem:', error);
        return res.status(500).json({ success: false, message: 'Erro ao processar a geração.' });
    }
});

// Rota para buscar os dados do perfil do usuário 
app.get('/api/profile/:userId', async (req, res) => {
    
    const userId = req.params.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'ID de usuário inválido.' });
    }

    try {
        // Chama o método estático do UserModel para buscar o usuário (sem a senha)
        const user = await User.findById(userId); 

        if (user) {
            // SUCESSO: Retorna o objeto do usuário (sem a senha)
            return res.status(200).json({ 
                success: true, 
                user: user
            });
        } else {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao buscar perfil.' });
    }
});

// Rota para atualizar os dados do perfil do usuário
app.post('/api/profile/update', async (req, res) => {
    const { userId, nome, email } = req.body;

    if (!userId || !nome || !email) {
        return res.status(400).json({ success: false, message: 'Dados incompletos.' });
    }
    
    try {
        // Chama o método estático do UserModel para atualizar
        const updatedUser = await User.updateProfileData(userId, nome, email);
        return res.status(200).json({ success: true, message: 'Dados atualizados com sucesso!', user: updatedUser });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        // Trata erro de e-mail duplicado ou validação
        return res.status(500).json({ success: false, message: error.message || 'Falha ao atualizar dados.' });
    }
});

// Rota para atualizar a senha do usuário
app.post('/api/password/update', async (req, res) => {
    const { userId, senhaAtual, novaSenha } = req.body;

    if (!userId || !senhaAtual || !novaSenha) {
        return res.status(400).json({ success: false, message: 'Todos os campos de senha são obrigatórios.' });
    }

    try {
        // Chama o método estático do UserModel para verificar a senha e salvar a nova
        await User.updatePassword(userId, senhaAtual, novaSenha);
        return res.status(200).json({ success: true, message: 'Senha alterada com sucesso!' });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        // Retorna 401 (Não Autorizado) se a senha atual estiver incorreta
        return res.status(401).json({ success: false, message: error.message || 'Senha atual incorreta ou falha de servidor.' });
    }
});