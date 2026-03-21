import pygame
import sys
from player import Player
from zumbi import SistemaZumbis

# Inicializa o pygame
pygame.init()

# Constantes
INFO_TELA = pygame.display.Info()
LARGURA = INFO_TELA.current_w
ALTURA = INFO_TELA.current_h

# Tamanhos proporcionais
TAMANHO_PLAYER = int(ALTURA * 0.1)
TAMANHO_ZUMBI = int(ALTURA * 0.12)
VELOCIDADE_NORMAL = 7
VELOCIDADE_DEVAGAR = 3
VELOCIDADE_ZUMBI = 2.2

# Configura a janela
tela = pygame.display.set_mode((LARGURA, ALTURA), pygame.FULLSCREEN)
pygame.display.set_caption("Sobrevivência Zumbi")
relogio = pygame.time.Clock()

# Fontes
fonte_grande = pygame.font.Font(None, int(ALTURA * 0.08))
fonte = pygame.font.Font(None, int(ALTURA * 0.06))
fonte_pequena = pygame.font.Font(None, int(ALTURA * 0.04))

# Posição do chão (Y fixo)
CHAO_Y = ALTURA - TAMANHO_PLAYER - int(ALTURA * 0.05)

# Backgrounds
BACKGROUND_FASE1 = "v1/assets/background.webp"
BACKGROUND_FASE2 = "v1/assets/background2.webp"

try:
    bg_fase1 = pygame.image.load(BACKGROUND_FASE1)
    bg_fase1 = pygame.transform.scale(bg_fase1, (LARGURA, ALTURA))
except:
    bg_fase1 = None

try:
    bg_fase2 = pygame.image.load(BACKGROUND_FASE2)
    bg_fase2 = pygame.transform.scale(bg_fase2, (LARGURA, ALTURA))
except:
    bg_fase2 = None

# Caminhos das imagens
IMAGEM_FRENTE = "v1/assets/PlayerFrente.png"
IMAGEM_COSTAS = "v1/assets/PlayerCosta.png"
IMAGEM_ESQUERDA = "v1/assets/PlayerLadoE.png"
IMAGEM_DIREITA = "v1/assets/PlayerLadoD.png"
IMAGEM_ESPADA_DIREITA = "v1/assets/espada.png"
IMAGEM_ESPADA_ESQUERDA = "v1/assets/espada2.png"

