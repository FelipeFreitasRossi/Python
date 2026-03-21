let todasTarefas = [];
let filtroAtual = 'todas';

// Carregar tarefas ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    carregarTarefas();
});

async function carregarTarefas() {
    try {
        const response = await fetch('/api/tarefas');
        const tarefas = await response.json();
        
        // Converter objeto para array
        todasTarefas = Object.values(tarefas).sort((a, b) => b.id - a.id);
        
        renderizarTarefas();
        atualizarDashboardStats();
        
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
    }
}

function renderizarTarefas() {
    const container = document.getElementById('listaTarefas');
    let tarefasFiltradas = todasTarefas;
    
    // Aplicar filtro
    switch(filtroAtual) {
        case 'pendente':
            tarefasFiltradas = todasTarefas.filter(t => t.status === 'pendente');
            break;
        case 'concluida':
            tarefasFiltradas = todasTarefas.filter(t => t.status === 'concluida');
            break;
        case 'alta':
            tarefasFiltradas = todasTarefas.filter(t => t.prioridade === 'alta' && t.status === 'pendente');
            break;
        default:
            // Todas as tarefas
            break;
    }
    
    if (tarefasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>Nenhuma tarefa encontrada</p>
                <button class="btn-primary" onclick="abrirModalNovaTarefa()">Criar nova tarefa</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tarefasFiltradas.map(tarefa => `
        <div class="tarefa-card ${tarefa.status === 'concluida' ? 'concluida' : ''}" data-id="${tarefa.id}">
            <div class="tarefa-status">
                <input type="checkbox" 
                       ${tarefa.status === 'concluida' ? 'checked' : ''} 
                       onchange="toggleStatus(${tarefa.id})">
            </div>
            <div class="tarefa-conteudo">
                <h3>${escapeHtml(tarefa.titulo)}</h3>
                <p>${escapeHtml(tarefa.descricao || 'Sem descrição')}</p>
                ${tarefa.prazo ? `<div class="tarefa-prazo"><i class="fas fa-calendar"></i> Prazo: ${formatarData(tarefa.prazo)}</div>` : ''}
            </div>
            <div class="tarefa-info">
                <span class="prioridade prioridade-${tarefa.prioridade}">
                    ${getPrioridadeTexto(tarefa.prioridade)}
                </span>
                <div class="tarefa-acoes">
                    <button class="icon-btn" onclick="editarTarefa(${tarefa.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete" onclick="excluirTarefa(${tarefa.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function atualizarDashboardStats() {
    const total = todasTarefas.length;
    const concluidas = todasTarefas.filter(t => t.status === 'concluida').length;
    const progresso = total > 0 ? (concluidas / total * 100) : 0;
    
    // Atualizar o card no dashboard (se existir)
    const totalTarefasEl = document.getElementById('totalTarefas');
    const tarefasConcluidasEl = document.getElementById('tarefasConcluidas');
    const progressoEl = document.getElementById('progressoTarefas');
    
    if (totalTarefasEl) totalTarefasEl.textContent = total;
    if (tarefasConcluidasEl) tarefasConcluidasEl.textContent = concluidas;
    if (progressoEl) progressoEl.style.width = `${progresso}%`;
    
    // Armazenar no localStorage para sincronizar com outras páginas
    localStorage.setItem('tarefasStats', JSON.stringify({ total, concluidas, progresso }));
}

async function toggleStatus(tarefaId) {
    try {
        const response = await fetch(`/api/tarefas/${tarefaId}/toggle`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            await carregarTarefas();
        }
    } catch (error) {
        console.error('Erro ao alterar status:', error);
    }
}

async function excluirTarefa(tarefaId) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    
    try {
        const response = await fetch(`/api/tarefas/${tarefaId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await carregarTarefas();
            showToast('Tarefa excluída com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        showToast('Erro ao excluir tarefa', 'error');
    }
}

async function criarNovaTarefa(event) {
    event.preventDefault();
    
    const novaTarefa = {
        titulo: document.getElementById('titulo_tarefa').value,
        descricao: document.getElementById('descricao_tarefa').value,
        prioridade: document.getElementById('prioridade_tarefa').value,
        prazo: document.getElementById('prazo_tarefa').value
    };
    
    if (!novaTarefa.titulo) {
        showToast('Informe o título da tarefa!', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/tarefas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaTarefa)
        });
        
        if (response.ok) {
            await carregarTarefas();
            fecharModal('novaTarefaModal');
            document.getElementById('novaTarefaForm').reset();
            showToast('Tarefa criada com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        showToast('Erro ao criar tarefa', 'error');
    }
}

function filtrarTarefas(filtro) {
    filtroAtual = filtro;
    
    // Atualizar botões ativos
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderizarTarefas();
}

function abrirModalNovaTarefa() {
    document.getElementById('novaTarefaModal').style.display = 'flex';
}

function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function formatarData(data) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function getPrioridadeTexto(prioridade) {
    const prioridades = {
        'baixa': 'Baixa',
        'media': 'Média',
        'alta': 'Alta'
    };
    return prioridades[prioridade] || prioridade;
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast') || createToast();
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function createToast() {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
    return toast;
}

async function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    }
}