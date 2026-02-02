import React, { useState, useEffect } from 'react';
import AdBuilder from './components/AdBuilder';
import ApiKeySelector from './components/ApiKeySelector';
import { hasApiKey as checkEnvApiKey } from './services/gemini';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if API key is available from environment variable
    if (checkEnvApiKey()) {
      setHasApiKey(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-spati-dark text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spati-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spati-dark text-white font-sans selection:bg-spati-accent selection:text-black">
      {!hasApiKey ? (
        <ApiKeySelector onKeySelected={() => setHasApiKey(true)} />
      ) : (
        <AdBuilder />
      )}
    </div>
  );
};

export default App;