from flask import Flask, render_template, request, jsonify, session, redirect
from flask_cors import CORS
import os
import json
import hashlib
import traceback
from datetime import timedelta, datetime

app = Flask(__name__,
            static_folder='../frontend',
            template_folder='../frontend',
            static_url_path='/assets')

app.secret_key = 'sua_chave_super_secreta_mude_em_producao'
app.permanent_session_lifetime = timedelta(minutes=30)

CORS(app, supports_credentials=True)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'data')
USERS_FILE = os.path.join(DATA_DIR, 'usuarios.json')

os.makedirs(DATA_DIR, exist_ok=True)

def load_users():
    try:
        if not os.path.exists(USERS_FILE):
            initial_users = {
                "admin": {
                    "senha": hashlib.sha256("admin123".encode()).hexdigest(),
                    "nome": "Administrador",
                    "email": "admin@sistema.com",
                    "departamento": "TI",
                    "telefone": "(11) 99999-9999",
                    "data_criacao": str(datetime.now())
                },
                "usuario": {
                    "senha": hashlib.sha256("senha123".encode()).hexdigest(),
                    "nome": "Usuário Padrão",
                    "email": "usuario@sistema.com",
                    "departamento": "Vendas",
                    "telefone": "(11) 88888-8888",
                    "data_criacao": str(datetime.now())
                }
            }
            with open(USERS_FILE, 'w', encoding='utf-8') as f:
                json.dump(initial_users, f, indent=4, ensure_ascii=False)
            return initial_users
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Erro ao carregar usuários: {str(e)}")
        traceback.print_exc()
        return {}

def save_users(users):
    try:
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"❌ Erro ao salvar usuários: {str(e)}")
        traceback.print_exc()
        return False

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

@app.route('/analises')
def analises():
    if 'user' not in session:
        return redirect('/')
    return render_template('analises.html')

@app.route('/usuarios')
def usuarios():
    if 'user' not in session:
        return redirect('/')
    return render_template('usuarios.html')

@app.route('/configuracoes')
def configuracoes():
    if 'user' not in session:
        return redirect('/')
    return render_template('configuracoes.html')

@app.route('/relatorios')
def relatorios():
    if 'user' not in session:
        return redirect('/')
    return render_template('relatorios.html')

@app.route('/agenda')
def agenda():
    if 'user' not in session:
        return redirect('/')
    return render_template('agenda.html')

# ---------- APIs de Autenticação ----------
@app.route('/api/login', methods=['POST'])
def api_login():
    try:
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
            users[login]['ultimo_acesso'] = str(datetime.now())
            save_users(users)
            return jsonify({'success': True, 'message': 'Login realizado com sucesso!'})
        else:
            return jsonify({'success': False, 'message': 'Usuário ou senha inválidos!'})
    except Exception as e:
        print(f"❌ Erro no login: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Erro interno: {str(e)}'}), 500

@app.route('/api/cadastro', methods=['POST'])
def api_cadastro():
    try:
        data = request.json
        login = data.get('login')
        senha = data.get('senha')
        nome = data.get('nome')
        email = data.get('email')
        telefone = data.get('telefone', '')
        departamento = data.get('departamento', '')
        if not login or not senha or not nome or not email:
            return jsonify({'success': False, 'message': 'Todos os campos obrigatórios devem ser preenchidos'})
        users = load_users()
        if login in users:
            return jsonify({'success': False, 'message': 'Nome de usuário já existe'})
        for u in users.values():
            if u.get('email') == email:
                return jsonify({'success': False, 'message': 'E-mail já cadastrado'})
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
        if save_users(users):
            return jsonify({'success': True, 'message': 'Cadastro realizado com sucesso!'})
        else:
            return jsonify({'success': False, 'message': 'Erro ao salvar usuário'}), 500
    except Exception as e:
        print(f"❌ Erro no cadastro: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Erro interno: {str(e)}'}), 500

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/verificar_sessao', methods=['GET'])
def verificar_sessao():
    return jsonify({'autenticado': 'user' in session, 'usuario': session.get('user')})

# ---------- APIs do Dashboard ----------
@app.route('/api/usuario', methods=['GET'])
def api_usuario():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    users = load_users()
    user_data = users.get(session['user'], {}).copy()
    user_data.pop('senha', None)
    return jsonify(user_data)

@app.route('/api/estatisticas', methods=['GET'])
def api_estatisticas():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    users = load_users()
    total = len(users)
    agora = datetime.now()
    online = 0
    acessos_hoje = 0
    for u in users.values():
        if u.get('ultimo_acesso'):
            try:
                ultimo = datetime.fromisoformat(u['ultimo_acesso'])
                if (agora - ultimo).total_seconds() < 300:
                    online += 1
                if ultimo.date() == agora.date():
                    acessos_hoje += 1
            except:
                pass
    return jsonify({'total_usuarios': total, 'usuarios_online': online, 'acessos_hoje': acessos_hoje})

@app.route('/api/graficos', methods=['GET'])
def api_graficos():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    return jsonify({
        'acessos_por_dia': [5, 8, 12, 7, 10, 15, 9],
        'departamentos': {
            'labels': ['TI', 'Vendas', 'Marketing', 'RH', 'Financeiro'],
            'data': [10, 8, 5, 3, 2]
        }
    })

# ---------- APIs de Usuários ----------
@app.route('/api/usuarios', methods=['GET'])
def api_listar_usuarios():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    users = load_users()
    for login in users:
        users[login].pop('senha', None)
    return jsonify(users)

@app.route('/api/usuarios/<login>', methods=['DELETE'])
def api_deletar_usuario(login):
    if 'user' not in session or session['user'] != 'admin':
        return jsonify({'error': 'Permissão negada'}), 403
    users = load_users()
    if login not in users:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    del users[login]
    save_users(users)
    return jsonify({'success': True, 'message': 'Usuário removido'})

@app.route('/api/usuarios/<login>', methods=['PUT'])
def api_atualizar_usuario(login):
    if 'user' not in session or session['user'] != 'admin':
        return jsonify({'error': 'Permissão negada'}), 403
    data = request.json
    users = load_users()
    if login not in users:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    for campo in ['nome', 'email', 'telefone', 'departamento']:
        if campo in data:
            users[login][campo] = data[campo]
    save_users(users)
    return jsonify({'success': True, 'message': 'Usuário atualizado'})

# ---------- APIs de Análises ----------
@app.route('/api/analises', methods=['GET'])
def api_analises():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    return jsonify({
        'acessos_por_mes': [45, 52, 68, 74, 89, 102, 118, 135, 122, 110, 95, 80],
        'dispositivos': {'labels': ['Desktop', 'Mobile', 'Tablet'], 'data': [450, 320, 80]},
        'tempo_medio': '8m 32s'
    })

# ---------- APIs de Agenda ----------
@app.route('/api/eventos', methods=['GET'])
def api_eventos():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    eventos = [
        {'id': 1, 'titulo': 'Reunião de planejamento', 'data': '2025-03-20', 'hora': '10:00', 'tipo': 'reuniao'},
        {'id': 2, 'titulo': 'Entrega de relatório', 'data': '2025-03-22', 'hora': '14:30', 'tipo': 'prazo'},
        {'id': 3, 'titulo': 'Workshop de segurança', 'data': '2025-03-25', 'hora': '09:00', 'tipo': 'evento'}
    ]
    return jsonify(eventos)

if __name__ == '__main__':
    app.run(debug=True, port=5000)