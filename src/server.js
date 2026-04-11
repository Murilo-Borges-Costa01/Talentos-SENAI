require('dotenv').config();

const app = require('./app');
const { sequelize, Usuario } = require('./models');
const { seedAdminUser } = require('./utils/seed');

const PORT = Number(process.env.PORT || 3000);

async function start() {
  try {
    await sequelize.authenticate();
    const syncAlter = process.env.DB_SYNC_ALTER === 'true';
    await sequelize.sync({ alter: syncAlter });

    if (process.env.AUTO_SEED_ADMIN === 'true') {
      await seedAdminUser(Usuario);
    }

    app.listen(PORT, () => {
      console.log(`Servidor ativo na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar servidor:', error.message);
    process.exit(1);
  }
}

start();
