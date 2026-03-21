import pygame

class Player:
    def __init__(self, x, y, tamanho, velocidade_normal, velocidade_devagar, cor, 
                 imagem_frente=None, imagem_costas=None, imagem_esquerda=None, imagem_direita=None,
                 imagem_espada_direita=None, imagem_espada_esquerda=None):
        self.x = x
        self.y = y
        self.tamanho = tamanho
        self.velocidade_normal = velocidade_normal
        self.velocidade_devagar = velocidade_devagar
        self.velocidade = velocidade_normal
        self.cor = cor
        self.rect = pygame.Rect(x, y, tamanho, tamanho)
        self.pontuacao = 0
        self.vida = 100
        self.direcao = "direita"
        self.invulneravel = False
        self.tempo_invulneravel = 0
        self.duracao_invulneravel = 60
        
        # Sistema de ataque
        self.atacando = False
        self.tempo_ataque = 0
        self.duracao_ataque = 8
        self.area_ataque = None
        self.angulo_espada = 0
        
        # Carrega as imagens do personagem
        self.imagem_frente = self._carregar_imagem(imagem_frente)
        self.imagem_costas = self._carregar_imagem(imagem_costas)
        self.imagem_esquerda = self._carregar_imagem(imagem_esquerda)
        self.imagem_direita = self._carregar_imagem(imagem_direita)
        
        # Carrega as imagens da espada
        self.imagem_espada_direita = self._carregar_imagem(imagem_espada_direita)
        self.imagem_espada_esquerda = self._carregar_imagem(imagem_espada_esquerda)
        self.imagem_espada_atual = None
        
        self.imagem_atual = self.imagem_direita
    
    def _carregar_imagem(self, caminho):
        if caminho:
            try:
                imagem = pygame.image.load(caminho)
                imagem = pygame.transform.scale(imagem, (self.tamanho, self.tamanho))
                return imagem
            except Exception as e:
                print(f"Erro ao carregar imagem {caminho}: {e}")
                return None
        return None
    
    def _atualizar_direcao(self, dx):
        """Atualiza a direção do personagem baseado no movimento horizontal"""
        if dx > 0:
            self.direcao = "direita"
            if self.imagem_direita:
                self.imagem_atual = self.imagem_direita
        elif dx < 0:
            self.direcao = "esquerda"
            if self.imagem_esquerda:
                self.imagem_atual = self.imagem_esquerda
    
    def atacar(self):
        """Inicia o ataque com espada"""
        if not self.atacando:
            self.atacando = True
            self.tempo_ataque = self.duracao_ataque
            self.angulo_espada = -45
            
            if self.direcao == "direita":
                self.imagem_espada_atual = self.imagem_espada_direita
                self.area_ataque = pygame.Rect(
                    self.x + self.tamanho - 10,
                    self.y + self.tamanho // 4,
                    self.tamanho,
                    self.tamanho // 2
                )
            elif self.direcao == "esquerda":
                self.imagem_espada_atual = self.imagem_espada_esquerda
                self.area_ataque = pygame.Rect(
                    self.x - self.tamanho + 10,
                    self.y + self.tamanho // 4,
                    self.tamanho,
                    self.tamanho // 2
                )
    
    def receber_dano(self, dano=10):
        if not self.invulneravel:
            self.vida -= dano
            self.invulneravel = True
            self.tempo_invulneravel = self.duracao_invulneravel
            return True
        return False
    
    def atualizar_invulnerabilidade(self):
        if self.invulneravel:
            self.tempo_invulneravel -= 1
            if self.tempo_invulneravel <= 0:
                self.invulneravel = False
    
    def atualizar_ataque(self):
        if self.atacando:
            self.tempo_ataque -= 1
            self.angulo_espada += 15
            if self.tempo_ataque <= 0:
                self.atacando = False
                self.area_ataque = None
                self.imagem_espada_atual = None
    
    def mover(self, teclas, largura_tela, altura_tela):
        """Move o jogador apenas horizontalmente"""
        if self.atacando:
            return
        
        if teclas[pygame.K_LSHIFT] or teclas[pygame.K_RSHIFT]:
            self.velocidade = self.velocidade_devagar
        else:
            self.velocidade = self.velocidade_normal
        
        dx = 0
        
        # Movimento horizontal apenas
        if (teclas[pygame.K_LEFT] or teclas[pygame.K_a]) and self.x > 0:
            dx = -self.velocidade
            self.x += dx
        if (teclas[pygame.K_RIGHT] or teclas[pygame.K_d]) and self.x < largura_tela - self.tamanho:
            dx = self.velocidade
            self.x += dx
        
        if dx != 0:
            self._atualizar_direcao(dx)
        
        self.rect.x = self.x
        self.rect.y = self.y
    
    def desenhar_espada(self, tela):
        if self.atacando and self.imagem_espada_atual:
            espada_rotacionada = pygame.transform.rotate(self.imagem_espada_atual, self.angulo_espada)
            espada_rect = espada_rotacionada.get_rect()
            
            if self.direcao == "direita":
                espada_rect.center = (self.x + self.tamanho - 10, self.y + self.tamanho // 2)
            else:
                espada_rect.center = (self.x + 10, self.y + self.tamanho // 2)
            
            tela.blit(espada_rotacionada, espada_rect)
    
    def desenhar(self, tela):
        if self.invulneravel and (pygame.time.get_ticks() // 100) % 2 == 0:
            return
        
        if self.imagem_atual:
            tela.blit(self.imagem_atual, (self.x, self.y))
        else:
            pygame.draw.rect(tela, self.cor, (self.x, self.y, self.tamanho, self.tamanho))
        
        self.desenhar_espada(tela)
    
    def get_posicao(self):
        return (self.x, self.y)
    
    def set_posicao(self, x, y):
        self.x = x
        self.y = y
        self.rect.x = x
        self.rect.y = y
    
    def adicionar_pontos(self, pontos):
        self.pontuacao += pontos
    
    def get_pontuacao(self):
        return self.pontuacao
    
    def get_vida(self):
        return self.vida