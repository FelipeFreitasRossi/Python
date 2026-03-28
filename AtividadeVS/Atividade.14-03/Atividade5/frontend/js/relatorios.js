// frontend/js/relatorios.js
let dadosRelatorio = null;

document.addEventListener('DOMContentLoaded', function() {
    initReportTypeDropdown();
    initPeriodSelector();
    initButtons();
    carregarHistoricoSalvo();
});

function initReportTypeDropdown() {
    const dropdown = document.getElementById('reportTypeDropdown');
    if (!dropdown) return;
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const items = dropdown.querySelectorAll('.dropdown-item');
    const selectedSpan = trigger.querySelector('span');
    const hiddenInput = document.getElementById('reportType');
    trigger.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('active'); });
    items.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            const icon = item.dataset.icon;
            const text = item.querySelector('span').textContent;
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            selectedSpan.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
            if (hiddenInput) hiddenInput.value = type;
            dropdown.classList.remove('active');
        });
    });
    document.addEventListener('click', () => dropdown.classList.remove('active'));
}

function initPeriodSelector() {
    const periodSelect = document.getElementById('reportPeriod');
    const dateRange = document.getElementById('dateRange');
    if (periodSelect) {
        periodSelect.addEventListener('change', () => {
            dateRange.style.display = periodSelect.value === 'personalizado' ? 'flex' : 'none';
        });
    }
}

function initButtons() {
    document.getElementById('gerarRelatorioBtn')?.addEventListener('click', gerarRelatorio);
    document.getElementById('exportarBtn')?.addEventListener('click', exportarRelatorio);
    document.getElementById('imprimirBtn')?.addEventListener('click', imprimirRelatorio);
    document.getElementById('searchReport')?.addEventListener('input', (e) => buscarRelatorios(e.target.value));
}

async function gerarRelatorio() {
    const activeItem = document.querySelector('#reportTypeDropdown .dropdown-item.active');
    const reportType = activeItem ? activeItem.dataset.type : 'usuarios';
    const period = document.getElementById('reportPeriod').value;
    const dataInicio = document.getElementById('dataInicio')?.value;
    const dataFim = document.getElementById('dataFim')?.value;
    const previewDiv = document.getElementById('reportPreview');
    const contentDiv = document.getElementById('reportContent');
    previewDiv.style.display = 'block';
    contentDiv.innerHTML = '<div class="report-loading"><div class="spinner"></div><p>Gerando relatório...</p></div>';
    setTimeout(async () => {
        try {
            let dados = {}, titulo = '';
            switch(reportType) {
                case 'usuarios':
                    const usersRes = await fetch('/api/usuarios');
                    dados = { usuarios: Object.values(await usersRes.json()) };
                    titulo = 'Relatório de Usuários';
                    break;
                case 'acessos':
                    const logsRes = await fetch('/api/logs');
                    dados = { acessos: await logsRes.json() || [] };
                    titulo = 'Relatório de Acessos';
                    break;
                case 'tarefas':
                    const tasksRes = await fetch('/api/tarefas');
                    dados = { tarefas: Object.values(await tasksRes.json()) };
                    titulo = 'Relatório de Tarefas';
                    break;
                case 'analises':
                    const analisesRes = await fetch('/api/analises');
                    dados = await analisesRes.json();
                    titulo = 'Relatório de Análises';
                    break;
                default:
                    const [u,t,a,l] = await Promise.all([fetch('/api/usuarios'), fetch('/api/tarefas'), fetch('/api/analises'), fetch('/api/logs')]);
                    dados = { usuarios: Object.values(await u.json()), tarefas: Object.values(await t.json()), analises: await a.json(), logs: await l.json() };
                    titulo = 'Relatório Completo';
            }
            dadosRelatorio = dados;
            document.getElementById('reportTitle').textContent = titulo;
            renderizarRelatorio(reportType, dados, period, dataInicio, dataFim);
            salvarNoHistorico(titulo, reportType);
        } catch (error) {
            contentDiv.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar dados</p></div>';
            showToast('Erro ao gerar relatório', 'error');
        }
    }, 1000);
}

