#!/usr/bin/env node
// scripts/juntar-tempos-idioma.js — junta os <id>.<lang>.tempos.json soltos que
// chegam do servidor num arquivo por idioma, no molde do portugues.
//
// POR QUE UM ARQUIVO POR IDIOMA, e nao 22 soltos: datos/profunda.js importa os
// tempos com `import ... with { type: 'json' }`, que o Metro so resolve com
// caminho LITERAL. 22 arquivos seriam 22 linhas de import escritas a mao e mais
// 22 a cada gravacao nova. Um por idioma e uma linha que nunca mais muda — e e
// exatamente a forma que o portugues ja tem em datos/profunda-tempos.json.
//
//   node scripts/juntar-tempos-idioma.js
//
// Le  assets/madremaria/audio/<id>.<lang>.tempos.json
// Escreve madremaria/datos/profunda-tempos.<lang>.json  -> { "<id>": {duracao, trechos} }
//
// Roda de novo sempre que chegar audio novo: reescreve o arquivo inteiro a
// partir do que esta na pasta, entao o resultado nunca fica com sobra de uma
// gravacao anterior. Idioma sem nenhum arquivo vira `{}` — arquivo vazio e
// honesto: o import resolve e trechosDe degrada para paragrafo sem tempo.
//
// SO A LEITURA PROFUNDA ACENDE O TEXTO, E ISSO NAO E LACUNA (medido 12/09):
// o portugues tem 30 audios e tempos para 10 — apenas os blocos da profunda.
// Os outros 20 (rituais, cartas do lenormand, anuncios) sempre so TOCARAM, e a
// tela ja mostra o texto inteiro do lado. ES e EN ficaram com 11 cada (os 10
// blocos + entrada-apresentacao), ou seja iguais ao PT e um a mais.
// Quem for cobrar "faltam tempos para os outros 16" esta comparando com um
// portugues que tambem nao os tem. Se um dia forem gravados com realce, e
// feature nova nos TRES idiomas, nao conserto de traducao.
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const AUDIO = path.join(RAIZ, 'assets', 'madremaria', 'audio');
const DATOS = path.join(RAIZ, 'madremaria', 'datos');
const IDIOMAS = ['es', 'en'];

for (const lang of IDIOMAS) {
  const sufixo = `.${lang}.tempos.json`;
  const nomes = fs.existsSync(AUDIO)
    ? fs.readdirSync(AUDIO).filter((n) => n.endsWith(sufixo)).sort()
    : [];

  const tabela = {};
  for (const nome of nomes) {
    const id = nome.slice(0, -sufixo.length);
    const bruto = JSON.parse(fs.readFileSync(path.join(AUDIO, nome), 'utf8'));
    // Só o que o app usa. Campo a mais do gerador (voz, modelo, data) fica de
    // fora de proposito: o arquivo do app nao vira despejo do pipeline.
    tabela[id] = { duracao: bruto.duracao, trechos: bruto.trechos };
    console.log(`${lang}: ${id} — ${bruto.trechos?.length ?? 0} frases, ${bruto.duracao}s`);
  }

  const destino = path.join(DATOS, `profunda-tempos.${lang}.json`);
  // Escrever em temporario e renomear: um Ctrl-C no meio do write deixaria um
  // JSON pela metade que quebra o build inteiro.
  const tmp = `${destino}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(tabela, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, destino);
  console.log(`-> ${path.relative(RAIZ, destino)}: ${Object.keys(tabela).length} audio(s)\n`);
}
