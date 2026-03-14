import os

print("=" * 50)
print("DIAGNÓSTICO DO SISTEMA")
print("=" * 50)

# Pasta atual
pasta_atual = os.getcwd()
print(f"\n📁 Pasta atual: {pasta_atual}")

# Listar arquivos
print("\n📄 Arquivos encontrados:")
arquivos = os.listdir('.')
for arquivo in arquivos:
    if arquivo.endswith('.html'):
        tamanho = os.path.getsize(arquivo)
        print(f"   ✅ {arquivo} ({tamanho} bytes)")
    elif arquivo == 'main.py':
        print(f"   ✅ {arquivo} (principal)")

# Verificar arquivo cadastro.html especificamente
print("\n🔍 Verificando cadastro.html:")
if os.path.exists('cadastro.html'):
    print("   ✅ cadastro.html existe!")
    print(f"   📍 Caminho completo: {os.path.abspath('cadastro.html')}")
else:
    print("   ❌ cadastro.html NÃO encontrado!")
    print("   💡 Você precisa criar o arquivo cadastro.html")

print("\n" + "=" * 50)