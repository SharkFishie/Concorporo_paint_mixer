'use client';

import { MixResult as MixResultType } from '@/lib/colorUtils';

interface MixResultProps {
  result: MixResultType;
  targetHex: string;
}


function AccuracyBar({ pct }: { pct: number }) {
  const color =
    pct >= 90 ? '#22c55e' :
    pct >= 75 ? '#eab308' :
    pct >= 55 ? '#f97316' : '#ef4444';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 rounded-full bg-zinc-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-bold w-12 text-right" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

export default function MixResult({ result, targetHex }: MixResultProps) {
  const { paints, mixedHex, accuracy, suggestion } = result;

  if (paints.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-zinc-800/60 border border-zinc-700 text-zinc-400 text-sm text-center">
        Select at least one paint and click <strong className="text-white">Mix It</strong>.
      </div>
    );
  }

  const totalParts = paints.reduce((s, p) => s + p.parts, 0);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Colour comparison */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Target', hex: targetHex },
          { label: 'Mixed Result', hex: mixedHex },
        ].map(({ label, hex }) => (
          <div key={label} className="flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</span>
            <div
              className="w-full rounded-2xl shadow-inner"
              style={{ backgroundColor: hex, aspectRatio: '1/0.7', minHeight: '90px' }}
            />
            <span
              className="text-xs font-mono text-center text-zinc-400"
            >
              {hex}
            </span>
          </div>
        ))}
      </div>

      {/* Accuracy */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-300">Match Accuracy</span>
        </div>
        <AccuracyBar pct={accuracy} />
      </div>

      {/* Mixing instructions */}
      <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
          Mixing Instructions
        </h3>
        <ul className="flex flex-col gap-2">
          {paints.map(({ paint, parts }) => (
            <li key={paint.id} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-md flex-shrink-0 border border-white/10"
                style={{ backgroundColor: paint.hex }}
              />
              <span className="text-white font-medium text-sm">
                <span className="text-indigo-400 font-bold mr-1">{parts}</span>
                {parts === 1 ? 'part' : 'parts'}&nbsp;
                <span>{paint.name}</span>
              </span>
              <span className="ml-auto text-xs text-zinc-500 font-mono">
                {Math.round((parts / totalParts) * 100)}%
              </span>
            </li>
          ))}
        </ul>

        {/* Plain-English summary */}
        <p className="text-sm text-zinc-400 border-t border-zinc-700 pt-3 mt-1 leading-relaxed">
          {paints.length === 1
            ? `Use ${paints[0].paint.name} straight from the tube.`
            : paints
                .map(({ paint, parts }) => `${parts} part${parts > 1 ? 's' : ''} ${paint.name}`)
                .join(' + ')
          }
        </p>
      </div>

      {/* Suggestion for low accuracy */}
      {accuracy < 80 && suggestion && (
        <div className="p-4 rounded-xl border border-amber-600/40 bg-amber-950/30 flex flex-col gap-2">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Tip — Improve Your Match
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0 border border-white/10"
              style={{ backgroundColor: suggestion.hex }}
            />
            <p className="text-sm text-zinc-300 leading-snug">
              Adding{' '}
              <span className="font-semibold text-white">{suggestion.name}</span>{' '}
              ({suggestion.pigment}) to your mix could significantly improve the match.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
