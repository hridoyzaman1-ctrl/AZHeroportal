import * as React from 'react';
import { useState } from 'react';
import { useContent } from '../App';
import AdminLayout from '../components/AdminLayout';

import { storageService } from '../services/storage';

const AdminCategories: React.FC = () => {
  const { categories, addCategory, deleteCategory, refreshItems } = useContent();
  const [newCat, setNewCat] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCat.trim()) {
      await addCategory(newCat.trim());
      setNewCat('');
    }
  };

  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];

    await storageService.saveCategories(newCategories);
    refreshItems();
  };

  return (
    <AdminLayout title="GRID SECTORS" subtitle="Category Matrix">
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1a] h-full">

        <div className="p-4 md:p-12 space-y-8 md:space-y-12 overflow-y-auto no-scrollbar">
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
              {categories.map((cat, idx) => {
                const isProtected = ['Movies', 'Games', 'Comics', 'DC', 'Marvel'].includes(cat);
                return (
                  <div key={cat} className="flex justify-between items-center p-4 md:p-6 bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl group transition-all hover:bg-white/10">
                    <span className="text-xs md:text-sm font-black uppercase tracking-widest flex items-center gap-3 md:gap-4">
                      <span className="text-gray-600 text-[8px] md:text-[10px]">{idx + 1}</span>
                      {cat}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Reorder Controls */}
                      <div className="flex flex-col gap-1 mr-4">
                        <button
                          onClick={() => moveCategory(idx, 'up')}
                          disabled={idx === 0}
                          className={`p-1 rounded hover:bg-white/10 ${idx === 0 ? 'text-gray-700' : 'text-gray-400 hover:text-primary-blue'}`}
                        >
                          <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                        </button>
                        <button
                          onClick={() => moveCategory(idx, 'down')}
                          disabled={idx === categories.length - 1}
                          className={`p-1 rounded hover:bg-white/10 ${idx === categories.length - 1 ? 'text-gray-700' : 'text-gray-400 hover:text-primary-blue'}`}
                        >
                          <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                        </button>
                      </div>

                      {isProtected ? (
                        <span className="text-gray-600 opacity-30 select-none pb-1" title="Protected System Sector">
                          <span className="material-symbols-outlined text-sm">lock</span>
                        </span>
                      ) : (
                        <button onClick={() => deleteCategory(cat)} className="text-gray-600 hover:text-primary-red transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 p-2">
                          <span className="material-symbols-outlined text-sm md:text-base">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
