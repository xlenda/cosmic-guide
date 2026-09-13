import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, gradients, zodiacSigns, space, type } from '../theme';
// AS PECAS DE DIAGRAMACAO (12/09/2026) — ver design/PECAS-DE-DIAGRAMACAO.md.
// Fotografada antes (390x844, dobra 2), esta tela mostrava a leitura inteira
// correndo dentro de UM card so, borda a borda, sem nenhuma marca de "aqui
// mudou de assunto" entre o placar, as cinco dimensoes e a fonte. As tres
// faixas dao tres chaos, um por bloco do desenho que a tela ja tinha:
//   rosa   = o QUENTE (placar + chamada), a familia do pink dos assuntos de casal
//   ameixa = a LEITURA (as cinco dimensoes + o eco do caminho)
//   noite  = a FONTE (o bloco 2 recolhido e as ressalvas), chao neutro
// Nenhum texto muda de lugar e nenhum bloco troca de ordem: o que muda e o
// CHAO embaixo de cada um. test/synastry.test.js continua valendo.
import FaixaCurva from '../components/FaixaCurva';
// A coluna de leitura em volta das cinco dimensoes: em 390px nao corta nada
// (o certo), mas no tablet e na web a linha atravessava a tela toda.
import ColunaLeitura from '../components/ColunaLeitura';
import GradientHeader from '../components/GradientHeader';
// O CENÁRIO CÓSMICO (08/08/2026) — primeiro filho do root, atrás de tudo; o
// root mantém colors.background por baixo (ver o cabeçalho do componente).
import CosmicScene from '../components/CosmicScene';
import { compatibility } from '../lib/signs.js';
import { DIMENSOES_VIDA_REAL, datasDoSigno, ecoDoCaminho, nomeDoSigno, rotuloDoCaminho } from '../lib/synastry.js';
import { useCouple } from '../context/CoupleContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { recordReadingCompletion } from '../lib/readingCompletion';
// localDayStr: o dia LOCAL, nunca toISOString/UTC — perto da meia-noite em fuso
// negativo o dia UTC já virou, e a trava do completionId barraria uma leitura
// legítima de hoje achando que era de ontem.
import { localDayStr } from '../lib/localDay';
import OneTimeLock from '../components/OneTimeLock';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../routes';
// O MODO HISTÓRIA (08/08/2026) — a leitura do bloco 1, um trecho por tela,
// como stories. paraSlides só REFORMATA: nenhum texto do motor muda.
import StoriesReader from '../components/StoriesReader';
import { paraSlides } from '../lib/storySlides';
// O BOTÃO "OUVIR" (08/08/2026) — a leitura em voz alta com a voz do aparelho
// (Web Speech API, lib/voz.js). Sem a API ele devolve null sozinho.
import BotaoOuvir from '../components/BotaoOuvir';
// A ARTE (08/08/2026) — o pack de ilustração (lib/ilustracoes.js):
// mascoteDoSigno devolve o personagem 256px do signo ou null (null cai no
// glifo de fonte de sempre — a arte é upgrade, nunca dependência), e
// CENAS.casal é o hero desenhado 640px do casal abraçado sob a lua.
import { CENAS, mascoteDoSigno } from '../lib/ilustracoes';

const FEATURE_KEY = 'compatibility';
const HIGH_COMPAT_OFFER_KEY = 'offer-shown-compat-high';

// ===========================================================================
// A TELA TEM DOIS BLOCOS, E O QUENTE ABRE — feedback do dono, 31/07/2026
// ===========================================================================
// "na parte de compatibilidade de casal tá muito científico ainda, cada as
// coisas que o povão gosta de ler, fala de sexo entre eles, de conversa, de
// harmonia, de brigas, se vai ser quente na cama, no início tem que ser algo
// que prenda atenção. Depois a parte científica." E: "quero criar retenção
// calorosa".
//
// O que havia: a leitura abria com UMA frase humana e emendava direto na fonte
// (nome do aspecto, geometria, capítulo, verbatim). Melhorou, mas era curto e
// continuava abstrato — a tela inteira lia como nota de rodapé.
//
// O que existe agora, e é uma reordenação, não uma troca:
//
//   BLOCO 1 "Como é na vida real" — abre a tela, é a maior parte do texto, e
//     tem cinco dimensões (química e cama, conversa, briga, convivência, o que
//     segura a longo prazo) compostas com os fatos daquele par. Vem inteiro do
//     motor (lib/synastry.js, seção 9): a tela não escreve conteúdo, ela itera
//     DIMENSOES_VIDA_REAL. Sem isso, o dia em que o motor ganhar uma sexta
//     dimensão a tela mostraria cinco e ninguém veria.
//
//   BLOCO 2 "De onde vem isso" — RECOLHIDO atrás de um toque, e com tudo o que
//     a tela já mostrava, sem perder um item: o círculo com o nome do aspecto e
//     a geometria, o chip da categoria, a manchete, o texto longo, ponto forte,
//     atenção, os verbatins de Robbins com a paráfrase e o locus, o grau de
//     IV.7 com a NOTA_GRAU colada, e as duas ressalvas. Mais uma peça nova e
//     obrigatória: NOTA_CARACTEROLOGIA, que declara o bloco 1 como
//     caracterologia do séc. XX. A tese (docs/tradicao/00-tese.md, prop. 3)
//     proíbe vender perfil de signo solar como doutrina antiga — o app escreve
//     o texto quente E diz de quem ele é, na mesma tela.
//
// O aspecto e a categoria continuam visíveis com o bloco 2 fechado, na própria
// linha do botão: recolher a fonte é tirá-la da abertura, não escondê-la.
// test/synastry.test.js varre esta tela e falha o build se qualquer peça do
// bloco 2 sumir, se o bloco 2 subir para antes do bloco 1, ou se alguma string
// daqui decretar desfecho.
//
// ===========================================================================
// O ECO DO CAMINHO — o que o recolhimento do bloco 2 tinha custado (04/08/2026)
// ===========================================================================
// O campo `caminho` (lib/synastry.js, seção 5.1) nasceu colado na Atenção, e a
// Atenção mora no bloco 2. Só que o bloco 2 nasce RECOLHIDO: quem não toca em
// "De onde vem isso" — que é a maioria, porque o toque é justamente o que o
// desenho desta tela desincentiva — lê o diagnóstico inteiro nos pares difíceis
// e nunca vê a saída. O pedido do dono estava atendido pela metade.
//
// A correção é um ECO no bloco 1, e eco não move nada: o caminho continua
// inteiro lá embaixo, com a citação de Lilly, o locus e a página. O que sobe é a
// PRIMEIRA frase — onde mora o gesto — num mini-card com o rótulo do pack, logo
// depois das cinco dimensões e antes do ponteiro pro bloco 2. Tocar nele abre o
// bloco 2 E rola até o caminho completo, então o eco é porta, não resumo.
//
// Só nos pares que TÊM caminho: `result.caminho` é null em trígono, sextil e
// co-presença (60 dos 144 pares), e o `&&` reproduz a regra do motor em vez de
// a tela inventar a dela. Par harmônico não ganha mini-card de conselho.
//
// O texto e o rótulo vêm do motor (ecoDoCaminho / rotuloDoCaminho): a tela não
// escreve nem recorta conteúdo, senão o eco sai em português pra quem lê em
// inglês — o defeito que a extração de 31/07/2026 corrigiu no resto da leitura.

