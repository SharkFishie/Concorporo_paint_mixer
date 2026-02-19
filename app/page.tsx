'use client';

import { useCallback, useMemo, useState } from 'react';
import brandsData from '@/data/paints.json';
import { BrandData, Paint, MixResult as MixResultType, findBestMix } from '@/lib/colorUtils';
import PaletteSelector from '@/components/PaletteSelector';
import ColorInput from '@/components/ColorInput';
import MixResult from '@/components/MixResult';

const brands: BrandData[] = brandsData as BrandData[];

// Full paint library across all brands (for suggestion lookup)
const allPaints: Paint[] = brands.flatMap(b =>
  b.colors.map(c => ({ ...c, brand: b.brand }))
);

const DEFAULT_BRAND = 'winsor-newton';

export default function HomePage() {
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(
    new Set([DEFAULT_BRAND]),
  );
  const [selected, setSelected] = useState<Set<string>>(
    new Set(
      brands.find(b => b.id === DEFAULT_BRAND)?.colors.slice(0, 8).map(c => c.id) ?? [],
    ),
  );
  const [targetHex, setTargetHex] = useState('#3a6ea5');
  const [result, setResult] = useState<MixResultType | null>(null);
  const [loading, setLoading] = useState(false);

  // Paints available from the selected brands
  const availablePaints = useMemo(
    () =>
      brands
        .filter(b => selectedBrandIds.has(b.id))
        .flatMap(b => b.colors.map(c => ({ ...c, brand: b.brand }))),
    [selectedBrandIds],
  );

  const handleToggleBrand = useCallback((brandId: string, wasSelected: boolean) => {
    if (wasSelected) {
      setSelectedBrandIds(prev => {
        const next = new Set(prev);
        next.delete(brandId);
        return next;
      });
      // Remove deselected brand's paints from the mix selection
      const brandColorIds = new Set(
        brands.find(b => b.id === brandId)?.colors.map(c => c.id) ?? [],
      );
      setSelected(prev => {
        const next = new Set(prev);
        brandColorIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedBrandIds(prev => {
        const next = new Set(prev);
        next.add(brandId);
        return next;
      });
    }
    setResult(null);
  }, []);

  const handleToggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
    setResult(null);
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelected(new Set(availablePaints.map(p => p.id)));
    setResult(null);
  }, [availablePaints]);

  const handleClear = useCallback(() => {
    setSelected(new Set());
    setResult(null);
  }, []);

  const handleHexChange = useCallback((hex: string) => {
    setTargetHex(hex);
    setResult(null);
  }, []);

  const handleMix = useCallback(() => {
    const selectedPaints = availablePaints.filter(p => selected.has(p.id));
    if (selectedPaints.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      const res = findBestMix(targetHex, selectedPaints, allPaints);
      setResult(res);
      setLoading(false);
    }, 20);
  }, [targetHex, selected, availablePaints]);

  const selectedPaints = availablePaints.filter(p => selected.has(p.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          Find Your Perfect Mix
        </h1>
        <p className="mt-2 text-zinc-400 max-w-xl">
          Choose your paint brands, pick the colours you own, set a target, and get
          ratio-based mixing instructions instantly.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* ── LEFT: Palette ── */}
        <section className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <PaletteSelector
            brands={brands}
            selectedBrandIds={selectedBrandIds}
            availablePaints={availablePaints}
            selected={selected}
            onToggleBrand={handleToggleBrand}
            onToggle={handleToggle}
            onSelectAll={handleSelectAll}
            onClear={handleClear}
          />
        </section>

        {/* ── RIGHT: Target + Results ── */}
        <div className="flex flex-col gap-6">
          <section className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <ColorInput
              hex={targetHex}
              onChange={handleHexChange}
              onMix={handleMix}
              loading={loading}
            />

            {selectedPaints.length === 0 && (
              <p className="mt-4 text-xs text-amber-400 text-center">
                Select at least one paint from your palette first.
              </p>
            )}
          </section>

          {/* Results */}
          {result && (
            <section className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <h2 className="text-xl font-semibold text-white mb-5">Result</h2>
              <MixResult result={result} targetHex={targetHex} />
            </section>
          )}

          {!result && !loading && (
            <div className="p-6 rounded-2xl border border-dashed border-zinc-700 text-center text-zinc-600 text-sm select-none">
              Your mixing result will appear here after you click{' '}
              <strong className="text-zinc-400">Mix It</strong>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
