import React, { useState, useRef } from 'react';
import { ArrowLeft, Play, Pause, Edit3, Plus, Music, Trash2, Upload } from 'lucide-react';
import { Project, Track } from '../types';
import { Badge } from './Badge';

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
    <div className="flex flex-col bg-[#F7F7F5] min-h-screen text-stone-900 font-sans animate-in fade-in duration-300 relative z-10 w-full absolute inset-0">
      {/* Header / Hero */}
      <div className="px-6 md:px-12 pt-16 pb-8 max-w-[1400px] mx-auto w-full">
        <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-lg shrink-0 bg-stone-200 border-4 border-white">
            {project.coverUrl ? (
              <img src={project.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                <Music className="w-16 h-16 opacity-30" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start w-full">
            <Badge value={project.format} type="format" />
            <h1 className="text-4xl md:text-6xl font-serif text-stone-900 mt-4 mb-2 heading-shadow">{project.name}</h1>
            <p className="text-stone-500 font-medium text-lg">{project.releaseDate || 'Lançamento a definir'}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
              <button onClick={onEditAction} className="flex items-center gap-2 px-6 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-full font-bold text-sm transition-colors">
                <Edit3 className="w-4 h-4" /> Editar Projeto
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Divider */}
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="h-px bg-stone-200 w-full mb-12"></div>
      </div>

      {/* Tracks Section */}
      <div className="px-6 md:px-12 pb-24 max-w-[1400px] mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif text-stone-800">Faixas</h2>
          <button onClick={handleAddTrack} className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-full font-bold text-sm shadow-md transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Adicionar Faixa
          </button>
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 border-dashed">
            <Music className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 font-medium">Nenhuma faixa adicionada ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tracks.map(track => (
              <TrackItem key={track.id} track={track} onUpdate={handleUpdateTrack} onDelete={handleDeleteTrack} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TrackItem({ track, onUpdate, onDelete }: { track: Track; onUpdate: (t: Track) => void; onDelete: (id: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate({ ...track, audioUrl: url, audioName: file.name });
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
    <div className="group flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4 flex-1">
        <span className="w-8 text-center text-stone-400 font-bold font-mono text-sm">{String(track.order).padStart(2, '0')}</span>
        
        <div className="flex-1 min-w-0">
          <input 
            type="text" 
            value={track.name}
            onChange={e => onUpdate({ ...track, name: e.target.value })}
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

      <div className="flex items-center justify-between md:justify-end gap-3 pl-12 md:pl-0 mt-2 md:mt-0">
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
                className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                title="Trocar áudio"
              >
                <Upload className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" /> Anexar Áudio
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
