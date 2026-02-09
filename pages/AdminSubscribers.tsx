
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Subscriber } from '../types';

const AdminSubscribers: React.FC = () => {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSubs = () => setSubs(storageService.getSubscribers());
  useEffect(() => { loadSubs(); }, []);

  const handleDelete = (id: string) => {
    if (window.confirm("Sever this subscriber's link permanently?")) {
      setSubs(storageService.deleteSubscriber(id));
    }
  };

  const filtered = subs.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <aside className="w-72 bg-[#0c0c0c] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-10 border-b border-white/5">
          <Link to="/" className="text-2xl font-black italic tracking-tighter text-primary-red flex items-center gap-3">
             <span className="material-symbols-outlined text-3xl">bolt</span> COMMAND
          </Link>
        </div>
        <nav className="flex-1 p-8 space-y-4">
          <Link to="/admin" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="font-bold text-[11px] uppercase tracking-widest">Dashboard</span>
          </Link>
          <Link to="/admin/content" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-bold text-[11px] uppercase tracking-widest">Vault Content</span>
          </Link>
          <Link to="/admin/comments" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5">
            <span className="material-symbols-outlined">forum</span>
            <span className="font-bold text-[11px] uppercase tracking-widest">Moderation</span>
          </Link>
          <Link to="/admin/subscribers" className="flex items-center gap-5 p-5 rounded-2xl bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
            <span className="material-symbols-outlined">mail</span>
            <span className="font-bold text-[11px] uppercase tracking-widest">Subscribers</span>
          </Link>
          <Link to="/admin/users" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5">
            <span className="material-symbols-outlined">group</span>
            <span className="font-bold text-[11px] uppercase tracking-widest">User Access</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0f1a]">
        <header className="px-12 py-10 border-b border-white/5 flex justify-between items-center">
          <div>
            <span className="text-primary-blue text-[10px] font-black uppercase tracking-[0.4em] mb-1 block">Newsletter Nodes</span>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">SIGNAL <span className="text-primary-blue">SUBSCRIBERS</span></h1>
          </div>
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">search</span>
            <input 
              type="text" 
              placeholder="Search subscribers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:border-primary-blue outline-none transition-all"
            />
          </div>
        </header>

        <div className="p-12 overflow-y-auto no-scrollbar">
          <div className="bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                <tr>
                  <th className="px-10 py-6">Identity (Email)</th>
                  <th className="px-10 py-6">Linked Date</th>
                  <th className="px-10 py-6 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(sub => (
                  <tr key={sub.id} className="hover:bg-white/5 transition-all">
                    <td className="px-10 py-8">
                       <p className="text-base font-black text-white">{sub.email}</p>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{sub.date}</span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        className="p-3 bg-white/5 text-gray-500 hover:text-primary-red hover:bg-primary-red/10 rounded-xl transition-all"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-10 py-20 text-center text-gray-600 italic uppercase tracking-widest text-xs">No subscribers found in grid</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSubscribers;
