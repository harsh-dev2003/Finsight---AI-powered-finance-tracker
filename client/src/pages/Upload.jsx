import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, FileText, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import api from '../services/api';
import CategoryBadge from '../components/CategoryBadge';

const PRESET_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Travel', 'Investment', 'Income', 'Other'];

const Upload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [parsedTx, setParsedTx] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1 
  });

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatusText('Extracting data from file...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const extracted = uploadRes.data.transactions;

      if (!extracted || extracted.length === 0) {
        setStatusText('No transactions found in file.');
        setLoading(false);
        return;
      }

      setStatusText('FinSight AI is categorizing your spending...');
      const aiRes = await api.post('/ai/categorize', { transactions: extracted });
      
      setParsedTx(aiRes.data.transactions || []);
      setStatusText('');
    } catch (error) {
      console.error(error);
      setStatusText('Error processing file.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (id, newCategory) => {
    setParsedTx(prev => prev.map(t => t.id === id ? { ...t, category: newCategory } : t));
    try {
      await api.patch(`/transactions/${id}`, { category: newCategory });
    } catch (e) {
      console.error('Failed to update category', e);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-accent/20 text-accent"><UploadCloud size={24} /></div>
        <h1 className="text-3xl font-extrabold gradient-text tracking-tight">Statement Importer</h1>
      </div>
      
      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`w-full relative overflow-hidden p-12 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 glass-card
          ${isDragActive ? 'border-accent bg-accent/10 shadow-[0_0_50px_rgba(108,99,255,0.2)]' : 'border-white/10 hover:border-accent/50 hover:bg-white/5'}`}
      >
        <input {...getInputProps()} />
        <div className={`p-5 rounded-full mb-6 transition-transform duration-500 ${isDragActive ? 'bg-accent text-white scale-110 shadow-lg' : 'bg-sidebar border border-white/5 text-accent shadow-xl'}`}>
          <FileUp size={40} />
        </div>
        <h3 className="text-xl font-bold text-textPrimary mb-2">
          {isDragActive ? 'Drop to analyze!' : 'Drag & drop bank statements'}
        </h3>
        <p className="text-[15px] text-textMuted font-medium text-center max-w-md leading-relaxed">
          Upload  <span className="text-textPrimary">.csv</span> or <span className="text-textPrimary">.pdf</span> up to 5MB. FinSight AI inherently categorizes every row locally.
        </p>
      </div>

      {file && (
        <div className="glass-card rounded-[1.5rem] p-5 flex items-center justify-between shadow-2xl relative overflow-hidden subtle-glow">
          <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-accent/10 to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-sidebar border border-white/10 p-3 rounded-2xl">
              <FileText className="text-accent" size={24} />
            </div>
            <div>
              <p className="font-bold text-textPrimary">{file.name}</p>
              <p className="text-sm font-medium text-textMuted mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button 
            onClick={handleUpload}
            disabled={loading}
            className="px-8 py-3.5 gradient-accent text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 hover:shadow-[0_0_20px_rgba(108,99,255,0.4)] relative z-10"
          >
            {loading ? (
               <><Sparkles size={18} className="animate-pulse" /> {statusText}</>
            ) : (
               <>Process with AI <ChevronRight size={18}/></>
            )}
          </button>
        </div>
      )}
      
      {statusText && !loading && statusText !== 'Error processing file.' && (
         <div className="text-textMuted font-medium text-sm text-center py-4 animate-pulse">{statusText}</div>
      )}

      {/* Results Table */}
      {parsedTx.length > 0 && (
        <div className="glass-card rounded-[2rem] shadow-2xl overflow-hidden mt-8 animate-fade-in">
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-sidebar/50 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-success">
              <div className="p-1 rounded-full bg-success/20"><CheckCircle2 size={18} /></div>
              <span className="font-bold text-[15px]">Successfully processed {parsedTx.length} transactions</span>
            </div>
            <button 
              onClick={() => { setParsedTx([]); setFile(null); }}
              className="text-sm font-bold text-accent hover:text-accent-light transition-colors px-4 py-2 hover:bg-white/5 rounded-lg"
            >
              Clear & Upload Another
            </button>
          </div>
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-sidebar/90 backdrop-blur-xl z-20">
                <tr className="text-textMuted text-sm border-b border-white/5 shadow-sm">
                  <th className="font-bold py-4 px-6">Date</th>
                  <th className="font-bold py-4 px-6">Description</th>
                  <th className="font-bold py-4 px-6 text-right">Amount</th>
                  <th className="font-bold py-4 px-6">AI Category</th>
                </tr>
              </thead>
              <tbody className="bg-background/20">
                {parsedTx.map(t => (
                  <tr key={t.id || Math.random()} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6 text-[15px] font-medium text-textMuted whitespace-nowrap">{new Date(t.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</td>
                    <td className="py-4 px-6 text-[15px] font-semibold text-textPrimary truncate max-w-[300px]">{t.description}</td>
                    <td className="py-4 px-6 text-right font-bold text-[15px] text-textPrimary">₹{parseFloat(t.amount || 0).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <select 
                        value={t.category}
                        onChange={(e) => handleUpdateCategory(t.id, e.target.value)}
                        className="bg-sidebar border border-white/10 text-sm font-semibold rounded-xl px-3 py-2 text-textPrimary outline-none focus:border-accent hover:border-white/25 transition-all shadow-sm cursor-pointer"
                      >
                        {PRESET_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

import { UploadCloud } from 'lucide-react';
export default Upload;
