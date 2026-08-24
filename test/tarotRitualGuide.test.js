import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TAROT_GUIDE_FOCUS_IDS_BY_THEME,
  TAROT_GUIDE_SIGN_IDS,
  TAROT_GUIDE_SPREAD_IDS,
  TAROT_GUIDE_THEME_IDS,
  TAROT_RITUAL_GUIDE_VERSION,
  buildTarotRitualGuide,
  getTarotGuideDisclosures,
  getTarotGuideFocuses,
  getTarotGuideSignLens,
  getTarotGuideSpread,
  normalizeTarotGuideLanguage,
  normalizeTarotGuideSign,
  normalizeTarotGuideTheme,
} from '../lib/tarotRitualGuide.js';

const LANGS = ['pt', 'es', 'en'];
const FOCUS_COPY_FIELDS = ['label', 'suggestedQuestion', 'acknowledgement', 'plan', 'cta'];
const SPREAD_POSITION_SHAPES = {
  'past-present-future': [
    ['past', 'context'],
    ['present', 'focus'],
    ['future', 'possibility'],
  ],
  'situation-tension-next-step': [
    ['situation', 'context'],
    ['tension', 'tension'],
    ['next-step', 'action'],
  ],
};

function assertVisibleString(value, message) {
  assert.equal(typeof value, 'string', message);
  assert.ok(value.trim().length > 0, message);
  assert.equal(/\{[^}]+\}/u.test(value), false, `${message}: placeholder nao resolvido`);
}

function allGuideText(lang) {
  const values = [];
  for (const themeId of TAROT_GUIDE_THEME_IDS) {
    for (const focus of getTarotGuideFocuses(themeId, lang)) {
      FOCUS_COPY_FIELDS.forEach((field) => values.push(focus[field]));
    }
  }
  for (const spreadId of TAROT_GUIDE_SPREAD_IDS) {
    const spread = getTarotGuideSpread(spreadId, lang);
    values.push(spread.label, spread.description);
    spread.positions.forEach((position) => values.push(position.label, position.prompt));
  }
  TAROT_GUIDE_SIGN_IDS.forEach((signId) => {
    const sign = getTarotGuideSignLens(signId, lang);
    values.push(sign.label, sign.text);
  });
  values.push(...Object.values(getTarotGuideDisclosures(lang)));
  return values.join('\n');
}

test('contrato usa cinco temas, tres focos por tema, duas tiragens e doze signos', () => {
  assert.equal(TAROT_RITUAL_GUIDE_VERSION, 1);
  assert.deepEqual(TAROT_GUIDE_THEME_IDS, ['love', 'career', 'money', 'energy', 'wellbeing']);
  assert.deepEqual(TAROT_GUIDE_SPREAD_IDS, ['past-present-future', 'situation-tension-next-step']);
  assert.equal(TAROT_GUIDE_SIGN_IDS.length, 12);
  assert.equal(new Set(TAROT_GUIDE_SIGN_IDS).size, 12);

  const focusIds = Object.values(TAROT_GUIDE_FOCUS_IDS_BY_THEME).flat();
  assert.equal(focusIds.length, 15);
  assert.equal(new Set(focusIds).size, 15, 'IDs de foco devem ser estaveis e exclusivos');
});

test('normalizadores aceitam nomes usados pelo app sem inventar tema ou signo', () => {
  assert.equal(normalizeTarotGuideLanguage('pt-BR'), 'pt');
  assert.equal(normalizeTarotGuideLanguage('es-MX'), 'es');
  assert.equal(normalizeTarotGuideLanguage('en-US'), 'en');
  assert.equal(normalizeTarotGuideLanguage('idioma-invalido'), 'pt');

  assert.equal(normalizeTarotGuideTheme('Amor'), 'love');
  assert.equal(normalizeTarotGuideTheme('Carreira'), 'career');
  assert.equal(normalizeTarotGuideTheme('Dinero'), 'money');
  assert.equal(normalizeTarotGuideTheme('ENERGÍA'), 'energy');
  assert.equal(normalizeTarotGuideTheme('Bem-estar'), 'wellbeing');
  assert.equal(normalizeTarotGuideTheme('tema-inexistente'), null);

  assert.equal(normalizeTarotGuideSign('Touro'), 'taurus');
  assert.equal(normalizeTarotGuideSign('Géminis'), 'gemini');
  assert.equal(normalizeTarotGuideSign('Escorpião'), 'scorpio');
  assert.equal(normalizeTarotGuideSign('Aquarius'), 'aquarius');
  assert.equal(normalizeTarotGuideSign('signo-inexistente'), null);
});

