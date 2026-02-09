
import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../App';

const AdminCategories: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useContent();
  const [newCat, setNewCat] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCat.trim()) {
      await addCategory(newCat.trim());
      setNewCat('');
    }
  };

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
          <Link to="/admin/categories" className="flex items-center gap-5 p-5 rounded-2xl bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
            <span className="material-symbols-outlined">category</span>
            <span className="font-bold text-[11px] uppercase tracking-widest">Categories</span>
          </Link>
          <Link to="/admin/comments" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5">
            <span className="material-symbols-outlined">forum</span>
            <span className="font-bold text-[11px] uppercase tracking-widest">Moderation</span>
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
            <span className="text-primary-blue text-[10px] font-black uppercase tracking-[0.4em] mb-1 block">Sector Definition</span>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">CATEGORY <span className="text-primary-blue">MATRIX</span></h1>
          </div>
        </header>

        <div className="p-12 space-y-12 overflow-y-auto no-scrollbar">
          <div className="max-w-xl mx-auto space-y-10">
            <form onSubmit={handleAdd} className="flex gap-4">
              <input
                type="text"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                placeholder="New Sector ID..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-primary-blue"
              />
              <button type="submit" className="px-8 py-4 bg-primary-blue text-black rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                Define
              </button>
            </form>

            <div className="grid grid-cols-1 gap-4">
              {categories.map(cat => (
                <div key={cat} className="flex justify-between items-center p-6 bg-white/5 border border-white/5 rounded-3xl group">
                  <span className="text-sm font-black uppercase tracking-widest">{cat}</span>
                  <button onClick={() => deleteCategory(cat)} className="text-gray-600 hover:text-primary-red transition-colors opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCategories;
