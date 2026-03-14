import os
import json
import hashlib
from datetime import datetime

def criar_estrutura_inicial():
    """Cria toda a estrutura necessária para o sistema"""
    
    print("🚀 Criando estrutura do SecureSystem...")
    
    # Criar pastas
    pastas = [
        'data',
        'data/logs',
        'assets',
        'assets/css',
        'assets/js',
        'assets/img',
        'assets/vendors'
    ]
    
    for pasta in pastas:
        os.makedirs(pasta, exist_ok=True)
        print(f"✅ Pasta criada: {pasta}")
    
    # Criar usuários iniciais
    usuarios = {
        "admin": {
            "senha": hashlib.sha256("admin123".encode()).hexdigest(),
            "nome": "Administrador",
            "email": "admin@sistema.com",
            "nivel": "admin",
            "data_criacao": str(datetime.now()),
            "ultimo_acesso": None,
            "telefone": "(11) 99999-9999",
            "departamento": "TI",
            "avatar": "admin.png",
            "configuracoes": {
                "tema": "escuro",
                "notificacoes": True,
                "idioma": "pt-BR"
            }
        },
        "usuario": {
            "senha": hashlib.sha256("senha123".encode()).hexdigest(),
            "nome": "Usuário Padrão",
            "email": "usuario@sistema.com",
            "nivel": "user",
            "data_criacao": str(datetime.now()),
            "ultimo_acesso": None,
            "telefone": "(11) 88888-8888",
            "departamento": "Vendas",
            "avatar": "user.png",
            "configuracoes": {
                "tema": "claro",
                "notificacoes": True,
                "idioma": "pt-BR"
            }
        }
    }
    
    with open('data/usuarios.json', 'w', encoding='utf-8') as f:
        json.dump(usuarios, f, indent=4, ensure_ascii=False)
    print("✅ Arquivo de usuários criado")
    
    # Criar configurações iniciais
    config = {
        "sistema": {
            "nome": "SecureSystem",
            "versao": "1.0.0",
            "max_tentativas": 3,
            "tempo_bloqueio": 30
        },
        "seguranca": {
            "criptografia": "SHA256",
            "sessao_timeout": 30,
            "2fa": False,
            "log_atividades": True
        }
    }
    
    with open('data/config.json', 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=4, ensure_ascii=False)
    print("✅ Arquivo de configurações criado")
    
    print("\n🎉 Estrutura criada com sucesso!")
    print("\n📝 Credenciais de teste:")
    print("   admin / admin123")
    print("   usuario / senha123")
    print("\n🚀 Para iniciar o sistema:")
    print("   python main.py")

if __name__ == "__main__":
    criar_estrutura_inicial()