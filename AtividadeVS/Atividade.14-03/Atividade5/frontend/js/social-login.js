// frontend/js/social-login.js
// Configuração dos links sociais
const SOCIAL_LINKS = {
    instagram: 'https://www.instagram.com/',
    github: 'https://github.com/'
};

// Aplicar links automaticamente
document.addEventListener('DOMContentLoaded', function() {
    const instagramLink = document.querySelector('.social-link[href*="instagram"]');
    const githubLink = document.querySelector('.social-link[href*="github"]');
    
    if (instagramLink && SOCIAL_LINKS.instagram) {
        instagramLink.href = SOCIAL_LINKS.instagram;
    }
    
    if (githubLink && SOCIAL_LINKS.github) {
        githubLink.href = SOCIAL_LINKS.github;
    }
});

// Função para login social (simulação)
function loginSocial(provider) {
    console.log(`Login com ${provider} iniciado...`);

}