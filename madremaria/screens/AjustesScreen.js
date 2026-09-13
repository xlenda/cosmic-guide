// screens/AjustesScreen.js
// Ajustes — curto, e so o que faz alguma coisa HOJE.
// Interface publica em espanhol, comentarios em portugues (mesma convencao de
// theme.js, lib/almacen.js e datos/preguntas.js).
//
// ===========================================================================
// A REGRA DESTA TELA: NENHUM CONTROLE DECORATIVO
// ===========================================================================
// Todo switch aqui muda um comportamento observavel no minuto seguinte. Nao ha
// seletor de idioma (o v1 fala espanhol e so espanhol — um seletor com um item
// so e mentira educada), nao ha "tema claro" (o app tem um tema unico e
// congelado em theme.js), nao ha "sincronizar" (nao existe conta nem servidor)
// e nao ha "notificaciones de novedades" (nao existe novidade para mandar).
//
// Quando um controle NAO pode funcionar no aparelho em que a tela esta rodando,
// ele nao aparece apagado: ele nao aparece. As duas excecoes explicitas:
//   · vibracao — a linha inteira some na web, onde expo-haptics e um no-op;
//   · recordatorio — sem canal de avisos instalado, o cartao mostra a previa do
//     aviso (o desenho e a promessa continuam de pe) e uma linha honesta no
//     lugar do botao. O que nao existe e um botao que finge agendar.
//
// ===========================================================================
// O PEDIDO DE PERMISSAO NUNCA VEM CRU
// ===========================================================================
// A caixa de dialogo do sistema so pode ser pedida UMA vez por instalacao: se a
// pessoa diz "no" ali, o app perde o canal para sempre e so os ajustes do
// telefone reabrem. Por isso a ordem aqui e inegociavel:
//   1. a previa do aviso desenhada na tela — o texto exato que vai chegar;
//   2. a linha que diz que o telefone vai perguntar e que dizer "no" nao quebra
//      nada;
//   3. so entao, e so no toque do botao, o pedido do sistema.
// Nenhum efeito desta tela dispara `pedirPermiso` sozinho na montagem.
//
// ===========================================================================
// CANAL DE AVISOS — por que ele e injetado e nao importado
// ===========================================================================
// expo-notifications NAO esta no package.json deste projeto. Um require dele
// aqui — mesmo dentro de try/catch — nao degrada: o Metro resolve dependencia
// de forma estatica e o bundle inteiro quebra na hora de subir o app. Entao a
// tela fala com um ADAPTADOR, resolvido em runtime nesta ordem:
//   1. a prop `avisos` (o caminho dos testes e do App.js);
//   2. globalThis.HiloRojoAvisos (registrado no boot, quando a dependencia
//      existir);
//   3. nenhum — e o cartao entra no estado "sin canal".
//
// O contrato do adaptador, para quem for implementa-lo:
//   permiso()      -> 'concedido' | 'negado' | 'sin-preguntar'   (NAO pergunta)
//   pedirPermiso() -> 'concedido' | 'negado'                     (abre o dialogo)
//   programar({ hora, minuto, titulo, cuerpo }) -> boolean
//   cancelar()     -> boolean
// Todas assincronas, nenhuma lanca. A implementacao com expo-notifications,
// para colar no App.js no dia em que a dependencia entrar:
//
//   import * as N from 'expo-notifications';
//   globalThis.HiloRojoAvisos = {
//     async permiso() {
//       const p = await N.getPermissionsAsync();
//       if (p.status === 'granted') return 'concedido';
//       return p.canAskAgain === false ? 'negado' : 'sin-preguntar';
//     },
//     async pedirPermiso() {
//       const p = await N.requestPermissionsAsync();
//       return p.status === 'granted' ? 'concedido' : 'negado';
//     },
//     async programar({ hora, minuto, titulo, cuerpo }) {
//       await N.cancelAllScheduledNotificationsAsync();
//       await N.scheduleNotificationAsync({
//         content: { title: titulo, body: cuerpo },
//         trigger: {
//           type: N.SchedulableTriggerInputTypes?.DAILY ?? 'daily',
//           hour, minute: minuto, repeats: true,
//         },
//       });
//       return true;
//     },
//     async cancelar() {
//       await N.cancelAllScheduledNotificationsAsync();
//       return true;
//     },
//   };
//
// ===========================================================================
// DISCO
// ===========================================================================
// Duas chaves NUAS (o prefixo 'hr.' e assunto do lib/almacen.js e ninguem o
// escreve a mao):
//   'recordatorio' -> { activo, hora, minuto }
//   'ajustes'      -> { movimiento, haptica }
// Tudo que volta do disco passa por um normalizador: storage e entrada externa
// e pode ter sido editado, truncado ou sobrado de uma versao anterior. Nada
// aqui lanca — ilegivel vira o padrao.
//
// CONTRATO DE COPY respeitado nesta tela: nenhuma promessa de desfecho, nenhum
// genero atribuido a quem esta do outro lado, nenhuma punicao por racha parada,
// nenhum hex fora de theme.js e colores.hilo so como fundo, traco e trilho —
// nunca como cor de texto.
// ===========================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import BotonPrimario from '../components/BotonPrimario';
import ColunaLeitura from '../../components/ColunaLeitura';
import FaixaCurva from '../../components/FaixaCurva';
import { space } from '../../theme';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, Rotulo, Sobreceja, Titulo } from '../components/Texto';
// (sairDoCirculo saiu: o Circulo nao veio para o Cosmic Guide — dono, 11/09/2026.)
import { t } from '../datos/textos';
import useReducedMotion from '../../hooks/useReducedMotion';
import {
  AJUSTES_POR_DEFECTO,
  CLAVE_AJUSTES,
  leerAjustes,
} from '../lib/ajustes';
import { borrarSeguro, guardarSeguro, leerSeguro } from '../lib/almacen';
import { RUTAS } from '../routes';
import { colores, espacio, radio, sombra, tipo } from '../theme';

/* =================================================================================
 * DISCO — chaves e formatos
 * ================================================================================= */

export const CLAVE_RECORDATORIO = 'recordatorio';

/* 'ajustes' mudou de casa para lib/ajustes.js no dia em que a leitura profunda
 * passou a precisar do campo `haptica` — um componente nao pode importar uma
 * TELA inteira por um booleano. A reexportacao fica: quem ja importava
 * CLAVE_AJUSTES, AJUSTES_POR_DEFECTO ou leerAjustes daqui continua importando
 * daqui, com a mesma assinatura. */
export { AJUSTES_POR_DEFECTO, CLAVE_AJUSTES, leerAjustes };

