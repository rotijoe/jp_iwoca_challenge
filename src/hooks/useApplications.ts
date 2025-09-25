import { useState } from 'react'

interface Application {
  id: string
  loan_amount: number
  first_name: string
  last_name: string
  company: string
  email: string
  date_created: string
  expiry_date: string
}

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchApplications = async (pageNum: number, append = false) => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:3001/api/applications?_page=${pageNum}&_limit=5`
      )

      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      const linkHeader = response.headers.get('Link')
      const hasNextPage = linkHeader?.includes('rel="next"')

      setApplications((prev) => (append ? [...prev, ...data] : data))
      setHasMore(hasNextPage || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchApplications(nextPage, true)
    }
  }

  return { fetchApplications, applications, loading, error, hasMore, loadMore }
}
