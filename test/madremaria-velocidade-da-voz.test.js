// A VELOCIDADE DA VOZ (11/09) — "coloquei velocidade caso o lead queira acelerar".
//
// O fecho da leitura profunda tem 4:33 na variante A. Quem le rapido quer
// acelerar em vez de ouvir tudo no ritmo da fala: em 1,5x o fecho vira 3:02, em
// 2x vira 2:17, sem cortar uma palavra.
//
// O que se vigia aqui:
//   · tres velocidades e um ciclo que nunca trava no fim (2 volta para 1);
//   · lixo no disco vira 1 — nunca uma velocidade estranha e nunca um erro;
//   · a preferencia mora na chave 'ajustes', que JA existe e JA esta no Apagar
//     tudo: nenhuma chave nova no disco, nenhuma linha nova na Privacidade;
//   · o botao aplica `shouldCorrectPitch` junto com `playbackRate` — sem isso a
//     voz da Madre Maria vira desenho animado em 2x;
//   · a velocidade e aplicada ANTES do play, e tambem no player que ja esta
//     tocando quando ela troca no meio.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

const ler = (rel) => readFileSync(new URL(rel, __RAIZ_URL), 'utf8');
const AJUSTES = ler('../madremaria/lib/ajustes.js');
const BOTAO = ler('../madremaria/components/BotaoOuvir.js');

/* lib/ajustes.js importa './almacen' sem extensao (o Metro resolve, o Node nao).
 * Para testar a logica PURA — que e o que importa aqui — o disco entra falso. */
async function carregarAjustes() {
  const { writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const caminho = join(tmpdir(), `ajustes-velocidade-${process.pid}.mjs`);
  writeFileSync(
    caminho,
    AJUSTES.replace(
      /^import .*almacen.*$/m,
      'const leerSeguro = async () => null; const guardarSeguro = async () => true;'
    )
  );
  return import(`file://${caminho.replace(/\\/g, '/')}`);
}

test('tres velocidades, ciclo fechado, e lixo vira 1', async () => {
  const m = await carregarAjustes();
  assert.deepEqual([...m.VELOCIDADES], [1, 1.5, 2]);

  // O ciclo volta ao comeco: o botao nunca trava no 2x.
  assert.equal(m.proximaVelocidade(1), 1.5);
  assert.equal(m.proximaVelocidade(1.5), 2);
  assert.equal(m.proximaVelocidade(2), 1);
  // E um valor invalido nao quebra o ciclo: cai no 1 e segue.
  assert.equal(m.proximaVelocidade('abc'), 1.5);

  for (const lixo of [undefined, null, '', 'rapido', 0, -1, 3, 1.25, {}, NaN]) {
    assert.equal(m.normalizarVelocidade(lixo), 1, JSON.stringify(lixo));
  }
  assert.equal(m.normalizarVelocidade(1.5), 1.5);
  assert.equal(m.normalizarVelocidade('2'), 2, 'numero em texto vale (vem assim do JSON antigo)');
});

test('a preferencia vive na chave que ja existe, e o padrao e 1x', async () => {
  const m = await carregarAjustes();
  assert.equal(m.AJUSTES_POR_DEFECTO.velocidade, 1, 'quem nunca tocou ouve no ritmo gravado');
  assert.equal(m.CLAVE_AJUSTES, 'ajustes', 'a velocidade nao pode abrir chave nova no disco');

  // Disco antigo, gravado antes de o campo existir: continua valendo, em 1x.
  assert.deepEqual(m.normalizarAjustes({ haptica: false }), {
    movimiento: 'sistema', haptica: false, velocidade: 1,
  });
  assert.equal(m.normalizarAjustes({ velocidade: 2 }).velocidade, 2);
  assert.equal(m.normalizarAjustes({ velocidade: 99 }).velocidade, 1);
  // E as outras preferencias nao se perdem quando so a velocidade muda.
  assert.match(AJUSTES, /const novo = \{ \.\.\.atual, velocidade:/);
});

test('a chave da velocidade ja esta no Apagar tudo', () => {
  const ajustesTela = ler('../madremaria/screens/AjustesScreen.js');
  const lista = ajustesTela.slice(
    ajustesTela.indexOf('CLAVES_HILO_ROJO'),
    ajustesTela.indexOf(']);', ajustesTela.indexOf('CLAVES_HILO_ROJO'))
  );
  // Ela entra pela constante CLAVE_AJUSTES, que vale 'ajustes' — e e assim que
  // a tela a escreve. O que importa provar e que o valor final esta na lista.
  assert.match(lista, /CLAVE_AJUSTES/, "a velocidade mora em 'ajustes' — e ela tem de sair no Apagar tudo");
  assert.match(ler('../madremaria/lib/ajustes.js'), /CLAVE_AJUSTES = 'ajustes'/);
});

test('o botao corrige o tom, aplica antes do play e tambem no meio', () => {
  // Sem shouldCorrectPitch a voz vira desenho animado em 2x.
  assert.match(BOTAO, /shouldCorrectPitch = true/);
  assert.match(BOTAO, /playbackRate = valor/);

  // Antes do play: quem toca ja ouve na velocidade escolhida.
  const trecho = BOTAO.slice(BOTAO.indexOf('seekTo?.(0)'), BOTAO.indexOf('.play()'));
  assert.match(trecho, /aplicarVelocidade\(player\.current, velocidadeRef\.current\)/);

  // E trocar no meio muda o audio que ja esta tocando.
  const trocar = BOTAO.slice(BOTAO.indexOf('const trocarVelocidade'), BOTAO.indexOf('const alternar'));
  assert.match(trocar, /aplicarVelocidade\(player\.current, nova\)/);
  assert.match(trocar, /guardarVelocidade\(nova\)/);

  // Nunca derruba a leitura: a aplicacao mora dentro de try.
  const aplicar = BOTAO.slice(BOTAO.indexOf('const aplicarVelocidade'), BOTAO.indexOf('const trocarVelocidade'));
  assert.match(aplicar, /try \{/);
  assert.match(aplicar, /\} catch \{/);
});

test('o botao diz a velocidade na tela e no leitor de tela', async () => {
  const { t } = await import('../madremaria/datos/textos.js');
  for (const [chave, esperado] of [['audio.velocidade.1', '1x'], ['audio.velocidade.1.5', '1,5x'], ['audio.velocidade.2', '2x']]) {
    assert.equal(t(chave), esperado);
  }
  assert.match(t('audio.velocidade.rotulo', { valor: '2x' }), /Velocidade da voz: 2x/);
  assert.ok(t('audio.velocidade.ajuda').length > 10);

  // O rotulo visivel e o mesmo que o leitor de tela anuncia.
  assert.match(BOTAO, /accessibilityLabel=\{t\('audio\.velocidade\.rotulo'/);
  assert.match(BOTAO, /\{t\(`audio\.velocidade\.\$\{velocidade\}`\)\}/);
  // Alvo de toque minimo.
  const estilo = BOTAO.slice(BOTAO.indexOf('velocidade: {'));
  assert.match(estilo.slice(0, estilo.indexOf('},')), /minHeight: 44/);
});