function renderizarRelatorio(tipo, dados, periodo, dataInicio, dataFim) {
    const contentDiv = document.getElementById('reportContent');
    let periodoTexto = {hoje:'Hoje',ontem:'Ontem',ultima_semana:'Última Semana',ultimo_mes:'Último Mês',ultimo_ano:'Último Ano',personalizado:`${dataInicio} a ${dataFim}`}[periodo] || 'Todos os períodos';
    let html = `<p style="text-align:right;font-size:0.7rem;color:var(--text-secondary);margin-bottom:1rem;">Gerado em: ${new Date().toLocaleString('pt-BR')}</p><p style="margin-bottom:1rem;"><strong>Período:</strong> ${periodoTexto}</p>`;
    if (tipo === 'usuarios') html += renderizarUsuarios(dados.usuarios);
    else if (tipo === 'acessos') html += renderizarAcessos(dados.acessos);
    else if (tipo === 'tarefas') html += renderizarTarefas(dados.tarefas);
    else if (tipo === 'analises') html += renderizarAnalises(dados);
    else html += renderizarCompleto(dados);
    contentDiv.innerHTML = html;
}

function renderizarUsuarios(usuarios) {
    const deptMap = {};
    usuarios.forEach(u => deptMap[u.departamento || 'Não informado'] = (deptMap[u.departamento || 'Não informado'] || 0) + 1);
    return `<div class="report-section"><div class="report-section-title"><i class="fas fa-chart-pie"></i> Resumo</div><div class="report-stats-grid"><div class="report-stat-item"><div class="report-stat-value">${usuarios.length}</div><div class="report-stat-label">Total de Usuários</div></div><div class="report-stat-item"><div class="report-stat-value">${usuarios.filter(u=>u.ultimo_acesso).length}</div><div class="report-stat-label">Ativos</div></div><div class="report-stat-item"><div class="report-stat-value">${Object.keys(deptMap).length}</div><div class="report-stat-label">Departamentos</div></div></div></div><div class="report-section"><div class="report-section-title"><i class="fas fa-building"></i> Por Departamento</div><table class="report-table"><thead><tr><th>Departamento</th><th>Quantidade</th></tr></thead><tbody>${Object.entries(deptMap).map(([d,q])=>`<tr><td>${escapeHtml(d)}</td><td>${q}</td></tr>`).join('')}</tbody></table></div><div class="report-section"><div class="report-section-title"><i class="fas fa-list"></i> Lista de Usuários</div><table class="report-table"><thead><tr><th>Usuário</th><th>Nome</th><th>Email</th><th>Departamento</th></tr></thead><tbody>${usuarios.map(u=>`<tr><td>${escapeHtml(u.login)}</td><td>${escapeHtml(u.nome)}</td><td>${escapeHtml(u.email)}</td><td>${escapeHtml(u.departamento||'-')}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderizarAcessos(acessos) {
    if(!acessos?.length) return '<div class="empty-state"><i class="fas fa-chart-line"></i><p>Nenhum dado de acesso encontrado</p></div>';
    const dias = {};
    acessos.forEach(a => { const d = new Date(a.data).toLocaleDateString('pt-BR'); dias[d] = (dias[d]||0)+1; });
    return `<div class="report-section"><div class="report-section-title"><i class="fas fa-chart-line"></i> Resumo</div><div class="report-stats-grid"><div class="report-stat-item"><div class="report-stat-value">${acessos.length}</div><div class="report-stat-label">Total de Acessos</div></div><div class="report-stat-item"><div class="report-stat-value">${Object.keys(dias).length}</div><div class="report-stat-label">Dias com Acesso</div></div></div></div><div class="report-section"><div class="report-section-title"><i class="fas fa-calendar"></i> Últimos Acessos</div><table class="report-table"><thead><tr><th>Usuário</th><th>Data/Hora</th></tr></thead><tbody>${acessos.slice(-20).reverse().map(a=>`<tr><td>${escapeHtml(a.usuario)}</td><td>${new Date(a.data).toLocaleString('pt-BR')}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderizarTarefas(tarefas) {
    const pendentes = tarefas.filter(t=>t.status==='pendente').length;
    const concluidas = tarefas.filter(t=>t.status==='concluida').length;
    return `<div class="report-section"><div class="report-section-title"><i class="fas fa-tasks"></i> Resumo</div><div class="report-stats-grid"><div class="report-stat-item"><div class="report-stat-value">${tarefas.length}</div><div class="report-stat-label">Total</div></div><div class="report-stat-item"><div class="report-stat-value">${pendentes}</div><div class="report-stat-label">Pendentes</div></div><div class="report-stat-item"><div class="report-stat-value">${concluidas}</div><div class="report-stat-label">Concluídas</div></div></div></div><div class="report-section"><div class="report-section-title"><i class="fas fa-list-check"></i> Lista de Tarefas</div><table class="report-table"><thead><tr><th>Título</th><th>Status</th><th>Prioridade</th><th>Prazo</th></tr></thead><tbody>${tarefas.map(t=>`<tr><td>${escapeHtml(t.titulo)}</td><td>${t.status==='concluida'?'✓ Concluída':'⏳ Pendente'}</td><td>${t.prioridade==='alta'?'🔴 Alta':t.prioridade==='media'?'🟠 Média':'🟢 Baixa'}</td><td>${t.prazo||'-'}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderizarAnalises(dados) {
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `<div class="report-section"><div class="report-section-title"><i class="fas fa-chart-simple"></i> Resumo</div><div class="report-stats-grid"><div class="report-stat-item"><div class="report-stat-value">${dados.total_acessos_30d||0}</div><div class="report-stat-label">Acessos (30d)</div></div><div class="report-stat-item"><div class="report-stat-value">${dados.tempo_medio||'0'}</div><div class="report-stat-label">Tempo Médio</div></div><div class="report-stat-item"><div class="report-stat-value">${dados.usuarios_ativos||0}</div><div class="report-stat-label">Usuários Ativos</div></div></div></div><div class="report-section"><div class="report-section-title"><i class="fas fa-calendar-alt"></i> Acessos por Mês</div><table class="report-table"><thead><tr><th>Mês</th><th>Acessos</th></tr></thead><tbody>${meses.map((m,i)=>`<tr><td>${m}</td><td>${dados.acessos_por_mes?.[i]||0}</td></tr>`).join('')}</tbody></table></div><div class="report-section"><div class="report-section-title"><i class="fas fa-building"></i> Métricas por Departamento</div><table class="report-table"><thead><tr><th>Departamento</th><th>Usuários</th><th>Acessos (30d)</th></tr></thead><tbody>${(dados.dept_metrics||[]).map(d=>`<tr><td>${escapeHtml(d.departamento)}</td><td>${d.total_usuarios}</td><td>${d.acessos_30d}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderizarCompleto(dados) {
    return renderizarUsuarios(dados.usuarios) + renderizarTarefas(dados.tarefas) + renderizarAnalises(dados.analises);
}

function exportarRelatorio() {
    const format = document.getElementById('exportFormat').value;
    const titulo = document.getElementById('reportTitle').textContent;
    const content = document.getElementById('reportContent').innerHTML;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${titulo}</title><style>body{font-family:Arial;margin:40px;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:8px;}</style></head><body><h1>${titulo}</h1><p>${new Date().toLocaleString('pt-BR')}</p>${content}</body></html>`;
    if(format === 'pdf'){ const w=window.open(); w.document.write(html); w.document.close(); w.print(); }
    else if(format === 'excel'){
        let csv=''; document.querySelectorAll('.report-table').forEach(t=>{ t.querySelectorAll('tr').forEach(r=>{ Array.from(r.cells).forEach(c=>csv+=`"${c.textContent.replace(/"/g,'""')}",`); csv+='\n'; }); csv+='\n'; });
        const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${titulo.replace(/\s/g,'_')}.csv`; a.click(); URL.revokeObjectURL(a.href);
    } else {
        const blob=new Blob([JSON.stringify(dadosRelatorio,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${titulo.replace(/\s/g,'_')}.json`; a.click(); URL.revokeObjectURL(a.href);
    }
    showToast(`Exportado como ${format.toUpperCase()}`, 'success');
}

function imprimirRelatorio() {
    const titulo = document.getElementById('reportTitle').textContent;
    const content = document.getElementById('reportContent').innerHTML;
    const w = window.open(); w.document.write(`<!DOCTYPE html><html><head><title>${titulo}</title><style>body{font-family:Arial;margin:40px;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:8px;}</style></head><body><h1>${titulo}</h1><p>${new Date().toLocaleString('pt-BR')}</p>${content}</body></html>`); w.document.close(); w.print();
}

function salvarNoHistorico(titulo, tipo) {
    const h = JSON.parse(localStorage.getItem('reportsHistory')||'[]');
    h.unshift({id:Date.now(),titulo,tipo,data:new Date().toISOString(),tamanho:Math.floor(Math.random()*3000)+500});
    if(h.length>20) h.pop();
    localStorage.setItem('reportsHistory',JSON.stringify(h));
    carregarHistoricoSalvo();
}

function carregarHistoricoSalvo() {
    const h = JSON.parse(localStorage.getItem('reportsHistory')||'[]');
    const container = document.getElementById('reportsList');
    if(!container) return;
    if(h.length===0){ container.innerHTML='<div class="empty-state"><i class="fas fa-folder-open"></i><p>Nenhum relatório salvo</p></div>'; return; }
    container.innerHTML = h.map(item=>`
        <div class="saved-item" data-id="${item.id}">
            <div class="saved-icon"><i class="fas fa-file-alt"></i></div>
            <div class="saved-info"><strong>${escapeHtml(item.titulo)}</strong><span>${new Date(item.data).toLocaleString('pt-BR')} - ${(item.tamanho/1024).toFixed(1)} KB</span></div>
            <div class="saved-actions"><button class="action-icon" onclick="visualizarSalvo(this)"><i class="fas fa-eye"></i></button><button class="action-icon" onclick="baixarSalvo(this)"><i class="fas fa-download"></i></button><button class="action-icon delete" onclick="excluirSalvo(this)"><i class="fas fa-trash"></i></button></div>
        </div>
    `).join('');
}

function buscarRelatorios(termo) {
    document.querySelectorAll('.saved-item').forEach(item=>{ item.style.display = item.textContent.toLowerCase().includes(termo.toLowerCase()) ? 'flex' : 'none'; });
}

function visualizarSalvo(btn){ showToast('Visualizando relatório', 'info'); }
function baixarSalvo(btn){ showToast('Download iniciado', 'success'); }
function excluirSalvo(btn){
    const item = btn.closest('.saved-item');
    const id = parseInt(item.dataset.id);
    const h = JSON.parse(localStorage.getItem('reportsHistory')||'[]');
    localStorage.setItem('reportsHistory',JSON.stringify(h.filter(i=>i.id!==id)));
    item.remove();
    if(document.querySelectorAll('.saved-item').length===0) document.getElementById('reportsList').innerHTML='<div class="empty-state"><i class="fas fa-folder-open"></i><p>Nenhum relatório salvo</p></div>';
    showToast('Relatório removido', 'success');
}

function limparHistorico(){
    if(confirm('Limpar todo o histórico?')){ localStorage.removeItem('reportsHistory'); carregarHistoricoSalvo(); showToast('Histórico limpo', 'success'); }
}

function escapeHtml(t){ const d=document.createElement('div'); d.textContent=t; return d.innerHTML; }
function showToast(m,t){
    let toast=document.getElementById('toast'); if(!toast){ toast=document.createElement('div'); toast.id='toast'; toast.className='toast'; document.body.appendChild(toast); }
    toast.textContent=m; toast.className=`toast ${t}`; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),3000);
}
function logout(){ if(confirm('Sair?')) fetch('/api/logout',{method:'POST'}).then(()=>window.location.href='/'); }