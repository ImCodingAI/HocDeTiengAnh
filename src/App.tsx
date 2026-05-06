import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VocabProvider } from './hooks/useVocabDB';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Library } from './pages/Library';
import { Study } from './pages/Study';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <VocabProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="library" element={<Library />} />
            <Route path="study" element={<Study />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </VocabProvider>
  );
}

