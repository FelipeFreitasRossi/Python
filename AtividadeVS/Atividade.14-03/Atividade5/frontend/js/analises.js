// frontend/js/analises.js
let acessosChart = null;
let dispositivosChart = null;
let deptBarChart = null;

document.addEventListener('DOMContentLoaded', function() {
    carregarAnalises();
});

async function carregarAnalises() {
    try {
        const response = await fetch('/api/analises');
        const data = await response.json();

        // Atualizar cards de resumo
        document.getElementById('totalAcessos').textContent = data.total_acessos_30d;
        document.getElementById('tempoMedio').textContent = data.tempo_medio;
        document.getElementById('usuariosAtivos').textContent = data.usuarios_ativos;

        // Gráfico de acessos por mês (barras verticais)
        const ctxAcessos = document.getElementById('acessosMesChart').getContext('2d');
        if (acessosChart) acessosChart.destroy();
        acessosChart = new Chart(ctxAcessos, {
            type: 'bar',
            data: {
                labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
                datasets: [{
                    label: 'Acessos',
                    data: data.acessos_por_mes,
                    backgroundColor: 'rgba(102, 126, 234, 0.7)',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // Gráfico de distribuição por dispositivo (doughnut)
        const ctxDispositivos = document.getElementById('dispositivosChart').getContext('2d');
        if (dispositivosChart) dispositivosChart.destroy();
        dispositivosChart = new Chart(ctxDispositivos, {
            type: 'doughnut',
            data: {
                labels: data.dispositivos.labels,
                datasets: [{
                    data: data.dispositivos.data,
                    backgroundColor: ['#667eea', '#10b981', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} acessos` } }
                },
                cutout: '60%'
            }
        });

        // Gráfico de barras horizontais – acessos por departamento
        const ctxBar = document.getElementById('deptBarChart').getContext('2d');
        if (deptBarChart) deptBarChart.destroy();

        // Preparar dados
        const deptLabels = data.dept_metrics.map(d => d.departamento);
        const deptAcessos = data.dept_metrics.map(d => d.acessos_30d);

        deptBarChart = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: deptLabels,
                datasets: [{
                    label: 'Acessos (últimos 30 dias)',
                    data: deptAcessos,
                    backgroundColor: 'rgba(102, 126, 234, 0.7)',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    borderRadius: 6,
                }]
            },
            options: {
                indexAxis: 'y', // barras horizontais
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.raw} acessos` } }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: 'Número de acessos', color: 'var(--text-secondary)' },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    y: {
                        title: { display: true, text: 'Departamento', color: 'var(--text-secondary)' },
                        grid: { display: false }
                    }
                }
            }
        });

        // Renderizar cards de departamento
        const container = document.getElementById('deptMetricsContainer');
        if (container && data.dept_metrics) {
            const totalAcessos = data.total_acessos;
            container.innerHTML = data.dept_metrics.map(dept => {
                const percent = totalAcessos ? (dept.acessos_30d / totalAcessos * 100) : 0;
                return `
                    <div class="dept-metric-card">
                        <div class="dept-header">
                            <div class="dept-name">
                                <i class="fas fa-building"></i> ${escapeHtml(dept.departamento)}
                            </div>
                        </div>
                        <div class="dept-stats">
                            <div class="stat-row">
                                <span class="stat-label"><i class="fas fa-users"></i> Total Usuários</span>
                                <span class="stat-value">${dept.total_usuarios}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label"><i class="fas fa-chart-line"></i> Acessos (30d)</span>
                                <span class="stat-value">${dept.acessos_30d}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label"><i class="fas fa-clock"></i> Tempo Médio</span>
                                <span class="stat-value">${escapeHtml(dept.tempo_medio)}</span>
                            </div>
                            <div class="progress-mini">
                                <div class="progress-mini-fill" style="width: ${Math.min(percent, 100)}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

    } catch (error) {
        console.error('Erro ao carregar análises:', error);
        showToast('Erro ao carregar dados', 'error');
    }
}

// Função auxiliar para atualizar gráfico ao mudar filtro (pode ser expandida)
function atualizarGraficoMensal() {
    // Por simplicidade, recarrega os dados
    carregarAnalises();
}

// Exibir mensagem toast
function showToast(message, type) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Escapar HTML para evitar injeção
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}