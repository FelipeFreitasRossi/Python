// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Particles.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#667eea' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: false },
            size: { value: 3, random: true },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#667eea',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: 'repulse' },
                onclick: { enable: true, mode: 'push' },
                resize: true
            }
        },
        retina_detect: true
    });

    // Inicializar AOS
    AOS.init({
        duration: 1000,
        once: true
    });

    // Carregar dados do usuário
    loadUserData();
    
    // Iniciar cronômetro da sessão
    startSessionTimer();
    
    // Atualizar data
    updateDate();
    setInterval(updateDate, 1000);
});

// Função para carregar dados do usuário
function loadUserData() {
    // Pegar parâmetros da URL ou localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const userName = urlParams.get('user') || localStorage.getItem('userName') || 'Usuário';
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('profileName').textContent = userName;
    document.getElementById('userEmail').textContent = userName.toLowerCase() + '@sistema.com';
    
    // Atualizar avatar
    const avatarImg = document.getElementById('userAvatar');
    avatarImg.src = `https://ui-avatars.com/api/?name=${userName}&background=667eea&color=fff&size=128`;
    
    // Gerar dados aleatórios
    document.getElementById('totalLogins').textContent = Math.floor(Math.random() * 100) + 20;
    document.getElementById('activeDays').textContent = Math.floor(Math.random() * 30) + 5;
    
    // Simular nível de acesso
    const roles = ['Administrador', 'Usuário Premium', 'Gerente', 'Analista'];
    document.getElementById('userRole').textContent = roles[Math.floor(Math.random() * roles.length)];
    
    // Data de ingresso
    const joinDate = new Date();
    joinDate.setMonth(joinDate.getMonth() - Math.floor(Math.random() * 6));
    document.getElementById('memberSince').textContent = `Membro desde ${joinDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
}

// Timer da sessão
let sessionSeconds = 0;
function startSessionTimer() {
    setInterval(() => {
        sessionSeconds++;
        const hours = Math.floor(sessionSeconds / 3600);
        const minutes = Math.floor((sessionSeconds % 3600) / 60);
        const seconds = sessionSeconds % 60;
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('sessionTime').textContent = timeString;
    }, 1000);
}

// Atualizar data
function updateDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.querySelector('.date-display span').textContent = 
        now.toLocaleDateString('pt-BR', options);
}

// Menu toggle para mobile
function toggleMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
}

// Funções de ação
function showNotification() {
    showToast('🔔 Notificações atualizadas!');
}

function refreshData() {
    showToast('🔄 Dados atualizados com sucesso!');
    // Recarregar dados
    loadUserData();
}

function showMessage() {
    const messages = [
        '🚀 Você está voando alto!',
        '💪 Continue assim!',
        '⭐ Você é incrível!',
        '🎯 Foco no objetivo!',
        '🌟 Brilhando como sempre!'
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showToast(randomMessage);
}

function exportData() {
    showToast('📥 Dados exportados com sucesso!');
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.clear();
        window.location.href = 'http://localhost:8000'; // Redirecionar para o sistema Python
    }
}

// Toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.querySelector('span').textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Efeito de digitação
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Simular atualização em tempo real
setInterval(() => {
    const activeUsers = document.getElementById('activeUsers');
    const currentValue = parseInt(activeUsers.textContent.replace(',', ''));
    const newValue = currentValue + Math.floor(Math.random() * 10) - 3;
    activeUsers.textContent = newValue.toLocaleString();
}, 5000);

// Adicionar classe de loading em elementos
document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.classList.add('loading');
    });
    
    card.addEventListener('mouseleave', () => {
        card.classList.remove('loading');
    });
});

// Scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    // Ctrl + R para atualizar
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        refreshData();
    }
    
    // Esc para fechar menu mobile
    if (e.key === 'Escape') {
        document.querySelector('.nav-links').classList.remove('active');
    }
});

// Registrar service worker para PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
}