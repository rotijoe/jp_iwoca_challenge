import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatName } from './singleApplication'

describe('formatCurrency', () => {
  it('should format positive numbers as GBP currency without decimals', () => {
    expect(formatCurrency(1000)).toBe('£1,000')
    expect(formatCurrency(50000)).toBe('£50,000')
  })

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('£0')
  })

  it('should format small amounts correctly', () => {
    expect(formatCurrency(1)).toBe('£1')
  })

  it('should format large amounts correctly', () => {
    expect(formatCurrency(1000000)).toBe('£1,000,000')
    expect(formatCurrency(999999999)).toBe('£999,999,999')
  })

  it('should handle decimal inputs by rounding', () => {
    expect(formatCurrency(1000.5)).toBe('£1,001')
    expect(formatCurrency(1000.49)).toBe('£1,000')
    expect(formatCurrency(999.99)).toBe('£1,000')
  })
})

describe('formatDate', () => {
  it('should format ISO datetime strings correctly', () => {
    expect(formatDate('2024-01-15T10:30:00Z')).toBe('15-01-2024')
    expect(formatDate('2023-12-25T23:59:59.999Z')).toBe('25-12-2023')
  })
})

describe('formatName', () => {
  it('should combine first and last names with a space', () => {
    expect(formatName('John', 'Doe')).toBe('John Doe')
  })

  it('should handle single character names', () => {
    expect(formatName('A', 'B')).toBe('A B')
    expect(formatName('X', 'Y')).toBe('X Y')
  })

  it('should handle names with special characters', () => {
    expect(formatName('Jean-Luc', 'Picard')).toBe('Jean-Luc Picard')
    expect(formatName("O'Connor", 'Smith')).toBe("O'Connor Smith")
  })

  it('should handle names with spaces', () => {
    expect(formatName('Mary Jane', 'Watson')).toBe('Mary Jane Watson')
    expect(formatName('John', 'Van Der Berg')).toBe('John Van Der Berg')
  })
})
