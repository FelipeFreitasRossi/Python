import pygame
import random

class Item:
    def __init__(self, x, y, tamanho, cor, pontos=10):
        self.x = x
        self.y = y
        self.tamanho = tamanho
        self.cor = cor
        self.pontos = pontos
        self.rect = pygame.Rect(x, y, tamanho, tamanho)
        self.coletado = False
    
    def desenhar(self, tela):
        """Desenha o item na tela"""
        if not self.coletado:
            # Desenha um círculo para o item
            centro = (self.x + self.tamanho // 2, self.y + self.tamanho // 2)
            raio = self.tamanho // 2
            pygame.draw.circle(tela, self.cor, centro, raio)
            # Adiciona um brilho no centro
            pygame.draw.circle(tela, (255, 255, 255), centro, raio // 2)
    
    def verificar_colisao(self, player_rect):
        """Verifica se o item colidiu com o player"""
        if not self.coletado and self.rect.colliderect(player_rect):
            self.coletado = True
            return True
        return False
    
    def reposicionar(self, largura_tela, altura_tela, margem=50):
        """Reposiciona o item em um local aleatório da tela"""
        self.x = random.randint(margem, largura_tela - self.tamanho - margem)
        self.y = random.randint(margem, altura_tela - self.tamanho - margem)
        self.rect.x = self.x
        self.rect.y = self.y
        self.coletado = False
    
    def reset(self):
        """Reseta o item (torna coletável novamente)"""
        self.coletado = False
    
    def get_posicao(self):
        """Retorna a posição atual do item"""
        return (self.x, self.y)

class SistemaItens:
    def __init__(self, largura_tela, altura_tela):
        self.itens = []
        self.largura_tela = largura_tela
        self.altura_tela = altura_tela
    
    def adicionar_item(self, item):
        """Adiciona um item ao sistema"""
        self.itens.append(item)
    
    def criar_item_aleatorio(self, tamanho, cor, pontos=10):
        """Cria um item em posição aleatória"""
        margem = 50
        x = random.randint(margem, self.largura_tela - tamanho - margem)
        y = random.randint(margem, self.altura_tela - tamanho - margem)
        return Item(x, y, tamanho, cor, pontos)
    
    def atualizar(self, player_rect):
        """Atualiza todos os itens e verifica colisões"""
        pontos_ganhos = 0
        for item in self.itens:
            if item.verificar_colisao(player_rect):
                pontos_ganhos += item.pontos
                # Reposiciona o item ao ser coletado
                item.reposicionar(self.largura_tela, self.altura_tela)
        return pontos_ganhos
    
    def desenhar(self, tela):
        """Desenha todos os itens na tela"""
        for item in self.itens:
            item.desenhar(tela)
    
    def resetar(self):
        """Reseta todos os itens"""
        for item in self.itens:
            item.reset()