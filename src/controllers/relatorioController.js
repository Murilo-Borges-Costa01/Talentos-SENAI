const { Op } = require('sequelize');
const { Aluno, Candidatura, Vaga } = require('../models');
const { getPagination } = require('../utils/pagination');
const { buildCompatibility } = require('../utils/compatibility');

function parseBoolean(value) {
  if (value === undefined) return false;
  return value === true || value === 'true' || value === '1';
}

async function alunosReport(req, res) {
  const { turma, vaga: vagaId, ano_conclusao } = req.query;
  const apenasCandidatos = parseBoolean(req.query.apenas_candidatos);
  const apenasCompativeis = parseBoolean(req.query.apenas_compativeis);

  if (apenasCompativeis && !vagaId) {
    return res.status(400).json({
      message: 'Para filtrar apenas compatíveis, informe o parâmetro vaga.',
    });
  }

  const { page, limit, offset } = getPagination(req.query);

  if (apenasCompativeis) {
    const vaga = await Vaga.findByPk(vagaId);
    if (!vaga) return res.status(404).json({ message: 'Vaga não encontrada.' });

    const whereCompat = {};
    if (turma) whereCompat.turma = { [Op.like]: `%${turma}%` };
    if (ano_conclusao) whereCompat.ano_conclusao = Number(ano_conclusao);

    const alunos = await Aluno.findAll({ where: whereCompat });

    let data = alunos
      .map((aluno) =>
        buildCompatibility(aluno, vaga, {
          anoConclusao: ano_conclusao,
        })
      )
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => ({
        score: item.score,
        reasons: item.reasons,
        aluno: item.aluno,
      }));

    if (apenasCandidatos) {
      const candidaturas = await Candidatura.findAll({
        where: { id_vaga: Number(vagaId) },
        attributes: ['id_aluno'],
      });
      const ids = new Set(candidaturas.map((c) => c.id_aluno));
      data = data.filter((item) => ids.has(item.aluno.id));
    }

    const paged = data.slice(offset, offset + limit);

    return res.json({
      data: paged,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
      },
    });
  }

  const where = {};
  if (turma) where.turma = { [Op.like]: `%${turma}%` };
  if (ano_conclusao) where.ano_conclusao = Number(ano_conclusao);

  const include = [];

  if (vagaId || apenasCandidatos) {
    include.push({
      model: Candidatura,
      as: 'candidaturas',
      required: true,
      where: vagaId ? { id_vaga: Number(vagaId) } : undefined,
      attributes: ['id', 'id_vaga', 'data_candidatura'],
    });
  }

  const { rows, count } = await Aluno.findAndCountAll({
    where,
    include,
    distinct: true,
    limit,
    offset,
    order: [['created_at', 'DESC']],
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

module.exports = {
  alunosReport,
};
