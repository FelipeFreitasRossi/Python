// frontend/js/agenda.js
let eventos = [];
let dataAtual = new Date();
let dataSelecionada = new Date().toISOString().split('T')[0];

document.addEventListener('DOMContentLoaded', function() {
    carregarEventos();
    configurarEventos();
    initTipoCards();
});

function configurarEventos() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        atualizarCalendario();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        atualizarCalendario();
    });
    
    document.getElementById('addEventBtn').addEventListener('click', () => {
        abrirModalNovoEvento();
    });
    
    document.getElementById('filterTodayBtn').addEventListener('click', () => {
        dataAtual = new Date();
        dataSelecionada = new Date().toISOString().split('T')[0];
        atualizarCalendario();
        mostrarEventosDoDia(dataSelecionada);
    });
    
    const form = document.getElementById('eventoForm');
    if (form) form.addEventListener('submit', salvarEvento);
    
    const searchInput = document.getElementById('searchEvento');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            buscarEventos(e.target.value);
        });
    }
}

function initTipoCards() {
    const cards = document.querySelectorAll('.tipo-card-premium');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const radio = this.querySelector('input');
            radio.checked = true;
            cards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

async function carregarEventos() {
    try {
        showToast('Carregando eventos...', 'info');
        const response = await fetch('/api/eventos');
        
        if (response.ok) {
            eventos = await response.json();
            console.log('✅ Eventos carregados:', eventos.length);
        } else {
            throw new Error('Erro ao carregar eventos');
        }
        
        atualizarCalendario();
        atualizarEstatisticas();
        mostrarEventosDoDia(dataSelecionada);
        
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        showToast('Erro ao carregar eventos', 'error');
        // Iniciar com array vazio
        eventos = [];
        atualizarCalendario();
        atualizarEstatisticas();
        mostrarEventosDoDia(dataSelecionada);
    }
}

function atualizarCalendario() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    
    document.getElementById('currentMonthYear').textContent = dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const inicioSemana = primeiroDia.getDay();
    
    const diasAnterior = new Date(ano, mes, 0).getDate();
    const hojeStr = new Date().toISOString().split('T')[0];
    
    let html = '';
    
    // Dias do mês anterior
    for (let i = inicioSemana - 1; i >= 0; i--) {
        const dia = diasAnterior - i;
        const dataStr = `${ano}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
        const temEvento = eventos.some(e => e.data === dataStr);
        html += `
            <div class="day-cell-premium other-month" data-date="${dataStr}">
                <span class="day-number">${dia}</span>
                ${temEvento ? '<span class="event-indicator"></span>' : ''}
            </div>
        `;
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataStr = `${ano}-${String(mes + 1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
        const temEvento = eventos.some(e => e.data === dataStr);
        const isToday = dataStr === hojeStr;
        const isSelected = dataStr === dataSelecionada;
        
        let classes = 'day-cell-premium';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        
        html += `
            <div class="${classes}" data-date="${dataStr}">
                <span class="day-number">${dia}</span>
                ${temEvento ? '<span class="event-indicator"></span>' : ''}
            </div>
        `;
    }
    
    // Dias do próximo mês para completar o grid (6 linhas = 42 dias)
    const totalDiasMostrados = inicioSemana + diasNoMes;
    const diasRestantes = 42 - totalDiasMostrados;
    
    for (let i = 1; i <= diasRestantes; i++) {
        const dataStr = `${ano}-${String(mes + 2).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const temEvento = eventos.some(e => e.data === dataStr);
        html += `
            <div class="day-cell-premium other-month" data-date="${dataStr}">
                <span class="day-number">${i}</span>
                ${temEvento ? '<span class="event-indicator"></span>' : ''}
            </div>
        `;
    }
    
    document.getElementById('calendarDays').innerHTML = html;
    
    // Adicionar eventos de clique
    document.querySelectorAll('.day-cell-premium').forEach(cell => {
        cell.addEventListener('click', () => {
            dataSelecionada = cell.dataset.date;
            atualizarCalendario();
            mostrarEventosDoDia(dataSelecionada);
        });
    });
}

function mostrarEventosDoDia(data) {
    const eventosDia = eventos.filter(e => e.data === data);
    const container = document.getElementById('eventsList');
    const dataObj = new Date(data);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('selectedDateLabel').innerHTML = dataFormatada;
    
    if (eventosDia.length === 0) {
        container.innerHTML = `
            <div class="empty-premium">
                <div class="empty-icon">
                    <i class="fas fa-calendar-plus"></i>
                </div>
                <h4>Nenhum evento agendado</h4>
                <p>Clique em "Novo Evento" para adicionar compromissos</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = eventosDia.map(evento => `
        <div class="event-card-premium ${evento.tipo}">
            <div class="event-time-premium">
                <i class="fas fa-clock"></i> ${evento.hora || '--:--'}
            </div>
            <div class="event-details-premium">
                <strong>${escapeHtml(evento.titulo)}</strong>
                ${evento.descricao ? `<p>${escapeHtml(evento.descricao)}</p>` : ''}
            </div>
            <div class="event-actions-premium">
                <button class="icon-btn" onclick="editarEvento(${evento.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn delete" onclick="excluirEvento(${evento.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function atualizarEstatisticas() {
    const hoje = new Date().toISOString().split('T')[0];
    const eventosHoje = eventos.filter(e => e.data === hoje).length;
    
    const hojeObj = new Date();
    const inicioSemana = new Date(hojeObj);
    inicioSemana.setDate(hojeObj.getDate() - hojeObj.getDay());
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    
    const eventosSemana = eventos.filter(e => {
        const dataEvento = new Date(e.data);
        return dataEvento >= inicioSemana && dataEvento <= fimSemana;
    }).length;
    
    const proximo = eventos
        .filter(e => new Date(e.data) >= new Date())
        .sort((a, b) => new Date(a.data) - new Date(b.data))[0];
    
    document.getElementById('eventosHoje').textContent = eventosHoje;
    document.getElementById('eventosSemana').textContent = eventosSemana;
    document.getElementById('proximoEvento').textContent = proximo ? proximo.titulo.substring(0, 20) : '--';
}

function abrirModalNovoEvento(data = null) {
    document.getElementById('modalTitle').textContent = 'Novo Evento';
    document.getElementById('eventoId').value = '';
    document.getElementById('eventoTitulo').value = '';
    document.getElementById('eventoData').value = data || new Date().toISOString().split('T')[0];
    document.getElementById('eventoHora').value = '';
    document.querySelector('input[name="eventoTipo"][value="reuniao"]').checked = true;
    document.getElementById('eventoDescricao').value = '';
    document.getElementById('eventoModal').style.display = 'flex';
    
    // Reset tipo cards
    const cards = document.querySelectorAll('.tipo-card-premium');
    cards.forEach(card => card.classList.remove('selected'));
    document.querySelector('.tipo-card-premium[data-tipo="reuniao"]').classList.add('selected');
}

function editarEvento(id) {
    const evento = eventos.find(e => e.id === id);
    if (!evento) return;
    
    document.getElementById('modalTitle').textContent = 'Editar Evento';
    document.getElementById('eventoId').value = evento.id;
    document.getElementById('eventoTitulo').value = evento.titulo;
    document.getElementById('eventoData').value = evento.data;
    document.getElementById('eventoHora').value = evento.hora || '';
    document.querySelector(`input[name="eventoTipo"][value="${evento.tipo}"]`).checked = true;
    document.getElementById('eventoDescricao').value = evento.descricao || '';
    document.getElementById('eventoModal').style.display = 'flex';
    
    // Atualizar tipo cards
    const cards = document.querySelectorAll('.tipo-card-premium');
    cards.forEach(card => card.classList.remove('selected'));
    document.querySelector(`.tipo-card-premium[data-tipo="${evento.tipo}"]`).classList.add('selected');
}

async function salvarEvento(event) {
    event.preventDefault();
    
    const id = document.getElementById('eventoId').value;
    const evento = {
        titulo: document.getElementById('eventoTitulo').value.trim(),
        data: document.getElementById('eventoData').value,
        hora: document.getElementById('eventoHora').value,
        tipo: document.querySelector('input[name="eventoTipo"]:checked').value,
        descricao: document.getElementById('eventoDescricao').value
    };
    
    if (!evento.titulo || !evento.data) {
        showToast('Preencha os campos obrigatórios', 'error');
        return;
    }
    
    // Mostrar loading no botão
    const submitBtn = document.querySelector('#eventoForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    submitBtn.disabled = true;
    
    try {
        let response;
        let url = '/api/eventos';
        let method = 'POST';
        
        if (id) {
            url = `/api/eventos/${id}`;
            method = 'PUT';
        }
        
        response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evento)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Recarregar eventos do servidor
            await carregarEventos();
            fecharModal();
            showToast(id ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!', 'success');
        } else {
            showToast(result.error || 'Erro ao salvar evento', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar evento:', error);
        showToast('Erro ao conectar com o servidor', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function excluirEvento(id) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    
    try {
        const response = await fetch(`/api/eventos/${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (response.ok && result.success) {
            await carregarEventos();
            showToast('Evento excluído com sucesso!', 'success');
        } else {
            showToast(result.error || 'Erro ao excluir evento', 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        showToast('Erro ao conectar com o servidor', 'error');
    }
}

function buscarEventos(termo) {
    if (!termo.trim()) {
        mostrarEventosDoDia(dataSelecionada);
        return;
    }
    
    const termoLower = termo.toLowerCase();
    const eventosFiltrados = eventos.filter(e => 
        e.titulo.toLowerCase().includes(termoLower) ||
        (e.descricao && e.descricao.toLowerCase().includes(termoLower))
    );
    
    const container = document.getElementById('eventsList');
    if (eventosFiltrados.length === 0) {
        container.innerHTML = '<div class="empty-premium"><div class="empty-icon"><i class="fas fa-search"></i></div><h4>Nenhum evento encontrado</h4><p>Tente outro termo de busca</p></div>';
        return;
    }
    
    container.innerHTML = eventosFiltrados.map(evento => `
        <div class="event-card-premium ${evento.tipo}">
            <div class="event-time-premium">
                <i class="fas fa-calendar"></i> ${new Date(evento.data).toLocaleDateString('pt-BR')}
                ${evento.hora ? `<br><i class="fas fa-clock"></i> ${evento.hora}` : ''}
            </div>
            <div class="event-details-premium">
                <strong>${escapeHtml(evento.titulo)}</strong>
                ${evento.descricao ? `<p>${escapeHtml(evento.descricao)}</p>` : ''}
            </div>
            <div class="event-actions-premium">
                <button class="icon-btn" onclick="editarEvento(${evento.id})"><i class="fas fa-edit"></i></button>
                <button class="icon-btn delete" onclick="excluirEvento(${evento.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function fecharModal() {
    document.getElementById('eventoModal').style.display = 'none';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast-premium';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast-premium ${type}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        fetch('/api/logout', { method: 'POST' })
            .then(() => window.location.href = '/');
    }
}