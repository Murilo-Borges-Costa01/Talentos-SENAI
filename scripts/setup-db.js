require('dotenv').config();

const mysql = require('mysql2/promise');

async function setupDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!user || !database) {
    throw new Error('DB_USER e DB_NAME são obrigatórios no arquivo .env');
  }

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );

  await connection.end();
  console.log(`Banco ${database} verificado/criado com sucesso.`);
}

setupDatabase().catch((error) => {
  console.error('Erro ao configurar banco:', error.message);
  process.exit(1);
});
