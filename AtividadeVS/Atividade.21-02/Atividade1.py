from datetime import date

hoje = date.today()

n1 = int(input("Solicite um numero:"))
n2 = int(input("Solicite um segundo numero:"))
n3 = int(input("Solicite um terceiro numero:"))
n4 = int(input("Solicite um quarto numero:"))
n5 = int(input("Solicite um quinto numero:"))

soma = (n1 + n2 + n3 + n4 + n5)

print("-----------------------------")
print("♣-----Relatorio de Soma-----♣")
print("♢")
print("♦ A soma dos numeros é:",soma)
print("♦ Data de hoje:", hoje)
print("♢")
print("-----------------------------")
