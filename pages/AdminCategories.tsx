import * as React from 'react';
import { useState } from 'react';
import { useContent } from '../App';
import AdminLayout from '../components/AdminLayout';

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
    <AdminLayout title="GRID SECTORS" subtitle="Category Matrix Matrix">
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1a] h-full">

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
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
