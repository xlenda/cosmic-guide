// Cidade de nascimento — camada FINA sobre a busca do servidor, com reserva
// offline embutida.
//
// ===========================================================================
// O QUE MUDOU E POR QUÊ (relato real de testador, 29/07/2026)
//
//   "Mapa astral ok mas sem minha cidade Junqueirópolis."
//
// Junqueirópolis tem ~20 mil habitantes e não estava nas 400 cidades
// brasileiras que este arquivo carregava. E nunca estaria: o Brasil tem 5.570
// municípios, e lista fixa SEMPRE vai faltar alguma. Medido antes de decidir:
//
//   426 cidades (a lista antiga inteira) ....  51,6 KB crus /  10,7 KB gzip
//   5.570 municípios brasileiros ............ ~685   KB crus / ~143   KB gzip
//   o mundo inteiro (o app quer PT/ES/EN) ... impensável num import estático
//
// Então a busca foi pro SERVIDOR (GET /api/cities/search, ~150 mil cidades do
// GeoNames, custo ZERO no bundle do app) e este arquivo virou:
//
//   1. uma RESERVA OFFLINE pequena (151 cidades) pro cadastro nunca travar;
//   2. o cliente da busca remota, com debounce e cache;
//   3. a reidratação de cidade por id, incluindo os ids ANTIGOS.
//
// ===========================================================================
// O GANHO MAIOR NÃO É A COBERTURA — É O HORÁRIO DE VERÃO
//
// A lista antiga guardava `utcOffset` FIXO (São Paulo = -3, sempre) e o Brasil
// teve horário de verão até 2019. Varrendo as 48 meias-horas de um dia de
// janeiro em São Paulo com a própria ascendantSign() deste app: 120 de 240
// combinações data×hora MUDAM DE SIGNO entre -3 e -2. Metade dos nascimentos
// de horário de verão saía com o Ascendente errado.
//
// Agora toda cidade — da reserva ou do servidor — carrega `timezone` IANA
// ("America/Sao_Paulo"), e lib/timezone.js calcula o offset do INSTANTE do
// nascimento. Ver o cabeçalho de lib/timezone.js pras três decisões (hora de
// parede em duas passadas, hora inexistente/ambígua, e o que fazer quando o
// aparelho não conhece o fuso).
//
// ===========================================================================
// POR QUE A RESERVA OFFLINE EXISTE (e não é preguiça de tirar a lista)
//
// A tela de nascimento é a PORTA DE ENTRADA do app. Travar ali — spinner
// eterno, "erro de rede", lista vazia — é perder o usuário antes do primeiro
// valor entregue. Com a reserva, sem internet a pessoa ainda escolhe entre as
// 80 maiores cidades do Brasil e 71 do resto do mundo, com fuso correto, e o
// mapa sai. Com internet, o servidor assume e a reserva vira só o que aparece
// nos primeiros milissegundos enquanto a resposta não chega.
//
// CUSTO DA RESERVA: 151 cidades ≈ 21,8 KB crus / 5,0 KB gzip no fonte (a lista
// antiga de 426 pesava 51,6 KB / 10,7 KB). Ou seja, mesmo GANHANDO o campo
// `timezone` em toda linha, o bundle DIMINUI — ver os números medidos no
// relatório da tarefa.
//
// IDS: as 106 cidades que vieram da lista antiga mantêm o id antigo
// ("sao-paulo-br"), byte a byte. Isso importa por dois motivos: quem já tem
// cidade salva no aparelho não vê nada mudar, e a ponte legacy_city_ids do
// servidor (server-patches/scripts/legacy-cities.json) cobre exatamente esses
// ids. As 45 cidades novas do resto do mundo seguem o mesmo padrão de slug e
// foram acrescentadas àquele arquivo de ponte, então também resolvem lá.
// ===========================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mesmo backend do checkout, do proxy de IA e do funil (lib/coupleData.js,
// lib/aiClient.js, lib/funnel.js).
const API_BASE = 'https://api.cosmicguide.cloud';
const SEARCH_URL = `${API_BASE}/api/cities/search`;
const CITY_URL = `${API_BASE}/api/cities`;

// A licença dos dados (CC BY 4.0) EXIGE crédito visível. O rodapé do seletor
// de cidade é o lugar natural — quem renderiza é components/CityPickerModal.js.
export const CITY_ATTRIBUTION = 'Cidades: GeoNames (CC BY 4.0)';

// Quantos caracteres antes de incomodar o servidor. Espelha o MIN_QUERY_LEN da
// rota: com menos de 2 ela responde 400, então nem vale a viagem.
export const MIN_REMOTE_QUERY = 2;

// Debounce da busca-enquanto-digita. 280ms é o intervalo em que uma pessoa
// digitando "junqueiropolis" (14 teclas) dispara 1-2 requisições em vez de 14.
const DEBOUNCE_MS = 280;
// Timeout de rede: acima disso a espera já é pior que mostrar a reserva.
const TIMEOUT_MS = 8000;

