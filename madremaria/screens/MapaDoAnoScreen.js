// screens/MapaDoAnoScreen.js
// O TABULEIRO: os 365 dias do ano dela, de uma vez, agrupados pelas treze luas.
//
// A pedido do dono (01/09): "mostrar todas as cartas dos 365 dias de uma vez
// dentro do app, ai ele consegue raspar uma carta no dia e cumprir a funcao do
// dia". A raspagem NAO acontece aqui: tocar numa casa que ainda abre (hoje, ou
// o ontem do perdao) leva ao plano daquele dia, e la esta o veu de verdade.
// Este e o mesmo desenho da grade do funil: a grade mostra, a carta raspa.
//
// ===================================================================================
// O QUE ESTA TELA SE RECUSA A DESENHAR
// ===================================================================================
// · Percentual, barra ou "quanto falta" — lib/ano.js proibe por escrito: barra
//   de ano e maquina de culpa com cara de gamificacao.
// · Dia passado como ERRO. Casa 'passado' e apagada, nunca vermelha, nunca
//   riscada: sumir tres semanas nao atrasa o ano, e o portao de copy proibe
//   streak que pune.
// · Numeros inventados: sem ancora do ano nao ha tabuleiro — ha o aviso honesto
//   de que o ano dela comeca na proxima lua nova.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import ColunaLeitura from '../../components/ColunaLeitura';
import FaixaCurva from '../../components/FaixaCurva';
import { space } from '../../theme';
import HiloFondo from '../components/HiloFondo';
import { VersoDeCarta } from '../components/ScratchRevealCard';
import { Cuerpo, Micro, Sobreceja } from '../components/Texto';
import { t } from '../datos/textos';
import { temaPorNumero } from '../lib/ano';
import { diaLocal } from '../lib/ceu';
import { inicioDaJornada } from '../lib/entrada';
import { leerSeguro } from '../lib/almacen';
import { mapaDoAno } from '../lib/mapaDoAno';
import { precisaDeRede } from '../lib/plano';
import { signoDe } from '../datos/preguntas';
import { atoDoDia } from '../lib/atoDoDia';
import { glifoDoSigno, luaNoSignoDela } from '../lib/luaNoSigno';
import { ritualDoDia } from '../lib/rituaisRotativos';
import { diasRaspados } from '../lib/veuDoDia';
import { RUTAS } from '../routes';
import { colores, espacio, sombra } from '../theme';

