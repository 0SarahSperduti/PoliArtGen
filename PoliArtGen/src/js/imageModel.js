const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId, // Tipo para IDs de outros documentos
        ref: 'User',                         // Referencia o Modelo 'User'
        required: true
    },
    
    // Dados da Imagem
    urlDaImagem: { 
        type: String, 
        required: true 
    },
    promptUtilizado: { 
        type: String, 
        required: true 
    },
    
    // Dados do Formulário do Site
    materia: { type: String },
    estilo: { type: String },
    topicoEspecifico: { type: String },
    nivelEducacional: { type: String },
    
    dataCriacao: { 
        type: Date, 
        default: Date.now 
    }
});



// Salva os dados de uma imagem gerada no histórico do usuário.

imageSchema.statics.saveImage = async function(userId, imageData) {
    try {
        const novaImagem = new this({
            usuarioId: userId,
            urlDaImagem: imageData.urlDaImagem,
            promptUtilizado: imageData.promptUtilizado,

            // Dados do Formulário
            materia: imageData.materia,
            estilo: imageData.estilo,
            topicoEspecifico: imageData.topicoEspecifico,
            nivelEducacional: imageData.nivelEducacional,
        });

        const imagemSalva = await novaImagem.save();
        return imagemSalva;
        
    } catch (error) {
        console.error("Erro ao salvar imagem no histórico:", error);
        throw new Error("Falha ao salvar a imagem no banco de dados.");
    }
};


// Busca todas as imagens geradas por um usuário específico.

imageSchema.statics.getImageHistory = async function(userId) {
    try {
        // Busca todos os documentos onde 'usuarioId' coincide com o userId fornecido
        const history = await this.find({ usuarioId: userId })
            // Ordena pela data de criação, do mais novo (-1) para o mais antigo
            .sort({ dataCriacao: -1 }); 

        return history;

    } catch (error) {
        console.error("Erro ao buscar histórico de imagens:", error);
        throw new Error("Falha na consulta ao histórico no banco de dados.");
    }
};



module.exports = mongoose.model('Image', imageSchema);


