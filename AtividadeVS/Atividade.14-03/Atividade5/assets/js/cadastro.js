// Aguardar o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ JavaScript do cadastro carregado!");
    
    // Configurar os botões de próximo
    configurarBotoes();
    
    // Configurar formulário
    const form = document.getElementById('cadastroForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            finalizarCadastro();
        });
    }
});

function configurarBotoes() {
    console.log("Configurando botões...");
    
    // Botão próximo do passo 1
    const btnProximo1 = document.querySelector('#step1 .next-btn');
    if (btnProximo1) {
        console.log("✅ Botão próximo do passo 1 encontrado");
        btnProximo1.addEventListener('click', function() {
            console.log("Clicou no próximo do passo 1");
            if (validarPasso1()) {
                irParaPasso(2);
            }
        });
    } else {
        console.log("❌ Botão próximo do passo 1 não encontrado");
    }
    
    // Botão próximo do passo 2
    const btnProximo2 = document.querySelector('#step2 .next-btn');
    if (btnProximo2) {
        console.log("✅ Botão próximo do passo 2 encontrado");
        btnProximo2.addEventListener('click', function() {
            console.log("Clicou no próximo do passo 2");
            if (validarPasso2()) {
                irParaPasso(3);
            }
        });
    } else {
        console.log("❌ Botão próximo do passo 2 não encontrado");
    }
    
    // Botões voltar
    document.querySelectorAll('.prev-btn').forEach(btn => {
        console.log("✅ Botão voltar encontrado");
        btn.addEventListener('click', function() {
            const passo = this.getAttribute('data-passo');
            if (passo) {
                irParaPasso(parseInt(passo));
            }
        });
    });
}

function validarPasso1() {
    const nome = document.getElementById('nome')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    
    if (!nome) {
        alert('Por favor, digite seu nome');
        return false;
    }
    
    if (!email) {
        alert('Por favor, digite seu email');
        return false;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        alert('Por favor, digite um email válido');
        return false;
    }
    
    return true;
}

function validarPasso2() {
    const login = document.getElementById('login')?.value.trim();
    const senha = document.getElementById('senha')?.value;
    const confirmar = document.getElementById('confirmar_senha')?.value;
    
    if (!login) {
        alert('Por favor, digite um nome de usuário');
        return false;
    }
    
    if (login.length < 3) {
        alert('O usuário deve ter pelo menos 3 caracteres');
        return false;
    }
    
    if (!senha) {
        alert('Por favor, digite uma senha');
        return false;
    }
    
    if (senha.length < 4) {
        alert('A senha deve ter pelo menos 4 caracteres');
        return false;
    }
    
    if (senha !== confirmar) {
        alert('As senhas não coincidem');
        return false;
    }
    
    return true;
}

function irParaPasso(passo) {
    console.log("Indo para o passo:", passo);
    
    // Esconder todos os passos
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });
    
    // Mostrar o passo atual
    const passoEl = document.getElementById(`step${passo}`);
    if (passoEl) {
        passoEl.classList.add('active');
        console.log(`✅ Passo ${passo} ativado`);
    } else {
        console.log(`❌ Passo ${passo} não encontrado`);
    }
    
    // Atualizar barra de progresso
    document.querySelectorAll('.progress-step').forEach((el, index) => {
        const numeroPasso = index + 1;
        el.classList.remove('active', 'completed');
        
        if (numeroPasso === passo) {
            el.classList.add('active');
        } else if (numeroPasso < passo) {
            el.classList.add('completed');
        }
    });
}

function finalizarCadastro() {
    const nome = document.getElementById('nome')?.value || 'Não informado';
    const email = document.getElementById('email')?.value || 'Não informado';
    const login = document.getElementById('login')?.value || 'Não informado';
    const termos = document.getElementById('termos')?.checked || false;
    
    if (!termos) {
        alert('Você precisa aceitar os termos de uso');
        return;
    }
    
    console.log("Finalizando cadastro:", {nome, email, login});
    
    // Mostrar loading
    const btn = document.querySelector('.submit-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
        btn.disabled = true;
    }
    
    // Simular cadastro
    setTimeout(function() {
        alert('✅ Cadastro realizado com sucesso!');
        window.location.href = '/';
    }, 1500);
}

// Função para mostrar/esconder senha
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

// Formatar telefone
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
        value = `(${value.slice(0,2)}) ${value.slice(2)}`;
    }
    if (value.length > 9) {
        value = value.slice(0, 9) + '-' + value.slice(9);
    }
    
    input.value = value;
}