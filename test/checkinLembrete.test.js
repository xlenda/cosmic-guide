// O LEMBRETE DIÁRIO DO CHECK-IN, lado do app — as partes puras.
//
// O que este arquivo protege, e por que cada uma importa:
//
//   1. O TOGGLE SÓ EXISTE DEPOIS DO PRIMEIRO CHECK-IN. Não é capricho de UI:
//      oferecer notificação diária de uma coisa que a pessoa nunca
//      experimentou é pedir permissão antes de dar motivo — é assim que opt-in
//      vira spam, e é assim que a permissão de push é negada pra sempre no
//      navegador (a pessoa só nega UMA vez e acabou; nem o Perfil recupera).
//   2. NADA LIGADO POR OMISSÃO. Preferência ausente = desligado. Um lembrete
//      que nasce ligado é notificação que ninguém pediu.
//   3. O TEXTO DO TOGGLE AVISA, NUNCA PROMETE — mesma doutrina do resto do
//      app, conferida nos três idiomas.
//
// O que NÃO dá pra testar aqui, e por isso não está: o subscribe de push e a
// chamada ao servidor (lib/webPush.js) dependem de navigator/serviceWorker/
// PushManager, que não existem em Node. Testar isso com mock testaria o mock.
// O contrato do outro lado tem teste próprio em
// server-patches/test/lembreteCheckin.test.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  jaFezAlgumCheckin,
  lerLembreteCheckin,
  salvarLembreteCheckin,
  registrarCheckin,
  diaISO,
} from '../lib/checkin.js';
import { LANGUAGES, _DICTS_FOR_TESTS } from '../lib/i18n.js';

const RAIZ = path.join(__dirname, '..');

// O repo é editado no Windows e os arquivos têm CRLF. Sem normalizar, toda
// asserção que ancora em `\n` falha por um caractere invisível — e o autor do
// teste conclui que o CÓDIGO está errado, não o teste.
function fonte(...partes) {
  return fs.readFileSync(path.join(RAIZ, ...partes), 'utf8').replace(/\r\n/g, '\n');
}

// Comentário explica o código; ele não É o código. Varredura que morde
// comentário acusa a documentação de ser o bug (foi o que aconteceu na
// primeira versão deste arquivo: o comentário do card cita "PushManager" ao
// explicar o que isWebPushSupported() já checa, e a asserção "o card não fala
// com a Push API na mão" ficou vermelha por causa da explicação certa).
function semComentarios(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/[^\n]*/g, '$1');
}

// ---------------------------------------------------------------------------
// Quando o toggle pode aparecer
// ---------------------------------------------------------------------------
test('sem nenhum check-in, o toggle não existe — nada de pedir push antes de dar motivo', () => {
  assert.equal(jaFezAlgumCheckin({}), false);
  assert.equal(jaFezAlgumCheckin(null), false);
  assert.equal(jaFezAlgumCheckin(undefined), false);
  // Registro corrompido/estranho no disco não vale como check-in — senão
  // qualquer lixo no AsyncStorage destravaria a oferta de notificação.
  assert.equal(jaFezAlgumCheckin({ '2026-08-01': 'sorte-alta' }), false);
  assert.equal(jaFezAlgumCheckin({ '2026-08-01': null }), false);
});

test('um check-in de qualquer dia já basta — não precisa ser o de hoje', () => {
  assert.equal(jaFezAlgumCheckin({ '2026-08-01': 'leve' }), true);
  assert.equal(jaFezAlgumCheckin({ '2026-08-01': 'pesado' }), true);
  // Antigo também conta: quem respondeu semana passada sabe o que é o
  // check-in, e é dessa pessoa que faz sentido pedir o lembrete.
  assert.equal(jaFezAlgumCheckin({ '2026-01-02': 'neutro' }), true);
});

test('responder o primeiro check-in destrava o toggle de verdade (fluxo real, sem mapa fabricado)', async () => {
  const hoje = new Date(2026, 7, 4);
  const antes = jaFezAlgumCheckin({});
  const dados = await registrarCheckin('leve', hoje);
  assert.equal(antes, false);
  assert.equal(dados[diaISO(hoje)], 'leve');
  assert.equal(jaFezAlgumCheckin(dados), true);
});

