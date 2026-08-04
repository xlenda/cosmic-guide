// O CARD DE COMPARTILHAR A FRASE — fundo cinematográfico + a frase + a marca.
//
// Pedido do dono (04/08/2026): a Frase do Amor não sai mais como texto pelado
// no WhatsApp — sai como um card bonito, com o fundo do dia por trás. O fundo
// vem de /api/daily-cards (gerado uma vez por dia no servidor, ver
// server-patches/scripts/gerar-cards-do-dia.js); a FRASE entra aqui, como
// texto desenhado no canvas, porque ela existe em três línguas e o fundo é um
// só — queimar texto na imagem do servidor custaria três gerações por dia.
//
// POR QUE NÃO IMPORTA react-native: este módulo roda em node:test puro (como
// lib/coupleData.js), e a detecção de ambiente é por capacidade — existe
// `document`? existe `navigator.share`? — não por Platform.OS. No nativo
// (Play/App Store futuro) tudo aqui devolve false e o chamador cai no share
// de texto de sempre; quando a versão nativa precisar de card, entra
// react-native-view-shot POR TRÁS da mesma função, sem mudar quem chama.
//
// O CONTRATO com quem chama (HomeScreen):
//   'compartilhado' — o share sheet abriu e a pessoa confirmou
//   'baixado'       — navegador sem Web Share de arquivo: o PNG foi baixado
//   'cancelado'     — a pessoa ABRIU o share e desistiu (não cair pra outro
//                     diálogo em cima — desistir é desistir)
//   false           — qualquer falha técnica (rede, CORS, canvas): o chamador
//                     faz o share de TEXTO de sempre, que nunca quebra
import { fetchWithTimeout } from './aiClient';

const API_BASE = 'https://api.cosmicguide.cloud';

// Dimensões de story (9:16) — é o formato que WhatsApp/Instagram tratam
// melhor, e o mesmo aspect ratio dos fundos gerados no servidor.
const LARGURA = 1080;
const ALTURA = 1920;

/**
 * Quebra o texto em linhas que caibam em `larguraMax`, medindo com a função
 * dada (no canvas real, ctx.measureText; nos testes, uma régua falsa).
 * Palavra maior que a linha inteira fica sozinha na linha — cortar palavra ao
 * meio numa frase de amor seria pior que estourar 1% da margem.
 */
export function quebrarEmLinhas(texto, medir, larguraMax) {
  const palavras = String(texto || '').trim().split(/\s+/).filter(Boolean);
  const linhas = [];
  let atual = '';
  for (const palavra of palavras) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (medir(tentativa) <= larguraMax || !atual) {
      atual = tentativa;
    } else {
      linhas.push(atual);
      atual = palavra;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

// O fundo do dia, pelo manifesto. Falha qualquer (rede, 404 de quem nunca
// gerou) devolve null — o chamador decide o fallback, nunca este módulo.
async function fundoDoDia(tipo) {
  const resp = await fetchWithTimeout(`${API_BASE}/api/daily-cards`, {}, 8000);
  if (!resp.ok) return null;
  const manifesto = await resp.json();
  const caminho = tipo === 'solo' ? manifesto.solo : manifesto.casal;
  return caminho ? `${API_BASE}${caminho}` : null;
}

function carregarImagem(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Sem crossOrigin o canvas fica "tainted" e toBlob lança — o servidor já
    // manda Access-Control-Allow-Origin (cors() global em server.js).
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('fundo não carregou'));
    img.src = url;
  });
}

// Desenha o fundo em "cover": preenche o canvas inteiro cortando sobra, nunca
// distorce — mesmo comportamento do resizeMode cover do RN.
function desenharCover(ctx, img) {
  const escala = Math.max(LARGURA / img.width, ALTURA / img.height);
  const w = img.width * escala;
  const h = img.height * escala;
  ctx.drawImage(img, (LARGURA - w) / 2, (ALTURA - h) / 2, w, h);
}

function desenharCard(ctx, img, frase, marca) {
  desenharCover(ctx, img);

  // Véu escuro de baixo pra cima: os fundos já pedem "lower third calm and
  // dark" no prompt, mas prompt é pedido, não garantia — o véu garante a
  // legibilidade em qualquer fundo que o gerador entregar.
  const veu = ctx.createLinearGradient(0, ALTURA * 0.4, 0, ALTURA);
  veu.addColorStop(0, 'rgba(8, 5, 26, 0)');
  veu.addColorStop(1, 'rgba(8, 5, 26, 0.85)');
  ctx.fillStyle = veu;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  ctx.textAlign = 'center';

  // A estrela que o app usa como marca visual, acima da frase.
  ctx.font = '64px serif';
  ctx.fillStyle = '#E8C766';
  ctx.fillText('✦', LARGURA / 2, ALTURA * 0.56);

  // A frase — serif itálico, o mesmo clima das telas de leitura do app.
  const corpo = 58;
  ctx.font = `italic ${corpo}px Georgia, 'Times New Roman', serif`;
  ctx.fillStyle = '#F7F0DF';
  const margem = 120;
  const linhas = quebrarEmLinhas(frase, (s) => ctx.measureText(s).width, LARGURA - margem * 2);
  const alturaLinha = corpo * 1.45;
  let y = ALTURA * 0.56 + 110;
  for (const linha of linhas) {
    ctx.fillText(linha, LARGURA / 2, y);
    y += alturaLinha;
  }

  // A marca, no rodapé — quem recebe o card precisa saber de onde veio, senão
  // o compartilhamento não traz ninguém.
  ctx.font = '600 40px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#E8C766';
  ctx.fillText('Cosmic Guide', LARGURA / 2, ALTURA - 150);
  ctx.font = '32px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(247, 240, 223, 0.75)';
  ctx.fillText(marca, LARGURA / 2, ALTURA - 96);
}

/**
 * Monta e compartilha o card. Ver o contrato de retorno no cabeçalho.
 * `tipo`: 'casal' (Frase do Amor) ou 'solo' (Frase do Dia).
 */
export async function compartilharFraseComoCard({ frase, tipo = 'casal', marca = 'cosmicguide.cloud' }) {
  // Capacidade, não plataforma: sem DOM não há canvas — nativo e node caem
  // fora aqui e o chamador segue no share de texto.
  if (typeof document === 'undefined' || !frase) return false;

  try {
    const url = await fundoDoDia(tipo);
    if (!url) return false;
    const img = await carregarImagem(url);

    const canvas = document.createElement('canvas');
    canvas.width = LARGURA;
    canvas.height = ALTURA;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    desenharCard(ctx, img, frase, marca);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return false;
    const arquivo = new File([blob], 'frase-cosmic-guide.png', { type: 'image/png' });

    // Web Share nível 2 (Android/iOS no navegador): o card vai direto pro
    // WhatsApp. O texto vai junto — é ele que carrega o LINK clicável, porque
    // imagem não é clicável e o card sozinho não traria ninguém de volta.
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      try {
        await navigator.share({ files: [arquivo], text: `${frase}\n\n💜 https://cosmicguide.cloud` });
        return 'compartilhado';
      } catch (e) {
        // Desistir no share sheet é decisão, não erro — não empilhar outro
        // diálogo em cima de um "não".
        if (e && e.name === 'AbortError') return 'cancelado';
        return false;
      }
    }

    // Desktop sem Web Share de arquivo: baixa o PNG. A pessoa pediu um card;
    // entregar o arquivo é honrar o pedido do jeito que o navegador permite.
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'frase-cosmic-guide.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 30000);
    return 'baixado';
  } catch {
    return false;
  }
}
