import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Globe, 
  Search, 
  Zap, 
  Users, 
  Activity,
  ArrowRight,
  Github,
  Star
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-philosophy-ancient/10 via-philosophy-renaissance/10 to-philosophy-contemporary/10 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              Inspirado en el trabajo de Deniz Cem Önduygu
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Historia de la 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-philosophy-ancient to-philosophy-contemporary">
                {" "}Filosofía
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Explora 2600 años de filosofía occidental a través de una visualización interactiva 
              que conecta ideas, argumentos y pensadores a lo largo del tiempo.
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <Link href="/filosofos">
                <Button size="lg" className="group">
                  Explorar Filósofos
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/timeline">
                <Button variant="outline" size="lg">
                  Ver Timeline
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Una Nueva Forma de Explorar la Filosofía
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Descubre las conexiones entre ideas que han dado forma al pensamiento humano
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <Activity className="h-8 w-8 text-philosophy-ancient mb-2" />
                <CardTitle>Timeline Interactivo</CardTitle>
                <CardDescription>
                  Navega por milenios de pensamiento con zoom, filtros y búsqueda avanzada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-8 w-8 text-connections-agreement mb-2" />
                <CardTitle>Conexiones Visuales</CardTitle>
                <CardDescription>
                  Descubre cómo las ideas se conectan, acuerdan, contradicen y evolucionan
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <Search className="h-8 w-8 text-categories-epistemology mb-2" />
                <CardTitle>Búsqueda Inteligente</CardTitle>
                <CardDescription>
                  Encuentra filósofos, conceptos y argumentos con nuestro motor de búsqueda avanzado
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-categories-ethics mb-2" />
                <CardTitle>Referencias Académicas</CardTitle>
                <CardDescription>
                  Cada idea está respaldada por fuentes primarias y secundarias verificadas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-8 w-8 text-philosophy-contemporary mb-2" />
                <CardTitle>Acceso Universal</CardTitle>
                <CardDescription>
                  Diseño responsive y accesible, optimizado para cualquier dispositivo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-categories-political mb-2" />
                <CardTitle>Colaborativo</CardTitle>
                <CardDescription>
                  Contribuye con correcciones, nuevas conexiones y referencias
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-philosophy-ancient">200+</div>
              <div className="text-sm text-muted-foreground">Filósofos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-philosophy-renaissance">2000+</div>
              <div className="text-sm text-muted-foreground">Ideas Conectadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-philosophy-contemporary">2600</div>
              <div className="text-sm text-muted-foreground">Años de Historia</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-connections-agreement">5000+</div>
              <div className="text-sm text-muted-foreground">Conexiones</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Comienza tu Exploración Filosófica
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a miles de estudiantes, profesores y entusiastas que ya están 
            explorando las conexiones más profundas del pensamiento humano.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/timeline">
              <Button size="lg" className="w-full sm:w-auto">
                Explorar Ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://github.com/tu-usuario/historia-filosofia" target="_blank">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Github className="mr-2 h-4 w-4" />
                Ver en GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-4">Historia de la Filosofía</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Un proyecto de código abierto dedicado a hacer la filosofía más accesible 
                y comprensible a través de la visualización interactiva.
              </p>
              <div className="flex items-center gap-4">
                <Link href="https://github.com/tu-usuario/historia-filosofia" target="_blank">
                  <Button variant="ghost" size="sm">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Apoyar
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Navegación</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/timeline" className="text-muted-foreground hover:text-foreground">Timeline</Link></li>
                <li><Link href="/filosofos" className="text-muted-foreground hover:text-foreground">Filósofos</Link></li>
                <li><Link href="/filosofos" className="text-muted-foreground hover:text-foreground">Búsqueda</Link></li>
                <li><Link href="/" className="text-muted-foreground hover:text-foreground">Acerca de</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="text-muted-foreground hover:text-foreground">Documentación</Link></li>
                <li><Link href="/api" className="text-muted-foreground hover:text-foreground">API</Link></li>
                <li><Link href="/contribute" className="text-muted-foreground hover:text-foreground">Contribuir</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contacto</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Historia de la Filosofía. Licencia MIT. Inspirado en el trabajo de Deniz Cem Önduygu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}