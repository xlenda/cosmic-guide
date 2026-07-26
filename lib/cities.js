// Lookup estático de cidades (lat/lon/fuso) para o cálculo do Ascendente —
// sem geocoding por API (nenhuma chave disponível pro app). Cobre o mercado
// primário do app (Brasil, todas as regiões) mais as capitais/grandes cidades
// dos principais países de língua espanhola, para o público hispanofalante do
// funil.
//
// BRASIL: 400 municípios — as 27 capitais + os 400 maiores por população
// (Censo 2022 do IBGE), do São Paulo (11,4 mi) a Curvelo-MG (80,6 mil).
// Ampliado de 29 para 400 em 26/07/2026 depois de um relato de tester ("no
// Mapa Astral só tem São Paulo"): com 29 cidades, só 24% dos brasileiros
// achavam a própria cidade de nascimento pelo nome; com 400, 60,5% acham, e
// 79,4% da população tem uma opção a menos de 50 km. Custo: +35 KB
// minificados / +6,9 KB gzip (~1% do JS do app, que tem 609 KB gzip).
// Coordenadas: base oficial de municípios do IBGE, 4 casas decimais (sede do
// município). Simulação Monte Carlo ponderada por população mostrou que
// escolher a cidade listada mais próxima em vez da real erra o SIGNO do
// Ascendente em 0,9% dos nascimentos (era 3,1% com as 29 antigas, e seria
// 3,4% se a gente listasse só o estado, como um tester chegou a sugerir).
//
// utcOffset = deslocamento padrão em relação ao UTC (horas), sem horário de
// verão — a maioria dos países aqui não observa DST atualmente; onde observa
// (ex.: Chile, Paraguai), usamos o horário padrão como aproximação razoável.

