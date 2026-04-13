(() => {
  const tokenKey = 'talentos_senai_token';
  const userKey = 'talentos_senai_user';

  const apiBaseFromWindow = typeof window.__API_BASE_URL__ === 'string' ? window.__API_BASE_URL__ : '';
  const storedApiBase = window.localStorage.getItem('API_BASE_URL') || '';
  const detectedBase = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:3000';
  const apiBaseUrl = (apiBaseFromWindow || storedApiBase || detectedBase).replace(/\/$/, '');

  function isLoginPage() {
    return Boolean(document.getElementById('formLogin'));
  }

  function getToken() {
    return window.localStorage.getItem(tokenKey) || '';
  }

  function getCurrentUser() {
    const raw = window.localStorage.getItem(userKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function setSession(authData) {
    window.localStorage.setItem(tokenKey, authData.token);
    window.localStorage.setItem(userKey, JSON.stringify(authData.usuario || {}));
  }

  function clearSession() {
    window.localStorage.removeItem(tokenKey);
    window.localStorage.removeItem(userKey);
  }

  function buildUrl(path) {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return `${apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  async function apiFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const authRequired = options.authRequired !== false;

    if (authRequired) {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    let body = options.body;
    const isPlainObject =
      body &&
      typeof body === 'object' &&
      !(body instanceof FormData) &&
      !(body instanceof Blob) &&
      !(body instanceof URLSearchParams);

    if (isPlainObject) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(body);
    }

    const response = await fetch(buildUrl(path), {
      ...options,
      headers,
      body,
    });

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        data = text;
      }
    }

    if (!response.ok) {
      const error = new Error((data && data.message) || 'Falha ao chamar a API.');
      error.status = response.status;
      error.data = data;

      if (response.status === 401 && authRequired && !isLoginPage()) {
        clearSession();
        window.location.href = 'login.html';
      }

      throw error;
    }

    return data;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function formatDate(value) {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString('pt-BR');
  }

  function normalizeText(value) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function parseKeywords(value) {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(/[;,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }

  function showMessage(container, text, kind = 'error') {
    if (!container) return;

    container.textContent = text;
    container.className = kind === 'success' ? 'form-message success' : 'form-message error';
    container.hidden = false;
  }

  function hideMessage(container) {
    if (!container) return;

    container.hidden = true;
    container.textContent = '';
    container.className = 'form-message';
  }

  function setButtonState(button, isLoading, loadingText) {
    if (!button) return;

    if (isLoading) {
      button.dataset.originalText = button.textContent;
      button.textContent = loadingText;
      button.disabled = true;
      return;
    }

    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }

  function switchAuthTab(tabName) {
    document.querySelectorAll('[data-auth-tab]').forEach((tab) => {
      const isActive = tab.getAttribute('data-auth-tab') === tabName;
      tab.classList.toggle('active', isActive);
    });

    document.querySelectorAll('[data-auth-panel]').forEach((panel) => {
      const isActive = panel.getAttribute('data-auth-panel') === tabName;
      panel.hidden = !isActive;
      panel.classList.toggle('active', isActive);
    });
  }

  function bindAuthTabs() {
    const tabs = document.querySelectorAll('[data-auth-tab]');
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-auth-tab');
        switchAuthTab(target);
      });
    });
  }

  function updateUserLabels() {
    const user = getCurrentUser();
    if (!user) return;

    document.querySelectorAll('.user-menu span').forEach((element) => {
      element.textContent = `👤 ${user.nome || 'Usuário'}`;
    });

    document.querySelectorAll('.user-dropdown span').forEach((element) => {
      element.textContent = user.nome || 'Usuário';
    });
  }

  function bindLogout() {
    document.querySelectorAll('[data-logout]').forEach((element) => {
      element.addEventListener('click', () => {
        clearSession();
      });
    });
  }

  function getQueryParams() {
    return new URLSearchParams(window.location.search);
  }

  function redirectToLoginIfNeeded() {
    if (isLoginPage()) return;
    if (getToken()) return;

    window.location.href = 'login.html';
  }

  async function bindLoginForm() {
    const form = document.getElementById('formLogin');
    if (!form) return;

    if (getToken()) {
      window.location.href = 'dashboard.html';
      return;
    }

    const message = document.getElementById('loginMessage');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideMessage(message);
      setButtonState(submitButton, true, 'Entrando...');

      try {
        const payload = {
          email: document.getElementById('email').value.trim(),
          senha: document.getElementById('senha').value,
        };

        const data = await apiFetch('/auth/login', {
          method: 'POST',
          authRequired: false,
          body: payload,
        });

        setSession(data);
        window.location.href = 'dashboard.html';
      } catch (error) {
        showMessage(message, error.message || 'Falha no login.');
      } finally {
        setButtonState(submitButton, false);
      }
    });
  }

  async function bindRegisterForm() {
    const form = document.getElementById('formRegister');
    if (!form) return;

    const message = document.getElementById('registerMessage');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideMessage(message);
      setButtonState(submitButton, true, 'Criando...');

      try {
        const payload = {
          nome: document.getElementById('registerNome').value.trim(),
          email: document.getElementById('registerEmail').value.trim(),
          senha: document.getElementById('registerSenha').value,
        };

        await apiFetch('/auth/register', {
          method: 'POST',
          authRequired: false,
          body: payload,
        });

        form.reset();
        showMessage(message, 'Conta criada com sucesso. Agora faça seu login.', 'success');
        switchAuthTab('login');
      } catch (error) {
        showMessage(message, error.message || 'Falha ao criar conta.');
      } finally {
        setButtonState(submitButton, false);
      }
    });
  }

  async function bindForgotPasswordForm() {
    const form = document.getElementById('formForgotPassword');
    if (!form) return;

    const message = document.getElementById('forgotMessage');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideMessage(message);
      setButtonState(submitButton, true, 'Redefinindo...');

      try {
        const payload = {
          email: document.getElementById('forgotEmail').value.trim(),
          nova_senha: document.getElementById('forgotNovaSenha').value,
        };

        await apiFetch('/auth/forgot-password', {
          method: 'POST',
          authRequired: false,
          body: payload,
        });

        form.reset();
        showMessage(message, 'Senha redefinida com sucesso. Faça login com a nova senha.', 'success');
        switchAuthTab('login');
      } catch (error) {
        showMessage(message, error.message || 'Falha ao redefinir senha.');
      } finally {
        setButtonState(submitButton, false);
      }
    });
  }

  async function bindAlunoForm() {
    const form = document.getElementById('formCadastroAluno');
    if (!form) return;

    const message = document.getElementById('alunoMessage');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideMessage(message);
      setButtonState(submitButton, true, 'Salvando...');

      try {
        const payload = {
          tipo_aluno: 'senai',
          nome: document.getElementById('nomeCompleto').value.trim(),
          email: document.getElementById('email').value.trim(),
          contato: document.getElementById('contato').value.trim(),
          curso: document.getElementById('curso').value.trim(),
          ano_conclusao: Number(document.getElementById('anoConclusao').value),
          turma: document.getElementById('turma').value.trim(),
          descricao: document.getElementById('descricao').value.trim(),
        };

        const data = await apiFetch('/alunos', {
          method: 'POST',
          body: payload,
        });

        form.reset();
        document.getElementById('charCount').textContent = '0';
        showMessage(message, `Aluno ${data.nome} cadastrado com sucesso.`, 'success');
      } catch (error) {
        showMessage(message, error.message || 'Falha ao cadastrar aluno.');
      } finally {
        setButtonState(submitButton, false);
      }
    });

    const descricao = document.getElementById('descricao');
    const charCount = document.getElementById('charCount');
    if (descricao && charCount) {
      descricao.addEventListener('input', () => {
        charCount.textContent = String(descricao.value.length);
      });
    }
  }

  async function bindVagaForm() {
    const form = document.getElementById('formCriarVaga');
    if (!form) return;

    const message = document.getElementById('vagaMessage');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideMessage(message);
      setButtonState(submitButton, true, 'Criando...');

      try {
        const payload = {
          titulo: document.getElementById('tituloVaga').value.trim(),
          descricao: document.getElementById('descricaoVaga').value.trim(),
          empresa: document.getElementById('empresa').value.trim(),
          data_expiracao: document.getElementById('dataExpiracao').value,
          requisitos: parseKeywords(document.getElementById('requisitos').value),
        };

        const data = await apiFetch('/vagas', {
          method: 'POST',
          body: payload,
        });

        form.reset();
        document.getElementById('charCountDescricao').textContent = '0';
        document.getElementById('charCountRequisitos').textContent = '0';
        showMessage(message, `Vaga ${data.titulo} criada com sucesso.`, 'success');
      } catch (error) {
        showMessage(message, error.message || 'Falha ao criar vaga.');
      } finally {
        setButtonState(submitButton, false);
      }
    });

    const descricaoVaga = document.getElementById('descricaoVaga');
    const charCountDescricao = document.getElementById('charCountDescricao');
    if (descricaoVaga && charCountDescricao) {
      descricaoVaga.addEventListener('input', () => {
        charCountDescricao.textContent = String(descricaoVaga.value.length);
      });
    }

    const requisitos = document.getElementById('requisitos');
    const charCountRequisitos = document.getElementById('charCountRequisitos');
    if (requisitos && charCountRequisitos) {
      requisitos.addEventListener('input', () => {
        charCountRequisitos.textContent = String(requisitos.value.length);
      });
    }
  }

  function renderVagasCards(vagas, container) {
    if (!container) return;

    if (!vagas.length) {
      container.innerHTML = '<div class="empty-state">Nenhuma vaga encontrada com os filtros atuais.</div>';
      return;
    }

    container.innerHTML = vagas
      .map((vaga) => {
        const requisitos = parseKeywords(vaga.requisitos);
        const requisitosText = requisitos.length ? requisitos.join(', ') : 'Sem requisitos informados';

        return `
          <div class="vaga-card">
            <div class="vaga-header">
              <div class="vaga-title-section">
                <h3>${escapeHtml(vaga.titulo)}</h3>
                <span class="status-badge ${escapeHtml(vaga.status)}">${escapeHtml(vaga.status)}</span>
              </div>
            </div>

            <div class="vaga-info">
              <div class="info-row">
                <span class="info-label">Empresa:</span>
                <span class="info-value">${escapeHtml(vaga.empresa)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Expiração:</span>
                <span class="info-value">${formatDate(vaga.data_expiracao)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Requisitos:</span>
                <span class="info-value">${escapeHtml(requisitosText)}</span>
              </div>
            </div>

            <p class="vaga-description">${escapeHtml(vaga.descricao)}</p>

            <div class="vaga-stats">
              <span class="stat">👥 ${Number(vaga.totalCandidatos || 0)} <small>Candidatos</small></span>
              <span class="stat">✅ ${Number(vaga.totalCompativeis || 0)} <small>Compatíveis</small></span>
            </div>

            <a href="relatorios.html?vaga=${encodeURIComponent(vaga.id)}&tipo=candidatos" class="btn btn-primary">Ver candidatos</a>
          </div>
        `;
      })
      .join('');
  }

  async function loadVagas() {
    const container = document.getElementById('vagasList');
    if (!container) return;

    const status = document.getElementById('filterStatus')?.value || '';
    const empresa = document.getElementById('filterEmpresa')?.value || '';
    const curso = document.getElementById('filterCurso')?.value || '';
    const search = document.getElementById('searchInput')?.value.trim() || '';

    const params = new URLSearchParams({ limit: '100', page: '1' });
    if (status) params.set('status', status);

    const response = await apiFetch(`/vagas?${params.toString()}`);
    const vagas = Array.isArray(response?.data) ? response.data : [];

    const filtered = vagas.filter((vaga) => {
      const searchable = normalizeText([vaga.titulo, vaga.empresa, vaga.descricao, vaga.requisitos]
        .flatMap((item) => parseKeywords(item))
        .join(' '));

      const matchesSearch = !search || searchable.includes(normalizeText(search));
      const matchesEmpresa = !empresa || searchable.includes(normalizeText(empresa));
      const matchesCurso = !curso || searchable.includes(normalizeText(curso));

      return matchesSearch && matchesEmpresa && matchesCurso;
    });

    const enriched = await Promise.all(
      filtered.map(async (vaga) => {
        const [candidatos, compatibilidade] = await Promise.all([
          apiFetch(`/vagas/${vaga.id}/quantidade-candidatos`).catch(() => ({ total_candidatos: 0 })),
          apiFetch(`/vagas/${vaga.id}/compatibilidade`).catch(() => ({ total: 0 })),
        ]);

        return {
          ...vaga,
          totalCandidatos: candidatos.total_candidatos || 0,
          totalCompativeis: compatibilidade.total || 0,
        };
      })
    );

    renderVagasCards(enriched, container);
  }

  function bindVagasPage() {
    const container = document.getElementById('vagasList');
    if (!container) return;

    const filters = ['searchInput', 'filterEmpresa', 'filterCurso', 'filterStatus']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const refresh = async () => {
      try {
        container.innerHTML = '<div class="empty-state">Carregando vagas...</div>';
        await loadVagas();
      } catch (error) {
        container.innerHTML = `<div class="empty-state">${escapeHtml(error.message || 'Falha ao carregar vagas.')}</div>`;
      }
    };

    document.querySelector('.filter-btn')?.addEventListener('click', refresh);
    document.querySelector('.search-btn')?.addEventListener('click', refresh);

    filters.forEach((filter) => {
      filter.addEventListener('change', refresh);
    });

    refresh();
  }

  function renderAlunosTable(alunos, tbody) {
    if (!tbody) return;

    if (!alunos.length) {
      tbody.innerHTML = '<tr><td colspan="6">Nenhum aluno encontrado com os filtros atuais.</td></tr>';
      return;
    }

    tbody.innerHTML = alunos
      .map(
        (aluno) => `
          <tr>
            <td><a href="perfil-aluno.html?id=${encodeURIComponent(aluno.id)}" class="link-nome">${escapeHtml(aluno.nome)}</a></td>
            <td>${escapeHtml(aluno.email)}</td>
            <td>${escapeHtml(aluno.curso || '-')}</td>
            <td>${escapeHtml(aluno.turma || '-')}</td>
            <td>${escapeHtml(aluno.ano_conclusao || '-')}</td>
            <td class="acoes">
              <a href="perfil-aluno.html?id=${encodeURIComponent(aluno.id)}" class="btn-icon edit" title="Editar">✏️ Editar</a>
              <button class="btn-icon delete" title="Excluir" data-delete-aluno="${aluno.id}" data-aluno-nome="${escapeHtml(aluno.nome)}">❌ Excluir</button>
            </td>
          </tr>
        `
      )
      .join('');

    tbody.querySelectorAll('[data-delete-aluno]').forEach((button) => {
      button.addEventListener('click', async () => {
        const alunoId = button.getAttribute('data-delete-aluno');
        const alunoNome = button.getAttribute('data-aluno-nome');

        if (!window.confirm(`Deseja excluir ${alunoNome}?`)) return;

        try {
          await apiFetch(`/alunos/${alunoId}`, { method: 'DELETE' });
          await loadAlunos();
        } catch (error) {
          window.alert(error.message || 'Falha ao excluir aluno.');
        }
      });
    });
  }

  async function loadAlunos() {
    const tbody = document.getElementById('alunosTableBody');
    if (!tbody) return;

    const curso = document.getElementById('filterCurso')?.value || '';
    const turma = document.getElementById('filterTurma')?.value || '';
    const ano = document.getElementById('filterAno')?.value || '';
    const search = document.getElementById('searchInput')?.value.trim() || '';

    const params = new URLSearchParams({ limit: '100', page: '1' });
    if (curso) params.set('curso', curso);
    if (turma) params.set('turma', turma);
    if (ano) params.set('ano_conclusao', ano);

    const response = await apiFetch(`/alunos?${params.toString()}`);
    const alunos = Array.isArray(response?.data) ? response.data : [];

    const filtered = alunos.filter((aluno) => {
      if (!search) return true;

      const searchable = normalizeText([aluno.nome, aluno.email, aluno.curso, aluno.turma, aluno.descricao]
        .filter(Boolean)
        .join(' '));

      return searchable.includes(normalizeText(search));
    });

    renderAlunosTable(filtered, tbody);
  }

  function bindAlunosPage() {
    const tbody = document.getElementById('alunosTableBody');
    if (!tbody) return;

    const filters = ['searchInput', 'filterCurso', 'filterTurma', 'filterAno']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const refresh = async () => {
      try {
        tbody.innerHTML = '<tr><td colspan="6">Carregando alunos...</td></tr>';
        await loadAlunos();
      } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6">${escapeHtml(error.message || 'Falha ao carregar alunos.')}</td></tr>`;
      }
    };

    document.querySelector('.filter-btn')?.addEventListener('click', refresh);
    document.querySelector('.search-btn')?.addEventListener('click', refresh);

    filters.forEach((filter) => {
      filter.addEventListener('change', refresh);
    });

    refresh();
  }

  function renderRelatorioRows(items, tbody) {
    if (!tbody) return;

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="7">Nenhum resultado encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = items
      .map((item) => {
        const aluno = item.aluno || item;
        const isCompatibilidade = item.score !== undefined;
        const statusLabel = isCompatibilidade ? `COMPATÍVEL (${item.score})` : item.candidaturas ? 'CANDIDATO' : 'ALUNO';

        return `
          <tr>
            <td>${escapeHtml(aluno.nome)}</td>
            <td>${escapeHtml(aluno.email)}</td>
            <td>${escapeHtml(aluno.contato || '-')}</td>
            <td>${escapeHtml(aluno.curso || '-')}</td>
            <td>${escapeHtml(aluno.turma || '-')}</td>
            <td>${escapeHtml(aluno.ano_conclusao || '-')}</td>
            <td><span class="badge badge-info">${escapeHtml(statusLabel)}</span></td>
          </tr>
        `;
      })
      .join('');
  }

  async function populateVagasFilter(selectElement) {
    if (!selectElement) return;

    try {
      const response = await apiFetch('/vagas?limit=100&page=1&status=ativa');
      const vagas = Array.isArray(response?.data) ? response.data : [];

      const options = ['<option value="">Todas as vagas</option>'];
      vagas.forEach((vaga) => {
        options.push(`<option value="${vaga.id}">${escapeHtml(vaga.titulo)} - ${escapeHtml(vaga.empresa)}</option>`);
      });

      selectElement.innerHTML = options.join('');
    } catch (error) {
      selectElement.innerHTML = '<option value="">Todas as vagas</option>';
    }
  }

  async function loadRelatorio() {
    const tbody = document.getElementById('relatorioTableBody');
    if (!tbody) return;

    const params = new URLSearchParams();
    const turma = document.getElementById('filterTurma')?.value || '';
    const vaga = document.getElementById('filterVaga')?.value || '';
    const curso = document.getElementById('filterCurso')?.value || '';
    const ano = document.getElementById('filterAno')?.value || '';
    const tipo = document.getElementById('filterTipoRelatorio')?.value || '';
    const search = document.getElementById('searchKeyword')?.value.trim() || '';

    if (turma) params.set('turma', turma);
    if (vaga) params.set('vaga', vaga);
    if (ano) params.set('ano_conclusao', ano);
    if (tipo === 'candidatos') params.set('apenas_candidatos', 'true');
    if (tipo === 'compativeis') params.set('apenas_compativeis', 'true');

    const response = await apiFetch(`/relatorios/alunos?${params.toString()}`);
    const alunos = Array.isArray(response?.data) ? response.data : [];

    const filtered = alunos.filter((item) => {
      const aluno = item.aluno || item;
      const searchable = normalizeText([aluno.nome, aluno.email, aluno.contato, aluno.curso, aluno.turma, aluno.descricao]
        .filter(Boolean)
        .join(' '));

      const cursoOk = !curso || searchable.includes(normalizeText(curso));
      const searchOk = !search || searchable.includes(normalizeText(search));

      return cursoOk && searchOk;
    });

    renderRelatorioRows(filtered, tbody);
  }

  function bindRelatorioPage() {
    const tbody = document.getElementById('relatorioTableBody');
    if (!tbody) return;

    const query = getQueryParams();
    const filterVaga = document.getElementById('filterVaga');
    const filterTipo = document.getElementById('filterTipoRelatorio');

    const refresh = async () => {
      try {
        tbody.innerHTML = '<tr><td colspan="7">Gerando relatório...</td></tr>';
        await loadRelatorio();
      } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7">${escapeHtml(error.message || 'Falha ao gerar relatório.')}</td></tr>`;
      }
    };

    populateVagasFilter(filterVaga)
      .then(() => {
        const vagaFromQuery = query.get('vaga');
        const tipoFromQuery = query.get('tipo');

        if (vagaFromQuery && filterVaga) {
          filterVaga.value = vagaFromQuery;
        }

        if (tipoFromQuery && filterTipo && ['candidatos', 'compativeis'].includes(tipoFromQuery)) {
          filterTipo.value = tipoFromQuery;
        }

        refresh();
      })
      .catch(() => {
        refresh();
      });

    const filters = ['filterTurma', 'filterVaga', 'filterCurso', 'filterAno', 'filterTipoRelatorio', 'searchKeyword']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    document.querySelector('.btn-primary')?.addEventListener('click', refresh);
    document.querySelector('.btn-secondary')?.addEventListener('click', () => {
      filters.forEach((filter) => {
        filter.value = '';
      });
      refresh();
    });

    filters.forEach((filter) => {
      filter.addEventListener('change', refresh);
    });
  }

  async function loadPerfilAluno() {
    const profileName = document.getElementById('profileNome');
    if (!profileName) return;

    const params = getQueryParams();
    const alunoId = params.get('id');

    if (!alunoId) {
      profileName.textContent = 'Selecione um aluno na listagem';
      return;
    }

    const aluno = await apiFetch(`/alunos/${alunoId}`);

    const mapping = {
      profileNome: aluno.nome,
      profileEmail: aluno.email,
      profileContato: aluno.contato,
      profileCurso: aluno.curso,
      profileAno: aluno.ano_conclusao,
      profileTurma: aluno.turma,
      profileDescricao: aluno.descricao,
      profileNomeResumido: aluno.nome,
      profileCursoResumido: aluno.curso,
      profileContatoResumido: aluno.contato,
    };

    Object.entries(mapping).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (!element) return;

      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = value || '';
        return;
      }

      element.textContent = value || '-';
    });
  }

  function bindPerfilPage() {
    const profileName = document.getElementById('profileNome');
    if (!profileName) return;

    loadPerfilAluno().catch((error) => {
      profileName.textContent = error.message || 'Falha ao carregar aluno.';
    });

    document.querySelector('.btn-secondary')?.addEventListener('click', async () => {
      const params = getQueryParams();
      const alunoId = params.get('id');

      if (!alunoId) return;

      if (!window.confirm('Deseja excluir este aluno?')) return;

      try {
        await apiFetch(`/alunos/${alunoId}`, { method: 'DELETE' });
        window.location.href = 'visualizar-alunos.html';
      } catch (error) {
        window.alert(error.message || 'Falha ao excluir aluno.');
      }
    });
  }

  async function bindDashboardPage() {
    const userName = document.getElementById('dashboardUserName');
    const user = getCurrentUser();
    if (userName && user) {
      userName.textContent = user.nome || 'Pedagogo';
    }
  }

  function bindHomePage() {
    const homeButtons = document.querySelectorAll('.home-buttons a');
    homeButtons.forEach((button) => {
      if (button.getAttribute('href') === 'criar-vaga.html') {
        button.setAttribute('href', 'visualizar-vagas.html');
      }
    });
  }

  async function main() {
    bindLogout();
    updateUserLabels();
    bindHomePage();
    bindAuthTabs();

    await bindLoginForm();
    await bindRegisterForm();
    await bindForgotPasswordForm();

    if (isLoginPage()) {
      return;
    }

    if (!getToken()) {
      redirectToLoginIfNeeded();
      return;
    }

    await bindAlunoForm();
    await bindVagaForm();
    bindVagasPage();
    bindAlunosPage();
    bindRelatorioPage();
    bindPerfilPage();
    await bindDashboardPage();
  }

  document.addEventListener('DOMContentLoaded', () => {
    main().catch((error) => {
      console.error(error);
    });
  });
})();