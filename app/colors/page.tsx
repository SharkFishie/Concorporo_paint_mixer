import brandsData from '@/data/paints.json';
import { BrandData } from '@/lib/colorUtils';

export const metadata = {
  title: 'Colours — Concorporo',
};

const brands: BrandData[] = brandsData as BrandData[];
const totalColors = brands.reduce((sum, b) => sum + b.colors.length, 0);

function contrastText(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.5 ? '#1a1a1a' : '#f5f5f5';
}

const BRAND_BORDER: Record<string, string> = {
  'winsor-newton': 'border-blue-800/50',
  'liquitex':      'border-violet-800/50',
  'golden':        'border-amber-800/50',
  'daler-rowney':  'border-emerald-800/50',
};

const BRAND_LABEL: Record<string, string> = {
  'winsor-newton': 'text-blue-400',
  'liquitex':      'text-violet-400',
  'golden':        'text-amber-400',
  'daler-rowney':  'text-emerald-400',
};

export default function ColorsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Colour Library</h1>
        <p className="text-zinc-400 mt-2">
          {totalColors} colours across {brands.length} brands available in Concorporo.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {brands.map(brand => (
          <section key={brand.id}>
            <div className="flex items-center gap-3 mb-5">
              <h2 className={`text-lg font-semibold ${BRAND_LABEL[brand.id] ?? 'text-zinc-300'}`}>
                {brand.brand}
              </h2>
              <span className="text-xs text-zinc-600 font-mono">{brand.colors.length} colours</span>
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4`}>
              {brand.colors.map(paint => {
                const textColor = contrastText(paint.hex);
                return (
                  <div
                    key={paint.id}
                    className={`rounded-2xl overflow-hidden border shadow-md ${BRAND_BORDER[brand.id] ?? 'border-white/5'}`}
                  >
                    {/* Swatch */}
                    <div
                      className="w-full aspect-square flex items-end p-3"
                      style={{ backgroundColor: paint.hex }}
                    >
                      <span
                        className="text-[11px] font-bold font-mono leading-none px-1.5 py-0.5 rounded"
                        style={{
                          color: textColor,
                          backgroundColor:
                            textColor === '#1a1a1a'
                              ? 'rgba(0,0,0,0.12)'
                              : 'rgba(255,255,255,0.15)',
                        }}
                      >
                        {paint.hex}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="bg-zinc-900 px-3 py-2.5">
                      <p className="text-sm font-medium text-white leading-snug">{paint.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-mono">{paint.pigment}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
