'use client';

import { useState, useRef } from 'react';
import { Background } from '@/lib/db';
import { RealmType, REALMS } from '@/lib/realms';
import { Upload, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_COLORS = {
  personal: ['#3B82F6', '#0EA5E9', '#06B6D4'],
  academic: ['#8B5CF6', '#A78BFA', '#D8B4FE'],
  relational: ['#EC4899', '#F472B6', '#FBCFE8'],
  global: ['#ffffff', '#F5F5F5', '#E5E5E5'],
};

interface BackgroundPickerProps {
  realm: RealmType | 'global';
  currentBackground?: Background;
  onSelect: (background: Background) => void;
  onDelete?: () => void;
}

export function BackgroundPicker({
  realm,
  currentBackground,
  onSelect,
  onDelete,
}: BackgroundPickerProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const realmLabel = realm === 'global' ? 'Global' : REALMS[realm as RealmType].name;
  const colors = DEFAULT_COLORS[realm as keyof typeof DEFAULT_COLORS] || [];

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Compress and convert to data URL
      const reader = new FileReader();

      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;

        // Create image to get dimensions
        const img = new Image();
        img.src = dataUrl;

        img.onload = () => {
          // Compress image if needed (simplified compression)
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

          onSelect({
            id: `bg-${Date.now()}`,
            type: 'image',
            value: compressedDataUrl,
            realm: realm as any,
            createdAt: new Date().toISOString(),
          });

          setUploading(false);
        };
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('[v0] Error uploading background:', error);
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">{realmLabel}</h3>
        {currentBackground && onDelete && (
          <button
            onClick={onDelete}
            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Eliminar fondo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Color Presets */}
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() =>
              onSelect({
                id: `bg-${color}`,
                type: 'color',
                value: color,
                realm: realm as any,
                createdAt: new Date().toISOString(),
              })
            }
            className={cn(
              'w-full aspect-square rounded-lg border-2 transition-all',
              currentBackground?.value === color
                ? 'border-gray-900 shadow-md scale-105'
                : 'border-gray-300 hover:border-gray-400'
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Image Upload */}
      <div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Upload className="w-5 h-5" />
          <span className="font-medium text-sm">
            {uploading ? 'Subiendo...' : 'Subir imagen'}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Current Background Preview */}
      {currentBackground && currentBackground.type === 'image' && (
        <div className="rounded-lg overflow-hidden border border-gray-200 h-32">
          <img
            src={currentBackground.value}
            alt="Fondo actual"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
