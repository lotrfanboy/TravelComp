/**
 * Biblioteca de imagens de países/destinos para uso na aplicação
 * 
 * Fornece imagens representativas para destinos comuns sem necessidade
 * de chamadas a APIs externas (para prova de conceito)
 */

interface CountryImage {
  country: string;
  image: string;
  alt: string;
}

export const countryImages: CountryImage[] = [
  {
    country: 'Brasil',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
    alt: 'Vista do Rio de Janeiro com o Cristo Redentor'
  },
  {
    country: 'Brazil',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
    alt: 'View of Rio de Janeiro with Christ the Redeemer'
  },
  {
    country: 'Portugal',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80',
    alt: 'Ruas coloridas de Lisboa, Portugal'
  },
  {
    country: 'Itália',
    image: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=800&q=80',
    alt: 'Coliseu de Roma, Itália'
  },
  {
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=800&q=80',
    alt: 'Colosseum in Rome, Italy'
  },
  {
    country: 'França',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
    alt: 'Torre Eiffel em Paris, França'
  },
  {
    country: 'France',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
    alt: 'Eiffel Tower in Paris, France'
  },
  {
    country: 'Espanha',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
    alt: 'Sagrada Família em Barcelona, Espanha'
  },
  {
    country: 'Spain',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
    alt: 'Sagrada Familia in Barcelona, Spain'
  },
  {
    country: 'Alemanha',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
    alt: 'Castelo de Neuschwanstein, Alemanha'
  },
  {
    country: 'Germany',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
    alt: 'Neuschwanstein Castle, Germany'
  },
  {
    country: 'Reino Unido',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    alt: 'Big Ben e Parlamento, Londres, Reino Unido'
  },
  {
    country: 'United Kingdom',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    alt: 'Big Ben and Parliament, London, United Kingdom'
  },
  {
    country: 'Estados Unidos',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    alt: 'Ponte Golden Gate, São Francisco, EUA'
  },
  {
    country: 'United States',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    alt: 'Golden Gate Bridge, San Francisco, USA'
  },
  {
    country: 'Japão',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    alt: 'Monte Fuji com flores de cerejeira, Japão'
  },
  {
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    alt: 'Mount Fuji with cherry blossoms, Japan'
  },
  {
    country: 'Austrália',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
    alt: 'Opera House de Sydney, Austrália'
  },
  {
    country: 'Australia',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
    alt: 'Sydney Opera House, Australia'
  },
  {
    country: 'Canadá',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80',
    alt: 'Montanhas Rochosas Canadenses, Canadá'
  },
  {
    country: 'Canada',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80',
    alt: 'Canadian Rocky Mountains, Canada'
  },
  {
    country: 'Holanda',
    image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80',
    alt: 'Campos de tulipas holandesas, Holanda'
  },
  {
    country: 'Netherlands',
    image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80',
    alt: 'Dutch tulip fields, Netherlands'
  },
  {
    country: 'China',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
    alt: 'Grande Muralha da China'
  },
  {
    country: 'Índia',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    alt: 'Taj Mahal, Índia'
  },
  {
    country: 'India',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    alt: 'Taj Mahal, India'
  },
];

/**
 * Obtém imagem representativa para o país/destino
 */
export function getCountryImage(country: string): string {
  // Procurar correspondência exata no array de imagens
  const countryMatch = countryImages.find(item => 
    item.country.toLowerCase() === country.toLowerCase()
  );
  
  // Se encontrar, retornar a imagem correspondente
  if (countryMatch) {
    return countryMatch.image;
  }
  
  // Procurar correspondência parcial (para países com nomes longos ou variações)
  const partialMatch = countryImages.find(item => 
    country.toLowerCase().includes(item.country.toLowerCase()) || 
    item.country.toLowerCase().includes(country.toLowerCase())
  );
  
  // Se encontrar correspondência parcial, retornar essa imagem
  if (partialMatch) {
    return partialMatch.image;
  }
  
  // Imagem genérica de viagem quando não encontrar correspondência
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
}

/**
 * Obtém o continente com base no país/região
 */
export function getContinent(country: string): string {
  const continentMap: Record<string, string[]> = {
    'Europa': [
      'portugal', 'espanha', 'spain', 'frança', 'france', 'itália', 'italy', 
      'alemanha', 'germany', 'reino unido', 'united kingdom', 'holanda', 
      'netherlands', 'suíça', 'switzerland', 'áustria', 'austria', 'bélgica', 
      'belgium', 'irlanda', 'ireland', 'grécia', 'greece', 'suécia', 'sweden', 
      'noruega', 'norway', 'dinamarca', 'denmark', 'finlândia', 'finland', 
      'islândia', 'iceland', 'polônia', 'poland', 'ucrânia', 'ukraine', 
      'república tcheca', 'czech republic', 'hungria', 'hungary', 'romênia', 
      'romania', 'croácia', 'croatia', 'sérvia', 'serbia', 'bulgária', 'bulgaria'
    ],
    'América do Norte': [
      'estados unidos', 'united states', 'canadá', 'canada', 'méxico', 'mexico'
    ],
    'América do Sul': [
      'brasil', 'brazil', 'argentina', 'chile', 'colômbia', 'colombia', 
      'peru', 'equador', 'ecuador', 'venezuela', 'bolívia', 'bolivia', 
      'uruguai', 'uruguay', 'paraguai', 'paraguay'
    ],
    'Ásia': [
      'japão', 'japan', 'china', 'índia', 'india', 'tailândia', 'thailand', 
      'vietnã', 'vietnam', 'indonésia', 'indonesia', 'malásia', 'malaysia', 
      'singapura', 'singapore', 'coréia do sul', 'south korea', 'taiwan', 
      'filipinas', 'philippines', 'hong kong', 'emirados árabes', 'united arab emirates'
    ],
    'Oceania': [
      'austrália', 'australia', 'nova zelândia', 'new zealand', 'fiji', 'samoa'
    ],
    'África': [
      'áfrica do sul', 'south africa', 'egito', 'egypt', 'marrocos', 'morocco', 
      'quênia', 'kenya', 'tanzânia', 'tanzania', 'etiópia', 'ethiopia', 
      'gana', 'ghana', 'nigéria', 'nigeria', 'senegal'
    ]
  };

  const countryLower = country.toLowerCase();
  
  for (const [continent, countries] of Object.entries(continentMap)) {
    if (countries.some(c => countryLower.includes(c))) {
      return continent;
    }
  }
  
  return 'Desconhecido';
}