import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import * as XLSX from 'xlsx';
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
  History,
  X,
  Download,
} from 'lucide-react';

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

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');

  // 🔥 LOAD ALL DATA FROM SUPABASE (ONCE)
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('app_data')
        .select('data')
        .eq('id', 'main')
        .single();

      if (!data?.data) return;

      const d = data.data;
      setSales(d.sales || []);
      setExpenses(d.expenses || []);
      setTasks(d.tasks || []);
      setLeads(d.leads || []);
      setContent(d.content || []);
      setAgents(d.agents || INITIAL_AGENTS);
      setTeamMembers(d.teamMembers || INITIAL_TEAM);
      setVersions(d.versions || []);
      setMonthlyTarget(d.monthlyTarget || DEFAULT_MONTHLY_TARGET);
      setTheme(d.theme || 'dark');
    };

    load();
  }, []);

  // 🔥 AUTO SAVE EVERYTHING TO CLOUD
  useEffect(() => {
    const save = async () => {
      await supabase.from('app_data').upsert({
        id: 'main',
        data: {
          sales,
          expenses,
          tasks,
          leads,
          content,
          agents,
          teamMembers,
          versions,
          monthlyTarget,
          theme,
        },
        updated_at: new Date(),
      });
    };

    save();
  }, [sales, expenses, tasks, leads, content, agents, teamMembers, versions, monthlyTarget, theme]);

  // 🔥 STATS (unchanged logic)
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((a, b) => a + (b.amount || 0), 0);
    const totalAdCost = sales.reduce((a, b) => a + (b.adCost || 0), 0);
    const netProfit = totalRevenue - totalAdCost;
    const roi = totalAdCost > 0 ? totalRevenue / totalAdCost : 0;

    return {
      totalRevenue,
      totalAdCost,
      netProfit,
      roi,
    };
  }, [sales]);

  // 🔥 EXPORT
  const exportData = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sales);
    XLSX.utils.book_append_sheet(wb, ws, 'Sales');
    XLSX.writeFile(wb, 'Learningmate_Data.xlsx');
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

  return (
    <div className={`flex h-full ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-black'}`}>
      <aside className="w-64 bg-slate-900 p-4 hidden lg:block">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="w-full flex items-center gap-3 p-3 rounded hover:bg-slate-800"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardView stats={stats} monthlyTarget={monthlyTarget} onTargetChange={setMonthlyTarget} theme={theme} sales={sales} setSales={setSales} />}
        {activeTab === 'sales' && <SalesView sales={sales} setSales={setSales} leads={leads} setLeads={setLeads} agents={agents} setAgents={setAgents} theme={theme} />}
        {activeTab === 'expenses' && <ExpensesView expenses={expenses} setExpenses={setExpenses} agents={agents} theme={theme} />}
        {activeTab === 'tasks' && <TasksView tasks={tasks} setTasks={setTasks} teamMembers={teamMembers} theme={theme} />}
        {activeTab === 'team' && <TeamView tasks={tasks} teamMembers={teamMembers} setTeamMembers={setTeamMembers} theme={theme} />}
        {activeTab === 'content' && <ContentView content={content} setContent={setContent} theme={theme} />}
        {activeTab === 'versions' && <VersionsView versions={versions} setVersions={setVersions} theme={theme} />}
      </main>
    </div>
  );
};

export default App;
