# Assets da Play Store — o que subir em cada campo

Tudo gerado localmente, custo zero (arte de fundo: Cloudflare Workers AI;
composicao e screenshots: Playwright com o app REAL de producao).

| Arquivo | Onde vai no Play Console | Exigencia da Play |
|---|---|---|
| `icone-loja-512.png` | Ficha da loja > **Icone do app** | 512x512 PNG, sem transparencia ✅ |
| `feature-graphic.png` | Ficha da loja > **Grafico de destaque** | 1024x500 ✅ |
| `shot-00-home.png` … `shot-07-*.png` | Ficha da loja > **Capturas de tela do celular** | min 2, max 8, 1080x1920 (9:16) ✅ |

## Ordem sugerida das screenshots (a 1a e a que aparece na busca)

1. `shot-02-compatibilidade.png` — o diferencial do app, ilustracao do casal
2. `shot-01-mapa-astral.png` — Sol/Lua/Ascendente com a mascote do signo
3. `shot-00-home.png` — mostra a quantidade de coisa que tem dentro
4. `shot-03-taro.png`
5. `shot-05-diario.png` — a parte de retencao
6. `shot-06-lua.png`
7. `shot-04-horoscopo.png`
8. `shot-07-jornada.png`

## Como REGERAR (depois de mudar o app)

```bash
cd play-store/assets
node loja-shots.js     # screenshots, do app de producao
node shot.js feature.html feature-graphic.png 1024 500
node shot.js icone.html icone-loja-512.png 512 512
```

`loja-shots.js` semeia um perfil de casal com data e hora de nascimento — sem
isso as telas aparecem VAZIAS ("nao encontramos a data de nascimento") e a
screenshot nao vende nada. Foi o primeiro erro ao gerar.

## O que NAO fizemos de proposito

- **Screenshot de tablet**: opcional, e o app nao foi desenhado pra tablet.
  Sem ela, a Play so nao lista o app na aba de tablets.
- **Video promocional**: opcional. So vale com video de verdade, nao slideshow.
