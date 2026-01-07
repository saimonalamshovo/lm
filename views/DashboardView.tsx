
import React, { useState, useEffect } from 'react';
import { 
  Target as TargetIcon,
  Crown,
  Flame,
  X,
  PieChart,
  PhoneCall,
  Globe,
  Trophy,
  Coins,
  Rocket,
  Plus,
  BarChart3,
  ArrowRightCircle,
  Activity,
  History,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  LayoutGrid,
  Monitor,
  Check,
  Wallet,
  MessageSquare
} from 'lucide-react';
import { Sale, BatchProject } from '../types';

const InsightCard: React.FC<{ label: string; value: string | number; icon: any; color: string; theme: 'dark' | 'light'; desc: string }> = ({ label, value, icon: Icon, color, theme, desc }) => {
  const colors: any = {
    green: 'text-green-500 bg-green-500/10 border-green-500/20 shadow-green-500/10',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10',
    red: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/10',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10',
  };
  return (
    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'} border-2 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group transition-all`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colors[color] || colors.blue} shadow-lg transition-transform group-hover:scale-110`}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
      <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-2 tracking-tight uppercase truncate`}>{value}</p>
      <p className="text-[10px] font-medium text-slate-500 uppercase mt-4">{desc}</p>
    </div>
  );
};

interface DashboardViewProps {
  stats: any;
  monthlyTarget: number;
  onTargetChange: (val: number) => void;
  theme: 'dark' | 'light';
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  sales: Sale[];
  batchProjects: BatchProject[];
  onReset: () => void;
  onExport: () => void;
  onBackup: () => void;
  selectedSources: string[];
  setSelectedSources: (sources: string[]) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ stats, monthlyTarget, onTargetChange, theme, setSales, sales, batchProjects, onReset, onExport, onBackup, selectedSources, setSelectedSources }) => {
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showQuickWebModal, setShowQuickWebModal] = useState(false);
  const [tempTarget, setTempTarget] = useState(monthlyTarget.toString());
  const [webAmount, setWebAmount] = useState('');
  const [webDate, setWebDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);

  useEffect(() => { setTempTarget(monthlyTarget.toString()); }, [monthlyTarget]);

  const toggleSource = (source: string) => {
    setSelectedSources(
      selectedSources.includes(source) 
        ? (selectedSources.length > 1 ? selectedSources.filter(s => s !== source) : selectedSources) 
        : [...selectedSources, source]
    );
  };

  const handleSaveTarget = () => {
    const num = parseInt(tempTarget.replace(/[^0-9]/g, ''));
    if (!isNaN(num)) { onTargetChange(num); setShowTargetModal(false); }
  };

  const handleQuickWebSale = () => {
    const amount = parseInt(webAmount);
    if (!isNaN(amount) && amount > 0) {
      const newSale: Sale = { id: Math.random().toString(36).substr(2, 9), type: 'website', amount, adCost: 0, createdAt: webDate + "T12:00:00Z" };
      setSales(prev => [newSale, ...prev]);
      setWebAmount('');
      setShowQuickWebModal(false);
    }
  };

  const formatNum = (num: number) => (num || 0).toLocaleString();
  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

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
                     <h2 className={`text-3xl font-black ${textColor} uppercase tracking-tight`}>Global Projection</h2>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Filtered Mission Progress</p>
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
                     <p className="text-3xl font-black text-green-500 text-center">{stats.progressPercent.toFixed(1)}%</p>
                     <div className="h-2 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${stats.progressPercent}%` }} />
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

      {/* 🧭 SOURCE FILTER BAR - DRIVES GLOBAL DATA */}
      <section className={`${cardBg} border-2 border-slate-800/20 rounded-[2rem] p-6 shadow-xl flex flex-wrap items-center gap-6`}>
         <div className="flex items-center gap-3 pr-6 border-r border-slate-800/20">
            <Filter className="w-5 h-5 text-blue-500" />
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Global Intelligence Filter</h3>
         </div>
         <div className="flex flex-wrap gap-3">
            {[
              { id: 'website', label: 'Web Recorded Sales', icon: Monitor, color: 'text-orange-500' },
              { id: 'call', label: 'Call Center Ops', icon: PhoneCall, color: 'text-blue-500' },
              { id: 'hand_cash', label: 'Hand Cash Entry', icon: Wallet, color: 'text-green-500' },
              { id: 'batch', label: 'Batch/Live Roster', icon: LayoutGrid, color: 'text-purple-500' }
            ].map((source) => {
              const isActive = selectedSources.includes(source.id);
              return (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${
                    isActive 
                      ? `border-blue-600 bg-blue-600 text-white shadow-lg` 
                      : `border-slate-800/30 ${theme === 'dark' ? 'bg-slate-950/40' : 'bg-gray-50'} text-slate-500 hover:border-slate-600`
                  }`}
                >
                  <source.icon className={`w-4 h-4 ${isActive ? 'text-white' : source.color}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{source.label}</span>
                  {isActive && <Check className="w-3 h-3 ml-1" />}
                </button>
              );
            })}
         </div>
      </section>

      {/* CORE FINANCIAL METRICS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <InsightCard label="Global ROI" value={`${(stats.roi || 0).toFixed(2)}x`} icon={Rocket} color="green" theme={theme} desc={`Yield on Market Spend`} />
         <InsightCard label="Gross Revenue" value={`৳${formatNum(stats.totalRevenue)}`} icon={Coins} color="blue" theme={theme} desc="Filtered monthly inflow" />
         <InsightCard label="Market Spend" value={`৳${formatNum(stats.totalAdCost)}`} icon={Flame} color="red" theme={theme} desc="Filtered ad burn" />
         <InsightCard label="Monthly Profit" value={`৳${formatNum(stats.netProfit)}`} icon={BarChart3} color="orange" theme={theme} desc="Net profit from sources" />
      </section>

      {/* 🏆 SALES FORCE LEADERBOARD */}
      <section className={`${cardBg} border-2 border-slate-800/10 rounded-[2.5rem] p-10 shadow-2xl`}>
         <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-800/20">
            <div>
               <h3 className={`text-xl font-bold ${textColor} flex items-center gap-3 uppercase tracking-tight`}>
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Top Performers: Sales Force
               </h3>
               <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Individual Agent Intelligence & Yields</p>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-6">
            {(stats.agentLeaderboard || []).map((agent: any, index: number) => {
               const isExpanded = expandedAgentId === agent.id;
               return (
                  <div key={agent.id} className={`${theme === 'dark' ? 'bg-slate-950/50' : 'bg-gray-50'} rounded-[2rem] border-2 border-slate-800/10 hover:border-red-500/30 transition-all overflow-hidden`}>
                     <div 
                        className="p-8 flex flex-col xl:flex-row items-center justify-between gap-8 cursor-pointer group"
                        onClick={() => setExpandedAgentId(isExpanded ? null : agent.id)}
                     >
                        <div className="flex items-center gap-6">
                           <div className="relative">
                              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2" style={{ backgroundColor: `${agent.color}15`, borderColor: agent.color }}>
                                 {agent.avatar}
                              </div>
                              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-xs font-black text-white shadow-lg">
                                 #{index + 1}
                              </div>
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h4 className={`text-xl font-black uppercase italic ${textColor} group-hover:text-red-500 transition-colors`}>{agent.name}</h4>
                                 {index === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
                              </div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Specialist | {agent.count} Sales</p>
                           </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                           <div className="text-center xl:text-left">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Revenue</p>
                              <p className={`text-lg font-black ${textColor} tabular-nums`}>৳{formatNum(agent.revenue)}</p>
                           </div>
                           <div className="text-center xl:text-left">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Ad Burn</p>
                              <p className="text-lg font-black text-red-500 tabular-nums">৳{formatNum(agent.adCost)}</p>
                           </div>
                           <div className="text-center xl:text-left">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">ROI Score</p>
                              <p className="text-lg font-black text-blue-500 tabular-nums">{agent.roi.toFixed(2)}x</p>
                           </div>
                           <div className="text-center xl:text-left">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Yield</p>
                              <p className={`text-lg font-black tabular-nums ${agent.profit >= 0 ? 'text-green-500' : 'text-red-600'}`}>৳{formatNum(Math.abs(agent.profit))}</p>
                           </div>
                        </div>

                        <button className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'} text-slate-400 group-hover:text-white group-hover:bg-red-600 transition-all`}>
                           {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                     </div>

                     {isExpanded && (
                        <div className="border-t border-slate-800/20 bg-slate-900/40 p-10 animate-in slide-in-from-top-4 duration-300">
                           <div className="flex items-center gap-3 mb-8">
                              <FileText className="w-5 h-5 text-red-500" />
                              <h5 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Operational Report</h5>
                           </div>
                           <div className="overflow-x-auto custom-scrollbar">
                              <table className="w-full text-left">
                                 <thead>
                                    <tr className="border-b border-slate-800/30">
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Execution Date</th>
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Revenue (৳)</th>
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Profit (৳)</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-800/20">
                                    {(agent.dailyBreakdown || []).map((day: any) => (
                                       <tr key={day.date} className="hover:bg-slate-800/30">
                                          <td className="px-6 py-4 text-xs font-black text-slate-300 uppercase italic">{new Date(day.date).toLocaleDateString()}</td>
                                          <td className="px-6 py-4 text-right font-bold text-green-500 text-xs">৳{formatNum(day.revenue)}</td>
                                          <td className={`px-6 py-4 text-right font-black text-sm ${day.profit >= 0 ? 'text-green-400' : 'text-red-600'}`}>৳{formatNum(day.profit)}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     )}
                  </div>
               );
            })}
         </div>
      </section>

      {/* MONTHLY DAILY SUMMARY LEDGER */}
      <section className={`${cardBg} border-2 border-slate-800/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden`}>
         <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800/20">
            <div>
               <h3 className={`text-xl font-bold ${textColor} flex items-center gap-3 uppercase tracking-tight`}>
                  <CalendarDays className="w-6 h-6 text-red-600" />
                  Commercial Matrix Ledger
               </h3>
               <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Financial Chronology</p>
            </div>
         </div>

         <div className="overflow-x-auto custom-scrollbar pb-4">
            <table className="w-full text-left border-collapse min-w-[1100px]">
               <thead>
                  <tr className={theme === 'dark' ? 'bg-slate-950/80' : 'bg-gray-100'}>
                     <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest sticky left-0 z-20 bg-inherit shadow-md">Shift Date</th>
                     <th className="px-6 py-5 text-[9px] font-black text-blue-500 uppercase tracking-widest text-right">Rev (Call)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-orange-500 uppercase tracking-widest text-right">Rev (Web)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-green-500 uppercase tracking-widest text-right">Rev (Hand)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-purple-500 uppercase tracking-widest text-right">Rev (Batch)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-red-500 uppercase tracking-widest text-right">Total Ads</th>
                     <th className="px-6 py-5 text-[9px] font-black text-white uppercase tracking-widest text-right bg-slate-800 shadow-inner">Net Yield</th>
                  </tr>
               </thead>
               <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800/50' : 'divide-gray-100'}`}>
                  {stats.dailyBreakdown.map((day: any) => (
                     <tr key={day.date} className="hover:bg-red-500/5 transition-colors group">
                        <td className="px-6 py-5 sticky left-0 z-10 bg-inherit border-r border-slate-800/10 text-xs font-black uppercase italic">{new Date(day.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</td>
                        <td className="px-6 py-5 text-right font-black text-xs text-blue-500">৳{formatNum(day.revCall)}</td>
                        <td className="px-6 py-5 text-right font-black text-xs text-orange-500">৳{formatNum(day.revWeb)}</td>
                        <td className="px-6 py-5 text-right font-black text-xs text-green-500">৳{formatNum(day.revHandCash)}</td>
                        <td className="px-6 py-5 text-right font-black text-xs text-purple-500">৳{formatNum(day.revBatch)}</td>
                        <td className="px-6 py-5 text-right font-black text-xs text-red-500">৳{formatNum(day.totalAds)}</td>
                        <td className={`px-6 py-5 text-right font-black text-sm tabular-nums shadow-inner ${day.netProfit < 0 ? 'text-red-500' : 'text-green-500'}`}>৳{formatNum(Math.abs(day.netProfit))}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>

      {/* MODALS */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
           <div className={`${cardBg} border-2 border-slate-800 rounded-[3rem] p-12 w-full max-w-md shadow-2xl animate-in zoom-in-95`}>
              <h3 className={`text-2xl font-bold ${textColor} uppercase tracking-tight mb-10`}>Adjust Goal</h3>
              <input type="text" inputMode="numeric" className={`w-full ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'} border-2 border-slate-800 rounded-[2rem] px-8 py-6 ${textColor} outline-none focus:ring-2 focus:ring-red-600 font-bold text-4xl tabular-nums`} value={tempTarget} onChange={e => setTempTarget(e.target.value.replace(/[^0-9]/g, ''))} autoFocus />
              <button onClick={handleSaveTarget} className="w-full py-6 bg-red-600 text-white font-black rounded-3xl uppercase tracking-[0.2em] mt-8 shadow-xl shadow-red-900/40">COMMIT TARGET</button>
              <button onClick={() => setShowTargetModal(false)} className="w-full py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Abort</button>
           </div>
        </div>
      )}

      {showQuickWebModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
           <div className={`${cardBg} border-2 border-slate-800 rounded-[3rem] p-12 w-full max-w-md shadow-2xl animate-in zoom-in-95`}>
              <h3 className={`text-2xl font-black ${textColor} uppercase tracking-tight mb-10`}>Direct Web Log</h3>
              <input type="text" inputMode="numeric" placeholder="Revenue Amount" className={`w-full ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'} border-2 border-slate-800 rounded-[2rem] px-8 py-6 ${textColor} outline-none focus:ring-2 focus:ring-orange-600 font-bold text-4xl tabular-nums`} value={webAmount} onChange={e => setWebAmount(e.target.value.replace(/[^0-9]/g, ''))} autoFocus />
              <input type="date" className={`w-full ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'} border-2 border-slate-800 rounded-[2rem] px-8 py-6 ${textColor} outline-none font-bold text-xl mt-4`} value={webDate} onChange={e => setWebDate(e.target.value)} />
              <button onClick={handleQuickWebSale} className="w-full py-6 bg-orange-600 text-white font-black rounded-3xl shadow-2xl uppercase tracking-[0.2em] mt-8">RECORD INFLOW</button>
              <button onClick={() => setShowQuickWebModal(false)} className="w-full py-4 text-slate-500 font-bold uppercase text-[10px] mt-2">Cancel</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