export const CITIES = [
  // Brasil
  { id: "sao-paulo-br", name: "São Paulo", admin: "SP", country: "Brasil", lat: -23.5505, lon: -46.6333, utcOffset: -3 },
  { id: "rio-de-janeiro-br", name: "Rio de Janeiro", admin: "RJ", country: "Brasil", lat: -22.9068, lon: -43.1729, utcOffset: -3 },
  { id: "brasilia-br", name: "Brasília", admin: "DF", country: "Brasil", lat: -15.7939, lon: -47.8828, utcOffset: -3 },
  { id: "salvador-br", name: "Salvador", admin: "BA", country: "Brasil", lat: -12.9777, lon: -38.5016, utcOffset: -3 },
  { id: "fortaleza-br", name: "Fortaleza", admin: "CE", country: "Brasil", lat: -3.7172, lon: -38.5433, utcOffset: -3 },
  { id: "belo-horizonte-br", name: "Belo Horizonte", admin: "MG", country: "Brasil", lat: -19.9167, lon: -43.9345, utcOffset: -3 },
  { id: "manaus-br", name: "Manaus", admin: "AM", country: "Brasil", lat: -3.1190, lon: -60.0217, utcOffset: -4 },
  { id: "curitiba-br", name: "Curitiba", admin: "PR", country: "Brasil", lat: -25.4284, lon: -49.2733, utcOffset: -3 },
  { id: "recife-br", name: "Recife", admin: "PE", country: "Brasil", lat: -8.0476, lon: -34.8770, utcOffset: -3 },
  { id: "porto-alegre-br", name: "Porto Alegre", admin: "RS", country: "Brasil", lat: -30.0346, lon: -51.2177, utcOffset: -3 },
  { id: "belem-br", name: "Belém", admin: "PA", country: "Brasil", lat: -1.4558, lon: -48.4902, utcOffset: -3 },
  { id: "goiania-br", name: "Goiânia", admin: "GO", country: "Brasil", lat: -16.6869, lon: -49.2648, utcOffset: -3 },
  { id: "guarulhos-br", name: "Guarulhos", admin: "SP", country: "Brasil", lat: -23.4538, lon: -46.5333, utcOffset: -3 },
  { id: "campinas-br", name: "Campinas", admin: "SP", country: "Brasil", lat: -22.9099, lon: -47.0626, utcOffset: -3 },
  { id: "sao-luis-br", name: "São Luís", admin: "MA", country: "Brasil", lat: -2.5307, lon: -44.3068, utcOffset: -3 },
  { id: "maceio-br", name: "Maceió", admin: "AL", country: "Brasil", lat: -9.6658, lon: -35.7350, utcOffset: -3 },
  { id: "natal-br", name: "Natal", admin: "RN", country: "Brasil", lat: -5.7945, lon: -35.2110, utcOffset: -3 },
  { id: "teresina-br", name: "Teresina", admin: "PI", country: "Brasil", lat: -5.0892, lon: -42.8019, utcOffset: -3 },
  { id: "joao-pessoa-br", name: "João Pessoa", admin: "PB", country: "Brasil", lat: -7.1195, lon: -34.8450, utcOffset: -3 },
  { id: "aracaju-br", name: "Aracaju", admin: "SE", country: "Brasil", lat: -10.9472, lon: -37.0731, utcOffset: -3 },
  { id: "cuiaba-br", name: "Cuiabá", admin: "MT", country: "Brasil", lat: -15.6014, lon: -56.0979, utcOffset: -4 },
  { id: "campo-grande-br", name: "Campo Grande", admin: "MS", country: "Brasil", lat: -20.4697, lon: -54.6201, utcOffset: -4 },
  { id: "florianopolis-br", name: "Florianópolis", admin: "SC", country: "Brasil", lat: -27.5954, lon: -48.5480, utcOffset: -3 },
  { id: "vitoria-br", name: "Vitória", admin: "ES", country: "Brasil", lat: -20.3155, lon: -40.3128, utcOffset: -3 },
  { id: "palmas-br", name: "Palmas", admin: "TO", country: "Brasil", lat: -10.1689, lon: -48.3317, utcOffset: -3 },
  { id: "porto-velho-br", name: "Porto Velho", admin: "RO", country: "Brasil", lat: -8.7619, lon: -63.9039, utcOffset: -4 },
  { id: "boa-vista-br", name: "Boa Vista", admin: "RR", country: "Brasil", lat: 2.8235, lon: -60.6758, utcOffset: -4 },
  { id: "macapa-br", name: "Macapá", admin: "AP", country: "Brasil", lat: 0.0389, lon: -51.0664, utcOffset: -3 },
  { id: "rio-branco-br", name: "Rio Branco", admin: "AC", country: "Brasil", lat: -9.9754, lon: -67.8249, utcOffset: -5 },

  // --- Ampliacao 26/07/2026: 371 municipios brasileiros a mais (top 400 por
  // populacao, Censo 2022 do IBGE; lat/lon oficiais da base de municipios do
  // IBGE, 4 casas decimais). Ordenados por populacao. NENHUMA das 29 entradas
  // acima foi alterada (mesmos ids, mesmas coordenadas) - isto e adicao pura.
  { id: "sao-goncalo-rj-br", name: "São Gonçalo", admin: "RJ", country: "Brasil", lat: -22.8268, lon: -43.0634, utcOffset: -3 },
  { id: "sao-bernardo-do-campo-sp-br", name: "São Bernardo do Campo", admin: "SP", country: "Brasil", lat: -23.6914, lon: -46.5646, utcOffset: -3 },
  { id: "duque-de-caxias-rj-br", name: "Duque de Caxias", admin: "RJ", country: "Brasil", lat: -22.7858, lon: -43.3049, utcOffset: -3 },
  { id: "nova-iguacu-rj-br", name: "Nova Iguaçu", admin: "RJ", country: "Brasil", lat: -22.7556, lon: -43.4603, utcOffset: -3 },
  { id: "santo-andre-sp-br", name: "Santo André", admin: "SP", country: "Brasil", lat: -23.6737, lon: -46.5432, utcOffset: -3 },
  { id: "osasco-sp-br", name: "Osasco", admin: "SP", country: "Brasil", lat: -23.5324, lon: -46.7916, utcOffset: -3 },
  { id: "sorocaba-sp-br", name: "Sorocaba", admin: "SP", country: "Brasil", lat: -23.4969, lon: -47.4451, utcOffset: -3 },
  { id: "uberlandia-mg-br", name: "Uberlândia", admin: "MG", country: "Brasil", lat: -18.9141, lon: -48.2749, utcOffset: -3 },
  { id: "ribeirao-preto-sp-br", name: "Ribeirão Preto", admin: "SP", country: "Brasil", lat: -21.1699, lon: -47.8099, utcOffset: -3 },
  { id: "sao-jose-dos-campos-sp-br", name: "São José dos Campos", admin: "SP", country: "Brasil", lat: -23.1896, lon: -45.8841, utcOffset: -3 },
  { id: "jaboatao-dos-guararapes-pe-br", name: "Jaboatão dos Guararapes", admin: "PE", country: "Brasil", lat: -8.113, lon: -35.015, utcOffset: -3 },
  { id: "contagem-mg-br", name: "Contagem", admin: "MG", country: "Brasil", lat: -19.9321, lon: -44.0539, utcOffset: -3 },
  { id: "joinville-sc-br", name: "Joinville", admin: "SC", country: "Brasil", lat: -26.3045, lon: -48.8487, utcOffset: -3 },
  { id: "feira-de-santana-ba-br", name: "Feira de Santana", admin: "BA", country: "Brasil", lat: -12.2664, lon: -38.9663, utcOffset: -3 },
  { id: "londrina-pr-br", name: "Londrina", admin: "PR", country: "Brasil", lat: -23.304, lon: -51.1691, utcOffset: -3 },
  { id: "juiz-de-fora-mg-br", name: "Juiz de Fora", admin: "MG", country: "Brasil", lat: -21.7595, lon: -43.3398, utcOffset: -3 },
  { id: "aparecida-de-goiania-go-br", name: "Aparecida de Goiânia", admin: "GO", country: "Brasil", lat: -16.8198, lon: -49.2469, utcOffset: -3 },
  { id: "serra-es-br", name: "Serra", admin: "ES", country: "Brasil", lat: -20.121, lon: -40.3074, utcOffset: -3 },
  { id: "campos-dos-goytacazes-rj-br", name: "Campos dos Goytacazes", admin: "RJ", country: "Brasil", lat: -21.7622, lon: -41.3181, utcOffset: -3 },
  { id: "belford-roxo-rj-br", name: "Belford Roxo", admin: "RJ", country: "Brasil", lat: -22.764, lon: -43.3992, utcOffset: -3 },
  { id: "niteroi-rj-br", name: "Niterói", admin: "RJ", country: "Brasil", lat: -22.8832, lon: -43.1034, utcOffset: -3 },
  { id: "sao-jose-do-rio-preto-sp-br", name: "São José do Rio Preto", admin: "SP", country: "Brasil", lat: -20.8113, lon: -49.3758, utcOffset: -3 },
  { id: "ananindeua-pa-br", name: "Ananindeua", admin: "PA", country: "Brasil", lat: -1.3639, lon: -48.3743, utcOffset: -3 },
  { id: "vila-velha-es-br", name: "Vila Velha", admin: "ES", country: "Brasil", lat: -20.3417, lon: -40.2875, utcOffset: -3 },
  { id: "caxias-do-sul-rs-br", name: "Caxias do Sul", admin: "RS", country: "Brasil", lat: -29.1629, lon: -51.1792, utcOffset: -3 },
  { id: "mogi-das-cruzes-sp-br", name: "Mogi das Cruzes", admin: "SP", country: "Brasil", lat: -23.5208, lon: -46.1854, utcOffset: -3 },
  { id: "jundiai-sp-br", name: "Jundiaí", admin: "SP", country: "Brasil", lat: -23.1852, lon: -46.8974, utcOffset: -3 },
  { id: "sao-joao-de-meriti-rj-br", name: "São João de Meriti", admin: "RJ", country: "Brasil", lat: -22.8058, lon: -43.3729, utcOffset: -3 },
  { id: "piracicaba-sp-br", name: "Piracicaba", admin: "SP", country: "Brasil", lat: -22.7338, lon: -47.6476, utcOffset: -3 },
  { id: "campina-grande-pb-br", name: "Campina Grande", admin: "PB", country: "Brasil", lat: -7.222, lon: -35.8731, utcOffset: -3 },
  { id: "santos-sp-br", name: "Santos", admin: "SP", country: "Brasil", lat: -23.9535, lon: -46.335, utcOffset: -3 },
  { id: "maua-sp-br", name: "Mauá", admin: "SP", country: "Brasil", lat: -23.6677, lon: -46.4613, utcOffset: -3 },
  { id: "montes-claros-mg-br", name: "Montes Claros", admin: "MG", country: "Brasil", lat: -16.7282, lon: -43.8578, utcOffset: -3 },
  { id: "betim-mg-br", name: "Betim", admin: "MG", country: "Brasil", lat: -19.9668, lon: -44.2008, utcOffset: -3 },
  { id: "maringa-pr-br", name: "Maringá", admin: "PR", country: "Brasil", lat: -23.4205, lon: -51.9333, utcOffset: -3 },
  { id: "anapolis-go-br", name: "Anápolis", admin: "GO", country: "Brasil", lat: -16.3281, lon: -48.953, utcOffset: -3 },
  { id: "diadema-sp-br", name: "Diadema", admin: "SP", country: "Brasil", lat: -23.6813, lon: -46.6205, utcOffset: -3 },
  { id: "carapicuiba-sp-br", name: "Carapicuíba", admin: "SP", country: "Brasil", lat: -23.5235, lon: -46.8407, utcOffset: -3 },
  { id: "petrolina-pe-br", name: "Petrolina", admin: "PE", country: "Brasil", lat: -9.3887, lon: -40.5027, utcOffset: -3 },
  { id: "bauru-sp-br", name: "Bauru", admin: "SP", country: "Brasil", lat: -22.3246, lon: -49.0871, utcOffset: -3 },
  { id: "caruaru-pe-br", name: "Caruaru", admin: "PE", country: "Brasil", lat: -8.2845, lon: -35.9699, utcOffset: -3 },
  { id: "vitoria-da-conquista-ba-br", name: "Vitória da Conquista", admin: "BA", country: "Brasil", lat: -14.8615, lon: -40.8442, utcOffset: -3 },
  { id: "itaquaquecetuba-sp-br", name: "Itaquaquecetuba", admin: "SP", country: "Brasil", lat: -23.4835, lon: -46.3457, utcOffset: -3 },
  { id: "blumenau-sc-br", name: "Blumenau", admin: "SC", country: "Brasil", lat: -26.9155, lon: -49.0709, utcOffset: -3 },
  { id: "ponta-grossa-pr-br", name: "Ponta Grossa", admin: "PR", country: "Brasil", lat: -25.0916, lon: -50.1668, utcOffset: -3 },
  { id: "caucaia-ce-br", name: "Caucaia", admin: "CE", country: "Brasil", lat: -3.728, lon: -38.6619, utcOffset: -3 },
  { id: "cariacica-es-br", name: "Cariacica", admin: "ES", country: "Brasil", lat: -20.2632, lon: -40.4165, utcOffset: -3 },
  { id: "franca-sp-br", name: "Franca", admin: "SP", country: "Brasil", lat: -20.5352, lon: -47.4039, utcOffset: -3 },
  { id: "olinda-pe-br", name: "Olinda", admin: "PE", country: "Brasil", lat: -8.0102, lon: -34.8545, utcOffset: -3 },
  { id: "praia-grande-sp-br", name: "Praia Grande", admin: "SP", country: "Brasil", lat: -24.0084, lon: -46.4121, utcOffset: -3 },
  { id: "cascavel-pr-br", name: "Cascavel", admin: "PR", country: "Brasil", lat: -24.9573, lon: -53.459, utcOffset: -3 },
  { id: "canoas-rs-br", name: "Canoas", admin: "RS", country: "Brasil", lat: -29.9128, lon: -51.1857, utcOffset: -3 },
  { id: "paulista-pe-br", name: "Paulista", admin: "PE", country: "Brasil", lat: -7.934, lon: -34.8684, utcOffset: -3 },
  { id: "uberaba-mg-br", name: "Uberaba", admin: "MG", country: "Brasil", lat: -19.7472, lon: -47.9381, utcOffset: -3 },
  { id: "santarem-pa-br", name: "Santarém", admin: "PA", country: "Brasil", lat: -2.4385, lon: -54.6996, utcOffset: -3 },
  { id: "sao-vicente-sp-br", name: "São Vicente", admin: "SP", country: "Brasil", lat: -23.9574, lon: -46.3883, utcOffset: -3 },
  { id: "ribeirao-das-neves-mg-br", name: "Ribeirão das Neves", admin: "MG", country: "Brasil", lat: -19.7621, lon: -44.0844, utcOffset: -3 },
  { id: "sao-jose-dos-pinhais-pr-br", name: "São José dos Pinhais", admin: "PR", country: "Brasil", lat: -25.5313, lon: -49.2031, utcOffset: -3 },
  { id: "pelotas-rs-br", name: "Pelotas", admin: "RS", country: "Brasil", lat: -31.7649, lon: -52.3371, utcOffset: -3 },
  { id: "barueri-sp-br", name: "Barueri", admin: "SP", country: "Brasil", lat: -23.5057, lon: -46.879, utcOffset: -3 },
  { id: "taubate-sp-br", name: "Taubaté", admin: "SP", country: "Brasil", lat: -23.0104, lon: -45.5593, utcOffset: -3 },
  { id: "suzano-sp-br", name: "Suzano", admin: "SP", country: "Brasil", lat: -23.5448, lon: -46.3112, utcOffset: -3 },
  { id: "camacari-ba-br", name: "Camaçari", admin: "BA", country: "Brasil", lat: -12.6996, lon: -38.3263, utcOffset: -3 },
  { id: "varzea-grande-mt-br", name: "Várzea Grande", admin: "MT", country: "Brasil", lat: -15.6458, lon: -56.1322, utcOffset: -4 },
  { id: "limeira-sp-br", name: "Limeira", admin: "SP", country: "Brasil", lat: -22.566, lon: -47.397, utcOffset: -3 },
  { id: "guaruja-sp-br", name: "Guarujá", admin: "SP", country: "Brasil", lat: -23.9888, lon: -46.258, utcOffset: -3 },
  { id: "juazeiro-do-norte-ce-br", name: "Juazeiro do Norte", admin: "CE", country: "Brasil", lat: -7.1962, lon: -39.3076, utcOffset: -3 },
  { id: "foz-do-iguacu-pr-br", name: "Foz do Iguaçu", admin: "PR", country: "Brasil", lat: -25.5427, lon: -54.5827, utcOffset: -3 },
  { id: "sumare-sp-br", name: "Sumaré", admin: "SP", country: "Brasil", lat: -22.8204, lon: -47.2728, utcOffset: -3 },
  { id: "petropolis-rj-br", name: "Petrópolis", admin: "RJ", country: "Brasil", lat: -22.52, lon: -43.1926, utcOffset: -3 },
  { id: "cotia-sp-br", name: "Cotia", admin: "SP", country: "Brasil", lat: -23.6022, lon: -46.919, utcOffset: -3 },
  { id: "taboao-da-serra-sp-br", name: "Taboão da Serra", admin: "SP", country: "Brasil", lat: -23.6019, lon: -46.7526, utcOffset: -3 },
  { id: "imperatriz-ma-br", name: "Imperatriz", admin: "MA", country: "Brasil", lat: -5.5185, lon: -47.4777, utcOffset: -3 },
  { id: "santa-maria-rs-br", name: "Santa Maria", admin: "RS", country: "Brasil", lat: -29.6868, lon: -53.8149, utcOffset: -3 },
  { id: "sao-jose-sc-br", name: "São José", admin: "SC", country: "Brasil", lat: -27.6136, lon: -48.6366, utcOffset: -3 },
  { id: "parauapebas-pa-br", name: "Parauapebas", admin: "PA", country: "Brasil", lat: -6.0678, lon: -49.9037, utcOffset: -3 },
  { id: "maraba-pa-br", name: "Marabá", admin: "PA", country: "Brasil", lat: -5.3807, lon: -49.1327, utcOffset: -3 },
  { id: "gravatai-rs-br", name: "Gravataí", admin: "RS", country: "Brasil", lat: -29.9413, lon: -50.9869, utcOffset: -3 },
  { id: "mossoro-rn-br", name: "Mossoró", admin: "RN", country: "Brasil", lat: -5.1837, lon: -37.3474, utcOffset: -3 },
  { id: "itajai-sc-br", name: "Itajaí", admin: "SC", country: "Brasil", lat: -26.9101, lon: -48.6705, utcOffset: -3 },
  { id: "volta-redonda-rj-br", name: "Volta Redonda", admin: "RJ", country: "Brasil", lat: -22.5202, lon: -44.0996, utcOffset: -3 },
  { id: "governador-valadares-mg-br", name: "Governador Valadares", admin: "MG", country: "Brasil", lat: -18.8545, lon: -41.9555, utcOffset: -3 },
  { id: "indaiatuba-sp-br", name: "Indaiatuba", admin: "SP", country: "Brasil", lat: -23.0816, lon: -47.2101, utcOffset: -3 },
  { id: "sao-carlos-sp-br", name: "São Carlos", admin: "SP", country: "Brasil", lat: -22.0174, lon: -47.886, utcOffset: -3 },
  { id: "chapeco-sc-br", name: "Chapecó", admin: "SC", country: "Brasil", lat: -27.1004, lon: -52.6152, utcOffset: -3 },
  { id: "parnamirim-rn-br", name: "Parnamirim", admin: "RN", country: "Brasil", lat: -5.9112, lon: -35.271, utcOffset: -3 },
  { id: "embu-das-artes-sp-br", name: "Embu das Artes", admin: "SP", country: "Brasil", lat: -23.6437, lon: -46.8579, utcOffset: -3 },
  { id: "macae-rj-br", name: "Macaé", admin: "RJ", country: "Brasil", lat: -22.3768, lon: -41.7848, utcOffset: -3 },
  { id: "rondonopolis-mt-br", name: "Rondonópolis", admin: "MT", country: "Brasil", lat: -16.4673, lon: -54.6372, utcOffset: -4 },
  { id: "sao-jose-de-ribamar-ma-br", name: "São José de Ribamar", admin: "MA", country: "Brasil", lat: -2.547, lon: -44.0597, utcOffset: -3 },
  { id: "dourados-ms-br", name: "Dourados", admin: "MS", country: "Brasil", lat: -22.2231, lon: -54.812, utcOffset: -4 },
  { id: "araraquara-sp-br", name: "Araraquara", admin: "SP", country: "Brasil", lat: -21.7845, lon: -48.178, utcOffset: -3 },
  { id: "jacarei-sp-br", name: "Jacareí", admin: "SP", country: "Brasil", lat: -23.2983, lon: -45.9658, utcOffset: -3 },
  { id: "juazeiro-ba-br", name: "Juazeiro", admin: "BA", country: "Brasil", lat: -9.4162, lon: -40.5033, utcOffset: -3 },
  { id: "marilia-sp-br", name: "Marília", admin: "SP", country: "Brasil", lat: -22.2171, lon: -49.9501, utcOffset: -3 },
  { id: "americana-sp-br", name: "Americana", admin: "SP", country: "Brasil", lat: -22.7374, lon: -47.3331, utcOffset: -3 },
  { id: "hortolandia-sp-br", name: "Hortolândia", admin: "SP", country: "Brasil", lat: -22.8529, lon: -47.2143, utcOffset: -3 },
  { id: "arapiraca-al-br", name: "Arapiraca", admin: "AL", country: "Brasil", lat: -9.7549, lon: -36.6615, utcOffset: -3 },
  { id: "maracanau-ce-br", name: "Maracanaú", admin: "CE", country: "Brasil", lat: -3.867, lon: -38.6259, utcOffset: -3 },
  { id: "itapevi-sp-br", name: "Itapevi", admin: "SP", country: "Brasil", lat: -23.5488, lon: -46.9327, utcOffset: -3 },
  { id: "colombo-pr-br", name: "Colombo", admin: "PR", country: "Brasil", lat: -25.2925, lon: -49.2262, utcOffset: -3 },
  { id: "divinopolis-mg-br", name: "Divinópolis", admin: "MG", country: "Brasil", lat: -20.1446, lon: -44.8912, utcOffset: -3 },
  { id: "mage-rj-br", name: "Magé", admin: "RJ", country: "Brasil", lat: -22.6632, lon: -43.0315, utcOffset: -3 },
  { id: "ipatinga-mg-br", name: "Ipatinga", admin: "MG", country: "Brasil", lat: -19.4703, lon: -42.5476, utcOffset: -3 },
  { id: "novo-hamburgo-rs-br", name: "Novo Hamburgo", admin: "RS", country: "Brasil", lat: -29.6875, lon: -51.1328, utcOffset: -3 },
  { id: "sete-lagoas-mg-br", name: "Sete Lagoas", admin: "MG", country: "Brasil", lat: -19.4569, lon: -44.2413, utcOffset: -3 },
  { id: "rio-verde-go-br", name: "Rio Verde", admin: "GO", country: "Brasil", lat: -17.7923, lon: -50.9192, utcOffset: -3 },
  { id: "aguas-lindas-de-goias-go-br", name: "Águas Lindas de Goiás", admin: "GO", country: "Brasil", lat: -15.7617, lon: -48.2816, utcOffset: -3 },
  { id: "presidente-prudente-sp-br", name: "Presidente Prudente", admin: "SP", country: "Brasil", lat: -22.1207, lon: -51.3925, utcOffset: -3 },
  { id: "itaborai-rj-br", name: "Itaboraí", admin: "RJ", country: "Brasil", lat: -22.7565, lon: -42.8639, utcOffset: -3 },
  { id: "viamao-rs-br", name: "Viamão", admin: "RS", country: "Brasil", lat: -30.0819, lon: -51.0194, utcOffset: -3 },
  { id: "palhoca-sc-br", name: "Palhoça", admin: "SC", country: "Brasil", lat: -27.6455, lon: -48.6697, utcOffset: -3 },
  { id: "cabo-frio-rj-br", name: "Cabo Frio", admin: "RJ", country: "Brasil", lat: -22.8894, lon: -42.0286, utcOffset: -3 },
  { id: "santa-luzia-mg-br", name: "Santa Luzia", admin: "MG", country: "Brasil", lat: -19.7548, lon: -43.8497, utcOffset: -3 },
  { id: "sao-leopoldo-rs-br", name: "São Leopoldo", admin: "RS", country: "Brasil", lat: -29.7545, lon: -51.1498, utcOffset: -3 },
  { id: "criciuma-sc-br", name: "Criciúma", admin: "SC", country: "Brasil", lat: -28.6723, lon: -49.3729, utcOffset: -3 },
  { id: "luziania-go-br", name: "Luziânia", admin: "GO", country: "Brasil", lat: -16.253, lon: -47.95, utcOffset: -3 },
  { id: "passo-fundo-rs-br", name: "Passo Fundo", admin: "RS", country: "Brasil", lat: -28.2576, lon: -52.4091, utcOffset: -3 },
  { id: "cabo-de-santo-agostinho-pe-br", name: "Cabo de Santo Agostinho", admin: "PE", country: "Brasil", lat: -8.2822, lon: -35.0253, utcOffset: -3 },
  { id: "lauro-de-freitas-ba-br", name: "Lauro de Freitas", admin: "BA", country: "Brasil", lat: -12.8978, lon: -38.321, utcOffset: -3 },
  { id: "sobral-ce-br", name: "Sobral", admin: "CE", country: "Brasil", lat: -3.6891, lon: -40.3482, utcOffset: -3 },
  { id: "rio-claro-sp-br", name: "Rio Claro", admin: "SP", country: "Brasil", lat: -22.3984, lon: -47.5546, utcOffset: -3 },
  { id: "aracatuba-sp-br", name: "Araçatuba", admin: "SP", country: "Brasil", lat: -21.2076, lon: -50.4401, utcOffset: -3 },
  { id: "valparaiso-de-goias-go-br", name: "Valparaíso de Goiás", admin: "GO", country: "Brasil", lat: -16.0651, lon: -47.9757, utcOffset: -3 },
  { id: "marica-rj-br", name: "Maricá", admin: "RJ", country: "Brasil", lat: -22.9354, lon: -42.8246, utcOffset: -3 },
  { id: "sinop-mt-br", name: "Sinop", admin: "MT", country: "Brasil", lat: -11.8604, lon: -55.5091, utcOffset: -4 },
  { id: "nossa-senhora-do-socorro-se-br", name: "Nossa Senhora do Socorro", admin: "SE", country: "Brasil", lat: -10.8468, lon: -37.1231, utcOffset: -3 },
  { id: "castanhal-pa-br", name: "Castanhal", admin: "PA", country: "Brasil", lat: -1.298, lon: -47.9167, utcOffset: -3 },
  { id: "rio-grande-rs-br", name: "Rio Grande", admin: "RS", country: "Brasil", lat: -32.0349, lon: -52.1071, utcOffset: -3 },
  { id: "nova-friburgo-rj-br", name: "Nova Friburgo", admin: "RJ", country: "Brasil", lat: -22.2932, lon: -42.5377, utcOffset: -3 },
  { id: "alvorada-rs-br", name: "Alvorada", admin: "RS", country: "Brasil", lat: -29.9914, lon: -51.0809, utcOffset: -3 },
  { id: "itabuna-ba-br", name: "Itabuna", admin: "BA", country: "Brasil", lat: -14.7876, lon: -39.2781, utcOffset: -3 },
  { id: "cachoeiro-de-itapemirim-es-br", name: "Cachoeiro de Itapemirim", admin: "ES", country: "Brasil", lat: -20.8462, lon: -41.1198, utcOffset: -3 },
  { id: "santa-barbara-doeste-sp-br", name: "Santa Bárbara d'Oeste", admin: "SP", country: "Brasil", lat: -22.7553, lon: -47.4143, utcOffset: -3 },
  { id: "jaragua-do-sul-sc-br", name: "Jaraguá do Sul", admin: "SC", country: "Brasil", lat: -26.4851, lon: -49.0713, utcOffset: -3 },
  { id: "guarapuava-pr-br", name: "Guarapuava", admin: "PR", country: "Brasil", lat: -25.3902, lon: -51.4623, utcOffset: -3 },
  { id: "ferraz-de-vasconcelos-sp-br", name: "Ferraz de Vasconcelos", admin: "SP", country: "Brasil", lat: -23.5411, lon: -46.371, utcOffset: -3 },
  { id: "ilheus-ba-br", name: "Ilhéus", admin: "BA", country: "Brasil", lat: -14.793, lon: -39.046, utcOffset: -3 },
  { id: "braganca-paulista-sp-br", name: "Bragança Paulista", admin: "SP", country: "Brasil", lat: -22.9527, lon: -46.5419, utcOffset: -3 },
  { id: "timon-ma-br", name: "Timon", admin: "MA", country: "Brasil", lat: -5.0977, lon: -42.8329, utcOffset: -3 },
  { id: "araguaina-to-br", name: "Araguaína", admin: "TO", country: "Brasil", lat: -7.1924, lon: -48.2044, utcOffset: -3 },
  { id: "ibirite-mg-br", name: "Ibirité", admin: "MG", country: "Brasil", lat: -20.0252, lon: -44.0569, utcOffset: -3 },
  { id: "barra-mansa-rj-br", name: "Barra Mansa", admin: "RJ", country: "Brasil", lat: -22.5481, lon: -44.1752, utcOffset: -3 },
  { id: "porto-seguro-ba-br", name: "Porto Seguro", admin: "BA", country: "Brasil", lat: -16.4435, lon: -39.0643, utcOffset: -3 },
  { id: "itu-sp-br", name: "Itu", admin: "SP", country: "Brasil", lat: -23.2544, lon: -47.2927, utcOffset: -3 },
  { id: "angra-dos-reis-rj-br", name: "Angra dos Reis", admin: "RJ", country: "Brasil", lat: -23.0011, lon: -44.3196, utcOffset: -3 },
  { id: "mesquita-rj-br", name: "Mesquita", admin: "RJ", country: "Brasil", lat: -22.8028, lon: -43.4601, utcOffset: -3 },
  { id: "linhares-es-br", name: "Linhares", admin: "ES", country: "Brasil", lat: -19.3946, lon: -40.0643, utcOffset: -3 },
  { id: "sao-caetano-do-sul-sp-br", name: "São Caetano do Sul", admin: "SP", country: "Brasil", lat: -23.6229, lon: -46.5548, utcOffset: -3 },
  { id: "pindamonhangaba-sp-br", name: "Pindamonhangaba", admin: "SP", country: "Brasil", lat: -22.9246, lon: -45.4613, utcOffset: -3 },
  { id: "francisco-morato-sp-br", name: "Francisco Morato", admin: "SP", country: "Brasil", lat: -23.2792, lon: -46.7448, utcOffset: -3 },
  { id: "teresopolis-rj-br", name: "Teresópolis", admin: "RJ", country: "Brasil", lat: -22.4165, lon: -42.9752, utcOffset: -3 },
  { id: "lages-sc-br", name: "Lages", admin: "SC", country: "Brasil", lat: -27.815, lon: -50.3259, utcOffset: -3 },
  { id: "pocos-de-caldas-mg-br", name: "Poços de Caldas", admin: "MG", country: "Brasil", lat: -21.78, lon: -46.5692, utcOffset: -3 },
  { id: "parnaiba-pi-br", name: "Parnaíba", admin: "PI", country: "Brasil", lat: -2.9058, lon: -41.7754, utcOffset: -3 },
  { id: "barreiras-ba-br", name: "Barreiras", admin: "BA", country: "Brasil", lat: -12.1439, lon: -44.9968, utcOffset: -3 },
  { id: "patos-de-minas-mg-br", name: "Patos de Minas", admin: "MG", country: "Brasil", lat: -18.5699, lon: -46.5013, utcOffset: -3 },
  { id: "jequie-ba-br", name: "Jequié", admin: "BA", country: "Brasil", lat: -13.8509, lon: -40.0877, utcOffset: -3 },
  { id: "atibaia-sp-br", name: "Atibaia", admin: "SP", country: "Brasil", lat: -23.1171, lon: -46.5563, utcOffset: -3 },
  { id: "itapecerica-da-serra-sp-br", name: "Itapecerica da Serra", admin: "SP", country: "Brasil", lat: -23.7161, lon: -46.8572, utcOffset: -3 },
  { id: "abaetetuba-pa-br", name: "Abaetetuba", admin: "PA", country: "Brasil", lat: -1.7218, lon: -48.8788, utcOffset: -3 },
  { id: "itapetininga-sp-br", name: "Itapetininga", admin: "SP", country: "Brasil", lat: -23.5886, lon: -48.0483, utcOffset: -3 },
  { id: "caxias-ma-br", name: "Caxias", admin: "MA", country: "Brasil", lat: -4.865, lon: -43.3617, utcOffset: -3 },
  { id: "rio-das-ostras-rj-br", name: "Rio das Ostras", admin: "RJ", country: "Brasil", lat: -22.5174, lon: -41.9475, utcOffset: -3 },
  { id: "senador-canedo-go-br", name: "Senador Canedo", admin: "GO", country: "Brasil", lat: -16.7084, lon: -49.0914, utcOffset: -3 },
  { id: "santana-de-parnaiba-sp-br", name: "Santana de Parnaíba", admin: "SP", country: "Brasil", lat: -23.4439, lon: -46.9178, utcOffset: -3 },
  { id: "mogi-guacu-sp-br", name: "Mogi Guaçu", admin: "SP", country: "Brasil", lat: -22.3675, lon: -46.9428, utcOffset: -3 },
  { id: "pouso-alegre-mg-br", name: "Pouso Alegre", admin: "MG", country: "Brasil", lat: -22.2266, lon: -45.9389, utcOffset: -3 },
  { id: "araucaria-pr-br", name: "Araucária", admin: "PR", country: "Brasil", lat: -25.5859, lon: -49.4047, utcOffset: -3 },
  { id: "alagoinhas-ba-br", name: "Alagoinhas", admin: "BA", country: "Brasil", lat: -12.1335, lon: -38.4208, utcOffset: -3 },
  { id: "toledo-pr-br", name: "Toledo", admin: "PR", country: "Brasil", lat: -24.7246, lon: -53.7412, utcOffset: -3 },
  { id: "santa-rita-pb-br", name: "Santa Rita", admin: "PB", country: "Brasil", lat: -7.1172, lon: -34.9753, utcOffset: -3 },
  { id: "fazenda-rio-grande-pr-br", name: "Fazenda Rio Grande", admin: "PR", country: "Brasil", lat: -25.6624, lon: -49.3073, utcOffset: -3 },
  { id: "camaragibe-pe-br", name: "Camaragibe", admin: "PE", country: "Brasil", lat: -8.0235, lon: -34.9782, utcOffset: -3 },
  { id: "nilopolis-rj-br", name: "Nilópolis", admin: "RJ", country: "Brasil", lat: -22.8057, lon: -43.4233, utcOffset: -3 },
  { id: "paranagua-pr-br", name: "Paranaguá", admin: "PR", country: "Brasil", lat: -25.5161, lon: -48.5225, utcOffset: -3 },
  { id: "paco-do-lumiar-ma-br", name: "Paço do Lumiar", admin: "MA", country: "Brasil", lat: -2.5166, lon: -44.1019, utcOffset: -3 },
  { id: "teixeira-de-freitas-ba-br", name: "Teixeira de Freitas", admin: "BA", country: "Brasil", lat: -17.5399, lon: -39.74, utcOffset: -3 },
  { id: "botucatu-sp-br", name: "Botucatu", admin: "SP", country: "Brasil", lat: -22.8837, lon: -48.4437, utcOffset: -3 },
  { id: "franco-da-rocha-sp-br", name: "Franco da Rocha", admin: "SP", country: "Brasil", lat: -23.3229, lon: -46.729, utcOffset: -3 },
  { id: "garanhuns-pe-br", name: "Garanhuns", admin: "PE", country: "Brasil", lat: -8.8824, lon: -36.4966, utcOffset: -3 },
  { id: "trindade-go-br", name: "Trindade", admin: "GO", country: "Brasil", lat: -16.6517, lon: -49.4927, utcOffset: -3 },
  { id: "brusque-sc-br", name: "Brusque", admin: "SC", country: "Brasil", lat: -27.0977, lon: -48.9107, utcOffset: -3 },
  { id: "queimados-rj-br", name: "Queimados", admin: "RJ", country: "Brasil", lat: -22.7102, lon: -43.5518, utcOffset: -3 },
  { id: "balneario-camboriu-sc-br", name: "Balneário Camboriú", admin: "SC", country: "Brasil", lat: -26.9926, lon: -48.6352, utcOffset: -3 },
  { id: "teofilo-otoni-mg-br", name: "Teófilo Otoni", admin: "MG", country: "Brasil", lat: -17.8595, lon: -41.5087, utcOffset: -3 },
  { id: "varginha-mg-br", name: "Varginha", admin: "MG", country: "Brasil", lat: -21.5556, lon: -45.4364, utcOffset: -3 },
  { id: "campo-largo-pr-br", name: "Campo Largo", admin: "PR", country: "Brasil", lat: -25.4525, lon: -49.529, utcOffset: -3 },
  { id: "cachoeirinha-rs-br", name: "Cachoeirinha", admin: "RS", country: "Brasil", lat: -29.9472, lon: -51.1016, utcOffset: -3 },
  { id: "caraguatatuba-sp-br", name: "Caraguatatuba", admin: "SP", country: "Brasil", lat: -23.6125, lon: -45.4125, utcOffset: -3 },
  { id: "salto-sp-br", name: "Salto", admin: "SP", country: "Brasil", lat: -23.1996, lon: -47.2931, utcOffset: -3 },
  { id: "cameta-pa-br", name: "Cametá", admin: "PA", country: "Brasil", lat: -2.2429, lon: -49.4979, utcOffset: -3 },
  { id: "vitoria-de-santo-antao-pe-br", name: "Vitória de Santo Antão", admin: "PE", country: "Brasil", lat: -8.1282, lon: -35.2976, utcOffset: -3 },
  { id: "jau-sp-br", name: "Jaú", admin: "SP", country: "Brasil", lat: -22.2936, lon: -48.5592, utcOffset: -3 },
  { id: "santa-cruz-do-sul-rs-br", name: "Santa Cruz do Sul", admin: "RS", country: "Brasil", lat: -29.722, lon: -52.4343, utcOffset: -3 },
  { id: "tres-lagoas-ms-br", name: "Três Lagoas", admin: "MS", country: "Brasil", lat: -20.7849, lon: -51.7007, utcOffset: -4 },
  { id: "sapucaia-do-sul-rs-br", name: "Sapucaia do Sul", admin: "RS", country: "Brasil", lat: -29.8276, lon: -51.145, utcOffset: -3 },
  { id: "conselheiro-lafaiete-mg-br", name: "Conselheiro Lafaiete", admin: "MG", country: "Brasil", lat: -20.6634, lon: -43.7846, utcOffset: -3 },
  { id: "itapipoca-ce-br", name: "Itapipoca", admin: "CE", country: "Brasil", lat: -3.4993, lon: -39.5836, utcOffset: -3 },
  { id: "crato-ce-br", name: "Crato", admin: "CE", country: "Brasil", lat: -7.2153, lon: -39.4103, utcOffset: -3 },
  { id: "araras-sp-br", name: "Araras", admin: "SP", country: "Brasil", lat: -22.3572, lon: -47.3842, utcOffset: -3 },
  { id: "apucarana-pr-br", name: "Apucarana", admin: "PR", country: "Brasil", lat: -23.55, lon: -51.4635, utcOffset: -3 },
  { id: "araruama-rj-br", name: "Araruama", admin: "RJ", country: "Brasil", lat: -22.8697, lon: -42.3326, utcOffset: -3 },
  { id: "resende-rj-br", name: "Resende", admin: "RJ", country: "Brasil", lat: -22.4705, lon: -44.4509, utcOffset: -3 },
  { id: "sabara-mg-br", name: "Sabará", admin: "MG", country: "Brasil", lat: -19.884, lon: -43.8263, utcOffset: -3 },
  { id: "vespasiano-mg-br", name: "Vespasiano", admin: "MG", country: "Brasil", lat: -19.6883, lon: -43.9239, utcOffset: -3 },
  { id: "votorantim-sp-br", name: "Votorantim", admin: "SP", country: "Brasil", lat: -23.5446, lon: -47.4388, utcOffset: -3 },
  { id: "pinhais-pr-br", name: "Pinhais", admin: "PR", country: "Brasil", lat: -25.4429, lon: -49.1927, utcOffset: -3 },
  { id: "sertaozinho-sp-br", name: "Sertãozinho", admin: "SP", country: "Brasil", lat: -21.1316, lon: -47.9875, utcOffset: -3 },
  { id: "barcarena-pa-br", name: "Barcarena", admin: "PA", country: "Brasil", lat: -1.5119, lon: -48.6195, utcOffset: -3 },
  { id: "valinhos-sp-br", name: "Valinhos", admin: "SP", country: "Brasil", lat: -22.9698, lon: -46.9974, utcOffset: -3 },
  { id: "altamira-pa-br", name: "Altamira", admin: "PA", country: "Brasil", lat: -3.2041, lon: -52.21, utcOffset: -3 },
  { id: "barbacena-mg-br", name: "Barbacena", admin: "MG", country: "Brasil", lat: -21.2214, lon: -43.7703, utcOffset: -3 },
  { id: "guarapari-es-br", name: "Guarapari", admin: "ES", country: "Brasil", lat: -20.6772, lon: -40.5093, utcOffset: -3 },
  { id: "ji-parana-ro-br", name: "Ji-Paraná", admin: "RO", country: "Brasil", lat: -10.8777, lon: -61.9322, utcOffset: -4 },
  { id: "tatui-sp-br", name: "Tatuí", admin: "SP", country: "Brasil", lat: -23.3487, lon: -47.8461, utcOffset: -3 },
  { id: "sao-mateus-es-br", name: "São Mateus", admin: "ES", country: "Brasil", lat: -18.7214, lon: -39.8579, utcOffset: -3 },
  { id: "itaituba-pa-br", name: "Itaituba", admin: "PA", country: "Brasil", lat: -4.2667, lon: -55.9926, utcOffset: -3 },
  { id: "bento-goncalves-rs-br", name: "Bento Gonçalves", admin: "RS", country: "Brasil", lat: -29.1662, lon: -51.5165, utcOffset: -3 },
  { id: "braganca-pa-br", name: "Bragança", admin: "PA", country: "Brasil", lat: -1.0613, lon: -46.7826, utcOffset: -3 },
  { id: "barretos-sp-br", name: "Barretos", admin: "SP", country: "Brasil", lat: -20.5531, lon: -48.5698, utcOffset: -3 },
  { id: "itatiba-sp-br", name: "Itatiba", admin: "SP", country: "Brasil", lat: -23.0035, lon: -46.8464, utcOffset: -3 },
  { id: "colatina-es-br", name: "Colatina", admin: "ES", country: "Brasil", lat: -19.5493, lon: -40.6269, utcOffset: -3 },
  { id: "almirante-tamandare-pr-br", name: "Almirante Tamandaré", admin: "PR", country: "Brasil", lat: -25.3188, lon: -49.3037, utcOffset: -3 },
  { id: "arapongas-pr-br", name: "Arapongas", admin: "PR", country: "Brasil", lat: -23.4153, lon: -51.4259, utcOffset: -3 },
  { id: "birigui-sp-br", name: "Birigui", admin: "SP", country: "Brasil", lat: -21.291, lon: -50.3432, utcOffset: -3 },
  { id: "piraquara-pr-br", name: "Piraquara", admin: "PR", country: "Brasil", lat: -25.4422, lon: -49.0624, utcOffset: -3 },
  { id: "sarandi-pr-br", name: "Sarandi", admin: "PR", country: "Brasil", lat: -23.4441, lon: -51.876, utcOffset: -3 },
  { id: "jandira-sp-br", name: "Jandira", admin: "SP", country: "Brasil", lat: -23.5275, lon: -46.9023, utcOffset: -3 },
  { id: "guaratingueta-sp-br", name: "Guaratinguetá", admin: "SP", country: "Brasil", lat: -22.8075, lon: -45.1938, utcOffset: -3 },
  { id: "bage-rs-br", name: "Bagé", admin: "RS", country: "Brasil", lat: -31.3297, lon: -54.0999, utcOffset: -3 },
  { id: "araguari-mg-br", name: "Araguari", admin: "MG", country: "Brasil", lat: -18.6456, lon: -48.1934, utcOffset: -3 },
  { id: "uruguaiana-rs-br", name: "Uruguaiana", admin: "RS", country: "Brasil", lat: -29.7614, lon: -57.0853, utcOffset: -3 },
  { id: "umuarama-pr-br", name: "Umuarama", admin: "PR", country: "Brasil", lat: -23.7656, lon: -53.3201, utcOffset: -3 },
  { id: "itaguai-rj-br", name: "Itaguaí", admin: "RJ", country: "Brasil", lat: -22.8636, lon: -43.7798, utcOffset: -3 },
  { id: "formosa-go-br", name: "Formosa", admin: "GO", country: "Brasil", lat: -15.54, lon: -47.337, utcOffset: -3 },
  { id: "sao-goncalo-do-amarante-rn-br", name: "São Gonçalo do Amarante", admin: "RN", country: "Brasil", lat: -5.7907, lon: -35.3257, utcOffset: -3 },
  { id: "catanduva-sp-br", name: "Catanduva", admin: "SP", country: "Brasil", lat: -21.1314, lon: -48.977, utcOffset: -3 },
  { id: "varzea-paulista-sp-br", name: "Várzea Paulista", admin: "SP", country: "Brasil", lat: -23.2136, lon: -46.8234, utcOffset: -3 },
  { id: "ribeirao-pires-sp-br", name: "Ribeirão Pires", admin: "SP", country: "Brasil", lat: -23.7067, lon: -46.4058, utcOffset: -3 },
  { id: "igarassu-pe-br", name: "Igarassu", admin: "PE", country: "Brasil", lat: -7.8288, lon: -34.9013, utcOffset: -3 },
  { id: "simoes-filho-ba-br", name: "Simões Filho", admin: "BA", country: "Brasil", lat: -12.7866, lon: -38.4029, utcOffset: -3 },
  { id: "catalao-go-br", name: "Catalão", admin: "GO", country: "Brasil", lat: -18.1656, lon: -47.944, utcOffset: -3 },
  { id: "codo-ma-br", name: "Codó", admin: "MA", country: "Brasil", lat: -4.4556, lon: -43.8924, utcOffset: -3 },
  { id: "eunapolis-ba-br", name: "Eunápolis", admin: "BA", country: "Brasil", lat: -16.3715, lon: -39.5821, utcOffset: -3 },
  { id: "itabira-mg-br", name: "Itabira", admin: "MG", country: "Brasil", lat: -19.6239, lon: -43.2312, utcOffset: -3 },
  { id: "paulo-afonso-ba-br", name: "Paulo Afonso", admin: "BA", country: "Brasil", lat: -9.3983, lon: -38.2216, utcOffset: -3 },
  { id: "cubatao-sp-br", name: "Cubatão", admin: "SP", country: "Brasil", lat: -23.8911, lon: -46.424, utcOffset: -3 },
  { id: "itanhaem-sp-br", name: "Itanhaém", admin: "SP", country: "Brasil", lat: -24.1736, lon: -46.788, utcOffset: -3 },
  { id: "passos-mg-br", name: "Passos", admin: "MG", country: "Brasil", lat: -20.7193, lon: -46.609, utcOffset: -3 },
  { id: "marituba-pa-br", name: "Marituba", admin: "PA", country: "Brasil", lat: -1.36, lon: -48.3421, utcOffset: -3 },
  { id: "nova-lima-mg-br", name: "Nova Lima", admin: "MG", country: "Brasil", lat: -19.9758, lon: -43.8509, utcOffset: -3 },
  { id: "araxa-mg-br", name: "Araxá", admin: "MG", country: "Brasil", lat: -19.5902, lon: -46.9438, utcOffset: -3 },
  { id: "sao-lourenco-da-mata-pe-br", name: "São Lourenço da Mata", admin: "PE", country: "Brasil", lat: -8.0068, lon: -35.0124, utcOffset: -3 },
  { id: "sorriso-mt-br", name: "Sorriso", admin: "MT", country: "Brasil", lat: -12.5425, lon: -55.7211, utcOffset: -4 },
  { id: "paulinia-sp-br", name: "Paulínia", admin: "SP", country: "Brasil", lat: -22.7542, lon: -47.1488, utcOffset: -3 },
  { id: "tubarao-sc-br", name: "Tubarão", admin: "SC", country: "Brasil", lat: -28.4713, lon: -49.0144, utcOffset: -3 },
  { id: "itumbiara-go-br", name: "Itumbiara", admin: "GO", country: "Brasil", lat: -18.4093, lon: -49.2158, utcOffset: -3 },
  { id: "luis-eduardo-magalhaes-ba-br", name: "Luís Eduardo Magalhães", admin: "BA", country: "Brasil", lat: -12.0956, lon: -45.7866, utcOffset: -3 },
  { id: "santana-ap-br", name: "Santana", admin: "AP", country: "Brasil", lat: -0.0454, lon: -51.1729, utcOffset: -3 },
  { id: "cambe-pr-br", name: "Cambé", admin: "PR", country: "Brasil", lat: -23.2766, lon: -51.2798, utcOffset: -3 },
  { id: "breves-pa-br", name: "Breves", admin: "PA", country: "Brasil", lat: -1.6804, lon: -50.4791, utcOffset: -3 },
  { id: "acailandia-ma-br", name: "Açailândia", admin: "MA", country: "Brasil", lat: -4.9471, lon: -47.5004, utcOffset: -3 },
  { id: "tangara-da-serra-mt-br", name: "Tangará da Serra", admin: "MT", country: "Brasil", lat: -14.6229, lon: -57.4933, utcOffset: -4 },
  { id: "jatai-go-br", name: "Jataí", admin: "GO", country: "Brasil", lat: -17.8784, lon: -51.7204, utcOffset: -3 },
  { id: "erechim-rs-br", name: "Erechim", admin: "RS", country: "Brasil", lat: -27.6364, lon: -52.2697, utcOffset: -3 },
  { id: "nova-serrana-mg-br", name: "Nova Serrana", admin: "MG", country: "Brasil", lat: -19.8713, lon: -44.9847, utcOffset: -3 },
  { id: "paragominas-pa-br", name: "Paragominas", admin: "PA", country: "Brasil", lat: -3.0021, lon: -47.3527, utcOffset: -3 },
  { id: "maranguape-ce-br", name: "Maranguape", admin: "CE", country: "Brasil", lat: -3.8914, lon: -38.6829, utcOffset: -3 },
  { id: "planaltina-go-br", name: "Planaltina", admin: "GO", country: "Brasil", lat: -15.452, lon: -47.6089, utcOffset: -3 },
  { id: "lavras-mg-br", name: "Lavras", admin: "MG", country: "Brasil", lat: -21.248, lon: -45.0009, utcOffset: -3 },
  { id: "coronel-fabriciano-mg-br", name: "Coronel Fabriciano", admin: "MG", country: "Brasil", lat: -19.5179, lon: -42.6276, utcOffset: -3 },
  { id: "muriae-mg-br", name: "Muriaé", admin: "MG", country: "Brasil", lat: -21.13, lon: -42.3693, utcOffset: -3 },
  { id: "sao-pedro-da-aldeia-rj-br", name: "São Pedro da Aldeia", admin: "RJ", country: "Brasil", lat: -22.8429, lon: -42.1026, utcOffset: -3 },
  { id: "ourinhos-sp-br", name: "Ourinhos", admin: "SP", country: "Brasil", lat: -22.9797, lon: -49.8697, utcOffset: -3 },
  { id: "novo-gama-go-br", name: "Novo Gama", admin: "GO", country: "Brasil", lat: -16.0592, lon: -48.0417, utcOffset: -3 },
  { id: "poa-sp-br", name: "Poá", admin: "SP", country: "Brasil", lat: -23.5333, lon: -46.3473, utcOffset: -3 },
  { id: "bacabal-ma-br", name: "Bacabal", admin: "MA", country: "Brasil", lat: -4.2245, lon: -44.7832, utcOffset: -3 },
  { id: "itacoatiara-am-br", name: "Itacoatiara", admin: "AM", country: "Brasil", lat: -3.1386, lon: -58.4449, utcOffset: -4 },
  { id: "itabaiana-se-br", name: "Itabaiana", admin: "SE", country: "Brasil", lat: -10.6826, lon: -37.4273, utcOffset: -3 },
  { id: "uba-mg-br", name: "Ubá", admin: "MG", country: "Brasil", lat: -21.1204, lon: -42.9359, utcOffset: -3 },
  { id: "patos-pb-br", name: "Patos", admin: "PB", country: "Brasil", lat: -7.0174, lon: -37.2747, utcOffset: -3 },
  { id: "camboriu-sc-br", name: "Camboriú", admin: "SC", country: "Brasil", lat: -27.0241, lon: -48.6503, utcOffset: -3 },
  { id: "santo-antonio-de-jesus-ba-br", name: "Santo Antônio de Jesus", admin: "BA", country: "Brasil", lat: -12.9614, lon: -39.2584, utcOffset: -3 },
  { id: "ituiutaba-mg-br", name: "Ituiutaba", admin: "MG", country: "Brasil", lat: -18.9772, lon: -49.4639, utcOffset: -3 },
  { id: "manacapuru-am-br", name: "Manacapuru", admin: "AM", country: "Brasil", lat: -3.2907, lon: -60.6216, utcOffset: -4 },
  { id: "balsas-ma-br", name: "Balsas", admin: "MA", country: "Brasil", lat: -7.5321, lon: -46.0372, utcOffset: -3 },
  { id: "lagarto-se-br", name: "Lagarto", admin: "SE", country: "Brasil", lat: -10.9136, lon: -37.6689, utcOffset: -3 },
  { id: "assis-sp-br", name: "Assis", admin: "SP", country: "Brasil", lat: -22.66, lon: -50.4183, utcOffset: -3 },
  { id: "itaperuna-rj-br", name: "Itaperuna", admin: "RJ", country: "Brasil", lat: -21.1997, lon: -41.8799, utcOffset: -3 },
  { id: "campo-mourao-pr-br", name: "Campo Mourão", admin: "PR", country: "Brasil", lat: -24.0463, lon: -52.378, utcOffset: -3 },
  { id: "ipojuca-pe-br", name: "Ipojuca", admin: "PE", country: "Brasil", lat: -8.393, lon: -35.0609, utcOffset: -3 },
  { id: "caldas-novas-go-br", name: "Caldas Novas", admin: "GO", country: "Brasil", lat: -17.7441, lon: -48.6246, utcOffset: -3 },
  { id: "abreu-e-lima-pe-br", name: "Abreu e Lima", admin: "PE", country: "Brasil", lat: -7.9007, lon: -34.8984, utcOffset: -3 },
  { id: "santa-cruz-do-capibaribe-pe-br", name: "Santa Cruz do Capibaribe", admin: "PE", country: "Brasil", lat: -7.948, lon: -36.2061, utcOffset: -3 },
  { id: "leme-sp-br", name: "Leme", admin: "SP", country: "Brasil", lat: -22.1809, lon: -47.3841, utcOffset: -3 },
  { id: "iguatu-ce-br", name: "Iguatu", admin: "CE", country: "Brasil", lat: -6.3628, lon: -39.2892, utcOffset: -3 },
  { id: "itauna-mg-br", name: "Itaúna", admin: "MG", country: "Brasil", lat: -20.0818, lon: -44.5801, utcOffset: -3 },
  { id: "para-de-minas-mg-br", name: "Pará de Minas", admin: "MG", country: "Brasil", lat: -19.8534, lon: -44.6114, utcOffset: -3 },
  { id: "ariquemes-ro-br", name: "Ariquemes", admin: "RO", country: "Brasil", lat: -9.9057, lon: -63.0325, utcOffset: -4 },
  { id: "francisco-beltrao-pr-br", name: "Francisco Beltrão", admin: "PR", country: "Brasil", lat: -26.0817, lon: -53.0535, utcOffset: -3 },
  { id: "votuporanga-sp-br", name: "Votuporanga", admin: "SP", country: "Brasil", lat: -20.4237, lon: -49.9781, utcOffset: -3 },
  { id: "parintins-am-br", name: "Parintins", admin: "AM", country: "Brasil", lat: -2.6374, lon: -56.729, utcOffset: -4 },
  { id: "japeri-rj-br", name: "Japeri", admin: "RJ", country: "Brasil", lat: -22.6435, lon: -43.6602, utcOffset: -3 },
  { id: "corumba-ms-br", name: "Corumbá", admin: "MS", country: "Brasil", lat: -19.0077, lon: -57.651, utcOffset: -4 },
  { id: "cacapava-sp-br", name: "Caçapava", admin: "SP", country: "Brasil", lat: -23.0992, lon: -45.7076, utcOffset: -3 },
  { id: "vilhena-ro-br", name: "Vilhena", admin: "RO", country: "Brasil", lat: -12.7502, lon: -60.1488, utcOffset: -4 },
  { id: "sao-cristovao-se-br", name: "São Cristóvão", admin: "SE", country: "Brasil", lat: -11.0084, lon: -37.2044, utcOffset: -3 },
  { id: "caieiras-sp-br", name: "Caieiras", admin: "SP", country: "Brasil", lat: -23.3607, lon: -46.7397, utcOffset: -3 },
  { id: "aracruz-es-br", name: "Aracruz", admin: "ES", country: "Brasil", lat: -19.82, lon: -40.2764, utcOffset: -3 },
  { id: "paracatu-mg-br", name: "Paracatu", admin: "MG", country: "Brasil", lat: -17.2252, lon: -46.8711, utcOffset: -3 },
  { id: "rio-largo-al-br", name: "Rio Largo", admin: "AL", country: "Brasil", lat: -9.4778, lon: -35.8394, utcOffset: -3 },
  { id: "mairipora-sp-br", name: "Mairiporã", admin: "SP", country: "Brasil", lat: -23.3171, lon: -46.5897, utcOffset: -3 },
  { id: "lajeado-rs-br", name: "Lajeado", admin: "RS", country: "Brasil", lat: -29.4591, lon: -51.9644, utcOffset: -3 },
  { id: "itajuba-mg-br", name: "Itajubá", admin: "MG", country: "Brasil", lat: -22.4225, lon: -45.4598, utcOffset: -3 },
  { id: "ubatuba-sp-br", name: "Ubatuba", admin: "SP", country: "Brasil", lat: -23.4332, lon: -45.0834, utcOffset: -3 },
  { id: "guaiba-rs-br", name: "Guaíba", admin: "RS", country: "Brasil", lat: -30.1086, lon: -51.3233, utcOffset: -3 },
  { id: "barra-do-pirai-rj-br", name: "Barra do Piraí", admin: "RJ", country: "Brasil", lat: -22.4715, lon: -43.8269, utcOffset: -3 },
  { id: "avare-sp-br", name: "Avaré", admin: "SP", country: "Brasil", lat: -23.1067, lon: -48.9251, utcOffset: -3 },
  { id: "cajamar-sp-br", name: "Cajamar", admin: "SP", country: "Brasil", lat: -23.355, lon: -46.8781, utcOffset: -3 },
  { id: "mogi-mirim-sp-br", name: "Mogi Mirim", admin: "SP", country: "Brasil", lat: -22.4332, lon: -46.9532, utcOffset: -3 },
  { id: "sao-joao-da-boa-vista-sp-br", name: "São João da Boa Vista", admin: "SP", country: "Brasil", lat: -21.9707, lon: -46.7944, utcOffset: -3 },
  { id: "serra-talhada-pe-br", name: "Serra Talhada", admin: "PE", country: "Brasil", lat: -7.9818, lon: -38.289, utcOffset: -3 },
  { id: "ponta-pora-ms-br", name: "Ponta Porã", admin: "MS", country: "Brasil", lat: -22.5296, lon: -55.7203, utcOffset: -4 },
  { id: "paranavai-pr-br", name: "Paranavaí", admin: "PR", country: "Brasil", lat: -23.0816, lon: -52.4617, utcOffset: -3 },
  { id: "cruzeiro-do-sul-ac-br", name: "Cruzeiro do Sul", admin: "AC", country: "Brasil", lat: -7.6276, lon: -72.6756, utcOffset: -5 },
  { id: "manhuacu-mg-br", name: "Manhuaçu", admin: "MG", country: "Brasil", lat: -20.2572, lon: -42.028, utcOffset: -3 },
  { id: "pato-branco-pr-br", name: "Pato Branco", admin: "PR", country: "Brasil", lat: -26.2292, lon: -52.6706, utcOffset: -3 },
  { id: "cidade-ocidental-go-br", name: "Cidade Ocidental", admin: "GO", country: "Brasil", lat: -16.0765, lon: -47.9252, utcOffset: -3 },
  { id: "tucurui-pa-br", name: "Tucuruí", admin: "PA", country: "Brasil", lat: -3.7657, lon: -49.6773, utcOffset: -3 },
  { id: "sao-joao-del-rei-mg-br", name: "São João del Rei", admin: "MG", country: "Brasil", lat: -21.1311, lon: -44.2526, utcOffset: -3 },
  { id: "patrocinio-mg-br", name: "Patrocínio", admin: "MG", country: "Brasil", lat: -18.9379, lon: -46.9934, utcOffset: -3 },
  { id: "itapeva-sp-br", name: "Itapeva", admin: "SP", country: "Brasil", lat: -23.9788, lon: -48.8764, utcOffset: -3 },
  { id: "caceres-mt-br", name: "Cáceres", admin: "MT", country: "Brasil", lat: -16.0764, lon: -57.6818, utcOffset: -4 },
  { id: "saquarema-rj-br", name: "Saquarema", admin: "RJ", country: "Brasil", lat: -22.9292, lon: -42.5099, utcOffset: -3 },
  { id: "guanambi-ba-br", name: "Guanambi", admin: "BA", country: "Brasil", lat: -14.2231, lon: -42.7799, utcOffset: -3 },
  { id: "caratinga-mg-br", name: "Caratinga", admin: "MG", country: "Brasil", lat: -19.7868, lon: -42.1292, utcOffset: -3 },
  { id: "cacoal-ro-br", name: "Cacoal", admin: "RO", country: "Brasil", lat: -11.4343, lon: -61.4562, utcOffset: -4 },
  { id: "aruja-sp-br", name: "Arujá", admin: "SP", country: "Brasil", lat: -23.3965, lon: -46.32, utcOffset: -3 },
  { id: "unai-mg-br", name: "Unaí", admin: "MG", country: "Brasil", lat: -16.3592, lon: -46.9022, utcOffset: -3 },
  { id: "gravata-pe-br", name: "Gravatá", admin: "PE", country: "Brasil", lat: -8.2112, lon: -35.5675, utcOffset: -3 },
  { id: "navegantes-sc-br", name: "Navegantes", admin: "SC", country: "Brasil", lat: -26.8943, lon: -48.6546, utcOffset: -3 },
  { id: "valenca-ba-br", name: "Valença", admin: "BA", country: "Brasil", lat: -13.3669, lon: -39.073, utcOffset: -3 },
  { id: "esmeraldas-mg-br", name: "Esmeraldas", admin: "MG", country: "Brasil", lat: -19.764, lon: -44.3065, utcOffset: -3 },
  { id: "redencao-pa-br", name: "Redenção", admin: "PA", country: "Brasil", lat: -8.0253, lon: -50.0317, utcOffset: -3 },
  { id: "primavera-do-leste-mt-br", name: "Primavera do Leste", admin: "MT", country: "Brasil", lat: -15.544, lon: -54.2811, utcOffset: -4 },
  { id: "gurupi-to-br", name: "Gurupi", admin: "TO", country: "Brasil", lat: -11.7279, lon: -49.068, utcOffset: -3 },
  { id: "araripina-pe-br", name: "Araripina", admin: "PE", country: "Brasil", lat: -7.5707, lon: -40.494, utcOffset: -3 },
  { id: "santa-ines-ma-br", name: "Santa Inês", admin: "MA", country: "Brasil", lat: -3.6511, lon: -45.3774, utcOffset: -3 },
  { id: "lorena-sp-br", name: "Lorena", admin: "SP", country: "Brasil", lat: -22.7334, lon: -45.1197, utcOffset: -3 },
  { id: "ijui-rs-br", name: "Ijuí", admin: "RS", country: "Brasil", lat: -28.388, lon: -53.92, utcOffset: -3 },
  { id: "pinheiro-ma-br", name: "Pinheiro", admin: "MA", country: "Brasil", lat: -2.5222, lon: -45.0788, utcOffset: -3 },
  { id: "barra-do-corda-ma-br", name: "Barra do Corda", admin: "MA", country: "Brasil", lat: -5.4968, lon: -45.2485, utcOffset: -3 },
  { id: "santana-do-livramento-rs-br", name: "Sant'Ana do Livramento", admin: "RS", country: "Brasil", lat: -30.8773, lon: -55.5392, utcOffset: -3 },
  { id: "quixada-ce-br", name: "Quixadá", admin: "CE", country: "Brasil", lat: -4.9663, lon: -39.0155, utcOffset: -3 },
  { id: "moju-pa-br", name: "Moju", admin: "PA", country: "Brasil", lat: -1.8899, lon: -48.7668, utcOffset: -3 },
  { id: "lucas-do-rio-verde-mt-br", name: "Lucas do Rio Verde", admin: "MT", country: "Brasil", lat: -13.0588, lon: -55.9042, utcOffset: -4 },
  { id: "sao-bento-do-sul-sc-br", name: "São Bento do Sul", admin: "SC", country: "Brasil", lat: -26.2495, lon: -49.3831, utcOffset: -3 },
  { id: "picos-pi-br", name: "Picos", admin: "PI", country: "Brasil", lat: -7.0772, lon: -41.467, utcOffset: -3 },
  { id: "bayeux-pb-br", name: "Bayeux", admin: "PB", country: "Brasil", lat: -7.1238, lon: -34.9293, utcOffset: -3 },
  { id: "jacobina-ba-br", name: "Jacobina", admin: "BA", country: "Brasil", lat: -11.1812, lon: -40.5117, utcOffset: -3 },
  { id: "macaiba-rn-br", name: "Macaíba", admin: "RN", country: "Brasil", lat: -5.8523, lon: -35.3552, utcOffset: -3 },
  { id: "quixeramobim-ce-br", name: "Quixeramobim", admin: "CE", country: "Brasil", lat: -5.1907, lon: -39.2889, utcOffset: -3 },
  { id: "concordia-sc-br", name: "Concórdia", admin: "SC", country: "Brasil", lat: -27.2335, lon: -52.026, utcOffset: -3 },
  { id: "sao-sebastiao-sp-br", name: "São Sebastião", admin: "SP", country: "Brasil", lat: -23.7951, lon: -45.4143, utcOffset: -3 },
  { id: "timoteo-mg-br", name: "Timóteo", admin: "MG", country: "Brasil", lat: -19.5811, lon: -42.6471, utcOffset: -3 },
  { id: "pacatuba-ce-br", name: "Pacatuba", admin: "CE", country: "Brasil", lat: -3.9784, lon: -38.6183, utcOffset: -3 },
  { id: "tiangua-ce-br", name: "Tianguá", admin: "CE", country: "Brasil", lat: -3.7296, lon: -40.9923, utcOffset: -3 },
  { id: "chapadinha-ma-br", name: "Chapadinha", admin: "MA", country: "Brasil", lat: -3.7387, lon: -43.3538, utcOffset: -3 },
  { id: "goiana-pe-br", name: "Goiana", admin: "PE", country: "Brasil", lat: -7.5606, lon: -34.9959, utcOffset: -3 },
  { id: "curvelo-mg-br", name: "Curvelo", admin: "MG", country: "Brasil", lat: -18.7527, lon: -44.4303, utcOffset: -3 },

  // Colômbia
  { id: "bogota-co", name: "Bogotá", admin: "", country: "Colômbia", lat: 4.7110, lon: -74.0721, utcOffset: -5 },
  { id: "medellin-co", name: "Medellín", admin: "", country: "Colômbia", lat: 6.2442, lon: -75.5812, utcOffset: -5 },

  // Argentina
  { id: "buenos-aires-ar", name: "Buenos Aires", admin: "", country: "Argentina", lat: -34.6037, lon: -58.3816, utcOffset: -3 },
  { id: "cordoba-ar", name: "Córdoba", admin: "", country: "Argentina", lat: -31.4201, lon: -64.1888, utcOffset: -3 },

  // México
  { id: "ciudad-de-mexico-mx", name: "Cidade do México", admin: "", country: "México", lat: 19.4326, lon: -99.1332, utcOffset: -6 },
  { id: "guadalajara-mx", name: "Guadalajara", admin: "", country: "México", lat: 20.6597, lon: -103.3496, utcOffset: -6 },
  { id: "monterrey-mx", name: "Monterrey", admin: "", country: "México", lat: 25.6866, lon: -100.3161, utcOffset: -6 },

  // Peru
  { id: "lima-pe", name: "Lima", admin: "", country: "Peru", lat: -12.0464, lon: -77.0428, utcOffset: -5 },
  { id: "arequipa-pe", name: "Arequipa", admin: "", country: "Peru", lat: -16.4090, lon: -71.5375, utcOffset: -5 },

  // Chile
  { id: "santiago-cl", name: "Santiago", admin: "", country: "Chile", lat: -33.4489, lon: -70.6693, utcOffset: -4 },
  { id: "valparaiso-cl", name: "Valparaíso", admin: "", country: "Chile", lat: -33.0472, lon: -71.6127, utcOffset: -4 },

  // Uruguai
  { id: "montevideo-uy", name: "Montevidéu", admin: "", country: "Uruguai", lat: -34.9011, lon: -56.1645, utcOffset: -3 },

  // Venezuela
  { id: "caracas-ve", name: "Caracas", admin: "", country: "Venezuela", lat: 10.4806, lon: -66.9036, utcOffset: -4 },

  // Equador
  { id: "quito-ec", name: "Quito", admin: "", country: "Equador", lat: -0.1807, lon: -78.4678, utcOffset: -5 },
  { id: "guayaquil-ec", name: "Guayaquil", admin: "", country: "Equador", lat: -2.1894, lon: -79.8891, utcOffset: -5 },

  // Bolívia
  { id: "la-paz-bo", name: "La Paz", admin: "", country: "Bolívia", lat: -16.5000, lon: -68.1500, utcOffset: -4 },

  // Paraguai
  { id: "asuncion-py", name: "Assunção", admin: "", country: "Paraguai", lat: -25.2637, lon: -57.5759, utcOffset: -4 },

  // América Central
  { id: "san-jose-cr", name: "San José", admin: "", country: "Costa Rica", lat: 9.9281, lon: -84.0907, utcOffset: -6 },
  { id: "cidade-da-guatemala-gt", name: "Cidade da Guatemala", admin: "", country: "Guatemala", lat: 14.6349, lon: -90.5069, utcOffset: -6 },
  { id: "san-salvador-sv", name: "San Salvador", admin: "", country: "El Salvador", lat: 13.6929, lon: -89.2182, utcOffset: -6 },
  { id: "tegucigalpa-hn", name: "Tegucigalpa", admin: "", country: "Honduras", lat: 14.0723, lon: -87.1921, utcOffset: -6 },
  { id: "managua-ni", name: "Manágua", admin: "", country: "Nicarágua", lat: 12.1364, lon: -86.2514, utcOffset: -6 },
  { id: "cidade-do-panama-pa", name: "Cidade do Panamá", admin: "", country: "Panamá", lat: 8.9824, lon: -79.5199, utcOffset: -5 },

  // Caribe
  { id: "santo-domingo-do", name: "Santo Domingo", admin: "", country: "República Dominicana", lat: 18.4861, lon: -69.9312, utcOffset: -4 },
  { id: "san-juan-pr", name: "San Juan", admin: "", country: "Porto Rico", lat: 18.4655, lon: -66.1057, utcOffset: -4 },
  { id: "havana-cu", name: "Havana", admin: "", country: "Cuba", lat: 23.1136, lon: -82.3666, utcOffset: -5 },
];

