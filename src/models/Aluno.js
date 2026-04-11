const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Aluno = sequelize.define(
  'Aluno',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true, notEmpty: true },
    },
    contato: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: { notEmpty: true },
    },
    tipo_aluno: {
      type: DataTypes.ENUM('senai', 'externo'),
      allowNull: false,
      defaultValue: 'senai',
    },
    curso: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    ano_conclusao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1900, max: 3000 },
    },
    turma: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'alunos',
    underscored: true,
    timestamps: true,
    validate: {
      camposObrigatoriosParaSenai() {
        if (this.tipo_aluno === 'senai') {
          if (!this.curso || !String(this.curso).trim()) {
            throw new Error('Curso é obrigatório para aluno do SENAI.');
          }
          if (!this.ano_conclusao) {
            throw new Error('Ano de conclusão é obrigatório para aluno do SENAI.');
          }
          if (!this.turma || !String(this.turma).trim()) {
            throw new Error('Turma é obrigatória para aluno do SENAI.');
          }
        }
      },
    },
  }
);

module.exports = Aluno;
