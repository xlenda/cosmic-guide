// lib/traducoes/profeccoes.pt.js
// O PACK PORTUGUÊS DAS PROFECÇÕES — todo texto que o usuário lê mora aqui.
// O motor (aritmética da roda, retorno solar, montagem) fica em
// lib/profeccoes.js; a prosa fica neste arquivo, e os packs irmãos
// (profeccoes.es.js, profeccoes.en.js) repetem exatamente esta FORMA: mesmas
// chaves, mesmos campos, mesmos placeholders {x}.
//
// ESTE ARQUIVO É A FONTE DE VERDADE. O português é ouro e não muda um byte —
// test/profeccoes.test.js guarda o golden do PT e reprova qualquer alteração
// silenciosa.
//
// A REGRA DE ESCRITA (travada por teste): PRENDE PRIMEIRO, FONTE DEPOIS.
// Todo campo `prende`, `mes` e `curto` abre na vida real, em português de
// conversa — a conta que vence, a obra, o convite, o turno que não acaba. O
// recibo (obra, autor, século) mora em `tradicao` e em `fonte`, nunca na
// abertura. O teste confere que os primeiros 70 caracteres de cada abertura
// não contêm ano de quatro dígitos nem "séc.".
//
// A CAMADA MODERNA VEM SEPARADA E DATADA (proposição 1 e 3 da tese). Cada
// casa e cada planeta tem um campo `moderno` que diz o que o mercado repete e
// de quando é. Não é denúncia: é datação. A história real é mais interessante
// que a inventada.
//
// A LINHA VERMELHA, que aqui tem um cuidado extra. Fírmico e Valente listam
// doença sob a Casa 6 e a Casa 12, e Valente lista uma enfiada de doenças sob
// Saturno. O que entra é SEMPRE o registro histórico com dono e século ("os
// antigos procuravam ali…"), nunca uma frase dirigida ao corpo de quem lê.
// Nenhuma palavra de saúde, nenhuma promessa de resultado, nenhum veredito,
// nenhum aviso defensivo. test/profeccoes.test.js varre os três idiomas.
//
// O QUE NÃO SE TRADUZ: o verbatim de Robbins (Loeb, 1940) é idêntico nos três
// packs, em inglês — é o mesmo padrão de lib/traducoes/synastry.*.js. A glosa
// em português vem ao lado, marcada como glosa.

// ---------------------------------------------------------------------------
// AS CITAÇÕES — verbatim de Robbins (Loeb/Harvard, 1940), SEM tradução.
// Idênticas nos três packs. É o recibo que aguenta ser conferido.
// ---------------------------------------------------------------------------
const VERBATIM = {
  anual: {
    obra: 'Ptolemy, Tetrabiblos IV.10 ("Of the Division of Times"), trans. F. E. Robbins, Loeb, 1940',
    texto:
      'setting out from each of the prorogatory places, in the order of the signs, the number of years from birth, one year to each sign […] taking the ruler of the last sign.',
  },
  mensal: {
    obra: 'Ptolemy, Tetrabiblos IV.10, trans. F. E. Robbins, Loeb, 1940',
    texto:
      'We shall do the same thing for the months, setting out, again, the number of months from the month of birth, starting from the places that govern the year, twenty-eight days to a sign; and similarly for the days, we shall set out the number of the days from the day of birth, starting with the places which govern the months, two and a third days to a sign.',
  },
  prorrogativos: {
    obra: 'Ptolemy, Tetrabiblos IV.10, trans. F. E. Robbins, Loeb, 1940',
    texto:
      'We shall apply the prorogation from the horoscope to events relating to the body and to journeys […]; that from the Lot of Fortune to matters of property; that from the moon to affections of the soul and to marriage; that from the sun to dignities and glory; that from the mid-heaven to the other details of the conduct of life.',
  },
};

// ---------------------------------------------------------------------------
// NOMES — as CHAVES são canônicas (nome em PT) e nunca mudam; o valor é o que
// aparece na tela. Os packs es/en localizam só o valor.
// ---------------------------------------------------------------------------
const SIGNOS = {
  'Áries': 'Áries',
  'Touro': 'Touro',
  'Gêmeos': 'Gêmeos',
  'Câncer': 'Câncer',
  'Leão': 'Leão',
  'Virgem': 'Virgem',
  'Libra': 'Libra',
  'Escorpião': 'Escorpião',
  'Sagitário': 'Sagitário',
  'Capricórnio': 'Capricórnio',
  'Aquário': 'Aquário',
  'Peixes': 'Peixes',
};

// Duas formas do mesmo nome, e a razão é gramática, não capricho: `planetas` é
// o RÓTULO (o que aparece no campo "Senhor do ano") e `planetasNaFrase` é o
// nome como ele entra numa oração — em português "é a Lua", nunca "é Lua". Os
// packs es/en repetem as duas chaves, cada língua com o seu artigo.
const PLANETAS = {
  sol: 'Sol',
  lua: 'Lua',
  mercurio: 'Mercúrio',
  venus: 'Vênus',
  marte: 'Marte',
  jupiter: 'Júpiter',
  saturno: 'Saturno',
};

