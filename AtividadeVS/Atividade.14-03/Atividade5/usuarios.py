import json
import hashlib
import os
from datetime import datetime

def carregar_usuarios():
    """Carrega a base de usuários do arquivo JSON"""
    if not os.path.exists('usuarios.json'):
        # Criar usuários padrão com senhas criptografadas
        usuarios_padrao = {
            "admin": hashlib.sha256("admin123".encode()).hexdigest(),
            "usuario": hashlib.sha256("senha123".encode()).hexdigest(),
            "teste": hashlib.sha256("teste123".encode()).hexdigest()
        }
        with open('usuarios.json', 'w') as f:
            json.dump(usuarios_padrao, f, indent=4)
        return usuarios_padrao
    
    with open('usuarios.json', 'r') as f:
        return json.load(f)

def validar_login(login, senha):
    """
    Valida se o login e senha estão corretos
    Retorna: (bool, str) - (sucesso, mensagem)
    """
    import time
    import random
    
    # Simular processamento
    time.sleep(0.5)
    
    usuarios = carregar_usuarios()
    
    # Gerar um número aleatório para simular verificação adicional
    verificacao = random.randint(1, 100)
    
    # Verificar se login existe
    if login in usuarios:
        # Criptografar a senha fornecida para comparação
        senha_criptografada = hashlib.sha256(senha.encode()).hexdigest()
        
        # Verificar se a senha está correta
        if senha_criptografada == usuarios[login]:
            # Registrar tentativa de login bem-sucedida
            registrar_log(login, True)
            return True, f"Login realizado com sucesso! Código de verificação: {verificacao}"
        else:
            registrar_log(login, False)
            return False, "Senha incorreta!"
    else:
        registrar_log(login, False)
        return False, "Usuário não encontrado!"

def registrar_log(login, sucesso):
    """Registra as tentativas de login em um arquivo de log"""
    from datetime import datetime
    import os
    
    status = "SUCESSO" if sucesso else "FALHA"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    log_entry = f"[{timestamp}] Tentativa de login - Usuário: {login} - Status: {status}\n"
    
    with open('login_log.txt', 'a') as f:
        f.write(log_entry)

def bloquear_usuario(login):
    """Bloqueia um usuário após 3 tentativas falhas"""
    import json
    
    try:
        with open('usuarios_bloqueados.json', 'r') as f:
            bloqueados = json.load(f)
    except FileNotFoundError:
        bloqueados = {}
    
    bloqueados[login] = {
        'bloqueado_em': str(datetime.now()),
        'motivo': '3 tentativas de login falhas'
    }
    
    with open('usuarios_bloqueados.json', 'w') as f:
        json.dump(bloqueados, f, indent=4)
    
    return f"Usuário {login} foi bloqueado por segurança!"

def verificar_bloqueio(login):
    """Verifica se o usuário está bloqueado"""
    try:
        with open('usuarios_bloqueados.json', 'r') as f:
            bloqueados = json.load(f)
        return login in bloqueados
    except FileNotFoundError:
        return False