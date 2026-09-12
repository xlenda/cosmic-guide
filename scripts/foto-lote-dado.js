// Fotografa o LOTE DE DADO E NÚMERO em 390x844 contra o servidor e2e.
//   FOTO_PORT=4183 FASE=antes node scripts/foto-lote-dado.js <pasta> [--vazio]
//
// Irmão de scripts/foto-lote-tempo.js — mesma mecânica, outras telas:
// Progresso, Nossa História, Nós Hoje, Tokens e Memória Cósmica.
//
// POR QUE TUDO POR TOQUE, E NADA POR URL. Nenhuma destas seis rotas tem `path`
// no `linking` de App.js (conferido 12/09/2026): /cosmic-guide/Progresso cai no
// fallback do servidor estático e o app abre na HOME. Testado — a primeira
// versão deste script fotografou seis Homes idênticas. Então o caminho é o
// mesmo da pessoa: Home → card, ou Perfil → linha do menu.
//
// AS CHAVES DE STORAGE SÃO AS REAIS, lidas do código (nunca adivinhadas):
//   · gff-couple-profile        — lib/coupleData.js PROFILE_KEY
//   · gff:<voce>:<amor>         — lib/coupleData.js timelineKey()
//   · gff-streak:<voce>:<amor>  — lib/coupleData.js streakKey()
//   · gff-agir / gff-reconectar / gff-descobrir — idem, mesmo arquivo
//   · cosmic-tokens-balance / -history — lib/tokens.js
//   · cosmic-journal            — lib/journal.js JOURNAL_KEY
//   · cosmic-active-days        — lib/streakDays.js ACTIVE_DAYS_KEY
//
// --vazio fotografa o ESTADO VAZIO (storage sem nada além do idioma): é a
// metade da prova que mais importa, porque quem nunca usou o app vê estas
// telas zeradas — e é aí que uma faixa curva vira bloco de cor sem conteúdo.
//
// FORA DO ALCANCE DESTE SCRIPT, e não é esquecimento:
//   · MonthlyWrapped — a barra que leva até ela só aparece nos dias 1 a 7 do
//     mês (isWrappedAvailable, lib/monthlyWrapped.js). Fora da janela não há
//     NENHUM toque que a alcance, e forjar rota mostraria uma tela que a
//     pessoa não alcança.
//   · CosmicMemory — a linha do menu só existe pra quem está LOGADO
//     (ProfileScreen.js:585). Sem sessão real, a foto seria de um vazio forjado.
// ponytail: sem retry nem paralelismo; se travar, roda de novo.
const { chromium } = require('playwright');
const path = require('path');

const PORTA = process.env.FOTO_PORT || 4173;
const BASE = `http://localhost:${PORTA}/cosmic-guide`;
const DESTINO = process.argv[2] || path.join(__dirname, '..', 'design', 'lote-dado');
const VAZIO = process.argv.includes('--vazio');
const FASE = VAZIO ? `${process.env.FASE || 'antes'}-vazio` : (process.env.FASE || 'antes');

const VOCE = 'Lena';
const AMOR = 'Théo';

// Mês corrente: o resumo do mês de ProgressoScreen filtra por prefixo YYYY-MM,
// então data fixa faria a foto mostrar zero em todo mês que não fosse o de
// quando o script foi escrito.
const agora = new Date();
const ym = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;

// nome, como chegar, quantas dobras.
//   home: rola a Home até achar o texto e clica.
//   perfil: vai na aba Perfil e clica no texto.
//   aba: depois de chegar, clica na aba de índice N (Nossa História / Nós Hoje).
const TELAS = [
  { nome: 'nossahistoria', home: 'Nossa História', dobras: 2 },
  { nome: 'progresso', home: 'Nossa História', aba: 'nossa-historia-aba-progresso', dobras: 3 },
  { nome: 'noshoje', home: 'Nós Hoje', dobras: 2 },
  { nome: 'tokens', perfil: true, dobras: 2 },
];

