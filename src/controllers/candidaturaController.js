const { Candidatura, Aluno, Vaga } = require('../models');
const { refreshExpiredVagas } = require('../utils/vagaStatus');

async function create(req, res) {
  const { id_aluno, id_vaga } = req.body;

  const [aluno, vaga] = await Promise.all([
    Aluno.findByPk(id_aluno),
    Vaga.findByPk(id_vaga),
  ]);

  if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado.' });
  if (!vaga) return res.status(404).json({ message: 'Vaga não encontrada.' });

  await refreshExpiredVagas(Vaga);
  await vaga.reload();

  if (vaga.status !== 'ativa') {
    return res.status(400).json({ message: 'A vaga não está disponível para candidatura.' });
  }

  const duplicated = await Candidatura.findOne({ where: { id_aluno, id_vaga } });
  if (duplicated) {
    return res.status(409).json({ message: 'Candidatura duplicada não permitida.' });
  }

  const candidatura = await Candidatura.create({ id_aluno, id_vaga });
  return res.status(201).json(candidatura);
}

async function remove(req, res) {
  const candidatura = await Candidatura.findByPk(req.params.id);
  if (!candidatura) {
    return res.status(404).json({ message: 'Candidatura não encontrada.' });
  }

  await candidatura.destroy();
  return res.status(204).send();
}

module.exports = {
  create,
  remove,
};
