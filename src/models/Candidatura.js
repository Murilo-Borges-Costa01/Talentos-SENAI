const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Candidatura = sequelize.define(
  'Candidatura',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_aluno: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_vaga: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    data_candidatura: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'candidaturas',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_aluno', 'id_vaga'],
        name: 'uniq_candidatura_aluno_vaga',
      },
    ],
  }
);

module.exports = Candidatura;
