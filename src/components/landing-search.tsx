"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SEARCH_DEBOUNCE_MS } from "../lib/search";

export function LandingSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const handle = window.setTimeout(() => {
      const next = `/search?q=${encodeURIComponent(trimmed)}`;
      router.replace(next);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [value, router]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }}
      className="relative"
    >
      <label
        htmlFor="search-landing"
        className="absolute inset-y-0 left-0 flex items-center pl-3.5"
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
        id="search-landing"
        name="q"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search by name, department, or keyword..."
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm tracking-[-0.01em] text-gray-950 outline-none placeholder:text-gray-400"
      />
    </form>
  );
}
