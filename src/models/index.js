const sequelize = require('../config/database');

const Aluno = require('./Aluno');
const Vaga = require('./Vaga');
const Candidatura = require('./Candidatura');
const Usuario = require('./Usuario');

Aluno.belongsToMany(Vaga, {
  through: Candidatura,
  foreignKey: 'id_aluno',
  otherKey: 'id_vaga',
  as: 'vagas',
});

Vaga.belongsToMany(Aluno, {
  through: Candidatura,
  foreignKey: 'id_vaga',
  otherKey: 'id_aluno',
  as: 'alunos',
});

Aluno.hasMany(Candidatura, { foreignKey: 'id_aluno', as: 'candidaturas' });
Vaga.hasMany(Candidatura, { foreignKey: 'id_vaga', as: 'candidaturas' });
Candidatura.belongsTo(Aluno, { foreignKey: 'id_aluno', as: 'aluno' });
Candidatura.belongsTo(Vaga, { foreignKey: 'id_vaga', as: 'vaga' });

module.exports = {
  sequelize,
  Aluno,
  Vaga,
  Candidatura,
  Usuario,
};
