'use client';

import { useState } from 'react';
import { Download, Loader } from 'lucide-react';
import { Task } from '@/lib/db';
import { exportLanaReport, exportLanaReportAsCSV, EnergyEntry } from '@/lib/exportLanaReport';
import { cn } from '@/lib/utils';

interface ExportReportButtonProps {
  tasks: Task[];
  energyHistory?: EnergyEntry[];
  weekStart?: Date;
  weekEnd?: Date;
  format?: 'xlsx' | 'csv' | 'both';
  className?: string;
}

export function ExportReportButton({
  tasks,
  energyHistory = [],
  weekStart = new Date(),
  weekEnd = new Date(),
  format = 'xlsx',
  className = '',
}: ExportReportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Calculate week dates if not provided
  const calculateWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const start = new Date(now.setDate(diff));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  };

  const { start, end } = calculateWeekDates();

  const handleExport = async () => {
    try {
      setIsLoading(true);

      const reportData = {
        tasks,
        energyHistory,
        weekStart: start,
        weekEnd: end,
      };

      if (format === 'xlsx' || format === 'both') {
        exportLanaReport(reportData);
      }

      if (format === 'csv') {
        exportLanaReportAsCSV(reportData);
      }

      // Small delay before closing loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('[v0] Error exporting report:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading || tasks.length === 0}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
        'bg-primary hover:bg-primary/90 text-primary-foreground',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          {format === 'both'
            ? 'Descargar Reporte'
            : format === 'csv'
              ? 'Descargar CSV'
              : 'Descargar Excel'}
        </>
      )}
    </button>
  );
}

interface ExportReportModalProps {
  isOpen: boolean;
  tasks: Task[];
  energyHistory?: EnergyEntry[];
  onClose: () => void;
}

export function ExportReportModal({
  isOpen,
  tasks,
  energyHistory = [],
  onClose,
}: ExportReportModalProps) {
  if (!isOpen) return null;

  // Calculate week dates
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const reportData = {
    tasks,
    energyHistory,
    weekStart,
    weekEnd,
  };

  const handleExcelExport = () => {
    exportLanaReport(reportData);
    onClose();
  };

  const handleCSVExport = () => {
    exportLanaReportAsCSV(reportData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-border">
        <h2 className="text-xl font-bold text-card-foreground mb-4">
          Descargar Reporte de Lana
        </h2>

        <p className="text-muted-foreground mb-6">
          Elige el formato en el que deseas descargar tu reporte de bienestar y productividad.
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={handleExcelExport}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            <Download className="w-5 h-5 text-accent" />
            <div className="text-left">
              <p className="font-medium text-card-foreground">Excel (.xlsx)</p>
              <p className="text-sm text-muted-foreground">
                Múltiples hojas con gráficos
              </p>
            </div>
          </button>

          <button
            onClick={handleCSVExport}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            <Download className="w-5 h-5 text-accent" />
            <div className="text-left">
              <p className="font-medium text-card-foreground">CSV (.csv)</p>
              <p className="text-sm text-muted-foreground">
                Formato de texto simple
              </p>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-card-foreground"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
