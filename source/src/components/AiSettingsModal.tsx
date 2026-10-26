import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { DEFAULT_MODEL } from '../utils/gemini-client';

interface Props {
  isOpen: boolean;
  initialKey: string;
  initialModel: string;
  onClose: () => void;
  onSave: (apiKey: string, model: string) => void;
}

export const AiSettingsModal: React.FC<Props> = ({
  isOpen,
  initialKey,
  initialModel,
  onClose,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(initialKey);
  const [model, setModel] = useState(initialModel);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(apiKey.trim(), model.trim() || DEFAULT_MODEL);
          onClose();
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-sky-300">
            <Sparkles size={16} /> AI Settings (Gemini)
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <label className="block text-xs text-slate-300">
          Gemini API Key
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </label>
        <label className="block text-xs text-slate-300">
          Model
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </label>
        <p className="text-[11px] leading-5 text-slate-400">
          کلید فقط در همین مرورگر (localStorage) ذخیره می‌شود و به هیچ سروری جز Google
          فرستاده نمی‌شود. کلید خالی = موتور داخلی بدون AI. کلید رایگان:
          aistudio.google.com/apikey
        </p>
        <button
          type="submit"
          className="w-full rounded bg-sky-600 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          Save
        </button>
      </form>
    </div>
  );
};
