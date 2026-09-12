/* A ESCADA DO DEGELO (11/09) — o degrau de cada missao de contato.
 *
 * As 105 missoes com precisaContato=true nao sao equivalentes: mandar uma frase
 * gentil num post publico e um risco; convidar para um cafe e outro. Entregues
 * em ordem aleatoria, a pessoa recebe o convite antes de ter reaberto o canal —
 * e o convite cai no vazio.
 *
 * Aqui elas ficam ordenadas do degrau mais leve ao de coragem real. Tres lentes
 * independentes (exposicao, iniciativa, palco) classificaram cada uma, e o
 * degrau final e a mediana dos tres votos.
 *
 * OS NOVE DEGRAUS:
 *   1. Aparecer sem bater na porta
 *   2. A primeira frase em terreno neutro
 *   3. Sinal de vida, sem pergunta
 *   4. Uma pergunta, a espera inteira
 *   5. Estar junto na conversa
 *   6. Dizer o que é bom
 *   7. Palavra que se cumpre
 *   8. Cuidado com endereço
 *   9. O convite com porta de saída
 *
 * REGRA QUE NAO SE DOBRA: nada disto sai para quem esta em contato duro. O
 * filtro de lib/missaoDoDia.js continua sendo a primeira porta — a escada so
 * existe depois dele.
 */
export const DEGRAU_POR_MISSAO = Object.freeze({
  /* 1 — Aparecer sem bater na porta (3) */
  "Comentário sobre o conteúdo": 1,
  "Reação de um toque": 1,
  "Uma frase gentil no post": 1,
  /* 2 — A primeira frase em terreno neutro (6) */
  "Leveza na resposta": 2,
  "Logística como pretexto honesto": 2,
  "Novidade em comum": 2,
  "Parabéns de uma frase": 2,
  "Resposta ao story": 2,
  "Resposta curta e calma": 2,
  /* 3 — Sinal de vida, sem pergunta (11) */
  "Bom dia com detalhe": 3,
  "Compartilhe algo leve": 3,
  "Correio de interesse": 3,
  "Envio leve": 3,
  "Foto do caminho": 3,
  "Foto sem pergunta": 3,
  "Janela do cotidiano": 3,
  "Ponte de uma linha": 3,
  "Trinta segundos de voz": 3,
  "Vi isso e lembrei": 3,
  "Áudio de 30 segundos": 3,
  /* 4 — Uma pergunta, a espera inteira (12) */
  "A pergunta do detalhe": 4,
  "A pergunta que lembra": 4,
  "Cinco minutos de escuta": 4,
  "Como foi?": 4,
  "Mensagem que termina em pergunta": 4,
  "Pedido de recomendação": 4,
  "Pedir o olhar": 4,
  "Pergunta leve e aberta": 4,
  "Pergunta sobre o dia": 4,
  "Pergunta sobre o projeto": 4,
  "Perguntar em vez de presumir": 4,
  "Uma pergunta, espera inteira": 4,
  /* 5 — Estar junto na conversa (21) */
  "A despedida por inteiro": 5,
  "A segunda pergunta": 5,
  "Com as minhas palavras": 5,
  "Deixa eu ver se entendi": 5,
  "Dois minutos sem interromper": 5,
  "Encerre no ponto bom": 5,
  "Entendi, e...": 5,
  "Espelho de ritmo": 5,
  "Faz sentido, antes do seu ponto": 5,
  "Fechar o assunto aberto": 5,
  "Gancho pra depois": 5,
  "O assunto favorito": 5,
  "O manual dessa pessoa": 5,
  "Releia antes de responder": 5,
  "Reler antes de responder": 5,
  "Responda no seu tempo": 5,
  "Resposta clara": 5,
  "Sair no ponto alto": 5,
  "Três segundos": 5,
  "Valide antes de opinar": 5,
  "Zero ironia hoje": 5,
  /* 6 — Dizer o que é bom (16) */
  "Agradecimento concreto": 6,
  "Agradecimento fora de época": 6,
  "Elogio ao feito": 6,
  "Elogio ao feito, sem anzol": 6,
  "Elogio ao que foi dito": 6,
  "Elogio com endereço": 6,
  "Elogio na hora, ao vivo": 6,
  "Gratidão com data": 6,
  "Gratidão específica": 6,
  "Memória boa, ponto final": 6,
  "Nomear a constância": 6,
  "O bastidor gentil": 6,
  "O esforço que ninguém vê": 6,
  "Obrigado com nome e data": 6,
  "Presença no dia D": 6,
  "Reconhecer a palavra cumprida": 6,
  /* 7 — Palavra que se cumpre (18) */
  "A demora assumida": 7,
  "A entrega certeira": 7,
  "A promessa esquecida": 7,
  "A régua de confiança": 7,
  "Ajuda de escopo fechado": 7,
  "Ajuda miúda": 7,
  "Aviso antes do atraso": 7,
  "Aviso dado, aviso cumprido": 7,
  "Check-in de cinco minutos": 7,
  "Chego às...": 7,
  "Combinado por escrito": 7,
  "Confirmação de véspera": 7,
  "Devolução com bilhete": 7,
  "Na hora combinada": 7,
  "O aviso antes do atraso": 7,
  "O combinado da semana": 7,
  "Prometido, entregue": 7,
  "Tarefa pequena, prazo claro": 7,
  /* 8 — Cuidado com endereço (4) */
  "Agrado de bolso": 8,
  "Cumprimento de corpo presente": 8,
  "O doce favorito": 8,
  "Presença inteira": 8,
  /* 9 — O convite com porta de saída (13) */
  "Convite com hora de acabar": 9,
  "Convite de dia claro": 9,
  "Convite de duas portas": 9,
  "Convite de porta aberta": 9,
  "Convite de tarefa comum": 9,
  "Correção da história": 9,
  "Data no lugar do 'qualquer dia'": 9,
  "Desculpa com data": 9,
  "Fato, sentimento, pedido": 9,
  "O erro com nome e sobrenome": 9,
  "O não dito com respeito": 9,
  "Pergunta corajosa": 9,
  "Um erro, nomeado": 9,
});

/** Quantos degraus a escada tem. */
export const DEGRAUS_DA_ESCADA = 9;

/** O degrau de uma missao, ou 0 quando ela nao pede contato. */
export function degrauDaMissao(missao) {
  if (!missao || typeof missao.titulo !== 'string') return 0;
  return DEGRAU_POR_MISSAO[missao.titulo] || 0;
}
