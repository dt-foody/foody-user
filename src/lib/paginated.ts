export interface Paginated<T, M extends object = Record<string, never>> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  /** Chỗ để nhét thêm metadata tuỳ API (filters applied, time range, v.v.) */
  meta?: M;
}