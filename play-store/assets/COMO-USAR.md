# Assets das lojas — geração e upload

> O gerador captura o app real publicado, usa um perfil demonstrativo e aplica
> as headlines localizadas de `../metadata/store-listings.js`. A saída padrão
> fica em `D:\Projetos\Cosmic Guide Store\release-final`, nunca dentro do repositório.

## Gerar o pacote completo do Google Play

```powershell
node play-store/assets/loja-shots.js --all
```

Saída:

```text
D:\Projetos\Cosmic Guide Store\release-final\google-play\
├── icone-loja-512.png
├── LEIA-ME.txt
├── pt-BR\
│   ├── feature-graphic.png
│   └── 01-*.png ... 08-*.png
├── es-419\
└── en-US\
```

Cada screenshot tem 1080×1920, PNG opaco. Cada feature graphic tem 1024×500,
PNG opaco. O ícone tem 512×512.

## Gerar só um idioma

```powershell
node play-store/assets/loja-shots.js --locale pt-BR
node play-store/assets/loja-shots.js --locale es-419
node play-store/assets/loja-shots.js --locale en-US
```

## Opções úteis

```powershell
# Outro ambiente, por exemplo uma prévia local já publicada
node play-store/assets/loja-shots.js --locale pt-BR --base https://exemplo/

# Somente feature graphic
node play-store/assets/loja-shots.js --locale pt-BR --feature-only

# Somente screenshots
node play-store/assets/loja-shots.js --locale pt-BR --screens-only

# Recompor sem acessar o app de novo, usando capturas brutas já validadas
node play-store/assets/loja-shots.js --all --compose-only `
  --raw-input "D:\Projetos\Cosmic Guide Store\release-final\raw" `
  --output "D:\Projetos\Cosmic Guide Store\release-final"
```

## Ordem das oito imagens

1. Alinhe seu céu — resultado calculado.
2. Recibo Cósmico — cálculo, aspecto, orbe e fonte.
3. Tarô por Tema — carta grande para raspar.
4. Álbum do Tarô — cartas reveladas e padrões.
5. Mapa Astral — Sol, Lua e Ascendente preenchidos.
6. Compatibilidade — dois signos, sem porcentagem ou veredito.
7. Horóscopo — método e dados do céu visíveis.
8. Explorar — catálogo organizado por seções.

## O que o gerador garante

- perfil demonstrativo; nenhum dado de usuário real;
- interface da URL informada, não mockups inventados;
- PT-BR, ES-419 e EN-US localizados;
- uma promessa por imagem;
- três primeiras imagens com a interface ocupando mais de 80% da altura;
- saída sem canal alfa;
- falha com código diferente de zero se uma cena real não for encontrada.

## Antes do upload

1. Rode `npm run aso:validate`.
2. Confira todas as imagens em 100% de zoom.
3. Escute/teste fisicamente o app nos três idiomas; imagem correta não prova voz.
4. Não use os PNGs antigos que continuam versionados na pasta — eles são de
   19/08/2026 e mostram navegação e estados anteriores.
5. No Play Console, associe cada pasta à localização correspondente e cole o
   alt text gerado por `npm run aso:export`.

## App Store

Os metadados iOS já estão prontos, mas as imagens deste gerador são do formato
Google Play. Antes de publicar no iOS, gerar e revisar o conjunto aceito de
iPhone 6,9" e, porque `supportsTablet=true`, o conjunto iPad 13". Não redimensionar
as imagens Android e chamar isso de screenshot nativo.
