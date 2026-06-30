import Image from "next/image";

type PlaceLogoStripProps = {
  logo?: string | null;
  name: string;
  eyebrow: string;
  detail?: string;
};

export function PlaceLogoStrip({
  logo,
  name,
  eyebrow,
  detail,
}: PlaceLogoStripProps) {
  if (!logo) return null;

  return (
    <section className="relative z-20 bg-md-cream">
      <div className="mx-auto max-w-7xl px-6">
        <div className="-mt-12 flex flex-col gap-4 border-b border-md-gold/20 bg-md-cream/95 py-6 sm:-mt-14 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-md-gold/25 bg-white p-4 shadow-[0_16px_40px_rgba(29,10,3,0.12)]">
              <div className="relative h-full w-full">
                <Image
                  src={logo}
                  alt={`${name} logo`}
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                {eyebrow}
              </p>
              <h2 className="mt-2 break-words font-display text-3xl font-bold leading-tight text-md-brown-dark md:text-4xl">
                {name}
              </h2>
              {detail ? (
                <p className="mt-2 text-sm font-semibold text-md-muted">{detail}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
