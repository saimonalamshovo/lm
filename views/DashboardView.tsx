import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  Zap,
  Activity,
  History,
  ShieldCheck,
  CalendarDays,
  Download,
  RotateCcw,
  ShieldAlert,
  Save,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  LayoutGrid,
  Monitor,
  Check
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
}

const DashboardView: React.FC<DashboardViewProps> = ({ stats, monthlyTarget, onTargetChange, theme, setSales, sales, batchProjects, onReset, onExport, onBackup }) => {
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showQuickWebModal, setShowQuickWebModal] = useState(false);
  const [tempTarget, setTempTarget] = useState(monthlyTarget.toString());
  const [webAmount, setWebAmount] = useState('');
  const [webDate, setWebDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  
  // Filtering states
  const [selectedSources, setSelectedSources] = useState<string[]>(['website', 'call', 'batch']);

  useEffect(() => { setTempTarget(monthlyTarget.toString()); }, [monthlyTarget]);

  const toggleSource = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? (prev.length > 1 ? prev.filter(s => s !== source) : prev) 
        : [...prev, source]
    );
  };

  const filteredStats = useMemo(() => {
    if (!stats) return stats;

    const showWeb = selectedSources.includes('website');
    const showCall = selectedSources.includes('call');
    const showBatch = selectedSources.includes('batch');

    // Re-calculating primary totals based on filters
    const filteredTotalRevenue = (showWeb ? stats.websiteRevenue : 0) + 
                                (showCall ? stats.callRevenue : 0) + 
                                (showBatch ? (stats.batchRevenue || 0) : 0);
    
    // We assume ad costs follow the source
    // In App.tsx dailyBreakdown has adsCall, adsWeb, adsBatch
    const filteredTotalAdCost = (showWeb ? stats.dailyBreakdown.reduce((a: any, d: any) => a + d.adsWeb, 0) : 0) +
                                (showCall ? stats.dailyBreakdown.reduce((a: any, d: any) => a + d.adsCall, 0) : 0) +
                                (showBatch ? stats.dailyBreakdown.reduce((a: any, d: any) => a + (d.adsBatch || 0), 0) : 0);

    const filteredNetProfit = filteredTotalRevenue - filteredTotalAdCost;
    const filteredRoi = filteredTotalAdCost > 0 ? (filteredTotalRevenue / filteredTotalAdCost) : 0;
    const filteredProgress = monthlyTarget > 0 ? Math.min(100, (filteredTotalRevenue / monthlyTarget * 100)) : 0;

    return {
      ...stats,
      totalRevenue: filteredTotalRevenue,
      totalAdCost: filteredTotalAdCost,
      netProfit: filteredNetProfit,
      roi: filteredRoi,
      progressPercent: filteredProgress,
      targetLeft: Math.max(0, monthlyTarget - filteredTotalRevenue)
    };
  }, [stats, selectedSources, monthlyTarget]);

  const handleSaveTarget = () => {
    const num = parseInt(tempTarget.replace(/[^0-9]/g, ''));
    if (!isNaN(num)) { onTargetChange(num); setShowTargetModal(false); }
  };

  const handleQuickWebSale = () => {
    const amount = parseInt(webAmount);
    if (!isNaN(amount) && amount > 0) {
      const newSale: Sale = { id: Math.random().toString(36).substr(2, 9), type: 'website', amount, adCost: 0, createdAt: webDate + "T12:00:00Z" };
      setSales([newSale, ...sales]);
      setWebAmount('');
      setShowQuickWebModal(false);
    }
  };

  const formatNum = (num: number) => (num || 0).toLocaleString();
  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const inputBg = theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100';

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
                     <p className="text-5xl font-black text-red-600 tabular-nums tracking-tighter">৳{formatNum(filteredStats?.targetLeft)}</p>
                     <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">REMAINING GAP</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Daily Quota Required</p>
                     <p className="text-5xl font-black text-yellow-500 tabular-nums tracking-tighter">৳{formatNum(Math.round(filteredStats?.dailyRequired || 0))}</p>
                     <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">FOR {filteredStats?.remainingDays || 0} MORE DAYS</p>
                  </div>
                  <div className="bg-slate-800/20 p-6 rounded-3xl border border-slate-700/30 flex flex-col justify-center">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Velocity Score</p>
                     <p className="text-3xl font-black text-green-500 text-center">{filteredStats?.progressPercent.toFixed(1)}%</p>
                     <div className="h-2 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${filteredStats?.progressPercent}%` }} />
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

      {/* 🧭 SOURCE FILTER BAR */}
      <section className={`${cardBg} border-2 border-slate-800/20 rounded-[2rem] p-6 shadow-xl flex flex-wrap items-center gap-6`}>
         <div className="flex items-center gap-3 pr-6 border-r border-slate-800/20">
            <Filter className="w-5 h-5 text-blue-500" />
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Revenue Intelligence Filter</h3>
         </div>
         <div className="flex flex-wrap gap-3">
            {[
              { id: 'website', label: 'Web Recorded Sales', icon: Monitor, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { id: 'call', label: 'Call Center Operations', icon: PhoneCall, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { id: 'batch', label: 'Offline / Live Batch', icon: LayoutGrid, color: 'text-purple-500', bg: 'bg-purple-500/10' }
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

      {/* TODAY'S MISSION PULSE */}
      <section className={`${cardBg} border-2 border-indigo-600/10 rounded-[2.5rem] p-8 shadow-xl overflow-hidden relative group transition-all`}>
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
                  <p className={`text-2xl font-black ${textColor} tabular-nums`}>৳{formatNum(filteredStats?.todayRevenue)}</p>
               </div>
               <div className="flex flex-col items-center lg:items-start">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Flame className="w-2 h-2 text-red-500" /> Ad Burn</span>
                  <p className="text-2xl font-black text-red-500 tabular-nums">৳{formatNum(filteredStats?.todayAdCost)}</p>
               </div>
               <div className="flex flex-col items-center lg:items-start">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><BarChart3 className="w-2 h-2 text-green-500" /> Net Profit</span>
                  <p className="text-2xl font-black text-green-500 tabular-nums">৳{formatNum(filteredStats?.todayNetProfit)}</p>
               </div>
               <div className="flex flex-col items-center lg:items-start">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><History className="w-2 h-2 text-blue-500" /> Ops Count</span>
                  <p className="text-2xl font-black text-blue-500 tabular-nums">{filteredStats?.todayCount || 0} Sales</p>
               </div>
            </div>
         </div>
      </section>

      {/* CORE FINANCIAL METRICS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <InsightCard label="Global ROI" value={`${(filteredStats?.roi || 0).toFixed(2)}x`} icon={Rocket} color="green" theme={theme} desc={`Yield on Market Spend`} />
         <InsightCard label="Gross Revenue" value={`৳${formatNum(filteredStats?.totalRevenue)}`} icon={Coins} color="blue" theme={theme} desc="Filtered monthly inflow" />
         <InsightCard label="Market Spend" value={`৳${formatNum(filteredStats?.totalAdCost)}`} icon={Flame} color="red" theme={theme} desc="Filtered ad burn" />
         <InsightCard label="Monthly Profit" value={`৳${formatNum(filteredStats?.netProfit)}`} icon={BarChart3} color="orange" theme={theme} desc="Net profit from sources" />
      </section>

      {/* 🏆 SALES FORCE LEADERBOARD - RESTORED & ENHANCED */}
      <section className={`${cardBg} border-2 border-slate-800/10 rounded-[2.5rem] p-10 shadow-2xl`}>
         <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-800/20">
            <div>
               <h3 className={`text-xl font-bold ${textColor} flex items-center gap-3 uppercase tracking-tight`}>
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Top Performers: Sales Force
               </h3>
               <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Individual Agent Intelligence & Yields</p>
            </div>
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-green-500 uppercase">Live Efficiency Ranking</span>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-6">
            {(filteredStats?.agentLeaderboard || []).map((agent: any, index: number) => {
               const isExpanded = expandedAgentId === agent.id;
               const rankIcon = index === 0 ? <Crown className="w-5 h-5 text-yellow-500" /> : null;
               
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
                                 {rankIcon}
                              </div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sales Specialist | {agent.count} Deals</p>
                           </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                           <div className="text-center xl:text-left">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
                              <p className={`text-lg font-black ${textColor} tabular-nums`}>৳{formatNum(agent.revenue)}</p>
                           </div>
                           <div className="text-center xl:text-left">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Ad Burn</p>
                              <p className="text-lg font-black text-red-500 tabular-nums">৳{formatNum(agent.adCost)}</p>
                           </div>
                           <div className="text-center xl:text-left">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Profit</p>
                              <p className={`text-lg font-black tabular-nums ${agent.profit >= 0 ? 'text-green-500' : 'text-red-600'}`}>
                                 {agent.profit < 0 ? '-' : ''}৳{formatNum(Math.abs(agent.profit))}
                              </p>
                           </div>
                           <div className="text-center xl:text-left">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Target ROI</p>
                              <p className={`text-lg font-black text-blue-500 tabular-nums`}>{agent.roi.toFixed(2)}x</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <button className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'} text-slate-400 group-hover:text-white group-hover:bg-red-600 transition-all shadow-md`}>
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                           </button>
                        </div>
                     </div>

                     {/* 📊 INDIVIDUAL AGENT DAILY REPORT LEDGER - TOGGLEABLE */}
                     {isExpanded && (
                        <div className="border-t border-slate-800/20 bg-slate-900/40 p-10 animate-in slide-in-from-top-4 duration-300">
                           <div className="flex items-center gap-3 mb-8">
                              <FileText className="w-5 h-5 text-red-500" />
                              <h5 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Individual Daily Ops Intel</h5>
                           </div>
                           
                           <div className="overflow-x-auto custom-scrollbar">
                              <table className="w-full text-left">
                                 <thead>
                                    <tr className="border-b border-slate-800/30">
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Execution Date</th>
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Ad Burn (৳)</th>
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Revenue (৳)</th>
                                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Day Profit (৳)</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-800/20">
                                    {(agent.dailyBreakdown || []).length === 0 ? (
                                       <tr><td colSpan={4} className="px-6 py-12 text-center text-xs opacity-30 font-bold uppercase italic">No daily operation records found for this period</td></tr>
                                    ) : agent.dailyBreakdown.map((day: any) => (
                                       <tr key={day.date} className="hover:bg-slate-800/30 transition-colors group/row">
                                          <td className="px-6 py-4 text-xs font-black text-slate-300 uppercase italic">
                                             {new Date(day.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                          </td>
                                          <td className="px-6 py-4 text-right font-bold text-red-500 text-xs">৳{formatNum(day.adBurn)}</td>
                                          <td className="px-6 py-4 text-right font-bold text-green-500 text-xs">৳{formatNum(day.revenue)}</td>
                                          <td className={`px-6 py-4 text-right font-black text-sm tabular-nums ${day.profit >= 0 ? 'text-green-400' : 'text-red-600'}`}>
                                             {day.profit < 0 ? '-' : ''}৳{formatNum(Math.abs(day.profit))}
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>

                           <div className="mt-8 flex justify-end">
                              <div className="px-6 py-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 text-right">Cumulative Monthly Profit</p>
                                 <p className={`text-xl font-black text-right ${agent.profit >= 0 ? 'text-green-500' : 'text-red-600'}`}>
                                    {agent.profit < 0 ? '-' : ''}৳{formatNum(Math.abs(agent.profit))}
                                 </p>
                              </div>
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
                  Monthly Operations Ledger
               </h3>
               <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Granular 9-Column Financial Matrix</p>
            </div>
         </div>

         <div className="overflow-x-auto custom-scrollbar pb-4">
            <table className="w-full text-left border-collapse min-w-[1200px]">
               <thead>
                  <tr className={theme === 'dark' ? 'bg-slate-950/80' : 'bg-gray-100'}>
                     <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest sticky left-0 z-20 bg-inherit shadow-md">Date</th>
                     <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Expenses</th>
                     <th className="px-6 py-5 text-[9px] font-black text-blue-500 uppercase tracking-widest text-right bg-blue-500/5">Ads (Call)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-blue-500 uppercase tracking-widest text-right bg-blue-500/5">Rev (Call)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-orange-500 uppercase tracking-widest text-right bg-orange-500/5">Ads (Web)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-orange-500 uppercase tracking-widest text-right bg-orange-500/5">Rev (Web)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-purple-500 uppercase tracking-widest text-right bg-purple-500/5">Rev (Batch)</th>
                     <th className="px-6 py-5 text-[9px] font-black text-red-500 uppercase tracking-widest text-right">Total Ad Burn</th>
                     <th className="px-6 py-5 text-[9px] font-black text-green-500 uppercase tracking-widest text-right">Total Rev</th>
                     <th className="px-6 py-5 text-[9px] font-black text-white uppercase tracking-widest text-right bg-slate-800 shadow-inner">Net Profit</th>
                  </tr>
               </thead>
               <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800/50' : 'divide-gray-100'}`}>
                  {(filteredStats?.dailyBreakdown || []).map((day: any) => {
                     // Check filters for the table as well
                     const showWeb = selectedSources.includes('website');
                     const showCall = selectedSources.includes('call');
                     const showBatch = selectedSources.includes('batch');

                     const displayRev = (showWeb ? day.revWeb : 0) + (showCall ? day.revCall : 0) + (showBatch ? (day.revBatch || 0) : 0);
                     const displayAds = (showWeb ? day.adsWeb : 0) + (showCall ? day.adsCall : 0) + (showBatch ? (day.adsBatch || 0) : 0);
                     const displayProfit = displayRev - displayAds - day.expenses;

                     return (
                        <tr key={day.date} className="hover:bg-red-500/5 transition-colors group">
                           <td className="px-6 py-5 sticky left-0 z-10 bg-inherit border-r border-slate-800/10">
                              <p className={`text-xs font-black ${textColor}`}>{new Date(day.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                           </td>
                           <td className="px-6 py-5 text-right font-bold text-xs text-slate-500">৳{formatNum(day.expenses)}</td>
                           <td className="px-6 py-5 text-right font-black text-xs text-blue-400 bg-blue-500/5">৳{formatNum(day.adsCall)}</td>
                           <td className="px-6 py-5 text-right font-black text-xs text-blue-500 bg-blue-500/5">৳{formatNum(day.revCall)}</td>
                           <td className="px-6 py-5 text-right font-black text-xs text-orange-400 bg-orange-500/5">৳{formatNum(day.adsWeb)}</td>
                           <td className="px-6 py-5 text-right font-black text-xs text-orange-500 bg-orange-500/5">৳{formatNum(day.revWeb)}</td>
                           <td className="px-6 py-5 text-right font-black text-xs text-purple-500 bg-purple-500/5">৳{formatNum(day.revBatch)}</td>
                           <td className="px-6 py-5 text-right font-black text-xs text-red-500">৳{formatNum(displayAds)}</td>
                           <td className="px-6 py-5 text-right font-black text-xs text-green-500">৳{formatNum(displayRev)}</td>
                           <td className={`px-6 py-5 text-right font-black text-sm tabular-nums shadow-inner ${displayProfit < 0 ? 'bg-red-900/10 text-red-500' : 'bg-green-900/10 text-green-500'}`}>
                              {displayProfit < 0 ? '-' : ''}৳{formatNum(Math.abs(displayProfit))}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </section>

      {/* MODALS */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
           <div className={`${cardBg} border-2 border-slate-800 rounded-[3rem] p-12 w-full max-md shadow-2xl animate-in zoom-in-95`}>
              <div className="flex justify-between items-center mb-10">
                 <h3 className={`text-2xl font-bold ${textColor} uppercase tracking-tight`}>Adjust Revenue Goal</h3>
                 <button onClick={() => setShowTargetModal(false)} className="text-slate-500 hover:text-red-500"><X className="w-7 h-7" /></button>
              </div>
              <div className="space-y-8">
                 <input type="text" inputMode="numeric" className={`w-full ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'} border-2 border-slate-800 rounded-[2rem] px-8 py-6 ${textColor} outline-none focus:ring-2 focus:ring-red-600 font-bold text-4xl tabular-nums`} value={tempTarget} onChange={e => setTempTarget(e.target.value.replace(/[^0-9]/g, ''))} autoFocus />
                 <button onClick={handleSaveTarget} className="w-full py-6 bg-red-600 text-white font-black rounded-3xl uppercase tracking-[0.2em]">SAVE NEW TARGET</button>
              </div>
           </div>
        </div>
      )}

      {showQuickWebModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
           <div className={`${cardBg} border-2 border-slate-800 rounded-[3rem] p-12 w-full max-md shadow-2xl animate-in zoom-in-95`}>
              <div className="flex justify-between items-center mb-10">
                 <h3 className={`text-2xl font-black ${textColor} uppercase tracking-tight`}>Direct Web Log</h3>
                 <button onClick={() => setShowQuickWebModal(false)} className="text-slate-500 hover:text-orange-500"><X className="w-7 h-7" /></button>
              </div>
              <div className="space-y-8">
                 <input type="text" inputMode="numeric" placeholder="Revenue Amount" className={`w-full ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'} border-2 border-slate-800 rounded-[2rem] px-8 py-6 ${textColor} outline-none focus:ring-2 focus:ring-orange-600 font-bold text-4xl tabular-nums`} value={webAmount} onChange={e => setWebAmount(e.target.value.replace(/[^0-9]/g, ''))} autoFocus />
                 <input type="date" className={`w-full ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'} border-2 border-slate-800 rounded-[2rem] px-8 py-6 ${textColor} outline-none font-bold text-xl`} value={webDate} onChange={e => setWebDate(e.target.value)} />
                 <button onClick={handleQuickWebSale} className="w-full py-6 bg-orange-600 text-white font-black rounded-3xl shadow-2xl uppercase tracking-[0.2em] mt-4">RECORD TRANSACTION</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;