const PLANETAS_NA_FRASE = {
  sol: 'o Sol',
  lua: 'a Lua',
  mercurio: 'Mercúrio',
  venus: 'Vênus',
  marte: 'Marte',
  jupiter: 'Júpiter',
  saturno: 'Saturno',
};

// ---------------------------------------------------------------------------
// AS DOZE CASAS — significação ANTIGA (Camada A), com o locus dentro do texto.
// Base: docs/tradicao/12-as-doze-casas.md §5 (Fírmico Materno, Mathesis II.XIX;
// Paulo de Alexandria, cap. 24 e 30; Vétio Valente, Anthologiae II).
//
// Aqui vale a advertência de docs/tradicao/03 §7.12: NÃO existe "roda natural"
// (Áries = casa 1). A casa é contada do ponto de partida do mapa da pessoa, e
// só. Nenhum texto abaixo empresta caráter de signo para casa.
// ---------------------------------------------------------------------------
const CASAS = {
  1: {
    nomeAntigo: 'Horoskopos — "o leme"',
    prende:
      'A pergunta do ano volta pra você: o corpo, o nome, o jeito de aparecer na porta. Coisa que estava no colo dos outros volta pro seu. É a volta da roda ao ponto de partida — de doze em doze anos ela cai aqui.',
    mes: 'O assunto volta pra você: corpo, nome, a cara que você mostra.',
    tradicao:
      'O primeiro lugar é o Horoskopos. Paulo de Alexandria (séc. IV) o chama de "a origem e o fundamento" e de "o leme"; Fírmico Materno, no mesmo século, escreve que dali se determina o caráter da natividade inteira — "a pedra angular e a base". É onde Mercúrio se alegra.',
    moderno:
      '"Máscara social" e "como o mundo te vê" é leitura do século XX. Legítima, só é posterior — e é outra função: a antiga é arquitetônica, o ponto zero de onde as outras casas são contadas.',
    fonte: 'Paulo de Alexandria, cap. 24 · Fírmico Materno, Mathesis II.XIX.2 (séc. IV)',
  },
  2: {
    nomeAntigo: 'Porta do Hades',
    prende:
      'Ano de conta na mesa: o que entra, o que sai, o que sustenta o mês. Dinheiro aqui não é status — é aluguel, mercado, a parcela que vence dia 10.',
    mes: 'Conta na mesa: o que entra, o que sai, o que sustenta o mês.',
    tradicao:
      'O nome antigo do segundo lugar é Porta do Hades. Fírmico Materno (séc. IV) diz que ele mostra "aumento nas esperanças pessoais e nos bens materiais" e, na mesma frase, o classifica como lugar passivo, "porque não faz aspecto nenhum com o Ascendente". Valente (séc. II) é mais duro: ali "os benéficos não fazem bem". Fírmico também o chama de Spes, Esperança.',
    moderno:
      '"Autoestima" e "meus valores" é virada do século XX, e nasce de um trocadilho em inglês — values serve para valor moral e para valor em dinheiro. Nenhuma fonte antiga lida nesta base faz essa passagem.',
    fonte: 'Fírmico Materno, Mathesis II.XIX.3 (séc. IV) · Vétio Valente, Anthologiae II (séc. II)',
  },
  3: {
    nomeAntigo: 'a Deusa',
    prende:
      'Ano de gente perto: irmão, primo, o vizinho que virou amigo, o grupo de sempre. E de ir e voltar — mala pequena, estrada curta, dormir na casa de outra pessoa.',
    mes: 'Gente perto e ir e voltar: irmão, vizinho, a estrada curta.',
    tradicao:
      'O terceiro lugar chama-se a Deusa, e é onde a Lua se alegra. Fírmico Materno (séc. IV) põe aqui "irmãos e amigos" e também "os viajantes". Paulo de Alexandria acrescenta amizade, patrocínio e viver no estrangeiro; Valente, na tabela dos nove nomes, dá a este lugar a mãe.',
    moderno:
      '"Comunicação e mente concreta" vem do alfabeto de doze letras, que iguala casa, signo e planeta: semente em Lilly, 1647, e doutrina plena no século XX, popularizada por Zipporah Dobyns nos anos 1970. Chris Brennan observa que o planeta antigo deste lugar é a Lua, não Mercúrio — a coincidência de tema é coincidência mesmo, entre dois motores diferentes.',
    fonte: 'Fírmico Materno, Mathesis II.XIX.4 (séc. IV) · Paulo de Alexandria, cap. 24',
  },
  4: {
    nomeAntigo: 'Hypógeion — o Subterrâneo',
    prende:
      'Ano de raiz: a casa, o terreno, a mudança de endereço, o que a família guarda e o que ela deve. O assunto que estava debaixo do tapete há anos costuma ser deste tipo.',
    mes: 'Raiz: casa, mudança, o assunto de família que estava guardado.',
    tradicao:
      'O quarto lugar é o Hypógeion, o subterrâneo. Fírmico Materno (séc. IV) é taxativo e não fala em pai: "propriedade da família, substância, posses, bens domésticos, tudo que diz respeito a riqueza escondida e recuperada". Paulo de Alexandria põe aqui terras, fundações, a pátria e o fim da vida.',
    moderno:
      'Pai ou mãe na Casa 4 é briga entre camadas, e a gente diz qual está usando: Lilly (1647) põe o pai aqui e a mãe na 10; a astrologia moderna inverteu; e Fírmico tira os pais das casas e os põe nos planetas — o Sol informa sobre o pai, a Lua sobre a mãe. Valente, por sua vez, põe o pai na 9 e a mãe na 3.',
    fonte:
      'Fírmico Materno, Mathesis II.XIX.5 e II.XIX.13 (séc. IV) · Paulo de Alexandria, cap. 24',
  },
  5: {
    nomeAntigo: 'Boa Fortuna',
    prende:
      'Ano em que a conversa sobre filho aparece — ter, criar, cuidar, ou o filho de alguém que virou assunto seu. E o que se faz por gosto, sem cobrar nada por isso.',
    mes: 'O que se faz por gosto — e a conversa sobre filho.',
    tradicao:
      'O quinto lugar é a Boa Fortuna, onde Vênus se alegra. Fírmico Materno (séc. IV): "deste lugar se descobre o número dos filhos e o sexo deles — é chamado Boa Fortuna porque é a casa de Vênus", e está em trígono com o Ascendente. Valente, no século II, chegava a ligar este lugar a casamento.',
    moderno:
      '"Criatividade, palco e autoexpressão" vem do alfabeto de doze letras — a 5ª casa igualada a Leão e ao Sol —, doutrina plena do século XX. Não achei essa leitura em fonte antiga nenhuma desta base.',
    fonte: 'Fírmico Materno, Mathesis II.XIX.6 (séc. IV) · Vétio Valente, Anthologiae II (séc. II)',
  },
  6: {
    nomeAntigo: 'Má Fortuna',
    prende:
      'Ano de trabalho que pesa: o turno que não acaba, a tarefa que ninguém quis e sobrou, o chefe que cobra. É o lugar do serviço prestado — e do desgaste que vem junto.',
    mes: 'Trabalho que pesa: o turno, a tarefa que sobrou, o que desgasta.',
    tradicao:
      'O sexto lugar chama-se Má Fortuna, e é onde Marte se alegra. Fírmico Materno (séc. IV) escreve que era ali que os antigos procuravam a causa das enfermidades do corpo, e que é lugar passivo, "porque não faz aspecto com o Ascendente". Valente (séc. II) vai além: benéfico ali não ajuda. Sue Ward, lendo a tradição horária, afina o vocabulário — o assunto é servidão e labuta, não "serviço".',
    moderno:
      '"Rotina, hábitos e bem-estar" é leitura do século XX, vinda da mesma igualdade entre a 6ª casa, Virgem e Mercúrio. Da lista antiga, o único item que sobreviveu foi o trabalho; o resto mudou de sinal.',
    fonte: 'Fírmico Materno, Mathesis II.XIX.7 (séc. IV) · Vétio Valente, Anthologiae II (séc. II)',
  },
  7: {
    nomeAntigo: 'Dýsis — o Poente',
    prende:
      'Ano do outro: quem senta na sua frente. Casamento, sociedade, contrato, e também a briga que só existe porque tem duas pessoas nela. Pouca coisa se resolve sozinho num ano desses.',
    mes: 'O outro: contrato, sociedade, a conversa que precisa de duas pessoas.',
    tradicao:
      'O sétimo lugar é o Dýsis, o Poente — onde o Sol se põe. Fírmico Materno (séc. IV): "deste lugar perguntaremos a natureza e o número dos casamentos". E o mesmo Fírmico observa que este é o lugar mais adverso ao Ascendente, porque está em oposição a ele. Paulo de Alexandria põe aqui, além do casamento, as longas estadas no estrangeiro.',
    moderno:
      '"O espelho", "a alma gêmea" e "a projeção da sombra" é leitura junguiana do século XX. Lilly, em 1647, ainda punha aqui o inimigo público — e Sue Ward nega expressamente que esta seja a casa do "outro desconhecido".',
    fonte: 'Fírmico Materno, Mathesis II.XIX.8 (séc. IV) · Paulo de Alexandria, cap. 24',
  },
  8: {
    nomeAntigo: 'Epicatafora — Começo da Morte, e "o Ocioso"',
    prende:
      'Ano de dinheiro que não é seu: herança, dívida, a parte do outro na conta, o que ficou de alguém. E do que se encerra — e que só encerra com assinatura.',
    mes: 'Dinheiro que não é seu: a parte do outro, a dívida, o que se encerra.',
    tradicao:
      'O oitavo lugar chama-se Epicatafora, começo da morte, e Paulo de Alexandria lhe dá outro nome: o Ocioso (argós). Fírmico Materno (séc. IV) diz que é lugar passivo, "porque não faz aspecto com o Ascendente". Paulo põe aqui o lucro vindo de heranças. Ptolomeu exclui este lugar da prorrogação justamente por ser disjunto do Ascendente.',
    moderno:
      '"Sexo e transformação" entra depois de 1930: Plutão é descoberto, atribuído a Escorpião, e Escorpião é equiparado à Casa 8 pelo alfabeto de doze letras. Sue Ward descreve a cadeia com todas as letras. Nenhuma fonte antiga desta base liga a Casa 8 a sexo.',
    fonte:
      'Fírmico Materno, Mathesis II.XIX.9 (séc. IV) · Paulo de Alexandria, cap. 24 · Ptolomeu, Tetrabiblos III.10',
  },
  9: {
    nomeAntigo: 'o Deus',
    prende:
      'Ano de sair do próprio quintal: outro país, outra língua, outro jeito de pensar. Curso, fé, uma pergunta grande que não desgruda da cabeça.',
    mes: 'Sair do próprio quintal: outro país, outra língua, uma pergunta grande.',
    tradicao:
      'O nono lugar é o Deus, e é onde o Sol se alegra. Fírmico Materno (séc. IV) põe ali religião e viagem ao estrangeiro. Valente (séc. II) é o mais rico: "amizade, viagem, benefícios vindos de coisas estrangeiras. É o lugar de Deus, do rei, do soberano; astrologia, decretos oraculares, a aparição dos deuses, adivinhação". A própria astrologia mora nesta casa.',
    moderno:
      '"Filosofia e ensino superior" é a versão secular da mesma coisa, e chega no século XX pela igualdade entre a 9ª casa, Sagitário e Júpiter — mas esta é a casa em que o antigo e o moderno mais se parecem. Vale dizer isso: credibilidade também se constrói admitindo quando o mercado acerta.',
    fonte: 'Fírmico Materno, Mathesis II.XIX.10 (séc. IV) · Vétio Valente, Anthologiae II (séc. II)',
  },
  10: {
    nomeAntigo: 'Mesouránēma — o Meio-do-Céu',
    prende:
      'Ano de aparecer: o que você faz, quem vê você fazendo, o nome que fica. Promoção, troca de função, o projeto que sai do rascunho e vira coisa pública.',
    mes: 'Aparecer: o que você faz e quem vê você fazendo.',
    tradicao:
      'O décimo lugar é o Mesouránēma, e a palavra grega para o que ele rege é praxis — ação, o que se faz. Fírmico Materno (séc. IV) o chama de "o primeiro em importância" e lista ali as ações, a pátria, a casa e a carreira. Ptolomeu o põe em primeiro lugar entre os lugares prorrogativos. Uma nota técnica que quase ninguém dá: em Casas Inteiras o Meio-do-Céu não é a cúspide da Casa 10 — Paulo (cap. 30) avisa que o grau culminante cai às vezes na 9, às vezes na 11. Quando este app diz Casa 10, está dizendo o décimo signo contado do ponto de partida.',
    moderno:
      '"Carreira" no sentido de emprego é tradução do século XX, moderna e estreita, de praxis: Fírmico incluía aqui também a pátria e a casa. E há uma inversão para registrar: Lilly, em 1647, punha a mãe na Casa 10; a astrologia moderna pôs o pai.',
    fonte:
      'Fírmico Materno, Mathesis II.XIX.11 (séc. IV) · Paulo de Alexandria, cap. 30 · Ptolomeu, Tetrabiblos IV.10',
  },
  11: {
    nomeAntigo: 'Agathos Daimon — o Bom Daimon',
    prende:
      'Ano de quem te dá a mão: o convite, a indicação, a porta aberta por alguém que já estava dentro. O que chega por gente, não por esforço solitário.',
    mes: 'Quem te dá a mão: o convite, a indicação, a porta aberta.',
    tradicao:
      'O décimo primeiro lugar é o Bom Daimon — Agathos Daimon, o bom espírito —, e é onde Júpiter se alegra. Fírmico Materno (séc. IV) diz que é "a casa de Júpiter" e que está em sextil com o Ascendente. Paulo de Alexandria põe aqui aliança, patrocínio e boas expectativas. Valente (séc. II): benéficos neste lugar "tornam os homens ilustres e ricos desde a juventude".',
    moderno:
      '"Amigos e grupos" é consolidação posterior — Paulo punha a amizade na Casa 3. E a carga de coletivo, ativismo e rede vem de Urano, planeta descoberto em 1781: é do século XX na prática.',
    fonte:
      'Fírmico Materno, Mathesis II.XIX.12 (séc. IV) · Paulo de Alexandria, cap. 24 · Vétio Valente, Anthologiae II (séc. II)',
  },
  12: {
    nomeAntigo: 'Cacodaemon — o Mau Daimon',
    prende:
      'Ano de bastidor: o que corre por baixo, o que ninguém comenta na reunião, o combinado que fica atrás da porta. E de lidar com quem atrapalha sem levantar a voz.',
    mes: 'Bastidor: o que corre por baixo e não se comenta na reunião.',
    tradicao:
      'O décimo segundo lugar é o Mau Daimon — Cacodaemon —, e é onde Saturno se alegra. Fírmico Materno (séc. IV) diz que dali se determina "a natureza dos inimigos", que é lugar passivo "porque não faz aspecto com o Ascendente", e que é a casa de Saturno. Sue Ward define o inimigo oculto de um jeito afiado: costumam ser pessoas que a própria pessoa considera amigas. Ptolomeu exclui este lugar nominalmente, e a razão que ele dá é atmosférica — a exalação úmida e espessa da terra turva a luz das estrelas ali.',
    moderno:
      '"Inconsciente, karma e vidas passadas" entra no século XX, em três saltos: a teosofia de Alan Leo (Esoteric Astrology, 1913), as casas como campos de experiência em Rudhyar (1936 e 1972) e a consolidação psicológica com Liz Greene e Sasportas (The Twelve Houses, 1985). Já "autossabotagem" circula muito e a pesquisa desta base não achou a primeira ocorrência em fonte datada — fica registrado como não achado.',
    fonte: 'Fírmico Materno, Mathesis II.XIX.13 (séc. IV) · Ptolomeu, Tetrabiblos III.10',
  },
};

