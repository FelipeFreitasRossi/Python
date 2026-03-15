// Variáveis globais
let currentSection = 'perfil';
let unsavedChanges = false;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadUserSettings();
    setupEventListeners();
    checkUnsavedChanges();
});

// Carregar configurações do usuário
function loadUserSettings() {
    // Simular carregamento de dados
    const userData = {
        nome: 'Administrador',
        email: 'admin@sistema.com',
        telefone: '(11) 99999-9999',
        departamento: 'TI',
        bio: 'Administrador do sistema com experiência em segurança e desenvolvimento.',
        tema: 'dark',
        notificacoes: {
            email: true,
            push: true,
            sms: false
        }
    };
    
    // Preencher formulários
    if (document.getElementById('nome')) {
        document.getElementById('nome').value = userData.nome;
    }
    // ... preencher outros campos
}

// Configurar event listeners
function setupEventListeners() {
    // Detectar mudanças em inputs
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('change', () => {
            unsavedChanges = true;
        });
    });
    
    // Prevenir saída acidental
    window.addEventListener('beforeunload', (e) => {
        if (unsavedChanges) {
            e.preventDefault();
            e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
        }
    });
}

// Navegação entre seções
function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover active de todos os itens do menu
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    document.getElementById(sectionId).classList.add('active');
    
    // Ativar item do menu
    document.querySelector(`.settings-nav-item[href="#${sectionId}"]`).classList.add('active');
    
    currentSection = sectionId;
    
    // Atualizar URL sem recarregar
    history.pushState({}, '', `#${sectionId}`);
}

// Verificar hash na URL ao carregar
if (window.location.hash) {
    const section = window.location.hash.substring(1);
    if (document.getElementById(section)) {
        showSection(section);
    }
}

// Salvar todas as configurações
function saveAllSettings() {
    showLoading();
    
    // Simular salvamento
    setTimeout(() => {
        hideLoading();
        showToast('Todas as configurações foram salvas com sucesso!', 'success');
        unsavedChanges = false;
    }, 1500);
}

// Salvar configurações do perfil
document.getElementById('profileForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        departamento: document.getElementById('departamento').value,
        bio: document.getElementById('bio').value
    };
    
    // Validar email
    if (!isValidEmail(formData.email)) {
        showToast('Por favor, insira um email válido.', 'error');
        return;
    }
    
    showLoading();
    
    // Simular requisição
    setTimeout(() => {
        hideLoading();
        showToast('Perfil atualizado com sucesso!', 'success');
        unsavedChanges = false;
    }, 1000);
});

// Alterar senha
document.getElementById('passwordForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const senhaAtual = document.getElementById('senha_atual').value;
    const novaSenha = document.getElementById('nova_senha').value;
    const confirmarSenha = document.getElementById('confirmar_senha').value;
    
    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
        showToast('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    if (novaSenha !== confirmarSenha) {
        showToast('As senhas não coincidem.', 'error');
        return;
    }
    
    if (!validatePassword(novaSenha)) {
        showToast('A senha não atende aos requisitos de segurança.', 'error');
        return;
    }
    
    showLoading();
    
    // Simular requisição
    setTimeout(() => {
        hideLoading();
        showToast('Senha alterada com sucesso!', 'success');
        document.getElementById('passwordForm').reset();
    }, 1500);
});

// Validar senha
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        number: /\d/.test(password),
        uppercase: /[A-Z]/.test(password),
        special: /[!@#$%^&*]/.test(password)
    };
    
    // Atualizar visual dos requisitos
    document.getElementById('req-length').style.color = requirements.length ? '#10b981' : '#ef4444';
    document.getElementById('req-number').style.color = requirements.number ? '#10b981' : '#ef4444';
    document.getElementById('req-uppercase').style.color = requirements.uppercase ? '#10b981' : '#ef4444';
    document.getElementById('req-special').style.color = requirements.special ? '#10b981' : '#ef4444';
    
    return Object.values(requirements).every(Boolean);
}

// Verificar força da senha em tempo real
document.getElementById('nova_senha')?.addEventListener('input', function() {
    validatePassword(this.value);
});

// Toggle 2FA
function toggle2FA(checkbox) {
    const qrSection = document.getElementById('qrCodeSection');
    
    if (checkbox.checked) {
        qrSection.style.display = 'block';
        showToast('Configure o 2FA no seu aplicativo autenticador.', 'info');
    } else {
        if (confirm('Desativar a autenticação em dois fatores reduz a segurança da sua conta. Deseja continuar?')) {
            qrSection.style.display = 'none';
        } else {
            checkbox.checked = true;
        }
    }
}

// Revogar sessão
function revokeSession(button) {
    if (confirm('Tem certeza que deseja revogar esta sessão?')) {
        const sessionItem = button.closest('.session-item');
        sessionItem.style.opacity = '0';
        
        setTimeout(() => {
            sessionItem.remove();
            showToast('Sessão revogada com sucesso!', 'success');
        }, 300);
    }
}

