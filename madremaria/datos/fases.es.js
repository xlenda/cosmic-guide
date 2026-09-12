// datos/fases.es.js
// ESPANHOL dos quatro tons de semana. Vizinho de datos/fases.js, um arquivo por
// idioma — mesma forma de datos/textos.es.js e de datos/lunacoes.es.js.
//
// ===========================================================================
// O QUE VEIO DA ONDA 1, VERBATIM
// ===========================================================================
// `tom` e `oQuePede` das quatro fases JA existiam em datos/textos.es.js
// (chaves 'ano.fase.<slug>.tom' e '.pede', linhas 451-458) e foram copiados de
// la sem tocar: e o texto que a tela do ano ja mostra.
// `fase`, `qualidade`, `abertura`, `comoMudaOPlano`, as nove `proibicoes` e os
// onze `oQueDiz` foram escritos aqui.
//
// ===========================================================================
// A LINHA QUE NAO SE ATRAVESSA — vale em espanhol tambem
// ===========================================================================
// DESCREVER, NUNCA CAUSAR. "En la creciente la fracción iluminada aumenta" e
// medida; "en la creciente las cosas crecen en tu vida" e invencao, e escorrega
// em tres palavras para "en la creciente esa persona se acerca".
//
// A CONTENCAO E ESTRUTURAL: em nenhum campo deste arquivo a outra pessoa
// aparece como SUJEITO DE VERBO. O original resolve no limite — a outra pessoa
// nao e mencionada em nenhuma das quatro fases —, e esta traducao mantem isso.
//
// ===========================================================================
// O QUE NAO SE TRADUZ, E POR QUE ESTA FORA DESTE ARQUIVO
// ===========================================================================
//  · `id`, `quarto`, `elongacao` — tecnicos. Mudar o id orfana o dado.
//  · `autor`, `obra`, `locus`, `seculo` — O RECIBO. "Cláudio Ptolomeu",
//    "Tetrabiblos", "I.8", "séc. II", "Catão, o Velho", "De Agri Cultura",
//    "W. L. Carr", "The Roman Farmer and the Moon (TAPA 49)", "James Rotton e
//    Ivan W. Kelly", "Much Ado about the Full Moon". Titulo de livro e nome de
//    autor NAO se traduzem: o app cita fonte de verdade, e um titulo traduzido
//    faria a citacao apontar para um livro que nao existe. O ANO tambem nao
//    muda. Quem quiser conferir precisa encontrar o volume.
//  · `oQueDiz` SIM se traduz: e PARAFRASE da Madre sobre o que a obra diz, nao
//    a citacao. Prosa do autor do app, nao do autor romano. Mesma regra do
//    campo `nota` dentro de `fonte` em datos/lecturas.js.
//  · As expressoes LATINAS ficam em latim: `luna silente`, `luna decrescente`.
//    Sao o que esta escrito em Catao, e e por elas que se confere a passagem.
//
// FORMA: dicionario plano, chaves identicas nos tres idiomas.
//   'fase.<id>.<campo>'        — os seis campos de texto de cada quadratura
//   'fase.<id>.proibicao.<n>'  — uma chave por item do array (indice 0-based)
//   'fonte.<slug>.oQueDiz'     — a parafrase de cada fonte
// Array virou chave numerada de proposito: quem consome escolhe a chave, igual
// ao plural em lib/i18n.js do Cosmic. Array dentro de dicionario plano obriga
// t() a devolver array, e aqui ninguem precisa disso.
// ===========================================================================

