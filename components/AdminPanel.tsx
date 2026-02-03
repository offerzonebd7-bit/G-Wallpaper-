
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
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
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
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality JPEG
      };
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        // Pre-compress to ensure it fits in storage
        const compressed = await compressImage(result);
        setImagePreview(compressed);
        setUploadStatus('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return alert('Wallpaper code is required!');
    if (!imagePreview) return alert('Please select an image from gallery!');
    
    setIsUploading(true);
    setUploadStatus('idle');

    // Create the wallpaper object
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
    
    // Save to local storage
    const success = saveWallpaper(newWallpaper);
    
    if (success) {
      setUploadStatus('success');
      // Reset form fields
      setTitle('');
      setDescription('');
      setCode('');
      setPrice('0');
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Notify parent to refresh list
      onRefresh();
    } else {
      setUploadStatus('error');
      alert("Upload failed! The image might be too large. Try a different one.");
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
    alert('AI Knowledge Base updated!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 flex flex-col">
      <header className="glass p-4 sticky top-0 z-10 flex justify-between items-center px-4 sm:px-8 border-b border-white/5">
        <h2 className="text-xl font-bold text-cyan-400">Admin Control Center</h2>
        <div className="flex gap-2 sm:gap-4">
          <button onClick={onClose} className="text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 px-3 sm:px-4 py-2 rounded-lg transition-colors text-white">
            Back to Home
          </button>
          <button onClick={() => window.location.reload()} className="text-xs sm:text-sm bg-red-600 hover:bg-red-500 px-3 sm:px-4 py-2 rounded-lg transition-colors font-bold text-white">
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8">
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${activeTab === 'upload' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            Upload Wallpaper
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${activeTab === 'ai' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            AI Management
          </button>
          <button 
            onClick={() => setActiveTab('branding')}
            className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${activeTab === 'branding' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            Branding
          </button>
        </div>

        {activeTab === 'upload' && (
          <div className="space-y-6">
            {uploadStatus === 'success' && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span className="font-bold">Upload Success!</span>
                </div>
                <button onClick={() => setUploadStatus('idle')} className="text-xs uppercase font-bold opacity-70 hover:opacity-100">Dismiss</button>
              </div>
            )}

            <form onSubmit={handleUpload} className="glass p-6 sm:p-8 rounded-2xl space-y-6">
              <h3 className="text-2xl font-bold mb-4 text-white">Post New Wallpaper</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Wallpaper Code (Unique)</label>
                  <input required type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="e.g. GG-101" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Title</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="e.g. Masterpiece" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm text-slate-400">Description (Wallpapers details for users)</label>
                  <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="Details about this wallpaper..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500">
                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Price (0 for Free)</label>
                  <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm text-slate-400">Select Image from Gallery</label>
                  <div className="flex items-center gap-4">
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageSelect}
                      className="flex-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="relative group">
                        <img src={imagePreview} className="w-20 h-20 object-cover rounded-lg border border-white/20" alt="Preview" />
                        <button type="button" onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isUploading}
                className={`w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Uploading...
                  </>
                ) : 'Confirm Upload'}
              </button>
            </form>
            <p className="text-center text-slate-500 text-xs mt-4">Note: Uploading high resolution images might take a moment to compress.</p>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="glass p-8 rounded-2xl space-y-6">
            <h3 className="text-2xl font-bold text-white">Store Branding</h3>
            <div className="space-y-4">
              <label className="text-sm text-slate-400 block">Upload Store Logo</label>
              {currentLogo && (
                <div className="mb-4">
                   <img src={currentLogo} alt="Logo Preview" className="h-20 object-contain bg-white/5 rounded-lg p-2" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer" />
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="glass p-8 rounded-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Manage Chatbot Q&A</h3>
              <button onClick={() => setFaqs([...faqs, { id: Date.now().toString(), question: '', answer: '' }])} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold">
                + Add Question
              </button>
            </div>
            {faqs.map((faq) => (
              <div key={faq.id} className="p-4 bg-slate-900 rounded-xl space-y-3">
                <input className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white" placeholder="Question" value={faq.question} onChange={(e) => handleFAQChange(faq.id, 'question', e.target.value)} />
                <textarea className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white" placeholder="Answer" value={faq.answer} onChange={(e) => handleFAQChange(faq.id, 'answer', e.target.value)} />
                <button onClick={() => setFaqs(faqs.filter(f => f.id !== faq.id))} className="text-red-400 text-xs">Remove</button>
              </div>
            ))}
            <button onClick={saveFAQChanges} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all">
              Update AI Knowledge Base
            </button>
          </div>
        )}
      </main>
      
      <footer className="p-4 text-center text-slate-600 text-[10px] uppercase tracking-widest border-t border-white/5">
        App developed by Graphico Global
      </footer>
    </div>
  );
};

export default AdminPanel;
