from flask import Flask, render_template, request, jsonify, session, redirect, send_from_directory
from flask_cors import CORS
import os
import json
import hashlib
import traceback
from datetime import timedelta, datetime
from werkzeug.utils import secure_filename

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
TASKS_FILE = os.path.join(DATA_DIR, 'tarefas.json')
LOGS_FILE = os.path.join(DATA_DIR, 'logs_acesso.json')
EVENTS_FILE = os.path.join(DATA_DIR, 'eventos.json')
UPLOAD_FOLDER = os.path.join(os.path.dirname(BASE_DIR), 'frontend', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ===== FUNÇÕES DE USUÁRIOS =====
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

# ===== FUNÇÕES DE TAREFAS =====
def load_tasks():
    try:
        if not os.path.exists(TASKS_FILE):
            initial_tasks = {
                "1": {
                    "id": 1,
                    "titulo": "Implementar sistema de login",
                    "descricao": "Criar autenticação com JWT e validação de credenciais",
                    "status": "concluida",
                    "prioridade": "alta",
                    "criado_em": str(datetime.now()),
                    "prazo": "2025-03-20",
                    "usuario": "admin"
                },
                "2": {
                    "id": 2,
                    "titulo": "Criar dashboard principal",
                    "descricao": "Desenvolver interface principal com gráficos e estatísticas",
                    "status": "pendente",
                    "prioridade": "alta",
                    "criado_em": str(datetime.now()),
                    "prazo": "2025-03-25",
                    "usuario": "admin"
                },
                "3": {
                    "id": 3,
                    "titulo": "Desenvolver página de relatórios",
                    "descricao": "Criar página para geração de relatórios em PDF",
                    "status": "pendente",
                    "prioridade": "media",
                    "criado_em": str(datetime.now()),
                    "prazo": "2025-03-30",
                    "usuario": "admin"
                }
            }
            with open(TASKS_FILE, 'w', encoding='utf-8') as f:
                json.dump(initial_tasks, f, indent=4, ensure_ascii=False)
            return initial_tasks
        with open(TASKS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Erro ao carregar tarefas: {str(e)}")
        return {}

def save_tasks(tasks):
    try:
        with open(TASKS_FILE, 'w', encoding='utf-8') as f:
            json.dump(tasks, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"❌ Erro ao salvar tarefas: {str(e)}")
        return False

# ===== FUNÇÕES DE LOGS =====
def registrar_acesso(login, ip='desconhecido'):
    try:
        if not os.path.exists(LOGS_FILE):
            logs = []
        else:
            with open(LOGS_FILE, 'r', encoding='utf-8') as f:
                logs = json.load(f)
        
        logs.append({
            'usuario': login,
            'data': str(datetime.now()),
            'ip': ip
        })
        
        if len(logs) > 1000:
            logs = logs[-1000:]
        
        with open(LOGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(logs, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Erro ao registrar acesso: {e}")
        return False

def obter_acessos_por_dia(dias=7):
    try:
        if not os.path.exists(LOGS_FILE):
            return [0] * dias
        
        with open(LOGS_FILE, 'r', encoding='utf-8') as f:
            logs = json.load(f)
        
        acessos_por_dia = {}
        hoje = datetime.now().date()
        
        for log in logs:
            try:
                data_acesso = datetime.fromisoformat(log['data']).date()
                if (hoje - data_acesso).days < dias:
                    chave = data_acesso.strftime('%Y-%m-%d')
                    acessos_por_dia[chave] = acessos_por_dia.get(chave, 0) + 1
            except:
                pass
        
        resultado = []
        for i in range(dias-1, -1, -1):
            data = hoje - timedelta(days=i)
            chave = data.strftime('%Y-%m-%d')
            resultado.append(acessos_por_dia.get(chave, 0))
        
        return resultado
    except Exception as e:
        print(f"Erro ao obter acessos: {e}")
        return [0] * dias

def obter_acessos_por_mes():
    try:
        if not os.path.exists(LOGS_FILE):
            return [0] * 12
        
        with open(LOGS_FILE, 'r', encoding='utf-8') as f:
            logs = json.load(f)
        
        acessos_por_mes = [0] * 12
        hoje = datetime.now()
        
        for log in logs:
            try:
                data = datetime.fromisoformat(log['data'])
                meses_diff = (hoje.year - data.year) * 12 + (hoje.month - data.month)
                if meses_diff < 12:
                    mes_index = data.month - 1
                    acessos_por_mes[mes_index] += 1
            except:
                pass
        
        return acessos_por_mes
    except Exception as e:
        print(f"Erro ao obter acessos por mês: {e}")
        return [0] * 12

# ===== FUNÇÕES DE EVENTOS =====
def load_events():
    """Carrega os eventos do arquivo JSON"""
    try:
        if not os.path.exists(EVENTS_FILE):
            # Criar alguns eventos de exemplo
            hoje = datetime.now()
            initial_events = {
                "1": {
                    "id": 1,
                    "titulo": "Reunião de planejamento",
                    "data": hoje.strftime("%Y-%m-%d"),
                    "hora": "10:00",
                    "tipo": "reuniao",
                    "descricao": "Planejamento do próximo sprint",
                    "usuario": "admin",
                    "criado_em": str(datetime.now())
                },
                "2": {
                    "id": 2,
                    "titulo": "Entrega de relatório",
                    "data": (hoje + timedelta(days=2)).strftime("%Y-%m-%d"),
                    "hora": "14:30",
                    "tipo": "prazo",
                    "descricao": "Relatório mensal de atividades",
                    "usuario": "admin",
                    "criado_em": str(datetime.now())
                },
                "3": {
                    "id": 3,
                    "titulo": "Workshop de segurança",
                    "data": (hoje + timedelta(days=5)).strftime("%Y-%m-%d"),
                    "hora": "09:00",
                    "tipo": "evento",
                    "descricao": "Treinamento de segurança da informação",
                    "usuario": "admin",
                    "criado_em": str(datetime.now())
                }
            }
            with open(EVENTS_FILE, 'w', encoding='utf-8') as f:
                json.dump(initial_events, f, indent=4, ensure_ascii=False)
            return initial_events
        with open(EVENTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Erro ao carregar eventos: {str(e)}")
        return {}

def save_events(events):
    """Salva os eventos no arquivo JSON"""
    try:
        with open(EVENTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"❌ Erro ao salvar eventos: {str(e)}")
        return False

# ===== FUNÇÕES DE AVATAR =====
def salvar_avatar(login, file):
    try:
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{login}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{ext}"
        filename = secure_filename(filename)
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        avatar_url = f"/uploads/{filename}"
        
        users = load_users()
        if login in users:
            users[login]['avatar'] = avatar_url
            save_users(users)
        
        return avatar_url
    except Exception as e:
        print(f"Erro ao salvar avatar: {e}")
        return None

# ===== ROTAS PARA PÁGINAS =====
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
    return render_template('usuarios.html', is_admin=(session['user'] == 'admin'))

@app.route('/tarefas')
def tarefas():
    if 'user' not in session:
        return redirect('/')
    return render_template('tarefas.html')

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

# ===== APIs DE AUTENTICAÇÃO =====
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
            registrar_acesso(login, request.remote_addr)
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

# ===== APIs DO DASHBOARD =====
@app.route('/api/usuario', methods=['GET'])
def api_usuario():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    users = load_users()
    user_data = users.get(session['user'], {}).copy()
    user_data.pop('senha', None)
    user_data['login'] = session['user']
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
    
    return jsonify({
        'total_usuarios': total,
        'usuarios_online': online,
        'acessos_hoje': acessos_hoje
    })

@app.route('/api/graficos', methods=['GET'])
def api_graficos():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    users = load_users()
    acessos_por_dia = obter_acessos_por_dia(7)
    
    dept_count = {}
    for u in users.values():
        dept = u.get('departamento', 'Não informado')
        dept_count[dept] = dept_count.get(dept, 0) + 1
    
    labels = list(dept_count.keys())
    data = list(dept_count.values())
    
    return jsonify({
        'acessos_por_dia': acessos_por_dia,
        'departamentos': {
            'labels': labels,
            'data': data
        }
    })

# ===== APIs DE USUÁRIOS =====
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
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    if session['user'] != 'admin':
        return jsonify({'error': 'Permissão negada. Apenas administradores podem excluir usuários.'}), 403
    
    users = load_users()
    
    if login not in users:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    if login == 'admin':
        return jsonify({'error': 'Não é possível excluir o usuário administrador principal'}), 400
    
    del users[login]
    save_users(users)
    return jsonify({'success': True, 'message': 'Usuário removido'})

@app.route('/api/usuarios/<login>', methods=['PUT'])
def api_atualizar_usuario(login):
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    if session['user'] != 'admin':
        return jsonify({'error': 'Permissão negada. Apenas administradores podem editar usuários.'}), 403
    
    data = request.json
    users = load_users()
    
    if login not in users:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    for campo in ['nome', 'email', 'telefone', 'departamento']:
        if campo in data:
            users[login][campo] = data[campo]
    
    if 'senha' in data and data['senha']:
        users[login]['senha'] = hashlib.sha256(data['senha'].encode()).hexdigest()
    
    save_users(users)
    return jsonify({'success': True, 'message': 'Usuário atualizado'})

# ===== APIs DE TAREFAS =====
@app.route('/api/tarefas', methods=['GET'])
def api_listar_tarefas():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    tasks = load_tasks()
    usuario_atual = session['user']
    tarefas_usuario = {k: v for k, v in tasks.items() if v.get('usuario') == usuario_atual}
    return jsonify(list(tarefas_usuario.values()))

@app.route('/api/tarefas', methods=['POST'])
def api_criar_tarefa():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.json
    tasks = load_tasks()
    
    ids = [int(k) for k in tasks.keys()]
    next_id = max(ids) if ids else 0
    next_id += 1
    
    nova_tarefa = {
        "id": next_id,
        "titulo": data.get('titulo'),
        "descricao": data.get('descricao', ''),
        "status": data.get('status', 'pendente'),
        "prioridade": data.get('prioridade', 'media'),
        "criado_em": str(datetime.now()),
        "prazo": data.get('prazo', ''),
        "usuario": session['user']
    }
    
    tasks[str(next_id)] = nova_tarefa
    save_tasks(tasks)
    return jsonify({'success': True, 'tarefa': nova_tarefa})

@app.route('/api/tarefas/<int:tarefa_id>', methods=['PUT'])
def api_atualizar_tarefa(tarefa_id):
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.json
    tasks = load_tasks()
    
    if str(tarefa_id) not in tasks:
        return jsonify({'error': 'Tarefa não encontrada'}), 404
    
    if tasks[str(tarefa_id)]['usuario'] != session['user']:
        return jsonify({'error': 'Acesso negado'}), 403
    
    for campo in ['titulo', 'descricao', 'status', 'prioridade', 'prazo']:
        if campo in data:
            tasks[str(tarefa_id)][campo] = data[campo]
    
    save_tasks(tasks)
    return jsonify({'success': True, 'tarefa': tasks[str(tarefa_id)]})

@app.route('/api/tarefas/<int:tarefa_id>', methods=['DELETE'])
def api_excluir_tarefa(tarefa_id):
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    tasks = load_tasks()
    
    if str(tarefa_id) not in tasks:
        return jsonify({'error': 'Tarefa não encontrada'}), 404
    
    if tasks[str(tarefa_id)]['usuario'] != session['user']:
        return jsonify({'error': 'Acesso negado'}), 403
    
    del tasks[str(tarefa_id)]
    save_tasks(tasks)
    return jsonify({'success': True, 'message': 'Tarefa excluída'})

@app.route('/api/tarefas/<int:tarefa_id>/toggle', methods=['PUT'])
def api_toggle_tarefa(tarefa_id):
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    tasks = load_tasks()
    
    if str(tarefa_id) not in tasks:
        return jsonify({'error': 'Tarefa não encontrada'}), 404
    
    if tasks[str(tarefa_id)]['usuario'] != session['user']:
        return jsonify({'error': 'Acesso negado'}), 403
    
    novo_status = 'concluida' if tasks[str(tarefa_id)]['status'] == 'pendente' else 'pendente'
    tasks[str(tarefa_id)]['status'] = novo_status
    save_tasks(tasks)
    
    return jsonify({'success': True, 'status': novo_status, 'tarefa': tasks[str(tarefa_id)]})

# ===== APIs DE ANÁLISES =====
@app.route('/api/analises', methods=['GET'])
def api_analises():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    users = load_users()
    agora = datetime.now()
    
    total_acessos_30d = sum(obter_acessos_por_dia(30))
    acessos_7d = obter_acessos_por_dia(7)
    usuarios_ativos = sum(acessos_7d)
    tempo_medio = "8m 32s"
    acessos_por_mes = obter_acessos_por_mes()
    
    dispositivos = {'labels': ['Desktop', 'Mobile', 'Tablet'], 'data': [450, 320, 80]}
    
    dept_metrics = {}
    for login, dados in users.items():
        dept = dados.get('departamento', 'Não informado')
        if dept not in dept_metrics:
            dept_metrics[dept] = {'total_usuarios': 0, 'acessos_30d': 0, 'tempo_medio': 0}
        dept_metrics[dept]['total_usuarios'] += 1
    
    try:
        if os.path.exists(LOGS_FILE):
            with open(LOGS_FILE, 'r', encoding='utf-8') as f:
                logs = json.load(f)
            trinta_dias_atras = agora - timedelta(days=30)
            for log in logs:
                try:
                    data_log = datetime.fromisoformat(log['data'])
                    if data_log >= trinta_dias_atras:
                        usuario_log = log['usuario']
                        if usuario_log in users:
                            dept = users[usuario_log].get('departamento', 'Não informado')
                            if dept in dept_metrics:
                                dept_metrics[dept]['acessos_30d'] += 1
                except:
                    pass
    except:
        pass
    
    dept_list = [
        {'departamento': dept, 'total_usuarios': info['total_usuarios'], 'acessos_30d': info['acessos_30d'], 'tempo_medio': f"{round(4 + len(dept) % 3, 1)} min"}
        for dept, info in dept_metrics.items()
    ]
    dept_list.sort(key=lambda x: x['total_usuarios'], reverse=True)
    total_acessos = sum(acessos_por_mes)
    
    return jsonify({
        'total_acessos_30d': total_acessos_30d,
        'tempo_medio': tempo_medio,
        'usuarios_ativos': usuarios_ativos,
        'acessos_por_mes': acessos_por_mes,
        'dispositivos': dispositivos,
        'dept_metrics': dept_list,
        'total_acessos': total_acessos
    })

# ===== APIs DE AVATAR =====
@app.route('/api/upload-avatar', methods=['POST'])
def api_upload_avatar():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    login = session['user']
    
    if 'avatar' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['avatar']
    
    if file.filename == '':
        return jsonify({'error': 'Arquivo vazio'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Tipo de arquivo não permitido. Use PNG, JPG, JPEG, GIF ou WEBP'}), 400
    
    avatar_url = salvar_avatar(login, file)
    
    if avatar_url:
        return jsonify({'success': True, 'avatar_url': avatar_url, 'message': 'Avatar atualizado com sucesso!'})
    else:
        return jsonify({'error': 'Erro ao salvar avatar'}), 500

@app.route('/api/remover-avatar', methods=['POST'])
def api_remover_avatar():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    login = session['user']
    users = load_users()
    
    if login in users and 'avatar' in users[login]:
        avatar_path = users[login]['avatar']
        if avatar_path and avatar_path.startswith('/uploads/'):
            filename = avatar_path.replace('/uploads/', '')
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
        del users[login]['avatar']
        save_users(users)
    
    return jsonify({'success': True, 'message': 'Avatar removido com sucesso!'})

# ===== ROTA PARA ARQUIVOS DE UPLOAD =====
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ===== APIs DE EVENTOS =====
@app.route('/api/eventos', methods=['GET'])
def api_listar_eventos():
    """Lista todos os eventos do usuário logado"""
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    events = load_events()
    usuario_atual = session['user']
    
    # Filtrar eventos do usuário atual
    eventos_usuario = {k: v for k, v in events.items() if v.get('usuario') == usuario_atual}
    
    return jsonify(list(eventos_usuario.values()))

@app.route('/api/eventos', methods=['POST'])
def api_criar_evento():
    """Cria um novo evento"""
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.json
    events = load_events()
    
    # Gerar novo ID
    ids = [int(k) for k in events.keys()]
    next_id = max(ids) if ids else 0
    next_id += 1
    
    novo_evento = {
        "id": next_id,
        "titulo": data.get('titulo'),
        "data": data.get('data'),
        "hora": data.get('hora', ''),
        "tipo": data.get('tipo', 'reuniao'),
        "descricao": data.get('descricao', ''),
        "usuario": session['user'],
        "criado_em": str(datetime.now())
    }
    
    events[str(next_id)] = novo_evento
    save_events(events)
    
    return jsonify({'success': True, 'evento': novo_evento})

@app.route('/api/eventos/<int:evento_id>', methods=['PUT'])
def api_atualizar_evento(evento_id):
    """Atualiza um evento existente"""
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.json
    events = load_events()
    
    if str(evento_id) not in events:
        return jsonify({'error': 'Evento não encontrado'}), 404
    
    if events[str(evento_id)]['usuario'] != session['user']:
        return jsonify({'error': 'Acesso negado'}), 403
    
    events[str(evento_id)]['titulo'] = data.get('titulo', events[str(evento_id)]['titulo'])
    events[str(evento_id)]['data'] = data.get('data', events[str(evento_id)]['data'])
    events[str(evento_id)]['hora'] = data.get('hora', events[str(evento_id)]['hora'])
    events[str(evento_id)]['tipo'] = data.get('tipo', events[str(evento_id)]['tipo'])
    events[str(evento_id)]['descricao'] = data.get('descricao', events[str(evento_id)]['descricao'])
    
    save_events(events)
    return jsonify({'success': True, 'evento': events[str(evento_id)]})

@app.route('/api/eventos/<int:evento_id>', methods=['DELETE'])
def api_excluir_evento(evento_id):
    """Exclui um evento"""
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    
    events = load_events()
    
    if str(evento_id) not in events:
        return jsonify({'error': 'Evento não encontrado'}), 404
    
    if events[str(evento_id)]['usuario'] != session['user']:
        return jsonify({'error': 'Acesso negado'}), 403
    
    del events[str(evento_id)]
    save_events(events)
    
    return jsonify({'success': True, 'message': 'Evento excluído'})

# ===== APIs DE LOGS =====
@app.route('/api/logs', methods=['GET'])
def api_logs():
    if 'user' not in session:
        return jsonify({'error': 'Não autorizado'}), 401
    try:
        if not os.path.exists(LOGS_FILE):
            return jsonify([])
        with open(LOGS_FILE, 'r', encoding='utf-8') as f:
            logs = json.load(f)
        return jsonify(logs[-50:])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== INICIALIZAÇÃO =====
if __name__ == '__main__':
    print("=" * 50)
    print("🚀 SecureSystem iniciado!")
    print("📍 Acesse: http://localhost:5000")
    print("=" * 50)
    print("📝 Usuários para teste:")
    print("   admin / admin123")
    print("   usuario / senha123")
    print("=" * 50)
    app.run(debug=True, port=5000)