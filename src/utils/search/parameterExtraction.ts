
// Parameter extraction utilities for search
import { SearchFilters } from '@/types/search';

// Clean version with no filter extraction
export const extractSearchParameters = (searchQuery: string): Partial<SearchFilters> => {
  // Return empty object as we're not using filters
  return {};
};
