// Variáveis globais
let sessionSeconds = 0;
let sessionInterval;
let charts = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    startSessionTimer();
    loadCharts();
    loadRecentActivities();
    loadUsersTable();
    setupEventListeners();
    checkUrlParams();
});

// Carregar dados do usuário
function loadUserData() {
    const urlParams = new URLSearchParams(window.location.search);
    const userName = urlParams.get('user') || sessionStorage.getItem('username') || 'Usuário';
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('sidebarUserName').textContent = userName;
    
    // Carregar último login
    const lastLogin = localStorage.getItem('lastLogin') || 'Hoje 09:30';
    document.getElementById('lastLogin').textContent = lastLogin;
    
    // Carregar estatísticas
    loadStats();
}

// Carregar estatísticas
async function loadStats() {
    try {
        // Simular chamada API
        const stats = await getStats();
        
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('onlineUsers').textContent = stats.onlineUsers;
        document.getElementById('todayAccess').textContent = stats.todayAccess;
        
        // Animar números
        animateNumber('totalUsers', 0, stats.totalUsers, 1000);
        animateNumber('onlineUsers', 0, stats.onlineUsers, 1000);
        animateNumber('todayAccess', 0, stats.todayAccess, 1000);
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Animar números
function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const range = end - start;
    const increment = range / (duration / 10);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current).toLocaleString();
    }, 10);
}

// Timer da sessão
function startSessionTimer() {
    sessionInterval = setInterval(() => {
        sessionSeconds++;
        const hours = Math.floor(sessionSeconds / 3600);
        const minutes = Math.floor((sessionSeconds % 3600) / 60);
        const seconds = sessionSeconds % 60;
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('sessionTime').textContent = timeString;
    }, 1000);
}

// Carregar gráficos
function loadCharts() {
    // Gráfico de acessos por hora
    const accessCtx = document.getElementById('accessChart').getContext('2d');
    charts.access = new Chart(accessCtx, {
        type: 'line',
        data: {
            labels: ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
            datasets: [{
                label: 'Acessos',
                data: [65, 45, 30, 25, 85, 120, 150, 180, 200, 170, 140, 90],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Gráfico de departamentos
    const deptCtx = document.getElementById('deptChart').getContext('2d');
    charts.dept = new Chart(deptCtx, {
        type: 'doughnut',
        data: {
            labels: ['TI', 'Vendas', 'Marketing', 'RH', 'Financeiro'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                    '#667eea',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '60%'
        }
    });
}

// Carregar atividades recentes
function loadRecentActivities() {
    const activities = [
        { icon: 'login', text: 'Login realizado com sucesso', time: 'Agora mesmo' },
        { icon: 'security', text: 'Verificação de segurança concluída', time: 'Há 2 minutos' },
        { icon: 'profile', text: 'Perfil atualizado', time: 'Há 15 minutos' },
        { icon: 'settings', text: 'Configurações alteradas', time: 'Há 1 hora' },
        { icon: 'user', text: 'Novo usuário cadastrado', time: 'Há 2 horas' }
    ];
    
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'feed-item';
        item.innerHTML = `
            <div class="feed-icon ${activity.icon}">
                <i class="fas fa-${getIconForType(activity.icon)}"></i>
            </div>
            <div class="feed-content">
                <p>${activity.text}</p>
                <span class="feed-time">${activity.time}</span>
            </div>
        `;
        activityList.appendChild(item);
    });
}

function getIconForType(type) {
    const icons = {
        login: 'sign-in-alt',
        security: 'shield-alt',
        profile: 'user-edit',
        settings: 'cog',
        user: 'user-plus'
    };
    return icons[type] || 'circle';
}

// Carregar tabela de usuários
async function loadUsersTable() {
    try {
        const users = await getUsers();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-info">
                        <img src="https://ui-avatars.com/api/?name=${user.nome}&background=667eea&color=fff&size=32" alt="Avatar">
                        <span>${user.login}</span>
                    </div>
                </td>
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${user.departamento}</td>
                <td>
                    <span class="status-badge ${user.status}">
                        ${user.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                </td>
                <td>${user.ultimo_acesso || 'Nunca'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="editUser('${user.login}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteUser('${user.login}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Search na tabela
    const searchInput = document.querySelector('.table-search');
    searchInput.addEventListener('input', filterTable);
    
    // Atualizar gráficos ao mudar filtro
    document.querySelectorAll('.chart-filter').forEach(select => {
        select.addEventListener('change', updateCharts);
    });
    
    // Logout
    document.querySelector('.logout-btn').addEventListener('click', logout);
}

// Filtrar tabela
function filterTable() {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Atualizar gráficos
function updateCharts() {
    // Simular novos dados
    charts.access.data.datasets[0].data = generateRandomData(12, 20, 200);
    charts.access.update();
    
    charts.dept.data.datasets[0].data = generateRandomData(5, 5, 40);
    charts.dept.update();
}

// Gerar dados aleatórios
function generateRandomData(count, min, max) {
    return Array.from({ length: count }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

// Ações de usuário
function editUser(login) {
    showModal('editUser');
    document.getElementById('editUserForm').dataset.login = login;
}

function deleteUser(login) {
    if (confirm(`Tem certeza que deseja excluir o usuário ${login}?`)) {
        showToast(`Usuário ${login} excluído!`, 'success');
    }
}

// Modal
function showModal(modalId) {
    const modal = document.getElementById(`${modalId}Modal`);
    modal.style.display = 'block';
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(`${modalId}Modal`);
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Sidebar toggle
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.querySelector('.theme-toggle i');
    
    if (document.body.classList.contains('dark-theme')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    }
}

// Logout
// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        // Chamar API de logout
        fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        }).then(() => {
            sessionStorage.clear();
            showToast('Saindo...', 'info');
            
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        });
    }
}

// Simular chamadas API
function getStats() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                totalUsers: 1234,
                onlineUsers: 56,
                todayAccess: 234
            });
        }, 500);
    });
}

