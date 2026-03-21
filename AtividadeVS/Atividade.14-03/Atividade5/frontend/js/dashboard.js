// frontend/js/dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Dashboard carregado");
    carregarDadosUsuario();
    carregarEstatisticas();
    carregarGraficos();
    carregarTarefas();
    iniciarTimerSessao();
    carregarAtividades();
});

// Variáveis globais
let segundosSessao = 0;
let intervalo;
let graficoAcessos;
let graficoDept;

// ===== FUNÇÕES DO DASHBOARD =====

// Carrega dados do usuário logado
async function carregarDadosUsuario() {
    try {
        const response = await fetch('/api/usuario');
        if (!response.ok) throw new Error('Erro ao carregar usuário');
        const data = await response.json();
        
        const nomeEl = document.getElementById('userName');
        if (nomeEl) nomeEl.textContent = data.nome || 'Usuário';
        
        const sidebarNome = document.getElementById('sidebarUserName');
        if (sidebarNome) sidebarNome.textContent = data.nome || 'Usuário';
        
        if (data.ultimo_acesso) {
            const lastLogin = document.getElementById('lastLogin');
            if (lastLogin) {
                const dataFormatada = new Date(data.ultimo_acesso).toLocaleString('pt-BR');
                lastLogin.textContent = dataFormatada;
            }
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
    }
}

// Carrega estatísticas do sistema
async function carregarEstatisticas() {
    try {
        const response = await fetch('/api/estatisticas');
        if (!response.ok) throw new Error('Erro ao carregar estatísticas');
        const stats = await response.json();
        
        const totalUsers = document.getElementById('totalUsers');
        const onlineUsers = document.getElementById('onlineUsers');
        const todayAccess = document.getElementById('todayAccess');
        
        if (totalUsers) totalUsers.textContent = stats.total_usuarios;
        if (onlineUsers) onlineUsers.textContent = stats.usuarios_online;
        if (todayAccess) todayAccess.textContent = stats.acessos_hoje;
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Carrega gráficos
async function carregarGraficos() {
    try {
        const response = await fetch('/api/graficos');
        if (!response.ok) throw new Error('Erro ao carregar dados dos gráficos');
        const data = await response.json();
        
        // Gráfico de acessos por dia
        const ctxAcessos = document.getElementById('accessChart')?.getContext('2d');
        if (ctxAcessos) {
            if (graficoAcessos) graficoAcessos.destroy();
            graficoAcessos = new Chart(ctxAcessos, {
                type: 'line',
                data: {
                    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Acessos',
                        data: data.acessos_por_dia,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }
        
        // Gráfico de departamentos
        const ctxDept = document.getElementById('deptChart')?.getContext('2d');
        if (ctxDept) {
            if (graficoDept) graficoDept.destroy();
            graficoDept = new Chart(ctxDept, {
                type: 'doughnut',
                data: {
                    labels: data.departamentos.labels,
                    datasets: [{
                        data: data.departamentos.data,
                        backgroundColor: ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    cutout: '60%'
                }
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar gráficos:', error);
    }
}

function atualizarGraficoAcessos() {
    // Função para atualizar gráfico baseado no filtro (mock)
    const novoData = [8, 12, 15, 10, 18, 22, 20];
    if (graficoAcessos) {
        graficoAcessos.data.datasets[0].data = novoData;
        graficoAcessos.update();
    }
}

// ===== SISTEMA DE TAREFAS =====
let todasTarefas = [];

async function carregarTarefas() {
    try {
        const response = await fetch('/api/tarefas');
        const tarefas = await response.json();
        
        todasTarefas = Object.values(tarefas).sort((a, b) => b.id - a.id);
        
        // Atualizar card de tarefas
        atualizarCardTarefas();
        
        // Atualizar tabela de últimas tarefas
        atualizarTabelaUltimasTarefas();
        
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        // Se não houver endpoint, usar dados mockados
        usarTarefasMock();
    }
}

function atualizarCardTarefas() {
    const total = todasTarefas.length;
    const concluidas = todasTarefas.filter(t => t.status === 'concluida').length;
    const progresso = total > 0 ? (concluidas / total * 100) : 0;
    
    const totalTarefasEl = document.getElementById('totalTarefas');
    const tarefasConcluidasEl = document.getElementById('tarefasConcluidas');
    const progressoEl = document.getElementById('progressoTarefas');
    
    if (totalTarefasEl) totalTarefasEl.textContent = total;
    if (tarefasConcluidasEl) tarefasConcluidasEl.textContent = concluidas;
    if (progressoEl) progressoEl.style.width = `${progresso}%`;
}

function atualizarTabelaUltimasTarefas() {
    const tbody = document.getElementById('ultimasTarefasBody');
    if (!tbody) return;
    
    const ultimasTarefas = todasTarefas.slice(0, 5);
    
    if (ultimasTarefas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhuma tarefa cadastrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = ultimasTarefas.map(tarefa => `
        <tr>
            <td>${escapeHtml(tarefa.titulo)}</td>
            <td><span class="prioridade prioridade-${tarefa.prioridade}">${getPrioridadeTexto(tarefa.prioridade)}</span></td>
            <td>${tarefa.prazo ? formatarData(tarefa.prazo) : 'Sem prazo'}</td>
            <td>
                <span class="status-badge ${tarefa.status === 'concluida' ? 'concluida' : 'pendente'}">
                    ${tarefa.status === 'concluida' ? '✓ Concluída' : '⏳ Pendente'}
                </span>
            </td>
            <td>
                <button class="action-btn" onclick="toggleStatusTarefa(${tarefa.id})" title="Alternar status">
                    <i class="fas ${tarefa.status === 'concluida' ? 'fa-undo' : 'fa-check'}"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function toggleStatusTarefa(tarefaId) {
    try {
        const response = await fetch(`/api/tarefas/${tarefaId}/toggle`, { method: 'PUT' });
        if (response.ok) {
            await carregarTarefas();
            showToast('Status da tarefa atualizado!', 'success');
        }
    } catch (error) {
        console.error('Erro ao alterar status:', error);
    }
}

// Dados mockados caso a API não esteja disponível
function usarTarefasMock() {
    todasTarefas = [
        { id: 1, titulo: "Implementar sistema de login", status: "concluida", prioridade: "alta", prazo: "2025-03-20" },
        { id: 2, titulo: "Criar dashboard principal", status: "pendente", prioridade: "media", prazo: "2025-03-25" },
        { id: 3, titulo: "Desenvolver página de relatórios", status: "pendente", prioridade: "baixa", prazo: "2025-03-30" },
        { id: 4, titulo: "Testar sistema de autenticação", status: "concluida", prioridade: "alta", prazo: "2025-03-18" }
    ];
    atualizarCardTarefas();
    atualizarTabelaUltimasTarefas();
}

// ===== FUNÇÕES AUXILIARES =====
function getPrioridadeTexto(prioridade) {
    const prioridades = { 'baixa': 'Baixa', 'media': 'Média', 'alta': 'Alta' };
    return prioridades[prioridade] || prioridade;
}

function formatarData(data) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// Timer da sessão
function iniciarTimerSessao() {
    intervalo = setInterval(() => {
        segundosSessao++;
        const horas = Math.floor(segundosSessao / 3600);
        const minutos = Math.floor((segundosSessao % 3600) / 60);
        const segundos = segundosSessao % 60;
        const timeString = `${horas.toString().padStart(2,'0')}:${minutos.toString().padStart(2,'0')}:${segundos.toString().padStart(2,'0')}`;
        const sessionEl = document.getElementById('sessionTime');
        if (sessionEl) sessionEl.textContent = timeString;
    }, 1000);
}

// Atividades recentes
function carregarAtividades() {
    const activities = [
        { icon: 'login', text: 'Login realizado com sucesso', time: 'Agora mesmo' },
        { icon: 'security', text: 'Verificação de segurança concluída', time: 'Há 2 minutos' },
        { icon: 'tarefa', text: 'Tarefa concluída', time: 'Há 15 minutos' }
    ];
    
    const activityList = document.getElementById('activityList');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="feed-item">
                <div class="feed-icon ${activity.icon}">
                    <i class="fas ${getIconForType(activity.icon)}"></i>
                </div>
                <div class="feed-content">
                    <p>${activity.text}</p>
                    <span class="feed-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
}

function getIconForType(type) {
    const icons = { login: 'fa-sign-in-alt', security: 'fa-shield-alt', tarefa: 'fa-check-circle' };
    return icons[type] || 'fa-circle';
}

// Ações
function gerarRelatorio() {
    showToast('Gerando relatório...', 'info');
    setTimeout(() => showToast('Relatório gerado com sucesso!', 'success'), 2000);
}

function exportarDados() {
    showToast('Exportando dados...', 'info');
    setTimeout(() => showToast('Dados exportados com sucesso!', 'success'), 1500);
}

// Toast notification
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

// Logout
async function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }
}

// Toggle sidebar
function toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('collapsed');
}
// Carregar usuários recentes
async function carregarUsuariosRecentes() {
    try {
        const response = await fetch('/api/usuarios');
        const users = await response.json();
        
        const usersArray = Object.entries(users).slice(0, 5);
        const tbody = document.getElementById('ultimosUsuariosBody');
        
        if (usersArray.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum usuário encontrado</td></tr>';
            return;
        }
        
        tbody.innerHTML = usersArray.map(([login, dados]) => `
            <tr>
                <td>
                    <div class="user-cell">
                        <img src="https://ui-avatars.com/api/?name=${dados.nome}&background=667eea&color=fff&size=35" alt="Avatar">
                        <div>
                            <strong>${dados.nome}</strong>
                            <small>@${login}</small>
                        </div>
                    </div>
                </td>
                <td><span class="department-badge">${dados.departamento || 'Não informado'}</span></td>
                <td><span class="status-badge ${dados.ultimo_acesso ? 'online' : 'offline'}">
                    <i class="fas ${dados.ultimo_acesso ? 'fa-circle' : 'fa-circle'}"></i>
                    ${dados.ultimo_acesso ? 'Online' : 'Offline'}
                </span></td>
                <td>${dados.ultimo_acesso ? new Date(dados.ultimo_acesso).toLocaleDateString('pt-BR') : 'Nunca'}</td>
                <td><button class="action-btn-table edit" onclick="editarUsuario('${login}')"><i class="fas fa-edit"></i></button></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

// Funções de ação
function gerarRelatorio() {
    showToast('📄 Gerando relatório...', 'info');
    setTimeout(() => showToast('✅ Relatório gerado!', 'success'), 2000);
}

function exportarDados() {
    showToast('📊 Exportando dados...', 'info');
    setTimeout(() => showToast('✅ Dados exportados!', 'success'), 1500);
}

function editarUsuario(login) {
    showToast(`✏️ Editando usuário: ${login}`, 'info');
}

function logout() {
    if (confirm('Deseja realmente sair?')) {
        fetch('/api/logout', { method: 'POST' })
            .then(() => window.location.href = '/');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarUsuariosRecentes();
    carregarEstatisticas();
    carregarGraficos();
    carregarTarefas();
    iniciarTimerSessao();
});