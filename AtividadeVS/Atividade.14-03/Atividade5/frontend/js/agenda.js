let eventos = [];
let dataAtual = new Date();

document.addEventListener('DOMContentLoaded', () => {
    carregarEventos();
    document.getElementById('mesAnterior').addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        renderizarCalendario();
    });
    document.getElementById('mesProximo').addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        renderizarCalendario();
    });
});

async function carregarEventos() {
    const response = await fetch('/api/eventos');
    eventos = await response.json();
    renderizarCalendario();
}

function renderizarCalendario() {
    const mes = dataAtual.getMonth();
    const ano = dataAtual.getFullYear();
    document.getElementById('mesAtual').textContent = dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const inicioSemana = primeiroDia.getDay(); // 0 = domingo

    let html = '<div class="calendar-weekdays">' +
        ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => `<div>${d}</div>`).join('') +
        '</div><div class="calendar-days">';

    // células vazias antes do primeiro dia
    for (let i = 0; i < inicioSemana; i++) html += '<div class="calendar-day empty"></div>';

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataStr = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
        const temEvento = eventos.some(e => e.data === dataStr);
        html += `<div class="calendar-day ${temEvento ? 'has-event' : ''}" data-data="${dataStr}">${dia}</div>`;
    }
    html += '</div>';
    document.getElementById('calendario').innerHTML = html;

    // Adiciona evento de clique nos dias
    document.querySelectorAll('.calendar-day:not(.empty)').forEach(div => {
        div.addEventListener('click', () => mostrarEventos(div.dataset.data));
    });
}

function mostrarEventos(data) {
    const eventosDia = eventos.filter(e => e.data === data);
    const lista = document.getElementById('eventosDia');
    if (eventosDia.length === 0) {
        lista.innerHTML = '<li>Nenhum evento para este dia</li>';
    } else {
        lista.innerHTML = eventosDia.map(e => `<li><strong>${e.hora}</strong> - ${e.titulo}</li>`).join('');
    }
}   