test('cada idioma entrega cinco temas por tres focos completos e deterministas', () => {
  for (const lang of LANGS) {
    const idsSeen = [];
    const copyByField = Object.fromEntries(FOCUS_COPY_FIELDS.map((field) => [field, []]));

    for (const themeId of TAROT_GUIDE_THEME_IDS) {
      const first = getTarotGuideFocuses(themeId, lang);
      const second = getTarotGuideFocuses(themeId, lang);
      assert.deepEqual(first, second, `${lang}/${themeId}: chamada deve ser determinista`);
      assert.equal(first.length, 3, `${lang}/${themeId}: deve ter tres focos`);
      assert.deepEqual(first.map(({ id }) => id), TAROT_GUIDE_FOCUS_IDS_BY_THEME[themeId]);

      for (const focus of first) {
        idsSeen.push(focus.id);
        assert.ok(TAROT_GUIDE_SPREAD_IDS.includes(focus.spreadId), `${focus.id}: tiragem invalida`);
        for (const field of FOCUS_COPY_FIELDS) {
          assertVisibleString(focus[field], `${lang}/${themeId}/${focus.id}/${field}`);
          copyByField[field].push(focus[field]);
        }
        assert.equal(Object.isFrozen(focus), true, `${focus.id}: contrato deve ser imutavel`);
      }
    }

    assert.equal(idsSeen.length, 15);
    for (const field of FOCUS_COPY_FIELDS) {
      assert.equal(
        new Set(copyByField[field]).size,
        15,
        `${lang}: cada resposta deve mudar ${field}`,
      );
    }
  }
});

test('as duas tiragens preservam a mesma estrutura semantica em PT, ES e EN', () => {
  for (const spreadId of TAROT_GUIDE_SPREAD_IDS) {
    for (const lang of LANGS) {
      const spread = getTarotGuideSpread(spreadId, lang);
      assert.equal(spread.id, spreadId);
      assertVisibleString(spread.label, `${lang}/${spreadId}/label`);
      assertVisibleString(spread.description, `${lang}/${spreadId}/description`);
      assert.deepEqual(
        spread.positions.map(({ id, role }) => [id, role]),
        SPREAD_POSITION_SHAPES[spreadId],
      );
      assert.equal(spread.positions.length, 3);
      for (const position of spread.positions) {
        assertVisibleString(position.label, `${lang}/${spreadId}/${position.id}/label`);
        assertVisibleString(position.prompt, `${lang}/${spreadId}/${position.id}/prompt`);
        if (spreadId === 'situation-tension-next-step') {
          assertVisibleString(position.interpretationFrame, `${lang}/${spreadId}/${position.id}/interpretationFrame`);
        }
        assert.equal(Object.isFrozen(position), true);
      }
    }
  }

  assert.equal(getTarotGuideSpread('spread-inexistente', 'pt'), null);
});

test('as doze lentes de signo sao completas, distintas e nunca caem em Aries', () => {
  for (const lang of LANGS) {
    const texts = TAROT_GUIDE_SIGN_IDS.map((signId) => {
      const lens = getTarotGuideSignLens(signId, lang);
      assert.equal(lens.id, signId);
      assertVisibleString(lens.label, `${lang}/${signId}/label`);
      assertVisibleString(lens.text, `${lang}/${signId}/text`);
      return lens.text;
    });
    assert.equal(new Set(texts).size, 12, `${lang}: lentes de signo nao podem ser repetidas`);
  }

  assert.equal(getTarotGuideSignLens('Ofiuco', 'pt'), null);
  assert.equal(normalizeTarotGuideSign('Ofiuco'), null);
});

test('roteiro liga a resposta a pergunta, plano, CTA, tiragem e lente escolhidos', () => {
  for (const lang of LANGS) {
    for (const themeId of TAROT_GUIDE_THEME_IDS) {
      const guides = TAROT_GUIDE_FOCUS_IDS_BY_THEME[themeId].map((focusId) => (
        buildTarotRitualGuide({ themeId, focusId, sign: 'Libra', lang })
      ));

      guides.forEach((guide, index) => {
        const focusId = TAROT_GUIDE_FOCUS_IDS_BY_THEME[themeId][index];
        assert.equal(guide.version, TAROT_RITUAL_GUIDE_VERSION);
        assert.equal(guide.lang, lang);
        assert.equal(guide.selection.themeId, themeId);
        assert.equal(guide.selection.focusId, focusId);
        assert.equal(guide.selection.spreadId, guide.focus.spreadId);
        assert.equal(guide.spread.id, guide.focus.spreadId);
        assert.equal(guide.selection.signId, 'libra');
        assert.equal(guide.signLens.id, 'libra');
        assert.equal(Object.isFrozen(guide), true);
        assert.deepEqual(
          guide,
          buildTarotRitualGuide({ themeId, focusId, sign: 'Libra', lang }),
          `${lang}/${themeId}/${focusId}: resolucao deve ser determinista`,
        );
      });

      for (const field of FOCUS_COPY_FIELDS) {
        assert.equal(new Set(guides.map((guide) => guide.focus[field])).size, 3);
      }
    }
  }
});

