// screens/RitualScreen.js — O RITUAL DE SETE DIAS, um dia por tela.
//
// ===========================================================================
// O QUE ESTA TELA E
// ===========================================================================
// O funil de WhatsApp que ja converte neste nicho pede uma coisa so: "durante 7
// dias, reserve 5 minutinhos por dia". O mecanismo funciona porque e pequeno,
// fechado e sobre ELA — nao porque promete. Esta tela e esse mecanismo sem a
// camada de causalidade e de cobranca:
//
//   · CINCO MINUTOS DECLARADOS. O preco em tempo esta escrito antes de comecar.
//   · SETE DIAS COM FIM MARCADO. Nao e habito para sempre, e uma temporada.
//   · O COMPROMISSO PEDIDO ANTES DO DIA 1 (o PACTO de datos/ritual.js), nunca no
//     meio da semana que o app pediu que ela cumprisse.
//   · UM GESTO POR DIA, pequeno, concreto e que se completa nela.
//   · O DIA 7 ANUNCIADO NO DIA 1: nele volta, com a data, o que ela escreveu.
//
// O que ficou de fora do funil, e por que:
//   · "isso e fundamental para o sucesso do trabalho" — transfere para ela a
//     culpa pelo fracasso. Faltar um dia aqui nao custa nada;
//   · "o trabalho espiritual que fiz pra voce" — o ritual nao age sobre a outra
//     pessoa, nao atrai, nao chama e nao aproxima. Ele e sobre ela;
//   · "isso vai te acalmar" — alegacao de saude. Esta tela DESCREVE o gesto e
//     nunca o efeito dele no corpo ou na mente;
//   · "estarei em oracao por voce" — persona que nao existe. A substituicao
//     honesta e a MEMORIA: o app lembra o que ela escreveu e devolve com data.
//     Ser lembrada e a forma verificavel de ser acompanhada.
//
// ===========================================================================
// O RETORNO E MUDO — a decisao mais importante deste arquivo, e ela e por OMISSAO
// ===========================================================================
// Procure neste arquivo por "dias desde o ultimo passo", por "voce ficou X dias
// fora", por badge de ausencia ou por qualquer aviso de retomada. Nao existe, e a
// ausencia e deliberada: quem sumiu tres semanas volta exatamente no dia em que
// parou e a tela nao comenta o assunto. O dia que faltava esta ali, igual. Nao ha
// penalidade, nao ha reset, nao ha "recuperar" e nao ha nada a comprar para
// voltar. lib/ritual.js sustenta isso do lado do dado — o dia de hoje e o proximo
// nao concluido, e nada no motor olha para o tamanho da ausencia.
//
// A trava de um passo por dia (que e o que da valor ao formato) tambem nao pode
// virar ameaca: o ramo `bloqueadoHoy` diz que o proximo abre amanha e explica a
// trava pelo lado do desenho — "e isso que faz caber em cinco minutos" —, nunca
// com "volte amanha para nao perder".
//
// ===========================================================================
// O ESPELHO DO DIA 7 — a peca mais forte e a mais escorregadia
// ===========================================================================
// No dia 7 a tela devolve, com data, a linha que ela deixou no dia 1. Ela SO cita
// e pergunta. No instante em que o app comparar ("voce estava assim, agora esta
// assim") ou concluir ("voce mudou"), virou veredito sobre a vida dela — que e o
// mesmo erro do "em breve o seu amor volte" do funil, so que com voz de
// terapeuta. Por isso 'ritual.espejo.pie' diz na cara que o app nao compara e nao
// conclui, e por isso a citacao entra VERBATIM, num bloco proprio, e nunca dentro
// de uma frase nossa.
//
// Quem escolhe entre as duas versoes do dia 7 e lib/ritual.js (cierreDelRitual):
// com espelho, quando existe linha do dia 1; sem espelho, quando nao existe. A
// tela so desenha o que voltou. A versao sem espelho existe porque a melhor cena
// do produto nao pode quebrar justo para quem so tocou nos botoes: nesse caso o
// que volta e o dado que de fato existe, que sao as sete datas.
//
// ===========================================================================
// O QUE ESTA TELA USA DE FORA (e o que ela deliberadamente NAO faz)
// ===========================================================================
// Ela nao guarda progresso, nao decide qual e o dia de hoje e nao conta dias: le
// e manda gravar.
//
//   lib/ritual.js    resumenRitual() → { estado, diasHechos, diaActual, paso,
//                    completo, empezado, bloqueadoHoy, motivo, ultimaFecha,
//                    fechas, nudos, proximoNudo }
//                    concluirDia(dia, { nota }) → { ok, motivo, estado,
//                    nudosNuevos, persistido }
//                    cierreDelRitual() → { conEspejo, plantilla, fecha, texto }
//                    reiniciarRitual() → APAGA a chave inteira (ver abaixo)
//   datos/ritual.js  DURACION, PACTO, getDia(n) — o conteudo dos sete dias.
//   lib/hilo.js      atarNudo(), chamado ao fechar o dia.
//   lib/mazo.js      sacarMayor(), a carta do dia.
//   lib/lectura.js   guardaContacto/guardaFuturo sobre o conselho do baralho
//                    — rodam DENTRO de lib/lectura.js (proteger(), usada por
//                    componerLectura) e em lib/plano.js. Esta tela nao os
//                    chama desde que a carta do dia saiu (01/09/2026, ver o
//                    bloco no JSX); o import morto foi removido em 13/09.
//
// RECOMECAR APAGA. reiniciarRitual() chama borrarSeguro: os sete registros saem
// do aparelho. 'ritual.fin.guardado' diz exatamente isso na tela, porque prometer
// que "fica guardado" seria mentira no bloco mais sensivel do app. Se um dia o
// motor passar a arquivar, e aquela linha que muda primeiro.
//
// ===========================================================================
// DOIS MOTORES DE CONTAGEM, E POR QUE ELES NUNCA APARECEM JUNTOS
// ===========================================================================
// O app tem dois contadores de dias: o fio ('hilo', lib/hilo.js) e o ritual
// ('ritual', lib/ritual.js). Eles vao divergir na borda — meia-noite, virada de
// mes, relogio alterado — e um app que diz "5 nudos" numa tela e "4 dias" na
// outra perde a unica coisa que sustenta o produto, que e o numero ser verdade.
// Por isso esta tela NUNCA mostra a contagem do fio: os sete nos aqui sao os sete
// dias DO RITUAL, e o numero escrito ao lado deles ('DIA 3 DE 7') sai do mesmo
// resumo que desenha os nos.
//
// Fechar um dia chama atarNudo() de lib/hilo.js — o ritual alimenta o mesmo fio,
// porque vir aqui e vir ao app. atarNudo e idempotente dentro do dia, entao quem
// ja tinha lido a tirada hoje nao ganha dois nos.
//
// ===========================================================================
// CONTRATOS DE ARQUIVO
// ===========================================================================
//  · Regra 8 — nenhum hex e nenhum rgba aqui; toda cor sai de theme.js.
//  · Regra 9 — colores.hilo so como traco, cursor e borda. Nunca como texto.
//  · Toda string visivel vem de t() (datos/textos.js) ou de datos/ritual.js.
//  · Toda tipografia vem dos wrappers de components/Texto.js.
//  · Nenhum Alert.alert: no react-native-web ele e no-op silencioso.
//  · props.navigation e OPCIONAL: sem ele a tela desenha inteira (screenshot de
//    loja) e nada quebra.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import BotonPrimario from '../components/BotonPrimario';
import FaixaNudos from '../components/FaixaNudos';
import FaixaCurva from '../../components/FaixaCurva';
import { space } from '../../theme';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, NombreCarta, Rotulo, Sobreceja, Titulo } from '../components/Texto';
import { DURACION, getDia, pacto } from '../datos/ritual';
import { t } from '../datos/textos';
import { atarNudo } from '../lib/hilo';
import { MAX_NOTA, cierreDelRitual, concluirDia, reiniciarRitual, resumenRitual } from '../lib/ritual';
import { colores, espacio, radio, tipo } from '../theme';