async function rolarAte(page, texto) {
  const alvo = page.getByText(texto, { exact: true }).first();
  for (let i = 0; i < 40; i++) {
    if (await alvo.count()) {
      try {
        await alvo.scrollIntoViewIfNeeded({ timeout: 2000 });
        return alvo;
      } catch { /* segue rolando */ }
    }
    await page.mouse.move(195, 500);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(300);
  }
  return (await alvo.count()) ? alvo : null;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  if (!VAZIO) {
    await ctx.addInitScript((d) => {
      const p = (k, v) => localStorage.setItem(k, JSON.stringify(v));
      localStorage.setItem('app-language', 'pt');
      p('gff-couple-profile', { voce: d.voce, amor: d.amor, sa: 'Leão', sb: 'Escorpião' });
      p('userSign', { name: 'Leão', pt: 'Leão' });
      p(`gff:${d.voce}:${d.amor}`, {
        memories: [
          { id: '1', date: `${d.ym}-03`, title: 'O primeiro café da manhã juntos', text: 'Chuva lá fora.' },
          { id: '2', date: `${d.ym}-11`, title: 'Cinema na quarta', text: 'Rimos alto demais.' },
          { id: '3', date: `${d.ym}-19`, title: 'Caminhada no parque', text: '' },
        ],
        capsules: [
          { id: String(Date.parse(`${d.ym}-05T10:00:00Z`)), createdAt: `${d.ym}-05T10:00:00.000Z`, unlockAt: '2027-01-01', text: 'Pra nós daqui a um ano.' },
        ],
      });
      p(`gff-streak:${d.voce}:${d.amor}`, { count: 12, longest: 19, last: `${d.ym}-19` });
      p(`gff-reconectar:${d.voce}:${d.amor}`, { a1: true, a2: true, a3: true, b1: true, b2: true });
      p(`gff-agir:${d.voce}:${d.amor}`, { done: ['g1', 'g2', 'g3', 'g4'], favorites: ['g2'], goalDone: true, goalSaved: 'Viajar juntos' });
      p(`gff-descobrir:${d.voce}:${d.amor}`, { linguagem: 'tempo', apego: 'seguro' });
      p('cosmic-tokens-balance', 245);
      p('cosmic-tokens-history', [
        { date: `${d.ym}-11T21:04:00.000Z`, amount: 15, reason: 'Leitura de Tarô concluída' },
        { date: `${d.ym}-10T09:12:00.000Z`, amount: -50, reason: 'Tema Dourado na Loja' },
        { date: `${d.ym}-09T20:40:00.000Z`, amount: 30, reason: 'Sequência de 7 dias' },
        { date: `${d.ym}-08T07:55:00.000Z`, amount: 10, reason: 'Missão diária' },
      ]);
      const dias = {};
      for (let i = 1; i <= 11; i++) dias[`${d.ym}-${String(i).padStart(2, '0')}`] = true;
      p('cosmic-active-days', dias);
      p('cosmic-journal', [
        { id: 'j1', date: `${d.ym}-11T21:04:00.000Z`, type: 'tarot', typeLabel: 'Tarô', title: 'Três cartas' },
        { id: 'j2', date: `${d.ym}-09T20:40:00.000Z`, type: 'tarot', typeLabel: 'Tarô', title: 'Carta do dia' },
        { id: 'j3', date: `${d.ym}-08T07:55:00.000Z`, type: 'dream', typeLabel: 'Sonhos', title: 'Mar escuro' },
      ]);
    }, { voce: VOCE, amor: AMOR, ym });
  } else {
    // O VAZIO DESTAS TELAS não é o storage em branco: storage em branco cai no
    // ONBOARDING e a Home nem aparece (medido — as três telas falharam com
    // "não achei na Home"). O vazio que interessa é o de quem ACABOU de fazer
    // o quiz do casal e ainda não registrou NADA: perfil existe, atividade não.
    await ctx.addInitScript((d) => {
      localStorage.setItem('app-language', 'pt');
      localStorage.setItem('gff-couple-profile', JSON.stringify({ voce: d.voce, amor: d.amor, sa: 'Leão', sb: 'Escorpião' }));
      localStorage.setItem('userSign', JSON.stringify({ name: 'Leão', pt: 'Leão' }));
    }, { voce: VOCE, amor: AMOR });
  }

  const page = await ctx.newPage();

  for (const tela of TELAS) {
    try {
      await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3500);

      if (tela.perfil) {
        await page.getByText('Perfil', { exact: true }).last().click();
        await page.waitForTimeout(1500);
        // O rótulo carrega o saldo dentro: 'Meus Tokens ({count})' — por isso
        // a busca é por regex, não por texto exato.
        const linha = page.getByText(/Meus Tokens/).first();
        for (let i = 0; i < 30 && !(await linha.count()); i++) {
          await page.mouse.move(195, 500);
          await page.mouse.wheel(0, 600);
          await page.waitForTimeout(300);
        }
        await linha.click();
        await page.waitForTimeout(2500);
      } else {
        const card = await rolarAte(page, tela.home);
        if (!card) throw new Error(`não achei "${tela.home}" na Home`);
        await card.click();
        await page.waitForTimeout(2500);
        if (tela.aba) {
          await page.getByTestId(tela.aba).click();
          await page.waitForTimeout(2000);
        }
      }

      for (let dobra = 1; dobra <= tela.dobras; dobra++) {
        await page.screenshot({
          path: path.join(DESTINO, `${FASE}-${tela.nome}-${dobra}.png`),
          animations: 'disabled',
        });
        if (dobra < tela.dobras) {
          // Estas telas rolam num ScrollView INTERNO — window.scrollTo devolve
          // dobras idênticas. A roda do mouse é o gesto real.
          await page.mouse.move(195, 500);
          await page.mouse.wheel(0, 700);
          await page.waitForTimeout(700);
        }
      }
      console.log('ok', tela.nome);
    } catch (e) {
      console.log('falhou', tela.nome, e.message);
    }
  }

  await browser.close();
})();
