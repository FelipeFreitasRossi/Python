#Criar lista vazia
lista = []

aluno = input("Digite o nome do aluno: ")

#Criar lista com elementos, lista = [1,2,3...]
for i in range(2):
    nota = float(input("Digite as notas das provas do aluno: "))
    lista.append(nota)

#soma os itens 
soma = sum(lista)
tamanho = len(lista)

media = soma / tamanho

# print("Sua media é:" ,media)
print()
print("------- Relatório de media do" ,aluno, "-------")
print(f"As notas do",aluno,":",lista, "\nE a media é:",media)

if media >= 6:
    print(aluno,"está: aprovado", sep=" ")

else:
    print(aluno,"está: Recuperação", sep=" ")

print("--------------------------------------------")
print()
