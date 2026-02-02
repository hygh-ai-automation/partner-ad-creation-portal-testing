import React, { useState, useRef } from 'react';
import { GenerationMode, AdSettings, GeneratedAd } from '../types';
import { generateAd } from '../services/gemini';
import SettingsModal from './SettingsModal';

const DEFAULT_BASE_PROMPT = "Create a high-quality, energetic social media advertisement for a local business partner. The image should be in a 9:16 vertical format suitable for stories. Make it look professional, appealing, and authentic to the business type.";

const LOCATION_TYPES = [
  "Spätkauf / Kiosk",
  "Gastronomie (Imbiss, Café)",
  "Paketshop (DPD/DHL/Hermes)",
  "Schlüsseldienst",
  "Friseur / Barbershop",
  "Beauty / Nagelstudio",
  "Handy-Reparatur",
  "Sonstiges"
];

const AdBuilder: React.FC = () => {
  const [mode, setMode] = useState<GenerationMode>('text');
  const [locationType, setLocationType] = useState(LOCATION_TYPES[0]);
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedAd | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [spatiImage, setSpatiImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Admin Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AdSettings>({
    basePrompt: DEFAULT_BASE_PROMPT
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const spatiInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpatiUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSpatiImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!userPrompt && mode === 'text') {
      setError("Please describe your ad.");
      return;
    }
    if (!uploadedImage && mode === 'product') {
      setError("Please upload a product image.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedResult(null);

    try {
      const imageUrl = await generateAd({
        mode,
        userPrompt,
        basePrompt: settings.basePrompt,
        locationType: mode === 'text' ? locationType : undefined,
        productImageBase64: uploadedImage || undefined,
        logoImageBase64: logoImage || undefined,
        spatiImageBase64: spatiImage || undefined
      });

      setGeneratedResult({
        imageUrl,
        promptUsed: userPrompt,
        timestamp: Date.now()
      });
    } catch (e: any) {
      setError(e.message || "Failed to generate ad. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedResult) return;
    const link = document.createElement('a');
    link.href = generatedResult.imageUrl;
    link.download = `partner-ad-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-20 relative">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-spati-card border-b border-gray-800 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-spati-accent">Partner Creator</h1>
          <p className="text-xs text-gray-400">Powered by Nano Banana Pro</p>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        
        {/* Mode Switcher */}
        <div className="bg-gray-800 p-1 rounded-xl flex">
          <button
            onClick={() => setMode('text')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
              mode === 'text' 
                ? 'bg-spati-card text-spati-accent shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Creativity
          </button>
          <button
            onClick={() => setMode('product')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
              mode === 'product' 
                ? 'bg-spati-card text-spati-accent shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Product Boost
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          
          {mode === 'product' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Product Photo</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  uploadedImage ? 'border-spati-accent bg-gray-900' : 'border-gray-700 hover:border-gray-500 bg-gray-800'
                }`}
              >
                {uploadedImage ? (
                  <div className="relative w-full h-48">
                    <img 
                      src={uploadedImage} 
                      alt="Upload" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white font-semibold">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    <p className="text-sm text-gray-400">Tap to upload product</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          )}

          {mode === 'text' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Business Type</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700 focus:border-spati-accent focus:ring-1 focus:ring-spati-accent outline-none appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '0.8em'
                  }}
                >
                  {LOCATION_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Optional Reference Uploads */}
              <div className="grid grid-cols-2 gap-3">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Logo <span className="text-gray-500">(optional)</span></label>
                  <div 
                    onClick={() => logoInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors h-28 ${
                      logoImage ? 'border-spati-accent bg-gray-900' : 'border-gray-700 hover:border-gray-500 bg-gray-800'
                    }`}
                  >
                    {logoImage ? (
                      <div className="relative w-full h-full">
                        <img src={logoImage} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                        <button
                          onClick={(e) => { e.stopPropagation(); setLogoImage(null); }}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 mb-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <p className="text-xs text-gray-400">Logo</p>
                      </>
                    )}
                    <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                  </div>
                </div>

                {/* Spätibild Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Spätibild <span className="text-gray-500">(optional)</span></label>
                  <div 
                    onClick={() => spatiInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors h-28 ${
                      spatiImage ? 'border-spati-accent bg-gray-900' : 'border-gray-700 hover:border-gray-500 bg-gray-800'
                    }`}
                  >
                    {spatiImage ? (
                      <div className="relative w-full h-full">
                        <img src={spatiImage} alt="Späti" className="w-full h-full object-contain rounded-lg" />
                        <button
                          onClick={(e) => { e.stopPropagation(); setSpatiImage(null); }}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 mb-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                        </svg>
                        <p className="text-xs text-gray-400">Späti-Foto</p>
                      </>
                    )}
                    <input type="file" ref={spatiInputRef} onChange={handleSpatiUpload} accept="image/*" className="hidden" />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              {mode === 'text' ? 'What should the ad be about?' : 'What\'s the offer?'}
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder={mode === 'text' ? "e.g. Late night snacks, Party drinks..." : "e.g. 2 for 1, 50% off until midnight..."}
              className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-spati-accent focus:ring-1 focus:ring-spati-accent outline-none resize-none h-24"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform ${
              isGenerating 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-spati-accent text-black hover:bg-yellow-500 hover:scale-[1.02]'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : 'Create Ad'}
          </button>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Result Area */}
        {generatedResult && (
          <div className="mt-8 animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-4">Your Ad</h3>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
              <img 
                src={generatedResult.imageUrl} 
                alt="Generated Ad" 
                className="w-full h-auto block"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                <button
                  onClick={downloadImage}
                  className="w-full py-3 bg-spati-neon text-black font-bold rounded-lg hover:bg-green-400 transition-colors"
                >
                  Download Image
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
};

export default AdBuilder;