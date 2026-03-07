numero = int(input("Digite um número para ver a tabuada: "))

print("==============")
print(f"Tabuada do {numero}:")

for i in range(1, 11):
    resultado = numero * i
    print(f"♦ {numero} x {i} = {resultado}")
print("==============")
