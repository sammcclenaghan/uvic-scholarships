"use client";

import { useState } from "react";
import { Scholarship } from "../lib/types";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  isLast: boolean;
}

function extractDollar(amount: string): string | null {
  const m = amount.match(/\$([\d,]+)/);
  return m ? `$${m[1]}` : null;
}

export function ScholarshipCard({ scholarship: s, isLast }: ScholarshipCardProps) {
  const [open, setOpen] = useState(false);
  const dollar = extractDollar(s.amount);
  const auto = s.applicationRequired === false;
  const enriched = s.enriched;

  return (
    <div className={!isLast ? "border-b border-gray-100 dark:border-gray-800" : ""}>
      {/* Row */}
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 sm:px-5"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-950 dark:text-gray-100">
            {s.name}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-gray-400 dark:text-gray-500">
            {s.departments.join(", ") || "All departments"}
            {s.deadline && s.deadline !== "no application required" && (
              <> &middot; {s.deadline}</>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {auto && (
            <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Auto
            </span>
          )}
          <span
            className={`text-sm tabular-nums ${dollar ? "font-semibold text-gray-950 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}
          >
            {dollar || "Varies"}
          </span>
          <svg
            className={`h-4 w-4 text-gray-300 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.0607 6.74999L11.5303 7.28032L8.7071 10.1035C8.31657 10.4941 7.68341 10.4941 7.29288 10.1035L4.46966 7.28032L3.93933 6.74999L4.99999 5.68933L5.53032 6.21966L7.99999 8.68933L10.4697 6.21966L11 5.68933L12.0607 6.74999Z"
            />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-4 pb-5 pt-4 dark:border-gray-800 dark:bg-gray-900/50 sm:px-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Left */}
            <div>
              <p className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-400">
                {s.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-gray-400 dark:text-gray-500">
                {s.awardType.map((t) => (
                  <span key={t}>{t}</span>
                ))}
                {s.renewable && <span>Renewable</span>}
                {s.studentFocus.map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>
            </div>

            {/* Right - what you need */}
            <div>
              {enriched && (
                <>
                  {auto && enriched.documents.length === 0 ? (
                    <div className="flex items-center gap-2 text-[13px] text-gray-500">
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L7 8.94 5.28 7.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z"
                        />
                      </svg>
                      Awarded automatically
                    </div>
                  ) : (
                    <div>
                      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Requirements
                      </p>
                      {enriched.documents.length > 0 ? (
                        <ul className="space-y-1">
                          {enriched.documents.map((doc, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-1.5 text-[13px] text-gray-600 dark:text-gray-400"
                            >
                              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[13px] text-gray-500">
                          Online application via UVic
                        </p>
                      )}
                    </div>
                  )}

                  {(enriched.financialNeed || enriched.yearRequirement) && (
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-gray-400">
                      {enriched.yearRequirement && (
                        <span>Year: {enriched.yearRequirement}</span>
                      )}
                      {enriched.financialNeed && <span>Financial need</span>}
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                {!auto && (
                  <a
                    href={
                      enriched?.applyUrl || "https://www.uvic.ca/tools/student"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    Apply
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6.75 3.5L11.25 8L6.75 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </a>
                )}
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[13px] text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200"
                  >
                    Details
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.75 1H11.5V1.75V4H13.25H14V5.5H13.25H11.5V7.25V8H10V7.25V5.5H8.25H7.5V4H8.25H10V1.75V1H10.75ZM2 4V4.75V12.25C2 12.6642 2.33579 13 2.75 13H10.25C10.6642 13 11 12.6642 11 12.25V8.5H12.5V12.25C12.5 13.4926 11.4926 14.5 10.25 14.5H2.75C1.50736 14.5 0.5 13.4926 0.5 12.25V4.75C0.5 3.50736 1.50736 2.5 2.75 2.5H6.5V4H2.75C2.33579 4 2 4.33579 2 4.75V4Z"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
