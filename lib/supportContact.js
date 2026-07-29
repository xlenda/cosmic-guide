// Canais de contato do app, num lugar só.
//
// Por que este arquivo existe: o endereço de suporte estava escrito à mão em 3
// telas (Ajuda, Privacidade, Termos), no ErrorBoundary e em 4 textos do
// dicionário. Trocar o canal significava caçar 12 ocorrências — e enquanto uma
// escapasse, alguém continuaria escrevendo pro lugar errado.
//
// ⚠️ ESTADO REAL DO E-MAIL (verificado em 29/07/2026, via dig no servidor):
// o domínio cosmicguide.cloud NÃO TEM registro MX nenhum. Sem MX, o servidor
// de quem escreve cai no fallback do RFC 5321 (tenta o registro A, que aponta
// pra Vercel, 76.76.21.21) — e a Vercel não fala SMTP na porta 25. Resultado:
// toda mensagem enviada pra cá volta como não entregue, e volta DEPOIS de
// horas ou dias de retentativa, quando a pessoa já desistiu. Também não há
// SPF (TXT vazio), então mesmo depois de criar a caixa, o que sair daqui cai
// em spam até publicar o SPF.
//
// Enquanto o MX não existir, o botão "Escrever para o suporte" é uma porta
// pintada na parede. O passo a passo exato pra abrir a porta está no relatório
// entregue ao dono (item "a") — são 3 registros DNS no painel onde o domínio
// está hospedado.
//
// Assim que a caixa existir, este arquivo é o ÚNICO lugar a mudar se o
// endereço mudar (as telas passaram a renderizar a constante em vez do texto
// solto). Ficam de fora, por serem de outro time/append-only: o
// components/ErrorBoundary.js e os textos profile.delete/profile.recover.* do
// lib/i18n.js.
export const SUPPORT_EMAIL = 'contato@cosmicguide.cloud';

export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;

// Área do comprador na Hotmart — é AQUI que uma assinatura do Cosmic Guide se
// cancela de verdade. A cobrança é recorrente e quem a processa é a Hotmart
// (ver HOTMART_PAY_URLS em screens/PlanosScreen.js): o app não tem, e não pode
// ter, um botão que interrompa a renovação. A pessoa entra com o MESMO e-mail
// que usou na compra, abre "Minhas compras" e cancela a assinatura por lá.
export const HOTMART_BUYER_AREA_URL = 'https://consumidor.hotmart.com';
