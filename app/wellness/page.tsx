'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Lana } from '@/components/Lana';

export default function WellnessPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Bienestar con Lana</h1>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Lana realm="personal" size="md" className="mb-6" />
          <p className="text-muted-foreground mb-4">
            Pronto encontrarás videos motivacionales, ejercicios de relajación, meditaciones guiadas y juegos interactivos con Lana.
          </p>
          <p className="text-sm text-muted-foreground">
            Una forma divertida de cuidar tu bienestar mientras logras tus metas.
          </p>
        </div>
      </main>
    </div>
  );
}
