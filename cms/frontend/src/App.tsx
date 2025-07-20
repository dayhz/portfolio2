import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import MediaPage from './pages/MediaPage';
import TestimonialsPage from './pages/TestimonialsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectNewPage from './pages/ProjectNewPage';
import ProjectContentPage from './pages/ProjectContentPage';
import { UniversalEditorTestPage } from './pages/UniversalEditorTestPage';
import { ProjectPreviewPage } from './pages/ProjectPreviewPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/preview-project" element={<ProjectPreviewPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/projects/new" element={<ProjectNewPage />} />
                        <Route path="/projects/new/content" element={<ProjectContentPage />} />
                        <Route path="/testimonials" element={<TestimonialsPage />} />
                        <Route path="/services" element={<div className="p-8 text-center text-gray-500">Page Services - En cours de développement</div>} />
                        <Route path="/media" element={<MediaPage />} />
                        <Route path="/about" element={<div className="p-8 text-center text-gray-500">Page À Propos - En cours de développement</div>} />
                        <Route path="/test-editor" element={<UniversalEditorTestPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          <Toaster position="top-right" />
          <ShadcnToaster />
        </Router>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;