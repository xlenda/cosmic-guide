// Os disclaimers das telas não podem pedir emprestada autoridade CLÍNICA.
//
// Por que este arquivo existe: em 31/07/2026 o disclaimer de screens/DreamScreen
// abria com "Séculos depois, o psiquiatra Jung levou os sonhos a sério de novo"
// — e duas linhas abaixo dizia "Não é diagnóstico psicológico nem previsão".
// Pôr um médico psiquiatra como aval na abertura empresta consultório para a
// leitura por IA, que é exatamente o que a ressalva seguinte tenta negar. Nenhuma
// varredura pegava: as listas de test/grounding.test.js, test/jornada.test.js e
// test/calendarioCosmico.test.js mordem o dicionário e lib/, e estes disclaimers
// moram em screens/ — fora do alcance delas.
//
// A regra é de FRASE, não de arquivo: a palavra clínica é permitida quando a
// frase existe para MANDAR procurar ajuda de verdade ou para negar que o app
// substitui alguma ("Não substitui exame médico", de PalmScreen). Proibida
// quando serve de credencial.
//
// 04/08/2026: a varredura passou a morder também os disclaimers que moram no
// DICIONÁRIO. O de screens/DreamScreen.js — o que criou este arquivo — saiu de
// dentro da tela e virou 'dream.disclaimer' em lib/i18n.js, porque era literal
// em português e quem lia o app em espanhol ou inglês recebia a ressalva mais
// importante do app na língua errada. Se a varredura continuasse só em
// screens/, a mudança de casa teria APAGADO a proteção sem nenhum teste
// vermelho. Agora ela cobre as duas casas, e nos três idiomas.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { LANGUAGES, _DICTS_FOR_TESTS } = require('../lib/i18n.js');

const SCREENS = path.join(__dirname, '..', 'screens');

// Credencial clínica: o título que transforma uma citação histórica em aval
// médico. Não entram aqui nomes próprios nem escolas de pensamento — o problema
// é o crachá, não o autor.
const CREDENCIAL_CLINICA = [/psiquiatra/i, /psic[óo]log/i, /\bm[ée]dic[oa]s?\b/i, /cl[íi]nic/i];

// A frase que MANDA procurar ajuda, ou que nega que o app faz o papel de quem
// dá — essa precisa da palavra para funcionar.
const MANDA_PROCURAR_AJUDA = /n[ãa]o substitui|n[ãa]o constitui|n[ãa]o [ée] (diagn[óo]stico|conselho|aconselhamento)|procure/i;

const STR = String.raw`'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"`;
const CADEIA = new RegExp(String.raw`(?:\bDISCLAIMER\b\s*=|\bdisclaimer\s*:)\s*((?:${STR})(?:\s*\+\s*(?:${STR}))*)`, 'g');

// Devolve [ [origem, texto], ... ] com todo disclaimer literal das telas E toda
// chave *.disclaimer do dicionário, nos três idiomas. As duas casas do mesmo
// tipo de frase, varridas pela mesma régua.
function disclaimersDeTela() {
  const out = [];
  for (const f of fs.readdirSync(SCREENS).filter((f) => f.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(SCREENS, f), 'utf8');
    let m;
    let n = 0;
    while ((m = CADEIA.exec(src))) {
      const texto = [...m[1].matchAll(new RegExp(STR, 'g'))].map((s) => s[0].slice(1, -1)).join('');
      n += 1;
      out.push([`${f}#${n}`, texto]);
    }
  }
  for (const lang of LANGUAGES) {
    const dict = _DICTS_FOR_TESTS[lang];
    for (const chave of Object.keys(dict)) {
      if (!/(^|\.)disclaimer$/.test(chave)) continue;
      out.push([`i18n:${lang}/${chave}`, dict[chave]]);
    }
  }
  return out;
}

test('a varredura acha os disclaimers de tela (se ela achar zero, ela não protege ninguém)', () => {
  const achados = disclaimersDeTela();
  assert.ok(
    achados.length >= 4,
    `só ${achados.length} disclaimer(s) encontrado(s) em screens/ — o parser quebrou ou o campo mudou de nome`
  );
  for (const [origem, texto] of achados) {
    assert.ok(texto.length > 40, `${origem}: disclaimer curto demais pra ser um disclaimer (${texto.length} chars)`);
  }
});

test('nenhum disclaimer de tela usa credencial clínica como aval', () => {
  const violacoes = [];
  for (const [origem, texto] of disclaimersDeTela()) {
    // Frase a frase: a exceção é da frase que manda procurar ajuda, não do
    // disclaimer inteiro — senão bastaria ter um "não substitui exame médico"
    // no fim para liberar um "o psiquiatra fulano" na abertura.
    for (const frase of texto.split(/(?<=[.;!?])\s+/)) {
      if (MANDA_PROCURAR_AJUDA.test(frase)) continue;
      for (const re of CREDENCIAL_CLINICA) {
        const m = frase.match(re);
        if (m) violacoes.push(`${origem}: "${m[0]}" em "${frase.trim()}"`);
      }
    }
  }
  assert.deepEqual(
    violacoes,
    [],
    `credencial clínica emprestada como aval num disclaimer de tela:\n${violacoes.join('\n')}`
  );
});

test('a varredura MORDE — a frase que criou esta regra é pega, e a que é legítima não', () => {
  const DEVE_PEGAR = [
    'Séculos depois, o psiquiatra Jung levou os sonhos a sério de novo.',
    'Método validado pelo psicólogo que criou a escala.',
    'Baseado em estudos clínicos.',
    'Escrito por uma equipe médica.',
  ];
  for (const frase of DEVE_PEGAR) {
    const pego = MANDA_PROCURAR_AJUDA.test(frase) ? null : CREDENCIAL_CLINICA.find((re) => re.test(frase));
    assert.ok(pego, `a varredura deixou passar a credencial em: "${frase}"`);
  }

  const NAO_PODE_PEGAR = [
    'Não substitui exame médico nem garante resultados.',
    'Não é diagnóstico psicológico nem previsão.',
    'Se algo doer, procure um médico.',
    'Séculos depois, Carl Jung (1875-1961) voltou a tratá-los como material simbólico.',
  ];
  for (const frase of NAO_PODE_PEGAR) {
    const pego = MANDA_PROCURAR_AJUDA.test(frase) ? null : CREDENCIAL_CLINICA.find((re) => re.test(frase));
    assert.ok(!pego, `falso positivo em "${frase}" pela regra ${pego}`);
  }
});
