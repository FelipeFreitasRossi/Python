#Estou usando o import para data do dia de hoje
from datetime import date

hoje = date.today()

#Criando uma lista para armazenar os numeros e, assim, somar tudo de uma vez ao invés de puxar Variavél por Variavél 

lista = [
    int(input("Solicite um numero:")),
    int(input("Solicite um segundo numero:")),
    int(input("Solicite um terceiro numero:")),
    int(input("Solicite um quarto numero:")),
    int(input("Solicite um quinto numero:"))
]

#Eu estou acrescentando, através dos codigos abaixo, o número 1 e 2 
lista.append(1)
lista.append(2)

#Estou somando a lista através do codigo "SUM"
soma = (sum(lista))

print("\n")
print("-----------------------------")
print("♣-----Relatorio de Soma-----♣")
print("♢")
print("♦ A soma dos numeros é:",soma)
print("♦ Data de hoje:", hoje)
print("♢")
print("-----------------------------")
print("\n")
