// Sonda temporária de auditoria (NÃO é teste do repo; apagada depois).
const { createCosmicSound, getSkyTuning } = require('../lib/cosmicSound');

const registro = { osc: [], buf: [], ganhos: [], filtros: [], ctxs: [] };
function param(v0) {
  let v = v0;
  return {
    get value() { return v; },
    set value(nv) { v = nv; },
    setValueAtTime(x) { v = x; return this; },
    linearRampToValueAtTime(x) { v = x; return this; },
    exponentialRampToValueAtTime(x) { v = x; return this; },
    cancelScheduledValues() { return this; },
    connect() {},
  };
}
function base(tipo) {
  return { tipo, conectadoA: [], desconectado: false, connect(d) { this.conectadoA.push(d); return d; }, disconnect() { this.desconectado = true; } };
}
class Ctx {
  constructor() { this.state = Ctx.estadoInicial || 'running'; this.sampleRate = 44100; this.currentTime = 0; this.destination = base('destination'); registro.ctxs.push(this); }
  createGain() { const n = Object.assign(base('gain'), { gain: param(1) }); registro.ganhos.push(n); return n; }
  createOscillator() { const n = Object.assign(base('oscillator'), { frequency: param(440), detune: param(0), type: 'sine', iniciado: false, parado: false, onended: null, start() { this.iniciado = true; }, stop() { this.parado = true; } }); registro.osc.push(n); return n; }
  createBiquadFilter() { const n = Object.assign(base('filter'), { frequency: param(350), Q: param(1), type: 'lowpass' }); registro.filtros.push(n); return n; }
  createBufferSource() { const n = Object.assign(base('bufferSource'), { buffer: null, loop: false, iniciado: false, parado: false, onended: null, start() { this.iniciado = true; }, stop() { this.parado = true; } }); registro.buf.push(n); return n; }
  createBuffer(_c, tamanho) { const d = new Float32Array(tamanho); return { length: tamanho, getChannelData: () => d }; }
  async resume() { this.state = 'running'; }
  async suspend() { this.state = 'suspended'; }
  async close() { this.state = 'closed'; }
}
globalThis.AudioContext = Ctx;

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // ---------- 1. custo de boot do céu ----------
  const t0 = process.hrtime.bigint();
  getSkyTuning(new Date('2026-07-30T15:00:00Z'));
  const t1 = process.hrtime.bigint();
  console.log('getSkyTuning 1ª chamada (a que roda no mount do provider):', Number(t1 - t0) / 1e6, 'ms');
  const t2 = process.hrtime.bigint();
  for (let i = 0; i < 20; i++) getSkyTuning(new Date('2026-07-30T15:00:00Z'));
  const t3 = process.hrtime.bigint();
  console.log('getSkyTuning média (20x, já aquecido):', Number(t3 - t2) / 1e6 / 20, 'ms');

  // ---------- 2. CORRIDA: dois start() sem await entre eles ----------
  registro.osc.length = 0; registro.buf.length = 0; registro.ganhos.length = 0;
  const som = createCosmicSound({ fadeInMs: 10, fadeOutMs: 10 });
  const a = som.start();
  const b = som.start();
  const [ra, rb] = await Promise.all([a, b]);
  console.log('\n--- CORRIDA start()+start() sem await ---');
  console.log('resultado A:', JSON.stringify(ra && { ok: ra.ok, motivo: ra.motivo }));
  console.log('resultado B:', JSON.stringify(rb && { ok: rb.ok, motivo: rb.motivo }));
  console.log('osciladores criados:', registro.osc.length, '(esperado 7: 3 drone + 4 LFO)');
  console.log('fontes de ruído criadas:', registro.buf.length, '(esperado 1)');
  console.log('contextos de áudio criados:', registro.ctxs.length, '(esperado 1)');
  const vivos = registro.osc.filter((o) => o.iniciado && !o.parado).length;
  console.log('osciladores TOCANDO agora:', vivos);
  console.log('inspecionar():', JSON.stringify(som.inspecionar().nos), 'nós');

  await som.stop();
  await espera(120);
  console.log('depois do stop -> nós:', som.inspecionar().nos, '| fontes:', som.inspecionar().fontes, '| timers:', som.inspecionar().temporizadores);
  const orfaos = registro.osc.filter((o) => o.iniciado && !o.parado);
  console.log('osciladores órfãos (iniciados e nunca parados):', orfaos.length);
  const naoDesconectados = registro.osc.filter((o) => !o.desconectado);
  console.log('osciladores nunca desconectados:', naoDesconectados.length);

  // ---------- 3. play/pause 20x ----------
  console.log('\n--- 20x play/pause ---');
  registro.osc.length = 0; registro.buf.length = 0; registro.ganhos.length = 0; registro.filtros.length = 0;
  const som2 = createCosmicSound({ fadeInMs: 5, fadeOutMs: 5 });
  for (let i = 0; i < 20; i++) {
    await som2.start();
    await som2.stop();
    await espera(80);
  }
  const insp = som2.inspecionar();
  console.log('nós vivos no fim:', insp.nos, '| fontes:', insp.fontes, '| timers:', insp.temporizadores);
  console.log('total de osciladores criados em 20 ciclos:', registro.osc.length);
  console.log('osciladores ainda tocando:', registro.osc.filter((o) => o.iniciado && !o.parado).length);
  console.log('nós nunca desconectados:', [...registro.osc, ...registro.ganhos, ...registro.filtros, ...registro.buf].filter((n) => !n.desconectado).length);
  console.log('contextos de áudio criados no total:', registro.ctxs.length);
  await som2.dispose();

  // ---------- 4. play, depois pause imediato (antes do start resolver) ----------
  console.log('\n--- pause logo depois do play (sem esperar) ---');
  const som3 = createCosmicSound({ fadeInMs: 5, fadeOutMs: 5 });
  const p1 = som3.start();
  const p2 = som3.stop();
  await Promise.all([p1, p2]);
  await espera(80);
  console.log('isPlaying depois de play+pause imediato:', som3.isPlaying(), '(a pessoa apertou pausar)');
  console.log('nós vivos:', som3.inspecionar().nos);
  await som3.dispose();

  // ---------- 5. O CASO REAL DO NAVEGADOR: contexto nasce SUSPENSO ----------
  // Chrome/Safari criam o AudioContext em 'suspended' até o primeiro gesto.
  // Aí o `await ctx.resume()` de start() EXISTE de verdade e abre uma janela
  // de interleaving que o mock 'running' nunca exercita.
  console.log('\n--- CONTEXTO SUSPENSO (1º play real no navegador) ---');
  Ctx.estadoInicial = 'suspended';
  registro.osc.length = 0; registro.buf.length = 0; registro.ganhos.length = 0; registro.filtros.length = 0; registro.ctxs.length = 0;
  const som4 = createCosmicSound({ fadeInMs: 10, fadeOutMs: 10 });
  const c1 = som4.start();
  const c2 = som4.start();
  const [rc1, rc2] = await Promise.all([c1, c2]);
  console.log('resultado A:', JSON.stringify(rc1 && { ok: rc1.ok, motivo: rc1.motivo }));
  console.log('resultado B:', JSON.stringify(rc2 && { ok: rc2.ok, motivo: rc2.motivo }));
  console.log('osciladores criados:', registro.osc.length, '(esperado 7)');
  console.log('fontes de ruído:', registro.buf.length, '(esperado 1)');
  console.log('contextos:', registro.ctxs.length, '(esperado 1)');
  console.log('osciladores TOCANDO:', registro.osc.filter((o) => o.iniciado && !o.parado).length);
  console.log('nós registrados no motor:', som4.inspecionar().nos);
  await som4.stop();
  await espera(140);
  console.log('depois do stop -> nós:', som4.inspecionar().nos);
  const orf2 = registro.osc.filter((o) => o.iniciado && !o.parado);
  console.log('OSCILADORES ÓRFÃOS (tocando pra sempre, fora do registro):', orf2.length);
  await som4.dispose();

  // ---------- 6. play + pause imediato com contexto suspenso ----------
  console.log('\n--- play + pause imediato, contexto suspenso ---');
  const som5 = createCosmicSound({ fadeInMs: 5, fadeOutMs: 5 });
  const d1 = som5.start();
  const d2 = som5.stop();
  await Promise.all([d1, d2]);
  await espera(120);
  console.log('isPlaying depois de play+pause:', som5.isPlaying(), '(a pessoa apertou PAUSAR — deveria ser false)');
  console.log('nós vivos:', som5.inspecionar().nos, '(deveria ser 0)');
  await som5.dispose();

  process.exit(0);
})();
