import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Trash2, Upload, Loader2 } from 'lucide-react';
import { Format, Status, DistributorStatus, Project } from '../types';
import { uploadFile, useResolvedUrl } from '../lib/services';

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
  const [feats, setFeats] = useState<string[]>([]);
  const [newFeatInput, setNewFeatInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resolvedCoverUrl = useResolvedUrl(coverUrl);

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
        setFeats(initialData.feats || []);
        setNewFeatInput('');
      } else {
        setName('');
        setReleaseDate('');
        setFormat('SINGLE');
        setArtDone('NÃO');
        setMusicDone('NÃO');
        setDistributorStatus('INCOMPLETA');
        setCoverUrl('');
        setFeats([]);
        setNewFeatInput('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isUploading) return;

    // Auto-add any text left under collaborator input to feats if not already added
    let finalFeats = [...feats];
    const trimmedInput = newFeatInput.trim();
    if (trimmedInput && !finalFeats.includes(trimmedInput)) {
      finalFeats.push(trimmedInput);
    }

    onSave({
      id: initialData ? initialData.id : crypto.randomUUID(),
      name,
      releaseDate,
      format,
      artDone,
      musicDone,
      distributorStatus,
      // Default placeholder if none provided
      coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&q=80&w=150&h=150',
      tracks: initialData?.tracks || [],
      feats: finalFeats
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadFile(file, `projects/${crypto.randomUUID()}-${file.name}`);
        setCoverUrl(url);
      } catch (err: any) {
        console.error('Error uploading file:', err);
        alert(err.message || 'Erro ao fazer upload da imagem.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-stone-100 shrink-0">
          <h2 className="text-lg font-serif text-stone-800">
            {initialData ? 'Editar' : 'Novo'} Projeto
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Nome do Projeto *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-medium pt-[10px]"
              placeholder="Ex: O Canto da Cidade"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Data de Lançamento</label>
              <input
                type="text"
                value={releaseDate}
                onChange={e => setReleaseDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all pt-[10px]"
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Formato</label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value as Format)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all appearance-none font-medium"
              >
                <option value="SINGLE">SINGLE</option>
                <option value="MIXTAPE">MIXTAPE</option>
                <option value="EP">EP</option>
                <option value="ALBUM">ALBUM</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Arte Finalizada?</label>
              <select
                value={artDone}
                onChange={e => setArtDone(e.target.value as Status)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all appearance-none font-medium"
              >
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Música Finalizada?</label>
              <select
                value={musicDone}
                onChange={e => setMusicDone(e.target.value as Status)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all appearance-none font-medium"
              >
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Status da Distribuidora</label>
            <select
              value={distributorStatus}
              onChange={e => setDistributorStatus(e.target.value as DistributorStatus)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all appearance-none font-medium"
            >
              <option value="AO VIVO">AO VIVO</option>
              <option value="ENTREGUE">ENTREGUE</option>
              <option value="INCOMPLETA">INCOMPLETA</option>
              <option value="EM ANALIZE">EM ANÁLISE</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold flex items-center gap-1">
              Colaboradores (Feat)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeatInput}
                onChange={e => setNewFeatInput(e.target.value)}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-medium placeholder:text-stone-400"
                placeholder="Nome do colaborador (ex: Chris Brown)"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const trimmed = newFeatInput.trim();
                    if (trimmed && !feats.includes(trimmed)) {
                      setFeats([...feats, trimmed]);
                      setNewFeatInput('');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const trimmed = newFeatInput.trim();
                  if (trimmed && !feats.includes(trimmed)) {
                    setFeats([...feats, trimmed]);
                    setNewFeatInput('');
                  }
                }}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-bold rounded-lg transition-all text-[10px] uppercase tracking-wider"
              >
                + Feat
              </button>
            </div>
            {feats.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 p-1.5 bg-stone-50 border border-stone-100 rounded-lg min-h-[32px]">
                {feats.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-800 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                  >
                    Feat. {feat}
                    <button
                      type="button"
                      onClick={() => setFeats(feats.filter((_, i) => i !== idx))}
                      className="text-amber-600 hover:text-amber-800 font-bold transition-colors w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-amber-500/20 shrink-0"
                      title={`Remover Feat ${feat}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Capa (Opcional)
            </label>
            <div className="flex items-center gap-3">
              {coverUrl && (
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200 shadow-sm">
                  <img src={resolvedCoverUrl} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
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
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 border-dashed rounded-lg px-3 py-2 text-stone-600 transition-colors font-medium text-xs disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {isUploading ? 'Enviando...' : coverUrl ? 'Alterar Imagem...' : 'Importar do dispositivo...'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-between gap-3 border-t border-stone-100 items-center shrink-0">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(initialData.id)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-bold text-red-600 hover:bg-red-50 transition-colors bg-red-50 sm:bg-transparent"
                disabled={isUploading}
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </button>
            ) : (
              <div className="hidden sm:block" />
            )}
            <div className="flex gap-2 w-full sm:w-auto mt-1 sm:mt-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="flex-1 sm:flex-none px-4 py-2 rounded-full text-[10px] font-bold text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 sm:flex-none px-4 py-2 rounded-full text-[10px] font-bold bg-stone-900 text-white hover:bg-stone-800 active:scale-95 transition-all shadow-md disabled:opacity-50"
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
