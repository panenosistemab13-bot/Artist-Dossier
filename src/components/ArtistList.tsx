import React, { useState, useRef } from 'react';
import { Plus, Users, ArrowRight, Camera, Loader2, Trash2 } from 'lucide-react';
import { Artist } from '../types';
import { uploadFile, saveArtist, removeArtist } from '../lib/services';

interface ArtistListProps {
  artists: Artist[];
  onSelectArtist: (id: string) => void;
}

export function ArtistList({ artists, onSelectArtist }: ArtistListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isUploading) return;
    const id = crypto.randomUUID();
    await saveArtist({
      id,
      name: newName,
      image: image || 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=300&h=300'
    });
    setIsCreating(false);
    setNewName('');
    setImage('');
    onSelectArtist(id);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadFile(file, `artist/${crypto.randomUUID()}-${file.name}`);
        setImage(url);
      } catch (err) {
        console.error(err);
        alert('Erro ao enviar imagem');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div 
      className="min-h-screen p-6 md:p-12 antialiased selection:bg-amber-200 relative bg-stone-900 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(https://i.postimg.cc/xjgxHVWw/wp4114246.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/70 md:bg-gradient-to-r md:from-black/90 md:to-black/30"></div>
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {isCreating ? (
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl shadow-stone-200/50 max-w-lg w-full relative overflow-hidden border border-stone-100">
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-stone-900 via-stone-700 to-amber-500"></div>
              <button 
                onClick={() => setIsCreating(false)}
                className="absolute top-8 right-8 text-stone-400 hover:text-stone-900 transition-colors"
               >
                 Cancelar
               </button>
              
              <h2 className="text-4xl font-serif text-stone-900 mb-2 mt-4 tracking-tight">Novo Dossiê</h2>
              <p className="text-stone-500 font-medium text-sm mb-10">Configure o perfil inicial do artista.</p>
              
              <form onSubmit={handleCreate} className="space-y-8">
                <div className="flex flex-col items-center gap-5">
                  <div 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl shadow-stone-200/50 overflow-hidden relative group cursor-pointer bg-[#F7F7F5] flex items-center justify-center transition-transform hover:scale-105"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                  >
                    {image ? (
                      <img src={image} alt="Preview" className={`w-full h-full object-cover transition-opacity duration-300 ${isUploading ? 'opacity-50' : 'opacity-100'}`} />
                    ) : (
                      <Camera className="w-8 h-8 text-stone-300" />
                    )}
                    <div className={`absolute inset-0 bg-stone-900/40 flex items-center justify-center transition-all duration-300 ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 backdrop-blur-sm'}`}>
                      {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-white" /> : <Camera className="w-8 h-8 text-white" />}
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-full">Foto do Artista</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">Nome Artístico</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-[#F7F7F5] border border-stone-200 rounded-2xl px-5 py-4 text-stone-900 text-lg focus:outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100 transition-all font-medium placeholder:text-stone-300"
                    placeholder="Ex: The Weeknd"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUploading || !newName.trim()}
                    className="w-full py-4 rounded-2xl text-sm font-bold bg-stone-900 text-white hover:bg-stone-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-lg flex justify-center items-center gap-2"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    {isUploading ? 'Processando...' : 'Criar Dossiê'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-12 md:gap-16 xl:gap-24 pt-4 md:pt-16">
            {/* Context Header */}
            <div className="w-full xl:w-1/3 xl:sticky xl:top-16 self-start max-w-xl text-center xl:text-left mx-auto xl:mx-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white mb-6 md:mb-8 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Painel Central
              </div>
              
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-serif text-white leading-[0.9] tracking-tighter mb-6 md:mb-8 drop-shadow-md">
                Artist<br />
                <span className="text-stone-300">Dossier.</span>
              </h1>
              
              <p className="text-stone-300 text-base md:text-xl font-medium leading-relaxed mb-8 md:mb-10 max-w-md mx-auto xl:mx-0 drop-shadow-sm">
                Gerencie todos os seus artistas em um só lugar. Organize biografias, estruture álbuns e planeje lançamentos futuros.
              </p>
              
              <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-3 px-8 py-4 bg-white text-stone-900 rounded-full font-bold hover:shadow-xl hover:-translate-y-1 hover:bg-stone-100 transition-all group w-full md:w-auto justify-center"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Novo Artista
              </button>
            </div>

            {/* Grid */}
            <div className="w-full xl:w-2/3 pb-12">
              {artists.length === 0 ? (
                <div className="w-full bg-black/40 backdrop-blur-md rounded-[2rem] border border-white/20 border-dashed p-10 md:p-16 flex flex-col items-center justify-center text-center">
                  <Users className="w-16 h-16 text-stone-400 mb-6" />
                  <h3 className="text-2xl font-serif text-white mb-2">Nenhum artista</h3>
                  <p className="text-stone-400 font-medium tracking-wide">Seu catálogo está vazio. Comece adicionando um novo artista.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
                  {artists.map((artist, index) => (
                    <div 
                      key={artist.id} 
                      onClick={() => onSelectArtist(artist.id)}
                      className="group bg-black/40 backdrop-blur-md rounded-[2rem] p-3 shadow-lg hover:shadow-xl hover:shadow-stone-900/50 transition-all duration-500 cursor-pointer border border-white/10 hover:border-white/20 flex items-center gap-5 relative overflow-hidden"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner relative">
                        <img 
                          src={artist.image} 
                          alt={artist.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
                      </div>
                      
                      <div className="flex-1 pr-12 md:pr-6 relative z-10">
                        <h3 className="font-serif text-xl sm:text-2xl text-white leading-tight mb-1 sm:mb-2 tracking-tight group-hover:text-amber-400 transition-colors">{artist.name}</h3>
                        <div className="flex items-center gap-2 text-stone-300 font-medium text-[10px] sm:text-xs tracking-wider uppercase">
                          <span className="font-bold">Acessar Dossiê</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300 text-amber-500" />
                        </div>
                      </div>
                      
                      <button
                         onClick={(e) => {
                           e.stopPropagation();
                           if(window.confirm(`Tem certeza que deseja excluir ${artist.name}? Todos os dados serão perdidos.`)) {
                             removeArtist(artist.id);
                           }
                         }}
                         className="absolute sm:top-4 sm:right-4 top-1/2 -translate-y-1/2 sm:translate-y-0 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500/20 text-stone-300 hover:text-red-400 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                         title="Remover Artista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
