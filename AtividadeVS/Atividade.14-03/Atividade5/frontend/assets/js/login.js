document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario')?.value.trim();
    const senha = document.getElementById('senha')?.value;
    
    if (!usuario || !senha) {
        alert('Preencha todos os campos');
        return;
    }
    
    const btn = document.querySelector('.login-btn');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });
        
        const resultado = await response.json();
        
        if (resultado.success) {
            window.location.href = '/dashboard';
        } else {
            alert('❌ ' + resultado.message);
        }
    } catch (error) {
        alert('Erro ao conectar');
    } finally {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
}

function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = event.currentTarget;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}