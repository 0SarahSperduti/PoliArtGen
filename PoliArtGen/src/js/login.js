const User = require('./UserModel'); // Importa o Modelo de Usuário

/**
 * Autentica um usuário usando email e senha, chamando o método estático do Modelo.
 * @param {string} email - Email fornecido pelo usuário.
 * @param {string} password - Senha fornecida pelo usuário.
 * @returns {Promise<User|null>} O objeto do usuário autenticado ou null se falhar.
 */
async function authenticateUser(email, password) {
    // A função 'authenticate' está no UserModel
    const user = await User.authenticate(email, password);
    
    if (user) {
        console.log(`Usuário ${user.email} autenticado com sucesso!`);
        return user;
    }
    
    return null; // Falha na autenticação
}

module.exports = {
    authenticateUser,
};