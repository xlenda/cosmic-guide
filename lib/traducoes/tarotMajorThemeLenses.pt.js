// Lentes curtas dos 22 Arcanos Maiores por tema.
//
// Cada frase parte de uma cena ou do conselho já documentado em tarotDeck.js.
// Não acrescenta atribuições tradicionais e não prevê desfechos: aproxima a
// carta do território escolhido para abrir uma reflexão concreta.

const pack = {
  'major-00': {
    Amor: 'O pé na borda pergunta se esta aproximação nasce de abertura ou impulso. Antes do salto, combine liberdade com um limite claro.',
    Carreira: 'A trouxa leve favorece experimentar uma rota ainda sem garantias. Teste em pequena escala e observe o terreno antes de abandonar o conhecido.',
    Dinheiro: 'O penhasco transforma espontaneidade em alerta financeiro: curiosidade cabe; aposta sem margem, não. Defina quanto pode arriscar sem comprometer o básico.',
    Energia: 'O andarilho aponta disposição para começar, mas o cachorro puxa sua roupa. Escolha uma aventura que anime sem ignorar o sinal de cautela.',
    Saúde: 'Nesta lente de autocuidado, o passo pede presença e ambiente seguro. Prefira uma mudança simples de rotina a um salto que exceda seus limites.',
  },
  'major-01': {
    Amor: 'O Mago põe intenção e recurso na mesma mesa. Em vez de seduzir pela promessa, mostre com uma atitude qual vínculo deseja construir.',
    Carreira: 'As quatro ferramentas já estão disponíveis; o desafio profissional é escolher uma e usá-la com foco, em vez de exibir potencial disperso.',
    Dinheiro: 'Habilidade só vira recurso quando encontra execução. Faça inventário do que sabe produzir e teste uma aplicação concreta antes de contar com retorno.',
    Energia: 'Uma mão aponta o propósito; a outra, o chão. Concentre seu impulso numa tarefa que conecte ideia e gesto, sem tentar ativar tudo de uma vez.',
    Saúde: 'No autocuidado, ter muitos recursos não substitui constância. Escolha uma prática acessível, observe como responde e ajuste sem prometer resultado ao corpo.',
  },
  'major-02': {
    Amor: 'Entre as duas colunas, a Sacerdotisa protege o que ainda não foi dito. Observe silêncios e peça contexto antes de preencher lacunas com suposições.',
    Carreira: 'O rolo meio escondido sugere informação incompleta. Reúna o dado que falta e preserve sua leitura interna antes de anunciar uma decisão profissional.',
    Dinheiro: 'Nem toda condição está visível nesta negociação. Leia detalhes, espere a informação pendente e diferencie intuição de uma vantagem ainda não comprovada.',
    Energia: 'A guardiã sentada não desperdiça movimento. Um intervalo sem estímulo pode mostrar qual demanda merece atenção e qual só ocupa ruído.',
    Saúde: 'Esta carta favorece escuta cuidadosa, não autodiagnóstico. Registre sinais e limites percebidos; diante de preocupação, leve fatos a um profissional qualificado.',
  },
  'major-03': {
    Amor: 'No campo de trigo, afeto cresce por presença continuada. Veja se o cuidado circula entre os dois ou se alguém virou fonte exclusiva do vínculo.',
    Carreira: 'A Imperatriz fala de trabalho que precisa de cultivo, não de pressa. Proteja tempo para criar e defina o que significa maturar esta entrega.',
    Dinheiro: 'Abundância aqui começa em fazer render o que já existe. Nutra um recurso produtivo e evite confundir generosidade com sustentar tudo sozinho.',
    Energia: 'O campo fértil pede alternância entre produzir e receber. Recolha energia para algo seu antes que cuidar de todas as demandas seque sua criatividade.',
    Saúde: 'Na rotina de bem-estar, a imagem convida a sustento básico e gentileza consigo. Escolha cuidado possível, sem transformar produtividade em medida do corpo.',
  },
  'major-04': {
    Amor: 'O trono de pedra pergunta quais limites dão segurança ao vínculo e quais viraram comando. Nomeie uma regra que proteja ambos sem controlar o outro.',
    Carreira: 'O Imperador favorece responsabilidade visível: escopo, prazo e autoridade precisam estar claros. Estruture o trabalho antes de exigir que ele se sustente.',
    Dinheiro: 'Montanha seca e pedra pedem base, não aparência de controle. Organize obrigações fixas e margem de decisão antes de assumir um compromisso novo.',
    Energia: 'Estrutura pode poupar força quando reduz decisões repetidas. Monte uma moldura simples para o dia, deixando espaço suficiente para não virar rigidez.',
    Saúde: 'No autocuidado, disciplina útil é a que cabe na vida real. Crie um apoio estável e revisável, sem punir o corpo quando a rotina precisar mudar.',
  },
  'major-05': {
    Amor: 'Diante do mestre e dos discípulos, examine quais regras de relacionamento foram herdadas. Mantenha apenas as que ainda representam os valores do casal.',
    Carreira: 'As chaves aos pés do Hierofante apontam acesso por aprendizado. Procure orientação experiente, mas entenda o método antes de adotá-lo como regra.',
    Dinheiro: 'Conselho especializado pode esclarecer uma decisão, desde que a autoridade tenha competência e interesse transparentes. Não terceirize a escolha junto com a dúvida.',
    Energia: 'Um ritual conhecido pode reduzir dispersão. Reaproveite uma prática que já deu contorno ao dia, sem obedecer por hábito ao que perdeu sentido.',
    Saúde: 'Esta lente valoriza orientação responsável e rotina compreensível. Para questões clínicas, prefira profissional habilitado; tradição simbólica não substitui avaliação de saúde.',
  },
  'major-06': {
    Amor: 'Sob o anjo, os Enamorados mostram o instante anterior à escolha. A pergunta central é se desejo, acordo e valores apontam para o mesmo vínculo.',
    Carreira: 'Duas possibilidades pedem mais que comparação de vantagens. Escolha a rota que sustenta seus valores profissionais, aceitando o que ficará para trás.',
    Dinheiro: 'Esta decisão financeira expõe prioridades concorrentes. Antes de escolher, diga qual valor cada opção protege e qual custo nenhuma delas elimina.',
    Energia: 'Energia dividida entre duas direções perde força no meio. Nomeie o conflito de valores e dê presença inteira a uma escolha por vez.',
    Saúde: 'No bem-estar, o alinhamento importa mais que a regra perfeita. Opte por um cuidado compatível com seus limites, apoio disponível e orientação apropriada.',
  },
  'major-07': {
    Amor: 'As esfinges puxam para lados opostos enquanto o condutor sustenta a direção. Conversem sobre o rumo comum antes de acelerar a relação.',
    Carreira: 'O Carro concentra forças rivais numa meta. Defina um destino profissional mensurável e coordene as frentes, evitando transformar velocidade em progresso.',
    Dinheiro: 'Impulso sem direção pode movimentar muito e avançar pouco. Dê um objetivo a cada gasto relevante e revise os que puxam contra sua prioridade.',
    Energia: 'Há potência disponível, mas ela precisa de rumo. Escolha um ponto de chegada para hoje e conduza tensões internas sem tentar esmagá-las.',
    Saúde: 'No autocuidado, intensidade não é sinônimo de adequação. Ajuste o ritmo aos seus sinais e condições, especialmente quando duas exigências competirem.',
  },
  'major-08': {
    Amor: 'A mulher toca o leão sem violência. Uma conversa firme e gentil pode revelar se a relação acolhe limites ou só responde à pressão.',
    Carreira: 'A Força favorece influência sem confronto bruto. Sustente sua posição com preparo e paciência, especialmente diante de uma reação defensiva.',
    Dinheiro: 'Domínio aqui não é apertar até romper; é conter o impulso sem negá-lo. Crie uma pausa entre vontade de comprar e decisão.',
    Energia: 'A imagem propõe regular potência, não apagá-la. Canalize a intensidade para uma ação precisa e deixe a força bruta fora da agenda.',
    Saúde: 'Gentileza e firmeza podem coexistir numa rotina de cuidado. Respeite desconfortos e progressão individual, sem usar esforço extremo como prova de valor.',
  },
  'major-09': {
    Amor: 'A lanterna ilumina só o próximo passo. Um tempo de recolhimento pode esclarecer o vínculo, desde que não vire desaparecimento sem conversa.',
    Carreira: 'O Eremita troca exposição por investigação. Reserve espaço para aprofundar uma competência e volte com uma pergunta mais precisa, não apenas com distância.',
    Dinheiro: 'Antes de seguir o movimento alheio, examine seus próprios números. A lanterna pede uma revisão discreta e focada no próximo compromisso.',
    Energia: 'Reduzir ruído pode devolver direção ao dia. Escolha um intervalo deliberado e um momento de retorno, para que retiro não se transforme em isolamento.',
    Saúde: 'Escuta interna pode apoiar o autocuidado, mas não precisa ser solitária. Se algo preocupa, organize o que percebeu e peça ajuda específica.',
  },
  'major-10': {
    Amor: 'A roda convida a reconhecer o ciclo do vínculo: aproximação, distância, reparo ou repetição. Procure onde sua resposta ainda pode mudar a volta.',
    Carreira: 'Mudanças de contexto alteram sua posição na roda. Diferencie o que não controla da habilidade que pode preparar para a próxima abertura.',
    Dinheiro: 'Oscilação pede margem e leitura de ciclo, não aposta em sorte. Observe padrões de entrada e saída antes de reagir ao giro do momento.',
    Energia: 'Nem todo dia ocupa o mesmo ponto da roda. Ajuste expectativa ao momento e preserve uma ação pequena que atravesse a variação.',
    Saúde: 'Rotinas também passam por ciclos. Registre o que muda, adapte o cuidado com prudência e procure avaliação profissional quando houver sinal persistente ou preocupante.',
  },
  'major-11': {
    Amor: 'Espada e balança pedem verdade com medida. Separe fato, interpretação e responsabilidade de cada pessoa antes de buscar um veredito sobre o vínculo.',
    Carreira: 'A Justiça favorece critérios explícitos. Documente entregas, acordos e consequências para que uma decisão profissional não dependa apenas de impressão.',
    Dinheiro: 'Coloque valores, prazos e obrigações na balança real. Assine somente depois de entender a contrapartida e sua parte na conta.',
    Energia: 'O desequilíbrio fica mais legível quando o dia é visto sem julgamento. Compare demanda e capacidade e retire uma obrigação que não cabe.',
    Saúde: 'Nesta lente de bem-estar, evidência vale mais que culpa. Observe dados e contexto; dúvidas clínicas pertencem a uma avaliação qualificada, não à carta.',
  },
  'major-12': {
    Amor: 'O Enforcado muda a visão ao suspender o movimento. Pare de forçar uma resposta e veja o vínculo pelo lugar que você costuma ignorar.',
    Carreira: 'Insistir no mesmo ângulo aperta o nó profissional. Use a pausa para revisar premissa, custo de espera e o que precisa ser entregue.',
    Dinheiro: 'Uma decisão suspensa ainda tem custo. Antes de destravá-la, mude o ponto de vista e identifique o sacrifício embutido em cada opção.',
    Energia: 'Hoje, parar pode ser trabalho legítimo. Solte uma insistência e observe qual perspectiva aparece quando a urgência deixa de comandar.',
    Saúde: 'Pausa não precisa significar abandono do cuidado. Adapte a exigência ao que é seguro agora e busque orientação se a limitação persistir.',
  },
  'major-13': {
    Amor: 'A Morte fala de uma forma de vínculo que terminou, não de morte literal. Reconheça o encerramento antes de tentar renomeá-lo como continuidade.',
    Carreira: 'O sol entre as torres aparece depois da passagem. Feche uma função, método ou ciclo esgotado para liberar atenção ao que pode ser reconstruído.',
    Dinheiro: 'Um compromisso antigo talvez já não sustente seu propósito. Encerre com clareza, calcule consequências e evite financiar algo apenas porque começou.',
    Energia: 'Segurar um ciclo encerrado consome a força da transição. Escolha um gesto concreto de fechamento e preserve espaço para o próximo ritmo.',
    Saúde: 'Aqui, transformação é metáfora de rotina, nunca prognóstico. Abandone um hábito inviável com apoio adequado e substitua-o por um cuidado possível.',
  },
  'major-14': {
    Amor: 'O líquido passa entre duas taças aos poucos. Ajustes pequenos e recíprocos podem mostrar a medida do encontro melhor que uma grande declaração.',
    Carreira: 'Temperança combina recursos sem apagar diferenças. Integre duas competências em etapas e avalie a mistura antes de ampliar o projeto.',
    Dinheiro: 'A carta favorece proporção: quanto entra, quanto sai e quanto permanece disponível. Corrija um excesso específico em vez de redesenhar tudo.',
    Energia: 'Um pé na água e outro na terra pedem transição gradual. Alterne esforço e recuperação, observando qual dose mantém o dia habitável.',
    Saúde: 'Moderação aqui orienta rotina, não prescrição. Faça mudanças graduais dentro de seus limites e leve necessidades específicas a um profissional adequado.',
  },
  'major-15': {
    Amor: 'As correntes estão largas o bastante para sair, mas também oferecem algo em troca. Nomeie o ganho oculto que mantém este padrão afetivo.',
    Carreira: 'O Diabo expõe um acordo que prende por recompensa imediata. Avalie qual vantagem sustenta a dependência e qual limite recuperaria escolha.',
    Dinheiro: 'Desejo, dívida ou status pode ter virado corrente. Torne visível o benefício que alimenta o hábito antes de negociar uma saída realista.',
    Energia: 'Um impulso recorrente ocupa mais espaço quando permanece sem nome. Observe gatilho, recompensa e custo, escolhendo uma corrente possível de afrouxar.',
    Saúde: 'A carta pode refletir apego a uma rotina, não diagnóstico ou culpa. Busque apoio apropriado para padrões que pareçam difíceis de mudar sozinho.',
  },
  'major-16': {
    Amor: 'O raio não cria a rachadura; ele a revela. Diga qual estrutura do vínculo deixou de sustentar verdade, segurança ou respeito.',
    Carreira: 'A coroa cai de uma torre já frágil. Proteja pessoas e trabalho essencial, depois reconstrua processo a partir do que resistiu ao impacto.',
    Dinheiro: 'Uma base financeira instável pede contenção antes de expansão. Identifique a fissura, reduza exposição e evite refazer a mesma estrutura com outro nome.',
    Energia: 'Depois do choque, prioridade é chão firme. Suspenda o que não é essencial e concentre presença numa única frente recuperável.',
    Saúde: 'A Torre não prevê emergência. Se houver sinal agudo ou preocupação concreta, procure atendimento; no simbólico, revise uma rotina que perdeu sustentação.',
  },
  'major-17': {
    Amor: 'Sob oito estrelas, a água é oferecida à lagoa e à terra. Reaproximação pede vulnerabilidade com reciprocidade, não fé usada para ignorar ausência.',
    Carreira: 'A Estrela aparece após uma ruptura e trabalha em escala paciente. Retome uma ambição por meio de evidência pequena, pública e consistente.',
    Dinheiro: 'Esperança financeira ganha chão quando vira gesto repetível. Direcione um recurso modesto ao que ainda funciona e acompanhe sem fantasiar retorno.',
    Energia: 'As duas jarras mostram reposição distribuída. Escolha uma fonte concreta de inspiração e alimente também a rotina que permite sustentá-la.',
    Saúde: 'Nesta leitura de autocuidado, a água sugere continuidade e atenção básica. Valorize pequenos apoios reais, sem atribuir efeito clínico ao símbolo.',
  },
  'major-18': {
    Amor: 'Entre cão e lobo, o caminho existe, mas a luz distorce contornos. Evite decidir pela ansiedade; peça clareza sobre o que está ambíguo.',
    Carreira: 'A Lua sinaliza cenário incompleto, rumores ou medo projetado. Separe o que foi confirmado do que sua imaginação preencheu antes de mudar de rota.',
    Dinheiro: 'Números nebulosos não ficam seguros por intuição. Adie o compromisso, confira condições e peça outro olhar para aquilo que parece bom demais.',
    Energia: 'O caminho noturno pede passo menor e menos estímulo. Nomeie um medo verificável e deixe o restante sem conclusão até haver luz.',
    Saúde: 'Sensações merecem atenção, mas a carta não as explica. Registre contexto e procure orientação profissional para sintomas, sem transformar medo em diagnóstico.',
  },
  'major-19': {
    Amor: 'A criança sob o sol convida a um afeto visível e descomplicado. Diga o que aprecia e veja se a alegria pode existir sem performance.',
    Carreira: 'Girassóis voltados para a luz favorecem reconhecimento claro. Mostre uma entrega concreta e permita que seu valor seja compreendido sem excesso de ornamento.',
    Dinheiro: 'Clareza pode ser mais valiosa que uma oportunidade brilhante. Simplifique números, exponha custos e escolha o que continua bom quando visto por inteiro.',
    Energia: 'O Sol amplia o que está presente. Use a disposição numa atividade simples e compartilhável, sem transformar entusiasmo em agenda impossível.',
    Saúde: 'Bem-estar não precisa virar espetáculo. Observe o que traz vitalidade de modo sustentável e respeite sinais que peçam ajuste ou avaliação.',
  },
  'major-20': {
    Amor: 'A trombeta chama para responder ao que ficou pendente. Reavalie uma decisão afetiva pelo que aprendeu, sem reduzir ninguém ao erro antigo.',
    Carreira: 'O Julgamento separa avaliação de condenação. Revise sua trajetória, reconheça evidências de mudança e responda ao trabalho que ainda faz sentido.',
    Dinheiro: 'Uma escolha passada retorna para prestação de contas. Corrija o que puder com números atuais, sem deixar vergonha substituir planejamento.',
    Energia: 'O chamado ganha forma quando vira resposta. Escolha uma pendência que merece retorno e trate a autocrítica como dado, não identidade.',
    Saúde: 'Revisar hábitos pode ser útil sem julgamento moral. Considere apoio profissional para decisões de saúde e avalie comportamentos, não seu valor pessoal.',
  },
  'major-21': {
    Amor: 'Dentro da coroa de louros, o ciclo pede reconhecimento completo. Celebre o que o vínculo realizou e nomeie o que precisa fechar antes de recomeçar.',
    Carreira: 'O Mundo reúne partes antes dispersas numa entrega concluída. Finalize o detalhe restante e registre o aprendizado antes de abrir outra frente.',
    Dinheiro: 'Conclusão financeira inclui conferência, quitação e reserva para transição. Feche a conta inteira antes de tratar o próximo objetivo como disponível.',
    Energia: 'A dança dentro da coroa mostra movimento com contorno. Complete uma tarefa aberta e deixe o encerramento devolver espaço mental.',
    Saúde: 'Integração, nesta lente, significa olhar rotina e apoio como conjunto. Reconheça progresso possível e revise o que falta sem exigir perfeição corporal.',
  },
};

export default pack;
