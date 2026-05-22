'use client';

import { Lana } from '@/components/Lana';
import { EnergyBadge } from '@/components/EnergyCheckIn';
import { Plus, Home, Heart, BookOpen, Users, Settings, Calendar, Palette, PiggyBank, Star } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLayout } from '@/contexts/LayoutContext';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  energyLevel?: 'low' | 'medium' | 'high' | null;
  onEnergyClick?: () => void;
  showLana?: boolean;
}

export function MobileHeader({
  title = 'Mi Agenda',
  subtitle,
  energyLevel,
  onEnergyClick,
  showLana = true,
}: MobileHeaderProps) {
  const { isMobileLayout } = useLayout();
  const pathname = usePathname();

  // Desktop navigation items
  const desktopNavItems = [
    { href: '/', icon: Home, label: 'Inicio', active: pathname === '/' },
    { href: '/realm/personal', icon: Heart, label: 'Centro', active: pathname.includes('personal') },
    { href: '/realm/academic', icon: BookOpen, label: 'Futuro', active: pathname.includes('academic') },
    { href: '/realm/relational', icon: Users, label: 'Corazon', active: pathname.includes('relational') },
    { href: '/weekly', icon: Calendar, label: 'Semana', active: pathname === '/weekly' },
    { href: '/expenses', icon: PiggyBank, label: 'Gastos', active: pathname === '/expenses' },
    { href: '/wellness', icon: Star, label: 'Bienestar', active: pathname === '/wellness' },
    { href: '/backgrounds', icon: Palette, label: 'Fondos', active: pathname === '/backgrounds' },
    { href: '/settings', icon: Settings, label: 'Ajustes', active: pathname === '/settings' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className={cn(
        'px-4 py-3',
        !isMobileLayout && 'max-w-6xl mx-auto'
      )}>
        {/* Top row: Lana + Title + Energy + Create Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {showLana && <Lana realm="personal" size="sm" />}
            <div className="flex-1">
              <h1 className={cn(
                'font-bold text-gray-900 dark:text-white line-clamp-1',
                isMobileLayout ? 'text-lg' : 'text-xl'
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {energyLevel && (
              <button
                onClick={onEnergyClick}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <EnergyBadge level={energyLevel} size="sm" />
              </button>
            )}

            <NavLink
              href="/create"
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
            </NavLink>
          </div>
        </div>

        {/* Desktop Navigation - Only show when NOT in mobile layout */}
        {!isMobileLayout && (
          <nav className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 overflow-x-auto">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                    item.active
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
