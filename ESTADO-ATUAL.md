# Estado do Cosmic Guide — 01/08/2026 (atualizado)

> Escrito para uma sessão nova continuar sem reler dois dias de conversa.
> **Tudo commitado e NO AR** (`764a19d`). **1.385 testes, 1.385 passando.**
> **Auditoria: 42 bugs confirmados, 42 consertados.**
>
> **Última entrega:** as dez features de tradição que estavam na gaveta agora
> têm tela. Nenhum módulo de `lib/` continua órfão.

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

### 1. ~~Os bugs da auditoria~~ — **ZERADOS**

Os 42 confirmados estão consertados, com teste ou medição para cada um. Os
últimos dois blocos:

- **Bloco 13** — a linha de hoje da Home voltou a existir em ES/EN (era o único
  gancho de reentrada para Jornada e Rituais, e estava desligada por guarda
  `lang === 'pt'`); e três guardas de dado ruim: `localDayStr` devolvia a string
  `'NaN-NaN-NaN'` que virava chave de streak e campo de data do Diário,
  `getActivePin` tratava data ilegível como pin eterno, e `rulerOfDay` devolvia
  `undefined` e derrubava o Som do Céu junto com a Home.
- **Bloco 14** — a reserva do `signoFromDate` (tabela de datas fixas) errava
  **248 de 22.280 datas, 1,11%**, sempre na cúspide e sempre um signo à frente.
  Trocada pela fórmula do Astronomical Almanac (USNO): **4 de 36.890, 0,011%**.
  Mais o `onBack` do OneTimeLock, que parou de despejar da Jornada quem tocou
  numa trilha trancada.

**Se aparecer bug novo:** o padrão que mais apareceu foi literal em português
esquecido no chrome de uma tela. Existe `nomeDoSigno(nome, lang)` em
`lib/synastry.js` e `traduzirQuando/traduzirAutor` em `lib/traducoes/datacao.js`
— use-os em vez de criar tabela nova.

### 2. ~~Integrar as features construídas e sem rota~~ — **FEITO, 10 de 10**

Nenhum módulo de `lib/` continua órfão. Onde cada uma foi parar:

| Feature | Onde vive |
|---|---|
| Profecções (Ptolomeu IV.10) | **tela nova** + card no grid, ao lado de Idade Real |
| Como este app decide | **tela nova**, no menu do Perfil (é método, não consulta) |
| Seita (diurno/noturno) | seção dentro do **Mapa Astral** |
| Lua Fora de Curso | **Calendário Lunar**, com as duas réguas nomeadas |
| Artemidoro (5 espécies) | **Sonhos**, antes da interpretação |
| Quatro notas de Waite | **Tarô**, entre escolher o tema e tirar |
| História do tarô + decanato | dentro do **Álbum das 78** |
| Melotesia dupla | **Homem Zodiacal** (Manílio + Sefer lado a lado) |
| Aplicativo × separativo | **Calendário Cósmico** + "Céu de hoje" da Home |

**Regra dura mantida:** NÃO criar card novo solto na Home. O dono tirou dois de
lá ("fica perdido no meio"); as features entram no **grid**.

**Dívida deliberada (não bloqueia nada):** seis módulos ainda não exportam
`chromeDaTela(lang)`, então a tela importa os três packs e repete o
`packDoIdioma` do motor em ~5 linhas comentadas. Cada tela diz no cabeçalho
exatamente como consolidar quando alguém encostar no motor. Só arrumação.

### 3. ~~Cidades e chave de IA~~ — **as duas resolvidas** (conferido em produção)
- Cidades: `GET /api/cities/search` acha cidade pequena do interior (testado com
  Itatira/CE e Ubajara/CE, não só capital).
- Chave de IA: está no `.env` do servidor, e `/api/chat` responde com texto real
  (não com o fallback enlatado).

### 4. Pendências que continuam abertas — todas dependem de conta/decisão do dono

| O quê | O que falta da sua parte | Sem isso |
|---|---|---|
| **Lojas (Play/App Store)** | Conta Google Play (US$25 única) e Apple (US$99/ano); depois eu configuro os produtos de assinatura no RevenueCat | O app só existe na web. Nas lojas, Apple/Google **exigem** pagamento pelo sistema delas — o link do Hotmart não passa na revisão |
| **E-mail de carrinho abandonado** | Conta grátis em resend.com + a chave da API | O backend está pronto e **inerte**: sem `RESEND_API_KEY` ele não manda nada |
| **Tracking de conversão** | Criar GA4 e/ou Meta Pixel e me passar os IDs | Não dá pra saber quantos assinam solo vs. casal, nem medir campanha |
| **Painel admin** | Definir um `ADMIN_TOKEN` no `.env` do servidor | As rotas `/api/admin` respondem 503 (desligadas). É seguro assim — só não dá pra usar o painel |

**Dívida técnica interna (não bloqueia nada, é arrumação):** seis módulos ainda
não exportam `chromeDaTela(lang)`; cada tela explica no cabeçalho como
consolidar.

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