// ---------------------------------------------------------------------------
// OS SETE SENHORES DO ANO — o regente do signo onde a contagem para.
// Base: docs/tradicao/11-planetas-em-profundidade.md §3 (Valente I.1 lido
// integralmente; classes de Ptolomeu I.5).
//
// O QUE NÃO ENTRA: a lista de doenças que Valente dá sob Saturno, e as
// catástrofes que ele dá sob Marte. Aquilo é literatura de prognóstico de vida
// inteira, do século II — não é o que este app faz, e a linha vermelha do
// projeto proíbe. O que entra é o vetor de cada planeta na fonte.
// ---------------------------------------------------------------------------
const SENHORES = {
  sol: {
    prende:
      'O assunto do ano é aparecer: o cargo, o nome, a palavra que vale porque é você que está dizendo. Pai, chefe, quem manda — esse tipo de figura costuma ocupar espaço na conversa.',
    curto: 'O Sol puxa o assunto pro que é público.',
    tradicao:
      'Valente (séc. II) abre o catálogo dos planetas pelo Sol e o define como "o órgão da percepção mental". Debaixo dele agrupa realeza, comando, cargo, reputação pública, honras — e as pessoas: o pai, o patrão. Ptolomeu não o chama de benéfico: na classificação dele o Sol é comum.',
    moderno:
      '"O Sol rege a personalidade" é de Alan Leo, de 1895 em diante. Não está nas fontes antigas.',
    fonte: 'Vétio Valente, Anthologiae I.1 (séc. II) · Ptolomeu, Tetrabiblos I.5',
  },
  lua: {
    prende:
      'O assunto do ano é o que fica perto do chão: casa, mudança, rotina, a mãe, quem cuida de quem. Muda-se de lugar mais do que se muda de rumo.',
    curto: 'A Lua puxa o assunto pro que é de casa.',
    tradicao:
      'A lista de Valente (séc. II) para a Lua surpreende quem espera emoção: "a vida do homem, o corpo", a mãe, a administração da casa, a cidade, ganhos e despesas — e viagens e errâncias, com uma explicação por imagem: "ela não dá caminhos retos, por causa de Câncer". E Ptolomeu classifica a Lua como benéfica, ao lado de Júpiter e Vênus, o que quase nenhum app diz.',
    moderno:
      '"Lua igual a emoções" é ênfase do século XX. A fonte antiga fala primeiro de corpo, de casa e de cidade.',
    fonte: 'Vétio Valente, Anthologiae I.1 (séc. II) · Ptolomeu, Tetrabiblos I.5',
  },
  mercurio: {
    prende:
      'O ano fica falante: proposta, mensagem, conta pra fechar, papel pra assinar. Muita coisa se resolve por texto e por conversa — e muda de figura no meio do caminho.',
    curto: 'Mercúrio puxa o assunto pro papel e pra conversa.',
    tradicao:
      'Valente (séc. II) é longuíssimo sobre Mercúrio, e o resumo em uma palavra é intermediação: letras, disputa, embaixadas, contas, geometria, pesos e medidas, mercados, bancos — "o criador de todo o comércio". O mesmo planeta faz o notário e o trapaceiro, e isso é doutrina, não piada. E a linha que mais pesa aqui: "Mercúrio tornará tudo caprichoso no resultado, e bastante perturbado".',
    moderno:
      'O pânico em torno de Mercúrio retrógrado é do fim do século XX. Nenhuma fonte antiga promete aparelho quebrado — e, medido nesta base, o planeta passa cerca de 19% do tempo retrógrado, três vezes por ano.',
    fonte: 'Vétio Valente, Anthologiae I.1 (séc. II)',
  },
  venus: {
    prende:
      'O assunto do ano é gente que você quer por perto: o acordo, o pedido, a reconciliação, o convite. E gastar com o que é bonito e achar que valeu.',
    curto: 'Vênus puxa o assunto pro acordo e pro afeto.',
    tradicao:
      'Valente (séc. II) abre Vênus com duas palavras: "Vênus é desejo e amor". Depois vêm casamento, amizade, companhia, acordos em termos favoráveis — e o ofício: música, canto, pintura, mistura de cores, perfumaria, ourivesaria. Ptolomeu a classifica como benéfica.',
    moderno:
      '"Vênus é autoestima" é leitura do século XX. Na fonte, Vênus é vínculo, acordo e ofício — coisa que se faz com outra pessoa.',
    fonte: 'Vétio Valente, Anthologiae I.1 (séc. II) · Ptolomeu, Tetrabiblos I.5',
  },
  marte: {
    prende:
      'Ano de fazer, e de fazer cortando: a obra, a mudança forçada, a conversa que ninguém queria ter e teve. Ferramenta na mão, prazo curto, atrito.',
    curto: 'Marte puxa o assunto pro que exige ferramenta e prazo.',
    tradicao:
      'A lista de Valente (séc. II) para Marte é a mais dura do catálogo: força, disputa, processo, ira — e também comando, campanha, ofício com fogo e ferro, alvenaria. Ptolomeu o classifica como maléfico por secura excessiva; Valente registra o contrário quando ele está na própria seita e bem colocado — aí ele é doador de bem. O vetor de Marte na fonte é ação que corta.',
    moderno:
      'Ler Marte como "impulso e paixão" é vocabulário do século XX, de Rudhyar em diante. A fonte fala de ferro, fogo, ofício manual e comando.',
    fonte: 'Vétio Valente, Anthologiae I.1 (séc. II) · Ptolomeu, Tetrabiblos I.5',
  },
  jupiter: {
    prende:
      'O ano abre espaço: o cargo que alguém oferece, o acordo que destrava, a papelada que enfim anda. Também é ano de filho, de herança e de assinar em nome de outro.',
    curto: 'Júpiter puxa o assunto pro que abre espaço.',
    tradicao:
      'Valente (séc. II) resume Júpiter em aumento: gerar filhos, abundância de colheita, justiça, cargos, arbitragens, herança — "posse segura de bens", "libertação de vínculos". Ptolomeu o classifica como benéfico, de força temperada.',
    moderno:
      '"Sorte" é atalho do século XX. E um número que reorganiza a conversa, medido nesta base: Júpiter passa quase um terço do tempo retrógrado — se retrogradação fosse a catástrofe que se anuncia, o planeta da sorte estaria avariado quatro meses por ano, todo ano.',
    fonte: 'Vétio Valente, Anthologiae I.1 (séc. II) · Ptolomeu, Tetrabiblos I.5',
  },
  saturno: {
    prende:
      'Ano de peso e de prazo: o que demora, o que exige documento, o que só sai com paciência. E é também ano de receber cargo — a chave que ele entrega é a de quem administra o que é dos outros.',
    curto: 'Saturno puxa o assunto pro que demora e pede documento.',
    tradicao:
      'Valente (séc. II) faz de Saturno o retrato mais longo e mais sombrio do catálogo — lentidão, obstáculo, dívida, luto — e o chama de "a estrela de Nêmesis". Mas o mesmo Valente escreve que Saturno "põe nas mãos grandes postos e posições distinguidas, supervisões, a administração da propriedade alheia". Saturno dá cargo, e o mercado quase nunca diz isso. Ptolomeu o classifica como maléfico por frio excessivo, com a mesma ressalva de seita que vale para Marte.',
    moderno:
      '"Saturno é o vilão" é caricatura. E a leitura do retorno de Saturno como crise de amadurecimento é do século XX: o ciclo de trinta anos é antigo (Valente já chama o trigésimo ano de ponto crítico), a crise psicológica não.',
    fonte: 'Vétio Valente, Anthologiae I.1 (séc. II) · Ptolomeu, Tetrabiblos I.5',
  },
};

