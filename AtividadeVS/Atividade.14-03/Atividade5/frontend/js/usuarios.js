// frontend/js/usuarios.js
let todosUsuarios = [];
let usuariosFiltrados = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentEditLogin = null;
let isAdmin = false;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário é admin
    verificarPermissaoAdmin();
    carregarUsuarios();
    configurarEventos();
});

async function verificarPermissaoAdmin() {
    try {
        const response = await fetch('/api/usuario');
        const data = await response.json();
        // Verificar se o usuário logado é admin (pode ser ajustado conforme sua lógica)
        // Por enquanto, vamos considerar que apenas 'admin' tem permissão
        isAdmin = sessionStorage.getItem('username') === 'admin' || data.nome === 'Administrador';
    } catch (error) {
        console.error('Erro ao verificar permissão:', error);
    }
}

function configurarEventos() {
    const searchInput = document.getElementById('searchUsuario');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filtrarUsuarios(e.target.value);
        });
        // Atalho Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    const btnNovo = document.getElementById('btnNovoUsuario');
    if (btnNovo) btnNovo.addEventListener('click', () => abrirModalNovo());

    const form = document.getElementById('usuarioForm');
    if (form) form.addEventListener('submit', salvarUsuario);
}

async function carregarUsuarios() {
    try {
        const response = await fetch('/api/usuarios');
        if (!response.ok) throw new Error('Erro ao carregar usuários');
        const data = await response.json();
        
        // Converter objeto para array
        todosUsuarios = Object.entries(data).map(([login, dados]) => ({
            login: login,
            ...dados
        }));
        
        // Ordenar por nome
        todosUsuarios.sort((a,b) => a.nome.localeCompare(b.nome));
        usuariosFiltrados = [...todosUsuarios];
        atualizarTabela();
        document.getElementById('totalUsuarios').textContent = todosUsuarios.length;
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao carregar usuários', 'error');
    }
}

function filtrarUsuarios(termo) {
    const lowerTerm = termo.toLowerCase().trim();
    if (!lowerTerm) {
        usuariosFiltrados = [...todosUsuarios];
    } else {
        usuariosFiltrados = todosUsuarios.filter(u =>
            u.login.toLowerCase().includes(lowerTerm) ||
            u.nome.toLowerCase().includes(lowerTerm) ||
            u.email.toLowerCase().includes(lowerTerm)
        );
    }
    currentPage = 1;
    atualizarTabela();
}

