// Lookup estático de cidades (lat/lon/fuso) para o cálculo do Ascendente —
// sem geocoding por API (nenhuma chave disponível pro app). Cobre o mercado
// primário do app (Brasil, todas as regiões) mais as capitais/grandes cidades
// dos principais países de língua espanhola, para o público hispanofalante do
// funil. Coordenadas são de conhecimento público (centro da cidade, ~0.1° de
// precisão) — a granularidade de cidade já é o maior fator de erro do cálculo
// de Ascendente (ver caveat na tela de revelação), então mais casas decimais
// não ajudariam.
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

// Remove acentos pra permitir busca "acento-insensível" (ex.: "sao paulo" acha "São Paulo").
function normalize(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function cityById(id) {
  return CITIES.find((c) => c.id === id) || null;
}

// Filtra CITIES por substring (acento-insensível) no nome, estado/admin ou país.
// Query vazia devolve a lista inteira (pra popular o picker antes de digitar).
export function searchCities(query) {
  const q = normalize(query).trim();
  if (!q) return CITIES;
  return CITIES.filter((c) => {
    const haystack = normalize(`${c.name} ${c.admin} ${c.country}`);
    return haystack.includes(q);
  });
}

export function cityLabel(city) {
  if (!city) return "";
  return city.admin ? `${city.name}, ${city.admin} — ${city.country}` : `${city.name} — ${city.country}`;
}
