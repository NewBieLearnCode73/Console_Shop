export function PaginationResult<T = any>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  return {
    data,
    total,
    page,
    pageCount: Math.ceil(total / limit),
  };
}
