const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

async function login(req, res) {
  const { email, senha } = req.body;

  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const validPassword = await usuario.comparePassword(senha);

  if (!validPassword) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return res.json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    },
  });
}

async function register(req, res) {
  const { nome, email, senha } = req.body;

  const existingUser = await Usuario.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: 'Já existe uma conta com esse e-mail.' });
  }

  const usuario = await Usuario.create({ nome, email, senha });

  return res.status(201).json({
    message: 'Conta criada com sucesso.',
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    },
  });
}

async function forgotPassword(req, res) {
  const { email, nova_senha } = req.body;

  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    return res.status(404).json({ message: 'Usuário não encontrado para este e-mail.' });
  }

  usuario.senha = await bcrypt.hash(nova_senha, 10);
  await usuario.save();

  return res.json({ message: 'Senha redefinida com sucesso.' });
}

module.exports = {
  login,
  register,
  forgotPassword,
};
