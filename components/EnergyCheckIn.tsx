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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Skip button */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
            title="Saltar por hoy"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 space-y-6">
          {/* Lana greeting */}
          <div className="text-center">
            <Lana 
              realm={selectedLevel === 'high' ? 'academic' : 'personal'} 
              size="lg" 
              className="mx-auto"
            />
            
            {!showConfirmation ? (
              <div className="mt-4 space-y-2">
                <h2 className="text-xl font-bold text-card-foreground">
                  Hola! Buenos dias
                </h2>
                <p className="text-muted-foreground">
                  Antes de ver pendientes, Lana quiere saber...
                </p>
                <p className="text-lg font-medium text-primary flex items-center justify-center gap-2">
                  <Battery className="w-5 h-5" />
                  Cuanta energia traemos hoy para tejer el dia?
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <h2 className="text-xl font-bold text-card-foreground">
                  {selectedLevel && energyMessages[selectedLevel].greeting}
                </h2>
                <p className="text-muted-foreground">
                  {selectedLevel && energyMessages[selectedLevel].explanation}
                </p>
              </div>
            )}
          </div>

          {/* Energy options */}
          {!showConfirmation ? (
            <div className="grid grid-cols-3 gap-3">
              {energyOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedLevel === option.level;
                
                return (
                  <button
                    key={option.level}
                    onClick={() => handleSelect(option.level)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                      isSelected ? option.selectedColor : option.color
                    )}
                  >
                    <Icon className="w-8 h-8" />
                    <span className="font-semibold">{option.label}</span>
                    <span className="text-xs opacity-80 text-center leading-tight">
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
                'p-4 rounded-xl border-2',
                selectedLevel === 'low' && 'bg-amber-50 border-amber-200 text-amber-800',
                selectedLevel === 'medium' && 'bg-emerald-50 border-emerald-200 text-emerald-800',
                selectedLevel === 'high' && 'bg-blue-50 border-blue-200 text-blue-800',
              )}>
                {selectedLevel === 'low' && (
                  <ul className="text-sm space-y-1">
                    <li>Las tareas academicas pesadas estaran protegidas</li>
                    <li>Priorizaremos tu autocuidado y relaciones</li>
                    <li>Solo lo esencial para hoy</li>
                  </ul>
                )}
                {selectedLevel === 'medium' && (
                  <ul className="text-sm space-y-1">
                    <li>Equilibrio entre todos tus ambitos</li>
                    <li>Descansos sugeridos entre tareas</li>
                    <li>Ritmo constante y sostenible</li>
                  </ul>
                )}
                {selectedLevel === 'high' && (
                  <ul className="text-sm space-y-1">
                    <li>Tareas de enfoque profundo primero</li>
                    <li>Modo productividad activado</li>
                    <li>Tareas ligeras para el final del dia</li>
                  </ul>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-border text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Cambiar
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
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
