import React, { useEffect, useState } from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [loading, setLoading] = useState(true);
  const [hasKey, setHasKey] = useState(false);

  // Helper to access aistudio safely without conflicting with global type definitions
  const getAiStudio = () => {
    return (window as any).aistudio;
  };

  const checkKey = async () => {
    try {
      const aistudio = getAiStudio();
      if (aistudio && aistudio.hasSelectedApiKey) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
        if (selected) {
          onKeySelected();
        }
      }
    } catch (e) {
      console.error("Error checking API key:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    try {
      const aistudio = getAiStudio();
      if (aistudio && aistudio.openSelectKey) {
        await aistudio.openSelectKey();
        // Assuming success if the modal closes without error, trigger re-check/callback
        // The instructions say "assume the key selection was successful... Do not add delay"
        setHasKey(true);
        onKeySelected();
      }
    } catch (e) {
      console.error("Failed to select key:", e);
      alert("Failed to select API key. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-spati-dark text-white p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spati-accent mb-4"></div>
        <p>Loading Partner Creator...</p>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-spati-dark text-white p-6 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-spati-accent mb-2">Partner Creator</h1>
          <p className="text-gray-400">Create stunning ads for your business in seconds.</p>
        </div>

        <div className="bg-spati-card p-8 rounded-xl max-w-md w-full border border-gray-800 shadow-2xl">
          <p className="mb-6 text-lg">
            To use the high-quality <strong>Nano Banana Pro</strong> model, you need to connect your billing account.
          </p>
          
          <button
            onClick={handleSelectKey}
            className="w-full bg-spati-accent hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Connect API Key
          </button>
          
          <p className="mt-6 text-xs text-gray-500">
            Learn more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-spati-accent">ai.google.dev</a>
          </p>
        </div>
      </div>
    );
  }

  return null; // Should not render if key is selected (parent handles rendering app)
};

export default ApiKeySelector;