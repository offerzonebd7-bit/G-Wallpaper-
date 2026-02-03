
import React, { useState, useEffect, useMemo } from 'react';
import { Wallpaper, Category } from './types';
import { getWallpapers, getLogo, getTheme, saveTheme } from './services/storage';
import { BRAND_NAME, FB_LINK, TELEGRAM_LINK, ADMIN_PASSWORD, Icons } from './constants';
import WallpaperCard from './components/WallpaperCard';
import AIChatbot from './components/AIChatbot';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [theme, setTheme] = useState<string>(getTheme());
  const [logo, setLogo] = useState<string | null>(getLogo());

  const refreshData = () => {
    setWallpapers(getWallpapers());
    setLogo(getLogo());
  };

  useEffect(() => {
    refreshData();
    applyTheme(theme);
  }, []);

  const applyTheme = (t: string) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else if (t === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'auto' : 'dark';
    setTheme(nextTheme);
    saveTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const filteredWallpapers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return wallpapers.filter(w => {
      const matchesCode = w.code.toLowerCase().includes(query);
      const matchesTitle = w.title.toLowerCase().includes(query);
      const matchesSearch = matchesCode || matchesTitle;
      
      const matchesCategory = selectedCategory === 'All' || w.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [wallpapers, searchQuery, selectedCategory]);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdminOpen(true);
      setIsAuthenticating(false);
      setPasswordInput('');
    } else {
      alert('Access Denied: Incorrect Password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            {logo ? (
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-cyan-500/20">
                G
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter hidden sm:block uppercase">
              {BRAND_NAME.split(' ')[0]} <span className="text-cyan-500">{BRAND_NAME.split(' ')[1]}</span>
            </h1>
          </div>

          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search Code or Title..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full px-6 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-900 dark:text-white"
              />
              <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌓'}
            </button>
            
            {/* Social Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a href={FB_LINK} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors" title="Facebook">
                <Icons.Facebook className="w-5 h-5" />
              </a>
              <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-500 transition-colors" title="Telegram">
                <Icons.Telegram className="w-5 h-5" />
              </a>
            </div>

            <button 
              onClick={() => setIsAuthenticating(true)}
              className="ml-1 sm:ml-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded hover:text-cyan-500 hover:border-cyan-500 transition-all"
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`whitespace-nowrap px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500'}`}
          >
            All Items
          </button>
          {Object.values(Category).map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Wallpaper Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWallpapers.map(wp => (
            <WallpaperCard key={wp.id} wallpaper={wp} />
          ))}
        </div>

        {filteredWallpapers.length === 0 && (
          <div className="text-center py-32 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5">
            <div className="text-6xl mb-6 grayscale opacity-20">🖼️</div>
            <h3 className="text-2xl font-black mb-2">No Wallpapers Found</h3>
            <p className="text-slate-500">Try searching by code (e.g., GG-101) or Title.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="font-black text-2xl tracking-tighter mb-4 text-slate-900 dark:text-white uppercase tracking-widest">{BRAND_NAME}</h3>
          <div className="flex justify-center gap-8 mb-8">
            <a href={FB_LINK} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 flex items-center gap-2 font-medium">
              <Icons.Facebook className="w-5 h-5" /> Facebook
            </a>
            <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-500 flex items-center gap-2 font-medium">
              <Icons.Telegram className="w-5 h-5" /> Telegram
            </a>
          </div>
          <div className="space-y-2">
            <p className="text-slate-500 text-sm italic">Premium Digital Aesthetics & Quality Graphics.</p>
            <p className="text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest animate-pulse">App developed by Graphico Global</p>
            <p className="text-slate-600 text-[10px] mt-4 uppercase tracking-tighter">© {new Date().getFullYear()} Graphico Global</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {isAuthenticating && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10">
            <h2 className="text-xl font-black mb-6 text-center text-slate-900 dark:text-white uppercase">Admin Security</h2>
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <input 
                autoFocus
                type="password"
                placeholder="Enter Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-center text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsAuthenticating(false)} className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 dark:text-white hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] py-3 px-4 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20">Login</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} onRefresh={refreshData} />}
      <AIChatbot />
    </div>
  );
};

export default App;
