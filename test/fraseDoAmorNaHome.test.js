// A FRASE DO AMOR NA HOME — a função viva que ficou sem nenhum chamador.
// (13/09/2026)
//
// POR QUE ESTE TESTE EXISTE. O commit 62c1db4 ("Tira os blocos que viraram
// missão") removeu da Home vários blocos que tinham virado missão do dia. A
// Frase do Amor saiu junto — e ela NÃO virou missão, então sumiu de vez. Dano
// colateral, não decisão.
//
// E NADA QUEBROU: `handleShareLovePhrase` continuou definida e completa,
// `todaysLovePhrase` continuou sendo calculada todo render, os estilos
// lovePhrase* continuaram no StyleSheet, as 12 chaves home.lovePhrase.*
// continuaram nos três idiomas e lib/shareCard.js continuou inteiro. Só o JSX
// evaporou. Uma função sem chamador não quebra build, não quebra lint e não
// quebra teste nenhum — foi por isso que só o DONO percebeu, perguntando "onde
// gera um card não tem mais".
//
// É a mesma classe de defeito que test/elementosNaHome.test.js guarda do outro
// lado: arte no bundle sem um pixel na tela. Aqui: lógica no bundle sem um
// toque na tela. O antídoto é o mesmo — exigir o CALL SITE, não a definição.
//
// NÃO RENDERIZA COMPONENTE: não há react-test-renderer no projeto (mesma razão
// declarada em test/elementosNaHome.test.js e test/diagramacaoPecas.test.js).
// Lê a FONTE, como o resto do repo.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const home = fs.readFileSync(path.join(raiz, 'screens/HomeScreen.js'), 'utf8');
const i18n = fs.readFileSync(path.join(raiz, 'lib/i18n.js'), 'utf8');

// ESTA É A TRAVA PRINCIPAL. Não basta a função existir: ela tem que estar
// dentro de um onPress do JSX. Era exatamente isso que faltava — e nada mais
// no repo inteiro percebia a falta.
test('handleShareLovePhrase tem call site de verdade: está num onPress do JSX', () => {
  assert.match(
    home,
    /onPress=\{handleShareLovePhrase\}/,
    'a função voltou a ser órfã: definida, viva no bundle e sem nenhum botão que a chame — foi assim que a Frase do Amor sumiu da tela em 62c1db4 sem quebrar nada'
  );
  // E a definição continua onde estava, senão o onPress acima apontaria pro nada.
  assert.match(home, /const handleShareLovePhrase = async \(\) =>/, 'a definição sumiu');
});

test('o card inteiro está desenhado — não só o botão solto', () => {
  assert.match(home, /style=\{styles\.lovePhraseCard\}/, 'o card sumiu do JSX');
  assert.match(home, /\{todaysLovePhrase\}/, 'a frase não é escrita em lugar nenhum da tela');
  assert.match(home, /const todaysLovePhrase = getTodaysLovePhrase\(lang\)/, 'a frase deixou de ser calculada');
});

// AS DUAS CAMADAS (auditoria 09/08/2026). Trocar o source em vez de empilhar
// deixava a faixa EM BRANCO em 3G e em 404 — o fundo do dia vem do servidor e
// pode demorar ou nunca chegar. A cena local fica SEMPRE por baixo.
test('a arte tem duas camadas: cena local por baixo, fundo do dia por cima', () => {
  assert.match(home, /source=\{CENAS\.amor\}/, 'a camada de baixo sumiu: em 3G ou 404 a faixa fica em branco');
  assert.match(home, /import \{[^}]*CENAS[^}]*\} from '\.\.\/lib\/ilustracoes'/, 'CENAS saiu do import de novo — foi o que aconteceu em 12/09');
  assert.match(home, /source=\{\{ uri: fundoFraseDoDia \}\}/, 'o fundo do dia não pinta mais por cima');
  assert.match(home, /onError=\{\(\) => setFundoFraseDoDia\(null\)\}/, 'sem onError, um 404 deixa faixa vazia permanente');
  // O estado que alimenta as duas camadas continua vivo.
  assert.match(home, /const \[fundoFraseDoDia, setFundoFraseDoDia\] = useState\(null\)/, 'o estado do fundo sumiu');
});

// FONTE ÚNICA (conserto de 09/08/2026, relato do dono: "aparece a imagem nova
// mas compartilha a antiga"). A faixa exibida e o card compartilhado são a
// MESMA imagem — fundoDoDia em lib/shareCard.js, tipo 'casal'.
test('a faixa exibida e o card compartilhado são a mesma imagem', () => {
  assert.match(
    home,
    /compartilharFraseComoCard\(\{ frase: todaysLovePhrase, tipo: 'casal' \}\)/,
    'o tipo do card mudou: a faixa na tela e o PNG compartilhado voltariam a divergir'
  );
  const shareCard = fs.readFileSync(path.join(raiz, 'lib/shareCard.js'), 'utf8');
  assert.match(shareCard, /fundoDoDia/, 'a fonte única do fundo sumiu de lib/shareCard.js');
});

// AS TRÊS SAÍDAS. 'compartilhado'/'baixado' gravam a missão; 'cancelado' para
// (desistir é desistir); false cai no share de TEXTO, que nunca quebra. Na web
// o Web Share de ARQUIVO pode não existir — aí a função BAIXA o PNG, e
// 'baixado' é sucesso, não falha.
test('as três saídas do compartilhar continuam de pé', () => {
  assert.match(home, /viaCard === 'compartilhado' \|\| viaCard === 'baixado'/, "'baixado' é o caminho da web sem Web Share de arquivo — tirá-lo faz o download deixar de contar a missão");
  assert.match(home, /if \(viaCard === 'cancelado'\) return;/, 'cancelar voltaria a empilhar outro diálogo em cima');
  assert.match(home, /await Share\.share\(\{/, 'o fallback de texto sumiu: falha de rede/canvas deixaria de compartilhar qualquer coisa');
  assert.match(home, /recordMissionAction\(MISSION_ACTIONS\.FRASE_COMPARTILHADA\)/, 'a missão deixou de ser registrada');
});

// O app inteiro no mesmo idioma: as chaves que o bloco usa têm que existir nos
// TRÊS pacotes, senão a tela mostra a chave crua pra quem não está em pt.
test('as chaves do bloco existem nos três idiomas', () => {
  for (const chave of ['label', 'share', 'shareSolo', 'shareTagline']) {
    const ocorrencias = i18n.split(`'home.lovePhrase.${chave}':`).length - 1;
    assert.equal(ocorrencias, 3, `home.lovePhrase.${chave} existe em ${ocorrencias} idioma(s), deviam ser 3`);
  }
  // As duas que o JSX escolhe em runtime, pelo perfil de quem olha.
  assert.match(home, /isCouple \? 'home\.lovePhrase\.share' : 'home\.lovePhrase\.shareSolo'/, 'o rótulo parou de mudar com o perfil');
});
