// Declaraciones filosóficas extendidas para múltiples filósofos

export const statements = [
  // Platón
  {
    philosopherSlug: 'platon',
    categorySlug: 'metafisica',
    text: 'Las formas o Ideas son la realidad verdadera, mientras que el mundo sensible es solo una sombra',
    isDirectQuote: false,
    difficultyLevel: 4,
    popularityScore: 95,
    tags: ['Teoría de las Formas', 'Metafísica', 'Idealismo']
  },
  {
    philosopherSlug: 'platon',
    categorySlug: 'politica',
    text: 'El rey filósofo es aquel que, conociendo el Bien, puede gobernar justamente la polis',
    isDirectQuote: false,
    difficultyLevel: 3,
    popularityScore: 88,
    tags: ['República', 'Justicia', 'Gobierno']
  },
  {
    philosopherSlug: 'platon',
    categorySlug: 'epistemologia',
    text: 'El conocimiento es reminiscencia: el alma recuerda lo que conoció antes de encarnarse',
    isDirectQuote: false,
    difficultyLevel: 4,
    popularityScore: 82,
    tags: ['Anamnesis', 'Alma', 'Conocimiento']
  },

  // Aristóteles
  {
    philosopherSlug: 'aristoteles',
    categorySlug: 'metafisica',
    text: 'El ser se dice de muchas maneras',
    isDirectQuote: true,
    difficultyLevel: 5,
    popularityScore: 90,
    tags: ['Ontología', 'Ser', 'Categorías']
  },
  {
    philosopherSlug: 'aristoteles',
    categorySlug: 'etica',
    text: 'La virtud es un término medio entre dos vicios',
    isDirectQuote: false,
    difficultyLevel: 2,
    popularityScore: 93,
    tags: ['Ética Nicomaquea', 'Virtud', 'Término Medio']
  },
  {
    philosopherSlug: 'aristoteles',
    categorySlug: 'logica',
    text: 'El silogismo es el razonamiento en el cual, establecidas ciertas cosas, se sigue necesariamente algo distinto',
    isDirectQuote: true,
    difficultyLevel: 3,
    popularityScore: 85,
    tags: ['Lógica', 'Silogismo', 'Razonamiento']
  },

  // Descartes
  {
    philosopherSlug: 'descartes',
    categorySlug: 'epistemologia',
    text: 'Pienso, luego existo',
    isDirectQuote: true,
    difficultyLevel: 2,
    popularityScore: 100,
    tags: ['Cogito', 'Duda Metódica', 'Certeza']
  },
  {
    philosopherSlug: 'descartes',
    categorySlug: 'metafisica',
    text: 'La mente y el cuerpo son sustancias distintas e independientes',
    isDirectQuote: false,
    difficultyLevel: 3,
    popularityScore: 88,
    tags: ['Dualismo', 'Mente-Cuerpo', 'Sustancia']
  },
  {
    philosopherSlug: 'descartes',
    categorySlug: 'epistemologia',
    text: 'Dudo de todo aquello que pueda ser dudado, pero no puedo dudar de que dudo',
    isDirectQuote: false,
    difficultyLevel: 3,
    popularityScore: 92,
    tags: ['Duda Metódica', 'Certeza', 'Fundamentos']
  },

  // Kant
  {
    philosopherSlug: 'kant',
    categorySlug: 'epistemologia',
    text: 'La razón pura no puede conocer las cosas en sí mismas, solo los fenómenos',
    isDirectQuote: false,
    difficultyLevel: 5,
    popularityScore: 87,
    tags: ['Fenómeno', 'Noúmeno', 'Crítica']
  },
  {
    philosopherSlug: 'kant',
    categorySlug: 'etica',
    text: 'Actúa sólo según aquella máxima que puedas querer que se convierta en ley universal',
    isDirectQuote: true,
    difficultyLevel: 3,
    popularityScore: 95,
    tags: ['Imperativo Categórico', 'Moral', 'Deber']
  },
  {
    philosopherSlug: 'kant',
    categorySlug: 'etica',
    text: 'Trata a la humanidad, tanto en tu persona como en la de otros, siempre como un fin y nunca solo como un medio',
    isDirectQuote: true,
    difficultyLevel: 3,
    popularityScore: 94,
    tags: ['Dignidad', 'Autonomía', 'Persona']
  },

  // Nietzsche
  {
    philosopherSlug: 'nietzsche',
    categorySlug: 'metafisica',
    text: 'Dios ha muerto, y nosotros lo hemos matado',
    isDirectQuote: true,
    difficultyLevel: 3,
    popularityScore: 98,
    tags: ['Nihilismo', 'Muerte de Dios', 'Modernidad']
  },
  {
    philosopherSlug: 'nietzsche',
    categorySlug: 'etica',
    text: 'Más allá del bien y del mal se encuentra la transvaloración de todos los valores',
    isDirectQuote: false,
    difficultyLevel: 4,
    popularityScore: 89,
    tags: ['Transvaloración', 'Moral', 'Superhombre']
  },
  {
    philosopherSlug: 'nietzsche',
    categorySlug: 'metafisica',
    text: 'La vida es voluntad de poder y nada más',
    isDirectQuote: false,
    difficultyLevel: 4,
    popularityScore: 86,
    tags: ['Voluntad de Poder', 'Vida', 'Fuerza']
  },

  // Heidegger
  {
    philosopherSlug: 'heidegger',
    categorySlug: 'metafisica',
    text: 'El Dasein es el ente que en su ser le va este ser mismo',
    isDirectQuote: true,
    difficultyLevel: 5,
    popularityScore: 78,
    tags: ['Dasein', 'Ser-ahí', 'Existencia']
  },
  {
    philosopherSlug: 'heidegger',
    categorySlug: 'metafisica',
    text: 'La pregunta por el sentido del ser ha sido olvidada en la historia de la filosofía occidental',
    isDirectQuote: false,
    difficultyLevel: 4,
    popularityScore: 82,
    tags: ['Ser', 'Olvido', 'Ontología']
  },

  // Sartre
  {
    philosopherSlug: 'sartre',
    categorySlug: 'metafisica',
    text: 'La existencia precede a la esencia',
    isDirectQuote: true,
    difficultyLevel: 3,
    popularityScore: 96,
    tags: ['Existencialismo', 'Esencia', 'Libertad']
  },
  {
    philosopherSlug: 'sartre',
    categorySlug: 'etica',
    text: 'Estamos condenados a ser libres',
    isDirectQuote: true,
    difficultyLevel: 2,
    popularityScore: 94,
    tags: ['Libertad', 'Responsabilidad', 'Angustia']
  },
  {
    philosopherSlug: 'sartre',
    categorySlug: 'metafisica',
    text: 'El infierno son los otros',
    isDirectQuote: true,
    difficultyLevel: 2,
    popularityScore: 97,
    tags: ['Alteridad', 'Mirada', 'Relaciones']
  },

  // Wittgenstein
  {
    philosopherSlug: 'wittgenstein',
    categorySlug: 'logica',
    text: 'Los límites de mi lenguaje son los límites de mi mundo',
    isDirectQuote: true,
    difficultyLevel: 3,
    popularityScore: 93,
    tags: ['Lenguaje', 'Mundo', 'Tractatus']
  },
  {
    philosopherSlug: 'wittgenstein',
    categorySlug: 'logica',
    text: 'De lo que no se puede hablar, hay que callar',
    isDirectQuote: true,
    difficultyLevel: 2,
    popularityScore: 95,
    tags: ['Silencio', 'Misticismo', 'Lenguaje']
  },
  {
    philosopherSlug: 'wittgenstein',
    categorySlug: 'logica',
    text: 'El significado de una palabra es su uso en el lenguaje',
    isDirectQuote: false,
    difficultyLevel: 3,
    popularityScore: 88,
    tags: ['Juegos de Lenguaje', 'Significado', 'Uso']
  }
];

