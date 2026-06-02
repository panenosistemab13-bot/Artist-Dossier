import React, { useState, useRef } from 'react';
import { ArrowLeft, Play, Pause, Edit3, Plus, Music, Trash2, Upload, Loader2 } from 'lucide-react';
import { Project, Track } from '../types';
import { Badge } from './Badge';
import { uploadFile } from '../lib/services';

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => void;
  onEditAction: () => void;
}

export function ProjectView({ project, onBack, onUpdate, onEditAction }: ProjectViewProps) {
  const tracks = project.tracks || [];
  
  const handleAddTrack = () => {
    const newTrack: Track = {
      id: crypto.randomUUID(),
      order: tracks.length + 1,
      name: `Faixa ${tracks.length + 1}`
    };
    onUpdate({ ...project, tracks: [...tracks, newTrack] });
  };

  const handleUpdateTrack = (updated: Track) => {
    onUpdate({
      ...project,
      tracks: tracks.map(t => t.id === updated.id ? updated : t)
    });
  };

  const handleDeleteTrack = (id: string) => {
    onUpdate({
      ...project,
      tracks: tracks.filter(t => t.id !== id).map((t, index) => ({ ...t, order: index + 1 }))
    });
  };

  return (
    <div 
      className="flex flex-col min-h-screen text-stone-900 font-sans animate-in fade-in duration-300 relative z-50 w-full absolute inset-0 bg-stone-900 bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ backgroundImage: 'url(https://i.postimg.cc/8PqwhRbh/SCSCS.avif)' }}
    >
      <div className="absolute inset-0 bg-black/60 md:bg-gradient-to-t md:from-black/90 md:from-10% md:to-black/40"></div>
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header / Hero */}
        <div className="px-4 md:px-12 pt-8 md:pt-16 pb-8 max-w-[1400px] mx-auto w-full">
          <button onClick={onBack} className="flex items-center gap-2 text-stone-300 hover:text-white mb-6 md:mb-8 transition-colors font-bold uppercase tracking-wider text-xs">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-2xl shrink-0 bg-stone-900 border-4 border-white/20">
              {project.coverUrl ? (
                <img src={project.coverUrl} alt="Cover" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-500 bg-black/40">
                  <Music className="w-16 h-16 opacity-30" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start w-full">
              <Badge value={project.format} type="format" />
              <h1 className="text-3xl md:text-6xl font-serif text-white mt-4 mb-2 heading-shadow px-2 drop-shadow-md">{project.name}</h1>
              <p className="text-stone-300 font-medium text-base md:text-lg drop-shadow-sm">{project.releaseDate || 'Lançamento a definir'}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                <button onClick={onEditAction} className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full font-bold text-sm transition-colors shadow-sm">
                  <Edit3 className="w-4 h-4" /> Editar Projeto
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="h-px bg-white/10 w-full mb-12"></div>
        </div>

        {/* Tracks/Single Section */}
        <div className="px-4 md:px-12 pb-24 max-w-[1400px] mx-auto w-full flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-serif text-white text-center sm:text-left drop-shadow-sm">
              {project.format === 'SINGLE' ? 'Detalhes do Single / Áudio' : 'Faixas'}
            </h2>
            {project.format !== 'SINGLE' && (
              <button onClick={handleAddTrack} className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-white text-stone-900 hover:bg-stone-100 rounded-full font-bold text-sm shadow-md transition-all active:scale-95 w-full sm:w-auto">
                <Plus className="w-4 h-4" /> Adicionar Faixa
              </button>
            )}
          </div>

          {project.format === 'SINGLE' ? (
            <SingleEditor project={project} onUpdate={onUpdate} />
          ) : (
            <>
              {tracks.length === 0 ? (
                <div className="text-center py-16 bg-black/40 backdrop-blur-md rounded-3xl border border-white/20 border-dashed">
                  <Music className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                  <p className="text-stone-300 font-medium">Nenhuma faixa adicionada ainda.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {tracks.map(track => (
                    <TrackItem key={track.id} track={track} onUpdate={handleUpdateTrack} onDelete={handleDeleteTrack} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const SingleEditor: React.FC<{ project: Project; onUpdate: (p: Project) => void }> = ({ project, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use the first track as the single's audio container, if it exists
  const track = project.tracks?.[0] || { id: 'single-track', order: 1, name: project.name };
  
  const [description, setDescription] = useState(project.description || '');

  const handleDescBlur = () => {
    if (description !== project.description) {
      onUpdate({ ...project, description });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadFile(file, `audio/${project.id}-${file.name}`);
        const updatedTrack = { ...track, audioUrl: url, audioName: file.name };
        
        onUpdate({ 
          ...project, 
          tracks: project.tracks && project.tracks.length > 0 
            ? [updatedTrack, ...project.tracks.slice(1)] 
            : [updatedTrack] 
        });
      } catch (err) {
        console.error('Error uploading audio:', err);
        alert('Erro ao enviar áudio');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 max-w-3xl mx-auto flex flex-col gap-6 w-full">
      <div className="space-y-3">
        <label className="text-sm font-bold tracking-widest text-stone-500 uppercase">
          Upload de Áudio (Single)
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
          <div className="w-16 h-16 rounded-full bg-stone-200 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
            <Music className="w-8 h-8 text-stone-400" />
          </div>
          
          <div className="flex-1 text-center sm:text-left min-w-0">
             {track.audioUrl ? (
               <div>
                 <p className="font-bold text-stone-800 text-lg truncate">{track.audioName || project.name}</p>
                 <p className="text-sm text-stone-500">Áudio anexado</p>
               </div>
             ) : (
               <div>
                 <p className="font-bold text-stone-800 text-lg truncate">Nenhum áudio</p>
                 <p className="text-sm text-stone-500">Faça o upload do seu single</p>
               </div>
             )}
          </div>
          
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {track.audioUrl && (
              <>
                <audio 
                  ref={audioRef} 
                  src={track.audioUrl} 
                  onEnded={() => setIsPlaying(false)} 
                  className="hidden" 
                />
                <button 
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-sm"
                  title={isPlaying ? "Pausar" : "Tocar"}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>
              </>
            )}
            <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
               className="h-12 px-6 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
             >
               {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
               <span className="hidden sm:inline">{track.audioUrl ? 'Trocar' : 'Upload'}</span>
             </button>
             <input 
                type="file" 
                accept="audio/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <label className="text-sm font-bold tracking-widest text-stone-500 uppercase flex items-center justify-between">
          <span>Descrição da Música</span>
          <span className="text-xs font-normal text-stone-400">Pressione enter ou desfoque para salvar</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          onBlur={handleDescBlur}
          placeholder="Escreva sobre a inspiração, conceito e detalhes do single..."
          className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 min-h-[200px] text-stone-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-y"
        />
      </div>
    </div>
  );
};

const TrackItem: React.FC<{ track: Track; onUpdate: (t: Track) => void; onDelete: (id: string) => void }> = ({ track, onUpdate, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [localName, setLocalName] = useState(track.name);

  // Sync local state if track.name updates from server/outside
  React.useEffect(() => {
    setLocalName(track.name);
  }, [track.name]);

  const handleNameBlur = () => {
    if (localName !== track.name) {
      onUpdate({ ...track, name: localName });
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Triggers handleNameBlur
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadFile(file, `audio/${crypto.randomUUID()}-${file.name}`);
        onUpdate({ ...track, audioUrl: url, audioName: file.name });
      } catch (err) {
        console.error('Error uploading audio:', err);
        alert('Erro ao enviar áudio');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="group flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white rounded-xl md:rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 md:gap-4 flex-1 w-full">
        <span className="w-6 md:w-8 text-center text-stone-400 font-bold font-mono text-xs md:text-sm shrink-0">{String(track.order).padStart(2, '0')}</span>
        
        <div className="flex-1 min-w-0 pr-2">
          <input 
            type="text" 
            value={localName}
            onChange={e => setLocalName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="bg-transparent text-stone-800 font-bold text-lg focus:outline-none focus:border-b-2 focus:border-amber-500 w-full truncate"
            placeholder="Nome da faixa"
          />
          {track.audioName && (
             <p className="text-xs text-stone-500 mt-1 truncate max-w-sm" title={track.audioName}>
               Áudio: {track.audioName}
             </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 md:gap-3 pl-9 md:pl-0 mt-3 md:mt-0 pt-3 md:pt-0 border-t border-stone-100 md:border-transparent">
        <div className="flex items-center gap-2">
          {track.audioUrl ? (
            <>
              <audio 
                ref={audioRef} 
                src={track.audioUrl} 
                onEnded={() => setIsPlaying(false)} 
                className="hidden" 
              />
              <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-sm"
                title={isPlaying ? "Pausar" : "Tocar"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-50"
                title="Trocar áudio"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full font-semibold text-[11px] md:text-xs flex items-center gap-2 transition-colors disabled:opacity-50 h-10 md:h-auto"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? 'Enviando...' : 'Anexar Áudio'}
            </button>
          )}
        </div>
        
        <input 
          type="file" 
          accept="audio/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        <button 
          onClick={() => onDelete(track.id)}
          className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors md:opacity-0 group-hover:opacity-100 shadow-sm md:shadow-none bg-white border border-stone-200 md:border-transparent md:bg-transparent"
          title="Excluir faixa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
