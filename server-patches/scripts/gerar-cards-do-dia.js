// OS DOIS FUNDOS DO DIA — o motor por trás do card de compartilhar a Frase.
//
// A ideia do dono (04/08/2026): todo dia, DUAS imagens novas de qualidade
// cinematográfica — uma pro card da Frase do Dia (solo), uma pro da Frase do
// Amor (casal) — geradas UMA vez no servidor e servidas pra todo mundo. O app
// compõe o card na hora: fundo + a frase do dia como TEXTO por cima + marca.
//
// POR QUE O TEXTO NÃO VAI NA IMAGEM: a frase existe em três línguas (pt/es/en)
// e queimar o texto no fundo custaria três gerações por dia e travaria a
// tipografia. Texto real por cima é nítido em qualquer tela, muda de língua de
// graça e deixa a imagem 100% neutra — por isso os prompts terminam proibindo
// letras e símbolos.
//
// POR QUE CRON E NÃO ON-DEMAND: uma geração por dia atende todos os usuários.
// Gerar sob demanda seria pagar a mesma imagem N vezes e expor a latência do
// modelo (segundos) na cara de quem só quer compartilhar uma frase.
//
// FALHA NÃO DERRUBA NADA: se a chamada ao Gemini falhar (sem faturamento, sem
// rede, cota), o script loga e sai com código 1 — e /api/daily-cards continua
// servindo o dia mais recente que existir no disco. O primeiro dia foi semeado
// à mão com imagens geradas fora daqui, então sempre há um fallback.
//
// USO:
//   node scripts/gerar-cards-do-dia.js            (gera o dia de hoje)
//   node scripts/gerar-cards-do-dia.js --forcar   (regenera mesmo se já existir)
const fs = require("node:fs");
const path = require("node:path");

// O .env na mão, sem depender do dotenv estar instalado (o script roda por
// cron, fora do bootstrap do servidor).
const RAIZ = path.join(__dirname, "..");
for (const linha of fs.readFileSync(path.join(RAIZ, ".env"), "utf8").split("\n")) {
  const i = linha.indexOf("=");
  if (i > 0 && !linha.trim().startsWith("#")) process.env[linha.slice(0, i).trim()] = linha.slice(i + 1).trim();
}

const CHAVE = process.env.GEMINI_API_KEY;
const DIR_CARDS = path.join(RAIZ, "data", "daily-cards");

// O endpoint NOVO (interactions) — conferido ao vivo em 04/08/2026: autentica
// e aceita o shape abaixo (a chave sem faturamento respondeu 429 de cota, não
// 404 nem 400, o que prova endpoint e formato). Modelo lite: o mais barato, e
// fundo de card não precisa de mais.
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const MODELO = "gemini-3.1-flash-lite-image";

// Um tema por dia da semana, pra variedade sem sorteio (mesmo dia = mesmo
// fundo em todos os aparelhos; determinismo é o que deixa o card do dia ser
// "o" card do dia, igual pra quem compartilha e pra quem recebe).
const TEMAS = [
  "a serene giant golden full moon over calm dark water",           // domingo
  "a golden crescent moon cradled in soft violet nebula clouds",    // segunda
  "a river of tiny golden stars flowing through deep indigo sky",   // terça
  "a lone luminous planet with thin gold rings in quiet dark space",// quarta
  "gentle aurora veils in violet and gold over a still horizon",    // quinta
  "a radiant golden comet crossing a deep purple star field",       // sexta
  "a glowing constellation wheel of faint gold lines among stars",  // sábado
];

function promptSolo(tema) {
  return (
    `Vertical cinematic cosmic background for an inspirational quote card, NO text anywhere. ` +
    `${tema}, tiny stars, gentle god-rays, dreamy luxurious film-grade lighting. ` +
    `Deep midnight purples #120A38 and #31205C with radiant gold accents. ` +
    `The center and lower third are calm, dark and uncluttered — generous negative space for text overlay. ` +
    `No watermark, no letters, no symbols.`
  );
}

function promptCasal(tema) {
  return (
    `Vertical cinematic romantic cosmic background for a love-quote share card, NO text anywhere. ` +
    `Two elements in gentle orbit around each other — inspired by: ${tema} — reimagined as a PAIR ` +
    `(two moons, two comets or two star trails) whose paths curve toward one another, warm gold and rose-gold ` +
    `against deep indigo, soft reflection over still dark water below. ` +
    `Center and lower third calm and dark with generous negative space for text overlay. ` +
    `Luxurious film lighting. No watermark, no letters, no symbols.`
  );
}

async function gerarUma(prompt) {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "x-goog-api-key": CHAVE, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODELO,
      input: [{ type: "text", text: prompt }],
      response_format: { type: "image", mime_type: "image/png", aspect_ratio: "9:16", image_size: "1K" },
    }),
  });
  if (!resp.ok) {
    const corpo = await resp.text();
    throw new Error(`Gemini ${resp.status}: ${corpo.slice(0, 300)}`);
  }
  const dados = await resp.json();
  // Dois lugares documentados pro base64 — o de conveniência e o detalhado.
  const b64 =
    (dados.output_image && dados.output_image.data) ||
    (dados.steps || [])
      .flatMap((s) => s.content || [])
      .filter((c) => c.type === "image" && c.data)
      .map((c) => c.data)[0];
  if (!b64) throw new Error(`resposta sem imagem: ${JSON.stringify(dados).slice(0, 300)}`);
  return Buffer.from(b64, "base64");
}

async function main() {
  if (!CHAVE) throw new Error("GEMINI_API_KEY ausente no .env");

  const agora = new Date();
  const dia = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
  const dirDoDia = path.join(DIR_CARDS, dia);

  if (fs.existsSync(path.join(dirDoDia, "casal.png")) && !process.argv.includes("--forcar")) {
    console.log(`[daily-cards] ${dia} já existe — nada a fazer (use --forcar pra regenerar)`);
    return;
  }

  const tema = TEMAS[agora.getDay()];
  console.log(`[daily-cards] gerando ${dia} (tema: ${tema})`);

  // Sequencial de propósito: são só duas, e em paralelo um 429 de rate por
  // minuto derrubaria as duas de uma vez.
  const solo = await gerarUma(promptSolo(tema));
  const casal = await gerarUma(promptCasal(tema));

  fs.mkdirSync(dirDoDia, { recursive: true });
  fs.writeFileSync(path.join(dirDoDia, "solo.png"), solo);
  fs.writeFileSync(path.join(dirDoDia, "casal.png"), casal);
  // O manifesto é gravado POR ÚLTIMO: se o processo morrer no meio, latest
  // continua apontando pro dia anterior completo, nunca pra um dia pela metade.
  fs.writeFileSync(path.join(DIR_CARDS, "latest.json"), JSON.stringify({ date: dia }) + "\n");

  // Faxina: guarda só os últimos 14 dias (2 imagens/dia ~2MB — sem faxina o
  // disco pagaria pra sempre por um card que ninguém mais abre).
  const dias = fs
    .readdirSync(DIR_CARDS)
    .filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n))
    .sort();
  for (const velho of dias.slice(0, -14)) {
    fs.rmSync(path.join(DIR_CARDS, velho), { recursive: true, force: true });
    console.log(`[daily-cards] apagado: ${velho}`);
  }

  console.log(`[daily-cards] pronto: ${dia} (solo ${solo.length}b, casal ${casal.length}b)`);
}

main().catch((e) => {
  console.error(`[daily-cards] ERRO: ${e.message}`);
  process.exit(1);
});