// ---------------------------------------------------------------------------
// RESERVA OFFLINE — 151 cidades.
// Brasil: as 80 maiores por população (Censo 2022), com as 27 capitais dentro.
// Exterior: as 26 da América Latina que já existiam + 45 do resto do mundo.
// `timezone` é o fuso IANA; `utcOffset` continua sendo o offset PADRÃO (sem
// horário de verão), mesma semântica de sempre e mesmo campo que o servidor
// devolve — nenhum código que já lia esse campo precisou mudar.
// ---------------------------------------------------------------------------
export const CITIES = [
  // --- Brasil: as 80 maiores por população (Censo 2022), as 27 capitais
  // incluídas. Mesmos ids, mesmas coordenadas da lista antiga.
  { id: "sao-paulo-br", name: "São Paulo", admin: "SP", country: "Brasil", lat: -23.5505, lon: -46.6333, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "rio-de-janeiro-br", name: "Rio de Janeiro", admin: "RJ", country: "Brasil", lat: -22.9068, lon: -43.1729, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "brasilia-br", name: "Brasília", admin: "DF", country: "Brasil", lat: -15.7939, lon: -47.8828, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "salvador-br", name: "Salvador", admin: "BA", country: "Brasil", lat: -12.9777, lon: -38.5016, utcOffset: -3, timezone: "America/Bahia" },
  { id: "fortaleza-br", name: "Fortaleza", admin: "CE", country: "Brasil", lat: -3.7172, lon: -38.5433, utcOffset: -3, timezone: "America/Fortaleza" },
  { id: "belo-horizonte-br", name: "Belo Horizonte", admin: "MG", country: "Brasil", lat: -19.9167, lon: -43.9345, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "manaus-br", name: "Manaus", admin: "AM", country: "Brasil", lat: -3.119, lon: -60.0217, utcOffset: -4, timezone: "America/Manaus" },
  { id: "curitiba-br", name: "Curitiba", admin: "PR", country: "Brasil", lat: -25.4284, lon: -49.2733, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "recife-br", name: "Recife", admin: "PE", country: "Brasil", lat: -8.0476, lon: -34.877, utcOffset: -3, timezone: "America/Recife" },
  { id: "porto-alegre-br", name: "Porto Alegre", admin: "RS", country: "Brasil", lat: -30.0346, lon: -51.2177, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "belem-br", name: "Belém", admin: "PA", country: "Brasil", lat: -1.4558, lon: -48.4902, utcOffset: -3, timezone: "America/Belem" },
  { id: "goiania-br", name: "Goiânia", admin: "GO", country: "Brasil", lat: -16.6869, lon: -49.2648, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "guarulhos-br", name: "Guarulhos", admin: "SP", country: "Brasil", lat: -23.4538, lon: -46.5333, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "campinas-br", name: "Campinas", admin: "SP", country: "Brasil", lat: -22.9099, lon: -47.0626, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "sao-luis-br", name: "São Luís", admin: "MA", country: "Brasil", lat: -2.5307, lon: -44.3068, utcOffset: -3, timezone: "America/Fortaleza" },
  { id: "maceio-br", name: "Maceió", admin: "AL", country: "Brasil", lat: -9.6658, lon: -35.735, utcOffset: -3, timezone: "America/Maceio" },
  { id: "natal-br", name: "Natal", admin: "RN", country: "Brasil", lat: -5.7945, lon: -35.211, utcOffset: -3, timezone: "America/Fortaleza" },
  { id: "teresina-br", name: "Teresina", admin: "PI", country: "Brasil", lat: -5.0892, lon: -42.8019, utcOffset: -3, timezone: "America/Fortaleza" },
  { id: "joao-pessoa-br", name: "João Pessoa", admin: "PB", country: "Brasil", lat: -7.1195, lon: -34.845, utcOffset: -3, timezone: "America/Fortaleza" },
  { id: "aracaju-br", name: "Aracaju", admin: "SE", country: "Brasil", lat: -10.9472, lon: -37.0731, utcOffset: -3, timezone: "America/Maceio" },
  { id: "cuiaba-br", name: "Cuiabá", admin: "MT", country: "Brasil", lat: -15.6014, lon: -56.0979, utcOffset: -4, timezone: "America/Cuiaba" },
  { id: "campo-grande-br", name: "Campo Grande", admin: "MS", country: "Brasil", lat: -20.4697, lon: -54.6201, utcOffset: -4, timezone: "America/Campo_Grande" },
  { id: "florianopolis-br", name: "Florianópolis", admin: "SC", country: "Brasil", lat: -27.5954, lon: -48.548, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "vitoria-br", name: "Vitória", admin: "ES", country: "Brasil", lat: -20.3155, lon: -40.3128, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "palmas-br", name: "Palmas", admin: "TO", country: "Brasil", lat: -10.1689, lon: -48.3317, utcOffset: -3, timezone: "America/Araguaina" },
  { id: "porto-velho-br", name: "Porto Velho", admin: "RO", country: "Brasil", lat: -8.7619, lon: -63.9039, utcOffset: -4, timezone: "America/Porto_Velho" },
  { id: "boa-vista-br", name: "Boa Vista", admin: "RR", country: "Brasil", lat: 2.8235, lon: -60.6758, utcOffset: -4, timezone: "America/Boa_Vista" },
  { id: "macapa-br", name: "Macapá", admin: "AP", country: "Brasil", lat: 0.0389, lon: -51.0664, utcOffset: -3, timezone: "America/Belem" },
  { id: "rio-branco-br", name: "Rio Branco", admin: "AC", country: "Brasil", lat: -9.9754, lon: -67.8249, utcOffset: -5, timezone: "America/Rio_Branco" },
  { id: "sao-goncalo-rj-br", name: "São Gonçalo", admin: "RJ", country: "Brasil", lat: -22.8268, lon: -43.0634, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "sao-bernardo-do-campo-sp-br", name: "São Bernardo do Campo", admin: "SP", country: "Brasil", lat: -23.6914, lon: -46.5646, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "duque-de-caxias-rj-br", name: "Duque de Caxias", admin: "RJ", country: "Brasil", lat: -22.7858, lon: -43.3049, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "nova-iguacu-rj-br", name: "Nova Iguaçu", admin: "RJ", country: "Brasil", lat: -22.7556, lon: -43.4603, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "santo-andre-sp-br", name: "Santo André", admin: "SP", country: "Brasil", lat: -23.6737, lon: -46.5432, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "osasco-sp-br", name: "Osasco", admin: "SP", country: "Brasil", lat: -23.5324, lon: -46.7916, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "sorocaba-sp-br", name: "Sorocaba", admin: "SP", country: "Brasil", lat: -23.4969, lon: -47.4451, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "uberlandia-mg-br", name: "Uberlândia", admin: "MG", country: "Brasil", lat: -18.9141, lon: -48.2749, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "ribeirao-preto-sp-br", name: "Ribeirão Preto", admin: "SP", country: "Brasil", lat: -21.1699, lon: -47.8099, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "sao-jose-dos-campos-sp-br", name: "São José dos Campos", admin: "SP", country: "Brasil", lat: -23.1896, lon: -45.8841, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "jaboatao-dos-guararapes-pe-br", name: "Jaboatão dos Guararapes", admin: "PE", country: "Brasil", lat: -8.113, lon: -35.015, utcOffset: -3, timezone: "America/Recife" },
  { id: "contagem-mg-br", name: "Contagem", admin: "MG", country: "Brasil", lat: -19.9321, lon: -44.0539, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "joinville-sc-br", name: "Joinville", admin: "SC", country: "Brasil", lat: -26.3045, lon: -48.8487, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "feira-de-santana-ba-br", name: "Feira de Santana", admin: "BA", country: "Brasil", lat: -12.2664, lon: -38.9663, utcOffset: -3, timezone: "America/Bahia" },
  { id: "londrina-pr-br", name: "Londrina", admin: "PR", country: "Brasil", lat: -23.304, lon: -51.1691, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "juiz-de-fora-mg-br", name: "Juiz de Fora", admin: "MG", country: "Brasil", lat: -21.7595, lon: -43.3398, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "aparecida-de-goiania-go-br", name: "Aparecida de Goiânia", admin: "GO", country: "Brasil", lat: -16.8198, lon: -49.2469, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "serra-es-br", name: "Serra", admin: "ES", country: "Brasil", lat: -20.121, lon: -40.3074, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "campos-dos-goytacazes-rj-br", name: "Campos dos Goytacazes", admin: "RJ", country: "Brasil", lat: -21.7622, lon: -41.3181, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "belford-roxo-rj-br", name: "Belford Roxo", admin: "RJ", country: "Brasil", lat: -22.764, lon: -43.3992, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "niteroi-rj-br", name: "Niterói", admin: "RJ", country: "Brasil", lat: -22.8832, lon: -43.1034, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "sao-jose-do-rio-preto-sp-br", name: "São José do Rio Preto", admin: "SP", country: "Brasil", lat: -20.8113, lon: -49.3758, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "ananindeua-pa-br", name: "Ananindeua", admin: "PA", country: "Brasil", lat: -1.3639, lon: -48.3743, utcOffset: -3, timezone: "America/Belem" },
  { id: "vila-velha-es-br", name: "Vila Velha", admin: "ES", country: "Brasil", lat: -20.3417, lon: -40.2875, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "caxias-do-sul-rs-br", name: "Caxias do Sul", admin: "RS", country: "Brasil", lat: -29.1629, lon: -51.1792, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "mogi-das-cruzes-sp-br", name: "Mogi das Cruzes", admin: "SP", country: "Brasil", lat: -23.5208, lon: -46.1854, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "jundiai-sp-br", name: "Jundiaí", admin: "SP", country: "Brasil", lat: -23.1852, lon: -46.8974, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "sao-joao-de-meriti-rj-br", name: "São João de Meriti", admin: "RJ", country: "Brasil", lat: -22.8058, lon: -43.3729, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "piracicaba-sp-br", name: "Piracicaba", admin: "SP", country: "Brasil", lat: -22.7338, lon: -47.6476, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "campina-grande-pb-br", name: "Campina Grande", admin: "PB", country: "Brasil", lat: -7.222, lon: -35.8731, utcOffset: -3, timezone: "America/Fortaleza" },
  { id: "santos-sp-br", name: "Santos", admin: "SP", country: "Brasil", lat: -23.9535, lon: -46.335, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "maua-sp-br", name: "Mauá", admin: "SP", country: "Brasil", lat: -23.6677, lon: -46.4613, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "montes-claros-mg-br", name: "Montes Claros", admin: "MG", country: "Brasil", lat: -16.7282, lon: -43.8578, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "betim-mg-br", name: "Betim", admin: "MG", country: "Brasil", lat: -19.9668, lon: -44.2008, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "maringa-pr-br", name: "Maringá", admin: "PR", country: "Brasil", lat: -23.4205, lon: -51.9333, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "anapolis-go-br", name: "Anápolis", admin: "GO", country: "Brasil", lat: -16.3281, lon: -48.953, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "diadema-sp-br", name: "Diadema", admin: "SP", country: "Brasil", lat: -23.6813, lon: -46.6205, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "carapicuiba-sp-br", name: "Carapicuíba", admin: "SP", country: "Brasil", lat: -23.5235, lon: -46.8407, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "petrolina-pe-br", name: "Petrolina", admin: "PE", country: "Brasil", lat: -9.3887, lon: -40.5027, utcOffset: -3, timezone: "America/Recife" },
  { id: "bauru-sp-br", name: "Bauru", admin: "SP", country: "Brasil", lat: -22.3246, lon: -49.0871, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "caruaru-pe-br", name: "Caruaru", admin: "PE", country: "Brasil", lat: -8.2845, lon: -35.9699, utcOffset: -3, timezone: "America/Recife" },
  { id: "vitoria-da-conquista-ba-br", name: "Vitória da Conquista", admin: "BA", country: "Brasil", lat: -14.8615, lon: -40.8442, utcOffset: -3, timezone: "America/Bahia" },
  { id: "itaquaquecetuba-sp-br", name: "Itaquaquecetuba", admin: "SP", country: "Brasil", lat: -23.4835, lon: -46.3457, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "blumenau-sc-br", name: "Blumenau", admin: "SC", country: "Brasil", lat: -26.9155, lon: -49.0709, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "ponta-grossa-pr-br", name: "Ponta Grossa", admin: "PR", country: "Brasil", lat: -25.0916, lon: -50.1668, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "caucaia-ce-br", name: "Caucaia", admin: "CE", country: "Brasil", lat: -3.728, lon: -38.6619, utcOffset: -3, timezone: "America/Fortaleza" },
  { id: "cariacica-es-br", name: "Cariacica", admin: "ES", country: "Brasil", lat: -20.2632, lon: -40.4165, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "franca-sp-br", name: "Franca", admin: "SP", country: "Brasil", lat: -20.5352, lon: -47.4039, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "olinda-pe-br", name: "Olinda", admin: "PE", country: "Brasil", lat: -8.0102, lon: -34.8545, utcOffset: -3, timezone: "America/Recife" },
  { id: "praia-grande-sp-br", name: "Praia Grande", admin: "SP", country: "Brasil", lat: -24.0084, lon: -46.4121, utcOffset: -3, timezone: "America/Sao_Paulo" },
  { id: "cascavel-pr-br", name: "Cascavel", admin: "PR", country: "Brasil", lat: -24.9573, lon: -53.459, utcOffset: -3, timezone: "America/Sao_Paulo" },

  // --- América Latina e Caribe: as 26 que já existiam na lista antiga
  // (mercado hispanofalante do funil), agora com fuso IANA.
  { id: "bogota-co", name: "Bogotá", admin: "", country: "Colômbia", lat: 4.711, lon: -74.0721, utcOffset: -5, timezone: "America/Bogota" },
  { id: "medellin-co", name: "Medellín", admin: "", country: "Colômbia", lat: 6.2442, lon: -75.5812, utcOffset: -5, timezone: "America/Bogota" },
  { id: "buenos-aires-ar", name: "Buenos Aires", admin: "", country: "Argentina", lat: -34.6037, lon: -58.3816, utcOffset: -3, timezone: "America/Argentina/Buenos_Aires" },
  { id: "cordoba-ar", name: "Córdoba", admin: "", country: "Argentina", lat: -31.4201, lon: -64.1888, utcOffset: -3, timezone: "America/Argentina/Cordoba" },
  { id: "ciudad-de-mexico-mx", name: "Cidade do México", admin: "", country: "México", lat: 19.4326, lon: -99.1332, utcOffset: -6, timezone: "America/Mexico_City" },
  { id: "guadalajara-mx", name: "Guadalajara", admin: "", country: "México", lat: 20.6597, lon: -103.3496, utcOffset: -6, timezone: "America/Mexico_City" },
  { id: "monterrey-mx", name: "Monterrey", admin: "", country: "México", lat: 25.6866, lon: -100.3161, utcOffset: -6, timezone: "America/Monterrey" },
  { id: "lima-pe", name: "Lima", admin: "", country: "Peru", lat: -12.0464, lon: -77.0428, utcOffset: -5, timezone: "America/Lima" },
  { id: "arequipa-pe", name: "Arequipa", admin: "", country: "Peru", lat: -16.409, lon: -71.5375, utcOffset: -5, timezone: "America/Lima" },
  { id: "santiago-cl", name: "Santiago", admin: "", country: "Chile", lat: -33.4489, lon: -70.6693, utcOffset: -4, timezone: "America/Santiago" },
  { id: "valparaiso-cl", name: "Valparaíso", admin: "", country: "Chile", lat: -33.0472, lon: -71.6127, utcOffset: -4, timezone: "America/Santiago" },
  { id: "montevideo-uy", name: "Montevidéu", admin: "", country: "Uruguai", lat: -34.9011, lon: -56.1645, utcOffset: -3, timezone: "America/Montevideo" },
  { id: "caracas-ve", name: "Caracas", admin: "", country: "Venezuela", lat: 10.4806, lon: -66.9036, utcOffset: -4, timezone: "America/Caracas" },
  { id: "quito-ec", name: "Quito", admin: "", country: "Equador", lat: -0.1807, lon: -78.4678, utcOffset: -5, timezone: "America/Guayaquil" },
  { id: "guayaquil-ec", name: "Guayaquil", admin: "", country: "Equador", lat: -2.1894, lon: -79.8891, utcOffset: -5, timezone: "America/Guayaquil" },
  { id: "la-paz-bo", name: "La Paz", admin: "", country: "Bolívia", lat: -16.5, lon: -68.15, utcOffset: -4, timezone: "America/La_Paz" },
  { id: "asuncion-py", name: "Assunção", admin: "", country: "Paraguai", lat: -25.2637, lon: -57.5759, utcOffset: -4, timezone: "America/Asuncion" },
  { id: "san-jose-cr", name: "San José", admin: "", country: "Costa Rica", lat: 9.9281, lon: -84.0907, utcOffset: -6, timezone: "America/Costa_Rica" },
  { id: "cidade-da-guatemala-gt", name: "Cidade da Guatemala", admin: "", country: "Guatemala", lat: 14.6349, lon: -90.5069, utcOffset: -6, timezone: "America/Guatemala" },
  { id: "san-salvador-sv", name: "San Salvador", admin: "", country: "El Salvador", lat: 13.6929, lon: -89.2182, utcOffset: -6, timezone: "America/El_Salvador" },
  { id: "tegucigalpa-hn", name: "Tegucigalpa", admin: "", country: "Honduras", lat: 14.0723, lon: -87.1921, utcOffset: -6, timezone: "America/Tegucigalpa" },
  { id: "managua-ni", name: "Manágua", admin: "", country: "Nicarágua", lat: 12.1364, lon: -86.2514, utcOffset: -6, timezone: "America/Managua" },
  { id: "cidade-do-panama-pa", name: "Cidade do Panamá", admin: "", country: "Panamá", lat: 8.9824, lon: -79.5199, utcOffset: -5, timezone: "America/Panama" },
  { id: "santo-domingo-do", name: "Santo Domingo", admin: "", country: "República Dominicana", lat: 18.4861, lon: -69.9312, utcOffset: -4, timezone: "America/Santo_Domingo" },
  { id: "san-juan-pr", name: "San Juan", admin: "", country: "Porto Rico", lat: 18.4655, lon: -66.1057, utcOffset: -4, timezone: "America/Puerto_Rico" },
  { id: "havana-cu", name: "Havana", admin: "", country: "Cuba", lat: 23.1136, lon: -82.3666, utcOffset: -5, timezone: "America/Havana" },

  // --- Resto do mundo: 45 cidades novas.
  { id: "lisboa-pt", name: "Lisboa", admin: "", country: "Portugal", lat: 38.7223, lon: -9.1393, utcOffset: 0, timezone: "Europe/Lisbon" },
  { id: "porto-pt", name: "Porto", admin: "", country: "Portugal", lat: 41.1579, lon: -8.6291, utcOffset: 0, timezone: "Europe/Lisbon" },
  { id: "madri-es", name: "Madri", admin: "", country: "Espanha", lat: 40.4168, lon: -3.7038, utcOffset: 1, timezone: "Europe/Madrid" },
  { id: "barcelona-es", name: "Barcelona", admin: "", country: "Espanha", lat: 41.3874, lon: 2.1686, utcOffset: 1, timezone: "Europe/Madrid" },
  { id: "paris-fr", name: "Paris", admin: "", country: "França", lat: 48.8566, lon: 2.3522, utcOffset: 1, timezone: "Europe/Paris" },
  { id: "londres-gb", name: "Londres", admin: "", country: "Reino Unido", lat: 51.5074, lon: -0.1278, utcOffset: 0, timezone: "Europe/London" },
  { id: "dublin-ie", name: "Dublin", admin: "", country: "Irlanda", lat: 53.3498, lon: -6.2603, utcOffset: 0, timezone: "Europe/Dublin" },
  { id: "roma-it", name: "Roma", admin: "", country: "Itália", lat: 41.9028, lon: 12.4964, utcOffset: 1, timezone: "Europe/Rome" },
  { id: "milao-it", name: "Milão", admin: "", country: "Itália", lat: 45.4642, lon: 9.19, utcOffset: 1, timezone: "Europe/Rome" },
  { id: "berlim-de", name: "Berlim", admin: "", country: "Alemanha", lat: 52.52, lon: 13.405, utcOffset: 1, timezone: "Europe/Berlin" },
  { id: "amsterda-nl", name: "Amsterdã", admin: "", country: "Países Baixos", lat: 52.3676, lon: 4.9041, utcOffset: 1, timezone: "Europe/Amsterdam" },
  { id: "bruxelas-be", name: "Bruxelas", admin: "", country: "Bélgica", lat: 50.8503, lon: 4.3517, utcOffset: 1, timezone: "Europe/Brussels" },
  { id: "zurique-ch", name: "Zurique", admin: "", country: "Suíça", lat: 47.3769, lon: 8.5417, utcOffset: 1, timezone: "Europe/Zurich" },
  { id: "viena-at", name: "Viena", admin: "", country: "Áustria", lat: 48.2082, lon: 16.3738, utcOffset: 1, timezone: "Europe/Vienna" },
  { id: "estocolmo-se", name: "Estocolmo", admin: "", country: "Suécia", lat: 59.3293, lon: 18.0686, utcOffset: 1, timezone: "Europe/Stockholm" },
  { id: "varsovia-pl", name: "Varsóvia", admin: "", country: "Polônia", lat: 52.2297, lon: 21.0122, utcOffset: 1, timezone: "Europe/Warsaw" },
  { id: "atenas-gr", name: "Atenas", admin: "", country: "Grécia", lat: 37.9838, lon: 23.7275, utcOffset: 2, timezone: "Europe/Athens" },
  { id: "moscou-ru", name: "Moscou", admin: "", country: "Rússia", lat: 55.7558, lon: 37.6173, utcOffset: 3, timezone: "Europe/Moscow" },
  { id: "istambul-tr", name: "Istambul", admin: "", country: "Turquia", lat: 41.0082, lon: 28.9784, utcOffset: 3, timezone: "Europe/Istanbul" },
  { id: "nova-york-us", name: "Nova York", admin: "NY", country: "Estados Unidos", lat: 40.7128, lon: -74.006, utcOffset: -5, timezone: "America/New_York" },
  { id: "miami-us", name: "Miami", admin: "FL", country: "Estados Unidos", lat: 25.7617, lon: -80.1918, utcOffset: -5, timezone: "America/New_York" },
  { id: "orlando-us", name: "Orlando", admin: "FL", country: "Estados Unidos", lat: 28.5383, lon: -81.3792, utcOffset: -5, timezone: "America/New_York" },
  { id: "boston-us", name: "Boston", admin: "MA", country: "Estados Unidos", lat: 42.3601, lon: -71.0589, utcOffset: -5, timezone: "America/New_York" },
  { id: "newark-us", name: "Newark", admin: "NJ", country: "Estados Unidos", lat: 40.7357, lon: -74.1724, utcOffset: -5, timezone: "America/New_York" },
  { id: "chicago-us", name: "Chicago", admin: "IL", country: "Estados Unidos", lat: 41.8781, lon: -87.6298, utcOffset: -6, timezone: "America/Chicago" },
  { id: "houston-us", name: "Houston", admin: "TX", country: "Estados Unidos", lat: 29.7604, lon: -95.3698, utcOffset: -6, timezone: "America/Chicago" },
  { id: "los-angeles-us", name: "Los Angeles", admin: "CA", country: "Estados Unidos", lat: 34.0522, lon: -118.2437, utcOffset: -8, timezone: "America/Los_Angeles" },
  { id: "toronto-ca", name: "Toronto", admin: "ON", country: "Canadá", lat: 43.6532, lon: -79.3832, utcOffset: -5, timezone: "America/Toronto" },
  { id: "montreal-ca", name: "Montreal", admin: "QC", country: "Canadá", lat: 45.5017, lon: -73.5673, utcOffset: -5, timezone: "America/Toronto" },
  { id: "luanda-ao", name: "Luanda", admin: "", country: "Angola", lat: -8.839, lon: 13.2894, utcOffset: 1, timezone: "Africa/Luanda" },
  { id: "maputo-mz", name: "Maputo", admin: "", country: "Moçambique", lat: -25.9692, lon: 32.5732, utcOffset: 2, timezone: "Africa/Maputo" },
  { id: "praia-cv", name: "Praia", admin: "", country: "Cabo Verde", lat: 14.933, lon: -23.5133, utcOffset: -1, timezone: "Atlantic/Cape_Verde" },
  { id: "lagos-ng", name: "Lagos", admin: "", country: "Nigéria", lat: 6.5244, lon: 3.3792, utcOffset: 1, timezone: "Africa/Lagos" },
  { id: "joanesburgo-za", name: "Joanesburgo", admin: "", country: "África do Sul", lat: -26.2041, lon: 28.0473, utcOffset: 2, timezone: "Africa/Johannesburg" },
  { id: "cairo-eg", name: "Cairo", admin: "", country: "Egito", lat: 30.0444, lon: 31.2357, utcOffset: 2, timezone: "Africa/Cairo" },
  { id: "toquio-jp", name: "Tóquio", admin: "", country: "Japão", lat: 35.6762, lon: 139.6503, utcOffset: 9, timezone: "Asia/Tokyo" },
  { id: "pequim-cn", name: "Pequim", admin: "", country: "China", lat: 39.9042, lon: 116.4074, utcOffset: 8, timezone: "Asia/Shanghai" },
  { id: "hong-kong-hk", name: "Hong Kong", admin: "", country: "Hong Kong", lat: 22.3193, lon: 114.1694, utcOffset: 8, timezone: "Asia/Hong_Kong" },
  { id: "seul-kr", name: "Seul", admin: "", country: "Coreia do Sul", lat: 37.5665, lon: 126.978, utcOffset: 9, timezone: "Asia/Seoul" },
  { id: "bangkok-th", name: "Bangkok", admin: "", country: "Tailândia", lat: 13.7563, lon: 100.5018, utcOffset: 7, timezone: "Asia/Bangkok" },
  { id: "singapura-sg", name: "Singapura", admin: "", country: "Singapura", lat: 1.3521, lon: 103.8198, utcOffset: 8, timezone: "Asia/Singapore" },
  { id: "nova-delhi-in", name: "Nova Délhi", admin: "", country: "Índia", lat: 28.6139, lon: 77.209, utcOffset: 5.5, timezone: "Asia/Kolkata" },
  { id: "dubai-ae", name: "Dubai", admin: "", country: "Emirados Árabes Unidos", lat: 25.2048, lon: 55.2708, utcOffset: 4, timezone: "Asia/Dubai" },
  { id: "tel-aviv-il", name: "Tel Aviv", admin: "", country: "Israel", lat: 32.0853, lon: 34.7818, utcOffset: 2, timezone: "Asia/Jerusalem" },
  { id: "sydney-au", name: "Sydney", admin: "", country: "Austrália", lat: -33.8688, lon: 151.2093, utcOffset: 10, timezone: "Australia/Sydney" },
];

