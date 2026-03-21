// header.js - Interações do Header Premium

document.addEventListener('DOMContentLoaded', function() {
    // Menu do Usuário
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
            closeOtherDropdowns('user');
        });
    }
    
    // Botão de Notificações
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showToast('🔔 Notificações em desenvolvimento', 'info');
        });
    }
    
    // Botão de Configurações
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            window.location.href = '/configuracoes';
        });
    }
    
    // Tema
    const themeToggle = document.getElementById('themeToggle');
    const lightIcon = document.querySelector('.theme-icon-light');
    const darkIcon = document.querySelector('.theme-icon-dark');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            if (lightIcon) lightIcon.style.display = 'none';
            if (darkIcon) darkIcon.style.display = 'block';
        } else {
            document.body.classList.remove('dark-theme');
            if (lightIcon) lightIcon.style.display = 'block';
            if (darkIcon) darkIcon.style.display = 'none';
        }
        localStorage.setItem('theme', theme);
    }
    
    applyTheme(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }
    
    // Pesquisa Global
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value;
            if (query.length > 2) {
                // Simular resultados
                console.log('Pesquisando:', query);
            }
        });
        
        // Atalho Ctrl+K
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
            if (e.key === 'Escape') {
                searchInput.blur();
            }
        });
    }
    
    // Fechar dropdown ao clicar fora
    function closeOtherDropdowns(active) {
        if (active !== 'user' && userDropdown) userDropdown.classList.remove('active');
    }
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-menu-container')) {
            if (userDropdown) userDropdown.classList.remove('active');
        }
    });
    
    // Carregar nome do usuário
    fetch('/api/usuario')
        .then(res => res.json())
        .then(data => {
            const userNameMini = document.getElementById('userNameMini');
            const dropdownUserName = document.getElementById('dropdownUserName');
            if (userNameMini) userNameMini.textContent = data.nome || 'Usuário';
            if (dropdownUserName) dropdownUserName.textContent = data.nome || 'Usuário';
        })
        .catch(() => console.log('Usando nome padrão'));
});

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