export const ES = {
  /* =======================================================================
   * AS FONTES — parafrase traduzida; autor, obra, locus e seculo NAO.
   * ======================================================================= */
  'fonte.quatroQuartos.oQueDiz':
    'Divide el mes lunar en cuatro cuartos y da a cada uno una cualidad elemental: de la Luna Nueva al Cuarto Creciente, húmedo; del Cuarto Creciente a la Llena, caliente; de la Llena al Cuarto Menguante, seco; del Cuarto Menguante a la conjunción, frío.',
  'fonte.oitoFases.oQueDiz':
    'La lectura psicológica de las ocho fases se formula aquí, sobre una idea que el autor venía desarrollando desde los años 1930-40 (The Astrology of Personality, 1936). Es tradición posterior, con autor y fecha — no es milenaria.',

  /* =======================================================================
   * 1 · EMPEZAR A OSCURAS (Luna Nueva a Cuarto Creciente)
   * tom/pede: VERBATIM de textos.es.js (ano.fase.comecar-no-escuro.*)
   * ======================================================================= */
  'fase.novaACrescente.fase': 'Luna Nueva a Cuarto Creciente',
  'fase.novaACrescente.tom': 'Empezar a oscuras',
  'fase.novaACrescente.qualidade': 'húmedo',
  'fase.novaACrescente.abertura':
    'Entre la Luna Nueva y el Cuarto Creciente la fracción iluminada del disco va de casi nada hasta la mitad. Es el tramo del mes con menos luz en el cielo de noche, y es el único en que la fase cambia de nombre sin que se pueda ver la diferencia de una noche a la otra.',
  'fase.novaACrescente.oQuePede':
    'Un gesto pequeño, empezado hoy, que no produce nada visible hoy.',
  'fase.novaACrescente.comoMudaOPlano':
    'La pantalla del día es la más corta de las cuatro y pide una sola cosa. Sin lista, sin segundo paso, sin nada que revisar al final del día — lo que se pide aquí es de las cosas que todavía no tienen resultado.',
  'fase.novaACrescente.proibicao.0':
    'No cambiar el gesto concreto por la "intención plantada". Plantar de verdad con la luna oscura tiene fuente primaria de dos mil años (Catão 40.1); "plantar intenciones" es una transposición moderna, popularizada por Jan Spiller en New Moon Astrology (2001). Si se usa la segunda, el texto declara que es moderna.',
  'fase.novaACrescente.proibicao.1':
    'No prometer que el gesto de hoy cambia lo que viene después. El pedido de esta fase es justamente lo que no tiene resultado a la vista.',
  'fonte.catao401.oQueDiz':
    'Higuera, manzano, olivo, peral y vid plantados luna silente — con la luna oscura —, al atardecer.',
  'fonte.paladio.oQueDiz': 'Todo lo que se siembra debe sembrarse con la luna creciendo.',

  /* =======================================================================
   * 2 · SOSTENER SIN AUMENTAR (Cuarto Creciente a Luna Llena)
   * O ponto mais escorregadio do arquivo: a regra romana e sobre SEMENTE, e a
   * distancia entre "lo que crece es tu registro" e "lo que crece es el
   * vínculo" e de uma palavra. A outra pessoa nao aparece em campo nenhum.
   * ======================================================================= */
  'fase.crescenteACheia.fase': 'Cuarto Creciente a Luna Llena',
  'fase.crescenteACheia.tom': 'Sostener lo que ya empezó, sin aumentar',
  'fase.crescenteACheia.qualidade': 'caliente',
  'fase.crescenteACheia.abertura':
    'Del Cuarto Creciente a la Luna Llena la parte iluminada del disco va de la mitad a entera. Es el tramo en que la misma cosa aparece más grande cada noche sin cambiar de naturaleza: lo que cambia es cuánto de ella está vuelto hacia acá.',
  'fase.crescenteACheia.oQuePede':
    'Rehacer el gesto de la fase anterior una vez más, del mismo tamaño.',
  'fase.crescenteACheia.comoMudaOPlano':
    'Es la única de las cuatro fases que pide repetición en vez de novedad. El tamaño del pedido no sube ningún día de esta fase — el gesto es el mismo, hecho de nuevo.',
  'fase.crescenteACheia.proibicao.0':
    'No decir que repetir hace crecer algo entre ti y otra persona. La regla romana es sobre semilla. Lo que la repetición hace crecer, cuando crece, es tu propio registro — y eso se cuenta en la pantalla, sin metáfora.',
  'fase.crescenteACheia.proibicao.1':
    'No escalar el pedido a lo largo de la semana. Escalar convierte la fase siguiente en una deuda.',
  'fonte.carr.oQueDiz':
    'Relevamiento de todos los pasajes latinos sobre luna y agricultura. La regla que él extrae del conjunto: todo lo que se quiere que crezca se hace con la luna creciente; todo lo que se quiere que seque o disminuya, con la menguante.',

  /* =======================================================================
   * 3 · LO QUE YA SE PUEDE VER (Luna Llena a Cuarto Menguante)
   * Duas proibicoes proprias, as duas com fonte: (a) COSECHAR e da menguante
   * (Plinio XVIII.321), nao da llena; (b) luna llena NAO se liga a
   * comportamento (Rotton & Kelly 1985, 37 estudos) — e esse fato e ATIVO:
   * protege contra "estoy así por la luna llena".
   * ======================================================================= */
  'fase.cheiaAMinguante.fase': 'Luna Llena a Cuarto Menguante',
  'fase.cheiaAMinguante.tom': 'Lo que ya se puede ver',
  'fase.cheiaAMinguante.qualidade': 'seco',
  'fase.cheiaAMinguante.abertura':
    'La Luna Llena es la oposición exacta entre Sol y Luna: un instante, no un día — a ojo desnudo el disco parece lleno durante unas tres noches. Desde ese punto hasta el Cuarto Menguante la fracción iluminada vuelve de entera a la mitad, y es el tramo del mes con más luz para ver lo que ya está ahí.',
  'fase.cheiaAMinguante.oQuePede':
    'Registrar por escrito una cosa que ya se puede ver sin interpretar.',
  'fase.cheiaAMinguante.comoMudaOPlano':
    'Es la única de las cuatro que pide palabra escrita, y por eso aparece una vez por lunación y no todas las semanas. El card del cielo no comparte bloque visual con ningún bloque de encuentro, y en esta fase no entra ningún gesto de encuentro.',
  'fase.cheiaAMinguante.proibicao.0':
    'No decir "cosechar". La fuente romana pone cosechar-para-guardar en la menguante (Plínio, NH XVIII.321), y en la llena Columela (XI.2.85) manda sembrar habas. La frase corriente en internet invierte la fuente.',
  'fase.cheiaAMinguante.proibicao.1':
    'No ligar la Luna Llena a comportamiento, tuyo ni de nadie. El metaanálisis de Rotton & Kelly (1985, 37 estudios) no encuentra relación — y este hecho sirve de protección contra "estoy así por la luna llena".',
  'fase.cheiaAMinguante.proibicao.2':
    'No poner gesto de encuentro en esta fase, y no dejar que la marca con fecha comparta bloque visual con el bloque de encuentro. Una fecha en la pantalla es medida; una fecha al lado de una reconciliación se vuelve víspera de un acontecimiento.',
  'fonte.columelaFava.oQueDiz':
    'Habas sembradas en la víspera o el mismo día de la luna llena.',
  'fonte.plinioColher.oQueDiz':
    'Todo lo que se corta, se cosecha y se esquila sufre menos daño con la luna menguante — o sea, cosechar-para-guardar es de la menguante, no de la llena.',
  'fonte.rottonKelly.oQueDiz':
    'Metaanálisis de 37 estudios: ninguna relación entre luna llena y comportamiento humano.',

  /* =======================================================================
   * 4 · QUITAR, CORTAR, DEJAR SECAR (Cuarto Menguante a Luna Nueva)
   * LINHA VERMELHA: a app corta pestana de navegador, NAO corta vinculo.
   * "Suelta a esa persona" seria a app decidindo o desfecho que ela jurou nao
   * saber. A proibicao 0 esta escrita com todas as letras.
   * ======================================================================= */
  'fase.minguanteANova.fase': 'Cuarto Menguante a Luna Nueva',
  'fase.minguanteANova.tom': 'Quitar, cortar, dejar secar',
  'fase.minguanteANova.qualidade': 'frío',
  'fase.minguanteANova.abertura':
    'Del Cuarto Menguante a la Luna Nueva la fracción iluminada va de la mitad a casi nada, y la Luna sale cada vez más tarde. Es el cuarto con más fuente antigua de todos: las tres grandes fuentes latinas ponen aquí todo lo que corta, cosecha para secar, carpe y disminuye.',
  'fase.minguanteANova.oQuePede':
    'Quitar una cosa concreta del día — una pestaña abierta, un horario, un objeto, una revisada.',
  'fase.minguanteANova.comoMudaOPlano':
    'Es la única fase del ciclo en que el pedido es menos, y no más. La pantalla del día resta en vez de sumar, y esa diferencia de forma es lo que impide que las cuatro semanas parezcan la misma semana.',
  'fase.minguanteANova.proibicao.0':
    'Jamás "suelta a esa persona", "corta ese vínculo", "déjalo ir". Lo que esta app corta es pestaña de navegador, horario y objeto — nunca un vínculo. Quien decide qué se corta eres tú.',
  'fase.minguanteANova.proibicao.1':
    'No convertir la resta en suma disfrazada ("quita eso y pon aquello en su lugar"). El pedido de esta fase es solo la retirada.',
  'fonte.plinioMinguante.oQueDiz':
    'Todo lo que se corta, se cosecha y se esquila sufre menos daño con la luna menguante; estiércol y castración también con la menguante.',
  'fonte.cataoMadeira.oQueDiz':
    'Estiércol luna silente; corte de madera luna decrescente, después del mediodía.',
  'fonte.columelaCapina.oQueDiz':
    'Carpida y estiércol con la menguante; corte de madera entre el vigésimo y el trigésimo día lunar.',
};

export default ES;
