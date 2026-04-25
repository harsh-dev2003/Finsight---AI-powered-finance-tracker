import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { DollarSign, Tag, HeartPulse, PiggyBank, Sparkles, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import api from '../services/api';
import CategoryBadge from '../components/CategoryBadge';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, txRes, insRes] = await Promise.all([
          api.get('/transactions/summary'),
          api.get(`/transactions?month=${currentMonth}`),
          api.get('/ai/insights').catch(() => ({ data: [] }))
        ]);
        
        setSummary(sumRes.data);
        setTransactions(txRes.data.slice(0, 5));
        setInsights(insRes.data);
      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentMonth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  const curMonthVal = summary?.byMonth?.find(m => m.month === currentMonth)?.total || 0;
  const biggestCat = [...(summary?.byCategory || [])].sort((a,b) => b.total - a.total)[0];

  const barData = summary?.byCategory?.map(c => ({
    name: c.category,
    amount: c.total
  })).sort((a,b) => b.amount - a.amount).slice(0, 6) || [];

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const lineData = Array.from({length: daysInMonth}, (_, i) => ({ day: i + 1, amount: 0 }));
  
  transactions.forEach(t => {
    const d = new Date(t.date).getDate();
    if (d > 0 && d <= daysInMonth) {
      lineData[d - 1].amount += t.amount;
    }
  });

  let rolling = 0;
  const cumulativeLineData = lineData.map(d => {
    rolling += d.amount;
    return { day: d.day, total: rolling, amount: d.amount };
  });

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold gradient-text tracking-tight">Financial Overview</h1>
        <div className="text-sm font-medium text-textMuted bg-card px-4 py-2 rounded-full border border-white/5">
          {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 subtle-glow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-textMuted text-sm font-medium">Spent This Month</span>
            <div className="p-2.5 bg-accent/15 border border-accent/20 rounded-xl shadow-[0_0_10px_rgba(108,99,255,0.2)]"><DollarSign size={20} className="text-accent" /></div>
          </div>
          <div className="text-4xl font-bold text-textPrimary tracking-tight">₹{curMonthVal.toFixed(2)}</div>
          <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-success bg-success/10 w-max px-2 py-1 rounded-md">
            <TrendingDown size={14} /> -12% vs Last Month
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-6 subtle-glow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-danger/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-textMuted text-sm font-medium">Highest Expense</span>
            <div className="p-2.5 bg-danger/15 border border-danger/20 rounded-xl"><Tag size={20} className="text-danger" /></div>
          </div>
          <div className="text-3xl font-bold text-textPrimary truncate">{biggestCat?.category || 'N/A'}</div>
          <div className="mt-3 text-textMuted font-medium">₹{biggestCat?.total?.toFixed(2) || '0.00'} combined</div>
        </div>

        <div className="glass-card rounded-2xl p-6 subtle-glow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-warning/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-textMuted text-sm font-medium">Budget Health</span>
            <div className="p-2.5 bg-warning/15 border border-warning/20 rounded-xl"><HeartPulse size={20} className="text-warning" /></div>
          </div>
          <div className="text-3xl font-bold text-success">Optimal</div>
          <div className="mt-3 text-textMuted font-medium">85% under limits</div>
        </div>

        <div className="glass-card rounded-2xl p-6 subtle-glow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-textMuted text-sm font-medium">Est. Savings</span>
            <div className="p-2.5 bg-success/15 border border-success/20 rounded-xl"><PiggyBank size={20} className="text-success" /></div>
          </div>
          <div className="text-4xl font-bold text-textPrimary tracking-tight">₹0.00</div>
          <div className="mt-3 text-textMuted font-medium">Connect income source</div>
        </div>
      </div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-3xl p-6 subtle-glow">
          <h2 className="text-lg font-bold text-textPrimary mb-6 flex items-center gap-2">Top Spending Categories</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: 'rgba(22, 26, 38, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} />
                <Bar dataKey="amount" fill="url(#colorAccent)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                <defs>
                  <linearGradient id="colorAccent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B85FF" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#6C63FF" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 subtle-glow">
          <h2 className="text-lg font-bold text-textPrimary mb-6">Cumulative Daily Pace</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={cumulativeLineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} minTickGap={20} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(22, 26, 38, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSuccess)" activeDot={{ r: 8, strokeWidth: 0, fill: '#10B981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Overview Table & AI Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 glass-card rounded-3xl p-1 overflow-hidden subtle-glow">
          <div className="p-5 flex justify-between items-center border-b border-white/5">
            <h2 className="text-lg font-bold text-textPrimary">Recent Activity</h2>
            <button className="text-sm font-semibold text-accent hover:text-accent-light transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-textMuted text-sm border-b border-white/5 bg-background/30">
                  <th className="font-semibold py-4 px-6">Date</th>
                  <th className="font-semibold py-4 px-6">Description</th>
                  <th className="font-semibold py-4 px-6">Category</th>
                  <th className="font-semibold py-4 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? transactions.map(t => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="py-4 px-6 text-sm text-textMuted font-medium">{new Date(t.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</td>
                    <td className="py-4 px-6 text-sm text-textPrimary font-semibold">{t.description}</td>
                    <td className="py-4 px-6"><CategoryBadge category={t.category} /></td>
                    <td className="py-4 px-6 text-right font-bold text-textPrimary">₹{t.amount.toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="text-center py-10 text-textMuted font-medium">No recent transactions to display</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 subtle-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 rounded-xl bg-accent/15 border border-accent/20 text-accent"><Sparkles size={20} /></div>
            <h2 className="text-lg font-bold gradient-text">FinSight Intelligence</h2>
          </div>
          
          <div className="space-y-4 relative z-10">
            {insights.length > 0 ? insights.slice(0,3).map((insight, i) => (
              <div key={i} className="p-4 rounded-2xl bg-sidebar/50 border border-white/10 hover:border-accent/40 transition-colors cursor-default">
                <div className="flex items-center gap-2 mb-2">
                  {insight.type === 'warning' && <AlertCircle size={16} className="text-warning" />}
                  {insight.type === 'positive' && <TrendingDown size={16} className="text-success" />}
                  {insight.type === 'neutral' && <TrendingUp size={16} className="text-textMuted" />}
                  <h3 className="text-[15px] font-bold text-textPrimary">{insight.title}</h3>
                </div>
                <p className="text-sm text-textMuted/90 leading-relaxed font-medium">{insight.detail}</p>
              </div>
            )) : (
              <div className="text-center py-12 flex flex-col items-center">
                <Sparkles size={28} className="text-accent/40 animate-pulse mb-3"/>
                <span className="text-textMuted/70 font-medium">Analyzing behavioral patterns...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
