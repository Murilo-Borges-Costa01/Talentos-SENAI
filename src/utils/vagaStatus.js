const { Op } = require('sequelize');

async function refreshExpiredVagas(VagaModel) {
  await VagaModel.update(
    { status: 'expirada' },
    {
      where: {
        status: 'ativa',
        data_expiracao: { [Op.lt]: new Date() },
      },
    }
  );
}

module.exports = {
  refreshExpiredVagas,
};