function atualizarTabela() {
    const tbody = document.getElementById('usuariosTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const usuariosPagina = usuariosFiltrados.slice(start, end);

    if (usuariosPagina.length === 0) {
        tbody.innerHTML = '发展<td colspan="6" style="text-align: center;">Nenhum usuário encontrado</td> </tr>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    tbody.innerHTML = usuariosPagina.map(u => `
        <tr>
            <td>
                <div class="user-cell">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(u.nome)}&background=667eea&color=fff&size=35" alt="Avatar">
                    <div>
                        <strong>${escapeHtml(u.login)}</strong>
                        <small>${u.role || 'user'}</small>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(u.nome)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td><span class="department-badge">${escapeHtml(u.departamento || 'Não informado')}</span></td>
            <td>${u.ultimo_acesso ? formatarData(u.ultimo_acesso) : 'Nunca'}</td>
            <td>
                <div class="action-buttons">
                    ${isAdmin ? `
                        <button class="action-btn-table edit" onclick="editarUsuario('${u.login}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-table delete" onclick="deletarUsuario('${u.login}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : `
                        <span class="no-actions">Sem permissão</span>
                    `}
                </div>
            </td>
        </tr>
    `).join('');

    // Paginação
    const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage);
    const paginationDiv = document.getElementById('pagination');
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    let pagHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        pagHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="irParaPagina(${i})">${i}</button>`;
    }
    paginationDiv.innerHTML = pagHtml;
}

function irParaPagina(page) {
    currentPage = page;
    atualizarTabela();
}

function abrirModalNovo() {
    if (!isAdmin) {
        showToast('Apenas administradores podem criar novos usuários', 'error');
        return;
    }
    
    document.getElementById('modalTitle').textContent = 'Novo Usuário';
    document.getElementById('editLogin').value = '';
    document.getElementById('login').value = '';
    document.getElementById('login').disabled = false;
    document.getElementById('senha').value = '';
    document.getElementById('senha').required = true;
    document.getElementById('senhaHint').style.display = 'none';
    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('departamento').value = '';
    document.getElementById('usuarioModal').style.display = 'flex';
    currentEditLogin = null;
}

function editarUsuario(login) {
    if (!isAdmin) {
        showToast('Apenas administradores podem editar usuários', 'error');
        return;
    }
    
    const user = todosUsuarios.find(u => u.login === login);
    if (!user) {
        showToast('Usuário não encontrado', 'error');
        return;
    }

    document.getElementById('modalTitle').textContent = 'Editar Usuário';
    document.getElementById('editLogin').value = login;
    document.getElementById('login').value = user.login;
    document.getElementById('login').disabled = true;
    document.getElementById('senha').value = '';
    document.getElementById('senha').required = false;
    document.getElementById('senhaHint').style.display = 'block';
    document.getElementById('nome').value = user.nome || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('telefone').value = user.telefone || '';
    document.getElementById('departamento').value = user.departamento || '';
    document.getElementById('usuarioModal').style.display = 'flex';
    currentEditLogin = login;
}

async function salvarUsuario(event) {
    event.preventDefault();

    const login = document.getElementById('login').value.trim();
    const senha = document.getElementById('senha').value;
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value;
    const departamento = document.getElementById('departamento').value;

    if (!login || !nome || !email) {
        showToast('Preencha todos os campos obrigatórios', 'error');
        return;
    }

    const payload = { nome, email, telefone, departamento };

    let url, method;
    if (currentEditLogin) {
        // Edição
        url = `/api/usuarios/${encodeURIComponent(currentEditLogin)}`;
        method = 'PUT';
        if (senha) payload.senha = senha;
    } else {
        // Criação
        url = '/api/cadastro';
        method = 'POST';
        payload.login = login;
        payload.senha = senha;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok && result.success) {
            showToast(currentEditLogin ? 'Usuário atualizado!' : 'Usuário criado!', 'success');
            fecharModal();
            await carregarUsuarios();
        } else {
            showToast(result.message || result.error || 'Erro ao salvar usuário', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao conectar com o servidor', 'error');
    }
}

async function deletarUsuario(login) {
    if (!isAdmin) {
        showToast('Apenas administradores podem excluir usuários', 'error');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir o usuário "${login}"?`)) return;
    
    try {
        const response = await fetch(`/api/usuarios/${encodeURIComponent(login)}`, { method: 'DELETE' });
        const result = await response.json();
        if (response.ok && result.success) {
            showToast(`Usuário ${login} excluído!`, 'success');
            await carregarUsuarios();
        } else {
            showToast(result.error || result.message || 'Erro ao excluir', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao conectar com o servidor', 'error');
    }
}

function fecharModal() {
    document.getElementById('usuarioModal').style.display = 'none';
    document.getElementById('login').disabled = false;
    document.getElementById('senha').required = true;
    document.getElementById('senhaHint').style.display = 'none';
    currentEditLogin = null;
}

function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 2) {
        value = `(${value.slice(0,2)}) ${value.slice(2)}`;
    }
    if (value.length > 9) {
        value = value.slice(0, 9) + '-' + value.slice(9);
    }
    input.value = value;
}

function formatarData(dataISO) {
    if (!dataISO) return 'Nunca';
    try {
        const data = new Date(dataISO);
        return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return dataISO;
    }
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
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        fetch('/api/logout', { method: 'POST' })
            .then(() => window.location.href = '/');
    }
}