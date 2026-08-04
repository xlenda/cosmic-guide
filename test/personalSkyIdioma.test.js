// O "CÉU DE HOJE" SAÍA 100% EM PORTUGUÊS nos apps em espanhol e inglês —
// achado da auditoria de 02/08/2026. personalSkyToday montava a frase a partir
// de dois objetos em PT puro (ASPECT_MEANING e TEMPO_INFO) e nem recebia
// `lang`. É o card mais lido do app: a pessoa abre a Home e é a primeira coisa
// pessoal que ela vê, todo dia.
//
// Estes testes travam as três línguas E o contrato que a correção não pode
// quebrar: as CHAVES continuam em português, porque lib/transitoFase.js casa
// por elas do outro lado (transitPlanet/natalPlanet/aspectType).
import test from 'node:test';
import assert from 'node:assert/strict';
import { personalSkyToday } from '../lib/personalSky.js';
import { textoDoTransito, _PARA_TESTES } from '../lib/traducoes/personalSky.js';

const NASCIMENTO = { date: '1990-03-15', time: '14:30', city: null };

test('as três línguas devolvem frases DIFERENTES para o mesmo trânsito', () => {
  const args = { aspectType: 'Trígono', planetaTransito: 'Vênus', planetaNatal: 'Lua', tempo: 'rapido' };
  const pt = textoDoTransito({ ...args, lang: 'pt' });
  const es = textoDoTransito({ ...args, lang: 'es' });
  const en = textoDoTransito({ ...args, lang: 'en' });

  assert.notEqual(pt, es, 'espanhol não pode ser o texto português');
  assert.notEqual(pt, en, 'inglês não pode ser o texto português');
  assert.notEqual(es, en);

  // O nome do planeta viaja junto — era metade do vazamento.
  assert.match(es, /Venus/, 'es: Vênus vira Venus');
  assert.match(es, /tu Luna natal/, 'es: Lua vira Luna, e depois de "tu" vai SEM artigo');
  assert.match(en, /Venus/, 'en: Vênus vira Venus');
  assert.match(en, /your natal Moon/, 'en: Lua vira Moon, e depois de "your" vai sem artigo');
});

test('a forma do planeta muda com a posição na frase — sujeito leva artigo, possessivo não', () => {
  // O primeiro jeito que escrevi isto produzia "tu el Sol natal" e "your the
  // Moon": a forma com artigo servia pros dois buracos do modelo. São dois.
  const comoSujeito = textoDoTransito({
    aspectType: 'Quadratura', planetaTransito: 'Sol', planetaNatal: 'Marte', tempo: 'rapido', lang: 'es',
  });
  assert.match(comoSujeito, /^el Sol /, 'es: como sujeito, o Sol leva artigo');

  const comoNatal = textoDoTransito({
    aspectType: 'Quadratura', planetaTransito: 'Marte', planetaNatal: 'Sol', tempo: 'rapido', lang: 'es',
  });
  assert.match(comoNatal, /tu Sol natal/, 'es: depois de "tu", sem artigo');
  assert.doesNotMatch(comoNatal, /tu el |your the /, 'nunca artigo depois de possessivo');

  const ingles = textoDoTransito({
    aspectType: 'Quadratura', planetaTransito: 'Lua', planetaNatal: 'Lua', tempo: 'rapido', lang: 'en',
  });
  assert.match(ingles, /^the Moon /, 'en: como sujeito, "the Moon"');
  assert.match(ingles, /your natal Moon/, 'en: como natal, "your natal Moon"');
});

test('o português concorda em gênero — a Lua é o único planeta feminino da lista', () => {
  // "se soma ao seu Lua natal" era o que o app dizia desde sempre: o código
  // antigo enfiava o nome cru do planeta depois de um "seu" fixo.
  const lua = textoDoTransito({
    aspectType: 'Conjunção', planetaTransito: 'Marte', planetaNatal: 'Lua', tempo: 'rapido', lang: 'pt',
  });
  assert.match(lua, /à sua Lua natal/, 'Lua é feminina: "à sua Lua natal"');
  assert.doesNotMatch(lua, /ao seu Lua|a sua Lua natal —/, 'nada de "ao seu Lua"');

  const sol = textoDoTransito({
    aspectType: 'Conjunção', planetaTransito: 'Marte', planetaNatal: 'Sol', tempo: 'rapido', lang: 'pt',
  });
  assert.match(sol, /ao seu Sol natal/, 'os outros nove seguem masculinos');

  // O Sextil usa "pro/pra", que também flexiona.
  const sextilLua = textoDoTransito({
    aspectType: 'Sextil', planetaTransito: 'Vênus', planetaNatal: 'Lua', tempo: 'rapido', lang: 'pt',
  });
  assert.match(sextilLua, /pra sua Lua natal/);
});

