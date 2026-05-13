'use client';

import Link from 'next/link';
import { ArrowLeft, PiggyBank } from 'lucide-react';
import { OvilloFinanciero } from '@/components/OvilloFinanciero';
import { Lana } from '@/components/Lana';

export default function ExpensesPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-100 via-blue-100 to-pink-100 rounded-xl">
              <PiggyBank className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Ovillo Financiero</h1>
              <p className="text-sm text-muted-foreground">Tu balance de energía financiera</p>
            </div>
          </div>
        </div>

        {/* Main Component */}
        <OvilloFinanciero />
      </main>
    </div>
  );
}
