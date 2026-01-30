import React, { useState } from 'react';
import AdBuilder from './components/AdBuilder';
import ApiKeySelector from './components/ApiKeySelector';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);

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