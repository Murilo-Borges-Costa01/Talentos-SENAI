const { Op } = require('sequelize');
const { Vaga, Aluno, Candidatura } = require('../models');
const { getPagination, getSort } = require('../utils/pagination');
const { refreshExpiredVagas } = require('../utils/vagaStatus');
const { buildCompatibility } = require('../utils/compatibility');

async function create(req, res) {
  const vaga = await Vaga.create(req.body);
  return res.status(201).json(vaga);
}

async function list(req, res) {
  await refreshExpiredVagas(Vaga);

  const { page, limit, offset } = getPagination(req.query);
  const sort = getSort(req.query, 'created_at');

  const where = {};
  if (req.query.status) {
    where.status = req.query.status;
  } else {
    where.status = 'ativa';
  }

  const { rows, count } = await Vaga.findAndCountAll({
    where,
    limit,
    offset,
    order: [sort],
  });

  return res.json({
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}

async function getById(req, res) {
  await refreshExpiredVagas(Vaga);
  const vaga = await Vaga.findByPk(req.params.id);

  if (!vaga) return res.status(404).json({ message: 'Vaga não encontrada.' });

  return res.json(vaga);
}

async function update(req, res) {
  const vaga = await Vaga.findByPk(req.params.id);
  if (!vaga) return res.status(404).json({ message: 'Vaga não encontrada.' });

  await vaga.update(req.body);
  return res.json(vaga);
}

async function remove(req, res) {
  const vaga = await Vaga.findByPk(req.params.id);
  if (!vaga) return res.status(404).json({ message: 'Vaga não encontrada.' });

  await vaga.destroy();
  return res.status(204).send();
}

async function close(req, res) {
  const vaga = await Vaga.findByPk(req.params.id);
  if (!vaga) return res.status(404).json({ message: 'Vaga não encontrada.' });

  await vaga.update({ status: 'encerrada' });
  return res.json(vaga);
}

async function getCompatibilidade(req, res) {
  await refreshExpiredVagas(Vaga);

  const vaga = await Vaga.findByPk(req.params.id);
  if (!vaga) return res.status(404).json({ message: 'Vaga não encontrada.' });

  const alunos = await Aluno.findAll();
  const compativeis = alunos
    .map((aluno) =>
      buildCompatibility(aluno, vaga, {
        anoConclusao: req.query.ano_conclusao,
      })
    )
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      score: item.score,
      reasons: item.reasons,
      aluno: item.aluno,
    }));

  return res.json({
    vaga,
    total: compativeis.length,
    data: compativeis,
  });
}

async function listCandidatos(req, res) {
  const vaga = await Vaga.findByPk(req.params.id);
  if (!vaga) return res.status(404).json({ message: 'Vaga não encontrada.' });

  const { page, limit, offset } = getPagination(req.query);

  const { rows, count } = await Candidatura.findAndCountAll({
    where: { id_vaga: req.params.id },
    include: [
      {
        model: Aluno,
        as: 'aluno',
        attributes: ['id', 'nome', 'email', 'curso', 'turma', 'ano_conclusao'],
      },
    ],
    order: [['data_candidatura', 'DESC']],
    limit,
    offset,
  });

  return res.json({
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}

async function countCandidatos(req, res) {
  const vaga = await Vaga.findByPk(req.params.id);
  if (!vaga) return res.status(404).json({ message: 'Vaga não encontrada.' });

  const total = await Candidatura.count({ where: { id_vaga: req.params.id } });
  return res.json({ id_vaga: Number(req.params.id), total_candidatos: total });
}

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
  close,
  getCompatibilidade,
  listCandidatos,
  countCandidatos,
};
