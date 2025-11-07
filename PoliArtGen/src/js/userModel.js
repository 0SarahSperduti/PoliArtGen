// Arquivo para "Schemas" MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    userTipo: {
        type: String,
        enum: ['aluno', 'professor', 'outro'],
        required: false
    },
    dataCriacao: {
        type: Date,
        default: Date.now
    }
});


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


userSchema.pre('save', async function (next) {
    // Só criptografa a senha se ela foi modificada ou se for um novo usuário
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);

        // criptografa a senha
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error); // Passa o erro para o Mongoose
    }
});



userSchema.statics.createUserFromRegistration = async function (nome, email, password) {
    const newUser = new this({ nome, email, password });

    try {
        // Tentativa de salvar o novo usuário (o hook de criptografia será ativado)
        const savedUser = await newUser.save();

        console.log(`Novo usuário criado: ${savedUser.nome} (${savedUser.userTipo})`);
        return savedUser;

    } catch (error) {
        // Trata o erro de e-mail duplicado
        if (error.code === 11000) {
            // Retorna um erro para o front-end exibir
            throw new Error("Este e-mail já está cadastrado. Tente fazer login.");
        }

        throw error;
    }
};


userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.authenticate = async function (email, password) {

    // 1. Busca o usuário pelo email
    const user = await this.findOne({ email });

    if (!user) {
        return null; // Usuário não encontrado
    }

    // 2. Compara a senha usando o método de instância (comparePassword)
    const isMatch = await user.comparePassword(password);

    if (isMatch) {
        return user; // Senha correta: retorna o objeto do usuário
    } else {
        return null; // Senha incorreta
    }
};


// 1. Atualiza o nome e o e-mail de um usuário.

userSchema.statics.updateProfileData = async function (userId, nome, email) {
    try {
        // Encontra o usuário pelo ID e atualiza os campos. 
        // { new: true } retorna o documento ATUALIZADO.
        const updatedUser = await this.findByIdAndUpdate(
            userId,
            { nome, email },
            { new: true, runValidators: true } // runValidators: Garante que o Mongoose cheque se o novo e-mail já existe (unique).
        ).select('-password'); // Exclui a senha do retorno

        if (!updatedUser) {
            throw new Error("Usuário não encontrado.");
        }
        return updatedUser;
    } catch (error) {
        if (error.code === 11000) { // Erro de e-mail duplicado
            throw new Error("Este e-mail já está em uso por outro usuário.");
        }
        throw error;
    }
};

// Atualiza a senha de um usuário, verificando a senha atual primeiro.

userSchema.statics.updatePassword = async function (userId, senhaAtual, novaSenha) {
    const user = await this.findById(userId);

    if (!user) {
        throw new Error("Usuário não encontrado.");
    }

    // Verifica a senha atual usando a lógica bcrypt
    const isMatch = await user.comparePassword(senhaAtual);
    if (!isMatch) {
        throw new Error("Senha atual incorreta.");
    }

    // Atualiza o campo 'password'. O hook 'pre('save')' do bcrypt fará a criptografia.
    user.password = novaSenha;

    // Salva o documento (o save irá ativar o hook de bcrypt)
    await user.save();
    return true; // Sucesso
};

module.exports = mongoose.model('User', userSchema);