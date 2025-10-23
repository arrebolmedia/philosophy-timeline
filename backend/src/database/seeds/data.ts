// Datos de períodos históricos
export const periods = [
  {
    name: 'Filosofía Antigua',
    slug: 'antigua',
    startYear: -600,
    endYear: 500,
    colorHex: '#8B4513',
    description: 'Desde los presocráticos hasta el final del mundo antiguo'
  },
  {
    name: 'Filosofía Medieval',
    slug: 'medieval',
    startYear: 500,
    endYear: 1400,
    colorHex: '#4682B4',
    description: 'Filosofía cristiana, islámica y judía medieval'
  },
  {
    name: 'Renacimiento',
    slug: 'renacimiento',
    startYear: 1400,
    endYear: 1600,
    colorHex: '#DAA520',
    description: 'Humanismo y renovación del pensamiento clásico'
  },
  {
    name: 'Filosofía Moderna',
    slug: 'moderna',
    startYear: 1600,
    endYear: 1800,
    colorHex: '#228B22',
    description: 'Racionalismo, empirismo e Ilustración'
  },
  {
    name: 'Filosofía del s. XIX',
    slug: 'siglo-19',
    startYear: 1800,
    endYear: 1900,
    colorHex: '#DC143C',
    description: 'Idealismo alemán, positivismo y materialismo'
  },
  {
    name: 'Filosofía del s. XX',
    slug: 'siglo-20',
    startYear: 1900,
    endYear: 2000,
    colorHex: '#9932CC',
    description: 'Fenomenología, existencialismo, filosofía analítica'
  },
  {
    name: 'Filosofía Contemporánea',
    slug: 'contemporanea',
    startYear: 2000,
    endYear: null,
    colorHex: '#FF1493',
    description: 'Filosofía actual del siglo XXI'
  }
];

// Datos de categorías filosóficas
export const categories = [
  {
    name: 'Metafísica',
    slug: 'metafisica',
    colorHex: '#FF6B6B',
    icon: 'infinity',
    description: 'Estudio de la naturaleza de la realidad, el ser y la existencia'
  },
  {
    name: 'Epistemología',
    slug: 'epistemologia',
    colorHex: '#4ECDC4',
    icon: 'brain',
    description: 'Teoría del conocimiento, creencia justificada y verdad'
  },
  {
    name: 'Ética',
    slug: 'etica',
    colorHex: '#45B7D1',
    icon: 'scale',
    description: 'Teoría moral, lo correcto e incorrecto, virtud y vicio'
  },
  {
    name: 'Lógica',
    slug: 'logica',
    colorHex: '#96CEB4',
    icon: 'git-branch',
    description: 'Razonamiento válido, inferencia y argumentación'
  },
  {
    name: 'Filosofía Política',
    slug: 'politica',
    colorHex: '#FFEAA7',
    icon: 'users',
    description: 'Justicia, derechos, Estado y organización social'
  },
  {
    name: 'Estética',
    slug: 'estetica',
    colorHex: '#DDA0DD',
    icon: 'palette',
    description: 'Filosofía del arte, belleza y experiencia estética'
  },
  {
    name: 'Filosofía de la Mente',
    slug: 'mente',
    colorHex: '#98D8C8',
    icon: 'brain-circuit',
    description: 'Naturaleza de la mente, conciencia y relación mente-cuerpo'
  }
];

