const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authMiddleware = require('./middlewares/authMiddleware');
const auditLogger = require('./middlewares/auditLogger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const vagaRoutes = require('./routes/vagaRoutes');
const candidaturaRoutes = require('./routes/candidaturaRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');

const app = express();
const frontendPath = path.join(__dirname, '..', 'Front-end');

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(auditLogger);
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.redirect('/html/login.html');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);

app.use(authMiddleware);
app.use('/alunos', alunoRoutes);
app.use('/vagas', vagaRoutes);
app.use('/candidaturas', candidaturaRoutes);
app.use('/relatorios', relatorioRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
