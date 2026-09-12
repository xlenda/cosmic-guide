// A MADRE MARIA DENTRO DO COSMIC GUIDE — o que a loja precisa ver.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO FOI REESCRITO (11/09/2026, fusao)
// ===========================================================================
// A versao que veio do Fio Vermelho (test/loja.test.js de C:/tmp/hilo-rojo)
// guardava a configuracao de loja do Madre Maria COMO APP PROPRIO: que o app se
// chamasse "Madre Maria", com bundle app.madremaria e esquema madremaria://, que
// expo-dev-client estivesse instalado, que os cinco perfis do eas.json
// existissem, que lib/api.js apontasse para madre-maria.vercel.app e que o
// Circulo tivesse sair/denunciar/ocultar no cliente, no gateway e no servidor.
//
// Nenhuma dessas cinco coisas descreve o app que existe aqui, e forcar qualquer
// uma seria dano real:
//
//   · o app se chama Cosmic Guide. Renomear para "Madre Maria" trocaria a
//     identidade de um app que ja esta publicado — bundle id e a chave de
//     atualizacao na Play Store e na App Store;
//   · os textos de camera/galeria do Cosmic cobrem SEIS leituras (mao, rosto,
//     pe, pintas, borra, xicara); a regex de la exigia que dissessem "Madre
//     Maria" e so falassem de xicara e palma;
//   · expo-dev-client nao foi instalado de proposito (so serve para build
//     nativo de desenvolvimento) e o eas.json e o do Cosmic;
//   · madremaria/lib/api.js, lib/visao.js e lib/circulo.js NAO VIERAM. Cafe e
//     palma sao UM SO no app (as telas do Cosmic) e o Circulo ficou de fora,
//     ambas decisoes do dono. Um teste que os importa quebra por design.
//
// Apagar o arquivo era a saida facil e a errada: duas das preocupacoes dele
// continuam valendo aqui, e sem portao ficariam sem vigia nenhuma. Sao estas,
// e sao o conteudo deste arquivo agora:
//
//   1. o que a Madre acrescentou ao app.json do Cosmic (expo-video) esta la —
//      sem o plugin, o video da apresentacao nao roda no app da loja e a
//      primeira tela do funil abre em preto, sem erro;
//   2. a Madre embutida NAO faz chamada de rede nenhuma. Isso deixou de ser
//      promessa e virou estrutura quando api.js/visao.js/circulo.js sairam, e e
//      o que sustenta o texto da tela de Privacidade dela. Uma volta silenciosa
//      de fetch aqui dentro transforma aquele texto em mentira.
//
// O que os outros tres guardavam (identidade de loja, eas.json, Circulo) nao
// tem sucessor porque nao tem objeto: sao propriedades do outro app, que segue
// no ar em madre-maria.vercel.app com o portao original intacto la.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const RAIZ_REPO = join(__dirname, '..');
const RAIZ = join(RAIZ_REPO, 'madremaria');

const ler = (rel) => readFileSync(join(RAIZ_REPO, rel), 'utf8');
const app = JSON.parse(ler('app.json')).expo;

/** Todo .js vivo da Madre, recursivo. */
function arquivosDaMadre(dir = RAIZ, achados = []) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) arquivosDaMadre(caminho, achados);
    else if (nome.endsWith('.js')) achados.push(caminho);
  }
  return achados;
}

/** A fonte SEM comentario: os cabecalhos deste projeto citam pelo nome o que o
 *  codigo nao pode fazer ("zero fetch"), e um portao que le comentario acusa a
 *  documentacao da propria regra. */
const semComentario = (fonte) =>
  fonte
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((linha) => {
      const l = linha.trim();
      return !l.startsWith('//') && !l.startsWith('*');
    })
    .join('\n');

test('o plugin que a Madre acrescentou ao app.json esta declarado', () => {
  // expo-video: a apresentacao da Madre Maria e um video (HeyGen, gravado pelo
  // dono). Sem o plugin o modulo nativo nao entra no build e a PRIMEIRA tela do
  // funil abre em preto — no app da loja apenas, nunca na web, que e o pior
  // lugar para o defeito aparecer.
  assert.ok(
    app.plugins.some((p) => p === 'expo-video' || (Array.isArray(p) && p[0] === 'expo-video')),
    'expo-video ausente de app.json.expo.plugins: o video da apresentacao nao roda no nativo'
  );

  // E a dependencia que o plugin configura.
  const pkg = JSON.parse(ler('package.json'));
  assert.ok(pkg.dependencies['expo-video'], 'expo-video ausente de package.json');
});

test('a Madre embutida nao faz chamada de rede nenhuma', () => {
  const culpados = [];
  for (const caminho of arquivosDaMadre()) {
    const codigo = semComentario(readFileSync(caminho, 'utf8'));
    if (/\bfetch\s*\(|XMLHttpRequest|\baxios\b|new WebSocket\(/.test(codigo)) {
      culpados.push(caminho.slice(RAIZ_REPO.length + 1));
    }
  }

  assert.deepEqual(
    culpados,
    [],
    'a Madre embutida voltou a falar com a rede: '
      + `${culpados.join(', ')}. Ela nao tem backend proprio aqui — lib/api.js, `
      + 'lib/visao.js e lib/circulo.js ficaram de fora da fusao, e a tela de '
      + 'Privacidade dela declara isso para quem usa. Se uma chamada precisar '
      + 'existir, o texto daquela tela muda no MESMO commit.'
  );
});

test('o texto de permissao de camera do Cosmic cobre as leituras dele', () => {
  // Nao e regra da Madre: e o portao que impede o texto de permissao de virar
  // ingles ou de encolher para uma leitura so quando alguem mexer nele. A Madre
  // entra aqui porque foi a fusao que trouxe o assunto de volta — cafe e palma
  // agora sao chamados tambem de dentro dela.
  const picker = app.plugins.find((p) => Array.isArray(p) && p[0] === 'expo-image-picker');
  assert.ok(picker, 'expo-image-picker nao esta em plugins');

  const cfg = picker[1];
  assert.equal(cfg.microphonePermission, false, 'o app nao grava audio: microfone tem de ser false');

  for (const texto of [cfg.cameraPermission, cfg.photosPermission]) {
    assert.ok(texto && texto.length > 20, 'texto de permissao vazio ou curto demais');
    assert.doesNotMatch(texto, /\b(the|your|photo|camera)\b/i, 'texto de permissao em ingles');
    assert.match(texto, /borra de café|xícara|mão/i, 'o texto nao diz para que a foto serve');
  }
});
