from flask import Flask, render_template, request, jsonify, session, redirect
from flask_cors import CORS
import os
import json
import hashlib
from datetime import timedelta, datetime

# Cria a aplicação Flask apontando para a pasta frontend
app = Flask(__name__,
            static_folder='../frontend',
            template_folder='../frontend',
            static_url_path='/assets')

app.secret_key = 'sua_chave_super_secreta_mude_em_producao'
app.permanent_session_lifetime = timedelta(minutes=30)

CORS(app, supports_credentials=True)

# Caminho do arquivo de usuários
USERS_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'usuarios.json')

# Garante que a pasta data existe
os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)

# Função para carregar usuários do arquivo
def load_users():
    if not os.path.exists(USERS_FILE):
        # Cria usuários iniciais para teste
        initial_users = {
            "admin": {
                "senha": hashlib.sha256("admin123".encode()).hexdigest(),
                "nome": "Administrador",
                "email": "admin@sistema.com",
                "data_criacao": str(datetime.now())
            },
            "usuario": {
                "senha": hashlib.sha256("senha123".encode()).hexdigest(),
                "nome": "Usuário Padrão",
                "email": "usuario@sistema.com",
                "data_criacao": str(datetime.now())
            }
        }
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(initial_users, f, indent=4, ensure_ascii=False)
        return initial_users
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

# Função para salvar usuários no arquivo
def save_users(users):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=4, ensure_ascii=False)

# Rotas para páginas
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cadastro')
def cadastro():
    return render_template('cadastro.html')

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect('/')
    return render_template('dashboard.html')

# API de login
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    login = data.get('usuario')
    senha = data.get('senha')

    if not login or not senha:
        return jsonify({'success': False, 'message': 'Usuário e senha são obrigatórios'})

    users = load_users()
    senha_hash = hashlib.sha256(senha.encode()).hexdigest()

    if login in users and users[login]['senha'] == senha_hash:
        session['user'] = login
        session.permanent = True
        # Atualiza último acesso (opcional)
        users[login]['ultimo_acesso'] = str(datetime.now())
        save_users(users)
        return jsonify({'success': True, 'message': 'Login realizado com sucesso!'})
    else:
        return jsonify({'success': False, 'message': 'Usuário ou senha inválidos!'})

# API de cadastro
@app.route('/api/cadastro', methods=['POST'])
def api_cadastro():
    data = request.json
    login = data.get('login')
    senha = data.get('senha')
    nome = data.get('nome')
    email = data.get('email')
    telefone = data.get('telefone', '')
    departamento = data.get('departamento', '')

    # Validações básicas
    if not login or not senha or not nome or not email:
        return jsonify({'success': False, 'message': 'Todos os campos obrigatórios devem ser preenchidos'})

    users = load_users()

    # Verifica se login já existe
    if login in users:
        return jsonify({'success': False, 'message': 'Nome de usuário já existe'})

    # Verifica se email já existe (opcional)
    for u in users.values():
        if u.get('email') == email:
            return jsonify({'success': False, 'message': 'E-mail já cadastrado'})

    # Cria novo usuário
    novo_usuario = {
        'senha': hashlib.sha256(senha.encode()).hexdigest(),
        'nome': nome,
        'email': email,
        'telefone': telefone,
        'departamento': departamento,
        'data_criacao': str(datetime.now()),
        'ultimo_acesso': None
    }
    users[login] = novo_usuario
    save_users(users)

    return jsonify({'success': True, 'message': 'Cadastro realizado com sucesso!'})

# API de logout
@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True})

# Rota para verificar se usuário está logado
@app.route('/api/verificar_sessao', methods=['GET'])
def verificar_sessao():
    return jsonify({
        'autenticado': 'user' in session,
        'usuario': session.get('user')
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)