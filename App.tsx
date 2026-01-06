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
  History,
  Download,
} from 'lucide-react';

import {
  Task,
  Lead,
  Sale,
  Expense,
  ContentItem,
  Agent,
  TeamMember,
  Version,
} from './types';

import {
  INITIAL_TEAM,
  INITIAL_AGENTS,
  DEFAULT_MONTHLY_TARGET,
} from './constants';

import DashboardView from './views/DashboardView';
import TasksView from './views/TasksView';
import TeamView from './views/TeamView';
import SalesView from './views/SalesView';
import ExpensesView from './views/ExpensesView';
import ContentView from './views/ContentView';
import CalendarView from './views/CalendarView';
import VersionsView from './views/VersionsView';

const APP_ID = 'main';

const App: React.FC = () => {
  /* ===============================
     STATE
  =============================== */
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [monthlyTarget, setMonthlyTarget] = useState(DEFAULT_MONTHLY_TARGET);

  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM);
  const [versions, setVersions] = useState<Version[]>([]);

  const [isHydrated, setIsHydrated] = useState(false);

  /* ===============================
     INITIAL LOAD (DB → UI)
  =============================== */
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('app_data')
        .select('data')
        .eq('id', APP_ID)
        .single();

      if (error || !data?.data) {
        setIsHydrated(true);
        return;
      }

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

      setIsHydrated(true);
    };

    load();
  }, []);

  /* ===============================
     SAVE TO DB (UPSERT)
  =============================== */
  const saveToDB = async () => {
    if (!isHydrated) return;

    const payload = {
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
    };

    const { error } = await supabase
      .from('app_data')
      .upsert(
        {
          id: APP_ID,
          data: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('❌ SAVE ERROR:', error);
    }
  };

  /* ===============================
     AUTO SAVE (DEBOUNCED)
  =============================== */
  useEffect(() => {
    if (!isHydrated) return;

    const t = setTimeout(() => {
      saveToDB();
    }, 500);

    return () => clearTimeout(t);
  }, [
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
    isHydrated,
  ]);

  /* ===============================
     REALTIME SYNC (DB → ALL CLIENTS)
  =============================== */
  useEffect(() => {
    const channel = supabase
      .channel('app_data_sync')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_data',
          filter: `id=eq.${APP_ID}`,
        },
        payload => {
          const d = payload.new?.data;
          if (!d) return;

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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ===============================
     STATS
  =============================== */
  const stats = useMemo(() => {
    const revenue = sales.reduce((a, b) => a + (b.amount || 0), 0);
    const adCost = sales.reduce((a, b) => a + (b.adCost || 0), 0);
    const profit = revenue - adCost;
    const roi = adCost > 0 ? revenue / adCost : 0;

    return { revenue, adCost, profit, roi };
  }, [sales]);

  /* ===============================
     EXPORT
  =============================== */
  const exportData = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(sales),
      'Sales'
    );
    XLSX.writeFile(wb, 'Learningmate_Data.xlsx');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'content', label: 'Content', icon: Film },
    { id: 'versions', label: 'History', icon: History },
  ];

  /* ===============================
     UI
  =============================== */
  return (
    <div className={`flex h-full ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-black'}`}>
      <aside className="w-64 bg-slate-900 p-4 hidden lg:block">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded ${
              activeTab === item.id ? 'bg-red-600/20 text-red-500' : 'hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}

        <button
          onClick={exportData}
          className="mt-6 w-full flex items-center gap-2 p-3 bg-green-600 rounded"
        >
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            monthlyTarget={monthlyTarget}
            onTargetChange={setMonthlyTarget}
            theme={theme}
            sales={sales}
            setSales={setSales}
          />
        )}

        {activeTab === 'sales' && (
          <SalesView
            sales={sales}
            setSales={setSales}
            leads={leads}
            setLeads={setLeads}
            agents={agents}
            setAgents={setAgents}
            theme={theme}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            setExpenses={setExpenses}
            agents={agents}
            theme={theme}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            sales={sales}
            expenses={expenses}
            teamMembers={teamMembers}
            agents={agents}
            theme={theme}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            setTasks={setTasks}
            teamMembers={teamMembers}
            theme={theme}
          />
        )}

        {activeTab === 'team' && (
          <TeamView
            tasks={tasks}
            teamMembers={teamMembers}
            setTeamMembers={setTeamMembers}
            theme={theme}
          />
        )}

        {activeTab === 'content' && (
          <ContentView
            content={content}
            setContent={setContent}
            theme={theme}
          />
        )}

        {activeTab === 'versions' && (
          <VersionsView
            versions={versions}
            setVersions={setVersions}
            theme={theme}
          />
        )}
      </main>
    </div>
  );
};

export default App;