// ---------------------------------------------------------------------------
// A preferência guardada no aparelho
// ---------------------------------------------------------------------------
test('a preferência nasce desligada e faz ida e volta pelo disco', async () => {
  // Sem nada gravado: desligado. Nunca ligamos notificação por omissão.
  assert.equal(await lerLembreteCheckin(), false);

  await salvarLembreteCheckin(true);
  assert.equal(await lerLembreteCheckin(), true);

  await salvarLembreteCheckin(false);
  assert.equal(await lerLembreteCheckin(), false, 'desligar tem que grudar — não pode voltar sozinho');
});

test('a preferência mora numa chave SEPARADA do mapa de respostas', async () => {
  // A poda de 90 dias de registrarCheckin mexe no mapa toda vez que alguém
  // responde. Se a preferência morasse lá dentro, um dia ela sumiria junto com
  // um dia velho — e a pessoa pararia de receber o lembrete sem nunca ter
  // desligado nada.
  await salvarLembreteCheckin(true);
  const dados = await registrarCheckin('neutro', new Date(2026, 7, 6));
  assert.equal(await lerLembreteCheckin(), true, 'registrar check-in não pode apagar a preferência');
  assert.ok(!('true' in dados), 'a preferência vazou pra dentro do mapa de respostas');
  await salvarLembreteCheckin(false);
});

// ---------------------------------------------------------------------------
// O texto do toggle
// ---------------------------------------------------------------------------
const CHAVES = ['checkin.lembrete.rotulo', 'checkin.lembrete.ajuda'];

test('o toggle tem rótulo e explicação nos três idiomas', () => {
  const faltando = [];
  for (const chave of CHAVES) {
    for (const lang of LANGUAGES) {
      const v = _DICTS_FOR_TESTS[lang][chave];
      if (typeof v !== 'string' || v.trim() === '') faltando.push(`${lang}: ${chave}`);
    }
  }
  assert.deepEqual(faltando, [], `chave(s) sem tradução — a Home mostraria o nome da chave:\n  ${faltando.join('\n  ')}`);
});

// Um interruptor de notificação é onde a promessa entra escondida ("ative e
// seus dias ficam mais leves"). Aqui ele só pode dizer o que FAZ: um aviso por
// dia. Sem efeito prometido, sem saúde, sem número.
const PROIBIDOS = [
  /vai (melhorar|mudar|render)/i, /garant/i, /mejorar[áa]/i, /will (improve|change)/i, /guarantee/i,
  /\bsorte\b/i, /\bsuerte\b/i, /\bluck/i,
  /sa[úu]de/i, /\bhealth/i, /ansiedade|ansiedad|anxiety/i, /\bcura\b|\bcurar\b|\bheal\b/i,
  /terapia|therap/i, /diagn[óo]stic|diagnos/i,
  /\d+\s*%/,
];

test('o texto do toggle avisa, nunca promete — e não fala de saúde', () => {
  const achados = [];
  for (const chave of CHAVES) {
    for (const lang of LANGUAGES) {
      const texto = _DICTS_FOR_TESTS[lang][chave] || '';
      for (const padrao of PROIBIDOS) {
        if (padrao.test(texto)) achados.push(`${lang} ${chave} casa com ${padrao}: "${texto}"`);
      }
    }
  }
  assert.deepEqual(achados, [], `o toggle promete algo que o app não entrega:\n  ${achados.join('\n  ')}`);
});

