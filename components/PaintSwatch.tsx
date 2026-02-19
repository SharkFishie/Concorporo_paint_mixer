'use client';

import { Paint } from '@/lib/colorUtils';

interface PaintSwatchProps {
  paint: Paint;
  selected: boolean;
  onToggle: (id: string) => void;
}

export default function PaintSwatch({ paint, selected, onToggle }: PaintSwatchProps) {
  // Determine if text should be light or dark based on background lightness
  const hex = paint.hex.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminance > 0.5 ? '#1a1a1a' : '#f5f5f5';

  return (
    <button
      onClick={() => onToggle(paint.id)}
      title={`${paint.name} — ${paint.hex}`}
      className={`
        relative rounded-xl aspect-square flex flex-col items-center justify-end p-2
        transition-all duration-150 cursor-pointer
        ${selected
          ? 'ring-4 ring-offset-2 ring-offset-[#1a1a1a] ring-white scale-[1.04] shadow-lg shadow-black/40'
          : 'ring-2 ring-transparent hover:ring-white/30 hover:scale-[1.02]'
        }
      `}
      style={{ backgroundColor: paint.hex }}
      aria-pressed={selected}
      aria-label={paint.name}
    >
      {selected && (
        <span
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: textColor === '#1a1a1a' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.25)' }}
        >
          <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke={textColor} strokeWidth="2">
            <polyline points="1.5,6 4.5,9 10.5,3" />
          </svg>
        </span>
      )}
      <span
        className="text-[10px] font-semibold leading-tight text-center w-full truncate px-0.5"
        style={{ color: textColor, textShadow: luminance > 0.5 ? 'none' : '0 1px 2px rgba(0,0,0,0.6)' }}
      >
        {paint.name}
      </span>
    </button>
  );
}