// A MANCHETE DE CADA CATEGORIA — o que substituiu a roda de porcentagem.
//
// O que havia aqui: um círculo com "{pct}%" e a palavra "Combinação", e um
// título que ramificava em >= 80 / >= 60 / resto. Como o piso da tabela antiga
// era 74, o terceiro ramo ("Requer dedicação e diálogo") era CÓDIGO MORTO —
// nunca executou uma vez sequer. O app tinha dois veredictos, os dois positivos.
//
// Agora a manchete é a categoria da própria fonte, e os quatro ramos são
// alcançáveis: harmônico (48 dos 144 pares), desarmônico (36), sem aspecto (48)
// e co-presença (12). Nenhuma das quatro frases decreta desfecho — a regra 2 do
// cabeçalho de lib/synastry.js vale aqui na tela também, e test/synastry.test.js
// varre estas strings junto com as do motor.
//
// E a manchete fala as DUAS línguas da regra 6 de lib/synastry.js (feedback do
// dono, 31/07/2026: "muito científico tudo, preciso mesclar para o povão"):
// primeiro o que significa em conversa de gente, depois o termo da fonte — o
// termo não some, muda de posição.
//
// As FRASES moram em lib/i18n.js ([BLOCO-CHROME-COMPAT], compat.manchete.*)
// desde 09/08/2026 — cravadas aqui elas saíam em português pra quem lê em
// es/en. O mapa continua sendo a regra da tela: categoria do motor → chave do
// dicionário, e test/synastry.test.js varre os VALORES nos três idiomas com o
// mesmo filtro de fatalismo do motor.
const MANCHETE = {
  harmonico: 'compat.manchete.harmonico',
  desarmonico: 'compat.manchete.desarmonico',
  semAspecto: 'compat.manchete.semAspecto',
  copresenca: 'compat.manchete.copresenca',
};

