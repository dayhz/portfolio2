import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import DashboardHome from '@/components/DashboardHome';

export default function Dashboard() {
  // Vérifier si l'utilisateur est connecté
  const token = localStorage.getItem('auth-token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/profile" element={<div className="p-6"><h1 className="text-2xl font-bold">Profile Page (Coming Soon)</h1></div>} />
        <Route path="/projects" element={<div className="p-6"><h1 className="text-2xl font-bold">Projects Page (Coming Soon)</h1></div>} />
        <Route path="/testimonials" element={<div className="p-6"><h1 className="text-2xl font-bold">Testimonials Page (Coming Soon)</h1></div>} />
        <Route path="/services" element={<div className="p-6"><h1 className="text-2xl font-bold">Services Page (Coming Soon)</h1></div>} />
        <Route path="/media" element={<div className="p-6"><h1 className="text-2xl font-bold">Media Page (Coming Soon)</h1></div>} />
        <Route path="/about" element={<div className="p-6"><h1 className="text-2xl font-bold">About Page (Coming Soon)</h1></div>} />
      </Routes>
    </Layout>
  );
}