test('entrada invalida falha de modo explicito e contexto livre nao vaza para o guia', () => {
  assert.equal(buildTarotRitualGuide({ themeId: 'desconhecido', focusId: 'new-bond' }), null);
  assert.equal(buildTarotRitualGuide({ themeId: 'love', focusId: 'direction-purpose' }), null);
  assert.equal(buildTarotRitualGuide({ themeId: 'love', focusId: 'inexistente' }), null);
  assert.deepEqual(getTarotGuideFocuses('desconhecido', 'pt'), []);

  const secret = 'SEGREDO-DO-USUARIO-4928';
  const guide = buildTarotRitualGuide({
    themeId: 'love',
    focusId: 'new-bond',
    sign: 'Ofiuco',
    lang: 'pt',
    question: secret,
    notes: secret,
  });
  assert.equal(guide.signLens, null);
  assert.equal(guide.selection.signId, null);
  assert.equal(JSON.stringify(guide).includes(secret), false);
});

test('pacotes PT, ES e EN tem paridade, sem texto vazio nem fallback integral', () => {
  const textByLang = Object.fromEntries(LANGS.map((lang) => [lang, allGuideText(lang)]));
  LANGS.forEach((lang) => assertVisibleString(textByLang[lang], `${lang}/all-copy`));
  assert.notEqual(textByLang.pt, textByLang.es);
  assert.notEqual(textByLang.pt, textByLang.en);
  assert.notEqual(textByLang.es, textByLang.en);

  const sampleIds = { themeId: 'career', focusId: 'decision-transition', sign: 'Capricórnio' };
  const shapes = LANGS.map((lang) => {
    const guide = buildTarotRitualGuide({ ...sampleIds, lang });
    return {
      selection: guide.selection,
      positionIds: guide.spread.positions.map(({ id }) => id),
      positionRoles: guide.spread.positions.map(({ role }) => role),
      disclosureKeys: Object.keys(guide.disclosures),
    };
  });
  assert.deepEqual(shapes[0], shapes[1]);
  assert.deepEqual(shapes[0], shapes[2]);
});

test('copy declara metodo e limites sem prometer IA, destino, saude ou previsao certa', () => {
  const disclosureExpectations = {
    pt: {
      method: /não é .*\bIA\b/iu,
      randomness: /sorteio continua aleatório/iu,
      sign: /sem alterar cartas ou significados/iu,
      future: /nunca uma garantia/iu,
      wellbeing: /não substitui orientação médica/iu,
    },
    es: {
      method: /no es .*\bIA\b/iu,
      randomness: /sorteo continúa siendo aleatorio/iu,
      sign: /sin alterar cartas ni significados/iu,
      future: /nunca una garantía/iu,
      wellbeing: /no reemplaza la atención médica/iu,
    },
    en: {
      method: /not an AI-generated response/iu,
      randomness: /draw remains random/iu,
      sign: /does not alter cards or meanings/iu,
      future: /never a guarantee/iu,
      wellbeing: /does not replace medical/iu,
    },
  };

  const unsafeClaims = [
    /\bdiagnostica\b/iu,
    /\bdiagnoses\b/iu,
    /\bcura(?:r|rá)?\b/iu,
    /\bcures\b/iu,
    /\btrata(?:r|rá)? (?:doenças|enfermidades|ansiedade|depressão|depresión)\b/iu,
    /\btreats (?:illness|anxiety|depression)\b/iu,
    /\bvai acontecer\b/iu,
    /\bsucederá\b/iu,
    /\bwill happen\b/iu,
    /\bdestino certo\b/iu,
    /\bfate is fixed\b/iu,
    /\bgarante que\b/iu,
    /\bgarantiza que\b/iu,
    /\bguarantees that\b/iu,
    /\b(?:tiragem|tirada|spread) (?:clássica|clásica|classic|tradicional|traditional|milenar|milenaria|ancient)\b/iu,
  ];

  for (const lang of LANGS) {
    const disclosures = getTarotGuideDisclosures(lang);
    for (const [key, pattern] of Object.entries(disclosureExpectations[lang])) {
      assert.match(disclosures[key], pattern, `${lang}/${key}: limite precisa ser explicito`);
    }
    const text = allGuideText(lang);
    unsafeClaims.forEach((pattern) => assert.doesNotMatch(text, pattern, `${lang}: promessa insegura`));
  }
});