/**
 * TODAS as chaves que o Fio Vermelho grava neste telefone. E a lista que
 * "Borrar todo" percorre, e ela e a razao de o botao apagar de verdade em vez
 * de marcar uma flag.
 *
 * QUEM CRIAR UMA CHAVE NOVA NO APP ACRESCENTA AQUI. Uma chave fora desta lista
 * sobrevive ao "Borrar todo", e a tela estaria mentindo ao dizer que nao ficou
 * nada. As cinco primeiras sao das libs que ja existem (perfil do onboarding,
 * lib/hilo.js, lib/limiteDiario.js, lib/suscripcion.js, lib/album.js); as duas
 * ultimas sao desta tela.
 *
 * 'album' guarda a colecao das 78 cartas: quais apareceram em tiradas reais,
 * quantas vezes e em que orientacao. E historico de uso do aparelho como
 * qualquer outro aqui, e apagar tudo apaga a colecao junto — dizer o contrario
 * na tela seria a mentira que esta lista existe para impedir.
 *
 * 'ritual' (lib/ritual.js) e a mais sensivel de todas: alem dos sete dias e das
 * datas, ela guarda TEXTO LIVRE que a usuaria escreveu sobre a propria vida
 * amorosa — a linha do dia 1 que o dia 7 devolve. Se esta chave ficar de fora
 * da lista, "Borrar todo" deixa esse texto no aparelho e a politica de
 * privacidade da ficha de loja vira declaracao falsa. Coberto por
 * test/madremaria-ritual.test.js.
 *
 * 'missoes' (lib/missoes.js) guarda so { dia, feitas: [id] } das tres missoes
 * sorteadas pela data de hoje — no maximo tres ids e uma data, nunca mais que
 * isso. O sorteio em si nao mora no disco (e funcao pura da data), entao apagar
 * esta chave devolve o dia de hoje com as tres missoes em aberto e nada mais se
 * perde.
 *
 * 'fichas' (lib/fichas.js) guarda o saldo e os carimbos de "isto ja pagou hoje".
 * O modulo nasce com FICHAS_ACTIVAS false, e a chave entra na lista MESMO ASSIM:
 * a lista existe para descrever o que o app grava no aparelho, nao o que ele
 * mostra na tela. Uma chave que so entra no dia em que a tela existir e a chave
 * que fica de fora — e "Borrar todo" passa a mentir sem ninguem perceber.
 *
 * 'ultimaLectura' (lib/ultimaLectura.js) e a segunda mais sensivel depois de
 * 'ritual', e ficou fora desta lista ate agora: alem das tres cartas do dia, o
 * registro guarda o campo `respuestas` — as MESMAS respostas do onboarding
 * que 'perfil' guarda, copiadas junto da leitura para ela poder ser remontada.
 * Sem esta linha, "Borrar todo" apagava 'perfil' e deixava a copia intacta: a
 * tela dizia "sin nombre, sin respuestas" (privacidad.borrar.cuerpo) e as
 * respostas continuavam no aparelho. Era exatamente a declaracao falsa numa
 * ficha de loja que esta lista existe para impedir.
 *
 * 'plano' (screens/PlanoScreen.js) guarda { dia, texto }: a resposta que ela
 * escreveu na reflexao do plano de HOJE, e so a de hoje — nao ha historico
 * porque nao ha tela que o leia. O motor do plano (lib/plano.js) e puro e nao
 * grava nada; quem grava e a tela, e por isso a chave nasce aqui junto dela, no
 * mesmo commit. E texto livre escrito pela pessoa, entao e das linhas mais
 * sensiveis da lista: sem ela, "Borrar todo" deixaria no aparelho exatamente o
 * que a usuaria escreveu de mais proprio.
 *
 * 'ano' (o arco de treze lunacoes — lib/ano.js, datos/lunacoes.js) guarda duas
 * coisas, e a segunda e a mais sensivel do app inteiro: a ancora da jornada (a
 * data em que o arco comecou, sem a qual lib/ano.js se recusa a numerar lunacao)
 * e o que ela escreve POR LUNACAO ao longo de um ano. O motor e puro e nao grava
 * nada; quem grava e a tela.
 *
 * A CHAVE ENTRA AGORA, ANTES DA TELA EXISTIR, e e a mesma regra ja escrita acima
 * para 'fichas': lista que so recebe a chave no dia em que a tela nasce e lista
 * que fica desatualizada, porque quem escreve a tela nao volta aqui. E o custo de
 * esquecer aqui e diferente do de esquecer em qualquer outra linha: um ano de
 * texto intimo sobrevivendo ao "Apagar tudo" transforma a politica de privacidade
 * da ficha de loja em declaracao falsa sobre o dado mais pesado que o app guarda.
 * Chave inexistente no disco custa uma leitura e sai de borrarClaves como
 * apagada — o preco de estar aqui cedo demais e zero.
 *
 * 'leituraEntrada' (lib/entrada.js) e o marcador de que a leitura de entrada —
 * as tres cartas com a voz gravada — ja aconteceu. E o dado mais leve da lista e
 * o unico cujo esquecimento se ve na hora: sem ele aqui, "Apagar tudo"
 * devolveria uma pessoa sem perfil e sem historico que, na proxima abertura,
 * PULARIA a leitura de entrada — o app diria que apagou tudo e continuaria
 * lembrando de uma coisa. O dono da chave e lib/entrada.js, que tambem grava a
 * ancora do ano na linha 'ano' acima.
 *
 * 'profunda' (lib/profunda.js) e o progresso do carrossel da leitura profunda:
 * ate onde ela chegou nos cinco cards, quais audios ela de fato TOCOU e se ela
 * saiu pelo convite do ultimo card ou pelo "Pular". Nao guarda nada escrito por
 * ela — o carrossel nao pede nada escrito —, mas guarda comportamento, e
 * comportamento e dado: o Perfil le isto para dizer "voce ainda nao ouviu esta".
 * Fora daqui, o "Apagar tudo" deixaria no aparelho o registro do que ela ouviu e
 * do que pulou, e a tela de privacidade passaria a mentir.
 *
 * ESCRITA COMO LITERAL, e nao importada de la, pelo mesmo motivo de todas as
 * outras: o portao de test/madremaria-gamificacao.test.js le esta lista PARSEANDO A FONTE
 * deste arquivo, e so resolve string literal ou `const CLAVE_X = '...'`
 * declarada aqui. Um identificador importado sai da lista como chave que o
 * portao nao consegue vigiar — e ele derruba o build dizendo isso. Quem amarra o
 * literal ao dono da chave e test/madremaria-entrada.test.js, que confere esta lista contra
 * o CLAVE_ENTRADA de lib/entrada.js: renomear em um lado sem o outro falha.
 *
 * 'sinastria' (lib/sinastria.js) e o signo da pessoa amada — UM entre doze,
 * dado por vontade dela numa sexta, para o ritmo dos dois. E o unico dado do
 * app que fala de outra pessoa, e por isso o primeiro que o Apagar tudo nao
 * pode esquecer: sobrar ele no disco depois de "apagar tudo" seria guardar
 * exatamente o que a tela de privacidade jura que nao se guarda de ninguem.
 *
 * 'sonho' (lib/registroDoSonho.js) e o que ela escreveu nos dias do gesto do
 * sonho, por data — texto intimo, motivo dobrado para sair no Apagar tudo.
 * 'planoRaspado' (lib/veuDoDia.js) e a lista de dias ja raspados do veu.
 * 'visao' (lib/visao.js) e a ULTIMA leitura de foto de cada tipo (borra,
 * mao) — so o texto devolvido; a foto nunca existiu em disco nenhum.
 * 'coracao' (lib/coracao.js) e o humor de um toque por dia; 'missao'
 * (lib/missaoDoDia.js) e o aceite/cumprimento com nota. Ambos por data.
 * 'corrente' (lib/corrente.js) e a deixa do ultimo dia fechado — a linha
 * dela que o proximo dia vivido cita de volta. Texto intimo: sai no Apagar.
 * (a chave 'circulo' saiu: o Circulo nao veio para o Cosmic Guide — 11/09/2026.
 *  Nada grava nela aqui, entao nao ha o que apagar.)
 */
