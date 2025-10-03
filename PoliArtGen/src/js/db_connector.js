const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({path:path.resolve(__dirname, '..', '..', '.env')});

// Pega a URI de conexão
const MONGO_URI = process.env.MONGO_URI;
// Retirar depois, parte dos testes
console.log(`MONGO_URI=${MONGO_URI}`);


/**
 * Estabelece e mantém a conexão com o banco de dados.
 */

async function connectDB() {
  if (!MONGO_URI){
    console.error("ERRO: MONGO_URI não está definida no arquivo .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI)
    
    console.log('Conexão com o MongoDB bem-sucedida')
  } catch(error){
    console.error('Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;