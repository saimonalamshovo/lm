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
  History,
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

  /* ===============================
     LOAD DATA (ONCE)
  =============================== */
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

  /* ===============================
     AUTO SAVE (DEBOUNCED)
  =============================== */
  useEffect(() => {
    const t = setTimeout(() => {
      supabase.from('app_data').upsert({
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
    }, 300);

    return () => clearTimeout(t);
  }, [sales, expenses, tasks, leads, content, agents, teamMembers, versions, monthlyTarget, theme]);

  /* ===============================
     REAL-TIME SYNC
  =============================== */
  useEffect(() => {
    const channel = supabase
      .channel('app_data_live')
      .on(
        'postgres_ch_
