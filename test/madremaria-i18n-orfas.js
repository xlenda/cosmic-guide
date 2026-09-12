// test/madremaria-i18n-orfas.js
// AS CHAVES DO PT QUE NENHUMA TELA VIVA CHAMA.
//
// ===========================================================================
// POR QUE ESTA LISTA EXISTE
// ===========================================================================
// O PT tem 775 chaves porque nasceu em C:/tmp/hilo-rojo, onde a Madre Maria era
// um app inteiro. Na fusao com o Cosmic Guide cinco telas NAO vieram, e a copy
// delas veio: o dicionario ficou com 143 chaves sem nenhum chamador.
//
// Traduzir chave morta e trabalho jogado fora DUAS vezes: uma ao escrever as 286
// strings (143 x 2 idiomas), outra para sempre no placar, que passaria a contar
// como pendencia real o que nunca vai aparecer em tela nenhuma. E pior: um placar
// que cobra 250 chaves quando so 107 sao de verdade ensina a quem le que o numero
// nao vale nada — e era exatamente assim que a regressao do item A se escondia.
//
// ===========================================================================
// COMO CADA GRUPO FOI CONFERIDO
// ===========================================================================
// Uma chave e VIVA se o codigo que roda (madremaria/, screens/, components/,
// lib/, hooks/ — menos madremaria/datos/, que sao os dicionarios) a chama de uma
// das TRES formas:
//
//   1. literal          t('pref.chave')
//   2. prefixo montado  t(`pref.${x}`)   ou   t('pref.' + x)
//   3. sufixo montado   `${base}.titulo` com a base literal em outro lugar
//
// As tres formas importam: conferir so a 1 acusaria de morta
// 'coracao.aposta.leve.leve' (montada por concatenacao em
// screens/PlanoScreen.js:1562), 'tirada.rotulo.nudo' (template em
// madremaria/lib/lectura.js:925) e as 39 de 'ano.lunacao.N.*' (sufixo em
// madremaria/lib/ano.js:1435-1437) — 51 chaves vivas que um grep ingenuo mata.
//
// E o teste madremaria-i18n.test.js CONFERE esta lista a cada corrida: chave que
// aparece aqui e volta a ser chamada por uma tela vira erro. A lista nao pode
// envelhecer em silencio — se o Circulo for escrito um dia, o portao manda tirar
// 'circulo.*' daqui antes de aceitar a tela.
//
// ===========================================================================
// O QUE NAO ENTRA AQUI
// ===========================================================================
// Chave orfa que JA FOI TRADUZIDA fica no placar normal, de proposito. Sao 12
// ('entrada.fim.titulo', 'ano.lunacao.*' que sobraram, etc.): tirar agora o que
// um tradutor ja escreveu removeria essas chaves da linha de base, e a blindagem
// contra regressao do item A perderia justamente as que tem valor gravado. Elas
// custam zero (estao prontas) e sao o que prova que a linha de base funciona.
//
// Quem APAGAR uma tela no futuro acrescenta as chaves dela aqui, com o motivo.

