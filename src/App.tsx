import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LineIndexPage } from './pages/LineIndexPage'
import { StampGuidePage } from './pages/StampGuidePage'
import { StampMakerPage } from './pages/StampMakerPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/line" element={<LineIndexPage />} />
        <Route path="/line/stamp" element={<StampGuidePage />} />
        <Route path="/line/stamp/maker" element={<StampMakerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
