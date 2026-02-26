import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScholarshipSearch } from "../../../components/scholarship-search";
import { ActiveFilters, FilterMetadata, Scholarship } from "../../../lib/types";
import undergradScholarships from "../../../../data/scholarships.json";
import undergradMeta from "../../../../data/metadata.json";
import gradScholarships from "../../../../data/graduate-scholarships.json";
import gradMeta from "../../../../data/graduate-metadata.json";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function extractOptions(meta: FilterMetadata, label: string): string[] {
  const filter = meta.filters.find((f) => f.label === label);
  return (filter?.values || []).map((v) =>
    typeof v === "string" ? v : v.text
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ level: "undergrad" }, { level: "grad" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level } = await params;
  if (level === "grad") {
    return {
      title: "Graduate Scholarships & Funding",
      description:
        "Browse and filter UVic graduate scholarships, fellowships, and funding opportunities at the University of Victoria.",
      alternates: {
        canonical: "https://scholarships.smccl.ca/search/grad",
      },
    };
  }
  return {
    title: "Undergraduate Scholarships & Awards",
    description:
      "Browse and filter 1,300+ UVic undergraduate scholarships, bursaries, and entrance awards at the University of Victoria.",
    alternates: {
      canonical: "https://scholarships.smccl.ca/search/undergrad",
    },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { level } = await params;
  if (level !== "undergrad" && level !== "grad") notFound();

  const sp = await searchParams;

  const initialFilters: Partial<ActiveFilters> = {};
  const q = getParam(sp, "q");
  if (q) initialFilters.search = q;
  const filterKeys: (keyof ActiveFilters)[] = [
    "awardType",
    "applicationRequired",
    "renewable",
    "studentFocus",
    "department",
  ];
  filterKeys.forEach((key) => {
    const value = getParam(sp, key);
    if (value) initialFilters[key] = value;
  });

  if (level === "undergrad") {
    const meta = undergradMeta as FilterMetadata;

    return (
      <ScholarshipSearch
        level="undergrad"
        scholarships={undergradScholarships as Scholarship[]}
        departments={extractOptions(meta, "Department")}
        awardTypeOptions={[
          ["Entrance scholarship", "Entrance"],
          ["In-course scholarships for continuing students", "In-course"],
          ["Travel awards for continuing students", "Travel"],
        ]}
        studentFocusOptions={extractOptions(meta, "Student focus")}
        initialFilters={initialFilters}
      />
    );
  }

  const meta = gradMeta as FilterMetadata;

  return (
    <ScholarshipSearch
      level="grad"
      scholarships={gradScholarships as Scholarship[]}
      departments={extractOptions(meta, "Filter by department")}
      awardTypeOptions={[
        ["Masters", "Masters"],
        ["PhD", "PhD"],
        ["External awards", "External"],
        ["Part-time studies", "Part-time"],
        ["Indigenous students", "Indigenous"],
        ["Gender-based", "Gender-based"],
        ["Students with disabilities", "Disabilities"],
      ]}
      studentFocusOptions={[]}
      initialFilters={initialFilters}
    />
  );
}
