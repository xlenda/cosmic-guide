// O botão de locução fica centralizado neste componente porque sete telas o
// reutilizam. A versão anterior dependia da Web Speech API: mesmo escolhendo
// a melhor voz instalada, a qualidade ainda variava por aparelho e foi
// confirmada como robótica em produção.
//
// Até existir um provedor neural no backend, renderizar nada é a única saída
// honesta: não há botão morto e não há promessa de qualidade que o código não
// consegue garantir. Quando a credencial de voz existir, a integração volta
// aqui e todas as telas passam a recebê-la juntas.
export default function BotaoOuvir() {
  return null;
}
