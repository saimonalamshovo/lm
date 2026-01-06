
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target as TargetIcon,
  Crown,
  Flame,
  X,
  PieChart,
  ChevronRight,
  PhoneCall,
  Globe,
  Trophy,
  Frown,
  Coins,
  Rocket,
  Plus,
  BarChart4,
  ArrowRightCircle,
  Sparkles,
  Zap,
  Activity,
  History,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { Sale } from '../types';

interface DashboardViewProps {
  stats: any;
  monthlyTarget: number;
  onTargetChange: (val: number) => void;
  theme: 'dark' | 'light';
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  sales: Sale[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ stats, monthlyTarget, onTargetChange, theme, setSales, sales }) => {
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showQuickWebModal, setShowQuickWebModal] = useState(false);
  const [tempTarget, setTempTarget] = useState(monthlyTarget.toString());
  const [webAmount, setWebAmount] = useState('');
  const [webDate, setWebDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setTempTarget(monthlyTarget.toString());
  }, [monthlyTarget]);

  const progressPercent = monthlyTarget > 0 ? Math.min(100, ((stats.totalRevenue || 0) / monthlyTarget * 100)) : 0;
  
  const handleSaveTarget = () => {
    const num = parseInt(tempTarget.replace(/[^0-9]/g, ''));
    if (!isNaN(num)) {
      onTargetChange(num);
      setShowTargetModal(false);
    }
  };

  const handleQuickWebSale = () => {
    const amount = parseInt(webAmount);
    if (!isNaN(amount) && amount > 0) {
      const newSale: Sale = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'website',
        amount,
        adCost: 0,
        createdAt: webDate + "T12:00:00Z"
      };
      setSales([newSale, ...sales]);
      setWebAmount('');
      setShowQuickWebModal(false);
    }
  };

  const formatNum = (num: number) => (num || 0).toLocaleString();

  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const labelColor = theme === 'dark' ? 'text-slate-500' : 'text-gray-400';

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      {/* TARGET TRACKER SECTION */}
      <section className={`${cardBg} border-2 border-red-600/20 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden`}>
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <TargetIcon className="w-80 h-80 text-red-600" />
         </div>
         <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-12">
            <div className="flex-1 space-y-8">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center shadow-lg shadow-red-900/40">
                     <TargetIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                     <h2 className={`text-3xl font-black ${textColor} uppercase tracking-tight`}>Monthly Projection</h2>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Revenue & Growth Mission</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Distance to Target</p>
                     <p className="text-5xl font-black text-red-600 tabular-nums tracking-tighter">৳{formatNum(stats.targetLeft)}</p>
                     <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">REMAINING GAP</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Daily Quota Required</p>
                     <p className="text-5xl font-black text-yellow-500 tabular-nums tracking-tighter">৳{formatNum(Math.round(stats.dailyRequired))}</p>
                     <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">FOR {stats.remainingDays} MORE DAYS</p>
                  </div>
                  <div className="bg-slate-800/20 p-6 rounded-3xl border border-slate-700/30 flex flex-col justify-center">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Velocity Score</p>
                     <p className="text-3xl font-black text-green-500 text-center">{progressPercent.toFixed(1)}%</p>
                     <div className="h-2 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col justify-center gap-4 min-w-[240px]">
               <button onClick={() => setShowTargetModal(true)} className="w-full px-8 py-5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3">
                  <ArrowRightCircle className="w-4 h-4 text-red-500" />
                  Modify Target
               </button>
               <button onClick={() => setShowQuickWebModal(true)} className="w-full px-8 py-5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-900/40 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Quick Web Sale
               </button>
            </div>
         </div>
      </section>

      {/* TODAY'S MISSION PULSE */}
      <section className={`${cardBg} border-2 border-indigo-600/10 rounded-[2.5rem] p-8 shadow-xl overflow-hidden relative group hover:border-indigo-600/30 transition-all`}>
         <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 opacity-20" />
         <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-4 border-r border-slate-800/20 pr-8">
               <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-indigo-500" />
               </div>
               <div>
                  <h3 className={`text-lg font-black ${textColor} uppercase leading-none`}>Today's Mission Pulse</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time Intelligence</p>
               </div>
            </div>

            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
               <div className="flex flex-col items-center lg:items-start">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Zap className="w-2 h-2 text-yellow-500" /> Revenue</span>
                  <p className={`text-2xl font-black ${textColor} tabular-nums`}>৳{formatNum(stats.todayRevenue)}</p>
               </div>
               <div className="flex flex-col items-center lg:items-start">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Flame className="w-2 h-2 text-red-500" /> Ad Burn</span>
                  <p className="text-2xl font-black text-red-500 tabular-nums">৳{formatNum(stats.todayAdCost)}</p>
               </div>
               <div className="flex flex-col items-center lg:items-start">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><BarChart4 className="w-2 h-2 text-green-500" /> Net Profit</span>
                  <p className="text-2xl font-black text-green-500 tabular-nums">৳{formatNum(stats.todayNetProfit)}</p>
               </div>
               <div className="flex flex-col items-center lg:items-start">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><History className="w-2 h-2 text-blue-500" /> Ops Count</span>
                  <p className="text-2xl font-black text-blue-500 tabular-nums">{stats.todayCount} Sales</p>
               </div>
            </div>
         </div>
      </section>

      {/* CORE FINANCIAL METRICS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <InsightCard label="Global ROI" value={`${stats.roi.toFixed(2)}x`} icon={Rocket} color="green" theme={theme} desc={`Yield on Market Spend`} />
         <InsightCard label="Gross Revenue" value={`৳${formatNum(stats.totalRevenue)}`} icon={Coins} color="blue" theme={theme} desc="Total cash inflow" />
         <InsightCard label="Market Spend" value={`৳${formatNum(stats.totalAdCost)}`} icon={Flame} color="red" theme={theme} desc="Total monthly ad burn" />
         <InsightCard label="Monthly Profit" value={`৳${formatNum(stats.netProfit)}`} icon={BarChart4} color="orange" theme={theme} desc="Final after ads & ops" />
      </section>

      {/* MONTHLY DAILY SUMMARY LEDGER */}
      <section className={`${cardBg} border-2 border-slate-800/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden`}>
         <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800/20">
            <div>
               <h3 className={`text-xl font-bold ${textColor} flex items-center gap-3 uppercase tracking-tight`}>
                  <CalendarDays className="w-6 h-6 text-red-600" />
                  Monthly Operations Ledger
               </h3>
               <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Granular 9-Column Financial Matrix</p>
            </div>
            <div className="px-4 py-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center gap-3">
               <ShieldCheck className="w-4 h-4 text-green-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audited Sync</span>
            </div>
         </div>

         <div className="overflow-x-auto custom-scrollbar pb-4">
            <table className="w-full text-left border-collapse min-w-[1200px]">
               <thead>
                  <tr className={theme === 'dark' ? 'bg-slate-950/80' : 'bg-gray-100'}>
                     <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest sticky left-0 z-20 bg-inherit shadow-md">Date</th>
                     <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Expenses (Total)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-blue-500 uppercase tracking-widest text-right bg-blue-500/5 border-l border-blue-500/10">Ads (Call Center)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-blue-500 uppercase tracking-widest text-right bg-blue-500/5 border-r border-blue-500/10">Rev (Call Center)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-orange-500 uppercase tracking-widest text-right bg-orange-500/5 border-l border-orange-500/10">Ads (Web)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-orange-500 uppercase tracking-widest text-right bg-orange-500/5 border-r border-orange-500/10">Rev (Web)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-red-500 uppercase tracking-widest text-right">Total Ad Burn</th>
                     <th className="px-6 py-5 text-[9px] font-black text-green-500 uppercase tracking-widest text-right">Total Revenue</th>
                     <th className="px-6 py-5 text-[9px] font-black text-white uppercase tracking-widest text-right bg-slate-800 shadow-inner">Net Profit</th>
                  </tr>
               </thead>
               <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800/50' : 'divide-gray-100'}`}>
                  {stats.dailyBreakdown.length === 0 ? (
                     <tr><td colSpan={9} className="px-8 py-24 text-center opacity-30 font-black uppercase text-xs">No activity logged for this cycle</td></tr>
                  ) : stats.dailyBreakdown.map((day: any) => {
                     const isLoss = day.netProfit < 0;
                     return (
                        <tr key={day.date} className="hover:bg-red-500/5 transition-colors group">
                           <td className="px-6 py-5 sticky left-0 z-10 bg-inherit border-r border-slate-800/10">
                              <p className={`text-xs font-black ${textColor}`}>{new Date(day.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                           </td>
                           <td className="px-6 py-5 text-right font-bold text-xs text-slate-500 italic">৳{formatNum(day.expenses)}</td>
                           
                           <td className="px-6 py-5 text-right font-black text-xs text-blue-400 bg-blue-500/5 border-l border-slate-800/10">৳{formatNum(day.adsCall)}</td>
                           <td className="px-6 py-5 text-right font-black text-xs text-blue-500 bg-blue-500/5 border-r border-slate-800/10">৳{formatNum(day.revCall)}</td>
                           
                           <td className="px-6 py-5 text-right font-black text-xs text-orange-400 bg-orange-500/5 border-l border-slate-800/10">৳{formatNum(day.adsWeb)}</td>
                           <td className="px-6 py-5 text-right font-black text-xs text-orange-500 bg-orange-500/5 border-r border-slate-800/10">৳{formatNum(day.revWeb)}</td>
                           
                           <td className="px-6 py-5 text-right font-black text-xs text-red-500 tabular-nums">৳{formatNum(day.totalAds)}</td>
                           <td className="px-6 py-5 text-right font-black text-xs text-green-500 tabular-nums">৳{formatNum(day.totalRev)}</td>
                           
                           <td className={`px-6 py-5 text-right font-black text-sm tabular-nums shadow-inner ${isLoss ? 'bg-red-900/10 text-red-500' : 'bg-green-900/10 text-green-500'}`}>
                              {day.netProfit < 0 ? '-' : ''}৳{formatNum(Math.abs(day.netProfit))}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* SPECIALIST PERFORMANCE */}
         <div className={`${cardBg} border-2 border-slate-800/10 rounded-[2.5rem] p-10 shadow-2xl flex flex-col`}>
           <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800/20">
              <div>
                <h3 className={`text-xl font-bold ${textColor} flex items-center gap-3 uppercase tracking-tight`}>
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Top Specialists
                </h3>
                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Ranked by revenue & efficiency</p>
              </div>
              <Sparkles className="w-6 h-6 text-yellow-500/30" />
           </div>

           <div className="flex-1 space-y-4 overflow-y-auto max-h-[520px] pr-2 custom-scrollbar">
              {(stats.agentLeaderboard || []).map((a: any, idx: number) => (
                <div key={a.id} className={`${theme === 'dark' ? 'bg-slate-800/40' : 'bg-gray-50'} p-6 rounded-[2rem] border flex items-center justify-between group hover:border-red-500/40 transition-all shadow-sm`}>
                   <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center text-4xl shadow-inner border border-slate-800">
                          {a.avatar}
                        </div>
                        {idx === 0 && <Crown className="w-6 h-6 text-yellow-500 absolute -top-3 -right-3 rotate-12 fill-current" />}
                      </div>
                      <div>
                        <p className={`text-lg font-bold uppercase ${textColor} tracking-tight`}>{a.name}</p>
                        <div className="flex gap-4 items-center mt-2">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-500 uppercase">ROI</span>
                              <span className="text-xs font-bold text-green-500">{a.roi.toFixed(2)}x</span>
                           </div>
                           <div className="w-[1px] h-4 bg-slate-700/50" />
                           <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-500 uppercase">Ad Cost</span>
                              <span className="text-xs font-bold text-red-500">৳{formatNum(a.adCost)}</span>
                           </div>
                        </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-2xl font-bold text-green-500 tracking-tighter italic">৳{formatNum(a.revenue)}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{a.count} Sales</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* CHANNEL BREAKDOWN */}
        <div className={`${cardBg} border-2 border-slate-800/10 rounded-[2.5rem] p-10 shadow-2xl space-y-10`}>
            <div className="flex items-center justify-between">
               <h3 className={`text-xl font-bold ${textColor} flex items-center gap-3 uppercase tracking-tight`}>
                  <PieChart className="w-6 h-6 text-blue-500" />
                  Channel Yield
               </h3>
               <div className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 text-[10px] font-bold text-blue-500 uppercase">Live Distribution</div>
            </div>
            
            <div className="space-y-10">
               <div className="p-10 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/20 shadow-inner relative overflow-hidden group">
                  <div className="relative z-10">
                     <div className="flex justify-between items-center mb-6">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Call Center Revenue</p>
                        <PhoneCall className="w-5 h-5 text-blue-500" />
                     </div>
                     <p className={`text-6xl font-black ${textColor} tracking-tighter tabular-nums`}>৳{formatNum(stats.callRevenue)}</p>
                     <p className="text-xs font-bold text-slate-500 mt-4 uppercase">{(stats.callRevenue / Math.max(1, stats.totalRevenue) * 100).toFixed(1)}% SHARE</p>
                  </div>
               </div>
               
               <div className="p-10 rounded-[2.5rem] bg-orange-500/5 border border-orange-500/20 shadow-inner relative overflow-hidden group">
                  <div className="relative z-10">
                     <div className="flex justify-between items-center mb-6">
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Direct Web Sales</p>
                        <Globe className="w-5 h-5 text-orange-500" />
                     </div>
                     <p className={`text-6xl font-black ${textColor} tracking-tighter tabular-nums`}>৳{formatNum(stats.websiteRevenue)}</p>
                     <p className="text-xs font-bold text-slate-500 mt-4 uppercase">{(stats.websiteRevenue / Math.max(1, stats.totalRevenue) * 100).toFixed(1)}% SHARE</p>
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* MODALS */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
           <div className={`${cardBg} border-2 border-slate-800 rounded-[3rem] p-12 w-full max-md shadow-2xl animate-in zoom-in-95`}>
              <div className="flex justify-between items-center mb-10">
                 <h3 className={`text-2xl font-bold ${textColor} uppercase tracking-tight`}>Adjust Revenue Goal</h3>
                 <button onClick={() => setShowTargetModal(false)} className="text-slate-500 hover:text-red-500"><X className="w-7 h-7" /></button>
              </div>
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Monthly Target (৳)</label>
                    <input 
                      type="text"
                      inputMode="numeric"
                      className={`w-full ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'} border-2 border-slate-800 rounded-[2rem] px-8 py-6 ${textColor} outline-none focus:ring-2 focus:ring-red-600 font-bold text-4xl tabular-nums`}
                      value={tempTarget} 
                      onChange={e => setTempTarget(e.target.value.replace(/[^0-9]/g, ''))}
                      autoFocus
                    />
                 </div>
                 <button onClick={handleSaveTarget} className="w-full py-6 bg-red-600 text-white font-black rounded-3xl shadow-2xl uppercase tracking-[0.2em]">SAVE NEW TARGET</button>
              </div>
           </div>
        </div>
      )}

      {showQuickWebModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
           <div className={`${cardBg} border-2 border-slate-800 rounded-[3rem] p-12 w-full max-md shadow-2xl animate-in zoom-in-95`}>
              <div className="flex justify-between items-center mb-10">
                 <h3 className={`text-2xl font-bold ${textColor} uppercase tracking-tight`}>Direct Web Log</h3>
                 <button onClick={() => setShowQuickWebModal(false)} className="text-slate-500 hover:text-orange-500"><X className="w-7 h-7" /></button>
              </div>
              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Revenue Amount (৳)</label>
                    <input 
                      type="text"
                      inputMode="numeric"
                      className={`w-full ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'} border-2 border-slate-800 rounded-[2rem] px-8 py-6 ${textColor} outline-none focus:ring-2 focus:ring-orange-600 font-bold text-4xl tabular-nums`}
                      value={webAmount} 
                      onChange={e => setWebAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      autoFocus
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Entry Date</label>
                    <input 
                      type="date"
                      className={`w-full ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'} border-2 border-slate-800 rounded-[2rem] px-8 py-6 ${textColor} outline-none font-bold text-xl`}
                      value={webDate} 
                      onChange={e => setWebDate(e.target.value)}
                    />
                 </div>
                 <button onClick={handleQuickWebSale} className="w-full py-6 bg-orange-600 text-white font-black rounded-3xl shadow-2xl uppercase tracking-[0.2em] mt-4">RECORD TRANSACTION</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const InsightCard: React.FC<{ label: string; value: string | number; icon: any; color: string; theme: 'dark' | 'light'; desc: string }> = ({ label, value, icon: Icon, color, theme, desc }) => {
  const colors: any = {
    green: 'text-green-500 bg-green-500/10 border-green-500/20 shadow-green-500/10',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10',
    red: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/10',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10',
  };
  return (
    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'} border-2 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]} shadow-lg transition-transform`}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
      <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-2 tracking-tight uppercase truncate`}>{value}</p>
      <p className="text-[10px] font-medium text-slate-500 uppercase mt-4">{desc}</p>
    </div>
  );
};

export default DashboardView;
