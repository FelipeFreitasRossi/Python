// frontend/js/cadastro.js
// Versão final com navegação por steps, validações e envio para API

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Página de cadastro carregada");

    // Elementos principais
    const form = document.getElementById('cadastroForm');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');

    let currentStep = 1;
    const totalSteps = 3;

    // Inicializa exibindo o primeiro passo
    showStep(currentStep);

    // Event listeners para botões "Próximo"
    nextButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    // Event listeners para botões "Anterior"
    prevButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            currentStep--;
            showStep(currentStep);
        });
    });

    // Event listener para o submit do formulário (último passo)
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!validateStep(3)) return; // valida o passo 3 (termos)
            await submitForm();
        });
    }

    // Função para mostrar um passo específico e atualizar a barra de progresso
    function showStep(step) {
        // Oculta todos os steps
        steps.forEach(s => s.classList.remove('active'));

        // Exibe o step atual
        const currentStepEl = document.getElementById(`step${step}`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        // Atualiza barra de progresso
        progressSteps.forEach((ps, index) => {
            const stepNum = index + 1;
            ps.classList.remove('active', 'completed');
            if (stepNum === step) {
                ps.classList.add('active');
            } else if (stepNum < step) {
                ps.classList.add('completed');
            }
        });
    }

    // Validação de cada passo
    function validateStep(step) {
        switch(step) {
            case 1:
                return validateStep1();
            case 2:
                return validateStep2();
            case 3:
                return validateStep3();
            default:
                return true;
        }
    }

    function validateStep1() {
        const nome = document.getElementById('nome')?.value.trim();
        const email = document.getElementById('email')?.value.trim();

        let isValid = true;

        if (!nome) {
            showError('nome', 'Por favor, digite seu nome');
            isValid = false;
        } else {
            clearError('nome');
        }

        if (!email) {
            showError('email', 'Por favor, digite seu email');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('email', 'Digite um email válido (exemplo@email.com)');
            isValid = false;
        } else {
            clearError('email');
        }

        return isValid;
    }

    function validateStep2() {
        const login = document.getElementById('login')?.value.trim();
        const senha = document.getElementById('senha')?.value;
        const confirmar = document.getElementById('confirmar_senha')?.value;

        let isValid = true;

        if (!login) {
            showError('login', 'Por favor, digite um nome de usuário');
            isValid = false;
        } else if (login.length < 3) {
            showError('login', 'O usuário deve ter pelo menos 3 caracteres');
            isValid = false;
        } else {
            clearError('login');
        }

        if (!senha) {
            showError('senha', 'Por favor, digite uma senha');
            isValid = false;
        } else if (senha.length < 4) {
            showError('senha', 'A senha deve ter pelo menos 4 caracteres');
            isValid = false;
        } else {
            clearError('senha');
        }

        if (!confirmar) {
            showError('confirmar_senha', 'Por favor, confirme sua senha');
            isValid = false;
        } else if (senha !== confirmar) {
            showError('confirmar_senha', 'As senhas não coincidem');
            isValid = false;
        } else {
            clearError('confirmar_senha');
        }

        return isValid;
    }

    function validateStep3() {
        const termos = document.getElementById('termos')?.checked;
        if (!termos) {
            showError('termos', 'Você precisa aceitar os termos de uso');
            return false;
        } else {
            clearError('termos');
            return true;
        }
    }

    // Validação de email
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Exibe mensagem de erro abaixo do campo
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Adiciona classe de erro ao campo
        field.classList.add('error');

        // Remove mensagem de erro anterior, se existir
        const container = field.closest('.input-group') || field.parentElement;
        const existingError = container.querySelector('.error-message');
        if (existingError) existingError.remove();

        // Cria nova mensagem
        const error = document.createElement('span');
        error.className = 'error-message';
        error.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        container.appendChild(error);
    }

    function clearError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.remove('error');
        const container = field.closest('.input-group') || field.parentElement;
        const error = container.querySelector('.error-message');
        if (error) error.remove();
    }

    // Envio do formulário para a API
    async function submitForm() {
        // Coleta todos os dados dos campos
        const dados = {
            login: document.getElementById('login')?.value.trim() || '',
            senha: document.getElementById('senha')?.value || '',
            nome: document.getElementById('nome')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            telefone: document.getElementById('telefone')?.value || '',
            departamento: document.getElementById('departamento')?.value || '',
            twoFactor: document.getElementById('twoFactor')?.checked || false,
            loginAlerts: document.getElementById('loginAlerts')?.checked || true,
            termos: document.getElementById('termos')?.checked || false
        };

        console.log("📤 Enviando dados para cadastro:", dados);

        // Desabilita botão e mostra loading
        const btn = document.querySelector('.submit-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
        btn.disabled = true;

        try {
            // Usa caminho relativo (mesma origem) para evitar problemas de CORS
            const response = await fetch('/api/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados)
            });

            // Verifica se a resposta é OK
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const resultado = await response.json();
            console.log("📥 Resposta do servidor:", resultado);

            if (resultado.success) {
                // Limpa dados salvos localmente
                localStorage.removeItem('cadastroData');
                alert('✅ Cadastro realizado com sucesso! Faça o login.');
                window.location.href = '/'; // redireciona para a página inicial (login)
            } else {
                alert('❌ Erro: ' + resultado.message);
            }
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            alert('❌ Erro ao conectar com o servidor. Verifique se o backend está rodando.');
        } finally {
            // Restaura botão
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    // Funções auxiliares (disponíveis globalmente para uso nos eventos inline do HTML)
    window.togglePassword = function(id) {
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
    };

    window.formatPhone = function(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 2) {
            value = `(${value.slice(0,2)}) ${value.slice(2)}`;
        }
        if (value.length > 9) {
            value = value.slice(0, 9) + '-' + value.slice(9);
        }
        input.value = value;
    };

    // Medidor de força da senha (opcional)
    const senhaInput = document.getElementById('senha');
    if (senhaInput) {
        senhaInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            if (password.length >= 4) strength++;
            if (password.length >= 6) strength++;
            if (password.length >= 8) strength++;
            if (/[0-9]/.test(password)) strength++;

            const bars = document.querySelectorAll('.strength-bar');
            bars.forEach((bar, index) => {
                if (index < strength) {
                    bar.style.background = strength >= 3 ? '#10b981' : (strength === 2 ? '#f59e0b' : '#ef4444');
                    bar.style.opacity = '1';
                } else {
                    bar.style.opacity = '0.2';
                }
            });
        });
    }

    // Recuperar dados salvos no localStorage (opcional)
    const savedData = localStorage.getItem('cadastroData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            if (data.nome) document.getElementById('nome').value = data.nome;
            if (data.email) document.getElementById('email').value = data.email;
            if (data.login) document.getElementById('login').value = data.login;
            if (data.telefone) document.getElementById('telefone').value = data.telefone;
            if (data.departamento) document.getElementById('departamento').value = data.departamento;
        } catch (e) {
            console.warn('Erro ao recuperar dados salvos', e);
        }
    }

    // Salvar progresso automaticamente no localStorage
    const formInputs = document.querySelectorAll('#step1 input, #step2 input, #step1 select, #step2 select');
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            const data = {
                nome: document.getElementById('nome')?.value,
                email: document.getElementById('email')?.value,
                login: document.getElementById('login')?.value,
                telefone: document.getElementById('telefone')?.value,
                departamento: document.getElementById('departamento')?.value
            };
            localStorage.setItem('cadastroData', JSON.stringify(data));
        });
    });
});