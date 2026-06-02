import { useState, useMemo, useRef } from 'react';
import { Search, Plus, Edit2, Camera } from 'lucide-react';
import { ProjectGrid } from './components/ProjectGrid';
import { ProjectModal } from './components/ProjectModal';
import { ProjectView } from './components/ProjectView';
import { initialProjects } from './data';
import { Project } from './types';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [artistName, setArtistName] = useState('Jeff Diss');
  const [artistImage, setArtistImage] = useState('https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=300&h=300');
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projects, searchTerm]);

  const handleSaveProject = (project: Project) => {
    if (editingProject) {
      setProjects(projects.map(p => (p.id === project.id ? project : p)));
    } else {
      setProjects([...projects, project]);
    }
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

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    setIsModalOpen(false);
    setEditingProject(null);
    if (viewingProjectId === id) {
      setViewingProjectId(null);
    }
  };

  const handleSilentUpdate = (project: Project) => {
    setProjects(projects.map(p => p.id === project.id ? project : p));
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
    <div className="min-h-screen bg-[#F7F7F5] text-stone-900 font-sans flex flex-col antialiased selection:bg-amber-200">
      {/* Header Minimalist */}
      <header className="px-6 md:px-12 pt-16 pb-8 max-w-[1400px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div 
            className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-md shrink-0 border-4 border-white relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <img 
              src={artistImage} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera className="w-8 h-8 text-white" />
            </div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setArtistImage(url);
                }
              }} 
              className="hidden" 
            />
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 mb-1">Dossiê do Artista</p>
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingName(false); }}
                  autoFocus
                  className="text-5xl md:text-6xl font-serif text-stone-900 bg-transparent border-b border-amber-500 focus:outline-none w-full"
                />
              ) : (
                <div className="flex items-center gap-3 group">
                  <h1 className="text-5xl md:text-6xl font-serif text-stone-900 heading-shadow">{artistName}</h1>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-amber-600"
                    title="Editar nome"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-stone-500 mt-2 font-medium">{projects.length} Lançamentos Gerenciados</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-6 md:mt-0">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
               type="text"
               placeholder="Buscar projetos..."
               className="bg-white border border-stone-200 rounded-full py-3 pl-11 pr-4 text-sm w-full focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-sm font-medium"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-8 py-3 bg-stone-900 hover:bg-stone-800 active:scale-95 transition-all duration-200 rounded-full text-sm font-bold text-white shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>
      </header>

      {/* Grid Content */}
      <main className="px-6 md:px-12 pb-24 pt-4 max-w-[1400px] mx-auto w-full flex-1">
        <ProjectGrid projects={filteredProjects} onEdit={handleOpenProject} />
      </main>

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

