// DENTRO DE UMA ABA? — o contexto que apaga o cabeçalho repetido (10/09/2026)
//
// O problema que ele resolve: as telas "Nós Hoje" e "Nossa História" montam as
// seis telas antigas em abas. Cada uma dessas seis desenha o próprio
// GradientHeader com título e seta de voltar — então a pessoa via DOIS
// cabeçalhos empilhados e DUAS setas, e a de baixo saía da porta inteira
// quando ela só queria trocar de aba.
//
// Por que contexto e não prop: a prop teria que ser lida por cada uma das seis
// telas e repassada até o GradientHeader — doze pontos de edição, e doze
// chances de esquecer um. Foi exatamente o que aconteceu na primeira tentativa:
// `dentroDeAba` era passada e nenhuma das seis lia. O contexto atravessa a
// árvore sozinho: quem hospeda declara, o GradientHeader lê, e nenhuma das
// telas do meio precisa saber que isso existe.
//
// Fora de uma aba o valor é `false`, então toda tela aberta por rota direta
// continua com seu cabeçalho igual a sempre — link salvo e deep link não mudam.
import React, { createContext, useContext } from 'react';

const AbaContext = createContext(false);

export function DentroDeAba({ children }) {
  return <AbaContext.Provider value>{children}</AbaContext.Provider>;
}

export function useDentroDeAba() {
  return useContext(AbaContext);
}