// --- Busca -----------------------------------------------------------------

// Normaliza pra busca: tira acentos E pontuação ("D'Oeste" -> "d oeste", então
// "Santa Bárbara d'Oeste" é achado digitando "santa barbara doeste"), e colapsa
// separadores num espaço único pra permitir busca por termos soltos.
// ATENCAO: a faixa de acentos vai escrita como \u0300-\u036f (escape ASCII) de
// proposito. Antes estava com os caracteres combinantes literais no fonte
// (/[<U+0300>-<U+036F>]/), que sao invisiveis num editor e colam no colchete
// anterior se o arquivo passar por qualquer normalizacao NFC / conversao de
// encoding — a regex vira outra coisa em silencio e a busca sem acento morre.
function normalize(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Variante "colada": igual a normalize, mas some com a pontuacao em vez de
// virar espaco. E o que faz "santa barbara doeste" achar "Santa Bárbara
// d'Oeste" — em normalize o apostrofo vira espaco e o nome indexado fica
// "santa barbara d oeste", entao o termo "doeste" nunca batia (o comentario
// acima ja prometia esse comportamento, mas ele nao existia de fato).
function normalizeTight(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

// Nome por extenso do estado, só pra BUSCA (nunca é exibido): quem digita
// "minas", "bahia" ou "rio grande do sul" encontra as cidades daquele estado
// sem precisar saber a sigla.
const UF_NOMES = {
  AC: "acre", AL: "alagoas", AP: "amapa", AM: "amazonas", BA: "bahia",
  CE: "ceara", DF: "distrito federal", ES: "espirito santo", GO: "goias",
  MA: "maranhao", MT: "mato grosso", MS: "mato grosso do sul",
  MG: "minas gerais", PA: "para", PB: "paraiba", PR: "parana",
  PE: "pernambuco", PI: "piaui", RJ: "rio de janeiro",
  RN: "rio grande do norte", RS: "rio grande do sul", RO: "rondonia",
  RR: "roraima", SC: "santa catarina", SP: "sao paulo", SE: "sergipe",
  TO: "tocantins",
};

// Índice pré-calculado uma única vez (não a cada tecla digitada): normalizar
// 400+ nomes a cada keystroke seria desperdício puro agora que a lista cresceu.
// O haystack guarda as DUAS formas do nome: a separada por espaco e a "colada"
// (sem pontuacao). Assim tanto "santa barbara d oeste" quanto "santa barbara
// doeste" acham a mesma cidade, que e o comportamento prometido no comentario
// de normalize().
const INDEX = CITIES.map((c) => ({
  city: c,
  name: normalize(c.name),
  haystack:
    normalize(c.name + " " + c.admin + " " + (UF_NOMES[c.admin] || "") + " " + c.country) +
    " " +
    normalizeTight(c.name),
}));

export function cityById(id) {
  return CITIES.find((c) => c.id === id) || null;
}

// Filtra CITIES por termos (acento/pontuação-insensível) no nome, no estado
// (sigla OU nome por extenso) ou no país. Todos os termos digitados precisam
// bater em algum campo ("osasco sp", "sao bernardo"), e o resultado sai
// ORDENADO por relevância: nome exato primeiro, depois quem começa com o que
// foi digitado, depois quem tem o termo no começo de uma palavra, depois o
// resto. Sem essa ordenação, digitar "sao" devolvia "São Paulo" e "São Luís"
// perdidos no meio de dezenas de "Santo/Santa/São ..." em ordem de população.
// Query vazia devolve a lista inteira, já em ordem de população — ou seja, as
// cidades mais prováveis primeiro.
export function searchCities(query) {
  const q = normalize(query);
  if (!q) return CITIES;
  const terms = q.split(" ").filter(Boolean);
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
    else if ((" " + entry.name).includes(" " + q)) score = 2;
    else if (entry.name.includes(q)) score = 3;
    hits.push({ city: entry.city, score, i });
  }
  hits.sort((a, b) => a.score - b.score || a.i - b.i);
  return hits.map((h) => h.city);
}

export function cityLabel(city) {
  if (!city) return "";
  return city.admin ? `${city.name}, ${city.admin} — ${city.country}` : `${city.name} — ${city.country}`;
}
