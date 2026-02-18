import { LandingSearch } from "../components/landing-search";
import { FilterMetadata } from "../lib/types";
import metadataJson from "../../data/metadata.json";

export default function Home() {
  const meta = metadataJson as FilterMetadata;
  const total = meta.total.toLocaleString();

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <header className="flex h-14 w-full items-center justify-between gap-4 border-b border-gray-200 bg-white/90 px-5 backdrop-blur">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-gray-950">
          Scholarships
        </span>
        <div className="flex items-center gap-3">
          <a
            href="/search"
            className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-950"
          >
            Browse all
          </a>
          <a
            href="https://www.uvic.ca/scholarships/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 text-[13px] text-gray-400 transition-colors hover:text-gray-900 sm:inline-flex"
          >
            UVic
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 3H9V8.5M9 3L3 9" />
            </svg>
          </a>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-2xl space-y-6 text-center">
          <div className="space-y-3">
            <p className="text-[2.25rem] font-bold leading-[1.1] tracking-[-0.04em] text-gray-950 md:text-5xl">
              Find scholarships fast
            </p>
            <p className="text-[2.25rem] font-bold leading-[1.1] tracking-[-0.04em] text-gray-400 md:text-5xl">
              with one search.
            </p>
            <p className="text-base font-normal text-gray-400">
              {total} awards. Start with a quick pick or search.
            </p>
          </div>

          <div className="mx-auto w-[min(520px,90vw)] space-y-4">
            <LandingSearch />
            <div className="grid gap-2 sm:grid-cols-3">
              <a
                href="/search?awardType=Entrance%20scholarship"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left transition-colors hover:border-gray-400"
              >
                <p className="text-sm font-medium text-gray-900">First-year</p>
                <p className="text-[12px] text-gray-400">Entrance awards</p>
              </a>
              <a
                href="/search?applicationRequired=no"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left transition-colors hover:border-gray-400"
              >
                <p className="text-sm font-medium text-gray-900">No application</p>
                <p className="text-[12px] text-gray-400">Auto-awarded</p>
              </a>
              <a
                href="/search?q=financial%20need"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left transition-colors hover:border-gray-400"
              >
                <p className="text-sm font-medium text-gray-900">Financial need</p>
                <p className="text-[12px] text-gray-400">Need-based</p>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
