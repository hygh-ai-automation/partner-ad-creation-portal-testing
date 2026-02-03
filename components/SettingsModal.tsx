import React, { useState } from 'react';
import { AdSettings, SavedPrompt } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdSettings;
  onSave: (newSettings: AdSettings) => void;
}

const MAX_SAVED_PROMPTS = 5;

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localBasePrompt, setLocalBasePrompt] = useState(settings.basePrompt);
  const [localSavedPrompts, setLocalSavedPrompts] = useState<SavedPrompt[]>(settings.savedPrompts);
  const [activePromptId, setActivePromptId] = useState<string | null>(settings.activePromptId);
  const [newPromptName, setNewPromptName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setLocalBasePrompt(settings.basePrompt);
      setLocalSavedPrompts(settings.savedPrompts);
      setActivePromptId(settings.activePromptId);
      setNewPromptName('');
      setShowSaveInput(false);
    }
  }, [isOpen, settings]);

  const handleSelectPrompt = (prompt: SavedPrompt) => {
    setLocalBasePrompt(prompt.prompt);
    setActivePromptId(prompt.id);
  };

  const handleSaveNewPrompt = () => {
    if (!newPromptName.trim() || !localBasePrompt.trim()) return;
    if (localSavedPrompts.length >= MAX_SAVED_PROMPTS) return;

    const newPrompt: SavedPrompt = {
      id: Date.now().toString(),
      name: newPromptName.trim(),
      prompt: localBasePrompt
    };

    setLocalSavedPrompts([...localSavedPrompts, newPrompt]);
    setActivePromptId(newPrompt.id);
    setNewPromptName('');
    setShowSaveInput(false);
  };

  const handleDeletePrompt = (id: string) => {
    setLocalSavedPrompts(localSavedPrompts.filter(p => p.id !== id));
    if (activePromptId === id) {
      setActivePromptId(null);
    }
  };

  const handleSaveAll = () => {
    onSave({
      ...settings,
      basePrompt: localBasePrompt,
      savedPrompts: localSavedPrompts,
      activePromptId
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
      <div className="bg-spati-card w-full max-w-lg rounded-xl border border-gray-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Admin Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Saved Prompts List */}
          {localSavedPrompts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Saved Prompts ({localSavedPrompts.length}/{MAX_SAVED_PROMPTS})
              </label>
              <div className="space-y-2">
                {localSavedPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      activePromptId === prompt.id
                        ? 'border-spati-accent bg-spati-accent/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                    }`}
                    onClick={() => handleSelectPrompt(prompt)}
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-medium text-white truncate">{prompt.name}</p>
                      <p className="text-xs text-gray-400 truncate">{prompt.prompt.slice(0, 60)}...</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePrompt(prompt.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Prompt Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Base Prompt (Hidden Context)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              This prompt is prepended to every user request to ensure consistent style.
            </p>
            <textarea
              value={localBasePrompt}
              onChange={(e) => {
                setLocalBasePrompt(e.target.value);
                setActivePromptId(null);
              }}
              className="w-full h-32 bg-black text-white p-3 rounded-lg border border-gray-700 focus:border-spati-accent focus:ring-1 focus:ring-spati-accent outline-none resize-none"
            />
          </div>

          {/* Save as New Prompt */}
          {localSavedPrompts.length < MAX_SAVED_PROMPTS && (
            <div>
              {showSaveInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPromptName}
                    onChange={(e) => setNewPromptName(e.target.value)}
                    placeholder="Prompt name..."
                    className="flex-1 bg-black text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-spati-accent focus:ring-1 focus:ring-spati-accent outline-none text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveNewPrompt();
                      if (e.key === 'Escape') setShowSaveInput(false);
                    }}
                  />
                  <button
                    onClick={handleSaveNewPrompt}
                    disabled={!newPromptName.trim()}
                    className="px-3 py-2 rounded-lg bg-spati-accent text-black font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSaveInput(false)}
                    className="px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveInput(true)}
                  className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-300 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Save current prompt ({localSavedPrompts.length}/{MAX_SAVED_PROMPTS})
                </button>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-lg bg-spati-accent text-black font-semibold hover:bg-yellow-500 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
