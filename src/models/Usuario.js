const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const Usuario = sequelize.define(
  'Usuario',
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
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true },
    },
  },
  {
    tableName: 'usuarios',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    hooks: {
      beforeCreate: async (usuario) => {
        usuario.senha = await bcrypt.hash(usuario.senha, 10);
      },
    },
  }
);

Usuario.prototype.comparePassword = function comparePassword(rawPassword) {
  return bcrypt.compare(rawPassword, this.senha);
};

module.exports = Usuario;
