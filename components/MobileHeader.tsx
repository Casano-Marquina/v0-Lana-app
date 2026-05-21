'use client';

import { Lana } from '@/components/Lana';
import { EnergyBadge } from '@/components/EnergyCheckIn';
import { Plus, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 py-3 space-y-3">
        {/* Top row: Lana + Energy + Menu */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            {showLana && <Lana realm="personal" size="sm" />}
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
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

            <Link
              href="/create"
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
