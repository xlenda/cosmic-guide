// O LEMBRETE DIÁRIO DO CHECK-IN — as duas partes que dá pra conferir de graça:
// o TEXTO que sai no push e a FORMA da migração que o habilita.
//
// Por que não um teste HTTP como o da Chama: o envio em si depende de banco,
// de web-push e do serviço de push do navegador — nada disso roda aqui sem
// mock, e mock de push testa o mock. O que tem regra de produto de verdade é o
// texto (convida, nunca promete) e a idempotência da migração (uma migração
// que estoura no segundo boot derruba o backend inteiro, não só o lembrete).
// Essas duas são puras, então são as duas que este arquivo morde.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  IDIOMAS,
  IDIOMA_PADRAO,
  LEMBRETE,
  normalizarIdioma,
  textoDoLembrete,
} = require("../src/infrastructure/checkinReminderContent");

const RAIZ = path.join(__dirname, "..");

// ---------------------------------------------------------------------------
// O texto
// ---------------------------------------------------------------------------
test("os três idiomas têm título e corpo de verdade, e nenhum repete o do outro", () => {
  assert.deepEqual(IDIOMAS, ["pt", "es", "en"]);

  const titulos = new Set();
  const corpos = new Set();
  for (const lang of IDIOMAS) {
    const { title, body } = textoDoLembrete(lang);
    assert.equal(typeof title, "string");
    assert.equal(typeof body, "string");
    assert.ok(title.trim().length > 0, `${lang}: título vazio`);
    assert.ok(body.trim().length > 0, `${lang}: corpo vazio`);
    titulos.add(title);
    corpos.add(body);
  }
  // Três idiomas com o mesmo texto = alguém esqueceu de traduzir e ninguém viu.
  assert.equal(titulos.size, 3, "há título repetido entre idiomas");
  assert.equal(corpos.size, 3, "há corpo repetido entre idiomas");
});

test("o idioma cai no padrão em vez de devolver push sem texto", () => {
  assert.equal(normalizarIdioma("pt-BR"), "pt");
  assert.equal(normalizarIdioma("ES"), "es");
  assert.equal(normalizarIdioma("en_US"), "en");
  // Um push com title undefined é pior do que um push na língua errada.
  for (const entrada of [null, undefined, "", "  ", 42, {}, "de", "xx-YY"]) {
    assert.equal(normalizarIdioma(entrada), IDIOMA_PADRAO, `entrada ${JSON.stringify(entrada)}`);
    assert.deepEqual(textoDoLembrete(entrada), LEMBRETE[IDIOMA_PADRAO]);
  }
});

test("o título é o convite combinado — check-in de hoje, nada além disso", () => {
  assert.equal(LEMBRETE.pt.title, "💛 Seu check-in de hoje te espera");
  for (const lang of IDIOMAS) {
    assert.match(LEMBRETE[lang].title, /💛/, `${lang}: perdeu o coração dourado`);
    assert.match(LEMBRETE[lang].title, /check-in/i, `${lang}: o título não fala do check-in`);
  }
});

// A regra que este arquivo existe pra proteger. O push é a superfície mais
// agressiva do produto (chega na tela de bloqueio, sem ninguém ter aberto
// nada) — se a doutrina "convida, nunca promete" vale em algum lugar, vale
// aqui primeiro. Cada padrão abaixo é ou uma PROMESSA de resultado ou um
// empréstimo de autoridade de SAÚDE.
const PROIBIDOS = [
  // promessa de resultado / efeito
  /vai (melhorar|mudar|render)/i, /garant/i, /prometemos/i, /com certeza/i,
  /mejorar[áa]/i, /te har[áa]/i,
  /will (improve|change|make you)/i, /guarantee/i,
  // sorte / previsão
  /\bsorte\b/i, /\bsuerte\b/i, /\bluck/i, /\bprevis/i, /\bforecast/i,
  // saúde, humor clínico, tratamento
  /sa[úu]de/i, /\bhealth/i, /\bcura\b/i, /\bcurar\b/i, /\bheal\b/i,
  /ansiedade/i, /ansiedad/i, /anxiety/i, /depress/i,
  /diagn[óo]stic/i, /diagnos/i, /terapia/i, /therap/i, /tratamento/i, /tratamiento/i,
  /ins[ôo]nia/i, /insomnia/i, /\bestresse\b/i, /\bstress/i,
  // número inventado
  /\d+\s*%/,
];

test("o texto do push convida, nunca promete — e não empresta autoridade de saúde", () => {
  const achados = [];
  for (const lang of IDIOMAS) {
    const { title, body } = LEMBRETE[lang];
    for (const padrao of PROIBIDOS) {
      for (const [campo, texto] of [["title", title], ["body", body]]) {
        if (padrao.test(texto)) achados.push(`${lang}.${campo} casa com ${padrao}: "${texto}"`);
      }
    }
  }
  assert.deepEqual(
    achados,
    [],
    "O push é a superfície mais invasiva do app. Ele avisa que o check-in de hoje " +
      "existe — não promete efeito, não fala de saúde e não inventa número:\n  " +
      achados.join("\n  ")
  );
});

// ---------------------------------------------------------------------------
// A migração
// ---------------------------------------------------------------------------
// O runner (src/infrastructure/db.js) aplica a migração DENTRO do require do
// db.js. Uma migração que estoura no segundo boot (ALTER TABLE de coluna que
// já existe — o SQLite não tem ADD COLUMN IF NOT EXISTS) não derruba "o
// lembrete": derruba o backend inteiro, na inicialização, com o pm2 em loop.
// Por isso a idempotência aqui é asserção, não intenção escrita em comentário.
test("a migração 014 é idempotente — sobrevive a rodar de novo num banco que já a tem", () => {
  const arquivo = path.join(RAIZ, "src", "infrastructure", "migrations", "014_add_push_daily_reminder.sql");
  const sql = fs.readFileSync(arquivo, "utf8");
  const executavel = sql
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n");

  assert.match(executavel, /CREATE TABLE IF NOT EXISTS push_daily_reminder/i);
  assert.ok(
    !/\bALTER\s+TABLE\b/i.test(executavel),
    "ALTER TABLE não é idempotente no SQLite — a migração estouraria no boot seguinte"
  );
  assert.ok(
    !/CREATE\s+(TABLE|INDEX)(?!\s+IF NOT EXISTS)/i.test(executavel),
    "todo CREATE desta migração precisa de IF NOT EXISTS"
  );

  // A tabela guarda marcação e idioma — e NADA do que a pessoa respondeu. O
  // check-in mora no aparelho (lib/checkin.js) e é assim que fica.
  assert.match(executavel, /endpoint\s+TEXT PRIMARY KEY/i);
  assert.match(executavel, /lang\s+TEXT NOT NULL/i);
  for (const proibida of ["humor", "mood", "checkin_value", "resposta"]) {
    assert.ok(!new RegExp(`\\b${proibida}\\b`, "i").test(executavel), `coluna ${proibida} não deveria existir`);
  }
});

test("o número 014 não colide com nenhuma migração já existente", () => {
  const dir = path.join(RAIZ, "src", "infrastructure", "migrations");
  const numeros = fs
    .readdirSync(dir)
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .map((f) => parseInt(f, 10));
  assert.equal(new Set(numeros).size, numeros.length, "há dois arquivos de migração com o mesmo número");
  // "Ser a última" era verdade no dia em que a 014 nasceu e virou mentira no
  // dia seguinte (015 chegou com o país do funil) — teste que trava o mundo
  // parado quebra a cada avanço. O que importa e não muda: a 014 EXISTE e
  // nenhum número se repete.
  assert.ok(numeros.includes(14), "a migração 014 sumiu");
});

// ---------------------------------------------------------------------------
// O script do cron
// ---------------------------------------------------------------------------
// Não dá pra EXECUTAR o script aqui (ele abre o banco e a rede no require).
// Mas as duas promessas do cabeçalho da missão são verificáveis no texto, e as
// duas são do tipo que some numa refatoração distraída: um cron que falha
// calado é um cron que ninguém conserta, e uma linha de crontab que não está
// escrita em lugar nenhum é uma que o lead vai ter que adivinhar.
test("o script sai com código != 0 quando alguém que pediu não recebeu", () => {
  const src = fs.readFileSync(path.join(RAIZ, "scripts", "enviar-lembrete-checkin.js"), "utf8");
  assert.match(src, /process\.exitCode\s*=\s*1/, "falha de envio precisa virar saída != 0");
  assert.match(src, /process\.exit\(1\)/, "erro fatal precisa virar saída != 0");
  assert.match(src, /console\.log\(/, "o cron precisa deixar log do que fez");
});

test("a linha de crontab está pronta no cabeçalho, pro lead só copiar", () => {
  const src = fs.readFileSync(path.join(RAIZ, "scripts", "enviar-lembrete-checkin.js"), "utf8");
  const linha = src.split("\n").find((l) => l.includes("enviar-lembrete-checkin.js") && /^\s*\/\/\s*\d/.test(l));
  assert.ok(linha, "não achei a linha de crontab comentada no cabeçalho");
  assert.match(linha, /\d+\s+\d+\s+\*\s+\*\s+\*/, "a linha não tem cara de agendamento de cron");
});
