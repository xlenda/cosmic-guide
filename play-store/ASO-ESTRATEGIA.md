# Estratégia ASO — Cosmic Guide

> Estado: 26/08/2026. Fonte de verdade dos textos: `metadata/store-listings.js`.
> Esta estratégia não altera o nome exibido dentro do app nem o identificador
> `cloud.cosmicguide.app`; ela muda apenas o título localizado nas lojas.

## Decisão de nome

Usar **marca + intenção de busca**, localizada por mercado:

| Loja/idioma | Título | Caracteres |
|---|---|---:|
| PT-BR | `Cosmic Guide: Mapa Astral` | 25/30 |
| ES-419 | `Cosmic Guide: Carta Astral` | 26/30 |
| EN-US | `Cosmic Guide: Birth Chart` | 25/30 |

`Cosmic Guide` sozinho é memorável, mas não explica o produto a quem ainda não
conhece a marca. Tirar a marca e usar um título totalmente genérico também seria
uma aposta sem dados. O híbrido preserva reconhecimento e acrescenta uma busca de
alta intenção, sem renomear o app inteiro.

O padrão aparece em concorrentes relevantes: `Astrolink: Mapa Astral e Tarot`
preserva a marca e descreve o produto, enquanto Co–Star, CHANI e Moonly conseguem
usar títulos mais emocionais porque já construíram reconhecimento. Cosmic Guide
ainda precisa das duas coisas: marca e clareza.

Não há, nos documentos internos, dado de volume ou dificuldade das palavras. Por
isso este arquivo não chama nenhuma keyword de “campeã” sem medição. A escolha é
qualitativa, baseada no produto real e nas fichas atuais do mercado.

## Posicionamento

**Céu calculado de verdade + leitura simbólica com fonte e limite visíveis.**

O diferencial não é “ter mais funções”. É permitir que a pessoa veja o cálculo
por trás da experiência:

- `Alinhe seu céu` transforma o trânsito atual em gesto e resultado;
- o Recibo Cósmico mostra aspecto, orbe, fonte e limite;
- o mapa deixa indisponível o que depende de um dado ausente;
- a compatibilidade não inventa porcentagem nem veredito;
- recursos de IA são identificados como IA.

Assinatura visual/campanha: **“Tarô raspa. Cosmic Guide alinha.”** Ela não ocupa
o lugar das keywords na ficha; serve para peças editoriais e campanhas.

## Mapa de keywords

### Português (Brasil)

- Principal: `mapa astral`.
- Descoberta: `tarô`, `tarot`, `horóscopo diário`, `astrologia`.
- Consideração: `compatibilidade de signos`, `sinastria`, `ascendente`, `signo lunar`.
- Cauda longa: `calendário lunar`, `fases da lua`, `trânsitos astrológicos`.

### Espanhol latino-americano

- Principal: `carta astral` e a variação natural `carta natal`.
- Descoberta: `tarot`, `horóscopo diario`, `astrología`.
- Consideração: `compatibilidad de signos`, `sinastría`, `ascendente`, `signo lunar`.
- Cauda longa: `calendario lunar`, `fases de la luna`, `tránsitos astrológicos`.

### Inglês (Estados Unidos)

- Principal: `birth chart` e a variação `natal chart`.
- Descoberta: `tarot`, `daily horoscope`, `astrology`.
- Consideração: `zodiac compatibility`, `synastry`, `rising sign`, `moon sign`.
- Cauda longa: `moon phases`, `lunar calendar`, `astrology transits`.

Não usar nomes de concorrentes, `psychic`, `vidente`, `match`, `cura`, `terapia`,
`sorte`, `previsão garantida` ou qualquer keyword que prometa uma função que o
produto não entrega.

## Arquitetura dos textos

### Google Play

- O título carrega a marca e a keyword principal.
- A descrição breve apresenta Tarô, horóscopo, compatibilidade e o diferencial
  de fontes, sem CTA e sem repetir palavras artificialmente.
- A descrição completa abre com `Alinhe seu céu`, depois cobre mapa/horóscopo,
  Tarô, compatibilidade, registro, Explorar e transparência.
- Não existe campo oculto de keywords no Google Play. Relevância vem de título,
  texto natural, idioma correto e conversão da página.

### App Store

- Name: o mesmo título híbrido da Play.
- Subtitle: `Tarô, signos e horóscopo` e equivalentes, sem repetir a keyword do nome.
- Keywords: até 100 bytes, sem espaços depois das vírgulas, sem concorrentes e
  sem repetir palavras do Name, Subtitle ou categoria.
- Promotional Text é para conversão e pode ser atualizado sem nova versão; não
  deve ser tratado como campo indexável.

## Sequência visual

As três primeiras imagens formam a promessa central. Cada uma usa uma frase,
interface atual e texto localizado. Um traço orbital dourado conecta visualmente
as duas primeiras e vira o elemento proprietário da campanha.

| # | Promessa PT-BR | Cena real |
|---:|---|---|
| 1 | Seu céu, calculado de verdade | Discos do `Alinhe seu céu` |
| 2 | Veja o aspecto, o orbe e a fonte | Recibo Cósmico |
| 3 | Raspe 3 cartas. Leia uma por vez | Tarô em raspagem |
| 4 | 78 cartas. Seu álbum. Seus encontros | Álbum do Tarô |
| 5 | Sol, Lua e Ascendente no seu mapa | Mapa completo |
| 6 | Compare dois signos sem vereditos | Compatibilidade por áreas |
| 7 | Veja como seu horóscopo é calculado | Horóscopo e abertura do método |
| 8 | Escolha pelo que faz sentido agora | Explorar organizado por seções |

