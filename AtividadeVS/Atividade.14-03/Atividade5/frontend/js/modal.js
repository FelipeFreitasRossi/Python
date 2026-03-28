// frontend/js/modal.js
// Sistema de Modal Pop-up para mensagens

class ModalPopup {
    constructor() {
        this.createModalElement();
        this.currentInterval = null;
    }

    createModalElement() {
        // Criar elemento do modal se não existir
        if (!document.querySelector('.modal-overlay')) {
            const modalHTML = `
                <div class="modal-overlay" id="modalOverlay">
                    <div class="modal-popup">
                        <div class="modal-icon" id="modalIcon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3 id="modalTitle">Sucesso!</h3>
                        <p id="modalMessage">Operação realizada com sucesso.</p>
                        <button class="modal-btn" id="modalBtn">Ok</button>
                        <div class="modal-timer" id="modalTimer"></div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        this.overlay = document.getElementById('modalOverlay');
        this.modalBtn = document.getElementById('modalBtn');
        this.modalIcon = document.getElementById('modalIcon');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalTimer = document.getElementById('modalTimer');
        
        // Fechar ao clicar no botão
        if (this.modalBtn) {
            this.modalBtn.addEventListener('click', () => this.close());
        }
        
        // Fechar ao clicar fora do modal
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.close();
            });
        }
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay && this.overlay.classList.contains('active')) {
                this.close();
            }
        });
    }

    show(config) {
        const {
            type = 'success',
            title = 'Sucesso!',
            message = 'Operação realizada com sucesso.',
            autoClose = true,
            duration = 3000,
            onClose = null,
            showTimer = true
        } = config;
        
        // Configurar ícone
        let iconClass = 'fas fa-check-circle';
        switch(type) {
            case 'success':
                iconClass = 'fas fa-check-circle';
                break;
            case 'error':
                iconClass = 'fas fa-times-circle';
                break;
            case 'info':
                iconClass = 'fas fa-info-circle';
                break;
            case 'warning':
                iconClass = 'fas fa-exclamation-triangle';
                break;
        }
        
        this.modalIcon.innerHTML = `<i class="${iconClass}"></i>`;
        this.modalIcon.className = `modal-icon ${type}`;
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        
        // Mostrar modal
        this.overlay.classList.add('active');
        
        // Limpar intervalo anterior se existir
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
        }
        
        // Configurar auto-fechamento
        if (autoClose) {
            let timeLeft = duration / 1000;
            
            if (showTimer) {
                this.modalTimer.style.display = 'block';
                const updateTimer = () => {
                    if (timeLeft <= 0) {
                        clearInterval(this.currentInterval);
                        this.close();
                        if (onClose) onClose();
                    } else {
                        this.modalTimer.innerHTML = `Fechando em <span>${Math.ceil(timeLeft)}</span> segundos`;
                        timeLeft -= 1;
                    }
                };
                updateTimer();
                this.currentInterval = setInterval(updateTimer, 1000);
            } else {
                this.modalTimer.style.display = 'none';
                setTimeout(() => {
                    this.close();
                    if (onClose) onClose();
                }, duration);
            }
        } else {
            this.modalTimer.style.display = 'none';
            this.modalBtn.textContent = 'Ok';
        }
    }
    
    close() {
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
        }
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
    }
}

// Criar instância global
const modal = new ModalPopup();

// Funções de atalho
function showSuccess(message, title = 'Sucesso!', autoClose = true, duration = 3000) {
    modal.show({
        type: 'success',
        title: title,
        message: message,
        autoClose: autoClose,
        duration: duration
    });
}

function showError(message, title = 'Erro!', autoClose = true, duration = 3000) {
    modal.show({
        type: 'error',
        title: title,
        message: message,
        autoClose: autoClose,
        duration: duration
    });
}

function showInfo(message, title = 'Informação', autoClose = true, duration = 3000) {
    modal.show({
        type: 'info',
        title: title,
        message: message,
        autoClose: autoClose,
        duration: duration
    });
}