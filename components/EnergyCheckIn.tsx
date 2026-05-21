'use client';

import { useState } from 'react';
import { Lana } from './Lana';
import { EnergyLevel, energyMessages } from '@/hooks/useEnergyLevel';
import { Battery, BatteryLow, BatteryMedium, BatteryFull, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnergyCheckInProps {
  onSelect: (level: EnergyLevel) => void;
  onSkip?: () => void;
}

export function EnergyCheckIn({ onSelect, onSkip }: EnergyCheckInProps) {
  const [selectedLevel, setSelectedLevel] = useState<EnergyLevel>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSelect = (level: EnergyLevel) => {
    setSelectedLevel(level);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedLevel) {
      onSelect(selectedLevel);
    }
  };

  const energyOptions = [
    {
      level: 'low' as const,
      label: 'Baja',
      description: 'Hoy me siento cansada/o',
      icon: BatteryLow,
      color: 'bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-800',
      selectedColor: 'bg-amber-200 border-amber-500 ring-2 ring-amber-400',
    },
    {
      level: 'medium' as const,
      label: 'Media',
      description: 'Ahi vamos',
      icon: BatteryMedium,
      color: 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200 text-emerald-800',
      selectedColor: 'bg-emerald-200 border-emerald-500 ring-2 ring-emerald-400',
    },
    {
      level: 'high' as const,
      label: 'Alta',
      description: 'Con todo hoy!',
      icon: BatteryFull,
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-800',
      selectedColor: 'bg-blue-200 border-blue-500 ring-2 ring-blue-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center glass-card/30 backdrop-blur-xl animate-in fade-in duration-300 pb-4 md:pb-0">
      <div className="relative glass-card rounded-3xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300 md:max-w-md">
        {/* Skip button */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 rounded-full soft-button hover:scale-110 transition-all text-gray-400 dark:text-gray-500"
            title="Saltar por hoy"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Lana greeting */}
          <div className="text-center">
            <Lana 
              realm={selectedLevel === 'high' ? 'academic' : 'personal'} 
              size="md" 
              className="mx-auto animate-float"
            />
            
            {!showConfirmation ? (
              <div className="mt-2 md:mt-4 space-y-1 md:space-y-2">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                  ¡Hola! Buenos días
                </h2>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  Lana quiere saber...
                </p>
                <p className="text-sm md:text-base font-medium text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                  <Battery className="w-4 h-4 md:w-5 md:h-5" />
                  ¿Cuánta energía hoy?
                </p>
              </div>
            ) : (
              <div className="mt-2 md:mt-4 space-y-1 md:space-y-2">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                  {selectedLevel && energyMessages[selectedLevel].greeting}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {selectedLevel && energyMessages[selectedLevel].explanation}
                </p>
              </div>
            )}
          </div>

          {/* Energy options */}
          {!showConfirmation ? (
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {energyOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedLevel === option.level;
                
                return (
                  <button
                    key={option.level}
                    type="button"
                    onClick={() => handleSelect(option.level)}
                    className={cn(
                      'flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 rounded-xl md:rounded-2xl soft-button transition-all duration-200 transform hover:scale-105',
                      isSelected ? option.selectedColor : option.color
                    )}
                  >
                    <Icon className="w-6 h-6 md:w-8 md:h-8" />
                    <span className="text-sm md:text-base font-semibold">{option.label}</span>
                    <span className="text-xs opacity-80 text-center leading-tight hidden md:block">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Confirmation message based on selected level */}
              <div className={cn(
                'p-4 rounded-2xl border-2 cozy-card transition-all',
                selectedLevel === 'low' && 'realm-personal',
                selectedLevel === 'medium' && 'realm-relational',
                selectedLevel === 'high' && 'realm-academic',
              )}>
                {selectedLevel === 'low' && (
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-200">
                    <li>• Las tareas académicas pesadas estarán protegidas</li>
                    <li>• Priorizaremos tu autocuidado y relaciones</li>
                    <li>• Solo lo esencial para hoy</li>
                  </ul>
                )}
                {selectedLevel === 'medium' && (
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-200">
                    <li>• Equilibrio entre todos tus ámbitos</li>
                    <li>• Descansos sugeridos entre tareas</li>
                    <li>• Ritmo constante y sostenible</li>
                  </ul>
                )}
                {selectedLevel === 'high' && (
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-200">
                    <li>• Tareas de enfoque profundo primero</li>
                    <li>• Modo productividad activado</li>
                    <li>• Tareas ligeras para el final del día</li>
                  </ul>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-3 rounded-xl soft-button text-gray-700 dark:text-gray-200 hover:scale-105 transition-transform"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all transform"
                >
                  Comenzar!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mini badge to show current energy level
export function EnergyBadge({ 
  level, 
  onClick 
}: { 
  level: EnergyLevel; 
  onClick?: () => void;
}) {
  if (!level) return null;

  const config = {
    low: { icon: BatteryLow, color: 'text-amber-600 bg-amber-100', label: 'Energia Baja' },
    medium: { icon: BatteryMedium, color: 'text-emerald-600 bg-emerald-100', label: 'Energia Media' },
    high: { icon: BatteryFull, color: 'text-blue-600 bg-blue-100', label: 'Energia Alta' },
  };

  const { icon: Icon, color, label } = config[level];

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80',
        color
      )}
      title={`${label} - Click para cambiar`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// Warning modal when user with low energy tries to access heavy tasks
export function HeavyTaskWarning({
  onProceed,
  onCancel,
}: {
  onProceed: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 space-y-4">
        <Lana realm="personal" size="md" className="mx-auto" />
        
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-card-foreground">
            Segura/o?
          </h3>
          <p className="text-muted-foreground text-sm">
            Lana cree que esa tarea es muy pesada para hoy. Marcaste energia baja y esta tarea requiere mucho enfoque.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Tienes razon
          </button>
          <button
            onClick={onProceed}
            className="flex-1 py-2.5 rounded-xl border-2 border-border text-muted-foreground hover:bg-secondary transition-colors"
          >
            Igual la hago
          </button>
        </div>
      </div>
    </div>
  );
}
