
import React, { useState } from 'react';
import { Receipt, Plus, Search, Trash2, Calendar, Edit3, X, BarChart3 } from 'lucide-react';
import { Expense, Agent } from '../types';

interface ExpensesViewProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  agents: Agent[];
  theme: 'dark' | 'light';
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, setExpenses, agents, theme }) => {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Expense>>({
    type: 'other',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setExpenses(expenses.map(ex => ex.id === editId ? { ...ex, ...formData as Expense } : ex));
      setEditId(null);
    } else {
      const newExpense: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        type: formData.type as any,
        amount: formData.amount || 0,
        date: formData.date || '',
        description: formData.description || '',
        createdAt: new Date().toISOString()
      };
      setExpenses([newExpense, ...expenses]);
    }
    setShowModal(false);
    setFormData({ type: 'other', amount: 0, date: new Date().toISOString().split('T')[0], description: '' });
  };

  const deleteExpense = (id: string) => {
    if (confirm('Permanently delete this treasury entry?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const openEdit = (expense: Expense) => {
    setEditId(expense.id);
    setFormData({ ...expense });
    setShowModal(true);
  };

  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const labelColor = theme === 'dark' ? 'text-slate-500' : 'text-gray-400';
  const inputBg = theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className={`text-4xl font-black ${textColor} uppercase tracking-tight`}>Treasury Audit</h2>
          <p className={`${labelColor} text-sm font-bold uppercase tracking-wider mt-1`}>Financial Burn Ledger & Accountability</p>
        </div>
        <button 
          onClick={() => { setEditId(null); setShowModal(true); }}
          className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-5 rounded-2xl font-black transition-all shadow-xl shadow-red-900/30 uppercase text-xs tracking-widest italic"
        >
          <Plus className="w-5 h-5" />
          Log Operational Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className={`${cardBg} border-2 border-slate-800/10 p-10 rounded-[2.5rem] shadow-xl`}>
            <p className={`text-[10px] font-black ${labelColor} uppercase tracking-[0.3em] mb-2`}>Total Portfolio Burn</p>
            <p className="text-4xl font-black text-red-500 tabular-nums tracking-tighter">৳{totalExpenses.toLocaleString()}</p>
         </div>
         <div className={`${cardBg} border-2 border-slate-800/10 p-10 rounded-[2.5rem] shadow-xl`}>
            <p className={`text-[10px] font-black ${labelColor} uppercase tracking-[0.3em] mb-2`}>Marketing Outreach</p>
            <p className={`text-4xl font-black ${textColor} tabular-nums tracking-tighter`}>৳{expenses.filter(e => ['marketing', 'adcost'].includes(e.type)).reduce((acc, e) => acc + e.amount, 0).toLocaleString()}</p>
         </div>
         <div className={`${cardBg} border-2 border-slate-800/10 p-10 rounded-[2.5rem] shadow-xl`}>
            <p className={`text-[10px] font-black ${labelColor} uppercase tracking-[0.3em] mb-2`}>Direct Operational Cost</p>
            <p className={`text-4xl font-black ${textColor} tabular-nums tracking-tighter`}>৳{expenses.filter(e => !['marketing', 'adcost'].includes(e.type)).reduce((acc, e) => acc + e.amount, 0).toLocaleString()}</p>
         </div>
      </div>

      <div className={`${cardBg} border-2 border-slate-800/10 rounded-[2.5rem] shadow-2xl overflow-hidden`}>
        <div className={`p-8 border-b ${theme === 'dark' ? 'border-slate-800/50' : 'border-gray-100'} flex items-center justify-between`}>
           <h3 className={`text-xl font-black ${textColor} flex items-center gap-3 uppercase tracking-tight`}>
             <BarChart3 className="w-6 h-6 text-red-600" />
             Detailed Ledger History
           </h3>
           <div className="px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20 text-[10px] font-black text-red-600 uppercase">Live Registry</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={theme === 'dark' ? 'bg-slate-950/50' : 'bg-gray-50'}>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Justification</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount (৳)</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Manage</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {expenses.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-24 text-center opacity-30 italic font-black uppercase text-xs">Registry Currently Empty</td></tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-red-500/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-2 text-xs font-bold ${textColor}`}>
                        <Calendar className={`w-4 h-4 text-red-500 opacity-50`} />
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border tracking-widest ${
                         expense.type === 'adcost' ? 'text-red-500 border-red-500/20 bg-red-500/5' :
                         expense.type === 'salary' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' :
                         `${textColor} border-slate-700 bg-slate-800/10`
                       }`}>
                         {expense.type}
                       </span>
                    </td>
                    <td className="px-8 py-6 truncate max-w-sm">
                      <p className={`text-sm font-semibold ${textColor}`}>{expense.description || 'General Provision'}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className={`text-lg font-black text-red-600 tabular-nums tracking-tighter`}>৳{expense.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => openEdit(expense)} className="p-2 text-slate-500 hover:text-blue-500 transition-colors"><Edit3 className="w-5 h-5" /></button>
                          <button onClick={() => deleteExpense(expense.id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
          <div className={`${cardBg} border-2 border-slate-800 rounded-[3rem] p-12 w-full max-w-md shadow-2xl animate-in zoom-in-95`}>
            <div className="flex justify-between items-center mb-10">
               <h3 className={`text-2xl font-black ${textColor} uppercase tracking-tight`}>{editId ? 'Edit Financial Record' : 'Record Direct Burn'}</h3>
               <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-red-500"><X className="w-7 h-7" /></button>
            </div>
            <form onSubmit={addExpense} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Account Category</label>
                <select 
                  className={`w-full ${inputBg} border-none rounded-2xl px-6 py-5 ${textColor} outline-none font-bold cursor-pointer`}
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="adcost">📢 Marketing Ad Burn</option>
                  <option value="salary">💼 Payroll / Salary</option>
                  <option value="rent">🏢 Office Lease/Rent</option>
                  <option value="utilities">⚡ Infrastructure / Utilities</option>
                  <option value="marketing">📱 Content Marketing</option>
                  <option value="other">📝 Other Operational</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Amount (৳)</label>
                <input 
                  type="number" 
                  className={`w-full ${inputBg} border-none rounded-2xl px-6 py-5 ${textColor} outline-none font-black text-3xl tabular-nums`}
                  required
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Dhaka Local Date</label>
                <input 
                  type="date" 
                  className={`w-full ${inputBg} border-none rounded-2xl px-6 py-5 ${textColor} outline-none font-bold`}
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Detailed Justification</label>
                <textarea 
                  className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none text-sm font-semibold`}
                  rows={3}
                  placeholder="Operational context for this burn..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full py-6 bg-red-600 text-white font-black rounded-3xl shadow-xl shadow-red-900/40 uppercase tracking-[0.2em] italic mt-4 transition-transform active:scale-95">
                 Commence Transaction Update
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;
