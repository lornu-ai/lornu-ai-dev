import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Home from '@/pages/Home'
import Terms from '@/pages/Terms'
import Privacy from '@/pages/Privacy'
import Security from '@/pages/Security'
import Contact from '@/pages/Contact'

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/security" element={<Security />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
