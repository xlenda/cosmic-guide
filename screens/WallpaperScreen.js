// screens/WallpaperScreen.js
// PAPEL DE PAREDE DO CÉU — a tela que desenha e entrega o PNG 1080×1920.
//
// LEIA lib/wallpaper.js ANTES DE MEXER EM QUALQUER TEXTO DESTA TELA: toda a
// decisão de conteúdo (gradiente, glifo, frase, fallback honesto) mora lá e é
// travada por test/wallpaper.test.js. Aqui só existe desenho e download.
//
// WEB-ONLY, DECLARADO: o desenho usa <canvas> do DOM e o download usa
// toDataURL + <a download> — nada disso existe no runtime nativo. Em
// Platform.OS !== 'web' a tela mostra o céu de hoje (dados reais, os mesmos)
// e diz com todas as letras que baixar a imagem é da versão web por enquanto.
// Mesma postura de LojaScreen.js (recompensas webOnly): nunca vender um botão
// que não funciona na plataforma.
//
// ESTÉTICA (regra desta feature): fundo escuro, dourado/roxo da casa e MUITO
// espaço vazio — papel de parede bom é quase vazio, porque em cima dele vivem
// relógio, ícones e notificações. Por isso o desenho é: gradiente, a Lua, um
// glifo, uma linha de fase, uma frase, a data e a marca pequena. Nada mais.
//
// O REDESENHO DE 01/08/2026 (o dono viu e disse "o papel de parede está
// horrível", e tinha razão): a Lua virou a HEROÍNA da imagem e passou a ser
// desenhada de verdade — terminador a partir da iluminação medida e lado a
// partir do nome da fase — no lugar da bolinha cinza chapada de raio 34 que
// aparecia sob um rótulo dizendo "92% iluminada". Nada de texto novo entrou:
// a mudança é toda de traço e de composição (mais respiro, hierarquia Lua →
// glifo → frase, tipografia maior, gradiente com profundidade e estrelas mais
// presentes mas fora da faixa de leitura). A regra do "quase vazio" continua
// valendo e é por isso que NADA foi acrescentado ao conteúdo.
//
// OS TEXTOS SAÍRAM DAQUI em 31/07/2026 (era o TODO que este cabeçalho
// prometia). Foram pra lib/wallpaper.js — TELA_PT e textosDaTela(lang), com
// packs em lib/traducoes/wallpaper.es.js e .en.js — porque é lá que a feature
// inteira mora e é lá que o teste já varre a linha vermelha. Esta tela voltou
// a ser só desenho e download: recebe o idioma do useLanguage() e repassa.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { getWallpaperData, textosDaTela } from '../lib/wallpaper';
import { useLanguage } from '../context/LanguageContext';
import { localDayStr } from '../lib/localDay';

// ---------------------------------------------------------------------------
// DESENHO — funções puras de canvas (só rodam na web)
// ---------------------------------------------------------------------------
const LARGURA = 1080;
const ALTURA = 1920;

