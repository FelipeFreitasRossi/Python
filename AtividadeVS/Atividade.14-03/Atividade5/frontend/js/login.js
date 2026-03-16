document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Página de login carregada");
    
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
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    const loginBtn = document.querySelector('.login-btn');
    const textoOriginal = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    loginBtn.disabled = true;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usuario: usuario,
                senha: senha
            })
        });
        
        const resultado = await response.json();
        console.log("Resposta:", resultado);
        
        if (resultado.success) {
            alert('✅ Login realizado com sucesso!');
            window.location.href = '/dashboard';
        } else {
            alert('❌ ' + resultado.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao conectar com o servidor');
    } finally {
        loginBtn.innerHTML = textoOriginal;
        loginBtn.disabled = false;
    }
}

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