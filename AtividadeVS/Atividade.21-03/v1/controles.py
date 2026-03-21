import pygame

class TelaControles:
    def __init__(self, largura, altura):
        self.largura = largura
        self.altura = altura
        
        # Fontes
        self.fonte_titulo = pygame.font.Font(None, int(altura * 0.08))
        self.fonte_texto = pygame.font.Font(None, int(altura * 0.04))
        self.fonte_info = pygame.font.Font(None, int(altura * 0.03))
        
        # Cores
        self.cor_vermelho = (200, 0, 0)
        self.cor_branco = (255, 255, 255)
        self.cor_dourado = (255, 215, 0)
        
    def desenhar(self, tela):
        """Desenha a tela de controles"""
        # Fundo escuro
        tela.fill((10, 10, 20))
        
        # Título
        titulo = self.fonte_titulo.render("CONTROLES", True, self.cor_vermelho)
        rect_titulo = titulo.get_rect(center=(self.largura // 2, 80))
        tela.blit(titulo, rect_titulo)
        
        # Lista de controles
        controles = [
            ("MOVIMENTAÇÃO", ""),
            ("← → ↑ ↓", "Movimentar personagem"),
            ("W A S D", "Movimentar alternativa"),
            ("", ""),
            ("AÇÕES", ""),
            ("🖱️ CLICK", "Atacar com espada"),
            ("SHIFT", "Andar devagar / Modo foco"),
            ("", ""),
            ("SISTEMA", ""),
            ("ESC", "Sair do jogo"),
            ("R", "Reiniciar (Game Over)"),
            ("", ""),
            ("DICAS", ""),
            ("⚔️", "Mate zumbis para ganhar pontos"),
            ("🔄", "200 pontos para avançar de fase"),
            ("🚪", "Portal roxo = Próxima fase")
        ]
        
        y = 180
        for tecla, desc in controles:
            if tecla and not desc:
                # Título de seção
                texto_secao = self.fonte_texto.render(tecla, True, self.cor_dourado)
                tela.blit(texto_secao, (self.largura // 2 - 150, y))
                y += 45
            elif tecla:
                # Tecla
                texto_tecla = self.fonte_texto.render(tecla, True, self.cor_vermelho)
                tela.blit(texto_tecla, (self.largura // 2 - 200, y))
                
                # Descrição
                texto_desc = self.fonte_info.render(desc, True, self.cor_branco)
                tela.blit(texto_desc, (self.largura // 2 - 50, y + 5))
                y += 40
        
        # Instrução para voltar
        texto_voltar = self.fonte_info.render("Pressione ESC para voltar", True, (100, 100, 100))
        rect_voltar = texto_voltar.get_rect(center=(self.largura // 2, self.altura - 50))
        tela.blit(texto_voltar, rect_voltar)
    
    def executar(self, tela):
        """Executa a tela de controles"""
        clock = pygame.time.Clock()
        rodando = True
        
        while rodando:
            for evento in pygame.event.get():
                if evento.type == pygame.QUIT:
                    return "SAIR"
                elif evento.type == pygame.KEYDOWN:
                    if evento.key == pygame.K_ESCAPE:
                        return "VOLTAR"
            
            self.desenhar(tela)
            pygame.display.flip()
            clock.tick(60)
        
        return "VOLTAR"