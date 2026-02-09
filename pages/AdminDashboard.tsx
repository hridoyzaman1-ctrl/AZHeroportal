
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useContent } from '../App';

const AdminDashboard: React.FC = () => {
  const { logout, currentUser, vaultItems } = useContent();

  const stats = useMemo(() => {
    return {
      totalSignals: vaultItems.length,
      totalViews: vaultItems.reduce((acc, i) => acc + (i.views || 0), 0),
      totalEngagements: vaultItems.reduce((acc, i) => acc + (i.likes || 0) + (i.comments?.length || 0), 0),
      avgRating: vaultItems.reduce((acc, i) => {
        const ratings = i.userRatings || [];
        return acc + (ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0);
      }, 0) / (vaultItems.length || 1)
    };
  }, [vaultItems]);

  const chartData = [
    { name: 'Mon', views: 4000, eng: 2400 }, 
    { name: 'Tue', views: 3000, eng: 1398 }, 
    { name: 'Wed', views: 2000, eng: 9800 }, 
    { name: 'Thu', views: 2780, eng: 3908 }, 
    { name: 'Fri', views: 1890, eng: 4800 }, 
    { name: 'Sat', views: 2390, eng: 3800 }, 
    { name: 'Sun', views: 3490, eng: 4300 }
  ];

  const categoryCounts = vaultItems.reduce((acc: any, item) => {
    item.categories.forEach(cat => {
      acc[cat] = (acc[cat] || 0) + 1;
    });
    return acc;
  }, {});

  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#00f2ff', '#f20d0d', '#22c55e', '#a855f7', '#eab308', '#f97316'];

  const NavItem = ({ to, icon, label }: { to: string, icon: string, label: string }) => (
    <Link to={to} className={`flex items-center gap-5 p-5 rounded-2xl transition-all ${window.location.hash.includes(to) ? 'bg-primary-blue/10 text-primary-blue border border-primary-blue/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-bold text-[11px] uppercase tracking-widest">{label}</span>
    </Link>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <aside className="w-72 bg-[#0c0c0c] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-10 border-b border-white/5">
          <Link to="/" className="text-2xl font-black italic tracking-tighter text-primary-red flex items-center gap-3">
             <span className="material-symbols-outlined text-3xl">bolt</span> COMMAND
          </Link>
        </div>
        <nav className="flex-1 p-8 space-y-4">
          <NavItem to="/admin" icon="grid_view" label="Dashboard" />
          <NavItem to="/admin/content" icon="inventory_2" label="Vault Content" />
          <NavItem to="/admin/categories" icon="category" label="Sectors" />
          <NavItem to="/admin/comments" icon="forum" label="Moderation" />
          <NavItem to="/admin/users" icon="group" label="User Access" />
        </nav>
        <div className="p-8 space-y-4">
          <button onClick={logout} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-primary-red transition-all text-[10px] font-black uppercase flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">logout</span> Logout Ops
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#0a0f1a] no-scrollbar">
        <header className="sticky top-0 z-40 flex items-center justify-between px-12 py-10 bg-[#0a0f1a]/95 backdrop-blur-xl border-b border-white/5">
           <div>
             <span className="text-primary-blue text-[10px] font-black uppercase tracking-[0.4em] mb-1 block">Neural Grid Analytics</span>
             <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">COMMAND <span className="text-primary-blue glow-blue">HQ</span></h1>
           </div>
           <div className="flex items-center gap-6">
             <div className="text-right hidden sm:block">
               <p className="text-xs font-black uppercase">{currentUser?.name}</p>
               <p className="text-[10px] text-primary-blue uppercase font-black">{currentUser?.role} Clearance</p>
             </div>
             <img src={currentUser?.avatar} className="size-12 rounded-2xl border border-white/10 shadow-xl" alt="" />
           </div>
        </header>

        <div className="p-12 space-y-12">
          {/* STATS GRID */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { l: 'Vault Signals', v: stats.totalSignals, i: 'rss_feed', c: 'text-primary-blue' },
              { l: 'Total Views', v: stats.totalViews.toLocaleString(), i: 'visibility', c: 'text-green-500' },
              { l: 'Engagements', v: stats.totalEngagements, i: 'bolt', c: 'text-primary-red' },
              { l: 'Avg Rating', v: stats.avgRating.toFixed(1), i: 'star', c: 'text-yellow-500' }
            ].map((s, i) => (
              <div key={i} className="p-10 bg-white/5 border border-white/10 rounded-[3rem] group hover:bg-white/10 transition-all shadow-2xl">
                <span className={`material-symbols-outlined text-3xl ${s.c} mb-6 block`}>{s.i}</span>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{s.l}</p>
                <p className="text-4xl font-black italic tracking-tighter">{s.v}</p>
              </div>
            ))}
          </section>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 p-12 bg-white/5 border border-white/10 rounded-[4rem] shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500 mb-12">Engagement Matrix</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/></linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#444', fontSize: 10}} />
                    <Tooltip contentStyle={{background: '#000', border: '1px solid #333', borderRadius: '20px'}} />
                    <Area type="monotone" dataKey="views" stroke="#00f2ff" fillOpacity={1} fill="url(#gBlue)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 p-12 bg-white/5 border border-white/10 rounded-[4rem] shadow-2xl flex flex-col items-center">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-10">Sector Volume</h3>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{background: '#000', border: 'none'}} />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-4 w-full mt-6">
                 {pieData.map((d, i) => (
                   <div key={i} className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{d.name}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
