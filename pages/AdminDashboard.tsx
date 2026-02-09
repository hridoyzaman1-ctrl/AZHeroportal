import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useContent } from '../App';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard: React.FC = () => {
  const { currentUser, vaultItems } = useContent();

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

  return (
    <AdminLayout title="COMMAND HQ" subtitle="Neural Grid Analytics">
      <div className="flex-1 p-12 space-y-12">
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
                    <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3} /><stop offset="95%" stopColor="#00f2ff" stopOpacity={0} /></linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#000', border: '1px solid #333', borderRadius: '20px' }} />
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
                  <Tooltip contentStyle={{ background: '#000', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
