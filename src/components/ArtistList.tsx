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
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedArtistForAuth, setSelectedArtistForAuth] = useState<Artist | null>(null);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handlePasswordChange = (val: string) => {
    const numericValue = val.replace(/\D/g, '').slice(0, 8);
    setPassword(numericValue);
    if (numericValue && numericValue.length !== 8) {
      setPasswordError('A senha deve conter exatamente 8 dígitos numéricos.');
    } else {
      setPasswordError('');
    }
  };

  const handleAuthPasswordChange = (val: string) => {
    const numericValue = val.replace(/\D/g, '').slice(0, 8);
    setAuthPassword(numericValue);
    setAuthError('');

    if (selectedArtistForAuth && selectedArtistForAuth.password === numericValue) {
      onSelectArtist(selectedArtistForAuth.id);
      setSelectedArtistForAuth(null);
      setAuthPassword('');
      setAuthError('');
    } else if (numericValue.length === 8) {
      setAuthError('Senha incorreta.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isUploading) return;
    if (password && password.length !== 8) {
      setPasswordError('A senha deve conter exatamente 8 dígitos numéricos.');
      return;
    }
    const id = crypto.randomUUID();
    await saveArtist({
      id,
      name: newName,
      image: image || 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=300&h=300',
      password: password.trim() || undefined
    });
    setIsCreating(false);
    setNewName('');
    setImage('');
    setPassword('');
    setPasswordError('');
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

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedArtistForAuth?.password === authPassword) {
      onSelectArtist(selectedArtistForAuth.id);
      setSelectedArtistForAuth(null);
      setAuthPassword('');
      setAuthError('');
    } else {
      setAuthError('Senha incorreta.');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col p-6 md:p-12 antialiased selection:bg-amber-200 relative bg-stone-900 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(https://i.postimg.cc/xjgxHVWw/wp4114246.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/70 md:bg-gradient-to-r md:from-black/90 md:to-black/30"></div>
      
      <div className="max-w-[1400px] mx-auto relative z-10 w-full flex-1 flex flex-col">
        
        {isCreating ? (
          <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-stone-950/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-black/80 max-w-md w-full relative overflow-hidden border border-white/10 animate-in fade-in duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>
              <button 
                onClick={() => setIsCreating(false)}
                className="absolute top-6 right-6 text-stone-400 hover:text-white hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-stone-800 hover:border-stone-700 bg-stone-950/40 backdrop-blur-sm"
               >
                  Cancelar
                </button>
              
              <h2 className="text-2xl font-serif text-white mb-1 mt-2 tracking-tight">Novo Dossiê</h2>
              <p className="text-stone-400 font-medium text-[10px] tracking-widest uppercase mb-6">Configure o perfil inicial do artista</p>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div 
                    className="w-24 h-24 rounded-full border-2 border-white/10 hover:border-amber-500/50 shadow-2xl overflow-hidden relative group cursor-pointer bg-stone-950/50 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                  >
                    {image ? (
                      <img src={image} alt="Preview" referrerPolicy="no-referrer" className={`w-full h-full object-cover transition-opacity duration-300 ${isUploading ? 'opacity-40 scale-105' : 'opacity-100 scale-100'}`} />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-center">
                        <Camera className="w-6 h-6 text-stone-400 group-hover:text-amber-400 transition-colors" />
                        <span className="text-[9px] text-stone-400 font-medium tracking-wide">Adicionar</span>
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-all duration-300 ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 backdrop-blur-xs'}`}>
                      {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-amber-500" /> : <Camera className="w-6 h-6 text-white" />}
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                  </div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest bg-white/5 border border-white/5 px-3.5 py-1 rounded-full backdrop-blur-sm shadow-sm select-none">Foto do Artista</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Nome Artístico</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-stone-950/60 border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium placeholder:text-stone-600"
                    placeholder="Ex: The Weeknd"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Senha da Pasta (Opcional - 8 Dígitos Numéricos)</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={8}
                    value={password}
                    onChange={e => handlePasswordChange(e.target.value)}
                    className="w-full bg-stone-950/60 border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium placeholder:text-stone-600 tracking-widest text-center"
                    placeholder="8 dígitos (números apenas)"
                  />
                  {passwordError && (
                    <p className="text-amber-500 text-[10px] uppercase font-bold tracking-wider mt-1 text-center select-none">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUploading || !newName.trim()}
                    className="w-full py-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 hover:shadow-lg hover:shadow-amber-500/15 transition-all active:scale-[0.98] disabled:opacity-30 disabled:active:scale-100 flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed font-sans uppercase tracking-wider"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
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
                      onClick={() => {
                        if (artist.password) {
                          setSelectedArtistForAuth(artist);
                          setAuthPassword('');
                          setAuthError('');
                        } else {
                          onSelectArtist(artist.id);
                        }
                      }}
                      className="group bg-black/40 backdrop-blur-md rounded-[2rem] p-3 shadow-lg hover:shadow-xl hover:shadow-stone-900/50 transition-all duration-500 cursor-pointer border border-white/10 hover:border-white/20 flex items-center gap-5 relative overflow-hidden"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner relative">
                        <img 
                          src={artist.image} 
                          alt={artist.name} 
                          referrerPolicy="no-referrer"
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

        {selectedArtistForAuth && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setSelectedArtistForAuth(null)}></div>
            <div className="bg-stone-950/90 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-black/80 max-w-sm w-full relative z-10 overflow-hidden border border-white/10 animate-in zoom-in-95 duration-200">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>
              
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6 shadow-2xl border-2 border-white/20">
                <img src={selectedArtistForAuth.image} alt={selectedArtistForAuth.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              
              <h3 className="text-2xl font-serif text-white text-center mb-1">{selectedArtistForAuth.name}</h3>
              <p className="text-stone-400 text-xs text-center mb-6 font-medium tracking-wide uppercase">Pasta Protegida</p>
              
              <form onSubmit={handleAuthSubmit} className="space-y-5">
                <input
                  type="password"
                  required
                  autoFocus
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  value={authPassword}
                  onChange={e => handleAuthPasswordChange(e.target.value)}
                  className="w-full bg-stone-900/80 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all font-mono tracking-widest"
                  placeholder="8 dígitos"
                />
                
                {authError && <p className="text-red-500 text-xs font-bold text-center uppercase tracking-wider">{authError}</p>}
                
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setSelectedArtistForAuth(null)}
                    className="flex-1 px-4 py-3 rounded-xl text-xs font-bold text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 transition-all cursor-pointer font-sans uppercase tracking-wider hover:shadow-lg hover:shadow-amber-500/10 active:scale-[0.98]"
                  >
                    Acessar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto pt-16 pb-4 text-center text-xs text-stone-500 font-medium tracking-widest uppercase">
          Criado por Jefferson Augusto
        </footer>
      </div>
    </div>
  );
}
