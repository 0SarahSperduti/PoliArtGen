// Arquivo para "Schemas" MongoDB
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true 
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    userTipo:{
        type: String,
        enum: ['aluno', 'professor', 'outro'],
        required: false
    },
    dataCriacao:{
        type: Date,
        default: Date.now
    }
})

userSchema.pre('save', function (next) {
    const email = this.email.toLowerCase();

    if (email.endsWith('@sistemapoliedro.com.br')) {
        this.userTipo = 'professor';
    } else if (email.endsWith('@p4ed.com')) {
        this.userTipo = 'aluno';
    } else {
        this.userTipo = 'outro'; 
    }
    next();
});

// Função para criação de novo usuário, que será chamada na aba de cadastro 
// do site, após o usuário colocar suas informações

userSchema.statics.createUserFromRegistration = async function(nome, email) {
    const newUser = new this({ nome, email });

    try {
        // Tentativa de salvar o novo usuário
        const savedUser = await newUser.save();
        
        console.log(`Novo usuário criado: ${savedUser.nome} (${savedUser.userTipo})`);
        return savedUser;
        
    } catch (error) {
        // Trata o erro de e-mail duplicado
        if (error.code === 11000) { 
            // Retorna um erro para o front-end exibir
            throw new Error("Este e-mail já está cadastrado. Tente fazer login.");
        }
        
        // Trata outros erros de validação 
        throw error;
    }
};

module.exports = mongoose.model('User', userSchema);