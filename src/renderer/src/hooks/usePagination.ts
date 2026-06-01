import { useState, useEffect, useMemo } from 'react'

interface Pagination<T> {
  pageItems: T[]
  currentPage: number
  totalPages: number
  setPage: (page: number) => void
}

/**
 * Generic client-side pagination hook. It derives the current page slice and the
 * total page count from the supplied dataset, and automatically clamps back to a
 * valid page (resetting to the first page) whenever the dataset size changes, so
 * a shrinking filtered result never strands the user on an empty page.
 * @param items - The full, already-sorted dataset to paginate.
 * @param pageSize - The maximum number of items per page.
 * @returns The current page slice, page state, total page count, and a setter.
 */
function usePagination<T>(items: T[], pageSize: number): Pagination<T> {
  const [currentPage, setCurrentPage] = useState<number>(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, currentPage, pageSize])

  const setPage = (page: number): void => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  return { pageItems, currentPage, totalPages, setPage }
}

export { usePagination }
export type { Pagination }