test('nenhum resto de português escapa para es/en', () => {
  // Palavras que só existem em português e que estavam na frase antiga.
  // "natal" NÃO entra: é palavra legítima em espanhol ("tu Luna natal") e em
  // inglês ("your natal Sun"). A marca tem que ser o que só existe em PT.
  const marcasPt = /\b(seu|sua|hoje|destas|deste|trânsito|não|nessa|essa|pra|pro)\b/i;
  for (const lang of ['es', 'en']) {
    for (const aspecto of ['Conjunção', 'Sextil', 'Quadratura', 'Trígono', 'Oposição']) {
      for (const tempo of ['rapido', 'medio', 'lento']) {
        const frase = textoDoTransito({
          aspectType: aspecto,
          planetaTransito: 'Saturno',
          planetaNatal: 'Sol',
          tempo,
          lang,
        });
        assert.ok(frase, `${lang}/${aspecto}/${tempo} não pode ser nulo`);
        assert.doesNotMatch(frase, marcasPt, `${lang}/${aspecto}/${tempo} vazou português: ${frase}`);
      }
    }
  }
});

test('os 5 aspectos e as 3 camadas de tempo existem nas 3 línguas', () => {
  const { TEMPO_TEXTO, ASPECTO_TEXTO } = _PARA_TESTES;
  for (const lang of ['pt', 'es', 'en']) {
    assert.deepEqual(
      Object.keys(ASPECTO_TEXTO[lang]).sort(),
      ['Conjunção', 'Oposição', 'Quadratura', 'Sextil', 'Trígono'].sort(),
      `${lang}: faltou aspecto`
    );
    assert.deepEqual(Object.keys(TEMPO_TEXTO[lang]).sort(), ['lento', 'medio', 'rapido'], `${lang}: faltou camada`);
  }
});

test('a ressalva do trânsito lento existe nas 3 línguas — é ela que impede ler capítulo como notícia', () => {
  const { TEMPO_TEXTO } = _PARA_TESTES;
  assert.equal(TEMPO_TEXTO.pt.rapido.nota, '', 'trânsito rápido não carrega ressalva');
  for (const lang of ['pt', 'es', 'en']) {
    assert.ok(TEMPO_TEXTO[lang].lento.nota.length > 60, `${lang}: a ressalva do lento não pode ser resumida`);
    assert.ok(TEMPO_TEXTO[lang].medio.nota.length > 30, `${lang}: a ressalva do médio sumiu`);
  }
});

test('aspecto ou planeta desconhecido devolve null — nunca {t} cru na tela', () => {
  assert.equal(textoDoTransito({ aspectType: 'Quintil', planetaTransito: 'Sol', planetaNatal: 'Lua', tempo: 'rapido', lang: 'pt' }), null);
  assert.equal(textoDoTransito({ aspectType: 'Sextil', planetaTransito: 'Quíron', planetaNatal: 'Lua', tempo: 'rapido', lang: 'pt' }), null);
});

test('língua fora das três cai no português, como no resto do app', () => {
  const args = { aspectType: 'Sextil', planetaTransito: 'Marte', planetaNatal: 'Sol', tempo: 'rapido' };
  assert.equal(textoDoTransito({ ...args, lang: 'fr' }), textoDoTransito({ ...args, lang: 'pt' }));
  assert.equal(textoDoTransito({ ...args, lang: undefined }), textoDoTransito({ ...args, lang: 'pt' }));
});

test('o motor inteiro respeita lang, e as chaves seguem em PT (transitoFase casa por elas)', () => {
  const es = personalSkyToday(NASCIMENTO, 3, 'es');
  assert.ok(Array.isArray(es) && es.length > 0, 'precisa haver trânsito nesse nascimento');
  for (const a of es) {
    assert.ok(a.text, 'todo aspecto sai com texto');
    assert.doesNotMatch(a.text, /\b(seu|sua|hoje|trânsito|não|pra|pro)\b/i, `vazou PT: ${a.text}`);
    // O contrato com lib/transitoFase.js: chave em português, sempre.
    assert.match(a.aspectType, /^(Conjunção|Sextil|Quadratura|Trígono|Oposição)$/);
    assert.match(a.transitPlanet, /^(Sol|Lua|Mercúrio|Vênus|Marte|Júpiter|Saturno|Urano|Netuno|Plutão)$/);
    assert.match(a.natalPlanet, /^(Sol|Lua|Mercúrio|Vênus|Marte|Júpiter|Saturno|Urano|Netuno|Plutão)$/);
  }
});

test('o padrão sem lang continua português — nada muda pra quem já usava', () => {
  const semLang = personalSkyToday(NASCIMENTO, 3);
  const comPt = personalSkyToday(NASCIMENTO, 3, 'pt');
  assert.deepEqual(semLang.map((a) => a.text), comPt.map((a) => a.text));
});
