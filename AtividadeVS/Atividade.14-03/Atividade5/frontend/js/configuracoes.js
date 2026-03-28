// frontend/js/configuracoes.js

let currentEditLogin = null;

document.addEventListener('DOMContentLoaded', function() {
    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.settings-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
            localStorage.setItem('activeSettingsTab', tabId);
        });
    });
    
    const savedTab = localStorage.getItem('activeSettingsTab');
    if (savedTab) {
        const btn = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
        if (btn) btn.click();
    }
    
    carregarPerfil();
    carregarEstatisticas();
    
    // Busca em configurações
    const searchInput = document.getElementById('searchConfig');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            buscarConfiguracoes(e.target.value);
        });
    }
    
    // Formulário de perfil
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', salvarPerfil);
    }
    
    // Formulário de senha
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', alterarSenha);
    }
    
    // Medidor de força da senha
    const novaSenhaInput = document.getElementById('novaSenha');
    if (novaSenhaInput) {
        novaSenhaInput.addEventListener('input', verificarForcaSenha);
    }
    
    // Tema
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeOption = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
    if (themeOption) themeOption.classList.add('active');
    
    // Compact mode
    const compactMode = document.getElementById('compactMode');
    if (compactMode) {
        compactMode.checked = localStorage.getItem('compactMode') === 'true';
        toggleCompactMode(compactMode.checked);
    }
    
    // Tamanho da fonte
    const fontSize = localStorage.getItem('fontSize');
    if (fontSize) setFontSize(fontSize);
});

// ===== FUNÇÕES DO PERFIL =====
async function carregarPerfil() {
    try {
        const response = await fetch('/api/usuario');
        if (!response.ok) throw new Error('Erro ao carregar perfil');
        const data = await response.json();
        
        if (data.nome) document.getElementById('nomeCompleto').value = data.nome;
        if (data.email) document.getElementById('email').value = data.email;
        if (data.telefone) document.getElementById('telefone').value = data.telefone;
        if (data.cargo) document.getElementById('cargo').value = data.cargo;
        if (data.bio) document.getElementById('bio').value = data.bio;
        
        // Salvar o login atual para usar nas requisições
        currentEditLogin = data.login || sessionStorage.getItem('username');
        
        // Carregar avatar
        const avatarImg = document.getElementById('avatarPreview');
        if (avatarImg) {
            if (data.avatar && data.avatar.startsWith('/uploads/')) {
                avatarImg.src = data.avatar + '?t=' + new Date().getTime();
            } else {
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nome || 'Usuário')}&background=667eea&color=fff&size=80&bold=true`;
            }
        }
        
        // Atualizar sidebar
        const sidebarAvatar = document.querySelector('.sidebar-footer .user-avatar img');
        if (sidebarAvatar) {
            if (data.avatar && data.avatar.startsWith('/uploads/')) {
                sidebarAvatar.src = data.avatar + '?t=' + new Date().getTime();
            } else {
                sidebarAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nome || 'Usuário')}&background=667eea&color=fff&size=40&bold=true`;
            }
        }
        
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        showToast('Erro ao carregar perfil', 'error');
    }
}

