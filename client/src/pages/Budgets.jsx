import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Tags, Trash2, PieChart } from 'lucide-react';
import api from '../services/api';

const PRESET_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Travel', 'Investment', 'Other'];

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [newCat, setNewCat] = useState(PRESET_CATEGORIES[0]);
  const [newLimit, setNewLimit] = useState('');

  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/budgets?month=${currentMonthStr}`);
      setBudgets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [currentMonthStr]);

  const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!newLimit) return;
    try {
      await api.post('/budgets', {
        category: newCat,
        monthlyLimit: parseFloat(newLimit),
        month: currentMonthStr
      });
      setNewLimit('');
      setShowForm(false);
      fetchBudgets();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (e) {
      console.error(e);
    }
  };

  const getProgressColor = (pct) => {
    if (pct < 70) return 'from-emerald-400 to-emerald-600 shadow-emerald-500/50';
    if (pct < 90) return 'from-amber-400 to-amber-600 shadow-amber-500/50';
    return 'from-red-400 to-red-600 shadow-red-500/50';
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent/20 text-accent"><PieChart size={24} /></div>
          <h1 className="text-3xl font-extrabold gradient-text tracking-tight">Budgets Tracking</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-card/60 backdrop-blur-xl border border-white/5 rounded-2xl p-1.5 shadow-lg">
          <button onClick={handlePrevMonth} className="p-2.5 hover:bg-white/10 rounded-xl text-textPrimary transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-[15px] font-bold w-36 text-center text-textPrimary tracking-wide">{monthName}</span>
          <button onClick={handleNextMonth} className="p-2.5 hover:bg-white/10 rounded-xl text-textPrimary transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {showForm ? (
            <div className="glass-card rounded-[2rem] p-7 shadow-2xl relative overflow-hidden subtle-glow">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-[40px]"></div>
              <h3 className="font-bold text-lg text-textPrimary mb-5 relative z-10 flex items-center gap-2"><Plus size={18} className="text-accent"/> Set Category Target</h3>
              <form onSubmit={handleAddBudget} className="space-y-4 relative z-10">
                <select 
                  value={newCat} 
                  onChange={e=>setNewCat(e.target.value)}
                  className="w-full bg-sidebar border border-white/10 rounded-xl px-4 py-3 text-[15px] font-medium text-textPrimary outline-none focus:border-accent hover:border-white/20 transition-all shadow-inner cursor-pointer"
                >
                  {PRESET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="relative">
                  <span className="absolute left-4 top-[13px] text-textMuted font-bold">₹</span>
                  <input 
                    type="number"
                    placeholder="Monthly Limit..."
                    value={newLimit}
                    onChange={e=>setNewLimit(e.target.value)}
                    required
                    className="w-full bg-background border border-white/10 rounded-xl pl-9 pr-4 py-3 text-[15px] font-medium text-textPrimary outline-none focus:border-accent transition-all shadow-inner"
                  />
                </div>
                <div className="flex gap-3 pt-3">
                  <button type="submit" className="flex-1 gradient-accent hover:brightness-110 shadow-[0_0_15px_rgba(108,99,255,0.4)] text-white rounded-xl py-3 text-[15px] font-bold transition-all">Create Limits</button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-sidebar hover:bg-white/10 text-textPrimary border border-white/10 rounded-xl py-3 text-[15px] font-bold transition-all">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => setShowForm(true)}
              className="border-2 border-dashed border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center text-textMuted hover:text-white hover:border-accent/50 hover:bg-accent/5 transition-all min-h-[220px] group subtle-glow"
            >
              <div className="p-4 bg-sidebar border border-white/5 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-accent group-hover:border-accent transition-all duration-300 shadow-xl">
                <Plus size={28} />
              </div>
              <span className="font-bold text-[15px] tracking-wide">Establish New Limit</span>
            </button>
          )}

          {budgets.map(b => {
             const pct = b.monthlyLimit > 0 ? (b.actualSpent / b.monthlyLimit) * 100 : 0;
             const clampedPct = Math.min(100, Math.max(0, pct));
             
             return (
               <div key={b.id} className="glass-card rounded-[2rem] p-7 shadow-2xl subtle-glow group relative overflow-hidden">
                 <button 
                  onClick={() => handleDelete(b.id)}
                  className="absolute top-5 right-5 text-textMuted/50 hover:text-danger hover:bg-danger/10 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-20"
                 ><Trash2 size={18}/></button>

                 <div className="flex items-center gap-3.5 mb-8 relative z-10">
                   <div className="bg-sidebar shadow-md p-3 rounded-2xl border border-white/5 group-hover:border-accent/30 transition-colors"><Tags size={20} className="text-accent"/></div>
                   <h3 className="font-bold text-lg text-textPrimary tracking-wide">{b.category}</h3>
                 </div>
                 
                 <div className="flex justify-between items-end mb-3 relative z-10">
                   <div>
                     <p className="text-3xl font-extrabold text-textPrimary tracking-tight">₹{b.actualSpent.toFixed(2)}</p>
                     <p className="text-sm font-medium text-textMuted mt-1">utilized this month</p>
                   </div>
                   <div className="text-right pb-1.5">
                     <p className="text-[15px] font-bold text-textMuted">/ ₹{b.monthlyLimit}</p>
                   </div>
                 </div>

                 <div className="h-3.5 w-full bg-background border border-white/5 rounded-full overflow-hidden mt-6 relative z-10 shadow-inner">
                   <div 
                     style={{ width: `${clampedPct}%` }}
                     className={`h-full rounded-full bg-gradient-to-r shadow-lg transition-all duration-1000 ease-out ${getProgressColor(pct)}`}
                   />
                 </div>
                 <p className="text-right text-sm font-extrabold mt-3 text-textPrimary relative z-10">
                   {pct.toFixed(0)}%
                 </p>
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
};

export default Budgets;
