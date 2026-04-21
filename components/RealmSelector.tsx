'use client';

import { REALMS, RealmType } from '@/lib/realms';
import { cn } from '@/lib/utils';

interface RealmSelectorProps {
  value: RealmType;
  onChange: (realm: RealmType) => void;
  disabled?: boolean;
}

export function RealmSelector({ value, onChange, disabled = false }: RealmSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-gray-700">Ámbito de Prioridad</label>
      <div className="grid grid-cols-3 gap-3">
        {Object.values(REALMS).map((realm) => (
          <button
            key={realm.id}
            onClick={() => !disabled && onChange(realm.id)}
            disabled={disabled}
            className={cn(
              'relative p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 text-center cursor-pointer',
              value === realm.id
                ? 'border-current bg-opacity-100 shadow-md scale-105'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
              style={{
              borderColor: value === realm.id ? realm.color.main : 'inherit',
              backgroundColor: value === realm.id ? realm.color.light : 'inherit',
            }}
          >
            <div className="text-2xl">{realm.emoji}</div>
            <div className="text-xs font-bold" style={{ color: realm.color.dark }}>
              {realm.name}
            </div>
            <div className="text-xs text-gray-600">{realm.subtitle}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
