
import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../App';
import { SocialLink } from '../types';

const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useContent();
  const [address, setAddress] = useState(settings.address);
  const [email, setEmail] = useState(settings.contactEmail);
  const [links, setLinks] = useState<SocialLink[]>(settings.socialLinks);
  const [newLink, setNewLink] = useState({ platform: '', url: '' });

  const handleSave = async () => {
    await updateSettings({ address, contactEmail: email, socialLinks: links });
    alert("System settings committed to grid.");
  };

  const addLink = () => {
    if (newLink.platform && newLink.url) {
      setLinks([...links, { id: Date.now().toString(), platform: newLink.platform, url: newLink.url, icon: 'link' }]);
      setNewLink({ platform: '', url: '' });
    }
  };

  const removeLink = (id: string) => setLinks(links.filter(l => l.id !== id));

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <aside className="w-72 bg-[#0c0c0c] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-10 border-b border-white/5">
          <Link to="/" className="text-2xl font-black italic tracking-tighter text-primary-red flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">bolt</span> COMMAND
          </Link>
        </div>
        <nav className="flex-1 p-8 space-y-4">
          <Link to="/admin" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5"><span className="material-symbols-outlined">grid_view</span><span className="font-bold text-[11px] uppercase tracking-widest">Dashboard</span></Link>
          <Link to="/admin/content" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5"><span className="material-symbols-outlined">inventory_2</span><span className="font-bold text-[11px] uppercase tracking-widest">Vault</span></Link>
          <Link to="/admin/settings" className="flex items-center gap-5 p-5 rounded-2xl bg-primary-blue/10 text-primary-blue border border-primary-blue/20"><span className="material-symbols-outlined">settings</span><span className="font-bold text-[11px] uppercase tracking-widest">Settings</span></Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col bg-[#0a0f1a] overflow-hidden">
        <header className="px-12 py-10 border-b border-white/5">
          <span className="text-primary-blue text-[10px] font-black uppercase tracking-[0.4em] mb-1 block">Global Config</span>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">PORTAL <span className="text-primary-blue">SETTINGS</span></h1>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar max-w-4xl mx-auto w-full">
          <section className="space-y-8 bg-white/5 p-10 rounded-[3rem] border border-white/10">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Neural Address</h2>
              <button onClick={async () => {
                if (confirm('Deploy initial seeds to the grid? This will populate the vault if empty.')) {
                  await updateSettings({ ...settings }); // Trigger refresh
                  // We need to access storageService directly here or via a new context method
                  // Since context doesn't expose seed, we can import it directly or add it to context.
                  // For now, let's just use the updateSettings as a trigger if we modify context, 
                  // but actually we should import storageService here for this admin action.
                  const { storageService } = await import('../services/storage');
                  await storageService.seedVault();
                  alert('Grid seeding complete.');
                  window.location.reload();
                }
              }} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white rounded-xl transition-all">
                Initialize Seed Data
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Physical HQ Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-primary-blue" />
              <input type="email" placeholder="Operational Contact Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-primary-blue" />
            </div>
          </section>

          <section className="space-y-8 bg-white/5 p-10 rounded-[3rem] border border-white/10">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Social Uplinks</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <input type="text" placeholder="Platform (e.g. X)" value={newLink.platform} onChange={e => setNewLink({ ...newLink, platform: e.target.value })} className="bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none" />
              <input type="text" placeholder="Uplink URL" value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} className="bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none" />
              <button onClick={addLink} className="col-span-2 py-4 bg-primary-blue text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary-blue/20">Inject Uplink</button>
            </div>
            <div className="space-y-3">
              {links.map(l => (
                <div key={l.id} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5 group">
                  <div>
                    <span className="text-primary-blue font-black uppercase text-[10px] tracking-widest">{l.platform}</span>
                    <p className="text-[10px] text-gray-600 truncate max-w-md">{l.url}</p>
                  </div>
                  <button onClick={() => removeLink(l.id)} className="text-primary-red material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">delete</button>
                </div>
              ))}
            </div>
          </section>

          <button onClick={handleSave} className="w-full py-6 bg-white text-black font-black text-[12px] uppercase tracking-[0.5em] rounded-3xl shadow-2xl hover:bg-primary-red hover:text-white transition-all">Commit All Changes</button>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
