import { useState, useEffect } from 'react';
import { ArtistList } from './components/ArtistList';
import { ArtistDossier } from './components/ArtistDossier';
import { Artist } from './types';
import { subscribeToArtists } from './lib/services';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [activeArtistId, setActiveArtistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToArtists((data) => {
      setArtists(data);
      setIsLoading(false);
      
      // Removed auto-selecting the active artist so users always see the list first
      // unless an activeArtistId is already configured.
      if (data.length === 1 && !activeArtistId && isLoading) {
         // Optionally you could auto-select if there is only 1 artist, 
         // but the user expressly asked for an initial menu.
      }
    });
    return () => unsub();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center text-stone-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-semibold text-sm tracking-widest uppercase">Carregando...</p>
      </div>
    );
  }

  if (activeArtistId) {
    const activeArtist = artists.find(a => a.id === activeArtistId);
    if (activeArtist) {
      return <ArtistDossier artist={activeArtist} onBack={() => setActiveArtistId(null)} />;
    }
  }

  return <ArtistList artists={artists} onSelectArtist={setActiveArtistId} />;
}

