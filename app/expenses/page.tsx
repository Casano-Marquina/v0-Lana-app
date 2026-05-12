'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ExpensesPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Historial de Gastos</h1>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Esta sección está en desarrollo. Pronto podrás registrar y visualizar tu historial de gastos aquí.
          </p>
        </div>
      </main>
    </div>
  );
}
