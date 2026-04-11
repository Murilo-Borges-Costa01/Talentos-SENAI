function auditLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.id || 'anon';
    console.log(
      `[AUDIT] user=${userId} method=${req.method} path=${req.originalUrl} status=${res.statusCode} durationMs=${duration}`
    );
  });

  next();
}

module.exports = auditLogger;
