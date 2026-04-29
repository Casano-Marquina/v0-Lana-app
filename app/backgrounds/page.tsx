'use client';

import { useEffect, useState } from 'react';
import { setBackground, getBackground, getAllBackgrounds, deleteBackground, Background } from '@/lib/db';
import { BackgroundPicker } from '@/components/BackgroundPicker';
import { RealmType } from '@/lib/realms';
import Link from 'next/link';
import { ArrowLeft, Palette } from 'lucide-react';
import { Lana } from '@/components/Lana';

export default function BackgroundsPage() {
  const [backgrounds, setBackgrounds] = useState<Record<string, Background>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBackgrounds();
  }, []);

  async function loadBackgrounds() {
    try {
      const allBackgrounds = await getAllBackgrounds();
      const byRealm: Record<string, Background> = {};

      allBackgrounds.forEach((bg) => {
        byRealm[bg.realm] = bg;
      });

      setBackgrounds(byRealm);
    } catch (error) {
      console.error('[v0] Error loading backgrounds:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectBackground(background: Background) {
    try {
      await setBackground(background);
      setBackgrounds((prev) => ({ ...prev, [background.realm]: background }));
    } catch (error) {
      console.error('[v0] Error saving background:', error);
    }
  }

  async function handleDeleteBackground(realm: string) {
    try {
      const bg = backgrounds[realm];
      if (bg) {
        await deleteBackground(bg.id);
        const { [realm]: _, ...rest } = backgrounds;
        setBackgrounds(rest);
      }
    } catch (error) {
      console.error('[v0] Error deleting background:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const realms: (RealmType | 'global')[] = ['personal', 'academic', 'relational', 'global'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Lana realm="personal" size="sm" />
          <h1 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
            <Palette className="w-6 h-6 text-accent" />
            Personalizar Fondos
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-card rounded-lg p-4 border border-border mb-6">
          <Lana realm="personal" size="md" showMessage customMessage="Ya me cambie la gorrita para combinar con tu nueva paleta de colores!" />
        </div>
        {realms.map((realm) => (
          <section key={realm} className="bg-card rounded-lg shadow-md p-6 border border-border">
            <BackgroundPicker
              realm={realm}
              currentBackground={backgrounds[realm]}
              onSelect={handleSelectBackground}
              onDelete={
                backgrounds[realm]
                  ? () => handleDeleteBackground(realm)
                  : undefined
              }
            />
          </section>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-blue-600 text-3xl mb-2">🎨</div>
          <h3 className="font-semibold text-blue-900 mb-2">Personaliza tu Agenda</h3>
          <p className="text-sm text-blue-800">
            Elige colores hermosos o sube tus propias imágenes para cada ámbito de tu vida
          </p>
        </div>
      </main>
    </div>
  );
}
