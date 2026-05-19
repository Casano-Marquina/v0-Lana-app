'use client';

import { useState } from 'react';
import { useOvilloFinanciero, Expense, transmuteResponses } from '@/hooks/useOvilloFinanciero';
import { RealmType, REALMS } from '@/lib/realms';
import { Lana } from '@/components/Lana';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  X, 
  Star, 
  BookOpen, 
  Heart,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';

// Colores específicos para finanzas (Verde, Azul, Rosa según spec)
const FINANCE_COLORS = {
  personal: {
    main: '#22C55E', // Verde
    light: '#DCFCE7',
    text: '#166534',
  },
  academic: {
    main: '#3B82F6', // Azul
    light: '#DBEAFE',
    text: '#1E40AF',
  },
  relational: {
    main: '#EC4899', // Rosa
    light: '#FCE7F3',
    text: '#BE185D',
  },
};

const REALM_ICONS = {
  personal: Star,
  academic: BookOpen,
  relational: Heart,
};

const REALM_FINANCE_NAMES = {
  personal: 'Mi Centro',
  academic: 'Mi Futuro',
  relational: 'Mi Corazón',
};

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id' | 'date'>) => void;
  onClose: () => void;
}

function ExpenseForm({ onSubmit, onClose }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRealm, setSelectedRealm] = useState<RealmType | null>(null);
  const [step, setStep] = useState<'input' | 'realm'>('input');

  const handleContinue = () => {
    if (amount && description) {
      setStep('realm');
    }
  };

  const handleSubmit = (realm: RealmType) => {
    onSubmit({
      amount: parseFloat(amount),
      description,
      realm,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {step === 'input' ? 'Nuevo Ovillo' : 'Qué área nutriste?'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'input' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Monto invertido
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  En qué lo invertiste?
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Café con amigas, Curso online..."
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={handleContinue}
                disabled={!amount || !description}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground mb-4">
                A qué área de tu vida nutrió esta inversión de <span className="font-bold text-foreground">${amount}</span>?
              </p>

              <div className="grid gap-3">
                {(Object.keys(REALM_FINANCE_NAMES) as RealmType[]).map((realm) => {
                  const Icon = REALM_ICONS[realm];
                  const colors = FINANCE_COLORS[realm];
                  
                  return (
                    <button
                      key={realm}
                      onClick={() => handleSubmit(realm)}
                      className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:scale-[1.02]"
                      style={{ 
                        borderColor: colors.main,
                        backgroundColor: colors.light,
                      }}
                    >
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: colors.main }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold" style={{ color: colors.text }}>
                          {REALM_FINANCE_NAMES[realm]}
                        </p>
                        <p className="text-sm opacity-80" style={{ color: colors.text }}>
                          {realm === 'personal' && 'Autocuidado, salud, tiempo para ti'}
                          {realm === 'academic' && 'Estudios, trabajo, desarrollo'}
                          {realm === 'relational' && 'Familia, amigos, conexiones'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TransmuteModalProps {
  expense: Expense;
  onTransmute: (note: string) => string;
  onClose: () => void;
}

function TransmuteModal({ expense, onTransmute, onClose }: TransmuteModalProps) {
  const [note, setNote] = useState('');
  const [response, setResponse] = useState<string | null>(null);

  const handleTransmute = () => {
    const lanaResponse = onTransmute(note);
    setResponse(lanaResponse);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Modo Transmutar
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!response ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-sm">
                  <span className="font-bold">${expense.amount}</span> en "{expense.description}"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Por qué hiciste este gasto? Cuéntale a Lana...
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Lo necesitaba porque... Me hacía sentir... En ese momento pensé..."
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[100px] resize-none"
                />
              </div>

              <button
                onClick={handleTransmute}
                disabled={!note.trim()}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Transmutar Culpa
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <Lana realm="relational" size="md" className="mx-auto mb-4" />
              </div>
              
              <div className="bg-gradient-to-br from-pink-50 to-amber-50 border border-pink-200 rounded-xl p-4">
                <p className="text-foreground italic text-center">
                  "{response}"
                </p>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Este gasto ha sido transmutado. Ya no carga culpa.
              </p>

              <button
                onClick={onClose}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all"
              >
                Gracias, Lana
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface EnergyBalanceChartProps {
  stats: {
    total: number;
    byRealm: Record<RealmType, number>;
    percentages: Record<RealmType, number>;
  };
}

function EnergyBalanceChart({ stats }: EnergyBalanceChartProps) {
  const { percentages, byRealm, total } = stats;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-32 h-32 rounded-full border-4 border-dashed border-muted flex items-center justify-center">
          <DollarSign className="w-12 h-12 text-muted-foreground" />
        </div>
        <p className="mt-4 text-muted-foreground text-center">
          Aún no hay ovillos registrados
        </p>
      </div>
    );
  }

  // Calculate stroke dasharray for pie chart segments
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  const segments = (Object.keys(percentages) as RealmType[]).map((realm) => {
    const percentage = percentages[realm];
    const strokeLength = (percentage / 100) * circumference;
    const offset = currentOffset;
    currentOffset += strokeLength;
    
    return {
      realm,
      percentage,
      strokeLength,
      offset,
      color: FINANCE_COLORS[realm].main,
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Pie Chart */}
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((segment, index) => (
            <circle
              key={segment.realm}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="10"
              strokeDasharray={`${segment.strokeLength} ${circumference}`}
              strokeDashoffset={-segment.offset}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">${total.toFixed(0)}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-3">
        {(Object.keys(REALM_FINANCE_NAMES) as RealmType[]).map((realm) => {
          const Icon = REALM_ICONS[realm];
          const colors = FINANCE_COLORS[realm];
          
          return (
            <div key={realm} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors.main }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{REALM_FINANCE_NAMES[realm]}</span>
                  <span className="text-sm font-bold">{percentages[realm].toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percentages[realm]}%`,
                      backgroundColor: colors.main,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">${byRealm[realm].toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OvilloFinanciero() {
  const { 
    expenses, 
    isLoading, 
    addExpense, 
    deleteExpense, 
    transmuteExpense,
    calculateStats,
    getLanaMessage,
  } = useOvilloFinanciero();

  const [showForm, setShowForm] = useState(false);
  const [transmuteExpenseData, setTransmuteExpenseData] = useState<Expense | null>(null);

  const stats = calculateStats();
  const lanaMessage = getLanaMessage(stats);

  const handleTransmute = (id: string) => (note: string) => {
    return transmuteExpense(id, note);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Lana's advice */}
      <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-pink-50 border border-border rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Lana 
            realm={stats.percentages.academic > 40 ? 'academic' : stats.percentages.relational > 40 ? 'relational' : 'personal'} 
            size="sm" 
          />
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-1">Balance de Energía Financiera</h3>
            <p className="text-muted-foreground text-sm italic">"{lanaMessage}"</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <EnergyBalanceChart stats={stats} />
      </div>

      {/* Add Expense Button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 hover:from-emerald-600 hover:via-blue-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
      >
        <Plus className="w-5 h-5" />
        Registrar Nuevo Ovillo
      </button>

      {/* Expense List */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Historial de Ovillos
        </h3>

        {expenses.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-muted-foreground">
              Aún no has registrado ningún ovillo. Cada gasto es una hebra de tu historia financiera.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.slice(0, 10).map((expense) => {
              const Icon = REALM_ICONS[expense.realm];
              const colors = FINANCE_COLORS[expense.realm];
              const date = new Date(expense.date);
              
              return (
                <div
                  key={expense.id}
                  className={cn(
                    "bg-card border rounded-xl p-4 flex items-center gap-4 transition-all",
                    expense.transmuted ? "border-amber-300 bg-amber-50/50" : "border-border"
                  )}
                >
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: colors.light }}
                  >
                    <Icon className="w-5 h-5" style={{ color: colors.main }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {REALM_FINANCE_NAMES[expense.realm]}
                      {expense.transmuted && (
                        <span className="ml-2 text-amber-600">
                          <Sparkles className="w-3 h-3 inline" /> Transmutado
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-foreground">${expense.amount.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {!expense.transmuted && (
                      <button
                        onClick={() => setTransmuteExpenseData(expense)}
                        className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                        title="Transmutar culpa"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <ExpenseForm
          onSubmit={addExpense}
          onClose={() => setShowForm(false)}
        />
      )}

      {transmuteExpenseData && (
        <TransmuteModal
          expense={transmuteExpenseData}
          onTransmute={handleTransmute(transmuteExpenseData.id)}
          onClose={() => setTransmuteExpenseData(null)}
        />
      )}
    </div>
  );
}
