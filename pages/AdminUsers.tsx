import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { User, UserRole } from '../types';
import AdminLayout from '../components/AdminLayout';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PENDING'>('ACTIVE');

  const loadUsers = async () => {
    const data = await storageService.getUsers();
    setUsers(data);
  };
  useEffect(() => { loadUsers(); }, []);

  const handleApprove = async (userId: string, role: UserRole) => {
    if (window.confirm(`Approving user as ${role}. Confirm?`)) {
      const updated = await storageService.approveUser(userId, role);
      setUsers(updated);
    }
  };

  const handleReject = async (userId: string) => {
    if (window.confirm('Rejecting user access. Confirm?')) {
      const updated = await storageService.rejectUser(userId);
      setUsers(updated);
    }
  };

  const handleRevoke = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.email === 'hridoyzaman1@gmail.com') {
      alert('Cannot revoke Super Admin access.');
      return;
    }

    if (window.confirm('Revoking user access. Confirm?')) {
      const updated = await storageService.revokeUser(userId);
      setUsers(updated);
    }
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'ACTIVE' ? (u.isApproved && !u.isRejected) : (!u.isApproved && !u.isRejected && u.isVerified);
      return matchesSearch && matchesTab;
    });
  }, [users, searchTerm, activeTab]);

  const pendingCount = users.filter(u => !u.isApproved && !u.isRejected && u.isVerified).length;

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1a] h-full">
        <header className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-[#0a0f1a]/80 backdrop-blur-xl">
          <div>
            <span className="text-primary-blue text-[10px] font-black uppercase tracking-[0.4em] mb-1 block">Security Clearance</span>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">ACCESS <span className="text-primary-blue">COMMAND</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button onClick={() => setActiveTab('ACTIVE')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ACTIVE' ? 'bg-primary-blue text-black' : 'text-gray-500 hover:text-white'}`}>Active</button>
              <button onClick={() => setActiveTab('PENDING')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'PENDING' ? 'bg-yellow-500 text-black' : 'text-gray-500 hover:text-white'}`}>
                Requests
                {pendingCount > 0 && <span className="absolute -top-1 -right-1 size-5 bg-primary-red text-white text-[8px] flex items-center justify-center rounded-full animate-bounce">{pendingCount}</span>}
              </button>
            </div>
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">person_search</span>
              <input type="text" placeholder="Locate signal..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:border-primary-blue outline-none" />
            </div>
          </div>
        </header>

        <div className="p-12 overflow-y-auto no-scrollbar">
          <div className="bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                <tr>
                  <th className="px-10 py-6">Identity (Email)</th>
                  <th className="px-10 py-6">Bio Coordinates</th>
                  <th className="px-10 py-6">Security Phase</th>
                  <th className="px-10 py-6 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <img src={user.avatar} className="size-16 rounded-3xl border border-white/10 shadow-lg" alt="" />
                        <div>
                          <p className="text-base font-black uppercase italic leading-none mb-1">{user.name}</p>
                          <p className="text-[10px] text-primary-blue font-bold tracking-widest">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2"><span className="material-symbols-outlined text-xs">phone</span> {user.mobile || 'N/A'}</p>
                        <p className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 truncate max-w-[200px]"><span className="material-symbols-outlined text-xs">location_on</span> {user.address || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {activeTab === 'ACTIVE' ? (
                        <div className="flex items-center gap-3">
                          <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-green-500">{user.role} Clearance</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="size-2 rounded-full bg-yellow-500 animate-pulse"></span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Identity Verified</span>
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeTab === 'PENDING' ? (
                          <>
                            <button onClick={() => handleApprove(user.id, 'Author')} className="px-4 py-2 bg-primary-blue text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">Grant Author</button>
                            <button onClick={() => handleApprove(user.id, 'Admin')} className="px-4 py-2 bg-primary-red text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">Grant Admin</button>
                            <button onClick={() => handleReject(user.id)} className="p-3 bg-white/5 text-gray-500 hover:text-primary-red rounded-xl transition-all"><span className="material-symbols-outlined text-sm">block</span></button>
                          </>
                        ) : (
                          user.email !== 'hridoyzaman1@gmail.com' && (
                            <button onClick={() => handleRevoke(user.id)} className="px-4 py-2 bg-white/5 text-gray-500 hover:text-primary-red border border-white/5 hover:border-primary-red/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Revoke Access</button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center text-gray-700 italic uppercase tracking-[0.4em] text-xs">No personnel signals detected in this quadrant</td>
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

export default AdminUsers;
