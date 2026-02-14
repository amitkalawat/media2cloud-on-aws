import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { ToastProvider } from '@/components/ui/toast';
import SignInPage from '@/pages/SignInPage';
import CollectionPage from '@/pages/CollectionPage';
import MediaDetailPage from '@/pages/MediaDetailPage';
import UploadPage from '@/pages/UploadPage';
import NotFoundPage from '@/pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/signin" element={<SignInPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<Navigate to="/collection" replace />} />
                  <Route path="/collection" element={<CollectionPage />} />
                  <Route path="/collection/:type" element={<CollectionPage />} />
                  <Route path="/media/:uuid" element={<MediaDetailPage />} />
                  <Route path="/upload" element={<UploadPage />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </ToastProvider>
    </QueryClientProvider>
  );
}