// ---------------------------------------------------------------------------
// A fiação, conferida no texto do componente
// ---------------------------------------------------------------------------
// components/DailyMissionsCard.js não carrega sob node:test (puxa react-native
// e @expo/vector-icons), então a checagem é estática — o mesmo recurso que
// test/i18nKeysExist.js já usa pras famílias montadas em runtime. Ela existe
// porque as duas guardas abaixo são invisíveis: se alguém apagar a condição, o
// toggle não QUEBRA, ele só passa a aparecer pra quem não deveria vê-lo.
test('o toggle está preso às duas guardas: primeiro check-in feito E push suportado', () => {
  const src = fonte('components', 'DailyMissionsCard.js');
  assert.match(
    src,
    /jaFezAlgumCheckin\(checkins\)\s*&&\s*isWebPushSupported\(\)/,
    'a linha do lembrete precisa exigir 1º check-in E suporte real a Web Push'
  );
  // O toggle liga o push reusando o fluxo de sempre — nunca uma segunda
  // implementação de subscribe (era o caminho mais curto pra ter duas telas
  // pedindo permissão de formas diferentes).
  assert.match(src, /ensureWebPushSubscription\(/, 'ligar tem que reusar o fluxo de lib/webPush.js');
  assert.match(src, /setCheckinReminderOnServer\(/, 'a marcação no servidor é o que faz o cron enviar');
  assert.ok(
    !/pushManager|requestPermission|vapid-public-key/i.test(semComentarios(src)),
    'o card não pode falar com a Push API na mão — esse fluxo mora em lib/webPush.js'
  );
});

// A REGRESSÃO QUE QUASE FOI PRO AR (04/08/2026, pega na revisão): o caminho
// óbvio era subscribeToWebPush(null), porque o card não tem o signo em mãos.
// Só que ele reenvia POST /api/push/subscribe e o `save` do servidor faz
// `sign_name = excluded.sign_name` SEM COALESCE — então ligar o lembrete
// apagaria o signo de quem já tinha push, e o "Pensamento cósmico do dia"
// voltaria a ser genérico pra essa pessoa. Recurso novo apagando dado de
// recurso antigo, em silêncio. ensureWebPushSubscription() não reinscreve quem
// já está inscrito; esta asserção é o que impede a volta do atalho.
test('ligar o lembrete não reinscreve quem já tem push — o signo salvo não pode ser apagado', () => {
  const src = semComentarios(fonte('components', 'DailyMissionsCard.js'));
  assert.ok(
    !/subscribeToWebPush\s*\(/.test(src),
    'chamar subscribeToWebPush direto daqui apaga o sign_name de quem já tinha push — ' +
      'use ensureWebPushSubscription()'
  );

  // E a guarda do outro lado: ensureWebPushSubscription só pode cair no fluxo
  // completo DEPOIS de confirmar que não existe inscrição viva no navegador.
  const push = semComentarios(fonte('lib', 'webPush.js'));
  const corpo = /export async function ensureWebPushSubscription\([\s\S]*?\n}\n/.exec(push);
  assert.ok(corpo, 'não achei ensureWebPushSubscription');
  const posChecagem = corpo[0].indexOf('getSubscription()');
  const posSubscribe = corpo[0].indexOf('subscribeToWebPush(');
  assert.ok(posChecagem > 0 && posSubscribe > posChecagem, 'a reinscrição acontece antes de checar se já existe uma');
});

test('ligar o lembrete não acende o toggle sem confirmação do servidor', () => {
  const src = fonte('components', 'DailyMissionsCard.js');
  const bloco = /async function alternarLembrete\([\s\S]*?\n  }\n/.exec(src);
  assert.ok(bloco, 'não achei alternarLembrete');
  const corpo = bloco[0];
  // salvarLembreteCheckin(true)/setLembrete(true) só podem acontecer DEPOIS do
  // retorno do servidor — um interruptor que fica verde sem nada por trás é o
  // mesmo bug de confiança do card de notificação que sumia em silêncio.
  const posMarcacao = corpo.indexOf('setCheckinReminderOnServer(true');
  const posSalvar = corpo.indexOf('salvarLembreteCheckin(true)');
  assert.ok(posMarcacao > 0 && posSalvar > posMarcacao, 'a preferência ligada é salva antes de o servidor confirmar');
  assert.match(corpo, /webPushFailureMessage\(/, 'a falha precisa dizer o motivo, nunca sumir em silêncio');
});
