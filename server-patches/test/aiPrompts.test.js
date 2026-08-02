// Varredura de DISCIPLINA DE FONTE sobre TODOS os prompts de IA.
//
// POR QUE ESTE TESTE EXISTE
// -------------------------
// Os prompts são a única parte do produto que "fala" sem revisão humana: o que
// está escrito neles vira texto na tela de quem paga. Até esta frente, nada
// impedia um prompt novo de dizer "tradição milenar" ou de inventar um ano —
// e o custo de uma alegação histórica falsa não é estético, é de credibilidade
// (basta um usuário informado apontar a fonte real).
//
// docs/tradicao/00-tese.md exige que toda AFIRMAÇÃO HISTÓRICA carregue obra,
// autor e século. Ela NÃO exige que toda resposta carregue fonte — por isso o
// recibo é condicional, e é isso que este teste trava: não "tem fonte em tudo",
// e sim "não existe antiguidade vaga em lugar nenhum, e não existe ano que a
// pesquisa não sustente".
//
// O QUE ELE TRAVA (cada bloco falha o build sozinho):
//   1. vocabulário proibido em qualquer prompt — descontadas as PROIBIÇÕES
//      declaradas, que precisam nomear a palavra pra serem eficazes;
//   2. todo prompt de tradição carrega, literalmente, a sua lista de fatos;
//   3. as sínteses NÃO carregam antiguidade nenhuma (são leitura do app);
//   4. nenhum ano de 4 dígitos aparece num prompt sem estar nos fatos dele;
//   5. todo ano dos fatos existe de verdade em docs/tradicao (só roda onde a
//      pesquisa está disponível — ver nota no bloco 5);
//   6. o contrato com o app: title/body continuam obrigatórios e string, e
//      'fonte' foi acrescentado sem quebrar nada;
//   7. as regras da casa: nada de saúde, veredito ou prova social inventada.
//
// COMO RODAR:
//   node --test test/aiPrompts.test.js
//   (ou `npm test`, que varre test/ inteiro)
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const {
  PROMPTS,
  PROMPTS_SEM_FATOS,
  SCHEMAS,
  FATOS_DATADOS,
  FATOS_POR_PROMPT,
  VOCABULARIO_PROIBIDO,
  TRECHOS_DE_PROIBICAO,
} = require("../src/infrastructure/AnthropicChatProvider");

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

