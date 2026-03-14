import json
import os
import hashlib
from datetime import datetime

class BancoSimples:
    def __init__(self):
        self.arquivo_usuarios = 'data/usuarios.json'
        self.criar_arquivo_se_nao_existir()
    
    def criar_arquivo_se_nao_existir(self):
        """Cria o arquivo JSON se não existir"""
        os.makedirs('data', exist_ok=True)
        
        if not os.path.exists(self.arquivo_usuarios):
            # Usuários iniciais para teste
            usuarios_iniciais = {
                "admin": {
                    "senha": self.criptografar_senha("admin123"),
                    "nome": "Administrador",
                    "email": "admin@sistema.com",
                    "data_criacao": str(datetime.now())
                },
                "usuario": {
                    "senha": self.criptografar_senha("senha123"),
                    "nome": "Usuário Padrão",
                    "email": "usuario@sistema.com",
                    "data_criacao": str(datetime.now())
                }
            }
            
            with open(self.arquivo_usuarios, 'w', encoding='utf-8') as f:
                json.dump(usuarios_iniciais, f, indent=4, ensure_ascii=False)
            print("✅ Arquivo de usuários criado com sucesso!")
    
    def criptografar_senha(self, senha):
        """Criptografa a senha usando SHA-256"""
        return hashlib.sha256(senha.encode()).hexdigest()
    
    def cadastrar_usuario(self, login, senha, nome, email, telefone="", departamento=""):
        """Cadastra um novo usuário"""
        try:
            # Carregar usuários existentes
            with open(self.arquivo_usuarios, 'r', encoding='utf-8') as f:
                usuarios = json.load(f)
            
            # Verificar se login já existe
            if login in usuarios:
                return False, "Usuário já existe!"
            
            # Verificar se email já existe
            for user in usuarios.values():
                if user.get('email') == email:
                    return False, "Email já cadastrado!"
            
            # Criar novo usuário
            novo_usuario = {
                "senha": self.criptografar_senha(senha),
                "nome": nome,
                "email": email,
                "telefone": telefone,
                "departamento": departamento,
                "data_criacao": str(datetime.now()),
                "ultimo_acesso": None
            }
            
            # Adicionar ao dicionário
            usuarios[login] = novo_usuario
            
            # Salvar no arquivo
            with open(self.arquivo_usuarios, 'w', encoding='utf-8') as f:
                json.dump(usuarios, f, indent=4, ensure_ascii=False)
            
            return True, "Usuário cadastrado com sucesso!"
            
        except Exception as e:
            return False, f"Erro ao cadastrar: {str(e)}"
    
    def verificar_login(self, login, senha):
        """Verifica se o login e senha estão corretos"""
        try:
            with open(self.arquivo_usuarios, 'r', encoding='utf-8') as f:
                usuarios = json.load(f)
            
            if login not in usuarios:
                return False, "Usuário não encontrado!"
            
            senha_criptografada = self.criptografar_senha(senha)
            
            if usuarios[login]["senha"] == senha_criptografada:
                # Atualizar último acesso
                usuarios[login]["ultimo_acesso"] = str(datetime.now())
                with open(self.arquivo_usuarios, 'w', encoding='utf-8') as f:
                    json.dump(usuarios, f, indent=4, ensure_ascii=False)
                
                return True, "Login realizado com sucesso!"
            else:
                return False, "Senha incorreta!"
                
        except Exception as e:
            return False, f"Erro ao verificar login: {str(e)}"
    
    def listar_usuarios(self):
        """Lista todos os usuários (sem as senhas)"""
        try:
            with open(self.arquivo_usuarios, 'r', encoding='utf-8') as f:
                usuarios = json.load(f)
            
            # Remover senhas da listagem
            for login in usuarios:
                if 'senha' in usuarios[login]:
                    del usuarios[login]['senha']
            
            return usuarios
        except:
            return {}

# Instância global do banco
banco = BancoSimples()