export const PACK = {
  idioma: 'pt',
  signos: SIGNOS,
  planetas: PLANETAS,
  planetasNaFrase: PLANETAS_NA_FRASE,
  verbatim: VERBATIM,
  casas: CASAS,
  senhores: SENHORES,

  // -------------------------------------------------------------------------
  // O CHROME DA TELA — screens/ProfeccoesScreen.js
  // -------------------------------------------------------------------------
  // Todo texto de interface vive aqui, nos três packs, com paridade exata de
  // chaves. A tela é VITRINE: ela não redige uma linha, só repassa o `lang` do
  // useLanguage(). O CONTEÚDO (casa do ano, senhor do ano, camada mensal,
  // verbatim, fontes) continua saindo do motor — o que está neste bloco é só o
  // que a tela precisa dizer POR SI: cabeçalho, rótulo de bloco que `rotulos`
  // ainda não tinha, estado vazio e botões.
  //
  // `locale` não é prosa: é a etiqueta que o Intl usa para escrever a data da
  // virada do ano na língua certa. Mora no pack porque muda com o idioma, e a
  // tela não pode escolher isso sozinha.
  tela: {
    titulo: 'Profecções',
    subtitulo: 'O assunto do seu ano — e quem segura a chave',
    intro:
      'Cada ano da sua vida tem um assunto e um planeta responsável por ele. A conta anda um signo por aniversário: aos doze a roda fecha e volta ao começo, e é por isso que os anos de doze em doze se parecem tanto entre si. Aqui está onde a sua roda parou neste ano — e onde ela está agora, dentro do mês.',
    introDois:
      'É a técnica preditiva mais bem documentada da tradição helenística, e ela pede pouco: só a sua data de nascimento. Com a hora e a cidade, a contagem passa a sair do Ascendente, que é a forma canônica; sem elas, sai do Sol, que Ptolomeu nomeia no mesmo capítulo. A tela diz sempre qual dos dois foi usado.',
    carregando: 'Procurando a sua data de nascimento…',
    indisponivelTitulo: 'A contagem não pode começar',
    botaoMapa: 'Preencher no Mapa Astral',
    rotuloPontoDePartida: 'De onde a contagem sai',
    rotuloQuandoVira: 'Quando o seu ano vira',
    rotuloCamadaMensal: 'A camada de 28 dias',
    rotuloCasasInteiras: 'O sistema de casas usado',
    rotuloAPalavra: 'A palavra "profecção"',
    rotuloTradicao: 'O que a tradição diz do lugar e do senhor',
    abrir: 'Abrir',
    fechar: 'Fechar',
    compartilhar: 'Compartilhar',
    copiado: 'Texto copiado — cola onde quiser.',
    naoCopiou: 'Não deu pra copiar aqui — seleciona o texto e copia.',
    marca: 'cosmicguide.cloud',
    locale: 'pt-BR',
  },

  // Moldes com placeholder — o motor preenche. Os packs es/en repetem EXATAMENTE
  // os mesmos placeholders; o teste de paridade reprova se faltar ou sobrar um.
  moldes: {
    senhorDoAno: 'Quem está com a chave do ano é {planeta}.',
    senhorDoMes: 'Nestes 28 dias quem segura a chave é {planeta}.',
    tituloAno: 'Ano {idade} · casa {casa} · {signo}',
    tituloMes: 'Mês {mes} do ano · casa {casa} · {signo}',
    fonte: '{base} · {casa} · {senhor}',
    fonteMes: '{base} · {casa} · {senhor}',
    janela: 'de {inicio} a {fim}',
  },

  fonteBase: 'Ptolomeu, Tetrabiblos IV.10 (séc. II)',

  comoFunciona:
    'A conta é de criança: a cada ano de vida o ponto de partida do seu mapa anda um signo. Ao completar 1 ano você está no segundo signo; aos 11, no décimo segundo; aos 12, de volta ao primeiro. O signo onde a contagem para é a casa do ano, e o planeta que rege esse signo é o Senhor do Ano.',

  deOndeVem:
    'Está em Ptolomeu, Tetrabiblos IV.10, o capítulo "Da Divisão dos Tempos", do século II: partindo de cada um dos lugares prorrogativos, na ordem dos signos, um ano para cada signo, e toma-se o regente do último signo. Chris Brennan chama a profecção anual de a técnica de senhor do tempo mais difundida da tradição helenística.',

  aPalavra:
    'A palavra "profecção" é latina, não grega: profectio, partida, avanço. A tradição helenística não tinha nome para a técnica — procurando "profect" na tradução integral de Valente feita por Mark Riley, o resultado é zero ocorrência. Quem procurar "profecção" nos gregos não vai achar.',

  camadaMensal:
    'O mesmo capítulo dá a camada de baixo: vinte e oito dias por signo, contados a partir do lugar que governa o ano. São treze mudanças dentro de um ano só. E dá ainda a camada diária, de dois dias e um terço por signo — que este app não usa.',

  quandoViraOAno:
    'O ano não vira à meia-noite do aniversário: vira quando o Sol volta ao grau exato em que estava no seu nascimento. Esse instante desliza quase seis horas por ano e, em ano pré-bissexto, cai no dia anterior ao aniversário do calendário. É por isso que a conta aqui sai do retorno solar, e não da diferença de datas.',

  sistemaDeCasas:
    'A contagem é por Casas Inteiras: a casa 1 é o signo inteiro do ponto de partida, a casa 2 é o signo seguinte, e assim por diante. É o sistema que a técnica pressupõe, e é o mesmo que o Mapa Astral deste app já usa.',

  origem: {
    ascendente: {
      rotulo: 'contado do seu Ascendente',
      texto:
        'A contagem sai do seu Ascendente, que é a forma canônica da técnica. No texto de Ptolomeu, a prorrogação a partir do horóscopo — o Ascendente — cobre o que diz respeito ao corpo e às viagens.',
    },
    sol: {
      rotulo: 'contado do seu Sol',
      texto:
        'Sem a hora e a cidade do nascimento não dá para saber o seu Ascendente, então a contagem sai do Sol. E isso não é um jeitinho: Ptolomeu manda profeccionar a partir de cada um dos lugares prorrogativos, e nomeia cinco — Ascendente, Lote da Fortuna, Lua, Sol e Meio-do-Céu —, cada um governando um assunto. O do Sol, no texto dele, cobre as dignidades e a glória.',
      glosa:
        'Glosa da passagem: "aplicaremos a prorrogação a partir do horóscopo aos acontecimentos relativos ao corpo e às viagens; a do Lote da Fortuna às questões de propriedade; a da Lua às afecções da alma e ao casamento; a do Sol às dignidades e à glória; a do meio-do-céu aos demais detalhes da conduta da vida."',
    },
  },

  melhoraCom: {
    hora:
      'Falta a hora do seu nascimento. Com ela e com a cidade, a mesma conta passa a sair do Ascendente — a forma canônica, e a que Ptolomeu liga ao corpo e às viagens. Dá para preencher no Mapa Astral.',
    cidade:
      'Falta a cidade do seu nascimento. Com ela e com a hora, a mesma conta passa a sair do Ascendente — a forma canônica, e a que Ptolomeu liga ao corpo e às viagens. Dá para preencher no Mapa Astral.',
    ambos:
      'Faltam a hora e a cidade do seu nascimento. Com as duas, a mesma conta passa a sair do Ascendente — a forma canônica, e a que Ptolomeu liga ao corpo e às viagens. Dá para preencher no Mapa Astral.',
  },

  precisao: {
    exata:
      'Com hora e cidade, o instante em que o seu ano vira é calculado no minuto: é o retorno do Sol ao grau exato do nascimento.',
    meioDia:
      'Sem a hora do nascimento, o cálculo usa o meio-dia — que é o palpite que menos erra dentro do dia. A virada do ano pode cair algumas horas antes ou depois do que está aqui.',
  },

  indisponivel: {
    semData:
      'Para contar os anos desta roda falta o começo: a sua data de nascimento. Dá para preencher no Mapa Astral, e a conta aparece na hora.',
    dataInvalida:
      'A data de nascimento salva não é uma data de calendário válida, então não dá para começar a contagem. Corrigindo no Mapa Astral, isto volta a funcionar.',
    semEfemeride:
      'A tabela do céu não carregou neste aparelho, e sem ela não dá para saber a hora exata em que o seu ano vira. Preferimos dizer isso a inventar uma data.',
    antesDoNascimento:
      'A data escolhida é anterior ao seu nascimento, e a contagem de anos de vida só começa nele.',
  },

  rotulos: {
    titulo: 'Profecção anual',
    tituloMensal: 'Profecção mensal',
    idade: 'Ano de vida',
    casaDoAno: 'Casa do ano',
    signoDoAno: 'Signo do ano',
    senhorDoAno: 'Senhor do ano',
    senhorDoMes: 'Senhor do mês',
    casaDoMes: 'Casa do mês',
    signoDoMes: 'Signo do mês',
    nomeAntigo: 'Nome antigo do lugar',
    viradaDoAno: 'Este ano começou em',
    proximaVirada: 'O próximo começa em',
    inicioDoMes: 'Este trecho começou em',
    fimDoMes: 'O próximo trecho começa em',
    comoFunciona: 'Como a conta é feita',
    deOndeVem: 'De onde isso vem',
    oQueOModernoDiz: 'O que o moderno costuma dizer',
    oQueMelhora: 'O que melhora com mais dado',
    naoAchado: 'O que a pesquisa não achou',
    fontes: 'Fontes',
    precisao: 'Precisão',
    verbatim: 'No original',
  },

  // Lei 2: o que a pesquisa NÃO achou fica declarado. Base:
  // docs/tradicao/13-tecnicas-preditivas.md §7.3 e §15.
  naoAchado: [
    'Paulo de Alexandria, Eisagogiká cap. 31, é apontado pela literatura secundária como a exposição mais clara do método. A pesquisa desta base não achou o texto em tradução acessível — a atribuição do capítulo é de segunda mão.',
    'Doroteu de Sídon, Carmen Astrologicum IV.1, é citado como fonte do Senhor do Ano. A pesquisa desta base não verificou a passagem no texto: as traduções de Pingree e de Dykes são protegidas.',
    'Nome grego para a técnica: não há. A tradição helenística usava o procedimento sem batizá-lo, e o nome que sobrou é o latino profectio, posterior.',
  ],

  fontes: [
    {
      obra: 'Tetrabiblos IV.10, "Da Divisão dos Tempos"',
      autor: 'Cláudio Ptolomeu',
      seculo: 'séc. II',
      grau: 'fonte primária',
      nota: 'tradução de F. E. Robbins, Loeb Classical Library, 1940',
    },
    {
      obra: 'Tetrabiblos I.17 (as casas dos planetas) e I.5 (benéficos e maléficos)',
      autor: 'Cláudio Ptolomeu',
      seculo: 'séc. II',
      grau: 'fonte primária',
      nota: 'a tabela de domicílios é o que dá o Senhor do Ano',
    },
    {
      obra: 'Mathesis II.XIX',
      autor: 'Júlio Fírmico Materno',
      seculo: 'séc. IV',
      grau: 'fonte primária',
      nota: 'tradução de Jean Rhys Bram; é a fonte dos nomes antigos dos doze lugares',
    },
    {
      obra: 'Anthologiae I.1 e Livro II',
      autor: 'Vétio Valente',
      seculo: 'séc. II',
      grau: 'fonte primária',
      nota: 'tradução integral de Mark T. Riley',
    },
    {
      obra: 'Eisagogiká, cap. 24 e cap. 30',
      autor: 'Paulo de Alexandria',
      seculo: '378 d.C.',
      grau: 'fonte primária',
      nota: 'os nomes dos lugares e o aviso de que o Meio-do-Céu não é a cúspide da Casa 10',
    },
    {
      obra: 'Hellenistic Astrology: The Study of Fate and Fortune',
      autor: 'Chris Brennan',
      seculo: '2017',
      grau: 'academia moderna',
      nota: 'obra protegida, usada como referência bibliográfica; a profecção como a técnica de senhor do tempo mais difundida da tradição',
    },
  ],

  base: [
    { arquivo: 'docs/tradicao/13-tecnicas-preditivas.md', locus: '§7 e §13.3' },
    { arquivo: 'docs/tradicao/12-as-doze-casas.md', locus: '§5' },
    { arquivo: 'docs/tradicao/11-planetas-em-profundidade.md', locus: '§3' },
    { arquivo: 'docs/tradicao/01-astrologia-fundamentos.md', locus: '§2.6' },
    { arquivo: 'docs/tradicao/16-oportunidades-de-conteudo.md', locus: 'oportunidade nº 6' },
  ],
};

export default PACK;
