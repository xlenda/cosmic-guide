# Ficha das lojas — Cosmic Guide

> Atualizada em 26/08/2026. Os textos completos e localizados vivem em
> `metadata/store-listings.js`; não editar cópias soltas.

## Pacote pronto para copiar

```powershell
npm run aso:validate
npm run aso:export
```

O segundo comando gera em `D:\Projetos\Cosmic Guide Store\release-final\metadata` os arquivos
de Google Play (PT-BR, ES-419, EN-US), App Store (PT-BR, ES-MX, EN-US) e os
textos das screenshots.

## Títulos escolhidos

| Idioma | Título da loja | Limite |
|---|---|---:|
| PT-BR | `Cosmic Guide: Mapa Astral` | 25/30 |
| ES-419 | `Cosmic Guide: Carta Astral` | 26/30 |
| EN-US | `Cosmic Guide: Birth Chart` | 25/30 |

O nome interno/launcher continua `Cosmic Guide`. O identificador continua
`cloud.cosmicguide.app`.

## Google Play — PT-BR

**Nome do app**

```text
Cosmic Guide: Mapa Astral
```

**Descrição breve**

```text
Tarô para raspar, horóscopo diário, compatibilidade e astrologia com fontes.
```

A descrição completa pronta para colar é gerada em
`D:\Projetos\Cosmic Guide Store\release-final\metadata\google-play\pt-BR\listing.txt`.

## App Store — PT-BR

**Name**

```text
Cosmic Guide: Mapa Astral
```

**Subtitle**

```text
Tarô, signos e horóscopo
```

**Keywords — 99/100 bytes**

```text
ascendente,lua,compatibilidade,sinastria,natal,casas,planetas,efemerides,transitos,fases,calendario
```

Promotional Text e Description são gerados em
`D:\Projetos\Cosmic Guide Store\release-final\metadata\app-store\pt-BR\listing.txt`.

No espanhol, usar **es-419 no Google Play** e **es-MX na App Store**.

## Campos compartilhados

- Categoria Google Play: **Estilo de vida / Lifestyle**.
- Categoria primária App Store: **Lifestyle**.
- Categoria secundária App Store: **Entertainment**.
- Política de privacidade: `https://cosmicguide.cloud/privacidade`.
- Exclusão de conta: `https://cosmicguide.cloud/excluir-conta`.
- Público configurado: **18 anos ou mais**.
- Conteúdo gerado por usuário: **sim**, na Comunidade.

No questionário de conteúdo gerado por usuário, informar somente o que existe:
login, regras aceitas, denúncia, bloqueio e remoção. A rotina humana de moderação
continua sendo uma obrigação operacional, não uma função automática do app.

## Assets visuais

| Asset | Formato | Estado em 26/08 |
|---|---|---|
| Ícone Google Play | 512×512 PNG | existente; revisar no aparelho |
| Feature graphic | 1024×500 PNG sem alfa | **pronto** em `D:\Projetos\Cosmic Guide Store\release-final\google-play\<idioma>` |
| Screenshots Android | 8 por idioma, 1080×1920 | **24 prontos** no mesmo pacote (PT-BR, ES-419 e EN-US) |
| Screenshots iPhone | 1–10 por idioma/tamanho | ainda não geradas |
| Screenshots iPad 13\" | exigidas porque `supportsTablet=true` | ainda não geradas |
| Vídeo | opcional | fora do escopo por decisão do dono |

A ordem e os textos localizados das oito imagens ficam em
`metadata/store-listings.js` e em `ASO-ESTRATEGIA.md`.

## Bloqueios externos honestos

1. **Support URL da App Store:** falta um canal que realmente receba mensagens.
   Não usar `contato@cosmicguide.cloud` enquanto a caixa não funcionar.
2. **Comunidade na App Store:** ainda falta filtro pré-publicação de material
   ofensivo e um canal/rotina real de resposta rápida. Denúncia e bloqueio já
   existem, mas não bastam para a App Review Guideline 1.2.
3. **Compra nativa Android:** não anunciar assinatura na Play enquanto o webhook
   do RevenueCat não estiver implementado e validado.
4. **Publicação:** conta de loja, assinatura de contratos, classificação e upload
   final dependem do dono.
5. **Imagens:** o pacote Android foi gerado da produção atual; ainda precisa da
   conferência final em aparelho real antes do upload.

## Próximos testes de conversão

Após existir tráfego suficiente, testar uma variável por rodada:

1. primeira screenshot `Alinhe seu céu` versus `Mapa Astral`;
2. descrição breve focada em método versus benefício emocional;
3. feature graphic com cálculo versus gesto de raspar;
4. somente depois, título híbrido versus título mais descritivo.

Não trocar o nome principal por intuição. A decisão de futuro deve vir dos dados
de aquisição e retenção descritos em `ASO-ESTRATEGIA.md`.
