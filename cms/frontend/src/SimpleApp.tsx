import { useState } from 'react';

function SimpleApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@portfolio.com' && password === 'admin123') {
      setIsLoggedIn(true);
    } else {
      alert('Identifiants incorrects');
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Portfolio CMS Dashboard</h1>
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Déconnexion
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800">Projets</h3>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800">Témoignages</h3>
                <p className="text-2xl font-bold text-green-600">8</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800">Médias</h3>
                <p className="text-2xl font-bold text-purple-600">156</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Actions Rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 text-left">
                  <h3 className="font-semibold">Ajouter un projet</h3>
                  <p className="text-sm opacity-90">Créer un nouveau projet portfolio</p>
                </button>
                <button className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 text-left">
                  <h3 className="font-semibold">Gérer les médias</h3>
                  <p className="text-sm opacity-90">Upload et organiser les images</p>
                </button>
                <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 text-left">
                  <h3 className="font-semibold">Nouveau témoignage</h3>
                  <p className="text-sm opacity-90">Ajouter un témoignage client</p>
                </button>
                <button className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 text-left">
                  <h3 className="font-semibold">Modifier le profil</h3>
                  <p className="text-sm opacity-90">Mettre à jour les informations</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Portfolio CMS</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@portfolio.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin123"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Se connecter
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Identifiants de test:</p>
          <p>Email: admin@portfolio.com</p>
          <p>Mot de passe: admin123</p>
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;