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

module.exports = mongoose.model('User', userSchema);