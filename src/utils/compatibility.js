function normalizeText(value) {
  if (!value) return '';
  return String(value).toLowerCase();
}

function extractKeywords(requisitos) {
  if (!requisitos) return [];

  if (Array.isArray(requisitos)) {
    return requisitos.map((item) => normalizeText(item)).filter(Boolean);
  }

  if (typeof requisitos === 'object') {
    return Object.values(requisitos)
      .flatMap((item) => (Array.isArray(item) ? item : [item]))
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  return String(requisitos)
    .toLowerCase()
    .split(/[;,\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildCompatibility(aluno, vaga, options = {}) {
  const vagaText = normalizeText(`${vaga.titulo} ${vaga.descricao} ${JSON.stringify(vaga.requisitos || '')}`);
  const alunoText = normalizeText(`${aluno.nome} ${aluno.curso} ${aluno.descricao || ''}`);

  let score = 0;
  const reasons = [];

  if (vagaText.includes(normalizeText(aluno.curso))) {
    score += 50;
    reasons.push('Curso relacionado com a vaga');
  }

  const keywords = extractKeywords(vaga.requisitos);
  const matchedKeywords = keywords.filter((keyword) => keyword && alunoText.includes(keyword));

  if (matchedKeywords.length) {
    score += Math.min(matchedKeywords.length * 10, 40);
    reasons.push(`Palavras-chave em comum: ${matchedKeywords.join(', ')}`);
  }

  if (options.anoConclusao && Number(aluno.ano_conclusao) === Number(options.anoConclusao)) {
    score += 10;
    reasons.push('Ano de formação compatível');
  }

  return {
    aluno,
    score,
    reasons,
  };
}

module.exports = {
  buildCompatibility,
};