// PRNG mulberry32 semeado pelo dia: as estrelas do fundo caem SEMPRE no mesmo
// lugar dentro do mesmo dia. Importa porque a pessoa pode baixar de manhã e de
// noite — o arquivo tem que sair idêntico, senão parece bug ("baixei de novo e
// veio outro").
function prngDoDia(diaStr) {
  let h = 2166136261;
  for (let i = 0; i < diaStr.length; i++) {
    h ^= diaStr.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let s = h >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Quebra a frase em linhas que cabem na largura útil. measureText em vez de
// contar caracteres: "iluminada" e "fim" têm larguras muito diferentes.
function quebrarLinhas(ctx, texto, larguraMax) {
  const palavras = String(texto).split(' ');
  const linhas = [];
  let atual = '';
  for (const p of palavras) {
    const tentativa = atual ? `${atual} ${p}` : p;
    if (ctx.measureText(tentativa).width <= larguraMax || !atual) {
      atual = tentativa;
    } else {
      linhas.push(atual);
      atual = p;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

// Espaçamento de letras "de pobre": canvas 2D não tem letter-spacing portátil,
// e a linha pequena em caps (LUA EM ESCORPIÃO) precisa respirar.
function espacar(texto) {
  return String(texto).toUpperCase().split('').join(' ');
}

// ---------------------------------------------------------------------------
// A LUA — a fase desenhada de verdade (01/08/2026)
// ---------------------------------------------------------------------------
// O que existia aqui era um MEDIDOR: bolinha cinza de raio 34 com alfa =
// iluminação, e um comentário assumindo que desenhar a fase "exigiria
// terminadores e lado certo por hemisfério". Exige mesmo — e as duas coisas
// estavam ao alcance o tempo todo: a largura do terminador sai da iluminação
// MEDIDA e o lado sai do NOME canônico da fase (crescente/minguante). A
// decisão inteira mora em formaDaLua(), lib/wallpaper.js §2.b, junto com o
// parágrafo do hemisfério (convenção NORTE declarada — a mesma dos emojis
// 🌑🌒🌓 que o app já imprime no Calendário Lunar — e nenhum texto da imagem
// afirma lado nenhum). Aqui embaixo é só o traço.
//
// A GEOMETRIA: disco escuro sempre por baixo (o resto da Lua continua lá, só
// não está aceso) e, por cima, a região iluminada recortada por
//   · limbo      = meia circunferência do lado aceso;
//   · terminador = meia ELIPSE de semi-largura R·|2k−1|, k = fração iluminada.
// k=0,5 dá largura zero (a reta do quarto), k=1 dá largura R (o terminador
// vira o próprio limbo e o disco fecha). A elipse abaúla pro lado ESCURO
// quando k>0,5 (gibosa) e pro lado ACESO quando k<0,5 (crescente fino) — é o
// mesmo caminho, só muda o sentido do arco.
const LIMBO_TOPO = -Math.PI / 2;
const LIMBO_BASE = Math.PI / 2;

function desenharLua(ctx, cx, cy, R, forma, iluminacao) {
  const luz = forma ? forma.luz : Math.max(0, Math.min(1, (iluminacao || 0) / 100));

  // Auréola: o brilho que a Lua joga no céu ao redor, proporcional à luz real
  // — Nova quase não tem, Cheia acende o entorno. É o que dá profundidade ao
  // gradiente sem encher a imagem de coisa nova.
  const halo = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 3.1);
  halo.addColorStop(0, `rgba(255, 246, 226, ${(0.04 + 0.15 * luz).toFixed(3)})`);
  halo.addColorStop(0.4, `rgba(196, 172, 255, ${(0.02 + 0.07 * luz).toFixed(3)})`);
  halo.addColorStop(1, 'rgba(196, 172, 255, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 3.1, 0, Math.PI * 2);
  ctx.fill();

  // Lado escuro: disco só um pouco mais claro que o fundo. Sem ele a Lua Nova
  // sumiria e o crescente pareceria uma foice solta no céu.
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(150, 138, 200, 0.12)';
  ctx.fill();

  // Aro: quase some quando a Lua está cheia (não há o que contornar) e é o
  // desenho inteiro quando ela está nova.
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = `rgba(236, 229, 255, ${(0.1 + 0.16 * (1 - luz)).toFixed(3)})`;
  ctx.stroke();

  // SEM FORMA: fase com nome desconhecido (alguém renomeou em
  // lib/lunarCalendar.js). Não dá pra saber o lado sem chutar, então volta o
  // medidor de antes — feio, mas não mente. Ver formaDaLua() no lib.
  if (!forma) {
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(243, 238, 255, ${(0.8 * luz).toFixed(3)})`;
    ctx.fill();
    return;
  }

  // Lua Nova: disco apagado com o aro tênue que já foi desenhado acima, e
  // ponto. Traçar o fiapo de luz exigiria escolher um lado que o nome da fase
  // não dá (a fatia vai de um fiapo minguante a um fiapo crescente) — e são
  // ≤4% de iluminação, que nesta escala é meio pixel.
  if (forma.direcao === 'nova') return;

  ctx.save();
  // Espelhar em torno do próprio centro evita escrever o caminho duas vezes:
  // desenha-se sempre a Lua acesa à DIREITA e vira-se quando o lado é o
  // esquerdo. x → 2·cx − x.
  if (forma.ladoIluminado === 'esquerda') {
    ctx.translate(2 * cx, 0);
    ctx.scale(-1, 1);
  }

  ctx.beginPath();
  if (forma.direcao === 'cheia') {
    // ≥96% de iluminação: o disco fecha. O fio escuro que sobraria também
    // dependeria de um lado que o nome da fase não informa.
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
  } else {
    const semiLargura = R * forma.larguraTerminador;
    ctx.arc(cx, cy, R, LIMBO_TOPO, LIMBO_BASE, false);
    ctx.ellipse(cx, cy, semiLargura, R, 0, LIMBO_BASE, LIMBO_TOPO, forma.luz < 0.5);
    ctx.closePath();
  }
  ctx.clip();

  // A superfície acesa: gradiente radial puxado pro limbo iluminado, que é o
  // que faz o disco parecer esfera e não moeda recortada.
  const superficie = ctx.createRadialGradient(cx + R * 0.32, cy - R * 0.3, R * 0.08, cx, cy, R * 1.2);
  superficie.addColorStop(0, '#FFFDF6');
  superficie.addColorStop(0.55, '#F2ECFF');
  superficie.addColorStop(1, '#C6B8E6');
  ctx.fillStyle = superficie;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Estrelas do fundo: mais presentes que antes (150 contra 42) e ainda
// discretas. Duas regras dão céu sem virar confete:
//   · alfa e raio saem de rnd() elevado a potência — muitas fraquinhas, poucas
//     fortes, que é como o céu se distribui;
//   · a FAIXA DE LEITURA (a coluna central onde vivem frase e data) recebe um
//     terço do brilho. O comentário antigo prometia exatamente isso e o código
//     não fazia nada a respeito.
function desenharEstrelas(ctx, rnd, faixa) {
  for (let i = 0; i < 150; i++) {
    const x = rnd() * LARGURA;
    const y = rnd() * ALTURA;
    const semente = rnd();
    const raio = 0.7 + Math.pow(rnd(), 2.6) * 2.1;
    const naFaixa = y > faixa.topo && y < faixa.base && Math.abs(x - LARGURA / 2) < 440;
    const alfa = (0.06 + Math.pow(semente, 2.2) * 0.5) * (naFaixa ? 0.34 : 1);

    ctx.beginPath();
    ctx.arc(x, y, raio, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(243, 238, 255, ${alfa.toFixed(3)})`;
    ctx.fill();

    // Um punhado das mais fortes ganha o riscado de quatro pontas — só fora da
    // faixa de leitura, e fino o bastante pra ninguém reparar de propósito.
    if (semente > 0.93 && !naFaixa) {
      const braco = raio * 5.5;
      ctx.strokeStyle = `rgba(243, 238, 255, ${(alfa * 0.5).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - braco, y);
      ctx.lineTo(x + braco, y);
      ctx.moveTo(x, y - braco);
      ctx.lineTo(x, y + braco);
      ctx.stroke();
    }
  }
}

// LAYOUT — duas variantes, porque o herói muda com o que o céu deu. Com céu, a
// Lua é o herói e o glifo do signo é o segundo. Sem céu não existe Lua pra
// desenhar (desenhar uma seria inventar), então o glifo neutro sobe e ocupa o
// lugar dela em vez de deixar um buraco no meio da imagem.
//
// A área de cima (até ~460) e a de baixo (a partir de ~1700) ficam VAZIAS de
// propósito: é onde o sistema põe relógio, notificações e os atalhos da tela
// de bloqueio. Papel de parede bom é quase vazio.
const LAYOUT_COM_LUA = {
  luaY: 660,
  luaR: 168,
  faseY: 946,
  glifoY: 1190,
  glifoPx: 170,
  capsY: 1268,
  fraseCentroY: 1480,
  faixaTexto: { topo: 900, base: 1700 },
};

const LAYOUT_SEM_LUA = {
  luaY: null,
  luaR: 0,
  faseY: null,
  glifoY: 800,
  glifoPx: 250,
  capsY: 930,
  fraseCentroY: 1320,
  faixaTexto: { topo: 860, base: 1700 },
};

// `T` entra por argumento (e não mais como constante de módulo) porque os
// rótulos agora dependem do idioma. O DESENHO em si não depende: gradiente,
// glifo, estrelas e a forma da Lua saem iguais nos três.
function desenhar(canvas, d, T) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const temLua = d.ceuDisponivel && Number.isFinite(d.iluminacao);
  const L = temLua ? LAYOUT_COM_LUA : LAYOUT_SEM_LUA;
  const meio = LARGURA / 2;

  // --- fundo: o gradiente da fase, vertical ---
  // As paradas não são mais equidistantes: a escura segura mais tempo no topo
  // (posição elevada a 1.35) e a clara só abre embaixo. É o que dá
  // PROFUNDIDADE — com paradas lineares o fundo lê como faixa chapada.
  const grad = ctx.createLinearGradient(0, 0, 0, ALTURA);
  const n = d.gradiente.length;
  d.gradiente.forEach((cor, i) => grad.addColorStop(n > 1 ? Math.pow(i / (n - 1), 1.35) : 0, cor));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  // --- estrelas, determinísticas pelo dia ---
  const rnd = prngDoDia(d.dia);
  desenharEstrelas(ctx, rnd, L.faixaTexto);

  // Vinhetas: escurecem topo e base. A de cima devolve contraste pro relógio
  // do sistema, a de baixo assenta a composição e segura data e marca.
  const vinhetaTopo = ctx.createLinearGradient(0, 0, 0, 460);
  vinhetaTopo.addColorStop(0, 'rgba(0, 0, 0, 0.32)');
  vinhetaTopo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = vinhetaTopo;
  ctx.fillRect(0, 0, LARGURA, 460);

  const vinhetaBase = ctx.createLinearGradient(0, ALTURA - 620, 0, ALTURA);
  vinhetaBase.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vinhetaBase.addColorStop(1, 'rgba(0, 0, 0, 0.36)');
  ctx.fillStyle = vinhetaBase;
  ctx.fillRect(0, ALTURA - 620, LARGURA, 620);

  // --- A LUA, herói da imagem ---
  if (temLua) desenharLua(ctx, meio, L.luaY, L.luaR, d.lua, d.iluminacao);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // --- o rótulo da fase, logo abaixo da Lua: é ela que ele descreve ---
  // Fase e iluminação são as MESMAS no mundo inteiro; nada neste rótulo
  // depende de hemisfério (ver lib/wallpaper.js §2.b).
  if (temLua) {
    ctx.fillStyle = 'rgba(214, 203, 244, 0.92)';
    ctx.font = '400 36px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${d.faseTexto} · ${d.iluminacao}% ${T.iluminada}`, meio, L.faseY);
  }

  // --- glifo dourado: o segundo herói ---
  // \uFE0E (variation selector-15) força apresentação de TEXTO: sem ele,
  // Android/Chrome renderizam ♈–♓ como emoji colorido e ignoram o fillStyle
  // dourado. O glifo neutro (✦) não tem forma emoji, mas o seletor não o
  // atrapalha. Escape explícito, nunca o caractere invisível colado na string:
  // invisível em editor é convite pra alguém apagar sem saber.
  ctx.fillStyle = colors.gold;
  ctx.font = `300 ${L.glifoPx}px Georgia, "Times New Roman", serif`;
  ctx.fillText(d.glifo + '\uFE0E', meio, L.glifoY);

  // --- linha pequena: signo lunar (céu real) ou regente do dia (fallback) ---
  // O regente é aritmética de semana e continua verdadeiro sem efeméride —
  // é o mesmo dado honesto que getSkyTuning mantém no ramo sem céu.
  ctx.fillStyle = 'rgba(196, 184, 230, 0.85)';
  ctx.font = '600 30px system-ui, -apple-system, sans-serif';
  // *Texto e não os canônicos: `signoLua`/`regente` continuam em português em
  // qualquer idioma de propósito (são chave de cálculo em lib/wallpaper.js).
  const linhaPequena = d.signoLuaTexto
    ? `${T.luaEm} ${d.signoLuaTexto}`
    : d.regenteTexto
    ? `${T.diaDe} ${d.regenteTexto}`
    : '';
  if (linhaPequena) ctx.fillText(espacar(linhaPequena), meio, L.capsY);

  // --- a frase do dia: maior e mais legível que antes (42 → 48) ---
  ctx.fillStyle = 'rgba(246, 242, 255, 0.95)';
  ctx.font = '400 48px Georgia, "Times New Roman", serif';
  const linhas = quebrarLinhas(ctx, d.frase, 810);
  const alturaLinha = 72;
  let y = L.fraseCentroY - ((linhas.length - 1) * alturaLinha) / 2;
  for (const linha of linhas) {
    ctx.fillText(linha, meio, y);
    y += alturaLinha;
  }

  // --- data ---
  ctx.fillStyle = 'rgba(196, 184, 230, 0.72)';
  ctx.font = '400 34px system-ui, -apple-system, sans-serif';
  ctx.fillText(d.dataFormatada, meio, y + 96);

  // --- marca: pequena e apagada, no rodapé, e só ---
  ctx.fillStyle = 'rgba(196, 184, 230, 0.42)';
  ctx.font = '400 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(d.marca, meio, ALTURA - 86);
}

export default function WallpaperScreen() {
  const navigation = useNavigation();
  const canvasRef = useRef(null);
  const [recado, setRecado] = useState(null);
  const ehWeb = Platform.OS === 'web';
  const { lang } = useLanguage();
  const T = textosDaTela(lang);

  // Por DIA LOCAL e por idioma. O comentário antigo dizia que não havia o que
  // atualizar durante a sessão — e isso não se sustenta neste app: ele é feito
  // pra ficar aberto por horas (o Som do Céu existe exatamente pra isso). Com
  // a dependência só em `lang`, quem passasse da meia-noite com a tela aberta
  // baixaria o papel de parede do céu de ONTEM, com a data de ontem impressa.
  // Mesmo padrão de todayISO em HomeScreen.js.
  const diaLocal = localDayStr();
  const dados = useMemo(() => getWallpaperData(new Date(), lang), [lang, diaLocal]);

  useEffect(() => {
    if (!ehWeb) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      desenhar(canvas, dados, T);
    } catch {
      // Canvas indisponível (navegador muito velho): a tela ainda mostra os
      // dados em texto logo abaixo — não há o que quebrar.
    }
  }, [ehWeb, dados, T]);

  function baixar() {
    setRecado(null);
    try {
      const canvas = canvasRef.current;
      if (!canvas || typeof document === 'undefined') {
        setRecado(T.falhou);
        return;
      }
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `ceu-${dados.dia}.png`;
      document.body.appendChild(a);
      a.click();
      a.parentNode.removeChild(a);
      setRecado(T.baixado);
    } catch {
      setRecado(T.falhou);
    }
  }

  return (
    <View style={styles.root}>
      <GradientHeader
        title={T.titulo}
        subtitle={T.subtitulo}
        onBack={() => navigation.goBack()}
        gradient={gradients.purple}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {ehWeb ? (
          // -----------------------------------------------------------------
          // WEB: o canvas É a prévia — o que se vê é byte a byte o que baixa.
          // Elemento DOM direto dentro do react-native-web (que renderiza via
          // react-dom); no nativo este ramo nunca monta.
          // -----------------------------------------------------------------
          <View style={styles.previewWrap}>
            <canvas
              ref={canvasRef}
              width={LARGURA}
              height={ALTURA}
              style={{
                width: '100%',
                maxWidth: 300,
                aspectRatio: '9 / 16',
                borderRadius: 24,
                border: `1px solid ${colors.border}`,
                display: 'block',
              }}
            />
          </View>
        ) : (
          // -----------------------------------------------------------------
          // NATIVO: prévia aproximada em RN + aviso honesto de que o download
          // é web por enquanto. Os DADOS são os mesmos — só o PNG é que não
          // nasce aqui.
          // -----------------------------------------------------------------
          <View style={[styles.previewNativo, { backgroundColor: dados.gradiente[0] }]}>
            <Text style={styles.glifoNativo}>{dados.glifo}</Text>
            {dados.signoLuaTexto ? (
              <Text style={styles.linhaPequena}>{`${T.luaEm} ${dados.signoLuaTexto.toUpperCase()}`}</Text>
            ) : dados.regenteTexto ? (
              <Text style={styles.linhaPequena}>{`${T.diaDe} ${dados.regenteTexto.toUpperCase()}`}</Text>
            ) : null}
            {dados.faseTexto && Number.isFinite(dados.iluminacao) ? (
              <Text style={styles.faseNativo}>{`${dados.faseTexto} · ${dados.iluminacao}% ${T.iluminada}`}</Text>
            ) : null}
            <Text style={styles.fraseNativo}>{dados.frase}</Text>
            <Text style={styles.dataNativo}>{dados.dataFormatada}</Text>
            <Text style={styles.marcaNativo}>{dados.marca}</Text>
          </View>
        )}

        {!dados.ceuDisponivel ? <Text style={styles.avisoSemCeu}>{T.semCeu}</Text> : null}

        {ehWeb ? (
          <TouchableOpacity style={styles.botaoBaixar} onPress={baixar} activeOpacity={0.8}>
            <Ionicons name="download-outline" size={20} color={colors.background} />
            <Text style={styles.botaoBaixarTexto}>{T.baixar}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.cartaoSoWeb}>
            <Ionicons name="globe-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.cartaoSoWebTexto}>{T.soWeb}</Text>
          </View>
        )}

        {recado ? <Text style={styles.recado}>{recado}</Text> : null}

        {/* A nota de tamanho descreve o PNG de 1080×1920 — que só existe na
            web. No nativo o cartão soWeb acima já disse a verdade; repetir a
            medida do arquivo aqui seria vender um download que não acontece
            nesta plataforma (regra do cabeçalho). */}
        {ehWeb ? <Text style={styles.nota}>{T.tamanho}</Text> : null}
        <Text style={styles.nota}>{T.amanha}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48, alignItems: 'center' },
  previewWrap: { width: '100%', alignItems: 'center', marginTop: 8 },
  previewNativo: {
    width: '100%',
    maxWidth: 300,
    aspectRatio: 9 / 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  glifoNativo: { color: colors.gold, fontSize: 96, marginBottom: 12 },
  linhaPequena: { color: colors.textSecondary, fontSize: 12, letterSpacing: 3, marginBottom: 16 },
  faseNativo: { color: colors.textSecondary, fontSize: 12, marginBottom: 24 },
  fraseNativo: { color: colors.text, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  dataNativo: { color: colors.textMuted, fontSize: 12, marginBottom: 32 },
  marcaNativo: { color: colors.textMuted, fontSize: 10, opacity: 0.7 },
  avisoSemCeu: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 320,
  },
  botaoBaixar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 8,
  },
  botaoBaixarTexto: { color: colors.background, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  cartaoSoWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 20,
    maxWidth: 340,
    gap: 10,
  },
  cartaoSoWebTexto: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, flex: 1 },
  recado: { color: colors.teal, fontSize: 13, textAlign: 'center', marginTop: 14, maxWidth: 320 },
  nota: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 12 },
});
