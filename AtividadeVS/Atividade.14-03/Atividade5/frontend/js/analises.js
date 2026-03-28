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

// ===== FUNÇÕES DE EXPORTAÇÃO =====

// Abrir/fechar menu de exportação
document.addEventListener('DOMContentLoaded', function() {
    const exportBtn = document.getElementById('btnExport');
    const exportMenu = document.getElementById('exportMenu');
    
    if (exportBtn && exportMenu) {
        exportBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            exportMenu.classList.toggle('show');
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!exportBtn.contains(e.target) && !exportMenu.contains(e.target)) {
                exportMenu.classList.remove('show');
            }
        });
    }
});

// Função principal de exportação
async function exportarDados(formato) {
    try {
        showToast('📊 Preparando dados para exportação...', 'info');
        
        // Buscar os dados atuais da API
        const response = await fetch('/api/analises');
        const data = await response.json();
        
        // Preparar dados para exportação
        const dadosExportacao = {
            data_exportacao: new Date().toLocaleString('pt-BR'),
            resumo: {
                total_acessos_30d: data.total_acessos_30d,
                tempo_medio_sessao: data.tempo_medio,
                usuarios_ativos: data.usuarios_ativos
            },
            acessos_por_mes: data.acessos_por_mes,
            dispositivos: data.dispositivos,
            departamentos: data.dept_metrics
        };
        
        switch(formato) {
            case 'csv':
                exportarCSV(dadosExportacao);
                break;
            case 'json':
                exportarJSON(dadosExportacao);
                break;
            case 'excel':
                exportarExcel(dadosExportacao);
                break;
            case 'pdf':
                exportarPDF(dadosExportacao);
                break;
        }
    } catch (error) {
        console.error('Erro ao exportar:', error);
        showToast('Erro ao exportar dados', 'error');
    }
}

// Exportar como CSV
function exportarCSV(dados) {
    let csv = [];
    
    // Cabeçalho do relatório
    csv.push('"RELATÓRIO DE ANÁLISES - SECURESYSTEM"');
    csv.push(`"Data de exportação:","${dados.data_exportacao}"`);
    csv.push('');
    
    // Resumo
    csv.push('"RESUMO GERAL"');
    csv.push(`"Total de acessos (30 dias):","${dados.resumo.total_acessos_30d}"`);
    csv.push(`"Tempo médio de sessão:","${dados.resumo.tempo_medio_sessao}"`);
    csv.push(`"Usuários ativos:","${dados.resumo.usuarios_ativos}"`);
    csv.push('');
    
    // Acessos por mês
    csv.push('"ACESSOS POR MÊS"');
    csv.push('"Mês","Acessos"');
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    dados.acessos_por_mes.forEach((valor, index) => {
        csv.push(`"${meses[index]}","${valor}"`);
    });
    csv.push('');
    
    // Dispositivos
    csv.push('"DISTRIBUIÇÃO POR DISPOSITIVO"');
    csv.push('"Dispositivo","Acessos"');
    dados.dispositivos.labels.forEach((label, index) => {
        csv.push(`"${label}","${dados.dispositivos.data[index]}"`);
    });
    csv.push('');
    
    // Departamentos
    csv.push('"MÉTRICAS POR DEPARTAMENTO"');
    csv.push('"Departamento","Total Usuários","Acessos (30 dias)","Tempo Médio"');
    dados.departamentos.forEach(dept => {
        csv.push(`"${dept.departamento}","${dept.total_usuarios}","${dept.acessos_30d}","${dept.tempo_medio}"`);
    });
    
    // Baixar arquivo
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `analises_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('✅ CSV exportado com sucesso!', 'success');
}

// Exportar como JSON
function exportarJSON(dados) {
    const jsonStr = JSON.stringify(dados, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `analises_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('✅ JSON exportado com sucesso!', 'success');
}

// Exportar como Excel (XLSX) usando SheetJS
function exportarExcel(dados) {
    // Verificar se SheetJS está disponível
    if (typeof XLSX === 'undefined') {
        // Carregar a biblioteca SheetJS
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js';
        script.onload = () => {
            gerarExcel(dados);
        };
        document.head.appendChild(script);
    } else {
        gerarExcel(dados);
    }
}

