import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isStandAloneMatch = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isStandAloneMatch || (navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    if (isIOSDevice) {
      setIsIOS(true);
      // Only show after a small delay for better UX
      setTimeout(() => setShowPrompt(true), 2500);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt automatically on Android when passing the criteria
      setTimeout(() => setShowPrompt(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-stone-900 rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-stone-800">
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-stone-800">
          <img src="https://i.postimg.cc/HsMtzJny/Gemini-Generated-Image-9a8kte9a8kte9a8k.png" alt="App Icon" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm">Instalar o App</h3>
          <p className="text-stone-400 text-[11px] mt-0.5 leading-tight">
            {isIOS ? 'Toque em Compartilhar e "Adicionar à Tela de Início"' : 'Adicione à tela inicial para acesso rápido'}
          </p>
        </div>
        {!isIOS && (
          <button 
            onClick={() => {
              if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => {
                  setDeferredPrompt(null);
                  setShowPrompt(false);
                });
              } else {
                 setShowPrompt(false);
              }
            }}
            className="bg-white text-stone-900 rounded-full px-4 py-2 font-bold text-xs flex items-center gap-1 active:scale-95 transition-transform"
          >
            <Download className="w-3 h-3" /> Instalar
          </button>
        )}
        <button 
          onClick={() => setShowPrompt(false)}
          className="p-1.5 text-stone-500 hover:text-stone-300 rounded-full bg-stone-800 ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
