print("-----------------------")
print("Bem-vindo ao Voto.gov, aqui será onde você fará seu voto eleitoral")
print("Precisamos de seus dados para fazer seu cadastro")
print()

nome = input("Digite seu nome: ")
print("ok,",nome, sep=" ")

idade = int(input(nome,"digite sua idade: "))

if idade < 16:
    print("Não pode votar")
elif idade == 16 or idade == 17:
    print("Voto facultativo")
elif idade >= 18 and idade < 70:
    print("Você é obrigado a votar")
else:
    print("Voto facultativo, você vota apenas se quiser")

print("----------------------------------")

