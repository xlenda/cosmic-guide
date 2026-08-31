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
// Este arquivo NÃO tenta julgar redação. Ele pina quatro coisas:
//   1. as frases defeituosas exatas não voltam (nos três idiomas);
//   2. o dado novo que passou a sair do aparelho está descrito;
//   3. a página pública de exclusão não lista o Diário como apagado;
//   4. uma promessa que só vale COM ressalva não aparece sem ela em NENHUMA
//      chave — a varredura é pela frase, não por chave escolhida a dedo.
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
// 1b. PROMESSA QUE SÓ VALE COM RESSALVA — EM QUALQUER CHAVE, NÃO SÓ NA TELA
//     DE PRIVACIDADE
// ---------------------------------------------------------------------------
// "nosso servidor não guarda o conteúdo da chamada" era verdade até a Memória
// Cósmica: /api/chat passou a chamar rememberChatMessage e a persistir a
// mensagem da pessoa em cosmic_memories (migração 022). Quem escreveu a
// feature qualificou privacy.use.ai com "Por padrão" e passou ao lado de
// help.faq.readings.answer — o mesmo app ficou dizendo a verdade na tela de
// Privacidade e o contrário na tela de Ajuda, porque este arquivo só olhava
// chaves privacy.*.
//
// Pinar mais uma chave repetiria o erro na PRÓXIMA superfície (é a quinta vez
// que o texto fica para trás do código). Então a busca aqui é pela FRASE, em
// TODAS as chaves dos três dicionários: onde a promessa aparecer, a ressalva
// tem que estar na MESMA frase — não adianta qualificar num parágrafo e
// prometer sem ressalva no outro.
const PROMESSAS_COM_RESSALVA = [
  {
    nome: 'o servidor não guarda o conteúdo da chamada de IA',
    porque:
      'server-patches/src/http/server.js chama memoryRepository.rememberChatMessage em /api/chat: ' +
      'com a Memória Cósmica ligada, o conteúdo da mensagem FICA guardado',
    pt: { promessa: 'não guarda o conteúdo da chamada', ressalva: 'por padrão' },
    es: { promessa: 'no guarda el contenido de la llamada', ressalva: 'por defecto' },
    en: { promessa: 'does not store the call content', ressalva: 'by default' },
  },
];

// Corte por frase sem lookbehind de propósito: este arquivo é copiado como
// modelo para outros portões, e `(?<=` derruba Safari < 16.4. Basta separar;
// a pontuação não faz falta para a comparação. "1.600" não é cortado porque
// só há corte quando o ponto vem seguido de espaço.
function frases(valor) {
  return String(valor).split(/[.!?]\s+/);
}

for (const promessa of PROMESSAS_COM_RESSALVA) {
  test(`nenhuma chave promete "${promessa.nome}" sem a ressalva`, () => {
    for (const lang of LANGUAGES) {
      const trecho = promessa[lang].promessa.toLowerCase();
      const ressalva = promessa[lang].ressalva.toLowerCase();
      let encontrou = false;
      for (const [chave, valor] of Object.entries(DICTS[lang])) {
        if (typeof valor !== 'string') continue;
        for (const frase of frases(valor)) {
          const texto = frase.toLowerCase();
          if (!texto.includes(trecho)) continue;
          encontrou = true;
          assert.ok(
            texto.includes(ressalva),
            `${chave} (${lang}) diz "${promessa[lang].promessa}" sem "${promessa[lang].ressalva}" na mesma ` +
              `frase — ${promessa.porque}`
          );
        }
      }
      // Se a frase sumir de vez do app, o teste vira decorativo sem avisar.
      assert.ok(encontrou, `a frase "${promessa[lang].promessa}" não existe mais em ${lang} — revise este portão`);
    }
  });
}

// ---------------------------------------------------------------------------
// 2. O DADO QUE PASSOU A SAIR DO APARELHO ESTÁ DESCRITO
// ---------------------------------------------------------------------------
// Denúncia e bloqueio persistem no servidor enquanto a conta existe e precisam
// aparecer na Privacidade. A exclusão agora apaga bloqueios e anonimiza as
// denúncias necessárias em relação à conta excluída.
test('a tela de Privacidade descreve denúncia e bloqueio nos três idiomas', () => {
  const tela = fs.readFileSync(path.join(RAIZ, 'screens', 'PrivacyScreen.js'), 'utf8');
  assert.match(tela, /t\('privacy\.use\.report'\)/, 'PrivacyScreen.js não renderiza privacy.use.report');
  for (const lang of LANGUAGES) {
    assert.ok(DICTS[lang]['privacy.use.report'], `privacy.use.report ausente em ${lang}`);
  }
});

test('a tela e a página pública descrevem a Memória Cósmica opcional nos três idiomas', () => {
  const tela = fs.readFileSync(path.join(RAIZ, 'screens', 'PrivacyScreen.js'), 'utf8');
  const politica = fs.readFileSync(path.join(RAIZ, 'public', 'privacidade.html'), 'utf8');
  assert.match(tela, /t\('privacy\.ai\.memory'\)/);
  assert.match(tela, /t\('privacy\.use\.memory'\)/);
  for (const lang of LANGUAGES) {
    assert.ok(DICTS[lang]['privacy.ai.memory'], `privacy.ai.memory ausente em ${lang}`);
    assert.ok(DICTS[lang]['privacy.use.memory'], `privacy.use.memory ausente em ${lang}`);
    assert.match(DICTS[lang]['privacy.use.memory'], /300/);
    assert.match(DICTS[lang]['privacy.use.memory'], /1[.,]600/);
    assert.match(DICTS[lang]['privacy.use.memory'], /480/);
  }
  for (const marker of ['Memória Cósmica', 'Memoria Cósmica', 'Cosmic Memory']) {
    assert.ok(politica.includes(marker), `política não contém ${marker}`);
  }
  assert.equal((politica.match(/300/g) || []).length >= 3, true);
  assert.equal((politica.match(/1[.,]600/g) || []).length >= 3, true);
  assert.equal((politica.match(/480/g) || []).length >= 3, true);
});

