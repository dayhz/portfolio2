import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';
import { NotificationProvider } from './contexts/NotificationContext';
import { SearchProvider } from './contexts/SearchContext';
import { PreviewProvider } from './contexts/PreviewContext';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import MediaPage from './pages/MediaPage';
import TestimonialsPage from './pages/TestimonialsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectNewPage from './pages/ProjectNewPage';
import ProjectContentPage from './pages/ProjectContentPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import { UniversalEditorTestPage } from './pages/UniversalEditorTestPage';
import { ProjectPreviewPage } from './pages/ProjectPreviewPage';
import { TemplateProjectPage } from './pages/TemplateProjectPage';
import { TemplateProjectsListPage } from './pages/TemplateProjectsListPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import GlobalSearch from './components/search/GlobalSearch';
import { Button } from '@/components/ui/button';
import UnifiedPreview from './components/preview/UnifiedPreview';

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
        <SearchProvider>
          <PreviewProvider>
            <AuthProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/preview-project" element={<ProjectPreviewPage />} />
                  <Route path="/search" element={
                  <div className="min-h-screen bg-gray-50 p-8">
                    <div className="max-w-7xl mx-auto">
                      <h1 className="text-2xl font-bold mb-6">Recherche</h1>
                      <div className="flex justify-center mb-8">
                        <GlobalSearch />
                      </div>
                      <SearchResultsPage />
                    </div>
                  </div>
                } />
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
                          <Route path="/projects/content" element={<ProjectContentPage />} />
                          <Route path="/projects/edit/:id" element={<ProjectContentPage />} />
                          <Route path="/testimonials" element={<TestimonialsPage />} />
                          <Route path="/services" element={<ServicesPage />} />
                          <Route path="/media" element={<MediaPage />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/test-editor" element={<UniversalEditorTestPage />} />
                          <Route path="/template-projects" element={<TemplateProjectsListPage />} />
                          <Route path="/template-editor/new" element={<TemplateProjectPage />} />
                          <Route path="/template-editor/:id" element={<TemplateProjectPage />} />
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
            <UnifiedPreview />
          </Router>
            </AuthProvider>
          </PreviewProvider>
        </SearchProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;