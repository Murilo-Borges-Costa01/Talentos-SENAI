# Banco de Talentos SENAI - Backend

API RESTful em Node.js + Express + MySQL usando Sequelize com arquitetura MVC.

## Stack

- Node.js
- Express
- MySQL
- Sequelize (ORM)
- JWT (autenticação)
- bcryptjs (hash de senha)
- express-validator (validação)
- helmet, cors, morgan

## Estrutura do Projeto

```txt
src/
  app.js
  server.js
  config/
    database.js
  models/
    Aluno.js
    Vaga.js
    Candidatura.js
    Usuario.js
    index.js
  controllers/
    authController.js
    alunoController.js
    vagaController.js
    candidaturaController.js
    relatorioController.js
  routes/
    authRoutes.js
    alunoRoutes.js
    vagaRoutes.js
    candidaturaRoutes.js
    relatorioRoutes.js
  middlewares/
    authMiddleware.js
    validateRequest.js
    errorHandler.js
    auditLogger.js
  validators/
    authValidator.js
    alunoValidator.js
    vagaValidator.js
    candidaturaValidator.js
    relatorioValidator.js
  utils/
    asyncHandler.js
    compatibility.js
    pagination.js
    seed.js
    vagaStatus.js
```

## Configuração

1. Copie `.env.example` para `.env`.
2. Ajuste as credenciais do MySQL e JWT.
3. Para atualizar estrutura das tabelas automaticamente em desenvolvimento, mantenha `DB_SYNC_ALTER=true`.
4. Instale dependências:

```bash
npm install
```

5. Crie/verifique o banco automaticamente:

```bash
npm run db:setup
```

6. Rode em desenvolvimento:

```bash
npm run dev
```

A API criará as tabelas automaticamente via `sequelize.sync()`.

## Autenticação

- Endpoint público: `POST /auth/login`
- Todas as demais rotas exigem JWT em `Authorization: Bearer <token>`.

## Endpoints

### Auth

- `POST /auth/login`

### Alunos

- `POST /alunos`
- `GET /alunos`
- `GET /alunos/:id`
- `PUT /alunos/:id`
- `DELETE /alunos/:id`

Filtros em `GET /alunos`:

- `curso`
- `turma`
- `ano_conclusao`
- `palavras_chave` (separadas por vírgula)
- Paginação: `page`, `limit`
- Ordenação: `sortBy`, `order=ASC|DESC`

### Vagas

- `POST /vagas`
- `GET /vagas` (por padrão retorna apenas ativas)
- `GET /vagas/:id`
- `PUT /vagas/:id`
- `DELETE /vagas/:id`
- `PATCH /vagas/:id/encerrar`
- `GET /vagas/:id/compatibilidade`
- `GET /vagas/:id/candidatos`
- `GET /vagas/:id/quantidade-candidatos`

### Candidaturas

- `POST /candidaturas`
- `DELETE /candidaturas/:id`

### Relatórios

- `GET /relatorios/alunos`

Filtros:

- `turma`
- `vaga`
- `apenas_candidatos=true|false`
- `apenas_compativeis=true|false`
- `ano_conclusao`

## Exemplos de Requisições JSON

### Login

```json
{
  "email": "pedagogo@senai.com",
  "senha": "123456"
}
```

### Criar Aluno

```json
{
  "tipo_aluno": "senai",
  "nome": "Maria Souza",
  "email": "maria.souza@aluno.senai.br",
  "contato": "(11) 99999-0000",
  "curso": "Desenvolvimento de Sistemas",
  "ano_conclusao": 2026,
  "turma": "DS-2026-A",
  "descricao": "Conhecimento em Node.js, SQL e Git"
}
```

### Criar Aluno Externo (sem curso/ano/turma)

```json
{
  "tipo_aluno": "externo",
  "nome": "Joao Lima",
  "email": "joao.lima@gmail.com",
  "contato": "(11) 98888-7777",
  "descricao": "Experiência em atendimento e logística"
}
```

### Criar Vaga

```json
{
  "titulo": "Estágio em Desenvolvimento Web",
  "descricao": "Atuar com APIs REST e integração com banco de dados",
  "empresa": "Empresa Exemplo",
  "data_expiracao": "2026-12-31",
  "requisitos": ["node.js", "mysql", "api rest", "git"]
}
```

### Candidatar Aluno

```json
{
  "id_aluno": 1,
  "id_vaga": 1
}
```

## Regras Implementadas

- Email de aluno e usuário é único.
- Para aluno `senai`, curso/ano_conclusao/turma são obrigatórios.
- Para aluno `externo`, curso/ano_conclusao/turma são opcionais.
- Não permite vaga sem descrição.
- Não permite candidatura duplicada (índice único + validação).
- Vagas expiradas são atualizadas automaticamente para `expirada`.
- Vagas padrão de listagem retornam apenas `ativas`.
- Senhas armazenadas com hash (`bcryptjs`).
- ORM Sequelize evita SQL Injection por query parametrizada.
- Middleware global de erro e auditoria básica de ações.
- Paginação e ordenação nas listagens principais.
