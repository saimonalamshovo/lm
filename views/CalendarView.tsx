
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Zap, Target, Receipt, X, LayoutGrid } from 'lucide-react';
import { Task, Sale, Expense, TeamMember, Agent, BatchProject } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  sales: Sale[];
  expenses: Expense[];
  theme: 'dark' | 'light';
  teamMembers: TeamMember[];
  agents: Agent[];
  filteredBatches: BatchProject[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, sales, expenses, theme, teamMembers, agents, filteredBatches }) => {
  const [selectedDateDetail, setSelectedDateDetail] = useState<string | null>(null);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const cellBg = theme === 'dark' ? 'bg-slate-950/40 border-slate-800 hover:border-slate-600' : 'bg-white border-gray-100 hover:border-gray-200 shadow-inner';

  const dayDetail = selectedDateDetail ? {
    date: selectedDateDetail,
    tasks: tasks.filter(t => t.dueDate === selectedDateDetail),
    sales: sales.filter(s => s.createdAt.startsWith(selectedDateDetail)),
    expenses: expenses.filter(e => e.date === selectedDateDetail),
    batches: filteredBatches.filter(b => b.createdAt.startsWith(selectedDateDetail))
  } : null;

  return (
    <div className="space-y-8 h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className={`text-3xl font-black ${textColor} italic uppercase`}>Grid Intelligence</h2>
          <p className={`text-xs text-slate-500 font-bold uppercase tracking-widest`}>{now.toLocaleString('default', { month: 'long', year: 'numeric' })} Operations</p>
        </div>
      </div>

      <div className={`flex-1 ${cardBg} border rounded-[2.5rem] p-10 overflow-hidden flex flex-col shadow-2xl`}>
         <div className="grid grid-cols-7 gap-6 mb-6">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-600 tracking-[0.3em]">{d}</div>
            ))}
         </div>

         <div className="flex-1 grid grid-cols-7 gap-4 auto-rows-fr">
            {blanks.map(b => <div key={`b-${b}`} className="rounded-3xl border border-slate-800/10 opacity-5" />)}
            {days.map(day => {
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayTasks = tasks.filter(t => t.dueDate === dateStr);
              const daySales = sales.filter(s => s.createdAt.startsWith(dateStr));
              const dayBatchRev = filteredBatches.filter(b => b.createdAt.startsWith(dateStr))
                .reduce((acc, b) => acc + b.students.reduce((sA, s) => sA + (Number(s.paid) || 0), 0), 0);
              const isToday = day === now.getDate();

              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDateDetail(dateStr)}
                  className={`relative p-4 rounded-3xl border transition-all cursor-pointer group ${isToday ? 'bg-red-900/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : cellBg}`}
                >
                  <span className={`text-sm font-black ${isToday ? 'text-red-500' : 'text-slate-500'}`}>{day}</span>
                  
                  <div className="mt-3 space-y-1.5">
                     {dayTasks.slice(0, 1).map(t => (
                       <div key={t.id} className="text-[8px] font-black text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded truncate uppercase">
                          <Target className="w-2 h-2 text-red-500 inline mr-1" /> {t.title}
                       </div>
                     ))}
                     {(daySales.length > 0 || dayBatchRev > 0) && (
                       <div className="text-[8px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded truncate uppercase">
                          <Zap className="w-2 h-2 inline mr-1" /> ৳{(daySales.reduce((a, s) => a + s.amount, 0) + dayBatchRev).toLocaleString()}
                       </div>
                     )}
                  </div>
                </div>
              );
            })}
         </div>
      </div>

      {dayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
           <div className={`${cardBg} border rounded-[3rem] p-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl custom-scrollbar animate-in zoom-in-95`}>
              <div className="flex justify-between items-center mb-8 border-b border-slate-800/10 pb-6">
                <div>
                  <h3 className={`text-2xl font-black ${textColor} italic uppercase tracking-tighter`}>Daily Ops Intelligence</h3>
                  <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em]">{new Date(dayDetail.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                </div>
                <button onClick={() => setSelectedDateDetail(null)} className="p-3 hover:bg-slate-800 rounded-full transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-10">
                {dayDetail.tasks.length > 0 && (
                  <section>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Target className="w-3 h-3" /> Assignments</h4>
                    <div className="space-y-2">
                       {dayDetail.tasks.map(t => (
                         <div key={t.id} className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                            <p className={`text-sm font-black italic ${textColor}`}>{t.title}</p>
                            <span className="text-[10px] font-black uppercase text-slate-500">{teamMembers.find(m => m.id === t.assignee)?.name || 'Unassigned'}</span>
                         </div>
                       ))}
                    </div>
                  </section>
                )}

                {(dayDetail.sales.length > 0 || dayDetail.batches.length > 0) && (
                  <section>
                    <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Zap className="w-3 h-3" /> Revenue Flows</h4>
                    <div className="space-y-2">
                       {dayDetail.sales.map(s => (
                         <div key={s.id} className="bg-green-500/5 p-4 rounded-2xl border border-green-500/20 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                               <span className="text-xl">{agents.find(a => a.id === s.agentId)?.avatar || '🌐'}</span>
                               <p className={`text-sm font-black italic ${textColor}`}>{agents.find(a => a.id === s.agentId)?.name || 'Direct Order'}</p>
                            </div>
                            <p className="text-sm font-black text-green-500">৳{s.amount.toLocaleString()}</p>
                         </div>
                       ))}
                       {dayDetail.batches.map(b => (
                         <div key={b.id} className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/20 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                               <LayoutGrid className="w-4 h-4 text-purple-500" />
                               <p className={`text-sm font-black italic ${textColor}`}>{b.courseName}</p>
                            </div>
                            <p className="text-sm font-black text-purple-400">৳{b.students.reduce((a, s) => a + (Number(s.paid) || 0), 0).toLocaleString()}</p>
                         </div>
                       ))}
                    </div>
                  </section>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
