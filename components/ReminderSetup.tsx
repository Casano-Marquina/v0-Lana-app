'use client';

import { REMINDER_PRESETS } from '@/lib/notifications';
import { cn } from '@/lib/utils';
import { Clock, Bell } from 'lucide-react';

interface ReminderSetupProps {
  enabled: boolean;
  reminderTime?: string;
  onToggle: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
}

export function ReminderSetup({
  enabled,
  reminderTime,
  onToggle,
  onTimeChange,
}: ReminderSetupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="reminder"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="w-4 h-4 rounded cursor-pointer"
        />
        <label htmlFor="reminder" className="text-sm font-semibold text-gray-700 cursor-pointer flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Activar recordatorio
        </label>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(REMINDER_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => {
                  // Calculate time (simplified for now)
                  onTimeChange(preset.label);
                }}
                className="p-2 text-xs rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <label className="text-xs font-semibold text-blue-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Hora personalizada
            </label>
            <input
              type="time"
              value={reminderTime || '09:00'}
              onChange={(e) => onTimeChange(e.target.value)}
              className="mt-2 w-full px-2 py-1 text-sm border rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