function getUsers() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { login: 'admin', nome: 'Administrador', email: 'admin@sistema.com', departamento: 'TI', status: 'online', ultimo_acesso: 'Agora' },
                { login: 'joao', nome: 'João Silva', email: 'joao@sistema.com', departamento: 'Vendas', status: 'online', ultimo_acesso: 'Há 5 min' },
                { login: 'maria', nome: 'Maria Santos', email: 'maria@sistema.com', departamento: 'Marketing', status: 'offline', ultimo_acesso: 'Há 2h' },
                { login: 'pedro', nome: 'Pedro Oliveira', email: 'pedro@sistema.com', departamento: 'TI', status: 'online', ultimo_acesso: 'Há 10 min' },
                { login: 'ana', nome: 'Ana Costa', email: 'ana@sistema.com', departamento: 'RH', status: 'offline', ultimo_acesso: 'Há 1 dia' }
            ]);
        }, 500);
    });
}

// Toast
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

// Check URL params
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cadastro') === 'sucesso') {
        showToast('Bem-vindo ao sistema!', 'success');
    }
}

// Adicionar estilos dinâmicos
const style = document.createElement('style');
style.textContent = `
    .user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .user-info img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }
    
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .status-badge.online {
        background: #10b98120;
        color: #10b981;
    }
    
    .status-badge.offline {
        background: #6b728020;
        color: #6b7280;
    }
    
    .action-buttons {
        display: flex;
        gap: 0.5rem;
    }
    
    .action-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .action-btn.edit {
        background: #667eea20;
        color: #667eea;
    }
    
    .action-btn.edit:hover {
        background: #667eea;
        color: white;
    }
    
    .action-btn.delete {
        background: #ef444420;
        color: #ef4444;
    }
    
    .action-btn.delete:hover {
        background: #ef4444;
        color: white;
    }
    
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: white;
        border-radius: 50px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s;
        z-index: 1000;
    }
    
    .toast.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .toast.success {
        background: #10b981;
        color: white;
    }
    
    .toast.error {
        background: #ef4444;
        color: white;
    }
    
    .toast.info {
        background: #667eea;
        color: white;
    }
`;
document.head.appendChild(style);