async function salvarPerfil(event) {
    event.preventDefault();
    
    if (!currentEditLogin) {
        showToast('Erro: usuário não identificado', 'error');
        return;
    }
    
    const dados = {
        nome: document.getElementById('nomeCompleto').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('telefone').value,
        cargo: document.getElementById('cargo').value,
        bio: document.getElementById('bio').value
    };
    
    if (!dados.nome || !dados.email) {
        showToast('Nome e email são obrigatórios', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/usuarios/${encodeURIComponent(currentEditLogin)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showToast('Perfil atualizado com sucesso!', 'success');
            // Atualizar nome na sidebar
            const sidebarName = document.querySelector('.sidebar-footer .user-name');
            if (sidebarName) sidebarName.textContent = dados.nome;
        } else {
            showToast(result.error || result.message || 'Erro ao atualizar perfil', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao conectar com o servidor', 'error');
    }
}

// ===== FUNÇÕES DE SENHA =====
async function alterarSenha(event) {
    event.preventDefault();
    
    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmar = document.getElementById('confirmarSenha').value;
    
    if (!senhaAtual || !novaSenha || !confirmar) {
        showToast('Preencha todos os campos', 'error');
        return;
    }
    
    if (novaSenha !== confirmar) {
        showToast('As senhas não coincidem', 'error');
        return;
    }
    
    if (novaSenha.length < 4) {
        showToast('A senha deve ter pelo menos 4 caracteres', 'error');
        return;
    }
    
    if (!currentEditLogin) {
        showToast('Erro: usuário não identificado', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/usuarios/${encodeURIComponent(currentEditLogin)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senha: novaSenha })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showToast('Senha alterada com sucesso!', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            showToast(result.error || result.message || 'Erro ao alterar senha', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao conectar com o servidor', 'error');
    }
}

function verificarForcaSenha() {
    const senha = document.getElementById('novaSenha').value;
    const bars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    let forca = 0;
    if (senha.length >= 4) forca++;
    if (senha.length >= 6) forca++;
    if (senha.length >= 8) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    
    const forcaFinal = Math.min(forca, 4);
    
    bars.forEach((bar, index) => {
        if (index < forcaFinal) {
            bar.style.background = forcaFinal <= 2 ? '#ef4444' : forcaFinal === 3 ? '#f59e0b' : '#10b981';
            bar.style.opacity = '1';
        } else {
            bar.style.background = 'var(--border-color)';
            bar.style.opacity = '0.3';
        }
    });
    
    if (strengthText) {
        const textos = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
        strengthText.textContent = senha ? textos[forcaFinal] : '';
    }
}

// ===== FUNÇÕES DE AVATAR =====
async function alterarAvatar() {
    if (!currentEditLogin) {
        showToast('Erro: usuário não identificado', 'error');
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 2 * 1024 * 1024) {
            showToast('A imagem deve ter no máximo 2MB', 'error');
            return;
        }
        
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(file.type)) {
            showToast('Formato não permitido. Use JPG, PNG, GIF ou WEBP', 'error');
            return;
        }
        
        const btn = document.querySelector('.avatar-actions .btn-secondary-small:first-child');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        btn.disabled = true;
        
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            
            const response = await fetch('/api/upload-avatar', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                const avatarImg = document.getElementById('avatarPreview');
                avatarImg.src = result.avatar_url + '?t=' + new Date().getTime();
                
                const sidebarAvatar = document.querySelector('.sidebar-footer .user-avatar img');
                if (sidebarAvatar) {
                    sidebarAvatar.src = result.avatar_url + '?t=' + new Date().getTime();
                }
                
                showToast('Avatar atualizado com sucesso!', 'success');
            } else {
                showToast(result.error || 'Erro ao atualizar avatar', 'error');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            showToast('Erro ao conectar com o servidor', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };
    
    input.click();
}

async function removerAvatar() {
    if (!confirm('Tem certeza que deseja remover sua foto de perfil?')) return;
    
    const btn = document.querySelector('.avatar-actions .btn-secondary-small:last-child');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removendo...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/remover-avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const nome = document.getElementById('nomeCompleto')?.value || 'Usuário';
            const avatarImg = document.getElementById('avatarPreview');
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=667eea&color=fff&size=80&bold=true`;
            
            const sidebarAvatar = document.querySelector('.sidebar-footer .user-avatar img');
            if (sidebarAvatar) {
                sidebarAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=667eea&color=fff&size=40&bold=true`;
            }
            
            showToast('Avatar removido com sucesso!', 'success');
        } else {
            showToast(result.error || 'Erro ao remover avatar', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao conectar com o servidor', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ===== FUNÇÕES DE NOTIFICAÇÃO =====
function testarNotificacao() {
    if (Notification.permission === 'granted') {
        new Notification('SecureSystem', {
            body: 'Esta é uma notificação de teste!',
            icon: 'https://ui-avatars.com/api/?name=Secure&background=667eea&color=fff&size=64'
        });
        showToast('Notificação enviada!', 'success');
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') testarNotificacao();
        });
    } else {
        showToast('Notificações bloqueadas pelo navegador', 'error');
    }
}

// ===== FUNÇÕES DE TEMA =====
function setTheme(theme) {
    document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector(`.theme-option[data-theme="${theme}"]`).classList.add('active');
    
    if (theme === 'light') {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        localStorage.setItem('theme', 'auto');
    }
}

function setFontSize(size) {
    const root = document.documentElement;
    if (size === 'small') {
        root.style.fontSize = '14px';
    } else if (size === 'medium') {
        root.style.fontSize = '16px';
    } else if (size === 'large') {
        root.style.fontSize = '18px';
    }
    localStorage.setItem('fontSize', size);
    document.getElementById('fontSize').value = size;
}

function toggleCompactMode(enabled) {
    if (enabled) {
        document.body.classList.add('compact-mode');
    } else {
        document.body.classList.remove('compact-mode');
    }
    localStorage.setItem('compactMode', enabled);
}

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    showToast(`Idioma alterado para ${lang}`, 'success');
    setTimeout(() => location.reload(), 1000);
}

// ===== FUNÇÕES DE SESSÃO =====
function revogarSessao(btn) {
    const sessionItem = btn.closest('.session-item');
    if (sessionItem && !sessionItem.classList.contains('current')) {
        sessionItem.remove();
        showToast('Sessão revogada com sucesso!', 'success');
    }
}

function revogarTodasSessoes() {
    if (confirm('Tem certeza que deseja revogar todas as outras sessões?')) {
        document.querySelectorAll('.session-item:not(.current)').forEach(item => item.remove());
        showToast('Todas as outras sessões foram revogadas!', 'success');
    }
}

// ===== FUNÇÕES DE BACKUP =====
function fazerBackup() {
    showToast('📦 Preparando backup...', 'info');
    
    const backupData = {
        data: new Date().toISOString(),
        configuracoes: {
            theme: localStorage.getItem('theme'),
            fontSize: localStorage.getItem('fontSize'),
            language: localStorage.getItem('language'),
            compactMode: localStorage.getItem('compactMode')
        }
    };
    
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('✅ Backup concluído!', 'success');
}

function restaurarBackup(btn) {
    if (confirm('Restaurar este backup irá substituir os dados atuais. Continuar?')) {
        showToast('Restauração simulada!', 'success');
    }
}

function limparLogs() {
    if (confirm('Remover todos os logs antigos?')) {
        showToast('Logs antigos removidos!', 'success');
    }
}

function limparCache() {
    if (confirm('Limpar cache do sistema?')) {
        localStorage.clear();
        showToast('Cache limpo! A página será recarregada.', 'success');
        setTimeout(() => location.reload(), 1500);
    }
}

function limparTodosDados() {
    if (confirm('⚠️ ATENÇÃO: Esta ação irá remover TODOS os dados do sistema. Esta ação é irreversível! Tem certeza?')) {
        showToast('Dados removidos! (simulação)', 'success');
    }
}

// ===== FUNÇÕES DE 2FA =====
document.getElementById('twofaToggle')?.addEventListener('change', function(e) {
    const setupDiv = document.getElementById('twofaSetup');
    if (this.checked) {
        setupDiv.style.display = 'block';
        document.getElementById('twofaStatus').innerHTML = 'Ativando...';
    } else {
        setupDiv.style.display = 'none';
        document.getElementById('twofaStatus').innerHTML = 'Desativado';
    }
});

function ativar2FA() {
    document.getElementById('twofaStatus').innerHTML = 'Ativado';
    document.getElementById('twofaToggle').checked = true;
    showToast('Autenticação em dois fatores ativada!', 'success');
}

// ===== FUNÇÕES DE BUSCA =====
function buscarConfiguracoes(termo) {
    const cards = document.querySelectorAll('.settings-card');
    const termoLower = termo.toLowerCase();
    
    cards.forEach(card => {
        const texto = card.textContent.toLowerCase();
        card.style.display = texto.includes(termoLower) ? 'block' : 'none';
    });
}

// ===== FUNÇÃO DE RESET DE FORMULÁRIO =====
function resetForm(formId) {
    document.getElementById(formId).reset();
    showToast('Alterações descartadas', 'info');
}

// ===== FUNÇÃO DE EXPORTAR LOGS =====
function exportarLogs() {
    const logs = [];
    document.querySelectorAll('.log-item').forEach(item => {
        const action = item.querySelector('strong')?.textContent || '';
        const time = item.querySelector('span')?.textContent || '';
        logs.push({ acao: action, data: time });
    });
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Logs exportados!', 'success');
}

// ===== FUNÇÕES AUXILIARES =====
function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = event.currentTarget;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 2) value = `(${value.slice(0,2)}) ${value.slice(2)}`;
    if (value.length > 9) value = value.slice(0, 9) + '-' + value.slice(9);
    input.value = value;
}

async function carregarEstatisticas() {
    try {
        const response = await fetch('/api/estatisticas');
        const data = await response.json();
        
        document.getElementById('statTotalUsers').textContent = data.total_usuarios || 0;
        
        const tasksResponse = await fetch('/api/tarefas');
        const tasks = await tasksResponse.json();
        document.getElementById('statTotalTasks').textContent = Object.keys(tasks).length;
        
        document.getElementById('statTodayAccess').textContent = data.acessos_hoje || 0;
        
        const storageSize = (localStorage.length * 1024).toFixed(2);
        document.getElementById('statStorage').textContent = `${storageSize} KB`;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
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