/* POR QUE 'visao' CONTINUA NA LISTA ABAIXO, mesmo sem ninguem escrever nela
 * aqui dentro: cafe e palma sao UM SO no app (decisao do dono, 11/09/2026) e
 * lib/visao.js nao veio na copia. Apagar uma chave que nunca foi escrita e um
 * no-op barato; tirar a chave da lista deixaria o dado de quem ja rodou uma
 * build anterior fora do alcance do 'Apagar tudo' — e 'Apagar tudo' que nao
 * apaga tudo e a unica falha desta tela que a usuaria nao tem como ver.
 *
 * A NOTA MORA AQUI FORA, E NAO ENTRE AS CHAVES, de proposito: o portao de
 * test/madremaria-gamificacao.test.js le esta lista por regex e exige que toda
 * entrada seja string literal ou constante declarada. Um comentario no meio do
 * array fazia o portao desistir da lista INTEIRA — ou seja, a vigilancia do
 * "Apagar tudo" caia por causa de uma nota sobre o "Apagar tudo". */
export const CLAVES_HILO_ROJO = Object.freeze([
  'perfil',
  'hilo',
  'limite',
  'suscripcion',
  'album',
  'ritual',
  'missoes',
  'fichas',
  'ultimaLectura',
  'plano',
  'ano',
  'leituraEntrada',
  'profunda',
  CLAVE_RECORDATORIO,
  CLAVE_AJUSTES,
  'sinastria',
  'planoRaspado',
  'sonho',
  'coracao',
  'missao',
  'visao',
  'corrente',
  'variante',
  'escada',
]);

/** A chave que guarda as respostas, o nome e a data de nascimento. "Borrar mis respuestas" e ela sozinha. */
export const CLAVES_RESPUESTAS = Object.freeze(['perfil']);

export const RECORDATORIO_POR_DEFECTO = Object.freeze({ activo: false, hora: 21, minuto: 0 });

function normalizarRecordatorio(bruto) {
  if (!bruto || typeof bruto !== 'object') return { ...RECORDATORIO_POR_DEFECTO };
  const hora = Number(bruto.hora);
  return {
    activo: bruto.activo === true,
    hora: Number.isInteger(hora) && hora >= 0 && hora <= 23 ? hora : RECORDATORIO_POR_DEFECTO.hora,
    minuto: Number(bruto.minuto) === 30 ? 30 : 0,
  };
}

async function leerJson(clave, normalizar) {
  const bruto = await leerSeguro(clave);
  if (!bruto) return normalizar(null);
  try {
    return normalizar(JSON.parse(bruto));
  } catch {
    return normalizar(null);
  }
}

/** O recordatorio como esta no disco, sanitizado. Nunca lanca. */
export async function leerRecordatorio() {
  return leerJson(CLAVE_RECORDATORIO, normalizarRecordatorio);
}

/* `leerAjustes` agora mora em lib/ajustes.js e e reexportada la em cima. O
 * motivo esta escrito naquele arquivo; a assinatura nao mudou. */

/**
 * Apaga de verdade — e confere.
 *
 * borrarSeguro() devolve false tanto quando nao havia nada quanto quando o
 * disco falhou, entao o retorno dele nao serve de prova. A prova e a LEITURA
 * seguinte: chave que ainda responde alguma coisa entra em `restantes`, e a
 * tela diz que ficou algo em vez de mostrar um "listo" falso.
 *
 * @param {readonly string[]} claves chaves NUAS (sem 'hr.')
 * @returns {Promise<{ok: boolean, restantes: string[]}>}
 */
export async function borrarClaves(claves) {
  const restantes = [];
  for (const clave of claves) {
    try {
      await borrarSeguro(clave);
      const quedo = await leerSeguro(clave);
      if (quedo !== null && quedo !== undefined) restantes.push(clave);
    } catch {
      restantes.push(clave);
    }
  }
  return { ok: restantes.length === 0, restantes };
}

/* =================================================================================
 * VERSION — sai do app.json, que e a fonte unica. O require esta em try/catch
 * so por seguranca de runtime: o arquivo existe e o Metro o resolve.
 * ================================================================================= */
const VERSION = (() => {
  try {
    const app = require('../../app.json');
    const v = app && app.expo && app.expo.version;
    return typeof v === 'string' && v.length > 0 ? v : '1.0.0';
  } catch {
    return '1.0.0';
  }
})();

/* =================================================================================
 * CANAL DE AVISOS — ver o cabecalho. Resolvido a cada render (barato) para que
 * um App.js que registre o canal depois da montagem seja notado sem remontar.
 * ================================================================================= */
function resolverCanal(inyectado) {
  const candidato =
    inyectado
    || (typeof globalThis !== 'undefined' ? globalThis.HiloRojoAvisos : null);
  if (
    candidato
    && typeof candidato.pedirPermiso === 'function'
    && typeof candidato.programar === 'function'
    && typeof candidato.cancelar === 'function'
  ) {
    return candidato;
  }
  return null;
}

/* =================================================================================
 * HORA — a unica aritmetica da tela. Passo de 1 hora com volta ao inicio, mais
 * um par en punto / y media. Duas horas de toque no pior caso, sem picker e sem
 * biblioteca nova.
 * ================================================================================= */
const dosDigitos = (n) => String(n).padStart(2, '0');
const formatearHora = (hora, minuto) => `${dosDigitos(hora)}:${dosDigitos(minuto)}`;
const horaMasUna = (hora, paso) => (hora + paso + 24) % 24;

/* =================================================================================
 * HAPTICO — reforco, nunca requisito (mesma doutrina do ScratchRevealCard).
 * Gated pela preferencia desta tela: com a vibracao desligada, nenhum toque
 * daqui vibra.
 * ================================================================================= */
const HAY_VIBRACION = Platform.OS !== 'web';

function tocar(activa, exito) {
  if (!activa || !HAY_VIBRACION) return;
  try {
    const p = exito
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.selectionAsync();
    Promise.resolve(p).catch(() => {});
  } catch {
    /* vibracao nunca pode derrubar um toque */
  }
}