def desenhar_barra_vida(tela, x, y, vida_atual, vida_maxima=100):
    largura_barra = int(LARGURA * 0.25)
    altura_barra = int(ALTURA * 0.04)
    borda = 3
    
    porcentagem = vida_atual / vida_maxima
    
    if porcentagem > 0.6:
        cor_vida = (76, 175, 80)
    elif porcentagem > 0.3:
        cor_vida = (255, 193, 7)
    else:
        cor_vida = (244, 67, 54)
    
    pygame.draw.rect(tela, (0, 0, 0), (x - 2, y - 2, largura_barra + 4, altura_barra + 4), border_radius=8)
    pygame.draw.rect(tela, (40, 40, 60), (x, y, largura_barra, altura_barra), border_radius=6)
    
    largura_vida_atual = int(largura_barra * porcentagem)
    if largura_vida_atual > 0:
        pygame.draw.rect(tela, cor_vida, (x, y, largura_vida_atual, altura_barra), border_radius=6)
    
    pygame.draw.rect(tela, (255, 255, 255), (x, y, largura_barra, altura_barra), borda, border_radius=6)
    
    texto_vida = fonte_pequena.render(f"{int(vida_atual)}/{vida_maxima}", True, (255, 255, 255))
    texto_rect = texto_vida.get_rect(center=(x + largura_barra // 2, y + altura_barra // 2))
    tela.blit(texto_vida, texto_rect)

def desenhar_portal(tela, x, y):
    pulse = abs(pygame.time.get_ticks() // 100 % 20 - 10) / 10
    raio = int(35 + pulse * 8)
    
    pygame.draw.circle(tela, (100, 50, 200), (x + 40, y + 40), raio + 8)
    pygame.draw.circle(tela, (150, 0, 255), (x + 40, y + 40), raio)
    
    seta_pontos = [
        (x + 40, y + 20),
        (x + 65, y + 40),
        (x + 40, y + 60),
        (x + 48, y + 40)
    ]
    pygame.draw.polygon(tela, (255, 255, 255), seta_pontos)
    
    texto = fonte_pequena.render("SAÍDA", True, (255, 255, 255))
    tela.blit(texto, (x + 20, y + 85))

# Cria o jogador (começa no lado esquerdo)
posicao_inicial_x = 50
posicao_inicial_y = CHAO_Y
jogador = Player(posicao_inicial_x, posicao_inicial_y, TAMANHO_PLAYER, 
                 VELOCIDADE_NORMAL, VELOCIDADE_DEVAGAR, (100, 200, 100),
                 IMAGEM_FRENTE, IMAGEM_COSTAS, IMAGEM_ESQUERDA, IMAGEM_DIREITA,
                 IMAGEM_ESPADA_DIREITA, IMAGEM_ESPADA_ESQUERDA)

# Cria sistemas de zumbis
sistema_zumbis_fase1 = SistemaZumbis(LARGURA, ALTURA, CHAO_Y, fase=1)
sistema_zumbis_fase2 = SistemaZumbis(LARGURA, ALTURA, CHAO_Y, fase=2)
sistema_zumbis_atual = sistema_zumbis_fase1

# Cria zumbis iniciais da fase 1
for i in range(2):
    zumbi = sistema_zumbis_fase1.criar_zumbi_aleatorio(TAMANHO_ZUMBI, VELOCIDADE_ZUMBI, (50, 100, 50))
    sistema_zumbis_fase1.adicionar_zumbi(zumbi)

# Variáveis de controle
game_over = False
fase_atual = 1
transicao_ativa = False
pontos_para_proxima_fase = 200
frame_count = 0
portal_visivel = False
portal_rect = pygame.Rect(LARGURA - 120, CHAO_Y + TAMANHO_PLAYER // 2, 80, 80)

# Loop principal
rodando = True
while rodando:
    for evento in pygame.event.get():
        if evento.type == pygame.QUIT:
            rodando = False
        elif evento.type == pygame.KEYDOWN:
            if evento.key == pygame.K_ESCAPE:
                rodando = False
            elif evento.key == pygame.K_r and game_over:
                # Reinicia o jogo
                game_over = False
                fase_atual = 1
                transicao_ativa = False
                portal_visivel = False
                frame_count = 0
                
                jogador.vida = 100
                jogador.pontuacao = 0
                jogador.x = 50  # Começa no lado esquerdo
                jogador.y = CHAO_Y
                jogador.rect.x = jogador.x
                jogador.rect.y = jogador.y
                
                sistema_zumbis_fase1 = SistemaZumbis(LARGURA, ALTURA, CHAO_Y, fase=1)
                sistema_zumbis_fase2 = SistemaZumbis(LARGURA, ALTURA, CHAO_Y, fase=2)
                sistema_zumbis_atual = sistema_zumbis_fase1
                
                for i in range(2):
                    zumbi = sistema_zumbis_fase1.criar_zumbi_aleatorio(TAMANHO_ZUMBI, VELOCIDADE_ZUMBI, (50, 100, 50))
                    sistema_zumbis_fase1.adicionar_zumbi(zumbi)
        elif evento.type == pygame.MOUSEBUTTONDOWN:
            if evento.button == 1 and not game_over and not transicao_ativa:
                jogador.atacar()
    
    if not game_over and not transicao_ativa:
        teclas = pygame.key.get_pressed()
        jogador.mover(teclas, LARGURA, ALTURA)
        jogador.atualizar_ataque()
        jogador.atualizar_invulnerabilidade()
        
        tomou_dano, zumbis_mortos = sistema_zumbis_atual.atualizar(
            jogador.x + TAMANHO_PLAYER // 2,
            jogador.area_ataque
        )
        
        if tomou_dano:
            jogador.receber_dano(10)
            if jogador.get_vida() <= 0:
                game_over = True
        
        if zumbis_mortos > 0:
            jogador.adicionar_pontos(zumbis_mortos * 20)
        
        # Verifica se completou a fase 1
        if fase_atual == 1 and jogador.get_pontuacao() >= pontos_para_proxima_fase:
            sistema_zumbis_fase1.parar_spawn()
            portal_visivel = True
            
            if jogador.rect.colliderect(portal_rect):
                transicao_ativa = True
                portal_visivel = False
        
        # Spawna novos zumbis
        if sistema_zumbis_atual.tentar_spawnar_zumbi(frame_count):
            novo_zumbi = sistema_zumbis_atual.criar_zumbi_aleatorio(TAMANHO_ZUMBI, VELOCIDADE_ZUMBI, (50, 100, 50))
            sistema_zumbis_atual.adicionar_zumbi(novo_zumbi)
        
        frame_count += 1
    
    # Transição para fase 2
    if transicao_ativa:
        for i in range(10):
            tela.fill((0, 0, 0))
            texto_carregando = fonte.render("Carregando Fase 2...", True, (255, 255, 255))
            tela.blit(texto_carregando, (LARGURA // 2 - texto_carregando.get_width() // 2, ALTURA // 2))
            pygame.display.flip()
            pygame.time.wait(50)
        
        fase_atual = 2
        sistema_zumbis_atual = sistema_zumbis_fase2
        sistema_zumbis_fase2.reiniciar_spawn()
        
        # Jogador começa no lado esquerdo da fase 2
        jogador.x = 50
        jogador.y = CHAO_Y
        jogador.rect.x = jogador.x
        jogador.rect.y = jogador.y
        
        for i in range(3):
            zumbi = sistema_zumbis_fase2.criar_zumbi_aleatorio(TAMANHO_ZUMBI, VELOCIDADE_ZUMBI + 0.5, (50, 100, 50))
            sistema_zumbis_fase2.adicionar_zumbi(zumbi)
        
        transicao_ativa = False
    
    # Desenha o jogo
    if fase_atual == 1 and bg_fase1:
        tela.blit(bg_fase1, (0, 0))
    elif fase_atual == 2 and bg_fase2:
        tela.blit(bg_fase2, (0, 0))
    else:
        tela.fill((30, 30, 50))
    
    sistema_zumbis_atual.desenhar(tela)
    jogador.desenhar(tela)
    
    if portal_visivel:
        desenhar_portal(tela, LARGURA - 120, CHAO_Y + TAMANHO_PLAYER // 2 - 30)
    
    # Interface
    painel_superior = pygame.Surface((LARGURA, int(ALTURA * 0.15)))
    painel_superior.set_alpha(180)
    painel_superior.fill((0, 0, 0))
    tela.blit(painel_superior, (0, 0))
    
    texto_pontuacao = fonte.render(f"⭐ {jogador.get_pontuacao()}", True, (255, 215, 0))
    tela.blit(texto_pontuacao, (int(LARGURA * 0.03), int(ALTURA * 0.02)))
    
    texto_fase = fonte.render(f"FASE {fase_atual}", True, (255, 255, 255))
    tela.blit(texto_fase, (LARGURA // 2 - texto_fase.get_width() // 2, int(ALTURA * 0.02)))
    
    texto_zumbis = fonte.render(f"🧟 {sistema_zumbis_atual.get_quantidade()}", True, (150, 150, 150))
    tela.blit(texto_zumbis, (LARGURA - int(LARGURA * 0.1), int(ALTURA * 0.02)))
    
    desenhar_barra_vida(tela, int(LARGURA * 0.03), int(ALTURA * 0.08), jogador.get_vida())
    
    if fase_atual == 1 and not portal_visivel:
        pontos_faltando = pontos_para_proxima_fase - jogador.get_pontuacao()
        if pontos_faltando > 0:
            texto_progresso = fonte_pequena.render(f"Próxima fase: {pontos_faltando} pontos", True, (200, 200, 200))
            tela.blit(texto_progresso, (int(LARGURA * 0.03), int(ALTURA * 0.13)))
    elif fase_atual == 1 and portal_visivel:
        texto_portal = fonte_pequena.render("Vá para o portal roxo!", True, (200, 200, 255))
        tela.blit(texto_portal, (int(LARGURA * 0.03), int(ALTURA * 0.13)))
    
    texto_instrucoes = fonte_pequena.render("← → / A D = Mover | SHIFT = Devagar | CLICK = Atacar | R = Reiniciar | ESC = Sair", True, (150, 150, 150))
    tela.blit(texto_instrucoes, (int(LARGURA * 0.03), ALTURA - 30))
    
    if game_over:
        overlay = pygame.Surface((LARGURA, ALTURA))
        overlay.set_alpha(200)
        overlay.fill((0, 0, 0))
        tela.blit(overlay, (0, 0))
        
        texto_game_over = fonte_grande.render("GAME OVER!", True, (255, 0, 0))
        texto_pontos_final = fonte.render(f"Pontuação Final: {jogador.get_pontuacao()}", True, (255, 215, 0))
        texto_reiniciar = fonte_pequena.render("Pressione R para reiniciar", True, (255, 255, 255))
        
        tela.blit(texto_game_over, (LARGURA // 2 - texto_game_over.get_width() // 2, ALTURA // 2 - 80))
        tela.blit(texto_pontos_final, (LARGURA // 2 - texto_pontos_final.get_width() // 2, ALTURA // 2 - 20))
        tela.blit(texto_reiniciar, (LARGURA // 2 - texto_reiniciar.get_width() // 2, ALTURA // 2 + 40))
    
    pygame.display.flip()
    relogio.tick(60)

pygame.quit()
sys.exit()