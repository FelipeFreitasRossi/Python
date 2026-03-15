import os
import json
import hashlib
from datetime import datetime

# Diretório base do arquivo atual
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
USUARIOS_JSON = os.path.join(DATA_DIR, 'usuarios.json')
BLOQUEADOS_JSON = os.path.join(DATA_DIR, 'usuarios_bloqueados.json')
LOG_FILE = os.path.join(DATA_DIR, 'login_log.txt')

def carregar_usuarios():
    """Carrega a base de usuários do arquivo JSON"""
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(USUARIOS_JSON):
        # Criar usuários padrão
        usuarios_padrao = {
            "admin": hashlib.sha256("admin123".encode()).hexdigest(),
            "usuario": hashlib.sha256("senha123".encode()).hexdigest(),
            "teste": hashlib.sha256("teste123".encode()).hexdigest()
        }
        with open(USUARIOS_JSON, 'w', encoding='utf-8') as f:
            json.dump(usuarios_padrao, f, indent=4, ensure_ascii=False)
        return usuarios_padrao
    
    with open(USUARIOS_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)

def salvar_usuarios(usuarios):
    """Salva a base de usuários no arquivo JSON"""
    with open(USUARIOS_JSON, 'w', encoding='utf-8') as f:
        json.dump(usuarios, f, indent=4, ensure_ascii=False)

def validar_login(login, senha):
    usuarios = carregar_usuarios()
    if login in usuarios:
        senha_hash = hashlib.sha256(senha.encode()).hexdigest()
        if senha_hash == usuarios[login]:
            registrar_log(login, True)
            return True, "Login realizado com sucesso!"
        else:
            registrar_log(login, False)
            return False, "Senha incorreta!"
    else:
        registrar_log(login, False)
        return False, "Usuário não encontrado!"

def cadastrar_usuario(login, senha, nome, email, telefone="", departamento=""):
    usuarios = carregar_usuarios()
    if login in usuarios:
        return False, "Usuário já existe!"
    # Aqui podemos armazenar mais informações, mas por simplicidade vamos manter só a senha
    # Se quiser armazenar nome/email, é necessário mudar a estrutura do JSON.
    # Vou adaptar para armazenar um dicionário com mais dados.
    # Mas para manter compatibilidade com o login atual, vou manter apenas a senha por enquanto.
    # Se quiser enriquecer, precisamos alterar a estrutura.
    # Vou fazer uma versão melhorada:
    
    # Estrutura melhorada: cada usuário tem um dict com senha e dados
    # Para não quebrar o login atual, vamos converter a estrutura.
    # Primeiro, verificamos se a estrutura é antiga (string) e convertemos.
    
    # Vamos refatorar: o arquivo usuarios.json terá para cada login um dict com 'senha', 'nome', 'email', etc.
    # Mas isso exigiria mudar o validar_login. Vou manter a simplicidade e só armazenar a senha por enquanto.
    # Se quiser, posso fazer a versão completa.
    
    # Versão simples (só senha):
    usuarios[login] = hashlib.sha256(senha.encode()).hexdigest()
    salvar_usuarios(usuarios)
    registrar_log(login, True, acao="cadastro")
    return True, "Usuário cadastrado com sucesso!"

def registrar_log(login, sucesso, acao="login"):
    status = "SUCESSO" if sucesso else "FALHA"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(f"[{timestamp}] {acao} - Usuário: {login} - Status: {status}\n")

# Funções de bloqueio (opcional)
def bloquear_usuario(login):
    try:
        with open(BLOQUEADOS_JSON, 'r') as f:
            bloqueados = json.load(f)
    except:
        bloqueados = {}
    bloqueados[login] = {'bloqueado_em': str(datetime.now()), 'motivo': '3 tentativas falhas'}
    with open(BLOQUEADOS_JSON, 'w') as f:
        json.dump(bloqueados, f, indent=4)
    return f"Usuário {login} bloqueado."

def verificar_bloqueio(login):
    try:
        with open(BLOQUEADOS_JSON, 'r') as f:
            bloqueados = json.load(f)
        return login in bloqueados
    except:
        return False