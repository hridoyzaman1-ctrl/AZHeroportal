
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useContent } from '../App';
import { SocialLink, SiteSettings } from '../types';
import AdminLayout from '../components/AdminLayout';

const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useContent();
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);

  useEffect(() => {
    // Ensure all platforms exist even if not in DB
    const startSettings = { ...settings };
    const defaultLinks: SocialLink[] = [
      { id: 'fb', platform: 'Facebook', url: '', icon: 'facebook', visible: false },
      { id: 'wa', platform: 'WhatsApp', url: '', icon: 'chat', visible: false },
      { id: 'yt', platform: 'YouTube', url: '', icon: 'play_circle', visible: false },
      { id: 'x', platform: 'X', url: '', icon: 'brand_family', visible: false },
      { id: 'tk', platform: 'TikTok', url: '', icon: 'music_note', visible: false },
      { id: 'ig', platform: 'Instagram', url: '', icon: 'camera_alt', visible: false },
      { id: 'dc', platform: 'Discord', url: '', icon: 'discord', visible: false } // Added requested platforms
    ];

    // Merge existing with defaults to ensure no data loss but all fields present
    const mergedLinks = defaultLinks.map(def => {
      const existing = startSettings.socialLinks.find(l => l.platform === def.platform);
      return existing || def;
    });

    setLocalSettings({ ...startSettings, socialLinks: mergedLinks });
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(localSettings);
    alert("System settings committed to grid.");
  };

  const updateSocialUrl = (id: string, url: string) => {
    setLocalSettings(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(l => l.id === id ? { ...l, url } : l)
    }));
  };

  const toggleSocialVisible = (id: string) => {
    setLocalSettings(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(l => l.id === id ? { ...l, visible: !l.visible } : l)
    }));
  };

  const platforms: ('Facebook' | 'WhatsApp' | 'YouTube' | 'X' | 'TikTok')[] = ['Facebook', 'WhatsApp', 'YouTube', 'X', 'TikTok'];

  return (
    <AdminLayout title="SYSTEM REGISTRY" subtitle="Core Protocol Management">
      <div className="flex-1 p-4 md:p-12 space-y-6 md:space-y-12 overflow-y-auto no-scrollbar">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-10">

          {/* Neural Address & Contact */}
          <section className="bg-white/5 border border-white/5 rounded-3xl md:rounded-[3rem] p-6 md:p-12 space-y-8 md:space-y-12 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Identity & Location</h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Show Address</span>
                <button
                  onClick={() => setLocalSettings(prev => ({ ...prev, showAddress: !prev.showAddress }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${localSettings.showAddress ? 'bg-primary-blue' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 size-4 rounded-full bg-white transition-all ${localSettings.showAddress ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-4">HQ Address</label>
                <input type="text" placeholder="Physical HQ Address" value={localSettings.address} onChange={e => setLocalSettings({ ...localSettings, address: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-primary-blue transition-all focus:bg-black/40" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-4">Contact Gateway</label>
                <input type="email" placeholder="Operational Contact Email" value={localSettings.contactEmail} onChange={e => setLocalSettings({ ...localSettings, contactEmail: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-primary-blue transition-all focus:bg-black/40" />
              </div>
            </div>
          </section>

          {/* Social Uplinks Toggles & Editing */}
          <section className="space-y-8 bg-white/5 p-10 rounded-[3rem] border border-white/10">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Social Uplinks</h2>
            <div className="space-y-6">
              {localSettings.socialLinks.map(link => (
                <div key={link.id} className={`p-6 rounded-[2rem] border transition-all ${link.visible ? 'bg-white/5 border-primary-blue/30' : 'bg-black/40 border-white/5 opacity-60'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary-blue">{link.icon}</span>
                      <span className="text-xs font-black uppercase tracking-widest text-white">{link.platform}</span>
                    </div>
                    <button
                      onClick={() => toggleSocialVisible(link.id)}
                      className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${link.visible ? 'bg-primary-blue text-black' : 'bg-white/10 text-gray-500'}`}
                    >
                      {link.visible ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder={`${link.platform} URL`}
                    value={link.url}
                    onChange={e => updateSocialUrl(link.id, e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-[11px] font-bold text-white outline-none focus:border-primary-blue/50 transition-all focus:bg-black/40"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Copyright Management */}
          <section className="space-y-8 bg-white/5 p-10 rounded-[3rem] border border-white/10">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Chronos Management</h2>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-4">Copyright Year</label>
              <input type="text" placeholder="2026" value={localSettings.copyrightYear} onChange={e => setLocalSettings({ ...localSettings, copyrightYear: e.target.value })} className="w-1/3 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-primary-blue transition-all focus:bg-black/40" />
            </div>
          </section>

          <button onClick={handleSave} className="w-full py-6 bg-white text-black font-black text-[12px] uppercase tracking-[0.5em] rounded-3xl shadow-2xl hover:bg-primary-red hover:text-white transition-all mb-20 group">
            <span className="group-hover:animate-pulse">Commit Final Settings</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
