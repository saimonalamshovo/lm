
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
  ShieldCheck,
  History,
  BarChart3,
  Loader2,
  CloudUpload,
  RefreshCw,
  AlertCircle,
  Download,
  RotateCcw,
  Save,
  X,
  AlertTriangle,
  ArrowRight,
  Trash2,
  LayoutGrid
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
  { id: 'batch', label: 'Batch/Live', icon: LayoutGrid },
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

  // Modals for Actions
  const [showResetModal, setShowResetModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteVersionModal, setShowDeleteVersionModal] = useState(false);
  
  const [backupName, setBackupName] = useState('');
  const [versionToRestore, setVersionToRestore] = useState<Version | null>(null);
  const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);

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
  const syncTimeoutRef = useRef<Record<string, number>>({});

  const fetchAllData = async () => {
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

      if (t) setTasks(t.map((item: any) => item.data));
      if (l) setLeads(l.map((item: any) => item.data));
      if (s) setSales(s.map((item: any) => item.data));
      if (e) setExpenses(e.map((item: any) => item.data));
      if (c) setContent(c.map((item: any) => item.data));
      if (a && a.length > 0) setAgents(a.map((item: any) => item.data));
      if (tm && tm.length > 0) setTeamMembers(tm.map((item: any) => item.data));
      if (v) setVersions(v.map((item: any) => item.data));
      if (cfg && cfg.value !== undefined) setMonthlyTarget(cfg.value);
      if (bp) setBatchProjects(bp.map((item: any) => item.data));

      const savedTheme = localStorage.getItem('lm_theme') as 'dark' | 'light';
      if (savedTheme) setTheme(savedTheme || 'dark');
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
          const rows = (data || []).map(item => ({ 
            id: item.id || Math.random().toString(36).substr(2, 9), 
            data: item 
          }));
          
          await supabase.from(table).delete().neq('id', 'SYSTEM_RESERVED_ROOT');
          if (rows.length > 0) {
            await supabase.from(table).insert(rows);
          }
        }
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

  const confirmReset = () => {
    setSales([]);
    setExpenses([]);
    setTasks([]);
    setLeads([]);
    setContent([]);
    setBatchProjects([]);
    setAgents(INITIAL_AGENTS);
    setTeamMembers(INITIAL_TEAM);
    setMonthlyTarget(DEFAULT_MONTHLY_TARGET);
    setShowResetModal(false);
    alert("System Cleared Successfully.");
  };

  const confirmBackup = () => {
    if (!backupName.trim()) return;
    const newVersion: Version = {
      id: Math.random().toString(36).substr(2, 9),
      name: backupName,
      timestamp: new Date().toISOString(),
      data: {
        tasks: JSON.parse(JSON.stringify(tasks)),
        leads: JSON.parse(JSON.stringify(leads)),
        sales: JSON.parse(JSON.stringify(sales)),
        expenses: JSON.parse(JSON.stringify(expenses)),
        content: JSON.parse(JSON.stringify(content)),
        agents: JSON.parse(JSON.stringify(agents)),
        teamMembers: JSON.parse(JSON.stringify(teamMembers)),
        batchProjects: JSON.parse(JSON.stringify(batchProjects)),
        monthlyTarget
      }
    };
    setVersions(prev => [newVersion, ...prev]);
    setBackupName('');
    setShowBackupModal(false);
    alert("Backup Point Created.");
  };

  const confirmRestore = () => {
    if (!versionToRestore) return;
    const v = versionToRestore;
    setTasks(JSON.parse(JSON.stringify(v.data.tasks || [])));
    setLeads(JSON.parse(JSON.stringify(v.data.leads || [])));
    setSales(JSON.parse(JSON.stringify(v.data.sales || [])));
    setExpenses(JSON.parse(JSON.stringify(v.data.expenses || [])));
    setContent(JSON.parse(JSON.stringify(v.data.content || [])));
    setAgents(JSON.parse(JSON.stringify(v.data.agents || INITIAL_AGENTS)));
    setTeamMembers(JSON.parse(JSON.stringify(v.data.teamMembers || INITIAL_TEAM)));
    setBatchProjects(JSON.parse(JSON.stringify(v.data.batchProjects || [])));
    setMonthlyTarget(v.data.monthlyTarget || DEFAULT_MONTHLY_TARGET);
    
    setShowRestoreModal(false);
    setVersionToRestore(null);
    setActiveTab('dashboard');
    alert(`Restored to point: ${v.name}`);
  };

  const confirmDeleteVersion = () => {
    if (!versionToDelete) return;
    setVersions(prev => prev.filter(v => v.id !== versionToDelete.id));
    setShowDeleteVersionModal(false);
    setVersionToDelete(null);
  };

  const exportToExcel = (dailyBreakdown: any[]) => {
    try {
      const wb = XLSX.utils.book_new();
      
      // 1. Monthly Ledger (Summary)
      const ledgerSheetData = (dailyBreakdown || []).map(d => ({
        'Date': d.date,
        'Operational Expenses': d.expenses,
        'Ads Cost (Call)': d.adsCall,
        'Revenue (Call)': d.revCall,
        'Ads Cost (Web)': d.adsWeb,
        'Revenue (Web)': d.revWeb,
        'Total Ad Spend': d.totalAds,
        'Total Gross Revenue': d.totalRev,
        'Net Profit': d.netProfit
      }));
      const ws1 = XLSX.utils.json_to_sheet(ledgerSheetData);
      XLSX.utils.book_append_sheet(wb, ws1, "Monthly Summary");

      // 2. Full Sales Log
      const salesSheetData = (sales || []).map(s => ({
        'Date/Time': new Date(s.createdAt).toLocaleString(),
        'Channel': s.type.toUpperCase(),
        'Revenue Amount': s.amount,
        'Associated Ad Cost': s.adCost,
        'Assigned Agent': agents.find(a => a.id === s.agentId)?.name || 'Direct Order',
        'Sales ID': s.id
      }));
      const ws2 = XLSX.utils.json_to_sheet(salesSheetData);
      XLSX.utils.book_append_sheet(wb, ws2, "Full Sales Log");

      // 3. Full Expenses Log
      const expensesSheetData = (expenses || []).map(e => ({
        'Date': e.date,
        'Category': e.type.toUpperCase(),
        'Amount': e.amount,
        'Description/Justification': e.description || 'N/A',
        'Logged At': new Date(e.createdAt).toLocaleString()
      }));
      const ws3 = XLSX.utils.json_to_sheet(expensesSheetData);
      XLSX.utils.book_append_sheet(wb, ws3, "Expenses Registry");

      // Save the file
      const fileName = `Learningmate_Full_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Export error:", err);
      alert("System could not generate Excel file. Check browser permissions.");
    }
  };

  const stats = useMemo(() => {
    const dhakaNow = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Dhaka"}));
    const currentDay = dhakaNow.getDate();
    const lastDayOfMonth = new Date(dhakaNow.getFullYear(), dhakaNow.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(1, lastDayOfMonth - currentDay + 1);
    const startOfMonth = new Date(dhakaNow.getFullYear(), dhakaNow.getMonth(), 1);
    const todayStr = dhakaNow.toISOString().split('T')[0];

    const currentMonthSales = (sales || []).filter(s => new Date(s.createdAt) >= startOfMonth);
    const currentMonthExpenses = (expenses || []).filter(e => new Date(e.date) >= startOfMonth);
    const currentMonthBatches = (batchProjects || []).filter(b => new Date(b.createdAt) >= startOfMonth);
    
    // Batch Revenue is the sum of all "paid" amounts in current month batches
    const batchRevenueTotal = currentMonthBatches.reduce((acc, b) => 
      acc + b.students.reduce((sAcc, student) => sAcc + (Number(student.paid) || 0), 0), 0
    );
    const batchAdCostTotal = currentMonthBatches.reduce((acc, b) => 
      acc + b.adCosts.reduce((cAcc, cost) => cAcc + (Number(cost.amount) || 0), 0), 0
    );

    const totalRevenue = currentMonthSales.reduce((acc, s) => acc + (s.amount || 0), 0) + batchRevenueTotal;
    const totalAdCost = currentMonthSales.reduce((acc, s) => acc + (s.adCost || 0), 0) + 
                       currentMonthExpenses.filter(e => e.type === 'adcost').reduce((acc, e) => acc + (e.amount || 0), 0) +
                       batchAdCostTotal;
    
    const operationalCosts = currentMonthExpenses.filter(e => e.type !== 'adcost').reduce((acc, e) => acc + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalAdCost - operationalCosts;
    const roi = totalAdCost > 0 ? (totalRevenue / totalAdCost) : 0;

    const targetLeft = Math.max(0, (monthlyTarget || 0) - totalRevenue);
    const dailyRequired = targetLeft / remainingDays;

    const todaySales = (sales || []).filter(s => s.createdAt.startsWith(todayStr));
    const todayBatches = (batchProjects || []).filter(b => b.createdAt.startsWith(todayStr));
    
    const todayRevenue = todaySales.reduce((acc, s) => acc + (s.amount || 0), 0) + 
                        todayBatches.reduce((acc, b) => acc + b.students.reduce((sAcc, st) => sAcc + (Number(st.paid) || 0), 0), 0);
    
    const todayAdCost = todaySales.reduce((acc, s) => acc + (s.adCost || 0), 0) + 
                       (expenses || []).filter(e => e.date === todayStr && e.type === 'adcost').reduce((acc, e) => acc + (e.amount || 0), 0) +
                       todayBatches.reduce((acc, b) => acc + b.adCosts.reduce((cAcc, co) => cAcc + (Number(co.amount) || 0), 0), 0);
    
    const todayNetProfit = todayRevenue - todayAdCost - (expenses || []).filter(e => e.date === todayStr && e.type !== 'adcost').reduce((acc, e) => acc + (e.amount || 0), 0);

    const dailyBreakdown = [];
    for (let i = 1; i <= lastDayOfMonth; i++) {
      const date = new Date(dhakaNow.getFullYear(), dhakaNow.getMonth(), i);
      const dateStr = date.toISOString().split('T')[0];
      const daySales = (sales || []).filter(s => s.createdAt.startsWith(dateStr));
      const dayExpenses = (expenses || []).filter(e => e.date === dateStr);
      const dayBatches = (batchProjects || []).filter(b => b.createdAt.startsWith(dateStr));

      const revCall = daySales.filter(s => s.type === 'call').reduce((acc, s) => acc + (s.amount || 0), 0);
      const adsCall = daySales.filter(s => s.type === 'call').reduce((acc, s) => acc + (s.adCost || 0), 0);
      const revWeb = daySales.filter(s => s.type === 'website').reduce((acc, s) => acc + (s.amount || 0), 0);
      const adsWeb = daySales.filter(s => s.type === 'website').reduce((acc, s) => acc + (s.adCost || 0), 0);
      
      const revBatch = dayBatches.reduce((acc, b) => acc + b.students.reduce((sAcc, st) => sAcc + (Number(st.paid) || 0), 0), 0);
      const adsBatch = dayBatches.reduce((acc, b) => acc + b.adCosts.reduce((cAcc, co) => cAcc + (Number(co.amount) || 0), 0), 0);

      const directAdCosts = dayExpenses.filter(e => e.type === 'adcost').reduce((acc, e) => acc + (e.amount || 0), 0);
      const operationalExp = dayExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
      
      const dayTotalAds = adsCall + adsWeb + adsBatch + directAdCosts;
      const dayTotalRev = revCall + revWeb + revBatch;
      const dayTotalExpAll = operationalExp + adsCall + adsWeb + adsBatch;
      const dayNetProfit = dayTotalRev - dayTotalExpAll;
      
      if (dayTotalRev > 0 || dayTotalAds > 0 || dayTotalExpAll > 0) {
        dailyBreakdown.push({ date: dateStr, day: i, expenses: dayTotalExpAll, adsCall, revCall, adsWeb, revWeb, adsBatch, revBatch, totalAds: dayTotalAds, totalRev: dayTotalRev, netProfit: dayNetProfit });
      }
    }

    // Individual Agent Leaderboard with Daily Breakdowns
    const agentLeaderboard = (agents || []).map(agent => {
      const agentSales = currentMonthSales.filter(s => s.agentId === agent.id);
      
      // Also attribute batch student "paid" revenue if advisor matches agent name
      const agentBatchRevenue = (batchProjects || []).reduce((acc, b) => 
        acc + b.students.filter(s => s.advisor === agent.name).reduce((sAcc, st) => sAcc + (Number(st.paid) || 0), 0), 0
      );

      const rev = agentSales.reduce((acc, s) => acc + (s.amount || 0), 0) + agentBatchRevenue;
      const cost = agentSales.reduce((acc, s) => acc + (s.adCost || 0), 0);
      
      // Calculate daily stats for the specific agent
      const agentDaily = [];
      const agentActiveDates = Array.from(new Set([
        ...agentSales.map(s => s.createdAt.split('T')[0]),
        ...(batchProjects || []).filter(b => b.students.some(s => s.advisor === agent.name)).map(b => b.createdAt.split('T')[0])
      ]));

      for (const dStr of agentActiveDates) {
        const dSales = agentSales.filter(s => s.createdAt.startsWith(dStr));
        const dBatchRev = (batchProjects || []).filter(b => b.createdAt.startsWith(dStr)).reduce((acc, b) => 
          acc + b.students.filter(s => s.advisor === agent.name).reduce((sAcc, st) => sAcc + (Number(st.paid) || 0), 0), 0
        );
        const dRev = dSales.reduce((acc, s) => acc + (s.amount || 0), 0) + dBatchRev;
        const dCost = dSales.reduce((acc, s) => acc + (s.adCost || 0), 0);
        agentDaily.push({
          date: dStr,
          revenue: dRev,
          adBurn: dCost,
          profit: dRev - dCost
        });
      }

      return { 
        ...agent, 
        revenue: rev, 
        adCost: cost, 
        profit: rev - cost,
        roi: cost > 0 ? (rev / cost) : 0, 
        count: agentSales.length,
        dailyBreakdown: agentDaily.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue, totalAdCost, netProfit, roi, targetLeft, dailyRequired,
      remainingDays, todayRevenue, todayAdCost, todayNetProfit,
      todayCount: todaySales.length,
      dailyBreakdown: dailyBreakdown.reverse(),
      agentLeaderboard,
      callRevenue: currentMonthSales.filter(s => s.type === 'call').reduce((acc, s) => acc + (s.amount || 0), 0),
      websiteRevenue: currentMonthSales.filter(s => s.type === 'website').reduce((acc, s) => acc + (s.amount || 0), 0),
      batchRevenue: batchRevenueTotal,
      dhakaTime: dhakaNow.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
      dhakaDate: dhakaNow.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
  }, [sales, expenses, monthlyTarget, agents, batchProjects]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 gap-6">
        <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
        <h2 className="text-white font-black uppercase tracking-widest text-xl">Learningmate Pro</h2>
      </div>
    );
  }

  const sidebarClass = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const navBtnClass = (id: string) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === id ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`;

  return (
    <div className={`flex h-full overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-gray-50 text-gray-900'}`}>
      <aside className={`w-64 flex-shrink-0 ${sidebarClass} border-r flex flex-col hidden lg:flex z-40`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg"><span className="text-white font-black text-xl italic">LM</span></div>
            <div><h1 className="font-bold text-lg leading-none">Management</h1></div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={navBtnClass(item.id)}>
              <item.icon className="w-5 h-5" />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800/20 space-y-2 bg-slate-900/30">
          <button onClick={() => exportToExcel(stats.dailyBreakdown)} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all">
            <Download className="w-4 h-4" /> Export Ledger
          </button>
          <button onClick={() => { setBackupName(`Snapshot ${new Date().toLocaleDateString()}`); setShowBackupModal(true); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-green-500 hover:bg-green-500/10 rounded-lg transition-all">
            <Save className="w-4 h-4" /> Create Backup
          </button>
          <button onClick={() => setShowResetModal(true)} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
            <RotateCcw className="w-4 h-4" /> Reset All Data
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className={`h-16 flex-shrink-0 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white/80 border-gray-200'} backdrop-blur-md border-b px-8 flex items-center justify-between z-30`}>
          <div className="flex items-center gap-4">
             <span className="text-xs font-bold uppercase text-slate-500">{stats.dhakaDate} | {stats.dhakaTime}</span>
             {isSyncing && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          <button onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-slate-800 text-yellow-500 shadow-lg">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <DashboardView stats={stats} monthlyTarget={monthlyTarget} onTargetChange={setMonthlyTarget} theme={theme} setSales={setSales} sales={sales} batchProjects={batchProjects} onReset={() => setShowResetModal(true)} onExport={() => exportToExcel(stats.dailyBreakdown)} onBackup={() => { setBackupName(`Snapshot ${new Date().toLocaleDateString()}`); setShowBackupModal(true); }} />}
          {activeTab === 'sales' && <SalesView leads={leads} setLeads={setLeads} sales={sales} setSales={setSales} agents={agents} setAgents={setAgents} theme={theme} />}
          {activeTab === 'batch' && <BatchView batchProjects={batchProjects} setBatchProjects={setBatchProjects} agents={agents} theme={theme} />}
          {activeTab === 'expenses' && <ExpensesView expenses={expenses} setExpenses={setExpenses} agents={agents} theme={theme} />}
          {activeTab === 'calendar' && <CalendarView tasks={tasks} sales={sales} expenses={expenses} theme={theme} teamMembers={teamMembers} agents={agents} />}
          {activeTab === 'tasks' && <TasksView tasks={tasks} setTasks={setTasks} teamMembers={teamMembers} theme={theme} />}
          {activeTab === 'team' && <TeamView tasks={tasks} teamMembers={teamMembers} setTeamMembers={setTeamMembers} theme={theme} />}
          {activeTab === 'content' && <ContentView content={content} setContent={setContent} theme={theme} />}
          {activeTab === 'versions' && (
            <VersionsView 
              versions={versions} 
              setVersions={setVersions} 
              onRestore={v => { setVersionToRestore(v); setShowRestoreModal(true); }} 
              onDelete={v => { setVersionToDelete(v); setShowDeleteVersionModal(true); }}
              theme={theme} 
            />
          )}
        </div>
      </main>

      {/* MODAL: RESET CONFIRMATION */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
           <div className={`w-full max-w-md ${theme === 'dark' ? 'bg-slate-900 border-red-500/30' : 'bg-white border-gray-200'} border-2 rounded-[2.5rem] p-10 shadow-2xl`}>
              <div className="flex justify-center mb-6"><div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center"><AlertTriangle className="w-8 h-8 text-red-600" /></div></div>
              <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-center uppercase tracking-tight`}>Danger: System Wipe</h3>
              <p className="text-slate-500 text-center text-sm mt-4 leading-relaxed font-medium">This will permanently delete all sales, leads, tasks, and operational history. Changes are irreversible.</p>
              <div className="flex flex-col gap-3 mt-8">
                 <button onClick={confirmReset} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-red-900/30">Wipe Everything</button>
                 <button onClick={() => setShowResetModal(false)} className="w-full py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Abort Mission</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: DELETE VERSION CONFIRMATION */}
      {showDeleteVersionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
           <div className={`w-full max-w-md ${theme === 'dark' ? 'bg-slate-900 border-red-500/30' : 'bg-white border-gray-200'} border-2 rounded-[2.5rem] p-10 shadow-2xl`}>
              <div className="flex justify-center mb-6"><div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center"><Trash2 className="w-8 h-8 text-red-600" /></div></div>
              <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-center uppercase tracking-tight`}>Delete History Point?</h3>
              <p className="text-slate-500 text-center text-sm mt-4 leading-relaxed font-medium">Are you sure you want to remove the snapshot "<span className="text-red-500 font-bold">{versionToDelete?.name}</span>"? This cannot be undone.</p>
              <div className="flex flex-col gap-3 mt-8">
                 <button onClick={confirmDeleteVersion} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-red-900/30">Permanently Delete</button>
                 <button onClick={() => { setShowDeleteVersionModal(false); setVersionToDelete(null); }} className="w-full py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: RESTORE CONFIRMATION */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
           <div className={`w-full max-w-md ${theme === 'dark' ? 'bg-slate-900 border-blue-500/30' : 'bg-white border-gray-200'} border-2 rounded-[2.5rem] p-10 shadow-2xl`}>
              <div className="flex justify-center mb-6"><div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center"><RotateCcw className="w-8 h-8 text-blue-600" /></div></div>
              <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-center uppercase tracking-tight`}>Restore Progress?</h3>
              <p className="text-slate-500 text-center text-sm mt-4 leading-relaxed font-medium">This will replace all current data with the state from "<span className="text-blue-500 font-bold">{versionToRestore?.name}</span>". Any unsaved current changes will be lost.</p>
              <div className="flex flex-col gap-3 mt-8">
                 <button onClick={confirmRestore} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-blue-900/30">Confirm Restore</button>
                 <button onClick={() => { setShowRestoreModal(false); setVersionToRestore(null); }} className="w-full py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: BACKUP PROMPT */}
      {showBackupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
           <div className={`w-full max-w-md ${theme === 'dark' ? 'bg-slate-900 border-blue-500/30' : 'bg-white border-gray-200'} border-2 rounded-[2.5rem] p-10 shadow-2xl`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} uppercase tracking-tight`}>Create Backup</h3>
                <button onClick={() => setShowBackupModal(false)} className="text-slate-500"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Snapshot Label</label>
                 <input 
                   autoFocus
                   className={`w-full ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'} border-2 border-slate-800 rounded-2xl px-6 py-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold outline-none focus:ring-2 focus:ring-blue-600`}
                   value={backupName}
                   onChange={e => setBackupName(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && confirmBackup()}
                 />
                 <button onClick={confirmBackup} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-blue-900/30 mt-4">Commit Snapshot</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
