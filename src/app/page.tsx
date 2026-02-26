import { LandingSearch } from "../components/landing-search";
import { FilterMetadata } from "../lib/types";
import metadataJson from "../../data/metadata.json";
import gradMetadataJson from "../../data/graduate-metadata.json";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "UVic Scholarships",
  url: "https://scholarships.smccl.ca",
  description:
    "Search and filter 1,300+ University of Victoria scholarships, bursaries, and awards.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://scholarships.smccl.ca/search/undergrad?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  const meta = metadataJson as FilterMetadata;
  const gradMeta = gradMetadataJson as FilterMetadata;
  const total = (meta.total + gradMeta.total).toLocaleString();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="flex min-h-dvh flex-col bg-gray-50 dark:bg-black">
      <header className="flex h-14 w-full items-center justify-between gap-4 border-b border-gray-200 bg-white/90 px-5 backdrop-blur dark:border-gray-800 dark:bg-black/90">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-gray-950 dark:text-gray-100">
          Scholarships
        </span>
        <div className="flex items-center gap-3">
          <a
            href="/search/undergrad"
            className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-950 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-gray-100"
          >
            Browse all
          </a>
          <a
            href="https://www.uvic.ca/scholarships/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 text-[13px] text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300 sm:inline-flex"
          >
            UVic
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 3H9V8.5M9 3L3 9" />
            </svg>
          </a>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-2xl space-y-6 text-center">
          <div className="space-y-3">
            <p className="text-[2.25rem] font-bold leading-[1.1] tracking-[-0.04em] text-gray-950 dark:text-gray-100 md:text-5xl" style={{ wordSpacing: "-0.04em" }}>
              Find scholarships fast
            </p>
            <p className="text-[2.25rem] font-bold leading-[1.1] tracking-[-0.04em] text-gray-400 dark:text-gray-500 md:text-5xl">
              with one search.
            </p>
            <p className="text-base font-normal text-gray-400 dark:text-gray-500">
              {total} awards. Start with a quick pick or search.
            </p>

          </div>

          <div className="mx-auto w-[min(520px,90vw)] space-y-4">
            <LandingSearch />
            <div className="grid gap-2 sm:grid-cols-3">
              <a
                href="/search/undergrad?awardType=Entrance%20scholarship"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left transition-colors hover:border-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-600"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">First-year</p>
                <p className="text-[12px] text-gray-400 dark:text-gray-500">Entrance awards</p>
              </a>
              <a
                href="/search/undergrad?applicationRequired=no"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left transition-colors hover:border-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-600"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">No essay required</p>
                <p className="text-[12px] text-gray-400 dark:text-gray-500">Auto-awarded</p>
              </a>
              <a
                href="/search/grad"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left transition-colors hover:border-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-600"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Graduate</p>
                <p className="text-[12px] text-gray-400 dark:text-gray-500">{gradMeta.total.toLocaleString()} awards</p>
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-5 text-center text-[12px] text-gray-400 dark:text-gray-600">
        Built by{" "}
        <a
          href="https://smccl.ca"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-gray-300 underline-offset-2 transition-colors hover:text-gray-600 hover:decoration-gray-400 dark:decoration-gray-700 dark:hover:text-gray-400 dark:hover:decoration-gray-500"
        >
          smccl.ca
        </a>
      </footer>
    </div>
    </>
  );
}
