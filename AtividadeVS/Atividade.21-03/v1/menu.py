import pygame
import sys
import random

class Menu:
    def __init__(self, largura, altura):
        self.largura = largura
        self.altura = altura
        self.opcao_selecionada = 0
        self.opcoes = ["INICIAR JOGO", "CONTROLES", "SAIR"]
        
        # Cores e efeitos
        self.cor_vermelho = (200, 0, 0)
        self.cor_vermelho_escuro = (100, 0, 0)
        self.cor_dourado = (255, 215, 0)
        self.cor_branco = (255, 255, 255)
        self.cor_cinza = (100, 100, 100)
        
        # Fontes com tamanhos proporcionais
        self.fonte_titulo = pygame.font.Font(None, int(altura * 0.12))
        self.fonte_opcao = pygame.font.Font(None, int(altura * 0.06))
        self.fonte_info = pygame.font.Font(None, int(altura * 0.03))
        
        # Partículas para efeito de sangue
        self.particulas = []
        self.estrelas = []
        self.criar_estrelas()
        
        # Animações
        self.tempo_animacao = 0
        self.alpha = 0
        self.onda = 0
        
    def criar_estrelas(self):
        """Cria estrelas para o fundo"""
        for _ in range(100):
            self.estrelas.append({
                'x': random.randint(0, self.largura),
                'y': random.randint(0, self.altura),
                'tamanho': random.randint(1, 3),
                'brilho': random.randint(50, 255)
            })
    
    def criar_particula_sangue(self, x, y):
        """Cria uma partícula de sangue"""
        self.particulas.append({
            'x': x,
            'y': y,
            'vx': random.uniform(-2, 2),
            'vy': random.uniform(-2, 2),
            'vida': 100,
            'tamanho': random.randint(2, 6)
        })
    
    def atualizar_particulas(self):
        """Atualiza as partículas de sangue"""
        for particula in self.particulas[:]:
            particula['x'] += particula['vx']
            particula['y'] += particula['vy']
            particula['vida'] -= 2
            if particula['vida'] <= 0:
                self.particulas.remove(particula)
    
    def desenhar_fundo_gradiente(self, tela):
        """Desenha um fundo com gradiente profissional"""
        for i in range(self.altura):
            # Gradiente do céu (vermelho escuro para preto)
            intensidade = i / self.altura
            cor = (
                int(30 + (50 * intensidade)),
                int(20 + (30 * intensidade)),
                int(40 + (60 * intensidade))
            )
            pygame.draw.line(tela, cor, (0, i), (self.largura, i))
    
    def desenhar_estrelas(self, tela):
        """Desenha estrelas piscando"""
        for estrela in self.estrelas:
            brilho = estrela['brilho'] + random.randint(-20, 20)
            brilho = max(50, min(255, brilho))
            cor = (brilho, brilho, brilho)
            pygame.draw.circle(tela, cor, (estrela['x'], estrela['y']), estrela['tamanho'])
    
    def desenhar_particulas(self, tela):
        """Desenha as partículas de sangue"""
        for particula in self.particulas:
            alpha = particula['vida'] / 100
            cor = (200, 0, 0, int(alpha * 255))
            pygame.draw.circle(tela, cor[:3], 
                              (int(particula['x']), int(particula['y'])), 
                              particula['tamanho'])
    
    def desenhar_titulo(self, tela):
        """Desenha o título com efeito 3D e pulsante"""
        # Efeito de pulsação
        pulse = abs(pygame.time.get_ticks() // 200 % 20 - 10) / 10
        tamanho_pulse = int(self.altura * 0.12 + pulse * 2)
        fonte_pulse = pygame.font.Font(None, tamanho_pulse)
        
        # Texto principal
        texto = "SURVIVAL Z"
        
        # Sombra preta (3D)
        for offset in range(3):
            sombra = fonte_pulse.render(texto, True, (0, 0, 0))
            rect_sombra = sombra.get_rect(center=(self.largura // 2 + offset, 
                                                   self.altura // 4 + offset))
            tela.blit(sombra, rect_sombra)
        
        # Texto principal com gradiente
        texto_superior = fonte_pulse.render(texto, True, self.cor_vermelho)
        rect = texto_superior.get_rect(center=(self.largura // 2, self.altura // 4))
        tela.blit(texto_superior, rect)
        
        # Brilho
        brilho = fonte_pulse.render(texto, True, (255, 100, 100))
        rect_brilho = brilho.get_rect(center=(self.largura // 2 - 2, self.altura // 4 - 2))
        tela.blit(brilho, rect_brilho)
        
        # Subtítulo
        subtitulo = self.fonte_info.render("A MORTE CAMINHA ENTRE NÓS", True, self.cor_dourado)
        rect_sub = subtitulo.get_rect(center=(self.largura // 2, self.altura // 3))
        tela.blit(subtitulo, rect_sub)
    
    def desenhar_cards(self, tela):
        """Desenha cards de informações"""
        y_base = self.altura // 2 + 50
        cards = [
            ("🧟", "INFECTADOS", "Horda Infinita"),
            ("⚔️", "ARMAMENTO", "Espada Ancestral"),
            ("🏆", "FASES", "Sobrevivência")
        ]
        
        largura_card = self.largura // 4
        espacamento = self.largura // 6
        
        for i, (icone, titulo, desc) in enumerate(cards):
            x = self.largura // 2 - espacamento + i * espacamento
            y = y_base
            
            # Fundo do card com borda
            card_rect = pygame.Rect(x - largura_card // 2, y, largura_card, 100)
            pygame.draw.rect(tela, (20, 20, 40), card_rect, border_radius=10)
            pygame.draw.rect(tela, self.cor_vermelho, card_rect, 2, border_radius=10)
            
            # Ícone
            texto_icone = self.fonte_opcao.render(icone, True, self.cor_vermelho)
            rect_icone = texto_icone.get_rect(center=(x, y + 20))
            tela.blit(texto_icone, rect_icone)
            
            # Título
            texto_titulo = self.fonte_info.render(titulo, True, self.cor_branco)
            rect_titulo = texto_titulo.get_rect(center=(x, y + 50))
            tela.blit(texto_titulo, rect_titulo)
            
            # Descrição
            texto_desc = self.fonte_info.render(desc, True, self.cor_cinza)
            rect_desc = texto_desc.get_rect(center=(x, y + 75))
            tela.blit(texto_desc, rect_desc)
    
    def desenhar_opcoes(self, tela):
        """Desenha as opções do menu com efeitos"""
        y_base = self.altura - 150
        
        for i, opcao in enumerate(self.opcoes):
            y = y_base + i * 60
            cor = self.cor_dourado if i == self.opcao_selecionada else self.cor_branco
            
            # Seta indicadora
            if i == self.opcao_selecionada:
                # Efeito de pulsação na opção selecionada
                pulse = abs(pygame.time.get_ticks() // 150 % 20 - 10) / 10
                tamanho = int(self.altura * 0.06 + pulse * 2)
                fonte_opcao = pygame.font.Font(None, tamanho)
                
                # Seta
                seta = fonte_opcao.render("▶", True, cor)
                tela.blit(seta, (self.largura // 2 - 100, y))
                
                # Texto maior
                texto = fonte_opcao.render(opcao, True, cor)
            else:
                texto = self.fonte_opcao.render(opcao, True, cor)
            
            rect = texto.get_rect(center=(self.largura // 2, y + 15))
            tela.blit(texto, rect)
    
    def desenhar_rodape(self, tela):
        """Desenha o rodapé com informações"""
        y = self.altura - 50
        
        # Linha decorativa
        pygame.draw.line(tela, self.cor_vermelho, (50, y), (self.largura - 50, y), 2)
        
        # Texto
        texto = self.fonte_info.render("Use ↑ ↓ e ENTER para navegar | ESC para sair", True, self.cor_cinza)
        rect = texto.get_rect(center=(self.largura // 2, y + 15))
        tela.blit(texto, rect)
    
    def desenhar_zumbi_animado(self, tela):
        """Desenha um zumbi animado no canto"""
        pulse = abs(pygame.time.get_ticks() // 500 % 20 - 10) / 10
        tamanho = int(80 + pulse * 5)
        
        x = self.largura - 120
        y = self.altura - 180
        
        # Corpo do zumbi
        pygame.draw.circle(tela, (50, 100, 50), (x, y), tamanho // 2)
        
        # Olhos vermelhos
        olho_tamanho = tamanho // 8
        pygame.draw.circle(tela, (255, 0, 0), (x - 20, y - 20), olho_tamanho)
        pygame.draw.circle(tela, (255, 0, 0), (x + 20, y - 20), olho_tamanho)
        
        # Pupilas (seguem o mouse)
        mouse_x, mouse_y = pygame.mouse.get_pos()
        dx = (mouse_x - x) / 100
        dy = (mouse_y - y) / 100
        dx = max(-5, min(5, dx))
        dy = max(-5, min(5, dy))
        
        pygame.draw.circle(tela, (0, 0, 0), 
                          (x - 20 + dx, y - 20 + dy), olho_tamanho // 2)
        pygame.draw.circle(tela, (0, 0, 0), 
                          (x + 20 + dx, y - 20 + dy), olho_tamanho // 2)
        
        # Boca
        pygame.draw.arc(tela, (0, 0, 0), 
                       (x - 30, y - 10, 60, 40), 0, 3.14, 3)
        
        # Texto
        texto_zumbi = self.fonte_info.render("ZUMBI!", True, (200, 0, 0))
        tela.blit(texto_zumbi, (x - 40, y + 50))
    
    def desenhar(self, tela):
        """Desenha todo o menu"""
        self.tempo_animacao += 1
        
        # Fundo
        self.desenhar_fundo_gradiente(tela)
        
        # Estrelas
        self.desenhar_estrelas(tela)
        
        # Partículas de sangue
        self.desenhar_particulas(tela)
        
        # Título
        self.desenhar_titulo(tela)
        
        # Cards
        self.desenhar_cards(tela)
        
        # Zumbi animado
        self.desenhar_zumbi_animado(tela)
        
        # Opções
        self.desenhar_opcoes(tela)
        
        # Rodapé
        self.desenhar_rodape(tela)
        
        # Atualiza partículas
        self.atualizar_particulas()
        
        # Cria partículas aleatórias
        if random.randint(1, 50) == 1:
            x = random.randint(100, self.largura - 100)
            y = random.randint(100, self.altura - 100)
            self.criar_particula_sangue(x, y)
    
    def executar(self, tela):
        """Executa o loop do menu"""
        clock = pygame.time.Clock()
        rodando = True
        
        while rodando:
            for evento in pygame.event.get():
                if evento.type == pygame.QUIT:
                    return "SAIR"
                elif evento.type == pygame.KEYDOWN:
                    if evento.key == pygame.K_UP or evento.key == pygame.K_w:
                        self.opcao_selecionada = (self.opcao_selecionada - 1) % len(self.opcoes)
                        # Cria partículas ao mover
                        for _ in range(5):
                            self.criar_particula_sangue(self.largura // 2, self.altura - 100)
                    elif evento.key == pygame.K_DOWN or evento.key == pygame.K_s:
                        self.opcao_selecionada = (self.opcao_selecionada + 1) % len(self.opcoes)
                        for _ in range(5):
                            self.criar_particula_sangue(self.largura // 2, self.altura - 100)
                    elif evento.key == pygame.K_RETURN or evento.key == pygame.K_SPACE:
                        if self.opcao_selecionada == 0:
                            return "INICIAR"
                        elif self.opcao_selecionada == 1:
                            return "CONTROLES"
                        elif self.opcao_selecionada == 2:
                            return "SAIR"
                    elif evento.key == pygame.K_ESCAPE:
                        return "SAIR"
            
            # Desenha o menu
            self.desenhar(tela)
            pygame.display.flip()
            clock.tick(60)
        
        return "SAIR"