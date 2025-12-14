import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Routing', () => {
  const renderApp = () => {
    return render(<App />)
  }

  it('renders without crashing', () => {
    renderApp()
    expect(document.body).toBeInTheDocument()
  })

  it('has text content', () => {
    renderApp()
    // Just verify the app renders with content
    expect(document.body.textContent).toBeTruthy()
  })
})
