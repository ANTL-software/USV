export function buildPartenairePaginationPages(
  currentPage: number,
  totalPages: number,
): number[] {
  const visiblePages = Math.min(totalPages, 5);
  const firstPage = totalPages <= 5 || currentPage <= 3
    ? 1
    : currentPage >= totalPages - 2
      ? totalPages - 4
      : currentPage - 2;

  return Array.from({ length: visiblePages }, (_, index) => firstPage + index);
}
