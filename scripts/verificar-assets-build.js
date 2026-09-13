// Portão: os ícones do app não podem sumir de novo em produção.
//
// O Expo nomeia os assets hasheados reaproveitando o caminho original de
// node_modules (dist/assets/node_modules/@expo/vector-icons/.../Ionicons.ttf)
// e a Vercel IGNORA por padrão qualquer pasta chamada "node_modules" em
// qualquer lugar da árvore — comportamento hard-coded do CLI, não dá pra
// desligar via .vercelignore. Por isso deploy-vercel.sh renomeia a pasta pra
// _modules e reescreve as referências nos .js.
//
// Esse passo é frágil porque é manual: quando a build é montada à mão (a trava
// EBUSY do Windows em dist/ já forçou isso), dá pra pular o rename e publicar
// um app com TODO ícone virando quadrado vazio — aconteceu em 17/07/2026 e de
// novo em 13/09/2026. Este módulo transforma o passo em invariante conferida.
//
// POR QUE NÃO BASTA PEDIR A FONTE POR HTTP: o vercel.json (e o servidor local
// do e2e) tem fallback SPA — um .ttf inexistente devolve o index.html com
// status 200, não 404. Foi exatamente assim que o defeito passou despercebido.
// A conferência tem que ser no DISCO, olhando o arquivo.
const fs = require('fs');
const path = require('path');

// Anda a árvore juntando arquivos com as extensões pedidas.
function listar(dir, exts, saida = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const completo = path.join(dir, item.name);
    if (item.isDirectory()) listar(completo, exts, saida);
    else if (exts.includes(path.extname(item.name))) saida.push(completo);
  }
  return saida;
}

