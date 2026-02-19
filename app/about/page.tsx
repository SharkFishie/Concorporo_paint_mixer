import Link from 'next/link';

export const metadata = {
  title: 'About — Concorporo',
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-white mb-8">About Concorporo</h1>

      <div className="flex flex-col gap-6 text-zinc-300 leading-relaxed text-[15px]">
        <p>
          <strong className="text-white">Concorporo</strong> helps acrylic painters find the
          best ratio-based mix to reproduce any target colour using only the paints they
          already own — across Winsor &amp; Newton, Liquitex, Golden, Daler-Rowney, and more.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">The Problem</h2>
          <p>
            Digital colour pickers work in RGB — a light-mixing model where red + green = yellow.
            But real paint is <em>subtractive</em>: pigments absorb light rather than emit it.
            Mix red and green paint and you get a muddy brown, not yellow. Naively averaging hex
            codes produces predictions that are completely wrong for physical media.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">How It Works</h2>
          <p>
            Concorporo converts each paint&rsquo;s colour into{' '}
            <strong className="text-white">RYB colour space</strong> (Red–Yellow–Blue), the
            traditional painter&rsquo;s model, using the trilinear interpolation technique
            described by Gosset &amp; Chen. Blending then happens in RYB, not RGB, so yellow +
            blue correctly produces green.
          </p>
          <p className="mt-3">
            The algorithm tries every 1-, 2-, and 3-paint combination from your selection at
            multiple part ratios (1:1, 1:2, 1:3, …). For each candidate mix it calculates the
            predicted colour and measures how close it is to your target using{' '}
            <strong className="text-white">CIE L*a*b* colour distance</strong> (ΔE), which
            correlates with how the human eye perceives colour difference. The combination with
            the smallest ΔE wins.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Reference Image Sampler</h2>
          <p>
            Upload any photo as a reference and click anywhere on it to sample that exact pixel
            colour. The sampled hex is immediately fed into the mixer — no external tools needed.
            Your reference image is saved locally in your browser so it persists between sessions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Limitations</h2>
          <p>
            No software model is a perfect substitute for real-world mixing. Pigment density,
            paint brand, medium, and drying shifts all affect the final colour. Treat the output
            as a well-informed starting point, not an exact recipe.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Paint Library</h2>
          <p>
            The app ships with colours from four popular acrylic brands: Winsor &amp; Newton,
            Liquitex, Golden, and Daler-Rowney. You can browse the full list on the{' '}
            <Link href="/colors" className="text-indigo-400 hover:underline">
              Colours page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
