# Python
 
📘 Aula de Python – Conceitos Básicos
📌 Sobre a Aula

Nesta aula estamos aprendendo os conceitos fundamentais da linguagem Python, utilizando a ferramenta Python para dar os primeiros passos na programação.

Os principais tópicos abordados são:

Variáveis

Tipos de dados (int e float)

Entrada de dados com input()

Saída de dados com print()

🔹 Variáveis

Variáveis são usadas para armazenar valores na memória do computador.

nome = "Gabrielly"
idade = 15

🔢 Tipo int

O tipo int é usado para armazenar números inteiros (sem casas decimais).

Exemplo:

idade = 20
ano = 2025

🔢 Tipo float

O tipo float é usado para armazenar números com casas decimais.

Exemplo:

altura = 1.75
preco = 19.99

⌨️ Função input()

A função input() permite que o usuário digite informações.

Exemplo:

nome = input("Digite seu nome: ")


⚠️ Observação: O input() sempre retorna texto (string).
Se quiser número, é necessário converter:

idade = int(input("Digite sua idade: "))
altura = float(input("Digite sua altura: "))

🖥️ Função print()

A função print() exibe informações na tela.

Exemplo:

print("Olá, mundo!")
print("Seu nome é:", nome)

🧪 Exemplo Completo
nome = input("Digite seu nome: ")
idade = int(input("Digite sua idade: "))
altura = float(input("Digite sua altura: "))

print("Olá,", nome)
print("Você tem", idade, "anos")
print("Sua altura é", altura, "metros")
