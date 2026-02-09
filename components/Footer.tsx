
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../App';
import { storageService } from '../services/storage';

const Footer: React.FC = () => {
  const { settings } = useContent();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { 
      storageService.addSubscriber(email);
      setSubscribed(true); 
      setEmail(''); 
    }
  };

  return (
    <footer className="bg-background-black border-t border-white/5 pt-20 pb-24 md:pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          <div className="lg:col-span-4">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white uppercase flex items-center gap-3 italic mb-8 group">
              <span className="text-primary-red material-symbols-outlined text-4xl group-hover:rotate-12 transition-transform">bolt</span> 
              <span>HERO <span className="text-primary-red">PORTAL</span></span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">{settings.address}</p>
            <div className="flex gap-4">
              {settings.socialLinks.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-primary-red hover:text-white transition-all" title={link.platform}>
                  <span className="material-symbols-outlined text-sm">{link.icon || 'link'}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-10">
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-8">Intelligence</h4>
              <ul className="space-y-4">
                <li><Link to="/category/Movies" className="text-gray-500 text-sm hover:text-primary-blue transition-colors font-medium">Movies</Link></li>
                <li><Link to="/trailers" className="text-gray-500 text-sm hover:text-primary-blue transition-colors font-medium">Trailers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-8">Operational</h4>
              <ul className="space-y-4">
                <li><Link to="/admin" className="text-gray-500 text-sm hover:text-primary-red transition-colors font-medium">Admin HQ</Link></li>
                <li><Link to="/rankings" className="text-gray-500 text-sm hover:text-primary-blue transition-colors font-medium">Top 10</Link></li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="p-8 bg-surface-dark border border-white/5 rounded-[2.5rem]">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-4">Newsletter</h4>
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white outline-none focus:border-primary-red" />
                  <button type="submit" className="w-full py-4 bg-primary-red text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-red/20">Connect</button>
                </form>
              ) : (
                <p className="text-primary-blue font-black uppercase text-xs tracking-widest text-center">Uplink Established</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
