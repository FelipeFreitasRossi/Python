// frontend/js/login.js

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Página de login carregada");
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Verificar se veio do cadastro
    const urlParams = new URLSearchParams(window.location.search);
    const cadastroSucesso = urlParams.get('cadastro');
    
    if (cadastroSucesso === 'sucesso') {
        alert('✅ Cadastro realizado com sucesso! Faça seu login.');
        
        // Remover o parâmetro da URL para não mostrar novamente ao recarregar
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
    
    // Carregar usuário lembrado
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const usuarioInput = document.getElementById('usuario');
        const lembrarCheck = document.getElementById('lembrar');
        if (usuarioInput) usuarioInput.value = rememberedUser;
        if (lembrarCheck) lembrarCheck.checked = true;
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario')?.value.trim();
    const senha = document.getElementById('senha')?.value;
    
    if (!usuario || !senha) {
        alert('❌ Por favor, preencha todos os campos!');
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
        console.log("Resposta do servidor:", resultado);
        
        if (resultado.success) {
            // Salvar usuário lembrado
            const lembrar = document.getElementById('lembrar').checked;
            if (lembrar) {
                localStorage.setItem('rememberedUser', usuario);
            } else {
                localStorage.removeItem('rememberedUser');
            }
            
            // Salvar nome do usuário na sessão do navegador
            sessionStorage.setItem('username', usuario);
            
            alert('✅ Login realizado com sucesso! Redirecionando...');
            
            // Redirecionar após 1.5 segundos
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            alert('❌ ' + resultado.message);
            
            // Efeito de erro no campo
            const inputUsuario = document.getElementById('usuario');
            const inputSenha = document.getElementById('senha');
            inputUsuario.style.borderColor = '#ef4444';
            inputSenha.style.borderColor = '#ef4444';
            setTimeout(() => {
                inputUsuario.style.borderColor = '';
                inputSenha.style.borderColor = '';
            }, 2000);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('❌ Erro ao conectar com o servidor. Verifique se o backend está rodando.');
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