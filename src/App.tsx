import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LineIndexPage } from './pages/LineIndexPage'
import { StampMakerPage } from './pages/StampMakerPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/line" element={<LineIndexPage />} />
        {/* ガイドは廃止。旧URL・QR用に /line/stamp も maker へ */}
        <Route path="/line/stamp" element={<Navigate to="/line/stamp/maker" replace />} />
        <Route path="/line/stamp/maker" element={<StampMakerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
