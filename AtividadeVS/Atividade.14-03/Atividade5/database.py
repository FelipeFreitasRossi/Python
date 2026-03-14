import json
import os
from datetime import datetime
import hashlib
import uuid

class Database:
    def __init__(self):
        self.data_dir = 'data'
        self.logs_dir = 'data/logs'
        self.criar_estrutura()
    
    def criar_estrutura(self):
        """Cria a estrutura de pastas necessária"""
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)
        
        # Criar arquivos se não existirem
        if not os.path.exists(f'{self.data_dir}/usuarios.json'):
            self.criar_usuarios_padrao()
        
        if not os.path.exists(f'{self.data_dir}/config.json'):
            self.criar_config_padrao()
    
    def criar_usuarios_padrao(self):
        """Cria usuários padrão"""
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
            },
            "teste": {
                "senha": hashlib.sha256("teste123".encode()).hexdigest(),
                "nome": "Usuário Teste",
                "email": "teste@sistema.com",
                "nivel": "user",
                "data_criacao": str(datetime.now()),
                "ultimo_acesso": None,
                "telefone": "(11) 77777-7777",
                "departamento": "Marketing",
                "avatar": "teste.png",
                "configuracoes": {
                    "tema": "claro",
                    "notificacoes": False,
                    "idioma": "en-US"
                }
            }
        }
        
        with open(f'{self.data_dir}/usuarios.json', 'w', encoding='utf-8') as f:
            json.dump(usuarios, f, indent=4, ensure_ascii=False)
    
    def criar_config_padrao(self):
        """Cria configurações padrão do sistema"""
        config = {
            "sistema": {
                "nome": "SecureSystem",
                "versao": "1.0.0",
                "max_tentativas": 3,
                "tempo_bloqueio": 30,  # minutos
                "manutencao": False
            },
            "seguranca": {
                "criptografia": "SHA256",
                "sessao_timeout": 30,  # minutos
                "2fa": False,
                "log_atividades": True
            },
            "interface": {
                "tema_padrao": "escuro",
                "animacoes": True,
                "idiomas": ["pt-BR", "en-US", "es-ES"]
            },
            "notificacoes": {
                "email": True,
                "sms": False,
                "whatsapp": False
            }
        }
        
        with open(f'{self.data_dir}/config.json', 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=4, ensure_ascii=False)
    
    def cadastrar_usuario(self, dados):
        """Cadastra um novo usuário"""
        with open(f'{self.data_dir}/usuarios.json', 'r', encoding='utf-8') as f:
            usuarios = json.load(f)
        
        # Verificar se usuário já existe
        if dados['login'] in usuarios:
            return False, "Usuário já existe!"
        
        # Verificar se email já existe
        for user in usuarios.values():
            if user['email'] == dados['email']:
                return False, "Email já cadastrado!"
        
        # Criar novo usuário
        novo_usuario = {
            "senha": hashlib.sha256(dados['senha'].encode()).hexdigest(),
            "nome": dados['nome'],
            "email": dados['email'],
            "nivel": "user",
            "data_criacao": str(datetime.now()),
            "ultimo_acesso": None,
            "telefone": dados.get('telefone', ''),
            "departamento": dados.get('departamento', ''),
            "avatar": "default.png",
            "configuracoes": {
                "tema": "claro",
                "notificacoes": True,
                "idioma": "pt-BR"
            }
        }
        
        usuarios[dados['login']] = novo_usuario
        
        with open(f'{self.data_dir}/usuarios.json', 'w', encoding='utf-8') as f:
            json.dump(usuarios, f, indent=4, ensure_ascii=False)
        
        self.registrar_atividade('cadastro', dados['login'], f"Novo usuário cadastrado: {dados['login']}")
        
        return True, "Usuário cadastrado com sucesso!"
    
    def get_usuario(self, login):
        """Retorna dados do usuário"""
        with open(f'{self.data_dir}/usuarios.json', 'r', encoding='utf-8') as f:
            usuarios = json.load(f)
        
        return usuarios.get(login)
    
    def atualizar_usuario(self, login, dados):
        """Atualiza dados do usuário"""
        with open(f'{self.data_dir}/usuarios.json', 'r', encoding='utf-8') as f:
            usuarios = json.load(f)
        
        if login not in usuarios:
            return False, "Usuário não encontrado!"
        
        # Atualizar apenas campos permitidos
        for campo in ['nome', 'email', 'telefone', 'departamento']:
            if campo in dados:
                usuarios[login][campo] = dados[campo]
        
        # Atualizar configurações
        if 'configuracoes' in dados:
            usuarios[login]['configuracoes'].update(dados['configuracoes'])
        
        with open(f'{self.data_dir}/usuarios.json', 'w', encoding='utf-8') as f:
            json.dump(usuarios, f, indent=4, ensure_ascii=False)
        
        self.registrar_atividade('atualizacao', login, "Dados do usuário atualizados")
        
        return True, "Dados atualizados com sucesso!"
    
    def listar_usuarios(self):
        """Lista todos os usuários"""
        with open(f'{self.data_dir}/usuarios.json', 'r', encoding='utf-8') as f:
            usuarios = json.load(f)
        
        # Remover senhas da listagem
        for user in usuarios.values():
            del user['senha']
        
        return usuarios
    
    def registrar_atividade(self, tipo, usuario, descricao):
        """Registra atividade no log"""
        log_entry = {
            "timestamp": str(datetime.now()),
            "tipo": tipo,
            "usuario": usuario,
            "descricao": descricao,
            "id": str(uuid.uuid4())
        }
        
        arquivo_log = f'{self.logs_dir}/atividades_{datetime.now().strftime("%Y%m")}.log'
        
        try:
            with open(arquivo_log, 'r', encoding='utf-8') as f:
                logs = json.load(f)
        except:
            logs = []
        
        logs.append(log_entry)
        
        with open(arquivo_log, 'w', encoding='utf-8') as f:
            json.dump(logs, f, indent=4, ensure_ascii=False)
    
    def get_atividades(self, usuario=None, limite=50):
        """Retorna atividades recentes"""
        arquivo_log = f'{self.logs_dir}/atividades_{datetime.now().strftime("%Y%m")}.log'
        
        try:
            with open(arquivo_log, 'r', encoding='utf-8') as f:
                logs = json.load(f)
        except:
            return []
        
        if usuario:
            logs = [log for log in logs if log['usuario'] == usuario]
        
        return logs[-limite:]
    
    def get_estatisticas(self):
        """Retorna estatísticas do sistema"""
        with open(f'{self.data_dir}/usuarios.json', 'r', encoding='utf-8') as f:
            usuarios = json.load(f)
        
        total_usuarios = len(usuarios)
        usuarios_online = sum(1 for u in usuarios.values() if u.get('ultimo_acesso') and 
                            (datetime.now() - datetime.fromisoformat(u['ultimo_acesso'])).seconds < 300)
        
        return {
            "total_usuarios": total_usuarios,
            "usuarios_online": usuarios_online,
            "novos_hoje": 0,  # Implementar depois
            "acessos_hoje": 0  # Implementar depois
        }
    
    def get_configuracoes(self):
        """Retorna configurações do sistema"""
        with open(f'{self.data_dir}/config.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def atualizar_configuracoes(self, novas_config):
        """Atualiza configurações do sistema"""
        with open(f'{self.data_dir}/config.json', 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        # Atualizar configurações recursivamente
        self._atualizar_dict(config, novas_config)
        
        with open(f'{self.data_dir}/config.json', 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=4, ensure_ascii=False)
        
        return True, "Configurações atualizadas!"
    
    def _atualizar_dict(self, original, novo):
        """Atualiza dicionário recursivamente"""
        for key, value in novo.items():
            if key in original and isinstance(original[key], dict) and isinstance(value, dict):
                self._atualizar_dict(original[key], value)
            else:
                original[key] = value

db = Database()