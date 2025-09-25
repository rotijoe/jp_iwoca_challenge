import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import {
  mockApplications,
  mockSecondPageApplications
} from './__fixtures__/applications.fixture'
import userEvent from '@testing-library/user-event'
import Applications from './Applications'

const createMockResponse = (data: any, hasNextPage = false) => ({
  ok: true,
  json: vi.fn().mockResolvedValue(data),
  headers: {
    get: vi.fn().mockReturnValue(hasNextPage ? 'rel="next"' : null)
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

it('renders applications when data is available', async () => {
  const mockFetch = vi
    .fn()
    .mockResolvedValue(createMockResponse(mockApplications))
  vi.stubGlobal('fetch', mockFetch)

  render(<Applications />)

  await waitFor(() => {
    expect(screen.getByText('bakayo@test.com')).toBeInTheDocument()
    expect(screen.getByText('mikel@test.com')).toBeInTheDocument()
  })
})

it('renders load more button when hasMore is true', async () => {
  const mockFetch = vi
    .fn()
    .mockResolvedValue(createMockResponse(mockApplications, true))
  vi.stubGlobal('fetch', mockFetch)

  render(<Applications />)

  await waitFor(() => {
    expect(screen.getByText('Load More')).toBeInTheDocument()
  })
})

it('handles fetch error gracefully', async () => {
  const mockFetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'))
  vi.stubGlobal('fetch', mockFetch)

  render(<Applications />)

  await waitFor(() => {
    expect(screen.queryByText('Load More')).not.toBeInTheDocument()
  })
  await waitFor(() => {
    expect(screen.queryByText('Failed to fetch')).toBeInTheDocument()
  })
})

it('calls loadMore when load more button is clicked', async () => {
  const mockFetch = vi
    .fn()
    .mockResolvedValueOnce(createMockResponse(mockApplications, true))
    .mockResolvedValueOnce(
      createMockResponse(mockSecondPageApplications.slice(0, 1), false)
    )
  vi.stubGlobal('fetch', mockFetch)

  render(<Applications />)

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  const loadMoreButton = screen.getByText('Load More')
  userEvent.click(loadMoreButton)

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  expect(mockFetch).toHaveBeenNthCalledWith(
    2,
    'http://localhost:3001/api/applications?_page=2&_limit=5'
  )
})

it('shows loading state on load more button when loading more', async () => {
  const mockFetch = vi
    .fn()
    .mockResolvedValueOnce(createMockResponse(mockApplications, true))
    .mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                createMockResponse(mockSecondPageApplications.slice(0, 1), true)
              ),
            100
          )
        )
    )
  vi.stubGlobal('fetch', mockFetch)

  render(<Applications />)

  await waitFor(() => {
    expect(screen.getByText('Load More')).toBeInTheDocument()
  })

  const loadMoreButton = screen.getByText('Load More')
  await userEvent.click(loadMoreButton)

  expect(screen.getByText('Loading...')).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.getByText('Load More')).toBeInTheDocument()
  })
})

it('appends new applications when load more is clicked', async () => {
  const firstPageApps = mockApplications.slice(0, 1)
  const secondPageApps = mockSecondPageApplications.slice(0, 1)

  const mockFetch = vi
    .fn()
    .mockResolvedValueOnce(createMockResponse(firstPageApps, true))
    .mockResolvedValueOnce(createMockResponse(secondPageApps, false))
  vi.stubGlobal('fetch', mockFetch)

  render(<Applications />)

  await waitFor(() => {
    expect(screen.getByText(firstPageApps[0].email)).toBeInTheDocument()
  })

  const loadMoreButton = screen.getByText('Load More')
  await userEvent.click(loadMoreButton)

  await waitFor(() => {
    expect(screen.getByText(secondPageApps[0].email)).toBeInTheDocument()
  })

  expect(screen.getByText(firstPageApps[0].email)).toBeInTheDocument()
})

it('hides load more button when no more pages available', async () => {
  const mockFetch = vi
    .fn()
    .mockResolvedValueOnce(createMockResponse(mockApplications, true))
    .mockResolvedValueOnce(
      createMockResponse(mockSecondPageApplications.slice(0, 1), false)
    )
  vi.stubGlobal('fetch', mockFetch)

  render(<Applications />)

  await waitFor(() => {
    expect(screen.getByText('Load More')).toBeInTheDocument()
  })

  const loadMoreButton = screen.getByText('Load More')
  await userEvent.click(loadMoreButton)

  await waitFor(() => {
    expect(screen.queryByText('Load More')).not.toBeInTheDocument()
  })
})

it('does not call loadMore when already loading', async () => {
  const mockFetch = vi
    .fn()
    .mockResolvedValueOnce(createMockResponse(mockApplications, true))
    .mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                createMockResponse(
                  mockSecondPageApplications.slice(1, 2),
                  false
                )
              ),
            100
          )
        )
    )
  vi.stubGlobal('fetch', mockFetch)

  render(<Applications />)

  await waitFor(() => {
    expect(screen.getByText('Load More')).toBeInTheDocument()
  })

  const loadMoreButton = screen.getByText('Load More')
  await userEvent.click(loadMoreButton)

  await userEvent.click(loadMoreButton)

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})
