import React from 'react';
import { AdSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdSettings;
  onSave: (newSettings: AdSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localBasePrompt, setLocalBasePrompt] = React.useState(settings.basePrompt);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
      <div className="bg-spati-card w-full max-w-lg rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Admin Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Base Prompt (Hidden Context)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              This prompt is prepended to every user request to ensure consistent style (e.g. 9:16 ratio style, lighting, etc).
            </p>
            <textarea
              value={localBasePrompt}
              onChange={(e) => setLocalBasePrompt(e.target.value)}
              className="w-full h-32 bg-black text-white p-3 rounded-lg border border-gray-700 focus:border-spati-accent focus:ring-1 focus:ring-spati-accent outline-none resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave({ ...settings, basePrompt: localBasePrompt });
              onClose();
            }}
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