export interface EnrichedData {
  documents: string[];
  whereToApply: string;
  applyUrl: string | null;
  eligibilitySummary: string;
  financialNeed: boolean;
  yearRequirement: string | null;
}

export interface Scholarship {
  id: number;
  name: string;
  url: string | null;
  description: string;
  deadline: string;
  amount: string;
  departments: string[];
  applicationRequired: boolean | null;
  renewable: boolean;
  studentFocus: string[];
  awardType: string[];
  enriched: EnrichedData | null;
}

export interface FilterMetadata {
  filters: {
    label: string;
    type: string;
    values: (string | { value: string; text: string })[];
  }[];
  total: number;
  lastUpdated: string;
}

export interface ActiveFilters {
  search: string;
  awardType: string;
  applicationRequired: string;
  renewable: string;
  studentFocus: string;
  department: string;
}
