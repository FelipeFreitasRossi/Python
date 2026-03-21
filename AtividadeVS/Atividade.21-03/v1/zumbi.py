import pygame
import random
import math

class Zumbi:
    def __init__(self, x, y, tamanho, velocidade, cor, 
                 imagem_esquerda=None, imagem_direita=None):
        self.x = x
        self.y = y
        self.tamanho = tamanho
        self.velocidade = velocidade
        self.cor = cor
        self.rect = pygame.Rect(x, y, tamanho, tamanho)
        self.vida = 3
        self.direcao = "direita"
        self.chao_y = y
        
        self.imagem_esquerda = self._carregar_imagem(imagem_esquerda)
        self.imagem_direita = self._carregar_imagem(imagem_direita)
        self.imagem_atual = self.imagem_direita
    
    def _carregar_imagem(self, caminho):
        if caminho:
            try:
                imagem = pygame.image.load(caminho)
                imagem = pygame.transform.scale(imagem, (self.tamanho, self.tamanho))
                return imagem
            except:
                return None
        return None
    
    def mover_em_direcao(self, alvo_x):
        """Move o zumbi apenas horizontalmente em direção ao alvo"""
        self.y = self.chao_y
        
        dx = alvo_x - (self.x + self.tamanho // 2)
        
        if abs(dx) > 5:
            if dx > 0:
                self.x += self.velocidade
                self.direcao = "direita"
                if self.imagem_direita:
                    self.imagem_atual = self.imagem_direita
            else:
                self.x -= self.velocidade
                self.direcao = "esquerda"
                if self.imagem_esquerda:
                    self.imagem_atual = self.imagem_esquerda
        
        self.rect.x = self.x
        self.rect.y = self.y
    
    def receber_dano(self, dano=1):
        self.vida -= dano
        if self.vida <= 0:
            return True
        return False
    
    def desenhar(self, tela):
        if self.imagem_atual:
            tela.blit(self.imagem_atual, (self.x, self.y))
    
    def set_chao(self, chao_y):
        self.chao_y = chao_y
        self.y = chao_y
        self.rect.y = chao_y

class SistemaZumbis:
    def __init__(self, largura_tela, altura_tela, chao_y, fase=1):
        self.zumbis = []
        self.largura_tela = largura_tela
        self.altura_tela = altura_tela
        self.chao_y = chao_y
        self.fase = fase
        self.tempo_ultimo_spawn = 0
        self.intervalo_spawn = self._definir_intervalo_spawn()
        self.max_zumbis = self._definir_max_zumbis()
        self.spawn_ativo = True
        
        self.imagem_zumbi_esquerda = "v1/assets/zumbie2.png"
        self.imagem_zumbi_direita = "v1/assets/zumbie.png"
    
    def _definir_intervalo_spawn(self):
        if self.fase == 1:
            return 120
        elif self.fase == 2:
            return 90
        else:
            return 60
    
    def _definir_max_zumbis(self):
        if self.fase == 1:
            return 4
        elif self.fase == 2:
            return 6
        else:
            return 10
    
    def adicionar_zumbi(self, zumbi):
        if len(self.zumbis) < self.max_zumbis:
            zumbi.set_chao(self.chao_y)
            self.zumbis.append(zumbi)
            return True
        return False
    
    def criar_zumbi_aleatorio(self, tamanho, velocidade, cor):
        lado = random.choice(['esquerda', 'direita'])
        
        if lado == 'esquerda':
            x = -tamanho
        else:
            x = self.largura_tela + tamanho
        
        y = self.chao_y
        
        return Zumbi(x, y, tamanho, velocidade, cor, 
                     self.imagem_zumbi_esquerda, self.imagem_zumbi_direita)
    
    def atualizar(self, player_x, ataque_rect=None):
        zumbis_derrotados = []
        
        if ataque_rect:
            for i, zumbi in enumerate(self.zumbis):
                if zumbi.rect.colliderect(ataque_rect):
                    morreu = zumbi.receber_dano()
                    if morreu:
                        zumbis_derrotados.append(i)
        
        for i in reversed(zumbis_derrotados):
            self.zumbis.pop(i)
        
        for zumbi in self.zumbis:
            zumbi.mover_em_direcao(player_x)
        
        player_rect = pygame.Rect(player_x - 25, self.chao_y, 50, 50)
        for zumbi in self.zumbis:
            if zumbi.rect.colliderect(player_rect):
                return True, len(zumbis_derrotados)
        
        return False, len(zumbis_derrotados)
    
    def desenhar(self, tela):
        for zumbi in self.zumbis:
            zumbi.desenhar(tela)
    
    def tentar_spawnar_zumbi(self, frame_atual):
        if not self.spawn_ativo:
            return False
            
        if frame_atual - self.tempo_ultimo_spawn >= self.intervalo_spawn:
            if len(self.zumbis) < self.max_zumbis:
                self.tempo_ultimo_spawn = frame_atual
                return True
        return False
    
    def get_quantidade(self):
        return len(self.zumbis)
    
    def parar_spawn(self):
        self.spawn_ativo = False
    
    def reiniciar_spawn(self):
        self.spawn_ativo = True
        self.tempo_ultimo_spawn = 0
    
    def limpar_zumbis(self):
        self.zumbis.clear()