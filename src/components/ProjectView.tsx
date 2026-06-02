import React, { useState, useRef } from 'react';
import { ArrowLeft, Play, Pause, Edit3, Plus, Music, Trash2, Upload, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { Project, Track } from '../types';
import { Badge } from './Badge';
import { uploadFile, useResolvedUrl } from '../lib/services';

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => void;
  onEditAction: () => void;
}

export function ProjectView({ project, onBack, onUpdate, onEditAction }: ProjectViewProps) {
  const tracks = [...(project.tracks || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const resolvedCoverUrl = useResolvedUrl(project.coverUrl);
  
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

  const handleMoveTrack = (index: number, direction: 'up' | 'down') => {
    const updatedTracks = [...tracks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < updatedTracks.length) {
      // Swap elements
      const temp = updatedTracks[index];
      updatedTracks[index] = updatedTracks[targetIndex];
      updatedTracks[targetIndex] = temp;
      
      // Update order property
      const orderedTracks = updatedTracks.map((t, idx) => ({
        ...t,
        order: idx + 1
      }));
      
      onUpdate({ ...project, tracks: orderedTracks });
    }
  };

  return (
    <div 
      className="flex flex-col min-h-screen text-stone-900 font-sans animate-in fade-in duration-300 relative z-50 w-full bg-stone-900 bg-cover bg-center md:bg-fixed bg-no-repeat"
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
                <img src={resolvedCoverUrl} alt="Cover" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-500 bg-black/40">
                  <Music className="w-16 h-16 opacity-30" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start w-full">
              <Badge value={project.format} type="format" />
              <h1 className="text-3xl md:text-6xl font-serif text-white mt-4 mb-2 heading-shadow px-2 drop-shadow-md">{project.name}</h1>
              {project.feats && project.feats.length > 0 && (
                <p className="text-amber-400 font-sans text-sm md:text-base font-medium mb-3 tracking-wide drop-shadow-sm lowercase">
                  feat. {project.feats.join(', ')}
                </p>
              )}
              <p className="text-stone-300 font-mono text-xs md:text-sm tracking-widest uppercase mt-1 drop-shadow-sm">{project.releaseDate || 'Lançamento a definir'}</p>
              
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
                  {tracks.map((track, index) => (
                    <TrackItem 
                      key={track.id} 
                      track={track} 
                      onUpdate={handleUpdateTrack} 
                      onDelete={handleDeleteTrack} 
                      onMoveUp={() => handleMoveTrack(index, 'up')}
                      onMoveDown={() => handleMoveTrack(index, 'down')}
                      isFirst={index === 0}
                      isLast={index === tracks.length - 1}
                    />
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Use the first track as the single's audio container, if it exists
  const track = project.tracks?.[0] || { id: 'single-track', order: 1, name: project.name };
  const resolvedAudioUrl = useResolvedUrl(track.audioUrl);

  React.useEffect(() => {
    const currentAudio = audioRef.current;
    
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (currentAudio) {
      currentAudio.load();
    }

    return () => {
      if (currentAudio) {
        try {
          currentAudio.pause();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [resolvedAudioUrl]);
  
  const [description, setDescription] = useState(project.description || '');

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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
      } catch (err: any) {
        console.error('Error uploading audio:', err);
        alert(err.message || 'Erro ao enviar áudio');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      try {
        audio.pause();
      } catch (err) {
        console.warn('Error pausing audio:', err);
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audio.play().catch((err) => {
        console.warn('Audio playback prevented or interrupted:', err);
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6 max-w-3xl mx-auto flex flex-col gap-6 w-full">
      <div className="space-y-3">
        <label className="text-sm font-bold tracking-widest text-stone-400 uppercase">
          Upload de Áudio (Single)
        </label>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 shadow-inner flex items-center justify-center shrink-0">
            <Music className="w-8 h-8 text-amber-500" />
          </div>
          
          <div className="flex-1 text-center sm:text-left min-w-0">
             {track.audioUrl ? (
               <div>
                 <p className="font-bold text-white text-lg truncate">{track.audioName || project.name}</p>
                 <p className="text-sm text-stone-400">Áudio anexado</p>
               </div>
             ) : (
               <div>
                 <p className="font-bold text-white text-lg truncate">Nenhum áudio</p>
                 <p className="text-sm text-stone-400">Faça o upload do seu single</p>
               </div>
             )}
          </div>
          
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {track.audioUrl && (
              <>
                <audio 
                  ref={audioRef} 
                  src={resolvedAudioUrl} 
                  preload="auto"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onEnded={() => setIsPlaying(false)} 
                  onError={(e) => {
                    console.error("Audio playback error:", e);
                    setIsPlaying(false);
                  }}
                  className="hidden" 
                />
                <button 
                  onClick={togglePlay}
                  disabled={!resolvedAudioUrl}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 shadow-md disabled:opacity-50 disabled:pointer-events-none"
                  title={isPlaying ? "Pausar" : "Tocar"}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>
              </>
            )}
            <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
               className="h-12 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
             >
               {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <Upload className="w-4 h-4 text-amber-500" />}
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

        {track.audioUrl && (
          <div className="w-full mt-2 pt-2 border-t border-white/5 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-stone-400 w-10 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                  if (audioRef.current) {
                    audioRef.current.currentTime = val;
                  }
                }}
                className="flex-1 h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 focus:outline-none py-1"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(currentTime / (duration || 1)) * 100}%, #44403c ${(currentTime / (duration || 1)) * 100}%, #44403c 100%)`
                }}
              />
              <span className="text-xs font-mono text-stone-400 w-10">{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
      
      <div className="space-y-3">
        <label className="text-sm font-bold tracking-widest text-stone-400 uppercase flex items-center justify-between">
          <span>Descrição da Música</span>
          <span className="text-xs font-normal text-stone-500">Pressione enter ou desfoque para salvar</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          onBlur={handleDescBlur}
          placeholder="Escreva sobre a inspiração, conceito e detalhes do single..."
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[200px] text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-y"
        />
      </div>
    </div>
  );
};

const TrackItem: React.FC<{ 
  track: Track; 
  onUpdate: (t: Track) => void; 
  onDelete: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}> = ({ track, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resolvedAudioUrl = useResolvedUrl(track.audioUrl);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  React.useEffect(() => {
    const currentAudio = audioRef.current;
    
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (currentAudio) {
      currentAudio.load();
    }

    return () => {
      if (currentAudio) {
        try {
          currentAudio.pause();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [resolvedAudioUrl]);
  
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
      } catch (err: any) {
        console.error('Error uploading audio:', err);
        alert(err.message || 'Erro ao enviar áudio');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      try {
        audio.pause();
      } catch (err) {
        console.warn('Error pausing audio:', err);
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audio.play().catch((err) => {
        console.warn('Audio playback prevented or interrupted:', err);
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="group flex flex-col p-4 bg-black/40 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/10 shadow-lg hover:border-amber-500/30 hover:bg-black/55 transition-all duration-300 w-full">
      <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
        <div className="flex items-center gap-3 md:gap-4 flex-1 w-full">
          <div className="flex flex-col items-center gap-1 shrink-0 select-none">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-300 font-mono text-xs md:text-sm font-semibold shadow-inner transition-colors group-hover:bg-amber-500/10 group-hover:border-amber-500/30 group-hover:text-amber-400">
              {String(track.order).padStart(2, '0')}
            </div>
            <div className="flex items-center gap-0.5 mt-0.5 transition-all md:opacity-0 md:group-hover:opacity-100">
              <button
                onClick={onMoveUp}
                disabled={isFirst}
                className="p-1 rounded text-stone-400 hover:text-amber-400 hover:bg-white/5 transition-all disabled:opacity-20 active:scale-90"
                title="Mover Faixa para Cima"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={isLast}
                className="p-1 rounded text-stone-400 hover:text-amber-400 hover:bg-white/5 transition-all disabled:opacity-20 active:scale-90"
                title="Mover Faixa para Baixo"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 min-w-0 pr-2">
            <input 
              type="text" 
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="bg-transparent text-white font-bold text-lg focus:outline-none focus:border-b-2 focus:border-amber-500 w-full truncate placeholder:text-stone-500"
              placeholder="Nome da faixa"
            />
            {track.audioName && (
               <p className="text-xs text-stone-400 mt-1 truncate max-w-sm flex items-center gap-1 font-mono" title={track.audioName}>
                 <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                 Áudio: {track.audioName}
               </p>
            )}
          </div>
        </div>
  
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 md:gap-3 pl-9 md:pl-0 mt-3 md:mt-0 pt-3 md:pt-0 border-t border-white/5 md:border-transparent">
          <div className="flex items-center gap-2">
            {track.audioUrl ? (
              <>
                <audio 
                  ref={audioRef} 
                  src={resolvedAudioUrl} 
                  preload="auto"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)} 
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onError={(e) => {
                    console.error("Audio playback error:", e);
                    setIsPlaying(false);
                  }}
                  className="hidden" 
                />
                <button 
                  onClick={togglePlay}
                  disabled={!resolvedAudioUrl}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 shadow-md disabled:opacity-50 disabled:pointer-events-none"
                  title={isPlaying ? "Pausar" : "Tocar"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white border border-white/10 transition-colors disabled:opacity-50"
                  title="Trocar áudio"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </button>
              </>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white hover:text-amber-400 border border-white/10 rounded-full font-bold text-[11px] md:text-xs flex items-center gap-2 transition-colors disabled:opacity-50 h-10 md:h-auto"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <Upload className="w-4 h-4 text-amber-500" />}
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
            className="w-10 h-10 flex items-center justify-center text-stone-450 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors md:opacity-0 group-hover:opacity-100 shadow-none md:shadow-none bg-transparent border border-transparent"
            title="Excluir faixa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {track.audioUrl && (
        <div className="w-full mt-3 pt-3 border-t border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-stone-400 w-10 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                if (audioRef.current) {
                  audioRef.current.currentTime = val;
                }
              }}
              className="flex-1 h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 focus:outline-none"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(currentTime / (duration || 1)) * 100}%, #44403c ${(currentTime / (duration || 1)) * 100}%, #44403c 100%)`
              }}
            />
            <span className="text-xs font-mono text-stone-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
