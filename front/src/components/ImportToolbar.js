import { useEffect, useRef, useState } from 'react';
import { CATEGORY_OPTIONS, DEFAULT_IMPORT_YEAR, YEAR_OPTIONS } from '../constants/importOptions';
import { uploadHistoriqueFile } from '../services/historiqueApi';

function ImportToolbar({ onSuccess }) {
  const inputRef = useRef(null);
  const [category, setCategory] = useState('');
  const [year, setYear] = useState(DEFAULT_IMPORT_YEAR);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handlePickFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const resetFileInput = () => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!file || !category) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('year', year);

    try {
      setIsUploading(true);
      setProgress(0);

      await uploadHistoriqueFile(formData, {
        onUploadProgress: (event) => {
          if (!event.total) {
            return;
          }
          setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      setToast({ type: 'success', message: 'Import termine avec succes.' });
      resetFileInput();
      onSuccess?.();
    } catch (error) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        "L'import a echoue.";
      setToast({ type: 'error', message });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/50 px-4 py-3 shadow-lg backdrop-blur-md">
      <div className="flex min-w-[160px] flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Categorie</label>
        <select
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">Choisir</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[140px] flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Annee</label>
        <select
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400"
          value={year}
          onChange={(event) => setYear(event.target.value)}
        >
          {YEAR_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[220px] flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Fichier</label>
        <input ref={inputRef} type="file" accept=".xlsx,.xls" hidden onChange={handleFileChange} />
        <button
          type="button"
          onClick={handlePickFile}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-400 hover:text-white"
        >
          {file ? file.name : 'Choisir un fichier'}
        </button>
      </div>

      <div className="flex min-w-[180px] flex-1 flex-col gap-2 self-end">
        <button
          type="button"
          onClick={handleImport}
          disabled={!file || !category || isUploading}
          className="rounded-xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isUploading ? 'Import en cours...' : 'Importer'}
        </button>
        {(isUploading || progress > 0) && (
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`min-w-[220px] rounded-xl px-4 py-2 text-sm font-medium ${
            toast.type === 'success'
              ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
              : 'border border-rose-400/30 bg-rose-500/10 text-rose-200'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default ImportToolbar;
