// screens/PaywallScreen.js — TELA 5, A UNICA CLARA DO APP
//
// ===========================================================================
// ONDE ESTA TELA FICA NO FUNIL (mudou em 31/08)
// ===========================================================================
// Ela agora FECHA O CARROSSEL da leitura profunda, antes de a pessoa entrar no
// app pela primeira vez:
//
//   1. as cinco perguntas       (screens/OnboardingScreen.js)
//   2. as tres cartas com a voz (screens/LeituraDeEntradaScreen.js)
//   3. os cinco audios          (screens/LeituraProfundaScreen.js)
//   4. ESTA TELA
//   5. o app — assinando OU NAO
//
// ISSO SO E DEFENSAVEL POR CAUSA DO PASSO 2 E DO PASSO 3. Ela chega aqui com
// uma leitura inteira ja recebida de graca: tres cartas raspadas com voz mais
// 6,7 minutos de leitura profunda. A regra que os concorrentes escreveram com
// sangue — surpreender ANTES de pedir o cartao — foi cumprida antes desta tela
// existir na sessao. Se um dia alguem mover o paywall para antes de qualquer um
// desses dois passos, esta tela vira o paywall de abertura que o dossie mede
// derrubando app, e nenhuma linha de copy daqui salva isso.
//
// O QUE NAO MUDA: fechar entra no app do MESMO JEITO. Ela ja fez a leitura, ja
// e usuaria, e prender a saida aqui e o que gerou as 544 reclamacoes de
// assinatura que o dossie mediu no Blossom. Ver a regra 1 mais abaixo, e o
// caminho `reemplazar` em `cerrar`.
//
// ===========================================================================
// A QUEBRA DE TEMA E O PRODUTO, NAO UM ACIDENTE
// ===========================================================================
// As quatro telas anteriores sao colores.noche. Esta nasce em colores.papel com
// tinta colores.noche. Copiado do molde do Heat Game: dois minutos de preto e o
// paywall entra claro — o choque visual sozinho ja para o dedo, antes de
// qualquer palavra ser lida. Aqui a quebra ainda tem sentido de marca: e o
// VERSO DA CARTA que virou. O papel velho estava do outro lado o tempo todo.
//
// Consequencia pratica que custou uma passada inteira de revisao:
//   · Os wrappers de components/Texto.js nascem com color papel (ou ceniza).
//     Sobre papel eles ficam INVISIVEIS. Toda linha desta tela carrega uma cor
//     explicita no `style` — nao ha um unico texto aqui sem cor declarada.
//   · BotonPrimario pinta o rotulo SEMPRE em colores.papel (as duas variantes,
//     os dois estados). Logo:
//       - variante="fantasma" e PROIBIDA nesta tela: fundo transparente +
//         rotulo papel sobre fundo papel = botao em branco. As acoes
//         secundarias (restaurar, volver, cerrar) sao Pressable proprio.
//       - o botao solido so serve ACESO (fundo hilo, rotulo papel = 5,0:1).
//         Apagado ele fica bordeSuave + papel a 55% sobre papel: ilegivel. Por
//         isso `habilitado` e sempre true aqui — sempre ha um plano escolhido.
//
// CONTRASTE MEDIDO SOBRE colores.papel (o tema so mediu contra noche):
//   noche  sobre papel = 16,2:1  -> texto principal
//   foil   sobre papel = 10,2:1  -> texto secundario (o lugar de ceniza no dark)
//   nudo   sobre papel =  9,0:1  -> acento, links, a linha de saida
//   ceniza sobre papel =  3,1:1  -> REPROVA AA. Nao aparece como texto nesta tela.
// `foil` e o tom da lamina da raspadinha usada como TINTA — o tema so proibe
// texto POR CIMA de foil, e aqui ele nunca e fundo. Serve duplo: e o cinza que
// passa AAA no claro e e a mesma liga metalica do veu que a usuaria acabou de
// raspar tres vezes.
//
// ===========================================================================
// O QUE ESTA TELA SE PROIBE
// ===========================================================================
// 1. PRENDER A SAIDA. O X aparece no PRIMEIRO FRAME, sem contador regressivo,
//    sem "espera 5s", sem aparecer menor do que o botao de compra, e e o
//    PRIMEIRO elemento na ordem de foco do leitor de tela. Foi exatamente o
//    paywall que prende a saida que gerou as 544 reclamacoes de assinatura que
//    o dossie mediu no Blossom. Nao ha decisao de negocio aqui que valha isso.
// 2. SIMULAR PAGAMENTO. lib/suscripcion.comprar() devolve sempre
//    {ok:false, motivo:'sin-backend'}. A tela mostra t('comunes.pronto') num
//    aviso NEUTRO e segue. Nada de "procesando", nada de tela de cartao, nada
//    de sucesso falso. Ver o cabecalho de lib/suscripcion.js.
// 3. DOWNSELL NA SAIDA. Sem "espera, 50% off", sem segunda oferta, sem modal
//    de confirmacao. Quem toca no X sai. t('paywall.salida') fecha a tela
//    sem segunda tentativa: diz que o que ela ja abriu continua dela, e so.
//
//    O QUE ESSA LINHA NAO DIZ MAIS, de proposito: que a leitura de hoje e
//    gratis. O app continua abrindo o dia sem cobrar — o comportamento nao
//    mudou —, mas anunciar isso DENTRO do paywall era entregar a razao de nao
//    pagar na mesma tela em que se pede o pagamento. Decisao do dono, 01/09.
// 4. PRESENTE PARA TERCEIROS. Exigiria grant server-side, que nao existe.
//
// ===========================================================================
// A CONTA A VISTA (a diferenca dura em relacao ao molde)
// ===========================================================================
// A ancoragem do anual contra o mensal continua existindo — ela funciona. O que
// muda e que a conta fica NA TELA em vez de escondida: 12 x mensal, o total
// riscado, e o desconto ARREDONDADO PARA BAIXO (Math.floor). Arredondar para
// cima e a mentira classica do setor: 33,2% virando "35% OFF". Aqui 33,2 vira
// 33 e nunca o contrario.
//
// PENDENTE ANTES DE PUBLICAR — os numeros de PRECIOS sao provisorios. Nao ha
// fonte de preco em nenhum lugar do projeto (nem textos.js, nem suscripcion.js,
// que nao tem catalogo) e um marcador sem valor imprime "{precio}" na tela.
// Quando o RevenueCat entrar, estes tres numeros saem daqui e passam a vir do
// `product.priceString` da loja, ja na moeda de quem olha — e por isso
// t('paywall.plan.nota') ("El precio lo pone la tienda, en tu moneda") fica
// visivel desde hoje: ela ja e verdadeira e continua verdadeira depois.
//
// FALTA DELIBERADA — a faixa de seguranca NAO diz "te avisamos un dia antes del
// cobro". O v1 nao tem backend, nao sabe data de renovacao e nao envia
// notificacao nenhuma (t('privacidad.recordatorio') afirma isso em outra tela;
// as duas nao podem discordar). No lugar da promessa que o app nao pode
// cumprir, a faixa usa as duas verdades que ja existem e ja foram revisadas:
// t('privacidad.pago.cuerpo') — hoje nao se cobra nada e o cartao nunca passa
// por aqui — e t('paywall.comoCancelar'), em corpo de 16px e nao em letra
// miuda. Quando a cobranca abrir, o aviso previo entra como chave nova em
// datos/textos.js, escrito com o que a loja realmente faz.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import BotonPrimario from '../components/BotonPrimario';
import { Cuerpo, Micro, Rotulo, Sobreceja, Titulo, NombreCarta } from '../components/Texto';
import { t } from '../datos/textos';
import { proximaLuaNova } from '../lib/proximaLua';
import { ACCESO_LIBRE, MOTIVO_SIN_BACKEND, comprar, restaurar } from '../lib/suscripcion';
import { NOMBRE_ABAS } from '../navegacion';
import { RUTAS } from '../routes';
import { colores, espacio, familias, radio, sombra } from '../theme';

