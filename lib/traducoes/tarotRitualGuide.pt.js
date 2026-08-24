const tarotRitualGuidePt = {
  themes: {
    love: {
      label: 'Amor',
      focuses: {
        'new-bond': {
          label: 'Abrir espaço para um novo vínculo',
          suggestedQuestion: 'O que pode me ajudar a reconhecer e construir uma conexão recíproca?',
          acknowledgement: 'Você não está buscando apenas alguém; está buscando clareza para não se perder no começo.',
          plan: 'Vamos observar o que ainda acompanha você, o que está disponível agora e uma possibilidade de avanço.',
          cta: 'Quero enxergar esse começo',
        },
        'mutuality-boundaries': {
          label: 'Entender reciprocidade e limites',
          suggestedQuestion: 'O que preciso observar para equilibrar entrega, reciprocidade e limites nesta relação?',
          acknowledgement: 'Você quer cuidar do vínculo com reciprocidade e limites claros, sem deixar suas próprias necessidades fora da conversa.',
          plan: 'Vamos separar a situação atual, a tensão que pede nome e um próximo passo possível entre vocês.',
          cta: 'Quero clareza sobre o vínculo',
        },
        'closure-renewal': {
          label: 'Distinguir encerramento de renovação',
          suggestedQuestion: 'O que esta fase revela sobre encerrar, transformar ou renovar este vínculo?',
          acknowledgement: 'Uma relação pode pedir mudança antes de oferecer uma resposta simples sobre ficar ou partir.',
          plan: 'Vamos reconhecer o cenário, o ponto que não pode mais ser evitado e a ação mais honesta para agora.',
          cta: 'Quero olhar para esta virada',
        },
      },
    },
    career: {
      label: 'Carreira',
      focuses: {
        'direction-purpose': {
          label: 'Recuperar direção e propósito',
          suggestedQuestion: 'Que fio conecta minha experiência, meu momento atual e a direção profissional que faz sentido?',
          acknowledgement: 'Você quer uma direção que use o que já construiu sem obrigar você a permanecer no automático.',
          plan: 'Vamos ligar aprendizados anteriores, prioridades presentes e uma possibilidade concreta de desenvolvimento.',
          cta: 'Quero reencontrar minha direção',
        },
        'visibility-growth': {
          label: 'Ganhar visibilidade e crescer',
          suggestedQuestion: 'O que pode fortalecer meu reconhecimento sem me afastar da forma como quero trabalhar?',
          acknowledgement: 'Crescer não é apenas aparecer mais; é tornar seu valor compreensível sem se diminuir.',
          plan: 'Vamos mapear sua posição, o atrito que limita sua visibilidade e um movimento que você pode testar.',
          cta: 'Quero tornar meu valor visível',
        },
        'decision-transition': {
          label: 'Escolher diante de uma transição',
          suggestedQuestion: 'O que devo considerar antes de decidir meu próximo movimento profissional?',
          acknowledgement: 'Você não precisa decidir no escuro nem esperar certeza absoluta para começar a se mover.',
          plan: 'Vamos delimitar o cenário, a tensão entre as opções e o próximo passo reversível que traz informação.',
          cta: 'Quero avaliar meu próximo movimento',
        },
      },
    },
    money: {
      label: 'Dinheiro',
      focuses: {
        'stability-habits': {
          label: 'Construir estabilidade com novos hábitos',
          suggestedQuestion: 'Que padrão financeiro merece ser revisto para eu construir mais estabilidade?',
          acknowledgement: 'Você está buscando chão, não uma promessa rápida; isso começa por enxergar o padrão inteiro.',
          plan: 'Vamos relacionar hábitos anteriores, escolhas atuais e uma possibilidade de organização sustentável.',
          cta: 'Quero reconhecer meu padrão',
        },
        'opportunity-choice': {
          label: 'Avaliar uma oportunidade',
          suggestedQuestion: 'O que preciso ponderar para avaliar esta oportunidade financeira com mais consciência?',
          acknowledgement: 'Uma boa decisão considera entusiasmo e custo, sem transformar desejo em garantia.',
          plan: 'Vamos esclarecer a proposta, a tensão entre ganho e risco e uma verificação prática antes de agir.',
          cta: 'Quero pesar esta oportunidade',
        },
        'value-boundaries': {
          label: 'Rever valor, trocas e limites',
          suggestedQuestion: 'Onde preciso alinhar meu valor, minhas trocas e meus limites materiais?',
          acknowledgement: 'Cobrar, oferecer, receber e dizer não podem tocar a mesma questão de valor pessoal.',
          plan: 'Vamos nomear a troca atual, o desequilíbrio que pede atenção e um limite aplicável no cotidiano.',
          cta: 'Quero alinhar valor e limite',
        },
      },
    },
    energy: {
      label: 'Energia',
      focuses: {
        'overload-drain': {
          label: 'Entender sobrecarga e dispersão',
          suggestedQuestion: 'O que está consumindo minha energia e qual ajuste merece prioridade?',
          acknowledgement: 'Cansaço e dispersão podem ser sinais de prioridades competindo pelo mesmo espaço.',
          plan: 'Vamos identificar o cenário, a fonte de atrito e uma redução concreta que devolva margem ao seu dia.',
          cta: 'Quero localizar o que me drena',
        },
        'rhythm-recovery': {
          label: 'Retomar um ritmo sustentável',
          suggestedQuestion: 'Que mudança de ritmo pode me ajudar a recuperar presença sem forçar produtividade?',
          acknowledgement: 'Recuperar ritmo não significa acelerar; às vezes significa voltar a caber na própria rotina.',
          plan: 'Vamos observar o ritmo aprendido, a necessidade presente e uma possibilidade mais sustentável adiante.',
          cta: 'Quero reconstruir meu ritmo',
        },
        'motivation-focus': {
          label: 'Reacender motivação e foco',
          suggestedQuestion: 'O que pode transformar intenção dispersa em um foco que eu consiga sustentar?',
          acknowledgement: 'Motivação costuma ganhar força quando a próxima ação fica menor e mais nítida.',
          plan: 'Vamos separar o ponto de partida, o ruído que fragmenta sua atenção e uma ação curta para experimentar.',
          cta: 'Quero escolher meu foco',
        },
      },
    },
    wellbeing: {
      label: 'Bem-estar',
      focuses: {
        'emotional-balance': {
          label: 'Compreender meu equilíbrio emocional',
          suggestedQuestion: 'O que minhas emoções estão pedindo que eu reconheça e acolha neste momento?',
          acknowledgement: 'Você pode escutar o que sente sem transformar cada emoção em uma ordem ou julgamento.',
          plan: 'Vamos relacionar o contexto emocional, a necessidade presente e uma possibilidade de cuidado cotidiano.',
          cta: 'Quero escutar meu momento',
        },
        'self-care-boundaries': {
          label: 'Proteger autocuidado e limites',
          suggestedQuestion: 'Que limite pode abrir espaço para um cuidado mais consistente comigo?',
          acknowledgement: 'Autocuidado também aparece nas escolhas que protegem tempo, atenção e disponibilidade.',
          plan: 'Vamos reconhecer a demanda atual, o ponto em que você se ultrapassa e um limite pequeno para praticar.',
          cta: 'Quero abrir espaço para cuidado',
        },
        'support-next-step': {
          label: 'Identificar apoio e próximo passo',
          suggestedQuestion: 'Que tipo de apoio e qual próximo passo podem tornar este momento mais atravessável?',
          acknowledgement: 'Pedir apoio não diminui sua autonomia; pode tornar o próximo passo mais seguro e possível.',
          plan: 'Vamos nomear a situação, o que dificulta atravessá-la e uma forma concreta de buscar suporte.',
          cta: 'Quero reconhecer meu apoio',
        },
      },
    },
  },
  spreads: {
    'past-present-future': {
      label: 'Origem · Agora · Possibilidade',
      description: 'Uma leitura de continuidade para perceber influências, presença e direção sem tratar o futuro como certeza.',
      positions: [
        { id: 'past', role: 'context', label: 'Origem', prompt: 'O contexto anterior que ainda influencia este tema.' },
        { id: 'present', role: 'focus', label: 'Agora', prompt: 'O ponto que pede atenção no momento presente.' },
        { id: 'future', role: 'possibility', label: 'Possibilidade', prompt: 'Uma direção possível e o que pode aproximar você dela.' },
      ],
    },
    'situation-tension-next-step': {
      label: 'Situação · Tensão · Próximo passo',
      description: 'Uma leitura orientada à decisão para separar o que acontece, o que aperta e o que pode ser feito.',
      positions: [
        {
          id: 'situation', role: 'context', label: 'Situação', prompt: 'O cenário como ele se apresenta agora.',
          interpretationFrame: 'Leia esta carta como o campo visível da questão: o que já está operando, antes de presumir causa ou culpa.',
        },
        {
          id: 'tension', role: 'tension', label: 'Tensão', prompt: 'A necessidade, dinâmica ou limite que pede cuidado.',
          interpretationFrame: 'Aqui, a carta ocupa o atrito: o que compete, aperta ou pede um limite dentro desse cenário.',
        },
        {
          id: 'next-step', role: 'action', label: 'Próximo passo', prompt: 'Uma ação pequena e possível para seguir com mais consciência.',
          interpretationFrame: 'Aqui, a carta vira experimento: um gesto pequeno que pode produzir informação, não uma previsão.',
        },
      ],
    },
  },
  signs: {
    aries: { label: 'Áries', text: 'Use sua iniciativa como ponto de partida, mas deixe uma pausa antes da primeira reação.' },
    taurus: { label: 'Touro', text: 'Observe o que oferece segurança sem transformar permanência em obrigação.' },
    gemini: { label: 'Gêmeos', text: 'Separe curiosidade de dispersão e dê nome à pergunta que realmente importa agora.' },
    cancer: { label: 'Câncer', text: 'Acolha o que você sente e diferencie cuidado genuíno de assumir tudo sozinho.' },
    leo: { label: 'Leão', text: 'Perceba onde sua presença quer brilhar e onde a validação externa pesa demais.' },
    virgo: { label: 'Virgem', text: 'Use seu olhar para detalhes a favor do próximo passo, sem exigir uma solução perfeita.' },
    libra: { label: 'Libra', text: 'Considere os dois lados e depois identifique o critério que torna a escolha mais sua.' },
    scorpio: { label: 'Escorpião', text: 'Aproxime-se do que é intenso com honestidade, respeitando o ritmo da transformação.' },
    sagittarius: { label: 'Sagitário', text: 'Mantenha a visão ampla, mas escolha uma experiência concreta que possa testar.' },
    capricorn: { label: 'Capricórnio', text: 'Reconheça a responsabilidade que é sua e solte a cobrança que não precisa carregar.' },
    aquarius: { label: 'Aquário', text: 'Escute a ideia diferente sem perder de vista o vínculo e o impacto humano.' },
    pisces: { label: 'Peixes', text: 'Confie na sensibilidade como sinal de atenção e traduza-a em um limite ou gesto claro.' },
  },
  disclosures: {
    method: 'Este guia é montado por regras fixas a partir das escolhas feitas; não é uma resposta gerada por IA.',
    randomness: 'O foco e o signo não escolhem nem trocam as cartas; o sorteio continua aleatório.',
    sign: 'O signo solar entra apenas como uma lente contemporânea de reflexão, sem alterar cartas ou significados.',
    future: 'A terceira posição mostra uma possibilidade e um próximo passo, nunca uma garantia sobre o futuro.',
    wellbeing: 'Em bem-estar, a leitura oferece reflexão e não substitui orientação médica, psicológica ou de outro profissional qualificado.',
  },
};

export default tarotRitualGuidePt;
