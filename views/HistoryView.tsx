
import React from 'react';
import { History, Search, ArrowRight, User, Settings, Database } from 'lucide-react';

const HistoryView: React.FC = () => {
  // Mock history entries
  const history = [
    { id: 1, action: 'Sale Recorded', target: '৳15,000', user: 'Admin', time: '10 mins ago', type: 'sale' },
    { id: 2, action: 'Task Completed', target: 'Edit promo video', user: 'Ridu', time: '2 hours ago', type: 'task' },
    { id: 3, action: 'New Lead Added', target: 'Sajib Rahman', user: 'Admin', time: '5 hours ago', type: 'lead' },
    { id: 4, action: 'Expense Logged', target: 'Office Utilities', user: 'Admin', time: 'Yesterday', type: 'expense' },
    { id: 5, action: 'Project Moved', target: 'Course Intro 101', user: 'Sakib', time: 'Yesterday', type: 'content' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight italic">System Audit</h2>
          <p className="text-slate-400 text-sm font-medium">Complete immutable activity log of all organizational shifts.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Filter audit trail..." className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-red-500 w-64" />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="space-y-0">
          {history.map((entry, i) => (
            <div key={entry.id} className="relative pl-10 pb-10 last:pb-0">
              {i !== history.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-[1px] bg-slate-800" />
              )}
              <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center z-10">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              </div>
              
              <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/40 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter bg-red-500/10 px-1.5 py-0.5 rounded">{entry.type}</span>
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{entry.time}</span>
                    </div>
                    <h4 className="text-lg font-black text-white italic tracking-tight flex items-center gap-3">
                      {entry.action} 
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" /> 
                      <span className="text-slate-400 text-sm font-medium">{entry.target}</span>
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-bold text-slate-300 italic">{entry.user}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
               <Database className="w-6 h-6 text-blue-500" />
               <h3 className="text-lg font-black text-white italic">Database Health</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">System sync is optimal. 1,492 entries synchronized across distributed nodes. Integrity checks passed at {new Date().toLocaleTimeString()}.</p>
         </div>
         <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
               <Settings className="w-6 h-6 text-orange-500" />
               <h3 className="text-lg font-black text-white italic">Configuration</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Monthly parameters: Locked. Revision 14.0 active. All operational modules running in production state with zero fatal interruptions.</p>
         </div>
      </div>
    </div>
  );
};

export default HistoryView;