/* =================================================================================
 * PRECIOS — provisorio, ver o bloco PENDENTE no cabecalho.
 * `meses` e 12 e nao esta escrito a mao no JSX: a conta mostrada na tela e a MESMA
 * expressao que calcula o desconto. Se um dia alguem mudar o periodo, o texto da
 * multiplicacao muda junto — nao ha como o rotulo mentir sobre o calculo.
 * ================================================================================= */
const PRECIOS = Object.freeze({
  moneda: 'US$',
  mensual: 4.99,
  anual: 39.99,
  meses: 12,
});

/** 4.99 -> 'US$ 4,99'. Coma decimal: LatAm. Sem Intl — nenhuma biblioteca nova. */
function formatearPrecio(valor) {
  return `${PRECIOS.moneda} ${Number(valor).toFixed(2).replace('.', ',')}`;
}

/** Alvo de toque confortavel do X. 44 e o minimo das duas plataformas. */
const LADO_ASPA = 44;
/** Comprimento de cada risco do X e do fio que separa o cabecalho. */
const LARGO_RISCO = 20;
/** GROSOR_HILO de components/HiloFondo: o fio tem 2px em todo o app. */
const GROSOR_HILO = 2;

export default function PaywallScreen({ navigation, route }) {
  const [plan, setPlan] = useState('anual'); // o ancorado nasce escolhido
  const [comprando, setComprando] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const [aviso, setAviso] = useState(null);

  // As duas chamadas sao async e a tela pode sair de cena no meio (o X esta
  // sempre disponivel, inclusive enquanto o botao gira). Sem esta guarda o
  // setState cairia num componente desmontado.
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  /* --- A CONTA -----------------------------------------------------------------
   * Uma so memo para tudo o que a tela mostra de numero, para que o valor riscado,
   * o percentual e o equivalente mensal nao possam divergir entre si. */
  const cuenta = useMemo(() => {
    const { mensual, anual, meses } = PRECIOS;
    const totalSuelto = mensual * meses; // 12 meses pagos um a um
    const hayAhorro = totalSuelto > 0 && anual < totalSuelto;
    return {
      mensual: formatearPrecio(mensual),
      anual: formatearPrecio(anual),
      meses,
      totalSuelto: formatearPrecio(totalSuelto),
      porMes: formatearPrecio(anual / meses),
      // Para BAIXO, sempre. 33,2% vira 33 e nunca 35.
      ahorro: hayAhorro ? Math.floor((1 - anual / totalSuelto) * 100) : 0,
      // Se um dia o anual deixar de compensar, a linha da conta some em vez de
      // mostrar um "desconto" negativo.
      hayAhorro: hayAhorro && Math.floor((1 - anual / totalSuelto) * 100) > 0,
    };
  }, []);

  /* --- SAIDA -------------------------------------------------------------------
   * Sem confirmacao, sem downsell, sem segunda oferta. `destino` permite que quem
   * abriu o paywall diga para onde devolver; sem ele volta na pilha, e se nao ha
   * pilha (paywall aberto como primeira tela) cai em Mi Hilo, que e a casa.
   *
   * O parametro se chama `destino` e nao "volverA": o lint de copy varre estes
   * arquivos com /\bvolver[aá]\b/i para caçar promessa de desfecho, e um
   * identificador com esse nome derruba o build. E o gate funcionando — o nome do
   * parametro cede, a regra nao.
   *
   * `reemplazar` existe por causa do caminho novo: o fim da leitura profunda
   * SUBSTITUI o carrossel por esta tela (nao ha para onde voltar no funil), e sair
   * daqui com `navigate` deixaria o paywall vivo embaixo das abas — o botao
   * "voltar" do Android traria a oferta de volta na cara de quem acabou de
   * fecha-la. Isso e prender a saida por outro caminho, e e exatamente o que a
   * regra 1 do cabecalho proibe. Com `replace`, quem fecha sai e nao volta.
   * Quem abre o paywall por cima do app (Perfil, Sintesis) nao passa o parametro,
   * e o comportamento antigo continua sendo o padrao. */
  const cerrar = useCallback(() => {
    const destino = route?.params?.destino;
    const reemplazar = route?.params?.reemplazar === true;
    if (destino && reemplazar && typeof navigation?.replace === 'function') {
      navigation.replace(destino);
      return;
    }
    if (destino && typeof navigation?.navigate === 'function') {
      navigation.navigate(destino);
      return;
    }
    if (typeof navigation?.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    /* O fallback antigo apontava para RUTAS.HILO — que desde 01/09 e aba SEM
     * presenca no Stack: o navigate nao resolvia e o botao morria no lugar
     * (pego ao vivo pelo dono). O destino que sempre existe e a rota-host das
     * abas, que abre no tabuleiro. */
    if (typeof navigation?.replace === 'function') {
      navigation.replace(NOMBRE_ABAS);
      return;
    }
    if (typeof navigation?.navigate === 'function') navigation.navigate(NOMBRE_ABAS);
  }, [navigation, route]);

  /* --- COMPRAR -----------------------------------------------------------------
   * comprar() e async hoje so para ja ter a forma que o RevenueCat vai ter. O
   * `cargando` do botao cobre essa janela e, de quebra, mata o toque duplo. */
  const alComprar = useCallback(async () => {
    if (comprando) return;
    /* ACESSO LIVRE (decisao do dono, 01/09): enquanto a loja nao existe, o
     * botao "Abrir as treze luas" ABRE de verdade — entra no app. Chamar
     * comprar() aqui respondia "em breve" e trancava a pessoa no fim do funil
     * com um botao que nao levava a lugar nenhum. Quando a cobranca ligar
     * (ACCESO_LIBRE=false), este atalho morre sozinho e o fluxo de compra
     * volta a ser o caminho. */
    if (ACCESO_LIBRE) {
      cerrar();
      return;
    }
    setAviso(null);
    setComprando(true);
    const resultado = await comprar(plan);
    if (!montado.current) return;
    setComprando(false);

    // Nao acontece no v1 (comprar() devolve ok:false sempre). Fica escrito para
    // que o dia do webhook seja so trocar o corpo de lib/suscripcion.js, sem
    // ninguem precisar lembrar de voltar aqui. Nao simula nada: so reage.
    if (resultado?.ok === true) {
      cerrar();
      return;
    }

    // 'Pronto'. Aviso neutro, nao erro: nada quebrou, so ainda nao abriu.
    setAviso(
      resultado?.motivo === MOTIVO_SIN_BACKEND ? t('comunes.pronto') : t('errores.generico')
    );
  }, [cerrar, comprando, plan]);

  /* --- RESTAURAR ---------------------------------------------------------------
   * Restaurar nao e "pronto": e "nao ha nada para restaurar". Sao duas verdades
   * diferentes e a copy de cada uma ja existe. As chaves vivem no bloco perfil.*
   * porque PerfilScreen tem o mesmo botao — o resultado de restaurar e o mesmo
   * fato nas duas telas, e duplicar a frase e o jeito classico de uma envelhecer. */
  const alRestaurar = useCallback(async () => {
    if (restaurando) return;
    setAviso(null);
    setRestaurando(true);
    const resultado = await restaurar();
    if (!montado.current) return;
    setRestaurando(false);

    if (resultado?.ok === true) {
      setAviso(t('perfil.restaurar.ok'));
      return;
    }
    setAviso(
      resultado?.motivo === MOTIVO_SIN_BACKEND
        ? t('perfil.restaurar.sinTienda')
        : t('errores.generico')
    );
  }, [restaurando]);

  /* TRES beneficios, nao quatro — 'sinLimite' ("tiragens sem limite") morreu
   * em 01/09 junto com a tiragem: nao se vende o que o app nao tem. */
  const beneficios = [
    t('paywall.beneficio.lunas'),
    t('paywall.beneficio.espelho'),
    t('paywall.beneficio.gestos'),
  ];

  /* --- A LUA -------------------------------------------------------------------
   * A urgencia desta tela, e a unica que ela aceita: uma efemeride com dia e
   * hora, calculada agora em lib/proximaLua.js (que le lib/ano.js, que le
   * lib/ceu.js). Nao ha contador regressivo, nao ha "so hoje", nao ha vaga
   * acabando — ver a tabela "o que NAO entra" em docs/PERSUASAO.md.
   *
   * `null` quando a efemeride nao pode ser medida, e ai o bloco inteiro NAO
   * RENDERIZA. Nunca uma data aproximada: a lua e conferivel em qualquer
   * calendario, e errar por um dia derruba junto tudo o que este app diz sobre
   * medir em vez de inventar. A mesma disciplina de `plano.ceu` em
   * screens/PlanoScreen.js.
   *
   * Medida UMA vez por montagem. Recalcular a cada render trocaria a frase
   * debaixo do olho de quem esta lendo, no unico instante do mes em que ela
   * muda. */
  const lua = useMemo(() => proximaLuaNova(), []);

  return (
    <View style={estilos.raiz}>
      {/* A unica tela clara do app: a barra de status inverte enquanto ela esta
          montada e volta sozinha ao sair. */}
      <StatusBar barStyle="dark-content" backgroundColor={colores.papel} />

      <SafeAreaView style={estilos.segura}>
        {/* CABECALHO FIXO — fora do ScrollView de proposito: o X nao pode sumir
            com o rolar, e sendo o primeiro filho ele tambem e o primeiro parada
            do leitor de tela. Primeiro frame, primeiro foco, sem contador. */}
        <View style={estilos.cabecera}>
          <Pressable
            onPress={cerrar}
            hitSlop={espacio.sm}
            accessibilityRole="button"
            accessibilityLabel={t('comunes.cerrar')}
            style={({ pressed }) => [estilos.aspa, pressed && estilos.aspaPresionada]}
          >
            <View style={estilos.aspaRisco} />
            <View style={[estilos.aspaRisco, estilos.aspaRiscoInverso]} />
          </Pressable>
        </View>
        <View style={estilos.fio} />

        <ScrollView
          contentContainerStyle={estilos.contenido}
          keyboardShouldPersistTaps="handled"
        >
          <Titulo style={estilos.titulo}>{t('paywall.titulo')}</Titulo>

          {/* --- A LUA, ANTES DA LISTA ------------------------------------------
              Primeiro o fato medido, depois a oferta. Invertido, a data viraria
              enfeite de um bloco de venda; aqui ela e o argumento, e ela nao e
              nossa: e do ceu. Sem medida o bloco some inteiro — nao ha versao
              aproximada desta caixa. */}
          {lua ? (
            <View style={estilos.lua}>
              <Sobreceja style={estilos.luaSobreceja}>{t('lua.sobreceja')}</Sobreceja>
              <NombreCarta style={estilos.luaQuando}>{lua.quando}</NombreCarta>
              <Cuerpo style={estilos.luaNota}>{lua.nota}</Cuerpo>
            </View>
          ) : null}

          <Cuerpo style={estilos.sub}>{t('paywall.sub')}</Cuerpo>

          {/* --- OS QUATRO ENTREGAVEIS ------------------------------------------
              Cada um e uma coisa que o app passa a FAZER. Nenhum e um resultado
              na vida amorosa dela: isso nao esta a venda aqui. O marcador e um
              pedaco de fio (hilo como traco — permitido; como texto, nunca). */}
          <View style={estilos.beneficios}>
            {beneficios.map((linea) => (
              <View key={linea} style={estilos.beneficio}>
                <View style={estilos.marca} />
                <Cuerpo style={estilos.beneficioTexto}>{linea}</Cuerpo>
              </View>
            ))}
          </View>

          {/* --- PLANOS, COM A CONTA A VISTA ------------------------------------ */}
          {ACCESO_LIBRE ? null : (
          <View style={estilos.planes} accessibilityRole="radiogroup">
            {/* ANUAL — o ancorado. Nasce escolhido e carrega a conta inteira. */}
            <Pressable
              onPress={() => setPlan('anual')}
              accessibilityRole="radio"
              accessibilityState={{ checked: plan === 'anual' }}
              accessibilityLabel={[
                t('paywall.plan.anual.nombre'),
                t('paywall.plan.anual.precio', { precio: cuenta.anual }),
                t('paywall.plan.anual.equivalente', { precioMes: cuenta.porMes }),
              ].join('. ')}
              style={[estilos.plan, plan === 'anual' && estilos.planElegido]}
            >
              <View style={estilos.planCabecera}>
                <Rotulo style={estilos.planNombre}>{t('paywall.plan.anual.nombre')}</Rotulo>
                {cuenta.hayAhorro ? (
                  <View style={estilos.insignia}>
                    {/* Simbolo e numero: nao ha palavra inventada aqui. O sentido
                        vem do total riscado que esta uma linha abaixo. */}
                    <Rotulo style={estilos.insigniaTexto} tabular>
                      {`−${cuenta.ahorro}%`}
                    </Rotulo>
                  </View>
                ) : null}
              </View>

              <Cuerpo style={estilos.planPrecio} tabular>
                {t('paywall.plan.anual.precio', { precio: cuenta.anual })}
              </Cuerpo>

              {/* A CONTA. Aritmetica na cara: 12 x o mensal da o total solto, e o
                  total solto esta riscado porque nao e o que ela vai pagar. */}
              {cuenta.hayAhorro ? (
                <Micro style={estilos.planCuenta} tabular>
                  {`${cuenta.meses} × ${cuenta.mensual} = `}
                  <Micro style={estilos.planCuentaTachada} tabular>
                    {cuenta.totalSuelto}
                  </Micro>
                </Micro>
              ) : null}

              <Micro style={estilos.planEquivalente} tabular>
                {t('paywall.plan.anual.equivalente', { precioMes: cuenta.porMes })}
              </Micro>
            </Pressable>

            {/* MENSUAL — a referencia. Sem ele a ancoragem seria so um numero. */}
            <Pressable
              onPress={() => setPlan('mensual')}
              accessibilityRole="radio"
              accessibilityState={{ checked: plan === 'mensual' }}
              accessibilityLabel={[
                t('paywall.plan.mensual.nombre'),
                t('paywall.plan.mensual.precio', { precio: cuenta.mensual }),
              ].join('. ')}
              style={[estilos.plan, plan === 'mensual' && estilos.planElegido]}
            >
              <View style={estilos.planCabecera}>
                <Rotulo style={estilos.planNombre}>{t('paywall.plan.mensual.nombre')}</Rotulo>
              </View>
              <Cuerpo style={estilos.planPrecio} tabular>
                {t('paywall.plan.mensual.precio', { precio: cuenta.mensual })}
              </Cuerpo>
            </Pressable>
          </View>
          )}

          {ACCESO_LIBRE ? (
            <Micro style={estilos.planNota}>{t('paywall.livre.nota')}</Micro>
          ) : (
            <Micro style={estilos.planNota}>{t('paywall.plan.nota')}</Micro>
          )}

          {/* --- A ACAO ---------------------------------------------------------
              Sempre ACESO: ha sempre um plano escolhido, e apagado o rotulo papel
              sumiria no fundo papel. `cargando` cobre o await e mata o toque duplo. */}
          <BotonPrimario
            titulo={t('paywall.boton')}
            onPress={alComprar}
            cargando={comprando}
            style={estilos.boton}
          />

          {/* Aviso NEUTRO. Nao e erro vermelho: nada quebrou, so ainda nao abriu. */}
          {aviso ? (
            <View style={estilos.aviso} accessibilityLiveRegion="polite" accessibilityRole="alert">
              <Cuerpo style={estilos.avisoTexto}>{aviso}</Cuerpo>
            </View>
          ) : null}

          <Pressable
            onPress={alRestaurar}
            disabled={restaurando}
            hitSlop={espacio.sm}
            accessibilityRole="button"
            accessibilityLabel={t('paywall.restaurar')}
            accessibilityState={{ disabled: restaurando, busy: restaurando }}
            style={({ pressed }) => [estilos.enlace, pressed && estilos.enlacePresionado]}
          >
            <Rotulo style={estilos.enlaceTexto}>{t('paywall.restaurar')}</Rotulo>
          </Pressable>

          {/* --- FAIXA DE SEGURANCA ---------------------------------------------
              Corpo de 16px dentro de uma caixa com borda, e nao letra miuda no
              rodape: e a parte que decide se ela toca no botao. Ver a nota
              "FALTA DELIBERADA" no cabecalho sobre o aviso previo de cobranca. */}
          <View style={estilos.seguridad}>
            <Sobreceja style={estilos.seguridadSobreceja}>
              {t('perfil.suscripcion.sobreceja')}
            </Sobreceja>
            <Cuerpo style={estilos.seguridadTexto}>{t('privacidad.pago.cuerpo')}</Cuerpo>
            <Cuerpo style={[estilos.seguridadTexto, estilos.seguridadCancelar]}>
              {t('paywall.comoCancelar')}
            </Cuerpo>
          </View>

          {/* --- A SAIDA ---------------------------------------------------------
              Sem downsell. A frase mais importante da tela depois do titulo, e a
              unica em italico de display: e a voz da carta, nao a do vendedor. */}
          <View style={estilos.salida}>
            <View style={estilos.fioCorto} />
            <NombreCarta style={estilos.salidaTexto}>{t('paywall.salida')}</NombreCarta>
            <Pressable
              onPress={cerrar}
              hitSlop={espacio.sm}
              accessibilityRole="button"
              accessibilityLabel={t('comunes.volver')}
              style={({ pressed }) => [estilos.enlace, pressed && estilos.enlacePresionado]}
            >
              <Rotulo style={estilos.enlaceTexto}>{t('comunes.volver')}</Rotulo>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* =================================================================================
 * ESTILOS
 * Nenhum hex: tudo sai de theme.js. Nenhuma cor de texto e herdada — sobre papel,
 * herdar significaria papel sobre papel.
 * ================================================================================= */
const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: colores.papel,
  },
  segura: {
    flex: 1,
    backgroundColor: colores.papel,
  },

  /* --- cabecalho e o X ---------------------------------------------------------- */
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: espacio.md,
    paddingTop: espacio.sm,
    paddingBottom: espacio.xs,
  },
  aspa: {
    width: LADO_ASPA,
    height: LADO_ASPA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aspaPresionada: {
    opacity: 0.5,
  },
  // Dois riscos cruzados: sem biblioteca de icone, sem fonte de simbolo (que num
  // aparelho sem a glifo cairia num quadrado vazio bem no botao de sair).
  aspaRisco: {
    position: 'absolute',
    width: LARGO_RISCO,
    height: GROSOR_HILO,
    borderRadius: GROSOR_HILO,
    backgroundColor: colores.noche,
    transform: [{ rotate: '45deg' }],
  },
  aspaRiscoInverso: {
    transform: [{ rotate: '-45deg' }],
  },
  // O fio de sempre, agora sobre papel: a marca atravessa a quebra de tema.
  fio: {
    height: GROSOR_HILO,
    backgroundColor: colores.hilo,
  },

  contenido: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.xl,
    paddingBottom: espacio.xxxl,
  },

  titulo: {
    color: colores.noche,
  },
  sub: {
    color: colores.foil,
    marginTop: espacio.md,
  },

  /* --- a lua ---------------------------------------------------------------------
   * Caixa com borda e nao texto solto: e um FATO MEDIDO, e ele tem de se ler como
   * uma medida entre duas linhas de tela, nao como mais uma frase de venda. */
  lua: {
    marginTop: espacio.xl,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    borderRadius: radio.md,
    padding: espacio.lg,
  },
  luaSobreceja: {
    color: colores.foil,
  },
  // A data no italico de display: e a voz da carta dizendo a hora, e e o unico
  // lugar da tela em que um numero merece esse corpo. nudo sobre papel = 9,0:1.
  luaQuando: {
    color: colores.nudo,
    marginTop: espacio.sm,
  },
  luaNota: {
    color: colores.noche,
    marginTop: espacio.md,
  },

  /* --- beneficios --------------------------------------------------------------- */
  beneficios: {
    marginTop: espacio.xl,
  },
  beneficio: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: espacio.lg,
  },
  // Pedaco de fio. hilo como traco, nunca como texto.
  marca: {
    width: espacio.md,
    height: GROSOR_HILO,
    borderRadius: GROSOR_HILO,
    backgroundColor: colores.hilo,
    // Alinha o traco com a primeira linha do texto (cuerpo: 16/25).
    marginTop: espacio.md,
    marginRight: espacio.md,
  },
  beneficioTexto: {
    flex: 1,
    color: colores.noche,
  },

  /* --- planos -------------------------------------------------------------------- */
  planes: {
    marginTop: espacio.sm,
  },
  plan: {
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    borderRadius: radio.md,
    padding: espacio.lg,
    marginBottom: espacio.md,
    backgroundColor: colores.transparente,
  },
  planElegido: {
    borderWidth: 2,
    borderColor: colores.nudo,
    ...sombra.carta,
  },
  planCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planNombre: {
    color: colores.foil,
  },
  insignia: {
    backgroundColor: colores.nudo,
    borderRadius: radio.sm,
    paddingHorizontal: espacio.sm,
    paddingVertical: espacio.xs,
  },
  // papel sobre nudo = 9,0:1. O unico texto claro da tela, e por isso ele tem
  // fundo proprio.
  insigniaTexto: {
    color: colores.papel,
  },
  planPrecio: {
    color: colores.noche,
    fontFamily: familias.cuerpoSemi,
    marginTop: espacio.sm,
  },
  planCuenta: {
    color: colores.foil,
    marginTop: espacio.xs,
  },
  planCuentaTachada: {
    color: colores.foil,
    textDecorationLine: 'line-through',
  },
  planEquivalente: {
    color: colores.nudo,
    marginTop: espacio.xs,
  },
  planNota: {
    color: colores.foil,
    marginTop: espacio.xs,
  },

  /* --- acao e avisos ------------------------------------------------------------- */
  boton: {
    marginTop: espacio.xl,
  },
  aviso: {
    marginTop: espacio.md,
    borderRadius: radio.sm,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    paddingHorizontal: espacio.lg,
    paddingVertical: espacio.md,
  },
  avisoTexto: {
    color: colores.noche,
  },
  enlace: {
    alignSelf: 'center',
    paddingVertical: espacio.md,
    paddingHorizontal: espacio.lg,
    marginTop: espacio.sm,
  },
  enlacePresionado: {
    opacity: 0.5,
  },
  enlaceTexto: {
    color: colores.nudo,
    textDecorationLine: 'underline',
  },

  /* --- faixa de seguranca --------------------------------------------------------- */
  seguridad: {
    marginTop: espacio.xl,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    borderRadius: radio.md,
    padding: espacio.lg,
  },
  seguridadSobreceja: {
    color: colores.foil,
  },
  seguridadTexto: {
    color: colores.noche,
    marginTop: espacio.md,
  },
  seguridadCancelar: {
    color: colores.foil,
  },

  /* --- saida ----------------------------------------------------------------------- */
  salida: {
    marginTop: espacio.xxl,
    alignItems: 'center',
  },
  fioCorto: {
    width: LADO_ASPA,
    height: GROSOR_HILO,
    borderRadius: GROSOR_HILO,
    backgroundColor: colores.hilo,
    marginBottom: espacio.lg,
  },
  salidaTexto: {
    color: colores.nudo,
    textAlign: 'center',
  },
});
