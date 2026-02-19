# Concorporo

A client-side acrylic paint mixing calculator built with **Next.js 14** (App Router) and **Tailwind CSS**.

Select the acrylic paints you own across multiple brands, enter a target colour as a hex code, via colour picker, or by clicking anywhere on a reference photo — and get ratio-based mixing instructions to match it as closely as possible — e.g. *"3 parts Cadmium Yellow + 1 part Ultramarine Blue."*

---

## Features

- **Multi-brand support** — Winsor & Newton, Liquitex, Golden, Daler-Rowney; mix and match brands freely
- **Brand selector** — toggle which brands you own paints from; palette grid updates instantly
- **Hex + colour picker** — kept in sync both ways
- **Reference image sampler** — upload any photo, click a pixel to sample its colour; image persists in `localStorage`
- **Subtractive RYB mixing** — uses Red-Yellow-Blue colour space so yellow + blue → green (not grey)
- **Best-match search** — brute-forces 1-, 2-, and 3-paint combos at multiple part ratios
- **CIE L\*a\*b\* accuracy** — scores each candidate with perceptual colour distance (ΔE)
- **Paint suggestion** — if match accuracy is below 80%, recommends one unowned paint that would help
- **Three pages**: `/` mixer, `/colors` browseable swatch library grouped by brand, `/about` algorithm explainer
- **Dark UI**, mobile-responsive, no backend, no auth, no API calls

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

Deploys as-is to **Vercel** (no extra config needed).

---

## Project Structure

```
/app
  page.tsx            # Main mixer tool
  /about/page.tsx     # About & algorithm explainer
  /colors/page.tsx    # Browseable paint grid (brand-grouped)
  layout.tsx          # Nav, footer, fonts

/components
  PaletteSelector.tsx # Brand chips + per-brand swatch grid
  PaintSwatch.tsx     # Individual paint swatch button
  ColorInput.tsx      # Hex input, colour picker, image sampler
  MixResult.tsx       # Mix result display

/data
  paints.json         # 87 colours across 4 brands

/lib
  colorUtils.ts       # All colour math (RYB, Lab, mixing algorithm)
```

---

## Mixing Algorithm

Paint mixes **subtractively** — RGB averaging produces wrong results for physical pigments. The algorithm:

1. Converts each paint's hex colour to **RYB** via Gosset & Chen trilinear interpolation across the RYB unit cube
2. The RGB → RYB inverse is solved numerically with gradient descent
3. Blends candidate combinations in RYB space (weighted average by part count)
4. Converts the predicted mix back to RGB for display
5. Scores each candidate using **Euclidean distance in CIE L\*a\*b\*** (perceptual ΔE)
6. Returns the best-matching combo with its integer-part ratio breakdown

The algorithm works the same whether the selected paints come from one brand or several.

---

## Paint Library

| Brand | Colours |
|---|---|
| Winsor & Newton | 25 |
| Liquitex | 20 |
| Golden | 22 |
| Daler-Rowney | 20 |

Browse them all at `/colors` or see [`/data/paints.json`](data/paints.json).

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS v3 |
| Language | TypeScript |
| Rendering | Fully static / client-side |
| Deployment | Vercel |

---

*Colour values are approximate. Not affiliated with any paint brand.*
