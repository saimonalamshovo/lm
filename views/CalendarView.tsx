
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Zap, Target, Receipt, X, User } from 'lucide-react';
import { Task, Sale, Expense, TeamMember, Agent } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  sales: Sale[];
  expenses: Expense[];
  theme: 'dark' | 'light';
  teamMembers: TeamMember[];
  agents: Agent[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, sales, expenses, theme, teamMembers, agents }) => {
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
  const labelColor = theme === 'dark' ? 'text-slate-500' : 'text-gray-400';
  const cellBg = theme === 'dark' ? 'bg-slate-950/40 border-slate-800 hover:border-slate-600' : 'bg-white border-gray-100 hover:border-gray-200 shadow-inner';

  const dayDetail = selectedDateDetail ? {
    date: selectedDateDetail,
    tasks: tasks.filter(t => t.dueDate === selectedDateDetail),
    sales: sales.filter(s => s.createdAt.startsWith(selectedDateDetail)),
    expenses: expenses.filter(e => e.date === selectedDateDetail)
  } : null;

  return (
    <div className="space-y-8 h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className={`text-3xl font-black ${textColor} italic uppercase`}>OPERATIONAL GRID</h2>
          <p className={`text-xs ${labelColor} font-bold uppercase tracking-widest`}>{now.toLocaleString('default', { month: 'long', year: 'numeric' })} Cycle</p>
        </div>
      </div>

      <div className={`flex-1 ${cardBg} border rounded-[2.5rem] p-10 overflow-hidden flex flex-col shadow-2xl`}>
         <div className="grid grid-cols-7 gap-6 mb-6">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
              <div key={d} className={`text-center text-[10px] font-black ${theme === 'dark' ? 'text-slate-600' : 'text-gray-400'} tracking-[0.3em]`}>{d}</div>
            ))}
         </div>

         <div className="flex-1 grid grid-cols-7 gap-4 auto-rows-fr">
            {blanks.map(b => <div key={`b-${b}`} className={`${theme === 'dark' ? 'bg-slate-950/20 border-slate-800/10' : 'bg-gray-50 border-gray-100'} rounded-3xl border opacity-10`} />)}
            {days.map(day => {
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayTasks = tasks.filter(t => t.dueDate === dateStr);
              const daySales = sales.filter(s => s.createdAt.startsWith(dateStr));
              const isToday = day === now.getDate();

              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDateDetail(dateStr)}
                  className={`relative p-4 rounded-3xl border transition-all cursor-pointer group ${isToday ? 'bg-red-900/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : cellBg}`}
                >
                  <span className={`text-sm font-black ${isToday ? 'text-red-500' : labelColor}`}>{day}</span>
                  
                  <div className="mt-3 space-y-1.5">
                     {dayTasks.slice(0, 2).map(t => (
                       <div key={t.id} className={`text-[8px] font-black ${theme === 'dark' ? 'text-slate-400 bg-slate-800/50' : 'text-gray-600 bg-white shadow-sm'} px-2 py-0.5 rounded-lg truncate flex items-center gap-1 uppercase`}>
                          <Target className="w-2 h-2 text-red-500" /> {t.title}
                       </div>
                     ))}
                     {daySales.length > 0 && (
                       <div className="text-[8px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-lg truncate flex items-center gap-1 uppercase">
                          <Zap className="w-2 h-2" /> ৳{daySales.reduce((acc, s) => acc + s.amount, 0).toLocaleString()}
                       </div>
                     )}
                     {dayTasks.length > 2 && <div className="text-[8px] font-black text-slate-600 pl-2">+{dayTasks.length - 2} MORE</div>}
                  </div>
                </div>
              );
            })}
         </div>
      </div>

      {dayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in zoom-in-95 duration-300">
           <div className={`${cardBg} border rounded-[3rem] p-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl custom-scrollbar`}>
              <div className="flex justify-between items-center mb-8 border-b border-slate-800/10 pb-6">
                <div>
                  <h3 className={`text-2xl font-black ${textColor} italic uppercase tracking-tighter`}>DAILY OPS SUMMARY</h3>
                  <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em]">{new Date(dayDetail.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                </div>
                <button onClick={() => setSelectedDateDetail(null)} className="p-3 hover:bg-slate-800 rounded-full transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-10">
                <section>
                   <h4 className={`text-[10px] font-black ${labelColor} uppercase tracking-widest mb-4 flex items-center gap-2`}><Target className="w-3 h-3" /> Assignments</h4>
                   {dayDetail.tasks.length === 0 ? <p className="text-xs italic opacity-20 uppercase font-black">Zero Missions Assigned</p> : (
                     <div className="space-y-2">
                       {dayDetail.tasks.map(t => (
                         <div key={t.id} className={`${theme === 'dark' ? 'bg-slate-800/30' : 'bg-gray-50'} p-4 rounded-2xl border ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'} flex justify-between items-center`}>
                            <p className={`text-sm font-black italic ${t.status === 'completed' ? 'text-green-500' : textColor}`}>{t.title}</p>
                            <span className="text-[10px] font-black uppercase text-slate-500">{teamMembers.find(m => m.id === t.assignee)?.name || 'Unknown'}</span>
                         </div>
                       ))}
                     </div>
                   )}
                </section>

                <section>
                   <h4 className={`text-[10px] font-black ${labelColor} uppercase tracking-widest mb-4 flex items-center gap-2`}><Zap className="w-3 h-3 text-green-500" /> Revenue Stream</h4>
                   {dayDetail.sales.length === 0 ? <p className="text-xs italic opacity-20 uppercase font-black">Zero Commercial Activity</p> : (
                     <div className="space-y-2">
                       {dayDetail.sales.map(s => (
                         <div key={s.id} className={`${theme === 'dark' ? 'bg-slate-800/30' : 'bg-gray-50'} p-4 rounded-2xl border ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'} flex justify-between items-center`}>
                            <div className="flex items-center gap-3">
                               <span className="text-xl">{agents.find(a => a.id === s.agentId)?.avatar || '👤'}</span>
                               <p className={`text-sm font-black italic ${textColor}`}>{agents.find(a => a.id === s.agentId)?.name || 'Agent'}</p>
                            </div>
                            <p className="text-sm font-black text-green-500">৳{s.amount.toLocaleString()}</p>
                         </div>
                       ))}
                     </div>
                   )}
                </section>

                <section>
                   <h4 className={`text-[10px] font-black ${labelColor} uppercase tracking-widest mb-4 flex items-center gap-2`}><Receipt className="w-3 h-3 text-red-500" /> Treasury Outflow</h4>
                   {dayDetail.expenses.length === 0 ? <p className="text-xs italic opacity-20 uppercase font-black">Zero Financial Burn</p> : (
                     <div className="space-y-2">
                       {dayDetail.expenses.map(e => (
                         <div key={e.id} className={`${theme === 'dark' ? 'bg-slate-800/30' : 'bg-gray-50'} p-4 rounded-2xl border ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'} flex justify-between items-center`}>
                            <div>
                               <p className={`text-sm font-black italic ${textColor} uppercase`}>{e.type}</p>
                               <p className="text-[9px] text-slate-500 font-bold">{e.description}</p>
                            </div>
                            <p className="text-sm font-black text-red-500">৳{e.amount.toLocaleString()}</p>
                         </div>
                       ))}
                     </div>
                   )}
                </section>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
