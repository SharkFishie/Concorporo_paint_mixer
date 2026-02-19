'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ColorInputProps {
  hex: string;
  onChange: (hex: string) => void;
  onMix: () => void;
  loading?: boolean;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const LS_KEY = 'concorporo-ref-image';

export default function ColorInput({ hex, onChange, onMix, loading }: ColorInputProps) {
  const [raw, setRaw] = useState(hex);
  const [valid, setValid] = useState(true);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [sampledHex, setSampledHex] = useState<string | null>(null);

  const pickerRef   = useRef<HTMLInputElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);

  // Load persisted reference image on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setImageSrc(saved);
    } catch { /* localStorage unavailable */ }
  }, []);

  // Draw image onto canvas whenever imageSrc changes
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Keep raw hex input in sync when hex changes externally
  useEffect(() => {
    setRaw(hex);
  }, [hex]);

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.trim();
    if (val && !val.startsWith('#')) val = '#' + val;
    setRaw(val);
    const isValid = HEX_RE.test(val);
    setValid(isValid);
    if (isValid) onChange(val.toLowerCase());
  }

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setRaw(val);
    setValid(true);
    onChange(val);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setImageSrc(dataUrl);
      setSampledHex(null);
      try { localStorage.setItem(LS_KEY, dataUrl); } catch { /* quota exceeded */ }
    };
    reader.readAsDataURL(file);
  }

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top)  * scaleY);
    const [r, g, b] = canvas.getContext('2d')!.getImageData(x, y, 1, 1).data;
    const sampled = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    setSampledHex(sampled);
    onChange(sampled);
  }, [onChange]);

  function clearImage() {
    setImageSrc(null);
    setSampledHex(null);
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-white">Target Colour</h2>

      {/* Colour preview + picker trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => pickerRef.current?.click()}
          title="Open colour picker"
          className="w-16 h-16 rounded-xl border-2 border-zinc-600 hover:border-zinc-400 transition-colors shadow-inner cursor-pointer flex-shrink-0"
          style={{ backgroundColor: valid ? hex : '#808080' }}
          aria-label="Pick a colour"
        />
        <input
          ref={pickerRef}
          type="color"
          value={hex}
          onChange={handlePickerChange}
          className="sr-only"
          aria-label="Colour picker"
        />

        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
            Hex Code
          </label>
          <input
            type="text"
            value={raw}
            onChange={handleTextChange}
            placeholder="#ff6633"
            maxLength={7}
            className={`w-full px-3 py-2 rounded-lg bg-zinc-800 text-white font-mono text-sm border transition-colors outline-none focus:ring-2 ${
              valid
                ? 'border-zinc-600 focus:ring-indigo-500 focus:border-indigo-500'
                : 'border-red-500 focus:ring-red-500'
            }`}
          />
          {!valid && (
            <p className="text-xs text-red-400">Enter a valid hex like #ff6633</p>
          )}
        </div>
      </div>

      {/* ── Reference image upload ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
            Reference Image
          </span>
          {imageSrc ? (
            <button
              onClick={clearImage}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              Clear Image
            </button>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Upload Image
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Upload reference image"
        />

        {imageSrc ? (
          <div className="relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800">
            {/* Canvas for pixel sampling */}
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-auto cursor-crosshair block"
              title="Click anywhere to sample that colour"
            />
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/60 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                Click anywhere to sample a colour
              </span>
              {sampledHex && (
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-white">
                  <span
                    className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: sampledHex }}
                  />
                  {sampledHex}
                </span>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-6 rounded-xl border border-dashed border-zinc-700 text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 transition-colors text-sm flex flex-col items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
            <span>Upload a reference image</span>
            <span className="text-xs text-zinc-700">JPG or PNG · saved in your browser</span>
          </button>
        )}
      </div>

      <button
        onClick={onMix}
        disabled={!valid || loading}
        className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
          bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white shadow-lg shadow-indigo-900/40"
      >
        {loading ? 'Mixing…' : 'Mix It'}
      </button>
    </div>
  );
}
