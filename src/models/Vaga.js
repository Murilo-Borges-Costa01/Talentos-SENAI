const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

function calculateStatus(dataExpiracao, currentStatus) {
  if (currentStatus === 'encerrada') return 'encerrada';
  const now = new Date();
  return new Date(dataExpiracao) < now ? 'expirada' : 'ativa';
}

const Vaga = sequelize.define(
  'Vaga',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: true },
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    empresa: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: true },
    },
    data_expiracao: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: { isDate: true },
    },
    requisitos: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('requisitos');
        if (!raw) return null;

        try {
          return JSON.parse(raw);
        } catch (error) {
          return raw;
        }
      },
      set(value) {
        if (value === null || value === undefined || value === '') {
          this.setDataValue('requisitos', null);
          return;
        }

        if (typeof value === 'string') {
          this.setDataValue('requisitos', value);
          return;
        }

        this.setDataValue('requisitos', JSON.stringify(value));
      },
    },
    status: {
      type: DataTypes.ENUM('ativa', 'expirada', 'encerrada'),
      allowNull: false,
      defaultValue: 'ativa',
    },
  },
  {
    tableName: 'vagas',
    underscored: true,
    timestamps: true,
    hooks: {
      beforeValidate: (vaga) => {
        if (vaga.data_expiracao) {
          vaga.status = calculateStatus(vaga.data_expiracao, vaga.status || 'ativa');
        }
      },
    },
  }
);

module.exports = Vaga;
