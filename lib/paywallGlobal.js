// O INTERRUPTOR ÚNICO DE PAYWALL DO APP FUNDIDO.
//
// Por que este arquivo existe (11/09/2026, fusão da Madre Maria): o Cosmic
// decidia acesso em context/CoupleContext.js e a Madre Maria decidia em
// madremaria/lib/suscripcion.js. Dois interruptores para a mesma pergunta —
// e o dono recusou dois paywalls: "o do Cosmic manda".
//
// A Madre NÃO pode ler o contexto do Cosmic: estaSuscrito() é uma função async
// chamada de FORA do render (PlanoScreen, PerfilScreen, SintesisScreen,
// AlbumScreen, TiradaScreen, PaywallScreen), e useCouple() é um hook — não roda
// ali. Por isso a verdade compartilhada mora aqui, num módulo FOLHA: sem React,
// sem react-native, sem AsyncStorage. É o único jeito de os dois lados lerem a
// MESMA constante sem que a lib da Madre arraste a árvore de providers do
// Cosmic para dentro do `node --test`.
//
// COMO DESLIGAR A COBRANÇA: troque para false AQUI, uma vez. Isso religa o
// paywall do Cosmic (CoupleContext combina o acesso real de novo) E o da Madre
// (estaSuscrito volta a olhar a marca no disco dela). Não há segundo botão.
//
// O que conferir ao virar false está escrito nos dois consumidores:
// context/CoupleContext.js (os 5 cenários do portão E2E) e
// madremaria/lib/suscripcion.js (o áudio 11, o paywall no funil).
export const TUDO_LIBERADO = true;

export default TUDO_LIBERADO;
