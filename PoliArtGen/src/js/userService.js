const User = require('./userModel');

async function createUser(nome, email) {
    try {
        const novoUsuario = new User({ nome, email });
        
        const usuarioSalvo = await novoUsuario.save();
        
        return usuarioSalvo;
    } catch (error) {
        // Trata erro de e-mail duplicado
        if (error.code === 11000) { 
            throw new Error(`E-mail ${email} já cadastrado. Não é possível criar duplicatas.`);
        }
        console.error("Erro ao salvar novo usuário:", error.message);
        throw new Error("Falha ao criar usuário no banco de dados.");
    }
}

async function findUserByEmail(email) {
    try {
        // Mongoose: findOne é o equivalente ao SELECT...WHERE
        return await User.findOne({ email: email });
    } catch (error) {
        console.error("Erro ao buscar usuário por email:", error);
        throw new Error("Falha na consulta ao banco de dados.");
    }
}

// Exporta as funções para que outros arquivos possam usá-las
module.exports = {
    createUser,
    findUserByEmail,
};

