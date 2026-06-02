import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, Edit2, Camera, Loader2, ArrowLeft } from 'lucide-react';
import { ProjectGrid } from './ProjectGrid';
import { ProjectModal } from './ProjectModal';
import { ProjectView } from './ProjectView';
import { Project, Artist } from '../types';
import { subscribeToProjects, saveProject, deleteProject, saveArtist, uploadFile } from '../lib/services';

interface ArtistDossierProps {
  artist: Artist;
  onBack: () => void;
}

export function ArtistDossier({ artist, onBack }: ArtistDossierProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODAS');
  
  const [artistName, setArtistName] = useState(artist.name);
  const [artistImage, setArtistImage] = useState(artist.image);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset state only when the active artist id actually changes
    setViewingProjectId(null);
    setSearchTerm('');
    setSelectedStatus('TODAS');
    
    const unsubProjects = subscribeToProjects(artist.id, (data) => setProjects(data));
    return () => {
      unsubProjects();
    };
  }, [artist.id]);

  useEffect(() => {
    setArtistName(artist.name);
  }, [artist.name]);

  useEffect(() => {
    setArtistImage(artist.image);
  }, [artist.image]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'TODAS' || p.distributorStatus === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, selectedStatus]);

  const handleSaveProject = async (project: Project) => {
    await saveProject(artist.id, project);
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleOpenProject = (project: Project) => {
    setViewingProjectId(project.id);
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(artist.id, id);
    setIsModalOpen(false);
    setEditingProject(null);
    if (viewingProjectId === id) {
      setViewingProjectId(null);
    }
  };

  const handleSilentUpdate = async (project: Project) => {
    await saveProject(artist.id, project);
  };

  const handleArtistNameChange = async (newName: string) => {
    setArtistName(newName);
    await saveArtist({ ...artist, name: newName, image: artistImage });
  };

  const activeProject = projects.find(p => p.id === viewingProjectId);

  if (activeProject) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col antialiased selection:bg-amber-200">
        <ProjectView 
          project={activeProject} 
          onBack={() => setViewingProjectId(null)} 
          onUpdate={handleSilentUpdate} 
          onEditAction={() => handleEditProject(activeProject)} 
        />
        <ProjectModal
           isOpen={isModalOpen}
           onClose={() => {
             setIsModalOpen(false);
             setEditingProject(null);
           }}
           onSave={handleSaveProject}
           onDelete={handleDeleteProject}
           initialData={editingProject}
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-stone-900 font-sans flex flex-col antialiased selection:bg-amber-200 relative bg-stone-900 bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ backgroundImage: 'url(https://i.postimg.cc/MKhty7YT/decouvrir-vivre-investir-brooklyn-quartier-branche-new-york-city.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/60 md:bg-gradient-to-t md:from-black/90 md:from-10% md:to-black/40"></div>
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Dynamic Top Bar */}
        <div className="w-full bg-black/20 border-b border-white/10 backdrop-blur-md sticky top-0 z-30 px-6 py-3 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Todos os Artistas
          </button>
        </div>

        {/* Header Minimalist */}
        <header className="px-4 md:px-12 pt-8 md:pt-12 pb-8 max-w-[1400px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/10">
          <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 w-full">
            <div 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-2xl shrink-0 border-4 border-white/20 relative group cursor-pointer bg-stone-900"
              onClick={() => { if (!isUploading) fileInputRef.current?.click(); }}
            >
              <img 
                src={artistImage} 
                alt="Avatar" 
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover ${isUploading ? 'opacity-50' : ''}`}
              />
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                 {isUploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIsUploading(true);
                    try {
                      const url = await uploadFile(file, `artist/${artist.id}-${file.name}`);
                      setArtistImage(url);
                      await saveArtist({ ...artist, name: artistName, image: url });
                    } catch (e) {
                      console.error('Error uploading image:', e);
                      alert('Erro ao enviar imagem');
                    } finally {
                      setIsUploading(false);
                    }
                  }
                }} 
                className="hidden" 
              />
            </div>
            <div className="flex flex-col items-center md:items-start w-full">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-500 drop-shadow-sm mb-1">Dossiê do Artista</p>
              <div className="flex items-center justify-center md:justify-start gap-3 w-full">
                {isEditingName ? (
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    onBlur={() => {
                      setIsEditingName(false);
                      handleArtistNameChange(artistName);
                    }}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter') {
                        setIsEditingName(false);
                        handleArtistNameChange(artistName);
                      }
                    }}
                    autoFocus
                    className="text-4xl md:text-6xl font-serif text-white bg-transparent border-b border-amber-500 focus:outline-none w-full text-center md:text-left drop-shadow-md"
                  />
                ) : (
                  <div className="flex items-center justify-center md:justify-start gap-3 group w-full">
                    <h1 className="text-4xl md:text-6xl font-serif text-white heading-shadow text-center md:text-left px-2 drop-shadow-md tracking-tight">{artistName}</h1>
                    <button 
                      onClick={() => setIsEditingName(true)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-amber-400"
                      title="Editar nome"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-stone-300 mt-2 font-medium drop-shadow-sm">{projects.length} Lançamentos Gerenciados</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-6 md:mt-0">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
              <input
                 type="text"
                 placeholder="Buscar projetos..."
                 className="bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder:text-stone-400 rounded-full py-3 pl-11 pr-4 text-sm w-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-sm font-medium"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-stone-100 active:scale-95 transition-all duration-200 rounded-full text-sm font-bold text-stone-900 shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Novo
            </button>
          </div>
        </header>

        {/* Grid Content */}
        <main className="px-6 md:px-12 pb-16 pt-6 max-w-[1400px] mx-auto w-full flex-1 flex flex-col gap-8">
          {/* Status Filter Tabs */}
          <div className="flex items-center justify-start overflow-x-auto pb-2 scrollbar-none w-full border-b border-white/10">
            <div className="flex gap-2 p-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shrink-0 w-auto">
              {[
                { value: 'TODAS', label: 'Todas' },
                { value: 'AO VIVO', label: 'Ao Vivo' },
                { value: 'ENTREGUE', label: 'Entregue' },
                { value: 'INCOMPLETA', label: 'Incompleta' },
                { value: 'EM ANALIZE', label: 'Em Análise' }
              ].map((tab) => {
                const isActive = selectedStatus === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedStatus(tab.value)}
                    className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-wider uppercase transition-all duration-300 whitespace-nowrap ${
                      isActive 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black shadow-lg shadow-amber-500/20 scale-[1.03]' 
                        : 'text-stone-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <ProjectGrid projects={filteredProjects} onEdit={handleOpenProject} />
        </main>

        {/* Footer */}
        <footer className="mt-auto pt-8 pb-6 text-center text-xs text-stone-400 font-medium tracking-widest uppercase md:px-12 max-w-[1400px] mx-auto w-full border-t border-white/5">
          Criado por Jefferson Augusto
        </footer>
      </div>

      <ProjectModal
         isOpen={isModalOpen}
         onClose={() => {
           setIsModalOpen(false);
           setEditingProject(null);
         }}
         onSave={handleSaveProject}
         onDelete={handleDeleteProject}
         initialData={editingProject}
      />
    </div>
  );
}
