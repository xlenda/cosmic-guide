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
// relógio, ícones e notificações. Por isso o desenho é: gradiente, um glifo,
// uma linha de fase, uma frase, a data e a marca pequena. Nada mais.
//
// TEXTOS DIRETO EM PT, de propósito: nesta fase lib/i18n.js é território do
// integrador da fase 2 — quando ele plugar a rota, promove estas constantes a
// chaves de i18n sem mexer no resto.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { getWallpaperData } from '../lib/wallpaper';

const T = {
  titulo: 'Papel de Parede',
  subtitulo: 'O céu de hoje na sua tela',
  baixar: 'BAIXAR PAPEL DE PAREDE',
  baixado: 'Baixado. Agora é só definir como papel de parede nas configurações do celular.',
  falhou: 'Não deu pra gerar a imagem agora. Tenta de novo.',
  tamanho: '1080 × 1920 — cabe em qualquer tela de celular.',
  amanha: 'Amanhã o céu muda — e o desenho muda junto. Volta aqui.',
  soWeb: 'Baixar a imagem é da versão web por enquanto. Abre cosmicguide.cloud no navegador do celular que o botão aparece.',
  semCeu: 'A posição da Lua não pôde ser calculada agora — o desenho de hoje é neutro e diz isso na própria frase.',
  luaEm: 'LUA EM',
  diaDe: 'DIA DE',
  iluminada: 'iluminada',
};

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

function desenhar(canvas, d) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // --- fundo: o gradiente da fase, vertical ---
  const grad = ctx.createLinearGradient(0, 0, 0, ALTURA);
  const n = d.gradiente.length;
  d.gradiente.forEach((cor, i) => grad.addColorStop(n > 1 ? i / (n - 1) : 0, cor));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  // --- estrelas: poucas e fracas, determinísticas pelo dia ---
  // 42 pontos com alfa 0.04–0.22: textura, não protagonismo. A faixa central
  // (onde ficam glifo e frase) recebe menos, pra não sujar a leitura.
  const rnd = prngDoDia(d.dia);
  for (let i = 0; i < 42; i++) {
    const x = rnd() * LARGURA;
    const y = rnd() * ALTURA;
    const raio = 0.8 + rnd() * 1.6;
    const alfa = 0.04 + rnd() * 0.18;
    ctx.beginPath();
    ctx.arc(x, y, raio, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(243, 238, 255, ${alfa.toFixed(3)})`;
    ctx.fill();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // --- glifo grande, dourado ---
  // \uFE0E (variation selector-15) força apresentação de TEXTO: sem ele,
  // Android/Chrome renderizam ♈–♓ como emoji colorido e ignoram o fillStyle
  // dourado. O glifo neutro (✦) não tem forma emoji, mas o seletor não o
  // atrapalha. Escape explícito, nunca o caractere invisível colado na string:
  // invisível em editor é convite pra alguém apagar sem saber.
  ctx.fillStyle = colors.gold;
  ctx.font = '300 300px Georgia, "Times New Roman", serif';
  ctx.fillText(d.glifo + '\uFE0E', LARGURA / 2, 740);

  // --- linha pequena: signo lunar (céu real) ou regente do dia (fallback) ---
  // O regente é aritmética de semana e continua verdadeiro sem efeméride —
  // é o mesmo dado honesto que getSkyTuning mantém no ramo sem céu.
  ctx.fillStyle = 'rgba(196, 184, 230, 0.9)';
  ctx.font = '600 34px system-ui, -apple-system, sans-serif';
  const linhaPequena = d.signoLua
    ? `${T.luaEm} ${d.signoLua}`
    : d.regente
    ? `${T.diaDe} ${d.regente}`
    : '';
  if (linhaPequena) ctx.fillText(espacar(linhaPequena), LARGURA / 2, 850);

  // --- disco da Lua: preenchimento proporcional à iluminação REAL ---
  // Não é um desenho de fase geométrico (isso exigiria terminadores e lado
  // certo por hemisfério); é um medidor honesto: contorno sempre, miolo com
  // alfa = iluminação. Lua Nova = anel vazio, Cheia = disco aceso.
  if (d.ceuDisponivel && Number.isFinite(d.iluminacao)) {
    const cx = LARGURA / 2;
    const cy = 990;
    const raio = 34;
    ctx.beginPath();
    ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(243, 238, 255, ${(0.85 * d.iluminacao) / 100})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 200, 92, 0.8)';
    ctx.stroke();

    ctx.fillStyle = 'rgba(196, 184, 230, 0.85)';
    ctx.font = '400 30px system-ui, -apple-system, sans-serif';
    const rotuloFase = `${d.fase} · ${d.iluminacao}% ${T.iluminada}`;
    ctx.fillText(rotuloFase, LARGURA / 2, 1080);
  }

  // --- a frase do dia ---
  ctx.fillStyle = 'rgba(243, 238, 255, 0.95)';
  ctx.font = '400 42px Georgia, "Times New Roman", serif';
  const linhas = quebrarLinhas(ctx, d.frase, 800);
  const alturaLinha = 62;
  let y = 1330 - ((linhas.length - 1) * alturaLinha) / 2;
  for (const linha of linhas) {
    ctx.fillText(linha, LARGURA / 2, y);
    y += alturaLinha;
  }

  // --- data ---
  ctx.fillStyle = 'rgba(196, 184, 230, 0.7)';
  ctx.font = '400 32px system-ui, -apple-system, sans-serif';
  ctx.fillText(d.dataFormatada, LARGURA / 2, y + 70);

  // --- marca: pequena e apagada, no rodapé, e só ---
  ctx.fillStyle = 'rgba(196, 184, 230, 0.45)';
  ctx.font = '400 28px system-ui, -apple-system, sans-serif';
  ctx.fillText(d.marca, LARGURA / 2, ALTURA - 90);
}

export default function WallpaperScreen() {
  const navigation = useNavigation();
  const canvasRef = useRef(null);
  const [recado, setRecado] = useState(null);
  const ehWeb = Platform.OS === 'web';

  // Uma vez por montagem: o desenho é determinístico por dia local (garantido
  // por lib/wallpaper.js), então não há o que "atualizar" durante a sessão.
  const dados = useMemo(() => getWallpaperData(new Date()), []);

  useEffect(() => {
    if (!ehWeb) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      desenhar(canvas, dados);
    } catch {
      // Canvas indisponível (navegador muito velho): a tela ainda mostra os
      // dados em texto logo abaixo — não há o que quebrar.
    }
  }, [ehWeb, dados]);

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
            {dados.signoLua ? (
              <Text style={styles.linhaPequena}>{`${T.luaEm} ${dados.signoLua.toUpperCase()}`}</Text>
            ) : dados.regente ? (
              <Text style={styles.linhaPequena}>{`${T.diaDe} ${dados.regente.toUpperCase()}`}</Text>
            ) : null}
            {dados.fase && Number.isFinite(dados.iluminacao) ? (
              <Text style={styles.faseNativo}>{`${dados.fase} · ${dados.iluminacao}% ${T.iluminada}`}</Text>
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
