function notFoundHandler(req, res) {
  return res.status(404).json({ message: 'Rota não encontrada.' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor.';

  if (process.env.NODE_ENV !== 'test') {
    console.error('[ERROR]', message);
  }

  return res.status(statusCode).json({ message });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