// Conexiones filosóficas entre declaraciones
export const connections = [
  {
    from: { philosopher: 'platon', text: 'Las formas o Ideas son la realidad verdadera' },
    to: { philosopher: 'aristoteles', text: 'El ser se dice de muchas maneras' },
    type: 'disagreement',
    strength: 5
  },
  {
    from: { philosopher: 'descartes', text: 'Pienso, luego existo' },
    to: { philosopher: 'kant', text: 'La razón pura no puede conocer las cosas en sí mismas' },
    type: 'expansion',
    strength: 4
  },
  {
    from: { philosopher: 'kant', text: 'Actúa sólo según aquella máxima' },
    to: { philosopher: 'nietzsche', text: 'Más allá del bien y del mal' },
    type: 'refutation',
    strength: 5
  },
  {
    from: { philosopher: 'heidegger', text: 'El Dasein es el ente' },
    to: { philosopher: 'sartre', text: 'La existencia precede a la esencia' },
    type: 'inspiration',
    strength: 4
  },
  {
    from: { philosopher: 'wittgenstein', text: 'Los límites de mi lenguaje' },
    to: { philosopher: 'heidegger', text: 'La pregunta por el sentido del ser' },
    type: 'expansion',
    strength: 3
  },
  {
    from: { philosopher: 'aristoteles', text: 'La virtud es un término medio' },
    to: { philosopher: 'kant', text: 'Actúa sólo según aquella máxima' },
    type: 'disagreement',
    strength: 4
  },
  {
    from: { philosopher: 'platon', text: 'El rey filósofo' },
    to: { philosopher: 'nietzsche', text: 'Más allá del bien y del mal' },
    type: 'disagreement',
    strength: 4
  }
];