// raiz = a pasta que contém cosmic-guide/index.html (no deploy: deploy-vercel),
// ou a própria dist/. Devolve a lista de problemas — vazia significa build sã.
function verificarAssets(raiz) {
  const problemas = [];
  const base = fs.existsSync(path.join(raiz, 'cosmic-guide', 'index.html'))
    ? path.join(raiz, 'cosmic-guide')
    : raiz;

  if (!fs.existsSync(base)) return [`build não encontrada: ${base}`];

  // 1. Nenhuma pasta chamada node_modules pode ter sobrado dentro de assets/ —
  //    a Vercel descartaria a pasta inteira no upload.
  const assets = path.join(base, 'assets');
  if (fs.existsSync(assets) && fs.existsSync(path.join(assets, 'node_modules'))) {
    problemas.push('assets/node_modules/ existe na build — a Vercel ignora essa pasta e os ícones somem');
  }

  // 2. Nenhum .js pode ainda apontar pra assets/node_modules/ — se o mv rodou
  //    mas o sed não, o arquivo subiu com outro nome e a referência quebrou.
  const jsDir = path.join(base, '_expo', 'static', 'js');
  if (fs.existsSync(jsDir)) {
    for (const arquivo of listar(jsDir, ['.js'])) {
      if (fs.readFileSync(arquivo, 'utf8').includes('assets/node_modules/')) {
        problemas.push(`${path.relative(base, arquivo)} ainda referencia assets/node_modules/`);
      }
    }
  }

  // 3. Todo ARQUIVO que o bundle pede tem que existir mesmo no disco, no caminho
  //    exato pedido. É esta checagem que pega o defeito real: o .ttf ausente.
  //
  //    Por que não só .ttf (achado do conferente, 13/09/2026): a mesma pasta
  //    perigosa guarda imagens de verdade — as setas de voltar do
  //    @react-navigation (back-icon.png, back-icon-mask.png). Conferindo só
  //    fonte, apagar uma dessas passava VERDE com o app quebrado: o mesmo tipo
  //    de buraco que deixou o bug dos ícones escapar duas vezes. O portão
  //    confere o que o bundle PEDE, seja qual for a extensão.
  const referenciados = new Set();
  if (fs.existsSync(jsDir)) {
    for (const arquivo of listar(jsDir, ['.js'])) {
      const texto = fs.readFileSync(arquivo, 'utf8');
      //    O `\.?\/` na captura existe pra DESCARTAR o app.json embutido no
      //    bundle, que carrega "favicon": "./assets/favicon.png" — config lida
      //    pelo Expo ao GERAR a build, não arquivo que o app pede rodando.
      //    Esses quatro (icon, splash-icon, favicon, adaptive-icon) nunca
      //    existem em dist/assets/, e acusá-los faria o portão gritar em toda
      //    build sã. A referência de verdade é absoluta (/cosmic-guide/assets/…),
      //    então é o `./` inicial que separa config de pedido real.
      const padrao = /(\.?\/)?assets\/[A-Za-z0-9_@./-]*\.(?:ttf|otf|woff2?|png|jpe?g|gif|svg|webp)/g;
      for (const achado of texto.matchAll(padrao)) {
        if (achado[1] === './') continue; // config do app.json, não pedido em runtime
        referenciados.add(achado[0].replace(/^\//, ''));
      }
    }
  }
  // A fonte dos ícones é o canário: se ela sumir do bundle, todo glifo do app
  // vira quadrado vazio, e nenhuma outra checagem aqui perceberia.
  if (![...referenciados].some((r) => r.endsWith('.ttf'))) {
    problemas.push('nenhuma fonte .ttf referenciada na build — @expo/vector-icons sumiu do bundle?');
  }
  for (const alvo of referenciados) {
    if (!fs.existsSync(path.join(base, alvo))) {
      problemas.push(`arquivo referenciado não existe no disco: ${alvo}`);
    }
  }

  return problemas;
}


// Aplica o passo que a Vercel exige: renomeia assets/node_modules -> _modules e
// reescreve as referências nos .js. Idempotente — rodar de novo não faz nada.
// Existe como função pra que uma build montada À MÃO (a trava EBUSY do Windows
// em dist/ já forçou isso) consiga aplicar o MESMO passo do deploy-vercel.sh
// sem reescrever o mv+sed de memória, que foi como o defeito entrou duas vezes.
function corrigirAssets(raiz) {
  const base = fs.existsSync(path.join(raiz, 'cosmic-guide', 'index.html'))
    ? path.join(raiz, 'cosmic-guide')
    : raiz;
  const antigo = path.join(base, 'assets', 'node_modules');
  const novo = path.join(base, 'assets', '_modules');
  let mudou = false;
  if (fs.existsSync(antigo)) {
    fs.renameSync(antigo, novo);
    mudou = true;
  }
  const jsDir = path.join(base, '_expo', 'static', 'js');
  if (fs.existsSync(jsDir)) {
    for (const arquivo of listar(jsDir, ['.js'])) {
      const texto = fs.readFileSync(arquivo, 'utf8');
      if (texto.includes('assets/node_modules/')) {
        fs.writeFileSync(arquivo, texto.split('assets/node_modules/').join('assets/_modules/'));
        mudou = true;
      }
    }
  }
  return mudou;
}

module.exports = { verificarAssets, corrigirAssets };

// Uso direto: node scripts/verificar-assets-build.js <pasta-da-build>
if (require.main === module) {
  const args = process.argv.slice(2);
  const corrigir = args.includes('--corrigir');
  const raiz = path.resolve(args.find((a) => !a.startsWith('--')) || 'deploy-vercel');
  if (corrigir && corrigirAssets(raiz)) {
    console.log('ASSETS: passo aplicado (assets/node_modules -> _modules + referências reescritas).');
  }
  const problemas = verificarAssets(raiz);
  if (problemas.length > 0) {
    console.error(`ASSETS: ${problemas.length} problema(s) em ${raiz} — deploy deve ser ABORTADO:`);
    problemas.forEach((p) => console.error(`  - ${p}`));
    process.exit(1);
  }
  console.log(`ASSETS: ok — nenhuma referência a assets/node_modules/ e toda fonte existe no disco.`);
}
