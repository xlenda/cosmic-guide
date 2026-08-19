// A TELA DE PRIVACIDADE E A PÁGINA DE EXCLUSÃO NÃO PODEM PROMETER O QUE O
// CÓDIGO NÃO FAZ.
//
// Por que este teste existe: três vezes seguidas nesta preparação um texto
// afirmou um comportamento que o código não tinha. Sempre a mesma mecânica —
// alguém muda o código (a denúncia passou a carregar o texto denunciado, o
// feed passou a existir, o Diário ficou de fora do "apagar tudo") e o texto
// fica onde estava, prometendo o mundo anterior. As três frases abaixo foram
// publicadas assim, e cada uma delas está travada aqui pelo trecho exato.
//
// A regra: a frase pode ser MAIS MODESTA que a realidade, nunca mais generosa.
//
// Este arquivo NÃO tenta julgar redação. Ele pina três coisas:
//   1. as frases defeituosas exatas não voltam (nos três idiomas);
//   2. o dado novo que passou a sair do aparelho está descrito;
//   3. a página pública de exclusão não lista o Diário como apagado.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const { LANGUAGES, _DICTS_FOR_TESTS: DICTS } = require('../lib/i18n.js');

// ---------------------------------------------------------------------------
// 1. FRASES QUE NÃO PODEM VOLTAR
// ---------------------------------------------------------------------------
// Cada linha é uma promessa que o código desmente, com o recibo do arquivo que
// a desmente. Trecho literal (o que foi publicado), não paráfrase: um regex
// esperto aqui viraria falso positivo na primeira reescrita legítima.
const PROIBIDO = [
  // components/ReportarIA.js manda `detail` = a resposta de IA da tela, e
  // moderationRoutes.js faz INSERT dela em moderation_reports.detail, sem
  // retenção nenhuma (migração 016). No Chat essa resposta é a réplica ao que
  // a pessoa escreveu, e repete trechos do que ela escreveu.
  { chave: 'report.body', pt: 'Nada do que você escreveu', es: 'Nada de lo que escribiste', en: 'Nothing you wrote' },
  // Verdade só até a denúncia: o texto denunciado FICA guardado.
  {
    chave: 'privacy.use.ai',
    pt: 'Não fica guardado depois que a resposta é gerada',
    es: 'No queda guardado después de que la respuesta se genera',
    en: 'It is not kept once the answer comes back',
  },
  // A tela listava "existem duas exceções" e renderizava seis parágrafos.
  // Contagem em política de privacidade desmente sozinha na feature seguinte.
  { chave: 'privacy.use.localFirst', pt: 'duas exceções', es: 'dos excepciones', en: 'two exceptions' },
];

for (const item of PROIBIDO) {
  test(`${item.chave} não volta a prometer o que o código não faz`, () => {
    for (const lang of LANGUAGES) {
      const valor = DICTS[lang][item.chave];
      assert.ok(valor, `${item.chave} ausente em ${lang}`);
      assert.ok(
        !valor.includes(item[lang]),
        `${item.chave} (${lang}) voltou a dizer "${item[lang]}" — o código desmente essa frase`
      );
    }
  });
}

// ---------------------------------------------------------------------------
// 2. O DADO QUE PASSOU A SAIR DO APARELHO ESTÁ DESCRITO
// ---------------------------------------------------------------------------
// Denúncia e bloqueio nasceram nesta preparação, persistem no servidor
// (moderation_reports e social_blocks, migração 016) e não apareciam em lugar
// nenhum da tela de Privacidade. Omitir tratamento de dado é o mesmo defeito
// que descrevê-lo errado.
test('a tela de Privacidade descreve denúncia e bloqueio nos três idiomas', () => {
  const tela = fs.readFileSync(path.join(RAIZ, 'screens', 'PrivacyScreen.js'), 'utf8');
  assert.match(tela, /t\('privacy\.use\.report'\)/, 'PrivacyScreen.js não renderiza privacy.use.report');
  for (const lang of LANGUAGES) {
    assert.ok(DICTS[lang]['privacy.use.report'], `privacy.use.report ausente em ${lang}`);
  }
});

// privacy.rights.sharing tem que nomear TODOS os terceiros, e o Google entrou
// quando o login com Google entrou (lib/supabaseClient.js: signInWithGoogle).
test('privacy.rights.sharing nomeia os quatro terceiros', () => {
  for (const lang of LANGUAGES) {
    const valor = DICTS[lang]['privacy.rights.sharing'] || '';
    for (const terceiro of ['Anthropic', 'Hotmart', 'Supabase', 'Google']) {
      assert.ok(valor.includes(terceiro), `privacy.rights.sharing (${lang}) não cita ${terceiro}`);
    }
  }
});

// ---------------------------------------------------------------------------
// 3. A PÁGINA PÚBLICA DE EXCLUSÃO (a que vai no formulário do Google Play)
// ---------------------------------------------------------------------------
// deleteAllCoupleData (lib/coupleData.js) deixa cosmic-journal de fora DE
// PROPÓSITO, e deleteAccountData (server-patches/src/http/server.js) só
// desvincula subscriptions e apaga ai_free_quota — não conhece social_posts,
// social_comments, social_blocks nem moderation_reports. A página prometia o
// contrário.
const PAGINA = fs.readFileSync(path.join(RAIZ, 'public', 'excluir-conta.html'), 'utf8');

// A vírgula é o que separa o item de lista ("nomes, signos, ..., diário") do
// uso legítimo da palavra em "lembrete diário" / "recordatorio diario".
const BLOCOS = [
  { lang: 'pt', titulo: 'O que é apagado', diario: /,\s*di[áa]rio\b/i, fica: 'O Diário Cósmico continua neste aparelho' },
  { lang: 'es', titulo: 'Qué se borra', diario: /,\s*diario\b/i, fica: 'El Diario Cósmico sigue en este dispositivo' },
  { lang: 'en', titulo: 'What is deleted', diario: /,\s*journal\b/i, fica: 'The Cosmic Diary stays on this device' },
];

for (const bloco of BLOCOS) {
  test(`excluir-conta.html (${bloco.lang}) não promete apagar o Diário`, () => {
    const inicio = PAGINA.indexOf(`<h3>${bloco.titulo}</h3>`);
    assert.ok(inicio > 0, `seção "${bloco.titulo}" sumiu da página`);
    const fim = PAGINA.indexOf('<h3>', inicio + 4);
    const secao = PAGINA.slice(inicio, fim > 0 ? fim : undefined);

    assert.ok(
      !bloco.diario.test(secao),
      `a lista "${bloco.titulo}" voltou a listar o Diário — lib/coupleData.js não o apaga`
    );
    assert.ok(PAGINA.includes(bloco.fica), `a página não diz mais que o Diário FICA (${bloco.lang})`);
  });
}

// O feed e a fila de moderação sobrevivem à exclusão da conta, e quem apaga a
// conta perde o login que era o único jeito de apagar os próprios posts.
test('excluir-conta.html avisa que feed e denúncias sobrevivem à exclusão', () => {
  for (const trecho of [
    'O que você publicou no feed social',
    'Lo que publicaste en el feed social',
    'Whatever you posted in the social feed',
    'Denúncias e bloqueios',
    'Reportes y bloqueos',
    'Reports and blocks',
  ]) {
    assert.ok(PAGINA.includes(trecho), `excluir-conta.html não avisa: "${trecho}"`);
  }
});