/** Chave orfa -> motivo, agrupado pela tela/feature que nao veio. */
const ORFAS = Object.freeze({
  /* O CIRCULO nao veio na fusao. Nao existe CirculoScreen.js em lugar nenhum do
   * repo, e nenhuma rota o enderecar (madremaria/routes.js nao declara nome para
   * ele). Era a feature social do hilo-rojo: mural, ranking, convite, denuncia. */
  circulo: Object.freeze([
    'circulo.rotulo', 'circulo.chamada', 'circulo.membro', 'circulo.fora',
    'circulo.hoje', 'circulo.hoje.uma',
    'circulo.convite.corpo', 'circulo.convite.campo', 'circulo.convite.entrar',
    'circulo.convite.falhou', 'circulo.convite.nota',
    'circulo.mural.rotulo', 'circulo.mural.vazio', 'circulo.mural.convite',
    'circulo.mural.campo', 'circulo.mural.soltar', 'circulo.mural.recusada',
    'circulo.ranking.rotulo', 'circulo.ranking.dias', 'circulo.ranking.nota',
    'circulo.sair', 'circulo.sair.nota', 'circulo.sair.falhou',
    'circulo.denuncia.abrir', 'circulo.denuncia.campo', 'circulo.denuncia.enviar',
    'circulo.denuncia.ocultar', 'circulo.denuncia.feita', 'circulo.denuncia.ocultado',
    'circulo.denuncia.falhou',
    'circulo.regras',
  ]),

  /* O CAFE e UM SO no app com o do Cosmic (decisao do dono, 11/09/2026 —
   * madremaria/routes.js documenta a solda). screens/RitualCafeScreen.js nao veio
   * na copia e RUTAS.RITUAL_CAFE foi apagado junto. Quem liga o gesto 'cafe' de
   * datos/rituais.js a tela e o ★ de screens/PlanoScreen.js, com ROUTES.COFFEE
   * do Cosmic — e a tela do Cosmic tem a copy DELA, em lib/i18n.js. */
  cafe: Object.freeze([
    'cafe.leitura.boton', 'cafe.leitura.aviso', 'cafe.leitura.rotulo', 'cafe.leitura.recibo',
    'cafe.sobreceja', 'cafe.titulo', 'cafe.pasos.rotulo',
    'cafe.foto.rotulo', 'cafe.foto.aviso', 'cafe.foto.nuncaSai', 'cafe.foto.opcional',
    'cafe.foto.semCanal',
    'cafe.boton.foto', 'cafe.boton.galeria', 'cafe.boton.semFoto',
    'cafe.permiso.sobreceja', 'cafe.permiso.titulo', 'cafe.permiso.cuerpo',
    'cafe.permiso.nota', 'cafe.permiso.boton', 'cafe.permiso.negado',
    'cafe.permiso.cancelado',
    'cafe.previa.rotulo', 'cafe.previa.nota', 'cafe.previa.boton', 'cafe.previa.otra',
    'cafe.figura.sobreceja', 'cafe.figura.titulo', 'cafe.figura.instruccion',
    'cafe.figura.nadaEncaixa',
    'cafe.lectura.sobreceja',
  ]),

  /* A PALMA, pelo mesmo motivo e na mesma decisao que o cafe:
   * screens/RitualMaoScreen.js nao veio e RUTAS.RITUAL_MAO foi apagado. A leitura
   * da mao do Cosmic (ROUTES.PALM) e a que abre.
   * CUIDADO ao varrer por 'mao': 'perfil.acceso.mao' e VIVA — e o item da lista
   * do Perfil que leva a tela do Cosmic, e ja esta traduzida nos dois idiomas. */
  mao: Object.freeze([
    'mao.leitura.fotografar', 'mao.leitura.umToque', 'mao.leitura.refazer',
    'mao.leitura.pratica', 'mao.leitura.lendo', 'mao.leitura.lendoNota',
    'mao.leitura.boton', 'mao.leitura.aviso', 'mao.leitura.rotulo',
    'mao.leitura.recibo', 'mao.leitura.cancelada',
    'mao.sobreceja', 'mao.titulo', 'mao.pasos.rotulo', 'mao.semCamera',
    'mao.aviso.saude', 'mao.boton.comecar',
    'mao.linha.sobreceja', 'mao.linha.titulo', 'mao.linha.instruccion',
    'mao.linha.onde.rotulo',
    'mao.lectura.sobreceja',
  ]),

  /* O ALBUM DAS 78 foi APAGADO. madremaria/routes.js ainda declara RUTAS.ALBUM,
   * mas screens/AlbumScreen.js nao existe no disco e o unico RUTAS.ALBUM que
   * sobrou no codigo esta COMENTADO (screens/PerfilScreen.js:239). O album que o
   * app tem e o do Cosmic (screens/TarotAlbumScreen.js), que por decisao expressa
   * nao passa por t() nenhum — o cabecalho dele diz isso na linha 91. */
  album: Object.freeze([
    'album.sobreceja', 'album.titulo', 'album.sub', 'album.cargando', 'album.conteo',
    'album.vacio', 'album.oculta', 'album.invite',
    'album.veces', 'album.veces.una', 'album.primera', 'album.ultima', 'album.legado',
    'album.grupo.completo', 'album.grupo.major', 'album.grupo.paus', 'album.grupo.copas',
    'album.grupo.espadas', 'album.grupo.ouros',
    'album.amor', 'album.cerrar', 'album.abrir', 'album.hoy.hecha', 'album.pie',
  ]),

  /* A TELA DE LEITURAS do hilo-rojo (a vitrine de tradicoes) nao veio: nao ha
   * LeiturasScreen.js e nenhuma rota a enderecar. O que o Cosmic tem no lugar sao
   * as telas dele, com a copy em lib/i18n.js.
   * CUIDADO: 'retroLua.leituras.*' em lib/i18n.js e do Cosmic, outro dicionario. */
  leituras: Object.freeze([
    'leituras.tradicion.rotulo',
    'leituras.fonte.rotulo', 'leituras.fonte', 'leituras.semFonte.rotulo',
    'leituras.pergunta.rotulo', 'leituras.pergunta.nota',
    'leituras.comoE.rotulo',
    'leituras.fio.boton', 'leituras.fio.hecho', 'leituras.fio.nota', 'leituras.fio.erro',
    'leituras.otra', 'leituras.volver',
  ]),

  /* O CHROME DA TIRADASCREEN. A tela foi apagada em 01/09 e hoje 'Tirada' e so o
   * NOME da rota que hospeda as abas (madremaria/routes.js: TIRADA:'MadreAbas').
   * O que sobrou VIVO do prefixo e o que outras telas reaproveitam — e fica no
   * placar: 'tirada.rotulo.*' (8, montadas em lib/lectura.js:925-926),
   * 'tirada.carta.derecha'/'.invertida' (components/CartaHilo.js:180,
   * lib/lectura.js:836) e 'tirada.avisoOtraPersona' (SintesisScreen.js:261). */
  tirada: Object.freeze([
    'tirada.titulo', 'tirada.sobreceja', 'tirada.instruccion', 'tirada.progreso',
    'tirada.carta.claves', 'tirada.continuar',
  ]),

  /* AS TRES MISSOES QUE SAIRAM DO CATALOGO junto com a TiradaScreen e o album
   * (madremaria/lib/missoes.js:236-240 nomeia as tres e diz por que). Uma missao
   * que manda raspar o que nao existe seria a tela dando ordem impossivel.
   * As outras 20 de 'missoes.*' estao no catalogo e ficam no placar — inclusive
   * 'resposta-do-ritual', que e `activa: false` mas continua declarada (a tela
   * pode religa-la sem escrever copy nova). */
  missoes: Object.freeze([
    'missoes.leitura-do-dia.titulo', 'missoes.leitura-do-dia.pista',
    'missoes.raspar-sem-pular.titulo', 'missoes.raspar-sem-pular.pista',
    'missoes.carta-nova-no-album.titulo', 'missoes.carta-nova-no-album.pista',
  ]),

  /* OS DOIS ICONES QUE SAIRAM DA BARRA. O Fio deixou de ser destino da barra e a
   * Tirada virou um dos cinco gestos que giram (comentarios em
   * madremaria/components/BarraInferior.js:141 e :265). A barra de hoje desenha
   * mapa, perfil e plano, e essas quatro chaves estao VIVAS no placar. */
  barra: Object.freeze(['barra.hilo', 'barra.tirada', 'barra.tirada.pista']),

  /* A CARTA-SURPRESA E O FATO DO ONBOARDING, removidos da OnboardingScreen — ela
   * mesma documenta o buraco nas linhas 362 e 723-724, citando as chaves pelo
   * nome. 'scratch.casi' caiu com a surpresa: era o aviso de raspagem quase
   * completa daquele cartao, e o ScratchRevealCard que sobrou nao o emite. */
  sorpresa: Object.freeze(['sorpresa.titulo', 'sorpresa.pie']),
  hecho: Object.freeze([
    'hecho.sobreceja', 'hecho.antiguedad', 'hecho.fuenteFormato', 'hecho.pie',
  ]),
  scratch: Object.freeze(['scratch.casi']),
});

/** Todas as orfas numa lista plana — o que o placar subtrai. */
const TODAS_ORFAS = Object.freeze(Object.values(ORFAS).flat());

/** O prefixo de cada orfa, para a mensagem do placar. */
const GRUPO_DA_ORFA = Object.freeze(
  Object.fromEntries(
    Object.entries(ORFAS).flatMap(([grupo, claves]) => claves.map((c) => [c, grupo]))
  )
);

module.exports = { ORFAS, TODAS_ORFAS, GRUPO_DA_ORFA };
