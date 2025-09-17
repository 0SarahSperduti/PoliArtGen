// Conexão com um banco de dados
require('dotenv').config();
const mysql = require('mysql2');

// Carrega as variáveis de ambiente
const HOST = process.env.HOST;
const PORT = process.env.PORT;
const USER = process.env.USER;
const PASSWORD = process.env.DB_PASSWORD;
const DATABASE = process.env.DATABASE;
const SSL_CA = process.env.SSL_CA;

// Apenas para fins de depuração, como no seu código Python
console.log(`HOST=${HOST}`);
console.log(`PORT=${PORT}`);
console.log(`USER=${USER}`);
console.log(`PASSWORD=${PASSWORD}`);
console.log(`DATABASE=${DATABASE}`);

/**
 * Cria e retorna uma conexão com o banco de dados.
 */
function getConnection() {
  return mysql.createConnection({
    host: HOST,
    port: parseInt(PORT),
    user: USER,
    password: PASSWORD,
    database: DATABASE,
    ssl: {
        ca: SSL_CA
    }
  });
}

module.exports = getConnection;