function gerarExcel(dados) {
    // Preparar planilhas
    const planilhas = [];
    
    // Planilha de Resumo
    planilhas.push({
        name: 'Resumo',
        data: [
            ['RELATÓRIO DE ANÁLISES - SECURESYSTEM'],
            ['Data de exportação:', dados.data_exportacao],
            [],
            ['RESUMO GERAL'],
            ['Total de acessos (30 dias):', dados.resumo.total_acessos_30d],
            ['Tempo médio de sessão:', dados.resumo.tempo_medio_sessao],
            ['Usuários ativos:', dados.resumo.usuarios_ativos]
        ]
    });
    
    // Planilha de Acessos por Mês
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const acessosData = [['Mês', 'Acessos']];
    dados.acessos_por_mes.forEach((valor, index) => {
        acessosData.push([meses[index], valor]);
    });
    planilhas.push({ name: 'Acessos por Mês', data: acessosData });
    
    // Planilha de Dispositivos
    const dispositivosData = [['Dispositivo', 'Acessos']];
    dados.dispositivos.labels.forEach((label, index) => {
        dispositivosData.push([label, dados.dispositivos.data[index]]);
    });
    planilhas.push({ name: 'Dispositivos', data: dispositivosData });
    
    // Planilha de Departamentos
    const deptData = [['Departamento', 'Total Usuários', 'Acessos (30 dias)', 'Tempo Médio']];
    dados.departamentos.forEach(dept => {
        deptData.push([dept.departamento, dept.total_usuarios, dept.acessos_30d, dept.tempo_medio]);
    });
    planilhas.push({ name: 'Departamentos', data: deptData });
    
    // Criar workbook
    const workbook = XLSX.utils.book_new();
    
    planilhas.forEach(planilha => {
        const worksheet = XLSX.utils.aoa_to_sheet(planilha.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, planilha.name);
    });
    
    // Baixar arquivo
    XLSX.writeFile(workbook, `analises_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.xlsx`);
    showToast('✅ Excel exportado com sucesso!', 'success');
}

// Exportar como PDF (usando jsPDF e html2canvas)
async function exportarPDF(dados) {
    showToast('📄 Gerando PDF...', 'info');
    
    // Carregar bibliotecas se necessário
    if (typeof html2canvas === 'undefined') {
        await carregarBibliotecas();
    }
    
    if (typeof jspdf === 'undefined') {
        await carregarBibliotecas();
    }
    
    // Criar conteúdo HTML para o PDF
    const conteudo = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #667eea;">SecureSystem - Relatório de Análises</h1>
            <p><strong>Data de exportação:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            
            <h2>Resumo Geral</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f0f0f0;"><th style="padding: 8px; text-align: left;">Métrica</th><th style="padding: 8px; text-align: left;">Valor</th></tr>
                <tr><td style="padding: 8px;">Total de acessos (30 dias)</td><td style="padding: 8px;">${dados.resumo.total_acessos_30d}</td></tr>
                <tr><td style="padding: 8px;">Tempo médio de sessão</td><td style="padding: 8px;">${dados.resumo.tempo_medio_sessao}</td></tr>
                <tr><td style="padding: 8px;">Usuários ativos</td><td style="padding: 8px;">${dados.resumo.usuarios_ativos}</td></tr>
            </table>
            
            <h2>Acessos por Mês</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f0f0f0;"><th style="padding: 8px; text-align: left;">Mês</th><th style="padding: 8px; text-align: left;">Acessos</th></tr>
                ${meses.map((mes, i) => `<tr><td style="padding: 8px;">${mes}</td><td style="padding: 8px;">${dados.acessos_por_mes[i]}</td></tr>`).join('')}
            </table>
            
            <h2>Distribuição por Dispositivo</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f0f0f0;"><th style="padding: 8px; text-align: left;">Dispositivo</th><th style="padding: 8px; text-align: left;">Acessos</th></tr>
                ${dados.dispositivos.labels.map((label, i) => `<tr><td style="padding: 8px;">${label}</td><td style="padding: 8px;">${dados.dispositivos.data[i]}</td></tr>`).join('')}
            </table>
            
            <h2>Métricas por Departamento</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f0f0f0;">
                    <th style="padding: 8px; text-align: left;">Departamento</th>
                    <th style="padding: 8px; text-align: left;">Total Usuários</th>
                    <th style="padding: 8px; text-align: left;">Acessos (30d)</th>
                    <th style="padding: 8px; text-align: left;">Tempo Médio</th>
                </tr>
                ${dados.departamentos.map(dept => `
                    <tr>
                        <td style="padding: 8px;">${dept.departamento}</td>
                        <td style="padding: 8px;">${dept.total_usuarios}</td>
                        <td style="padding: 8px;">${dept.acessos_30d}</td>
                        <td style="padding: 8px;">${dept.tempo_medio}</td>
                    </tr>
                `).join('')}
            </table>
            
            <p style="margin-top: 30px; color: #666; font-size: 12px;">Relatório gerado automaticamente por SecureSystem</p>
        </div>
    `;
    
    // Criar um elemento temporário para renderizar
    const elemento = document.createElement('div');
    elemento.innerHTML = conteudo;
    elemento.style.position = 'absolute';
    elemento.style.left = '-9999px';
    document.body.appendChild(elemento);
    
    try {
        const canvas = await html2canvas(elemento, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save(`analises_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.pdf`);
        showToast('✅ PDF exportado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showToast('Erro ao gerar PDF', 'error');
    } finally {
        document.body.removeChild(elemento);
    }
}

// Exportar gráficos como imagem
async function exportarGraficos() {
    showToast('📸 Capturando gráficos...', 'info');
    
    if (typeof html2canvas === 'undefined') {
        await carregarBibliotecas();
    }
    
    // Capturar os gráficos
    const charts = document.querySelectorAll('.chart-card canvas');
    const deptChart = document.getElementById('deptBarChart');
    
    if (charts.length === 0 && !deptChart) {
        showToast('Nenhum gráfico encontrado para exportar', 'error');
        return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calcular tamanho total
    let totalHeight = 0;
    const chartsToCapture = [];
    
    charts.forEach(chart => {
        const rect = chart.getBoundingClientRect();
        chartsToCapture.push(chart);
        totalHeight += rect.height + 20;
    });
    
    if (deptChart) {
        const rect = deptChart.getBoundingClientRect();
        chartsToCapture.push(deptChart);
        totalHeight += rect.height + 20;
    }
    
    canvas.width = 800;
    canvas.height = totalHeight;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let yOffset = 10;
    
    for (const chart of chartsToCapture) {
        try {
            const chartCanvas = await html2canvas(chart, { scale: 2, backgroundColor: '#ffffff' });
            const imgWidth = canvas.width - 40;
            const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
            ctx.drawImage(chartCanvas, 20, yOffset, imgWidth, imgHeight);
            yOffset += imgHeight + 20;
        } catch (error) {
            console.error('Erro ao capturar gráfico:', error);
        }
    }
    
    // Adicionar título
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#667eea';
    ctx.fillText('SecureSystem - Gráficos de Análises', 20, 30);
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 55);
    
    // Baixar imagem
    const link = document.createElement('a');
    link.download = `graficos_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    showToast('✅ Gráficos exportados como imagem!', 'success');
}

// Função para carregar bibliotecas externas
function carregarBibliotecas() {
    return new Promise((resolve) => {
        let loaded = 0;
        const total = 2;
        
        function checkComplete() {
            loaded++;
            if (loaded === total) resolve();
        }
        
        // Carregar html2canvas
        if (typeof html2canvas === 'undefined') {
            const script1 = document.createElement('script');
            script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script1.onload = checkComplete;
            document.head.appendChild(script1);
        } else {
            checkComplete();
        }
        
        // Carregar jsPDF
        if (typeof jspdf === 'undefined') {
            const script2 = document.createElement('script');
            script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script2.onload = checkComplete;
            document.head.appendChild(script2);
        } else {
            checkComplete();
        }
    });
}

// Variável global para os meses (usada no PDF)
const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
               'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];