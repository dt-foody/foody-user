// app/[locale]/(server-components)/SectionHero.tsx
import Image from "next/image";
import Link from "next/link";
import heroImage from "@/images/hero.png";
import { getTranslations } from "next-intl/server";

interface SectionHeroProps {
  className?: string;
}

export default async function SectionHero({ className = "" }: SectionHeroProps) {
  const t = await getTranslations("section-hero");

  return (
    <section
      className={`relative w-full bg-white ${className}`}
      aria-labelledby="hero-title"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt={t("bg_alt")}   // e.g. "Món ăn ngon"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/40" />
      </div>

      {/* Content */}
      <div className="relative max-w-3xl mx-auto text-center py-24 px-6">
        <h1 id="hero-title" className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          {t.rich("headline", {
            highlight: (c) => <span className="text-red-600">{c}</span>,
            br: () => <br />
          })}
        </h1>

        <p className="mt-6 text-lg text-gray-700">
          {t("subhead")}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/signup"
            prefetch
            className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            {t("cta_primary")}
          </Link>

          <Link
            href="/menu"
            prefetch
            className="px-6 py-3 rounded-full border border-gray-400 text-gray-800 font-medium hover:bg-gray-100 transition
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            {t("cta_secondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}
