document.addEventListener('DOMContentLoaded', carregarUsuarios);

async function carregarUsuarios() {
    try {
        const response = await fetch('/api/usuarios');
        const users = await response.json();
        const tbody = document.querySelector('#tabelaUsuarios tbody');
        tbody.innerHTML = '';
        for (let [login, dados] of Object.entries(users)) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${login}</td>
                <td>${dados.nome || ''}</td>
                <td>${dados.email || ''}</td>
                <td>${dados.departamento || ''}</td>
                <td>${dados.telefone || ''}</td>
                <td>
                    <button class="action-btn edit" onclick="editarUsuario('${login}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deletarUsuario('${login}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

let modal = document.getElementById('usuarioModal');
let currentLogin = null;

function editarUsuario(login) {
    currentLogin = login;
    document.getElementById('modalTitulo').textContent = 'Editar Usuário';
    // Carregar dados do usuário (simulado - idealmente faria fetch individual)
    // Por simplicidade, vamos buscar da tabela
    const row = event.target.closest('tr');
    const cells = row.cells;
    document.getElementById('editLoginField').value = login;
    document.getElementById('editNome').value = cells[1].textContent;
    document.getElementById('editEmail').value = cells[2].textContent;
    document.getElementById('editTelefone').value = cells[4].textContent;
    document.getElementById('editDepartamento').value = cells[3].textContent;
    modal.style.display = 'block';
}

function fecharModal() {
    modal.style.display = 'none';
}

document.getElementById('usuarioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = {
        nome: document.getElementById('editNome').value,
        email: document.getElementById('editEmail').value,
        telefone: document.getElementById('editTelefone').value,
        departamento: document.getElementById('editDepartamento').value
    };
    try {
        const response = await fetch(`/api/usuarios/${currentLogin}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dados)
        });
        const result = await response.json();
        if (result.success) {
            alert('Usuário atualizado!');
            fecharModal();
            carregarUsuarios();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        alert('Erro ao salvar');
    }
});

async function deletarUsuario(login) {
    if (!confirm(`Excluir usuário ${login}?`)) return;
    try {
        const response = await fetch(`/api/usuarios/${login}`, {method: 'DELETE'});
        const result = await response.json();
        if (result.success) {
            alert('Usuário removido!');
            carregarUsuarios();
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        alert('Erro ao excluir');
    }
}