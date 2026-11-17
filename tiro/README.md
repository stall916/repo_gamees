# Artilheiro Defender — GDD (5 linhas)

- **Fantasia:** o jogador pilota uma nave de defesa e precisa impedir que os inimigos atravessem a base.
- **Objetivo:** sobreviver, acertar inimigos, somar pontos e avançar pelas ondas; cada inimigo destruído vale 15 pontos.
- **Derrota:** o jogador deve sentir urgência porque cada inimigo que escapa pela base tira 1 vida; ao perder as 3 vidas, a partida termina.
- **Controles e feedback:** ←/→ ou A/D movem, Espaço/↑/W atiram, P pausa e R reinicia; o HUD mostra pontos, vidas e onda.
- **Ritmo e VFX:** ondas aumentam em quantidade (2 + onda, máximo 6), velocidade (45 + 8 por onda, máximo 115 px/s) e frequência (2,4 s − 0,12 s por onda, mínimo 0,9 s); inimigos destruídos geram um burst de 10 partículas.

## Direção de arte e créditos

A nave do jogador é desenhada diretamente no Canvas com formas vetoriais próprias (casco, asas, cabine e chama do motor). Não foi usado sprite, pack ou arte de terceiros; portanto, não há créditos de assets externos a declarar.