// Datos de escuelas filosóficas
export const schools = [
  { name: 'Presocráticos', slug: 'presocraticos', periodSlug: 'antigua' },
  { name: 'Sofistas', slug: 'sofistas', periodSlug: 'antigua' },
  { name: 'Platonismo', slug: 'platonismo', periodSlug: 'antigua' },
  { name: 'Aristotelismo', slug: 'aristotelismo', periodSlug: 'antigua' },
  { name: 'Estoicismo', slug: 'estoicismo', periodSlug: 'antigua' },
  { name: 'Epicureísmo', slug: 'epicureismo', periodSlug: 'antigua' },
  { name: 'Escolástica', slug: 'escolastica', periodSlug: 'medieval' },
  { name: 'Humanismo', slug: 'humanismo', periodSlug: 'renacimiento' },
  { name: 'Racionalismo', slug: 'racionalismo', periodSlug: 'moderna' },
  { name: 'Empirismo', slug: 'empirismo', periodSlug: 'moderna' },
  { name: 'Idealismo Alemán', slug: 'idealismo-aleman', periodSlug: 'siglo-19' },
  { name: 'Positivismo', slug: 'positivismo', periodSlug: 'siglo-19' },
  { name: 'Existencialismo', slug: 'existencialismo', periodSlug: 'siglo-20' },
  { name: 'Fenomenología', slug: 'fenomenologia', periodSlug: 'siglo-20' },
  { name: 'Filosofía Analítica', slug: 'analitica', periodSlug: 'siglo-20' }
];