// privacy.rights.sharing tem que nomear TODOS os terceiros. A lista fixa de
// quatro nomes que ficava aqui envelheceu sozinha: a ElevenLabs passou a
// receber o texto da leitura (ElevenLabsVoiceProvider.js) e a Vercel a
// hospedar a web, os dois entraram na política pública e o teste continuou
// verde exigindo os mesmos quatro de antes.
//
// Agora o portão lê a própria política: todo terceiro citado na seção "4."
// de public/privacidade.html tem que aparecer também na tela do app, nos três
// idiomas. Assim o próximo terceiro é puxado sozinho.
const POLITICA_PUBLICA = fs.readFileSync(path.join(RAIZ, 'public', 'privacidade.html'), 'utf8');

function terceirosDaPolitica() {
  const secoes = POLITICA_PUBLICA.split(/<h3>\s*4\./).slice(1);
  assert.equal(secoes.length, 3, 'a política pública não tem as três seções "4." de compartilhamento');
  const nomes = new Set();
  for (const secao of secoes) {
    const corpo = secao.split('<h3>')[0];
    // Só os <strong> que abrem um <li>: é esse o formato da lista de
    // terceiros. <strong> de ênfase solto no parágrafo abaixo da lista não é
    // um terceiro e não pode virar nome exigido.
    for (const achado of corpo.matchAll(/<li>\s*<strong>([^<]+)<\/strong>/g)) {
      // "Vercel e infraestrutura técnica:" → "Vercel". O primeiro token é o
      // nome do terceiro; o resto é explicação e muda com o idioma.
      const nome = achado[1].replace(/:\s*$/, '').trim().split(/[\s,]+/)[0];
      if (nome) nomes.add(nome);
    }
  }
  return [...nomes];
}

test('privacy.rights.sharing nomeia todo terceiro citado na política pública', () => {
  const terceiros = terceirosDaPolitica();
  assert.ok(terceiros.length >= 6, `só ${terceiros.length} terceiros extraídos da política — o parser quebrou`);
  for (const lang of LANGUAGES) {
    const valor = DICTS[lang]['privacy.rights.sharing'] || '';
    for (const terceiro of terceiros) {
      assert.ok(valor.includes(terceiro), `privacy.rights.sharing (${lang}) não cita ${terceiro}`);
    }
  }
});

// A Meta ainda não está na política pública, mas já está no código: assim que
// FB_PIXEL_ID e FB_CONVERSIONS_API_TOKEN forem configurados,
// ConversionTrackingProvider.js manda o e-mail em hash e o valor da compra
// para a Conversions API. A tela já a nomeia — este teste impede que ela suma
// antes de a integração ser desligada de verdade.
test('privacy.rights.sharing nomeia a Meta, que recebe a confirmação de compra', () => {
  for (const lang of LANGUAGES) {
    const valor = DICTS[lang]['privacy.rights.sharing'] || '';
    assert.ok(valor.includes('Meta'), `privacy.rights.sharing (${lang}) não cita Meta`);
  }
});

// ---------------------------------------------------------------------------
// 3. A PÁGINA PÚBLICA DE EXCLUSÃO (a que vai no formulário do Google Play)
// ---------------------------------------------------------------------------
// deleteAllCoupleData (lib/coupleData.js) deixa cosmic-journal de fora DE
// PROPÓSITO. A exclusão de conta, por outro lado, agora remove o UGC social e
// os bloqueios e anonimiza denúncias necessárias via SocialAccountCleanup.
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

const CONTRATO_SOCIAL = [
  {
    lang: 'pt',
    apaga: 'Seu perfil da Comunidade, publicações, comentários, curtidas, relações',
    anonima: 'Denúncias ainda necessárias à moderação',
    bloqueios: 'Os bloqueios são apagados.',
    antigo: 'O que você publicou no feed social',
  },
  {
    lang: 'es',
    apaga: 'Tu perfil de la Comunidad, publicaciones, comentarios, Me gusta',
    anonima: 'Los reportes todavía necesarios para moderación',
    bloqueios: 'Los bloqueos se borran.',
    antigo: 'Lo que publicaste en el feed social',
  },
  {
    lang: 'en',
    apaga: 'Your Community profile, posts, comments, likes, follow relationships',
    anonima: 'Reports that are still needed for moderation',
    bloqueios: 'Blocks are deleted.',
    antigo: 'Whatever you posted in the social feed',
  },
];

for (const contrato of CONTRATO_SOCIAL) {
  test(`excluir-conta.html (${contrato.lang}) reflete a exclusão social nova`, () => {
    assert.ok(PAGINA.includes(contrato.apaga), `${contrato.lang}: UGC identificável não aparece no que é apagado`);
    assert.ok(PAGINA.includes(contrato.anonima), `${contrato.lang}: retenção anonimizada de denúncias não foi descrita`);
    assert.ok(PAGINA.includes(contrato.bloqueios), `${contrato.lang}: página não diz que bloqueios são apagados`);
    assert.ok(!PAGINA.includes(contrato.antigo), `${contrato.lang}: ainda diz que o feed sobrevive à exclusão`);
  });
}

test('excluir-conta inclui conteúdo e consentimento da memória nos três idiomas', () => {
  for (const marker of ['Memória Cósmica', 'Memoria Cósmica', 'Cosmic Memory']) {
    assert.ok(PAGINA.includes(marker), `página de exclusão não contém ${marker}`);
  }
});
