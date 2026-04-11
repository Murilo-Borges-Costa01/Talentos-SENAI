const { Op } = require('sequelize');
const { Aluno } = require('../models');
const { getPagination, getSort } = require('../utils/pagination');

async function create(req, res) {
  const aluno = await Aluno.create(req.body);
  return res.status(201).json(aluno);
}

async function list(req, res) {
  const { curso, turma, ano_conclusao, palavras_chave } = req.query;
  const where = {};

  if (curso) where.curso = { [Op.like]: `%${curso}%` };
  if (turma) where.turma = { [Op.like]: `%${turma}%` };
  if (ano_conclusao) where.ano_conclusao = Number(ano_conclusao);

  if (palavras_chave) {
    const terms = String(palavras_chave)
      .split(',')
      .map((term) => term.trim())
      .filter(Boolean);

    if (terms.length) {
      where[Op.and] = terms.map((term) => ({
        [Op.or]: [
          { nome: { [Op.like]: `%${term}%` } },
          { descricao: { [Op.like]: `%${term}%` } },
          { curso: { [Op.like]: `%${term}%` } },
        ],
      }));
    }
  }

  const { page, limit, offset } = getPagination(req.query);
  const sort = getSort(req.query, 'created_at');

  const { rows, count } = await Aluno.findAndCountAll({
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
  const aluno = await Aluno.findByPk(req.params.id);
  if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado.' });
  return res.json(aluno);
}

async function update(req, res) {
  const aluno = await Aluno.findByPk(req.params.id);
  if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado.' });

  await aluno.update(req.body);
  return res.json(aluno);
}

async function remove(req, res) {
  const aluno = await Aluno.findByPk(req.params.id);
  if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado.' });

  await aluno.destroy();
  return res.status(204).send();
}

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
};
