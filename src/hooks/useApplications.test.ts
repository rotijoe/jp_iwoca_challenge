import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useApplications } from './useApplications'
import { mockApplications } from '../__fixtures__/applications.fixture.js'

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

it('should fetch applications successfully', async () => {
  const mockResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue(mockApplications),
    headers: {
      get: vi.fn().mockReturnValue('rel="next"')
    }
  }
  mockFetch.mockResolvedValue(mockResponse)

  const { result } = renderHook(() => useApplications())

  await act(async () => {
    await result.current.fetchApplications(1)
  })

  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })

  expect(mockFetch).toHaveBeenCalledWith(
    'http://localhost:3001/api/applications?_page=1&_limit=5'
  )
  expect(result.current.applications).toEqual(mockApplications)
  expect(result.current.hasMore).toBe(true)
  expect(result.current.error).toBe(null)
})

it('should handle fetch error', async () => {
  const errorMessage = 'Failed to fetch'
  mockFetch.mockRejectedValue(new Error(errorMessage))

  const { result } = renderHook(() => useApplications())

  await act(async () => {
    await result.current.fetchApplications(1)
  })

  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })

  expect(result.current.error).toBe(errorMessage)
  expect(result.current.applications).toEqual([])
})

it('should handle non-ok response', async () => {
  const mockResponse = {
    ok: false,
    json: vi.fn(),
    headers: {
      get: vi.fn()
    }
  }
  mockFetch.mockResolvedValue(mockResponse)

  const { result } = renderHook(() => useApplications())

  await act(async () => {
    await result.current.fetchApplications(1)
  })

  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })

  expect(result.current.error).toBe('Failed to fetch')
  expect(result.current.applications).toEqual([])
})

it('should replace applications when append is false', async () => {
  const mockResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue([mockApplications[0]]),
    headers: {
      get: vi.fn().mockReturnValue('rel="next"')
    }
  }
  mockFetch.mockResolvedValue(mockResponse)

  const { result } = renderHook(() => useApplications())

  await act(async () => {
    await result.current.fetchApplications(1)
  })

  await waitFor(() => {
    expect(result.current.applications).toHaveLength(1)
  })

  const newMockResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue([mockApplications[1]]),
    headers: {
      get: vi.fn().mockReturnValue('')
    }
  }
  mockFetch.mockResolvedValue(newMockResponse)

  await act(async () => {
    await result.current.fetchApplications(2, false)
  })

  await waitFor(() => {
    expect(result.current.applications).toEqual([mockApplications[1]])
    expect(result.current.applications).toHaveLength(1)
  })
})

it('should append applications when append is true', async () => {
  const mockResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue([mockApplications[0]]),
    headers: {
      get: vi.fn().mockReturnValue('rel="next"')
    }
  }
  mockFetch.mockResolvedValue(mockResponse)

  const { result } = renderHook(() => useApplications())

  await act(async () => {
    await result.current.fetchApplications(1)
  })

  await waitFor(() => {
    expect(result.current.applications).toHaveLength(1)
  })

  const newMockResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue([mockApplications[1]]),
    headers: {
      get: vi.fn().mockReturnValue('')
    }
  }
  mockFetch.mockResolvedValue(newMockResponse)

  await act(async () => {
    await result.current.fetchApplications(2, true)
  })

  await waitFor(() => {
    expect(result.current.applications).toEqual(mockApplications)
    expect(result.current.applications).toHaveLength(2)
  })
})

it('should set hasMore to false when no next link in headers', async () => {
  const mockResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue(mockApplications),
    headers: {
      get: vi.fn().mockReturnValue('')
    }
  }
  mockFetch.mockResolvedValue(mockResponse)

  const { result } = renderHook(() => useApplications())

  await act(async () => {
    await result.current.fetchApplications(1)
  })

  await waitFor(() => {
    expect(result.current.hasMore).toBe(false)
  })
})

it('should set hasMore to true when next link exists in headers', async () => {
  const mockResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue(mockApplications),
    headers: {
      get: vi.fn().mockReturnValue('rel="next"')
    }
  }
  mockFetch.mockResolvedValue(mockResponse)

  const { result } = renderHook(() => useApplications())

  await act(async () => {
    await result.current.fetchApplications(1)
  })

  await waitFor(() => {
    expect(result.current.hasMore).toBe(true)
  })
})

it('loadMore should call fetchApplications with next page and append=true', async () => {
  const mockResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue([mockApplications[0]]),
    headers: {
      get: vi.fn().mockReturnValue('rel="next"')
    }
  }
  mockFetch.mockResolvedValue(mockResponse)

  const { result } = renderHook(() => useApplications())

  await act(async () => {
    await result.current.fetchApplications(1)
  })

  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })

  mockFetch.mockClear()

  const loadMoreResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue([mockApplications[1]]),
    headers: {
      get: vi.fn().mockReturnValue('')
    }
  }
  mockFetch.mockResolvedValue(loadMoreResponse)

  act(() => {
    result.current.loadMore()
  })

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/applications?_page=2&_limit=5'
    )
  })
})

it('loadMore should not call fetchApplications when loading is true', async () => {
  const mockResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue(mockApplications),
    headers: {
      get: vi.fn().mockReturnValue('rel="next"')
    }
  }
  mockFetch.mockResolvedValue(mockResponse)

  const { result } = renderHook(() => useApplications())

  act(() => {
    result.current.fetchApplications(1)
  })

  act(() => {
    result.current.loadMore()
  })

  expect(mockFetch).toHaveBeenCalledTimes(1)
})

it('loadMore should not call fetchApplications when hasMore is false', async () => {
  const mockResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue(mockApplications),
    headers: {
      get: vi.fn().mockReturnValue('')
    }
  }
  mockFetch.mockResolvedValue(mockResponse)

  const { result } = renderHook(() => useApplications())

  await act(async () => {
    await result.current.fetchApplications(1)
  })

  await waitFor(() => {
    expect(result.current.hasMore).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  mockFetch.mockClear()

  act(() => {
    result.current.loadMore()
  })

  expect(mockFetch).not.toHaveBeenCalled()
})

it('should handle non-Error objects in catch block', async () => {
  mockFetch.mockRejectedValue('String error')

  const { result } = renderHook(() => useApplications())

  await act(async () => {
    await result.current.fetchApplications(1)
  })

  await waitFor(() => {
    expect(result.current.error).toBe('An error occurred')
    expect(result.current.loading).toBe(false)
  })
})