/* ===================================================================================
   DATA LEGIVEL — '2026-09-12' -> '12 de setembro'
   Os doze meses moram em datos/textos.js ('ritual.meses'), nao aqui: a tela nao
   pode ter string solta, e no dia da traducao os nomes viajam com o resto.
   Data ilegivel devolve '' — o bloco que a usaria some em vez de escrever 'NaN'.
   =================================================================================== */
export function fechaLegible(dia) {
  if (typeof dia !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return '';
  const [anio, mes, dd] = dia.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dd));
  // Round-trip: mata '2026-02-31' e '2026-13-01', que passam no regex.
  if (
    fecha.getUTCFullYear() !== anio
    || fecha.getUTCMonth() !== mes - 1
    || fecha.getUTCDate() !== dd
  ) {
    return '';
  }
  const meses = t('ritual.meses');
  const nombre = Array.isArray(meses) ? meses[mes - 1] : null;
  if (!nombre) return '';
  return t('ritual.fecha', { dia: dd, mes: nombre });
}


/* ===================================================================================
   A TELA
   =================================================================================== */
export default function RitualScreen({ navigation }) {
  // null = ainda lendo o disco. Nunca desenhar um "DIA 1 DE 7" que ainda nao foi
  // medido: o numero desta tela e uma afirmacao sobre a vida dela.
  const [resumen, setResumen] = useState(null);
  const [cierre, setCierre] = useState(null);
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [falloDisco, setFalloDisco] = useState(false);

  // O PACTO vive na memoria da sessao, de proposito: guarda-lo no disco criaria
  // uma chave nova (e mais uma linha em CLAVES_HILO_ROJO) para lembrar de um
  // toque que so importa enquanto o dia 1 nao foi fechado. Depois do primeiro
  // passo, `empezado` faz o mesmo trabalho e vem do progresso real.
  const [pactoHecho, setPactoHecho] = useState(false);

  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const cargar = useCallback(async () => {
    const [nuevoResumen, nuevoCierre] = await Promise.all([resumenRitual(), cierreDelRitual()]);
    if (!montado.current) return;
    setResumen(nuevoResumen);
    setCierre(nuevoCierre);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Voltar para esta tela depois de fechar um dia — ou depois da meia-noite, com
  // o app em segundo plano — tem de mostrar o estado novo, e nao o do mount.
  useEffect(() => {
    if (!navigation || typeof navigation.addListener !== 'function') return undefined;
    return navigation.addListener('focus', cargar);
  }, [navigation, cargar]);

  const completo = !!resumen && resumen.completo === true;
  const bloqueado = !!resumen && resumen.bloqueadoHoy === true;
  const diaActual = resumen && Number.isInteger(resumen.diaActual) ? resumen.diaActual : null;
  const paso = resumen && resumen.paso ? resumen.paso : null;
  const hechos = resumen && Number.isFinite(resumen.diasHechos) ? resumen.diasHechos : 0;

  // O pacto e o portao do dia 1 e some para sempre depois do primeiro passo.
  // pacto() e FUNCAO, nao constante: ela le o idioma ativo na hora da chamada, e
  // e por isso que chamar aqui no corpo do render e o certo — a arvore da Madre
  // remonta inteira quando o idioma troca (key={lang} em MadreMariaApp.js), entao
  // este render ja sai no idioma novo. Ver OS TRES IDIOMAS em datos/ritual.js.
  const elPacto = pacto();
  const pidePacto = !!resumen && !completo && !bloqueado && resumen.empezado !== true && !pactoHecho;
  const diaAbierto = !!resumen && !completo && !bloqueado && !pidePacto && !!paso;

  // A carta e sorteada UMA vez por dia aberto. O sorteio nao aceita semente e nao
  // sabe nada da usuaria (lib/mazo.js); sortear a cada render trocaria a carta
  // debaixo do dedo dela no meio da raspagem.
  useEffect(() => {
    if (!diaAbierto) {
      return;
    }
    setNota('');
  }, [diaAbierto, diaActual]);

  const cerrar = useCallback(async () => {
    if (!diaActual || guardando) return;
    setGuardando(true);
    setFalloDisco(false);

    const limpia = nota.trim();
    // null e nao '': lib/ritual.js so considera que existe espelho quando a nota e
    // string, e uma string vazia daria um dia 7 "com espelho" mostrando nada.
    const resultado = await concluirDia(diaActual, { nota: limpia ? limpia : null });

    // O fio do app inteiro ganha o no do dia. Idempotente dentro do dia: quem ja
    // tinha lido a tirada hoje nao ganha dois nos.
    await atarNudo();

    if (!montado.current) return;

    // `ok: false` com motivo nomeado ('yaHechoHoy', 'diaAdelante', ...) nao e erro
    // de disco: e o motor dizendo que o estado real e outro. Recarregar ja poe a
    // tela no ramo certo, e por isso nao existe mensagem de recusa aqui — a
    // unica coisa que a usuaria precisa saber e quando o disco NAO gravou.
    setFalloDisco(Boolean(resultado && resultado.ok === true && resultado.persistido === false));
    setGuardando(false);
    await cargar();
  }, [diaActual, guardando, nota, cargar]);

  const reiniciar = useCallback(async () => {
    if (guardando) return;
    setGuardando(true);
    await reiniciarRitual();
    if (!montado.current) return;
    setGuardando(false);
    setNota('');
    setPactoHecho(false);
    await cargar();
  }, [guardando, cargar]);

  /* ---------------------------------------------------------------------------
     O FIO NO TOPO
     Os sete nos sao os sete dias DO RITUAL. Nenhum no pulsa quando o dia de hoje
     ja foi fechado ou quando o ritual acabou: o pulso e o dia vivo, e nao um
     lembrete de que falta alguma coisa.
     --------------------------------------------------------------------------- */
  const faixa = (
    <FaixaNudos
      nudos={nudosDe(hechos)}
      indiceHoy={diaAbierto && diaActual ? diaActual - 1 : -1}
      total={DURACION}
      style={estilos.faixa}
    />
  );

  const esUltimo = diaAbierto && diaActual === DURACION;
  const cerrado = hechos > 0 ? hechos : null;
  const registroDeHoy = cerrado ? registroDe(resumen, cerrado) : null;
  const pasoCerrado = cerrado ? getDia(cerrado) : null;

  return (
    <View style={estilos.pantalla}>
      {/* HiloFondo e IRMAO do conteudo, nunca pai: ele ignora children e tem
          pointerEvents 'none'. Tenso enquanto ha um dia aberto; quieto no pacto,
          no dia ja fechado e no fim do ritual. */}
      <HiloFondo variante={diaAbierto ? 'tenso' : 'quieto'} />

      <SafeAreaView style={estilos.seguro}>
        <KeyboardAvoidingView
          style={estilos.seguro}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={estilos.contenido}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {!resumen ? (
              /* --- ESPERANDO O DISCO -------------------------------------------
                 O fio ja aparece (e desenho, nao afirmacao); o numero do dia nao. */
              <>
                <Sobreceja>{t('app.nombre')}</Sobreceja>
                {faixa}
                <Cuerpo style={estilos.espera}>{t('ritual.cargando')}</Cuerpo>
              </>
            ) : completo ? (
              /* --- O RITUAL TERMINOU -------------------------------------------
                 Sete de sete. A legenda e FATO CONTAVEL — sete dias, sete nos —
                 nunca estado ("Livre", "Renascida", "Pronta"): o no premia o que
                 ela FEZ, jamais o que ela virou.
                 Recomecar existe porque quem termina quer refazer, e a linha de
                 baixo diz a verdade sobre o preco disso: os registros saem daqui. */
              <>
                <Sobreceja>{t('ritual.fin.sobreceja')}</Sobreceja>
                <Titulo accessibilityRole="header" style={estilos.titulo}>
                  {t('ritual.fin.titulo')}
                </Titulo>
                {faixa}
                <Cuerpo style={estilos.parrafo}>{t('ritual.fin.cuerpo')}</Cuerpo>

                {/* UMA faixa em volta dos SETE, e nao sete faixas: eles sao
                    itens irmaos de uma lista, e cada um ja se separa do vizinho
                    pela propria borda. O que faltava era separar A LISTA do
                    paragrafo de encerramento que vem acima dela — mesma decisao
                    (e mesma justificativa) do acordeao da AyudaScreen.
                    `noite` e o tom mais neutro: os cartoes tem contraste
                    proprio e um chao forte aqui competiria com a leitura do que
                    ela escreveu, que e a unica coisa que importa nesta tela.
                    Sem `style`: o corpo da faixa ja traz `secao` e `tela`. */}
                <FaixaCurva tom="noite" semente="sete-espelhos" style={estilos.faixaEspelhos}>
                {Array.from({ length: DURACION }, (_, i) => i + 1).map((n) => {
                  const registro = registroDe(resumen, n);
                  const fecha = fechaLegible(registro.fecha);
                  return (
                    <View
                      key={`cerrado-${n}`}
                      style={[estilos.tarjeta, n === 1 && estilos.primeiroEspelho]}
                    >
                      <Rotulo>{t('ritual.espejo.rotulo', { n })}</Rotulo>
                      {registro.nota ? (
                        <>
                          <Cuerpo style={estilos.suyo}>{registro.nota}</Cuerpo>
                          {fecha ? (
                            <Micro style={estilos.pie}>
                              {t('ritual.espejo.fecha', { n, fecha })}
                            </Micro>
                          ) : null}
                        </>
                      ) : (
                        <Micro style={estilos.pie}>
                          {t('ritual.espejo.sinTexto', { n, fecha })}
                        </Micro>
                      )}
                    </View>
                  );
                })}
                </FaixaCurva>

                <Micro style={estilos.nota}>{t('ritual.fin.guardado')}</Micro>
                <BotonPrimario
                  titulo={t('ritual.fin.reiniciar')}
                  onPress={reiniciar}
                  cargando={guardando}
                  style={estilos.boton}
                />
              </>
            ) : bloqueado ? (
              /* --- O PASSO DE HOJE JA FOI DADO ---------------------------------
                 Mostra o que ela escreveu e diz quando o proximo abre. A trava e
                 explicada pelo desenho ("um passo por dia... cabe em cinco
                 minutos"), nunca por ameaca. Nao ha botao: nao existe jeito de
                 adiantar, e um botao que nao leva a lugar nenhum e pior que
                 nenhum botao.
                 O `cierre` do dia vem do proprio conteudo (datos/ritual.js), entao
                 o fecho de cada dia e o que foi escrito para aquele dia. */
              <>
                <Sobreceja>{t('ritual.hecho.rotulo', { n: cerrado })}</Sobreceja>
                <Titulo accessibilityRole="header" style={estilos.titulo}>
                  {t('ritual.hecho.proximo', { n: diaActual })}
                </Titulo>
                {faixa}

                {pasoCerrado && pasoCerrado.cierre ? (
                  <Cuerpo style={estilos.parrafo}>{pasoCerrado.cierre}</Cuerpo>
                ) : null}
                <Micro style={estilos.nota}>{t('ritual.hecho.porque', { n: diaActual })}</Micro>

                <View style={estilos.tarjeta}>
                  <Rotulo>{t('ritual.hecho.escrito')}</Rotulo>
                  {registroDeHoy && registroDeHoy.nota ? (
                    <Cuerpo style={estilos.suyo}>{registroDeHoy.nota}</Cuerpo>
                  ) : (
                    <Micro style={estilos.pie}>{t('ritual.hecho.sinTexto')}</Micro>
                  )}
                </View>
              </>
            ) : pidePacto ? (
              /* --- O PACTO, ANTES DO DIA 1 -------------------------------------
                 A pergunta fechada do funil ("posso confiar que voce vai fazer sua
                 parte?") vira um toque em "eu topo os sete dias", com o preco
                 (cinco minutos), o fim (sete dias) e o que acontece no ultimo dia
                 escritos ANTES. A nota do pacto ja diz que faltar nao custa nada:
                 esconder isso para ela topar seria a isca do funil de volta. */
              <>
                <Sobreceja>{t('app.nombre')}</Sobreceja>
                <Titulo accessibilityRole="header" style={estilos.titulo}>
                  {elPacto.titulo}
                </Titulo>
                {faixa}
                <Cuerpo style={estilos.parrafo}>{elPacto.cuerpo}</Cuerpo>
                <Micro style={estilos.nota}>{elPacto.nota}</Micro>
                <BotonPrimario
                  titulo={elPacto.boton}
                  onPress={() => setPactoHecho(true)}
                  style={estilos.boton}
                />
              </>
            ) : diaAbierto ? (
              /* --- O DIA ABERTO ------------------------------------------------
                 A ordem e a de docs/DIAGRAMACION.md: sobreceja, titulo, abertura,
                 a carta raspavel, a leitura da carta, [o espelho, so no dia 7], a
                 pergunta com campo, o gesto no cartao proprio e o botao. */
              <>
                <Sobreceja>{t('ritual.sobreceja', { n: diaActual, total: DURACION })}</Sobreceja>
                <Titulo accessibilityRole="header" style={estilos.titulo}>
                  {paso.titulo || t('ritual.titulo')}
                </Titulo>
                {faixa}

                {paso.abertura ? (
                  <Cuerpo style={estilos.parrafo}>{paso.abertura}</Cuerpo>
                ) : null}

                {/* A CARTA DO DIA — REMOVIDA EM 01/09.
                    Decisao do dono: o app tem TRES cartas no total, as do
                    baralho cigano da leitura de entrada, e nenhuma outra em
                    lugar nenhum. Aqui a carta era enfeite: o valor do dia esta
                    na pergunta e no gesto, e o dia funciona inteiro sem ela.
                    lib/mazo.js e as 78 continuam no repositorio, sem consumidor
                    neste arquivo. Religar e devolver este bloco e o import. */}

                {/* O ESPELHO, so no dia 7. Quem escolheu a versao foi
                    lib/ritual.js; aqui a citacao entra VERBATIM num bloco
                    proprio, com a data, e o rodape diz que o app nao compara e
                    nao conclui. Sem linha do dia 1, o molde `sinEspejo` devolve o
                    que existe de verdade e as sete datas ficam logo abaixo. */}
                {esUltimo && cierre ? (
                  <View style={estilos.tarjetaEspejo}>
                    <Cuerpo>{conFecha(cierre.plantilla, cierre.fecha)}</Cuerpo>

                    {cierre.conEspejo && cierre.texto ? (
                      <Cuerpo style={estilos.suyo}>{cierre.texto}</Cuerpo>
                    ) : (
                      (Array.isArray(resumen.fechas) ? resumen.fechas : []).map((fecha, i) => {
                        const legible = fechaLegible(fecha);
                        return legible ? (
                          <Micro key={`fecha-${i}`} style={estilos.pie}>
                            {t('ritual.espejo.fecha', { n: i + 1, fecha: legible })}
                          </Micro>
                        ) : null;
                      })
                    )}

                    <Micro style={estilos.pie}>{t('ritual.espejo.pie')}</Micro>
                  </View>
                ) : null}

                {/* A PERGUNTA E O CAMPO. Escrever e opcional e a tela diz isso: o
                    botao de fechar o dia acende de qualquer jeito. Campo
                    obrigatorio transformaria "cinco minutos" em tarefa. */}
                {paso.pregunta ? (
                  <View style={estilos.bloquePregunta}>
                    <Rotulo>{t('ritual.pregunta.rotulo')}</Rotulo>
                    <Cuerpo style={estilos.pregunta}>{paso.pregunta}</Cuerpo>
                    <TextInput
                      value={nota}
                      onChangeText={setNota}
                      placeholder={paso.placeholder || t('ritual.campo.placeholder')}
                      placeholderTextColor={colores.ceniza}
                      // O teto e o mesmo do motor: cortar no disco o que a tela
                      // deixou digitar seria apagar palavra dela sem avisar.
                      maxLength={MAX_NOTA}
                      multiline
                      textAlignVertical="top"
                      // hilo como cursor e selecao: cor de traco, nunca de letra.
                      selectionColor={colores.hilo}
                      accessibilityLabel={paso.pregunta}
                      style={[estilos.campo, nota.trim() ? estilos.campoVivo : null]}
                    />
                    <Micro style={estilos.pie}>{t('ritual.campo.nota')}</Micro>
                  </View>
                ) : null}

                {/* O GESTO, no cartao proprio. Descreve o que fazer e nunca o que
                    isso provoca: efeito no corpo ou na mente e alegacao de saude. */}
                {paso.gesto && (paso.gesto.cuerpo || paso.gesto.texto) ? (
                  <View style={estilos.tarjetaGesto}>
                    <Rotulo>{t('ritual.gesto.rotulo')}</Rotulo>
                    <Cuerpo style={estilos.parrafoCorto}>
                      {paso.gesto.cuerpo || paso.gesto.texto}
                    </Cuerpo>
                    <Micro style={estilos.pie}>{t('ritual.gesto.nota')}</Micro>
                  </View>
                ) : null}

                {falloDisco ? <Micro style={estilos.nota}>{t('errores.guardado')}</Micro> : null}

                <BotonPrimario
                  titulo={t('ritual.cerrar', { n: diaActual })}
                  onPress={cerrar}
                  cargando={guardando}
                  style={estilos.boton}
                />
              </>
            ) : (
              /* Estado impossivel pelo contrato de lib/ritual.js (nao completo, nao
                 bloqueado, com pacto feito e sem `paso`). Se acontecer, a tela
                 mostra o fio e cala a boca — inventar uma frase para um estado que
                 nao deveria existir e inventar uma afirmacao sobre a vida dela. */
              <>
                <Sobreceja>{t('app.nombre')}</Sobreceja>
                {faixa}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/* ===================================================================================
   ESTILOS
   Nenhum hex, nenhum rgba e nenhum numero de fonte. Medidas saem de `espacio` e
   `radio`; o campo de texto herda tipo.cuerpo, que ja traz familia e tamanho.
   =================================================================================== */
const GROSOR_BORDE = 1;
const ALTO_CAMPO = 120;

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.noche,
  },
  seguro: {
    flex: 1,
  },
  // O maxWidth e o recuo FICAM (12/09/2026), ao contrario das outras telas do
  // lote — e a decisao e consciente. Aqui a unica faixa e a dos sete espelhos, e
  // ela e uma faixa DE LISTA, nao de secao: ela separa a lista do paragrafo
  // acima dentro da coluna de leitura, e nao precisa sangrar de ponta a ponta da
  // JANELA pra fazer isso. Tirar o limite daqui faria o texto dos quatro
  // estados atravessar a tela inteira na web — trocaria um defeito por outro.
  contenido: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.xl,
    paddingBottom: espacio.xxxl,
    // Em tablet e na web a coluna para de crescer.
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },

  // A faixa dos sete espelhos. `ar` (48) em cima porque acima dela esta o
  // paragrafo que FECHA o ritual — separar o fecho da lista de registros pede o
  // degrau grande. Vertical apenas: padding horizontal aqui insetaria o desenho
  // inteiro da faixa (o `style` dela vai pra View de fora, que embrulha a onda),
  // e o corpo dela ja traz o recuo lateral sozinho.
  faixaEspelhos: {
    marginTop: space.ar,
  },
  // O primeiro cartao da lista nao leva margem: acima dele ja esta o padding da
  // faixa (`secao`, 32). Somar os dois daria 56px antes do primeiro e 24 entre
  // os outros seis — a lista abriria torta.
  primeiroEspelho: {
    marginTop: 0,
  },

  titulo: {
    marginTop: espacio.sm,
  },
  faixa: {
    marginTop: espacio.xl,
  },
  espera: {
    marginTop: espacio.xl,
  },
  parrafo: {
    marginTop: espacio.xl,
  },
  parrafoCorto: {
    marginTop: espacio.md,
  },
  nota: {
    marginTop: espacio.lg,
  },
  pie: {
    marginTop: espacio.md,
  },

  /* --- carta --- */
  bloqueCarta: {
    marginTop: espacio.xxl,
  },
  rotuloCarta: {
    marginBottom: espacio.lg,
  },
  estadoCarta: {
    marginTop: espacio.xs,
  },

  /* --- cartoes --- */
  tarjeta: {
    marginTop: space.entre,
    backgroundColor: colores.penumbra,
    borderRadius: radio.md,
    borderWidth: GROSOR_BORDE,
    borderColor: colores.bordeSuave,
    padding: espacio.lg,
  },
  // O espelho e o unico cartao com a borda viva: e o momento em que a voz dela
  // volta para a tela, e o fio marca esse lugar.
  tarjetaEspejo: {
    marginTop: espacio.xl,
    backgroundColor: colores.penumbra,
    borderRadius: radio.md,
    borderWidth: GROSOR_BORDE,
    borderColor: colores.bordeHilo,
    padding: espacio.lg,
  },
  tarjetaGesto: {
    marginTop: espacio.xl,
    backgroundColor: colores.penumbra,
    borderRadius: radio.md,
    borderWidth: GROSOR_BORDE,
    borderColor: colores.bordeSuave,
    padding: espacio.lg,
  },
  // O texto dela, dentro do cartao. Papel cheio: e a unica coisa da tela que ela
  // mesma escreveu, e ela le isso antes de qualquer outra linha do bloco.
  suyo: {
    marginTop: espacio.md,
    color: colores.papel,
  },

  /* --- pergunta --- */
  bloquePregunta: {
    marginTop: espacio.xxl,
  },
  pregunta: {
    marginTop: espacio.md,
  },
  campo: {
    ...tipo.cuerpo,
    marginTop: espacio.lg,
    minHeight: ALTO_CAMPO,
    paddingHorizontal: espacio.lg,
    paddingVertical: espacio.md,
    borderRadius: radio.md,
    borderWidth: GROSOR_BORDE,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.penumbra,
  },
  campoVivo: {
    borderColor: colores.bordeHilo,
  },

  /* --- acao --- */
  boton: {
    marginTop: espacio.xxl,
  },
});
