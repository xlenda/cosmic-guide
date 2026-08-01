# Estado do Cosmic Guide — 01/08/2026

> Escrito para uma sessão nova continuar sem reler dois dias de conversa.
> **Tudo commitado e no GitHub** (`1904a7b`). 1.081 testes, 1.081 passando.

---

## Como rodar

```bash
npm test                          # 1081 testes (~2 min, concorrência limitada de propósito)
bash scripts/deploy-vercel.sh     # roda a suíte como portão, exporta e publica
bash server-patches/deploy.sh     # backend na VPS
```

---

## ✅ NO AR e funcionando

O app fala **três idiomas de verdade** (PT/ES/EN), detecta pelo navegador, e todo
o conteúdo das leituras tem pack próprio em `lib/traducoes/`.

**Features com tela:** Horóscopo, Mapa Astral, Tarô, Compatibilidade, Sonhos,
Palma/Rosto/Pé/Pintas, Café, Chat, Calendário Lunar, Diário (com favoritos),
Rituais (21), Jornada (4 trilhas de 7 dias), Calendário Cósmico, Mitos (25),
"Como você tá?", Quiz Cósmico (40 perguntas), Papel de Parede, Homem Zodiacal,
Aterramento, Som do Céu, Loja, Tokens, Missões.

**A base de tradição:** `docs/tradicao/`, 19 documentos, 16.224 linhas de
pesquisa em fonte primária. **`00-tese.md` governa todo conteúdo — ler antes de
escrever qualquer texto do app.** `16-oportunidades-de-conteudo.md` é um roadmap
de 20 features rankeadas por riqueza de fonte × esforço.

---

## 🔧 O QUE FALTA (em ordem)

### 1. Os 16 bugs restantes da auditoria
Lista completa e verificada em
`C:/Users/XuXa/AppData/Local/Temp/claude/C--Users-XuXa/857ce44c-.../tasks/wdo0nz0wj.output`
(JSON, campo `bugs` — 42 confirmados, **26 já consertados**).

Todos são **médio ou baixo**. Nenhum perde dado nem quebra fluxo. O padrão que
resta é quase sempre o mesmo: um literal em português esquecido no chrome de
alguma tela. Os principais:

- `screens/CalendarioCosmicoScreen.js` — data sempre DD/MM e hora 24h nos três idiomas
- `lib/journal.js:149` — fallback do Insight da Semana cravado em português
- `screens/WallpaperScreen.js:198` — `useMemo` só depende de `lang`, não relê o dia
- `screens/ComoVoceTaScreen.js` — 4 dos 9 destinos ainda entregam tela em PT
- `lib/celestialSeasons.js:111` — "Temporada de {signo}" com nome PT

**Como consertar:** quase todos são uma linha. Existe `nomeDoSigno(nome, lang)`
em `lib/synastry.js` e `traduzirQuando/traduzirAutor` em
`lib/traducoes/datacao.js` — use-os em vez de criar tabela nova.

### 2. Integrar as 4 features do doc 16 — **construídas e sem rota**
`lib/seita.js`, `lib/idadeReal.js` (+ `screens/IdadeRealScreen.js`),
`lib/luaForaDeCurso.js`, `lib/profeccoes.js` — todas com packs nos 3 idiomas e
testes passando. Falta: rota em `routes.js`, `<Stack.Screen>` lazy em `App.js`,
chaves de chrome em `lib/i18n.js` e entrada no grid da Home.

**Regra dura:** NÃO criar card novo solto na Home. O dono tirou dois de lá
("fica perdido no meio"); as features entram no **grid**.

### 3. Pendências que são do dono, não do código
- **Importar as cidades no servidor** — sem isso quem mora fora das capitais não
  acha a cidade no Mapa Astral
- **Fixar a chave de IA no `.env`** (ver `server-patches/FIXAR-CHAVE-IA.md`)

---

## Regras do app que não se atravessa

Estão em `docs/tradicao/00-tese.md` e na memória do Claude. Resumo:

1. **PRENDE PRIMEIRO, FONTE DEPOIS.** Todo texto abre na vida real, em português
   de conversa; a fonte vem depois, como recibo. Nunca o contrário.
2. **Nada de alegação de saúde**, nem implícita — e a regra é de PALAVRA, não de
   intenção (pt aliviar/acalmar/curar/tratar; es sanar/calmar; en soothe/heal).
   Há testes varrendo os três idiomas que abortam o build.
3. **Nada de promessa, veredito ou prova social inventada.** O app tem 2
   assinaturas ativas — não existe "+10 mil usuários".
4. **Avisos defensivos foram removidos** ("não garante resultados"). Sobraram 4
   linhas curtas, só onde a pessoa fotografa o próprio corpo ou digita
   sofrimento.
5. **Toda afirmação histórica carrega obra, autor e século.** O que é leitura do
   app vem rotulado como leitura do app.
6. **Nunca fabricar céu:** sem efeméride, declarar indisponível.
7. **AsyncStorage só via `lib/storage.js`.**
8. **Três idiomas desde o nascimento**, com teste golden provando que o PT não
   mudou e teste de paridade nas chaves.

---

## Marketing pronto pra usar

- `docs/respostas-para-leads.md` — 20 perguntas com resposta rastreada à fonte
- `docs/marketing/bio-instagram.md` — bio nos 3 idiomas, 4 versões cada
- `docs/marketing/descricao-reels.md` — descrição padrão + 12 ganchos de reel

**O gatilho de encantamento** (do reel que o dono mandou): *"POV: sempre achei
que o tarô era do Egito e ninguém nunca tinha me mostrado que foi inventado em
1781 😭"*. A fórmula é nomear um desejo antigo + "ninguém tinha feito isso
ainda" — e no nosso caso isso é literalmente verdade, com fonte.