/* =================================================================================
 * O NO — o icone do aviso. Um fio que entra por baixo, da um no e sai por cima.
 * colores.hilo como TRACO, que e o uso permitido pela regra travada do tema.
 * ================================================================================= */
const TRAZO_NUDO = 'M 3 26 C 10 26, 12 20, 16 16 C 20 12, 12 8, 10 13 C 8 18, 17 20, 21 15 C 24 11, 25 8, 29 6';

function IconoNudo({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" pointerEvents="none">
      <Path
        d={TRAZO_NUDO}
        fill="none"
        stroke={colores.hilo}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* =================================================================================
 * PECAS DE INTERFACE
 * ================================================================================= */

/** Cartao de secao, agora com CHAO PROPRIO. Titulo em <Rotulo> (caixa alta vem
 *  do estilo) e uma sub em <Micro>.
 *
 *  DIAGRAMACAO (12/09/2026). Fotografado antes: tres cartoes iguais empilhados
 *  no mesmo fundo, separados so por 24px de margem. O cartao do meio tem quase
 *  600px de altura (a previa do aviso, o seletor de hora, o segmento e dois
 *  botoes), entao ao rolar a pessoa perde a nocao de onde um assunto acabou e o
 *  outro comecou — e isso num lugar onde ela esta mexendo em ajuste de verdade.
 *
 *  POR QUE FAIXA E CARTAO JUNTOS, se o guia diz que cartao ja se separa sozinho.
 *  O guia diz isso pra LISTA de itens irmaos (o acordeao da Ayuda, onde a faixa
 *  entrou em volta do bloco inteiro e nao de cada cartao). Aqui nao sao itens
 *  irmaos de uma lista: sao TRES SECOES diferentes da tela, cada uma com
 *  controles proprios. A faixa marca "mudou de assunto" e o cartao marca "estes
 *  controles andam juntos" — duas coisas distintas, e as duas sao verdade.
 *
 *  O `tom` vem de fora pra que a tela decida a ALTERNANCIA: duas faixas
 *  seguidas do mesmo tom voltam a ser um fundo so. */
function Tarjeta({ titulo, sub, tom, semente, children, style }) {
  return (
    <FaixaCurva tom={tom} semente={semente || titulo} grude>
      {/* SEM `style` NENHUM na faixa, e isto foi MEDIDO na foto depois de eu
          errar (12/09/2026). A primeira versao repetia aqui o padding que a
          peca ja poe sozinha, e a faixa passou a PARAR ~16px antes de cada
          borda: o fundo do app aparecia dos dois lados e o chao virava card
          gigante — o efeito que o guia proibe com todas as letras.

          A CAUSA esta em components/FaixaCurva.js: o `style` da peca vai pra
          View de FORA, que embrulha o SVG da onda MAIS o corpo. Padding
          horizontal ali inseta o desenho inteiro (a onda encolhe junto) em vez
          de recuar so o texto. E o corpo dela JA traz `secao` em cima e embaixo
          e `tela` nos lados — repetir tambem dobrava o respiro vertical.

          As telas de documento (Privacidad/Ayuda/Terminos) passam SO
          paddingTop/paddingBottom e por isso nunca mostraram o defeito:
          vertical no wrapper apenas SOMA respiro, nao inseta lado nenhum. */}
      <View style={[estilos.tarjeta, style]}>
        <Rotulo accessibilityRole="header">{titulo}</Rotulo>
        {sub ? <Micro style={estilos.tarjetaSub}>{sub}</Micro> : null}
        {children}
      </View>
    </FaixaCurva>
  );
}

/**
 * A PREVIA DO AVISO — o mock desenhado na tela, no molde do Heat Game: o cartao
 * de notificacao com icone, nome do app, marca de tempo e as duas linhas exatas
 * que vao chegar. E ele que aparece ANTES do pedido de permissao.
 *
 * `accessible` agrupa tudo em um no so para o leitor de tela: e uma imagem de
 * exemplo, nao quatro pedacos navegaveis.
 */
function PreviaDelAviso() {
  return (
    <View
      style={estilos.aviso}
      accessible
      accessibilityLabel={`${t('ajustes.recordatorio.previa')}. ${t(
        'ajustes.recordatorio.aviso.titulo'
      )}. ${t('ajustes.recordatorio.aviso.cuerpo')}`}
    >
      <View style={estilos.avisoCabecera}>
        <View style={estilos.avisoIcono}>
          <IconoNudo />
        </View>
        <Sobreceja style={estilos.avisoApp}>{t('ajustes.recordatorio.aviso.app')}</Sobreceja>
        <Micro>{t('ajustes.recordatorio.aviso.cuando')}</Micro>
      </View>
      <Cuerpo style={estilos.avisoTitulo}>{t('ajustes.recordatorio.aviso.titulo')}</Cuerpo>
      <Micro>{t('ajustes.recordatorio.aviso.cuerpo')}</Micro>
    </View>
  );
}

/** Botao redondo do seletor de hora. O glifo usa <Titulo>, nunca um fontSize solto. */
function BotonRedondo({ glifo, etiqueta, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={({ pressed }) => [estilos.redondo, pressed ? estilos.redondoPresionado : null]}
    >
      <Titulo style={estilos.redondoGlifo}>{glifo}</Titulo>
    </Pressable>
  );
}

/** Dois estados lado a lado. O aceso usa hilo como FUNDO; o rotulo segue papel. */
function Segmento({ opciones, valor, onCambio }) {
  return (
    <View style={estilos.segmento}>
      {opciones.map((op) => {
        const activo = op.id === valor;
        return (
          <Pressable
            key={op.id}
            onPress={() => onCambio(op.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: activo, checked: activo }}
            accessibilityLabel={op.texto}
            style={[estilos.segmentoOpcion, activo ? estilos.segmentoActivo : null]}
          >
            <Rotulo style={activo ? null : estilos.segmentoApagado}>{op.texto}</Rotulo>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * A folha de confirmacao. Uma por acao destrutiva, e cada uma diz as duas
 * metades: o que apaga E o que NAO apaga. As duas listas sao obrigatorias —
 * confirmacao que so ameaca e confirmacao que a pessoa aceita sem ler.
 */
function Confirmacion({ visible, titulo, borra, queda, boton, sinMovimiento, onConfirmar, onCancelar }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={sinMovimiento ? 'none' : 'fade'}
      onRequestClose={onCancelar}
      statusBarTranslucent
    >
      <View style={estilos.velo}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancelar}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <View style={estilos.hoja} accessibilityViewIsModal>
          <Cuerpo accessibilityRole="header" style={estilos.hojaTitulo}>
            {titulo}
          </Cuerpo>

          <Sobreceja style={estilos.hojaEtiqueta}>{t('ajustes.confirmar.borra')}</Sobreceja>
          <Micro style={estilos.hojaTexto}>{borra}</Micro>

          <Sobreceja style={estilos.hojaEtiqueta}>{t('ajustes.confirmar.queda')}</Sobreceja>
          <Micro style={estilos.hojaTexto}>{queda}</Micro>

          <BotonPrimario titulo={boton} onPress={onConfirmar} style={estilos.hojaBoton} />
          <BotonPrimario
            titulo={t('ajustes.confirmar.cancelar')}
            variante="fantasma"
            onPress={onCancelar}
            style={estilos.hojaBotonSecundario}
          />
        </View>
      </View>
    </Modal>
  );
}

/* =================================================================================
 * A TELA
 * ================================================================================= */

/**
 * @param {object} props
 * @param {object} [props.navigation] stack do React Navigation; opcional, para a tela
 *        poder ser montada sozinha em teste e em screenshot de loja.
 * @param {object} [props.avisos] adaptador de notificacao (ver o cabecalho).
 * @param {Function} [props.alVolver] usado quando nao ha navigation.
 * @param {Function} [props.alBorrarRespuestas] avisa o App.js para reabrir o onboarding.
 * @param {Function} [props.alBorrarTodo] avisa o App.js para voltar ao estado de instalacao.
 */
export default function AjustesScreen({
  navigation,
  avisos,
  alVolver,
  alBorrarRespuestas,
  alBorrarTodo,
}) {
  const canal = resolverCanal(avisos);

  const [recordatorio, setRecordatorio] = useState(RECORDATORIO_POR_DEFECTO);
  const [ajustes, setAjustes] = useState(AJUSTES_POR_DEFECTO);
  const [permiso, setPermiso] = useState('sin-preguntar');
  const [ocupado, setOcupado] = useState(false);
  const [errorAviso, setErrorAviso] = useState(false);
  const [noGuardado, setNoGuardado] = useState(false);
  const [avisoHaptica, setAvisoHaptica] = useState(false);
  const [confirmando, setConfirmando] = useState(null); // null | 'respuestas' | 'todo'
  const [resultadoBorrado, setResultadoBorrado] = useState(null); // null | 'respuestas' | 'todo' | 'parcial'

  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  // Carga inicial. NAO pede permissao — so pergunta o que ja foi decidido antes.
  useEffect(() => {
    let vivo = true;
    (async () => {
      const [r, a] = await Promise.all([leerRecordatorio(), leerAjustes()]);
      if (!vivo) return;
      setRecordatorio(r);
      setAjustes(a);
      if (canal && typeof canal.permiso === 'function') {
        try {
          const estado = await canal.permiso();
          if (vivo && typeof estado === 'string') setPermiso(estado);
        } catch {
          /* sem resposta do sistema: seguimos como 'sin-preguntar' */
        }
      }
    })();
    return () => {
      vivo = false;
    };
  }, [canal]);

  // A linha "asi se siente" da vibracao some sozinha: e confirmacao de um toque,
  // nao um estado permanente da tela.
  useEffect(() => {
    if (!avisoHaptica) return undefined;
    const id = setTimeout(() => {
      if (montado.current) setAvisoHaptica(false);
    }, 4000);
    return () => clearTimeout(id);
  }, [avisoHaptica]);

  const sistemaReduce = useReducedMotion();
  const forzado = ajustes.movimiento === 'reducido';
  // null (o sistema ainda nao respondeu) conta como reduzido: ninguem leva um
  // frame animado antes de sabermos a preferencia real. Mesma regra do BotonPrimario.
  const sinMovimiento = forzado || sistemaReduce !== false;

  const guardarRecordatorio = useCallback(async (siguiente) => {
    setRecordatorio(siguiente);
    const ok = await guardarSeguro(CLAVE_RECORDATORIO, JSON.stringify(siguiente));
    if (montado.current) setNoGuardado(!ok);
    return ok;
  }, []);

  const guardarPreferencias = useCallback(async (siguiente) => {
    setAjustes(siguiente);
    const ok = await guardarSeguro(CLAVE_AJUSTES, JSON.stringify(siguiente));
    if (montado.current) setNoGuardado(!ok);
    return ok;
  }, []);

  /* --- RECORDATORIO ------------------------------------------------------------ */

  const contenidoDelAviso = useMemo(
    () => ({
      titulo: t('ajustes.recordatorio.aviso.titulo'),
      cuerpo: t('ajustes.recordatorio.aviso.cuerpo'),
    }),
    []
  );

  const activar = useCallback(async () => {
    if (!canal || ocupado) return;
    setOcupado(true);
    setErrorAviso(false);
    try {
      // Se ja esta concedido nao se pergunta de novo — perguntar o que ja foi
      // respondido e o jeito mais rapido de a pessoa desligar tudo por reflexo.
      let estado = permiso;
      if (estado !== 'concedido') {
        estado = await canal.pedirPermiso();
        if (montado.current && typeof estado === 'string') setPermiso(estado);
      }
      if (estado !== 'concedido') return;

      const ok = await canal.programar({
        hora: recordatorio.hora,
        minuto: recordatorio.minuto,
        ...contenidoDelAviso,
      });
      if (!ok) {
        if (montado.current) setErrorAviso(true);
        return;
      }
      await guardarRecordatorio({ ...recordatorio, activo: true });
      tocar(ajustes.haptica, true);
    } catch {
      if (montado.current) setErrorAviso(true);
    } finally {
      if (montado.current) setOcupado(false);
    }
  }, [ajustes.haptica, canal, contenidoDelAviso, guardarRecordatorio, ocupado, permiso, recordatorio]);

  const desactivar = useCallback(async () => {
    if (!canal || ocupado) return;
    setOcupado(true);
    setErrorAviso(false);
    try {
      await canal.cancelar();
      await guardarRecordatorio({ ...recordatorio, activo: false });
    } catch {
      if (montado.current) setErrorAviso(true);
    } finally {
      if (montado.current) setOcupado(false);
    }
  }, [canal, guardarRecordatorio, ocupado, recordatorio]);

  // Mudar a hora com o aviso ligado reprograma na hora. Sem isso a tela diria
  // 08:00 e o telefone continuaria tocando as 21:00 — a mentira mais facil de
  // cometer nesta tela.
  const cambiarHora = useCallback(
    async (siguiente) => {
      const anterior = recordatorio;
      const ok = await guardarRecordatorio(siguiente);
      tocar(ajustes.haptica, false);
      if (!siguiente.activo || !canal) return;
      try {
        const programado = await canal.programar({
          hora: siguiente.hora,
          minuto: siguiente.minuto,
          ...contenidoDelAviso,
        });
        if (!programado && montado.current) {
          setErrorAviso(true);
          await guardarRecordatorio(anterior);
        }
      } catch {
        if (montado.current) {
          setErrorAviso(true);
          await guardarRecordatorio(anterior);
        }
      }
      return ok;
    },
    [ajustes.haptica, canal, contenidoDelAviso, guardarRecordatorio, recordatorio]
  );

  const abrirAjustesDelSistema = useCallback(() => {
    try {
      if (typeof Linking.openSettings === 'function') Linking.openSettings();
    } catch {
      /* na web nao existe tela de sistema para abrir */
    }
  }, []);

  /* --- MOVIMIENTO Y VIBRACION -------------------------------------------------- */

  const cambiarMovimiento = useCallback(
    (id) => {
      if (id === ajustes.movimiento) return;
      tocar(ajustes.haptica, false);
      guardarPreferencias({ ...ajustes, movimiento: id === 'reducido' ? 'reducido' : 'sistema' });
    },
    [ajustes, guardarPreferencias]
  );

  const cambiarHaptica = useCallback(
    (valor) => {
      const activa = valor === true;
      // O toque de confirmacao sai ANTES de gravar: e a prova, na mao da
      // pessoa, de que o controle liga alguma coisa de verdade.
      if (activa) {
        tocar(true, true);
        setAvisoHaptica(true);
      } else {
        setAvisoHaptica(false);
      }
      guardarPreferencias({ ...ajustes, haptica: activa });
    },
    [ajustes, guardarPreferencias]
  );

  /* --- DATOS -------------------------------------------------------------------- */

  const confirmar = useCallback(async () => {
    const cual = confirmando;
    if (!cual) return;
    setConfirmando(null);

    if (cual === 'respuestas') {
      const { ok } = await borrarClaves(CLAVES_RESPUESTAS);
      if (!montado.current) return;
      setResultadoBorrado(ok ? 'respuestas' : 'parcial');
      if (ok && typeof alBorrarRespuestas === 'function') alBorrarRespuestas();
      return;
    }

    // Borrar todo cancela o aviso agendado ANTES de apagar a chave: apagar a
    // preferencia sem cancelar deixaria uma notificacao fantasma tocando todos
    // os dias para um app que nao tem mais nada dentro.
    if (canal) {
      try {
        await canal.cancelar();
      } catch {
        /* sem canal saudavel nao ha o que cancelar */
      }
    }
    // (o passo 'sair do Circulo no servidor' saiu com o recurso — 11/09/2026.)
    const { ok } = await borrarClaves(CLAVES_HILO_ROJO);
    if (!montado.current) return;
    setRecordatorio({ ...RECORDATORIO_POR_DEFECTO });
    setAjustes({ ...AJUSTES_POR_DEFECTO });
    setResultadoBorrado(ok ? 'todo' : 'parcial');
    if (ok && typeof alBorrarTodo === 'function') alBorrarTodo();
  }, [alBorrarRespuestas, alBorrarTodo, canal, confirmando]);

  /* --- NAVEGACION --------------------------------------------------------------- */

  const puedeVolver =
    (navigation && typeof navigation.goBack === 'function') || typeof alVolver === 'function';

  const volver = useCallback(() => {
    if (navigation && typeof navigation.goBack === 'function') navigation.goBack();
    else if (typeof alVolver === 'function') alVolver();
  }, [alVolver, navigation]);

  const [privacidadAbierta, setPrivacidadAbierta] = useState(false);

  // O pe leva a Privacidad. Se a rota ja estiver registrada no navigator, manda
  // a tela dedicada (a copy dela vive no bloco privacidad.* de textos.js). Se
  // ainda nao estiver, abre a folha local com a MESMA copy — o link do pe nunca
  // pode ser um link morto, e um navigate() para rota inexistente so avisa em
  // __DEV__ e nao faz nada na mao da usuaria.
  const abrirPrivacidad = useCallback(() => {
    try {
      if (navigation && typeof navigation.navigate === 'function') {
        const estado = typeof navigation.getState === 'function' ? navigation.getState() : null;
        const nombres = estado && Array.isArray(estado.routeNames) ? estado.routeNames : [];
        if (nombres.includes(RUTAS.PRIVACIDAD)) {
          navigation.navigate(RUTAS.PRIVACIDAD);
          return;
        }
      }
    } catch {
      /* sem navigator utilizavel: a folha local resolve */
    }
    setPrivacidadAbierta(true);
  }, [navigation]);

  /* --- RENDER -------------------------------------------------------------------- */

  const horaLegible = formatearHora(recordatorio.hora, recordatorio.minuto);

  return (
    <View style={estilos.pantalla}>
      <HiloFondo variante="quieto" />

      <SafeAreaView style={estilos.seguro}>
        <ScrollView
          contentContainerStyle={estilos.contenido}
          keyboardShouldPersistTaps="handled"
        >
          {puedeVolver ? (
            <ColunaLeitura>
              <Pressable
                onPress={volver}
                accessibilityRole="button"
                style={({ pressed }) => [estilos.volver, pressed ? estilos.volverPresionado : null]}
              >
                <Rotulo>{t('comunes.volver')}</Rotulo>
              </Pressable>
            </ColunaLeitura>
          ) : null}

          {/* A ABERTURA fora de faixa, como nas telas de documento: primeira
              dobra, respira contra o fundo do app com o fio atras. */}
          <ColunaLeitura style={estilos.abertura}>
            <Sobreceja style={estilos.sobreceja}>{t('ajustes.sobreceja')}</Sobreceja>
            <Titulo accessibilityRole="header">{t('ajustes.titulo')}</Titulo>
            <Micro style={estilos.sub}>{t('ajustes.sub')}</Micro>

            {noGuardado ? <Micro style={estilos.alerta}>{t('ajustes.noGuardado')}</Micro> : null}
          </ColunaLeitura>

          {/* ---------- RECORDATORIO ---------- */}
          {/* OS TONS ALTERNAM: noite -> ameixa -> noite. Sem `violeta` nem
              `rosa` aqui — esta e a tela de controle, a mais sobria do modulo,
              e um tom forte atras de um seletor de hora compete com o proprio
              controle. */}
          <Tarjeta
            tom="noite"
            titulo={t('ajustes.recordatorio.titulo')}
            sub={t('ajustes.recordatorio.sub')}
          >
            <Micro style={estilos.estado}>
              {recordatorio.activo
                ? t('ajustes.recordatorio.estadoActivo', { hora: horaLegible })
                : t('ajustes.recordatorio.estadoInactivo')}
            </Micro>

            {/* A previa vem SEMPRE antes de qualquer botao: e ela que responde
                "o que eu vou receber" enquanto o pedido do sistema ainda nao
                aconteceu. */}
            <Sobreceja style={estilos.etiquetaPrevia}>{t('ajustes.recordatorio.previa')}</Sobreceja>
            <PreviaDelAviso />
            <Micro style={estilos.notaPrevia}>{t('ajustes.recordatorio.pie')}</Micro>

            {canal ? (
              <>
                <Sobreceja style={estilos.etiquetaHora}>{t('ajustes.recordatorio.hora')}</Sobreceja>
                <View style={estilos.selectorHora}>
                  <BotonRedondo
                    glifo="−"
                    etiqueta={t('ajustes.recordatorio.horaMenos')}
                    onPress={() =>
                      cambiarHora({ ...recordatorio, hora: horaMasUna(recordatorio.hora, -1) })
                    }
                  />
                  <Titulo tabular style={estilos.hora} accessibilityLabel={horaLegible}>
                    {horaLegible}
                  </Titulo>
                  <BotonRedondo
                    glifo="+"
                    etiqueta={t('ajustes.recordatorio.horaMas')}
                    onPress={() =>
                      cambiarHora({ ...recordatorio, hora: horaMasUna(recordatorio.hora, 1) })
                    }
                  />
                </View>

                <Segmento
                  valor={recordatorio.minuto === 30 ? 'media' : 'punto'}
                  onCambio={(id) =>
                    cambiarHora({ ...recordatorio, minuto: id === 'media' ? 30 : 0 })
                  }
                  opciones={[
                    { id: 'punto', texto: t('ajustes.recordatorio.enPunto') },
                    { id: 'media', texto: t('ajustes.recordatorio.yMedia') },
                  ]}
                />

                {permiso === 'negado' ? (
                  <>
                    <Micro style={estilos.alerta}>{t('ajustes.recordatorio.negado')}</Micro>
                    <BotonPrimario
                      titulo={t('ajustes.recordatorio.abrirSistema')}
                      variante="fantasma"
                      onPress={abrirAjustesDelSistema}
                      style={estilos.botonTarjeta}
                    />
                  </>
                ) : (
                  <>
                    {recordatorio.activo ? null : (
                      <Micro style={estilos.notaPermiso}>
                        {t('ajustes.recordatorio.antesDelPermiso')}
                      </Micro>
                    )}
                    <BotonPrimario
                      titulo={
                        recordatorio.activo
                          ? t('ajustes.recordatorio.desactivar')
                          : t('ajustes.recordatorio.activar')
                      }
                      variante={recordatorio.activo ? 'fantasma' : 'solido'}
                      cargando={ocupado}
                      onPress={recordatorio.activo ? desactivar : activar}
                      style={estilos.botonTarjeta}
                    />
                  </>
                )}

                {errorAviso ? (
                  <Micro style={estilos.alerta}>{t('ajustes.recordatorio.errorProgramar')}</Micro>
                ) : null}
              </>
            ) : (
              <Micro style={estilos.alerta}>{t('ajustes.recordatorio.sinCanal')}</Micro>
            )}
          </Tarjeta>

          {/* ---------- MOVIMIENTO ---------- */}
          <Tarjeta tom="ameixa" titulo={t('ajustes.movimiento.titulo')} sub={t('ajustes.movimiento.sub')}>
            <Segmento
              valor={ajustes.movimiento}
              onCambio={cambiarMovimiento}
              opciones={[
                { id: 'sistema', texto: t('ajustes.movimiento.sistema') },
                { id: 'reducido', texto: t('ajustes.movimiento.forzado') },
              ]}
            />
            <Micro style={estilos.estado}>
              {forzado
                ? t('ajustes.movimiento.forzadoNota')
                : sistemaReduce === false
                  ? t('ajustes.movimiento.sistemaNormal')
                  : t('ajustes.movimiento.sistemaReduce')}
            </Micro>
          </Tarjeta>

          {/* ---------- VIBRACION ----------
              A linha inteira nao existe na web: la o expo-haptics e um no-op e o
              switch seria decoracao. */}
          {HAY_VIBRACION ? (
            <View style={estilos.tarjeta}>
              {/* Aqui o titulo e o controle dividem a mesma linha em vez de virar
                  cabecalho de cartao: o switch e binario e imediato, entao ele
                  pertence ao lado do rotulo que ele liga. */}
              <View style={[estilos.fila, estilos.filaPrimera]}>
                <View style={estilos.filaTexto}>
                  <Rotulo accessibilityRole="header">{t('ajustes.haptica.titulo')}</Rotulo>
                  <Micro style={estilos.tarjetaSub}>{t('ajustes.haptica.sub')}</Micro>
                </View>
                <Switch
                  value={ajustes.haptica}
                  onValueChange={cambiarHaptica}
                  accessibilityLabel={t('ajustes.haptica.titulo')}
                  trackColor={{ false: colores.bordeSuave, true: colores.hilo }}
                  thumbColor={colores.papel}
                  ios_backgroundColor={colores.bordeSuave}
                />
              </View>
              {avisoHaptica ? (
                <Micro style={estilos.estado}>{t('ajustes.haptica.prueba')}</Micro>
              ) : null}
            </View>
          ) : null}

          {/* ---------- DATOS ---------- */}
          <Tarjeta tom="noite" titulo={t('ajustes.datos.titulo')} sub={t('ajustes.datos.sub')}>
            <BotonPrimario
              titulo={t('ajustes.datos.respuestas')}
              variante="fantasma"
              onPress={() => {
                setResultadoBorrado(null);
                setConfirmando('respuestas');
              }}
              style={estilos.botonTarjeta}
            />
            <BotonPrimario
              titulo={t('ajustes.datos.todo')}
              variante="fantasma"
              onPress={() => {
                setResultadoBorrado(null);
                setConfirmando('todo');
              }}
              style={estilos.botonTarjeta}
            />
            {resultadoBorrado ? (
              <Micro style={resultadoBorrado === 'parcial' ? estilos.alerta : estilos.estado}>
                {resultadoBorrado === 'parcial'
                  ? t('ajustes.borrado.parcial')
                  : t(`ajustes.borrado.${resultadoBorrado}`)}
              </Micro>
            ) : null}
          </Tarjeta>

          {/* ---------- PIE ----------
              Na ColunaLeitura pelo mesmo motivo do resto: o gutter saiu do
              ScrollView e agora e responsabilidade de cada bloco. */}
          <ColunaLeitura>
          <View style={estilos.pie}>
            <Micro tabular>{t('ajustes.version', { version: VERSION })}</Micro>
            <Pressable
              onPress={abrirPrivacidad}
              accessibilityRole="button"
              style={({ pressed }) => [estilos.enlace, pressed ? estilos.enlacePresionado : null]}
            >
              <Micro style={estilos.enlaceTexto}>{t('ajustes.privacidad')}</Micro>
            </Pressable>
          </View>
          </ColunaLeitura>
        </ScrollView>
      </SafeAreaView>

      <Confirmacion
        visible={confirmando === 'respuestas'}
        titulo={t('ajustes.confirmar.respuestas.titulo')}
        borra={t('ajustes.confirmar.respuestas.borra')}
        queda={t('ajustes.confirmar.respuestas.queda')}
        boton={t('ajustes.confirmar.respuestas.boton')}
        sinMovimiento={sinMovimiento}
        onConfirmar={confirmar}
        onCancelar={() => setConfirmando(null)}
      />

      <Confirmacion
        visible={confirmando === 'todo'}
        titulo={t('ajustes.confirmar.todo.titulo')}
        borra={t('ajustes.confirmar.todo.borra')}
        queda={t('ajustes.confirmar.todo.queda')}
        boton={t('ajustes.confirmar.todo.boton')}
        sinMovimiento={sinMovimiento}
        onConfirmar={confirmar}
        onCancelar={() => setConfirmando(null)}
      />

      <Modal
        visible={privacidadAbierta}
        transparent
        animationType={sinMovimiento ? 'none' : 'fade'}
        onRequestClose={() => setPrivacidadAbierta(false)}
        statusBarTranslucent
      >
        <View style={estilos.velo}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPrivacidadAbierta(false)}
            accessibilityElementsHidden
          />
          <View style={estilos.hoja} accessibilityViewIsModal>
            <Sobreceja>{t('privacidad.sobreceja')}</Sobreceja>
            <Cuerpo accessibilityRole="header" style={estilos.hojaTitulo}>
              {t('privacidad.titulo')}
            </Cuerpo>
            <Micro style={estilos.hojaTexto}>{t('privacidad.entrada')}</Micro>
            <Micro style={estilos.hojaTexto}>{t('ajustes.privacidad.borrar')}</Micro>
            <BotonPrimario
              titulo={t('comunes.cerrar')}
              variante="fantasma"
              onPress={() => setPrivacidadAbierta(false)}
              style={estilos.hojaBoton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =================================================================================
 * ESTILOS — nenhum hex, nenhum fontSize. Cor sai de theme.js e tipografia sai
 * dos wrappers de components/Texto.js.
 * ================================================================================= */
const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.noche,
  },
  seguro: {
    flex: 1,
  },
  // SEM padding lateral e SEM maxWidth (12/09/2026): as faixas precisam SANGRAR
  // de ponta a ponta. O 560 e o recuo foram pra ColunaLeitura, bloco a bloco —
  // e la a largura e calculada em CARACTERES POR LINHA contra o tamanho do
  // corpo, entao acompanha a fonte, coisa que um 560 fixo nao faz.
  contenido: {
    // Folga para a barra inferior de tres zonas do molde nao cobrir o pe.
    paddingBottom: espacio.xxxl * 2,
    width: '100%',
  },

  // `ar` (48) no topo: o silencio antes da primeira palavra. Embaixo nada — a
  // primeira faixa ja traz `secao` de padding proprio mais a altura da onda, e
  // somar margem a uma faixa e sempre somar duas vezes.
  abertura: {
    paddingTop: space.ar,
  },

  volver: {
    alignSelf: 'flex-start',
    paddingVertical: espacio.sm,
    paddingRight: espacio.lg,
    marginBottom: espacio.sm,
  },
  volverPresionado: {
    opacity: 0.6,
  },

  sobreceja: {
    marginBottom: espacio.xs,
  },
  sub: {
    marginTop: espacio.sm,
  },

  // SEM marginTop (12/09/2026): o respiro de cima agora e o padding da faixa.
  // O cartao continua com borda e fundo proprios — ele diz "estes controles
  // andam juntos", que e outra coisa do que a faixa diz.
  tarjeta: {
    padding: espacio.lg,
    borderRadius: radio.md,
    backgroundColor: colores.penumbra,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
  },
  tarjetaSub: {
    marginTop: espacio.xs,
  },

  estado: {
    marginTop: espacio.md,
  },
  alerta: {
    marginTop: espacio.md,
    color: colores.papel,
  },

  etiquetaPrevia: {
    marginTop: espacio.lg,
    marginBottom: espacio.sm,
  },

  // O cartao de notificacao. Fundo noche dentro da penumbra do cartao: e um
  // pedaco de "tela do telefone" desenhado por cima da tela do app.
  aviso: {
    padding: espacio.md,
    borderRadius: radio.md,
    backgroundColor: colores.noche,
    borderWidth: 1,
    borderColor: colores.bordeHilo,
    ...sombra.carta,
  },
  avisoCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: espacio.sm,
  },
  avisoIcono: {
    width: 28,
    height: 28,
    borderRadius: radio.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.penumbra,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    marginRight: espacio.sm,
  },
  avisoApp: {
    flex: 1,
  },
  avisoTitulo: {
    marginBottom: espacio.xs,
  },
  notaPrevia: {
    marginTop: espacio.md,
  },
  notaPermiso: {
    marginTop: espacio.lg,
  },

  etiquetaHora: {
    marginTop: espacio.xl,
  },
  selectorHora: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacio.sm,
  },
  hora: {
    textAlign: 'center',
    flex: 1,
  },
  redondo: {
    width: 52,
    height: 52,
    borderRadius: radio.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colores.bordeHilo,
    backgroundColor: colores.transparente,
  },
  redondoPresionado: {
    backgroundColor: colores.nudo,
  },
  redondoGlifo: {
    // So alinhamento: tamanho, familia e cor sao de <Titulo>.
    textAlign: 'center',
    marginTop: -espacio.xs,
  },

  segmento: {
    flexDirection: 'row',
    marginTop: espacio.md,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    overflow: 'hidden',
  },
  segmentoOpcion: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.sm,
    paddingVertical: espacio.md,
  },
  // Aceso: hilo como FUNDO (papel sobre hilo passa AA). Nunca como cor de texto.
  segmentoActivo: {
    backgroundColor: colores.hilo,
  },
  segmentoApagado: {
    opacity: 0.7,
  },

  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacio.md,
    minHeight: 48,
  },
  filaPrimera: {
    marginTop: 0,
  },
  filaTexto: {
    flex: 1,
    marginRight: espacio.lg,
  },

  botonTarjeta: {
    marginTop: espacio.md,
  },

  pie: {
    marginTop: espacio.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  enlace: {
    paddingVertical: espacio.sm,
    paddingLeft: espacio.lg,
  },
  enlacePresionado: {
    opacity: 0.6,
  },
  enlaceTexto: {
    color: colores.papel,
    textDecorationLine: 'underline',
  },

  velo: {
    flex: 1,
    backgroundColor: colores.velo,
    justifyContent: 'flex-end',
  },
  hoja: {
    padding: espacio.xl,
    paddingBottom: espacio.xxl,
    borderTopLeftRadius: radio.xl,
    borderTopRightRadius: radio.xl,
    backgroundColor: colores.penumbra,
    borderTopWidth: 1,
    borderColor: colores.bordeSuave,
    ...sombra.elevada,
  },
  hojaTitulo: {
    marginBottom: espacio.lg,
  },
  hojaEtiqueta: {
    marginTop: espacio.md,
  },
  hojaTexto: {
    marginTop: espacio.xs,
    // Entrelinha de <Micro>, herdada do token: nenhuma medida escrita a mao.
    marginBottom: tipo.micro.entrelinea - tipo.micro.tamano,
  },
  hojaBoton: {
    marginTop: espacio.xl,
  },
  hojaBotonSecundario: {
    marginTop: espacio.md,
  },
});
