'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
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
                resumida y visualizada
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
      </section>

      {/* About Section */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-4 max-w-2xl">
          <p className="text-base text-gray-500 leading-relaxed font-[family-name:var(--font-poppins)]">
            Esta línea del tiempo está inspirada en el trabajo de{' '}
            <a
              href="https://www.denizcemonduygu.com/portfolio/the-history-of-philosophy/"
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

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400 font-[family-name:var(--font-poppins)]">
          <p>Inspirado en el trabajo de Deniz Cem Önduygu.</p>
        </div>
      </footer>
    </div>
  )
}