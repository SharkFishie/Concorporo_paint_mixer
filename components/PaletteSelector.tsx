'use client';

import { BrandData, Paint } from '@/lib/colorUtils';
import PaintSwatch from './PaintSwatch';

interface PaletteSelectorProps {
  brands: BrandData[];
  selectedBrandIds: Set<string>;
  availablePaints: Paint[];
  selected: Set<string>;
  onToggleBrand: (brandId: string, wasSelected: boolean) => void;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

const BRAND_ACCENT: Record<string, string> = {
  'winsor-newton': 'bg-blue-600',
  'liquitex':      'bg-violet-600',
  'golden':        'bg-amber-600',
  'daler-rowney':  'bg-emerald-600',
};

export default function PaletteSelector({
  brands,
  selectedBrandIds,
  availablePaints,
  selected,
  onToggleBrand,
  onToggle,
  onSelectAll,
  onClear,
}: PaletteSelectorProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* ── Brand selector ── */}
      <div>
        <h2 className="text-xl font-semibold text-white">Your Palette</h2>
        <p className="text-xs text-zinc-400 mt-1 mb-3">Select the brands you own paints from</p>
        <div className="flex flex-wrap gap-2">
          {brands.map(brand => {
            const isActive = selectedBrandIds.has(brand.id);
            const accent = BRAND_ACCENT[brand.id] ?? 'bg-zinc-600';
            return (
              <button
                key={brand.id}
                onClick={() => onToggleBrand(brand.id, isActive)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border ${
                  isActive
                    ? `${accent} border-transparent text-white shadow-md`
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-white/70' : 'bg-zinc-600'}`}
                />
                {brand.brand}
                <span className={`text-[10px] font-normal ${isActive ? 'text-white/70' : 'text-zinc-600'}`}>
                  {brand.colors.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Palette grid header ── */}
      {availablePaints.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              {selected.size} of {availablePaints.length} paints selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={onSelectAll}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={onClear}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* ── Grid, grouped by brand ── */}
          <div className="flex flex-col gap-4">
            {brands
              .filter(b => selectedBrandIds.has(b.id))
              .map(brand => (
                <div key={brand.id}>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    {brand.brand}
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {brand.colors.map(paint => (
                      <PaintSwatch
                        key={paint.id}
                        paint={paint}
                        selected={selected.has(paint.id)}
                        onToggle={onToggle}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : (
        <div className="py-8 text-center text-zinc-600 text-sm border border-dashed border-zinc-700 rounded-xl">
          Select at least one brand above to see its colours.
        </div>
      )}
    </div>
  );
}
