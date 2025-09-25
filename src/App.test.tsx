import { render, screen } from '@testing-library/react'
import App from './App'

it('renders "Application Portal" title', () => {
  render(<App />)
  const linkElement = screen.getByText(/Application portal/i)
  expect(linkElement).toBeInTheDocument()
})