// --- Busca local (na reserva) ----------------------------------------------
// Esta parte NÃO mudou de comportamento: é a mesma normalização, o mesmo
// índice e a mesma pontuação de antes. Ela continua sendo o que aparece
// instantaneamente enquanto a resposta do servidor não chega, e a única coisa
// que existe quando não há rede.

// Normaliza pra busca: tira acentos E pontuação ("D'Oeste" -> "d oeste", então
// "Santa Bárbara d'Oeste" é achado digitando "santa barbara doeste"), e colapsa
// separadores num espaço único pra permitir busca por termos soltos.
// ATENCAO: a faixa de acentos vai escrita como \u0300-\u036f (escape ASCII) de
// proposito. Antes estava com os caracteres combinantes literais no fonte
// (/[<U+0300>-<U+036F>]/), que sao invisiveis num editor e colam no colchete
// anterior se o arquivo passar por qualquer normalizacao NFC / conversao de
// encoding — a regex vira outra coisa em silencio e a busca sem acento morre.
// É a MESMA função do servidor (citiesRoutes.js), de propósito: se as duas
// normalizassem diferente, "santa barbara doeste" acharia a cidade offline e
// não acharia online (ou o contrário), e o resultado mudaria conforme a
// qualidade da rede.
export function normalize(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Variante "colada": igual a normalize, mas some com a pontuacao em vez de
// virar espaco. E o que faz "santa barbara doeste" achar "Santa Bárbara
// d'Oeste" — em normalize o apostrofo vira espaco e o nome indexado fica
// "santa barbara d oeste", entao o termo "doeste" nunca batia.
function normalizeTight(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

// Nome por extenso do estado, só pra BUSCA (nunca é exibido): quem digita
// "minas", "bahia" ou "rio grande do sul" encontra as cidades daquele estado
// sem precisar saber a sigla.
const UF_NOMES = {
  AC: 'acre', AL: 'alagoas', AP: 'amapa', AM: 'amazonas', BA: 'bahia',
  CE: 'ceara', DF: 'distrito federal', ES: 'espirito santo', GO: 'goias',
  MA: 'maranhao', MT: 'mato grosso', MS: 'mato grosso do sul',
  MG: 'minas gerais', PA: 'para', PB: 'paraiba', PR: 'parana',
  PE: 'pernambuco', PI: 'piaui', RJ: 'rio de janeiro',
  RN: 'rio grande do norte', RS: 'rio grande do sul', RO: 'rondonia',
  RR: 'roraima', SC: 'santa catarina', SP: 'sao paulo', SE: 'sergipe',
  TO: 'tocantins',
};

// Índice pré-calculado uma única vez (não a cada tecla digitada). O haystack
// guarda as DUAS formas do nome: a separada por espaco e a "colada".
const INDEX = CITIES.map((c) => ({
  city: c,
  name: normalize(c.name),
  haystack:
    normalize(c.name + ' ' + c.admin + ' ' + (UF_NOMES[c.admin] || '') + ' ' + c.country) +
    ' ' +
    normalizeTight(c.name),
}));

const POR_ID = new Map(CITIES.map((c) => [c.id, c]));

/** Cidade da RESERVA por id. Síncrono e sem rede — quem precisa do servidor
 *  usa resolveCityById(). */
export function cityById(id) {
  return POR_ID.get(id) || null;
}

// Filtra a reserva por termos (acento/pontuação-insensível) no nome, no estado
// (sigla OU nome por extenso) ou no país. Todos os termos digitados precisam
// bater em algum campo ("osasco sp", "sao bernardo"), e o resultado sai
// ORDENADO por relevância: nome exato primeiro, depois quem começa com o que
// foi digitado, depois quem tem o termo no começo de uma palavra, depois o
// resto. Query vazia devolve a reserva inteira, já em ordem de população.
export function searchCities(query) {
  const q = normalize(query);
  if (!q) return CITIES;
  const terms = q.split(' ').filter(Boolean);
  const hits = [];
  for (let i = 0; i < INDEX.length; i++) {
    const entry = INDEX[i];
    let ok = true;
    for (let t = 0; t < terms.length; t++) {
      if (!entry.haystack.includes(terms[t])) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    let score = 4;
    if (entry.name === q) score = 0;
    else if (entry.name.startsWith(q)) score = 1;
    else if ((' ' + entry.name).includes(' ' + q)) score = 2;
    else if (entry.name.includes(q)) score = 3;
    hits.push({ city: entry.city, score, i });
  }
  hits.sort((a, b) => a.score - b.score || a.i - b.i);
  return hits.map((h) => h.city);
}

export function cityLabel(city) {
  if (!city) return '';
  return city.admin ? `${city.name}, ${city.admin} — ${city.country}` : `${city.name} — ${city.country}`;
}

/** Id que veio do servidor ("gn-3459452"). Os ids antigos são slugs, então
 *  este teste é inequívoco. */
export function isRemoteCityId(id) {
  return typeof id === 'string' && /^gn-\d+$/.test(id);
}

// ---------------------------------------------------------------------------
// Busca remota
// ---------------------------------------------------------------------------

// Envolve fetch() com timeout/abort — sem isso uma requisição travada (rede
// instável, captive portal, troca de rede no meio) nunca resolve nem rejeita,
// e o seletor de cidade fica com o spinner girando pra sempre. Mesmo padrão de
// lib/aiClient.js, copiado em vez de importado pra este módulo não puxar o
// cliente de IA junto.
async function fetchComTimeout(url, { signal, fetchImpl } = {}) {
  const f = fetchImpl || (typeof fetch === 'function' ? fetch : null);
  if (!f) throw erroDeRede('sem fetch neste ambiente');
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
  // Se quem chamou já tem um sinal (troca de busca), abortar ele aborta o nosso.
  if (controller && signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  try {
    return await f(url, controller ? { signal: controller.signal } : undefined);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function erroDeRede(msg, codigo = 'offline') {
  const e = new Error(msg);
  e.code = codigo;
  return e;
}

/**
 * Classifica a falha pro texto que a tela mostra. Só três casos, porque a
 * pessoa só precisa saber uma coisa: "posso continuar?".
 *   'offline'      — rede caiu/timeout. A reserva atende.
 *   'indisponivel' — 503: o banco de referência ainda não foi gerado no
 *                    servidor (`node scripts/import-cities.js`). A reserva
 *                    atende, e é ISSO que está acontecendo enquanto o
 *                    importador não roda.
 *   'erro'         — qualquer outra coisa.
 */
export function classifyCityError(err) {
  if (!err) return null;
  if (err.code === 'indisponivel') return 'indisponivel';
  if (err.name === 'AbortError' || err.code === 'offline') return 'offline';
  if (typeof err.message === 'string' && /network|failed to fetch|timeout/i.test(err.message)) {
    return 'offline';
  }
  return 'erro';
}

// Aceita só o que o app entende, e nunca confia no formato: um item sem lat/lon
// numérico entraria no cálculo do Ascendente como NaN e viraria "—" na tela.
function sanearCidade(bruta) {
  if (!bruta || typeof bruta !== 'object') return null;
  const lat = Number(bruta.lat);
  const lon = Number(bruta.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (typeof bruta.id !== 'string' || !bruta.id) return null;
  const cidade = {
    id: bruta.id,
    name: String(bruta.name || ''),
    admin: String(bruta.admin || ''),
    country: String(bruta.country || ''),
    lat,
    lon,
    utcOffset: Number.isFinite(Number(bruta.utcOffset)) ? Number(bruta.utcOffset) : 0,
  };
  if (!cidade.name) return null;
  if (typeof bruta.timezone === 'string' && bruta.timezone) cidade.timezone = bruta.timezone;
  if (Number.isFinite(Number(bruta.utcOffsetAt))) cidade.utcOffsetAt = Number(bruta.utcOffsetAt);
  if (typeof bruta.dstAt === 'boolean') cidade.dstAt = bruta.dstAt;
  if (Number.isFinite(Number(bruta.population))) cidade.population = Number(bruta.population);
  return cidade;
}

// Cache em memória das buscas já feitas nesta sessão. Serve pra apagar uma
// letra e voltar a digitar não gerar requisição nenhuma (no navegador o
// Cache-Control de 1 dia da rota já cobriria isso; no celular, não).
const MAX_CACHE = 60;
const cacheBusca = new Map();

function chaveCache(q, lang, at) {
  return `${lang}|${at || ''}|${q}`;
}

function guardarNoCache(chave, valor) {
  if (cacheBusca.size >= MAX_CACHE) {
    // FIFO simples: o Map do JS mantém ordem de inserção.
    cacheBusca.delete(cacheBusca.keys().next().value);
  }
  cacheBusca.set(chave, valor);
}

/** Só pra teste: zera os caches em memória. */
export function _resetCityCaches() {
  cacheBusca.clear();
  cacheCidade.clear();
}

/**
 * GET /api/cities/search — busca no servidor.
 *
 * @param {string} query
 * @param {{lang?:string, at?:string, limit?:number, signal?:AbortSignal, fetchImpl?:Function}} opts
 *        `at` = "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm" (a data/hora de nascimento
 *        que a tela JÁ tem na mão). Mandando ele, cada cidade volta com
 *        utcOffsetAt/dstAt já resolvidos pro instante do nascimento — uma
 *        chamada a menos e o horário de verão certo de primeira.
 * @returns {Promise<{items:Array, attribution:string, cached:boolean}>}
 */
export async function searchCitiesRemote(query, opts = {}) {
  const { lang = 'pt', at = null, limit = 20, signal, fetchImpl } = opts;
  const q = normalize(query);
  if (q.length < MIN_REMOTE_QUERY) return { items: [], attribution: CITY_ATTRIBUTION, cached: false };

  const chave = chaveCache(q, lang, at);
  if (cacheBusca.has(chave)) {
    return { items: cacheBusca.get(chave), attribution: CITY_ATTRIBUTION, cached: true };
  }

  const params = [`q=${encodeURIComponent(query)}`, `lang=${encodeURIComponent(lang)}`, `limit=${limit}`];
  if (at) params.push(`at=${encodeURIComponent(at)}`);

  let resp;
  try {
    resp = await fetchComTimeout(`${SEARCH_URL}?${params.join('&')}`, { signal, fetchImpl });
  } catch (err) {
    if (err && err.name === 'AbortError') throw err;
    throw erroDeRede((err && err.message) || 'falha de rede');
  }

  if (resp.status === 503) throw erroDeRede('busca de cidades indisponível', 'indisponivel');
  // 400 = "q curto demais" na visão do servidor. Não é erro pra tela: é lista
  // vazia, e a reserva já cobre o que a pessoa digitou.
  if (resp.status === 400) return { items: [], attribution: CITY_ATTRIBUTION, cached: false };
  if (!resp.ok) throw erroDeRede(`busca falhou (${resp.status})`, 'erro');

  let dados;
  try {
    dados = await resp.json();
  } catch (_) {
    throw erroDeRede('resposta inválida do servidor', 'erro');
  }
  const itens = Array.isArray(dados && dados.items)
    ? dados.items.map(sanearCidade).filter(Boolean)
    : [];

  guardarNoCache(chave, itens);
  return {
    items: itens,
    attribution: (dados && dados.attribution) || CITY_ATTRIBUTION,
    cached: false,
  };
}

/**
 * Busca com DEBOUNCE, cancelamento e queda pra reserva — o que a UI usa.
 *
 * A UI não pode disparar uma requisição por tecla: "junqueiropolis" são 14
 * teclas, e o servidor recebe isso de todo mundo ao mesmo tempo. Aqui cada
 * chamada de run() cancela a anterior (timer E requisição em voo), e resultado
 * de busca velha que chegar atrasado é DESCARTADO — sem isso, digitar rápido
 * faz a lista piscar entre respostas fora de ordem.
 *
 * emit() é chamado 1 ou 2 vezes por busca:
 *   1ª (síncrona)  resultado da RESERVA, com loading:true. A lista nunca fica
 *                  vazia esperando a rede — é o que faz o seletor parecer
 *                  instantâneo.
 *   2ª (ao chegar) resultado do SERVIDOR (source:'remote'), ou de novo a
 *                  reserva com `error` preenchido se a rede falhou.
 *
 * @param {{delay?:number, fetchImpl?:Function, limit?:number}} config
 */
export function createCitySearch(config = {}) {
  const { delay = DEBOUNCE_MS, fetchImpl, limit = 20 } = config;
  let timer = null;
  let controller = null;
  let geracao = 0;

  function cancel() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (controller) {
      try {
        controller.abort();
      } catch (_) {
        /* já abortado */
      }
      controller = null;
    }
  }

  function run(query, { lang = 'pt', at = null, emit } = {}) {
    const minha = ++geracao;
    cancel();

    const locais = searchCities(query);
    const q = normalize(query);

    if (q.length < MIN_REMOTE_QUERY) {
      // Query vazia ou de 1 letra: a reserva é a resposta final. Nada de rede.
      emit && emit({ items: locais, source: 'local', loading: false, error: null, query });
      return;
    }

    const chave = chaveCache(q, lang, at);
    if (cacheBusca.has(chave)) {
      // Já buscamos isso nesta sessão — resposta imediata, sem debounce.
      const itens = cacheBusca.get(chave);
      emit &&
        emit({
          items: itens.length ? itens : locais,
          source: itens.length ? 'remote' : 'local',
          loading: false,
          error: null,
          query,
        });
      return;
    }

    emit && emit({ items: locais, source: 'local', loading: true, error: null, query });

    timer = setTimeout(async () => {
      timer = null;
      controller = typeof AbortController === 'function' ? new AbortController() : null;
      try {
        const r = await searchCitiesRemote(query, {
          lang,
          at,
          limit,
          signal: controller ? controller.signal : undefined,
          fetchImpl,
        });
        if (minha !== geracao) return; // busca velha chegou atrasada: descarta
        emit &&
          emit({
            // Servidor sem resultado mas reserva com algum: mostra a reserva.
            // Acontece com grafia que o FTS não casa e o haystack local casa.
            items: r.items.length ? r.items : locais,
            source: r.items.length ? 'remote' : 'local',
            loading: false,
            error: null,
            query,
          });
      } catch (err) {
        if (minha !== geracao) return;
        if (err && err.name === 'AbortError') return;
        emit &&
          emit({
            items: locais,
            source: 'local',
            loading: false,
            error: classifyCityError(err),
            query,
          });
      }
    }, delay);
  }

  return { run, cancel };
}

// ---------------------------------------------------------------------------
// Reidratação por id (cidade já escolhida)
// ---------------------------------------------------------------------------
//
// IMPORTANTE, pra ninguém se assustar: o app guarda o OBJETO INTEIRO da cidade
// no aparelho (screens/BirthChartScreen.js grava `{ date, time, city }` com
// lat/lon/utcOffset dentro), NÃO só o id. Então nada aqui é resgate de dado
// perdido — se o servidor não responder, a cidade salva continua funcionando
// exatamente como antes. Isto é UPGRADE: buscar o `timezone` que a entrada
// antiga não tinha, que é o que conserta o Ascendente de quem nasceu em
// horário de verão.

const CACHE_PREFIX = 'cg-city:';
const cacheCidade = new Map(); // memória, na frente do AsyncStorage

async function lerCache(id) {
  if (cacheCidade.has(id)) return cacheCidade.get(id);
  try {
    const bruto = await AsyncStorage.getItem(CACHE_PREFIX + id);
    if (!bruto) return null;
    const c = sanearCidade(JSON.parse(bruto));
    if (c) cacheCidade.set(id, c);
    return c;
  } catch (_) {
    return null; // storage indisponível nunca pode derrubar o seletor
  }
}

async function gravarCache(id, cidade) {
  cacheCidade.set(id, cidade);
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + id, JSON.stringify(cidade));
  } catch (_) {
    /* sem cache persistente, só em memória */
  }
}

/**
 * GET /api/cities/:id — aceita "gn-3459452", "3459452" e os ids ANTIGOS
 * ("sao-paulo-br"), que o servidor resolve pela tabela legacy_city_ids e
 * devolve com `resolvedFrom` preenchido.
 *
 * @returns {Promise<{city:Object, resolvedFrom:?string}|null>} null = 404
 */
export async function fetchCityById(id, opts = {}) {
  const { lang = 'pt', at = null, signal, fetchImpl } = opts;
  if (typeof id !== 'string' || !id || id.length > 64) return null;
  const params = [`lang=${encodeURIComponent(lang)}`];
  if (at) params.push(`at=${encodeURIComponent(at)}`);

  let resp;
  try {
    resp = await fetchComTimeout(`${CITY_URL}/${encodeURIComponent(id)}?${params.join('&')}`, {
      signal,
      fetchImpl,
    });
  } catch (err) {
    if (err && err.name === 'AbortError') throw err;
    throw erroDeRede((err && err.message) || 'falha de rede');
  }
  if (resp.status === 404) return null;
  if (resp.status === 503) throw erroDeRede('busca de cidades indisponível', 'indisponivel');
  if (!resp.ok) throw erroDeRede(`consulta falhou (${resp.status})`, 'erro');

  let dados;
  try {
    dados = await resp.json();
  } catch (_) {
    throw erroDeRede('resposta inválida do servidor', 'erro');
  }
  const cidade = sanearCidade(dados && dados.city);
  if (!cidade) return null;
  return { city: cidade, resolvedFrom: (dados && dados.resolvedFrom) || null };
}

/**
 * Cidade por id, na ordem que não trava nada: RESERVA → cache local → rede.
 * Devolve null em vez de lançar — quem chama já tem um plano B (o objeto
 * salvo no aparelho).
 */
export async function resolveCityById(id, opts = {}) {
  if (typeof id !== 'string' || !id) return null;
  const local = cityById(id);
  if (local) return local;
  const emCache = await lerCache(id);
  if (emCache) return emCache;
  try {
    const r = await fetchCityById(id, opts);
    if (!r) return null;
    await gravarCache(id, r.city);
    if (r.city.id !== id) await gravarCache(r.city.id, r.city);
    return r.city;
  } catch (_) {
    return null;
  }
}

/**
 * UPGRADE de uma cidade salva ANTES desta versão: ela tem lat/lon/utcOffset,
 * mas não tem `timezone` — então o Ascendente dela ainda ignora horário de
 * verão. Aqui pedimos o fuso ao servidor e devolvemos a cidade completa.
 *
 * O que é PRESERVADO de propósito: name, admin, country, lat e lon salvos. As
 * coordenadas antigas vêm da base do IBGE (sede do município, 4 casas) e são
 * tão boas quanto as do GeoNames; trocá-las moveria o Ascendente de quem já
 * tem um mapa salvo, por nada. O que muda é só o que estava FALTANDO
 * (`timezone`) mais o id novo, pra próxima vez não precisar da ponte legada.
 *
 * @returns {Promise<Object>} a mesma cidade (se não deu pra melhorar) ou a
 *          versão com fuso. NUNCA null, nunca lança.
 */
export async function upgradeCityTimezone(city, opts = {}) {
  if (!city || typeof city !== 'object') return city;
  if (city.timezone) return city; // já veio do servidor ou da reserva nova

  const daReserva = cityById(city.id);
  if (daReserva && daReserva.timezone) {
    return { ...city, timezone: daReserva.timezone };
  }

  try {
    const r = await fetchCityById(city.id, opts);
    if (!r || !r.city.timezone) return city;
    await gravarCache(r.city.id, r.city);
    return {
      ...city,
      timezone: r.city.timezone,
      id: r.city.id,
      legacyId: r.resolvedFrom || city.id,
    };
  } catch (_) {
    return city; // offline: segue com o que já funcionava
  }
}