export default function CompatibilityScreen() {
  const navigation = useNavigation();
  // `lang` é o fio que leva o idioma até o motor: o conteúdo da leitura sai de
  // lib/traducoes/synastry.<lang>.js (pt continua byte a byte o de sempre).
  const { t, lang } = useLanguage();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — corrigido na origem, não precisa mais recombinar isCouple aqui.
  const { hasAccess, accessConfirmed, coupleData, soloSign } = useCouple();
  // ÁRIES × VIRGEM ERAM O PADRÃO FIXO ATÉ 03/08/2026 — dois signos que não
  // têm nada a ver com quem está olhando. A Home mostrava o casal de verdade
  // (coupleData.sa e coupleData.sb) e esta tela abria em outro par: o mesmo
  // app dizia duas coisas diferentes sobre as mesmas duas pessoas.
  //
  // Os seletores continuam livres — a tela existe pra comparar quem a pessoa
  // quiser, e o botão "Trocar" segue ali. O que muda é de onde ela PARTE.
  const [signA, setSignA] = useState(zodiacSigns[0]);
  const [signB, setSignB] = useState(zodiacSigns[5]);
  const signALabel = nomeDoSigno(signA.name, lang);
  const signBLabel = nomeDoSigno(signB.name, lang);
  // Uma vez só: depois que a pessoa mexeu num seletor, o contexto não pode
  // mais puxar de volta pro casal salvo no meio da comparação dela.
  const [semeado, setSemeado] = useState(false);

  useEffect(() => {
    if (semeado) return;
    const acha = (nome) => (nome ? zodiacSigns.find((z) => z.name === nome) : null);
    // Casal formado: os dois signos dele. Solo: o próprio signo na esquerda e
    // a direita fica no padrão, que é exatamente o gesto de "com quem eu
    // combino?". Sem nenhum dos dois, nada muda — não há o que semear.
    const a = acha(coupleData?.sa) || soloSign || null;
    const b = acha(coupleData?.sb) || null;
    if (!a && !b) return;
    if (a) setSignA(a);
    if (b) setSignB(b);
    setSemeado(true);
  }, [coupleData, soloSign, semeado]);
  const [picking, setPicking] = useState(null); // 'A' | 'B' | null
  const [result, setResult] = useState(null);
  const [locked, setLocked] = useState(false);
  // O bloco 2 nasce FECHADO em toda leitura nova: é o que "depois a parte
  // científica" quer dizer na prática. Quem quiser conferir a fonte está a um
  // toque, e o toque fica visível o tempo todo — a linha do botão mostra o nome
  // do aspecto e a categoria mesmo com o bloco recolhido.
  const [showSource, setShowSource] = useState(false);
  // O ECO precisa de três referências pra cumprir o que promete — abrir o bloco
  // 2 JÁ no caminho completo, e não duas telas acima dele:
  //   scrollRef ....... o rolo da tela, pra poder rolar de fato;
  //   caminhoY ........ onde o card da Atenção começa (medido no onLayout dele,
  //                     que é filho direto do contentContainer, então o y já
  //                     está na coordenada que o scrollTo espera);
  //   pedidoDeEco ..... o bloco 2 só existe DEPOIS do setShowSource, então o
  //                     toque não tem como rolar na hora: ele deixa o pedido
  //                     marcado e o onLayout do card cumpre quando montar.
  const scrollRef = useRef(null);
  const caminhoY = useRef(null);
  const pedidoDeEco = useRef(false);
  // O NO do card da Atencao. Nasceu com as faixas (12/09/2026): dentro da
  // FaixaCurva o `layout.y` do onLayout deixa de ser a coordenada do scroll e
  // passa a ser relativa ao corpo da faixa — o eco pousaria no lugar errado.
  // Com o ref da-se pra medir contra o proprio ScrollView (measureLayout), que
  // e a coordenada certa em QUALQUER aninhamento.
  const caminhoRef = useRef(null);
  // Motor de Oferta (pico emocional): compatibilidade alta é O momento de
  // empolgação — uma única oferta contextual, UMA vez na vida (AsyncStorage),
  // nunca insistindo. Tom honesto: sem contador falso, sem urgência inventada.
  const [highCompatOffer, setHighCompatOffer] = useState(false);
  // O MODO HISTÓRIA — o corpo é o MESMO que compute() grava no Diário
  // (chamada + as cinco dimensões, cada uma com o título do dicionário na
  // linha de cima), juntado com '\n\n' sem alterar um texto. A leitura desta
  // tela é estruturada em blocos, e são exatamente esses blocos que viram
  // slides — um por dimensão, como a pessoa já lê no card.
  const [historiaAberta, setHistoriaAberta] = useState(false);
  // O corpo vive num memo próprio porque agora tem DOIS consumidores com a
  // mesma exigência de fidelidade: os slides do modo história e o botão Ouvir
  // (components/BotaoOuvir.js), que fala a leitura em voz alta. Um texto só,
  // dois formatos — nenhum deles reescreve uma palavra.
  const corpoDaLeitura = useMemo(() => {
    if (!result) return '';
    return [
      result.chamada,
      ...DIMENSOES_VIDA_REAL.map((d) => `${t(d.chaveTitulo)}\n${result.vidaReal[d.id]}`),
    ].join('\n\n');
  }, [result, t]);
  const slidesDaLeitura = useMemo(() => paraSlides(corpoDaLeitura), [corpoDaLeitura]);

  useEffect(() => {
    if (hasAccess || !accessConfirmed) return;
    hasUsedFeatureOnce(FEATURE_KEY).then(setLocked);
  }, [hasAccess, accessConfirmed]);

  const compute = () => {
    // Guarda o uso-único-na-vida aqui dentro, não só no gate de render — sem
    // isso, reapertar "Calcular Compatibilidade" sem trocar de signo nunca
    // zera `result` (compatibility() é determinística),
    // então o gate baseado em `!result` nunca voltaria a bloquear (achado por
    // verificação adversarial: dava cálculos grátis infinitos no mesmo par).
    if (!hasAccess && locked) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const compat = compatibility(signA.name, signB.name, lang);
    if (!compat) { setResult(null); return; }
    setResult(compat);
    setShowSource(false);
    // A ENTREGA EM STORIES (09/08/2026) — a leitura recém-nascida abre direto
    // no modo história, como no concorrente. O engate é AQUI, no callback do
    // toque em "Calcular", e não num useEffect sobre `result`: result não
    // persiste e só nasce neste fluxo, então o leitor nunca auto-abre por
    // restauração de estado ou por voltar pra tela. O gate do 1-uso-grátis já
    // barrou lá em cima (locked retorna antes), então o auto-open só acontece
    // no caminho em que o resultado é exibido de verdade. Fechável sempre: o
    // X e o Concluir devolvem a página completa como sempre foi, e o botão
    // "Ver como história" continua lá pra reler. Os slides são o MESMO
    // corpoDaLeitura — setResult e este set batem no mesmo render, então o
    // leitor já monta com a leitura nova.
    setHistoriaAberta(true);
    // Leitura nova, medida velha: o card da Atenção do par anterior estava em
    // outra altura. Sem zerar, o primeiro toque no eco rolaria pro lugar errado.
    pedidoDeEco.current = false;
    caminhoY.current = null;
    // Oferta de pico emocional: reancorada no que o cálculo novo produz.
    // Era `pct >= 80`, que com a tabela antiga pegava 6 dos 10 baldes de
    // elemento; agora dispara nos aspectos que a FONTE chama de harmônicos
    // (trígono e sextil) — 48 dos 144 pares, um terço. Uma vez na vida, checa e
    // marca juntos pra nunca repetir.
    if (compat.categoriaId === 'harmonico' && !hasAccess) {
      AsyncStorage.getItem(HIGH_COMPAT_OFFER_KEY).then((shown) => {
        if (shown) return;
        AsyncStorage.setItem(HIGH_COMPAT_OFFER_KEY, 'true');
        setHighCompatOffer(true);
      });
    }
    // Vira entrada no Diário Cósmico — antes essa tela não deixava rastro
    // nenhum de uso real (achado real de auditoria de retenção, 25/07/2026).
    // O título guardava "{pct}% de combinação". Guarda o aspecto: é o que o
    // app calcula de fato, e não envelhece toda vez que a escala mudar.
    recordReadingCompletion({
      type: 'compatibility',
      // No idioma da leitura, como o body logo abaixo (t(d.chaveTitulo)) — o
      // Diário guarda o que a pessoa leu, e ela leu no idioma dela.
      typeLabel: t('compat.header.title'),
      title: `${signALabel} + ${signBLabel} — ${compat.aspecto} (${compat.categoria})`,
      // O que vai pro Diário é o BLOCO 1, não o texto da fonte: é o que a
      // pessoa leu, é o que ela quer reler, e é o que faz sentido reencontrar
      // meses depois. A fonte continua a um toque na tela; guardar o verbatim
      // de Robbins no diário do usuário seria arquivar a nota de rodapé e
      // jogar fora a leitura.
      body: [compat.chamada, ...DIMENSOES_VIDA_REAL.map((d) => `${t(d.chaveTitulo)}\n${compat.vidaReal[d.id]}`)].join('\n\n'),
      // A TRAVA CONTRA O TOQUE DUPLO (10/09/2026, achado de auditoria). Esta
      // tela grava SÍNCRONA: compatibility() é tabela local, então entre o
      // toque e a gravação não há await nenhum e o botão nunca vira spinner —
      // diferente de Café, Palma e Sonho, que trocam o botão por "carregando"
      // e por isso não precisam de trava. Dois toques rápidos, ou o toque
      // duplo que o dedo dá sozinho com a tela ainda animando, chamavam
      // compute() duas vezes com o mesmo par: duas entradas idênticas no
      // Diário e 20 tokens por um cálculo só. Mesmo dano do bug de hoje de
      // manhã, por outra porta.
      //
      // Os nomes vão ORDENADOS porque a leitura é geométrica: compatibility(A,B)
      // e compatibility(B,A) devolvem o mesmo aspecto e as mesmas cinco
      // dimensões — só o título troca de ordem. Sem o sort, inverter os dois
      // campos pagaria de novo por um texto idêntico.
      completionId: `compatibility:${localDayStr()}:${[signALabel, signBLabel].sort().join('+')}`,
    });
    markFeatureUsedOnce(FEATURE_KEY);
    // Sem isso, `locked` só seria relido do AsyncStorage no próximo mount da
    // tela — trocar de signo e calcular de novo na mesma sessão deixaria
    // repetir o uso grátis várias vezes antes do bloqueio realmente pegar
    // (achado por verificação adversarial).
    if (!hasAccess) setLocked(true);
  };

  const pick = (z) => {
    Haptics.selectionAsync();
    if (picking === 'A') setSignA(z);
    else setSignB(z);
    setPicking(null);
    setResult(null);
    setShowSource(false);
    setHistoriaAberta(false);
    pedidoDeEco.current = false;
    caminhoY.current = null;
  };

  // Mede o card da Atencao CONTRA O SCROLLVIEW. measureLayout existe na web
  // (react-native-web) e no nativo; o callback de erro e obrigatorio no nativo
  // quando o no de referencia ainda nao montou — nesse caso o pedido de eco
  // fica de pe e a proxima medida cumpre.
  const medirOCaminho = () => {
    const no = caminhoRef.current;
    const rolo = scrollRef.current;
    // Sem measureLayout (ou sem os nos) fica valendo o `layout.y` que o
    // onLayout ja gravou, e o pedido de eco e cumprido com ele: pior mira,
    // nunca tela travada.
    if (!no || !rolo || typeof no.measureLayout !== 'function') {
      if (pedidoDeEco.current) {
        pedidoDeEco.current = false;
        rolarAteOCaminho();
      }
      return;
    }
    const alvo = typeof rolo.getScrollableNode === 'function' ? rolo.getScrollableNode() : rolo;
    no.measureLayout(
      alvo,
      (_x, y) => {
        caminhoY.current = y;
        if (pedidoDeEco.current) {
          pedidoDeEco.current = false;
          rolarAteOCaminho();
        }
      },
      () => {}
    );
  };

  // O toque do eco. Com o bloco 2 já aberto, rola direto; fechado, abre e deixa
  // o pedido pro onLayout do card da Atenção — que é quem sabe a altura real.
  const rolarAteOCaminho = () => {
    if (scrollRef.current && typeof caminhoY.current === 'number') {
      scrollRef.current.scrollTo({ y: Math.max(caminhoY.current - 12, 0), animated: true });
    }
  };

  const abrirOCaminho = () => {
    Haptics.selectionAsync();
    if (showSource) {
      rolarAteOCaminho();
      return;
    }
    pedidoDeEco.current = true;
    setShowSource(true);
  };

  // `!result` importa aqui: marcamos `locked=true` no instante em que a
  // leitura grátis é consumida (compute), mas a pessoa ainda precisa VER o
  // resultado que acabou de ganhar — só bloqueamos de fato na próxima
  // tentativa (troca de signo, que chama setResult(null) em pick()).
  if (!hasAccess && locked && !result) {
    return <OneTimeLock featureTitle={t('compat.header.title')} gradient={['#B5286B', '#7B3FB5']} />;
  }

  return (
    <View style={styles.root}>
      <CosmicScene />
      {/* O subtítulo descreve o que a tela FAZ, sem prometer desfecho. O
          anterior ("Encontre seu par celestial") era resquício da roda de
          porcentagem: prometia na manchete o que o rodapé desmente — a regra 2
          de lib/synastry.js vale pro header também, e test/synastry.test.js
          varre o valor de compat.header.subtitle nos três idiomas junto com as
          MANCHETE. */}
      <GradientHeader title={t('compat.header.title')} subtitle={t('compat.header.subtitle')} onBack={() => navigation.goBack()} gradient={['#B5286B', '#7B3FB5']} />
      {/* SEM padding horizontal no scroll: as faixas sangram de ponta a ponta
          e cada uma traz o proprio space.tela por dentro. O topo (seletores,
          botao, cena do casal) fica numa View com o gutter de sempre, porque
          ele NAO e faixa — e a primeira dobra, e ela nao muda. */}
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topoDaTela}>
        <View style={styles.pairRow}>
          <SignSlot sign={signA} onPress={() => setPicking(picking === 'A' ? null : 'A')} active={picking === 'A'} />
          <View style={styles.plusWrap}>
            <Ionicons name="heart" size={26} color={colors.pink} />
          </View>
          <SignSlot sign={signB} onPress={() => setPicking(picking === 'B' ? null : 'B')} active={picking === 'B'} />
        </View>

        {picking && (
          <View style={styles.pickerGrid}>
            {zodiacSigns.map((z) => (
              <TouchableOpacity key={z.name} style={[styles.pickerItem, { borderColor: z.color + '55' }]} onPress={() => pick(z)}>
                <Text style={[styles.pickerGlyph, { color: z.color }]}>{z.icon}</Text>
                <Text style={styles.pickerName}>{nomeDoSigno(z.name, lang)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!picking && !hasAccess && locked && result && (
          // compute() já recusa recalcular nesse caso — aqui é só pra não
          // deixar um botão "morto" que não faz nada visível ao tocar.
          <>
            <Text style={styles.lockedNote}>{t('compat.locked.note')}</Text>
            {/* O texto acima SUBSTITUI o botão "Calcular Compatibilidade"
                (ternário logo abaixo) — pedia assinatura e não levava a lugar
                nenhum, deixando o voltar como única saída. Mesmo destino do
                CTA da oferta de pico emocional, no mesmo HomeStack. */}
            <TouchableOpacity
              style={[styles.offerBtn, { marginTop: space.bloco }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(ROUTES.PLANOS)}
            >
              <Text style={styles.offerBtnText}>{t('compat.locked.cta')}</Text>
            </TouchableOpacity>
          </>
        )}

        {!picking && !(!hasAccess && locked && result) && (
          <TouchableOpacity activeOpacity={0.85} onPress={compute} style={styles.btnWrap}>
            <LinearGradient colors={gradients.pink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
              <Ionicons name="analytics" size={18} color="#fff" />
              <Text style={styles.btnText}>{t('compat.calculate')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* A CENA DO CASAL [AUTO-DECISION] (08/08/2026) — o hero ilustrado
            (CENAS.casal, o casal abraçado sob a lua) entra SÓ no estado antes
            de calcular, e DEPOIS do botão: seletor e "Calcular" ficam
            exatamente onde estavam (primeira dobra intocada) e a cena preenche
            o vazio que essa tela sempre teve antes do resultado. Com resultado
            na tela ela sai — o lugar é da leitura, e empilhar a cena em cima
            empurraria o bloco quente pra baixo da dobra. Durante a escolha de
            signo (picking) também sai, pra grade de signos não descer.
            accessible={false}: é cenário, não informação. */}
        {!picking && !result && (
          <View style={styles.cenaCasalWrap}>
            <Image source={CENAS.casal} style={styles.cenaCasalImg} resizeMode="cover" accessible={false} />
            {/* O fade cinematográfico (09/08/2026) — funde o terço inferior
                da arte no colors.background: a cena pertence à página em vez
                de flutuar emoldurada. */}
            <LinearGradient colors={['transparent', colors.background]} style={styles.cenaCasalFade} pointerEvents="none" />
          </View>
        )}
        </View>

        {result && (
          <>
            {/* ============================================================
                BLOCO 1 — "COMO É NA VIDA REAL". Abre a tela e é a maior parte
                do texto. Nada aqui é escrito na tela: as cinco dimensões vêm
                de lib/synastry.js e a tela itera DIMENSOES_VIDA_REAL, então
                dimensão nova aparece sozinha e dimensão vazia quebra o teste.
                ============================================================ */}
            {/* FAIXA 1 — O QUENTE. O placar e a chamada ganham chao ROSA (a
                familia do pink que esta tela ja usa no cabecalho e nos icones
                das dimensoes). O realCard perde a moldura de card e vira o
                conteudo da faixa: a faixa E o chao dele agora, e card dentro
                de faixa e moldura em cima de moldura. */}
            <FaixaCurva tom="rosa" semente="compat-placar">
            <View style={styles.realCard}>
              {/* O PLACAR CENTRAL (09/08/2026) — a composição do concorrente
                  com o NOSSO dado no lugar do número inventado: os dois
                  mascotes flanqueiam um selo em destaque, e o selo estampa o
                  que o motor calculou — o aspecto e a categoria, os mesmos
                  textos que a linha do botão "De onde vem isso" já mostra
                  como recibo (e CONTINUA mostrando: o placar é adição visual
                  de dado já presente na tela, não mudança de dado). Onde o
                  concorrente põe "99%", aqui vai a geometria com nome — o
                  "99%" honesto desta tela. Nenhuma string nova: aspecto e
                  categoria chegam prontos do motor no idioma da leitura, e o
                  nome sob cada mascote é o mesmo dos seletores. */}
              <View style={styles.placarRow}>
                <PlacarSigno sign={signA} />
                <View style={styles.placarSeloWrap}>
                  <View style={styles.placarSelo}>
                    <Text style={styles.placarSeloAspecto}>{result.aspecto}</Text>
                    <Text style={styles.placarSeloCategoria}>{result.categoria}</Text>
                  </View>
                </View>
                <PlacarSigno sign={signB} />
              </View>
              {/* A CHAMADA, central e logo abaixo do placar — é o mesmo
                  result.chamada de sempre, palavra por palavra; só mudou de
                  posto: de corpo espremido entre os botões pra manchete da
                  composição. */}
              <Text style={styles.realHook}>{result.chamada}</Text>
              <Text style={styles.realKicker}>{t('compat.real.kicker')}</Text>
              {/* O PAR, em corpo de display (22/800) — é o resultado que a
                  pessoa veio ver, e é o mesmo par que nomeia o Diário e o modo
                  história. Só estado da tela (signA/signB), nenhum texto novo
                  de i18n. O título da seção vira linha de apoio logo abaixo. */}
              <Text style={styles.realPair}>
                {signALabel} + {signBLabel}
              </Text>
              <Text style={styles.realTitle}>{t('compat.real.title')}</Text>
              {/* O MODO HISTÓRIA — acima do texto: abre a MESMA leitura do
                  bloco 1 (chamada + cinco dimensões), um trecho por tela.
                  Nenhum gate muda: o botão só existe onde a leitura já está
                  inteira na tela. */}
              <TouchableOpacity
                style={styles.historiaBtn}
                activeOpacity={0.85}
                onPress={() => setHistoriaAberta(true)}
                accessibilityRole="button"
                accessibilityLabel={t('stories.ver')}
              >
                <Ionicons name="sparkles" size={16} color={colors.pink} />
                <Text style={styles.historiaBtnText}>{t('stories.ver')}</Text>
              </TouchableOpacity>
              {/* O BOTÃO "OUVIR" — a mesma leitura do bloco 1 (chamada + cinco
                  dimensões, o corpo do modo história) em voz alta, com a voz
                  do aparelho. */}
              <BotaoOuvir texto={corpoDaLeitura} style={styles.ouvirBtn} />
            </View>
            </FaixaCurva>

            {/* FAIXA 2 — A LEITURA. Chao ameixa, o degrau seguinte na mesma
                roda de cor (320 graus contra os 339 do rosa): muda de assunto
                sem trocar de app. Aqui mora o texto longo, e e por isso que
                ele entra numa COLUNA DE LEITURA — o unico bloco da tela com
                paragrafo de sete linhas. */}
            <FaixaCurva tom="ameixa" semente="compat-dimensoes" grude="rosa">
            <ColunaLeitura>
              {DIMENSOES_VIDA_REAL.map((d, i) => (
                <View key={d.id} style={i === 0 ? null : styles.dimBlock}>
                  <View style={styles.dimHead}>
                    <View style={styles.dimIcon}>
                      <Ionicons name={d.icone} size={20} color={colors.pink} />
                    </View>
                    <Text style={styles.dimTitle}>{t(d.chaveTitulo)}</Text>
                  </View>
                  <Text style={styles.dimText}>{result.vidaReal[d.id]}</Text>
                </View>
              ))}
              {/* O ECO DO CAMINHO — a saída aparece no bloco que ABRE.
                  Depois das cinco dimensões de propósito: o eco é a resposta ao
                  que elas acabaram de descrever, e chegar antes delas seria dar
                  conselho antes de a pessoa saber do que se trata.
                  Só existe onde o MOTOR diz que existe (null em trígono, sextil
                  e co-presença) — a tela não decide o que é par difícil. */}
              {!!result.caminho && (
                <TouchableOpacity
                  testID="compat-eco-caminho"
                  style={styles.ecoCard}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  onPress={abrirOCaminho}
                >
                  <View style={styles.ecoHead}>
                    <View style={styles.ecoIcon}>
                      <Ionicons name="footsteps" size={14} color={colors.accent} />
                    </View>
                    <Text style={styles.ecoTitle}>{rotuloDoCaminho(lang)}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.accent} />
                  </View>
                  <Text style={styles.ecoText}>{ecoDoCaminho(result.caminho, lang)}</Text>
                </TouchableOpacity>
              )}

              {/* O ponteiro pro bloco 2 fica DENTRO do bloco quente, na última
                  linha: quem chegou até aqui é exatamente quem pode querer a
                  fonte. Sutil, uma linha, sem competir com o conteúdo. */}
              <Text style={styles.realFootnote}>{t('compat.real.footnote')}</Text>
            </ColunaLeitura>
            </FaixaCurva>

            {/* ============================================================
                BLOCO 2 — "DE ONDE VEM ISSO". Recolhido, e com o nome do
                aspecto e a categoria visíveis na própria linha do botão:
                recolher a fonte é tirá-la da abertura, não escondê-la.

                FAIXA 3 — A FONTE. Chao NEUTRO (ardosia) de proposito: e a
                faixa mais longa quando aberta, e cor cromatica numa faixa
                longa lava a tela. O neutro tambem diz o que o bloco 2 e —
                o recibo, nao a leitura.
                ============================================================ */}
            <FaixaCurva tom="noite" semente="compat-fonte" grude="ameixa" estiloCorpo={styles.faixaFonte}>
            <TouchableOpacity
              style={styles.sourceToggle}
              activeOpacity={0.85}
              onPress={() => { Haptics.selectionAsync(); setShowSource((v) => !v); }}
            >
              <Ionicons name="library-outline" size={16} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sourceToggleTitle}>{t('compat.source.toggle')}</Text>
                <Text style={styles.sourceToggleMeta}>
                  {result.aspecto} · {result.categoria}
                  {result.distancia === 0 ? '' : ` · ${result.graus}°`}
                </Text>
              </View>
              <Ionicons name={showSource ? 'chevron-up' : 'chevron-down'} size={18} color={colors.accent} />
            </TouchableOpacity>
            </FaixaCurva>
          </>
        )}

        {/* FAIXA 4 — A FONTE ABERTA. Fragmento IRMAO do toggle, nao filho
            dele: test/synastry.test.js exige o literal `{result && showSource
            && (`, e com razao — e a linha que prova que o bloco 2 esta atras
            do toque, e nao so depois dele no arquivo. Faixa propria, semente
            propria: duas faixas com a MESMA semente desenhariam a mesma onda,
            e onda repetida e papel de parede. Mesmo tom neutro do toggle, com
            `grude` — as duas leem como um chao so quando a fonte abre. */}
        {result && showSource && (
          <FaixaCurva tom="noite" semente="compat-verbatins" grude="noite">
          <>
            <View style={styles.resultCard}>
              <LinearGradient colors={gradients.card} style={styles.resultInner}>
                <View style={styles.circleWrap}>
                  <LinearGradient colors={gradients.pink} style={styles.circle}>
                    {/* Onde havia "92%" agora há "Trígono". O que sobrou de
                        número no círculo é a GEOMETRIA — graus e signos de
                        distância —, que é fato conferível em qualquer
                        efeméride, e não uma nota que ninguém sabe de onde vem. */}
                    <Text style={styles.circleAspect}>{result.aspecto}</Text>
                    {/* Plural por CHAVE (signs_one/signs_other), sem lógica de
                        plural no dicionário — o ternário daqui escolhe, mesmo
                        padrão de arco.contagem/arco.contagem.um. */}
                    <Text style={styles.circleLabel}>
                      {result.distancia === 0
                        ? t('compat.geometry.sameSign')
                        : t(
                            result.distancia === 1 ? 'compat.geometry.signs_one' : 'compat.geometry.signs_other',
                            { graus: result.graus, distancia: result.distancia }
                          )}
                    </Text>
                  </LinearGradient>
                </View>
                <Text style={styles.categoryChip}>{result.categoria}</Text>
                <Text style={styles.resultTitle}>{t(MANCHETE[result.categoriaId])}</Text>
                <Text style={styles.resultDesc}>{result.texto}</Text>
              </LinearGradient>
            </View>

            <View style={styles.traitCard}>
              <View style={[styles.traitIcon, { backgroundColor: colors.pink + '22' }]}>
                <Ionicons name="heart-circle" size={20} color={colors.pink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.traitLabel}>{t('compat.strength')}</Text>
                <Text style={styles.traitText}>{result.forte}</Text>
              </View>
            </View>

            {/* O card que o eco do bloco 1 mira. O onLayout é o único jeito de
                saber a altura real dele: o conteúdo acima muda de tamanho com o
                par, com o idioma e com a largura da tela, então número fixo
                erraria em quase todo caso. Filho direto do contentContainer, o
                `y` daqui já é a coordenada que o scrollTo espera. */}
            <View
              ref={caminhoRef}
              style={styles.traitCard}
              onLayout={(e) => {
                // O y CRU, que era exato quando este card era filho direto do
                // contentContainer. Dentro da faixa ele e relativo ao corpo
                // dela — serve de piso, e medirOCaminho o corrige logo abaixo.
                caminhoY.current = e.nativeEvent.layout.y;
                medirOCaminho();
              }}
            >
              <View style={[styles.traitIcon, { backgroundColor: colors.accent + '22' }]}>
                <Ionicons name="alert-circle" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.traitLabel}>{t('compat.watch')}</Text>
                <Text style={styles.traitText}>{result.cuidado}</Text>
                {/* O CAMINHO, colado na Atenção — feedback do dono, 04/08/2026.
                    A Atenção nomeia a dor e para; sozinha, ela deixa o par
                    difícil sem saída nenhuma. O caminho vem do motor
                    (lib/synastry.js, seção 5.1) e só existe nas categorias
                    tensas — desarmônico e sem aspecto —, então o `&&` não é
                    defensivo: é a regra. Trígono e co-presença não recebem a
                    linha porque não têm o que resolver, e inventar conselho
                    onde não há atrito é o oposto de falar a real.

                    Sem rótulo próprio de propósito: cada pack já abre a frase
                    anunciando que dali em diante é prática, na língua certa —
                    um rótulo aqui exigiria chave nova em lib/i18n.js e sairia
                    em português pra quem lê em inglês. */}
                {!!result.caminho && <Text style={styles.traitPath}>{result.caminho}</Text>}
              </View>
            </View>

            {/* A FONTE, na tela. O verbatim de Robbins fica SEM tradução (mesma
                regra do latim de Manílio em lib/zodiacBody.js) e o locus vem
                logo abaixo — a pessoa pode ir conferir. É o que separa este
                resultado de um texto de revista: ele diz de onde veio.

                NA FRENTE do inglês vem a paráfrase em português (feedback do
                dono, 31/07/2026: o povão não é obrigado a ler Robbins pra
                entender a própria leitura). A paráfrase é ASSINADA COMO NOSSA
                pelo rótulo, nunca entre aspas e nunca com locus — o inglês
                fica como recibo, não como leitura obrigatória. Quem confere,
                confere no verbatim; quem só quer entender, entende na linha
                de cima. */}
            <View style={styles.sourceCard}>
              <Text style={styles.sourceTitle}>{t('compat.sourceTitle')}</Text>
              {result.verbatins.map((v) => (
                <View key={v.locus + v.texto.slice(0, 24)} style={styles.sourceItem}>
                  {!!v.parafrase && (
                    <>
                      <Text style={styles.sourceParaphraseLabel}>{t('compat.paraphrase.label')}</Text>
                      <Text style={styles.sourceParaphrase}>{v.parafrase}</Text>
                    </>
                  )}
                  <Text style={styles.sourceQuote}>“{v.texto}”</Text>
                  <Text style={styles.sourceLocus}>{v.locus}</Text>
                </View>
              ))}
              <Text style={styles.sourceDegree}>
                {t('compat.degree', { grau: result.grau, nome: result.grauNome })}
              </Text>
              {/* NOTA_GRAU vem COLADA no grau, e não lá embaixo com as outras
                  ressalvas. Motivo: "Grau 4 de 4" é um número numa escala, ou
                  seja exatamente a forma que este trabalho inteiro tirou da
                  tela — e ele cai em 60 dos 144 pares. Sem a linha abaixo, o
                  app troca "74%" por "grau 4 de 4" e não corrige nada. O
                  cabeçalho de lib/synastry.js já exige que a citação ande junto
                  do grau; até aqui `notaGrau` era calculado e nunca renderizado
                  em tela nenhuma. */}
              <Text style={styles.sourceDegreeNote}>{result.notaGrau}</Text>
            </View>

            {/* AS RESSALVAS. Ficam depois do conteúdo e antes de qualquer
                oferta, de propósito: quem leu o resultado precisa ler também o
                que ele não é. A primeira explica a ausência da porcentagem; a
                segunda admite que comparar signo solar com signo solar é
                recorte de jornal de 1930, e não a sinastria da fonte. */}
            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>{t('compat.notTitle')}</Text>
              <Text style={styles.noteText}>{result.notaEscala}</Text>
              <Text style={styles.noteText}>{result.ressalvaSignoSolar}</Text>
            </View>

            {/* A TERCEIRA COISA QUE O RESULTADO NÃO É, e ela nasceu com o bloco
                1: o texto quente lá de cima é caracterologia do séc. XX, não
                Ptolomeu. A tese (docs/tradicao/00-tese.md, prop. 3) põe
                "ariano é impulsivo" na mesma tabela do tarô egípcio e da
                Superlua — coisa moderna vendida como antiga. O app escreve o
                texto E o data, na mesma tela, e é isso que o separa de uma
                revista. Card próprio e não mais uma linha do card acima: é a
                declaração que autoriza a metade quente da tela a existir. */}
            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>{t('compat.source.caracterologia')}</Text>
              <Text style={styles.noteText}>{result.notaCaracterologia}</Text>
            </View>
          </>
          </FaixaCurva>
        )}

        {/* A OFERTA fica FORA do bloco recolhido: ela dispara no pico emocional
            da leitura quente, e não faria sentido depender de a pessoa abrir a
            bibliografia pra vê-la. */}
        {result && highCompatOffer && (
          <View style={[styles.offerCard, styles.comGutter]}>
            <Text style={styles.offerTitle}>{t('compat.offer.title', { aspecto: result.aspecto })}</Text>
            <Text style={styles.offerText}>{t('compat.offer.body')}</Text>
            <TouchableOpacity
              style={styles.offerBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(ROUTES.PLANOS)}
            >
              <Text style={styles.offerBtnText}>{t('compat.trialCta')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <StoriesReader
        visible={historiaAberta}
        slides={slidesDaLeitura}
        titulo={`${signALabel} + ${signBLabel}`}
        onClose={() => setHistoriaAberta(false)}
      />
    </View>
  );
}

function SignSlot({ sign, onPress, active }) {
  const { t, lang } = useLanguage();
  // O signo como PERSONAGEM (08/08/2026): quando o pack tem o mascote, ele
  // toma o lugar do glifo de fonte no slot — redondo, com o fundo na cor do
  // signo virando aro da arte. Sem mascote (null), o glifo de sempre.
  const mascote = mascoteDoSigno(sign.name);
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.slot, active && { borderColor: sign.color }]}>
      {mascote ? (
        <View style={[styles.slotMascoteWrap, { backgroundColor: sign.color + '22' }]}>
          <Image source={mascote} style={styles.slotMascote} resizeMode="cover" accessible={false} />
        </View>
      ) : (
        <View style={[styles.slotGlyphWrap, { backgroundColor: sign.color + '22' }]}>
          <Text style={[styles.slotGlyph, { color: sign.color }]}>{sign.icon}</Text>
        </View>
      )}
      <Text style={styles.slotName}>{nomeDoSigno(sign.name, lang)}</Text>
      <Text style={styles.slotDates}>{datasDoSigno(sign.dates, lang)}</Text>
      <View style={styles.changeRow}>
        <Ionicons name="swap-vertical" size={12} color={colors.accent} />
        <Text style={styles.changeText}>{t('compat.swap')}</Text>
      </View>
    </TouchableOpacity>
  );
}

// O MEDALHÃO do placar (09/08/2026) — o mesmo personagem dos slots, agora em
// 72px redondo com o nome embaixo, flanqueando o selo central do resultado.
// Mesma regra do SignSlot: sem mascote no pack, o glifo de fonte assume — a
// arte é upgrade, nunca dependência. Nome via sign.pt, o mesmo dado dos
// seletores: nenhum texto novo.
function PlacarSigno({ sign }) {
  const { lang } = useLanguage();
  const mascote = mascoteDoSigno(sign.name);
  return (
    <View style={styles.placarSigno}>
      <View style={[styles.placarMascoteWrap, { backgroundColor: sign.color + '22' }]}>
        {mascote ? (
          <Image source={mascote} style={styles.placarMascote} resizeMode="cover" accessible={false} />
        ) : (
          <Text style={[styles.placarGlyph, { color: sign.color }]}>{sign.icon}</Text>
        )}
      </View>
      <Text style={styles.placarNome}>{nomeDoSigno(sign.name, lang)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // O scroll nao tem mais padding horizontal: quem o traz agora sao as faixas
  // (por dentro) e o topoDaTela (a primeira dobra, que nao e faixa).
  scrollContent: { paddingBottom: space.fimDaLista },
  topoDaTela: { paddingHorizontal: space.tela, paddingTop: space.entre, paddingBottom: space.entre },
  // A oferta mora fora das faixas (dispara no pico emocional da leitura e nao
  // pertence a nenhum dos tres chaos) — entao ela pede o gutter de volta.
  comGutter: { marginHorizontal: space.tela },
  // A faixa da fonte comeca colada no toggle: o degrau padrao da faixa somado
  // ao respiro que o toggle ja tinha abria um vao entre a onda e o botao.
  faixaFonte: { paddingTop: space.bloco },
  // (leituraColuna saiu: o degrau ate a faixa de cima e o paddingTop da
  // PROPRIA faixa. Somar os dois dava 83px de chao liso antes da primeira
  // palavra — medido no build, o mesmo defeito que o revisor pegou na Home.)
  lockedNote: { ...type.apoio, color: colors.textMuted, textAlign: 'center', paddingHorizontal: space.dentro, marginTop: space.grudado },
  pairRow: { flexDirection: 'row', alignItems: 'center', marginBottom: space.bloco },
  slot: { flex: 1, backgroundColor: colors.surface, borderRadius: 18, padding: space.bloco, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
  slotGlyphWrap: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: space.junto },
  slotGlyph: { fontSize: 30 },
  // O MASCOTE do slot (08/08/2026): 60 de moldura redonda com a arte de 56
  // dentro — o fundo sign.color+'22' (inline) aparece como aro de 2px em volta
  // do JPG, mesma jogada do bigGlyphComMascote do Horóscopo.
  slotMascoteWrap: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: space.junto },
  slotMascote: { width: 56, height: 56, borderRadius: 28 },
  slotName: { ...type.cartao, color: colors.text, fontWeight: '800' },
  slotDates: { ...type.nota, color: colors.textMuted, marginTop: 2 },
  changeRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.junto, gap: 3 },
  changeText: { ...type.apoio, color: colors.accent, fontWeight: '700' },
  plusWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginHorizontal: space.junto, borderWidth: 1, borderColor: colors.border },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.junto, marginBottom: space.bloco },
  pickerItem: { width: '31%', backgroundColor: colors.surface, borderRadius: 12, padding: space.dentro, alignItems: 'center', borderWidth: 1 },
  pickerGlyph: { fontSize: 22 },
  pickerName: { ...type.nota, color: colors.textSecondary, marginTop: space.grudado, fontWeight: '600' },
  btnWrap: { borderRadius: 12, overflow: 'hidden' },
  // A CENA DO CASAL — hero desenhado do estado pré-cálculo (ver o comentário
  // no JSX). Full-bleed (09/08/2026): margens negativas anulam o padding:20
  // do scroll (a arte sangra até as bordas, sem borderRadius) e o fade funde
  // o terço inferior no fundo — a cena fecha a tela como horizonte, não como
  // card emoldurado.
  // O full-bleed agora anula o space.tela do topoDaTela (era o padding: 20 do
  // scroll). Sem acertar este numero a arte deixaria uma tira do fundo de cada
  // lado — o oposto de sangrar.
  cenaCasalWrap: { marginTop: space.bloco, marginHorizontal: -space.tela },
  cenaCasalImg: { width: '100%', height: 210 },
  cenaCasalFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 },
  btn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: space.bloco, gap: space.junto },
  btnText: { ...type.botao, color: '#fff', fontWeight: '800' },
  // ---------------------------------------------------------------------
  // BLOCO 1 — o que abre a tela. Hierarquia tipográfica invertida em relação
  // ao que havia: o texto quente é o corpo de leitura (15/24, cor cheia) e a
  // fonte, antes protagonista, passou para o padrão dos cards secundários.
  // ---------------------------------------------------------------------
  // O REALCARD PERDE A MOLDURA (12/09/2026). Ele era um card de borda rosa em
  // volta do bloco quente INTEIRO — placar, chamada, cinco dimensoes, eco e
  // rodape, tudo dentro de uma caixa so, que e exatamente o "corre tudo junto"
  // do diagnostico. Agora o chao dele e a FaixaCurva rosa, e card dentro de
  // faixa e moldura em cima de moldura. Nenhum conteudo saiu: o bloco 1
  // continua com as mesmas pecas, na mesma ordem.
  realCard: { paddingHorizontal: space.grudado },
  // O PLACAR (09/08/2026) — três colunas centradas: medalhão | selo | medalhão.
  // Os medalhões repetem o DNA do slotMascoteWrap (fundo sign.color+'22' como
  // aro de 2px em volta da arte), só que em 76/72. O selo é a peça em
  // destaque: fundo cheio em colors.accent, o único bloco de cor sólida do
  // card — é ele que faz o papel do "99%" do concorrente, com dado de verdade.
  placarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto, marginBottom: 2 },
  placarSigno: { alignItems: 'center', width: 88 },
  placarMascoteWrap: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center' },
  placarMascote: { width: 72, height: 72, borderRadius: 36 },
  placarGlyph: { fontSize: 38 },
  placarNome: { ...type.apoio, color: colors.text, fontWeight: '800', marginTop: space.junto, textAlign: 'center' },
  placarSeloWrap: { flex: 1, alignItems: 'center' },
  placarSelo: { backgroundColor: colors.accent, borderRadius: 16, paddingVertical: space.dentro, paddingHorizontal: space.dentro, alignItems: 'center', maxWidth: '100%' },
  placarSeloAspecto: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  placarSeloCategoria: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginTop: 2, textAlign: 'center' },
  // Títulos de seção centrados (09/08/2026) — a diagramação espelho é
  // simétrica no eixo vertical; o conteúdo corrido continua alinhado à
  // esquerda, que é onde texto longo se lê melhor.
  realKicker: { ...type.etiqueta, color: colors.pink, textTransform: 'uppercase', textAlign: 'center', marginTop: space.entre },
  // O par do resultado é o display do card; o título da seção, que dividia o
  // topo com ele em 20/800, desce pra linha de apoio — um destaque só.
  realPair: { ...type.titulo, color: colors.text, fontWeight: '800', letterSpacing: 0.3, marginTop: space.junto, textAlign: 'center' },
  realTitle: { ...type.corpoCurto, color: colors.textSecondary, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  // A chamada virou a manchete central da composição: 17/26, centrada, logo
  // abaixo do placar — o texto é o mesmo result.chamada de sempre.
  realHook: { ...type.corpo, color: colors.text, fontWeight: '600', marginTop: space.entre, textAlign: 'center' },
  // O botão do modo história — contorno no rosa do bloco quente, sem fundo:
  // porta pra mesma leitura, não call-to-action.
  historiaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    borderRadius: 12, borderWidth: 1, borderColor: colors.pink + '66',
    paddingVertical: space.dentro, paddingHorizontal: space.bloco, marginTop: space.bloco,
  },
  historiaBtnText: { ...type.apoio, color: colors.pink, fontWeight: '700' },
  // O Ouvir centrado logo abaixo do modo história (a chamada agora mora lá em
  // cima, colada no placar).
  ouvirBtn: { alignSelf: 'center', marginTop: space.bloco },
  // O respiro ENTRE as dimensoes sobe de 18 pro degrau `entre` (24): elas sao
  // cinco blocos de texto longo em sequencia, e era justamente onde o olho
  // nao achava onde uma acabava e a outra comecava. Na duvida entre dois
  // degraus, o maior.
  dimBlock: { marginTop: space.entre },
  dimHead: { flexDirection: 'row', alignItems: 'center', gap: space.junto },
  // Os títulos das dimensões subiram pra 17/800 com o ícone em 20 (caixa 30):
  // na diagramação espelho eles são os subtítulos da leitura, não etiquetas.
  // Conteúdo idêntico — só o corpo cresceu.
  dimIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.pink + '22', justifyContent: 'center', alignItems: 'center' },
  dimTitle: { ...type.cartao, color: colors.text, fontWeight: '800', letterSpacing: 0.2 },
  dimText: { ...type.corpoCurto, color: colors.textSecondary, marginTop: space.junto },
  realFootnote: { ...type.nota, color: colors.textMuted, marginTop: space.entre, fontStyle: 'italic' },
  // O ECO. Card DENTRO do bloco 1, com o tom do accent (não do rosa das
  // dimensões): ele não é mais uma dimensão, é a virada de "como é" pra "o que
  // dá pra fazer". Corpo no mesmo tamanho de leitura das dimensões — o eco é
  // texto pra ler, não etiqueta —, e o chevron faz o trabalho do "toque aqui"
  // sem custar um rótulo novo em três idiomas.
  ecoCard: {
    marginTop: space.entre, padding: space.bloco, borderRadius: 16,
    backgroundColor: colors.accent + '12', borderWidth: 1, borderColor: colors.accent + '44',
  },
  ecoHead: { flexDirection: 'row', alignItems: 'center', gap: space.junto },
  ecoIcon: { width: 24, height: 24, borderRadius: 8, backgroundColor: colors.accent + '22', justifyContent: 'center', alignItems: 'center' },
  ecoTitle: { ...type.corpoCurto, color: colors.text, fontWeight: '800', flex: 1 },
  ecoText: { ...type.corpoCurto, color: colors.textSecondary, marginTop: space.junto },
  sourceToggle: {
    flexDirection: 'row', alignItems: 'center', gap: space.dentro,
    backgroundColor: colors.surface, borderRadius: 16, paddingVertical: space.dentro, paddingHorizontal: space.bloco,
    borderWidth: 1, borderColor: colors.border,
  },
  sourceToggleTitle: { ...type.corpoCurto, color: colors.text, fontWeight: '800' },
  sourceToggleMeta: { ...type.apoio, color: colors.textMuted, marginTop: 2 },
  resultCard: { marginTop: space.bloco, borderRadius: 18, overflow: 'hidden' },
  resultInner: { padding: space.entre, borderWidth: 1, borderColor: colors.border, borderRadius: 18, alignItems: 'center' },
  circleWrap: { marginBottom: space.bloco },
  circle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', paddingHorizontal: space.junto },
  // Era `circlePct` (fontSize 32, pra caber "92%"). O nome do aspecto é mais
  // comprido que dois dígitos — "Co-presença" é o pior caso —, daí 20 e o
  // adjustsFontSizeToFit não ser necessário nas larguras de tela reais.
  circleAspect: { color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  circleLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: space.grudado, textAlign: 'center' },
  categoryChip: {
    color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 0.5,
    backgroundColor: colors.accent + '1F', borderRadius: 10, overflow: 'hidden',
    paddingHorizontal: space.dentro, paddingVertical: space.grudado, marginBottom: space.dentro,
  },
  resultTitle: { ...type.cartao, color: colors.text, fontWeight: '800', textAlign: 'center' },
  resultDesc: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center', marginTop: space.junto },
  sourceCard: { backgroundColor: colors.surface, borderRadius: 18, padding: space.bloco, marginTop: space.bloco, borderWidth: 1, borderColor: colors.border },
  sourceTitle: { ...type.corpoCurto, color: colors.text, fontWeight: '800', marginBottom: space.junto, textAlign: 'center' },
  sourceItem: { marginBottom: space.dentro },
  // A paráfrase lê ANTES e MAIOR que o inglês (14 vs 13, cor de texto cheia):
  // ela é a leitura; o verbatim é o recibo. O rótulo em cima é o que a impede
  // de passar por citação — sem ele, isto seria tradução, que a regra 1 de
  // lib/synastry.js proíbe.
  sourceParaphraseLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 },
  sourceParaphrase: { ...type.corpoCurto, color: colors.textSecondary, marginBottom: space.junto },
  sourceQuote: { ...type.apoio, color: colors.textSecondary, fontStyle: 'italic' },
  sourceLocus: { ...type.nota, color: colors.textMuted, marginTop: space.grudado },
  sourceDegree: { ...type.apoio, color: colors.textMuted, marginTop: 2 },
  sourceDegreeNote: { ...type.nota, color: colors.textMuted, marginTop: space.junto, fontStyle: 'italic' },
  noteCard: { backgroundColor: colors.surface, borderRadius: 18, padding: space.bloco, marginTop: space.bloco, borderWidth: 1, borderColor: colors.border },
  noteTitle: { ...type.corpoCurto, color: colors.text, fontWeight: '800', marginBottom: space.junto, textAlign: 'center' },
  noteText: { ...type.apoio, color: colors.textMuted, marginBottom: space.junto },
  traitCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 18, padding: space.bloco, marginTop: space.bloco, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-start' },
  traitIcon: { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: space.dentro },
  traitLabel: { ...type.corpoCurto, color: colors.text, fontWeight: '800' },
  traitText: { ...type.corpoCurto, color: colors.textSecondary, marginTop: space.grudado },
  // O caminho lê como CONTINUAÇÃO da Atenção, não como card novo: mesmo corpo
  // de texto, um respiro acima e uma barra à esquerda pra separar o "o que
  // fazer" do "o que dói" sem quebrar a hierarquia do bloco 2.
  traitPath: {
    ...type.corpoCurto, color: colors.textSecondary, marginTop: space.dentro,
    paddingLeft: space.dentro, borderLeftWidth: 2, borderLeftColor: colors.accent + '55',
  },
  offerCard: {
    marginTop: space.bloco, padding: space.bloco, borderRadius: 18,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.pink + '77',
  },
  offerTitle: { ...type.cartao, color: colors.text, fontWeight: '800' },
  offerText: { ...type.apoio, color: colors.textSecondary, marginTop: space.junto },
  offerBtn: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: space.dentro, alignItems: 'center', marginTop: space.bloco },
  offerBtnText: { ...type.corpoCurto, color: '#fff', fontWeight: '800' },
});