// Comparação sem acento e sem caixa. "MILENAR", "Milênio" e "milenio" têm que
// cair na mesma peneira — senão a proibição é contornável por acidente de
// digitação, que é justamente como uma regra dessas costuma vazar.
function normalizar(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Remove de um prompt os trechos em que o vocabulário proibido é citado
// LEGITIMAMENTE (as próprias proibições). É o coração do teste: sem isso, a
// frase que proíbe "milenar" seria acusada de dizer "milenar", e o único jeito
// de o build passar seria escrever proibições vagas — que não funcionam.
// Cada trecho isento está registrado em TRECHOS_DE_PROIBICAO via proibir(),
// ou seja: a isenção é declarada no código de produção, uma a uma, e nunca
// inferida aqui.
function semTrechosDeProibicao(prompt) {
  let texto = normalizar(prompt);
  for (const trecho of TRECHOS_DE_PROIBICAO) {
    const alvo = normalizar(trecho);
    // split/join remove TODAS as ocorrências, sem regex (os trechos têm
    // parênteses, aspas e pontos que quebrariam um RegExp montado na hora).
    texto = texto.split(alvo).join(" ");
  }
  return texto;
}

const TODOS_OS_FATOS = Object.values(FATOS_DATADOS).flat();

// Todo ano de 4 dígitos que a pesquisa sustenta — extraído das listas de fatos,
// não digitado à mão (uma lista paralela sairia do ar na primeira edição).
function anosDe(textos) {
  const anos = new Set();
  for (const t of textos) {
    for (const m of String(t).matchAll(/\b(\d{4})\b/g)) anos.add(m[1]);
  }
  return anos;
}

const ANOS_SUSTENTADOS = anosDe(TODOS_OS_FATOS);

// ---------------------------------------------------------------------------
// 1. VOCABULÁRIO PROIBIDO
// ---------------------------------------------------------------------------
test("nenhum prompt usa antiguidade vaga fora de uma proibição declarada", () => {
  for (const [rota, prompt] of Object.entries(PROMPTS)) {
    const texto = semTrechosDeProibicao(prompt);
    for (const palavra of VOCABULARIO_PROIBIDO) {
      assert.ok(
        !texto.includes(normalizar(palavra)),
        `prompt "${rota}" contém a palavra proibida "${palavra}" fora de uma proibição declarada. ` +
          `Se a intenção é PROIBIR a palavra, envolva o trecho em proibir() no AnthropicChatProvider; ` +
          `se a intenção é AFIRMAR antiguidade, troque pelo fato datado correspondente.`
      );
    }
  }
});

test("o registro de proibições não está vazio nem virou isenção geral", () => {
  // Se alguém "consertar" o teste registrando o prompt inteiro em proibir(),
  // a varredura acima vira decoração. Dois limites: tem que haver proibições,
  // e nenhuma pode ser longa a ponto de apagar um prompt inteiro.
  assert.ok(TRECHOS_DE_PROIBICAO.length >= 3, "as proibições declaradas sumiram");
  for (const trecho of TRECHOS_DE_PROIBICAO) {
    assert.ok(
      trecho.length < 1200,
      `um trecho de proibir() tem ${trecho.length} chars — grande demais. ` +
        `proibir() isenta o texto da varredura, então ele precisa ser a frase da proibição, não um bloco inteiro.`
    );
  }
});

// ---------------------------------------------------------------------------
// 2. CADA TRADIÇÃO CARREGA SEUS FATOS
// ---------------------------------------------------------------------------
test("todo prompt de tradição carrega, literalmente, a sua lista de fatos", () => {
  for (const [rota, fatos] of Object.entries(FATOS_POR_PROMPT)) {
    const prompt = PROMPTS[rota];
    assert.ok(prompt, `rota "${rota}" declara fatos mas não tem prompt em PROMPTS`);
    assert.ok(fatos.length > 0, `a lista de fatos de "${rota}" está vazia`);
    for (const fato of fatos) {
      assert.ok(
        prompt.includes(fato),
        `prompt "${rota}" NÃO contém o fato:\n  ${fato}\n` +
          `A lista foi declarada mas não ligada ao prompt (falta blocoFatos(...) no montarPrompt).`
      );
    }
  }
});

test("todo prompt de tradição carrega a DISCIPLINA DE FONTE", () => {
  // A lista de fatos sem a disciplina é só informação solta: é a disciplina que
  // transforma a lista numa fronteira ("e SOMENTE estes").
  for (const rota of Object.keys(FATOS_POR_PROMPT)) {
    assert.ok(
      PROMPTS[rota].includes("DISCIPLINA DE FONTE"),
      `prompt "${rota}" tem fatos datados mas não carrega a DISCIPLINA DE FONTE`
    );
    assert.ok(
      PROMPTS[rota].includes("FATOS DATADOS QUE VOCÊ PODE CITAR"),
      `prompt "${rota}" não tem o cabeçalho que fecha a lista de fatos`
    );
  }
});

test("todo prompt está classificado: ou tem fatos, ou é síntese declarada", () => {
  // Impede o buraco silencioso: um prompt novo que não entre em nenhuma das
  // duas listas passaria despercebido por todas as regras acima.
  for (const rota of Object.keys(PROMPTS)) {
    const temFatos = Object.prototype.hasOwnProperty.call(FATOS_POR_PROMPT, rota);
    const eSintese = PROMPTS_SEM_FATOS.includes(rota);
    assert.ok(
      temFatos || eSintese,
      `prompt "${rota}" não está em FATOS_POR_PROMPT nem em PROMPTS_SEM_FATOS. ` +
        `Todo prompt novo precisa declarar de qual tradição ele fala — ou declarar que não fala de nenhuma.`
    );
    assert.ok(!(temFatos && eSintese), `prompt "${rota}" está nas duas listas ao mesmo tempo`);
  }
});

// ---------------------------------------------------------------------------
// 3. AS SÍNTESES NÃO RECEBEM ANTIGUIDADE
// ---------------------------------------------------------------------------
test("as sínteses não carregam fato datado nem ano nenhum", () => {
  // Resumo semanal e insight semanal leem o histórico da própria pessoa dentro
  // do app. Não são leitura de tradição, então afirmação histórica ali não tem
  // o que fazer — e a ausência de lista de fatos já torna qualquer data ilegal
  // pela própria disciplina. Este teste trava a ausência.
  for (const rota of PROMPTS_SEM_FATOS) {
    const prompt = PROMPTS[rota];
    assert.ok(prompt, `síntese "${rota}" não existe em PROMPTS`);
    assert.ok(
      !prompt.includes("FATOS DATADOS QUE VOCÊ PODE CITAR"),
      `síntese "${rota}" ganhou uma lista de fatos — ela é leitura do próprio app e não deve citar tradição`
    );
    for (const fato of TODOS_OS_FATOS) {
      assert.ok(!prompt.includes(fato), `síntese "${rota}" carrega um fato datado:\n  ${fato}`);
    }
    const anos = [...anosDe([prompt])];
    assert.deepStrictEqual(anos, [], `síntese "${rota}" cita ano(s) ${anos.join(", ")} — não deveria citar nenhum`);
  }
});

// ---------------------------------------------------------------------------
// 4. NENHUM ANO SOLTO NOS PROMPTS
// ---------------------------------------------------------------------------
test("nenhum ano de 4 dígitos aparece num prompt sem estar nos fatos dele", () => {
  for (const [rota, prompt] of Object.entries(PROMPTS)) {
    const fatosDaRota = FATOS_POR_PROMPT[rota] || [];
    const permitidos = anosDe(fatosDaRota);
    for (const ano of anosDe([prompt])) {
      assert.ok(
        permitidos.has(ano),
        `prompt "${rota}" cita o ano ${ano}, que NÃO está na lista de fatos dele. ` +
          `Ou o ano sai do prompt, ou o fato correspondente entra na lista — depois de conferido em docs/tradicao.`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 5. TODO ANO DOS FATOS EXISTE NA PESQUISA
// ---------------------------------------------------------------------------
// Este é o único bloco que depende de um arquivo FORA deste repositório:
// docs/tradicao vive no repo do app (Cosmic Guide/docs/tradicao), e o backend
// é publicado sozinho em /root/forja-backend. Onde a pesquisa não estiver
// acessível o bloco se declara pulado, em vez de falhar — um teste que quebra
// no servidor por um arquivo que nunca esteve lá seria ruído, e ruído em teste
// vira teste desligado. Na máquina de quem edita os prompts, ele roda.
const DOCS_TRADICAO = path.resolve(__dirname, "..", "..", "docs", "tradicao");

test("todo ano citado nos fatos existe em docs/tradicao", (t) => {
  if (!fs.existsSync(DOCS_TRADICAO)) {
    t.skip(`docs/tradicao não está acessível a partir daqui (${DOCS_TRADICAO}) — checagem pulada`);
    return;
  }

  const pesquisa = fs
    .readdirSync(DOCS_TRADICAO)
    .filter((f) => f.endsWith(".md"))
    .map((f) => fs.readFileSync(path.join(DOCS_TRADICAO, f), "utf8"))
    .join("\n");

  assert.ok(pesquisa.length > 10000, "docs/tradicao foi encontrado mas veio vazio — leitura suspeita");

  for (const [tradicao, fatos] of Object.entries(FATOS_DATADOS)) {
    for (const ano of anosDe(fatos)) {
      assert.ok(
        pesquisa.includes(ano),
        `o ano ${ano}, citado nos fatos de "${tradicao}", NÃO aparece em docs/tradicao. ` +
          `Fato sem lastro na pesquisa não entra: confira a fonte ou remova a linha.`
      );
    }
  }
});

test("todo fato nomeia obra, autor ou século — não existe fato vago", (t) => {
  // Um "fato datado" que não carrega nem ano, nem século, nem obra/autor não
  // serve pro recibo: seria antiguidade vaga com outro nome. Ou ele diz de
  // quando é, ou diz explicitamente que a pesquisa NÃO achou fonte (que é uma
  // informação legítima e das mais valiosas — é o caso da podomancia).
  for (const [tradicao, fatos] of Object.entries(FATOS_DATADOS)) {
    for (const fato of fatos) {
      const temAno = /\b\d{3,4}\b/.test(fato);
      // "séc. XIX" e "cerca de seis séculos" datam as duas — a segunda em
      // palavras, que é justamente a formulação de antiguidade honesta que a
      // pesquisa recomenda quando um número exato não existe.
      const temSeculo = /séc\.|século/i.test(fato);
      // Declarar que a pesquisa NÃO achou fonte é uma informação legítima e das
      // mais valiosas da lista (é o caso da "podomancia" e do mapa de zonas das
      // pintas): é o que impede a IA de preencher o vazio com antiguidade
      // inventada. Case-insensitive porque os fatos escrevem "NÃO" em caixa
      // alta justamente onde a negação é o ponto.
      const declaraAusencia = /(não existe|não tem nenhuma fonte|não localizou|não têm fonte|sem fonte|sem codificador|cunhagem moderna|cunhagem do séc)/i.test(fato);
      assert.ok(
        temAno || temSeculo || declaraAusencia,
        `fato de "${tradicao}" não data nada e não declara ausência de fonte:\n  ${fato}`
      );
    }
  }
  t.diagnostic(`${TODOS_OS_FATOS.length} fatos conferidos, ${ANOS_SUSTENTADOS.size} anos distintos sustentados`);
});

// ---------------------------------------------------------------------------
// 6. CONTRATO COM O APP
// ---------------------------------------------------------------------------
test("title e body continuam obrigatórios e string em todo schema de leitura", () => {
  // É o contrato que lib/aiClient.js valida hoje (exigirTituloECorpo checa
  // typeof title/body === 'string' e não-vazio, e devolve o objeto inteiro).
  // Quebrar isto derruba TODAS as telas de leitura de uma vez.
  for (const [rota, schema] of Object.entries(SCHEMAS)) {
    if (rota === "enhance-insight") continue; // devolve { praticamenteIgual, enhanced }
    assert.strictEqual(schema.properties.title.type, "string", `schema "${rota}": title deixou de ser string`);
    assert.strictEqual(schema.properties.body.type, "string", `schema "${rota}": body deixou de ser string`);
    assert.ok(schema.required.includes("title"), `schema "${rota}": title saiu de required`);
    assert.ok(schema.required.includes("body"), `schema "${rota}": body saiu de required`);
  }
});

test("o campo fonte existe, é string e é obrigatório em todo schema de leitura", () => {
  // Obrigatório de propósito, mesmo com o recibo condicional: o campo tem que
  // EXISTIR para o modelo decidir conscientemente se houve afirmação histórica.
  // Opcional, ele seria simplesmente omitido em toda resposta e a decisão nunca
  // aconteceria. O valor correto quando não houve afirmação é string VAZIA.
  for (const [rota, schema] of Object.entries(SCHEMAS)) {
    if (rota === "enhance-insight") continue;
    assert.ok(schema.properties.fonte, `schema "${rota}" não tem o campo fonte`);
    assert.strictEqual(schema.properties.fonte.type, "string", `schema "${rota}": fonte precisa ser string`);
    assert.ok(schema.required.includes("fonte"), `schema "${rota}": fonte precisa continuar em required`);
    assert.ok(
      /vazia/i.test(schema.properties.fonte.description),
      `schema "${rota}": a descrição de fonte precisa dizer que o valor é string vazia quando não houve afirmação histórica`
    );
  }
});

test("os campos de observação continuam ANTES de title no schema", () => {
  // A ordem das propriedades é mecânica, não estética: o modelo gera na ordem
  // do schema, então observar antes de interpretar só é forçado se 'observacoes'
  // vier antes de 'title'. E 'fonte' precisa vir DEPOIS de body — o recibo é
  // consequência do que foi escrito, não premissa.
  const comObservacao = { palm: "observacoes", coffee: "observacoes", face: "observacoes", foot: "observacoes", moles: "observacoes", dream: "elementos", tarot: "padrao" };
  for (const [rota, campo] of Object.entries(comObservacao)) {
    const ordem = Object.keys(SCHEMAS[rota].properties);
    assert.ok(
      ordem.indexOf(campo) < ordem.indexOf("title"),
      `schema "${rota}": ${campo} precisa vir antes de title`
    );
    assert.ok(
      ordem.indexOf("fonte") > ordem.indexOf("body"),
      `schema "${rota}": fonte precisa vir depois de body`
    );
  }
});

// ---------------------------------------------------------------------------
// 7. REGRAS DA CASA
// ---------------------------------------------------------------------------
test("nenhum prompt contém prova social inventada", () => {
  const provaSocial = ["milhoes de pessoas", "milhares de pessoas", "estudos mostram", "esta comprovado", "cientificamente comprovado", "pesquisas comprovam"];
  for (const [rota, prompt] of Object.entries(PROMPTS)) {
    const texto = semTrechosDeProibicao(prompt);
    for (const frase of provaSocial) {
      assert.ok(!texto.includes(frase), `prompt "${rota}" contém prova social: "${frase}"`);
    }
  }
});

test("as rotas de risco mantêm suas proibições de saúde", () => {
  // Nenhuma das três pode ser afrouxada por refatoração: são as que a pesquisa
  // marca como de maior risco (dermatologia, prazo de vida, reflexologia).
  assert.ok(
    /dermatologista/i.test(PROMPTS.moles) && /nunca comente cor, formato, borda, tamanho, textura/i.test(PROMPTS.moles),
    "o prompt de pintas perdeu a proibição de comentar cor/formato/borda (dermatologia)"
  );
  assert.ok(
    /nunca fale de duração de vida/i.test(PROMPTS.palm),
    "o prompt de mão perdeu a proibição de falar de duração de vida"
  );
  assert.ok(
    /reflexolog/i.test(PROMPTS.foot) && /não fala de saúde/i.test(PROMPTS.foot),
    "o prompt de pés perdeu a proibição de reflexologia/saúde"
  );
  assert.ok(
    /nunca comente aparência como beleza, feiura, idade aparente, peso, etnia ou saúde/i.test(PROMPTS.face),
    "o prompt de rosto perdeu a proibição de comentar aparência/etnia/saúde"
  );
});

test("o mapa de zonas da moleosofia não é atribuído a nenhuma tradição", () => {
  // docs/tradicao/06 §5.2 aponta este arquivo pelo nome: a tabela zona→planeta
  // não tem fonte primária nenhuma, e dizê-la "tradição ocidental dos
  // almanaques" era uma afirmação histórica falsa. O mapa continua sendo usado
  // como linguagem simbólica — mas rotulado como convenção do próprio app.
  assert.ok(
    !/tradição ocidental dos almanaques/i.test(PROMPTS.moles),
    "voltou a atribuir o mapa de zonas a uma 'tradição ocidental dos almanaques' — isso não tem fonte (docs/tradicao/06 §5.2)"
  );
  assert.ok(
    /CONVENÇÃO DE LEITURA DO PRÓPRIO COSMIC GUIDE/.test(PROMPTS.moles),
    "o prompt de pintas precisa declarar que o mapa de zonas é convenção do próprio app"
  );
});

test("o prompt de mão não chama a ligação linha↔longevidade de invenção popular", () => {
  // docs/tradicao/06 §7.5: essa ligação é a afirmação MAIS ANTIGA documentada
  // da quiromancia (Aristóteles, HA I.15). A proibição continua absoluta; o que
  // não pode voltar é a justificativa falsa — inventar história pra se
  // justificar é o erro que esta frente inteira existe pra evitar.
  assert.ok(
    !/isso é mito popular, não quiromancia/i.test(PROMPTS.palm),
    "voltou a justificar a proibição com 'mito popular, não quiromancia' — é falso (docs/tradicao/06 §7.5)"
  );
  assert.ok(
    /afirmação mais antiga documentada da quiromancia/i.test(PROMPTS.palm),
    "o prompt de mão precisa ser honesto sobre o que a tradição de fato dizia"
  );
});
