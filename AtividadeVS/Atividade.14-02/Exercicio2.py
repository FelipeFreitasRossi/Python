nome = input("Digite seu nome: ")
hora = int(input("Quantidade de horas trabalhadas: "))
valorH = float(input("Valor p/ hora trabalhada: "))

valorT = (hora * valorH)
print("Meu nome é:",nome,",o valor da minha hora: R$",valorT)

valorMes = (valorT * 22)
print("Meu salario mensal é: R$",valorMes)