// Datos de filósofos principales
export const philosophers = [
  // Antigua
  {
    name: 'Sócrates',
    slug: 'socrates',
    birthYear: -470,
    deathYear: -399,
    nationality: 'Griega',
    schoolSlug: 'platonismo',
    periodSlug: 'antigua',
    bioShort: 'Filósofo ateniense considerado el padre de la filosofía occidental.',
    bioLong: 'Sócrates fue un filósofo clásico griego considerado uno de los más grandes. No dejó escritos, su pensamiento se conoce por los diálogos de Platón. Desarrolló el método socrático de investigación mediante preguntas.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Sócrates'
  },
  {
    name: 'Platón',
    slug: 'platon',
    birthYear: -428,
    deathYear: -348,
    nationality: 'Griega',
    schoolSlug: 'platonismo',
    periodSlug: 'antigua',
    bioShort: 'Discípulo de Sócrates y fundador de la Academia de Atenas.',
    bioLong: 'Platón fue un filósofo griego seguidor de Sócrates y maestro de Aristóteles. Fundó la Academia de Atenas. Su teoría de las Ideas o Formas ha sido fundamental en la filosofía occidental.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Platón'
  },
  {
    name: 'Aristóteles',
    slug: 'aristoteles',
    birthYear: -384,
    deathYear: -322,
    nationality: 'Griega',
    schoolSlug: 'aristotelismo',
    periodSlug: 'antigua',
    bioShort: 'Discípulo de Platón y tutor de Alejandro Magno.',
    bioLong: 'Aristóteles fue un polímata griego: filósofo, lógico y científico. Sus ideas han tenido enorme influencia en la historia intelectual de Occidente por más de dos milenios.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Aristóteles'
  },
  {
    name: 'Epicuro',
    slug: 'epicuro',
    birthYear: -341,
    deathYear: -270,
    nationality: 'Griega',
    schoolSlug: 'epicureismo',
    periodSlug: 'antigua',
    bioShort: 'Fundador del epicureísmo, filosofía centrada en el placer y la ausencia de dolor.',
    bioLong: 'Epicuro fundó El Jardín, una escuela donde enseñaba su filosofía. Su pensamiento se centraba en la búsqueda de la felicidad mediante la ataraxia (ausencia de perturbación).',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Epicuro'
  },
  
  // Medieval
  {
    name: 'San Agustín',
    slug: 'san-agustin',
    birthYear: 354,
    deathYear: 430,
    nationality: 'Romana (Norte de África)',
    schoolSlug: 'escolastica',
    periodSlug: 'medieval',
    bioShort: 'Obispo y Doctor de la Iglesia, sintetizó cristianismo y filosofía platónica.',
    bioLong: 'Agustín de Hipona fue un teólogo y filósofo cristiano de origen bereber. Sus obras, especialmente "Confesiones" y "La Ciudad de Dios", han sido fundamentales para el cristianismo occidental.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Agustín_de_Hipona'
  },
  {
    name: 'Tomás de Aquino',
    slug: 'tomas-aquino',
    birthYear: 1225,
    deathYear: 1274,
    nationality: 'Italiana',
    schoolSlug: 'escolastica',
    periodSlug: 'medieval',
    bioShort: 'Doctor de la Iglesia, sintetizó aristotelismo y cristianismo.',
    bioLong: 'Santo Tomás fue un teólogo y filósofo escolástico. Su obra más conocida es la "Summa Theologiae". Integró la filosofía de Aristóteles con la teología cristiana.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Tomás_de_Aquino'
  },
  
  // Moderna
  {
    name: 'René Descartes',
    slug: 'descartes',
    birthYear: 1596,
    deathYear: 1650,
    nationality: 'Francesa',
    schoolSlug: 'racionalismo',
    periodSlug: 'moderna',
    bioShort: 'Padre de la filosofía moderna y fundador del racionalismo.',
    bioLong: 'Descartes fue un filósofo, matemático y físico francés. Su frase "Pienso, luego existo" es una de las más famosas de la filosofía. Desarrolló el método cartesiano.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/René_Descartes'
  },
  {
    name: 'John Locke',
    slug: 'locke',
    birthYear: 1632,
    deathYear: 1704,
    nationality: 'Inglesa',
    schoolSlug: 'empirismo',
    periodSlug: 'moderna',
    bioShort: 'Padre del liberalismo y principal representante del empirismo británico.',
    bioLong: 'Locke fue un filósofo y médico inglés. Su "Ensayo sobre el entendimiento humano" es fundamental para el empirismo. Influyó profundamente en la Ilustración.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/John_Locke'
  },
  {
    name: 'David Hume',
    slug: 'hume',
    birthYear: 1711,
    deathYear: 1776,
    nationality: 'Escocesa',
    schoolSlug: 'empirismo',
    periodSlug: 'moderna',
    bioShort: 'Filósofo empirista, escéptico e historiador.',
    bioLong: 'Hume fue un filósofo, economista e historiador escocés. Su escepticismo radical cuestionó la causalidad y la inducción. Influyó enormemente en Kant.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/David_Hume'
  },
  {
    name: 'Immanuel Kant',
    slug: 'kant',
    birthYear: 1724,
    deathYear: 1804,
    nationality: 'Prusiana',
    schoolSlug: 'idealismo-aleman',
    periodSlug: 'moderna',
    bioShort: 'Filósofo central de la modernidad, sintetizó racionalismo y empirismo.',
    bioLong: 'Kant fue un filósofo prusiano. Su "Crítica de la razón pura" revolucionó la filosofía. Propuso el imperativo categórico como fundamento de la moral.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Immanuel_Kant'
  },
  
  // Siglo XIX
  {
    name: 'Georg W. F. Hegel',
    slug: 'hegel',
    birthYear: 1770,
    deathYear: 1831,
    nationality: 'Alemana',
    schoolSlug: 'idealismo-aleman',
    periodSlug: 'siglo-19',
    bioShort: 'Idealista alemán, desarrolló la dialéctica y el sistema filosófico más ambicioso.',
    bioLong: 'Hegel fue un filósofo alemán del idealismo. Su sistema dialéctico de tesis-antítesis-síntesis influyó profundamente en Marx y en toda la filosofía posterior.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Georg_Wilhelm_Friedrich_Hegel'
  },
  {
    name: 'Karl Marx',
    slug: 'marx',
    birthYear: 1818,
    deathYear: 1883,
    nationality: 'Alemana',
    schoolSlug: 'positivismo',
    periodSlug: 'siglo-19',
    bioShort: 'Filósofo, economista y revolucionario, fundador del marxismo.',
    bioLong: 'Marx fue un filósofo, economista, sociólogo y revolucionario alemán. Su crítica del capitalismo y su materialismo histórico han sido enormemente influyentes.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Karl_Marx'
  },
  {
    name: 'Friedrich Nietzsche',
    slug: 'nietzsche',
    birthYear: 1844,
    deathYear: 1900,
    nationality: 'Alemana',
    schoolSlug: null,
    periodSlug: 'siglo-19',
    bioShort: 'Filósofo crítico, proclamó la muerte de Dios y el superhombre.',
    bioLong: 'Nietzsche fue un filósofo, poeta y filólogo alemán. Su crítica a la moral tradicional y su concepto del eterno retorno han sido profundamente influyentes.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Friedrich_Nietzsche'
  },
  
  // Siglo XX
  {
    name: 'Bertrand Russell',
    slug: 'russell',
    birthYear: 1872,
    deathYear: 1970,
    nationality: 'Británica',
    schoolSlug: 'analitica',
    periodSlug: 'siglo-20',
    bioShort: 'Lógico, matemático y filósofo analítico, Premio Nobel de Literatura.',
    bioLong: 'Russell fue un filósofo, matemático y lógico británico. Co-autor con Whitehead de "Principia Mathematica". Contribuyó enormemente a la filosofía analítica.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Bertrand_Russell'
  },
  {
    name: 'Ludwig Wittgenstein',
    slug: 'wittgenstein',
    birthYear: 1889,
    deathYear: 1951,
    nationality: 'Austriaca',
    schoolSlug: 'analitica',
    periodSlug: 'siglo-20',
    bioShort: 'Filósofo del lenguaje, escribió el Tractatus y las Investigaciones Filosóficas.',
    bioLong: 'Wittgenstein fue un filósofo austriaco-británico. Trabajó principalmente en lógica y filosofía del lenguaje. Su obra temprana y tardía son igualmente influyentes.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Ludwig_Wittgenstein'
  },
  {
    name: 'Martin Heidegger',
    slug: 'heidegger',
    birthYear: 1889,
    deathYear: 1976,
    nationality: 'Alemana',
    schoolSlug: 'fenomenologia',
    periodSlug: 'siglo-20',
    bioShort: 'Fenomenólogo existencial, autor de Ser y Tiempo.',
    bioLong: 'Heidegger fue un filósofo alemán. Su obra "Ser y Tiempo" es fundamental para el existencialismo y la fenomenología. Cuestionó el olvido del ser en la filosofía occidental.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Martin_Heidegger'
  },
  {
    name: 'Jean-Paul Sartre',
    slug: 'sartre',
    birthYear: 1905,
    deathYear: 1980,
    nationality: 'Francesa',
    schoolSlug: 'existencialismo',
    periodSlug: 'siglo-20',
    bioShort: 'Filósofo existencialista, escritor y activista político.',
    bioLong: 'Sartre fue un filósofo, escritor y activista francés. Su obra "El ser y la nada" es fundamental para el existencialismo. Rechazó el Premio Nobel de Literatura.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Jean-Paul_Sartre'
  },
  {
    name: 'Simone de Beauvoir',
    slug: 'beauvoir',
    birthYear: 1908,
    deathYear: 1986,
    nationality: 'Francesa',
    schoolSlug: 'existencialismo',
    periodSlug: 'siglo-20',
    bioShort: 'Filósofa existencialista y feminista, autora de El Segundo Sexo.',
    bioLong: 'De Beauvoir fue una filósofa, escritora y feminista francesa. Su obra "El segundo sexo" es fundamental para el feminismo moderno. Compañera de Sartre.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Simone_de_Beauvoir'
  },
  {
    name: 'Karl Popper',
    slug: 'popper',
    birthYear: 1902,
    deathYear: 1994,
    nationality: 'Austriaca-Británica',
    schoolSlug: 'analitica',
    periodSlug: 'siglo-20',
    bioShort: 'Filósofo de la ciencia, propuso el falsacionismo.',
    bioLong: 'Popper fue un filósofo austriaco-británico. Su criterio de falsabilidad ha sido fundamental para la filosofía de la ciencia. Crítico del historicismo.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Karl_Popper'
  },
  {
    name: 'John Rawls',
    slug: 'rawls',
    birthYear: 1921,
    deathYear: 2002,
    nationality: 'Estadounidense',
    schoolSlug: 'analitica',
    periodSlug: 'siglo-20',
    bioShort: 'Filósofo político, autor de Teoría de la Justicia.',
    bioLong: 'Rawls fue un filósofo estadounidense. Su "Teoría de la Justicia" revitalizó la filosofía política. Propuso el principio de diferencia y el velo de ignorancia.',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/John_Rawls'
  }
];