Regras de produção:

- mostrar o app funcionando, nunca somente arte ou tela de login;
- usar perfil demonstrativo, sem dados de usuário real;
- não esconder paywall nem marcar como grátis o que pode exigir Premium;
- interface visível ocupa pelo menos 80% das três primeiras imagens;
- no Google Play, exportar oito imagens 1080×1920 por idioma;
- no iPhone, exportar o maior tamanho aceito para 6,9 polegadas; como o app
  declara suporte a iPad, preparar também o tamanho de 13 polegadas antes do iOS;
- alt text localizado vem de `metadata/store-listings.js`.

## Plano de experimentos depois da publicação

Não trocar várias variáveis ao mesmo tempo. Medir por país e idioma.

1. **Baseline:** título híbrido + conjunto visual novo.
2. **Experimento 1 — primeira screenshot:** `Alinhe seu céu` versus `Mapa Astral`.
3. **Experimento 2 — descrição breve:** prova de método (`com fontes`) versus
   benefício emocional (`para amor, ciclos e escolhas`).
4. **Experimento 3 — feature graphic:** cálculo visível versus gesto de raspar.
5. **Somente com dados suficientes:** testar um título mais descritivo contra o
   híbrido. Não abandonar `Cosmic Guide` por intuição.

Métrica principal: conversão da ficha em primeira instalação. Guardrails:
retenção da primeira semana, abertura real do app e cancelamentos. Uma variante
que compra instalações erradas não é vitória.

Na Google Play, usar experimento localizado, no máximo duas variantes e um ativo
por rodada. Aplicar a vencedora apenas quando o intervalo de confiança e a
qualidade dos usuários apontarem na mesma direção.

## Claims que podem entrar

- céu, fase lunar, horóscopo e mapa calculados;
- aspecto, orbe, fonte e limite visíveis;
- 78 cartas normais e invertidas, cinco temas e raspagem sequencial;
- Sol, Lua, Ascendente, casas e aspectos quando os dados necessários existem;
- compatibilidade por cinco áreas, sem porcentagem ou destino;
- PT, ES e EN;
- Diário local, álbum, compartilhamento explícito, denúncia e bloqueio na Comunidade.

## Claims bloqueados

- “o melhor”, “nº 1”, “100% preciso”, futuro garantido, cura, sorte ou diagnóstico;
- prova social, volume de usuários ou avaliações ainda inexistentes;
- astrólogos humanos ou moderação humana contínua;
- Diário sincronizado, busca, edição ou exportação;
- DMs, match, namoro, placar de compatibilidade ou áudio ao vivo;
- assinatura Android funcionando enquanto o webhook do RevenueCat não existir;
- Órbi ou voz como promessa principal enquanto disponibilidade e escuta física
  no Android não estiverem comprovadas;
- suporte por e-mail enquanto a caixa `contato@cosmicguide.cloud` não receber.

## Pendências externas para publicar

1. Ativar um canal de suporte que realmente receba mensagens e então preencher
   o `supportUrl` da App Store. Não foi inventado um URL de suporte.
2. Antes do primeiro envio à App Store, implementar filtro de conteúdo ofensivo
   antes da publicação na Comunidade e ativar contato + rotina de resposta rápida.
   Denúncia e bloqueio já existem, mas não cumprem sozinhos os quatro requisitos
   de UGC da [App Review Guideline 1.2](https://developer.apple.com/app-store/review/guidelines/#user-generated-content).
3. Criar o registro nas consoles e confirmar categoria/classificação final.
4. Para Android com compra nativa: implementar primeiro o webhook do RevenueCat;
   só depois configurar a chave pública.
5. Fazer escuta física dos três idiomas e revisar as imagens em aparelhos reais.
6. Manter a rotina humana de moderação da Comunidade; denúncia e bloqueio no
   código não substituem quem analisa os casos.

## Fontes atuais

- Google Play: [limites dos campos](https://support.google.com/googleplay/android-developer/answer/9859152?hl=pt-BR), [política de metadados](https://support.google.com/googleplay/android-developer/answer/9898842?hl=pt-BR), [assets de preview](https://support.google.com/googleplay/android-developer/answer/9866151?hl=pt-BR), [experimentos](https://support.google.com/googleplay/android-developer/answer/12053285?hl=pt-BR).
- Apple: [nome e subtitle](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information), [descrição, promotional text e keywords](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/), [product page](https://developer.apple.com/app-store/product-page/), [screenshots](https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots/).
- Mercado: [Astrolink](https://play.google.com/store/apps/details?id=com.astrolink.webapp&hl=pt_BR), [Co–Star](https://play.google.com/store/apps/details?id=com.costarastrology&hl=pt_BR), [CHANI](https://play.google.com/store/apps/details?id=com.chani_nicholas_inc.chani&hl=pt_BR), [Moonly](https://play.google.com/store/apps/details?id=com.moonly.android&hl=pt_BR), [Labyrinthos](https://play.google.com/store/apps/details?id=com.labyrinthos.app&hl=pt_BR).
