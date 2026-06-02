import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { Format, Status, DistributorStatus, Project } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  onDelete?: (id: string) => void;
  initialData?: Project | null;
}

export function ProjectModal({ isOpen, onClose, onSave, onDelete, initialData }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [format, setFormat] = useState<Format>('SINGLE');
  const [artDone, setArtDone] = useState<Status>('NÃO');
  const [musicDone, setMusicDone] = useState<Status>('NÃO');
  const [distributorStatus, setDistributorStatus] = useState<DistributorStatus>('INCOMPLETA');
  const [coverUrl, setCoverUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setReleaseDate(initialData.releaseDate);
        setFormat(initialData.format);
        setArtDone(initialData.artDone);
        setMusicDone(initialData.musicDone);
        setDistributorStatus(initialData.distributorStatus);
        setCoverUrl(initialData.coverUrl || '');
      } else {
        setName('');
        setReleaseDate('');
        setFormat('SINGLE');
        setArtDone('NÃO');
        setMusicDone('NÃO');
        setDistributorStatus('INCOMPLETA');
        setCoverUrl('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData ? initialData.id : crypto.randomUUID(),
      name,
      releaseDate,
      format,
      artDone,
      musicDone,
      distributorStatus,
      // Default placeholder if none provided
      coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&q=80&w=150&h=150'
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-2xl font-serif text-stone-800">
            {initialData ? 'Editar' : 'Novo'} Projeto
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 p-2 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Nome do Projeto *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium pt-[14px]"
              placeholder="Ex: O Canto da Cidade"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Data de Lançamento</label>
              <input
                type="text"
                value={releaseDate}
                onChange={e => setReleaseDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pt-[14px]"
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Formato</label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value as Format)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none font-medium"
              >
                <option value="SINGLE">SINGLE</option>
                <option value="MIXTAPE">MIXTAPE</option>
                <option value="EP">EP</option>
                <option value="ALBUM">ALBUM</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Arte Finalizada?</label>
              <select
                value={artDone}
                onChange={e => setArtDone(e.target.value as Status)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none font-medium"
              >
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Música Finalizada?</label>
              <select
                value={musicDone}
                onChange={e => setMusicDone(e.target.value as Status)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none font-medium"
              >
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Status da Distribuidora</label>
            <select
              value={distributorStatus}
              onChange={e => setDistributorStatus(e.target.value as DistributorStatus)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none font-medium"
            >
              <option value="AO VIVO">AO VIVO</option>
              <option value="ENTREGUE">ENTREGUE</option>
              <option value="INCOMPLETA">INCOMPLETA</option>
              <option value="EM ANALIZE">EM ANÁLISE</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-2 flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Capa (Opcional)
            </label>
            <div className="flex items-center gap-4">
              {coverUrl && (
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200 shadow-sm">
                  <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 border-dashed rounded-xl px-4 py-3 text-stone-600 transition-colors font-medium text-sm"
                >
                  <Upload className="w-4 h-4" />
                  {coverUrl ? 'Alterar Imagem...' : 'Importar do dispositivo...'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-between gap-3 border-t border-stone-100 items-center">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(initialData.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 active:scale-95 transition-all shadow-md"
              >
                Salvar Projeto
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
