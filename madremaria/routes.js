// Nombres de las rutas de navegacion. Sin acentos: el nombre de la ruta
// es una clave tecnica, nunca un texto visible para el usuario.
//
// As cinco primeiras sao o fluxo da leitura (o centro da barra do Heat Game).
// PERFIL e a terceira zona da barra — o "avatar" da direita, que e a ficha
// honesta da usuaria e a porta para tudo o que nao e leitura.
//
// As cinco ultimas sao os destinos da lista de acessos de PerfilScreen. Ficam
// declaradas aqui porque o nome da rota e contrato: quem escrever essas telas
// depois registra o mesmo nome no navigator, sem inventar string nova. Enquanto
// a tela correspondente nao existir, o React Navigation apenas avisa em __DEV__
// que a acao nao foi tratada — nao quebra o app nem a barra.
export const RUTAS = Object.freeze({
  // A Madre Maria se apresenta ANTES das perguntas (09/09) — a primeira tela
  // de quem chega sem perfil. Caminho web: /madre-maria.
  APRESENTACAO: 'Apresentacao',
  ONBOARDING: 'Onboarding',

  // A LEITURA DE ENTRADA — as tres cartas do baralho cigano com a voz gravada.
  // Fica entre o ONBOARDING e o app, e essa e a ordem do funil do dono: cinco
  // perguntas, tres cartas com voz, e so entao as abas. E um DESTINO do Stack e
  // nunca uma aba: acontece uma vez na vida e nao ha para onde voltar depois — a
  // saida dela e um replace para as abas, do mesmo jeito que o onboarding fazia.
  //
  // Nao se chama 'Lenormand' de proposito: o nome da rota descreve o LUGAR no
  // fluxo, nao o baralho. Se um dia a leitura de entrada for gravada com outro
  // maco, o nome continua verdadeiro.
  LEITURA_ENTRADA: 'LeituraEntrada',

  // REOUVIR AS TRES CARTAS — a leitura, sem a escolha.
  //
  // A leitura de entrada acontece UMA VEZ na vida (decisao do dono, 01/09): com
  // ela feita, LEITURA_ENTRADA nao volta por caminho nenhum — nem pelo voltar do
  // Android, nem por URL, nem pelo Perfil. Mas as pessoas voltam nos AUDIOS, e
  // essa e a porta que sobrou para eles: as tres cartas ja abertas, com a voz e o
  // texto, sem grade de versos e sem raspagem.
  //
  // Sao duas rotas e nao uma com parametro de proposito. Um `modo=reouvir` na
  // URL e um interruptor que qualquer pessoa consegue virar na barra de
  // enderecos, e o que ele destrancaria e exatamente a tela que nao pode voltar.
  // Com duas rotas, a tela da escolha simplesmente nao tem como ser alcancada
  // por quem ja fez — ela redireciona sozinha (ver a tela).
  REOUVIR_ENTRADA: 'ReouvirEntrada',

  // O MAPA DO ANO — os 365 dias de uma vez, agrupados pelas treze luas. So
  // mostra; quem raspa e o plano do dia (ver screens/MapaDoAnoScreen.js).
  MAPA_ANO: 'MapaDoAno',

  // A LEITURA PROFUNDA — o carrossel de cinco audios que vem DEPOIS das tres
  // cartas e ANTES do app. Sao 6,7 minutos na mesma voz, e o texto de cada um
  // fica na tela por escrito (datos/profunda.js), palavra por palavra.
  //
  // E um DESTINO do Stack, como a leitura de entrada, e pelo mesmo motivo: a
  // barra das tres zonas nao pode aparecer antes de a pessoa ter recebido o que
  // a trouxe ate aqui. Sai por `replace` para as abas quando ela entra pela
  // primeira vez, e por `goBack` quando ela voltou pelo Perfil para reouvir.
  //
  // Continua alcancavel pelo Perfil de proposito: os 6,7 minutos entre a leitura
  // e a primeira tela do app sao onde mais gente sai, entao existe "Pular" desde
  // o primeiro card — e quem pula tem de ter como voltar.
  LEITURA_PROFUNDA: 'LeituraProfunda',

  // DENTRO DO COSMIC GUIDE o VALOR mudou de 'Tirada' para 'MadreAbas'.
  //
  // O nome antigo existia por um contrato que NAO EXISTE MAIS: o fim do
  // onboarding fazia replace(RUTAS.TIRADA) e, se a rota-host tivesse outro
  // nome, o StackRouter devolveria null em silencio (lib do React Navigation,
  // StackRouter.js: `if (!state.routeNames.includes(name)) return null`).
  // Hoje OnboardingScreen.js sai por replace(RUTAS.LEITURA_ENTRADA) e a
  // <Tab.Screen> homonima foi removida em 01/09 — o par de nomes aninhados
  // que o aviso defendia nem pode mais acontecer.
  //
  // O MECANISMO continua real, e a disciplina que o protege nao muda: todo
  // replace para as abas vai por NOMBRE_ABAS (navegacion.js), NUNCA por
  // string literal. Trocar o VALOR aqui propaga sozinho para os 7 call sites.
  TIRADA: 'MadreAbas',
  SINTESIS: 'Sintesis',
  HILO: 'Hilo',
  PAYWALL: 'Paywall',

  // 'MadrePerfil' e nao 'Perfil' DENTRO DO COSMIC GUIDE: o Cosmic ja tem uma
  // rota cujo valor e exatamente 'Perfil' (ROUTES.PROFILE_TAB). Era a UNICA
  // colisao de valor entre os 21 nomes daqui e os 55 de la (conferido por
  // comparacao completa das duas listas).
  //
  // Ela nao e teorica: components/DailyMissionsCard.js:251 do Cosmic faz
  // `navigation.navigate(ROUTES.PROFILE_TAB, { screen: ROUTES.LOJA })` — um
  // navigate NU, sem getParent(). NAVIGATE sobe ao pai e depois DESCE para os
  // navegadores filhos ja montados (@react-navigation/core, useOnAction), e
  // com as abas da Madre montadas a acao podia pousar na aba Perfil DAQUI, em
  // silencio, levando a pessoa para a tela errada. Prefixo de URL nao resolve
  // isto: a colisao e de NOME DE ROTA, nao de caminho.
  PERFIL: 'MadrePerfil',

  // O PLANO DO DIA. E a ZONA DO CENTRO — o que o FAB da barra abre. Antes o
  // centro levava direto a TIRADA; agora leva ao plano, e a tiragem passou a ser
  // UM dos cinco gestos que giram (o dia de 'cartas', em datos/rituais.js), aberta
  // pelo botao do proprio plano quando e o dia dela.
  //
  // A TIRADA continua sendo uma aba (ver navegacion.js): ela nao pode virar
  // destino do Stack porque a rota que HOSPEDA as abas ja se chama 'Tirada' — e
  // esse nome e contrato com o replace do fim do onboarding. Ela so deixou de ter
  // icone proprio na barra.
  PLANO: 'Plano',

  // O ritual de sete dias. E um DESTINO, nao uma zona: abre por cima das abas e
  // se fecha voltando de onde veio. Nao vira aba de proposito — uma quarta zona
  // na barra transformaria "um passo por dia" em morada, e o ritual tem fim
  // marcado no dia 7. Quem chama e a tela do fio (screens/HiloScreen.js) e a
  // lista do Perfil.
  RITUAL: 'Ritual',

  // O album das 78. Tambem um DESTINO, nao uma zona: ele nao pede acao nova
  // nenhuma da pessoa — quem o enche e a leitura do dia — entao uma quarta aba
  // o transformaria numa segunda hierarquia competindo com a leitura. Quem
  // chama e o cartao do album na tela do fio (screens/HiloScreen.js) e a lista
  // do Perfil. A tela ja existe (screens/AlbumScreen.js) e ja esta registrada no
  // Stack de App.js — rota declarada e tela solta no disco sao um toque morto
  // que nao acusa erro nenhum.
  ALBUM: 'Album',

  // CAFE E PALMA SAIRAM DAQUI — sao UM SO no app (decisao do dono, 11/09/2026).
  //
  // Eram RITUAL_CAFE:'RitualCafe' e RITUAL_MAO:'RitualMao', os dois destinos da
  // borra da xicara e da linha da mao. O Cosmic Guide ja tem as duas leituras,
  // com endpoint, cota e chave proprios, entao screens/RitualCafeScreen.js e
  // screens/RitualMaoScreen.js nao vieram na copia e os nomes de rota foram
  // apagados junto: constante que endereca tela inexistente e o toque morto que
  // o comentario do ALBUM aqui em cima descreve — nao acusa erro nenhum.
  //
  // NAO ressuscitar estes nomes — a solda ja foi feita (11/09/2026) e ela NAO
  // passa por aqui. Os rituais 'cafe' e 'mao' de datos/rituais.js continuam
  // girando normalmente, e quem os liga as telas do Cosmic e o ★ de
  // screens/PlanoScreen.js, com ROUTES.COFFEE e ROUTES.PALM importados do
  // routes.js do Cosmic. Declarar um nome igual aqui dentro nao "ajudaria": faria
  // o TabRouter da Madre capturar a navegacao antes de ela subir, e o botao
  // abriria a tela errada em silencio. Nada a declarar aqui.
  AJUSTES: 'Ajustes',
  METODO: 'Metodo',
  AYUDA: 'Ayuda',
  PRIVACIDAD: 'Privacidad',
  TERMINOS: 'Terminos',
});

export default RUTAS;
