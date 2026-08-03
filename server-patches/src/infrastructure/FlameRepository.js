// Chama do Casal (tabela flame_checkins, migração 008) — diferente da
// sequência individual (lib/streak.js no app, AsyncStorage local), a chama do
// dia só acende quando >= 2 aparelhos DISTINTOS do mesmo casal registram
// presença no mesmo dia, então o estado vive no servidor: nenhum aparelho
// sozinho sabe se o outro abriu o app. Privacidade primeiro: couple_key é um
// SHA-256 hex calculado NO client a partir dos nomes normalizados do casal —
// o servidor nunca vê nome nenhum; device_id é um UUID aleatório do aparelho.
const { db } = require("./db");

// Dia UTC no formato YYYY-MM-DD. O dia do check-in é SEMPRE decidido aqui no
// servidor (a rota ignora qualquer `day` que o client mande) — senão um
// client alterado fabricaria streak retroativo mandando datas passadas.
function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

// Aritmética de dia em UTC puro — "YYYY-MM-DDT00:00:00Z" parseia como
// meia-noite UTC e setUTCDate cuida de virada de mês/ano sozinho, sem nunca
// passar pelo fuso local do servidor.
function addDaysUtc(day, delta) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

// Teto do loop de streak (~13 meses de dias consecutivos): sem ele, dado
// corrompido ou um bug de data viraria centenas de milhares de queries numa
// única consulta de status. Um casal que realmente chegar aqui vê o streak
// parar em 400 — dá pra subir o teto quando o primeiro casal chegar perto.
const STREAK_MAX_DAYS = 400;

class FlameRepository {
  // INSERT OR IGNORE + PK composta (couple_key, day, device_id) = idempotente:
  // o client chama fire-and-forget em toda abertura do app e reaberturas no
  // mesmo dia não duplicam nada nem viram erro.
  checkin({ coupleKey, day, deviceId }) {
    db.prepare(
      "INSERT OR IGNORE INTO flame_checkins (couple_key, day, device_id) VALUES (?, ?, ?)"
    ).run(
      coupleKey,
      day,
      // A rota aceita UUID em qualquer caixa (algumas libs geram em caixa
      // alta) — normalizar aqui garante que o mesmo aparelho nunca conte como
      // dois só por diferença de caixa.
      String(deviceId).toLowerCase()
    );
  }

  // Quantos aparelhos distintos registraram presença nesse dia — >= 2 acende.
  countDevices(coupleKey, day) {
    return db
      .prepare(
        "SELECT COUNT(DISTINCT device_id) AS n FROM flame_checkins WHERE couple_key = ? AND day = ?"
      )
      .get(coupleKey, day).n;
  }

  // { todayDevices, litToday, streak } — streak = dias consecutivos com a
  // chama acesa terminando hoje OU ontem (mesmo espírito do
  // computeCurrentStreak da sequência individual no app): um casal que ainda
  // não acendeu hoje não "perde" a sequência antes de o dia acabar.
  status(coupleKey) {
    const today = todayUtc();
    const todayDevices = this.countDevices(coupleKey, today);
    const litToday = todayDevices >= 2;

    let streak = 0;
    let day = litToday ? today : addDaysUtc(today, -1);
    for (let i = 0; i < STREAK_MAX_DAYS; i++) {
      if (this.countDevices(coupleKey, day) < 2) break;
      streak += 1;
      day = addDaysUtc(day, -1);
    }
    return { todayDevices, litToday, streak };
  }
}

module.exports = { FlameRepository, todayUtc, addDaysUtc };
