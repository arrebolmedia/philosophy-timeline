'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowDown } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [showContent, setShowContent] = useState(false);
  const fullText = "Historia de la\nFilosofía";
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 80);
      return () => clearTimeout(timeout);
    } else {
      // Cuando termina el typing, mostrar el resto del contenido
      setTimeout(() => setShowContent(true), 300);
    }
  }, [currentIndex, fullText]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-8">
            <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold tracking-tight leading-none font-[family-name:var(--font-playfair)] text-black min-h-[200px] sm:min-h-[300px] lg:min-h-[400px] flex items-center justify-center">
              <span className="whitespace-pre-line">
                {displayedText}
                {currentIndex < fullText.length && (
                  <span className="animate-pulse">|</span>
                )}
              </span>
            </h1>
            
            <div className={`transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-xl sm:text-2xl text-gray-600 font-light max-w-2xl mx-auto font-[family-name:var(--font-poppins)]">
                Una guía visual.
              </p>
              
              {/* CTA */}
              <div className="pt-8">
                <Link href="/timeline">
                  <Button size="lg" variant="outline" className="group text-base px-8 py-6 h-auto font-[family-name:var(--font-poppins)]">
                    Explorar Timeline
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow down */}
        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <ArrowDown className="h-6 w-6 text-gray-300 animate-bounce" />
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-8 font-[family-name:var(--font-playfair)]">¿Por qué existe esto?</h2>
          <p className="text-base text-gray-500 leading-relaxed font-[family-name:var(--font-poppins)] text-justify" style={{textAlignLast: 'center'}}>
            Esta línea del tiempo está inspirada en el trabajo de{' '}
            <a
              href="https://www.denizcemonduygu.com/philo/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-gray-800 transition-colors"
            >
              Deniz Cem Önduygu
            </a>
            ; espero que sea una muestra de admiración y no una ofensa. Quería construir algo semejante en español, un espacio donde pueda ir plasmando ideas conforme avanzan mis estudios formales en filosofía. Las discusiones sobre las relaciones entre los argumentos de los distintos filósofos siempre serán bienvenidas. Este es un trabajo joven y en constante crecimiento; ojalá encuentre colaboradores dispuestos a enriquecerlo.
          </p>
        </div>
      </section>

      {/* About Anthony Section */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-8 font-[family-name:var(--font-playfair)]">Sobre mí</h2>
          <p className="text-base text-gray-500 leading-relaxed font-[family-name:var(--font-poppins)] text-justify" style={{textAlignLast: 'center'}}>
            Soy Anthony Cazares, filósofo en formación y explorador ávido de la inteligencia artificial.
            Este proyecto nace de un impulso sencillo: devolver algo de lo mucho que internet me ha dado.
            El conocimiento gratuito e ilimitado que encontré en la red cambió mi forma de pensar;
            quiero que este espacio sea una pequeña contribución a esa misma cadena.
          </p>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-8 font-[family-name:var(--font-playfair)]">¿Cómo funciona?</h2>
          <p className="text-base text-gray-500 leading-relaxed font-[family-name:var(--font-poppins)] text-justify" style={{textAlignLast: 'center'}}>
            Una guía visual siempre es útil, ya sea como introducción o como repaso. La navegación es sencilla e intuitiva, pensada para generar la menor fricción posible. Vale la pena mencionar que las conexiones entre argumentos —al menos hasta 2026— son de mi autoría, por lo que reflejan mis interpretaciones y están sujetas a error. Como reza el pie de cualquier LLM: puedo equivocarme. Por favor, verifica la información.
          </p>
        </div>
      </section>

      {/* AI Note Section */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-8 font-[family-name:var(--font-playfair)]">Una nota sobre la IA</h2>
          <p className="text-base text-gray-500 leading-relaxed font-[family-name:var(--font-poppins)] text-justify" style={{textAlignLast: 'center'}}>
            Este proyecto fue desarrollado íntegramente con ayuda de Claude Code; no soy programador. Lo que sí asumo como compromiso personal es haber leído los textos de los que provienen los argumentos y analizar yo mismo cada conexión. La IA construye la herramienta; el criterio filosófico es mío.
          </p>
        </div>
      </section>

    </div>
  )
}