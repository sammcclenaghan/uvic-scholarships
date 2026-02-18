"use client";

import { useState, useMemo, useCallback, useRef, useEffect, useDeferredValue, useTransition } from "react";
import { Scholarship, ActiveFilters } from "../lib/types";
import { ScholarshipCard } from "./scholarship-card";

const RESULTS_PAGE_SIZE = 50;

interface Props {
  scholarships: Scholarship[];
  departments: string[];
  studentFocusOptions: string[];
  initialFilters?: Partial<ActiveFilters>;
}

const EMPTY: ActiveFilters = {
  search: "",
  awardType: "",
  applicationRequired: "",
  renewable: "",
  studentFocus: "",
  department: "",
};

const QUERY_PARAM = "q";

export function ScholarshipSearch({
  scholarships,
  departments,
  studentFocusOptions,
  initialFilters,
}: Props) {
  const [filters, setFilters] = useState<ActiveFilters>(() => ({
    ...EMPTY,
    ...initialFilters,
  }));
  const [searchInput, setSearchInput] = useState(
    initialFilters?.search ?? ""
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [visibleCount, setVisibleCount] = useState(RESULTS_PAGE_SIZE);
  const deferredSearch = useDeferredValue(searchInput);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        return;
      }
      if (document.activeElement === inputRef.current) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        setSearchInput((prev) => prev.slice(0, -1));
        inputRef.current?.focus();
      } else if (e.key === "/" || (e.key.length === 1 && !e.repeat)) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    (Object.keys(filters) as (keyof ActiveFilters)[]).forEach((k) => {
      if (k === "search") return;
      if (!filters[k]) return;
      params.set(k, filters[k]);
    });
    if (deferredSearch) params.set(QUERY_PARAM, deferredSearch);
    const query = params.toString();
    const nextUrl = query ? `?${query}` : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [filters, deferredSearch]);

  const set = useCallback(
    (k: keyof ActiveFilters, v: string) =>
      setFilters((p) => ({ ...p, [k]: v })),
    []
  );

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasFilters = useMemo(
    () => deferredSearch !== "" || Object.entries(filters).some(([k, v]) => k !== "search" && v !== ""),
    [filters, deferredSearch]
  );

  const filtered = useMemo(() => {
    const terms = deferredSearch
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return scholarships.filter((s) => {
      if (terms.length) {
        const hay = [
          s.name,
          s.description,
          ...s.departments,
          ...s.studentFocus,
          ...s.awardType,
          s.enriched?.eligibilitySummary || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      if (filters.awardType && !s.awardType.includes(filters.awardType))
        return false;
      if (
        filters.applicationRequired === "yes" &&
        s.applicationRequired !== true
      )
        return false;
      if (
        filters.applicationRequired === "no" &&
        s.applicationRequired !== false
      )
        return false;
      if (filters.renewable === "yes" && !s.renewable) return false;
      if (filters.renewable === "no" && s.renewable) return false;
      if (filters.studentFocus && !s.studentFocus.includes(filters.studentFocus))
        return false;
      if (filters.department && !s.departments.includes(filters.department))
        return false;
      return true;
    });
  }, [scholarships, filters, deferredSearch]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(RESULTS_PAGE_SIZE);
  }, [deferredSearch, filters.awardType, filters.applicationRequired, filters.renewable, filters.studentFocus, filters.department]);

  // Infinite scroll: load more when sentinel enters viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startTransition(() =>
            setVisibleCount((c) => c + RESULTS_PAGE_SIZE)
          );
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filtered.length, startTransition]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50 dark:bg-black">
      <header className="sticky top-0 z-30 w-full shrink-0 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-black/90">
        <div className="flex h-14 items-center gap-4 px-5">
          <a href="/" className="shrink-0 text-[15px] font-semibold tracking-[-0.01em] text-gray-950 dark:text-gray-100">
            Scholarships
          </a>

          <div className="hidden min-w-0 flex-1 sm:block">
            <div className="relative mx-auto max-w-xl">
              <label
                htmlFor="search-header"
                className="absolute inset-y-0 left-0 flex items-center pl-3"
              >
                <svg
                  className="h-4 w-4 text-gray-400"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.5 6.5C1.5 3.73858 3.73858 1.5 6.5 1.5C9.26142 1.5 11.5 3.73858 11.5 6.5C11.5 9.26142 9.26142 11.5 6.5 11.5C3.73858 11.5 1.5 9.26142 1.5 6.5ZM6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C8.02469 13 9.42677 12.475 10.5353 11.596L13.9697 15.0303L14.5 15.5607L15.5607 14.5L15.0303 13.9697L11.596 10.5353C12.475 9.42677 13 8.02469 13 6.5C13 2.91015 10.0899 0 6.5 0Z"
                  />
                </svg>
              </label>
              <input
                ref={inputRef}
                id="search-header"
                type="search"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                placeholder="Search scholarships..."
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="block w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-12 text-sm tracking-[-0.01em] text-gray-950 outline-none placeholder:text-gray-400 hover:border-[#A8A8A8] focus:border-[#A8A8A8] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-white"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
                  Esc
                </kbd>
              </div>
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <a
              href="/search"
              className="shrink-0 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-950 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-gray-100"
            >
              Browse all
            </a>
            <a
              href="https://www.uvic.ca/scholarships/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden shrink-0 items-center gap-1 text-[13px] text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300 sm:inline-flex"
            >
              UVic
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 3H9V8.5M9 3L3 9" />
              </svg>
            </a>
          </div>
        </div>

      </header>

      <div className="border-b border-gray-200 bg-white/80 px-5 py-3 dark:border-gray-800 dark:bg-black/80 sm:hidden">
        <div className="relative">
          <label
            htmlFor="search-header-mobile"
            className="absolute inset-y-0 left-0 flex items-center pl-3"
          >
            <svg
              className="h-4 w-4 text-gray-400"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.5 6.5C1.5 3.73858 3.73858 1.5 6.5 1.5C9.26142 1.5 11.5 3.73858 11.5 6.5C11.5 9.26142 9.26142 11.5 6.5 11.5C3.73858 11.5 1.5 9.26142 1.5 6.5ZM6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C8.02469 13 9.42677 12.475 10.5353 11.596L13.9697 15.0303L14.5 15.5607L15.5607 14.5L15.0303 13.9697L11.596 10.5353C12.475 9.42677 13 8.02469 13 6.5C13 2.91015 10.0899 0 6.5 0Z"
              />
            </svg>
          </label>
          <input
            id="search-header-mobile"
            type="search"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            placeholder="Search scholarships..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-base tracking-[-0.01em] text-gray-950 outline-none placeholder:text-gray-400 hover:border-[#A8A8A8] focus:border-[#A8A8A8] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-white dark:focus:border-white sm:text-sm"
          />
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white/80 px-5 py-2.5 backdrop-blur dark:border-gray-800 dark:bg-black/80">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterPill
              value={filters.awardType}
              onChange={(v) => set("awardType", v)}
              label="Type"
              options={[
                ["Entrance scholarship", "Entrance"],
                ["In-course scholarships for continuing students", "In-course"],
                ["Travel awards for continuing students", "Travel"],
              ]}
            />
            <FilterPill
              value={filters.applicationRequired}
              onChange={(v) => set("applicationRequired", v)}
              label="Application"
              options={[
                ["no", "Not required"],
                ["yes", "Required"],
              ]}
            />
            <FilterPill
              value={filters.department}
              onChange={(v) => set("department", v)}
              label="Department"
              options={departments.map((d) => [d, d])}
            />
            <FilterPill
              value={filters.studentFocus}
              onChange={(v) => set("studentFocus", v)}
              label="Focus"
              options={studentFocusOptions.map((s) => [s, s])}
            />
          </div>

          <div className="ml-auto shrink-0 text-[13px] text-gray-400">
            {filtered.length === scholarships.length ? (
              <span>{scholarships.length.toLocaleString()} scholarships</span>
            ) : (
              <span>
                <span className="text-gray-900 dark:text-gray-200">
                  {filtered.length.toLocaleString()}
                </span>{" "}
                of {scholarships.length.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-4 sm:px-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-32 text-center">
              <p className="text-sm text-gray-400">
                No scholarships match your search.
              </p>
              {hasFilters && (
                <button
                  onClick={() => {
                    setFilters(EMPTY);
                    setSearchInput("");
                  }}
                  className="mt-2 text-sm text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-900 dark:text-gray-200 dark:decoration-gray-600 dark:hover:decoration-gray-300"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                {filtered.slice(0, visibleCount).map((s, i) => (
                  <ScholarshipCard
                    key={s.id}
                    scholarship={s}
                    isLast={i === Math.min(visibleCount, filtered.length) - 1}
                  />
                ))}
              </div>
              {visibleCount < filtered.length && (
                <div ref={sentinelRef} className="h-px" />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function FilterPill({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: [string, string][];
}) {
  const active = value !== "";
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-auto shrink-0 appearance-none whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] outline-none transition-colors ${
        active
          ? "border-gray-400 bg-white text-gray-900 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-200"
          : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
      }`}
    >
      <option value="">{label}</option>
      {options.map(([val, lab]) => (
        <option key={val} value={val}>
          {lab}
        </option>
      ))}
    </select>
  );
}
