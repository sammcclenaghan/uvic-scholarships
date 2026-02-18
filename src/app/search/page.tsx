import { ScholarshipSearch } from "../../components/scholarship-search";
import { ActiveFilters, FilterMetadata, Scholarship } from "../../lib/types";
import scholarshipsData from "../../../data/scholarships.json";
import metadataJson from "../../../data/metadata.json";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const scholarships = scholarshipsData as Scholarship[];
  const meta = metadataJson as FilterMetadata;

  const departmentFilter = meta.filters.find((f) => f.label === "Department");
  const departments = (departmentFilter?.values || []).map((v) =>
    typeof v === "string" ? v : v.text
  );

  const studentFocusFilter = meta.filters.find(
    (f) => f.label === "Student focus"
  );
  const studentFocusOptions = (studentFocusFilter?.values || []).map((v) =>
    typeof v === "string" ? v : v.text
  );

  const initialFilters: Partial<ActiveFilters> = {};
  const q = getParam(params, "q");
  if (q) initialFilters.search = q;

  const filterKeys: (keyof ActiveFilters)[] = [
    "awardType",
    "applicationRequired",
    "renewable",
    "studentFocus",
    "department",
  ];

  filterKeys.forEach((key) => {
    const value = getParam(params, key);
    if (value) initialFilters[key] = value;
  });

  return (
    <ScholarshipSearch
      scholarships={scholarships}
      departments={departments}
      studentFocusOptions={studentFocusOptions}
      initialFilters={initialFilters}
    />
  );
}
