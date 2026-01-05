
import React, { useState, useEffect, useMemo } from 'react';
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
  BarChart3
} from 'lucide-react';
import * as XLSX from 'xlsx';
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
  const [theme, setTheme] = useState<'dark' | 'light'>(() => 
    (localStorage.getItem('lm_theme') as 'dark' | 'light') || 'dark'
  );

  const [monthlyTarget, setMonthlyTarget] = useState<number>(() => {
    const saved = localStorage.getItem('lm_target');
    const parsed = saved ? parseInt(saved) : DEFAULT_MONTHLY_TARGET;
    return isNaN(parsed) ? DEFAULT_MONTHLY_TARGET : parsed;
  });

  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('lm_tasks') || '[]'));
  const [leads, setLeads] = useState<Lead[]>(() => JSON.parse(localStorage.getItem('lm_leads') || '[]'));
  const [sales, setSales] = useState<Sale[]>(() => JSON.parse(localStorage.getItem('lm_sales') || '[]'));
  const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('lm_expenses') || '[]'));
  const [content, setContent] = useState<ContentItem[]>(() => JSON.parse(localStorage.getItem('lm_content') || '[]'));
  const [agents, setAgents] = useState<Agent[]>(() => JSON.parse(localStorage.getItem('lm_agents') || JSON.stringify(INITIAL_AGENTS)));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => JSON.parse(localStorage.getItem('lm_team') || JSON.stringify(INITIAL_TEAM)));
  const [versions, setVersions] = useState<Version[]>(() => JSON.parse(localStorage.getItem('lm_versions') || '[]'));

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');

  const handleTargetChange = (val: number) => {
    setMonthlyTarget(val);
  };

  useEffect(() => {
    localStorage.setItem('lm_tasks', JSON.stringify(tasks));
    localStorage.setItem('lm_leads', JSON.stringify(leads));
    localStorage.setItem('lm_sales', JSON.stringify(sales));
    localStorage.setItem('lm_expenses', JSON.stringify(expenses));
    localStorage.setItem('lm_content', JSON.stringify(content));
    localStorage.setItem('lm_agents', JSON.stringify(agents));
    localStorage.setItem('lm_team', JSON.stringify(teamMembers));
    localStorage.setItem('lm_versions', JSON.stringify(versions));
    localStorage.setItem('lm_target', monthlyTarget.toString());
    localStorage.setItem('lm_theme', theme);
    
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('bg-slate-950');
      root.classList.add('bg-gray-50');
    } else {
      root.classList.remove('bg-gray-50');
      root.classList.add('bg-slate-950');
    }
  }, [tasks, leads, sales, expenses, content, agents, teamMembers, monthlyTarget, theme, versions]);

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
    const callRevenue = currentMonthSales.filter(s => s.type === 'call').reduce((acc, s) => acc + (s.amount || 0), 0);
    const websiteRevenue = currentMonthSales.filter(s => s.type === 'website').reduce((acc, s) => acc + (s.amount || 0), 0);

    const totalAdCost = currentMonthSales.reduce((acc, s) => acc + (s.adCost || 0), 0) + 
                       currentMonthExpenses.filter(e => e.type === 'adcost').reduce((acc, e) => acc + (e.amount || 0), 0);
    
    const operationalCosts = currentMonthExpenses.filter(e => e.type !== 'adcost').reduce((acc, e) => acc + (e.amount || 0), 0);
    
    // Profit Calculation: Total Sales - (Ad Cost + Expenses)
    const netProfit = totalRevenue - totalAdCost - operationalCosts;
    const roi = totalAdCost > 0 ? (totalRevenue / totalAdCost) : 0;

    const targetLeft = Math.max(0, monthlyTarget - totalRevenue);
    const dailyRequired = targetLeft / remainingDays;

    const agentLeaderboard = agents.map(agent => {
      const agentSales = currentMonthSales.filter(s => s.agentId === agent.id);
      const rev = agentSales.reduce((acc, s) => acc + (s.amount || 0), 0);
      const cost = agentSales.reduce((acc, s) => acc + (s.adCost || 0), 0);
      const agentRoi = cost > 0 ? (rev / cost) : 0;
      return { ...agent, revenue: rev, adCost: cost, roi: agentRoi, count: agentSales.length };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalAdCost,
      netProfit,
      roi,
      targetLeft,
      dailyRequired,
      remainingDays,
      todayRevenue: sales.filter(s => s.createdAt.startsWith(todayStr)).reduce((acc, s) => acc + s.amount, 0),
      agentLeaderboard,
      callRevenue,
      websiteRevenue,
      dhakaTime: dhakaNow.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
      dhakaDate: dhakaNow.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
  }, [sales, expenses, monthlyTarget, agents]);

  const exportData = () => {
    // 1. Dashboard Summary Sheet
    const summaryData = [
      ["Metric", "Value"],
      ["Report Date", stats.dhakaDate],
      ["Monthly Target", monthlyTarget],
      ["Total Revenue", stats.totalRevenue],
      ["Revenue Gap", stats.targetLeft],
      ["Daily Goal Required", Math.round(stats.dailyRequired)],
      ["Total Ad Spend", stats.totalAdCost],
      ["Operational Expenses", expenses.filter(e => e.type !== 'adcost').reduce((acc, e) => acc + (e.amount || 0), 0)],
      ["Net Profit", stats.netProfit],
      ["Global ROI", stats.roi.toFixed(2)],
      ["Total Sales Count", sales.length]
    ];

    // 2. Sales Data Sheet
    const salesExport = sales.map(s => {
      const agent = agents.find(a => a.id === s.agentId);
      return {
        "Transaction ID": s.id,
        "Date": s.createdAt,
        "Channel": s.type.toUpperCase(),
        "Agent Name": agent?.name || "Website (Direct)",
        "Revenue (৳)": s.amount,
        "Ad Cost (৳)": s.adCost,
        "ROI": s.adCost > 0 ? (s.amount / s.adCost).toFixed(2) : "N/A"
      };
    });

    // 3. Expenses Data Sheet
    const expensesExport = expenses.map(e => ({
      "Expense ID": e.id,
      "Date": e.date,
      "Category": e.type.toUpperCase(),
      "Description": e.description,
      "Amount (৳)": e.amount
    }));

    // Create workbook and add sheets
    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    const wsSales = XLSX.utils.json_to_sheet(salesExport);
    const wsExpenses = XLSX.utils.json_to_sheet(expensesExport);

    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsSales, "Sales");
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Expenses");

    // Write file
    XLSX.writeFile(wb, `Learningmate_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  const restoreVersion = (version: Version) => {
    if (!version || !version.data) return;
    if (confirm(`RESTORE ARCHIVE: Overwrite all data with "${version.name}"?`)) {
      const { data } = version;
      setTasks(JSON.parse(JSON.stringify(data.tasks ?? [])));
      setLeads(JSON.parse(JSON.stringify(data.leads ?? [])));
      setSales(JSON.parse(JSON.stringify(data.sales ?? [])).map((s:any) => ({ ...s, type: s.type || 'call' })));
      setExpenses(JSON.parse(JSON.stringify(data.expenses ?? [])));
      setContent(JSON.parse(JSON.stringify(data.content ?? [])));
      setAgents(JSON.parse(JSON.stringify(data.agents ?? INITIAL_AGENTS)));
      setTeamMembers(JSON.parse(JSON.stringify(data.teamMembers ?? INITIAL_TEAM)));
      setMonthlyTarget(Number(data.monthlyTarget) || DEFAULT_MONTHLY_TARGET);
      setActiveTab('dashboard');
    }
  };

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
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Operational Hub</span>
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
          <button 
            onClick={exportData}
            className={`w-full flex items-center justify-center gap-2 py-3 ${theme === 'dark' ? 'bg-green-600/10 text-green-500 hover:bg-green-600/20' : 'bg-green-50 text-green-600 hover:bg-green-100'} rounded-xl text-xs font-bold transition-all`}
          >
            <Download className="w-4 h-4" />
            Full Data Export (.xlsx)
          </button>
          <button 
            onClick={() => setIsVersionModalOpen(true)}
            className={`w-full flex items-center justify-center gap-2 py-3 ${theme === 'dark' ? 'bg-slate-800/50 hover:bg-blue-900/10 text-slate-500 hover:text-blue-500' : 'bg-gray-100 hover:bg-blue-50 text-gray-400 hover:text-blue-600'} rounded-xl text-xs font-bold transition-all`}
          >
            <RotateCcw className="w-4 h-4" />
            Snapshot / Archive
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
             <span className="text-xs font-semibold text-slate-400">{stats.dhakaDate}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className={`w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} flex items-center justify-center border border-slate-700/50 shadow-sm`}>
               <ShieldCheck className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          {activeTab === 'dashboard' && <DashboardView stats={stats} monthlyTarget={monthlyTarget} onTargetChange={handleTargetChange} theme={theme} setSales={setSales} sales={sales} />}
          {activeTab === 'sales' && <SalesView leads={leads} setLeads={setLeads} sales={sales} setSales={setSales} agents={agents} setAgents={setAgents} theme={theme} />}
          {activeTab === 'expenses' && <ExpensesView expenses={expenses} setExpenses={setExpenses} agents={agents} theme={theme} />}
          {activeTab === 'calendar' && <CalendarView tasks={tasks} sales={sales} expenses={expenses} theme={theme} teamMembers={teamMembers} agents={agents} />}
          {activeTab === 'tasks' && <TasksView tasks={tasks} setTasks={setTasks} teamMembers={teamMembers} theme={theme} />}
          {activeTab === 'team' && <TeamView tasks={tasks} teamMembers={teamMembers} setTeamMembers={setTeamMembers} theme={theme} />}
          {activeTab === 'content' && <ContentView content={content} setContent={setContent} theme={theme} />}
          {activeTab === 'versions' && <VersionsView versions={versions} setVersions={setVersions} onRestore={restoreVersion} theme={theme} />}
        </div>
      </main>

      {isVersionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
           <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-3xl p-10 w-full max-w-md shadow-2xl`}>
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-bold uppercase tracking-tight">Archive Data State</h3>
                 <button onClick={() => setIsVersionModalOpen(false)}><X className="w-6 h-6 text-slate-500 hover:text-red-500" /></button>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Snapshot Label</label>
                   <input 
                    placeholder="e.g. End of Feb Cycle" 
                    className={`w-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-red-600 font-bold`}
                    value={newVersionName} 
                    onChange={e => setNewVersionName(e.target.value)}
                    autoFocus
                   />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsVersionModalOpen(false)} className={`flex-1 py-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'} font-bold rounded-2xl`}>CANCEL</button>
                    <button 
                      onClick={() => {
                        if (!newVersionName.trim()) return alert("Name required");
                        const currentData = { tasks, leads, sales, expenses, content, agents, teamMembers, monthlyTarget };
                        setVersions(prev => [{ id: Math.random().toString(36).substr(2, 9), name: newVersionName, timestamp: new Date().toISOString(), data: currentData }, ...prev]);
                        setTasks([]); setLeads([]); setSales([]); setExpenses([]); setContent([]);
                        setIsVersionModalOpen(false); setNewVersionName(''); setActiveTab('dashboard');
                      }} 
                      className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-xl uppercase"
                    >
                      SAVE & CLEAR
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
