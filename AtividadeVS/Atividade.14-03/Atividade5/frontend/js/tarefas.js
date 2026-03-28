// frontend/js/tarefas.js
let todasTarefas = [];
let filtroAtual = 'all';
let termoBusca = '';

document.addEventListener('DOMContentLoaded', function() {
    carregarTarefas();
    configurarEventos();
});

function configurarEventos() {
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtroAtual = this.dataset.filter;
            renderizarTarefas();
        });
    });

    // Busca
    const searchInput = document.getElementById('searchTarefa');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            termoBusca = e.target.value.toLowerCase();
            renderizarTarefas();
        });
    }

    // Botão nova tarefa
    const novaBtn = document.getElementById('novaTarefaBtn');
    if (novaBtn) novaBtn.addEventListener('click', abrirModalNova);

    // Formulário
    const form = document.getElementById('tarefaForm');
    if (form) form.addEventListener('submit', salvarTarefa);
}

async function carregarTarefas() {
    try {
        const response = await fetch('/api/tarefas');
        const data = await response.json();
        todasTarefas = Object.values(data).sort((a,b) => b.id - a.id);
        atualizarEstatisticas();
        renderizarTarefas();
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        showToast('Erro ao carregar tarefas', 'error');
    }
}

function atualizarEstatisticas() {
    const total = todasTarefas.length;
    const pendentes = todasTarefas.filter(t => t.status === 'pendente').length;
    const concluidas = total - pendentes;
    document.getElementById('totalTasksCount').textContent = total;
    document.getElementById('pendingTasksCount').textContent = pendentes;
    document.getElementById('completedTasksCount').textContent = concluidas;
}

function renderizarTarefas() {
    let tarefasFiltradas = [...todasTarefas];

    // Filtro por status/prioridade
    if (filtroAtual === 'pendente') {
        tarefasFiltradas = tarefasFiltradas.filter(t => t.status === 'pendente');
    } else if (filtroAtual === 'concluida') {
        tarefasFiltradas = tarefasFiltradas.filter(t => t.status === 'concluida');
    } else if (filtroAtual === 'alta') {
        tarefasFiltradas = tarefasFiltradas.filter(t => t.prioridade === 'alta' && t.status === 'pendente');
    }

    // Filtro por busca
    if (termoBusca) {
        tarefasFiltradas = tarefasFiltradas.filter(t =>
            t.titulo.toLowerCase().includes(termoBusca) ||
            (t.descricao && t.descricao.toLowerCase().includes(termoBusca))
        );
    }

    const container = document.getElementById('tasksContainer');
    if (tarefasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h3>Nenhuma tarefa encontrada</h3>
                <p>Clique em "Nova Tarefa" para começar a organizar suas atividades.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tarefasFiltradas.map(tarefa => `
        <div class="task-card ${tarefa.status === 'concluida' ? 'completed' : ''}" data-id="${tarefa.id}">
            <div class="task-status">
                <input type="checkbox" ${tarefa.status === 'concluida' ? 'checked' : ''} onchange="toggleStatus(${tarefa.id})">
            </div>
            <div class="task-content">
                <div class="task-header">
                    <h3>${escapeHtml(tarefa.titulo)}</h3>
                    <div class="task-badges">
                        <span class="priority-badge ${tarefa.prioridade}">${getPrioridadeTexto(tarefa.prioridade)}</span>
                        ${tarefa.prazo ? `<span class="due-date"><i class="fas fa-calendar-alt"></i> ${formatarData(tarefa.prazo)}</span>` : ''}
                    </div>
                </div>
                ${tarefa.descricao ? `<p class="task-description">${escapeHtml(tarefa.descricao)}</p>` : ''}
                <div class="task-meta">
                    <span class="task-date">Criada em: ${formatarDataCompleta(tarefa.criado_em)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="icon-btn edit" onclick="editarTarefa(${tarefa.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn delete" onclick="deletarTarefa(${tarefa.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function toggleStatus(tarefaId) {
    try {
        const response = await fetch(`/api/tarefas/${tarefaId}/toggle`, { method: 'PUT' });
        const result = await response.json();
        if (result.success) {
            await carregarTarefas();
            showToast('Status atualizado!', 'success');
        } else {
            showToast('Erro ao atualizar status', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao atualizar status', 'error');
    }
}

function abrirModalNova() {
    document.getElementById('modalTitle').textContent = 'Nova Tarefa';
    document.getElementById('editId').value = '';
    document.getElementById('titulo').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('prioridade').value = 'media';
    document.getElementById('prazo').value = '';
    document.getElementById('tarefaModal').style.display = 'flex';
}

function editarTarefa(id) {
    const tarefa = todasTarefas.find(t => t.id === id);
    if (!tarefa) return;

    document.getElementById('modalTitle').textContent = 'Editar Tarefa';
    document.getElementById('editId').value = tarefa.id;
    document.getElementById('titulo').value = tarefa.titulo;
    document.getElementById('descricao').value = tarefa.descricao || '';
    document.getElementById('prioridade').value = tarefa.prioridade;
    document.getElementById('prazo').value = tarefa.prazo || '';
    document.getElementById('tarefaModal').style.display = 'flex';
}

async function salvarTarefa(event) {
    event.preventDefault();

    const id = document.getElementById('editId').value;
    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value;
    const prioridade = document.getElementById('prioridade').value;
    const prazo = document.getElementById('prazo').value;

    if (!titulo) {
        showToast('Informe o título da tarefa', 'error');
        return;
    }

    const payload = { titulo, descricao, prioridade, prazo };

    let url = '/api/tarefas';
    let method = 'POST';
    if (id) {
        url = `/api/tarefas/${id}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok && result.success) {
            showToast(id ? 'Tarefa atualizada!' : 'Tarefa criada!', 'success');
            fecharModal();
            await carregarTarefas();
        } else {
            showToast(result.message || 'Erro ao salvar', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao conectar com o servidor', 'error');
    }
}

async function deletarTarefa(id) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
        const response = await fetch(`/api/tarefas/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (response.ok && result.success) {
            showToast('Tarefa excluída!', 'success');
            await carregarTarefas();
        } else {
            showToast(result.message || 'Erro ao excluir', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao conectar com o servidor', 'error');
    }
}

function fecharModal() {
    document.getElementById('tarefaModal').style.display = 'none';
}

function getPrioridadeTexto(prioridade) {
    const map = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
    return map[prioridade] || prioridade;
}

function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarDataCompleta(dataISO) {
    if (!dataISO) return '';
    try {
        const data = new Date(dataISO);
        return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return dataISO;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        fetch('/api/logout', { method: 'POST' })
            .then(() => window.location.href = '/');
    }
}