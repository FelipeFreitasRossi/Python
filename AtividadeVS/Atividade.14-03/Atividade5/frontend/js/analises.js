document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
});

async function carregarDados() {
    try {
        const response = await fetch('/api/analises');
        const data = await response.json();

        // Gráfico de acessos por mês
        new Chart(document.getElementById('acessosMesChart'), {
            type: 'bar',
            data: {
                labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
                datasets: [{
                    label: 'Acessos',
                    data: data.acessos_por_mes,
                    backgroundColor: '#667eea'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // Gráfico de dispositivos
        new Chart(document.getElementById('dispositivosChart'), {
            type: 'pie',
            data: {
                labels: data.dispositivos.labels,
                datasets: [{
                    data: data.dispositivos.data,
                    backgroundColor: ['#667eea', '#10b981', '#f59e0b']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        document.getElementById('tempoMedio').textContent = data.tempo_medio;
    } catch (error) {
        console.error('Erro ao carregar análises:', error);
    }
}