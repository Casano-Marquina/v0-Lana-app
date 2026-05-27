'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wind, Sparkles, Gamepad2, Video } from 'lucide-react';
import { Lana } from '@/components/Lana';
import { LanaBreath } from '@/components/LanaBreath';
import { cn } from '@/lib/utils';

export default function WellnessPage() {
  const [showBreathing, setShowBreathing] = useState(false);

  const wellnessFeatures = [
    {
      id: 'breathing',
      title: 'Respiracion Consciente',
      description: '1 minuto de calma guiada por Lana',
      icon: Wind,
      available: true,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      onClick: () => setShowBreathing(true),
    },
    {
      id: 'meditation',
      title: 'Meditaciones Guiadas',
      description: 'Sesiones cortas para enfocar tu mente',
      icon: Sparkles,
      available: false,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      id: 'games',
      title: 'Juegos Interactivos',
      description: 'Diviertete mientras cuidas tu bienestar',
      icon: Gamepad2,
      available: false,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      id: 'videos',
      title: 'Videos Motivacionales',
      description: 'Inspiracion diaria con Lana',
      icon: Video,
      available: false,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breathing Modal */}
      {showBreathing && (
        <LanaBreath onClose={() => setShowBreathing(false)} />
      )}

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Lana realm="personal" size="sm" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bienestar con Lana</h1>
            <p className="text-sm text-muted-foreground">Cuida tu mente y cuerpo</p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wellnessFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={feature.onClick}
                disabled={!feature.available}
                className={cn(
                  'relative p-6 rounded-2xl text-left transition-all',
                  feature.bgColor,
                  'border border-border/50',
                  feature.available 
                    ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed'
                )}
              >
                {!feature.available && (
                  <span className="absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    Pronto
                  </span>
                )}
                
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                  'bg-gradient-to-br',
                  feature.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Lana Message */}
        <div className="mt-8 bg-card border border-border rounded-2xl p-6 text-center">
          <Lana 
            realm="personal" 
            size="md" 
            showMessage 
            customMessage="Tu bienestar es mi prioridad. Empecemos con un minuto de respiracion consciente." 
          />
        </div>
      </main>
    </div>
  );
}
