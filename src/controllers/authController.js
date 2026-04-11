const jwt = require('jsonwebtoken');
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

module.exports = {
  login,
};
