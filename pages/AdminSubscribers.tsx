import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Subscriber } from '../types';
import AdminLayout from '../components/AdminLayout';

const AdminSubscribers: React.FC = () => {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSubs = async () => setSubs(await storageService.getSubscribers());
  useEffect(() => { loadSubs(); }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Sever this subscriber's link permanently?")) {
      const updated = await storageService.deleteSubscriber(id);
      setSubs(updated);
    }
  };

  const filtered = subs.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AdminLayout title="SIGNAL SUBSCRIBERS" subtitle="Newsletter Nodes">
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1a] h-full">
        <div className="px-12 py-10 border-b border-white/5 flex justify-end">
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
        </div>

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
      </div>
    </AdminLayout>
  );
};

export default AdminSubscribers;
