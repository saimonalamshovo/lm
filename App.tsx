
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  TrendingUp, 
  Receipt, 
  Film, 
  Calendar, 
  Sun, 
  Moon,
  History,
  Loader2,
  RefreshCw,
  Download,
  RotateCcw,
  Save,
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';
import { Task, Lead, Sale, Expense, ContentItem, Agent, TeamMember, Version, BatchProject } from './types';
import { INITIAL_TEAM, INITIAL_AGENTS, DEFAULT_MONTHLY_TARGET } from './constants';

import DashboardView from './views/DashboardView';
import TasksView from './views/TasksView';
import TeamView from './views/TeamView';
import SalesView from './views/SalesView';
import ExpensesView from './views/ExpensesView';
import ContentView from './views/ContentView';
import CalendarView from './views/CalendarView';
import VersionsView from './views/VersionsView';
import BatchView from './views/BatchView';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales Hub', icon: TrendingUp },
  { id: 'batch', label: 'Batch/Live', icon: Users },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'content', label: 'Content', icon: Film },
  { id: 'versions', label: 'History', icon: History },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [selectedSources, setSelectedSources] = useState<string[]>(['website', 'call', 'batch', 'hand_cash']);

  const [monthlyTarget, setMonthlyTarget] = useState<number>(DEFAULT_MONTHLY_TARGET);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM);
  const [versions, setVersions] = useState<Version[]>([]);
  const [batchProjects, setBatchProjects] = useState<BatchProject[]>([]);

  const initialLoadDone = useRef(false);
  const isSyncingFromCloud = useRef(false);
  const masterSyncRef = useRef<Record<string, string>>({});
  const syncTimeouts = useRef<Record<string, number>>({});

  const fetchAllData = async () => {
    if (isSyncingFromCloud.current) return;
    isSyncingFromCloud.current = true;
    setIsSyncing(true);
    
    try {
      const [
        { data: t }, { data: l }, { data: s }, { data: e }, 
        { data: c }, { data: a }, { data: tm }, { data: v }, { data: cfg },
        { data: bp }
      ] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('leads').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('content').select('*'),
        supabase.from('agents').select('*'),
        supabase.from('team_members').select('*'),
        supabase.from('versions').select('*'),
        supabase.from('app_config').select('*').eq('key', 'monthly_target').maybeSingle(),
        supabase.from('batch_projects').select('*')
      ]);

      const processData = (items: any[] | null) => items ? items.map((i: any) => i.data) : [];

      const results = {
        tasks: processData(t),
        leads: processData(l),
        sales: processData(s),
        expenses: processData(e),
        content: processData(c),
        agents: a && a.length > 0 ? processData(a) : INITIAL_AGENTS,
        team_members: tm && tm.length > 0 ? processData(tm) : INITIAL_TEAM,
        versions: processData(v),
        batch_projects: processData(bp),
        app_config: cfg?.value || DEFAULT_MONTHLY_TARGET
      };

      Object.entries(results).forEach(([table, data]) => {
        masterSyncRef.current[table] = JSON.stringify(data);
      });

      setTasks(results.tasks);
      setLeads(results.leads);
      setSales(results.sales);
      setExpenses(results.expenses);
      setContent(results.content);
      setAgents(results.agents);
      setTeamMembers(results.team_members);
      setVersions(results.versions);
      setBatchProjects(results.batch_projects);
      setMonthlyTarget(results.app_config);

      const savedTheme = localStorage.getItem('lm_theme') as 'dark' | 'light';
      if (savedTheme) setTheme(savedTheme || 'dark');
      setLastSyncTime(new Date().toLocaleTimeString());
      
      initialLoadDone.current = true;
    } catch (err) {
      console.error("Cloud fetch error:", err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
      setTimeout(() => { isSyncingFromCloud.current = false; }, 800);
    }
  };

  useEffect(() => {
    fetchAllData();
    const channel = supabase.channel('hardened-sync-v8').on('postgres_changes', { event: '*', schema: 'public' }, () => {
      if (!isSyncingFromCloud.current && Object.keys(syncTimeouts.current).length === 0) {
        fetchAllData();
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const persist = async (table: string, data: any[], isConfig: boolean = false) => {
    if (!initialLoadDone.current || isSyncingFromCloud.current) return;
    const fingerprint = JSON.stringify(data);
    if (masterSyncRef.current[table] === fingerprint) return;
    if (data.length === 0 && (masterSyncRef.current[table]?.length || 0) > 5) return;

    if (syncTimeouts.current[table]) window.clearTimeout(syncTimeouts.current[table]);

    syncTimeouts.current[table] = window.setTimeout(async () => {
      delete syncTimeouts.current[table];
      setIsSyncing(true);
      try {
        if (isConfig) {
          await supabase.from(table).upsert({ key: 'monthly_target', value: data });
        } else {
          const rows = (data || []).map(item => ({ 
            id: item.id || Math.random().toString(36).substr(2, 9), 
            data: item 
          }));
          await supabase.from(table).delete().neq('id', 'SYSTEM_ROOT_NODE');
          if (rows.length > 0) {
            const { error } = await supabase.from(table).insert(rows);
            if (error) throw error;
          }
        }
        masterSyncRef.current[table] = fingerprint;
        setLastSyncTime(new Date().toLocaleTimeString());
      } catch (err) {
        console.error(`Sync error on ${table}:`, err);
      } finally {
        setIsSyncing(false);
      }
    }, 1500); 
  };

  useEffect(() => { persist('tasks', tasks); }, [tasks]);
  useEffect(() => { persist('leads', leads); }, [leads]);
  useEffect(() => { persist('sales', sales); }, [sales]);
  useEffect(() => { persist('expenses', expenses); }, [expenses]);
  useEffect(() => { persist('content', content); }, [content]);
  useEffect(() => { persist('agents', agents); }, [agents]);
  useEffect(() => { persist('team_members', teamMembers); }, [teamMembers]);
  useEffect(() => { persist('versions', versions); }, [versions]);
  useEffect(() => { persist('batch_projects', batchProjects); }, [batchProjects]);
  useEffect(() => { persist('app_config', monthlyTarget as any, true); }, [monthlyTarget]);

  const exportToExcel = (dailyBreakdown: any[]) => {
    try {
      const wb = XLSX.utils.book_new();
      const sheetData = dailyBreakdown.map(d => ({
        'Date': d.date,
        'Revenue': d.totalRev,
        'Ad Spend': d.totalAds,
        'Profit': d.netProfit,
        'Web Rev': d.revWeb,
        'Call Rev': d.revCall,
        'Hand Cash Rev': d.revHandCash,
        'Batch Rev': d.revBatch
      }));
      const ws = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, "Financial Report");
      XLSX.writeFile(wb, `MatePro_Audit_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const stats = useMemo(() => {
    const dhakaNow = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Dhaka"}));
    const startOfMonth = new Date(dhakaNow.getFullYear(), dhakaNow.getMonth(), 1);
    const lastDay = new Date(dhakaNow.getFullYear(), dhakaNow.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(1, lastDay - dhakaNow.getDate() + 1);

    const showBatch = selectedSources.includes('batch');

    const filteredSales = sales.filter(s => selectedSources.includes(s.type));
    const monthSales = filteredSales.filter(s => new Date(s.createdAt) >= startOfMonth);
    const monthExpenses = expenses.filter(e => new Date(e.date) >= startOfMonth);
    const monthBatches = batchProjects.filter(b => new Date(b.createdAt) >= startOfMonth);

    const revWeb = monthSales.filter(s => s.type === 'website').reduce((acc, s) => acc + s.amount, 0);
    const revCall = monthSales.filter(s => s.type === 'call').reduce((acc, s) => acc + s.amount, 0);
    const revHandCash = monthSales.filter(s => s.type === 'hand_cash').reduce((acc, s) => acc + s.amount, 0);
    const revBatch = showBatch ? monthBatches.reduce((acc, b) => acc + b.students.reduce((sAcc, st) => sAcc + (Number(st.paid) || 0), 0), 0) : 0;

    const totalRevenue = revWeb + revCall + revHandCash + revBatch;
    const totalAdCost = monthSales.reduce((a, s) => a + (s.adCost || 0), 0) + (showBatch ? monthBatches.reduce((a, b) => a + b.adCosts.reduce((ca, co) => ca + (co.amount || 0), 0), 0) : 0);
    const operationalCosts = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalRevenue - totalAdCost - operationalCosts;

    const dailyBreakdown = [];
    for (let i = 1; i <= lastDay; i++) {
      const dStr = `${dhakaNow.getFullYear()}-${String(dhakaNow.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
      const dSales = filteredSales.filter(s => s.createdAt.startsWith(dStr));
      const dBatches = showBatch ? batchProjects.filter(b => b.createdAt.startsWith(dStr)) : [];
      const dExp = expenses.filter(e => e.date === dStr);

      const drW = dSales.filter(s => s.type === 'website').reduce((a, s) => a + s.amount, 0);
      const drC = dSales.filter(s => s.type === 'call').reduce((a, s) => a + s.amount, 0);
      const drH = dSales.filter(s => s.type === 'hand_cash').reduce((a, s) => a + s.amount, 0);
      const drB = dBatches.reduce((a, b) => a + b.students.reduce((sa, st) => sa + (Number(st.paid) || 0), 0), 0);
      
      const dRev = drW + drC + drH + drB;
      const dAds = dSales.reduce((a, s) => a + (s.adCost || 0), 0) + dBatches.reduce((a, b) => a + b.adCosts.reduce((ca, co) => ca + (co.amount || 0), 0), 0);
      const dOps = dExp.reduce((a, e) => a + e.amount, 0);

      if (dRev > 0 || dAds > 0 || dOps > 0) {
        dailyBreakdown.push({ date: dStr, totalAds: dAds, totalRev: dRev, netProfit: dRev - dAds - dOps, revWeb: drW, revCall: drC, revHandCash: drH, revBatch: drB });
      }
    }

    const agentLeaderboard = agents.map(agent => {
      const aSales = monthSales.filter(s => s.agentId === agent.id);
      const aBatchRev = showBatch ? batchProjects.reduce((acc, b) => 
        acc + b.students.filter(s => s.advisor === agent.name).reduce((sa, st) => sa + (Number(st.paid) || 0), 0), 0
      ) : 0;
      
      const rev = aSales.reduce((a, s) => a + s.amount, 0) + aBatchRev;
      const cost = aSales.reduce((a, s) => a + s.adCost, 0);
      
      const agentDaily = [];
      const dates = Array.from(new Set([...aSales.map(s => s.createdAt.split('T')[0]), ...batchProjects.map(b => b.createdAt.split('T')[0])]));
      for(const d of dates) {
        const dr = aSales.filter(s => s.createdAt.startsWith(d)).reduce((a, s) => a + s.amount, 0) + 
                   batchProjects.filter(b => b.createdAt.startsWith(d)).reduce((acc, b) => acc + b.students.filter(s => s.advisor === agent.name).reduce((sa, st) => sa + (Number(st.paid) || 0), 0), 0);
        if(dr > 0) agentDaily.push({ date: d, revenue: dr, profit: dr, adBurn: 0 });
      }

      return { ...agent, revenue: rev, adCost: cost, profit: rev - cost, roi: cost > 0 ? rev / cost : 0, count: aSales.length, dailyBreakdown: agentDaily };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue, totalAdCost, netProfit, 
      targetLeft: Math.max(0, monthlyTarget - totalRevenue),
      progressPercent: monthlyTarget > 0 ? (totalRevenue / monthlyTarget) * 100 : 0,
      dailyRequired: Math.max(0, (monthlyTarget - totalRevenue) / remainingDays),
      remainingDays,
      dailyBreakdown: dailyBreakdown.reverse(),
      agentLeaderboard,
      dhakaDate: dhakaNow.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      dhakaTime: dhakaNow.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  }, [sales, expenses, batchProjects, monthlyTarget, selectedSources, agents]);

  const [showResetModal, setShowResetModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupName, setBackupName] = useState('');

  const confirmBackup = () => {
    const newVersion: Version = {
      id: Math.random().toString(36).substr(2, 9),
      name: backupName || `Auto ${new Date().toLocaleDateString()}`,
      timestamp: new Date().toISOString(),
      data: { tasks, leads, sales, expenses, content, agents, teamMembers, monthlyTarget, batchProjects }
    };
    setVersions(prev => [newVersion, ...prev]);
    setShowBackupModal(false);
    setBackupName('');
  };

  if (isLoading) return <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 gap-6"><Loader2 className="w-16 h-16 text-red-600 animate-spin" /><h2 className="text-white font-black uppercase tracking-widest text-xl">LM PRO SECURING NODE...</h2></div>;

  return (
    <div className={`flex h-full overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-gray-50 text-gray-900'}`}>
      <aside className={`w-64 flex-shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-r flex flex-col hidden lg:flex z-40`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg font-black text-xl italic text-white">LM</div>
            <h1 className="font-bold text-lg leading-none italic uppercase">Mate Pro</h1>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
              <item.icon className="w-5 h-5" />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800/20 space-y-2 bg-slate-900/30">
          <button onClick={() => exportToExcel(stats.dailyBreakdown)} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"><Download className="w-4 h-4" /> Export Ledger</button>
          <button onClick={() => setShowBackupModal(true)} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-green-500 hover:bg-green-500/10 rounded-lg transition-all"><Save className="w-4 h-4" /> Snapshot</button>
          <button onClick={() => setShowResetModal(true)} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><RotateCcw className="w-4 h-4" /> Reset System</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className={`h-16 flex-shrink-0 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white/80 border-gray-200'} backdrop-blur-md border-b px-8 flex items-center justify-between z-30`}>
          <div className="flex items-center gap-4">
             <span className="text-xs font-bold uppercase text-slate-500 italic tracking-widest">{stats.dhakaDate} | {stats.dhakaTime}</span>
             {isSyncing && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          <button onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-slate-800 text-yellow-500 shadow-lg">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'dashboard' && <DashboardView stats={stats} monthlyTarget={monthlyTarget} onTargetChange={setMonthlyTarget} theme={theme} setSales={setSales} sales={sales} batchProjects={batchProjects} onReset={() => setShowResetModal(true)} onExport={() => exportToExcel(stats.dailyBreakdown)} onBackup={() => setShowBackupModal(true)} selectedSources={selectedSources} setSelectedSources={setSelectedSources} />}
          {activeTab === 'sales' && <SalesView leads={leads} setLeads={setLeads} sales={sales.filter(s => selectedSources.includes(s.type))} setSales={setSales} agents={agents} setAgents={setAgents} theme={theme} />}
          {activeTab === 'batch' && <BatchView batchProjects={batchProjects} setBatchProjects={setBatchProjects} agents={agents} theme={theme} />}
          {activeTab === 'expenses' && <ExpensesView expenses={expenses} setExpenses={setExpenses} agents={agents} theme={theme} />}
          {activeTab === 'calendar' && <CalendarView tasks={tasks} sales={sales.filter(s => selectedSources.includes(s.type))} expenses={expenses} theme={theme} teamMembers={teamMembers} agents={agents} filteredBatches={batchProjects} />}
          {activeTab === 'tasks' && <TasksView tasks={tasks} setTasks={setTasks} teamMembers={teamMembers} theme={theme} />}
          {activeTab === 'team' && <TeamView tasks={tasks} teamMembers={teamMembers} setTeamMembers={setTeamMembers} theme={theme} />}
          {activeTab === 'content' && <ContentView content={content} setContent={setContent} theme={theme} />}
          {activeTab === 'versions' && <VersionsView versions={versions} setVersions={setVersions} onRestore={v => { setTasks(v.data.tasks); setSales(v.data.sales); setExpenses(v.data.expenses); setBatchProjects(v.data.batchProjects || []); setActiveTab('dashboard'); }} onDelete={v => setVersions(prev => prev.filter(x => x.id !== v.id))} theme={theme} />}
        </div>
      </main>

      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
           <div className={`w-full max-w-md ${theme === 'dark' ? 'bg-slate-900 border-red-500/30' : 'bg-white border-gray-200'} border-2 rounded-[2.5rem] p-10 shadow-2xl`}>
              <div className="flex justify-center mb-6"><div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center"><AlertTriangle className="w-8 h-8 text-red-600" /></div></div>
              <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-center uppercase`}>Full System Reset</h3>
              <p className="text-slate-500 text-center text-sm mt-4 font-medium">Permanently wipe all operational history from the cloud?</p>
              <div className="flex flex-col gap-3 mt-8">
                 <button onClick={() => { setSales([]); setExpenses([]); setTasks([]); setLeads([]); setBatchProjects([]); setShowResetModal(false); }} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl">Confirm Wipe</button>
                 <button onClick={() => setShowResetModal(false)} className="w-full py-4 text-slate-500 font-bold uppercase text-[10px]">Cancel</button>
              </div>
           </div>
        </div>
      )}

      {showBackupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
           <div className={`w-full max-w-md ${theme === 'dark' ? 'bg-slate-900 border-blue-500/30' : 'bg-white border-gray-200'} border-2 rounded-[2.5rem] p-10 shadow-2xl`}>
              <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} uppercase mb-8`}>Commit Snapshot</h3>
              <input className={`w-full ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'} border-2 border-slate-800 rounded-2xl px-6 py-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold outline-none`} value={backupName} onChange={e => setBackupName(e.target.value)} placeholder="Snapshot Name..." />
              <button onClick={confirmBackup} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl mt-6">Confirm Backup</button>
              <button onClick={() => setShowBackupModal(false)} className="w-full py-4 text-slate-500 font-bold uppercase text-[10px] mt-2">Abort</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
