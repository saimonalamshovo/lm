
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
  RotateCcw,
  ShieldCheck,
  History,
  X,
  Download,
  Save,
  BarChart3,
  Loader2,
  CloudUpload,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';
import { Task, Lead, Sale, Expense, ContentItem, Agent, TeamMember, Version } from './types';
import { INITIAL_TEAM, INITIAL_AGENTS, DEFAULT_MONTHLY_TARGET } from './constants';

import DashboardView from './views/DashboardView';
import TasksView from './views/TasksView';
import TeamView from './views/TeamView';
import SalesView from './views/SalesView';
import ExpensesView from './views/ExpensesView';
import ContentView from './views/ContentView';
import CalendarView from './views/CalendarView';
import VersionsView from './views/VersionsView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [monthlyTarget, setMonthlyTarget] = useState<number>(DEFAULT_MONTHLY_TARGET);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM);
  const [versions, setVersions] = useState<Version[]>([]);

  const initialLoadDone = useRef(false);
  const syncTimeoutRef = useRef<Record<string, number>>({});

  const fetchAllData = async () => {
    setIsSyncing(true);
    try {
      const [
        { data: t }, { data: l }, { data: s }, { data: e }, 
        { data: c }, { data: a }, { data: tm }, { data: v }, { data: cfg }
      ] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('leads').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('content').select('*'),
        supabase.from('agents').select('*'),
        supabase.from('team_members').select('*'),
        supabase.from('versions').select('*'),
        supabase.from('app_config').select('*').eq('key', 'monthly_target').maybeSingle()
      ]);

      if (t) setTasks(t.map(item => item.data));
      if (l) setLeads(l.map(item => item.data));
      if (s) setSales(s.map(item => item.data));
      if (e) setExpenses(e.map(item => item.data));
      if (c) setContent(c.map(item => item.data));
      if (a && a.length > 0) setAgents(a.map(item => item.data));
      if (tm && tm.length > 0) setTeamMembers(tm.map(item => item.data));
      if (v) setVersions(v.map(item => item.data));
      if (cfg) setMonthlyTarget(cfg.value);

      const savedTheme = localStorage.getItem('lm_theme') as 'dark' | 'light';
      if (savedTheme) setTheme(savedTheme);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Cloud fetch error:", err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
      initialLoadDone.current = true;
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Optimized debounce persist using upsert
  const persist = async (table: string, data: any[], isConfig: boolean = false) => {
    if (!initialLoadDone.current) return;
    
    if (syncTimeoutRef.current[table]) {
      window.clearTimeout(syncTimeoutRef.current[table]);
    }

    syncTimeoutRef.current[table] = window.setTimeout(async () => {
      setIsSyncing(true);
      try {
        if (isConfig) {
          await supabase.from(table).upsert({ key: 'monthly_target', value: data });
        } else {
          // Efficient update: Send all items as a batch to upsert
          const rows = data.map(item => ({ 
            id: item.id || Math.random().toString(36).substr(2, 9), 
            data: item 
          }));
          
          if (rows.length > 0) {
            // First, clear current to ensure deletions are synced
            await supabase.from(table).delete().neq('id', 'SYSTEM_RESERVED_ROOT');
            // Then insert current state
            await supabase.from(table).insert(rows);
          } else {
            await supabase.from(table).delete().neq('id', 'SYSTEM_RESERVED_ROOT');
          }
        }
        setLastSyncTime(new Date().toLocaleTimeString());
      } catch (err) {
        console.error(`Sync error on ${table}:`, err);
      } finally {
        setIsSyncing(false);
      }
    }, 1000);
  };

  useEffect(() => { persist('tasks', tasks); }, [tasks]);
  useEffect(() => { persist('leads', leads); }, [leads]);
  useEffect(() => { persist('sales', sales); }, [sales]);
  useEffect(() => { persist('expenses', expenses); }, [expenses]);
  useEffect(() => { persist('content', content); }, [content]);
  useEffect(() => { persist('agents', agents); }, [agents]);
  useEffect(() => { persist('team_members', teamMembers); }, [teamMembers]);
  useEffect(() => { persist('versions', versions); }, [versions]);
  useEffect(() => { persist('app_config', monthlyTarget as any, true); }, [monthlyTarget]);

  const stats = useMemo(() => {
    const dhakaNow = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Dhaka"}));
    const currentDay = dhakaNow.getDate();
    const lastDayOfMonth = new Date(dhakaNow.getFullYear(), dhakaNow.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(1, lastDayOfMonth - currentDay + 1);
    const startOfMonth = new Date(dhakaNow.getFullYear(), dhakaNow.getMonth(), 1);
    const todayStr = dhakaNow.toISOString().split('T')[0];

    const currentMonthSales = sales.filter(s => new Date(s.createdAt) >= startOfMonth);
    const currentMonthExpenses = expenses.filter(e => new Date(e.date) >= startOfMonth);
    
    const totalRevenue = currentMonthSales.reduce((acc, s) => acc + (s.amount || 0), 0);
    const totalAdCost = currentMonthSales.reduce((acc, s) => acc + (s.adCost || 0), 0) + 
                       currentMonthExpenses.filter(e => e.type === 'adcost').reduce((acc, e) => acc + (e.amount || 0), 0);
    
    const operationalCosts = currentMonthExpenses.filter(e => e.type !== 'adcost').reduce((acc, e) => acc + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalAdCost - operationalCosts;
    const roi = totalAdCost > 0 ? (totalRevenue / totalAdCost) : 0;

    const targetLeft = Math.max(0, monthlyTarget - totalRevenue);
    const dailyRequired = targetLeft / remainingDays;

    const dailyBreakdown = [];
    for (let i = 1; i <= lastDayOfMonth; i++) {
      const date = new Date(dhakaNow.getFullYear(), dhakaNow.getMonth(), i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySales = sales.filter(s => s.createdAt.startsWith(dateStr));
      const dayExpenses = expenses.filter(e => e.date === dateStr);
      
      const revCall = daySales.filter(s => s.type === 'call').reduce((acc, s) => acc + (s.amount || 0), 0);
      const adsCall = daySales.filter(s => s.type === 'call').reduce((acc, s) => acc + (s.adCost || 0), 0);
      const revWeb = daySales.filter(s => s.type === 'website').reduce((acc, s) => acc + (s.amount || 0), 0);
      const adsWeb = daySales.filter(s => s.type === 'website').reduce((acc, s) => acc + (s.adCost || 0), 0);
      
      const directAdCosts = dayExpenses.filter(e => e.type === 'adcost').reduce((acc, e) => acc + (e.amount || 0), 0);
      const operationalExp = dayExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
      
      const dayTotalAds = adsCall + adsWeb + directAdCosts;
      const dayTotalRev = revCall + revWeb;
      const dayTotalExpAll = operationalExp + adsCall + adsWeb;
      const dayNetProfit = dayTotalRev - dayTotalExpAll;
      
      if (dayTotalRev > 0 || dayTotalAds > 0 || dayTotalExpAll > 0) {
        dailyBreakdown.push({
          date: dateStr, day: i, expenses: dayTotalExpAll, adsCall, revCall,
          adsWeb, revWeb, totalAds: dayTotalAds, totalRev: dayTotalRev, netProfit: dayNetProfit
        });
      }
    }

    return {
      totalRevenue, totalAdCost, netProfit, roi, targetLeft, dailyRequired,
      remainingDays, todayRevenue: sales.filter(s => s.createdAt.startsWith(todayStr)).reduce((acc, s) => acc + (s.amount || 0), 0),
      todayCount: sales.filter(s => s.createdAt.startsWith(todayStr)).length,
      dailyBreakdown: dailyBreakdown.reverse(),
      agentLeaderboard: agents.map(agent => {
        const agentSales = currentMonthSales.filter(s => s.agentId === agent.id);
        const rev = agentSales.reduce((acc, s) => acc + (s.amount || 0), 0);
        const cost = agentSales.reduce((acc, s) => acc + (s.adCost || 0), 0);
        return { ...agent, revenue: rev, adCost: cost, roi: cost > 0 ? (rev / cost) : 0, count: agentSales.length };
      }).sort((a, b) => b.revenue - a.revenue),
      callRevenue: currentMonthSales.filter(s => s.type === 'call').reduce((acc, s) => acc + (s.amount || 0), 0),
      websiteRevenue: currentMonthSales.filter(s => s.type === 'website').reduce((acc, s) => acc + (s.amount || 0), 0),
      dhakaTime: dhakaNow.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
      dhakaDate: dhakaNow.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
  }, [sales, expenses, monthlyTarget, agents]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 gap-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
          <CloudUpload className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-white font-black uppercase tracking-widest text-xl">Connecting to Cloud Matrix</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">Synchronizing global operations ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-gray-50 text-gray-900'} transition-colors duration-300 font-sans`}>
      <aside className={`w-64 flex-shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-r flex flex-col hidden lg:flex shadow-2xl z-40`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl italic">LM</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight">Learningmate</h1>
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Cloud Operations</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-red-600/10 text-red-500' 
                : `${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800/20 space-y-2">
          <div className="px-4 py-2 flex flex-col gap-1">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Last Cloud Handshake</span>
             <span className="text-[10px] font-bold text-slate-300">{lastSyncTime || 'Pending...'}</span>
          </div>
          <button 
            onClick={fetchAllData}
            className={`w-full flex items-center justify-center gap-2 py-3 ${theme === 'dark' ? 'bg-blue-600/10 text-blue-500 hover:bg-blue-600/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'} rounded-xl text-xs font-bold transition-all`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync from Cloud
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className={`h-16 flex-shrink-0 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white/80 border-gray-200'} backdrop-blur-md border-b px-8 flex items-center justify-between z-30 shadow-sm`}>
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Dhaka, BD</span>
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stats.dhakaTime}</span>
             </div>
             <div className={`h-8 w-[1px] ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`} />
             <div className="flex items-center gap-2">
                {isSyncing ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <CloudUpload className="w-3 h-3 text-blue-500 animate-pulse" />
                    <span className="text-[9px] font-black text-blue-500 uppercase">Saving to Cloud...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    <span className="text-[9px] font-black text-green-500 uppercase">Connected</span>
                  </div>
                )}
             </div>
          </div>
          <button onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          {activeTab === 'dashboard' && <DashboardView stats={stats} monthlyTarget={monthlyTarget} onTargetChange={setMonthlyTarget} theme={theme} setSales={setSales} sales={sales} />}
          {activeTab === 'sales' && <SalesView leads={leads} setLeads={setLeads} sales={sales} setSales={setSales} agents={agents} setAgents={setAgents} theme={theme} />}
          {activeTab === 'expenses' && <ExpensesView expenses={expenses} setExpenses={setExpenses} agents={agents} theme={theme} />}
          {activeTab === 'calendar' && <CalendarView tasks={tasks} sales={sales} expenses={expenses} theme={theme} teamMembers={teamMembers} agents={agents} />}
          {activeTab === 'tasks' && <TasksView tasks={tasks} setTasks={setTasks} teamMembers={teamMembers} theme={theme} />}
          {activeTab === 'team' && <TeamView tasks={tasks} teamMembers={teamMembers} setTeamMembers={setTeamMembers} theme={theme} />}
          {activeTab === 'content' && <ContentView content={content} setContent={setContent} theme={theme} />}
          {activeTab === 'versions' && <VersionsView versions={versions} setVersions={setVersions} onRestore={v => {
            if(confirm(`Restore "${v.name}"?`)) {
              setTasks(v.data.tasks); setLeads(v.data.leads); setSales(v.data.sales);
              setExpenses(v.data.expenses); setContent(v.data.content); setAgents(v.data.agents);
              setTeamMembers(v.data.teamMembers); setMonthlyTarget(v.data.monthlyTarget);
              setActiveTab('dashboard');
            }
          }} theme={theme} />}
        </div>
      </main>

      {/* Persistence Safety Modal if Sync Fails */}
      {!isLoading && !initialLoadDone.current && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90">
           <div className="bg-slate-900 border border-red-500/30 p-10 rounded-3xl max-w-sm text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl uppercase mb-2">Sync Error</h3>
              <p className="text-slate-400 text-sm mb-6">Unable to establish cloud connection. Check your internet or Supabase configuration.</p>
              <button onClick={() => window.location.reload()} className="w-full py-4 bg-red-600 text-white font-black rounded-xl">RETRY CONNECTION</button>
           </div>
        </div>
      )}
    </div>
  );
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales Hub', icon: TrendingUp },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'content', label: 'Content', icon: Film },
  { id: 'versions', label: 'History', icon: History },
];

export default App;
