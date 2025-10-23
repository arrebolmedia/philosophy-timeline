'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Map, Search } from 'lucide-react';

const navigation = [
  { name: 'Inicio', href: '/', icon: BookOpen },
  { name: 'Filósofos', href: '/filosofos', icon: Users },
  { name: 'Timeline', href: '/timeline', icon: Map },
  { name: 'Buscar', href: '/buscar', icon: Search },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl font-serif">Historia de la Filosofía</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
