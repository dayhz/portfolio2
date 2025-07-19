#!/bin/bash

echo "🚀 Installation du Portfolio CMS..."

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "📦 Installation des dépendances du frontend..."
cd frontend
npm install
cd ..

echo "📦 Installation des dépendances du backend..."
cd backend
npm install

echo "🗄️ Configuration de la base de données..."
npm run db:generate
npm run db:push

cd ..

echo "✅ Installation terminée!"
echo ""
echo "Pour démarrer le CMS:"
echo "1. Backend: cd cms/backend && npm run dev"
echo "2. Frontend: cd cms/frontend && npm run dev"
echo ""
echo "Le CMS sera accessible sur http://localhost:3000"
echo "L'API sera accessible sur http://localhost:8000"