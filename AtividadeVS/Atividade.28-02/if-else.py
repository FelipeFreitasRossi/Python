print("----------------------------------")
print( )
print("🥳🎉Aqui é o site de cadastro da melhor festa da cidade🥳🎉")
print( )
nome = input("Digite seu nome: ")
print("Olá",nome,", aqui é o Python programado para terminar seu cadastro da festa. Quero saber sua idade e seu email!", sep=" ")

print("----------------------------------")

idade = int(input("Digite sua idade: "))

if idade > 18:
    print("Você é maior de idade")
elif idade == 18:
    print("Você tem exatamente 18, está autorizado")
else:
    print("Você não tem 18.")
    exit(print("Que pena, você não tem autorização para entrar nessa festa"))

print("----------------------------------")


email = input("Digite seu e-mail: ")

if "@" not in email or "." not in email:
    print("E-mail inválido! Tente novamente.")
elif email.endswith("@gmail.com"):
    print("Acesso permitido: Você foi cadastrado com sucesso.\n")
else:
    print("Acesso restrito: E-mail errado")

print()
print(nome,".Parabéns, você foi cadastrado com sucesso, te desejo uma boa festa. Qualquer duvida pode entrar em contato com o nosso programador"\
"\nEmail:felipedev@gmail.com "\
"\nWhastApp:(16) 99616-7381")
print()
print("----------------------------------")

