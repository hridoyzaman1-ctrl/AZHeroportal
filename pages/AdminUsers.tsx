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
        <div className="px-4 md:px-12 py-6 md:py-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('APPROVED')} className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'APPROVED' ? 'bg-green-500 text-black' : 'text-gray-500 hover:text-white'}`}>Approved</button>
            <button onClick={() => setActiveTab('PENDING')} className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'PENDING' ? 'bg-yellow-500 text-black' : 'text-gray-500 hover:text-white'}`}>
              Pending
              {pendingCount > 0 && <span className="absolute -top-1 -right-1 size-4 bg-primary-red text-white text-[7px] flex items-center justify-center rounded-full animate-bounce">{pendingCount}</span>}
            </button>
            <button onClick={() => setActiveTab('REJECTED')} className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'REJECTED' ? 'bg-primary-red text-white' : 'text-gray-500 hover:text-white'}`}>Rejected</button>
          </div>

          <div className="flex w-full md:w-auto gap-4 items-center">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">person_search</span>
              <input type="text" placeholder="Locate signal..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:border-primary-blue outline-none" />
              <button onClick={loadUsers} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white pb-1"><span className="material-symbols-outlined text-sm">refresh</span></button>
            </div>

            <button onClick={handlePurge} className="p-3 bg-red-900/20 border border-primary-red/50 text-primary-red rounded-xl hover:bg-primary-red hover:text-white transition-all text-[8px] font-black uppercase tracking-widest flex items-center gap-2" title="PURGE DATABASE">
              <span className="material-symbols-outlined text-sm">delete_forever</span>
              <span className="hidden sm:inline">PURGE</span>
            </button>
          </div>
        </div>

        {/* USERS LIST */}
        <div className="p-4 md:p-12 overflow-y-auto no-scrollbar">
          {/* Desktop Table */}
          <div className="hidden md:block bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 pb-20">
            {filtered.map(user => {
              const TARGET_IS_SUPER = user.email === 'hridoyzaman1@gmail.com';
              const I_AM_SUPER = currentUser?.email === 'hridoyzaman1@gmail.com';
              const hideControls = TARGET_IS_SUPER && !I_AM_SUPER;

              return (
                <div key={user.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                  <div className="flex gap-4">
                    <img src={user.avatar} className="size-16 rounded-2xl border border-white/10 object-cover shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-black uppercase italic text-white truncate">{user.name}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${user.isRejected ? 'text-primary-red' : !user.isApproved ? 'text-yellow-500' : 'text-green-500'}`}>
                          {user.isRejected ? 'Rejected' : !user.isApproved ? 'Pending' : 'Active'}
                        </span>
                      </div>
                      <p className="text-[10px] text-primary-blue font-bold tracking-widest truncate">{user.email}</p>
                      <span className={`text-[8px] font-bold uppercase ${user.role === 'Admin' ? 'text-primary-red' : 'text-primary-blue'}`}>{user.role} Clearances</span>
                    </div>
                  </div>

                  {!hideControls && (
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      {editingUserId === user.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={customRole}
                            onChange={(e) => setCustomRole(e.target.value)}
                            placeholder="Role..."
                            className="flex-1 bg-black/50 border border-white/20 rounded-xl px-3 text-xs text-white focus:border-primary-blue outline-none"
                          />
                          <button onClick={() => handleUpdateRole(user.id)} className="p-3 bg-green-500 text-black rounded-xl"><span className="material-symbols-outlined text-sm">check</span></button>
                          <button onClick={() => setEditingUserId(null)} className="p-3 bg-white/10 text-white rounded-xl"><span className="material-symbols-outlined text-sm">close</span></button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => { setEditingUserId(user.id); setCustomRole(user.role || 'Guest'); }} className="flex-1 py-3 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Manage Role</button>
                          {!user.isRejected && (
                            <button onClick={() => handleReject(user.id)} className="px-4 bg-white/5 text-gray-500 hover:text-primary-red rounded-xl transition-all">
                              <span className="material-symbols-outlined text-sm">block</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-20 text-center opacity-20">
                <span className="material-symbols-outlined text-5xl mb-4">person_off</span>
                <p className="text-xs font-black uppercase tracking-widest">No Personnel Found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
