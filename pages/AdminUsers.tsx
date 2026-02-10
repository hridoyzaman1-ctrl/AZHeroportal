import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { User, UserRole } from '../types';
import AdminLayout from '../components/AdminLayout';
import { useContent } from '../App';

const AdminUsers: React.FC = () => {
  const { currentUser } = useContent();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  // TABS: APPROVED (Default), PENDING, REJECTED
  const [activeTab, setActiveTab] = useState<'APPROVED' | 'PENDING' | 'REJECTED'>('APPROVED');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState('');

  const loadUsers = async () => {
    const data = await storageService.getUsers();
    setUsers(data);
  };
  useEffect(() => { loadUsers(); }, []);

  const handleUpdateRole = async (userId: string) => {
    if (!customRole.trim()) return;
    if (window.confirm(`Assign role "${customRole}" to this user?`)) {
      const updated = await storageService.approveUser(userId, customRole);
      setUsers(updated);
      setEditingUserId(null);
      setCustomRole('');
    }
  };

  const handleReject = async (userId: string) => {
    if (window.confirm('Rejecting user access. Confirm?')) {
      const updated = await storageService.rejectUser(userId);
      setUsers(updated);
    }
  };

  const handlePurge = async () => {
    const CONFIRM_PHRASE = "DELETE ALL EXCEPT ADMIN";
    const input = window.prompt(`⚠ WARNING: THIS WILL WIPE ALL USERS EXCEPT THE ADMIN.\nTo confirm, type: "${CONFIRM_PHRASE}"`);
    if (input === CONFIRM_PHRASE) {
      const updated = await storageService.resetUserDatabase('hridoyzaman1@gmail.com');
      setUsers(updated);
      alert("DATABASE PURGED.");
    }
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesTab = true;
      if (activeTab === 'APPROVED') {
        matchesTab = u.isApproved;
      } else if (activeTab === 'PENDING') {
        matchesTab = !u.isApproved && !u.isRejected;
      } else if (activeTab === 'REJECTED') {
        matchesTab = u.isRejected;
      }

      return matchesSearch && matchesTab;
    });
  }, [users, searchTerm, activeTab]);

  const pendingCount = users.filter(u => !u.isApproved && !u.isRejected).length;

  return (
    <AdminLayout title="ACCESS CONTROL" subtitle="Personnel Management">
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1a] h-full">
        {/* HEADER & FILTERS */}
        <div className="px-12 py-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            <button onClick={() => setActiveTab('APPROVED')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'APPROVED' ? 'bg-green-500 text-black' : 'text-gray-500 hover:text-white'}`}>Approved Personnel</button>
            <button onClick={() => setActiveTab('PENDING')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'PENDING' ? 'bg-yellow-500 text-black' : 'text-gray-500 hover:text-white'}`}>
              Pending Requests
              {pendingCount > 0 && <span className="absolute -top-1 -right-1 size-5 bg-primary-red text-white text-[8px] flex items-center justify-center rounded-full animate-bounce">{pendingCount}</span>}
            </button>
            <button onClick={() => setActiveTab('REJECTED')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'REJECTED' ? 'bg-primary-red text-white' : 'text-gray-500 hover:text-white'}`}>Rejected List</button>
          </div>

          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">person_search</span>
            <input type="text" placeholder="Locate signal..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:border-primary-blue outline-none" />
            <button onClick={loadUsers} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white pb-1"><span className="material-symbols-outlined text-sm">refresh</span></button>
          </div>

          <button onClick={handlePurge} className="px-4 py-3 bg-red-900/20 border border-primary-red/50 text-primary-red rounded-xl hover:bg-primary-red hover:text-white transition-all text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">delete_forever</span>
            PURGE DATABASE
          </button>
        </div>

        {/* USERS LIST */}
        <div className="p-12 overflow-y-auto no-scrollbar">
          <div className="bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                <tr>
                  <th className="px-10 py-6">Identity (Email)</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6">Clearance Level</th>
                  <th className="px-10 py-6 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <img src={user.avatar} className="size-16 rounded-3xl border border-white/10 shadow-lg object-cover" alt="" />
                        <div>
                          <p className="text-base font-black uppercase italic leading-none mb-1">{user.name}</p>
                          <p className="text-[10px] text-primary-blue font-bold tracking-widest">{user.email}</p>
                          {user.isVerified ? (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-bold uppercase rounded border border-green-500/20">Verified Email</span>
                          ) : (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[8px] font-bold uppercase rounded border border-yellow-500/20">Unverified Email</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {user.isRejected ? (
                        <span className="text-primary-red font-black text-[10px] uppercase tracking-widest">REJECTED</span>
                      ) : !user.isApproved ? (
                        <span className="text-yellow-500 font-black text-[10px] uppercase tracking-widest">PENDING</span>
                      ) : (
                        <span className="text-green-500 font-black text-[10px] uppercase tracking-widest">ACTIVE</span>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={customRole}
                            onChange={(e) => setCustomRole(e.target.value)}
                            placeholder="Type Role..."
                            className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:border-primary-blue outline-none w-32"
                          />
                          <button onClick={() => handleUpdateRole(user.id)} className="p-2 bg-green-500 text-black rounded-lg"><span className="material-symbols-outlined text-sm">check</span></button>
                          <button onClick={() => setEditingUserId(null)} className="p-2 bg-white/10 text-white rounded-lg"><span className="material-symbols-outlined text-sm">close</span></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'Admin' ? 'text-primary-red' : 'text-primary-blue'}`}>{user.role}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8 text-right">
                      {(() => {
                        const TARGET_IS_SUPER = user.email === 'hridoyzaman1@gmail.com';
                        const I_AM_SUPER = currentUser?.email === 'hridoyzaman1@gmail.com';

                        // Hide controls if target is Super Admin AND I am not him.
                        if (TARGET_IS_SUPER && !I_AM_SUPER) return null;

                        return (
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {editingUserId !== user.id && (
                              <button
                                onClick={() => { setEditingUserId(user.id); setCustomRole(user.role || 'Guest'); }}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                              >
                                Manage Role
                              </button>
                            )}

                            {!user.isRejected && (
                              <button onClick={() => handleReject(user.id)} className="p-2 bg-white/5 text-gray-500 hover:text-primary-red rounded-xl transition-all" title="Ban User">
                                <span className="material-symbols-outlined text-sm">block</span>
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center text-gray-700 italic uppercase tracking-[0.4em] text-xs">No signals found matching criteria</td>
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
