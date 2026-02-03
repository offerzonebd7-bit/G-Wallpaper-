
import React, { useState, useEffect, useRef } from 'react';
import { Category, Wallpaper, FAQItem } from '../types';
import { saveWallpaper, getFAQs, saveFAQs, getLogo, saveLogo } from '../services/storage';
import { ADMIN_PASSWORD } from '../constants';

interface AdminPanelProps {
  onClose: () => void;
  onRefresh: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'ai' | 'branding'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Upload State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<Category>(Category.NORMAL);
  const [price, setPrice] = useState('0');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI State
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  // Branding State
  const [currentLogo, setCurrentLogo] = useState<string | null>(getLogo());

  useEffect(() => {
    setFaqs(getFAQs());
  }, []);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Smaller size for localStorage compatibility
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); // Lower quality for better storage support
      };
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("ইমেজটি অনেক বড়! ২ এমবির নিচের ছবি ব্যবহার করুন।");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const compressed = await compressImage(result);
        setImagePreview(compressed);
        setUploadStatus('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return alert('ওয়ালপেপার কোড অবশ্যই দিতে হবে!');
    if (!imagePreview) return alert('গ্যালারি থেকে একটি ছবি সিলেক্ট করুন!');
    
    setIsUploading(true);
    setUploadStatus('idle');

    const newWallpaper: Wallpaper = {
      id: Math.random().toString(36).substr(2, 9),
      code: code.toUpperCase(),
      title,
      description,
      category,
      price: parseFloat(price) || 0,
      imageUrl: imagePreview,
      createdAt: Date.now()
    };
    
    const success = saveWallpaper(newWallpaper);
    
    if (success) {
      setUploadStatus('success');
      // Reset fields for new upload
      setTitle('');
      setDescription('');
      setCode('');
      setPrice('0');
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      onRefresh();
    } else {
      setUploadStatus('error');
      alert("আপলোড ব্যর্থ হয়েছে! ছবিটির সাইজ কমিয়ে আবার চেষ্টা করুন।");
    }
    
    setIsUploading(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        saveLogo(base64);
        setCurrentLogo(base64);
        onRefresh();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFAQChange = (id: string, field: 'question' | 'answer', value: string) => {
    const updated = faqs.map(f => f.id === id ? { ...f, [field]: value } : f);
    setFaqs(updated);
  };

  const saveFAQChanges = () => {
    saveFAQs(faqs);
    alert('AI নলেজ বেস আপডেট হয়েছে!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 flex flex-col text-slate-100">
      <header className="glass p-4 sticky top-0 z-10 flex justify-between items-center px-4 sm:px-8 border-b border-white/5">
        <h2 className="text-xl font-bold text-cyan-400">Admin Control Center</h2>
        <div className="flex gap-2">
          <button onClick={onClose} className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
            Home
          </button>
          <button onClick={() => window.location.reload()} className="text-xs bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-bold">
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => { setActiveTab('upload'); setUploadStatus('idle'); }}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'upload' ? 'bg-cyan-600' : 'bg-slate-800 text-slate-400'}`}
          >
            Upload Wallpaper
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'ai' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-400'}`}
          >
            AI Settings
          </button>
          <button 
            onClick={() => setActiveTab('branding')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'branding' ? 'bg-amber-600' : 'bg-slate-800 text-slate-400'}`}
          >
            Branding
          </button>
        </div>

        {activeTab === 'upload' && (
          <div className="space-y-6">
            {uploadStatus === 'success' && (
              <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-xl flex items-center justify-between animate-bounce">
                <span className="font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  আপলোড সফল হয়েছে! ড্যাশবোর্ডে গিয়ে চেক করুন।
                </span>
                <button onClick={() => setUploadStatus('idle')} className="text-xs font-bold underline">নতুন আরেকটি দিন</button>
              </div>
            )}

            <form onSubmit={handleUpload} className="glass p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">ওয়ালপেপার কোড (Unique Code)</label>
                  <input required type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="যেমন: GG-105" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">ওয়ালপেপার নাম</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Masterpiece Name" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm text-slate-400">বিবরণ (Description)</label>
                  <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="মানুষের জন্য ছোট ডেসক্রিপশন..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">ক্যাটাগরি</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none">
                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">দাম ($) - (0 মানে ফ্রি)</label>
                  <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm text-slate-400">গ্যালারি থেকে ছবি আপলোড করুন</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageSelect}
                      className="flex-1 w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="relative">
                        <img src={imagePreview} className="w-20 h-20 object-cover rounded-lg border border-cyan-500/50" alt="Preview" />
                        <span className="absolute -top-2 -right-2 bg-cyan-600 text-white text-[8px] px-1 rounded">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isUploading}
                className={`w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 cursor-wait' : 'active:scale-95'}`}
              >
                {isUploading ? "সংরক্ষণ হচ্ছে..." : "ওয়ালপেপার আপলোড নিশ্চিত করুন"}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="glass p-8 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold">Store Logo</h3>
            <div className="space-y-4">
              {currentLogo && <img src={currentLogo} className="h-16 object-contain p-2 bg-white/5 rounded" alt="Logo" />}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-sm file:bg-amber-600 file:text-white file:border-0 file:rounded-full file:px-4 file:py-2" />
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="glass p-8 rounded-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Chatbot Q&A</h3>
              <button onClick={() => setFaqs([...faqs, { id: Date.now().toString(), question: '', answer: '' }])} className="bg-indigo-600 px-3 py-1 rounded text-xs">+ Add</button>
            </div>
            {faqs.map((faq) => (
              <div key={faq.id} className="p-4 bg-slate-900/50 rounded-xl space-y-2 border border-white/5">
                <input className="w-full bg-slate-800 rounded px-3 py-2 text-sm" placeholder="Question" value={faq.question} onChange={(e) => handleFAQChange(faq.id, 'question', e.target.value)} />
                <textarea className="w-full bg-slate-800 rounded px-3 py-2 text-sm" placeholder="Answer" value={faq.answer} onChange={(e) => handleFAQChange(faq.id, 'answer', e.target.value)} />
                <button onClick={() => setFaqs(faqs.filter(f => f.id !== faq.id))} className="text-red-400 text-[10px] uppercase">Remove</button>
              </div>
            ))}
            <button onClick={saveFAQChanges} className="w-full bg-indigo-600 py-3 rounded-xl font-bold">AI ডাটা আপডেট করুন</button>
          </div>
        )}
      </main>
      
      <footer className="p-6 text-center text-slate-500 text-[10px] uppercase tracking-[0.2em] opacity-50">
        App developed by Graphico Global
      </footer>
    </div>
  );
};

export default AdminPanel;