export default function MapaDoAnoScreen({ navigation }) {
  const montado = useRef(true);
  // null = lendo; {casas, hoje} = tabuleiro; {semAncora:true} = ano nao comecou
  const [dados, setDados] = useState(null);

  /* O PULSO DA PECA — vida de tabuleiro. UMA animacao no app inteiro, suave
   * (1 -> 1.07 em 1,4s), em loop com useNativeDriver. Quem quiser o mapa
   * quieto tem o ajuste de movimento reduzido no telefone. */
  const pulso = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1.07, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulso, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulso]);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  /* CARREGA NA MONTAGEM E EM TODO FOCO. A aba fica montada a sessao inteira;
   * sem o listener, raspar o dia no plano e voltar nao acendia a casa, e a
   * meia-noite congelava o "hoje" no dia velho (achado do /code-review). */
  const carregar = useCallback(() => {
    let cancelado = false;
    (async () => {
      const [inicio, raspados, perfilCru] = await Promise.all([
        inicioDaJornada(),
        diasRaspados(),
        leerSeguro('perfil'),
      ]);
      if (cancelado || !montado.current) return;
      /* O MESMO predicado do plano (lib/plano.precisaDeRede): em contato duro
       * ou bloqueio, o sabado vivido foi um dia de GESTO (o convite trancado
       * nao e ato) — e a etiqueta da casa tem que contar o que aconteceu. */
      let contatoDuro = false;
      let signoDela = null;
      try {
        const p = perfilCru ? JSON.parse(perfilCru) : null;
        const respostas = p && p.respuestas && typeof p.respuestas === 'object' ? p.respuestas : p;
        contatoDuro = precisaDeRede(respostas || {});
        signoDela = signoDe(respostas || {});
      } catch {
        contatoDuro = false;
        signoDela = null;
      }
      const hoje = diaLocal();
      const casas = inicio ? mapaDoAno(inicio, hoje, raspados) : null;
      setDados(casas ? { casas, hoje, contatoDuro, signoDela } : { semAncora: true });
    })().catch(() => {
      if (!cancelado && montado.current) setDados({ semAncora: true });
    });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => carregar(), [carregar]);

  useEffect(() => {
    if (!navigation || typeof navigation.addListener !== 'function') return undefined;
    return navigation.addListener('focus', () => {
      carregar();
    });
  }, [navigation, carregar]);

  /* Toque numa casa que ainda abre -> o plano DAQUELE dia. O plano revalida o
   * parametro com a mesma regra (lib/veuDoDia.diaAindaAbre): esta tela nao e a
   * guarda, e so a porta. */
  const abrirDia = useCallback(
    (dia) => {
      if (!navigation || typeof navigation.navigate !== 'function') return;
      /* Tab-a-tab: o mapa e o plano moram no MESMO navegador de abas agora. */
      navigation.navigate(RUTAS.PLANO, { dia });
    },
    [navigation]
  );

  /* As 13 secoes, cada uma com as casas da sua lua. Casa sem lua medida (borda
   * do arco, efemeride ausente) entra na secao anterior para o tabuleiro nunca
   * ter buraco — e um problema de AGRUPAMENTO visual, nao de medida. */
  const secoes = useMemo(() => {
    if (!dados || !dados.casas) return null;
    const porLua = [];
    let atual = null;
    let ultimaLua = 0;
    for (const casa of dados.casas) {
      const lua = casa.lunacao || ultimaLua || 1;
      if (!atual || atual.lua !== lua) {
        atual = { lua, casas: [] };
        porLua.push(atual);
      }
      ultimaLua = lua;
      atual.casas.push(casa);
    }
    return porLua;
  }, [dados]);

  const casaDeHoje = useMemo(() => {
    if (!dados || !dados.casas) return null;
    return dados.casas.find((c) => c.dia === dados.hoje) || null;
  }, [dados]);

  return (
    <View style={estilos.raiz}>
      <HiloFondo />
      <SafeAreaView style={estilos.area}>
        <ScrollView contentContainerStyle={estilos.contenido}>
          <Sobreceja style={estilos.textoDoTopo}>{t('mapa.rotulo')}</Sobreceja>

          {dados === null ? null : dados.semAncora ? (
            /* O ano ainda nao comecou: o aviso honesto, nunca um tabuleiro
               inventado com datas chutadas.

               O ESTADO VAZIO, CONSERTADO (12/09/2026). Fotografado antes: uma
               frase no topo e ~550px de nada ate a barra de abas — o MESMO
               defeito ALTO que o revisor achou no estado vazio da Home, onde a
               faixa virou bloco de cor. Aqui era pior, porque nao havia nem
               faixa: era a tela crua com o fio passando no meio do vazio.

               O QUE NAO FOI FEITO, e e a parte que importa: NADA foi inventado
               pra encher. Nao ha contador de dias que faltam, nao ha tabuleiro
               fantasma com casas cinzas, nao ha "0 de 365" — o mapa nao existe
               ainda e a tela nao pode fingir que existe (lei 1 da casa, e a
               doutrina deste modulo proibe data chutada com todas as letras).

               O que foi feito: `mapa.como` desceu pra ca. Ele ja existe, ja e
               do mapa, e descreve exatamente a coisa que a pessoa esta
               esperando — como as casas se abrem. Mostra-lo aqui e responder
               "e como vai ser?", que e a pergunta que o vazio deixa no ar.
               Nenhuma chave nova, nenhuma promessa de desfecho: ele diz o
               mecanismo, nao o resultado.

               A FAIXA E `rasa`: o mesmo prop que consertou a Home. A caixa da
               onda cai de 56 pra 28px porque aqui ha pouco conteudo, e onda
               cheia sobre bloco curto e o que faz a faixa ler como "bloco de
               cor vazio". A onda NAO e redesenhada — mesmo `d`, mesma semente,
               so a caixa encolhe — entao a secao nao troca de identidade no dia
               em que o mapa nascer e a faixa voltar ao tamanho inteiro. */
            <FaixaCurva tom="ameixa" semente="mapa-espera" rasa style={estilos.espera}>
              <ColunaLeitura>
                <Cuerpo>{t('mapa.semAncora')}</Cuerpo>
                <Cuerpo style={estilos.esperaComo}>{t('mapa.como')}</Cuerpo>
              </ColunaLeitura>
            </FaixaCurva>
          ) : (
            <>
              {casaDeHoje ? (
                <Micro style={[estilos.textoDoTopo, estilos.hoje]}>
                  {/* Sem lua medida, o cabecalho diz SO o dia — numero de lua
                      inventado e exatamente o que a doutrina deste modulo
                      proibe. */}
                  {casaDeHoje.lunacao
                    ? t('mapa.hoje', { n: casaDeHoje.n, lua: casaDeHoje.lunacao })
                    : t('mapa.hojeSoDia', { n: casaDeHoje.n })}
                </Micro>
              ) : null}
              <Cuerpo style={[estilos.textoDoTopo, estilos.como]}>{t('mapa.como')}</Cuerpo>

              {secoes.map((secao) => {
                const tema = temaPorNumero(secao.lua);
                /* ---------------------------------------------------------
                   O CAMINHO DO TABULEIRO — a segunda vida deste render. A
                   primeira era uma grade-serpentina de linhas; o dono pediu
                   "igual um tabuleiro de jogos" e o desenho virou TRILHA:
                   as casas sao medalhoes pendurados numa curva em S continua
                   (o seno anda com o numero GLOBAL do dia, entao a curva
                   emenda de uma lua na outra), o fio percorrido brilha, e
                   cada lua abre com o proprio medalhao. Um SVG leve por
                   secao — um path, tres strokes. */
                const pontos = pontosDaSecao(secao.casas, secao.lua);
                const altura = TOPO_CASAS + secao.casas.length * PASSO_Y;
                let ultimaViva = -1;
                for (let i = 0; i < secao.casas.length; i += 1) {
                  if (secao.casas[i].estado !== 'futuro') ultimaViva = i;
                }
                const partida = { x: LARG / 2, y: MEDALHAO_Y };
                const dCheio = caminhoSuave([partida, ...pontos]);
                const dVivo =
                  ultimaViva >= 0
                    ? caminhoSuave([partida, ...pontos.slice(0, ultimaViva + 1)])
                    : null;
                return (
                  <View key={`lua-${secao.lua}`} style={[estilos.secao, { height: altura }]}>
                    <Svg
                      pointerEvents="none"
                      style={StyleSheet.absoluteFill}
                      viewBox={`0 0 ${LARG} ${altura}`}
                    >
                      <Path
                        d={dCheio}
                        stroke={colores.bordeSuave}
                        strokeWidth={3}
                        fill="none"
                        strokeLinecap="round"
                      />
                      {dVivo ? (
                        <>
                          {/* o brilho por baixo, o fio por cima — trilha viva */}
                          <Path d={dVivo} stroke={colores.hilo} strokeWidth={9} fill="none" opacity={0.22} strokeLinecap="round" />
                          <Path d={dVivo} stroke={colores.hilo} strokeWidth={3.5} fill="none" strokeLinecap="round" />
                        </>
                      ) : null}
                    </Svg>

                    {/* O MEDALHAO DA LUA — o portal do capitulo no caminho. */}
                    <View style={estilos.medalhaoLua}>
                      <Micro style={estilos.medalhaoTexto}>{t('mapa.lua', { lua: secao.lua })}</Micro>
                      {dados.signoDela ? (
                        <Micro style={estilos.medalhaoSigno}>{glifoDoSigno(dados.signoDela)}</Micro>
                      ) : null}
                    </View>
                    {tema && tema.titulo ? (
                      <Micro style={estilos.temaCaminho}>{tema.titulo}</Micro>
                    ) : null}

                    {secao.casas.map((casa, i) => {
                      const abre = casa.estado === 'aberto';
                      const ehHoje = casa.dia === dados.hoje;
                      const pos = {
                        position: 'absolute',
                        left: pontos[i].x - RAIO,
                        top: pontos[i].y - RAIO,
                      };
                      const celula = [
                        estilos.casa,
                        pos,
                        casa.estado === 'raspado' ? estilos.casaRaspada : null,
                        casa.estado === 'passado' ? estilos.casaPassada : null,
                        casa.estado === 'futuro' ? estilos.casaFutura : null,
                        abre ? estilos.casaAberta : null,
                        abre && ehHoje ? estilos.casaHoje : null,
                      ];
                      /* O metal foil de verdade so nas casas fechadas da lua
                         ATUAL (~29 SVGs; 365 travariam um Android medio). */
                      const metal =
                        casaDeHoje &&
                        casa.lunacao === casaDeHoje.lunacao &&
                        (casa.estado === 'futuro' || abre) ? (
                          <VersoDeCarta style={estilos.metal} />
                        ) : null;
                      const glifo = glifoDaCasa(casa, dados.contatoDuro, dados.signoDela);
                      const etiqueta = etiquetaDaCasa(casa, dados.hoje, dados.contatoDuro, dados.signoDela);
                      const ladoDireito = pontos[i].x < LARG / 2;
                      const numero = (
                        <>
                        <Micro
                          tabular
                          style={[
                            estilos.numero,
                            casa.estado === 'raspado' ? estilos.numeroRaspado : null,
                            casa.estado === 'passado' ? estilos.numeroPassado : null,
                            abre ? estilos.numeroAberto : null,
                          ]}
                        >
                          {casa.n}
                        </Micro>
                        {glifo ? (
                          <View
                            style={[
                              estilos.glifoChip,
                              glifo === '\u2640' ? estilos.glifoChipVenus : null,
                            ]}
                          >
                            <Micro style={glifo === '\u2640' ? estilos.glifoVenus : estilos.glifoTexto}>
                              {glifo}
                            </Micro>
                          </View>
                        ) : null}
                        </>
                      );
                      /* SO a casa que ainda abre e tocavel — toque morto
                         ensina a nao tocar. */
                      const rotuloEstacao = etiqueta ? (
                        <View
                          key={'etq-' + casa.dia}
                          pointerEvents="none"
                          style={[
                            estilos.etiqueta,
                            {
                              top: pontos[i].y - 16,
                              left: ladoDireito ? pontos[i].x + RAIO + 12 : undefined,
                              right: ladoDireito ? undefined : LARG - pontos[i].x + RAIO + 12,
                              alignItems: ladoDireito ? 'flex-start' : 'flex-end',
                            },
                            casa.estado === 'passado' ? estilos.etiquetaPassada : null,
                          ]}
                        >
                          {etiqueta.alta ? (
                            <Micro style={estilos.etiquetaAlta}>{etiqueta.alta}</Micro>
                          ) : null}
                          {etiqueta.baixa ? (
                            <Micro
                              style={[
                                estilos.etiquetaBaixa,
                                etiqueta.viva ? estilos.etiquetaViva : null,
                                { textAlign: ladoDireito ? 'left' : 'right' },
                              ]}
                            >
                              {etiqueta.baixa}
                            </Micro>
                          ) : null}
                        </View>
                      ) : null;
                      const casaMontada = abre ? (
                        ehHoje ? (
                        <Animated.View key={casa.dia} style={[...celula, { transform: [{ scale: pulso }] }]}>
                          <Pressable
                            onPress={() => abrirDia(casa.dia)}
                            accessibilityRole="button"
                            accessibilityLabel={t('mapa.abrirDia', { n: casa.n })}
                            style={estilos.dentroDaPeca}
                          >
                            {metal}
                            {numero}
                          </Pressable>
                        </Animated.View>
                        ) : (
                        <Pressable
                          key={casa.dia}
                          onPress={() => abrirDia(casa.dia)}
                          accessibilityRole="button"
                          accessibilityLabel={t('mapa.abrirDia', { n: casa.n })}
                          style={celula}
                        >
                          {metal}
                          {numero}
                        </Pressable>
                        )
                      ) : (
                        <View key={casa.dia} style={celula}>
                          {metal}
                          {numero}
                        </View>
                      );
                      return (
                        <View key={'estacao-' + casa.dia}>
                          {rotuloEstacao}
                          {casaMontada}
                        </View>
                      );
                    })}
                  </View>
                );
              })}

              <Micro style={[estilos.textoDoTopo, estilos.pe]}>{t('mapa.pe')}</Micro>
            </>
          )}
          <View style={estilos.espaco} pointerEvents="none" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* ===================================================================================
   A GEOMETRIA DO CAMINHO
   Largura logica fixa (o container centraliza) para que o SVG e as casas
   absolutas usem as MESMAS coordenadas sem medir tela. O seno anda com o
   numero GLOBAL do dia (casa.n), entao a curva e continua de lua em lua.
   =================================================================================== */
const LARG = 320;
const PASSO_Y = 74;
const AMPL = 92;
const RAIO = 26;
const MEDALHAO_Y = 40;
const TOPO_CASAS = 128;

/* A CURIOSIDADE DE CADA CASA — o detalhe que o dono pediu ("algo ao lado de
 * cada numero, igual tabuleiro"), sem trair o audio 10 ("eu nao vou te
 * adiantar quais sao [os gestos]"):
 *   · casa VIVIDA (raspada/passada): o glifo do gesto que aquele dia teve —
 *     registro, nao spoiler;
 *   · casa FUTURA: so os marcos que nao sao segredo — sexta e o dia de Venus
 *     (o ritmo dos dois e anunciado no proprio app).
 * Nada aqui passa pela rede de contato porque nada aqui e passo de gesto —
 * e um icone. O guarda de test/madremaria-plano.test.js vale para a PlanoScreen. */
const GLIFO_DO_GESTO = Object.freeze({
  cafe: '\u2615',        // xicara
  caminhada: '\ud83d\udc63', // pegadas
  respiro: '\ud83c\udf2c\ufe0f', // sopro
  sonho: '\ud83c\udf19',  // lua da noite
  canto: '\ud83e\uddfa',  // cesto
  mao: '\ud83d\udd90\ufe0f',   // mao aberta
  cartas: '\ud83c\udccf',
});

function diaDaSemanaDe(dia) {
  const [a, m, d] = String(dia).split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

function ehSextaLocal(dia) {
  return diaDaSemanaDe(dia) === 5;
}

/* A ETIQUETA DA ESTACAO — cada casa e uma parada nomeada do caminho (o
 * "algo especial escrito ao lado" que o dono pediu):
 *   · vivida: o NOME do gesto que aquele dia teve — a memoria visivel;
 *   · hoje/ontem: o chamado;
 *   · futura: o dia da semana + o planeta regente — publico, da marca, e
 *     nenhum segredo do audio 10 vaza (o gesto futuro continua coberto). */
const SEMANA_CURTA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const PLANETA_DA_SEMANA = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];

function etiquetaDaCasa(casa, hoje, contatoDuro, signoDela) {
  if (casa.dia === hoje) return { alta: 'HOJE', baixa: null, viva: true };
  if (casa.estado === 'aberto') return { alta: 'AINDA DÁ', baixa: null, viva: true };
  /* A LUA NO SIGNO DELA: transito medido (lib/luaNoSigno.js), so nas casas
   * FUTURAS — as vividas mostram o ato; memoria nao se sobrescreve. */
  if (casa.estado === 'futuro' && luaNoSignoDela(casa.dia, signoDela)) {
    const s = diaDaSemanaDe(casa.dia);
    return {
      alta: t('mapa.seuDia'),
      baixa: SEMANA_CURTA[s] + ' · ' + PLANETA_DA_SEMANA[s],
      viva: true,
    };
  }
  if (casa.estado === 'raspado' || casa.estado === 'passado') {
    let ato = atoDoDia(casa.dia);
    if (ato === 'encontro' && contatoDuro) ato = 'gesto';
    if (ato === 'gesto') {
      const gesto = ritualDoDia(casa.dia);
      return gesto ? { alta: null, baixa: gesto.nome, viva: false } : null;
    }
    return { alta: null, baixa: t('plano.ato.' + ato), viva: false };
  }
  const s = diaDaSemanaDe(casa.dia);
  return { alta: null, baixa: SEMANA_CURTA[s] + ' · ' + PLANETA_DA_SEMANA[s], viva: s === 5 };
}

/* Um dia = UM ato (lib/atoDoDia.js, 03/09): o glifo da casa vivida e o do
 * ATO daquele dia — o gesto mostra o proprio icone; missao, pergunta e
 * encontro tem selo fixo. Nada disso vaza passo de gesto futuro. */
const GLIFO_DO_ATO = Object.freeze({
  missao: '\ud83d\udddd\ufe0f',   // chave: a missao
  pergunta: '\ud83d\udd8b\ufe0f', // pena: a escrita
  encontro: '\ud83c\udf05',        // horizonte: o convite
  ritmo: '\u2640',
});

/* APROXIMACAO DECLARADA: o mapa deriva o ato vivido do calendario + contato
 * (o sabado em contato duro caiu no gesto — mesmo criterio do plano). O que
 * ele NAO tem como saber: a sexta fechada no "hoje nao" (estado de sessao) e
 * os dias vividos antes de 03/09 (modelo antigo). Registrar o ato efetivo
 * por dia e o proximo passo da fila se isso doer. */
function glifoDaCasa(casa, contatoDuro, signoDela) {
  if (casa.estado === 'raspado' || casa.estado === 'passado') {
    let ato = atoDoDia(casa.dia);
    if (ato === 'encontro' && contatoDuro) ato = 'gesto';
    if (ato === 'gesto') {
      const gesto = ritualDoDia(casa.dia);
      return gesto ? GLIFO_DO_GESTO[gesto.id] || null : null;
    }
    return GLIFO_DO_ATO[ato] || null;
  }
  if (casa.estado === 'futuro' && luaNoSignoDela(casa.dia, signoDela)) {
    return glifoDoSigno(signoDela);
  }
  if (ehSextaLocal(casa.dia)) return GLIFO_DO_ATO.ritmo; // Venus: o dia do ritmo
  return null;
}

/* ===================================================================================
   O TRACADO POR PADROES — "todo em curva igual fica muito simples" (dono).
   O caminho e montado por TRECHOS de ~6 casas, e cada trecho sorteia (de
   forma DETERMINISTICA, pela lua e pelo indice do bloco — nada de
   Math.random) um desenho proprio: zig fechado, escada, diagonal, S largo,
   coluna com desvio. As juntas ficam macias porque caminhoSuave ja emenda
   tudo em cubicas.
   =================================================================================== */
const TAM_BLOCO = 6;
const PADROES = [
  // zig fechado — vai-e-vem curto
  (i) => 78 * Math.sin(i * 1.15),
  // escada — degraus alternados
  (i) => (i % 2 === 0 ? -72 : 72),
  // diagonal esquerda -> direita
  (i) => -88 + i * 34,
  // diagonal direita -> esquerda
  (i) => 88 - i * 34,
  // S largo — a curva calma
  (i) => 92 * Math.sin(i * 0.55),
  // coluna central com um desvio no meio
  (i) => (i === 2 || i === 3 ? 74 : -10),
];

function pontosDaSecao(casas, lua) {
  return casas.map((c, i) => {
    const bloco = Math.floor(i / TAM_BLOCO);
    const dentro = i - bloco * TAM_BLOCO;
    const padrao = PADROES[(lua * 3 + bloco * 7) % PADROES.length];
    const bruto = LARG / 2 + padrao(dentro) + 14 * Math.sin(c.n * 0.19 + lua);
    const x = Math.max(RAIO + 8, Math.min(LARG - RAIO - 8, bruto));
    return { x, y: TOPO_CASAS + i * PASSO_Y };
  });
}

/* Curva suave por cubicas verticais: cada trecho desce em S, como trilha de
   tabuleiro — nunca reta, nunca quina. */
function caminhoSuave(pts) {
  if (!pts.length) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    const k = (b.y - a.y) / 2;
    d += ` C ${a.x} ${a.y + k} ${b.x} ${b.y - k} ${b.x} ${b.y}`;
  }
  return d;
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: colores.noche,
  },
  area: {
    flex: 1,
  },
  // SEM paddingHorizontal (12/09/2026), mesma razao das telas de documento: a
  // faixa do estado vazio precisa SANGRAR de ponta a ponta pra ser chao. Capada
  // em 16px de cada lado ela vira card, que e o efeito recusado. O tabuleiro
  // nao sente falta: as secoes ja se centralizam sozinhas por LARG.
  // O recuo passou pros blocos de texto que o usavam (`rotulo`, `hoje`, `como`,
  // `pe`) e pra ColunaLeitura do estado vazio.
  contenido: {
    paddingTop: espacio.xl,
  },
  // O gutter que saiu do ScrollView. `tela` (16) e o recuo horizontal padrao do
  // app — o mesmo valor de espacio.lg que estava la, agora nomeado pelo uso.
  textoDoTopo: {
    paddingHorizontal: space.tela,
  },
  // O ESTADO VAZIO. `bloco` (16) em cima e nao `secao` (32): a faixa e `rasa`,
  // entao a onda dela ja ocupa so 28px, e o degrau grande de secao abriria de
  // novo o buraco que este conserto veio fechar. Embaixo `entre` (24), porque
  // dali pra baixo nao ha mais nada — o respiro do fim ja e o `espaco`.
  // So `marginTop`: ele separa a faixa do rotulo que vem ANTES dela, por fora, e
  // e isso que marginTop deve fazer. O padding que estava aqui saiu no conserto
  // de 12/09/2026 — era DUPLICATA do que a propria FaixaCurva ja poe no corpo
  // dela, e padding no `style` da peca vira espaco transparente entre o chao e a
  // faixa vizinha (64px de rasgo, fotografado na tela de termos). Aqui a faixa e
  // unica e nao tinha vizinha pra mostrar o defeito — mas duplicata que hoje nao
  // aparece e a que volta a doer quando alguem puser a segunda.
  espera: {
    marginTop: space.bloco,
  },
  // `bloco` (16) entre as duas frases: sao dois paragrafos do mesmo assunto
  // (o que vai acontecer, e como vai funcionar), nao dois assuntos.
  esperaComo: {
    marginTop: space.bloco,
    color: colores.ceniza,
  },
  hoje: {
    marginTop: espacio.sm,
    color: colores.foilTexto,
  },
  como: {
    marginTop: espacio.md,
    color: colores.ceniza,
  },
  secao: {
    marginTop: espacio.md,
    width: LARG,
    alignSelf: 'center',
  },
  tema: {
    marginTop: espacio.xs,
    color: colores.ceniza,
  },
  /* --- o caminho ------------------------------------------------------------------ */
  medalhaoLua: {
    position: 'absolute',
    left: LARG / 2 - 34,
    top: MEDALHAO_Y - 34,
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.penumbra,
    borderWidth: 2,
    borderColor: colores.foil,
  },
  medalhaoTexto: {
    color: colores.foilTexto,
  },
  medalhaoSigno: {
    color: colores.foilTexto,
    fontSize: 14,
    lineHeight: 16,
  },
  temaCaminho: {
    position: 'absolute',
    top: MEDALHAO_Y + 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: colores.ceniza,
  },
  casa: {
    width: RAIO * 2,
    height: RAIO * 2,
    borderRadius: RAIO,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.noche,
    /* sem overflow hidden: o chip do glifo mora no canto de FORA do circulo.
     * O metal foil ganha o proprio recorte no estilo `metal`. */
  },
  /* raspada: a casa vencida — acesa e com a borda do fio */
  casaRaspada: {
    backgroundColor: colores.penumbra,
    borderColor: colores.bordeHilo,
  },
  /* passada sem raspar: APAGADA. Nunca vermelha, nunca riscada — apagado e
     fato; marcado de erro e culpa, e culpa e proibida por escrito. */
  casaPassada: {
    opacity: 0.35,
  },
  /* futura com PRESENCA: fundo penumbra e borda ceniza — "ficou meio apagado
   * cada casa" foi o feedback do aparelho real. Apagada de verdade so a
   * passada, que e doutrina. */
  casaFutura: {
    backgroundColor: colores.penumbra,
    borderColor: colores.ceniza,
  },
  /* a que ainda abre: o fio vivo na borda */
  casaAberta: {
    borderColor: colores.hilo,
    borderWidth: 2.5,
  },
  /* A PECA: a casa de HOJE — maior, tingida e com sombra de peca de jogo. */
  casaHoje: {
    backgroundColor: colores.nudo,
    ...sombra.elevada,
  },
  dentroDaPeca: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* O CHIP DO GLIFO — fora do circulo (canto inferior direito), com fundo:
   * era um caractere solto de 10px dentro da casa e o dono nao o enxergou no
   * aparelho. Chip legivel e do tamanho de badge de tabuleiro. */
  /* --- as etiquetas de estacao ------------------------------------------------- */
  etiqueta: {
    position: 'absolute',
    maxWidth: 118,
  },
  etiquetaAlta: {
    color: colores.foilTexto,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  etiquetaBaixa: {
    color: colores.ceniza,
    fontSize: 10,
    lineHeight: 13,
  },
  etiquetaViva: {
    color: colores.foilTexto,
  },
  etiquetaPassada: {
    opacity: 0.4,
  },
  glifoChip: {
    position: 'absolute',
    right: -7,
    bottom: -5,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.penumbra,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    paddingHorizontal: 3,
  },
  glifoChipVenus: {
    borderColor: colores.foil,
  },
  glifoTexto: {
    fontSize: 12,
    lineHeight: 15,
  },
  glifoVenus: {
    fontSize: 13,
    lineHeight: 16,
    color: colores.foilTexto,
  },
  /* o metal foil por baixo do numero, nas cartas fechadas da lua atual */
  metal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RAIO,
    overflow: 'hidden',
    opacity: 0.55,
  },
  numero: {
    color: colores.papel,
  },
  numeroRaspado: {
    color: colores.foilTexto,
  },
  numeroPassado: {
    color: colores.ceniza,
  },
  numeroAberto: {
    color: colores.papel,
  },
  pe: {
    marginTop: espacio.xl,
    color: colores.ceniza,
  },
  espaco: {
    height: espacio.xxxl,
  },
});
