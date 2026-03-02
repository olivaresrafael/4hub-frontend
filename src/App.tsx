import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores';
import { ProtectedRoute } from './components/auth';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  SongsPage,
  NewSongPage,
  EditSongPage,
  SongViewPage,
  ExplorePage,
  PublicSongPage,
} from './pages';

function App() {
  const { initialize, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/songs/:id/public" element={<PublicSongPage />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/songs" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/songs" replace /> : <RegisterPage />}
        />
        <Route
          path="/songs"
          element={
            <ProtectedRoute>
              <SongsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/songs/new"
          element={
            <ProtectedRoute>
              <NewSongPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/songs/:id/edit"
          element={
            <ProtectedRoute>
              <EditSongPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/songs/:id/view"
          element={
            <ProtectedRoute>
              <SongViewPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
