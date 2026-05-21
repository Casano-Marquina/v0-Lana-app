'use client';

import { NavLink } from '@/components/NavLink';
import { Home, ListTodo, Wallet, Heart, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home', active: pathname === '/' },
    { href: '/realm/personal', icon: Heart, label: 'Centro', active: pathname.includes('personal') },
    { href: '/realm/academic', icon: ListTodo, label: 'Futuro', active: pathname.includes('academic') },
    { href: '/realm/relational', icon: Heart, label: 'Corazón', active: pathname.includes('relational') },
    { href: '/expenses', icon: Wallet, label: 'Ovillos', active: pathname === '/expenses' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl shadow-black/10 dark:shadow-black/30">
      <div className="flex items-center justify-around max-w-2xl mx-auto h-20 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 flex-1',
                item.active
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
