// theme.js - Gerenciamento de tema claro/escuro
(function() {
    // Elemento do botão de tema (deve existir na página)
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Carrega o tema salvo ou usa 'light' como padrão
    let currentTheme = localStorage.getItem('theme') || 'light';

    // Função para aplicar o tema
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        // Atualiza o ícone do botão, se existir
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        // Salva a preferência
        localStorage.setItem('theme', theme);
    }

    // Aplica o tema inicial
    applyTheme(currentTheme);

    // Função para alternar entre claro e escuro
    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
    }

    // Adiciona evento de clique ao botão
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Expõe a função globalmente para uso em outros scripts (opcional)
    window.toggleTheme = toggleTheme;
})();