// Revogar todas as sessões
function revokeAllSessions() {
    if (confirm('Tem certeza que deseja revogar todas as outras sessões? Você será desconectado em outros dispositivos.')) {
        showLoading();
        
        setTimeout(() => {
            document.querySelectorAll('.session-item:not(.current)').forEach(item => {
                item.remove();
            });
            hideLoading();
            showToast('Todas as outras sessões foram revogadas!', 'success');
        }, 1500);
    }
}

// Alterar tema
function setTheme(theme) {
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
    
    // Aplicar tema
    document.body.className = theme + '-theme';
    
    // Salvar preferência
    localStorage.setItem('theme', theme);
    
    showToast(`Tema ${theme} aplicado!`, 'success');
}

// Alterar cor primária
function setPrimaryColor(color) {
    document.documentElement.style.setProperty('--primary', color);
    localStorage.setItem('primaryColor', color);
    showToast('Cor alterada com sucesso!', 'success');
}

// Mostrar/esconder senha
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
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

// Trocar avatar
function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profileAvatar').src = e.target.result;
                showToast('Avatar atualizado! Clique em salvar para confirmar.', 'success');
                unsavedChanges = true;
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// API Keys
function copyApiKey(type) {
    const keyText = type === 'primary' ? 'sk_live_••••••••••••••••' : 'sk_test_••••••••••••••••';
    
    navigator.clipboard.writeText(keyText).then(() => {
        showToast('Chave copiada para a área de transferência!', 'success');
    });
}

function regenerateApiKey(type) {
    if (confirm(`Tem certeza que deseja regenerar a chave ${type === 'primary' ? 'principal' : 'de teste'}? A chave antiga será invalidada.`)) {
        showLoading();
        
        setTimeout(() => {
            hideLoading();
            showToast(`Chave ${type === 'primary' ? 'principal' : 'de teste'} regenerada com sucesso!`, 'success');
        }, 1500);
    }
}

function generateNewKey() {
    const keyName = prompt('Digite um nome para a nova chave:');
    if (keyName) {
        showLoading();
        
        setTimeout(() => {
            hideLoading();
            showToast(`Nova chave "${keyName}" gerada com sucesso!`, 'success');
        }, 1500);
    }
}

// Webhooks
function addWebhook() {
    const webhookList = document.querySelector('.webhook-list');
    const newWebhook = document.createElement('div');
    newWebhook.className = 'webhook-item';
    newWebhook.innerHTML = `
        <input type="url" placeholder="https://exemplo.com/webhook">
        <button class="webhook-test" onclick="testWebhook(this)">
            <i class="fas fa-paper-plane"></i>
        </button>
        <button class="webhook-delete" onclick="deleteWebhook(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    webhookList.appendChild(newWebhook);
    unsavedChanges = true;
}

function testWebhook(button) {
    const url = button.previousElementSibling.value;
    if (!url) {
        showToast('Por favor, insira uma URL válida.', 'error');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        showToast('Webhook testado com sucesso!', 'success');
    }, 1000);
}

function deleteWebhook(button) {
    if (confirm('Remover este webhook?')) {
        button.closest('.webhook-item').remove();
        showToast('Webhook removido!', 'success');
        unsavedChanges = true;
    }
}

// Backup
function createBackup() {
    if (confirm('Iniciar backup do sistema agora?')) {
        showLoading();
        
        setTimeout(() => {
            hideLoading();
            showToast('Backup concluído com sucesso!', 'success');
            
            // Simular download
            const link = document.createElement('a');
            link.href = '#';
            link.download = `backup_${new Date().toISOString().slice(0,10)}.sql`;
            link.click();
        }, 3000);
    }
}

// Exportar logs
function exportLogs() {
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        
        // Criar CSV simulado
        const csv = 'Data,Hora,Tipo,Usuário,Ação,IP\n' +
                   '15/03/2024,09:30,Login,admin,Login realizado,192.168.1.100\n' +
                   '15/03/2024,09:25,Config,admin,Alterou configurações,192.168.1.100';
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        
        showToast('Logs exportados com sucesso!', 'success');
    }, 1500);
}

// Utilitários
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.loading-overlay');
    if (loader) {
        loader.remove();
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function checkUnsavedChanges() {
    // Verificar alterações não salvas a cada 30 segundos
    setInterval(() => {
        if (unsavedChanges) {
            console.log('Há alterações não salvas');
        }
    }, 30000);
}

// Atualizar data/hora nos logs
function updateLogTimestamp() {
    const now = new Date();
    document.querySelectorAll('.log-time').forEach(el => {
        el.textContent = now.toLocaleTimeString();
    });
}

setInterval(updateLogTimestamp, 1000);