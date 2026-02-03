
import React from 'react';
import { Wallpaper } from '../types';
import { WHATSAPP_NUMBER, Icons } from '../constants';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
}

const WallpaperCard: React.FC<WallpaperCardProps> = ({ wallpaper }) => {
  const isPremium = wallpaper.price > 0 || wallpaper.category === 'Premium';

  const handleDownload = () => {
    window.open(wallpaper.imageUrl, '_blank');
  };

  const handleWhatsApp = () => {
    const text = `Hi Graphico Global! I want to purchase this wallpaper.\nCode: ${wallpaper.code}\nTitle: ${wallpaper.title}\nPrice: ${wallpaper.price > 0 ? '$' + wallpaper.price : 'Premium'}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="group relative glass rounded-2xl overflow-hidden flex flex-col hover:shadow-cyan-500/10 hover:shadow-2xl transition-all duration-500 dark:bg-slate-900 bg-white border border-slate-200 dark:border-white/10">
      <div className="aspect-[9/16] overflow-hidden relative">
        <img 
          src={wallpaper.imageUrl} 
          alt={wallpaper.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute bottom-4 left-4 flex gap-2">
          <div className="bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-mono font-bold border border-white/20">
            {wallpaper.code}
          </div>
        </div>
        {isPremium && (
          <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
            PREMIUM
          </div>
        )}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px]">
          {wallpaper.category}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{wallpaper.title}</h3>
          {wallpaper.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 italic">
              {wallpaper.description}
            </p>
          )}
          <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400 mt-2">
            {wallpaper.price > 0 ? `$${wallpaper.price.toFixed(2)}` : 'Free Access'}
          </p>
        </div>

        <div className="mt-4">
          {isPremium ? (
            <button 
              onClick={handleWhatsApp}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-900/10"
            >
              <Icons.WhatsApp className="w-5 h-5" />
              Purchase
            </button>
          ) : (
            <button 
              onClick={handleDownload}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-900/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WallpaperCard;
