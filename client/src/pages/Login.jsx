import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/20 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      <div className="w-full max-w-[420px] glass-card rounded-[2rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] subtle-glow relative z-10">
        <div className="flex items-center justify-center gap-3 mb-10 text-accent">
          <div className="bg-accent/10 p-2.5 rounded-2xl border border-accent/20 shadow-[0_0_20px_rgba(108,99,255,0.4)]">
            <Zap size={28} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-wide">FinSight</h1>
        </div>
        
        <h2 className="text-2xl font-bold mb-8 text-center text-textPrimary tracking-tight">Welcome Back</h2>
        
        {error && <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl mb-6 text-sm font-semibold text-center shadow-inner">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-textMuted mb-2">Email Identity</label>
            <input 
              type="email" 
              required
              className="w-full bg-sidebar/50 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3.5 text-[15px] font-medium text-textPrimary focus:bg-sidebar outline-none focus:border-accent hover:border-white/20 transition-all shadow-inner"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-textMuted mb-2">Security Hash</label>
            <input 
              type="password" 
              required
              className="w-full bg-sidebar/50 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3.5 text-[15px] font-medium text-textPrimary focus:bg-sidebar outline-none focus:border-accent hover:border-white/20 transition-all shadow-inner"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full mt-2 gradient-accent hover:brightness-110 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(108,99,255,0.4)] tracking-wide">
            Authenticate Identity
          </button>
        </form>
        
        <p className="mt-8 text-center text-[15px] font-medium text-textMuted">
          New to FinSight? <Link to="/register" className="text-accent hover:text-accent-light hover:underline underline-offset-4">Provision Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
