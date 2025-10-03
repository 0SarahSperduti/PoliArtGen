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
        enum: ['aluno', 'professor',],
        required: true
    }
})