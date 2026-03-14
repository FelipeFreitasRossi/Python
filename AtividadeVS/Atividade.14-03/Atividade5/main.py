from flask import Flask, render_template, request, jsonify, session, redirect
from flask_cors import CORS
import usuarios
import os
from datetime import timedelta

app = Flask(__name__, 
            static_folder='assets',
            template_folder='.',
            static_url_path='/assets')

app.secret_key = 'chave_secreta_sistema_2024'
app.permanent_session_lifetime = timedelta(minutes=30)

CORS(app, supports_credentials=True)

# Rotas para páginas
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index.html')
def index_html():
    return redirect('/')

@app.route('/cadastro')
@app.route('/cadastro.html')
def cadastro():
    """Rota para página de cadastro"""
    try:
        return render_template('cadastro.html')
    except Exception as e:
        print(f"Erro ao carregar cadastro.html: {e}")
        return "Arquivo cadastro.html não encontrado", 404

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect('/')
    return render_template('dashboard.html')

# API Routes
@app.route('/api/login', methods=['POST'])
def api_login():
    try:
        data = request.json
        usuario = data.get('usuario')
        senha = data.get('senha')
        
        print(f"Tentativa de login: {usuario}")
        
        # Usuários fixos para teste
        usuarios_fixos = {
            "admin": "admin123",
            "usuario": "senha123",
            "teste": "teste123"
        }
        
        if usuario in usuarios_fixos and usuarios_fixos[usuario] == senha:
            session['user'] = usuario
            print(f"Login bem-sucedido: {usuario}")
            return jsonify({
                'success': True,
                'message': 'Login realizado com sucesso!'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Usuário ou senha inválidos!'
            })
            
    except Exception as e:
        print(f"Erro no login: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Erro no servidor: {str(e)}'
        })

@app.route('/api/cadastro', methods=['POST'])
def api_cadastro():
    try:
        data = request.json
        print("Dados recebidos no cadastro:", data)
        
        return jsonify({
            'success': True,
            'message': 'Cadastro realizado com sucesso!'
        })
        
    except Exception as e:
        print(f"Erro no cadastro: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Erro no servidor: {str(e)}'
        })

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True})

# Rota para testar se o servidor está funcionando
@app.route('/teste')
def teste():
    return "Servidor funcionando!"

if __name__ == '__main__':
    # Verificar se os arquivos existem
    print("\n" + "=" * 50)
    print("🔍 VERIFICANDO ARQUIVOS:")
    print("=" * 50)
    
    arquivos = ['index.html', 'cadastro.html', 'dashboard.html']
    for arquivo in arquivos:
        if os.path.exists(arquivo):
            print(f"✅ {arquivo} encontrado")
        else:
            print(f"❌ {arquivo} NÃO encontrado!")
            print(f"   Caminho atual: {os.getcwd()}")
            print(f"   Você precisa criar o arquivo {arquivo}")
    
    print("\n" + "=" * 50)
    print("🚀 SecureSystem iniciado!")
    print("📍 Acesse: http://localhost:5000")
    print("📍 Cadastro: http://localhost:5000/cadastro")
    print("=" * 50)
    print("📝 Usuários para teste:")
    print("   admin / admin123")
    print("   usuario / senha123")
    print("   teste / teste123")
    print("=" * 50)
    
    app.run(debug=True, port=5000)