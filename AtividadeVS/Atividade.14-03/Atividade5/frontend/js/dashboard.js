// frontend/js/dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Dashboard carregado");
    carregarDadosUsuario();
    carregarEstatisticas();
    carregarGraficos();
    iniciarTimerSessao();
});

// Variável para o timer
let segundosSessao = 0;
let intervalo;

// Carrega dados do usuário logado
async function carregarDadosUsuario() {
    try {
        const response = await fetch('/api/usuario');
        if (!response.ok) throw new Error('Erro ao carregar usuário');
        const data = await response.json();
        
        // Atualiza nome em vários lugares
        const nomeEl = document.getElementById('userName');
        if (nomeEl) nomeEl.textContent = data.nome || 'Usuário';
        
        const sidebarNome = document.getElementById('sidebarUserName');
        if (sidebarNome) sidebarNome.textContent = data.nome || 'Usuário';
        
        // Último login
        if (data.ultimo_acesso) {
            const lastLogin = document.getElementById('lastLogin');
            if (lastLogin) {
                const dataFormatada = new Date(data.ultimo_acesso).toLocaleString('pt-BR');
                lastLogin.textContent = dataFormatada;
            }
        }
        
        // Email (se houver elemento)
        const emailEl = document.getElementById('userEmail');
        if (emailEl) emailEl.textContent = data.email || '';
        
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
        
        document.getElementById('totalUsers').textContent = stats.total_usuarios;
        document.getElementById('onlineUsers').textContent = stats.usuarios_online;
        document.getElementById('todayAccess').textContent = stats.acessos_hoje;
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Carrega dados dos gráficos e renderiza
async function carregarGraficos() {
    try {
        const response = await fetch('/api/graficos');
        if (!response.ok) throw new Error('Erro ao carregar dados dos gráficos');
        const data = await response.json();
        
        // Gráfico de acessos por dia
        const ctxAcessos = document.getElementById('accessChart')?.getContext('2d');
        if (ctxAcessos) {
            new Chart(ctxAcessos, {
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
            new Chart(ctxDept, {
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

// Funções auxiliares para modais (se existirem)
window.showModal = function(modalId) {
    const modal = document.getElementById(`${modalId}Modal`);
    if (modal) {
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(`${modalId}Modal`);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }
};

// Toggle sidebar (se necessário)
window.toggleSidebar = function() {
    document.querySelector('.sidebar')?.classList.toggle('collapsed');
};

// Toggle theme
window.toggleTheme = function() {
    document.body.classList.toggle('dark-theme');
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    }
};