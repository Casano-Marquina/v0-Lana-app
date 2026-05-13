'use client';

import { useState, useEffect, useCallback } from 'react';
import { RealmType } from '@/lib/realms';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  realm: RealmType;
  date: string;
  transmuted?: boolean;
  transmuteNote?: string;
}

export interface FinancialStats {
  total: number;
  byRealm: Record<RealmType, number>;
  percentages: Record<RealmType, number>;
}

const STORAGE_KEY = 'lana-ovillo-financiero';

// Frases de validación de Lana para el Modo Arrepentimiento
export const transmuteResponses = [
  "Cada ovillo que soltaste tenía un propósito. Confía en tu instinto, que sabe tejer tu bienestar.",
  "No hay gastos malos, solo inversiones en diferentes versiones de ti. Esta versión necesitaba esto.",
  "El dinero es energía que fluye. Lo que diste volverá transformado en experiencia y crecimiento.",
  "Esa decisión la tomaste con la información que tenías. Hoy eres más sabia, no más culpable.",
  "Lana dice: 'El arrepentimiento pesa más que el gasto. Suéltalo, que yo te ayudo a tejer uno nuevo'.",
  "Gastaste en ti, y eso nunca es un error. El autocuidado no necesita justificación.",
  "Cada moneda que invertiste en tu corazón alimenta conexiones que no tienen precio.",
  "Tu futuro agradecerá esta inversión, aunque hoy no lo veas claro. Confía en el proceso.",
];

// Mensajes de Lana según el balance financiero
export const balanceMessages = {
  futuroHigh: "Estás invirtiendo mucho en tu mañana! No olvides gastar unos ovillos en tu corazón para no cansarte.",
  centroHigh: "Ese autocuidado se nota, te estás dando la importancia que mereces. Lana aprueba!",
  corazonHigh: "Tu corazón está muy nutrido! Las conexiones que cultivas son tu mayor tesoro.",
  balanced: "Tu balance de energía financiera está armonioso. Estás tejiendo tu vida con sabiduría.",
  noExpenses: "Aún no hay ovillos registrados. Cada gasto es una hebra de tu historia financiera.",
};

export function useOvilloFinanciero() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setExpenses(JSON.parse(stored));
      }
    } catch (error) {
      console.error('[v0] Error loading expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses, isLoading]);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const transmuteExpense = useCallback((id: string, note: string) => {
    setExpenses(prev => prev.map(e => 
      e.id === id ? { ...e, transmuted: true, transmuteNote: note } : e
    ));
    // Return a random validation response
    return transmuteResponses[Math.floor(Math.random() * transmuteResponses.length)];
  }, []);

  const calculateStats = useCallback((): FinancialStats => {
    const byRealm: Record<RealmType, number> = {
      personal: 0,
      academic: 0,
      relational: 0,
    };

    expenses.forEach(expense => {
      byRealm[expense.realm] += expense.amount;
    });

    const total = byRealm.personal + byRealm.academic + byRealm.relational;

    const percentages: Record<RealmType, number> = {
      personal: total > 0 ? (byRealm.personal / total) * 100 : 0,
      academic: total > 0 ? (byRealm.academic / total) * 100 : 0,
      relational: total > 0 ? (byRealm.relational / total) * 100 : 0,
    };

    return { total, byRealm, percentages };
  }, [expenses]);

  const getLanaMessage = useCallback((stats: FinancialStats): string => {
    if (stats.total === 0) return balanceMessages.noExpenses;

    const { percentages } = stats;
    
    if (percentages.academic >= 50) return balanceMessages.futuroHigh;
    if (percentages.personal >= 50) return balanceMessages.centroHigh;
    if (percentages.relational >= 50) return balanceMessages.corazonHigh;
    
    return balanceMessages.balanced;
  }, []);

  const getExpensesByMonth = useCallback((month?: Date) => {
    const targetMonth = month || new Date();
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === targetMonth.getMonth() &&
             expenseDate.getFullYear() === targetMonth.getFullYear();
    });
  }, [expenses]);

  return {
    expenses,
    isLoading,
    addExpense,
    deleteExpense,
    transmuteExpense,
    calculateStats,
    getLanaMessage,
    getExpensesByMonth,
  };
}
