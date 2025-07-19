function TestApp() {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🎉 Portfolio CMS Test
        </h1>
        <p className="text-gray-600">
          Si tu vois ce message, React fonctionne correctement !
        </p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800 text-sm">
            ✅ React: OK<br/>
            ✅ Tailwind CSS: OK<br/>
            ✅ TypeScript: OK
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestApp;