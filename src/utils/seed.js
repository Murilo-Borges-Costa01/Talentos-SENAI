async function seedAdminUser(Usuario) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Administrador';

  if (!adminEmail || !adminPassword) return;

  const existing = await Usuario.findOne({ where: { email: adminEmail } });
  if (existing) return;

  await Usuario.create({
    nome: adminName,
    email: adminEmail,
    senha: adminPassword,
  });

  console.log('Usuário administrador inicial criado.');
}

module.exports = {
  seedAdminUser,
};
