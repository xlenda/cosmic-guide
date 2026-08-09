// lib/elementos.js
// "Seus elementos" — quanto do céu de nascimento cai em cada elemento
// (Fogo/Terra/Ar/Água), em porcentagem.
//
// ISTO É ARITMÉTICA, NÃO LEITURA. O número que a tela mostra é uma contagem:
// cada um dos 10 planetas clássicos está num signo, cada signo pertence a um
// elemento (a atribuição é a da tradição, a mesma que lib/signs.js já carrega
// em SIGNS[].element), e a porcentagem é contagem × 10 — dez planetas, então
// a soma dá SEMPRE 100, sem arredondamento e sem ajuste cosmético. É o único
// tipo de porcentagem que a doutrina deste app permite: a que sai de uma conta
// que qualquer pessoa pode refazer olhando a própria lista de posições que a
// tela do Mapa já mostra. A LEITURA do que isso significa mora no i18n
// ([BLOCO-ELEMENTOS] em lib/i18n.js), como convite ("repare se..."), nunca
// como promessa — este módulo só entrega números e nomes.
//
// NUNCA FABRICA: tudo vem de planetPositions (lib/signs.js). Sem data válida
// ou sem astronomy-engine, planetPositions devolve null e este módulo repassa
// o null — a seção da tela simplesmente não aparece. Sem hora, vale a mesma
// aproximação de meio-dia que planetPositions já usa pra Lua (validada lá);
// a tela diz isso no recibo quando for o caso.
//
// EMPATE NO DOMINANTE: com 10 planetas e 4 elementos, empate no topo é comum
// (5-5, 4-4, 3-3...). Regra deste módulo, decidida aqui e travada em teste:
// `dominante` é a STRING do elemento quando um só lidera, e o ARRAY dos
// empatados (na ordem fixa fogo/terra/ar/agua) quando a maior contagem se
// repete — quem consome decide o texto de equilíbrio; inventar um desempate
// (ex.: "Sol vale mais") seria pôr leitura dentro da conta.
import { planetPositions, SIGNS } from './signs';

// Ordem fixa de exibição e de desempate — a ordem clássica dos elementos.
export const ELEMENTOS = ['fogo', 'terra', 'ar', 'agua'];

// SIGNS usa 'água' COM acento (é texto de exibição legado); as chaves deste
// módulo são identificadores (viram chave de i18n, de estilo e de teste),
// então saem sem acento. Só a água muda.
const CHAVE_DO_ELEMENTO = { fogo: 'fogo', terra: 'terra', ar: 'ar', 'água': 'agua' };

// Distribuição de elementos do céu de nascimento.
//   distribuicaoDeElementos('1990-05-15', '08:30', city) →
//     { contagem: {fogo, terra, ar, agua},        soma 10
//       pct: {fogo, terra, ar, agua},             contagem × 10, soma 100
//       dominante: 'terra' | ['fogo', 'ar'],      string ou array (empate)
//       planetasPorElemento: {fogo: ['Sol', ...], ...},
//       total: 10 }
// ou null (sem data válida / sem motor — nunca um chute).
// `city` é opcional e segue a MESMA convenção de buildChart na tela do Mapa:
// o objeto de cidade inteiro, que planetPositions resolve pra fuso IANA com
// horário de verão do instante certo (ver offsetHorasDe em lib/signs.js).
export function distribuicaoDeElementos(dateStr, timeStr, city) {
  const positions = planetPositions(dateStr, timeStr, city || undefined);
  if (!positions) return null;

  // Mapas indexados por chave derivada do input → sem protótipo, regra da casa.
  const contagem = Object.create(null);
  const planetasPorElemento = Object.create(null);
  for (const el of ELEMENTOS) {
    contagem[el] = 0;
    planetasPorElemento[el] = [];
  }

  for (const { planet, longitude } of positions) {
    // planetPositions já normaliza pra 0–360, mas normalizar de novo é barato
    // e evita que um índice fora de SIGNS derrube a tela se aquilo mudar.
    const lon = ((longitude % 360) + 360) % 360;
    const signo = SIGNS[Math.floor(lon / 30)];
    const el = CHAVE_DO_ELEMENTO[signo.element];
    contagem[el] += 1;
    planetasPorElemento[el].push(planet);
  }

  const pct = Object.create(null);
  for (const el of ELEMENTOS) pct[el] = contagem[el] * 10;

  const maior = Math.max(...ELEMENTOS.map((el) => contagem[el]));
  const empatados = ELEMENTOS.filter((el) => contagem[el] === maior);
  const dominante = empatados.length === 1 ? empatados[0] : empatados;

  return { contagem, pct, dominante, planetasPorElemento, total: positions.length };
}
